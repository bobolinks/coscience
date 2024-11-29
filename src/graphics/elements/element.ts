
import { Tween, Group, Easing } from '@tweenjs/tween.js';
import { EventEmitter } from '@/utils/events';
import { Vector3, type Camera, type Object3D, type Renderer, type Scene, type Vector2 } from 'three/webgpu';
import { getPropertyDescriptor, propsProxy } from './props';

export const defaultAnimationGroup: Group = new Group();

export type Vec3Like = { x: number; y: number; z: number; };
export type PropsLike = {
  touchable?: boolean;
  dragable?: boolean;
};
export type AttrsLike = {
  position: Vec3Like;
  scale: Vec3Like;
  rotation: Vec3Like;
  target: Vec3Like; // look at
};

type AnimationTask<T> = {
  attrs: Partial<T>;
  time?: number;
  resolve: any;
  reject: any;
  tween?: Tween<any>;
};

export type ElementEventMap = {
  tap: Vector2;
}

let EIDAutoInc = 1;

export class Element<T extends Object3D = Object3D, P extends PropsLike = PropsLike, A extends AttrsLike = AttrsLike, E extends ElementEventMap = ElementEventMap> extends EventEmitter<E> {
  public readonly isElement = true;
  public readonly id = EIDAutoInc++;
  public readonly props: P;
  public readonly children: Element[] = [];
  public readonly parent: Element | undefined;

  protected target?: Vector3;

  private aniCur: AnimationTask<A> | undefined;
  private aniQue: Array<AnimationTask<A>> = [];

  constructor(public readonly native: T, props: P) {
    super();
    this.props = propsProxy({ touchable: false, dragable: false, ...props }, this);

    this.native.userData.owner = this;
  }

  get position() {
    return this.native.position;
  }
  get scale() {
    return this.native.scale;
  }
  get rotation() {
    return this.native.rotation;
  }
  get visible() {
    return this.native.visible;
  }
  set visible(value: boolean) {
    this.native.visible = value;
  }

  add(...element: Element[]) {
    element.forEach(e => {
      (e as any).parent = this;
      this.native.add(e.native);
      this.children.push(e);
    });
  }

  remove(...element: Element[]) {
    element.forEach(e => {
      const index = this.children.indexOf(e);
      if (index !== -1) {
        e.native.removeFromParent();
        (e as any).parent = undefined;
        this.children.splice(index, 1);
      }
    });
  }

  removeFromParent() {
    if (!this.parent) {
      if (this.native.parent) {
        this.native.removeFromParent();
      }
      return;
    }
    return this.parent.remove(this);
  }

  dispose() {
    this.clearAnimations(1);
    this.children.forEach(child => child.dispose());
  }

  traverse(cb: (el: Element) => void) {
    cb(this);
    const fn = (child: Element) => {
      cb(child);
      child.children.forEach(fn);
    }
    this.children.forEach(fn);
  }

  update(delta: number, now: number, renderer: Renderer, scene: Scene, camera: Camera) {
    // do nothings
  }

  onGropGet(k: string) {
    // do nothings
  }

  onPropSet(k: string, value: any) {
    // do nothings
  }

  protected applyAnimation(attrs: Partial<A>) {
    // do nothings
  }

  lookAt(x: Vector3 | number | null, y?: number, z?: number): void {
    if (typeof x === 'number') {
      this.native.lookAt(x as any, y as any, z as any);
      this.target = new Vector3(x, y, z);
    } else if (x) {
      this.native.lookAt(x as any, y as any, z as any);
      this.target = x.clone();
    } else {
      this.target = undefined;
    }
  }

  startAnimation(attrs: Partial<A>, time: number): Promise<void> {
    if (!this.native.visible) {
      this.native.visible = true;
    }
    if (!this.aniQue) {
      this.aniQue = [];
    }
    return new Promise<void>((resolve, reject) => {
      this.aniQue.push({
        attrs,
        time,
        resolve,
        reject
      });
      this.execAni();
    }).catch((code?: number) => { if (code) throw code; });
  }

  clearAnimations(code?: number) {
    if (this.aniCur) {
      this.aniCur.tween!.stop();
      this.aniCur.reject(code);
      this.aniCur = undefined;
    }
    if (this.aniQue) {
      this.aniQue.forEach((e) => e.reject(code));
      this.aniQue.length = 0;
    }
  }

  private execAni() {
    if (this.aniCur) {
      return;
    }
    const task = this.aniQue.shift();
    if (!task) {
      return;
    }

    this.aniCur = task;

    const { attrs, time, resolve, reject } = task;

    const end = JSON.parse(JSON.stringify(attrs));
    const current = pickAttrs(this, end);
    const ani: Tween<any> = new Tween(current);
    try {
      ani
        .to(end, time)
        .easing(Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.assignAttrs(this, current);
          this.applyAnimation(current);
        })
        .onComplete(() => {
          defaultAnimationGroup.remove(ani);
          this.aniCur = undefined;
          this.assignAttrs(this, end);
          this.applyAnimation(end);
          resolve(0);
          return setTimeout(() => {
            this.execAni();
          }, 0);
        })
        // Parameter 'undefined' is needed in version 18.6.0
        // Reference: https://github.com/tweenjs/tween.js/pull/550
        .start(undefined);
      task.tween = ani;
      defaultAnimationGroup.add(ani);
    } catch (err) {
      defaultAnimationGroup.remove(ani);
      this.aniCur = undefined;
      this.assignAttrs(this, end);
      this.applyAnimation(current);
      reject(err);
      return setTimeout(() => {
        this.execAni();
      }, 0);
    }
  }

  private assignAttrs<T extends AttrsLike>(obj: any, attrs: T) {
    const trv = (oo: any, ao: any) => {
      for (const [k, av] of Object.entries(ao)) {
        if (typeof av === 'object') {
          const ov = oo[k];
          if (typeof ov !== 'object') {
            continue;
          }
          trv(ov, av);
        } else if (typeof av === 'number') {
          const ov = oo[k];
          if (typeof ov === 'object' && ov.isUniformNode) {
            ov.value = av;
            continue;
          }
          if (typeof ov !== 'number') {
            const { set } = getPropertyDescriptor(oo, k) || {};
            if (set) {
              set.call(oo, av);
            }
            continue;
          }
          oo[k] = av;
        }
      }
    };
    trv(obj, attrs);

    if (attrs.target) {
      this.lookAt(attrs.target.x, attrs.target.y, attrs.target.z);
    } else if (this.target && attrs.position) {
      this.lookAt(this.target);
    }
  }
}

function pickAttrs<T extends AttrsLike>(obj: any, ref: T): T {
  const attrs: any = {};
  const trv = (oo: any, ao: any, ro: any) => {
    for (const [k, rv] of Object.entries(ro)) {
      if (typeof rv === 'object') {
        const ov = oo[k];
        if (typeof ov !== 'object') {
          continue;
        }
        const av: any = ao[k] || (ao[k] = {});
        trv(ov, av, rv);
      } else if (typeof rv === 'number') {
        const ov = oo[k];
        if (typeof ov === 'object' && ov.isUniformNode) {
          ao[k] = ov.value || 0;
          continue;
        }
        if (ov !== undefined && typeof ov !== 'number') {
          continue;
        }
        ao[k] = ov || 0;
      }
    }
  };
  trv(obj, attrs, ref);
  return attrs;
}

