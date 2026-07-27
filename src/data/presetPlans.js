/**
 * Plans de lecture PRÉÉTABLIS (thématiques), bundlés dans l'app.
 *
 * Chaque plan a une liste EXPLICITE et ordonnée de chapitres. Le nombre de jours
 * peut être < nb de chapitres (plusieurs chapitres/jour) ou = (1 chapitre/jour).
 *
 * `category` regroupe les plans dans l'écran de choix :
 *   'vie'        — thèmes de vie courants (anxiété, deuil, pardon, identité…)
 *   'biblique'   — parcours bibliques thématiques (David, paraboles, Genèse…)
 *   'discipline' — disciplines spirituelles (prier, gratitude, étudier…)
 *
 * ⚠️ Toutes les références ont été VALIDÉES contre le CANON de planGenerator.js
 * (livre existant + chapitre <= nb réel de chapitres, aucun doublon par plan).
 *
 * ⚠️ Extensibilité : ce fichier est la source BUNDLÉE (offline). Plus tard, un
 * fetchRemotePlans() (Supabase, table plan_templates) fusionnera des plans
 * distants dans cette même liste, permettant d'en ajouter SANS rebuild de l'app.
 * (Noté ; non implémenté ici.)
 */

import { buildScheduleFromChapters } from '@/data/planGenerator'

/** Catégories, dans l'ordre d'affichage de l'écran de choix. */
export const PLAN_CATEGORIES = ['vie', 'biblique', 'discipline']

/**
 * Vignettes des plans — bundlées par Vite (donc 100 % HORS LIGNE).
 * Le nom du fichier est l'id du plan (`src/assets/plans/<id>.webp`), généré par
 * `scripts/fetch-plan-thumbs.js`. `eager` + `as: 'url'` : on ne récupère que les
 * URLs, disponibles dès le chargement (pas d'attente réseau à l'affichage).
 */
const THUMBS = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/plans/*.webp', { eager: true, as: 'url' }))
    .map(([path, url]) => [path.split('/').pop().replace('.webp', ''), url])
)

/** Vignette d'un plan (par son id), ou '' si absente (jamais bloquant). */
export function planThumb(planId) {
  return THUMBS[planId] ?? ''
}

