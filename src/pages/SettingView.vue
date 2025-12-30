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

    <div>
      <p>STUFF WILL GO HERE</p>
      <ul>
        <li>About info</li>
        <li>Data management (export/import/delete)</li>
        <li>Version</li>
        <li></li>
      </ul>

      <q-btn
        unelevated
        no-caps
        label="Clear All Data"
        color="negative"
        class="w-full mt-4"
        @click="showClearModal = true"
      />
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
