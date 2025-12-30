<script setup lang="ts">
import { ref } from 'vue';
import { useMemoryStore } from '@/stores';
import { ClearMemoryModal } from '@/components';

const memoryStore = useMemoryStore();
const showClearModal = ref(false);
</script>

<template>
  <div>
    <div>
      <p class="text-2xl">Settings</p>
    </div>

    <div class="flex-col gap-4">
      <div class="mt-6">
        <p class="text-lg mb-2">About</p>
        <p>-</p>
      </div>

      <div class="mt-6">
        <p class="text-lg mb-2">Data Management</p>
        <q-btn unelevated no-caps label="Export Data" color="primary" class="w-full mb-2" />
        <q-btn unelevated no-caps label="Import Data" color="primary" class="w-full" />
      </div>

      <div class="mt-6">
        <p class="text-lg mb-2">Clear All Data</p>
        <q-btn
          unelevated
          no-caps
          label="Clear All Data"
          color="negative"
          class="w-full"
          @click="showClearModal = true"
        />
      </div>
    </div>

    <ClearMemoryModal
      v-model="showClearModal"
      @clear="
        memoryStore.clearMemory();
        showClearModal = false;
      "
    />
  </div>
</template>

<style scoped></style>
