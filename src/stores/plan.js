import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlanStore = defineStore('plan', () => {
  const activePlan = ref(null)
  const currentDay = ref(1)

  const todayPassage = computed(() => {
    if (!activePlan.value?.schedule) return null
    return activePlan.value.schedule[currentDay.value - 1] ?? null
  })

  const progress = computed(() => {
    if (!activePlan.value) return 0
    return Math.round((currentDay.value / activePlan.value.total_days) * 100)
  })

  function setPlan(plan) {
    activePlan.value = plan
    currentDay.value = plan.current_day ?? 1
  }

  function advanceDay() {
    if (activePlan.value && currentDay.value < activePlan.value.total_days) {
      currentDay.value++
    }
  }

  return {
    activePlan,
    currentDay,
    todayPassage,
    progress,
    setPlan,
    advanceDay
  }
})
