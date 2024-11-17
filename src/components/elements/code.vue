<template>
  <div ref="rootDiv" class="code-wrap"></div>
</template>
<script lang="ts" setup>
import * as Monaco from 'monaco-editor';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { dsp } from '../../dsp';

const modelValue = defineModel<string>({ required: true });

const props = defineProps<{ lang?: 'json' | 'javascript'; theme?: 'vs-dark' }>();

const rootDiv = ref<HTMLDivElement>();
let editor: Monaco.editor.IStandaloneCodeEditor = null as any;

const emits = defineEmits(['changed']);

watch(modelValue, () => {
  if (editor && editor.getValue() !== modelValue.value) {
    editor.setValue(modelValue.value);
  }
});

function formatCode() {
  editor.getAction('editor.action.formatDocument')!.run();
}

onMounted(() => {
  editor = Monaco.editor.create(rootDiv.value!, {
    value: modelValue.value,
    language: props.lang || 'json',
    theme: props.theme || 'vs-dark',
    automaticLayout: true,
    tabSize: 2,
  });
  (editor.getModel() as any).onDidChangeContent(() => {
    const value = editor.getValue();
    modelValue.value = value;
    emits('changed', value);
  });
  dsp.addKeyDownListener('meta+shift+f', formatCode, 'Code.Format 格式化代码');
});

onUnmounted(() => {
  dsp.removeKeyDownListener('meta+shift+f', formatCode);
});
</script>
<style scoped>
.code-wrap {
  display: block;
  min-height: 300px;
  height: 100%;
  width: 100%;
}
</style>
