<template>
  <ion-page>
    <ion-content :fullscreen="true" class="q-content">
      <img class="bg-photo" :src="bgImg" alt="" aria-hidden="true" />
      <div class="bg-overlay"></div>

      <div class="q-wrap">
        <!-- Progression + retour -->
        <header class="q-head">
          <button class="back" :disabled="ob.isFirst" @click="goPrev">
            <ion-icon :icon="chevronBack" />
          </button>
          <progress-bar :current="ob.currentBlockIndex + 1" :total="QUIZ_BLOCKS.length" />
        </header>

        <!-- Énoncé animé (clé = id pour rejouer l'animation à chaque question) -->
        <div class="q-title-wrap">
          <fade-in-words
            :key="q.id"
            class="q-title"
            tag="h1"
            :text="questionTitle"
            :stagger="40"
          />
          <p v-if="questionHint" class="q-hint">{{ questionHint }}</p>
        </div>

        <!-- Zone de réponse selon le type -->
        <div class="q-body">
          <!-- Choix unique -->
          <div v-if="q.type === 'single'" class="options">
            <choice-option
              v-for="opt in q.options"
              :key="opt.value"
              :label="optionLabel(opt.value)"
              :selected="answer === opt.value"
              @select="selectSingle(opt.value)"
            />
          </div>

          <!-- Choix multiple -->
          <div v-else-if="q.type === 'multi'" class="options">
            <choice-option
              v-for="opt in q.options"
              :key="opt.value"
              multi
              :label="optionLabel(opt.value)"
              :selected="isChecked(opt.value)"
              @select="toggleMulti(opt.value)"
            />
          </div>

          <!-- Date de naissance -->
          <date-picker
            v-else-if="q.type === 'date'"
            :model-value="answer || ''"
            @update:model-value="selectSingle($event)"
          />

          <!-- Pays + ville -->
          <country-city-input
            v-else-if="q.type === 'country_city'"
            :model-value="answer || { country: 'BJ', city: '' }"
            @update:model-value="selectSingle($event)"
          />

          <!-- Église + dénomination -->
          <church-input
            v-else-if="q.type === 'church'"
            :model-value="answer || {}"
            :options="q.options"
            @update:model-value="selectSingle($event)"
          />
        </div>

        <!-- Actions -->
        <div class="q-actions">
          <button class="primary-pill" :disabled="!ob.canGoNext" @click="goNext">
            {{ ob.isLast ? t('onboarding.quiz.finish') : t('onboarding.quiz.next') }}
          </button>
          <button v-if="q.optional" class="skip-link" @click="goNext">
            {{ t('onboarding.quiz.skipQuestion') }}
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { chevronBack } from 'ionicons/icons'
import { useOnboardingStore } from '@/stores/onboarding'
import { useAuthStore } from '@/stores/auth'
import { QUIZ_BLOCKS } from '@/data/onboardingQuiz'
import FadeInWords from '@/components/shared/FadeInWords.vue'
import ProgressBar from '@/components/shared/ProgressBar.vue'
import ChoiceOption from '@/components/onboarding/ChoiceOption.vue'
import DatePicker from '@/components/onboarding/DatePicker.vue'
import CountryCityInput from '@/components/onboarding/CountryCityInput.vue'
import ChurchInput from '@/components/onboarding/ChurchInput.vue'
import bgImg from '@/assets/images/welcome-cross.jpg'

const { t } = useI18n()
const router = useRouter()
const ob = useOnboardingStore()
const auth = useAuthStore()

const q = computed(() => ob.currentQuestion)
const answer = computed(() => ob.answers[q.value?.id])

// Titre de la question, avec injection du prénom (règle de marque).
const questionTitle = computed(() =>
  t(`onboarding.quiz.${q.value.id}.title`, { name: auth.firstName })
)
const questionHint = computed(() => {
  const key = `onboarding.quiz.${q.value.id}.hint`
  const txt = t(key, { name: auth.firstName })
  return txt === key ? '' : txt // pas de hint défini → vide
})

function optionLabel(value) {
  return t(`onboarding.quiz.${q.value.id}.options.${value}`)
}

function selectSingle(value) {
  ob.setAnswer(q.value.id, value)
}

function isChecked(value) {
  const v = ob.answers[q.value.id]
  return Array.isArray(v) && v.includes(value)
}

function toggleMulti(value) {
  const cur = Array.isArray(ob.answers[q.value.id]) ? [...ob.answers[q.value.id]] : []
  const i = cur.indexOf(value)
  if (i >= 0) cur.splice(i, 1)
  else cur.push(value)
  ob.setAnswer(q.value.id, cur)
}

function goPrev() {
  ob.prev()
}

function goNext() {
  if (ob.isLast) {
    router.replace('/onboarding/reveal')
  } else {
    ob.next()
  }
}
</script>

<style scoped>
.q-content { --background: var(--navy); }

.bg-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  opacity: 0.08;
  z-index: 0;
  pointer-events: none;
}
.bg-overlay {
  position: absolute;
  inset: 0;
  background: var(--navy);
  opacity: 0.86;
  z-index: 0;
  pointer-events: none;
}

.q-wrap {
  position: relative;
  z-index: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: calc(env(safe-area-inset-top, 0px) + var(--space-6)) var(--space-6) var(--space-8);
  max-width: 540px;
  margin: 0 auto;
}

/* En-tête : retour + progression */
.q-head { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-8); }
.back {
  flex: 0 0 auto;
  background: none;
  border: none;
  color: var(--cream-70);
  font-size: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0;
}
.back:disabled { opacity: 0; pointer-events: none; }

/* Énoncé */
.q-title-wrap { margin-bottom: var(--space-8); }
.q-title {
  font-family: var(--font-app);
  font-weight: 700;
  font-size: 1.9rem;
  line-height: 1.3;
  color: var(--cream);
  margin: 0;
}
.q-hint {
  font-family: var(--font-app);
  font-size: 1rem;
  color: var(--muted);
  margin: var(--space-3) 0 0;
  line-height: 1.5;
}

/* Corps (réponses) */
.q-body { flex: 1 1 auto; }
.options { display: flex; flex-direction: column; gap: var(--space-3); }

/* Actions */
.q-actions {
  margin-top: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.primary-pill {
  width: 100%;
  padding: 17px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--cream);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--duration-fast), opacity var(--duration-normal);
}
.primary-pill:active { transform: scale(0.98); }
.primary-pill:disabled { opacity: 0.5; cursor: not-allowed; }
.skip-link {
  background: none;
  border: none;
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 14px;
  cursor: pointer;
  padding: var(--space-2);
}
.skip-link:hover { color: var(--cream); }
</style>
