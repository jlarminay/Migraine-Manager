<script setup lang="ts">
const emits = defineEmits<{
  (e: 'remove'): void;
}>();
</script>

<template>
  <q-dialog class="shadow-none">
    <q-card class="shadow-none">
      <q-card-section>
        <p class="text-xl font-semibold mb-0 pb-0">Remove from Calendar</p>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Do you want to remove the migraine entry for this date?

        <div class="flex flex-col gap-2 mt-4">
          <q-btn outline no-caps label="No, keep it" class="w-full" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Yes, remove it"
            class="w-full"
            @click="emits('remove')"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
