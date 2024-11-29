import { Mesh, MeshBasicNodeMaterial, NodeMaterial, ShapeGeometry } from 'three/webgpu';
import { colorWith, createRoundShape } from '../utils';
import { Shape2D, type Shape2DProps } from './shape';

export type RectProps = Shape2DProps & {
  width: number;
  height: number;
  borderRadius: number;
};

export class Rect<T extends RectProps = RectProps, M extends NodeMaterial = MeshBasicNodeMaterial> extends Shape2D<Mesh<ShapeGeometry, M>, T> {
  public readonly isRect = true;

  constructor(props?: Partial<T>, m?: M) {
    super(
      m || new MeshBasicNodeMaterial({ opacity: props?.opacity ?? 1 }) as any,
      {
        width: 1,
        height: 1,
        borderRadius: 0,
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
    return new Mesh<ShapeGeometry, M>(geo, this.fillMaterial);
  }
}
