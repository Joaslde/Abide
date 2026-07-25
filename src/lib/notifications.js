/**
 * Notifications LOCALES (Sanctuaire : rappels de prière + accompagnement de jeûne).
 *
 * Pourquoi locales et pas push (FCM) ? Les rappels ont des dates CONNUES À
 * L'AVANCE → on les planifie sur l'appareil : ça marche hors ligne, sans
 * backend, sans token. Le push serveur (todo 1.6) reste pour les messages
 * imprévisibles (annonces, contenus dynamiques).
 *
 * IDEMPOTENCE : les ids sont déterministes (plages réservées par usage).
 * À chaque démarrage on annule nos plages puis on re-planifie l'état courant
 * (jeûne actif + prochain jeûne). Borne le nombre de notifications programmées
 * (contrainte OS : ~64 en attente max sur iOS, limite similaire selon Android).
 *
 * Plages d'ids :
 *   1..2        rappels quotidiens de prière (matin, soir)
 *   3..4        alerte streak en danger CE SOIR (3 = doux 19h, 4 = urgent 22h)
 *   10..15      relance série perdue, matin(10h) + soir(19h) × J+1/J+2/J+3
 *   1000..1999  notifications du jeûne PROCHAIN (annonce J-3/J-1/Jour J + rappels)
 *   2000..3999  notifications du jeûne ACTIF (encouragements 12h/16h + fin)
 */

import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { i18n } from '@/i18n'
import { fastingEncouragement, prayerReminder } from '@/data/prayerPool'
import { streakMessage } from '@/data/streakMessages'
import { fastDays } from '@/data/fastingCalendar'

const isNative = Capacitor.isNativePlatform()

// Rappels de prière : plusieurs créneaux par moment, ANNULÉS dès que la prière
// du moment est faite. Ids réservés : matin 20..29, soir 30..39.
const PRAYER_MORNING_BASE = 20
const PRAYER_EVENING_BASE = 30
const PRAYER_HOURS = {
  morning: [10, 12], // relances tant que la prière du matin n'est pas faite
  evening: [18, 20, 22] // idem pour le soir
}

const STREAK_SOFT_ID = 3
const STREAK_URGENT_ID = 4
const STREAK_LOST_BASE = 10
const STREAK_LOST_DAYS = 3 // relance sur J+1, J+2, J+3 puis on arrête (façon Duolingo, sans harceler)

function t(key, params) {
  return i18n.global.t(key, params ?? {})
}

/** Demande la permission (Android 13+ ; avant = accordée d'office). */
export async function ensureNotificationPermission() {
  if (!isNative) return false
  try {
    const status = await LocalNotifications.checkPermissions()
    if (status.display === 'granted') return true
    const req = await LocalNotifications.requestPermissions()
    return req.display === 'granted'
  } catch {
    return false
  }
}

/** Annule une plage d'ids (silencieux si rien à annuler). */
async function cancelRange(from, to) {
  try {
    const pending = await LocalNotifications.getPending()
    const ids = (pending.notifications ?? [])
      .map((n) => n.id)
      .filter((id) => id >= from && id <= to)
    if (ids.length) {
      await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) })
    }
  } catch { /* noop */ }
}

/* ───────────────────── Rappels de prière (multi-créneaux) ───────────────────── */

/** Base d'ids réservée à un moment de prière. */
function prayerBase(type) {
  return type === 'morning' ? PRAYER_MORNING_BASE : PRAYER_EVENING_BASE
}

/**
 * Annule TOUS les rappels restants d'un moment (matin ou soir).
 * Appelé dès que la prière du moment est faite (bouton « Amen ») → l'utilisateur
 * n'est plus relancé pour ce moment-là aujourd'hui.
 */
export async function cancelPrayerReminders(type) {
  if (!isNative) return
  const base = prayerBase(type)
  await cancelRange(base, base + 9)
}

/**
 * Planifie les rappels d'UN moment de prière pour AUJOURD'HUI, uniquement si
 * la prière n'est pas déjà faite. Plusieurs créneaux (voir PRAYER_HOURS) avec
 * un ton qui monte : on relance tant que le moment n'est pas accompli.
 *
 * Notifications DATÉES (pas répétitives) : c'est ce qui permet de les annuler
 * dès que la prière est faite. Elles sont re-planifiées chaque jour au démarrage
 * de l'app (rescheduleAll) et à chaque fois qu'un moment est complété.
 *
 * @param {'morning'|'evening'} type
 * @param {boolean} done  le moment est-il déjà accompli aujourd'hui ?
 */
