<template>
  <div class="loc">
    <label class="field">
      <span class="field-label">{{ t('onboarding.quiz.q3.countryLabel') }}</span>
      <select class="input select" :value="country" @change="onCountry($event.target.value)">
        <option v-for="c in countries" :key="c.code" :value="c.code">{{ c.name }}</option>
      </select>
    </label>

    <label class="field">
      <span class="field-label">{{ t('onboarding.quiz.q3.cityLabel') }}</span>
      <input
        type="text"
        class="input"
        :value="city"
        :placeholder="t('onboarding.quiz.q3.cityPlaceholder')"
        @input="onCity($event.target.value)"
      />
    </label>
  </div>
</template>

<script setup>
/** Pays (liste, Bénin par défaut) + ville (texte libre). */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Object, default: () => ({ country: 'BJ', city: '' }) }
})
const emit = defineEmits(['update:modelValue'])

// Liste courte ciblée Afrique de l'Ouest + francophonie, Bénin par défaut.
const countries = [
  { code: 'BJ', name: 'Bénin' },
  { code: 'TG', name: 'Togo' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'NE', name: 'Niger' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'ML', name: 'Mali' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'CD', name: 'RD Congo' },
  { code: 'CG', name: 'Congo' },
  { code: 'GA', name: 'Gabon' },
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'États-Unis' },
  { code: 'OTHER', name: 'Autre' }
]

const country = computed(() => props.modelValue?.country || 'BJ')
const city = computed(() => props.modelValue?.city || '')

function onCountry(v) {
  emit('update:modelValue', { country: v, city: city.value })
}
function onCity(v) {
  emit('update:modelValue', { country: country.value, city: v })
}
</script>

<style scoped>
.loc { display: flex; flex-direction: column; gap: var(--space-5); }
.field { display: flex; flex-direction: column; }
.field-label {
  font-family: var(--font-app);
  font-size: 13px;
  color: var(--muted);
  margin-bottom: var(--space-2);
}
.input {
  background-color: var(--navy2);
  border: 1px solid var(--gold-border-md);
  color: var(--cream);
  padding: 16px 18px;
  border-radius: var(--radius-md);
  font-family: var(--font-app);
  font-size: 1.05rem;
}
.input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
}
.select { appearance: none; }
</style>
