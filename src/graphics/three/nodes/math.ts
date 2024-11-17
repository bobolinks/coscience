import { Fn, pow } from 'three/tsl';

const e = 2.71828;

export const sinh = Fn(([x]: [any]) => {
  return pow(e, x).sub(pow(e, x.negate())).div(2);
});

export const cosh = Fn(([x]: [any]) => {
  return pow(e, x).add(pow(e, x.negate())).div(2);
});
