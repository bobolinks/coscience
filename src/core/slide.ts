import type { Camera, PerspectiveCamera } from "@/graphics/elements/camera";
import type { AttrsLike, PropsLike, } from "@/graphics/elements/element";
import { Scene, type SceneEventMap } from "@/graphics/scene";

type EventMap = SceneEventMap & {
  completed: void;
};

export class Slide<C extends Camera = PerspectiveCamera, P extends PropsLike = PropsLike, A extends AttrsLike = AttrsLike> extends Scene<C, P, A, EventMap> {
  complete() {
    this.emit('completed');
  }
}