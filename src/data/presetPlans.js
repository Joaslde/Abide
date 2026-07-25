/**
 * Plans de lecture PRÉÉTABLIS (thématiques), bundlés dans l'app.
 *
 * Chaque plan a une liste EXPLICITE et ordonnée de chapitres. Le nombre de jours
 * peut être < nb de chapitres (plusieurs chapitres/jour) ou = (1 chapitre/jour).
 *
 * ⚠️ Extensibilité : ce fichier est la source BUNDLÉE (offline). Plus tard, un
 * fetchRemotePlans() (Supabase, table plan_templates) fusionnera des plans
 * distants dans cette même liste, permettant d'en ajouter SANS rebuild de l'app.
 * (Noté ; non implémenté ici.)
 */

import { buildScheduleFromChapters } from '@/data/planGenerator'

export const PRESET_PLANS = [
  {
    id: 'know-jesus',
    title: 'plan.presets.knowJesus.title',
    desc: 'plan.presets.knowJesus.desc',
    days: 21,
    // Parcours de la vie de Jésus : Incarnation → ministère → enseignements →
    // miracles → passion → résurrection, à travers les 4 Évangiles.
    chapters: [
      { book_id: 'JHN', chapter: 1 },   // Le Verbe fait chair
      { book_id: 'LUK', chapter: 1 },   // Annonce de la naissance
      { book_id: 'LUK', chapter: 2 },   // La naissance
      { book_id: 'MAT', chapter: 3 },   // Le baptême
      { book_id: 'MAT', chapter: 4 },   // La tentation, début du ministère
      { book_id: 'JHN', chapter: 3 },   // Il faut naître de nouveau
      { book_id: 'MAT', chapter: 5 },   // Sermon sur la montagne (1)
      { book_id: 'MAT', chapter: 6 },   // Sermon sur la montagne (2)
      { book_id: 'MAT', chapter: 7 },   // Sermon sur la montagne (3)
      { book_id: 'LUK', chapter: 15 },  // Le fils prodigue
      { book_id: 'JHN', chapter: 6 },   // Le pain de vie
      { book_id: 'MRK', chapter: 4 },   // Les paraboles
      { book_id: 'JHN', chapter: 8 },   // La lumière du monde
      { book_id: 'JHN', chapter: 10 },  // Le bon berger
      { book_id: 'JHN', chapter: 11 },  // La résurrection de Lazare
      { book_id: 'JHN', chapter: 13 },  // Le lavement des pieds
      { book_id: 'JHN', chapter: 14 },  // Le chemin, la vérité, la vie
      { book_id: 'JHN', chapter: 15 },  // Le vrai cep
      { book_id: 'LUK', chapter: 23 },  // La crucifixion
      { book_id: 'JHN', chapter: 20 },  // La résurrection
      { book_id: 'MAT', chapter: 28 }   // L'envoi en mission
    ]
  }
]

/** Retrouve un préétabli par id. */
export function getPreset(id) {
  return PRESET_PLANS.find((p) => p.id === id) ?? null
}

/** Construit un plan (schedule) prêt à créer à partir d'un préétabli. */
export function presetToPlan(preset) {
  return {
    source: 'template',
    template_id: preset.id,
    title: preset.title,
    plan_type: 'custom',
    scope: 'preset',
    total_days: preset.days,
    schedule: buildScheduleFromChapters(preset.chapters, preset.days)
  }
}
