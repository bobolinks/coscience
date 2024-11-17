import { Mesh, BufferGeometry, MeshBasicNodeMaterial } from 'three/webgpu';
import { colorWith, createGeometries } from '../utils';
import { Shape, type ShapeProps } from './shape';

export type RectProps = ShapeProps & {
  width: number;
  height: number;
  borderRadius: number;
  color: ColorType;
};

export class Rect<T extends RectProps = RectProps> extends Shape<Mesh<BufferGeometry, MeshBasicNodeMaterial>, T> {
  public readonly isRect = true;

  constructor(props?: Partial<T>) {
    super(new Mesh<BufferGeometry, MeshBasicNodeMaterial>(), {
      width: 1,
      height: 1,
      borderColor: colorWith('#000'),
      borderRadius: 0,
      borderWidth: 0.01,
      color: colorWith('#fff'),
      opacity: 1,
      ...props
    } as any);
  }

  protected reshape() {
    const geo = createGeometries(this.props.width || 1, this.props.height || 1, this.props.borderRadius || 0.5);
    this.geometry.dispose();
    this.native.geometry = geo;
    this.native.matrixWorldNeedsUpdate = true;
    this.border.geometry.dispose();
    this.border.geometry = geo.userData.line;
    delete geo.userData.line;
    this.border.matrixWorldNeedsUpdate = true;
  }
}
