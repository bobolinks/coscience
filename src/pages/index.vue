<template>
  <div class="root-container">
    <topbar></topbar>
    <RouterView></RouterView>
  </div>
</template>
<script lang="ts" setup>
import topbar from '../components/topbar.vue';
</script>
<style scoped>
.root-container {
  width: 100%;
  min-width: var(--full-width);
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background-color: var(--background-color-default);
}
.root-container > div:nth-child(2) {
  height: var(--main-height);
  max-height: var(--main-height);
  min-height: var(--main-height);
  box-sizing: border-box;
}
</style>
