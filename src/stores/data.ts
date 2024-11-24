import { ref, watch } from 'vue';
import { createPinia, defineStore } from 'pinia';

export const appName = 'coscience';
export const pinia = createPinia();
export const useDataStore = defineStore('data', () => {
  const isDirty = ref<boolean>();
  const slideTouch = ref<number>(Number.parseInt(localStorage.getItem('slideTouch') || '0'));
  const currentSlideIndex = ref<number>(0);
  const isAdmin = ref<boolean>(false);

  const query = location.search;
  if (query) {
    const vs = Object.fromEntries(query.split('&').map(e => e.split('=')));
    const v = vs['admin'];
    if (v !== undefined && v !== 'false') {
      isAdmin.value = true;
    }
  }

  watch(slideTouch, () => {
    localStorage.setItem('slideTouch', `${slideTouch.value}`);
  });

  return { isDirty, currentSlideIndex, slideTouch };
});
export const store = useDataStore(pinia);
