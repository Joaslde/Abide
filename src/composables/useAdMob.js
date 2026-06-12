import { useAdsStore } from '@/stores/ads'
import { showBanner, hideBanner } from '@/lib/admob'

export function useAdMob() {
  const store = useAdsStore()

  function enterContext(context) {
    store.setContext(context)
    if (!store.bannerVisible) {
      hideBanner()
    } else {
      const adUnitId = import.meta.env.DEV
        ? 'ca-app-pub-3940256099942544/6300978111' // ID de test Google
        : import.meta.env.VITE_ADMOB_APP_ID_ANDROID
      showBanner(adUnitId)
    }
  }

  function exitContext() {
    store.setContext('navigation')
  }

  return { store, enterContext, exitContext }
}
