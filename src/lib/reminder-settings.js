/**
 * Réglages des rappels du jour : heure et activation de CHAQUE rappel.
 *
 * Avant (jusqu'à la v1.4), les heures étaient figées dans notifications.js et
 * le premier rappel tombait à 10h, trop tard pour beaucoup d'utilisateurs
 * (retours du 2026-11-12). Le premier rappel passe à 7h par défaut et chaque
 * rappel devient réglable dans Réglages → Notifications.
 *
 * Les rappels d'un même groupe sont ORDONNÉS : le ton monte d'un créneau à
 * l'autre (invitation, relance, dernier appel ; cf. prayerPool.js). Les heures
 * sont donc toujours rangées dans l'ordre chronologique à l'enregistrement,
 * pour qu'une relance ne passe jamais avant l'invitation.
 *
 * Stockage : @capacitor/preferences. Module sans dépendance Pinia, comme
 * notifications.js qui le lit au moment de planifier.
 */
import { Preferences } from '@capacitor/preferences'

const KEY = 'abide.reminders'

/** Groupes de rappels, dans l'ordre d'affichage. */
export const REMINDER_GROUPS = ['morning', 'evening', 'streak']

/**
 * Valeurs par défaut, par groupe et dans l'ordre des créneaux.
 * Les créneaux du soir (prière et série) restent ceux de la v1.4.
 */
const DEFAULTS = {
  morning: ['07:00', '12:00'],
  evening: ['18:00', '20:00', '22:00'],
  streak: ['19:00', '22:00']
}

/** @typedef {{ time: string, on: boolean }} Reminder */

/** @returns {Record<string, Reminder[]>} copie fraîche des valeurs par défaut */
function defaults() {
  return Object.fromEntries(
    REMINDER_GROUPS.map((g) => [g, DEFAULTS[g].map((time) => ({ time, on: true }))])
  )
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

/** Valide et complète une valeur lue (version future, stockage abîmé…). */
function sanitize(raw) {
  const base = defaults()
  if (!raw || typeof raw !== 'object') return base
  for (const g of REMINDER_GROUPS) {
    const list = Array.isArray(raw[g]) ? raw[g] : []
    base[g] = base[g].map((def, i) => {
      const r = list[i]
      return {
        time: TIME_RE.test(r?.time) ? r.time : def.time,
        on: typeof r?.on === 'boolean' ? r.on : def.on
      }
    })
    base[g] = sortByTime(base[g])
  }
  return base
}

function sortByTime(list) {
  return [...list].sort((a, b) => a.time.localeCompare(b.time))
}

let cache = null

/** Charge les réglages (mis en cache après la première lecture). */
export async function loadReminderSettings() {
  if (cache) return cache
  try {
    const { value } = await Preferences.get({ key: KEY })
    cache = sanitize(value ? JSON.parse(value) : null)
  } catch {
    cache = defaults()
  }
  return cache
}

/**
 * Enregistre les réglages. Les heures de chaque groupe sont rangées dans
 * l'ordre chronologique (voir l'en-tête du fichier).
 * @param {Record<string, Reminder[]>} next
 * @returns {Promise<Record<string, Reminder[]>>} les réglages tels qu'enregistrés
 */
export async function saveReminderSettings(next) {
  cache = sanitize(next)
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(cache) })
  } catch (e) {
    console.warn('[reminders] enregistrement impossible', e)
  }
  return cache
}

/**
 * Créneaux ACTIFS d'un groupe, prêts à planifier.
 * `slot` garde la position du créneau dans le groupe : c'est elle qui choisit
 * le ton du message (invitation, relance, dernier appel).
 * @param {'morning'|'evening'|'streak'} group
 * @returns {Promise<{ slot: number, hour: number, minute: number }[]>}
 */
export async function activeSlots(group) {
  const settings = await loadReminderSettings()
  return settings[group]
    .map((r, slot) => ({ ...r, slot }))
    .filter((r) => r.on)
    .map(({ time, slot }) => {
      const [hour, minute] = time.split(':').map(Number)
      return { slot, hour, minute }
    })
}

/** Empreinte courte des réglages (fait partie de l'empreinte des notifications). */
export async function reminderFingerprint() {
  const s = await loadReminderSettings()
  return REMINDER_GROUPS.map((g) => s[g].map((r) => (r.on ? r.time : '-')).join(',')).join('|')
}

/** Réglages par défaut (bouton « Rétablir les heures par défaut »). */
export function defaultReminderSettings() {
  return defaults()
}

/**
 * Heures proposées selon le moment préféré choisi à l'onboarding (Q12).
 * Seul le groupe concerné change ; l'utilisateur peut tout réajuster ensuite.
 */
const PREFERRED_SLOT_TIMES = {
  morning: { morning: ['07:00', '12:00'] },
  noon: { morning: ['12:00', '14:00'] },
  evening: { evening: ['18:00', '20:00', '22:00'] },
  night: { evening: ['21:00', '22:00', '23:00'] }
}

/** @param {'morning'|'noon'|'evening'|'night'} slot */
export async function applyPreferredSlot(slot) {
  const preset = PREFERRED_SLOT_TIMES[slot]
  if (!preset) return
  const current = JSON.parse(JSON.stringify(await loadReminderSettings()))
  for (const [group, times] of Object.entries(preset)) {
    current[group] = times.map((time) => ({ time, on: true }))
  }
  await saveReminderSettings(current)
}
