import { Slide } from "../slide";
import { AmbientLight, DirectionalLight, ExtrudeGeometry, FrontSide, Mesh as Mesh3D, MeshPhysicalNodeMaterial, PointLight, SpotLight, Vector2, type Group } from "three/webgpu";
import { Electric } from "../electric";
import { LightElement, LightMesh, Lights, type NamedLights } from '../../graphics/lights';
import { Blue, Green, Red, White } from "../theme";
import { ShapeCircle } from "@/graphics/elements/shapes";
import type { RunContext } from "@/graphics/runtime";
import { Model } from "@/graphics/elements/model";
import { loadGltf } from "@/graphics/utils";

type Context = RunContext & {
  lights: Lights;
  stage: ShapeCircle;
  phone: Electric;
  tv: Electric;
  computer: Electric;
  calculator: Model;
};

export default class extends Slide<Context> {
  static title = '计算机无处不在';

  private video: HTMLVideoElement;
  private lights: Lights;

  constructor(index: number, title: string) {
    super(index, title, { touchable: true });

    // lights
    const ambient = new LightElement(new AmbientLight(0x404040, 2), { intensity: 2 });

    const light = new LightElement(new DirectionalLight(White, 2), { intensity: 2 });
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

    const all: NamedLights = {};
    const zero = new Vector2();
    const vec = new Vector2(0.8, 0);
    const names = ['near', 'far', 'left', 'right'];
    [Blue, White, Red, Green].forEach((c, i) => {
      const spot = new PointLight(c, 2, 3);
      spot.castShadow = true;
      spot.shadow.camera.near = 8;
      spot.shadow.camera.far = 30;
      spot.shadow.mapSize.width = 1024;
      spot.shadow.mapSize.height = 1024;

      const mesh = new LightMesh(spot, { intensity: 2, size: 0.001, color: c });
      mesh.position.x = vec.x;
      mesh.position.y = 1.2;
      mesh.position.z = vec.y;

      vec.rotateAround(zero, Math.PI / 2);

      all[names[i]] = mesh;
    });

    const lights = new Lights({ ambient, light, ...all });
    lights.intensity = 0;
    this.add(lights);
    this.lights = lights;
    this.runtime.lights = this.lights;

    const video: HTMLVideoElement = document.getElementById('videoShared') as any;
    this.video = video;

    this.load(video);
  }
  async load(video: HTMLVideoElement) {
    const model = await loadGltf('/assets/models/com.glb');
    const scene: Group = model.scene;
    const phone: Group = scene.getObjectByProperty('name', 'Phone') as any;
    phone.position.set(0, 0, 0);
    const tv: Group = scene.getObjectByProperty('name', 'TV') as any;
    tv.position.set(0, 0, 0);
    const computer: Group = scene.getObjectByProperty('name', 'Computer') as any;
    computer.position.set(0, 0, 0);
    const calculator: Group = scene.getObjectByProperty('name', 'Calculator') as any;
    calculator.position.set(0, 0, 0);

    const stage = new ShapeCircle(new Mesh3D(new ExtrudeGeometry(), new MeshPhysicalNodeMaterial({ metalness: 0.6, roughness: 0.3 })), { radius: 0.8, opts: { curveSegments: 80, depth: 0.01, bevelEnabled: false } });
    stage.native.castShadow = false;
    stage.native.receiveShadow = true;
    stage.visible = false;
    this.add(stage);
    this.runtime.stage = stage;

    const zero = new Vector2();
    const vec = new Vector2(0.5, 0);
    const sz = [0.1, 0.4, 0.3];
    const ecs: any = [phone, tv, computer, calculator].map((e, i) => {
      e.rotation.y = -Math.PI * i / 2;
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
      const ec = e !== calculator ? new Electric(e, { src: video, size: sz[i] }) : new Model<Group>(e, { size: sz[i] });
      cir.add(ec);
      stage.add(cir);
      vec.rotateAround(zero, Math.PI / 2);
      return ec;
    });

    this.runtime.phone = ecs[0];
    this.runtime.tv = ecs[1];
    this.runtime.computer = ecs[2];
    this.runtime.calculator = ecs[3];

    this.on('tap', () => {
      this.play();
    });
  }
  protected async main() {
    const PI_2 = Math.PI / 2;
    let rot = PI_2;
    const { subtitle, lights, stage, wait } = this.runtime;

    stage.rotation.y = rot;
    await subtitle.startAnimation({ opacity: 0 }, 1000);
    subtitle.alignTo('bottom');

    this.video.play();

    stage.visible = true;
    subtitle.props.text = '我们平时用的计算机的是这样的，俗称电脑';
    await wait(
      subtitle.startAnimation({ opacity: 1 }, 3000).then(() => {
        subtitle.props.text = '动动鼠标和键盘，就可以让它帮我们完成很多工作内容';
        return wait(1000);
      }),
      lights.startAnimation({ intensity: 2 }, 3000),
    );
    await wait(4000);

    rot -= PI_2;
    await wait(
      subtitle.startAnimation({ opacity: 0 }, 1000).then(async () => {
        subtitle.props.text = '我们每天看的数字电视，它其实也是一台计算机';
        await subtitle.startAnimation({ opacity: 1 }, 3000);
        subtitle.props.text = '按按遥控器，就可以观看你喜欢的电影，或者是电视节目';
        return wait(1000);
      }),
      stage.startAnimation({ rotation: { x: 0, y: rot, z: 0 } }, 4000)
    );
    await wait(4000);

    rot -= PI_2;
    await wait(
      subtitle.startAnimation({ opacity: 0 }, 1000).then(async () => {
        subtitle.props.text = '我们每天用的手机，它其实也是一台计算机';
        await subtitle.startAnimation({ opacity: 1 }, 3000);
        subtitle.props.text = '动动手，就可以拨打电话、看新闻、听音乐';
        return wait(1000);
      }),
      stage.startAnimation({ rotation: { x: 0, y: rot, z: 0 } }, 4000)
    );
    await wait(4000);

    rot -= PI_2;
    await wait(
      subtitle.startAnimation({ opacity: 0 }, 1000).then(async () => {
        subtitle.props.text = '令我们想不到的是，我们经常用的计算器，它其实也是一台计算机';
        await subtitle.startAnimation({ opacity: 1 }, 3000);
        subtitle.props.text = '敲敲按键，它就可以帮助我们完成各种各样的快速运算';
        return wait(1000);
      }),
      stage.startAnimation({ rotation: { x: 0, y: rot, z: 0 } }, 4000)
    );
    await wait(2000);

    stage.visible = false;
    await wait(
      subtitle.startAnimation({ opacity: 0 }, 1000).then(async () => {
        subtitle.alignTo('center');
        subtitle.props.text = '究竟是怎么做到的，为什么这么神奇？';
        await subtitle.startAnimation({ opacity: 1 }, 3000);
        subtitle.props.text = '现在，让我们一起探索其中的奥秘';
        return wait(1000);
      }),
    );
    await wait(4000);

    this.complete();
  }
  protected getDts(): string {
    return `
    declare const lights: ElementNode<AttrsLike & LightAttrs>;
    declare const stage: ElementNode<AttrsLike & LightAttrs>;
    declare const phone: ElementNode<AttrsLike & LightAttrs>;
    declare const tv: ElementNode<AttrsLike & LightAttrs>;
    declare const computer: ElementNode<AttrsLike & LightAttrs>;
    declare const calculator: ElementNode<AttrsLike & LightAttrs>;
    `;
  }

  dispose(): void {
    super.dispose();
    this.video.pause();
  }
  setupRuntime(context: RunContext): void {
    super.setupRuntime(context);
    this.runtime.camera.position.set(0, 0.5, 2);
  }
}