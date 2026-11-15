/**
 * RevenueCat (Google Play Billing) : couche BAS NIVEAU.
 *
 * Ce module ne décide JAMAIS du premium (SECURITY.md §5). Il sert à :
 *   - afficher l'offre et son prix RÉEL lu chez Google Play (devise locale :
 *     1 500 FCFA en Afrique, 5 $ ailleurs, fixés dans Play Console) ;
 *   - lancer l'achat ou la restauration (fenêtre native Google Play).
 * Le statut premium vient uniquement de Supabase, écrit par les Edge Functions
 * payment-webhook / premium-sync après vérification chez RevenueCat.
 *
 * L'identifiant RevenueCat d'un utilisateur = son id Supabase : c'est ce qui
 * permet au webhook de savoir quel profil créditer. Pas d'achat en invité.
 *
 * Sans clé VITE_REVENUECAT_ANDROID_KEY (projet RevenueCat pas encore créé) ou
 * hors natif : tout est désactivé proprement, isPurchasesAvailable() = false.
 */
import { Capacitor } from '@capacitor/core'
import { Purchases, LOG_LEVEL, PURCHASES_ERROR_CODE } from '@revenuecat/purchases-capacitor'

const API_KEY = import.meta.env.VITE_REVENUECAT_ANDROID_KEY || ''

/** Identifiant de l'entitlement configuré dans RevenueCat (aligné sur _shared/premium-sync.ts). */
export const ENTITLEMENT_ID = 'premium'

let configuredFor = null // id utilisateur avec lequel le SDK est configuré
let configurePromise = null

export function isPurchasesAvailable() {
  return Capacitor.getPlatform() === 'android' && !!API_KEY
}

/**
 * Aligne l'utilisateur RevenueCat sur l'utilisateur Supabase connecté.
 * Appelée au démarrage et à chaque connexion / déconnexion (App.vue).
 * @param {string|null} userId id Supabase, ou null si personne n'est connecté
 */
export async function syncPurchasesUser(userId) {
  if (!isPurchasesAvailable()) return
  try {
    if (!configurePromise) {
      // On ne configure qu'une fois connecté : un identifiant anonymous
      // RevenueCat ne servirait à rien (pas d'achat en invité).
      if (!userId) return
      configurePromise = (async () => {
        await Purchases.setLogLevel({ level: import.meta.env.DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN })
        await Purchases.configure({ apiKey: API_KEY, appUserID: userId })
        configuredFor = userId
      })()
      await configurePromise
      return
    }
    await configurePromise
    if (userId && userId !== configuredFor) {
      await Purchases.logIn({ appUserID: userId })
      configuredFor = userId
    } else if (!userId && configuredFor) {
      await Purchases.logOut()
      configuredFor = null
    }
  } catch (e) {
    // Non bloquant : l'app fonctionne sans la boutique (l'écran Abide Plus
    // affichera simplement l'offre indisponible).
    console.warn('[purchases] synchronisation utilisateur impossible', e)
    if (!configuredFor) configurePromise = null
  }
}

/** Le SDK est-il prêt pour l'utilisateur donné ? */
async function ensureReadyFor(userId) {
  if (!isPurchasesAvailable() || !userId) return false
  await syncPurchasesUser(userId)
  return configuredFor === userId
}

/**
 * Offre mensuelle « Abide Plus » (package de l'offering courant).
 * @returns {Promise<{pkg: object, priceString: string}|null>} null si indisponible
 */
export async function getMonthlyOffer(userId) {
  if (!(await ensureReadyFor(userId))) return null
  const offerings = await Purchases.getOfferings()
  const current = offerings?.current
  const pkg = current?.monthly ?? current?.availablePackages?.[0] ?? null
  if (!pkg) return null
  return { pkg, priceString: pkg.product?.priceString ?? '' }
}

/**
 * Lance l'achat (fenêtre Google Play).
 * @returns {Promise<'purchased'|'cancelled'>}
 * @throws Error pour tout autre échec (paiement refusé, réseau…)
 */
export async function purchase(pkg) {
  try {
    await Purchases.purchasePackage({ aPackage: pkg })
    return 'purchased'
  } catch (e) {
    if (e?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || e?.userCancelled) return 'cancelled'
    throw e
  }
}

/** « Restaurer mes achats » (changement de téléphone, réinstallation). */
export async function restore(userId) {
  if (!(await ensureReadyFor(userId))) throw new Error('purchases_unavailable')
  await Purchases.restorePurchases()
}

/**
 * Lien de gestion de l'abonnement (résiliation) dans Google Play.
 * RevenueCat le fournit quand un abonnement existe ; sinon, page générale.
 */
export async function getManagementUrl(userId) {
  const fallback = 'https://play.google.com/store/account/subscriptions'
  try {
    if (!(await ensureReadyFor(userId))) return fallback
    const { customerInfo } = await Purchases.getCustomerInfo()
    return customerInfo?.managementURL || fallback
  } catch {
    return fallback
  }
}
