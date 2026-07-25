/**
 * Calendrier des jeûnes chrétiens — fonctions PURES (testables sans Vue).
 *
 * Principe : AUCUNE maintenance annuelle. Les fêtes mobiles (Carême, Vendredi
 * Saint) sont calculées depuis la date de Pâques (algorithme du Computus) ;
 * les périodes fixes (jeûne de janvier) sont des règles simples ; l'Avent se
 * déduit de Noël. On peut donc générer le calendrier de n'importe quelle année.
 *
 * ⚠️ Le jeûne de janvier (« 21 jours de Daniel ») varie selon les églises
 * (certaines 16 janv→5 févr, d'autres 17 janv→6 févr…). Défaut retenu :
 * 1er → 21 janvier. Les églises qui font autrement passent par le « jeûne
 * personnel » (dates libres, même accompagnement).
 */

/** Date locale 'YYYY-MM-DD' (aligné sur streak.js — pas d'UTC). */
export function isoDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

/**
 * Date de Pâques (dimanche) pour une année — algorithme de Meeus/Butcher
 * (Computus grégorien). Exact pour toutes les années grégoriennes.
 * @returns {string} 'YYYY-MM-DD'
 */
export function computeEaster(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3 = mars, 4 = avril
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** 4e dimanche avant Noël (début de l'Avent). */
function adventStart(year) {
  const christmas = new Date(`${year}-12-25T00:00:00`)
  // Dimanche précédant (ou égal si Noël tombe un dimanche → l'Avent commence 4 dimanches avant).
  const dow = christmas.getDay() // 0 = dimanche
  const daysToPrevSunday = dow === 0 ? 7 : dow
  const fourthSunday = new Date(christmas)
  fourthSunday.setDate(christmas.getDate() - daysToPrevSunday - 21)
  return isoDate(fourthSunday)
}

/**
 * Tous les jeûnes/périodes d'une année.
 * @returns {Array<{id:string, type:string, start:string, end:string}>}
 */
export function buildFastingCalendar(year) {
  const easter = computeEaster(year)
  return [
    {
      id: `january-${year}`,
      type: 'january',
      start: `${year}-01-01`,
      end: `${year}-01-21`
    },
    {
      // Carême : Mercredi des Cendres (Pâques − 46 j) → Samedi Saint (Pâques − 1 j).
      id: `lent-${year}`,
      type: 'lent',
      start: addDays(easter, -46),
      end: addDays(easter, -1)
    },
    {
      // Vendredi Saint (jour unique, souvent jeûné même hors Carême complet).
      id: `goodfriday-${year}`,
      type: 'goodfriday',
      start: addDays(easter, -2),
      end: addDays(easter, -2)
    },
    {
      // Avent : 4e dimanche avant Noël → veille de Noël.
      id: `advent-${year}`,
      type: 'advent',
      start: adventStart(year),
      end: `${year}-12-24`
    }
  ]
}

/** Calendrier couvrant l'année courante + la suivante (pour « prochain jeûne »). */
export function calendarAround(date = new Date()) {
  const y = date.getFullYear()
  return [...buildFastingCalendar(y), ...buildFastingCalendar(y + 1)]
}

/** Les jeûnes qui touchent un mois donné (year, month 1-12). */
export function fastsForMonth(year, month) {
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-31`
  return [...buildFastingCalendar(year - 1), ...buildFastingCalendar(year)]
    .filter((f) => f.start <= monthEnd && f.end >= monthStart)
}

/** Le jeûne calendaire couvrant une date (ou null). */
export function fastForDate(iso) {
  const year = Number(iso.slice(0, 4))
  const all = [...buildFastingCalendar(year - 1), ...buildFastingCalendar(year)]
  return all.find((f) => f.start <= iso && f.end >= iso) ?? null
}

/** Le prochain jeûne à partir d'une date (celui en cours est prioritaire). */
export function nextFast(iso) {
  const current = fastForDate(iso)
  if (current) return current
  const year = Number(iso.slice(0, 4))
  const all = [...buildFastingCalendar(year), ...buildFastingCalendar(year + 1)]
    .filter((f) => f.start > iso)
    .sort((a, b) => a.start.localeCompare(b.start))
  return all[0] ?? null
}

/** Nombre de jours d'un jeûne (bornes incluses). */
export function fastDays(fast) {
  const s = new Date(fast.start + 'T00:00:00')
  const e = new Date(fast.end + 'T00:00:00')
  return Math.round((e - s) / 86400000) + 1
}

/** Jour courant (1-based) dans un jeûne, pour une date donnée. */
export function dayInFast(fast, iso) {
  const s = new Date(fast.start + 'T00:00:00')
  const d = new Date(iso + 'T00:00:00')
  return Math.round((d - s) / 86400000) + 1
}
