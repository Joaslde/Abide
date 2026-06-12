import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStreakStore = defineStore('streak', () => {
  const currentStreak = ref(0)
  const longestStreak = ref(0)
  const lastActive = ref(null)

  function setStreak(data) {
    currentStreak.value = data.current_streak ?? 0
    longestStreak.value = data.longest_streak ?? 0
    lastActive.value = data.last_active ?? null
  }

  return {
    currentStreak,
    longestStreak,
    lastActive,
    setStreak
  }
})
