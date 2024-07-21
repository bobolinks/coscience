<template>
  <div class="slides">
    <Panel class="leftside main-panel" :show-icon="false" style="margin: var(--panel-margin)">asd</Panel>
    <Panel class="main-body main-panel" :show-icon="false" style="margin: var(--panel-margin) 0; background-color: var(--background-color-default)">
      <Editor></Editor>
    </Panel>
    <Panel class="rightside main-panel" :show-icon="false" style="margin: var(--panel-margin)">asd</Panel>
  </div>
</template>
<script setup lang="ts">
import Panel from '../components/panel.vue';
import Editor from '../components/editor.vue';
</script>
<style scoped>
.slides {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}
</style>
<style>
.main-body > .panel-header {
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--background-color-pane-toolbar);
}
</style>
