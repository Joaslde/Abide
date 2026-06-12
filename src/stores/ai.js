import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAIStore = defineStore('ai', () => {
  const messages = ref([])
  const mode = ref('enseignement') // enseignement | predication | meditation | theologie
  const sessionsUsed = ref(0)
  const sessionsLimit = ref(1)
  const loading = ref(false)

  const sessionsLeft = computed(() => Math.max(0, sessionsLimit.value - sessionsUsed.value))
  const hasSessionsLeft = computed(() => sessionsLeft.value > 0)

  function setMode(newMode) {
    mode.value = newMode
  }

  function addMessage(role, content) {
    messages.value.push({ role, content, timestamp: Date.now() })
  }

  function clearHistory() {
    messages.value = []
  }

  function setSessions({ used, limit }) {
    sessionsUsed.value = used
    sessionsLimit.value = limit
  }

  return {
    messages,
    mode,
    sessionsUsed,
    sessionsLimit,
    loading,
    sessionsLeft,
    hasSessionsLeft,
    setMode,
    addMessage,
    clearHistory,
    setSessions
  }
})
