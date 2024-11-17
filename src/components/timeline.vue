<template>
  <el-timeline class="timeline" style="max-width: 600px">
    <el-timeline-item class="guiding" center :icon="Guide" color="#fff"></el-timeline-item>
    <el-timeline-item v-for="(activity, index) in activities" :key="index" center :icon="activity.icon" :type="activity.type" size="large" :timestamp="activity.timestamp" placement="top">
      <el-image class="thumb" :src="`/assets/images/slide-${index}.png`" />
    </el-timeline-item>
  </el-timeline>
</template>
<script lang="ts" setup>
import { ElTimeline, ElTimelineItem, ElImage } from 'element-plus';
import { QuestionFilled, SuccessFilled } from '@element-plus/icons-vue';
import Guide from './icon/guide.vue';
import { useDataStore } from '../stores/data';

const store = useDataStore();

const activities: Array<any> = [
  {
    timestamp: '电脑无处不在',
    type: 'success',
    icon: SuccessFilled,
  },
  {
    timestamp: '灯泡和开关',
    type: 'primary',
  },
  {
    timestamp: '显示器',
    type: 'info',
    icon: QuestionFilled,
  },
  {
    timestamp: '代码',
    type: 'info',
    icon: QuestionFilled,
  },
  {
    timestamp: '编程',
    type: 'info',
    icon: QuestionFilled,
  },
];
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
}
</style>
