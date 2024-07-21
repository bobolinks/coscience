import { defineConfig, } from 'vite';
import vue from '@vitejs/plugin-vue';
// import basicSsl from '@vitejs/plugin-basic-ssl';
import topLevelAwait from "vite-plugin-top-level-await";
import MonacoWebpackPlugin from 'vite-plugin-monaco-editor';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{
      find: /^@\//,
      replacement: '/src/',
    }],
  },
  plugins: [
    vue({
      script: {
        defineModel: true,
      },
      template: {
        compilerOptions: {
          isCustomElement: tagName => {
            return tagName === 'vue-advanced-chat' || tagName === 'emoji-picker'
          }
        }
      }
    }),
    // basicSsl(),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: "__tla",
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: i => `__tla_${i}`
    }),
    MonacoWebpackPlugin({}),
  ],
  base: '/',
  build: {
    outDir: '../dist/apex',
    emptyOutDir: true,
    // only for debug
    minify: process.env.NODE_ENV === 'production',
  },
  assetsInclude: ['**/*.frag'],
  server: {
    port: 5184,
    proxy: {
      '/tts': {
        target: 'http://localhost:7155',
        changeOrigin: true,
      },
    }
  },
});
