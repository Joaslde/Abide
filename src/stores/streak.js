import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getStreak, setStreak as dbSetStreak, readDatesInRange, allReadDates, markActiveDay
} from '@/lib/user-db'
import { pushUserData } from '@/lib/sync'
import { scheduleStreakWarning, scheduleStreakLostFollowUp, cancelStreakLostFollowUp } from '@/lib/notifications'

/** Date locale 'YYYY-MM-DD' (pas UTC — le streak suit le fuseau de l'utilisateur). */
export function localDateStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}


/**
 * Streak RÉEL calculé depuis l'ensemble des dates lues (Duolingo-like).
 * On repart d'aujourd'hui (ou d'hier si pas encore lu aujourd'hui) et on
 * remonte tant que chaque jour précédent a une lecture. Dès qu'un jour manque,
 * la série s'arrête. Robuste : ne dépend d'AUCUN compteur stocké (donc immunisé
 * contre une valeur corrompue par un ancien bug).
 * @param {Set<string>} dates  dates 'YYYY-MM-DD' où au moins un chapitre a été lu
 * @param {string} today        date du jour 'YYYY-MM-DD'
 * @returns {number}
 */
export function computeStreakFromDates(dates, today) {
  if (!dates || dates.size === 0) return 0

  const prev = (isoDay) => {
    const d = new Date(isoDay + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    return localDateStr(d)
  }

  // Point de départ : aujourd'hui si lu aujourd'hui, sinon hier si lu hier.
  // Si ni aujourd'hui ni hier → série cassée (0).
  let cursor
  if (dates.has(today)) cursor = today
  else if (dates.has(prev(today))) cursor = prev(today)
  else return 0

  // Remonte tant que le jour est présent.
  let count = 0
  while (dates.has(cursor)) {
    count++
    cursor = prev(cursor)
  }
  return count
}

/** Lundi de la semaine contenant `d` (les jours de streak s'affichent lun→dim). */
function mondayOf(d = new Date()) {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // 0 = lundi
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}

export const useStreakStore = defineStore('streak', () => {
  const currentStreak = ref(0)
  const longestStreak = ref(0)
  const lastActive = ref(null)
  // 7 booléens lundi→dimanche : jour où au moins un chapitre a été lu.
  const week = ref([false, false, false, false, false, false, false])
  // Passe à true quand le streak vient d'augmenter → déclenche l'overlay Lottie.
  const justIncremented = ref(false)

  function apply(data) {
    currentStreak.value = data.current_streak ?? 0
    longestStreak.value = data.longest_streak ?? 0
    lastActive.value = data.last_active ?? null
  }

  /**
   * Charge le streak + l'activité de la semaine.
   * Le compteur affiché est TOUJOURS recalculé depuis les dates réellement lues
   * (source de vérité), pas depuis un compteur stocké : robuste et exact façon
   * Duolingo. On rafraîchit aussi le record (longest) si la série actuelle le dépasse.
   */
  async function load() {
    const stored = await getStreak()
    const dates = await allReadDates()
    const today = localDateStr()
    currentStreak.value = computeStreakFromDates(dates, today)
    longestStreak.value = Math.max(stored.longest_streak ?? 0, currentStreak.value)
    lastActive.value = stored.last_active ?? null
    await loadWeek()

    if (currentStreak.value > 0) {
      // Série active : rien à relancer, alerte du soir si pas encore lu aujourd'hui.
      cancelStreakLostFollowUp()
      scheduleStreakWarning(dates.has(today), currentStreak.value)
    } else if ((stored.current_streak ?? 0) > 0) {
      // La dernière valeur connue était > 0 et elle vient de retomber à 0 :
      // la série s'est cassée depuis le dernier passage → relance J+1/J+2.
      // Persiste immédiatement 0 pour ne déclencher cette relance qu'UNE fois.
      await dbSetStreak({
        current_streak: 0, longest_streak: longestStreak.value, last_active: stored.last_active
      })
      scheduleStreakLostFollowUp(stored.current_streak)
    }
  }

  async function loadWeek() {
    const mon = mondayOf()
    const sun = new Date(mon)
    sun.setDate(sun.getDate() + 6)
    const dates = await readDatesInRange(localDateStr(mon), localDateStr(sun))
    const arr = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon)
      d.setDate(d.getDate() + i)
      arr.push(dates.has(localDateStr(d)))
    }
    week.value = arr
  }

  /**
   * Enregistre une activité aujourd'hui (règle permissive : OUVRIR un chapitre
   * suffit — pas besoin de le cocher « lu »). On persiste le jour dans
   * activity_days (source de vérité, immuable) PUIS on recalcule la série
   * depuis l'historique complet.
   * On détecte le 1er passage du jour pour déclencher l'overlay Lottie une fois.
   */
  async function registerReadToday() {
    const today = localDateStr()

    await markActiveDay(today)
    const dates = await allReadDates()
    const newStreak = computeStreakFromDates(dates, today)
    // 1re activité du jour = la série vient d'augmenter → overlay Lottie.
    const wasFirstToday = lastActive.value !== today

    currentStreak.value = newStreak
    longestStreak.value = Math.max(longestStreak.value, newStreak)
    lastActive.value = today
    if (wasFirstToday) justIncremented.value = true

    await dbSetStreak({
      current_streak: newStreak, longest_streak: longestStreak.value, last_active: today
    })
    pushUserData() // sync best-effort
    await loadWeek()
    // La Bible vient d'être lue aujourd'hui → plus rien à craindre ce soir,
    // et si une relance « série perdue » était programmée, elle n'a plus lieu d'être.
    scheduleStreakWarning(true, newStreak)
    cancelStreakLostFollowUp()
  }

  function clearJustIncremented() {
    justIncremented.value = false
  }

  return {
    currentStreak,
    longestStreak,
    lastActive,
    week,
    justIncremented,
    load,
    registerReadToday,
    clearJustIncremented,
    setStreak: apply
  }
})
