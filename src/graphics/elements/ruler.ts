import { Line2NodeMaterial, type Color, type PerspectiveCamera, } from 'three/webgpu';
import { LineSegments2 } from '../three/webgpu/LineSegments2';
import { Mesh } from './mesh';

export class Ruler extends Mesh<LineSegments2> {
  private _size = { width: 1, height: 1 };
  constructor(
    protected camera: PerspectiveCamera,
    color?: Color
  ) {
    super(new LineSegments2(undefined, new Line2NodeMaterial({ color })), {});

    // 最大400个位置
    const positions = new Array(400 * 12).fill(0);
    this.geometry.setPositions(positions);
    this.geometry.instanceCount = 0;
    this.native.computeLineDistances();
  }

  resize(width: number, height: number) {
    if (this._size.width === width && this._size.height === height) {
      return;
    }
    const top = height / 2;
    const bottom = -top;
    const right = width / 2;
    const left = -right;
    const step = Math.max(width, height) / 200;
    const hcx = Math.floor(right / step);
    const hcy = Math.floor(top / step);
    const positions = new Array((hcx + hcy) * 24).fill(0);
    const len = step / 2;
    const longLen = len * 2;
    let i = 0;
    // 上横向 ->
    for (let x = 0, j = 0; j < hcx; x += step, i += 6, j++) {
      positions[i] = x;
      positions[i + 1] = top;
      positions[i + 3] = x;
      positions[i + 4] = top - (j % 10 ? len : longLen);
    }
    // 上横向 <-
    for (let x = -step, j = 1; j < hcx; x -= step, i += 6, j++) {
      positions[i] = x;
      positions[i + 1] = top;
      positions[i + 3] = x;
      positions[i + 4] = top - (j % 10 ? len : longLen);
    }
    // 下横向 ->
    for (let x = 0, j = 0; j < hcx; x += step, i += 6, j++) {
      positions[i] = x;
      positions[i + 1] = bottom;
      positions[i + 3] = x;
      positions[i + 4] = bottom + (j % 10 ? len : longLen);
    }
    // 下横向 <-
    for (let x = -step, j = 1; j < hcx; x -= step, i += 6, j++) {
      positions[i] = x;
      positions[i + 1] = bottom;
      positions[i + 3] = x;
      positions[i + 4] = bottom + (j % 10 ? len : longLen);
    }
    // 左纵向 ->
    for (let y = 0, j = 0; j < hcy; y += step, i += 6, j++) {
      positions[i] = left;
      positions[i + 1] = y;
      positions[i + 3] = left + (j % 10 ? len : longLen);
      positions[i + 4] = y;
    }
    // 左纵向 <-
    for (let y = -step, j = 1; j < hcy; y -= step, i += 6, j++) {
      positions[i] = left;
      positions[i + 1] = y;
      positions[i + 3] = left + (j % 10 ? len : longLen);
      positions[i + 4] = y;
    }
    // 右纵向 ->
    for (let y = 0, j = 0; j < hcy; y += step, i += 6, j++) {
      positions[i] = right;
      positions[i + 1] = y;
      positions[i + 3] = right - (j % 10 ? len : longLen);
      positions[i + 4] = y;
    }
    // 右纵向 <-
    for (let y = -step, j = 1; j < hcy; y -= step, i += 6, j++) {
      positions[i] = right;
      positions[i + 1] = y;
      positions[i + 3] = right - (j % 10 ? len : longLen);
      positions[i + 4] = y;
    }

    positions.length = i;

    this.native.updatePosition(positions);
  }
}
