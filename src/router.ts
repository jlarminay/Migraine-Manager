import { createMemoryHistory, createRouter } from 'vue-router';

import HomeView from './pages/HomeView.vue';
import StatsView from './pages/StatsView.vue';
import SettingView from './pages/SettingView.vue';
import AiView from './pages/AiView.vue';

const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView,
  },
  {
    path: '/stats',
    name: 'StatsView',
    component: StatsView,
  },
  {
    path: '/ai',
    name: 'AiView',
    component: AiView,
  },
  {
    path: '/settings',
    name: 'SettingView',
    component: SettingView,
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
