<template>
  <div class="toolbar">
    <i v-for="it of items" :class="it.icon" :key="it.action" @click="emits('action', it.action)"></i>
  </div>
</template>
<script lang="ts" setup>
const emits = defineEmits(['action']);
defineProps<{ items: Array<{ icon: string; action: string }> }>();
</script>

<style scoped="true">
.toolbar {
  padding: 0;
  user-select: none;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.toolbar i {
  margin: 0 0.25em;
}
</style>
