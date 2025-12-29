import { createApp } from 'vue';
import { Quasar } from 'quasar';
import { router } from './router';
import { createPinia } from 'pinia';

// Capacitor Stuff
import { StatusBar, Style } from '@capacitor/status-bar';

import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css';
import './assets/first.css';
import './assets/style.css';

import App from './App.vue';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(Quasar, {
  plugins: {},
  config: { dark: true },
});

app.mount('#app');

// Set status bar style and background
StatusBar.setStyle({ style: Style.Dark }); // dark icons
StatusBar.setBackgroundColor({ color: '#000000' }); // background color
