import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  listPrayers, savePrayer, deletePrayer,
  markPrayerMoment, isPrayerMomentDone
} from '@/lib/user-db'
import { localDateStr } from '@/stores/streak'
import { pushUserData } from '@/lib/sync'
import { cancelPrayerReminders } from '@/lib/notifications'

/**
 * Sanctuaire — journal de prières + moments quotidiens (matin/soir).
 * Local-first : marche en invité et hors ligne ; sync Supabase best-effort.
 */
export const usePrayerStore = defineStore('prayer', () => {
  const prayers = ref([]) // sujets de prière (tous)
  const morningDone = ref(false)
  const eveningDone = ref(false)

  /** Sujets encore portés (non exaucés), plus récents d'abord. */
  const activePrayers = computed(() => prayers.value.filter((p) => !p.is_answered))

  /** Timeline de gratitude : sujets exaucés, plus récents d'abord. */
  const answeredTimeline = computed(() =>
    prayers.value
      .filter((p) => p.is_answered)
      .sort((a, b) => (b.answered_at || '').localeCompare(a.answered_at || ''))
  )

  async function load() {
    prayers.value = await listPrayers()
    const today = localDateStr()
    morningDone.value = await isPrayerMomentDone(today, 'morning')
    eveningDone.value = await isPrayerMomentDone(today, 'evening')
  }

  /** Ajoute un sujet de prière. */
  async function add(content) {
    const clean = (content ?? '').trim()
    if (!clean) return
    const row = await savePrayer({ id: Date.now().toString(36), content: clean })
    prayers.value = [row, ...prayers.value]
    pushUserData()
  }

  /** Marque un sujet comme exaucé (gratitude). */
  async function markAnswered(id) {
    const p = prayers.value.find((x) => x.id === id)
    if (!p) return
    const updated = await savePrayer({
      ...p,
      is_answered: true,
      answered_at: new Date().toISOString()
    })
    prayers.value = prayers.value.map((x) => (x.id === id ? updated : x))
    pushUserData()
  }

  async function remove(id) {
    await deletePrayer(id)
    prayers.value = prayers.value.filter((x) => x.id !== id)
    pushUserData()
  }

  /** Le moment (morning|evening) du jour est-il fait ? */
  function momentDoneToday(type) {
    return type === 'morning' ? morningDone.value : eveningDone.value
  }

  /** Termine le moment guidé du jour (bouton « Amen »). */
  async function completeMoment(type) {
    await markPrayerMoment(localDateStr(), type)
    if (type === 'morning') morningDone.value = true
    else eveningDone.value = true
    // Le moment est accompli → plus aucune relance pour lui AUJOURD'HUI.
    // `true` = ne toucher qu'aux créneaux du jour : les rappels des jours
    // suivants restent planifiés (prier ce matin ne supprime pas demain matin).
    cancelPrayerReminders(type, true)
  }

  return {
    prayers,
    activePrayers,
    answeredTimeline,
    morningDone,
    eveningDone,
    load,
    add,
    markAnswered,
    remove,
    momentDoneToday,
    completeMoment
  }
})
