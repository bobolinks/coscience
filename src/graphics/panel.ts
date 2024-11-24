import { Camera as Camera3D, OrthographicCamera, Scene as Scene3D, type Renderer } from 'three/webgpu';
import { Element } from './elements/element';
import { Ruler } from './elements/ruler';
import type { PerspectiveCamera } from './elements/camera';
import { SubTitle } from './elements/subtitle';

export class Panel extends Element<Scene3D> {
  public readonly camera: OrthographicCamera;

  public readonly subtitle: SubTitle;
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

    const subtitle = new SubTitle({
      width: 60,
      height: 20,
      borderRadius: 2,
      text: '-',
      color: 0xffffff,
      background: 'none',
      opacity: 0.3,
      fontSize: 4,
      textAlign: 'center'
    });
    this.subtitle = subtitle;
    this.add(subtitle);

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

    const w = this.camera.right * 2;
    const h = this.camera.top * 2;
    this.subtitle.resize(w, h);
    this.ruler.resize(w, h);
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
