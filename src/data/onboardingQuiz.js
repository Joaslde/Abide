/**
 * Configuration centrale du quiz d'onboarding (source de vérité unique).
 * Pilote la vue réutilisable QuizQuestionView — voir docs/onboarding-quiz.md.
 *
 * Les LIBELLÉS (questions + options) vivent dans i18n (onboarding.quiz.qN),
 * pas ici. Cette config ne porte que la structure : type, champ DB, scoring.
 *
 * Chaque option a une `value` = code stocké en base (doit matcher les CHECK
 * de la migration 007). Le libellé affiché vient de i18n via la clé `value`.
 */

/** Les 4 blocs thématiques (pilotent la barre de progression). */
export const QUIZ_BLOCKS = ['identity', 'faith', 'bible', 'spiritual']

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
  {
    id: 'q4', block: 'identity', type: 'church',
    fields: ['church_name', 'church_denomination'], optional: true,
    options: [
      { value: 'catholique' },
      { value: 'protestant' },
      { value: 'evangelique' },
      { value: 'pentecotiste' },
      { value: 'autre' }
    ]
  },

  // ─── BLOC 2 : Parcours de foi ───
  {
    id: 'q5', block: 'faith', type: 'single',
    field: 'faith_duration', optional: false,
    options: [
      { value: 'new' },
      { value: 'few_years' },
      { value: 'long' },
      { value: 'very_long' },
      { value: 'undecided' }
    ]
  },
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
    id: 'q8', block: 'bible', type: 'multi',
    field: 'bible_landmarks', optional: false,
    // score : nombre de repères cochés (0-5). "lost" force le score à 0.
    score: { type: 'count', resetOption: 'lost' },
    options: [
      { value: 'gospels' },
      { value: 'psalms' },
      { value: 'epistles' },
      { value: 'prophets' },
      { value: 'revelation' },
      { value: 'lost' } // "j'ai du mal à m'y retrouver"
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
  {
    id: 'q10', block: 'bible', type: 'single',
    field: 'depth_interest', optional: false,
    score: { type: 'map', values: { basics: 0, application: 1, meaning: 2, theology: 3 } },
    options: [
      { value: 'basics' },
      { value: 'application' },
      { value: 'meaning' },
      { value: 'theology' }
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
  },
  {
    id: 'q13', block: 'spiritual', type: 'single',
    field: 'daily_goal_min', optional: false,
    // Valeurs numériques stockées dans daily_goal_min (réutilisé, migration 001).
    options: [
      { value: 5 },
      { value: 15 },
      { value: 25 },
      { value: 30 }
    ]
  }
]

/** Index rapide id → question. */
export const QUESTION_BY_ID = Object.fromEntries(
  QUIZ_QUESTIONS.map((q) => [q.id, q])
)
