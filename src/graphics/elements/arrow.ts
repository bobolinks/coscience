import * as THREE from 'three/webgpu';
import {
  Camera,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  Matrix4,
  MeshBasicNodeMaterial,
  Object3D,
  Scene,
  Vector3,
  type Renderer
} from 'three/webgpu';
import debounce from 'debounce';
import { Line2 } from '../three/webgpu/Line2';
import { colorWith } from '../utils';
import { type Vec3Like } from './element';
import { Mesh, type MeshAttrs, type MeshProps } from './mesh';

type Props = MeshProps & {
  lineWidth: number;
  target: Vector3 | Object3D;
};

type Attrs = MeshAttrs & { target: Vec3Like };

export class Arrow extends Mesh<Line2, Props, Attrs> {
  public readonly isArrow = true;

  protected arrow: THREE.Mesh<CylinderGeometry, MeshBasicNodeMaterial>;

  private _reshape: any;
  private _target: Vector3 = new Vector3();

  constructor(props?: Partial<Props>) {
    super(new Line2(), {
      color: colorWith('#fff'),
      lineWidth: 0.002,
      opacity: 1,
      target: new Vector3(),
      ...props
    });

    this.geometry.setPositions([0, 0, 0, 0, 0, 0]);
    this.geometry.instanceCount = 1;
    this.native.computeLineDistances();
    this.material.worldUnits = true;
    this.material.alphaToCoverage = true;
    this.material.dashed = false;
    this.material.transparent = true;

    const lineWidth = this.props.lineWidth;
    const arrow = new CylinderGeometry(0, lineWidth * 3, lineWidth * 12, 12);
    const m = new Matrix4().makeTranslation(0, -lineWidth * 6, 0);
    arrow.applyMatrix4(m);
    this.arrow = new THREE.Mesh<CylinderGeometry, MeshBasicNodeMaterial>(arrow, new MeshBasicNodeMaterial({ color: this.props.color }));
    this.native.add(this.arrow);

    this._reshape = debounce(() => {
      this.reshape();
    });
    this.lineWidth = this.props.lineWidth;
  }
  protected set color(value: Color) {
    this.material.color = value;
    if (this.arrow) {
      this.arrow.material.color = value;
    }
  }
  protected set lineWidth(value: number) {
    this.material.linewidth = value;
    if (this.arrow) {
      const lineWidth = this.props.lineWidth;
      const arrow = new CylinderGeometry(0, lineWidth * 3, lineWidth * 12, 12);
      const m = new Matrix4().makeTranslation(0, -lineWidth * 6, 0);
      arrow.applyMatrix4(m);
      const attrs = arrow.attributes;
      const normal: Float32BufferAttribute = this.arrow.geometry.attributes.normal as any;
      const position: Float32BufferAttribute = this.arrow.geometry.attributes.position as any;
      const uv: Float32BufferAttribute = this.arrow.geometry.attributes.uv as any;
      normal.copy(attrs.normal as any);
      normal.needsUpdate = true;
      position.copy(attrs.position as any);
      position.needsUpdate = true;
      uv.copy(attrs.uv as any);
      uv.needsUpdate = true;
      arrow.dispose();
    }
  }
  protected get target() {
    return this._target;
  }
  protected set target(value: Vector3 | Object3D) {
    if (value instanceof Vector3) {
      this._target = value;
      this._reshape();
    }
  }

  async reset(p?: Vec3Like) {
    if (p) {
      this.position.set(p.x, p.y, p.z);
    }
    this.props.target = this.position.clone();
  }

  protected applyAnimationExtra(attrs: Attrs) {
    if (attrs.target) {
      let changed = false;
      if (attrs.target.x !== undefined) {
        this._target.x = attrs.target.x;
        changed = true;
      }
      if (attrs.target.y !== undefined) {
        this._target.y = attrs.target.y;
        changed = true;
      }
      if (attrs.target.z !== undefined) {
        this._target.z = attrs.target.z;
        changed = true;
      }
      if (changed) this.reshape();
    }
  }

  private reshape() {
    if (!this.arrow) {
      return;
    }

    const p = this.position;
    const p1 = this._target.clone().sub(p);

    // setPositions
    const instanceStart: InterleavedBufferAttribute = this.geometry.attributes.instanceStart as any;
    const instanceEnd: InterleavedBufferAttribute = this.geometry.attributes.instanceEnd as any;
    const buffer: InstancedInterleavedBuffer = instanceStart.data as any;
    buffer.set([p1.x, p1.y, p1.z], 3);
    instanceStart.needsUpdate = true;
    instanceEnd.needsUpdate = true;

    // computeLineDistances
    const instanceDistanceStart: InterleavedBufferAttribute = this.geometry.attributes.instanceDistanceStart as any;
    const instanceDistanceEnd: InterleavedBufferAttribute = this.geometry.attributes.instanceDistanceEnd as any;
    const instanceDistanceBuffer: InstancedInterleavedBuffer = instanceDistanceStart.data as any;
    instanceDistanceBuffer.set([p.distanceTo(this._target)], 1);
    instanceDistanceStart.needsUpdate = true;
    instanceDistanceEnd.needsUpdate = true;

    this.arrow.position.copy(p1);

    const dir = p1.normalize();

    if (dir.y > 0.99999) {
      this.arrow.quaternion.set(0, 0, 0, 1);
    } else if (dir.y < -0.99999) {
      this.arrow.quaternion.set(1, 0, 0, 0);
    } else {
      const axis = new Vector3();
      axis.set(dir.z, 0, -dir.x).normalize();
      const radians = Math.acos(dir.y);
      this.arrow.quaternion.setFromAxisAngle(axis, radians);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(delta: number, now: number, renderer: Renderer, scene: Scene, camera: Camera): void {
    if (this.props.target instanceof Object3D) {
      if (!this._target.equals(this.props.target.position)) {
        this._target.copy(this.props.target.position);
        this._reshape();
      }
    }
  }
}