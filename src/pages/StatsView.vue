<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMemoryStore } from '@/stores';
import { ChartCounts, ChartDayOfWeek, ChartMonths, ChartDateType } from '@/components';

const memoryStore = useMemoryStore();
const allItems = ref<{ date: string; type: 'evening' | 'morning' }[]>([]);

onMounted(() => {
  memoryStore.load();
  resetData();
});

function resetData() {
  allItems.value = memoryStore.getAll();
}
</script>

<template>
  <div>
    <p class="text-2xl">Stats</p>

    <div class="pb-4">
      <ChartCounts />
      <ChartDayOfWeek :data="allItems" class="mt-6" />
      <ChartMonths :data="allItems" class="mt-6" />
      <ChartDateType :data="allItems" class="mt-6" />
    </div>
  </div>
</template>

<style scoped></style>
