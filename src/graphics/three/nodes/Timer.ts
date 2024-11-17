import { renderGroup, uniform } from 'three/tsl';

export const time = /*@__PURE__*/ uniform(0)
  .setGroup(renderGroup)
  .onRenderUpdate((frame) => frame.time);
export const deltaTime = /*@__PURE__*/ uniform(0)
  .setGroup(renderGroup)
  .onRenderUpdate((frame) => frame.deltaTime);
