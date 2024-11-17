import { Line2NodeMaterial, type Mesh as Mesh3d } from "three/webgpu";
import { type ElementEventMap } from "./element";
import { Mesh, type MeshAttrs, type MeshProps } from "./mesh";
import { Line2 } from "../three/webgpu/Line2";
import { colorWith } from "../utils";

export type ShapeProps = MeshProps & {
  borderColor: ColorType;
  borderWidth: number;
}

export class Shape<T extends Mesh3d = Mesh3d, P extends ShapeProps = ShapeProps, A extends MeshAttrs = MeshAttrs, E extends ElementEventMap = ElementEventMap> extends Mesh<T, P, A, E> {
  protected border: Line2;

  private _needReshapes = false;
  private _fields = new Set<string>();
  private _fieldsBuilding = false;

  constructor(native: T, props: Required<P>) {
    super(native, props);
    this.border = new Line2(undefined, new Line2NodeMaterial({ opacity: this.props.opacity, linewidth: this.props.borderWidth, color: colorWith(this.props.borderColor) }));
    this.border.scale.set(1, 1, 1);
    this.border.position.z += 0.001;
    this.border.material.worldUnits = false;
    this.border.material.transparent = true;
    this.native.add(this.border);

    this._fieldsBuilding = true;
    this.reshape();
    this._fieldsBuilding = false;
  }

  protected set opacity(value: number) {
    if (Array.isArray(this.material)) {
      this.material.forEach(e => e.opacity = value);
    } else {
      this.material.opacity = value;
    }
    this.border.material.opacity = value;
  }

  protected set borderColor(value: ColorType) {
    this.border.material.color = colorWith(value);
  }
  protected set borderWidth(value: number) {
    this.border.material.lineWidth = value;
  }

  propGet(k: string) {
    if (!this._fieldsBuilding) {
      return;
    }
    this._fields.add(k);
  }

  propSet(k: string, value: any): void {
    if (!this._fields.has(k)) {
      return;
    }
    if (!this._needReshapes) {
      this._needReshapes = true;
      this.delayReshape();
    }
  }

  protected reshape() {
    // do nothings
  }

  private delayReshape() {
    setTimeout(() => {
      if (this._needReshapes) {
        this._needReshapes = false;
        this.reshape();
      }
    });
  }
}