import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import ElementPlus from 'unplugin-element-plus/vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import MonacoWebpackPlugin from 'vite-plugin-monaco-editor';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    ElementPlus({}),
    MonacoWebpackPlugin({}),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`
    })
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      }
    ]
  },
  server: {
    port: 5184,
    proxy: {
      '/tts': {
        target: 'http://localhost:7155',
        changeOrigin: true
      },
      '/fs': {
        target: 'http://localhost:8152',
        changeOrigin: true
      }
    }
  }
});
