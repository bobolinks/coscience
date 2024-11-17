<template>
  <div ref="rootdiv" class="panel" :style="style">
    <div v-if="showHeader" class="panel-header" :draggable="dragableKey ? true : false" @dragstart="onDragStart" @drag="onDragMove" @dragend="onDragEnd">
      <i v-if="icon" class="title-icon" :class="icon" :style="{ cursor: dragableKey ? 'move' : 'default' }" />
      <label v-if="title" class="panel-title">{{ title }}</label>
      <slot name="header" v-bind="{ el: rootdiv, maximize }" />
    </div>
    <slot />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const rootdiv = ref<HTMLDivElement>();
const style = ref<{ left?: string; right?: string; top?: string; bottom?: string }>({});

function maximize() {
  if (!rootdiv.value || !props.maxWidth) {
    return;
  }
  const el = rootdiv.value;
  el.classList.toggle('isMaximized');
  if (el.classList.contains('isMaximized')) {
    el.style.minWidth = `${props.maxWidth}px`;
  } else {
    el.style.removeProperty('min-width');
  }
}

const dragPoint = { x: 0, y: 0, left: 0, right: 0, top: 0, bottom: 0 };

function onDragStart(e: DragEvent) {
  dragPoint.x = e.clientX;
  dragPoint.y = e.clientY;
  pickStyle();
}

function onDragMove(e: DragEvent) {
  const dx = e.clientX - dragPoint.x;
  const dy = e.clientY - dragPoint.y;
  applyStyle(dx, dy);
}

function onDragEnd(e: DragEvent) {
  const dx = e.clientX - dragPoint.x;
  const dy = e.clientY - dragPoint.y;
  applyStyle(dx, dy, true);
}

function pickStyle() {
  const { left, right, top, bottom } = rootdiv.value!.style;
  if (left) {
    dragPoint.left = Number.parseFloat(left);
  }
  if (right) {
    dragPoint.right = Number.parseFloat(right);
  }
  if (top) {
    dragPoint.top = Number.parseFloat(top);
  }
  if (bottom) {
    dragPoint.bottom = Number.parseFloat(bottom);
  }
}

function syncStyle() {
  const { left, right, top, bottom } = rootdiv.value!.style;
  if (left) {
    style.value.left = left;
  }
  if (right) {
    style.value.right = right;
  }
  if (top) {
    style.value.top = top;
  }
  if (bottom) {
    style.value.bottom = bottom;
  }
}

function applyStyle(dx: number, dy: number, save?: boolean) {
  const { left, right, top, bottom } = dragPoint;
  if (left) {
    style.value.left = `${left + dx}px`;
  }
  if (right) {
    style.value.right = `${right - dx}px`;
  }
  if (top) {
    style.value.top = `${top + dy}px`;
  }
  if (bottom) {
    style.value.bottom = `${bottom - dy}px`;
  }
  if (save) {
    const [key] = props.dragableKey!.split('|');
    localStorage.setItem(`style-${key}`, JSON.stringify(style.value));
  }
}

const props = defineProps<{
  icon?: string;
  title?: string;
  showHeader?: boolean;
  maxWidth?: number;
  /** store-key */
  dragableKey?: string;
}>();
onMounted(() => {
  if (props.dragableKey) {
    const [key, init] = props.dragableKey.split('|');
    const s = localStorage.getItem(`style-${key}`);
    if (s) {
      const o = JSON.parse(s);
      for (const [k, v] of Object.entries(o)) {
        (style.value as any)[k] = v;
      }
    } else {
      const si = Object.fromEntries(init.split('&').map((e) => e.split('=')));
      for (const [k, v] of Object.entries(si)) {
        (style.value as any)[k] = v;
      }
      syncStyle();
    }
  }
});
</script>
<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  background-color: var(--background-color-pane-toolbar);
  overflow: hidden;
  box-sizing: border-box;
  padding: 4px;
}

.panel-header {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: var(--color-title);
  font-size: 16px;
  min-height: var(--panel-header-height);
  max-height: var(--panel-header-height);
  margin: -4px;
}

.panel-header .title-icon {
  position: absolute;
  font-size: 18px;
  left: 0.5em;
  color: var(--color-title);
  pointer-events: none;
}

.panel-header .panel-title {
  position: absolute;
  font-size: 16px;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
}
</style>
