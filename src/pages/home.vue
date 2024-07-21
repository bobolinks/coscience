<template>
  <div class="panels" @contextmenu.prevent>
    <Panel :icon="Star" title="自选股"> </Panel>
    <Panel :icon="ShoppingCart" title="股池"> </Panel>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { TopRight, BottomRight, Position, Switch, Star, Refresh, Flag, ShoppingCart } from '@element-plus/icons-vue';
import Panel from '../components/panel.vue';
import { store } from '../store';
import actions from '../actions';

const router = useRouter();

const context = {};

onMounted(() => {});
onUnmounted(() => {});
</script>
<style scoped>
.panels {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 4px;
  overflow-x: scroll;
}
.panels > .panel {
  margin: 4px;
  overflow: scroll;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%);
  box-sizing: content-box;
  min-width: 210px;
}
.panel-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  flex: 1 1 auto;
  margin-right: 0.5rem;
  position: relative;
}
.panel-bar::before {
  content: attr(data-date);
  position: absolute;
  top: -1.2em;
  font-size: 10px;
  color: var(--color-comment);
  font-style: italic;
}
</style>
../actions
