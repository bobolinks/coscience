<template>
  <div class="main">
    <Scene class="main-body" style="background-color: var(--background-color-default)"></Scene>
    <Panel class="panels" :show-header="true" :show-icon="false" :show-title="false">
      <template #header>
        <div class="panel-header-inside">
          <Segs v-model:model-value="data.curSeg" :items="topSegs" @changed="onSegChanged"></Segs>
        </div>
        <div class="panel-toolbar" style="margin-right: 0.5em">
          <i v-if="!data.isPlaying" class="icon-start" />
          <i v-else class="icon-stop"></i>
        </div>
      </template>
      <Code :model-value="data.code"></Code>
    </Panel>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Panel from './elements/panel.vue';
import Scene from './scene.vue';
import Code from './elements/code.vue';
import Segs from './elements/segs.vue';

const topSegs = [
  { icon: 'icon-json', value: 'code', title: '源码' },
  { icon: 'icon-scene', value: 'scene', title: '场景' },
  { icon: 'icon-fast', value: 'video', title: '视频' },
  { icon: 'icon-audio', value: 'audio', title: '音乐' },
];

const data = ref({
  isPlaying: false,
  code: '',
  curSeg: '',
});

function onSegChanged() {}
</script>
<style scoped>
.main {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}
.panel-header-inside {
  margin-left: 0.5em;
  flex: 1 1 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
}
</style>
<style>
.main-body {
  min-width: 600px;
  flex: 1 1 auto;
}
.main-body > .panel-header {
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--background-color-pane-toolbar);
}
</style>
