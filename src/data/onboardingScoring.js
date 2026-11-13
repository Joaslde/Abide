/**
 * Calcul du niveau biblique et du profil utilisateur à partir des réponses
 * du quiz d'onboarding. Fonctions PURES (aucune dépendance Vue/Supabase), 
 * testables isolément. Barème : docs/onboarding-quiz.md §3 et §4.
 *
 * `answers` est un objet { q1: valeur, q2: valeur, … }.
 * - réponse `single` : une string (ex: 'comfortable')
 * - réponse `multi`  : un tableau de strings (ex: ['gospels','psalms'])
 */

const Q7_POINTS = { lost: 0, struggling: 1, comfortable: 2, can_teach: 3 }
const Q9_POINTS = { never: 0, sometimes: 1, weekly: 2, daily: 3 }

/**
 * Niveau biblique sur 4 paliers à partir de Q7 (aisance) + Q9 (fréquence),
 * score 0 à 6. Recalibré le 2026-11-12 quand Q8 et Q10 ont été retirées de
 * l'onboarding (ancien score 0 à 14, seuils 3 / 7 / 10) : mêmes proportions.
 * @returns {'decouverte'|'croissance'|'affermi'|'profond'}
 */
export function computeBibleLevel(answers) {
  const total = (Q7_POINTS[answers.q7] ?? 0) + (Q9_POINTS[answers.q9] ?? 0)

  if (total <= 1) return 'decouverte'
  if (total <= 3) return 'croissance'
  if (total <= 4) return 'affermi'
  return 'profond'
}

/**
 * Profil utilisateur parmi 5. Ordre de priorité :
 *  1. défi "période difficile" (Q11=hardship) → veilleur
 *  2. défi "évangéliser" (Q11=evangelism) → porteur
 *  3. chercheur ou nouveau converti (Q6), ou niveau découverte → source
 *  4. défi "comprendre ce que je lis" (Q11=understanding) ou niveau profond
 *     → explorateur (remplace Q10, retirée de l'onboarding le 2026-11-12)
 *  5. sinon → marcheur
 * @returns {'source'|'marcheur'|'explorateur'|'veilleur'|'porteur'}
 */
export function computeProfile(answers) {
  if (answers.q11 === 'hardship') return 'veilleur'
  if (answers.q11 === 'evangelism') return 'porteur'

  const isSeeker = answers.q6 === 'seeker' || answers.q6 === 'new_convert'
  const level = computeBibleLevel(answers)
  if (isSeeker || level === 'decouverte') return 'source'

  if (answers.q11 === 'understanding' || level === 'profond') return 'explorateur'

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
