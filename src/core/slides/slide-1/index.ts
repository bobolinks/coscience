import { AmbientLight, DirectionalLight, Group, PointLight, Vector2 } from "three/webgpu";
import type { RunContext } from "@/graphics/runtime";
import { Slide } from "../../slide";
import { LightElement, LightMesh, Lights, type NamedLights } from "@/graphics/lights";
import { White, Blue, Red, Green } from "../../theme";
import { loadGltf } from "@/graphics/utils";
import { Model } from "@/graphics/elements/model";
import { LedBox } from "./ledbox";
import { Button } from "./button";

type Context = RunContext & {
  lights: Lights;
  scene: Model;
  button: Button;
  led: LedBox;
};

export default class extends Slide<Context> {
  static title = '灯和开关';

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
      const spot = new PointLight(c, 1, 3);
      spot.castShadow = true;
      spot.shadow.camera.near = 8;
      spot.shadow.camera.far = 30;
      spot.shadow.mapSize.width = 1024;
      spot.shadow.mapSize.height = 1024;

      const mesh = new LightMesh(spot, { intensity: 2, size: 0.001, color: c });
      mesh.position.x = vec.x;
      mesh.position.y = vec.y;
      mesh.position.z = 1;

      vec.rotateAround(zero, Math.PI / 2);

      all[names[i]] = mesh;
    });

    const lights = new Lights({ ambient, light, ...all });
    this.add(lights);
    this.runtime.lights = lights;

    this.load();
  }
  setupRuntime(context: RunContext): void {
    super.setupRuntime(context);
    context.camera.position.set(0, 0, 1);
    context.subtitle.alignTo('top');
  }

  async load() {
    const model = await loadGltf('/assets/models/slide-1.glb');

    const s: Group = model.scene;

    const scene = new Model<Group>(s, { size: 0.5 });
    scene.rotation.x = Math.PI * 0.3;
    this.add(scene);
    this.runtime.scene = scene;

    const l: Group = s.getObjectByProperty('name', 'LedBox') as any;
    const box = new LedBox(l, { intensity: 0, size: 0.05 });
    box.position.z = -0.1;
    box.position.y = 0.01;
    scene.add(box);
    this.runtime.led = box;

    const b: Group = s.getObjectByProperty('name', 'Button') as any;
    const button = new Button(b, { size: 0.05 });
    button.position.z = 0.1;
    scene.add(button);
    button.on('tap', () => {
      if (button.isDown) {
        box.props.intensity = 4;
      } else {
        box.props.intensity = 0;
      }
    });
    this.runtime.button = button;
  }
  protected getDts(): string {
    return `
    declare const lights: ElementNode<AttrsLike & LightAttrs>;
    declare const scene: ElementNode<AttrsLike & LightAttrs>;
    declare const button: ElementNode<AttrsLike & LightAttrs>;
    declare const led: ElementNode<AttrsLike & LightAttrs>;
    `;
  }
}