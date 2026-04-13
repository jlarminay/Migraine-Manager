<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMemoryStore } from '@/stores';
import dayjs from 'dayjs';

const memoryStore = useMemoryStore();

const thisMonth = computed(() => {
  const now = dayjs();
  return memoryStore.entries.filter((e) => {
    const d = dayjs(e.date, 'YYYY/MM/DD');
    return d.year() === now.year() && d.month() === now.month();
  });
});

const lastMonth = computed(() => {
  const prev = dayjs().subtract(1, 'month');
  return memoryStore.entries.filter((e) => {
    const d = dayjs(e.date, 'YYYY/MM/DD');
    return d.year() === prev.year() && d.month() === prev.month();
  });
});

const thisYear = computed(() => {
  const year = dayjs().year();
  return memoryStore.entries.filter((e) => dayjs(e.date, 'YYYY/MM/DD').year() === year);
});

const lastYear = computed(() => {
  const year = dayjs().year() - 1;
  return memoryStore.entries.filter((e) => dayjs(e.date, 'YYYY/MM/DD').year() === year);
});

function calcDelta(current: number, previous: number): { label: string | null; class: string } {
  if (previous === 0) return { label: null, class: '' };
  const diff = current - previous;
  const pct = Math.min(999, Math.round((diff / previous) * 100));
  const label = pct > 0 ? `+${pct}%` : pct < 0 ? `${pct}%` : null;
  return { label, class: diff > 0 ? 'text-rose-400' : 'text-green-400' };
}

const proratedLastMonth = computed(() => {
  const today = dayjs();
  const pctElapsed = today.date() / today.daysInMonth();
  const cutoff = Math.floor(pctElapsed * today.subtract(1, 'month').daysInMonth());
  return lastMonth.value.filter((e) => dayjs(e.date, 'YYYY/MM/DD').date() <= cutoff);
});

const proratedLastYear = computed(() => {
  const today = dayjs();
  const startOfYear = today.startOf('year');
  const daysElapsed = today.diff(startOfYear, 'day') + 1;
  const daysInThisYear = today.endOf('year').diff(startOfYear, 'day') + 1;
  const pctElapsed = daysElapsed / daysInThisYear;

  const lastYearStart = today.subtract(1, 'year').startOf('year');
  const daysInLastYear = today.subtract(1, 'year').endOf('year').diff(lastYearStart, 'day') + 1;
  const cutoff = Math.floor(pctElapsed * daysInLastYear);

  return lastYear.value.filter((e) => {
    const d = dayjs(e.date, 'YYYY/MM/DD');
    return d.isValid() && d.diff(lastYearStart, 'day') + 1 <= cutoff;
  });
});

const monthDelta = computed(() =>
  calcDelta(thisMonth.value.length, proratedLastMonth.value.length),
);
const yearDelta = computed(() => calcDelta(thisYear.value.length, proratedLastYear.value.length));

const infos = {
  month: {
    title: 'This Month',
    description:
      "Migraines recorded this month. The % compares your count so far against the same proportion of last month — e.g. if you're 40% through this month, it's compared to the first 40% of last month.",
  },
  year: {
    title: 'This Year',
    description:
      'Migraines recorded this year. The % compares your count so far against the equivalent point in last year, based on how far through the year you are.',
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
  <div class="flex gap-2">
    <div
      class="relative flex-1 rounded-lg border border-current/10 px-3 py-2.5 cursor-pointer"
      @click="activeInfo = 'month'"
    >
      <q-icon
        name="sym_o_info"
        size="18px"
        class="pointer-events-none absolute top-1.5 right-1.5 opacity-20 leading-none"
      />
      <p class="mb-0 text-xl font-medium leading-tight">
        {{ thisMonth.length }}
        <span v-if="monthDelta.label" class="text-xs font-normal" :class="monthDelta.class">
          ({{ monthDelta.label }})
        </span>
      </p>
      <p class="mb-0 text-xs opacity-50 mt-0.5">Month</p>
    </div>
    <div
      class="relative flex-1 rounded-lg border border-current/10 px-3 py-2.5 cursor-pointer"
      @click="activeInfo = 'year'"
    >
      <q-icon
        name="sym_o_info"
        size="18px"
        class="pointer-events-none absolute top-1.5 right-1.5 opacity-20 leading-none"
      />
      <p class="mb-0 text-xl font-medium leading-tight">
        {{ thisYear.length }}
        <span v-if="yearDelta.label" class="text-xs font-normal" :class="yearDelta.class">
          ({{ yearDelta.label }})
        </span>
      </p>
      <p class="mb-0 text-xs opacity-50 mt-0.5">Year</p>
    </div>
    <div class="relative flex-1 rounded-lg border border-current/10 px-3 py-2.5 cursor-pointer">
      <p class="mb-0 text-xl font-medium leading-tight">{{ memoryStore.entries.length }}</p>
      <p class="mb-0 text-xs opacity-50 mt-0.5">All Time</p>
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
