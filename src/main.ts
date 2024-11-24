import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/styles/index.css';
import { createApp, openBlock, resolveComponent, createBlock, type Component } from 'vue';
import router from './router';
import appLifeCircle from './app';
import { pinia } from './stores/data';

declare global {
  interface Window {
    $: (selector: string, doc: Document) => void;
    __vue: Component;
  }
}

const app = createApp({
  render: () => (openBlock(), createBlock(resolveComponent('router-view')))
});

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
