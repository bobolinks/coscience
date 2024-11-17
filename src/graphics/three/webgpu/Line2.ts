import { LineGeometry } from 'three/examples/jsm/Addons.js';
import { LineSegments2 } from './LineSegments2';
import { InstancedInterleavedBuffer, InterleavedBufferAttribute, Line2NodeMaterial, Vector3 } from 'three/webgpu';

export class Line2 extends LineSegments2 {
  public readonly isLine2 = true;

  constructor(geometry = new LineGeometry(), material = new Line2NodeMaterial({ color: Math.random() * 0xffffff })) {
    super(geometry, material as any);

    (this as any).type = 'Line2';
  }
  updatePosition(array: number[]) {
    // setPositions
    const length = array.length - 3;
    const points = new Float32Array(2 * length);

    for (let i = 0; i < length; i += 3) {
      points[2 * i] = array[i];
      points[2 * i + 1] = array[i + 1];
      points[2 * i + 2] = array[i + 2];

      points[2 * i + 3] = array[i + 3];
      points[2 * i + 4] = array[i + 4];
      points[2 * i + 5] = array[i + 5];
    }
    const instanceStart: InterleavedBufferAttribute = this.geometry.attributes.instanceStart as any;
    const instanceEnd: InterleavedBufferAttribute = this.geometry.attributes.instanceEnd as any;
    const buffer: InstancedInterleavedBuffer = instanceStart.data as any;
    buffer.set(points, 0);
    this.geometry.instanceCount = array.length / 3 - 1;
    instanceStart.needsUpdate = true;
    instanceEnd.needsUpdate = true;

    // computeLineDistances
    const lineDistances = new Array(2 * instanceStart.count);
    const _start = new Vector3();
    const _end = new Vector3();
    for (let i = 0, j = 0, l = instanceStart.count; i < l; i++, j += 2) {
      _start.fromBufferAttribute(instanceStart, i);
      _end.fromBufferAttribute(instanceEnd, i);
      lineDistances[j] = j === 0 ? 0 : lineDistances[j - 1];
      lineDistances[j + 1] = lineDistances[j] + _start.distanceTo(_end);
    }
    const instanceDistanceStart: InterleavedBufferAttribute = this.geometry.attributes.instanceDistanceStart as any;
    const instanceDistanceEnd: InterleavedBufferAttribute = this.geometry.attributes.instanceDistanceEnd as any;
    const instanceDistanceBuffer: InstancedInterleavedBuffer = instanceDistanceStart.data as any;
    instanceDistanceBuffer.set(lineDistances, 0);
    instanceDistanceStart.needsUpdate = true;
    instanceDistanceEnd.needsUpdate = true;
  }
}
