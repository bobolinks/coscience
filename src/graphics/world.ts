import * as THREE from 'three/webgpu';
import { MathUtils, Clock, Scene as Scene3D, Mesh, AudioListener, Raycaster, Object3D, Vector2, Vector3, type Intersection } from 'three/webgpu';
import { WebGPURenderer } from 'three/webgpu';
import { EventEmitter } from '../utils/events';
import { colorWith } from './utils';
import { defaultAnimationGroup, Element } from './elements/element';
import * as tsl from './three/nodes/tsl';
import { Sound } from './elements/sound';
import type { Scene } from './scene';
import { PerspectiveCamera, } from './elements/camera';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import type { RunContext } from './runtime';
import { Panel } from './panel';
import sys from '@/utils/sys';

export type WorldEvent = 'worldStarted' | 'worldEnded';
export type WorldEventMap = {
  worldStarted: { soure: EventEmitter; world: World };
  worldEnded: { soure: EventEmitter; world: World };
};

export const AsyncFunction: any = (globalThis as any).AsyncFunction || (async (x: any) => x).constructor;

const staticSize = { width: window.innerWidth, height: window.innerHeight };

type Props = {
  subtitle: string;
};

export class World extends EventEmitter<WorldEventMap> {
  public readonly listener = new AudioListener();

