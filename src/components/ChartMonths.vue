<script setup lang="ts">
import { computed } from 'vue';
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

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const props = defineProps<{
  data: { date: string; type: 'evening' | 'morning' }[];
}>();

interface MonthData {
  label: string;
  key: string;
  count: number;
}

const monthsAllTime = computed<MonthData[]>(() => {
  if (!props.data.length) return [];
  const months: MonthData[] = [];
  for (const item of props.data) {
    const d = dayjs(item.date, 'YYYY/MM/DD');
    if (!d.isValid()) continue;
    const key = d.format('YYYY/MM');
    let month = months.find((m) => m.key === key);
    if (!month) {
      month = {
        label: d.format("MMM 'YY"),
        key,
        count: 1,
      };
      months.push(month);
    } else {
      month.count++;
    }
  }
  // Sort by key (chronological)
  months.sort((a, b) => a.key.localeCompare(b.key));

  if (months.length === 0) return [];
  const firstMonthKey = months[0]?.key;
  const lastMonthKey = months[months.length - 1]?.key;
  if (!firstMonthKey || !lastMonthKey) return months;
  const firstMonth = dayjs(`${firstMonthKey}/01`, 'YYYY/MM/DD');
  const lastMonth = dayjs(`${lastMonthKey}/01`, 'YYYY/MM/DD');
  if (!firstMonth.isValid() || !lastMonth.isValid()) return months;
  const completeMonths: MonthData[] = [];
  let currentMonth = firstMonth;
  while (currentMonth.isBefore(lastMonth) || currentMonth.isSame(lastMonth)) {
    const key = currentMonth.format('YYYY/MM');
    let month = months.find((m) => m.key === key);
    if (!month) {
      month = {
        label: currentMonth.format("MMM 'YY"),
        key,
        count: 0,
      };
    }
    completeMonths.push(month);
    currentMonth = currentMonth.add(1, 'month');
  }
  return completeMonths;
});
</script>

<template>
  <div>
    <p class="text-lg mb-2">Migraines By Month</p>
    <Line
      :data="{
        labels: monthsAllTime.map((m) => m.label),
        datasets: [
          {
            label: 'Count',
            data: monthsAllTime.map((m) => m.count),
            fill: false,
            borderColor: '#7c3aed',
            backgroundColor: '#7c3aed',
            tension: 0.2,
            pointRadius: 4,
            pointBackgroundColor: '#7c3aed',
            borderWidth: 1,
          },
        ],
      }"
      :options="{
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
            },
          },
        },
      }"
    />
  </div>
</template>

<style scoped></style>
