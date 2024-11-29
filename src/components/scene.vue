<template>
  <div ref="wrap" class="frame-wrap">
    <el-dropdown class="resolution" trigger="click" @command="changeResolution">
      <i class="icon-size"></i>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="it of resoList" :key="it" :command="it">{{ it }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <Toolbar class="toolbar" :items="toolbarItems" @action="doAction"></Toolbar>
    <div ref="outline" class="outline" :floating="isFloating">
      <canvas ref="canvas" class="canvas"></canvas>
      <label class="text-nowrap subtitle">{{ worldProps.subtitle }}</label>
      <video id="videoShared" loop crossOrigin="anonymous" playsinline style="display: none">
        <source src="/assets/videos/sintel.mp4" />
      </video>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { ref, onMounted, onUnmounted } from 'vue';
import debounce from 'debounce';
import Toolbar from './elements/toolbar.vue';
import { World } from '../graphics/world';
import { useDataStore } from '../stores/data';
import { type ResolutionName, resoList, resolutions } from './devices';
import { dsp } from '../dsp';
import slides from '@/core/slides';

type Action = 'snapshot' | 'maximize';

const wrap = ref<HTMLDivElement>();
const outline = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();
const worldProps = ref<World['props']>({ subtitle: '' });
const resultion = ref<ResolutionName>('auto');

const store = useDataStore();
const isFloating = ref<boolean>();

const toolbarItems: Array<{ icon: string; action: Action }> = [
  {
    icon: 'icon-camera',
    action: 'snapshot',
  },
  {
    icon: 'icon-maximize',
    action: 'maximize',
  },
];

function changeResolution(command: ResolutionName) {
  const reso = resolutions[command];
  document.documentElement.style.setProperty('--dev-width', `${reso.dimension.width}`);
  document.documentElement.style.setProperty('--dev-height', `${reso.dimension.height}`);
  resizeCanvas();
}

function toggleFullScreen() {
  isFloating.value = !isFloating.value;
  outline.value!.remove();
  if (isFloating.value) {
    document.body.appendChild(outline.value!);
  } else {
    wrap.value!.appendChild(outline.value!);
  }
  resizeCanvas();
}

async function snapshot() {
  const url = canvas.value!.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = 'snapshot.png';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function doAction(e: Action) {
  if (e === 'snapshot') {
    snapshot();
  } else if (e === 'maximize') {
    toggleFullScreen();
  }
  console.log(e);
}

const resizeCanvas = debounce(() => {
  const rect = outline.value!.getBoundingClientRect();
  const name = resultion.value;
  const { width: widthPx, height: heightPx } = (resolutions as any)[name].dimension;
  const width = Number.parseInt(widthPx);
  const height = Number.parseInt(heightPx);
  if (name === 'auto' || (width <= rect.width && height <= rect.height)) {
    canvas.value!.style.width = `${rect.width}px`;
    canvas.value!.style.height = `${rect.height}px`;
    dsp.world?.resize(rect.width, rect.height);
  } else {
    canvas.value!.style.width = `${width}px`;
    canvas.value!.style.height = `${height}px`;
    dsp.world?.resize(width, height);
  }
  console.log({ width, height });
}, 200);

onMounted(() => {
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  if (!dsp.world) {
    dsp.world = new World(canvas.value!, worldProps.value);
    const cls = slides[store.currentSlideIndex];
    dsp.world.setScene(new cls(store.currentSlideIndex, cls.title));
    dsp.world.run();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  if (dsp.world) {
    dsp.world.stop();
    dsp.world.dispose();
    dsp.world = null as any;
  }
});
</script>
<style scoped>
.resolution {
  z-index: 99;
  position: absolute;
  left: 1em;
  top: 1em;
}
.toolbar {
  z-index: 9999;
  position: absolute;
  right: 1em;
  top: 1em;
  padding: 0 0.5em;
  background-color: #f2f2f2;
  min-height: 2rem;
  max-height: 2rem;
  border-radius: 1rem;
}
.frame-wrap {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 6px;
  overflow: scroll;
}
.frame-wrap .outline {
  position: relative;
  width: var(--dev-width);
  min-width: var(--dev-width);
  height: var(--dev-height);
  min-height: var(--dev-height);
}
.outline[floating='true'] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  min-width: 100vw;
  height: 100vh;
  min-height: 100vh;
  border-radius: 0;
  z-index: 999;
}
.outline .canvas {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 6px;
  overflow: hidden;
}
.subtitle {
  position: absolute;
  color: white;
  font-size: 1.4rem;
  left: 15%;
  width: 70%;
  top: unset;
  bottom: 6em;
  text-align: center;
  vertical-align: middle;
}
</style>
<style>
:root {
  --dev-width: 100%;
  --dev-height: 100%;
}
#videoShared {
  position: absolute;
  width: 1280px;
  height: 720px;
}
</style>
