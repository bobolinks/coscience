import { Mesh, MeshBasicNodeMaterial, ShapeGeometry } from 'three/webgpu';
import { colorWith, createRoundShape } from '../utils';
import { Shape2D, type Shape2DProps } from './shape';

export type RectProps = Shape2DProps & {
  width: number;
  height: number;
  borderRadius: number;
};

export class Rect<T extends RectProps = RectProps> extends Shape2D<Mesh<ShapeGeometry, MeshBasicNodeMaterial>, T> {
  public readonly isRect = true;

  constructor(props?: Partial<T>) {
    super(
      new MeshBasicNodeMaterial(),
      {
        width: 1,
        height: 1,
        borderColor: colorWith('#000'),
        borderRadius: 0,
        borderWidth: 0.01,
        color: colorWith('#fff'),
        opacity: 1,
        ...props
      } as any);

    if (this.props.opacity) {
      this.opacity = this.props.opacity;
    }
    if (this.props.color) {
      this.color = this.props.color;
    }
  }

  protected createShapes() {
    const shape = createRoundShape(this.props.width || 1, this.props.height || 1, this.props.borderRadius);
    const geo = new ShapeGeometry(shape);
    return new Mesh<ShapeGeometry, MeshBasicNodeMaterial>(geo, this.fillMaterial);
  }
}
