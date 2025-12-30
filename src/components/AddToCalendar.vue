<script setup lang="ts">
import type { EntryType } from '@/types';

const emits = defineEmits<{
  (e: 'update', value: EntryType): void;
}>();
</script>

<template>
  <q-dialog class="shadow-none">
    <q-card class="shadow-none">
      <q-card-section>
        <p class="text-xl font-semibold mb-0 pb-0">Add to Calendar</p>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Do you want to add a migraine entry for this date?

        <div class="flex flex-col gap-2 mt-4">
          <q-btn
            unelevated
            no-caps
            label="Morning"
            class="w-full"
            @click="emits('update', 'morning')"
          />
          <q-btn
            unelevated
            no-caps
            label="Evening"
            class="w-full"
            @click="emits('update', 'evening')"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
