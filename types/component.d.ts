import type { Camera, Object3D, Vector3 } from 'three';

declare interface Component<TI extends PropDecorations, TO extends PropDecorations> extends Object3D {
  size: { width: number; height: number; };
  inputs: { [key in keyof TI]?: any; };
  outputs: { [key in keyof TO]?: any; };
  /** input and output */
  bounds: Record<string, Array<LinkLike>>;

  positionOfInputSolt(name: string): Vector3;
  positionOfOutputSolt(name: string): Vector3;

  serialize(json?: Json): Json;
  deserialize(json: Json): this;

  /** every frame */
  update?(camera: Camera, delta: number, now: number): void;

  onTouch?(x: number, y: number): void;
}

declare type Slot = {
  component: Component<any, any>;
  prop: string;
};

declare interface LinkLike extends Object3D {
  from: Slot;
  to: Slot;

  serialize(json?: Json): Json;
  deserialize(json: Json): this;

  /** every frame */
  update?(camera: Camera, delta: number, now: number): void;
}