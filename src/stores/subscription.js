import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Browser } from '@capacitor/browser'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import {
  isPurchasesAvailable, getMonthlyOffer, purchase, restore, getManagementUrl
} from '@/lib/purchases'

/**
 * Abonnement Abide Plus : offre, achat, restauration.
 *
 * RÈGLE (SECURITY.md §5) : un achat réussi côté Google Play ne rend PAS
 * premium à lui seul. On demande ensuite au serveur (Edge Function
 * premium-sync) de vérifier chez RevenueCat, puis on relit le profil Supabase.
 * Le premium affiché vient toujours de auth.isPremium (profil serveur).
 */
export const useSubscriptionStore = defineStore('subscription', () => {
  const auth = useAuthStore()

  const offer = ref(null)        // { pkg, priceString } ou null
  const loadingOffer = ref(false)
  const offerError = ref(false)  // offre introuvable (réseau, boutique pas prête…)
  const busy = ref(false)        // achat / restauration en cours

  async function loadOffer() {
    if (!isPurchasesAvailable() || !auth.user?.id) {
      offer.value = null
      return
    }
    loadingOffer.value = true
    offerError.value = false
    try {
      offer.value = await getMonthlyOffer(auth.user.id)
      if (!offer.value) offerError.value = true
    } catch (e) {
      console.warn('[subscription] offre indisponible', e)
      offer.value = null
      offerError.value = true
    } finally {
      loadingOffer.value = false
    }
  }

  /**
   * Fait vérifier l'abonnement par le serveur puis relit le profil.
   * Le webhook RevenueCat peut arriver quelques secondes après l'achat :
   * si premium-sync échoue, on relit le profil plusieurs fois.
   * @returns {Promise<boolean>} premium actif à l'issue
   */
  async function confirmWithServer() {
    try {
      await supabase.functions.invoke('premium-sync', { method: 'POST' })
    } catch (e) {
      console.warn('[subscription] premium-sync indisponible, attente du webhook', e)
    }
    for (let attempt = 0; attempt < 6; attempt++) {
      await auth.fetchProfile().catch(() => {})
      if (auth.isPremium) return true
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
    return auth.isPremium
  }

  /**
   * @returns {Promise<'active'|'pending'|'cancelled'>}
   *   active    : premium confirmé par le serveur
   *   pending   : paiement passé chez Google, confirmation serveur pas encore reçue
   *   cancelled : la personne a fermé la fenêtre de paiement
   * @throws Error si le paiement échoue
   */
  async function buy() {
    if (!offer.value?.pkg || busy.value) return 'cancelled'
    busy.value = true
    try {
      const result = await purchase(offer.value.pkg)
      if (result === 'cancelled') return 'cancelled'
      return (await confirmWithServer()) ? 'active' : 'pending'
    } finally {
      busy.value = false
    }
  }

  /** @returns {Promise<boolean>} premium actif après restauration */
  async function restorePurchases() {
    if (busy.value || !auth.user?.id) return false
    busy.value = true
    try {
      await restore(auth.user.id)
      return await confirmWithServer()
    } finally {
      busy.value = false
    }
  }

  /** Ouvre la gestion de l'abonnement (résiliation) dans Google Play. */
  async function manage() {
    const url = await getManagementUrl(auth.user?.id)
    await Browser.open({ url })
  }

  return {
    offer, loadingOffer, offerError, busy,
    loadOffer, buy, restorePurchases, manage
  }
})
