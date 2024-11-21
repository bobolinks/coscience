import type { Camera, PerspectiveCamera } from "@/graphics/elements/camera";
import type { AttrsLike, PropsLike, } from "@/graphics/elements/element";
import { Scene, type SceneEventMap } from "@/graphics/scene";

type EventMap = SceneEventMap & {
  play: void;
  completed: void;
};

export class Slide<C extends Camera = PerspectiveCamera, P extends PropsLike = PropsLike, A extends AttrsLike = AttrsLike> extends Scene<C, P, A, EventMap> {
  protected isPlaying = false;
  play() {
    if (this.isPlaying) {
      return false;
    }
    this.isPlaying = true;
    this.emit('play');
    return true;
  }
  complete() {
    this.isPlaying = false;
    this.emit('completed');
  }
}