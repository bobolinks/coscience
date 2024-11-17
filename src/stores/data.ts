import { ref } from 'vue';
import { defineStore } from 'pinia';

export const appName = 'coscience';

export const useDataStore = defineStore('data', () => {
  const isDirty = ref<boolean>();
  const current = ref<Slide | null>();
  const stats = ref<{}>({});
  const isAdmin = ref<boolean>(false);

  const query = location.search;
  if (query) {
    const vs = Object.fromEntries(query.split('&').map(e => e.split('=')));
    const v = vs['admin'];
    if (v !== undefined && v !== 'false') {
      isAdmin.value = true;
    }
  }

  return { isDirty, current };
});
