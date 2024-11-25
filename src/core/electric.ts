import { MeshBasicNodeMaterial, SRGBColorSpace, VideoTexture, type Group, type Material, type Mesh } from "three/webgpu";
import { Model, type ModelProps } from "@/graphics/elements/model";

type ElectricProps = ModelProps & {
  /** readonly */
  src: string | HTMLVideoElement;
};

export class Electric extends Model<Group, ElectricProps> {
  public readonly video: HTMLVideoElement;

  protected materialCover: Material;
  protected materialVideo: MeshBasicNodeMaterial;

  constructor(model: Group, props: ElectricProps) {
    super(model, props);

    if (typeof this.props.src === 'string') {
      const video = document.createElement('video');
      video.setAttribute('loop', '');
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('crossOrigin', 'anonymous');
      video.style.display = 'none';
      video.innerHTML = `<source src="/assets/textures/sintel.mp4">`;
      video.play();
      this.video = video;
    } else {
      this.video = this.props.src;
    }

    const ms: Mesh[] = model.getObjectsByProperty('isMesh', true) as any;
    let mesh: Mesh = null as any;
    let material: Material = null as any;
    const fn = (m: Material) => {
      if (m.name === 'screen' || m.name.startsWith('screen.')) {
        material = m;
        return m;
      }
    }
    for (const m of ms) {
      if (Array.isArray(m.material)) {
        m.material.forEach(fn);
      } else {
        fn(m.material);
      }
      if (material) {
        mesh = m;
        break;
      }
    }
    if (!material) {
      throw 'material not found';
    }
    this.materialCover = material;

    const texture = new VideoTexture(this.video);
    texture.colorSpace = SRGBColorSpace;
    const materialVideo = new MeshBasicNodeMaterial({ map: texture });
    mesh.material = materialVideo;
    this.materialVideo = materialVideo;
  }
  set src(value: string) {
    this.play(value);
  }
  play(src: string) {
    const source: HTMLSourceElement = this.video.children[0] as any;
    source.src = src;
    this.video.play();
  }
  dispose(): void {
    super.dispose();
    if (typeof this.props.src === 'string') {
      this.video.pause();
    }
  }
}