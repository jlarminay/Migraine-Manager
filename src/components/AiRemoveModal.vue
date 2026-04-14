<script setup lang="ts">
import { useAiStore } from '@/stores';

const aiStore = useAiStore();

const emits = defineEmits<{ (e: 'close'): void }>();

function confirm() {
  aiStore.clearKey();
  aiStore.clearResponse();
  emits('close');
}
</script>

<template>
  <q-dialog class="shadow-none">
    <q-card class="shadow-none">
      <q-card-section>
        <p class="text-xl font-semibold mb-0 pb-0">Disable AI Assistant</p>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Are you sure? This will disable the AI assistant and delete your stored API key.

        <div class="flex flex-col gap-2 mt-4">
          <q-btn
            unelevated
            no-caps
            label="Yes, disable"
            color="negative"
            class="w-full"
            @click="confirm"
          />
          <q-btn unelevated no-caps label="Cancel" class="w-full" v-close-popup />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
