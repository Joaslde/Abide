<template>
  <ion-modal :is-open="open" @did-dismiss="onClose" class="quiz-modal">
    <ion-page>
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-title>{{ t('quiz.title') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button :aria-label="t('quiz.close')" @click="onClose">
              <ion-icon slot="icon-only" :icon="closeOutline" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
        <!-- Progression du quiz (segments), masquée sur l'écran résultat. -->
        <div v-if="!quiz.loading && !quiz.finished && quiz.total" class="progress-row">
          <span
            v-for="i in quiz.total"
            :key="i"
            class="seg"
            :class="{ done: i - 1 < quiz.currentIndex, active: i - 1 === quiz.currentIndex }"
          />
        </div>
      </ion-header>

      <ion-content :fullscreen="true">
        <!-- Génération en cours -->
        <div v-if="quiz.loading" class="center-state">
          <ion-spinner name="crescent" />
          <p>{{ t('quiz.generating') }}</p>
        </div>

        <!-- Écran de résultat -->
        <div v-else-if="quiz.finished" class="result">
          <div class="stars" :class="{ zero: resultStars === 0 }">
            <ion-icon
              v-for="i in 3"
              :key="i"
              :icon="i <= resultStars ? star : starOutline"
              :class="{ lit: i <= resultStars }"
            />
          </div>
          <h2 class="result-title">{{ resultTitle }}</h2>
          <p class="result-score">
            {{ t('quiz.scoreLine', { score: quiz.score, total: quiz.total }) }}
          </p>
          <p v-if="quiz.savedResult?.isBest" class="result-best">{{ t('quiz.newBest') }}</p>
          <p v-if="resultStars === 0" class="result-hint">{{ t('quiz.failHint') }}</p>

          <div class="result-actions">
            <button class="btn-quiz ghost" @click="onRetry">{{ t('quiz.retry') }}</button>
            <button class="btn-quiz primary" @click="onClose">{{ t('quiz.close') }}</button>
          </div>
        </div>

        <!-- Une question -->
        <div v-else-if="quiz.currentQuestion" class="question-wrap">
          <p class="q-count">
            {{ t('quiz.question', { current: quiz.currentIndex + 1, total: quiz.total }) }}
          </p>
          <h2 class="q-text">{{ quiz.currentQuestion.question }}</h2>

          <div class="options">
            <button
              v-for="(opt, i) in quiz.currentQuestion.options"
              :key="i"
              class="option"
              :class="optionClass(i)"
              :disabled="quiz.answeredCurrent"
              @click="quiz.answer(i)"
            >
              <span class="opt-text">{{ opt }}</span>
              <ion-icon
                v-if="quiz.answeredCurrent && i === quiz.currentQuestion.correctIndex"
                :icon="checkmarkCircle"
              />
              <ion-icon
                v-else-if="quiz.answeredCurrent && i === chosen"
                :icon="closeCircle"
              />
            </button>
          </div>

          <div v-if="quiz.answeredCurrent" class="feedback">
            <p :class="isChosenCorrect ? 'ok' : 'ko'">
              {{ isChosenCorrect ? t('quiz.correct') : t('quiz.incorrect') }}
            </p>
            <button class="btn-quiz primary" @click="quiz.next()">
              {{ quiz.isLast ? t('quiz.seeResults') : t('quiz.next') }}
            </button>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </ion-modal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  IonModal, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonIcon, IonContent, IonSpinner, toastController
} from '@ionic/vue'
import {
  closeOutline, closeCircle, checkmarkCircle, star, starOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import { useAdsStore } from '@/stores/ads'

const { t } = useI18n()
const quiz = useQuizStore()
const ads = useAdsStore()
const router = useRouter()

defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

// Verrou anti double-clic sur « Refaire le quiz » (couvre la durée de la pub).
const retrying = ref(false)

const chosen = computed(() => quiz.answers[quiz.currentIndex])
const isChosenCorrect = computed(
  () => quiz.currentQuestion && chosen.value === quiz.currentQuestion.correctIndex
)
const resultStars = computed(() => quiz.savedResult?.stars ?? 0)
const resultTitle = computed(() => {
  if (resultStars.value === 3) return t('quiz.perfectTitle')
  if (resultStars.value > 0) return t('quiz.passTitle')
  return t('quiz.failTitle')
})

/** Classe visuelle d'une option (une fois répondu : bonne=verte, choisie fausse=rouge). */
function optionClass(i) {
  if (!quiz.answeredCurrent) return {}
  const q = quiz.currentQuestion
  if (i === q.correctIndex) return { correct: true }
  if (i === chosen.value) return { wrong: true }
  return { dimmed: true }
}

async function onRetry() {
  // Même verrou que le bouton Quiz : la pub est un long `await` pendant lequel
  // l'écran ne bouge pas → sans ça, plusieurs rejeux partaient en parallèle.
  if (retrying.value || quiz.loading) return
  retrying.value = true
  try {
    await runRetry()
  } finally {
    retrying.value = false
  }
}

async function runRetry() {
  // Pub vidéo avant de rejouer (à chaque fois, sauf premium), puis regénère un
  // quiz sur le même chapitre. En cas d'échec on ferme EN EXPLIQUANT pourquoi :
  // fermer en silence ferait passer un quota atteint pour un bug.
  await ads.onStartQuiz()
  try {
    await quiz.retry()
  } catch (e) {
    const kind = e?.message === 'quota' ? 'quota' : e?.message === 'offline' ? 'offline' : 'error'
    const tt = await toastController.create({
      message: kind === 'quota' ? t('quiz.quotaReached')
        : kind === 'offline' ? t('quiz.offline')
        : t('quiz.error'),
      duration: kind === 'quota' ? 9000 : 2500,
      position: 'bottom',
      color: kind === 'quota' ? 'warning' : kind === 'offline' ? undefined : 'danger',
      // Quota → raccourci vers le parrainage (jours d'accès illimité offerts).
      buttons: kind === 'quota'
        ? [{
            text: t('quiz.quotaCta'),
            // Fermer le modal AVANT de naviguer : sinon la page de parrainage
            // s'ouvrirait derrière le quiz resté superposé.
            handler: () => { emit('close'); router.push('/tabs/plus/referral') }
          }]
        : []
    })
    await tt.present()
    emit('close')
  }
}

function onClose() {
  quiz.reset()
  emit('close')
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; font-size: 15px; }
ion-content { --background: var(--navy); }

/* Progression (segments) */
.progress-row {
  display: flex;
  gap: 6px;
  padding: 0 var(--space-5) var(--space-3);
  background: var(--navy2);
}
.seg {
  flex: 1;
  height: 3px;
  border-radius: var(--radius-full);
  background: var(--navy3);
  transition: background var(--duration-fast);
}
.seg.done { background: var(--gold); }
.seg.active { background: var(--gold2); }

/* États centrés (chargement) */
.center-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-4);
  color: var(--muted);
  font-family: var(--font-app);
}
.center-state ion-spinner { --color: var(--gold); width: 40px; height: 40px; }

