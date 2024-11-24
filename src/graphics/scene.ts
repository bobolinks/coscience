import { Camera as Camera3D, Mesh, Scene as Scene3D, type Renderer } from 'three/webgpu';
import { Element, type AttrsLike, type ElementEventMap, type PropsLike } from './elements/element';
import type { RunContext } from './runtime';

export type SceneEventMap = ElementEventMap & {
  entered: void;
  leaved: void;
};

export class Scene<R extends RunContext = RunContext, P extends PropsLike = PropsLike, A extends AttrsLike = AttrsLike, E extends SceneEventMap = SceneEventMap> extends Element<Scene3D, P, A, E> {
  public readonly size = { width: 0, height: 0 };
  public readonly runtime: R = {} as any;

  constructor(props: P) {
    super(new Scene3D(), props);
  }

  setupRuntime(context: RunContext) {
    Object.assign(this.runtime, context);
  }

  resize(width: number, height: number) {
    this.size.width = width;
    this.size.height = height;
  }

  update(delta: number, now: number, renderer: Renderer, scene: Scene3D, camera: Camera3D) {
    const fn = (it: any) => {
      if (it.update) {
        it.update(delta, now, renderer, this, camera);
      }
      it.children.forEach(fn);
    };
    this.children.forEach(fn);
  }
}
