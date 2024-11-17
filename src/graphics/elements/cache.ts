/* eslint-disable no-async-promise-executor */
import * as THREE from 'three/webgpu';
import { AudioLoader, TextureLoader, type Texture, type ShapePath, Matrix4, ShapeGeometry, BufferGeometry } from 'three/webgpu';
import * as OpenType from 'opentype.js';
import md5 from 'md5';
import apis from '@/apis';
import net from '@/utils/net';

export interface Glyph {
  native: opentype.Glyph;
  shape?: ShapePath;
  geometrys?: {
    fill: ShapeGeometry;
    outline: BufferGeometry;
  };
}

export interface FontLib {
  native: OpenType.Font;
  glyphs: Record<number, Glyph>;
  ascender: number;
  boundingBox: { yMin: number; xMin: number; yMax: number; xMax: number };
  descender: number;
  familyName: string;
  originalFontInformation: string;
  resolution: number;
  underlinePosition: number;
  underlineThickness: number;
  scale: number;
  scaleM4: Matrix4;
}

class Cache {
  protected texturesCached: Record<string, Promise<Texture> | Texture> = {};
  protected texturesNamed: Record<string, Texture> = {};
  protected textureSets: Record<string, Array<Texture>> = {};
  protected soundsCached: Record<string, Promise<AudioBuffer> | AudioBuffer> = {};
  protected soundsNamed: Record<string, AudioBuffer> = {};

  public fontLib: FontLib | Promise<FontLib> = null as any;

  async free() {
    // only free textures
    for (const it of Object.values(this.texturesCached)) {
      if ((it as any).isTexture) {
        (it as Texture).dispose();
      } else {
        const txt = (await it) as any;
        if (txt?.isTexture) {
          txt.dispose();
        }
      }
    }
    this.texturesCached = {};
    this.texturesNamed = {};
    this.textureSets = {};
    // free font
    this.fontLib = null as any;
  }

  async loadFont(url: string): Promise<FontLib> {
    if (this.fontLib) {
      return this.fontLib;
    }

    let resolve: any;
    this.fontLib = new Promise<FontLib>((res) => {
      resolve = res;
    });

    const buffer = await net.request({ url, responseType: 'arraybuffer' });

    const native = OpenType.parse(buffer);
    const font: FontLib = { native, glyphs: {} } as any;

    const restriction: any = {
      range: null,
      set: null
    };

    const total = native.glyphs.length;

    for (let i = 0; i < total; i++) {
      const glyph = native.glyphs.get(i);
      if (!glyph.unicode) {
        continue;
      }
      let needToExport = true;
      if (restriction.range !== null) {
        needToExport = glyph.unicode >= restriction.range[0] && glyph.unicode <= restriction.range[1];
      }
      if (!needToExport) {
        continue;
      }
      glyph.unicodes.forEach((c) => {
        font.glyphs[c] = { native: glyph };
      });
    }

    font.resolution = native.unitsPerEm || 2048;
    font.scale = window.devicePixelRatio / font.resolution;
    font.scaleM4 = new Matrix4().makeScale(font.scale, font.scale, 1);

    font.ascender = Math.round(native.ascender * font.scale);
    font.boundingBox = {
      yMin: Math.round(native.tables.head.yMin * font.scale),
      xMin: Math.round(native.tables.head.xMin * font.scale),
      yMax: Math.round(native.tables.head.yMax * font.scale),
      xMax: Math.round(native.tables.head.xMax * font.scale)
    };
    font.descender = Math.round(native.descender * font.scale);
    font.familyName = (native.names.fontFamily as any) || 'unknown';
    font.originalFontInformation = native.tables.name as any;
    font.underlinePosition = Math.round(native.tables.post.underlinePosition * font.scale);
    font.underlineThickness = Math.round(native.tables.post.underlineThickness * font.scale);

    this.fontLib = font;

    resolve(font);

    return font;
  }

  async loadTextures(urls: Array<string>, set?: string): Promise<Array<Texture>> {
    if (set && this.textureSets[set]) {
      return this.textureSets[set];
    }
    const txts = await Promise.all(urls.map((e) => this.loadTexture(e)));
    if (set) {
      this.textureSets[set] = txts;
    }
    return txts;
  }
  async loadTexture(url: string): Promise<Texture> {
    const hash = md5(url);
    if (this.texturesCached[hash]) {
      const it = this.texturesCached[hash];
      if ((it as any).isTexture) {
        return it;
      }
      return await it;
    }
    const promise = new Promise<Texture>(async (resolve, reject) => {
      try {
        const texture = await new TextureLoader().loadAsync(url);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false;
        this.texturesCached[hash] = texture;
        const [, name] = url.match(/[/\\]([^/\\]+)$/) || [];
        if (name) {
          this.texturesNamed[name] = texture;
          texture.userData.name = name;
        }
        resolve(texture);
      } catch (e: any) {
        delete this.texturesCached[hash];
        reject(e);
      }
    });
    this.texturesCached[hash] = promise;
    return await promise;
  }
  getTexture(name: string): Texture {
    return this.texturesNamed[name];
  }
  allTextures(set?: string): Array<Texture> {
    return set ? this.textureSets[set] : Object.values(this.texturesNamed);
  }
  async tts(text: string, voice: SpeechSynthesisVoiceNameCN): Promise<AudioBuffer> {
    const hash = md5(`${text}||${voice}`);
    if (this.soundsCached[hash]) {
      const it = this.soundsCached[hash];
      if ((it as any).then) {
        return await it;
      }
      return it;
    }
    const promise = new Promise<AudioBuffer>((resolve, reject) => {
      return apis
        .tts(text, voice)
        .then(async (url: any) => {
          const buffer = await new AudioLoader().loadAsync(url);
          this.soundsCached[hash] = buffer;
          resolve(buffer);
        })
        .catch((e: any) => {
          delete this.soundsCached[hash];
          reject(e);
        });
    });
    this.soundsCached[hash] = promise;
    return await promise;
  }
  async loadSounds(urls: Array<string>) {
    return Promise.all(urls.map((e) => this.loadSound(e)));
  }
  async loadSound(url: string, key?: string) {
    const hash = key || md5(url);
    if (this.soundsCached[hash]) {
      const it = this.soundsCached[hash];
      if ((it as any).then) {
        return await it;
      }
      return it;
    }
    const promise = new Promise<AudioBuffer>(async (resolve, reject) => {
      try {
        const buffer = await new AudioLoader().loadAsync(url);
        this.soundsCached[hash] = buffer;
        const [, name] = url.match(/[/\\]([^/\\]+)$/) || [];
        const kname = key || name;
        if (kname) {
          this.soundsNamed[kname] = buffer;
        }
        resolve(buffer);
      } catch (e: any) {
        delete this.soundsCached[hash];
        reject(e);
      }
    });
    this.soundsCached[hash] = promise;
    return await promise;
  }
  getSound(name: string) {
    return this.soundsNamed[name];
  }
}

export default new Cache();