export async function schedulePrayerMoment(type, done) {
  if (!isNative) return
  await cancelPrayerReminders(type)
  if (done) return
  if (!(await ensureNotificationPermission())) return

  const locale = i18n.global.locale.value
  const now = new Date()
  const base = prayerBase(type)
  const list = []

  PRAYER_HOURS[type].forEach((hour, slot) => {
    const when = new Date()
    when.setHours(hour, 0, 0, 0)
    if (when <= now) return // créneau déjà passé aujourd'hui

    const msg = prayerReminder(type, slot, locale, when)
    list.push({
      id: base + slot,
      title: msg.title,
      body: msg.body,
      // largeBody → style « grand texte » Android : la notification devient
      // DÉPLIABLE (sans lui, le texte long est tronqué sans bouton d'expansion).
      largeBody: msg.largeBody,
      summaryText: t('sanctuaire.title'),
      schedule: { at: when, allowWhileIdle: true },
      smallIcon: 'ic_stat_abide',
      largeIcon: 'notif_banner',
      iconColor: '#C9A84C',
      extra: { route: `/tabs/sanctuaire/moment?type=${type}` }
    })
  })

  if (list.length) await LocalNotifications.schedule({ notifications: list }).catch(() => {})
}

/** Planifie les rappels des DEUX moments selon leur état d'accomplissement. */
export async function schedulePrayerReminders({ morningDone = false, eveningDone = false } = {}) {
  await schedulePrayerMoment('morning', morningDone)
  await schedulePrayerMoment('evening', eveningDone)
}

/* ───────────────────── Alerte streak en danger (façon Duolingo) ───────────────────── */

/**
 * Planifie l'alerte du soir en 2 PALIERS si la Bible n'a pas encore été lue
 * aujourd'hui — sinon annule tout. Les local-notifications étant "tire et
 * oublie" (pas de condition évaluée par l'OS au déclenchement), on republifie
 * ce check à chaque ouverture d'app (App.vue) : si l'utilisateur lit un
 * chapitre après coup, les deux alertes sont annulées aussitôt.
 *   19h — doux  : simple rappel, ton mesuré.
 *   22h — urgent: seulement si TOUJOURS pas lu, ton plus pressant (2h avant minuit).
 * @param {boolean} readToday  un chapitre a-t-il déjà été lu aujourd'hui ?
 * @param {number} streak      streak actuel (0 = pas de série à perdre → pas d'alerte)
 */
export async function scheduleStreakWarning(readToday, streak) {
  if (!isNative) return
  await LocalNotifications.cancel({
    notifications: [{ id: STREAK_SOFT_ID }, { id: STREAK_URGENT_ID }]
  }).catch(() => {})
  if (readToday || streak <= 0) return
  if (!(await ensureNotificationPermission())) return

  const now = new Date()
  const locale = i18n.global.locale.value
  const soft = new Date(); soft.setHours(19, 0, 0, 0)
  const urgent = new Date(); urgent.setHours(22, 0, 0, 0)

  const list = []
  if (soft > now) {
    const msg = streakMessage('soft', locale, { streak }, now)
    list.push({
      id: STREAK_SOFT_ID,
      title: msg.title,
      body: msg.body,
      largeBody: msg.body, // rend la notif dépliable (style grand texte Android)
      schedule: { at: soft, allowWhileIdle: true },
      smallIcon: 'ic_stat_abide',
      largeIcon: 'notif_banner',
      iconColor: '#C9A84C',
      extra: { route: '/tabs/immersion' }
    })
  }
  if (urgent > now) {
    const msg = streakMessage('urgent', locale, { streak }, now)
    list.push({
      id: STREAK_URGENT_ID,
      title: msg.title,
      body: msg.body,
      largeBody: msg.body, // rend la notif dépliable (style grand texte Android)
      schedule: { at: urgent, allowWhileIdle: true },
      smallIcon: 'ic_stat_abide',
      largeIcon: 'notif_banner',
      iconColor: '#C9A84C',
      extra: { route: '/tabs/immersion' }
    })
  }
  if (list.length) await LocalNotifications.schedule({ notifications: list }).catch(() => {})
}

