import { ExtrudeGeometry, Group, Mesh as Mesh3d, ShapeGeometry, type ExtrudeGeometryOptions } from "three/webgpu";
import { Element, type AttrsLike, type ElementEventMap, type PropsLike } from "./element";
import { Mesh, type MeshAttrs, type MeshProps } from "./mesh";
import { colorWith, materialSet } from "../utils";
import cache from "./cache";

export type Shape2DProps = PropsLike & {
  opacity?: number;
  color?: ColorType;
}

export type ShapeAttrs = AttrsLike & {
  opacity: number;
  color: number;
}


export class Shape2D<F extends Mesh3d<ShapeGeometry> = Mesh3d<ShapeGeometry>, P extends Shape2DProps = Shape2DProps, A extends ShapeAttrs = ShapeAttrs, E extends ElementEventMap = ElementEventMap> extends Element<Group, P, A, E> {
  public fill!: F;

  private _needReshapes = false;
  private _fields = new Set<string>();
  private _fieldsBuilding = false;

  constructor(public readonly fillMaterial: F['material'], props: P) {
    super(new Group(), props);

    this._fieldsBuilding = true;
    this.reshape();
    this._fieldsBuilding = false;
  }

  protected set opacity(value: number) {
    materialSet(this.fillMaterial, (e) => e.opacity = value);
  }

  protected set color(value: ColorType) {
    if (value === 'none' || value === '') {
      this.fill.visible = false;
      return;
    } else {
      this.fill.visible = true;
    }
    const m: any = this.fillMaterial;
    if (typeof value === 'string' && /^(http|https|data):/.test(value)) {
      cache.loadTexture(value).then((map) => {
        if (Array.isArray(m)) {
          m.forEach(e => e.map = map);
        } else {
          m.map = map;
        }
      });
    } else {
      const color = colorWith(value);
      if (Array.isArray(m)) {
        m.forEach(e => e.color = color);
      } else {
        m.color = color;
      }
    }
  }

  onGropGet(k: string) {
    if (!this._fieldsBuilding) {
      return;
    }
    this._fields.add(k);
  }

  onPropSet(k: string, value: any): void {
    if (!this._fields.has(k)) {
      return;
    }
    if (!this._needReshapes) {
      this._needReshapes = true;
      this.delayReshape();
    }
  }

  protected createShapes(): F {
    return new Mesh3d() as any;
  }

  protected reshape() {
    const fill = this.createShapes();

    if (this.fill) {
      const g = fill.geometry;
      fill.copy(this.fill);
      fill.geometry = g;
      this.fill.removeFromParent();
      this.fill.geometry.dispose();
    }
    this.fill = fill;
    this.native.add(fill);
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

export type ShapeProps = MeshProps & {
  opts: ExtrudeGeometryOptions;
};

export class Shape<T extends Mesh3d<ExtrudeGeometry> = Mesh3d<ExtrudeGeometry>, P extends ShapeProps = ShapeProps, A extends MeshAttrs = MeshAttrs, E extends ElementEventMap = ElementEventMap> extends Mesh<T, P, A, E> {
  private _needReshapes = false;
  private _fields = new Set<string>();
  private _fieldsBuilding = false;

  constructor(native: T, props: P) {
    super(native, props);

    this._fieldsBuilding = true;
    this.reshape();
    this._fieldsBuilding = false;
  }

  onPropGet(k: string) {
    if (!this._fieldsBuilding) {
      return;
    }
    this._fields.add(k);
  }

  onPropSet(k: string, value: any): void {
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