export const PRESET_PLANS = [
  {
    id: 'know-jesus',
    title: 'plan.presets.knowJesus.title',
    desc: 'plan.presets.knowJesus.desc',
    category: 'biblique',
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
  },
  {
    id: 'peace-over-anxiety',
    title: 'plan.presets.peaceOverAnxiety.title',
    desc: 'plan.presets.peaceOverAnxiety.desc',
    category: 'vie',
    days: 7,
    chapters: [
      { book_id: 'PSA', chapter: 23 },
      { book_id: 'PSA', chapter: 121 },
      { book_id: 'PSA', chapter: 46 },
      { book_id: 'ISA', chapter: 41 },
      { book_id: 'MAT', chapter: 6 },
      { book_id: 'LUK', chapter: 12 },
      { book_id: 'JHN', chapter: 14 },
      { book_id: 'PHP', chapter: 4 },
      { book_id: '1PE', chapter: 5 }
    ]
  },
  {
    id: 'grief-and-comfort',
    title: 'plan.presets.griefAndComfort.title',
    desc: 'plan.presets.griefAndComfort.desc',
    category: 'vie',
    days: 10,
    chapters: [
      { book_id: 'JOB', chapter: 1 },
      { book_id: 'JOB', chapter: 2 },
      { book_id: 'JOB', chapter: 3 },
      { book_id: 'PSA', chapter: 88 },
      { book_id: 'PSA', chapter: 42 },
      { book_id: 'LAM', chapter: 3 },
      { book_id: 'PSA', chapter: 34 },
      { book_id: 'JHN', chapter: 11 },
      { book_id: '2CO', chapter: 1 },
      { book_id: 'ROM', chapter: 8 },
      { book_id: '1TH', chapter: 4 },
      { book_id: 'REV', chapter: 21 }
    ]
  },
  {
    id: 'path-of-forgiveness',
    title: 'plan.presets.pathOfForgiveness.title',
    desc: 'plan.presets.pathOfForgiveness.desc',
    category: 'vie',
    days: 12,
    chapters: [
      { book_id: 'PSA', chapter: 51 },
      { book_id: '1JN', chapter: 1 },
      { book_id: 'LUK', chapter: 15 },
      { book_id: 'MAT', chapter: 6 },
      { book_id: 'MAT', chapter: 5 },
      { book_id: 'MAT', chapter: 18 },
      { book_id: 'GEN', chapter: 37 },
      { book_id: 'GEN', chapter: 45 },
      { book_id: 'GEN', chapter: 50 },
      { book_id: 'LUK', chapter: 23 },
      { book_id: 'EPH', chapter: 4 },
      { book_id: 'COL', chapter: 3 },
      { book_id: 'ROM', chapter: 12 }
    ]
  },
  {
    id: 'identity-in-christ',
    title: 'plan.presets.identityInChrist.title',
    desc: 'plan.presets.identityInChrist.desc',
    category: 'vie',
    days: 21,
    chapters: [
      { book_id: 'GEN', chapter: 1 },
      { book_id: 'PSA', chapter: 139 },
      { book_id: 'ISA', chapter: 43 },
      { book_id: 'JHN', chapter: 1 },
      { book_id: 'JHN', chapter: 15 },
      { book_id: 'ROM', chapter: 5 },
      { book_id: 'ROM', chapter: 6 },
      { book_id: 'ROM', chapter: 8 },
      { book_id: '2CO', chapter: 5 },
      { book_id: 'GAL', chapter: 2 },
      { book_id: 'GAL', chapter: 3 },
      { book_id: 'GAL', chapter: 4 },
      { book_id: 'EPH', chapter: 1 },
      { book_id: 'EPH', chapter: 2 },
      { book_id: 'EPH', chapter: 3 },
      { book_id: 'EPH', chapter: 4 },
      { book_id: 'COL', chapter: 1 },
      { book_id: 'COL', chapter: 2 },
      { book_id: 'COL', chapter: 3 },
      { book_id: '1PE', chapter: 2 },
      { book_id: '1JN', chapter: 3 },
      { book_id: 'REV', chapter: 21 }
    ]
  },
  {
    id: 'life-of-david',
    title: 'plan.presets.lifeOfDavid.title',
    desc: 'plan.presets.lifeOfDavid.desc',
    category: 'biblique',
    days: 30,
    chapters: [
      { book_id: '1SA', chapter: 16 },
      { book_id: '1SA', chapter: 17 },
      { book_id: '1SA', chapter: 18 },
      { book_id: '1SA', chapter: 19 },
      { book_id: '1SA', chapter: 20 },
      { book_id: '1SA', chapter: 21 },
      { book_id: '1SA', chapter: 22 },
      { book_id: '1SA', chapter: 23 },
      { book_id: '1SA', chapter: 24 },
      { book_id: '1SA', chapter: 26 },
      { book_id: '1SA', chapter: 30 },
      { book_id: '1SA', chapter: 31 },
      { book_id: '2SA', chapter: 1 },
      { book_id: '2SA', chapter: 2 },
      { book_id: '2SA', chapter: 5 },
      { book_id: '2SA', chapter: 6 },
      { book_id: '2SA', chapter: 7 },
      { book_id: 'PSA', chapter: 8 },
      { book_id: 'PSA', chapter: 23 },
      { book_id: '2SA', chapter: 9 },
      { book_id: '2SA', chapter: 11 },
      { book_id: '2SA', chapter: 12 },
      { book_id: 'PSA', chapter: 51 },
      { book_id: 'PSA', chapter: 32 },
      { book_id: '2SA', chapter: 15 },
      { book_id: 'PSA', chapter: 3 },
      { book_id: '2SA', chapter: 18 },
      { book_id: '2SA', chapter: 22 },
      { book_id: '1CH', chapter: 22 },
      { book_id: '1CH', chapter: 29 },
      { book_id: 'PSA', chapter: 103 },
      { book_id: 'PSA', chapter: 139 }
    ]
  },
  {
    id: 'parables-of-jesus',
    title: 'plan.presets.parablesOfJesus.title',
    desc: 'plan.presets.parablesOfJesus.desc',
    category: 'biblique',
    days: 14,
    chapters: [
      { book_id: 'MAT', chapter: 13 },
      { book_id: 'MRK', chapter: 4 },
      { book_id: 'MAT', chapter: 18 },
      { book_id: 'MAT', chapter: 20 },
      { book_id: 'MAT', chapter: 21 },
      { book_id: 'MAT', chapter: 22 },
      { book_id: 'MAT', chapter: 25 },
      { book_id: 'LUK', chapter: 10 },
      { book_id: 'LUK', chapter: 12 },
      { book_id: 'LUK', chapter: 13 },
      { book_id: 'LUK', chapter: 14 },
      { book_id: 'LUK', chapter: 15 },
      { book_id: 'LUK', chapter: 16 },
      { book_id: 'LUK', chapter: 18 },
      { book_id: 'LUK', chapter: 19 },
      { book_id: 'LUK', chapter: 20 }
    ]
  },
  {
    id: 'women-of-the-bible',
    title: 'plan.presets.womenOfTheBible.title',
    desc: 'plan.presets.womenOfTheBible.desc',
    category: 'biblique',
    days: 14,
    chapters: [
      { book_id: 'GEN', chapter: 2 },
      { book_id: 'GEN', chapter: 21 },
      { book_id: 'EXO', chapter: 1 },
      { book_id: 'EXO', chapter: 2 },
      { book_id: 'JOS', chapter: 2 },
      { book_id: 'JDG', chapter: 4 },
      { book_id: 'RUT', chapter: 1 },
      { book_id: 'RUT', chapter: 2 },
      { book_id: 'RUT', chapter: 3 },
      { book_id: 'RUT', chapter: 4 },
      { book_id: '1SA', chapter: 1 },
      { book_id: '1SA', chapter: 2 },
      { book_id: 'EST', chapter: 4 },
      { book_id: 'EST', chapter: 7 },
      { book_id: 'PRO', chapter: 31 },
      { book_id: 'LUK', chapter: 1 },
      { book_id: 'JHN', chapter: 4 },
      { book_id: 'JHN', chapter: 20 },
      { book_id: 'ACT', chapter: 16 },
      { book_id: 'ROM', chapter: 16 }
    ]
  },
  {
    id: 'creation-to-covenant',
    title: 'plan.presets.creationToCovenant.title',
    desc: 'plan.presets.creationToCovenant.desc',
    category: 'biblique',
    days: 25,
    chapters: [
      { book_id: 'GEN', chapter: 1 },
      { book_id: 'GEN', chapter: 2 },
      { book_id: 'GEN', chapter: 3 },
      { book_id: 'GEN', chapter: 4 },
      { book_id: 'GEN', chapter: 6 },
      { book_id: 'GEN', chapter: 7 },
      { book_id: 'GEN', chapter: 8 },
      { book_id: 'GEN', chapter: 9 },
      { book_id: 'GEN', chapter: 11 },
      { book_id: 'GEN', chapter: 12 },
      { book_id: 'GEN', chapter: 15 },
      { book_id: 'GEN', chapter: 17 },
      { book_id: 'GEN', chapter: 18 },
      { book_id: 'GEN', chapter: 19 },
      { book_id: 'GEN', chapter: 22 },
      { book_id: 'GEN', chapter: 24 },
      { book_id: 'GEN', chapter: 25 },
      { book_id: 'GEN', chapter: 27 },
      { book_id: 'GEN', chapter: 28 },
      { book_id: 'GEN', chapter: 32 },
      { book_id: 'GEN', chapter: 33 },
      { book_id: 'GEN', chapter: 37 },
      { book_id: 'GEN', chapter: 39 },
      { book_id: 'GEN', chapter: 41 },
      { book_id: 'GEN', chapter: 42 },
      { book_id: 'GEN', chapter: 45 },
      { book_id: 'GEN', chapter: 46 },
      { book_id: 'GEN', chapter: 50 }
    ]
  },
  {
    id: 'learn-to-pray',
    title: 'plan.presets.learnToPray.title',
    desc: 'plan.presets.learnToPray.desc',
    category: 'discipline',
    days: 10,
    chapters: [
      { book_id: 'MAT', chapter: 6 },
      { book_id: 'LUK', chapter: 11 },
      { book_id: 'PSA', chapter: 5 },
      { book_id: 'PSA', chapter: 63 },
      { book_id: 'PSA', chapter: 145 },
      { book_id: 'NEH', chapter: 1 },
      { book_id: 'DAN', chapter: 9 },
      { book_id: 'JHN', chapter: 17 },
      { book_id: 'EPH', chapter: 6 },
      { book_id: 'PHP', chapter: 4 },
      { book_id: 'JAS', chapter: 5 },
      { book_id: '1TH', chapter: 5 }
    ]
  },
  {
    id: 'cultivating-gratitude',
    title: 'plan.presets.cultivatingGratitude.title',
    desc: 'plan.presets.cultivatingGratitude.desc',
    category: 'discipline',
    days: 5,
    chapters: [
      { book_id: 'PSA', chapter: 100 },
      { book_id: 'PSA', chapter: 103 },
      { book_id: 'PSA', chapter: 136 },
      { book_id: 'LUK', chapter: 17 },
      { book_id: 'COL', chapter: 3 },
      { book_id: 'PHP', chapter: 4 },
      { book_id: '1TH', chapter: 5 }
    ]
  },
  {
    id: 'study-the-bible',
    title: 'plan.presets.studyTheBible.title',
    desc: 'plan.presets.studyTheBible.desc',
    category: 'discipline',
    days: 14,
    chapters: [
      { book_id: 'PSA', chapter: 1 },
      { book_id: 'DEU', chapter: 6 },
      { book_id: 'JOS', chapter: 1 },
      { book_id: 'PSA', chapter: 19 },
      { book_id: 'PSA', chapter: 119 },
      { book_id: 'PRO', chapter: 2 },
      { book_id: 'EZR', chapter: 7 },
      { book_id: 'NEH', chapter: 8 },
      { book_id: 'ISA', chapter: 55 },
      { book_id: 'LUK', chapter: 24 },
      { book_id: 'ACT', chapter: 17 },
      { book_id: '2TI', chapter: 3 },
      { book_id: 'HEB', chapter: 4 },
      { book_id: 'JAS', chapter: 1 },
      { book_id: 'MAT', chapter: 7 },
      { book_id: '2PE', chapter: 1 }
    ]
  },
  {
    id: 'hearing-gods-voice',
    title: 'plan.presets.hearingGodsVoice.title',
    desc: 'plan.presets.hearingGodsVoice.desc',
    category: 'discipline',
    days: 10,
    chapters: [
      { book_id: '1SA', chapter: 3 },
      { book_id: 'PSA', chapter: 25 },
      { book_id: 'ISA', chapter: 30 },
      { book_id: '1KI', chapter: 19 },
      { book_id: 'JHN', chapter: 10 },
      { book_id: 'JHN', chapter: 16 },
      { book_id: 'ACT', chapter: 8 },
      { book_id: 'ACT', chapter: 13 },
      { book_id: 'HEB', chapter: 1 },
      { book_id: '1JN', chapter: 4 },
      { book_id: 'PSA', chapter: 46 },
      { book_id: 'ROM', chapter: 12 }
    ]
  },
  {
    id: 'sharing-your-faith',
    title: 'plan.presets.sharingYourFaith.title',
    desc: 'plan.presets.sharingYourFaith.desc',
    category: 'discipline',
    days: 14,
    // Parcours du profil « Porteur » (évangélisation) : Pentecôte → premiers
    // témoignages (Étienne, Philippe, Corneille, Lydie, Athènes) → l'envoi
    // (Marc/Matthieu) → comment en parler (Romains) → avec douceur (1 Pierre).
    chapters: [
      { book_id: 'ACT', chapter: 1 },
      { book_id: 'ACT', chapter: 2 },
      { book_id: 'ACT', chapter: 3 },
      { book_id: 'ACT', chapter: 4 },
      { book_id: 'ACT', chapter: 8 },
      { book_id: 'ACT', chapter: 9 },
      { book_id: 'ACT', chapter: 10 },
      { book_id: 'ACT', chapter: 16 },
      { book_id: 'ACT', chapter: 17 },
      { book_id: 'MRK', chapter: 16 },
      { book_id: 'MAT', chapter: 28 },
      { book_id: 'ROM', chapter: 1 },
      { book_id: 'ROM', chapter: 10 },
      { book_id: '1PE', chapter: 3 }
    ]
  }
]

/** Retrouve un préétabli par id. */
export function getPreset(id) {
  return PRESET_PLANS.find((p) => p.id === id) ?? null
}

/** Plans d'une catégorie donnée (écran de choix, groupé). */
export function presetsByCategory(category) {
  return PRESET_PLANS.filter((p) => p.category === category)
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
