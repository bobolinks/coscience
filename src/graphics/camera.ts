import { PerspectiveCamera, Vector3 } from 'three/webgpu';
import { Element, type AttrsLike, type Vec3Like } from './elements/element';

type Props = {
  fov: number;
  aspect: number;
  near: number;
  far: number;
};
type Attrs = AttrsLike & { target?: Vec3Like; theta?: number };

export class CenimaCamera extends Element<PerspectiveCamera, Props, Attrs> {
  public readonly target = new Vector3();

  private _initPoint = new Vector3();

  constructor(fov?: number, aspect?: number, near?: number, far?: number) {
    super(new PerspectiveCamera(fov, aspect, near, far), { fov, aspect, near, far } as any);
  }
  protected applyAnimation(attrs: Attrs) {
    if (attrs.target) {
      this.lookAt(attrs.target.x, attrs.target.y, attrs.target.z);
    } else if (attrs.theta !== undefined) {
      this.position.x = this._initPoint.x * Math.cos(attrs.theta) - this._initPoint.z * Math.sin(attrs.theta);
      this.position.z = this._initPoint.x * Math.sin(attrs.theta) + this._initPoint.z * Math.cos(attrs.theta);
      this.lookAt(this.target);
    } else if (attrs.position) {
      this.lookAt(this.target);
    }
  }
  async lookAround(milliseconds: number): Promise<void> {
    this._initPoint.copy(this.position);
    return this.startAnimation({ theta: Math.PI * 2 }, milliseconds);
  }
  lookAt(x: Vector3 | number, y?: number, z?: number): void {
    this.native.lookAt(x as any, y as any, z as any);
    if (typeof x === 'number') {
      this.target.set(x, y || this.target.y, z || this.target.z);
    } else {
      this.target.copy(x);
    }
  }
}
