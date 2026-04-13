<script setup lang="ts">
import { onMounted } from 'vue';
import { useMemoryStore } from '@/stores';
import {
  ChartCounts,
  ChartDayOfWeek,
  ChartMonths,
  ChartDateType,
  ChartStreaks,
  ChartAverages,
} from '@/components';

const memoryStore = useMemoryStore();

onMounted(() => {
  memoryStore.load();
});
</script>

<template>
  <div>
    <p class="text-2xl">Stats</p>

    <div class="pb-4">
      <ChartCounts />
      <ChartAverages class="mt-2" />
      <ChartStreaks class="mt-2" />
      <ChartDayOfWeek class="mt-2" />
      <ChartMonths class="mt-2" />
      <ChartDateType class="mt-2" />
    </div>
  </div>
</template>

<style scoped></style>
