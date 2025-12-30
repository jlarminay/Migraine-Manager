<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMemoryStore } from '@/stores';
import dayjs from 'dayjs';

const memoryStore = useMemoryStore();
const allItems = ref<{ date: string; type: 'evening' | 'morning' }[]>([]);
const thisYear = ref<{ date: string; type: 'evening' | 'morning' }[]>([]);
const thisMonth = ref<{ date: string; type: 'evening' | 'morning' }[]>([]);

onMounted(() => {
  allItems.value = memoryStore.getAll();
  thisYear.value = memoryStore.getYear(dayjs().year());
  thisMonth.value = memoryStore.getMonth(dayjs().year(), dayjs().month() + 1);
});
</script>

<template>
  <div class="flex">
    <div class="w-1/3 text-center">
      <p class="mb-0 text-2xl">{{ thisMonth.length }}</p>
      <span class="text-lg opacity-70">This Month</span>
    </div>
    <div class="w-1/3 text-center">
      <p class="mb-0 text-2xl">{{ thisYear.length }}</p>
      <span class="text-lg opacity-70">This Year</span>
    </div>
    <div class="w-1/3 text-center">
      <p class="mb-0 text-2xl">{{ allItems.length }}</p>
      <span class="text-lg opacity-70">All Time</span>
    </div>
  </div>
</template>

<style scoped></style>
