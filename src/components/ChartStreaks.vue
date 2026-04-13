<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import { useMemoryStore } from '@/stores';

const memoryStore = useMemoryStore();

const sortedDates = computed(() =>
  [...memoryStore.entries]
    .map((e) => dayjs(e.date, 'YYYY/MM/DD'))
    .filter((d) => d.isValid())
    .sort((a, b) => a.diff(b)),
);

// Days since the last migraine (current streak)
const currentStreak = computed(() => {
  if (!sortedDates.value.length) return null;
  return dayjs()
    .startOf('day')
    .diff(sortedDates.value[sortedDates.value.length - 1], 'day');
});

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

const infos = {
  current: {
    title: 'Current Streak',
    description: 'Days since your last migraine. Resets to 0 on any day a migraine is logged.',
  },
  best: {
    title: 'Best Streak',
    description:
      'The longest you have ever gone without a migraine, including your current streak if it is the longest.',
  },
  worst: {
    title: 'Worst Streak',
    description: 'The most consecutive days in a row you have had a migraine.',
  },
};

const activeInfo = ref<keyof typeof infos | null>(null);

const showDialog = computed({
  get: () => activeInfo.value !== null,
  set: (val) => {
    if (!val) activeInfo.value = null;
  },
});
</script>

<template>
  <div v-if="memoryStore.entries.length" class="flex gap-2">
    <div
      class="relative flex-1 flex flex-col rounded-lg border border-current/10 px-3 py-2.5 cursor-pointer"
      @click="activeInfo = 'current'"
    >
      <q-icon
        name="sym_o_info"
        size="18px"
        class="pointer-events-none absolute top-1.5 right-1.5 opacity-20 leading-none"
      />
      <p class="mb-0 text-xl font-medium leading-tight">{{ currentStreak ?? 'n/a' }}</p>
      <p class="mb-0 text-xs opacity-50 mt-0.5">Current Streak</p>
    </div>
    <div
      class="relative flex-1 flex flex-col rounded-lg border border-current/10 px-3 py-2.5 cursor-pointer"
      @click="activeInfo = 'best'"
    >
      <q-icon
        name="sym_o_info"
        size="18px"
        class="pointer-events-none absolute top-1.5 right-1.5 opacity-20 leading-none"
      />
      <p class="mb-0 text-xl font-medium leading-tight">{{ bestStreak || 'n/a' }}</p>
      <p class="mb-0 text-xs opacity-50 mt-0.5">Best Streak</p>
    </div>
    <div
      class="relative flex-1 flex flex-col rounded-lg border border-current/10 px-3 py-2.5 cursor-pointer"
      @click="activeInfo = 'worst'"
    >
      <q-icon
        name="sym_o_info"
        size="18px"
        class="pointer-events-none absolute top-1.5 right-1.5 opacity-20 leading-none"
      />
      <p class="mb-0 text-xl font-medium leading-tight">{{ worstStreak || 'n/a' }}</p>
      <p class="mb-0 text-xs opacity-50 mt-0.5">Worst Streak</p>
    </div>

    <q-dialog v-model="showDialog" class="shadow-none">
      <q-card class="shadow-none">
        <q-card-section>
          <p class="text-xl font-semibold mb-0">{{ activeInfo ? infos[activeInfo].title : '' }}</p>
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{ activeInfo ? infos[activeInfo].description : '' }}
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped></style>
