<script setup lang="ts"></script>

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
      <div class="h-14">
        <q-btn flat icon="sym_o_calendar_month" to="/" square class="w-1/3 p-4" />
        <q-btn flat icon="sym_o_bar_chart" to="/stats" square class="w-1/3 p-4" />
        <q-btn flat icon="sym_o_settings" to="/settings" square class="w-1/3 p-4" />
      </div>
    </div>
  </main>
</template>

<style scoped></style>
