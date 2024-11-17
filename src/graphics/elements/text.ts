import * as THREE from 'three/webgpu';
import { BufferGeometry, Color, Group, LineBasicNodeMaterial, LineSegments, Mesh, MeshBasicNodeMaterial, ShapeGeometry, ShapePath } from 'three/webgpu';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LineGeometry } from 'three/examples/jsm/Addons.js';
import debounce from 'debounce';
import { Rect, type RectProps } from './rect';
import type { FontLib, Glyph } from './cache';
import cache from './cache';
import { colorWith, numberScale } from '../utils';

type TextProps = {
  // === Text layout properties: === //

  /**
   * @member {string} text
   * The string of text to be rendered.
   */
  text: string;
  /**
   * @member {number|string} anchorX
   * Defines the horizontal position in the text block that should line up with the local origin.
   * Can be specified as a numeric x position in local units, a string percentage of the total
   * text block width e.g. `'25%'`, or one of the following keyword strings: 'left', 'center',
   * or 'right'.
   */
  // anchorX: number | 'left' | 'center' | 'right' | string;
  /**
   * @member {number|string} anchorX
   * Defines the vertical position in the text block that should line up with the local origin.
   * Can be specified as a numeric y position in local units (note: down is negative y), a string
   * percentage of the total text block height e.g. `'25%'`, or one of the following keyword strings:
   * 'top', 'top-baseline', 'top-cap', 'top-ex', 'middle', 'bottom-baseline', or 'bottom'.
   */
  // anchorY: number | 'top' | 'top-baseline' | 'top-cap' | 'top-ex' | 'middle' | 'bottom-baseline' | 'bottom' | string;
  /**
   * @member {number} curveRadius
   * Defines a cylindrical radius along which the text's plane will be curved. Positive numbers put
   * the cylinder's centerline (oriented vertically) that distance in front of the text, for a concave
   * curvature, while negative numbers put it behind the text for a convex curvature. The centerline
   * will be aligned with the text's local origin; you can use `anchorX` to offset it.
   *
   * Since each glyph is by default rendered with a simple quad, each glyph remains a flat plane
   * internally. You can use `glyphGeometryDetail` to add more vertices for curvature inside glyphs.
   */
  // curveRadius: number;
  /**
   * @member {string} direction
   * Sets the base direction for the text. The default value of "auto" will choose a direction based
   * on the text's content according to the bidi spec. A value of "ltr" or "rtl" will force the direction.
   */
  // direction: 'auto' | 'ltr' | 'rtl';
  /**
   * @member {string} font
   * URL of a custom font to be used. Font files can be in .ttf, .otf, or .woff (not .woff2) formats.
   * Defaults to the Roboto font loaded from Google Fonts.
   */
  // font: string;
  /**
   * @member {number} fontSize
   * The size at which to render the font in local units; corresponds to the em-box height
   * of the chosen `font`.
   */
  fontSize: number;
  /**
   * @member {number} letterSpacing
   * Sets a uniform adjustment to spacing between letters after kerning is applied. Positive
   * numbers increase spacing and negative numbers decrease it.
   */
  // letterSpacing: number;
  /**
   * @member {number|string} lineHeight
   * Sets the height of each line of text, as a multiple of the `fontSize`. Defaults to 'normal'
   * which chooses a reasonable height based on the chosen font's ascender/descender metrics.
   */
  lineHeight: number | string;
  /**
   * @member {number} maxWidth
   * The maximum width of the text block, above which text may start wrapping according to the
   * `whiteSpace` and `overflowWrap` properties.
   */
  maxWidth: number;
  /**
   * @member {string} overflowWrap
   * Defines how text wraps if the `whiteSpace` property is `normal`. Can be either `'normal'`
   * to break at whitespace characters, or `'break-word'` to allow breaking within words.
   * Defaults to `'normal'`.
   */
  overflowWrap: 'normal' | 'break-word';
  /**
   * @member {string} textAlign
   * The horizontal alignment of each line of text within the overall text bounding box.
   */
  // textAlign: 'left' | 'right' | 'center' | 'justify';
  textAlign: 'left' | 'right' | 'center';
  /**
   * @member {number} textIndent
   * Indentation for the first character of a line; see CSS `text-indent`.
   */
  // textIndent: number;
  /**
   * @member {string} whiteSpace
   * Defines whether text should wrap when a line reaches the `maxWidth`. Can
   * be either `'normal'` (the default), to allow wrapping according to the `overflowWrap` property,
   * or `'nowrap'` to prevent wrapping. Note that `'normal'` here honors newline characters to
   * manually break lines, making it behave more like `'pre-wrap'` does in CSS.
   */
  // whiteSpace: 'normal' | 'nowrap';

  // === Presentation properties: === //

  /**
   * @member {string|number|THREE.Color} color
   * This is a shortcut for setting the `color` of the text's material. You can use this
   * if you don't want to specify a whole custom `material`. Also, if you do use a custom
   * `material`, this color will only be used for this particuar Text instance, even if
   * that same material instance is shared across multiple Text objects.
   */
  color: string | number | THREE.Color;
  /**
   * @member {number|string} outlineWidth
   * WARNING: This API is experimental and may change.
   * The width of an outline/halo to be drawn around each text glyph using the `outlineColor` and `outlineOpacity`.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g.
   * `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`, which means
   * no outline will be drawn unless an `outlineOffsetX/Y` or `outlineBlur` is set.
   */
  outlineWidth: number | string;
  /**
   * @member {string|number|THREE.Color} outlineColor
   * WARNING: This API is experimental and may change.
   * The color of the text outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
   * Defaults to black.
   */
  outlineColor: string | number | THREE.Color;
  /**
   * @member {number} outlineOpacity
   * WARNING: This API is experimental and may change.
   * The opacity of the outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
   * Defaults to `1`.
   */
  outlineOpacity: number;
  /**
   * @member {number|string} outlineBlur
   * WARNING: This API is experimental and may change.
   * A blur radius applied to the outer edge of the text's outline. If the `outlineWidth` is
   * zero, the blur will be applied at the glyph edge, like CSS's `text-shadow` blur radius.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g.
   * `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`.
   */
  // outlineBlur: number | string;
  /**
   * @member {number|string} outlineOffsetX
   * WARNING: This API is experimental and may change.
   * A horizontal offset for the text outline.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
   * which is treated as a percentage of the `fontSize`. Defaults to `0`.
   */
  // outlineOffsetX: number | string;
  /**
   * @member {number|string} outlineOffsetY
   * WARNING: This API is experimental and may change.
   * A vertical offset for the text outline.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
   * which is treated as a percentage of the `fontSize`. Defaults to `0`.
   */
  // outlineOffsetY: number | string;

  /**
   * @member {number|string} strokeWidth
   * WARNING: This API is experimental and may change.
   * The width of an inner stroke drawn inside each text glyph using the `strokeColor` and `strokeOpacity`.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
   * which is treated as a percentage of the `fontSize`. Defaults to `0`.
   */
  // strokeWidth: number | string;

  /**
   * @member {string|number|THREE.Color} strokeColor
   * WARNING: This API is experimental and may change.
   * The color of the text stroke, if `strokeWidth` is greater than zero. Defaults to gray.
   */
  // strokeColor: string | number | THREE.Color;
  /**
   * @member {number} strokeOpacity
   * WARNING: This API is experimental and may change.
   * The opacity of the stroke, if `strokeWidth` is greater than zero. Defaults to `1`.
   */
  // strokeOpacity: number;

  /**
   * @member {number} fillOpacity
   * WARNING: This API is experimental and may change.
   * The opacity of the glyph's fill from 0 to 1. This behaves like the material's `opacity` but allows
   * giving the fill a different opacity than the `strokeOpacity`. A fillOpacity of `0` makes the
   * interior of the glyph invisible, leaving just the `strokeWidth`. Defaults to `1`.
   */
  // fillOpacity: number;

  /**
   * @member {number} depthOffset
   * This is a shortcut for setting the material's `polygonOffset` and related properties,
   * which can be useful in preventing z-fighting when this text is laid on top of another
   * plane in the scene. Positive numbers are further from the camera, negatives closer.
   */
  // depthOffset: number;

  /**
   * @member {Array<number>} clipRect
   * If specified, defines a `[minX, minY, maxX, maxY]` of a rectangle outside of which all
   * pixels will be discarded. This can be used for example to clip overflowing text when
   * `whiteSpace='nowrap'`.
   */
  // clipRect: Array<number>;

  /**
   * @member {string} orientation
   * Defines the axis plane on which the text should be laid out when the mesh has no extra
   * rotation transform. It is specified as a string with two axes: the horizontal axis with
   * positive pointing right, and the vertical axis with positive pointing up. By default this
   * is '+x+y', meaning the text sits on the xy plane with the text's top toward positive y
   * and facing positive z. A value of '+x-z' would place it on the xz plane with the text's
   * top toward negative z and facing positive y.
   */
  // orientation: string;

  /**
   * @member {number} glyphGeometryDetail
   * Controls number of vertical/horizontal segments that make up each glyph's rectangular
   * plane. Defaults to 1. This can be increased to provide more geometrical detail for custom
   * vertex shader effects, for example.
   */
  // glyphGeometryDetail: number;

  /**
   * @member {number|null} sdfGlyphSize
   * The size of each glyph's SDF (signed distance field) used for rendering. This must be a
   * power-of-two number. Defaults to 64 which is generally a good balance of size and quality
   * for most fonts. Larger sizes can improve the quality of glyph rendering by increasing
   * the sharpness of corners and preventing loss of very thin lines, at the expense of
   * increased memory footprint and longer SDF generation time.
   */
  // sdfGlyphSize: number | null;

  /**
   * @member {boolean} gpuAccelerateSDF
   * When `true`, the SDF generation process will be GPU-accelerated with WebGL when possible,
   * making it much faster especially for complex glyphs, and falling back to a JavaScript version
   * executed in web workers when support isn't available. It should automatically detect support,
   * but it's still somewhat experimental, so you can set it to `false` to force it to use the JS
   * version if you encounter issues with it.
   */
  // gpuAccelerateSDF: boolean;
};

