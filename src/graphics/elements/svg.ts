import * as THREE from 'three/webgpu';
import { Box3, Group, Mesh, MeshBasicMaterial, MeshBasicNodeMaterial, ShapeGeometry, Vector3 } from 'three/webgpu';
import { SVGLoader, type SvgNode } from '../three/loaders/SVGLoader';
import { colorWith } from '../utils';
import cache from './cache';
import { MeshClipNodeMaterial } from '../three/materials/clipmat';
import { Element, type AttrsLike, type PropsLike } from './element';

export type SvgProps = PropsLike & {
  src: string;
  opacity: number;
  fillColor: ColorType;
  drawFillShapes: boolean;
  fillShapesWireframe: boolean;
  drawStrokes: boolean;
  strokesWireframe: boolean;
  strokeColor: ColorType;
  shapeScale: number;
};

type Attrs = AttrsLike & {
  props: Pick<SvgProps, 'opacity'>;
};

export class Svg extends Element<Group, SvgProps, Attrs> {
  public readonly isSvg = true;
  public readonly root = new Group();
  public readonly fillMaterial: MeshBasicNodeMaterial;
  public readonly subFillMaterials: Array<MeshClipNodeMaterial> = [];
  public readonly strokeMaterial: MeshBasicNodeMaterial;
  public readonly subStrokeMaterials: Array<MeshClipNodeMaterial> = [];
  public readonly size = { width: 0, height: 0 };

  constructor(props?: Partial<SvgProps>) {
    super(new Group(), {
      src: '',
      opacity: 1,
      drawFillShapes: true,
      fillColor: colorWith('#fff'),
      fillShapesWireframe: false,
      drawStrokes: true,
      strokeColor: colorWith('#fff'),
      strokesWireframe: false,
      shapeScale: 1.0,
      ...props
    });
    this.native.add(this.root);

    this.fillMaterial = new MeshBasicNodeMaterial({
      color: this.props.fillColor,
      opacity: this.props.opacity,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      wireframe: this.props.fillShapesWireframe,
      clippingPlanes: []
    });

    this.strokeMaterial = new MeshBasicNodeMaterial({
      color: this.props.strokeColor,
      opacity: this.props.opacity,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      wireframe: this.props.strokesWireframe,
      clippingPlanes: []
    });

    this.parse(this.props.src);
  }

  protected set opacity(value: number) {
    this.fillMaterial.opacity = value;
    this.subFillMaterials.forEach((e) => (e.opacity = value));
    this.strokeMaterial.opacity = value;
    this.subStrokeMaterials.forEach((e) => (e.opacity = value));
  }

  protected set fillColor(value: ColorType) {
    this.fillMaterial.color = value;
    if (typeof value === 'string' && /^(http|https|data):/.test(value)) {
      cache.loadTexture(value).then((e) => {
        if (this.fillMaterial instanceof MeshBasicMaterial) {
          this.fillMaterial.map = e;
          this.subFillMaterials.forEach((ee) => (ee.map = e));
        }
        // fm.lightMap = e;
        this.fillMaterial.needsUpdate = true;
      });
    } else {
      const clr = colorWith(value);
      this.fillMaterial.color = clr;
      this.subFillMaterials.forEach((e) => (e.color = clr));
    }
  }

  protected set strokeColor(value: ColorType) {
    this.strokeMaterial.color = value;
    if (typeof value === 'string' && /^(http|https|data):/.test(value)) {
      cache.loadTexture(value).then((e) => {
        if (this.strokeMaterial instanceof MeshBasicMaterial) {
          this.strokeMaterial.map = e;
          this.subFillMaterials.forEach((ee) => (ee.map = e));
        }
        // fm.lightMap = e;
        this.strokeMaterial.needsUpdate = true;
      });
    } else {
      const clr = colorWith(value);
      this.strokeMaterial.color = clr;
      this.subStrokeMaterials.forEach((e) => (e.color = clr));
    }
  }

