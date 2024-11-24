import { Camera as Camera3D, OrthographicCamera, Scene as Scene3D, type Renderer } from 'three/webgpu';
import { Element } from './elements/element';
import { Ruler } from './elements/ruler';
import { Text } from './elements/text';
import type { PerspectiveCamera } from './elements/camera';

export class Panel extends Element<Scene3D> {
  public readonly camera: OrthographicCamera;

  public readonly text: Text;
  public readonly ruler: Ruler;

  constructor(
    protected perspCamera: PerspectiveCamera,
    protected canvas: HTMLCanvasElement
  ) {
    super(new Scene3D(), {});

    // camera
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.0001, 1000);
    this.camera.name = 'Orthographic';
    this.camera.position.set(0, 0, 100);

    const text = new Text({
      width: 60,
      height: 20,
      borderRadius: 2,
      text: '-',
      color: 0xffffff,
      background: 'none',
      opacity: 0.3,
      fontSize: 2,
      textAlign: 'center'
    });
    this.text = text;
    this.text.position.set(10, 10, 0);
    this.add(text);

    this.ruler = new Ruler(perspCamera.native);
    this.add(this.ruler);
  }
  resize(width: number, height: number) {
    const aspect = width / height;
    // 最长边固定100+100=200个单位
    const len = 100;
    if (aspect > 1) {
      this.camera.top = len;
      this.camera.bottom = -len;
      this.camera.right = this.camera.top * aspect;
      this.camera.left = -this.camera.right;
    } else {
      this.camera.right = len;
      this.camera.left = -len;
      this.camera.top = this.camera.right / aspect;
      this.camera.bottom = -this.camera.top;
    }
    this.camera.updateProjectionMatrix();

    this.text.position.set(0, this.camera.top - 4, 0);

    this.ruler.resize(this.camera.right * 2, this.camera.top * 2);
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
