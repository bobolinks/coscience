import {
  Color,
  Group,
  LightingModel,
  lights,
  Mesh,
  NodeMaterial,
  SphereGeometry,
  type AmbientLight,
  type ContextNode,
  type DirectionalLight,
  type Light,
  type LightingModelDirectInput,
  type LightsNode,
  type NodeBuilder,
  type PointLight,
  type RectAreaLight,
  type ShaderNodeObject,
  type SpotLight,
  type StackNode,
} from 'three/webgpu';
import { Element, type PropsLike } from './elements/element';
import { color } from './three/nodes/tsl';

type Props = PropsLike & {
  size: number;
  color: ColorType;
};

export class LightMesh<L extends SpotLight | PointLight = SpotLight> extends Element<Mesh<SphereGeometry, NodeMaterial>, Props> {
  constructor(public readonly light: L, props: Props) {
    super(new Mesh(new SphereGeometry(props.size, 16, 8), new NodeMaterial()), props);
    const clr = new Color(this.props.color);
    this.material.colorNode = color(clr.getHex());
    this.material.lights = false;
    this.native.add(light);
  }
  get material(): NodeMaterial {
    return this.native.material;
  }
};

export type NamedLights = {
  [k: string]: AmbientLight | DirectionalLight | LightMesh | RectAreaLight;
};

export class Lights extends Group {
  public readonly node: ShaderNodeObject<LightsNode>;
  public readonly context: ShaderNodeObject<ContextNode>;

  constructor(public readonly all: NamedLights) {
    super();

    const lightsAll: Light[] = Object.values(all).map(e => {
      if ((e as any).isElement) {
        return (e as any).native.children[0];
      } else {
        return e;
      }
    }) as any;

    const allLightsNode = lights(lightsAll);

    const model = new CustomLightingModel();
    const context = allLightsNode.context({ model });

    this.node = allLightsNode;
    this.context = context;

    lightsAll.forEach((e) => {
      this.add(e);
    });
  }
}

class CustomLightingModel extends LightingModel {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  direct({ lightColor, reflectedLight }: LightingModelDirectInput, stack: StackNode, builder: NodeBuilder): void {
    (reflectedLight.directDiffuse as any).addAssign(lightColor);
  }
}
