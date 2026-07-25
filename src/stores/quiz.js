import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { isOnline } from '@/lib/network'
import { getQuizResult, saveQuizResult, quizResultsFor } from '@/lib/user-db'

/**
 * Quiz de fin de chapitre (L'Ancre — idée 13, version chapitre).
 *
 * Un QCM de 5 questions est GÉNÉRÉ par l'Edge Function `quiz-chapter` à partir
 * du vrai texte du chapitre (connexion requise). Le RÉSULTAT (score + étoiles)
 * est stocké LOCAL (user-db, offline-safe) : on ne garde que le meilleur score.
 *
 * Barème (décision utilisateur 2026-07-10) :
 *   < 3 bonnes → échec (0 étoile, quiz à refaire)
 *     3 bonnes → ★     4 bonnes → ★★     5 bonnes → ★★★
 *
 * Le client N'appelle JAMAIS OpenRouter directement (aucune clé côté client —
 * SECURITY.md). Tout passe par l'Edge Function.
 */

export const PASS_THRESHOLD = 3 // bonnes réponses minimum pour réussir

/** Nombre d'étoiles pour un score (0 si en dessous du seuil de réussite). */
export function starsForScore(score) {
  if (score < PASS_THRESHOLD) return 0
  if (score >= 5) return 3
  if (score >= 4) return 2
  return 1
}

export const useQuizStore = defineStore('quiz', () => {
  // — Session de quiz en cours —
  const questions = ref([]) // [{ question, options[4], correctIndex }]
  const currentIndex = ref(0) // question affichée
  const answers = ref([]) // index choisi par question (null tant que non répondu)
  const loading = ref(false) // génération en cours
  const finished = ref(false) // écran de résultat affiché
  const ctx = ref(null) // { versionId, bookId, bookName, chapter }
  const savedResult = ref(null) // { score, stars, isBest } après finishQuiz

  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
  const total = computed(() => questions.value.length)
  const isLast = computed(() => currentIndex.value >= total.value - 1)
  const answeredCurrent = computed(() => answers.value[currentIndex.value] != null)

  /** Score courant (nombre de bonnes réponses). */
  const score = computed(() =>
    questions.value.reduce(
      (acc, q, i) => acc + (answers.value[i] === q.correctIndex ? 1 : 0),
      0
    )
  )

  /**
   * Génère un quiz pour un chapitre. Lève une erreur ('offline' | 'failed') que
   * la vue traduit en message. Prépare la session en cas de succès.
   */
  async function generateQuiz(context) {
    if (loading.value) return
    if (!(await isOnline())) throw new Error('offline')

    loading.value = true
    reset()
    ctx.value = context
    try {
      const { data, error } = await supabase.functions.invoke('quiz-chapter', {
        body: { bookId: context.bookId, chapter: context.chapter }
      })
      if (error || data?.error || !Array.isArray(data?.questions)) {
        throw new Error('failed')
      }
      questions.value = data.questions
      answers.value = new Array(data.questions.length).fill(null)
      currentIndex.value = 0
      finished.value = false
    } catch (e) {
      reset()
      // Une erreur réseau brute de invoke() = pas de connexion pendant l'appel.
      throw new Error(e?.message === 'offline' ? 'offline' : 'failed')
    } finally {
      loading.value = false
    }
  }

  /** Enregistre la réponse à la question courante (une seule fois). */
  function answer(optionIndex) {
    if (answeredCurrent.value) return
    answers.value[currentIndex.value] = optionIndex
  }

  /** Passe à la question suivante, ou termine le quiz (dernière question). */
  async function next() {
    if (isLast.value) {
      await finishQuiz()
      return
    }
    currentIndex.value += 1
  }

  /** Termine : calcule les étoiles, sauve le meilleur score en local. */
  async function finishQuiz() {
    const s = score.value
    const stars = starsForScore(s)
    // On ne sauve un résultat que s'il y a des étoiles à gagner (réussite).
    // Un échec (< seuil) ne crée pas d'entrée → pas de « 0 étoile » persisté.
    if (stars > 0 && ctx.value) {
      savedResult.value = await saveQuizResult(
        ctx.value.bookId,
        ctx.value.chapter,
        s,
        stars
      )
    } else {
      savedResult.value = { score: s, stars: 0, isBest: false }
    }
    finished.value = true
  }

  /** Relance le même chapitre (nouveau quiz généré). */
  async function retry() {
    if (!ctx.value) return
    await generateQuiz(ctx.value)
  }

  /** Réinitialise la session (fermeture du modal). */
  function reset() {
    questions.value = []
    answers.value = []
    currentIndex.value = 0
    finished.value = false
    savedResult.value = null
  }

  return {
    // état
    questions,
    currentIndex,
    answers,
    loading,
    finished,
    ctx,
    savedResult,
    // dérivés
    currentQuestion,
    total,
    isLast,
    answeredCurrent,
    score,
    // actions
    generateQuiz,
    answer,
    next,
    finishQuiz,
    retry,
    reset,
    // helpers DB (pour la grille de chapitres)
    getQuizResult,
    quizResultsFor
  }
})