  parse(src: string) {
    const loader = new SVGLoader();
    const data = loader.parse(src);
    let renderOrder = 0;

    this.root.clear();
    this.subFillMaterials.forEach((e) => e.dispose());
    this.subFillMaterials.length = 0;
    this.subStrokeMaterials.forEach((e) => e.dispose());
    this.subStrokeMaterials.length = 0;

    const boxies: Array<Box3> = [];
    const box: Pick<Box3, 'min' | 'max'> = { min: new Vector3(100000, 100000, 100000), max: new Vector3(-100000, -100000, -100000) };
    const scale = this.props.shapeScale;

    const trv = (node: typeof data.root, level: number) => {
      let fillMaterial = this.fillMaterial;
      let strokeMaterial = this.strokeMaterial;
      const clip = {
        y: { min: node.position.y - node.viewBox.height, max: node.position.y }
      };
      if (level) {
        fillMaterial = new MeshClipNodeMaterial({ color: this.props.fillColor, opacity: this.props.opacity }, clip);
        fillMaterial.copy(this.fillMaterial);
        this.subFillMaterials.push(fillMaterial);

        strokeMaterial = new MeshClipNodeMaterial({ color: this.props.strokeColor, opacity: this.props.opacity }, clip);
        strokeMaterial.copy(this.strokeMaterial);
        this.subStrokeMaterials.push(strokeMaterial);
      }
      for (const path of node.paths) {
        const fillColor = path.userData!.style.fill;

        if (this.props.drawFillShapes && fillColor !== undefined && fillColor !== 'none') {
          const shapes = SVGLoader.createShapes(path as any);
          for (const shape of shapes) {
            const geometry = new ShapeGeometry(shape);
            geometry.computeBoundingBox();
            const box = this.clipBox(geometry.boundingBox!, node.viewBox);
            boxies.push(box);
            const mesh = new Mesh(geometry, fillMaterial);
            mesh.renderOrder = renderOrder++;
            this.root.add(mesh);
          }
        }

        const strokeColor = path.userData!.style.stroke;

        if (this.props.drawStrokes && strokeColor !== undefined && strokeColor !== 'none') {
          for (const subPath of path.subPaths) {
            const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData!.style);
            if (geometry) {
              geometry.computeBoundingBox();
              const box = this.clipBox(geometry.boundingBox!, node.viewBox);
              boxies.push(box);
              const mesh = new Mesh(geometry, strokeMaterial);
              mesh.renderOrder = renderOrder++;
              this.root.add(mesh);
            }
          }
        }
      }
      node.subs.forEach((e) => trv(e, level + 1));
    };

    trv(data.root, 0);

    boxies.forEach((e) => {
      if (e.min.x < box.min.x) {
        box.min.x = e.min.x;
      }
      if (e.min.y < box.min.y) {
        box.min.y = e.min.y;
      }
      if (e.min.z < box.min.z) {
        box.min.z = e.min.z;
      }
      if (e.max.x > box.max.x) {
        box.max.x = e.max.x;
      }
      if (e.max.y > box.max.y) {
        box.max.y = e.max.y;
      }
      if (e.max.z > box.max.z) {
        box.max.z = e.max.z;
      }
    });

    // const scale = 1 / Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);

    this.root.position.set((scale * (box.max.x + box.min.x)) / -2, (scale * (box.max.y - box.min.y)) / -2, (scale * (box.max.z - box.min.z)) / -2);
    this.root.scale.set(scale, -scale, 1);

    this.size.width = (box.max.x - box.min.x) * scale * this.scale.x;
    this.size.height = (box.max.y - box.min.y) * scale * this.scale.x;
  }

  dispose() {
    super.dispose();

    this.fillMaterial.dispose();
    this.strokeMaterial.dispose();
    this.subFillMaterials.forEach((e) => e.dispose());
    this.subFillMaterials.length = 0;
    this.subStrokeMaterials.forEach((e) => e.dispose());
    this.subStrokeMaterials.length = 0;
  }

  private clipBox(box: Box3, clipRect: SvgNode['viewBox']) {
    const cp = box.clone();

    cp.min.x = Math.max(cp.min.x, clipRect.left);
    cp.min.y = Math.max(cp.min.y, clipRect.bottom);
    cp.max.x = Math.min(cp.max.x, clipRect.left + clipRect.width);
    cp.max.y = Math.min(cp.max.y, clipRect.bottom + clipRect.height);

    return cp;
  }
}
