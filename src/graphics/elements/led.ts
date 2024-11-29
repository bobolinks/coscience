import { RectAreaLight, RectAreaLightNode, Mesh as Mesh3D, MeshPhysicalNodeMaterial, MeshLambertNodeMaterial, MeshPhongNodeMaterial, DoubleSide, Object3D, Group } from 'three/webgpu';
import { RectAreaLightTexturesLib } from 'three/addons/lights/RectAreaLightTexturesLib.js';
import { Element, type AttrsLike, type PropsLike } from './element';
import { Mesh } from './mesh';
import { Rect, type RectProps } from './rect';
import { colorWith } from '../utils';
import { RectAreaLightHelper } from 'three/examples/jsm/Addons.js';

// type Props = PropsLike & {
//   intensity: number;
//   color: ColorType;
//   width: number;
//   height: number;
// };

RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init());

// export class Led extends Element<RectAreaLight, Props, AttrsLike & Pick<Props, 'intensity'>> {
//   public readonly isLightElement = true;

//   constructor(props: Partial<Props>) {
//     super(new RectAreaLight(props.color, props.intensity, props.width, props.height), props as any);
//   }
//   set intensity(value: number) {
//     this.native.intensity = value;
//   }
// };

type Props = PropsLike & {
  color: ColorType;
  width: number;
  height: number;
  intensity: number;
};

const _tmpObj = new Object3D();

export class Led extends Element<Group, Props, AttrsLike & Pick<Props, 'intensity'>> {
  public readonly isLed = true;

  protected helper: RectAreaLightHelper;
  protected light: RectAreaLight;

  constructor(props?: Partial<Props>) {
    super(new Group(), { color: 0, width: 1, height: 1, intensity: 1, ...props });
    this.light = new RectAreaLight(this.props.color, this.props.intensity, this.props.width, this.props.height);
    this.helper = new RectAreaLightHelper(this.light);
    this.native.add(this.light);
    this.native.add(this.helper);
  }

  protected set color(value: ColorType) {
    if (this.light) {
      this.light.color = colorWith(value);
    }
  }

  protected set intensity(value: number) {
    if (this.light) {
      this.light.intensity = value;
    }
  }
}