<script setup lang="ts">
import { ref } from 'vue';
import { useMemoryStore, useAiStore } from '@/stores';
import { ClearMemoryModal } from '@/components';

const aiStore = useAiStore();
const memoryStore = useMemoryStore();
const fileInput = ref<HTMLInputElement | null>(null);
const showClearModal = ref(false);
</script>

<template>
  <div class="flex-col gap-4">
    <div class="mt-4">
      <p class="text-lg mb-2">Data Management</p>
      <q-btn
        unelevated
        no-caps
        label="Export Data"
        color="primary"
        class="w-full mb-2"
        @click="memoryStore.export()"
      />
      <q-btn
        unelevated
        no-caps
        label="Import Data"
        color="primary"
        class="w-full"
        @click="fileInput?.click()"
      />

      <input
        ref="fileInput"
        type="file"
        accept="text/csv,text/plain,.csv"
        class="hidden"
        @change="
          (e: any) => {
            const f = e.target.files?.[0];
            memoryStore.import(f);
            e.target.value = null;
          }
        "
      />
    </div>

    <div class="mt-4">
      <p class="text-lg mb-2">Clear All Data</p>
      <q-btn
        unelevated
        no-caps
        label="Clear All Data"
        color="negative"
        class="w-full mb-2"
        @click="showClearModal = true"
      />
    </div>

    <ClearMemoryModal
      v-model="showClearModal"
      @clear="
        aiStore.clearKey();
        aiStore.clearResponse();
        memoryStore.clearMemory();
        showClearModal = false;
      "
    />
  </div>
</template>

<style scoped></style>
