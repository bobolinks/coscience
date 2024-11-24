import { Slide } from "../slide";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";
import { AmbientLight, DirectionalLight, ExtrudeGeometry, FrontSide, Mesh as Mesh3D, MeshPhysicalNodeMaterial, SpotLight, Vector2, type Group } from "three/webgpu";
import { Electric } from "../electric";
import { LightElement, LightMesh, Lights } from '../../graphics/lights';
import { Green, White } from "../theme";
import { ShapeCircle } from "@/graphics/elements/shapes";
import { Text } from "@/graphics/elements/text";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

export default class extends Slide {
  private subtitle: Text;

  constructor() {
    super(0, { touchable: true });

    // lights
    const ambient = new LightElement(new AmbientLight(0x404040, 3), { intensity: 3 });

    const light = new LightElement(new DirectionalLight(White, 3), { intensity: 3 });
    light.position.set(1, 5, 1);
    light.native.castShadow = true;
    light.native.shadow.camera.near = 0.01;
    light.native.shadow.camera.far = 20;
    light.native.shadow.camera.right = 20;
    light.native.shadow.camera.left = - 20;
    light.native.shadow.camera.top = 20;
    light.native.shadow.camera.bottom = - 20;
    light.native.shadow.mapSize.width = 1024;
    light.native.shadow.mapSize.height = 1024;

    const spot = new SpotLight(White, 3);
    spot.angle = Math.PI / 5;
    spot.penumbra = 0.3;
    spot.position.set(10, 10, 5);
    spot.castShadow = true;
    spot.shadow.camera.near = 8;
    spot.shadow.camera.far = 30;
    spot.shadow.mapSize.width = 1024;
    spot.shadow.mapSize.height = 1024;

    const mesh = new LightMesh(spot, { intensity: 3, size: 0.001, color: Green });
    mesh.position.set(0.5, 0.5, -0.5);
    const lights = new Lights({ ambient, light, spot: mesh });
    // lights.intensity = 0;
    this.add(lights);

    const subtitle = new Text({ text: '电脑无处不在...', width: 0.3, height: 0.1, borderRadius: 0.02, background: 'none' });
    subtitle.position.z = 1;
    this.subtitle = subtitle;
    this.add(subtitle);

    this.load();
  }
  async load() {
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    const model = await loader.loadAsync('/assets/models/com.glb');
    const scene: Group = model.scene;
    const meshs: Mesh3D[] = scene.getObjectsByProperty('isMesh', true) as any;
    meshs.forEach((m: Mesh3D) => {
      if (Array.isArray(m.material)) {
        m.material.forEach(e => (e.side = FrontSide, e.transparent = false));
      } else {
        m.material.side = FrontSide;
        m.material.transparent = false;
      }
    });

    const phone: Group = scene.getObjectByProperty('name', 'Phone') as any;
    phone.position.set(0, 0, 0);
    const tv: Group = scene.getObjectByProperty('name', 'TV') as any;
    tv.position.set(0, 0, 0);
    const computer: Group = scene.getObjectByProperty('name', 'Computer') as any;
    computer.position.set(0, 0, 0);
    const video: HTMLVideoElement = document.getElementById('videoShared') as any;

    const stage = new ShapeCircle(new Mesh3D(new ExtrudeGeometry(), new MeshPhysicalNodeMaterial({ metalness: 0.6, roughness: 0.3 })), { radius: 0.8, opts: { curveSegments: 80, depth: 0.01, bevelEnabled: false } });
    stage.native.castShadow = false;
    stage.native.receiveShadow = true;
    this.add(stage);

    const zero = new Vector2();
    const vec = new Vector2(0.5, 0);
    const sz = [0.1, 0.4, 0.3];
    [phone, tv, computer].forEach((e, i) => {
      e.rotation.y = -Math.PI / 2;
      const cir = new ShapeCircle(new Mesh3D(new ExtrudeGeometry(), new MeshPhysicalNodeMaterial({
        color: 0xa0adaf,
        metalness: 0.5,
        roughness: 0.5
      })), { radius: 0.25, opts: { curveSegments: 80, depth: 0.02, bevelEnabled: false } });
      cir.native.castShadow = false;
      cir.native.receiveShadow = true;
      cir.position.x = vec.x;
      cir.position.y = 0.02;
      cir.position.z = vec.y;
      const ec = new Electric(e, { src: video, size: sz[i] });
      cir.add(ec);
      stage.add(cir);
      vec.rotateAround(zero, Math.PI / 2);
    });

    this.on('tap', () => {
      if (this.play()) {
        video.play();
      }
    });
  }
  protected getDts(): string {
    return '';
  }
}