<template>
  <div class="panel">
    <div v-if="showHeader" class="panel-header">
      <el-icon v-if="showIcon" class="title-icon"><component :is="icon" /></el-icon>
      <label class="panel-title">{{ title }}</label>
      <slot name="header" />
    </div>
    <slot />
  </div>
</template>
<script lang="ts" setup>
import { Menu } from '@element-plus/icons-vue';

defineProps({
  icon: {
    type: Object,
    default: () => Menu,
  },
  title: {
    type: String,
    default: '',
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
});
</script>
<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  border-radius: 8px;
  background-color: var(--background-color-pane-toolbar);
  overflow: hidden;
  padding: 4px;
  box-sizing: border-box;
}

.panel-header {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  color: var(--color-title);
  font-size: 16px;
  min-height: var(--panel-header-height);
  max-height: var(--panel-header-height);
}

.panel-header .title-icon {
  position: absolute;
  font-size: 18px;
  left: 0.5em;
  top: 6px;
  color: #409eff;
  pointer-events: none;
}

.panel-header .panel-title {
  position: absolute;
  font-size: 16px;
  left: 0;
  right: 0;
  text-align: center;
}
</style>
