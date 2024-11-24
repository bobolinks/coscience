import type { AttrsLike, PropsLike, } from "@/graphics/elements/element";
import type { RunContext } from "@/graphics/runtime";
import { Scene, type SceneEventMap } from "@/graphics/scene";
import { addLib, clearLib } from '@/tslib';
import { store } from '../stores/data';
import { number } from "@/utils/is";

type EventMap = SceneEventMap & {
  play: void;
  completed: void;
};

export class Slide<P extends PropsLike = PropsLike, A extends AttrsLike = AttrsLike> extends Scene<P, A, EventMap> {
  protected isPlaying = false;

  constructor(public readonly sid: number, props: P) {
    super(props);
  }

  protected getDts(): string {
    return '';
  }

  protected async main() {
    // do nothings
  }

  setupRuntime(context: RunContext): void {
    super.setupRuntime(context);
    const dts = this.getDts();
    if (dts) {
      addLib(`slide-${this.sid}`, dts);
    }
  }

  dispose(): void {
    super.dispose();
    clearLib(`slide-${this.sid}`);
  }

  play() {
    if (this.isPlaying) {
      return false;
    }
    this.isPlaying = true;
    this.emit('play');
    try {
      this.main();
    } catch (code: any) {
      console.log(code);
    }
    return true;
  }
  stop() {
    this.traverse((el) => {
      el.clearAnimations(1);
    });
  }
  complete() {
    this.isPlaying = false;
    this.emit('completed');
    if (store.slideTouch < this.sid) {
      store.slideTouch = this.sid;
    }
  }
}