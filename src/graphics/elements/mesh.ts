import type { Mesh as Mesh3d } from "three/webgpu";
import { Element, type AttrsLike, type ElementEventMap, type PropsLike } from "./element";
import cache from "./cache";
import { colorWith } from "../utils";

export type MeshProps = PropsLike & {
  opacity: number;
  color: ColorType;
}

export type MeshAttrs = AttrsLike & {
  opacity: number;
  color: number;
}

export class Mesh<T extends Mesh3d = Mesh3d, P extends MeshProps = MeshProps, A extends MeshAttrs = MeshAttrs, E extends ElementEventMap = ElementEventMap> extends Element<T, P, A, E> {
  get material(): T['material'] {
    return this.native.material;
  }
  get geometry(): T['geometry'] {
    return this.native.geometry;
  }

  protected set opacity(value: number) {
    if (Array.isArray(this.material)) {
      this.material.forEach(e => e.opacity = value);
    } else {
      this.material.opacity = value;
    }
  }

  protected set color(value: ColorType) {
    const m: any = this.material;
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
}