import { Camera as Camera3D, PerspectiveCamera as PerspectiveCamera3D, OrthographicCamera as OrthographicCamera3D, Vector3 } from 'three/webgpu';
import { Element, type AttrsLike, type PropsLike, type Vec3Like } from './element';

type CameraAttrs = AttrsLike & { target: Vec3Like; theta: number };

export class Camera<T extends Camera3D = PerspectiveCamera3D, P extends PropsLike = PropsLike, A extends CameraAttrs = CameraAttrs> extends Element<T, P, A> {
  private _initPoint = new Vector3();

  constructor(native: T, props: Required<P>) {
    super(native, props);
  }
  protected applyAnimation(attrs: Partial<A>) {
    if (this.target && attrs.theta !== undefined) {
      this.position.x = this._initPoint.x * Math.cos(attrs.theta) - this._initPoint.z * Math.sin(attrs.theta);
      this.position.z = this._initPoint.x * Math.sin(attrs.theta) + this._initPoint.z * Math.cos(attrs.theta);
      this.lookAt(this.target);
    }
  }
  async lookAround(milliseconds: number): Promise<void> {
    this._initPoint.copy(this.position);
    return this.startAnimation({ theta: Math.PI * 2 } as any, milliseconds);
  }
}

type PerspectiveCameraProps = PropsLike & {
  fov: number;
  aspect: number;
  near: number;
  far: number;
};

export class PerspectiveCamera extends Camera<PerspectiveCamera3D, PerspectiveCameraProps, CameraAttrs & PerspectiveCameraProps> {
  constructor(fov?: number, aspect?: number, near?: number, far?: number) {
    super(new PerspectiveCamera3D(fov, aspect, near, far), { fov, aspect, near, far } as any);
  }
  set aspect(value: number) {
    this.native.aspect = value;
    this.native.updateProjectionMatrix();
  }
  set far(value: number) {
    this.native.far = value;
  }
  set fov(value: number) {
    this.native.fov = value;
  }
  set near(value: number) {
    this.native.near = value;
  }
}

type OrthographicCameraProps = PropsLike & {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
};

export class OrthographicCamera extends Camera<OrthographicCamera3D, OrthographicCameraProps, CameraAttrs & OrthographicCameraProps> {
  constructor(left?: number, right?: number, top?: number, bottom?: number, near?: number, far?: number) {
    super(new OrthographicCamera3D(left, right, top, bottom, near, far), { left, right, top, bottom, near, far } as any);
  }
  set left(value: number) {
    this.native.left = value;
  }
  set right(value: number) {
    this.native.right = value;
  }
  set top(value: number) {
    this.native.top = value;
  }
  set bottom(value: number) {
    this.native.bottom = value;
  }
  set near(value: number) {
    this.native.near = value;
  }
  set far(value: number) {
    this.native.far = value;
  }
}