<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';

const date = ref<string>('');
const currentView = ref<{ year: number; month: number }>({
  year: dayjs().year(),
  month: dayjs().month() + 1,
});

function selectDate(dateStr: string) {
  console.log('Selected date:', dateStr);
  date.value = '';
}
</script>

<template>
  <div class="flex flex-col">
    <div>
      <p class="text-2xl">Migraine Manager</p>
    </div>

    <div class="grow flex flex-col">
      <pre>{{ date }}</pre>
      <pre>{{ currentView }}</pre>
      <q-date
        v-model="date"
        minimal
        flat
        mask="YYYY-MM-DD"
        class="w-full bg-transparent pb-0"
        color="purple"
        :navigation-max-year-month="dayjs().format('YYYY/MM')"
        @update:model-value="selectDate"
        @navigation="currentView = $event"
      />
      <div class="grow border-t border-gray-700 pt-4">FULL LIST WILL GO HERE</div>
    </div>
  </div>
</template>

<style scoped></style>
