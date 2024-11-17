/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Pinia } from 'pinia';
import { dsp } from './dsp';
import './graphics/elements/props';
import cache from './graphics/elements/cache';
import { init } from './tslib';
import './hnet';

export default {
  async beforeLaunch(store: Pinia) {
    dsp.init();
    init();
    await cache.loadFont('/assets/fonts/STFangsong.ttf');
  },
  async onLaunched(store: Pinia) { }
};
