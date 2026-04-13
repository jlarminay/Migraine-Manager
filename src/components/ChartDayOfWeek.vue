<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { useMemoryStore } from '@/stores';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const memoryStore = useMemoryStore();

const numbersByDay = computed(() => {
  const dayCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  memoryStore.entries.forEach((item) => {
    const day = dayjs(item.date, 'YYYY/MM/DD').day();
    dayCounts[day] = (dayCounts[day] ?? 0) + 1;
  });
  return dayCounts;
});
</script>

<template>
  <div class="rounded-lg border border-current/10 p-3">
    <p class="text-lg mb-2">By Weekday</p>
    <Bar
      :data="{
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
          {
            label: 'Count',
            data: Object.values(numbersByDay),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(201, 203, 207, 0.2)',
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(201, 203, 207)',
            ],
            borderWidth: 1,
          },
        ],
      }"
      :options="{
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
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
