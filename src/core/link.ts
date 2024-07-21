import { BufferGeometry, Camera, CubicBezierCurve3, Group, Material, NormalBufferAttributes, Scene, Vector2, Vector3, WebGLRenderer } from "three";
import type { LinkLike, Slot } from "../../types/component";
import { Line2 } from 'three/examples/jsm/lines/Line2';

// dots per meter
const LinkLineDensity = 1000;

export class Link extends Line2 implements LinkLike {
  public readonly isLink = true;

  public readonly size = { width: 0, height: 0 };
  public readonly inputs = {};
  public readonly outputs = {};
  public readonly bounds = {};

  protected readonly fromPosition = new Vector3(0);
  protected readonly toPosition = new Vector3(0);

  protected _tmpSize = new Vector2();

  constructor(public readonly from: Slot, public readonly to: Slot) {
    super();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.onBeforeRender = (renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry<NormalBufferAttributes>, material: Material, group: Group) => {
      const { x, y } = renderer.getSize(this._tmpSize);
      if (this.material.resolution.x !== x || this.material.resolution.y !== y) {
        this.material.resolution.set(x, y);
        this.material.uniformsNeedUpdate = true;
      }
    }
  }

  serialize(json?: Json | undefined): Json {
    if (!json) json = {};

    json.inputs = this.inputs;
    json.outputs = this.outputs;
    json.matrix = this.matrix.toArray();

    return json;
  }

  deserialize(json: Json): this {
    Object.assign(this.inputs, json.inputs);
    Object.assign(this.outputs, json.outputs);

    this.matrix.fromArray(json.matrix);

    if (this.matrixAutoUpdate) this.matrix.decompose(this.position, this.quaternion, this.scale);

    this.updatePositions();

    return this;
  }

  private updatePositions() {
    const ctrl1 = this.fromPosition.clone();
    const xd = this.toPosition.x - this.fromPosition.x;
    ctrl1.x += xd * 0.2;
    const ctrl2 = this.toPosition.clone();
    ctrl2.x -= xd * 0.2;
    const curve = new CubicBezierCurve3(this.fromPosition, ctrl1, ctrl2, this.toPosition);
    const dist = Math.abs(this.fromPosition.clone().distanceTo(this.toPosition));
    const points = curve.getPoints(LinkLineDensity * dist);
    this.geometry.setPositions(points.map(it => [it.x, it.y, it.z]).flat());
    this.computeLineDistances();
  }
}