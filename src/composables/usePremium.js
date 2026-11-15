import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Statut premium + redirection vers l'écran Abide Plus.
 * isPremium est un computed (réactif) : l'ancienne version renvoyait une valeur
 * figée au moment de l'appel, qui ne suivait pas un achat ou une expiration.
 */
export function usePremium() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isPremium = computed(() => authStore.isPremium)

  function requirePremium() {
    if (!authStore.isPremium) {
      router.push('/premium')
      return false
    }
    return true
  }

  return { isPremium, requirePremium }
}
