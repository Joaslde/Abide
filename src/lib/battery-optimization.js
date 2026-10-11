/**
 * Exemption d'optimisation batterie (Android).
 *
 * POURQUOI C'EST CRITIQUE : les ROM constructeur agressives (Infinix/XOS,
 * Xiaomi/MIUI, Huawei, Oppo, Vivo…) tuent le processus de l'app à sa fermeture
 * ET SUPPRIMENT ses alarmes programmées. Résultat : les rappels de prière, de
 * lecture et de jeûne n'arrivent JAMAIS tant que l'app n'est pas ouverte —
 * exactement l'inverse de leur raison d'être (diagnostic 2026-07-30 : 201
 * alarmes bien planifiées, aucune notification reçue).
 *
 * Seul l'UTILISATEUR peut accorder l'exemption, via une boîte de dialogue
 * système. On ne peut pas se l'octroyer soi-même (et Google l'interdit).
 */
import { Capacitor, registerPlugin } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const BatteryOptimization = registerPlugin('BatteryOptimization')

/** On ne redemande pas indéfiniment si la personne a refusé. */
const ASKED_KEY = 'abide.battery.optimizationAsked'

const isAndroid = Capacitor.getPlatform() === 'android'

/** L'app est-elle exemptée ? `true` hors Android (rien à faire). */
export async function isIgnoringBatteryOptimizations() {
  if (!isAndroid) return true
  try {
    const { value } = await BatteryOptimization.isIgnoringBatteryOptimizations()
    return !!value
  } catch (e) {
    console.warn('[battery] lecture du statut impossible', e)
    return true // en cas de doute, ne pas harceler l'utilisateur
  }
}

/** Ouvre la boîte de dialogue système d'exemption. */
export async function requestIgnoreBatteryOptimizations() {
  if (!isAndroid) return
  try {
    await BatteryOptimization.requestIgnoreBatteryOptimizations()
    await Preferences.set({ key: ASKED_KEY, value: '1' })
  } catch (e) {
    console.warn('[battery] demande d’exemption impossible', e)
  }
}

/**
 * Faut-il proposer l'exemption ? Vrai seulement si : on est sur Android, l'app
 * n'est pas déjà exemptée, ET on ne l'a jamais demandé.
 * Volontairement demandé UNE SEULE FOIS : un refus doit être respecté.
 */
export async function shouldAskBatteryExemption() {
  if (!isAndroid) return false
  if (await isIgnoringBatteryOptimizations()) return false
  try {
    const { value } = await Preferences.get({ key: ASKED_KEY })
    return value !== '1'
  } catch {
    return false
  }
}

/** Permet de reproposer l'exemption depuis les Réglages (contourne le « déjà demandé »). */
export async function resetBatteryAskFlag() {
  try {
    await Preferences.remove({ key: ASKED_KEY })
  } catch { /* sans conséquence */ }
}
