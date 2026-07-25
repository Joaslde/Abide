import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { QUIZ_QUESTIONS, QUIZ_BLOCKS } from '@/data/onboardingQuiz'
import {
  computeBibleLevel,
  computeLandmarks,
  computeProfile,
  pillarForProfile,
  notifTimeForSlot
} from '@/data/onboardingScoring'

/**
 * Pilote le parcours de quiz d'onboarding.
 * Les réponses sont gardées EN MÉMOIRE pendant tout le quiz ; on n'écrit
 * dans Supabase qu'une seule fois à la fin (finish()) — cohérent avec la
 * stratégie local-first et permet le retour-arrière libre.
 */
export const useOnboardingStore = defineStore('onboarding', () => {
  // answers : { q1: valeur, q2: valeur, … }
  const answers = ref({})
  const currentIndex = ref(0)

  const total = QUIZ_QUESTIONS.length
  const currentQuestion = computed(() => QUIZ_QUESTIONS[currentIndex.value] ?? null)
  const isFirst = computed(() => currentIndex.value === 0)
  const isLast = computed(() => currentIndex.value === total - 1)

  /** Progression par bloc (1..4) pour la barre de progression. */
  const currentBlockIndex = computed(() => {
    const q = currentQuestion.value
    return q ? QUIZ_BLOCKS.indexOf(q.block) : 0
  })

  /** Une réponse est-elle valide (non vide) pour la question courante ? */
  const hasAnswer = computed(() => {
    const q = currentQuestion.value
    if (!q) return false
    const v = answers.value[q.id]
    if (Array.isArray(v)) return v.length > 0
    if (q.type === 'country_city') return !!(v && v.country)
    return v !== undefined && v !== null && v !== ''
  })

  /** Peut-on passer à la suite ? (réponse fournie OU question optionnelle) */
  const canGoNext = computed(() => hasAnswer.value || !!currentQuestion.value?.optional)

  function setAnswer(id, value) {
    answers.value[id] = value
  }

  function next() {
    if (currentIndex.value < total - 1) currentIndex.value++
  }

  function prev() {
    if (currentIndex.value > 0) currentIndex.value--
  }

  function reset() {
    answers.value = {}
    currentIndex.value = 0
  }

  /**
   * Construit l'objet de mise à jour du profil à partir des réponses.
   * Mappe chaque question vers sa/ses colonne(s) DB + calcule niveau & profil.
   */
  function buildProfileUpdate(consent) {
    const a = answers.value
    const update = {}

    // Mapping direct question → colonne (selon q.field / q.fields)
    for (const q of QUIZ_QUESTIONS) {
      const v = a[q.id]
      if (v === undefined || v === null || v === '') continue

      if (q.type === 'country_city') {
        if (v.country) update.country = v.country
        if (v.city) update.city = v.city
      } else if (q.type === 'church') {
        if (v.church_name) update.church_name = v.church_name
        if (v.church_denomination) update.church_denomination = v.church_denomination
      } else if (q.id === 'q8') {
        // Q8 : on stocke le NOMBRE de repères (0-5), pas le tableau.
        update.bible_landmarks = computeLandmarks(a)
      } else if (q.field) {
        update[q.field] = v
      }
    }

    // Niveau biblique + profil + pilier de départ (calculés)
    const level = computeBibleLevel(a)
    const profile = computeProfile(a)
    update.bible_level = level
    update.user_profile = profile
    update.onboarding_pillar = pillarForProfile(profile)

    // Heure de notification dérivée du créneau préféré (Q12)
    if (a.q12) update.notif_time = notifTimeForSlot(a.q12)

    // Consentement RGPD
    update.data_consent = !!consent
    if (consent) update.consent_date = new Date().toISOString()

    update.onboarding_done = true
    return update
  }

  /** Résultat calculé (pour l'écran de révélation), sans écrire en base. */
  const result = computed(() => {
    const profile = computeProfile(answers.value)
    return {
      profile,
      level: computeBibleLevel(answers.value),
      pillar: pillarForProfile(profile)
    }
  })

  /**
   * Sauvegarde finale : un seul appel updateProfile avec toutes les réponses
   * + niveau + profil + onboarding_done=true.
   * @param {boolean} consent consentement RGPD coché à l'écran de révélation
   */
  async function finish(consent = false) {
    const auth = useAuthStore()
    const update = buildProfileUpdate(consent)
    await auth.updateProfile(update)
    return result.value
  }

  return {
    answers,
    currentIndex,
    total,
    currentQuestion,
    currentBlockIndex,
    isFirst,
    isLast,
    hasAnswer,
    canGoNext,
    result,
    setAnswer,
    next,
    prev,
    reset,
    finish
  }
})
