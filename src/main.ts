import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/styles/index.css';

import { createApp, openBlock, resolveComponent, createBlock, type Component } from 'vue';
import { createPinia } from 'pinia';

import router from './router';
import appLifeCircle from './app';

declare global {
  interface Window {
    $: (selector: string, doc: Document) => void;
    __vue: Component;
  }
}

const app = createApp({
  render: () => (openBlock(), createBlock(resolveComponent('router-view')))
});

const pinia = createPinia();
app.use(pinia);
app.use(router);

async function main() {
  await appLifeCircle.beforeLaunch(pinia);

  const vue = app.mount('#app');

  window.__vue = vue;

  vue.$nextTick(() => {
    appLifeCircle.onLaunched(pinia);
  });
}

main();
