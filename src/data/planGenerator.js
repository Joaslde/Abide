/**
 * Génération de plans de lecture (fonctions pures, 100 % offline).
 *
 * CANON : les 66 livres avec leur nombre de chapitres (extrait de la LSG).
 * Les ID sont canoniques et partagés entre toutes les versions.
 */

export const CANON = [
  { id: 'GEN', t: 'OT', ch: 50 }, { id: 'EXO', t: 'OT', ch: 40 }, { id: 'LEV', t: 'OT', ch: 27 },
  { id: 'NUM', t: 'OT', ch: 36 }, { id: 'DEU', t: 'OT', ch: 34 }, { id: 'JOS', t: 'OT', ch: 24 },
  { id: 'JDG', t: 'OT', ch: 21 }, { id: 'RUT', t: 'OT', ch: 4 }, { id: '1SA', t: 'OT', ch: 31 },
  { id: '2SA', t: 'OT', ch: 24 }, { id: '1KI', t: 'OT', ch: 22 }, { id: '2KI', t: 'OT', ch: 25 },
  { id: '1CH', t: 'OT', ch: 29 }, { id: '2CH', t: 'OT', ch: 36 }, { id: 'EZR', t: 'OT', ch: 10 },
  { id: 'NEH', t: 'OT', ch: 13 }, { id: 'EST', t: 'OT', ch: 10 }, { id: 'JOB', t: 'OT', ch: 42 },
  { id: 'PSA', t: 'OT', ch: 150 }, { id: 'PRO', t: 'OT', ch: 31 }, { id: 'ECC', t: 'OT', ch: 12 },
  { id: 'SNG', t: 'OT', ch: 8 }, { id: 'ISA', t: 'OT', ch: 66 }, { id: 'JER', t: 'OT', ch: 52 },
  { id: 'LAM', t: 'OT', ch: 5 }, { id: 'EZK', t: 'OT', ch: 48 }, { id: 'DAN', t: 'OT', ch: 12 },
  { id: 'HOS', t: 'OT', ch: 14 }, { id: 'JOL', t: 'OT', ch: 3 }, { id: 'AMO', t: 'OT', ch: 9 },
  { id: 'OBA', t: 'OT', ch: 1 }, { id: 'JON', t: 'OT', ch: 4 }, { id: 'MIC', t: 'OT', ch: 7 },
  { id: 'NAM', t: 'OT', ch: 3 }, { id: 'HAB', t: 'OT', ch: 3 }, { id: 'ZEP', t: 'OT', ch: 3 },
  { id: 'HAG', t: 'OT', ch: 2 }, { id: 'ZEC', t: 'OT', ch: 14 }, { id: 'MAL', t: 'OT', ch: 4 },
  { id: 'MAT', t: 'NT', ch: 28 }, { id: 'MRK', t: 'NT', ch: 16 }, { id: 'LUK', t: 'NT', ch: 24 },
  { id: 'JHN', t: 'NT', ch: 21 }, { id: 'ACT', t: 'NT', ch: 28 }, { id: 'ROM', t: 'NT', ch: 16 },
  { id: '1CO', t: 'NT', ch: 16 }, { id: '2CO', t: 'NT', ch: 13 }, { id: 'GAL', t: 'NT', ch: 6 },
  { id: 'EPH', t: 'NT', ch: 6 }, { id: 'PHP', t: 'NT', ch: 4 }, { id: 'COL', t: 'NT', ch: 4 },
  { id: '1TH', t: 'NT', ch: 5 }, { id: '2TH', t: 'NT', ch: 3 }, { id: '1TI', t: 'NT', ch: 6 },
  { id: '2TI', t: 'NT', ch: 4 }, { id: 'TIT', t: 'NT', ch: 3 }, { id: 'PHM', t: 'NT', ch: 1 },
  { id: 'HEB', t: 'NT', ch: 13 }, { id: 'JAS', t: 'NT', ch: 5 }, { id: '1PE', t: 'NT', ch: 5 },
  { id: '2PE', t: 'NT', ch: 3 }, { id: '1JN', t: 'NT', ch: 5 }, { id: '2JN', t: 'NT', ch: 1 },
  { id: '3JN', t: 'NT', ch: 1 }, { id: 'JUD', t: 'NT', ch: 1 }, { id: 'REV', t: 'NT', ch: 22 }
]

