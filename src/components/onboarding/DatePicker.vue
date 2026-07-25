<template>
  <div class="datepick">
    <ion-datetime
      presentation="date"
      :max="maxDate"
      :value="modelValue || undefined"
      locale="fr-FR"
      class="dt"
      @ionChange="onChange"
    />
    <p v-if="age !== null" class="age">{{ t('onboarding.quiz.ageLabel', { age }) }}</p>
  </div>
</template>

<script setup>
/** Sélecteur de date de naissance + affichage de l'âge calculé en direct. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IonDatetime } from '@ionic/vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: String, default: '' } // 'YYYY-MM-DD'
})
const emit = defineEmits(['update:modelValue'])

// Pas de date future ; borne basse implicite gérée par le picker.
const maxDate = new Date().toISOString().slice(0, 10)

const age = computed(() => {
  if (!props.modelValue) return null
  const b = new Date(props.modelValue)
  if (isNaN(b)) return null
  const now = new Date()
  let a = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--
  return a >= 0 ? a : null
})

function onChange(e) {
  // ion-datetime renvoie une ISO complète → on ne garde que la date.
  const v = (e.detail.value || '').slice(0, 10)
  emit('update:modelValue', v)
}
</script>

<style scoped>
.datepick { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); }
.dt {
  --background: var(--navy2);
  --background-rgb: 17, 30, 49;
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-lg);
  color: var(--cream);
  width: 100%;
  max-width: 360px;
}
.age {
  font-family: var(--font-app);
  font-size: 1.1rem;
  color: var(--gold);
  margin: 0;
}
</style>
