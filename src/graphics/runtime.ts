import type { PerspectiveCamera } from './elements/camera';
import type { SubTitle } from './elements/subtitle';
import * as tsl from './three/nodes/tsl';

export type RunContext = {
  tsl: typeof tsl;
  camera: PerspectiveCamera;
  subtitle: SubTitle;
  wait(...args: Array<number | Promise<void>>): void;
  say: (content: string) => void;
};
