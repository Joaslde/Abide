<template>
  <div class="church">
    <label class="field">
      <span class="field-label">{{ t('onboarding.quiz.q4.nameLabel') }}</span>
      <input
        type="text"
        class="input"
        :value="churchName"
        :placeholder="t('onboarding.quiz.q4.namePlaceholder')"
        @input="onName($event.target.value)"
      />
    </label>

    <span class="field-label">{{ t('onboarding.quiz.q4.denomLabel') }}</span>
    <div class="denoms">
      <choice-option
        v-for="opt in options"
        :key="opt.value"
        :label="t(`onboarding.quiz.q4.options.${opt.value}`)"
        :selected="denomination === opt.value"
        @select="onDenom(opt.value)"
      />
    </div>
  </div>
</template>

<script setup>
/** Nom d'église (optionnel) + dénomination (choix unique). */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ChoiceOption from './ChoiceOption.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Object, default: () => ({ church_name: '', church_denomination: '' }) },
  options: { type: Array, required: true }
})
const emit = defineEmits(['update:modelValue'])

const churchName = computed(() => props.modelValue?.church_name || '')
const denomination = computed(() => props.modelValue?.church_denomination || '')

function onName(v) {
  emit('update:modelValue', { church_name: v, church_denomination: denomination.value })
}
function onDenom(v) {
  emit('update:modelValue', { church_name: churchName.value, church_denomination: v })
}
</script>

<style scoped>
.church { display: flex; flex-direction: column; gap: var(--space-4); }
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
.denoms { display: flex; flex-direction: column; gap: var(--space-3); }
</style>
