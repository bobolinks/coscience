<template>
  <el-timeline class="timeline" style="max-width: 600px">
    <el-timeline-item class="guiding" center :icon="Guide" color="#fff"></el-timeline-item>
    <el-timeline-item v-for="(it, index) in activities" :key="index" center :icon="icons[it.type]" :type="it.type" size="large" placement="top">
      <label class="title" :selected="index === store.currentSlideIndex">{{ it.title }}</label>
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
import { ref, watch, onMounted } from 'vue';
import { ElTimeline, ElTimelineItem, ElImage, ElIcon } from 'element-plus';
import { QuestionFilled, SuccessFilled, Camera } from '@element-plus/icons-vue';
import Guide from './icon/guide.vue';
import { store } from '../stores/data';
import slides from '../core/slides';
import { dsp } from '../dsp';

type Item = {
  title: string;
  type: (typeof ElTimelineItem)['type'];
};

const icons: any = { success: SuccessFilled, info: QuestionFilled };
const activities = ref<Array<Item>>([]);

function select(index: number) {
  if (store.currentSlideIndex === index || index >= slides.length) {
    return;
  }
  store.currentSlideIndex = index;
}
watch(
  () => store.passSlideIndex,
  (value: number) => {
    const max = slides.length - 1;
    if (value >= max) {
      return;
    }
    store.currentSlideIndex = value + 1;
    updateSlides();
  },
);
watch(
  () => store.currentSlideIndex,
  (value: number) => {
    if (!dsp.world) {
      return;
    }

    const cls = slides[store.currentSlideIndex];
    dsp.world.setScene(new cls(store.currentSlideIndex, cls.title));
  },
);

function updateSlides() {
  const pass = store.passSlideIndex;
  const ls = slides.map((e, i) => {
    const type = i <= pass ? 'success' : i === pass + 1 ? 'primary' : 'info';
    return {
      title: e.title,
      type,
    };
  });
  activities.value = ls;
}

onMounted(() => {
  updateSlides();
});
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