/**
 * Planifie une RELANCE quand une série vient de se casser (ton direct, façon
 * Duolingo) : un rappel MATIN (10h) + SOIR (19h) chaque jour, pendant
 * STREAK_LOST_DAYS jours (J+1 à J+3), puis on arrête — insistant sans harceler.
 * Textes variés à chaque notification (streakMessages.js), jamais deux fois la
 * même formulation consécutive. Appelée UNE fois au moment précis où load()
 * détecte la casse (hier une série existait, aujourd'hui elle est à 0) — pas à
 * chaque démarrage, pour ne pas re-décaler les dates à chaque ouverture d'app.
 * @param {number} lostStreak  la série qui vient de se casser (doit être > 0)
 */
export async function scheduleStreakLostFollowUp(lostStreak) {
  if (!isNative || lostStreak <= 0) return
  await cancelStreakLostFollowUp()
  if (!(await ensureNotificationPermission())) return

  const locale = i18n.global.locale.value
  const list = []
  let id = STREAK_LOST_BASE
  let salt = 0

  for (let day = 1; day <= STREAK_LOST_DAYS; day++) {
    for (const hour of [10, 19]) {
      const when = new Date(); when.setDate(when.getDate() + day); when.setHours(hour, 0, 0, 0)
      const msg = streakMessage('lost', locale, { streak: lostStreak }, when, salt++)
      list.push({
        id: id++,
        title: msg.title,
        body: msg.body,
        largeBody: msg.body, // rend la notif dépliable (style grand texte Android)
        schedule: { at: when, allowWhileIdle: true },
        smallIcon: 'ic_stat_abide',
        largeIcon: 'notif_banner',
        iconColor: '#C9A84C',
        extra: { route: '/tabs/immersion' }
      })
    }
  }

  await LocalNotifications.schedule({ notifications: list }).catch(() => {})
}

/** Annule la relance « série perdue » (l'utilisateur a repris avant la fin des rappels). */
export async function cancelStreakLostFollowUp() {
  if (!isNative) return
  await cancelRange(STREAK_LOST_BASE, STREAK_LOST_BASE + STREAK_LOST_DAYS * 2 - 1)
}

/* ───────────────────── Accompagnement de jeûne ───────────────────── */

function atDate(iso, hour, minute = 0) {
  const d = new Date(iso + 'T00:00:00')
  d.setHours(hour, minute, 0, 0)
  return d
}

/**
 * Planifie les notifications du PROCHAIN jeûne (pas encore rejoint) :
 * J-3 « prépare-toi », J-1 « c'est demain », Jour J « y participes-tu ? »,
 * puis un rappel discret quotidien (9h) pendant la période.
 */
export async function scheduleUpcomingFast(fast) {
  if (!isNative || !fast) return
  if (!(await ensureNotificationPermission())) return
  await cancelRange(UPCOMING_BASE, UPCOMING_BASE + 999)

  const label = t(`sanctuaire.fasts.${fast.type}.title`)
  const now = new Date()
  const list = []
  let id = UPCOMING_BASE

  const push = (when, title, body) => {
    if (when > now) list.push({
      id: id++,
      title,
      body,
      schedule: { at: when, allowWhileIdle: true },
      smallIcon: 'ic_stat_abide',
        largeIcon: 'notif_banner',
        iconColor: '#C9A84C',
      extra: { route: '/tabs/sanctuaire/fasting' }
    })
  }

  // J-3 / J-1 (9h)
  const j3 = atDate(fast.start, 9); j3.setDate(j3.getDate() - 3)
  const j1 = atDate(fast.start, 9); j1.setDate(j1.getDate() - 1)
  push(j3, t('sanctuaire.notif.fastSoonTitle', { fast: label }), t('sanctuaire.notif.fastSoonBody'))
  push(j1, t('sanctuaire.notif.fastTomorrowTitle', { fast: label }), t('sanctuaire.notif.fastTomorrowBody'))
  // Jour J (7h30) : invitation à participer
  push(atDate(fast.start, 7, 30), t('sanctuaire.notif.fastStartTitle', { fast: label }), t('sanctuaire.notif.fastStartBody'))

  // Rappels discrets quotidiens pendant la période (9h), bornés à 45 jours.
  const days = Math.min(fastDays(fast), 45)
  for (let d = 1; d < days; d++) {
    const when = atDate(fast.start, 9)
    when.setDate(when.getDate() + d)
    push(when, t('sanctuaire.notif.fastOngoingTitle', { fast: label }), t('sanctuaire.notif.fastOngoingBody'))
  }

  if (list.length) await LocalNotifications.schedule({ notifications: list }).catch(() => {})
}