const defaultProps: TextProps = {
  text: '',
  // anchorX: 'center',
  // anchorY: 'middle',
  fontSize: 0.01,
  // letterSpacing: 0.01,
  lineHeight: '100%',
  maxWidth: 1,
  overflowWrap: 'normal',
  textAlign: 'center',
  // textIndent: 0,
  // whiteSpace: 'normal',
  color: '#000',
  outlineWidth: '12%',
  outlineColor: '#888',
  outlineOpacity: 0.1
  // outlineOffsetX: 0,
  // outlineOffsetY: 0
};

const charCodeAsk = '?'.charCodeAt(0);

type CharLoc = {
  g: Glyph;
  x: number;
  y: number;
};

type Props = TextProps & RectProps & {
  background: ColorType;
};

export class Text extends Rect<Props> {
  private _sync: any;
  private _needSync = true;

  protected fill: Mesh<BufferGeometry, MeshBasicNodeMaterial>;
  protected outline: LineSegments<BufferGeometry, LineBasicNodeMaterial>;
  protected root = new Group();

  public readonly textSize = { width: 0, height: 0 };

  constructor(props?: Partial<Props>) {
    super({ ...defaultProps, ...props });

    this.native.add(this.root);

    this.fill = new Mesh(
      new BufferGeometry(),
      new MeshBasicNodeMaterial({
        transparent: true,
        side: THREE.DoubleSide
      })
    );
    this.fill.position.z = 0.0001;
    this.root.add(this.fill);
    this.outline = new LineSegments(
      new LineGeometry(),
      new LineBasicNodeMaterial({
        transparent: true,
        side: THREE.DoubleSide
      })
    );
    this.root.add(this.outline);

    this._sync = debounce(() => {
      this.sync();
    });

    this._sync();

    this.reset();
  }
  protected set text(value: string) {
    this._needSync = true;
    if (this._sync) this._sync();
  }
  protected set fontSize(value: number) {
    if (this.root) {
      this.root.scale.set(value, value, 1);
    }
  }
  protected set lineHeight(value: number) {
    this._needSync = true;
    if (this._sync) this._sync();
  }
  protected set maxWidth(value: number) {
    this._needSync = true;
    if (this._sync) this._sync();
  }
  protected set overflowWrap(value: number) {
    this._needSync = true;
    if (this._sync) this._sync();
  }
  protected set color(value: Color) {
    if (this.fill) this.fill.material.color = value;
  }
  protected set outlineWidth(value: number | string) {
    if (this.outline) this.outline.material.linewidth = numberScale(value, this.props.fontSize);
  }
  protected set outlineColor(value: Color) {
    if (this.outline) this.outline.material.color = value;
  }
  protected set opacity(value: number) {
    this.material.opacity = value;
    if (this.fill) this.fill.material.opacity = value;
  }
  protected set outlineOpacity(value: number) {
    if (this.outline) this.outline.material.opacity = value;
  }
  protected set textAlign(value: TextProps['textAlign']) {
    if (!this.outline) {
      return;
    }
    if (value === 'center') {
      this.fill.position.x = 0;
    } else if (value === 'left') {
      const diff = this.props.width / 2 - this.textSize.width / 2 - this.props.fontSize / 2;
      this.fill.position.x = -diff;
    } else {
      const diff = this.props.width / 2 - this.textSize.width / 2 - this.props.fontSize / 2;
      this.fill.position.x = diff;
    }
  }
  protected set background(value: ColorType) {
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
  reset() {
    this.fontSize = this.props.fontSize;
    this.color = colorWith(this.props.color);
    this.outlineWidth = this.props.outlineWidth;
    this.outlineColor = colorWith(this.props.outlineColor);
    this.outlineOpacity = this.props.outlineOpacity;
    this.textAlign = this.props.textAlign;
  }
  sync() {
    if (!this._needSync) {
      return;
    }
    this._needSync = false;

    if (!this.props.text) {
      this.fill.geometry.drawRange.count = 0;
      this.outline.geometry.drawRange.count = 0;
      return;
    }

    const chars = Array.from(this.props.text);
    const lib: FontLib = cache.fontLib as any;

    const lineHeight = numberScale(this.props.lineHeight, lib.boundingBox.yMax - lib.boundingBox.yMin + lib.underlineThickness);
    const maxWidth = Math.min(this.props.maxWidth, this.props.width);
    const maxWidthReal = this.props.overflowWrap === 'break-word' ? maxWidth / this.props.fontSize : undefined;

    let offsetX = 0;
    let offsetY = 0;
    let maxOffsetX = 0;

    const glyphs: Array<CharLoc> = [];

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];

      if (char === '\n') {
        offsetX = 0;
        offsetY -= lineHeight;
      } else {
        const g = this.genGeo(lib, char);
        glyphs.push({
          x: offsetX,
          y: offsetY,
          g
        });
        const width = g.native.advanceWidth || 1;
        offsetX += width * lib.scale;
        if (maxWidthReal && offsetX >= maxWidthReal && (char === ' ' || /[\u4E00-\u9FA5]/.test(char))) {
          offsetX = 0;
          offsetY -= lineHeight;
        }
        if (maxOffsetX < offsetX) {
          maxOffsetX = offsetX;
        }
      }
    }

