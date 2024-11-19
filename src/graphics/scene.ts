import { Camera as Camera3D, Mesh, Scene as Scene3D, type Renderer } from 'three/webgpu';
import { Element, type AttrsLike, type ElementEventMap, type PropsLike } from './elements/element';
import { type Camera, OrthographicCamera, PerspectiveCamera } from './elements/camera';

export type SceneEventMap = ElementEventMap & {
  entered: void;
  leaved: void;
};

export class Scene<C extends Camera, P extends PropsLike = PropsLike, A extends AttrsLike = AttrsLike, E extends SceneEventMap = SceneEventMap> extends Element<Scene3D, P, A, E> {
  public readonly size = { width: 0, height: 0 };

  constructor(public readonly camera: C, props: P) {
    super(new Scene3D(), props);
  }

  resize(width: number, height: number) {
    this.size.width = width;
    this.size.height = height;

    if (this.camera instanceof PerspectiveCamera) {
      this.camera.props.aspect = width / height;
      this.camera.native.updateProjectionMatrix();
    } else if (this.camera instanceof OrthographicCamera) {
      const wh = width / 2;
      const hh = height / 2;
      this.camera.props.left = -wh;
      this.camera.props.right = wh;
      this.camera.props.top = hh;
      this.camera.props.bottom = -hh;
      this.camera.native.updateProjectionMatrix();
    }
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

  dispose() {
    const fntrv = (el: any) => {
      if (el instanceof Mesh) {
        if (Array.isArray(el.material)) {
          el.material.forEach((e) => e.dispose());
        } else if (el.material) {
          el.material.dispose();
        }
        if (el.geometry) {
          el.geometry.dispose();
        }
      }
    };
    this.traverse(fntrv);
  }
}
