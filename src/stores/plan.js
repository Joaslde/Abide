import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getActivePlan, savePlan, setPlanDay, deactivatePlans,
  markChapterRead, readChaptersFor
} from '@/lib/user-db'
import { buildSchedule, PLAN_DURATIONS, recipeForProfile } from '@/data/planGenerator'
import { getPreset, presetToPlan } from '@/data/presetPlans'
import { useAuthStore } from '@/stores/auth'
import { pushUserData } from '@/lib/sync'

/**
 * Plan de lecture actif + progression des chapitres lus.
 * Local-first (user-db) : marche en invité et hors ligne. Sync Supabase séparée.
 */
export const usePlanStore = defineStore('plan', () => {
  const activePlan = ref(null) // { id, plan_type, total_days, current_day, scope, schedule[] }

  const currentDay = computed(() => activePlan.value?.current_day ?? 1)
  const totalDays = computed(() => activePlan.value?.total_days ?? 0)

  /** Chapitres prévus aujourd'hui : [{book_id, chapter}]. */
  const todayItems = computed(() => {
    if (!activePlan.value?.schedule) return []
    const entry = activePlan.value.schedule[currentDay.value - 1]
    return entry?.items ?? []
  })

  const progress = computed(() => {
    if (!activePlan.value) return 0
    return Math.round((currentDay.value / activePlan.value.total_days) * 100)
  })

  const isCompleted = computed(
    () => !!activePlan.value && !!activePlan.value.completed_at
  )

  /** Charge le plan actif depuis la base locale. */
  async function loadActivePlan() {
    activePlan.value = await getActivePlan()
  }

  /**
   * Crée un plan (désactive l'ancien) selon un descripteur unifié :
   *  - { source:'custom', planType|days, scope, bookId? }
   *  - { source:'profile' }                → recette selon le profil onboarding
   *  - { source:'template', templateId }   → plan préétabli bundlé
   */
  async function createPlan(descriptor) {
    const built = buildPlanFromDescriptor(descriptor)
    const plan = {
      id: Date.now().toString(36),
      current_day: 1,
      started_at: new Date().toISOString(),
      completed_at: null,
      is_active: 1,
      ...built
    }
    await deactivatePlans()
    await savePlan(plan)
    activePlan.value = plan
    pushUserData() // sync best-effort (si connecté + en ligne)
  }

  /** Construit les champs du plan (schedule, total_days, title…) selon la source. */
  function buildPlanFromDescriptor(d) {
    if (d.source === 'template') {
      const preset = getPreset(d.templateId)
      return presetToPlan(preset)
    }
    if (d.source === 'profile') {
      const auth = useAuthStore()
      const r = recipeForProfile(auth.profile?.user_profile)
      return {
        source: 'profile',
        title: r.title,
        plan_type: 'custom',
        scope: r.scope,
        total_days: r.days,
        schedule: buildSchedule({ totalDays: r.days, scope: r.scope, bookId: r.bookId })
      }
    }
    // custom : planType prédéfini OU nombre de jours libre.
    const total = d.days ?? PLAN_DURATIONS[d.planType] ?? 30
    return {
      source: 'custom',
      title: null, // libellé dérivé de la portée à l'affichage
      plan_type: d.planType ?? 'custom',
      scope: d.scope,
      total_days: total,
      schedule: buildSchedule({ totalDays: total, scope: d.scope, bookId: d.bookId })
    }
  }

  /** Marque le jour courant comme complété → avance (ou termine le plan). */
  async function completeToday() {
    if (!activePlan.value) return
    const p = activePlan.value
    if (p.current_day >= p.total_days) {
      const completedAt = new Date().toISOString()
      await setPlanDay(p.id, p.total_days, completedAt)
      activePlan.value = { ...p, completed_at: completedAt }
      return
    }
    const nextDay = p.current_day + 1
    await setPlanDay(p.id, nextDay)
    activePlan.value = { ...p, current_day: nextDay }
  }

  /* ── Progression des chapitres lus (indépendante du plan) ── */

  async function markRead(versionId, bookId, chapter) {
    await markChapterRead(versionId, bookId, chapter)
  }

  async function readChapters(versionId, bookId) {
    return readChaptersFor(versionId, bookId)
  }

  return {
    activePlan,
    currentDay,
    totalDays,
    todayItems,
    progress,
    isCompleted,
    loadActivePlan,
    createPlan,
    completeToday,
    markRead,
    readChapters
  }
})
