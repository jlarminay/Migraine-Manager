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

const fmt = (d: ReturnType<typeof dayjs>) => d.format('MMM D, YYYY');

// Days since the last migraine (current streak)
const currentStreakData = computed(() => {
  if (!sortedDates.value.length) return null;
  const last = sortedDates.value[sortedDates.value.length - 1]!;
  const days = dayjs().startOf('day').diff(last, 'day');
  const start = last.add(1, 'day');
  return { days, range: days > 0 ? `${fmt(start)} – now` : null };
});

// Longest gap between consecutive entries (migraine-free days)
const bestStreakData = computed(() => {
  if (!sortedDates.value.length) return null;

  let max = 0;
  let rangeStart: ReturnType<typeof dayjs> | null = null;
  let rangeEnd: ReturnType<typeof dayjs> | null = null;

  for (let i = 1; i < sortedDates.value.length; i++) {
    const curr = sortedDates.value[i]!;
    const prev = sortedDates.value[i - 1]!;
    const gap = curr.diff(prev, 'day') - 1;
    if (gap > max) {
      max = gap;
      rangeStart = prev.add(1, 'day');
      rangeEnd = curr.subtract(1, 'day');
    }
  }

  const last = sortedDates.value[sortedDates.value.length - 1]!;
  const currentDays = dayjs().startOf('day').diff(last, 'day');
  if (currentDays > max) {
    max = currentDays;
    rangeStart = last.add(1, 'day');
    rangeEnd = null; // ongoing
  }

  const range = max > 0 && rangeStart
    ? rangeEnd ? `${fmt(rangeStart)} – ${fmt(rangeEnd)}` : `${fmt(rangeStart)} – now`
    : null;
  return { days: max, range };
});

// Longest run of consecutive days with migraines
const worstStreakData = computed(() => {
  if (!sortedDates.value.length) return null;

  let max = 1;
  let current = 1;
  let currentStart = sortedDates.value[0]!;
  let bestStart = sortedDates.value[0]!;
  let bestEnd = sortedDates.value[0]!;

  for (let i = 1; i < sortedDates.value.length; i++) {
    const curr = sortedDates.value[i]!;
    const prev = sortedDates.value[i - 1]!;
    if (curr.diff(prev, 'day') === 1) {
      current++;
      if (current > max) {
        max = current;
        bestStart = currentStart;
        bestEnd = curr;
      }
    } else {
      current = 1;
      currentStart = curr;
    }
  }

  const range = max > 1 ? `${fmt(bestStart)} – ${fmt(bestEnd)}` : null;
  return { days: max, range };
});

const currentStreak = computed(() => currentStreakData.value?.days ?? null);
const bestStreak = computed(() => bestStreakData.value?.days ?? null);
const worstStreak = computed(() => worstStreakData.value?.days ?? null);

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
        <q-card-section
          v-if="activeInfo && (activeInfo === 'current' ? currentStreakData?.range : activeInfo === 'best' ? bestStreakData?.range : worstStreakData?.range)"
          class="q-pt-none"
        >
          <p class="mb-0 text-xs opacity-50">
            {{
              activeInfo === 'current' ? currentStreakData?.range
              : activeInfo === 'best' ? bestStreakData?.range
              : worstStreakData?.range
            }}
          </p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped></style>
