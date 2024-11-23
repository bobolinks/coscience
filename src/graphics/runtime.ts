import * as tsl from './three/nodes/tsl';

export type RunContext = {
  tsl: typeof tsl;
  say: (content: string) => void;
};
