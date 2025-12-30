<script setup lang="ts">
import { computed } from 'vue';
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

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps<{
  data: { date: string; type: 'evening' | 'morning' }[];
}>();

const typeCounts = computed(() => {
  let evening = 0;
  let morning = 0;
  for (const item of props.data) {
    if (item.type === 'evening') evening++;
    else if (item.type === 'morning') morning++;
  }
  return { evening, morning };
});
</script>

<template>
  <div>
    <p class="text-lg mb-2">Evening vs Morning</p>
    <Bar
      :data="{
        labels: ['Evening', 'Morning'],
        datasets: [
          {
            label: 'Count',
            data: [typeCounts.evening, typeCounts.morning],
            backgroundColor: [
              'oklch(62.3% 0.214 259.815 / 0.2)',
              'oklch(63.7% 0.237 25.331 / 0.2)',
            ],
            borderColor: ['oklch(62.3% 0.214 259.815)', 'oklch(63.7% 0.237 25.331)'],
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
