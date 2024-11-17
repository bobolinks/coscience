<template>
  <div class="snippet" style="padding: 0">
    <el-alert class="layout-row title" :type="data.msgType" :title="data.msgTitle" :closable="false" show-icon style="flex: 0; min-width: 416px; height: 36px; border-radius: 6px"> </el-alert>
    <el-icon class="icon-pending" :data-pending="data.isPending"><Aim /></el-icon>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Aim } from '@element-plus/icons-vue';

// effect="dark"

const data = ref({
  msgType: 'info',
  msgTitle: '服务空闲中',
  isPending: false,
});
</script>
<style scoped>
.icon-pending {
  position: absolute;
  right: calc(50% - 190px);
  top: calc(50% - 8px);
  font-size: 16px !important;
  color: gray !important;
}

.icon-pending[data-pending='true'] {
  animation: rotate 1s infinite linear;
}
</style>
