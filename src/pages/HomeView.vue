<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AddToCalendar, RemoveFromCalendar } from '@/components';
import { useMemoryStore } from '@/stores';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

const memoryStore = useMemoryStore();
const showAddModal = ref(false);
const showRemoveModal = ref(false);
const date = ref<string>('');
const selectedDate = ref<string>('');
const currentView = ref<{ year: number; month: number }>({
  year: dayjs().year(),
  month: dayjs().month() + 1,
});
const currentMonthItems = ref<Array<{ date: string; type: 'evening' | 'morning' }>>([]);
const qDateRef = ref<any>(null);

function handleSwipe({ direction }: { direction: string }) {
  const delta = direction === 'left' ? 1 : -1;
  let { year, month } = currentView.value;
  month += delta;
  if (month > 12) {
    month = 1;
    year++;
  }
  if (month < 1) {
    month = 12;
    year--;
  }

  const now = dayjs();
  if (year > now.year() || (year === now.year() && month > now.month() + 1)) return;

  currentView.value = { year, month };
  resetData();
  qDateRef.value?.setCalendarTo(year, month);
}

onMounted(() => {
  memoryStore.load();
  resetData();
});

function resetData() {
  currentMonthItems.value = memoryStore.getMonth(currentView.value.year, currentView.value.month);
  currentMonthItems.value.sort((a, b) => (a.date > b.date ? -1 : 1));
}

function changeCurrentView(event: { year: number; month: number }) {
  currentView.value = { year: event.year, month: event.month };
  resetData();
}
function selectDate(dateStr: string) {
  // check which modal to show

  if (currentMonthItems.value.find((item) => item.date === dateStr)) {
    showRemoveModal.value = true;
    selectedDate.value = dateStr;
    date.value = '';
    return;
  } else {
    selectedDate.value = dateStr;
    showAddModal.value = true;
    date.value = '';
    return;
  }
}
function setDateValue(type: 'evening' | 'morning') {
  if (!selectedDate.value) return;
  memoryStore.set(selectedDate.value, type);
  showAddModal.value = false;
  resetData();
}
function removeDateValue() {
  if (!selectedDate.value) return;
  memoryStore.remove(selectedDate.value);
  showRemoveModal.value = false;
  resetData();
}
function setToday() {
  qDateRef.value?.setCalendarTo(dayjs().year(), dayjs().month() + 1);
}
</script>

<template>
  <div class="flex flex-col relative h-full min-h-0" v-auto-animate>
    <div class="flex justify-between items-center mb-4">
      <p class="text-2xl m-0 p-0">Migraine Manager</p>
      <q-btn no-caps outline color="white" label="Today" size="12px" @click="setToday" />
    </div>

    <div class="flex-1 flex flex-col min-h-0" v-touch-swipe.horizontal="handleSwipe">
      <q-date
        ref="qDateRef"
        v-model="date"
        minimal
        flat
        mask="YYYY/MM/DD"
        class="w-full bg-transparent pb-0"
        color="purple"
        :events="currentMonthItems.map((d) => d.date)"
        :event-color="
          (d) =>
            currentMonthItems.find((item) => item.date === d)?.type === 'evening'
              ? 'blue-5'
              : 'red-5'
        "
        :navigation-max-year-month="dayjs().format('YYYY/MM')"
        @update:model-value="selectDate"
        @navigation="changeCurrentView"
      />

      <div
        class="border-t border-current/10 pt-4 flex-1 px-3 min-h-0 overflow-y-auto"
        v-auto-animate
      >
        <div
          v-for="item in currentMonthItems"
          :key="item.date"
          class="mb-4 flex gap-2 items-center"
        >
          <q-icon
            :name="item.type === 'morning' ? 'sym_o_wb_sunny' : 'sym_o_bedtime'"
            size="22px"
            :class="{
              'text-red-500': item.type === 'morning',
              'text-blue-500': item.type === 'evening',
            }"
          />
          <p class="mb-0 capitalize">{{ item.type }}</p>
          <span class="grow" />
          <p class="mb-0">{{ dayjs(item.date).format('dddd Do') }}</p>
        </div>
        <p v-if="currentMonthItems.length === 0" class="text-center italic opacity-70">
          No migraines this month!
        </p>
      </div>
    </div>

    <AddToCalendar v-model="showAddModal" @update="setDateValue" />
    <RemoveFromCalendar v-model="showRemoveModal" @remove="removeDateValue" />
  </div>
</template>

<style scoped></style>
