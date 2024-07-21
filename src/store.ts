import { watch, } from "vue";
import { createStore } from "vuex";
import Theme from './utils/theme';

const state = {
  theme: localStorage.getItem('theme') || 'dark' as 'dark' | 'light',
};

export const store = createStore({
  state,
  mutations: {
  },
  actions: {
  }
});

watch(() => store.state.theme, (v) => {
  localStorage.setItem('theme', v);
  Theme.setTheme(v);
});

(window as any).$state = state;

export type Store = typeof state;
export default store.state;