/**
 * Planifie l'ACCOMPAGNEMENT du jeûne rejoint : encouragements 12h & 16h
 * (verset + note du pool), ton « la fin approche » sur les ~3 derniers jours,
 * félicitations le dernier jour au soir.
 */
export async function scheduleActiveFast(fast) {
  if (!isNative || !fast) return
  if (!(await ensureNotificationPermission())) return
  await cancelRange(ACTIVE_BASE, ACTIVE_BASE + 1999)
  // Le jeûne rejoint remplace les annonces du « prochain jeûne ».
  await cancelRange(UPCOMING_BASE, UPCOMING_BASE + 999)

  const locale = i18n.global.locale.value
  const total = fastDays(fast)
  const days = Math.min(total, 60)
  const now = new Date()
  const list = []
  let id = ACTIVE_BASE

  for (let d = 0; d < days; d++) {
    const dayNum = d + 1
    const isLast = dayNum === total
    const nearEnd = total - dayNum < 3 && !isLast

    for (const [slot, hour] of [[0, 12], [1, 16]]) {
      const when = atDate(fast.start, hour)
      when.setDate(when.getDate() + d)
      if (when <= now) continue

      const enc = fastingEncouragement(locale, when, slot)
      let title = t('sanctuaire.notif.encourageTitle', { day: dayNum, total })
      if (nearEnd) title = t('sanctuaire.notif.nearEndTitle', { day: dayNum, total })
      list.push({
        id: id++,
        title,
        // Replié : le verset seul. Déplié (largeBody) : verset + encouragement.
        body: `« ${enc.text} »`,
        largeBody: `« ${enc.text} »\n\n${enc.note}`,
        summaryText: enc.verse,
        schedule: { at: when, allowWhileIdle: true },
        smallIcon: 'ic_stat_abide',
        largeIcon: 'notif_banner',
        iconColor: '#C9A84C',
        extra: { route: '/tabs/sanctuaire/fasting' }
      })
    }

    if (isLast) {
      const when = atDate(fast.start, 19)
      when.setDate(when.getDate() + d)
      if (when > now) {
        list.push({
          id: id++,
          title: t('sanctuaire.notif.completedTitle'),
          body: t('sanctuaire.notif.completedBody'),
          schedule: { at: when, allowWhileIdle: true },
          smallIcon: 'ic_stat_abide',
        largeIcon: 'notif_banner',
        iconColor: '#C9A84C',
          extra: { route: '/tabs/sanctuaire/fasting' }
        })
      }
    }
  }

  if (list.length) await LocalNotifications.schedule({ notifications: list }).catch(() => {})
}

/** Annule l'accompagnement (quitter le jeûne). */
export async function cancelActiveFast() {
  if (!isNative) return
  await cancelRange(ACTIVE_BASE, ACTIVE_BASE + 1999)
}

/**
 * Écoute le tap sur une notification locale (app en arrière-plan OU tuée) et
 * navigue vers la route encodée dans `extra.route` (prière du matin/soir,
 * écran de jeûne…). À appeler une seule fois, depuis App.vue au démarrage.
 */
export function registerNotificationTapHandler(router) {
  if (!isNative) return
  LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
    const route = event?.notification?.extra?.route
    if (route) router.push(route)
  })
}

/**
 * Re-planification GLOBALE au démarrage (idempotente) :
 * rappels de prière + jeûne actif (si participation) OU annonces du prochain.
 * Appelée depuis App.vue une fois les stores chargés.
 */
export async function rescheduleAll({
  activeFast = null, upcomingFast = null, morningDone = false, eveningDone = false
} = {}) {
  if (!isNative) return
  await schedulePrayerReminders({ morningDone, eveningDone })
  if (activeFast) {
    await scheduleActiveFast(activeFast)
  } else {
    await cancelRange(ACTIVE_BASE, ACTIVE_BASE + 1999)
    if (upcomingFast) await scheduleUpcomingFast(upcomingFast)
  }
}
