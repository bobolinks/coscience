declare module THREE {
  interface Vector3 {}
}

declare interface Arrow {
  moveTo(target: THREE.Vector3): void;
}

declare const la1: Arrow;
