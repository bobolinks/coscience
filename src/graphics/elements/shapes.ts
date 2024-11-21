import { ExtrudeGeometry, ShapePath, type Mesh as Mesh3D, Shape as Shape3D, Path, Matrix4 } from "three/webgpu";
import { Shape, type ShapeProps } from "./shape";
import type { Vec3Like } from "./element";

export class ShapeTriangle extends Shape<Mesh3D<ExtrudeGeometry>, ShapeProps & { vec1: Vec3Like; vec2: Vec3Like; vec3: Vec3Like; }> {
  protected reshape() {
    const shape = new Shape3D();

    const { vec1, vec2, vec3 } = this.props;

    shape.moveTo(vec1.x, vec1.y);
    shape.lineTo(vec2.x, vec2.y);
    shape.lineTo(vec3.x, vec3.y);
    shape.lineTo(vec1.x, vec1.y);

    const geo = new ExtrudeGeometry([shape], this.props.opts);
    geo.computeBoundingBox();
    this.geometry.dispose();
    this.native.geometry = geo;
  }
}

export class ShapeSquare extends Shape<Mesh3D<ExtrudeGeometry>, ShapeProps & { size: number; }> {
  protected reshape() {
    const shape = new Shape3D();
    const { size } = this.props;

    shape.moveTo(0, 0);
    shape.lineTo(size, 0);
    shape.lineTo(size, size);
    shape.lineTo(0, size);
    shape.lineTo(0, 0);

    const geo = new ExtrudeGeometry([shape], this.props.opts);
    geo.computeBoundingBox();
    this.geometry.dispose();
    this.native.geometry = geo;
  }
}

export class ShapeRounded extends Shape<Mesh3D<ExtrudeGeometry>, ShapeProps & { width: number; height: number; radius: number; }> {
  protected reshape() {
    const shape = new Shape3D();

    const { width, height, radius } = this.props;

    shape.moveTo(0, radius);
    shape.lineTo(0, height - radius);
    shape.quadraticCurveTo(0, height, radius, height);
    shape.lineTo(0 + width - radius, height);
    shape.quadraticCurveTo(width, height, width, height - radius);
    shape.lineTo(0 + width, radius);
    shape.quadraticCurveTo(width, 0, width - radius, 0);
    shape.lineTo(radius, 0);
    shape.quadraticCurveTo(0, 0, 0, radius);

    const geo = new ExtrudeGeometry([shape], this.props.opts);
    geo.computeBoundingBox();
    this.geometry.dispose();
    this.native.geometry = geo;
  }
}

export class ShapeCircle extends Shape<Mesh3D<ExtrudeGeometry>, ShapeProps & { radius: number; }> {
  protected reshape() {
    const shape = new Shape3D();
    const { radius } = this.props;

    shape.moveTo(radius, 0)
      .absarc(0, 0, radius, 0, Math.PI * 2, false);

    const geo = new ExtrudeGeometry([shape], this.props.opts);
    const m4 = new Matrix4();
    m4.makeRotationX(Math.PI / 2);
    geo.applyMatrix4(m4);
    geo.computeBoundingBox();
    this.geometry.dispose();
    this.native.geometry = geo;
  }
}

export class ShapeArc extends Shape<Mesh3D<ExtrudeGeometry>, ShapeProps & { radius: number; innerRadius: number; }> {
  protected reshape() {
    const shape = new Shape3D();

    const { radius, innerRadius } = this.props;

    shape.moveTo(radius, 0)
      .absarc(0, 0, radius, 0, Math.PI * 2, false);

    const holePath = new Path()
      .moveTo(innerRadius, 0)
      .absarc(0, 0, innerRadius, 0, Math.PI * 2, true);

    shape.holes.push(holePath);

    const geo = new ExtrudeGeometry([shape], this.props.opts);
    geo.computeBoundingBox();
    this.geometry.dispose();
    this.native.geometry = geo;
  }
}