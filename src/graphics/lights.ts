import {
  AmbientLight,
  Color,
  color,
  ContextNode,
  DirectionalLight,
  Group,
  Light,
  LightingModel,
  lights,
  LightsNode,
  Mesh,
  NodeBuilder,
  NodeMaterial,
  PointLight,
  SphereGeometry,
  SpotLight,
  StackNode,
  type LightingModelDirectInput,
  type ShaderNodeObject
} from 'three/webgpu';
import * as Colors from './theme';

export class Lights extends Group {
  public readonly lights: ShaderNodeObject<LightsNode>;
  public readonly lightsContext: ShaderNodeObject<ContextNode>;

  // for environment
  public readonly sun: DirectionalLight;
  public readonly ambient: AmbientLight;

  // for special colors
  public readonly white: SpotLight = null as any; /** 白灯，默认在 (0,0,0)位置 */
  public readonly white1: SpotLight = null as any; /** 红灯备用 */
  public readonly red: SpotLight = null as any; /** 红灯，默认在 (0,0,0)位置 */
  public readonly red1: SpotLight = null as any; /** 红灯备用 */
  public readonly green: SpotLight = null as any; /** 绿灯，默认在 (0,0,0)位置 */
  public readonly green1: SpotLight = null as any; /** 绿灯备用 */
  public readonly blue: SpotLight = null as any; /** 蓝灯，默认在 (0,0,0)位置 */
  public readonly blue1: SpotLight = null as any; /** 蓝灯备用 */

  private readonly all: Array<Light> = [];

  constructor(size = 0.001) {
    super();

    const sun = new DirectionalLight(0xffffff, 1);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.position.set(10, 10, 10);
    this.sun = sun;
    this.all.push(sun);

    const ambient = new AmbientLight(0xb0bec5, 0.8);
    this.ambient = ambient;
    this.all.push(ambient);

    const sphereGeometry = new SphereGeometry(size, 16, 8);

    for (const name of ['White', 'Red', 'Green', 'Blue']) {
      const color = new Color((Colors as any)[name]);
      const field = name.toLocaleLowerCase();
      const light = newLight(color.getHex(), sphereGeometry);
      const light1 = newLight(color.getHex(), sphereGeometry);
      (this as any)[field] = light;
      (this as any)[`${field}1`] = light1;
      this.all.push(light);
      this.all.push(light1);
    }

    const allLightsNode = lights(this.all);

    const lightingModel = new CustomLightingModel();
    const lightingModelContext = allLightsNode.context({ lightingModel });

    this.lights = allLightsNode;
    this.lightsContext = lightingModelContext;

    this.all.forEach((e) => {
      e.visible = false;
      this.add(e);
    });
  }

  protected set size(value: number) {
    this.all.forEach((light: any) => {
      if (light.isPointLight) {
        light.children[0].scale(value, value, value);
      }
    });
  }
}

function newLight(hexColor: number, geometry: SphereGeometry) {
  const material = new NodeMaterial();
  material.colorNode = color(hexColor);
  material.lightsNode = lights([]); // ignore scene lights
  const mesh = new Mesh(geometry, material);
  const light = new PointLight(hexColor, 0.1, 1);
  light.add(mesh);
  return light;
}

class CustomLightingModel extends LightingModel {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  direct({ lightColor, reflectedLight }: LightingModelDirectInput, stack: StackNode, builder: NodeBuilder): void {
    (reflectedLight.directDiffuse as any).addAssign(lightColor);
  }
}
