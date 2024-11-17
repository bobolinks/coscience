<template>
  <div class="root">
    <Timeline class="panel-left"></Timeline>
    <Main class="main" style="flex: 1 1 auto; padding-left: 0"></Main>
  </div>
</template>

<script setup lang="ts">
import Timeline from '../components/timeline.vue';
import Main from '../components/main.vue';
</script>

<style scoped>
.root {
  min-height: 100vh;
  max-height: 100vh;
  min-width: var(--full-width);
  max-width: var(--full-width);
  display: flex;
  flex-direction: row;
  align-items: stretch;
}
</style>
