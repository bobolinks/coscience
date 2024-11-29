declare type Vec3Like = { x: number; y: number; z: number; };
declare type AttrsLike = {
  position: Vec3Like;
  scale: Vec3Like;
  rotation: Vec3Like;
};

declare type MeshAttrs = {
  opacity: number;
  color: number;
}

declare type LightAttrs = {
  intensity: number;
}

declare class ElementNode<A extends AttrsLike> {
  emit(type: string, event: any): void;
  startAnimation(attrs: Partial<A>, time: number): Promise<void>;
}

declare const camera: ElementNode<AttrsLike>;
declare const subtitle: ElementNode<AttrsLike & MeshAttrs>;
declare function wait(...args: Array<number | Promise<void>>): void;
declare function say(content: string): void;
