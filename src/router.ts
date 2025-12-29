import { createMemoryHistory, createRouter } from 'vue-router';

import HomeView from './pages/HomeView.vue';
import StatsView from './pages/StatsView.vue';
import SettingView from './pages/SettingView.vue';

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
    path: '/settings',
    name: 'SettingView',
    component: SettingView,
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
