import { Box3, Group, Vector3, Mesh } from "three/webgpu";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Element, type AttrsLike, type ElementEventMap, type PropsLike } from "./element";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

export type ModelProps = PropsLike & {
  size: number;
};

export class Model<O extends Mesh | Group = Group, P extends ModelProps = ModelProps, A extends AttrsLike = AttrsLike, E extends ElementEventMap = ElementEventMap> extends Element<Group, P, A, E> {
  protected scaleGroup = new Group;
  constructor(protected model: O, props: Required<P>) {
    super(new Group, props);
    this.scaleGroup.add(model);
    this.native.add(this.scaleGroup);

    if (this.props.size && this.props.size !== 1) {
      this.objectAutoSize();
    }
  }

  protected objectAutoSize() {
    const box3Object = new Box3().setFromObject(this.model, true);
    const scale = box3Object.getSize(new Vector3);

    const maxScale = this.props.size / Math.max(scale.x, scale.y, scale.z);
    this.scaleGroup.scale.set(maxScale, maxScale, maxScale);
  }
}
