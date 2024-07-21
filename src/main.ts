/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createApp, openBlock, resolveComponent, createBlock } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/app.css';
import './styles/index.less';
import appLifeCircle from './app';
import { router } from './router';
import { store } from './store';

declare global {
  interface Window {
    setImmediate: any;
    $: (selector: string, doc: Document) => void;
    __store: any;
    __vue: any;
  }
}

if (!window.setImmediate) {
  window.setImmediate = window.setTimeout;
}

if (!window.$) {
  window.$ = (selector: string, doc: Document) => doc.querySelector(selector);
}

document.title = '计算机科学';

const app = createApp({
  render: () => (openBlock(), createBlock(resolveComponent('router-view'))),
});

// @ts-ignore
window.__app = app;

// @ts-ignore
window.__store = store;

// setup store
app.use(store);


app.use(router);

app.use(ElementPlus);

async function main() {
  // disable service worker
  // await regService();

  await appLifeCircle.beforeLaunch(app, store, router);

  const vue = app.mount('#app');

  // @ts-ignore
  window.__vue = vue;

  vue.$nextTick(() => {
    appLifeCircle.onLaunched(app, store, router);
  });
}

main();
