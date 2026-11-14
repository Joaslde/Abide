import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { showInterstitial } from '@/lib/admob'
import { isAdProtectedPath, currentPath } from '@/lib/ad-rules'
import { isOnlineCached } from '@/lib/network'

/**
 * Pilotage des publicités (modèle YouVersion : interstitiels uniquement).
 *
 * Ce store est le SEUL point d'entrée des vues : il applique les règles métier
 * (jamais si premium, throttling) et délègue l'affichage bas niveau à admob.js.
 * Les vues n'appellent jamais admob.js directement.
 *
 * Voir CLAUDE.md §AdMob pour la politique complète.
 */

// Intervalle minimum entre deux interstitiels « soft » (navigation, ouverture IA).
// Les pubs « fortes » (quiz, méditer-sur-verset) ne sont PAS throttlées : elles
// sont attendues à chaque action explicite de l'utilisateur.
const SOFT_COOLDOWN_MS = 4 * 60 * 1000 // 4 minutes
// Après un chargement de pub ÉCHOUÉ (réseau faible, pas d'inventaire), on
// attend avant de réessayer : sans ça, chaque navigation relançait un
// chargement voué à l'échec (le cooldown ne démarre que sur une pub VUE).
const FAILURE_BACKOFF_MS = 60 * 1000

export const useAdsStore = defineStore('ads', () => {
  // Horodatage du dernier interstitiel affiché (throttling des pubs « soft »).
  const lastShownAt = ref(0)
  // Empêche deux pubs simultanées (une action rapide pourrait en déclencher 2).
  const showing = ref(false)
  // Horodatage du dernier échec de chargement (voir FAILURE_BACKOFF_MS).
  let lastFailureAt = 0

  /**
   * Les pubs sont-elles autorisées maintenant ? Jamais pour un premium, et
   * jamais tant que l'onboarding n'est pas terminé (décision du 2026-11-12 :
   * une pub dès les premières minutes fait fuir).
   */
  function adsAllowed() {
    const auth = useAuthStore()
    return !auth.isPremium && !auth.shouldOnboard
  }

  /**
   * Affiche un interstitiel maintenant si permis, en respectant l'anti-doublon.
   * @param {boolean} checkScreen  pub de navigation : revérifier au moment
   *   d'afficher que l'écran courant n'est pas protégé (lecture, prière,
   *   onboarding…). Les autres pubs (Guide IA, quiz, méditer) suivent une action
   *   explicite et s'affichent sur un écran lui-même « protégé » de la pub de
   *   navigation : on n'y contrôle que le premium et l'onboarding.
   * @param {boolean} soft  pub throttlée (navigation, ouverture du Guide) : soumise à la pause après échec
   */
  async function present(checkScreen = false, soft = false) {
    if (!adsAllowed() || showing.value) return
    // Hors ligne : aucune pub ne peut se charger, inutile de solliciter AdMob.
    if (!isOnlineCached()) return
    // Pause après échec : seulement pour les pubs « soft » (les pubs du quiz
    // et de « méditer » restent tentées à chaque action, comme prévu).
    if (soft && Date.now() - lastFailureAt < FAILURE_BACKOFF_MS) return
    showing.value = true
    try {
      const shown = await showInterstitial(
        () => adsAllowed() && !(checkScreen && isAdProtectedPath(currentPath()))
      )
      // Le cooldown ne démarre que si une pub a vraiment été vue.
      if (shown) lastShownAt.value = Date.now()
      else lastFailureAt = Date.now()
    } finally {
      showing.value = false
    }
  }

  /**
   * Pub « soft » throttlée (navigation entre pages, ouverture du Guide IA).
   * Ne s'affiche que si le cooldown est écoulé → « de temps en temps ».
   */
  async function presentSoft(checkScreen) {
    if (!adsAllowed()) return
    if (Date.now() - lastShownAt.value < SOFT_COOLDOWN_MS) return
    await present(checkScreen, true)
  }

  /* ── Points d'entrée sémantiques appelés par les vues ── */

  /** Transition de navigation : pub throttlée (1 / 4 min max). */
  function onNavigation() {
    presentSoft(true)
  }

  /** Ouverture du Guide IA : pub à chaque ouverture, mais soumise au cooldown. */
  function onOpenAiGuide() {
    presentSoft(false)
  }

  /** Lancer/relancer un quiz : pub à chaque fois (pas de throttle). Awaitable. */
  function onStartQuiz() {
    return present()
  }

  /** « Méditer sur un verset » → ouverture du guide dessus : pub à chaque fois. */
  function onMeditateVerse() {
    return present()
  }

  return {
    onNavigation,
    onOpenAiGuide,
    onStartQuiz,
    onMeditateVerse
  }
})
