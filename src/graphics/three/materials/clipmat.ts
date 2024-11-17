import { MeshBasicNodeMaterial, NodeBuilder, type ShaderNodeObject, type Node } from 'three/webgpu';
import type { MeshBasicNodeMaterialParameters } from 'three/src/materials/nodes/MeshBasicNodeMaterial.js';
import { Fn, float, positionLocal } from 'three/tsl';
import type ClippingNode from 'three/src/nodes/accessors/ClippingNode.js';

export interface ClipArea {
  x?: { min?: number; max?: number };
  y?: { min?: number; max?: number };
}

export class MeshClipNodeMaterial extends MeshBasicNodeMaterial {
  protected clipMinX?: ShaderNodeObject<Node>;
  protected clipMaxX?: ShaderNodeObject<Node>;
  protected clipMinY?: ShaderNodeObject<Node>;
  protected clipMaxY?: ShaderNodeObject<Node>;

  constructor(parameters?: MeshBasicNodeMaterialParameters, clipArea?: ClipArea) {
    super(parameters);
    if (clipArea) {
      if (clipArea.x?.min !== undefined) {
        this.clipMinX = float(clipArea.x.min);
      }
      if (clipArea.x?.max !== undefined) {
        this.clipMaxX = float(clipArea.x.max);
      }
      if (clipArea.y?.min !== undefined) {
        this.clipMinY = float(clipArea.y.min);
      }
      if (clipArea.y?.max !== undefined) {
        this.clipMaxY = float(clipArea.y.max);
      }
    }
  }
  setupClipping(builder: NodeBuilder): ClippingNode | null {
    const rs = super.setupClipping(builder);
    const clip = Fn(() => {
      if (this.clipMinX) {
        positionLocal.x.lessThan(this.clipMinX).discard();
      }
      if (this.clipMaxX) {
        positionLocal.x.greaterThan(this.clipMaxX).discard();
      }
      if (this.clipMinY) {
        positionLocal.y.lessThan(this.clipMinY).discard();
      }
      if (this.clipMaxY) {
        positionLocal.y.greaterThan(this.clipMaxY).discard();
      }
      return undefined as any;
    })();
    builder.stack.add(clip);
    return rs;
  }
}