/** Portées disponibles en v1. */
export const SCOPES = ['full', 'nt', 'psalms']

/** Durées disponibles → nb de jours. */
export const PLAN_DURATIONS = { '7j': 7, '30j': 30, '90j': 90 }

/**
 * Liste ordonnée de {book_id, chapter} pour une portée.
 * full = Genèse→Apocalypse ; ot = Ancien Testament ; nt = Matthieu→Apocalypse ;
 * psalms = Psaumes ; book = un livre précis (bookId requis).
 */
export function chaptersForScope(scope, bookId = null) {
  let books = CANON
  if (scope === 'ot') books = CANON.filter((b) => b.t === 'OT')
  else if (scope === 'nt') books = CANON.filter((b) => b.t === 'NT')
  else if (scope === 'psalms') books = CANON.filter((b) => b.id === 'PSA')
  else if (scope === 'book') books = CANON.filter((b) => b.id === bookId)
  const out = []
  for (const b of books) {
    for (let c = 1; c <= b.ch; c++) out.push({ book_id: b.id, chapter: c })
  }
  return out
}

/**
 * Répartit une liste EXPLICITE de chapitres sur `totalDays` jours (préétablis).
 * @param {Array<{book_id,chapter}>} chapters
 * @returns {Array<{day, items}>}
 */
export function buildScheduleFromChapters(chapters, totalDays) {
  const total = chapters.length
  const days = Math.max(1, Math.min(totalDays, total))
  const base = Math.floor(total / days)
  const extra = total % days
  const schedule = []
  let idx = 0
  for (let day = 1; day <= days; day++) {
    const count = base + (day <= extra ? 1 : 0)
    schedule.push({ day, items: chapters.slice(idx, idx + count) })
    idx += count
  }
  return schedule
}

/* ─────────────────── Plans « selon mon profil » ─────────────────── */

/**
 * Recette de plan par profil onboarding.
 * scope/bookId définissent le contenu ; days la durée ; title une clé i18n.
 */
export const PROFILE_RECIPES = {
  // La Source (nouveau/chercheur) : l'Évangile de Jean, en douceur, 21 jours.
  source: { scope: 'book', bookId: 'JHN', days: 21, title: 'plan.profileTitles.source' },
  // Le Marcheur (constance) : tout le Nouveau Testament, 60 jours.
  marcheur: { scope: 'nt', days: 60, title: 'plan.profileTitles.marcheur' },
  // L'Explorateur (profondeur) : l'épître aux Romains, 16 jours.
  explorateur: { scope: 'book', bookId: 'ROM', days: 16, title: 'plan.profileTitles.explorateur' },
  // Le Veilleur (réconfort) : les Psaumes, 30 jours.
  veilleur: { scope: 'psalms', days: 30, title: 'plan.profileTitles.veilleur' },
  // Le Porteur (évangélisation) : les Actes des Apôtres, 28 jours.
  porteur: { scope: 'book', bookId: 'ACT', days: 28, title: 'plan.profileTitles.porteur' }
}

/** Recette de plan pour un profil (repli marcheur si inconnu/invité). */
export function recipeForProfile(profile) {
  return PROFILE_RECIPES[profile] ?? PROFILE_RECIPES.marcheur
}

/**
 * Répartit les chapitres d'une portée sur `totalDays` jours de façon équilibrée.
 * @returns {Array<{day:number, items:Array<{book_id,chapter}>}>}
 */
export function buildSchedule({ totalDays, scope, bookId = null }) {
  const chapters = chaptersForScope(scope, bookId)
  return buildScheduleFromChapters(chapters, totalDays)
}
