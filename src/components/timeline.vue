<template>
  <el-timeline class="timeline" style="max-width: 600px">
    <el-timeline-item class="guiding" center :icon="Guide" color="#fff"></el-timeline-item>
    <el-timeline-item v-for="(it, index) in activities" :key="index" center :icon="it.icon" :type="it.type" size="large" placement="top">
      <labe class="title" :selected="index === store.currentSlideIndex">{{ it.title }}</labe>
      <el-image class="thumb" :src="`/assets/images/slide-${index}.png`" @click="select(index)">
        <template #error>
          <div class="image-slot">
            <el-icon @click="select(index)"><Camera /></el-icon>
          </div>
        </template>
      </el-image>
    </el-timeline-item>
  </el-timeline>
</template>
<script lang="ts" setup>
import { ElTimeline, ElTimelineItem, ElImage, ElIcon } from 'element-plus';
import { QuestionFilled, SuccessFilled, Camera } from '@element-plus/icons-vue';
import Guide from './icon/guide.vue';
import { useDataStore } from '../stores/data';
import slides from '../core/slides';
import { dsp } from '../dsp';

const store = useDataStore();

const activities: Array<any> = [
  {
    title: '电脑无处不在',
    type: 'success',
    icon: SuccessFilled,
  },
  {
    title: '灯泡和开关',
    type: 'primary',
  },
  {
    title: '显示器',
    type: 'info',
    icon: QuestionFilled,
  },
  {
    title: '代码',
    type: 'info',
    icon: QuestionFilled,
  },
  {
    title: '编程',
    type: 'info',
    icon: QuestionFilled,
  },
];
function select(index: number) {
  if (store.currentSlideIndex === index || index <= slides.length) {
    return;
  }
  store.currentSlideIndex = index;
}
</script>
<style scoped>
.timeline {
  padding: 1em;
  border-right: 1px solid #f2f2f2;
  overflow: scroll;
  max-height: 100vh;
}
.guiding > .el-timeline-item .el-timeline-item__icon {
  color: #0bbd87 !important;
}
.thumb {
  width: 220px;
  border-radius: 6px;
  position: relative;
  cursor: pointer;
}
.title {
  position: absolute;
  left: 2em;
  top: -1em;
  color: var(--color-content);
}
.title[selected='true'] {
  color: var(--color-light-normal);
}
</style>
