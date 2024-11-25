import { ref, watch } from 'vue';
import { createPinia, defineStore } from 'pinia';

export const appName = 'coscience';
export const pinia = createPinia();
export const useDataStore = defineStore('data', () => {
  const isDirty = ref<boolean>();
  const passSlideIndex = ref<number>(Number.parseInt(localStorage.getItem('passSlideIndex') || '-1'));
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

  watch(passSlideIndex, () => {
    localStorage.setItem('passSlideIndex', `${passSlideIndex.value}`);
  });

  return { isDirty, currentSlideIndex, passSlideIndex };
});
export const store = useDataStore(pinia);
