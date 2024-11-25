import * as THREE from 'three/webgpu';
import { Color, Group, Mesh, MeshBasicMaterial, Shape, ShapeGeometry } from 'three/webgpu';
import { LineGeometry, SVGLoader, type GLTF } from 'three/examples/jsm/Addons.js';
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

type ExtractArrayElementType<T> = T extends Array<infer E> ? E : T;

export function colorWith(color: Color | number | string): Color {
  if (typeof color === 'object') {
    return color;
  } else if (typeof color === 'number') {
    return new Color(color);
  } else if (color === 'none') {
    return new Color();
  }
  return new Color().setStyle(color); //.convertSRGBToLinear();
}

export function materialSet<T extends THREE.Material | THREE.Material[] = THREE.Material>(m: T, cb: (m: ExtractArrayElementType<T>) => void) {
  const ar = Array.isArray(m) ? m : [m];
  ar.forEach(cb);
}

export async function loadSvg(url: string, drawFillShapes?: boolean, fillShapesWireframe?: boolean, drawStrokes?: boolean, strokesWireframe?: boolean): Promise<Group> {
  const loader = new SVGLoader();
  const data = await loader.loadAsync(url);

  const group = new Group();
  group.scale.multiplyScalar(0.25);
  group.scale.y *= -1;

  let renderOrder = 0;

  for (const path of data.paths) {
    const fillColor = path.userData!.style.fill;

    if (drawFillShapes && fillColor !== undefined && fillColor !== 'none') {
      const material = new MeshBasicMaterial({
        color: new Color().setStyle(fillColor),
        opacity: path.userData!.style.fillOpacity,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        wireframe: fillShapesWireframe
      });

      const shapes = SVGLoader.createShapes(path as any);

      for (const shape of shapes) {
        const geometry = new ShapeGeometry(shape);
        const mesh = new Mesh(geometry, material);
        mesh.renderOrder = renderOrder++;

        group.add(mesh);
      }
    }

    const strokeColor = path.userData!.style.stroke;

    if (drawStrokes && strokeColor !== undefined && strokeColor !== 'none') {
      const material = new MeshBasicMaterial({
        color: new Color().setStyle(strokeColor),
        opacity: path.userData!.style.strokeOpacity,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        wireframe: strokesWireframe
      });

      for (const subPath of path.subPaths) {
        const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData!.style);
        if (geometry) {
          const mesh = new Mesh(geometry, material);
          mesh.renderOrder = renderOrder++;
          group.add(mesh);
        }
      }
    }
  }
  return group;
}

export function createRoundShape(w: number, h: number, radius: number) {
  const shape = new Shape();
  const ww = w / 2;
  const hh = h / 2;
  shape.moveTo(-ww + radius, hh);
  shape.lineTo(ww - radius, hh);
  shape.quadraticCurveTo(ww, hh, ww, hh - radius);
  shape.lineTo(ww, -hh + radius);
  shape.quadraticCurveTo(ww, -hh, ww - radius, -hh);
  shape.lineTo(-ww + radius, -hh);
  shape.quadraticCurveTo(-ww, -hh, -ww, -hh + radius);
  shape.lineTo(-ww, hh - radius);
  shape.quadraticCurveTo(-ww, hh, -ww + radius, hh);

  return shape;
}

export function createGeometryFromShape(shape: Shape, w: number, h: number) {
  const ww = w / 2;
  const hh = h / 2;
  const geo = new ShapeGeometry(shape);
  // update uv
  const uv = geo.attributes.uv.array as Float32Array;
  for (let i = 0; i < uv.length; i++) {
    const v = uv[i];
    if (i % 2 === 0) {
      // is u
      uv[i] = (v + ww) / w;
    } else {
      uv[i] = (v + hh) / h;
    }
  }
  return geo;
}
export function createRoundRect(w: number, h: number, border: number, radius: number) {
  const outSideShape = createRoundShape(w, h, radius);
  const insideShape = createRoundShape(w - border * 2, h - border * 2, radius);

  const outsideGeo = createGeometryFromShape(outSideShape, w, h);
  const insideGeo = createGeometryFromShape(insideShape, w - border * 2, h - border * 2);

  const inside = new Mesh<ShapeGeometry, MeshBasicMaterial>(insideGeo);

  inside.position.z += 0.001;

  return new Mesh<ShapeGeometry, MeshBasicMaterial>(outsideGeo).add(inside);
}

export function createGeometries(w: number, h: number, radius: number): { fill: ShapeGeometry; stroke: LineGeometry; } {
  const shape = new Shape();
  const ww = w / 2;
  const hh = h / 2;
  shape.moveTo(-ww + radius, hh);
  shape.lineTo(ww - radius, hh);
  shape.quadraticCurveTo(ww, hh, ww, hh - radius);
  shape.lineTo(ww, -hh + radius);
  shape.quadraticCurveTo(ww, -hh, ww - radius, -hh);
  shape.lineTo(-ww + radius, -hh);
  shape.quadraticCurveTo(-ww, -hh, -ww, -hh + radius);
  shape.lineTo(-ww, hh - radius);
  shape.quadraticCurveTo(-ww, hh, -ww + radius, hh);

  // const points = [new THREE.Vector2(0, 0), new THREE.Vector2(0.5, 0.5), new THREE.Vector2(1, 1)];
  const points = shape.getPoints();
  const fill = new ShapeGeometry(shape);
  const stroke = new LineGeometry().setPositions(points.map((e) => [e.x, e.y, 0]).flat());

  // update uv
  const uv = fill.attributes.uv.array as Float32Array;
  for (let i = 0; i < uv.length; i++) {
    const v = uv[i];
    if (i % 2 === 0) {
      // is u
      uv[i] = (v + ww) / w;
    } else {
      uv[i] = (v + hh) / h;
    }
  }

  return { fill, stroke };
}

export function numberScale(value: string | number, ref: number): number {
  if (typeof value === 'number') {
    return value * ref;
  } else if (value.endsWith('%')) {
    return ref * Number.parseFloat(value) * 0.01;
  } else {
    return Number.parseFloat(value) * ref;
  }
}

export function loadGltf(file: string): Promise<GLTF> {
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  return loader.loadAsync(file);
}