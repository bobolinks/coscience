/* eslint-disable @typescript-eslint/no-unused-vars */
import { App } from 'vue';
import { Router, } from "vue-router";
import { Store } from 'vuex';
import state, { store } from './store';
import actions from './actions';

export default {
  async beforeLaunch(app: App, store: Store<typeof state>, router: Router) {
  },
  async onLaunched(app: App, store: Store<typeof state>, router: Router) {
  },
};
