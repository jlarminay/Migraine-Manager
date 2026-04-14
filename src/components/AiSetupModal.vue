<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAiStore } from '@/stores';
import type { AiProvider } from '@/stores';

const aiStore = useAiStore();
const emits = defineEmits(['close']);

const step = ref<1 | 2 | 3>(1);
const tempProvider = ref<AiProvider>('gemini');
const tempKey = ref('');
const tempUrl = ref('');
const tempModel = ref('');
const ollamaModels = ref<string[]>([]);
const loadingModels = ref(false);
const modelsError = ref('');

const providers: { value: AiProvider; label: string; placeholder: string }[] = [
  { value: 'gemini', label: 'Gemini', placeholder: 'AIza...' },
  { value: 'openai', label: 'ChatGPT', placeholder: 'sk-...' },
  { value: 'claude', label: 'Claude', placeholder: 'sk-ant-...' },
  { value: 'ollama', label: 'Ollama', placeholder: 'http://localhost:11434' },
];

const currentProvider = computed(() => providers.find((p) => p.value === tempProvider.value)!);
const isOllama = computed(() => tempProvider.value === 'ollama');

function reset() {
  step.value = 1;
  tempProvider.value = aiStore.provider;
  tempKey.value =
    aiStore.provider !== 'ollama'
      ? (aiStore.keys[aiStore.provider as keyof typeof aiStore.keys] ?? '')
      : '';
  tempUrl.value = aiStore.ollamaUrl;
  tempModel.value = aiStore.ollamaModel;
  ollamaModels.value = [];
  modelsError.value = '';
}

function selectProvider(p: AiProvider) {
  tempProvider.value = p;
  tempKey.value = p !== 'ollama' ? (aiStore.keys[p as keyof typeof aiStore.keys] ?? '') : '';
  tempUrl.value = aiStore.ollamaUrl;
  tempModel.value = aiStore.ollamaModel;
  step.value = 2;
}

const debugLog = ref<string[]>([]);

async function fetchModels() {
  loadingModels.value = true;
  modelsError.value = '';
  ollamaModels.value = [];
  debugLog.value = [];

  const base = tempUrl.value.trim().replace(/\/$/, '');
  const url = base + '/api/tags';
  debugLog.value.push(`URL: ${url}`);
  debugLog.value.push(`App origin: ${window.location.origin}`);
  debugLog.value.push(`App href: ${window.location.href}`);

  // Step 1: no-cors probe — tells us if the host is reachable at all
  try {
    debugLog.value.push('Probe (no-cors)...');
    await fetch(base, { mode: 'no-cors' });
    debugLog.value.push('Probe OK — host is reachable (likely a CORS issue)');
  } catch (probeErr: any) {
    debugLog.value.push(`Probe FAILED — host unreachable: ${probeErr?.message}`);
    debugLog.value.push('Check: is Ollama bound to 0.0.0.0? (OLLAMA_HOST=0.0.0.0)');
    debugLog.value.push('Check: is port 11434 open in your firewall?');
    modelsError.value = 'Host unreachable — see debug log';
    loadingModels.value = false;
    return;
  }

  // Step 2: real request
  try {
    debugLog.value.push('Fetching /api/tags...');
    const res = await fetch(url);
    debugLog.value.push(`Status: ${res.status} ${res.statusText}`);
    debugLog.value.push(`Headers: ${JSON.stringify(Object.fromEntries(res.headers.entries()))}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();
    debugLog.value.push(`Body: ${JSON.stringify(data).slice(0, 300)}`);
    ollamaModels.value = (data.models ?? []).map((m: { name: string }) => m.name);
    if (!ollamaModels.value.length) throw new Error('No models found');
    if (!tempModel.value || !ollamaModels.value.includes(tempModel.value)) {
      tempModel.value = ollamaModels.value[0] ?? '';
    }
    step.value = 3;
  } catch (err: any) {
    debugLog.value.push(`Error type: ${err?.constructor?.name}`);
    debugLog.value.push(`Error message: ${err?.message}`);
    debugLog.value.push('If probe passed but this failed, set OLLAMA_ORIGINS=* on your server');
    modelsError.value = err?.message || 'Could not connect to Ollama';
  } finally {
    loadingModels.value = false;
  }
}

function confirm() {
  aiStore.setProvider(tempProvider.value);
  if (isOllama.value) {
    aiStore.setOllamaUrl(tempUrl.value.trim());
    aiStore.setOllamaModel(tempModel.value);
  } else {
    aiStore.setKey(tempProvider.value, tempKey.value.trim());
  }
  aiStore.setEnabled(true);
  emits('close');
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

        <q-card-section class="flex flex-wrap">
          <div v-for="p in providers" :key="p.value" class="w-1/2 even:pl-1 odd:pr-1 pb-2">
            <button
              class="w-full px-4 py-3 rounded-lg border text-center border-current/10 bg-transparent cursor-pointer"
              @click="selectProvider(p.value)"
            >
              <q-icon :name="`img:/${p.value}.svg`" size="28px" class="invert" />
              <p class="font-medium m-0 p-0 mt-2 text-white">{{ p.label }}</p>
            </button>
          </div>
        </q-card-section>
      </template>

      <!-- Step 2: Enter key (non-Ollama) or URL (Ollama) -->
      <template v-else-if="step === 2">
        <q-card-section>
          <p class="text-xl font-semibold m-0 mb-1">
            {{ isOllama ? 'Ollama URL' : `${currentProvider.label} API Key` }}
          </p>
          <p class="text-sm opacity-60 m-0">
            {{
              isOllama
                ? 'Enter the base URL of your Ollama instance.'
                : 'Paste your API key below to get started.'
            }}
          </p>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-if="isOllama"
            v-model="tempUrl"
            outlined
            dense
            dark
            label="Ollama URL"
            :placeholder="currentProvider.placeholder"
            :error="!!modelsError"
            :error-message="modelsError"
            autofocus
            @keyup.enter="tempUrl.trim() && fetchModels()"
          />

          <!-- DEBUG -->
          <div
            v-if="debugLog.length"
            class="mt-2 p-2 rounded text-xs font-mono bg-black/40 border border-white/10 overflow-x-auto"
            style="max-height: 160px; overflow-y: auto"
          >
            <div v-for="(line, i) in debugLog" :key="i" class="whitespace-pre-wrap break-all opacity-80">{{ line }}</div>
          </div>
          <q-input
            v-else
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
              v-if="isOllama"
              unelevated
              no-caps
              label="Next"
              color="primary"
              class="w-full"
              :disable="!tempUrl.trim()"
              :loading="loadingModels"
              @click="fetchModels"
            />
            <q-btn
              v-else
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

      <!-- Step 3: Ollama model selection -->
      <template v-else>
        <q-card-section>
          <p class="text-xl font-semibold m-0 mb-1">Select Model</p>
          <p class="text-sm opacity-60 m-0">Choose a model from your Ollama instance.</p>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list dense>
            <q-item
              v-for="model in ollamaModels"
              :key="model"
              clickable
              :active="tempModel === model"
              active-class="text-primary"
              class="rounded-lg"
              @click="tempModel = model"
            >
              <q-item-section avatar>
                <q-icon
                  :name="tempModel === model ? 'radio_button_checked' : 'radio_button_unchecked'"
                  size="18px"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-mono text-sm">{{ model }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="flex gap-2 mt-4">
            <q-btn
              unelevated
              no-caps
              label="Enable"
              color="primary"
              class="flex-1"
              :disable="!tempModel"
              @click="confirm"
            />
          </div>
        </q-card-section>
      </template>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
