/**
 * AppsFlyer — attribution d'installations pour le programme de PARRAINAGE.
 *
 * Rôle unique de ce module : au premier lancement de l'app après une install
 * venue d'un lien de parrainage (OneLink), récupérer le code du parrain transmis
 * en paramètre custom du lien, et le stocker LOCALEMENT (Preferences) le temps
 * que l'utilisateur crée son compte. C'est le CLIENT qui déclenche ensuite
 * l'attribution côté serveur (Edge Function `referral-attribute`) — ce module ne
 * décide jamais rien côté premium (SECURITY.md : le client ne décide jamais de
 * rien d'important).
 *
 * No-op sur web (le SDK est natif uniquement, comme AdMob — cf. lib/admob.js).
 */

import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { AppsFlyer } from 'appsflyer-capacitor-plugin'

const isNative = Capacitor.isNativePlatform()
const DEV_KEY = import.meta.env.VITE_APPSFLYER_DEV_KEY || ''

// Clé Preferences : code de parrainage reçu à l'installation, en attente qu'un
// compte soit créé pour être envoyé à l'Edge Function referral-attribute.
export const PENDING_REFERRAL_KEY = 'pending_referral_code'

let initialized = false

/**
 * Initialise le SDK AppsFlyer (une seule fois, no-op sur web ou sans Dev Key).
 * À appeler au démarrage de l'app (App.vue), comme initAdMob().
 */
export async function initAppsFlyer() {
  if (!isNative || initialized || !DEV_KEY) return
  initialized = true

  // Écoute la résolution d'attribution : si les données custom du lien contiennent
  // un code de parrainage, on le garde en local pour l'inscription à venir.
  AppsFlyer.addListener('onConversionDataSuccess', (event) => {
    const referralCode = event?.data?.af_referral_code ?? event?.data?.referralCode
    if (referralCode) storePendingReferralCode(String(referralCode))
  })

  try {
    await AppsFlyer.initSDK({
      devKey: DEV_KEY,
      appID: 'com.abide.app',
      isDebug: false,
      registerConversionListener: true,
      // Délai d'attente du consentement ATT (iOS) avant de démarrer, en secondes.
      waitForATTUserAuthorization: 10
    })
  } catch {
    /* échec SDK non bloquant : l'app fonctionne normalement sans attribution */
  }
}

/**
 * Enregistre un code de parrainage en attente d'attribution. Exportée pour
 * la saisie MANUELLE à l'onboarding (contournement temporaire tant que le
 * lien OneLink n'est pas fonctionnel — app pas encore publiée) : même
 * mécanisme que l'attribution automatique via AppsFlyer, donc même garanties
 * (idempotent, tenté une seule fois, jamais bloquant — cf. auth.js).
 */
export async function storePendingReferralCode(code) {
  try {
    await Preferences.set({ key: PENDING_REFERRAL_KEY, value: code })
  } catch { /* noop */ }
}

/** Code de parrainage en attente d'attribution (posé à l'installation), ou null. */
export async function getPendingReferralCode() {
  try {
    const { value } = await Preferences.get({ key: PENDING_REFERRAL_KEY })
    return value || null
  } catch {
    return null
  }
}

/** Efface le code en attente (attribution tentée, succès ou échec — une seule fois). */
export async function clearPendingReferralCode() {
  try {
    await Preferences.remove({ key: PENDING_REFERRAL_KEY })
  } catch { /* noop */ }
}
