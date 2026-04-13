<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAiStore } from '@/stores';
import type { AiProvider } from '@/stores';

const aiStore = useAiStore();
const emits = defineEmits(['close']);

const step = ref<1 | 2>(1);
const tempProvider = ref<AiProvider>('gemini');
const tempKey = ref('');

const providers: { value: AiProvider; label: string; placeholder: string }[] = [
  {
    value: 'gemini',
    label: 'Gemini',
    placeholder: 'AIza...',
  },
  {
    value: 'openai',
    label: 'ChatGPT',
    placeholder: 'sk-...',
  },
  {
    value: 'claude',
    label: 'Claude',
    placeholder: 'sk-ant-...',
  },
];

const currentProvider = computed(() => providers.find((p) => p.value === tempProvider.value)!);

function reset() {
  step.value = 1;
  tempProvider.value = aiStore.provider;
  tempKey.value = aiStore.keys[aiStore.provider] ?? '';
}

function selectProvider(p: AiProvider) {
  tempProvider.value = p;
  tempKey.value = aiStore.keys[p] ?? '';
  step.value = 2;
}

function confirm() {
  aiStore.setProvider(tempProvider.value);
  aiStore.setKey(tempProvider.value, tempKey.value.trim());
  aiStore.setEnabled(true);
  emits('close');
}

function back() {
  step.value = 1;
}
</script>

<template>
  <q-dialog class="shadow-none" @before-show="reset">
    <q-card class="shadow-none" style="min-width: 320px">
      <!-- Step 1: Choose provider -->
      <template v-if="step === 1">
        <q-card-section>
          <p class="text-xl font-semibold mb-1">AI Assistant</p>
          <p class="text-sm opacity-60 m-0">
            Choose a provider. Your API key is stored locally and sent only to that provider.
          </p>
        </q-card-section>

        <q-card-section class="q-pt-none flex gap-2">
          <button
            v-for="p in providers"
            :key="p.value"
            class="flex-1 px-4 py-3 rounded-lg border text-center border-current/10 bg-transparent cursor-pointer"
            @click="selectProvider(p.value)"
          >
            <q-icon :name="`img:/${p.value}.svg`" size="28px" class="invert" />
            <p class="font-medium m-0 p-0 mt-2 text-white">{{ p.label }}</p>
          </button>
        </q-card-section>
      </template>

      <!-- Step 2: Enter key -->
      <template v-else>
        <q-card-section>
          <div class="flex items-center gap-2 mb-1">
            <p class="text-xl font-semibold m-0">{{ currentProvider.label }} API Key</p>
          </div>
          <p class="text-sm opacity-60 m-0">Paste your API key below to get started.</p>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="tempKey"
            outlined
            dense
            dark
            type="password"
            label="API Key"
            :placeholder="currentProvider.placeholder"
            autofocus
          />

          <div class="flex flex-col gap-2 mt-4">
            <q-btn
              unelevated
              no-caps
              label="Enable"
              color="primary"
              class="w-full"
              :disable="!tempKey.trim()"
              @click="confirm"
            />
          </div>
        </q-card-section>
      </template>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
