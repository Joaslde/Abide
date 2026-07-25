/**
 * Calcul du niveau biblique et du profil utilisateur à partir des réponses
 * du quiz d'onboarding. Fonctions PURES (aucune dépendance Vue/Supabase) —
 * testables isolément. Barème : docs/onboarding-quiz.md §3 et §4.
 *
 * `answers` est un objet { q1: valeur, q2: valeur, … }.
 * - réponse `single` : une string (ex: 'comfortable')
 * - réponse `multi`  : un tableau de strings (ex: ['gospels','psalms'])
 */

const Q7_POINTS = { lost: 0, struggling: 1, comfortable: 2, can_teach: 3 }
const Q9_POINTS = { never: 0, sometimes: 1, weekly: 2, daily: 3 }
const Q10_POINTS = { basics: 0, application: 1, meaning: 2, theology: 3 }

/** Score Q8 = nombre de repères cochés (0-5). "lost" force 0. */
function landmarksScore(q8) {
  if (!Array.isArray(q8)) return 0
  if (q8.includes('lost')) return 0
  return q8.filter((v) => v !== 'lost').length
}

/**
 * Niveau biblique sur 4 paliers à partir du score total (0-14).
 * @returns {'decouverte'|'croissance'|'affermi'|'profond'}
 */
export function computeBibleLevel(answers) {
  const total =
    (Q7_POINTS[answers.q7] ?? 0) +
    landmarksScore(answers.q8) +
    (Q9_POINTS[answers.q9] ?? 0) +
    (Q10_POINTS[answers.q10] ?? 0)

  if (total <= 3) return 'decouverte'
  if (total <= 7) return 'croissance'
  if (total <= 10) return 'affermi'
  return 'profond'
}

/** Nombre de repères Q8 (0-5), exposé pour stockage en base (bible_landmarks). */
export function computeLandmarks(answers) {
  return landmarksScore(answers.q8)
}

/**
 * Profil utilisateur parmi 5. Ordre de priorité (doc §4) :
 *  1. défi "période difficile" (Q11=hardship) → veilleur
 *  2. défi "évangéliser" (Q11=evangelism) → porteur
 *  3. foi récente (Q5=new) ou chercheur (Q6=seeker/new_convert) → source
 *  4. intérêt sens profond / théologie (Q10=meaning|theology) → explorateur
 *  5. sinon → marcheur
 * @returns {'source'|'marcheur'|'explorateur'|'veilleur'|'porteur'}
 */
export function computeProfile(answers) {
  if (answers.q11 === 'hardship') return 'veilleur'
  if (answers.q11 === 'evangelism') return 'porteur'

  const isNewFaith = answers.q5 === 'new'
  const isSeeker = answers.q6 === 'seeker' || answers.q6 === 'new_convert'
  const level = computeBibleLevel(answers)
  if (isNewFaith || isSeeker || level === 'decouverte') return 'source'

  if (answers.q10 === 'meaning' || answers.q10 === 'theology') return 'explorateur'

  return 'marcheur'
}

/** Pilier de départ associé à un profil (doc §4). */
const PROFILE_PILLAR = {
  source: 'immersion',
  marcheur: 'sanctuaire',
  explorateur: 'ancre',
  veilleur: 'sanctuaire',
  porteur: 'phare'
}

export function pillarForProfile(profile) {
  return PROFILE_PILLAR[profile] ?? 'immersion'
}

/** Heure de notification dérivée du créneau préféré (Q12). */
const TIME_SLOT_HOUR = {
  morning: '07:00:00',
  noon: '12:00:00',
  evening: '19:00:00',
  night: '22:00:00'
}

export function notifTimeForSlot(slot) {
  return TIME_SLOT_HOUR[slot] ?? '07:00:00'
}
