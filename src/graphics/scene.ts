import { Camera, Scene as Scene3D, type Renderer } from 'three/webgpu';
import { Element, type AttrsLike, type ElementEventMap, type PropsLike } from './elements/element';

export class Scene<P extends PropsLike = PropsLike, A extends AttrsLike = AttrsLike, E extends ElementEventMap = ElementEventMap> extends Element<Scene3D, P, A, E> {
  public readonly size = { width: 0, height: 0 };

  constructor(props: Required<P>) {
    super(new Scene3D(), props);
  }

  resize(width: number, height: number) {
    this.size.width = width;
    this.size.height = height;
  }

  update(delta: number, now: number, renderer: Renderer, scene: Scene3D, camera: Camera) {
    const fn = (it: any) => {
      if (it.update) {
        it.update(delta, now, renderer, this, camera);
      }
      it.children.forEach(fn);
    };
    this.children.forEach(fn);
  }
}