/* Question */
.question-wrap { padding: var(--space-6) var(--space-5) var(--space-10); }
.q-count {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 var(--space-3);
}
.q-text {
  font-family: var(--font-app);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--cream);
  margin: 0 0 var(--space-6);
}

.options { display: flex; flex-direction: column; gap: var(--space-3); }
.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-4);
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--duration-fast), background var(--duration-fast), opacity var(--duration-fast);
}
.option:active:not(:disabled) { border-color: var(--gold); }
.option .opt-text { flex: 1; }
.option ion-icon { font-size: 22px; flex-shrink: 0; }
.option.correct {
  border-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 18%, var(--card-bg));
  color: var(--cream);
}
.option.correct ion-icon { color: var(--color-success); }
.option.wrong {
  border-color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 18%, var(--card-bg));
}
.option.wrong ion-icon { color: var(--color-error); }
.option.dimmed { opacity: 0.5; }

/* Feedback + bouton suivant */
.feedback {
  margin-top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.feedback p { margin: 0; font-family: var(--font-app); font-size: 15px; font-weight: 600; }
.feedback p.ok { color: var(--color-success); }
.feedback p.ko { color: var(--color-error); }

/* Résultat */
.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  gap: var(--space-3);
}
.stars { display: flex; gap: var(--space-2); margin-bottom: var(--space-2); }
.stars ion-icon {
  font-size: 46px;
  color: var(--gold-border-md);
}
.stars ion-icon.lit {
  color: var(--gold);
  filter: drop-shadow(0 2px 8px rgba(201, 168, 76, 0.4));
}
.result-title {
  font-family: var(--font-app);
  font-size: 26px;
  font-weight: 700;
  color: var(--cream);
  margin: var(--space-3) 0 0;
}
.result-score {
  font-family: var(--font-app);
  font-size: 16px;
  color: var(--gold);
  margin: 0;
}
.result-best {
  font-family: var(--font-app);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gold2);
  margin: var(--space-2) 0 0;
}
.result-hint {
  font-family: var(--font-app);
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
  max-width: 320px;
  margin: var(--space-3) 0 0;
}
.result-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-8);
  width: 100%;
  max-width: 360px;
}

/* Boutons */
.btn-quiz {
  flex: 1;
  padding: 14px 20px;
  border-radius: var(--radius-md);
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--duration-fast), background var(--duration-fast);
}
.btn-quiz:active { transform: scale(0.97); }
.btn-quiz.primary {
  background: var(--gold);
  color: var(--navy);
  border: none;
}
.btn-quiz.ghost {
  background: transparent;
  color: var(--gold);
  border: 1px solid var(--gold-border-md);
}
.feedback .btn-quiz.primary { align-self: stretch; }
</style>
