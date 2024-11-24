declare type Vec3Like = { x: number; y: number; z: number; };
declare type AttrsLike = {
  position: Vec3Like;
  scale: Vec3Like;
  rotation: Vec3Like;
};

declare class ElementNode<A extends AttrsLike> {
  startAnimation(attrs: Partial<A>, time: number): Promise<void>;
}

declare const camera: ElementNode<AttrsLike>;
declare function say(content: string): void;