    this.textSize.width = maxOffsetX * this.props.fontSize;
    this.textSize.height = (lineHeight - offsetY) * this.props.fontSize;
    this.textAlign = this.props.textAlign;

    const fillGeos: ShapeGeometry[] = glyphs.map((it) => it.g.geometrys!.fill.clone().translate(it.x, it.y, 0)) as any;
    const fill = mergeGeometries(fillGeos);
    fillGeos.forEach((e) => e.dispose());
    const lineGeos = glyphs.filter((it) => it.g.geometrys!.outline.attributes.position?.array.length).map((it) => it.g.geometrys!.outline.clone().translate(it.x, it.y, 0));
    const outline = mergeGeometries(lineGeos);
    lineGeos.forEach((e) => e.dispose());
    if (!fill || !outline) {
      throw 'error';
    }

    fill.computeBoundingBox();

    const box = fill.boundingBox as THREE.Box3;
    const center = box.getCenter(new THREE.Vector3());

    const m = new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z);
    fill.applyMatrix4(m);
    outline.applyMatrix4(m);

    const fillNew = new Mesh(fill, this.fill.material);
    fillNew.matrix.copy(this.fill.matrix);
    fillNew.matrix.decompose(fillNew.position, fillNew.quaternion, fillNew.scale);
    const outlineNew = new LineSegments(outline, this.outline.material);
    outlineNew.matrix.copy(this.outline.matrix);
    outlineNew.matrix.decompose(fillNew.position, fillNew.quaternion, fillNew.scale);

    this.fill.geometry.dispose();
    this.outline.geometry.dispose();

    this.fill.removeFromParent();
    this.outline.removeFromParent();

    this.fill = fillNew;
    this.root.add(fillNew);
    this.outline = outlineNew;
    this.root.add(outlineNew);
  }

  private genGeo(lib: FontLib, char: string): Glyph {
    const glyph = lib.glyphs[char.charCodeAt(0)] || lib.glyphs[charCodeAsk];

    if (glyph.geometrys) {
      return glyph;
    }

    const path = glyph.shape || new ShapePath();
    if (!glyph.shape) {
      glyph.shape = path;
      for (const command of glyph.native.path.commands) {
        const type = command.type;
        if (type === 'M') {
          path.moveTo(command.x, command.y);
        } else if (type === 'L') {
          path.lineTo(command.x, command.y);
        } else if (type === 'Q') {
          path.quadraticCurveTo(command.x1, command.y1, command.x, command.y);
        } else if (type === 'C') {
          path.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y);
        }
      }
    }
    const shapes = path.toShapes(false);

    const fill = new ShapeGeometry(shapes, 3);

    fill.applyMatrix4(lib.scaleM4);

    // create fontOutline
    const holeShapes: any = [];
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (shape.holes && shape.holes.length > 0) {
        for (let j = 0; j < shape.holes.length; j++) {
          const hole = shape.holes[j];
          holeShapes.push(hole);
        }
      }
    }
    shapes.push(...holeShapes);
    const geos = shapes
      .map((shape) => {
        const points = shape.getPoints();
        const geometry = new BufferGeometry().setFromPoints(points);
        const pc = geometry.attributes.position?.array.length / 3;
        if (!pc) {
          return undefined;
        }
        const idx = [];
        for (let index = 1; index < pc; index++) {
          idx.push(index - 1, index);
        }
        geometry.setIndex(idx);
        geometry.applyMatrix4(lib.scaleM4);
        return geometry;
      })
      .filter((e) => e);

    const outline = geos.length ? mergeGeometries(geos as any) : new BufferGeometry();
    glyph.geometrys = { fill, outline };

    return glyph;
  }
}
