import { Object3D, Vector3 } from "three";
import type { Component, LinkLike } from "../../types/component";
import { SlotSize } from "../const";

export class ElementBase<TI extends PropDecorations, TO extends PropDecorations> extends Object3D implements Component<TI, TO> {
  public readonly isElement = true;

  public readonly size = { width: 0, height: 0 };
  public readonly inputs: { [key in keyof TI]?: any; } = {};
  public readonly outputs: { [key in keyof TO]?: any; } = {};
  public readonly bounds: Record<string, LinkLike[]> = {};

  constructor(i?: Partial<TI>, o?: Partial<TO>) {
    super();
    if (i) {
      Object.assign(this.inputs, i);
    }
    if (o) {
      Object.assign(this.outputs, o);
    }
  }

  positionOfInputSolt(name: string): Vector3 {
    const index = Object.keys(this.inputs).findIndex(e => e === name);
    if (index === -1) {
      throw `slot[${name}] not found`;
    }
    const leftTop = this.position.clone();
    leftTop.x -= this.size.width / 2;
    leftTop.y = this.size.height / 2;

    leftTop.x += SlotSize / 2;
    leftTop.y += index * SlotSize + SlotSize / 2;

    return leftTop;
  }

  positionOfOutputSolt(name: string): Vector3 {
    const index = Object.keys(this.outputs).findIndex(e => e === name);
    if (index === -1) {
      throw `slot[${name}] not found`;
    }
    const leftTop = this.position.clone();
    leftTop.x -= this.size.width / 2;
    leftTop.y = this.size.height / 2;

    leftTop.x += SlotSize / 2;
    leftTop.y += index * SlotSize + SlotSize / 2;

    return leftTop;
  }

  serialize(json?: Json | undefined): Json {
    if (!json) json = {};

    json.size = this.size;
    json.outputs = this.outputs;
    json.inputs = this.inputs;
    json.matrix = this.matrix.toArray();

    return json;
  }

  deserialize(json: Json): this {
    Object.assign(this.size, json.size);
    Object.assign(this.inputs, json.inputs);
    Object.assign(this.outputs, json.outputs);

    this.matrix.fromArray(json.matrix);

    if (this.matrixAutoUpdate) this.matrix.decompose(this.position, this.quaternion, this.scale);

    return this;
  }
}