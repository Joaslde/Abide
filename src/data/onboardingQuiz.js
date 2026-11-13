/**
 * Configuration centrale du quiz d'onboarding (source de vérité unique).
 * Pilote la vue réutilisable QuizQuestionView, voir docs/onboarding-quiz.md.
 *
 * Les LIBELLÉS (questions + options) vivent dans i18n (onboarding.quiz.qN),
 * pas ici. Cette config ne porte que la structure : type, champ DB, scoring.
 *
 * Chaque option a une `value` = code stocké en base (doit matcher les CHECK
 * de la migration 007). Le libellé affiché vient de i18n via la clé `value`.
 */

/** Les 4 blocs thématiques (pilotent la barre de progression). */
export const QUIZ_BLOCKS = ['identity', 'faith', 'bible', 'spiritual']

/**
 * Questions POSÉES, dans l'ordre. Réduit de 13 à 8 questions le 2026-11-12
 * (l'onboarding était jugé trop long) : q4 église, q5 durée de foi, q8 repères
 * bibliques, q10 centres d'intérêt et q13 temps disponible ne sont plus posées.
 * Leurs libellés restent dans i18n et leurs colonnes en base : les réactiver
 * = remettre leur entrée ici (et revoir le barème de onboardingScoring.js).
 */
export const QUIZ_QUESTIONS = [
  // ─── BLOC 1 : Identité ───
  {
    id: 'q1', block: 'identity', type: 'date',
    field: 'birth_date', optional: false
  },
  {
    id: 'q2', block: 'identity', type: 'single',
    field: 'gender', optional: false,
    options: [{ value: 'homme' }, { value: 'femme' }]
  },
  {
    id: 'q3', block: 'identity', type: 'country_city',
    fields: ['country', 'city'], optional: false
  },

  // ─── BLOC 2 : Parcours de foi ───
  {
    id: 'q6', block: 'faith', type: 'single',
    field: 'faith_stage', optional: false,
    options: [
      { value: 'growing' },
      { value: 'new_convert' },
      { value: 'seeker' },
      { value: 'returning' }
    ]
  },

  // ─── BLOC 3 : Niveau biblique (cœur du profilage) ───
  {
    id: 'q7', block: 'bible', type: 'single',
    field: 'bible_familiarity', optional: false,
    // score : ordre = points 0..3
    score: { type: 'map', values: { lost: 0, struggling: 1, comfortable: 2, can_teach: 3 } },
    options: [
      { value: 'lost' },
      { value: 'struggling' },
      { value: 'comfortable' },
      { value: 'can_teach' }
    ]
  },
  {
    id: 'q9', block: 'bible', type: 'single',
    field: 'reading_frequency', optional: false,
    score: { type: 'map', values: { never: 0, sometimes: 1, weekly: 2, daily: 3 } },
    options: [
      { value: 'never' },
      { value: 'sometimes' },
      { value: 'weekly' },
      { value: 'daily' }
    ]
  },

  // ─── BLOC 4 : Vie spirituelle & disponibilité ───
  {
    id: 'q11', block: 'spiritual', type: 'single',
    field: 'main_challenge', optional: false,
    options: [
      { value: 'regularity' },
      { value: 'understanding' },
      { value: 'motivation' },
      { value: 'hardship' },
      { value: 'evangelism' }
    ]
  },
  {
    id: 'q12', block: 'spiritual', type: 'single',
    field: 'preferred_time_slot', optional: false,
    options: [
      { value: 'morning' },
      { value: 'noon' },
      { value: 'evening' },
      { value: 'night' }
    ]
  }
]

/** Index rapide id → question. */
export const QUESTION_BY_ID = Object.fromEntries(
  QUIZ_QUESTIONS.map((q) => [q.id, q])
)
