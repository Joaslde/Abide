import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function usePremium() {
  const authStore = useAuthStore()
  const router = useRouter()

  function requirePremium() {
    if (!authStore.isPremium) {
      router.push('/premium')
      return false
    }
    return true
  }

  return { isPremium: authStore.isPremium, requirePremium }
}
