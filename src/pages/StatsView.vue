<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMemoryStore } from '@/stores';

const memoryStore = useMemoryStore();
const allItems = ref<Array<{ date: string; type: 'evening' | 'morning' }>>([]);

onMounted(() => {
  memoryStore.load();
  resetData();
});

function resetData() {
  allItems.value = memoryStore.getAll();
}
</script>

<template>
  <div>
    <div>
      <p class="text-2xl">Stats</p>
    </div>

    <div>
      <p>All Migraines: {{ allItems.length }}</p>
      <p>Break by day:</p>
      <p>Break by evening/morning:</p>
      <p>Show month graph from first to recent: (show current year, ytd)</p>
    </div>
  </div>
</template>

<style scoped></style>
