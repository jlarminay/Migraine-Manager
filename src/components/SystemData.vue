<script setup lang="ts">
import { ref } from 'vue';
import { useAiStore } from '@/stores';
import { ChangelogModal, AiSetupModal, AiRemoveModal } from '@/components';

const aiStore = useAiStore();
const showChangelogModal = ref(false);
const showAiSetupModal = ref(false);
const showAiRemoveModal = ref(false);

const providerLabels: Record<string, string> = {
  gemini: 'Gemini',
  openai: 'OpenAI',
  claude: 'Claude',
  ollama: 'Ollama',
};

function handleAiClick() {
  if (aiStore.enabled) {
    showAiRemoveModal.value = true;
  } else {
    showAiSetupModal.value = true;
  }
}
</script>

<template>
  <div>
    <p class="text-lg mb-2">System Data</p>
    <div
      class="flex justify-between border border-current/10 px-3 py-2.5 rounded-t-lg cursor-pointer"
      @click="showChangelogModal = true"
    >
      <p class="m-0 p-0">Version</p>
      <p class="opacity-70 m-0 p-0">
        2.0.0-pre
        <q-icon name="sym_o_info" />
      </p>
    </div>
    <div
      class="flex justify-between border border-current/10 border-t-0 px-3 py-2.5 rounded-b-lg cursor-pointer"
      @click="handleAiClick"
    >
      <div>
        <p class="m-0 p-0">
          AI Assistant
          <span class="text-[10px] bg-orange-700 text-white px-1 py-0 rounded-full">BETA</span>
        </p>
      </div>
      <p class="opacity-70 flex items-center gap-2 m-0 p-0">
        <span
          class="block w-2.5 h-2.5 rounded-full"
          :class="aiStore.enabled ? 'bg-green-500' : 'bg-red-700'"
        />
        {{ aiStore.enabled ? providerLabels[aiStore.provider] : 'Disabled' }}
      </p>
    </div>

    <ChangelogModal v-model="showChangelogModal" />
    <AiSetupModal v-model="showAiSetupModal" @close="showAiSetupModal = false" />
    <AiRemoveModal v-model="showAiRemoveModal" @close="showAiRemoveModal = false" />
  </div>
</template>

<style scoped></style>
