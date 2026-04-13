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

// Average days between consecutive migraines
const avgDaysBetween = computed(() => {
  const dates = sortedDates.value;
  if (dates.length < 2) return null;

  let totalGap = 0;
  for (let i = 1; i < dates.length; i++) {
    totalGap += dates[i]!.diff(dates[i - 1]!, 'day');
  }
  return (totalGap / (dates.length - 1)).toFixed(1);
});

// Average migraines per month across all months that have any data
const avgPerMonth = computed(() => {
  const dates = sortedDates.value;
  if (!dates.length) return null;

  const first = dates[0]!.startOf('month');
  const last = dayjs().startOf('month');
  const totalMonths = last.diff(first, 'month') + 1;

  return (dates.length / totalMonths).toFixed(1);
});
</script>

<template>
  <div v-if="memoryStore.entries.length >= 2" class="flex gap-2">
    <div class="flex-1 flex flex-col rounded-lg border border-current/10 px-3 py-2.5">
      <p class="mb-0 text-xl font-medium leading-tight">
        {{ avgDaysBetween ?? 'n/a' }}
        <span class="opacity-50 text-xs">days</span>
      </p>
      <p class="mb-0 text-xs opacity-50 mt-0.5">Avg Between Migraines</p>
    </div>
    <div class="flex-1 flex flex-col rounded-lg border border-current/10 px-3 py-2.5">
      <p class="mb-0 text-xl font-medium leading-tight">{{ avgPerMonth ?? 'n/a' }}</p>
      <p class="mb-0 text-xs opacity-50 mt-0.5">Avg Per Month</p>
    </div>
  </div>
</template>

<style scoped></style>
