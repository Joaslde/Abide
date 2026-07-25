<template>
  <button
    type="button"
    class="choice"
    :class="{ selected }"
    @click="$emit('select')"
  >
    <span class="label">{{ label }}</span>
    <span class="check" :class="{ visible: selected }">
      <ion-icon :icon="multi ? checkmark : checkmarkCircle" />
    </span>
  </button>
</template>

<script setup>
/** Carte-option réutilisable (choix unique ou multiple). */
import { IonIcon } from '@ionic/vue'
import { checkmark, checkmarkCircle } from 'ionicons/icons'

defineProps({
  label: { type: String, required: true },
  selected: { type: Boolean, default: false },
  multi: { type: Boolean, default: false }
})
defineEmits(['select'])
</script>

<style scoped>
.choice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  text-align: left;
  padding: 18px 20px;
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  background: var(--navy2);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 1.05rem;
  cursor: pointer;
  transition: border-color var(--duration-normal), background var(--duration-normal),
    transform var(--duration-fast);
}
.choice:active { transform: scale(0.99); }
.choice.selected {
  border-color: var(--gold);
  background: var(--navy3);
}
.label { flex: 1; line-height: 1.4; }
.check {
  flex: 0 0 auto;
  font-size: 22px;
  color: var(--gold);
  opacity: 0;
  transition: opacity var(--duration-normal);
  display: flex;
  align-items: center;
}
.check.visible { opacity: 1; }
</style>
