<script setup lang="ts">
import { marked } from 'marked';
import changelogRaw from '../../CHANGELOG.md?raw';

defineProps<{ modelValue: boolean }>();
defineEmits(['update:modelValue']);

const html = marked(changelogRaw.replace(/^<!-- .* -->\n/, ''));
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    class="shadow-none"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="w-full max-w-md shadow-none">
      <q-card-section class="flex items-center justify-between pb-0">
        <p class="text-xl font-semibold mb-0">Changelog</p>
        <q-btn flat round dense icon="close" @click="$emit('update:modelValue', false)" />
      </q-card-section>

      <q-card-section class="overflow-y-auto" style="max-height: 70vh">
        <div class="changelog" v-html="html" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
