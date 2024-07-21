<template>
  <div class="segs-root">
    <div v-for="it of items" :key="it.value" class="segs-item" :data-selected="modelValue === it.value" @click="select(it.value)">
      <i :class="it.icon" />
      <label>{{ it.title }}</label>
    </div>
  </div>
</template>
<script setup lang="ts">
type SegItem = {
  icon: string;
  value: string;
  title: string;
};

const modelValue = defineModel<string>({ required: true });

const emits = defineEmits(['changed']);

function select(value: string) {
  modelValue.value = value;
  emits('changed', value);
}

defineProps({
  items: {
    type: Array<SegItem>,
    required: true,
  },
});
</script>
<style scoped>
.segs-root {
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--background-color-pane-body);
  font-size: 12px;
}
.segs-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 0.8em;
  border-left: 1px solid var(--border-color-divider-pane);
  cursor: pointer;
}
.segs-item:first-child {
  border-left: none;
}
.segs-item[data-selected='true'] {
  color: var(--color-light-high);
}
.segs-item i {
  font-family: 'iconfont' !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-right: 0.5em;
}
.segs-item * {
  pointer-events: none;
}
</style>
