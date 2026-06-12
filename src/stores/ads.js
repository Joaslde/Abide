import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

// Contextes où les pubs sont INTERDITES
const AD_BLOCKED_CONTEXTS = ['bible_reading', 'audio_playing', 'prayer', 'ai_chat']

export const useAdsStore = defineStore('ads', () => {
  const currentContext = ref('navigation')
  const bannerVisible = ref(false)

  function setContext(context) {
    currentContext.value = context
    const authStore = useAuthStore()
    if (authStore.isPremium || AD_BLOCKED_CONTEXTS.includes(context)) {
      bannerVisible.value = false
    } else {
      bannerVisible.value = true
    }
  }

  function hideBanner() {
    bannerVisible.value = false
  }

  return {
    currentContext,
    bannerVisible,
    setContext,
    hideBanner
  }
})
