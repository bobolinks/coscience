import { PerspectiveCamera } from "@/graphics/elements/camera";
import { Slide } from "../slide";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";
import { FrontSide, type Group, type Mesh } from "three/webgpu";
import { Model } from "@/graphics/elements/model";
import { Electric } from "../electric";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

export default class extends Slide {
  constructor() {
    super(new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.00001, 10000), {});
    this.camera.position.set(0, 0.2, 1);
    // const light = new DirectionalLight(undefined, 10);
    // light.position.set(1, 1, 1);
    // this.native.add(light);
    this.load();
  }
  async load() {
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    const model = await loader.loadAsync('/assets/models/com.glb');
    const scene: Group = model.scene;
    const meshs: Mesh[] = scene.getObjectsByProperty('isMesh', true) as any;
    meshs.forEach((m: Mesh) => {
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
    this.add(new Electric(phone, { src: video, size: 0.2 }));
    // this.add(new Electric(tv, { src: video, size: 0.4 }));
    // this.add(new Electric(computer, { src: video, size: 0.3 }));
  }
}