<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMemoryStore, useAiStore } from '@/stores';
import { marked } from 'marked';
import dayjs from 'dayjs';

const memoryStore = useMemoryStore();
const aiStore = useAiStore();
const showRegenerateModal = ref(false);

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

const html = computed(() => marked(aiStore?.response?.replace(/^<!-- .* -->\n/, '') || ''));
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

    <!-- Loading state -->
    <div v-if="aiStore.isLoading" class="flex-1 flex flex-col items-center gap-4 justify-center">
      <q-spinner color="primary" size="50px" />
      <p>Your response is being generated...</p>
    </div>

    <!-- Response box (always full height) -->
    <div
      v-else-if="aiStore.response"
      class="flex-1 min-h-0 border border-current/10 rounded-lg flex flex-col"
    >
      <!-- Box header -->
      <div class="flex justify-between items-center px-4 pt-3 pb-2 shrink-0">
        <p v-if="lastAnalyzedLabel" class="text-xs opacity-40 m-0">{{ lastAnalyzedLabel }}</p>
        <q-btn
          flat
          round
          size="sm"
          color="white"
          class="opacity-80"
          icon="sym_o_refresh"
          :loading="aiStore.isLoading"
          :disable="aiStore.isLoading || !aiStore.hasKey"
          @click="showRegenerateModal = true"
        />
      </div>
      <!-- Scrollable content -->
      <div class="flex-1 overflow-y-auto px-4 pb-4">
        <p v-if="aiStore.response" class="markdown text-sm m-0" v-html="html" />
        <p v-else class="text-sm opacity-30 m-0 pt-6 text-center">No analysis yet.</p>
      </div>
    </div>

    <!-- Analyze button -->
    <div v-else class="mt-4 text-center">
      <p>
        You can use your AI model to analyze your migraine data for any possible trends. This
        process may take a few moments.
      </p>
      <q-btn
        unelevated
        no-caps
        :label="aiStore.isLoading ? 'Analyzing...' : 'Analyze My Migraines'"
        color="primary"
        class="w-full mt-2 shrink-0"
        :loading="aiStore.isLoading"
        :disable="aiStore.isLoading || !aiStore.hasKey"
        @click="analyze"
      />
    </div>

    <q-dialog v-model="showRegenerateModal" class="shadow-none">
      <q-card class="shadow-none" style="min-width: 260px">
        <q-card-section>
          <p class="text-xl font-semibold mb-0">Regenerate Response?</p>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <p class="mb-4">
            Are you sure you want to regenerate the AI response? This will overwrite your previous
            response.
          </p>
          <div class="flex flex-col gap-2">
            <q-btn
              unelevated
              no-caps
              label="Regenerate"
              color="primary"
              class="flex-1"
              @click="
                showRegenerateModal = false;
                analyze();
              "
            />
            <q-btn
              unelevated
              no-caps
              label="Cancel"
              class="flex-1"
              @click="showRegenerateModal = false"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped></style>
