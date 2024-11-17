import * as THREE from 'three/webgpu';
import { MathUtils, Clock, PerspectiveCamera, Scene as Scene3D, Mesh, PlaneGeometry, Vector3, AudioListener } from 'three/webgpu';
import { WebGPURenderer } from 'three/webgpu';
import { EventEmitter } from '../utils/events';
import { colorWith } from './utils';
import { defaultAnimationGroup } from './elements/element';
import * as tsl from './three/nodes/tsl';
import { Sound } from './elements/sound';
import type { Scene } from './scene';
import { CenimaCamera } from './camera';
import { Lights } from './lights';

export type WorldEvent = 'worldStarted' | 'worldEnded';
export type WorldEventMap = {
  worldStarted: { soure: EventEmitter; world: World };
  worldEnded: { soure: EventEmitter; world: World };
};

export const AsyncFunction: any = (globalThis as any).AsyncFunction || (async (x: any) => x).constructor;

const staticSize = { width: window.innerWidth, height: window.innerHeight };

type RunContext = {
  tsl: typeof tsl;
  say: (content: string) => void;
};

type Props = {
  subtitle: string;
};

export class World extends EventEmitter<WorldEventMap> {
  public readonly listener = new AudioListener();

  protected readonly renderer: WebGPURenderer;
  protected readonly clock: Clock;
  protected readonly uuid = MathUtils.generateUUID();
  protected readonly camera: CenimaCamera;
  protected readonly speaker: Sound;

  public readonly root: Scene3D;

  protected currentScene?: Scene;

  protected readonly context: RunContext;

  protected working = false;

  constructor(
    public dom: HTMLCanvasElement,
    public props: Props
  ) {
    super();

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
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.setClearColor(colorWith('rgb(30, 31, 35)'));
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(staticSize.width, staticSize.height);

    this.root = new Scene3D();

    const camera = new CenimaCamera(75, window.innerWidth / window.innerHeight, 0.00001, 1000000);
    camera.position.set(0.5, 0.5, 2);
    this.camera = camera;
    this.root.add(camera.native);

    // spot light
    const lights = new Lights(0.002);
    this.root.add(lights);

    const speaker = new Sound({}, this.listener);
    this.speaker = speaker;
    this.root.add(speaker);

    this.context = {
      tsl,
      say: (content: string) => {
        this.props.subtitle = content;
        return this.speaker.say(content);
      }
    };

    lights.sun.visible = true;
    lights.white.visible = true;
    lights.red.visible = true;
    lights.red1.visible = true;
    lights.red.position.x = 1;
    lights.red1.position.x = -1;
    lights.green.visible = true;
    lights.green1.visible = true;
    lights.green.position.y = 1;
    lights.green1.position.y = -1;
    lights.blue.visible = true;
    lights.blue1.visible = true;
    lights.blue.position.z = 1;
    lights.blue1.position.z = -1;
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
    this.camera.native.updateProjectionMatrix();
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
    [this.root].forEach((e) => e.traverse(fntrv));
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
    if (this.currentScene) {
      this.currentScene.update(delta, now, this.renderer, this.currentScene.native, this.camera.native);
    }
    this.renderer.render(this.root, this.camera.native);
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
    const script = new AsyncFunction(['context', 'THREE'], `with(context) { ${code} \nawait main(); }`);

    return await script.call(this, this.context, THREE);
  }
}
