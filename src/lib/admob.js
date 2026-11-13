/**
 * AdMob, publicités INTERSTITIELLES uniquement (modèle YouVersion).
 *
 * Pas de bannières. Une pub plein écran (parfois vidéo, passable après ~5s)
 * apparaît sur certains déclencheurs, jamais pendant un moment protégé.
 * Déclencheurs (voir CLAUDE.md §AdMob) :
 *   - navigation entre pages (throttlée : 1 / 4 min max) → maybeShowNavInterstitial()
 *   - ouverture du Guide IA (throttlée aussi) → showAiInterstitial()
 *   - lancer/relancer un quiz → showQuizInterstitial()
 *   - « méditer sur un verset » → showAiInterstitial()
 *
 * RÈGLES : jamais si isPremium ; une pub qui échoue ne bloque JAMAIS l'accès.
 * La vérification !isPremium est faite par le STORE (ads.js) qui appelle ces
 * fonctions, ce module reste bas niveau (il ignore l'état premium).
 *
 * IDs de test Google (officiels, safe à committer) tant que VITE_ADMOB_* absents.
 * @see https://developers.google.com/admob/android/test-ads
 */

import { Capacitor } from '@capacitor/core'
import { AdMob } from '@capacitor-community/admob'

const isNative = Capacitor.isNativePlatform()

const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712'

const INTERSTITIAL_ID = import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || TEST_INTERSTITIAL_ID
// Aucun VITE_ADMOB_* défini → IDs de test → forcer isTesting.
const IS_TESTING = !import.meta.env.VITE_ADMOB_INTERSTITIAL_ID

let initialized = false

/** Initialise le SDK AdMob (une seule fois, no-op sur web). */
export async function initAdMob() {
  if (!isNative || initialized) return
  await AdMob.initialize({ initializeForTesting: IS_TESTING }).catch(() => {})
  initialized = true
}

/**
 * Prépare puis montre un interstitiel. Résout après fermeture de la pub (ou
 * immédiatement si indisponible). Ne lève JAMAIS : l'accès à la fonctionnalité
 * appelante ne doit jamais dépendre d'une pub.
 * @param {() => boolean} canShow  revérifié juste avant l'affichage
 * @returns {Promise<boolean>} true si la pub a réellement été affichée
 */
export async function showInterstitial(canShow = () => true) {
  if (!isNative) return false
  await initAdMob()
  try {
    await AdMob.prepareInterstitial({ adId: INTERSTITIAL_ID, isTesting: IS_TESTING })
    // Le chargement prend une à trois secondes : l'utilisateur a pu ouvrir un
    // chapitre ou l'onboarding entre-temps. On revérifie AU MOMENT d'afficher.
    if (!canShow()) return false
    await AdMob.showInterstitial()
    return true
  } catch {
    /* pub indisponible (réseau, inventaire) → silencieux, on n'empêche rien */
    return false
  }
}
