<template>
  <div class="topbar" style="width: auto">
    <div class="topbtns" style="align-items: center; display: flex; flex-direction: row">
      <i class="iconfont icon-translate" @click="router.push('/index')"></i>
    </div>
    <Alert class="topbar-center" />
    <div class="topbar-action-group">
      <i class="icon-setting" @click="data.isSettingsVisible = true"></i>
      <Settings v-model:model-value="data.isSettingsVisible" title="系统设置"></Settings>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Settings from './popovers/settings.vue';
import Alert from './snippets/alert.vue';

const data = ref({
  isSettingsVisible: false,
});

const router = useRouter();
</script>

<style scoped="true">
.topbar {
  padding: 0;
  background-color: var(--background-color-toolbar);
  user-select: none;
  position: relative;
  min-height: var(--topbar-height);
  max-height: var(--topbar-height);
  min-width: var(--full-width);
  /* box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%); */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.topbar i {
  font-size: 2rem;
}

.topbtns i {
  font-size: 2rem;
  margin-left: 0.75rem;
  margin-right: 0.75rem;
  cursor: pointer;
}

i {
  cursor: pointer;
}

.topbar i {
  color: white;
}

.topbar-center {
  flex: 1 1 auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

i[disabled='true'] {
  cursor: default;
  color: #ccc;
  pointer-events: none;
}

.topbar-action-group {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  height: 26px;
  border-radius: 3px;
}
.topbar-action-group i {
  font-family: 'iconfont' !important;
  font-size: 20px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0 0.4em;
  color: #a8a8a8;
}
.topbar-action-group i:hover {
  color: #ff9900;
}
</style>
