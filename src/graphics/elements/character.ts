import { AnimationAction, AnimationClip, AnimationMixer, Camera, CapsuleGeometry, Group, LoopOnce, LoopRepeat, MeshBasicMaterial, Scene, Vector3, type Renderer } from "three/webgpu";
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Model, type ModelProps } from "./model";
import type { AttrsLike, ElementEventMap, } from "./element";
import logger from "../../utils/logger";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

type AnimationActionState = {
  isPending: boolean;
  action: AnimationAction;
  resolve: any;
};

export type ActionType = 'start' | 'stop';

type UnionToInterface<T extends string> = {
  [P in T]: ActionType;
};

type CharProps = ModelProps & {
  /** readonly */
  src: string;
};

export class Character<Actions extends '' = '', P extends CharProps = CharProps, A extends AttrsLike = AttrsLike> extends Model<Group, P, A, UnionToInterface<Exclude<Extract<Actions | 'idle', string>, ''>> & ElementEventMap> {
  public readonly actions: Record<Exclude<Actions, ''>, AnimationActionState> = {} as any;

  protected _mixer?: AnimationMixer;
  protected _clips: Array<AnimationClip> = [];

  constructor(props: Required<P>) {
    super(new Group(), props);
    this.loadModel();
  }

  protected async loadModel() {
    const { src } = this.props;

    let loader: GLTFLoader | FBXLoader | null;
    if (/.glb$/i.test(src)) {
      loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
    } else if (/.fbx$/i.test(src)) {
      loader = new FBXLoader();
    } else {
      throw logger.panic(`Model[${src}] is not supported!`);
    }
    this.model.removeFromParent();
    const model = await loader.loadAsync(src);
    if (model instanceof Group) {
      this.model = model;
    } else {
      this.model = model.scene;
    }
    this.scaleGroup.add(this.model);

    this.objectAutoSize();

    // animations
    this._mixer = new AnimationMixer(this.model);
    this._mixer.addEventListener('finished', ({ action }: { action: AnimationAction }) => {
      const state: AnimationActionState = Object.values(this.actions).find(e => (e as any)[1].action === action) as any;
      if (state) {
        state.isPending = false;
        if (state.resolve) {
          state.resolve(true);
          state.resolve = undefined;
        }
      }
    });
    this._clips = this.model.animations || [];
    for (const clip of this._clips) {
      (this.actions as any)[clip.name] = { isPending: false, action: this._mixer.clipAction(clip), resolve: undefined };
    }
  }

  async act(name: Exclude<Actions, ''>, loop?: boolean): Promise<boolean> {
    const state = this.actions[name];
    if (!state) {
      return false;
    } else if (state.isPending) {
      return true;
    }
    state.isPending = true;

    const action = state.action;

    action.clampWhenFinished = true;
    action.reset()
      .setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1)
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(1.0)
      .play();

    return new Promise((resolve) => {
      state.resolve = resolve;
    });
  }

  stop(name?: Exclude<Actions, ''>) {
    const names = name ? [name] : Object.keys(this.actions);
    for (const key of names) {
      const state = (this.actions as any)[key];
      if (!state) {
        continue;
      } else if (!state.isPending) {
        continue;
      }
      state.isPending = false;
      if (state.resolve) {
        state.resolve(false);
        state.resolve = undefined;
      }
      state.action.stop();
    }
  }

  update(delta: number, now: number, renderer: Renderer, scene: Scene, camera: Camera) {
    if (this._mixer) {
      this._mixer.update(delta);
    }
  }
}
