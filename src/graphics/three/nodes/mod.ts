import { Fn, floor } from 'three/tsl';

type u32 = any;
type f32 = any;

export const mod_ = Fn(([x, y]: [any, any]) => {
  return x.sub(y.mul(floor(x.div(y))));
});

export const cmap = Fn(([i, b, min, max]: [u32, u32, f32, f32]) => {
  const r = b.div(b.sub(1));
  return mod_(i, b).div(b).mul(r).mul(max.sub(min)).add(min);
});
