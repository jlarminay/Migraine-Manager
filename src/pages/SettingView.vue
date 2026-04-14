<script setup lang="ts">
import { ImportExportButtons, SystemData } from '@/components';
</script>

<template>
  <div>
    <div>
      <p class="text-2xl">Settings</p>
    </div>

    <SystemData />

    <ImportExportButtons />

    <div class="mt-4">
      <p class="text-lg mb-2">Links</p>
      <div class="flex justify-between gap-2">
        <a
          href="https://github.com/jlarminay/Migraine-Manager"
          target="_blank"
          class="flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border border-current/10 no-underline text-inherit"
        >
          <q-icon name="img:/github.svg" size="28px" class="invert" />
          <span class="text-sm">Github</span>
        </a>
        <a
          href="https://joshlarminay.com"
          target="_blank"
          class="flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border border-current/10 no-underline text-inherit"
        >
          <q-icon name="sym_o_language" size="28px" />
          <span class="text-sm">Website</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
