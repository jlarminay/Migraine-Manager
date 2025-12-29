import { defineStore } from 'pinia';

export const useTestStore = defineStore('test', {
  state: () => ({
    count: parseInt(localStorage.getItem('testStoreCount') || '0', 10),
  }),

  getters: {},

  actions: {
    increment() {
      this.count++;
      localStorage.setItem('testStoreCount', this.count.toString());
    },
  },
});
