import type { PerspectiveCamera } from './elements/camera';
import * as tsl from './three/nodes/tsl';

export type RunContext = {
  tsl: typeof tsl;
  camera: PerspectiveCamera;
  say: (content: string) => void;
};
