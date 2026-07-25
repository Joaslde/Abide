<template>
  <div class="progress" role="progressbar" :aria-valuenow="current" :aria-valuemax="total">
    <span
      v-for="i in total"
      :key="i"
      class="seg"
      :class="{ filled: i <= current }"
    />
  </div>
</template>

<script setup>
/** Barre de progression segmentée (un segment par bloc). */
defineProps({
  current: { type: Number, required: true }, // bloc courant (1-based)
  total: { type: Number, required: true }
})
</script>

<style scoped>
.progress { display: flex; gap: var(--space-2); width: 100%; }
.seg {
  flex: 1;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--gold-border);
  transition: background var(--duration-normal);
}
.seg.filled { background: var(--gold); }
</style>