  protected readonly renderer: WebGPURenderer;
  protected readonly clock: Clock;
  protected readonly uuid = MathUtils.generateUUID();
  protected readonly camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.00001, 10000);
  protected readonly speaker: Sound;

  public readonly root: Scene3D;
  public readonly panel: Panel;

  protected currentScene?: Scene;

  protected readonly context: RunContext;

  protected working = false;

  /** unit selected */
  protected selected?: Element<Object3D>;
  protected selectedPointer: Vector3 = new Vector3();
  /** for drag */
  protected dragableUnits: Array<Object3D> = [];
  protected raycaster = new Raycaster();

  private readonly onMouseDownBinder: (e: MouseEvent) => void;
  private readonly onMouseUpBinder: (e: MouseEvent) => void;

  private controls: OrbitControls;

  constructor(
    public dom: HTMLCanvasElement,
    public props: Props
  ) {
    super();

    Sound.defaultListener = this.listener;

    // clock
    this.clock = new Clock();

    // renderer
    this.renderer = new WebGPURenderer({
      canvas: dom,
      antialias: true
    });

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.autoClear = true;
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.logarithmicDepthBuffer = true;
    this.renderer.setClearColor(colorWith(0));
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.root = new Scene3D();

    this.panel = new Panel(this.camera, dom);

    this.camera.position.set(0, 0.5, 2);

    const speaker = new Sound({}, this.listener);
    this.speaker = speaker;
    this.root.add(speaker);

    const controls = new OrbitControls(this.camera.native, this.dom);
    controls.minDistance = 0;
    controls.maxDistance = 4;
    this.controls = controls;

    this.context = {
      tsl,
      camera: this.camera,
      subtitle: this.panel.subtitle,
      wait: sys.wait,
      say: (content: string) => {
        this.props.subtitle = content;
        return this.speaker.say(content);
      }
    };

    this.onMouseDownBinder = (e: MouseEvent) => {
      this.onMouseDown(e);
    };
    this.onMouseUpBinder = (e: MouseEvent) => {
      this.onMouseUp(e);
    };
    dom.addEventListener('pointerdown', this.onMouseDownBinder);
    dom.addEventListener('pointerup', this.onMouseUpBinder);

    this.resize(staticSize.width, staticSize.height);
  }
  setScene(scene?: Scene) {
    if (this.currentScene === scene) {
      return;
    }
    if (this.currentScene) {
      this.currentScene.emit('leaved');
      this.currentScene.removeFromParent();
      this.currentScene.dispose();
    }
    this.currentScene = scene;
    if (this.currentScene) {
      this.root.add(this.currentScene.native);
      this.currentScene.resize(staticSize.width, staticSize.height);
      this.currentScene.setupRuntime(this.context);
      this.currentScene.emit('entered');
    }
    this.controls.update();
  }
  resize(width: number, height: number) {
    if (!this.dom) {
      return;
    }

    staticSize.width = width;
    staticSize.height = height;

    this.renderer.setSize(width, height);
    this.renderer.setViewport(0, 0, width, height);

    this.camera.props.aspect = width / height;

    this.panel.resize(width, height);

    if (this.currentScene) {
      this.currentScene.resize(width, height);
    }
  }
  dispose() {
    const fntrv = (child: any) => {
      if (child.dispose) {
        child.dispose();
      } else if (child instanceof Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((e) => e.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
        if (child.geometry) {
          child.geometry.dispose();
        }
      }
    };
    if (this.currentScene) {
      this.currentScene.removeFromParent();
      this.currentScene.traverse(fntrv);
    }
    [this.root, this.panel].forEach((e) => e.traverse(fntrv));
    this.dom.removeEventListener('pointerdown', this.onMouseDownBinder);
    this.dom.removeEventListener('pointerup', this.onMouseUpBinder);
  }
  stop() {
    if (this.working) {
      this.working = false;
      this.clock.stop();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private render(delta: number, now: number) {
    this.renderer.clearDepth();
    const camera = this.camera.native;
    if (this.currentScene) {
      const scene = this.currentScene.native;
      this.currentScene.update(delta, now, this.renderer, scene, camera);
      this.renderer.autoClear = true;
      this.renderer.render(this.root, camera);
      this.renderer.autoClear = false;
    } else {
      this.renderer.autoClear = true;
    }
    const panel = this.panel.native;
    this.panel.update(delta, now, this.renderer, panel, this.panel.camera);
    this.renderer.render(panel, this.panel.camera);
  }

  async run(): Promise<void> {
    if (this.working) {
      throw new Error('already working');
    }
    console.log(`world start`);

    this.emit('worldStarted', { soure: this, world: this });

    this.working = true;
    this.clock.start();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const step = (time: DOMHighResTimeStamp) => {
      if (!this.working) {
        this.renderer.setAnimationLoop(null);
        return;
      }
      defaultAnimationGroup.update(time);
      const delta = this.clock.getDelta();
      const now = this.clock.oldTime;
      const t0 = Date.now();
      this.render(delta, now);
      const t2 = Date.now();
      if (t2 - t0 >= 100) {
        console.warn(`render take ${t2 - t0} ms`);
      }
      // stats.update();
    };
    this.renderer.setAnimationLoop(step);
  }
  async execute(code: string) {
    if (!this.currentScene) {
      return;
    }

    const script = new AsyncFunction(['context', 'THREE'], `with(context) { ${code} \nawait main(); }`);

    return await script.call(this, this.currentScene.runtime, THREE);
  }

  protected unitFromEvent(e: MouseEvent): Element<Object3D> | undefined {
    if (!this.currentScene) {
      return;
    }
    const { left, top, width, height } = this.dom.getBoundingClientRect();
    const pointer = new Vector2((e.clientX - left) / width * 2 - 1, - (e.clientY - top) / height * 2 + 1);
    this.raycaster.setFromCamera(pointer, this.camera.native);
    const intersections: Intersection<Object3D>[] = [];
    this.raycaster.intersectObjects([this.currentScene.native], true, intersections);
    for (const it of intersections) {
      const unit: Element<Object3D> = elFromObject(it.object);
      if (unit && (unit.props.dragable || unit.props.touchable)) {
        return unit;
      }
    }
    return this.currentScene;
  }

  protected onMouseDown(e: MouseEvent) {
    const unit = this.unitFromEvent(e);
    if (unit) {
      this.selected = unit;
      this.selectedPointer.copy(unit.position);
    } else {
      this.selected = undefined;
    }
    if (this.selected?.props.dragable) {
      this.dragableUnits[0] = this.selected.native;
    } else {
      this.dragableUnits.length = 0;
    }
  }
  protected onMouseUp(e: MouseEvent) {
    const { left, top, width, height } = this.dom.getBoundingClientRect();
    const pointer = new Vector2((e.clientX - left) / width * 2 - 1, - (e.clientY - top) / height * 2 + 1);
    const unit = this.unitFromEvent(e);
    if (unit && unit === this.selected && this.selectedPointer.equals(unit.position)) {
      unit.emit('tap', pointer);
    }
  }
}

function elFromObject(object: Object3D) {
  let o: any = object;
  do {
    if (o.userData.owner) {
      return o.userData.owner;
    }
  } while ((o = o.parent));
}
