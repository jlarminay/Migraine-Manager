<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useMemoryStore, useAiStore } from '@/stores';
import dayjs from 'dayjs';

const memoryStore = useMemoryStore();
const aiStore = useAiStore();

const lastAnalyzedLabel = computed(() => {
  if (!aiStore.lastAnalyzedAt) return null;
  return dayjs(aiStore.lastAnalyzedAt).format('MMM D, YYYY [at] h:mm A');
});

onMounted(() => {
  memoryStore.load();
});

function analyze() {
  aiStore.analyze(memoryStore.getAll());
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="mb-4 flex items-center justify-between gap-2">
      <p class="text-2xl m-0 p-0">AI Analysis</p>
      <span class="text-xs bg-orange-700 text-white px-2 py-0.5 rounded-full">BETA</span>
    </div>

    <!-- No key warning -->
    <div
      v-if="!aiStore.hasKey"
      class="mb-4 p-3 rounded-lg border border-yellow-600 bg-yellow-900/20 text-yellow-400 text-sm"
    >
      No API key set for {{ aiStore.provider }}. Add one in Settings.
    </div>

    <!-- Error -->
    <div
      v-if="aiStore.error"
      class="p-3 rounded-lg border border-red-600 bg-red-900/20 text-red-400 text-sm"
    >
      {{ aiStore.error }}
    </div>

    <!-- Response -->
    <div v-if="aiStore.response" class="flex-1 overflow-y-auto">
      <div class="border border-gray-700 rounded-lg p-4">
        <div class="flex justify-between items-center mb-3">
          <p class="text-xs uppercase tracking-wider opacity-40">Analysis</p>
          <p v-if="lastAnalyzedLabel" class="text-xs opacity-40">{{ lastAnalyzedLabel }}</p>
        </div>
        <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ aiStore.response }}</p>
      </div>
    </div>

    <!-- Analyze button -->
    <q-btn
      unelevated
      no-caps
      :label="aiStore.isLoading ? 'Analyzing...' : 'Analyze My Migraines'"
      color="primary"
      class="w-full mt-2"
      :loading="aiStore.isLoading"
      :disable="aiStore.isLoading || !aiStore.hasKey"
      @click="analyze"
    />

    <!-- Entry count context -->
    <p class="text-sm opacity-50 text-center mt-2">
      {{ memoryStore.entries.length }} entries in your history
    </p>
  </div>
</template>

<style scoped></style>
