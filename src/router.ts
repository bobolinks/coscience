import { createRouter, createWebHashHistory, } from "vue-router";
import index from './pages/index.vue';
import home from './pages/home.vue';
import slides from './pages/slides.vue';

const routes = [
  { path: '/', redirect: '/index' },
  {
    path: '/index',
    component: index,
    redirect: '/index/slides',
    children: [
      { path: 'home', component: home, },
      { path: 'slides', component: slides, },
    ],
  },
];

// setup router
const baseUrl = '/';
const history = createWebHashHistory(baseUrl);
export const router = createRouter({
  history,
  routes
});