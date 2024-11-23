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
import { Element, type AttrsLike, type PropsLike } from './elements/element';
import { color } from './three/nodes/tsl';

type Props = PropsLike & {
  intensity: number;
};

type LightMeshProps = Props & {
  size: number;
  color: ColorType;
};

type Attrs = AttrsLike & Pick<Props, 'intensity'>;

export class LightElement<L extends AmbientLight | DirectionalLight | RectAreaLight = DirectionalLight> extends Element<L, Props, Attrs> {
  public readonly isLightElement = true;

  constructor(light: L, props: Props) {
    super(light, props);
    this.native.intensity = this.props.intensity;
  }
  set intensity(value: number) {
    this.native.intensity = value;
  }
};

export class LightMesh<L extends SpotLight | PointLight = SpotLight> extends Element<Mesh<SphereGeometry, NodeMaterial>, LightMeshProps, Attrs> {
  constructor(public readonly light: L, props: LightMeshProps) {
    super(new Mesh(new SphereGeometry(props.size, 16, 8), new NodeMaterial()), props);
    const clr = new Color(this.props.color);
    this.material.colorNode = color(clr.getHex());
    this.material.lights = false;
    this.light.intensity = this.props.intensity;
    this.native.add(light);
  }
  get material(): NodeMaterial {
    return this.native.material;
  }
  set intensity(value: number) {
    this.light.intensity = value;
  }
};

export type NamedLights = {
  [k: string]: LightElement<AmbientLight | DirectionalLight | RectAreaLight> | LightMesh<SpotLight | PointLight>;
};

export class Lights extends Element<Group, PropsLike, Attrs> {
  public readonly node: ShaderNodeObject<LightsNode>;
  public readonly context: ShaderNodeObject<ContextNode>;

  constructor(public readonly all: NamedLights) {
    super(new Group(), {});

    const lightsAll: Light[] = Object.values(all).map(e => {
      if ((e as any).isLightElement) {
        return (e as any).native;
      } else {
        return (e as any).light;
      }
    }) as any;

    const allLightsNode = lights(lightsAll);

    const model = new CustomLightingModel();
    const context = allLightsNode.context({ model });

    this.node = allLightsNode;
    this.context = context;

    lightsAll.forEach((e) => {
      this.native.add(e);
    });
  }
  set intensity(value: number) {
    Object.values(this.all).forEach(e => e.intensity = value);
  }
}

class CustomLightingModel extends LightingModel {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  direct({ lightColor, reflectedLight }: LightingModelDirectInput, stack: StackNode, builder: NodeBuilder): void {
    (reflectedLight.directDiffuse as any).addAssign(lightColor);
  }
}
