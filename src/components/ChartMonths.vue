<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { useMemoryStore } from '@/stores';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const memoryStore = useMemoryStore();

const STORAGE_KEY = 'chartMonths_selectedYears';
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const YEAR_COLORS = ['#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0284c7', '#b45309'];

const byYear = computed(() => {
  const map: Record<number, number[]> = {};
  for (const item of memoryStore.entries) {
    const d = dayjs(item.date, 'YYYY/MM/DD');
    if (!d.isValid()) continue;
    const year = d.year();
    if (!map[year]) map[year] = Array(12).fill(0) as number[];
    map[year][d.month()] = (map[year][d.month()] ?? 0) + 1;
  }
  return map;
});

const years = computed(() => Object.keys(byYear.value).map(Number).sort());

// Storage format: null = "all years" mode, number[] = custom selection
function loadStored(): { mode: 'all' } | { mode: 'custom'; years: Set<number> } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed === null) return { mode: 'all' };
      if (Array.isArray(parsed)) return { mode: 'custom', years: new Set(parsed as number[]) };
    }
  } catch {}
  return { mode: 'all' }; // default: all years
}

const stored = loadStored();
const isAllYearsMode = ref(stored.mode === 'all');
const customYears = ref<Set<number>>(stored.mode === 'custom' ? stored.years : new Set());

// Effective selection: in all-years mode this is always reactive to new data
const selectedYears = computed(() =>
  isAllYearsMode.value ? new Set(years.value) : customYears.value,
);

function persist() {
  const value = isAllYearsMode.value ? null : [...customYears.value];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

const allSelected = computed(() => isAllYearsMode.value);

function toggleAll() {
  if (isAllYearsMode.value) {
    // Switch to custom mode with empty selection
    isAllYearsMode.value = false;
    customYears.value = new Set();
  } else {
    // Switch to all-years mode
    isAllYearsMode.value = true;
    customYears.value = new Set();
  }
  persist();
}

function toggleYear(year: number) {
  // Any individual toggle switches to custom mode
  const next = new Set(selectedYears.value);
  if (next.has(year)) {
    next.delete(year);
  } else {
    next.add(year);
  }
  isAllYearsMode.value = false;
  customYears.value = next;
  persist();
}

const datasets = computed(() => {
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month();

  return years.value
    .filter((year) => selectedYears.value.has(year))
    .map((year) => {
      const globalIdx = years.value.indexOf(year);
      const counts = byYear.value[year] ?? (Array(12).fill(0) as number[]);
      const data: (number | null)[] = counts.map((count, monthIdx) => {
        if (year === currentYear && monthIdx > currentMonth) return null;
        return count;
      });
      return {
        label: String(year),
        data,
        borderColor: YEAR_COLORS[globalIdx % YEAR_COLORS.length],
        backgroundColor: YEAR_COLORS[globalIdx % YEAR_COLORS.length],
        fill: false,
        tension: 0.2,
        pointRadius: 3,
        borderWidth: 1.5,
        spanGaps: false,
      };
    });
});

const showSettings = ref(false);
</script>

<template>
  <div class="rounded-lg border border-current/10 p-3">
    <div class="flex items-center justify-between mb-2">
      <p class="text-lg m-0">By Month</p>
      <q-btn
        flat
        round
        size="sm"
        color="white"
        class="opacity-80"
        icon="sym_o_settings"
        @click="showSettings = true"
      />
    </div>
    <div
      v-if="datasets.length === 0"
      class="flex items-center justify-center py-10 opacity-40 text-sm"
    >
      No years selected
    </div>
    <Line
      v-else
      :data="{ labels: MONTH_LABELS, datasets }"
      :options="{
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0 },
          },
        },
      }"
    />

    <q-dialog v-model="showSettings" class="shadow-none">
      <q-card class="shadow-none" style="min-width: 260px">
        <q-card-section>
          <p class="text-xl font-semibold mb-0">Options</p>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-item dense tag="label" class="px-0">
            <q-item-section side>
              <q-checkbox :model-value="allSelected" @update:model-value="toggleAll" />
            </q-item-section>
            <q-item-section>
              <q-item-label>All Years</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator class="my-1" />
          <q-item v-for="year in years" :key="year" dense tag="label" class="px-0">
            <q-item-section side>
              <q-checkbox
                :model-value="selectedYears.has(year)"
                @update:model-value="toggleYear(year)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ year }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span
                class="w-3 h-3 rounded-full inline-block mr-2.5"
                :style="{ backgroundColor: YEAR_COLORS[years.indexOf(year) % YEAR_COLORS.length] }"
              />
            </q-item-section>
          </q-item>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped></style>
