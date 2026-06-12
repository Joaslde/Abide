/**
 * AdMob — Bannières uniquement sur les pages de navigation.
 * RÈGLE : Ne jamais appeler si isPremium === true.
 * RÈGLE : Masquer pendant Bible, audio, prière, session IA.
 */

// Import dynamique pour éviter l'erreur en dev web (plugin natif)
let AdMob = null

export async function initAdMob() {
  const { Capacitor } = await import('@capacitor/core')
  if (Capacitor.getPlatform() === 'web') return

  const module = await import('capacitor-admob')
  AdMob = module.AdMob

  const appId = Capacitor.getPlatform() === 'ios'
    ? import.meta.env.VITE_ADMOB_APP_ID_IOS
    : import.meta.env.VITE_ADMOB_APP_ID_ANDROID

  await AdMob.initialize({ testingDevices: [] })
}

export async function showBanner(adUnitId) {
  if (!AdMob) return
  await AdMob.showBanner({
    adId: adUnitId,
    adSize: 'BANNER',
    position: 'BOTTOM_CENTER',
    margin: 0
  })
}

export async function hideBanner() {
  if (!AdMob) return
  await AdMob.hideBanner()
}
