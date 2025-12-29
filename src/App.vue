<script setup lang="ts"></script>

<template>
  <main class="pt-6">
    <div class="p-4 pb-8">
      <RouterView />
    </div>

    <div class="fixed bottom-0 w-full bg-black">
      <div>
        <q-btn flat icon="sym_o_calendar_month" to="/" square class="w-1/3 p-4" />
        <q-btn flat icon="sym_o_bar_chart" to="/stats" square class="w-1/3 p-4" />
        <q-btn flat icon="sym_o_settings" to="/settings" square class="w-1/3 p-4" />
      </div>
    </div>
  </main>
</template>

<style scoped></style>
