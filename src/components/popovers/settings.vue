<template>
  <el-dialog v-model="modelVisibleValue" :title="title" width="400px" draggable align-center @close="modelVisibleValue = false">
    <div class="props-list"></div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { defineProps, defineModel, ref, watch } from 'vue';

const modelVisibleValue = defineModel<boolean>();

defineProps({
  title: {
    type: String,
    default: '',
  },
});

const data = ref({});
</script>
<style scoped>
.props-list {
  color: white;
}
</style>
