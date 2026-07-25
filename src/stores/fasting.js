import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fastForDate, nextFast as calNextFast, fastDays, dayInFast
} from '@/data/fastingCalendar'
import {
  activeFast, joinFast as dbJoin, leaveFast as dbLeave,
  completeFast as dbComplete, fastHistory
} from '@/lib/user-db'
import { localDateStr } from '@/stores/streak'

/**
 * Sanctuaire — tracker de jeûne.
 * Le CALENDRIER (jours de jeûne chrétiens) est calculé (fastingCalendar, pur).
 * La PARTICIPATION de l'utilisateur est locale (user-db, table fasting).
 */
export const useFastingStore = defineStore('fasting', () => {
  const participation = ref(null) // ligne fasting active (status=joined), ou null
  const history = ref([])

  /** Jeûne calendaire couvrant AUJOURD'HUI (qu'on y participe ou non). */
  const todayFast = computed(() => fastForDate(localDateStr()))

  /** Prochain jeûne calendaire (celui en cours est prioritaire). */
  const upcomingFast = computed(() => calNextFast(localDateStr()))

  /** Participe-t-on au jeûne du moment ? */
  const isParticipating = computed(() => {
    const p = participation.value
    if (!p) return false
    const today = localDateStr()
    return p.start <= today && p.end >= today
  })

  /** Progression de la participation active : { day, total } ou null. */
  const progress = computed(() => {
    const p = participation.value
    if (!p) return null
    const today = localDateStr()
    if (today < p.start) return { day: 0, total: fastDays(p) }
    return { day: Math.min(dayInFast(p, today), fastDays(p)), total: fastDays(p) }
  })

  async function load() {
    const today = localDateStr()
    participation.value = await activeFast(today)
    // Un jeûne rejoint dont la fin est passée → marquer terminé automatiquement.
    if (participation.value && participation.value.end < today) {
      await dbComplete(participation.value.id)
      participation.value = null
    }
    history.value = await fastHistory()
  }

  /** Rejoindre un jeûne du calendrier (ou en cours). */
  async function join(fast) {
    await dbJoin({ id: fast.id, type: fast.type, start: fast.start, end: fast.end })
    await load()
  }

  /** Démarrer un jeûne PERSONNEL de N jours à partir d'aujourd'hui. */
  async function startPersonal(days) {
    const start = localDateStr()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + (days - 1))
    const end = localDateStr(endDate)
    await dbJoin({ id: `personal-${Date.now().toString(36)}`, type: 'personal', start, end })
    await load()
  }

  /** Quitter le jeûne en cours. */
  async function leave() {
    if (!participation.value) return
    await dbLeave(participation.value.id)
    await load()
  }

  return {
    participation,
    history,
    todayFast,
    upcomingFast,
    isParticipating,
    progress,
    load,
    join,
    startPersonal,
    leave
  }
})
