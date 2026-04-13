<script setup lang="ts">
import { ref } from 'vue';
import { useMemoryStore } from '@/stores';
import { ClearMemoryModal, ChangelogModal } from '@/components';

const memoryStore = useMemoryStore();
const fileInput = ref<HTMLInputElement | null>(null);
const showClearModal = ref(false);
const showChangelogModal = ref(false);
</script>

<template>
  <div>
    <div>
      <p class="text-2xl">Settings</p>
    </div>

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

      <div class="mt-6">
        <p class="text-lg mb-2">System Data</p>
        <div class="flex justify-between" @click="showChangelogModal = true">
          <p>Version</p>
          <p class="opacity-70">
            1.3.1
            <q-icon name="sym_o_info" class="mb-1" />
          </p>
        </div>
      </div>

      <div class="mt-6">
        <p class="text-lg mb-2">Links</p>
        <div class="flex justify-between gap-2">
          <a
            href="https://github.com/jlarminay/Migraine-Manager"
            target="_blank"
            class="flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border border-gray-200 dark:border-gray-700 no-underline text-inherit"
          >
            <q-icon name="img:/github.svg" size="28px" class="invert" />
            <span class="text-sm">Github</span>
          </a>
          <a
            href="https://joshlarminay.com"
            target="_blank"
            class="flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border border-gray-200 dark:border-gray-700 no-underline text-inherit"
          >
            <q-icon name="sym_o_language" size="28px" />
            <span class="text-sm">Website</span>
          </a>
        </div>
      </div>
    </div>

    <ClearMemoryModal
      v-model="showClearModal"
      @clear="
        memoryStore.clearMemory();
        showClearModal = false;
      "
    />

    <ChangelogModal v-model="showChangelogModal" />
  </div>
</template>

<style scoped></style>
