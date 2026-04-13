<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import { useMemoryStore } from '@/stores';

const memoryStore = useMemoryStore();

const sortedDates = computed(() =>
  [...memoryStore.entries]
    .map((e) => dayjs(e.date, 'YYYY/MM/DD'))
    .filter((d) => d.isValid())
    .sort((a, b) => a.diff(b)),
);

// Longest gap between consecutive memoryStore.entries (migraine-free days)
const bestStreak = computed(() => {
  if (!sortedDates.value || !sortedDates.value.length) return null;

  let max = 0;
  for (let i = 1; i < sortedDates.value.length; i++) {
    const curr = sortedDates.value[i];
    const prev = sortedDates.value[i - 1];
    if (!curr || !prev) continue;
    const gap = curr.diff(prev, 'day') - 1;
    if (gap > max) max = gap;
  }
  // Include the current ongoing streak from the last entry to today
  const current = dayjs()
    .startOf('day')
    .diff(sortedDates.value[sortedDates.value.length - 1], 'day');
  if (current > max) max = current;
  return max;
});

// Longest run of consecutive days with migraines
const worstStreak = computed(() => {
  if (!sortedDates.value || !sortedDates.value.length) return null;

  let max = 1;
  let current = 1;
  for (let i = 1; i < sortedDates.value.length; i++) {
    const curr = sortedDates.value[i];
    const prev = sortedDates.value[i - 1];
    if (curr && prev && curr.diff(prev, 'day') === 1) {
      current++;
      if (current > max) max = current;
    } else {
      current = 1;
    }
  }
  return max;
});
</script>

<template>
  <div v-if="memoryStore.entries.length" class="flex gap-2">
    <div class="flex-1 flex flex-col rounded-lg border border-current/10 px-3 py-2.5">
      <p class="mb-0 text-xl font-medium leading-tight">{{ bestStreak || 'n/a' }}</p>
      <p class="mb-0 text-xs opacity-50 mt-0.5">Best Streak</p>
      <p class="mb-0 text-xs opacity-30">days migraine-free</p>
    </div>
    <div class="flex-1 flex flex-col rounded-lg border border-current/10 px-3 py-2.5">
      <p class="mb-0 text-xl font-medium leading-tight">{{ worstStreak || 'n/a' }}</p>
      <p class="mb-0 text-xs opacity-50 mt-0.5">Worst Streak</p>
      <p class="mb-0 text-xs opacity-30">days in a row</p>
    </div>
  </div>
</template>

<style scoped></style>
