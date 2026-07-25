<template>
  <div class="modes">
    <button
      v-for="m in MODES"
      :key="m"
      class="mode-chip"
      :class="{ active: modelValue === m }"
      @click="$emit('update:modelValue', m)"
    >
      <ion-icon :icon="MODE_ICONS[m]" />
      <span>{{ t(`ai.modes.${m}`) }}</span>
    </button>
  </div>
</template>

<script>
import {
  bookOutline, bulbOutline, leafOutline, megaphoneOutline, libraryOutline
} from 'ionicons/icons'

// Source unique des modes — doit rester aligné sur VALID_MODES (Edge Function)
// et sur la contrainte CHECK de ai_conversations.mode.
export const MODES = ['enseignement', 'etude', 'meditation', 'predication', 'theologie']

/** Icône de chaque mode (réutilisée par le sélecteur du champ de saisie). */
export const MODE_ICONS = {
  enseignement: bookOutline,
  etude: bulbOutline,
  meditation: leafOutline,
  predication: megaphoneOutline,
  theologie: libraryOutline
}
</script>

<script setup>
import { useI18n } from 'vue-i18n'
import { IonIcon } from '@ionic/vue'

const { t } = useI18n()
defineProps({ modelValue: { type: String, default: 'enseignement' } })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.modes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
}
.mode-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-full);
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--duration-fast);
}
.mode-chip ion-icon { font-size: 15px; }
.mode-chip.active {
  border-color: var(--gold);
  color: var(--gold);
  background: var(--gold-border);
}
</style>
