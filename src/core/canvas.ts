import * as THREE from 'three';
import { CameraHelper, Clock, EventDispatcher, MathUtils, OrthographicCamera, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { ColorDarkGray } from './colors';
import { Slide } from './slide';

export type CanvasEvent = 'started' | 'ended';
export type CanvasEventMap = {
  started: { type: 'started'; soure: EventDispatcher; canvas: Canvas };
  ended: { type: 'ended'; soure: EventDispatcher; canvas: Canvas };
};

const staticSize = { width: window.innerWidth, height: window.innerHeight };

export class Canvas extends EventDispatcher<CanvasEventMap> {
  public readonly context: HTMLCanvasElement;
  public readonly renderer: WebGLRenderer;
  public readonly root: Scene;

  // protected readonly renderer: WebGPURenderer;
  protected readonly clock: Clock;
  protected readonly uuid = MathUtils.generateUUID();
  protected readonly cameraOrtho: OrthographicCamera;

  public readonly orbit?: OrbitControls;
  protected controls?: TransformControls;

  protected slides: Slide[] = [];
  protected currentSlide: Slide;

  // helpers
  protected readonly cameraHelper: CameraHelper;

  /** event listener */
  private readonly onDblClickBinder: (e: MouseEvent) => void;
  private readonly onMouseDownBinder: (e: MouseEvent) => void;
  private readonly onMouseMoveBinder: (e: MouseEvent) => void;
  private readonly onMouseUpBinder: (e: MouseEvent) => void;
  private readonly onWheelBinder: (e: WheelEvent) => void;
  private delayPostMouseUp: any;

  protected working = false;

  constructor(context?: HTMLCanvasElement) {
    super();

    // clock
    this.clock = new Clock();

    // renderer
    this.renderer = new WebGLRenderer({
      canvas: context,
      antialias: true,
    });

    this.context = this.renderer.domElement;

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.autoClear = true;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.setClearColor(ColorDarkGray);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(staticSize.width, staticSize.height);

    this.root = new Scene;

    // blank slide
    this.currentSlide = new Slide;
    this.slides = [this.currentSlide];
    this.root.add(this.currentSlide);

    // camera
    this.cameraOrtho = new OrthographicCamera(- 1, 1, 1, - 1, 0.0001, 1000);
    this.cameraOrtho.name = 'Orthographic';
    this.cameraOrtho.position.set(0, 0, 100);

    // helper
    this.cameraHelper = new CameraHelper(this.cameraOrtho);
    this.cameraHelper.visible = false;
    this.root.add(this.cameraHelper);

    /* * /
    // controls
    const orbit = new OrbitControls(this.cameraOrtho, this.renderer.domElement);
    orbit.minDistance = 0.1;
    orbit.maxDistance = 100;
    orbit.touches.ONE = THREE.TOUCH.PAN;
    orbit.mouseButtons.LEFT = THREE.MOUSE.PAN;
    orbit.touches.TWO = THREE.TOUCH.ROTATE;
    orbit.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    orbit.update();
    this.orbit = orbit;

    const control = new TransformControls(this.cameraOrtho, this.renderer.domElement);
    control.addEventListener('dragging-changed', function (event) {
      orbit.enabled = !event.value;
    });
    control.traverse(e => e.castShadow = false);
    this.controls = control;
    this.root.add(this.controls);
    /* */

    /** */
    this.onDblClickBinder = this.onDblClick.bind(this);
    this.onMouseDownBinder = this.onMouseDown.bind(this);
    this.onMouseUpBinder = this.onMouseUp.bind(this);
    this.onMouseMoveBinder = this.onMouseMove.bind(this);
    this.onWheelBinder = this.onWheel.bind(this);

    this.context.addEventListener('dblclick', this.onDblClickBinder);
    this.context.addEventListener('pointerdown', this.onMouseDownBinder);
    this.context.addEventListener('pointerup', this.onMouseUpBinder);
    this.context.addEventListener('pointermove', this.onMouseMoveBinder);
    this.context.addEventListener('wheel', this.onWheelBinder);

    /** */
  }
  resize(width: number, height: number) {
    if (!this.context) {
      return;
    }

    staticSize.width = width;
    staticSize.height = height;

    this.renderer.setSize(width, height);

    const aspect = width / height;
    const camHeight = height / window.innerHeight;

    this.cameraOrtho.top = camHeight;
    this.cameraOrtho.bottom = -camHeight;
    this.cameraOrtho.right = this.cameraOrtho.top * aspect;
    this.cameraOrtho.left = -this.cameraOrtho.right;
    this.cameraOrtho.updateProjectionMatrix();

    if (this.currentSlide) {
      this.currentSlide.resize(this.cameraOrtho.right - this.cameraOrtho.left, this.cameraOrtho.top - this.cameraOrtho.bottom);
    }
  }

  resetSlides(slides?: Slide[]) {
    if (!slides?.length) {
      return;
    }
    if (this.slides === slides) {
      return;
    }
    this.cameraOrtho.position.set(0, 0, 100);
    this.currentSlide.removeFromParent();
    for (const slide of this.slides) {
      slide.dispose();
    }
    if (slides) {
      this.slides = slides;
    } else {
      this.slides = [new Slide];
    }
    this.currentSlide = this.slides[0];
    this.currentSlide.resize(this.cameraOrtho.right - this.cameraOrtho.left, this.cameraOrtho.top - this.cameraOrtho.bottom);
    this.root.add(this.currentSlide);
  }

  gotoSlide(index: number) {
    const slide = this.slides[index];
    if (!slide) {
      throw 'out of range';
    }
    if (slide === this.currentSlide) {
      return;
    }
    this.currentSlide.removeFromParent();
    this.currentSlide = slide;
    this.currentSlide.resize(this.cameraOrtho.right - this.cameraOrtho.left, this.cameraOrtho.top - this.cameraOrtho.bottom);
    this.root.add(this.currentSlide);
  }

  stop() {
    if (this.working) {
      this.working = false;
      this.clock.stop();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private render(delta: number, now: number) {
    // nodeFrame.update();
    if (this.currentSlide) {
      this.currentSlide.update(this.cameraOrtho, delta, now);
    }
    this.renderer.render(this.root, this.cameraOrtho);
  }

  async run(): Promise<void> {
    if (this.working) {
      throw new Error('already working');
    }
    console.log(`world start`);

    this.dispatchEvent({ type: 'started', soure: this, canvas: this });

    this.working = true;
    this.clock.start();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const step = (time: DOMHighResTimeStamp) => {
      if (!this.working) {
        this.renderer.setAnimationLoop(null);
        return;
      }
      const delta = this.clock.getDelta();
      const now = this.clock.oldTime;
      const t0 = Date.now();
      this.render(delta, now);
      const t2 = Date.now();
      if ((t2 - t0) >= 100) {
        console.warn(`render take ${t2 - t0} ms`);
      }
      // stats.update();
    };
    this.renderer.setAnimationLoop(step);
  }

  dispose(): void {
    this.currentSlide.removeFromParent();
    for (const slide of this.slides) {
      slide.dispose();
    }
    this.clock.stop();
    this.renderer.dispose();
    this.context.removeEventListener('dblclick', this.onDblClickBinder);
    this.context.removeEventListener('pointerdown', this.onMouseDownBinder);
    this.context.removeEventListener('pointerup', this.onMouseUpBinder);
    this.context.removeEventListener('pointermove', this.onMouseMoveBinder);
    this.context.removeEventListener('wheel', this.onWheelBinder);
  }

  private onDblClick(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.delayPostMouseUp) {
      clearTimeout(this.delayPostMouseUp);
      this.delayPostMouseUp = undefined;
    }

    const { x, y } = this.coodMapping(event.clientX, event.clientY);
    this.currentSlide.onDblClick(x, y);
  }

  private onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const { x, y } = this.coodMapping(event.clientX, event.clientY);
    this.currentSlide.onMouseDown(x, y);
  }

  private onMouseMove(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const { x, y } = this.coodMapping(event.clientX, event.clientY);
    this.currentSlide.onMouseMove(x, y);
  }

  private onMouseUp(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.delayPostMouseUp) {
      return;
    }

    // 判断是不是双击，如果是双击，则取消推送MouseUp事件
    this.delayPostMouseUp = setTimeout(() => {
      this.delayPostMouseUp = undefined;
      const { x, y } = this.coodMapping(event.clientX, event.clientY);
      this.currentSlide.onMouseUp(x, y);
    }, 300);
  }

  private onWheel(event: WheelEvent) {
    const scale = 0.01;
    const deltaX = event.deltaX * scale;
    const deltaY = event.deltaY * scale;
    const handled = this.currentSlide.handleWheel(deltaX, deltaY);
    if (handled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      // this.cameraOrtho.position.setX(this.view.offsetX);
      // this.cameraOrtho.position.setY(this.view.offsetY);
    }
  }

  private coodMapping(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.context.getBoundingClientRect();
    const width = this.cameraOrtho.right - this.cameraOrtho.left;
    const height = this.cameraOrtho.top - this.cameraOrtho.bottom;
    const x = this.cameraOrtho.left + width * ((clientX - rect.x) / rect.width);
    const y = this.cameraOrtho.bottom + height * (1 - (clientY - rect.y) / rect.height);
    return { x, y };
  }
}