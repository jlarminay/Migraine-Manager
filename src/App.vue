<script setup lang="ts">
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAiStore } from '@/stores';

const route = useRoute();
const router = useRouter();
const aiStore = useAiStore();

// Redirect away from /ai if AI is disabled while on that page
watch(
  () => aiStore.enabled,
  (enabled) => {
    if (!enabled && route.path === '/ai') {
      router.replace('/');
    }
  },
);
</script>

<template>
  <main
    class="h-screen"
    style="
      padding-top: var(--safe-area-inset-top, 24px);
      padding-bottom: calc(var(--safe-area-inset-bottom, 28px) + 56px);
    "
  >
    <div class="py-4 h-full overflow-y-scroll">
      <RouterView class="h-full px-4" />
    </div>

    <div
      class="fixed bottom-0 w-full bg-black"
      style="padding-bottom: var(--safe-area-inset-bottom, 28px)"
    >
      <div class="h-14 flex">
        <q-btn
          flat
          icon="sym_o_calendar_month"
          to="/"
          square
          class="flex-1 p-4"
          :class="route.path === '/' ? 'text-white' : 'text-gray-500'"
        />
        <q-btn
          flat
          icon="sym_o_bar_chart"
          to="/stats"
          square
          class="flex-1 p-4"
          :class="route.path === '/stats' ? 'text-white' : 'text-gray-500'"
        />
        <q-btn
          v-if="aiStore.enabled"
          flat
          icon="sym_o_smart_toy"
          to="/ai"
          square
          class="flex-1 p-4"
          :class="route.path === '/ai' ? 'text-white' : 'text-gray-500'"
        />
        <q-btn
          flat
          icon="sym_o_settings"
          to="/settings"
          square
          class="flex-1 p-4"
          :class="route.path === '/settings' ? 'text-white' : 'text-gray-500'"
        />
      </div>
    </div>
  </main>
</template>

<style scoped></style>
