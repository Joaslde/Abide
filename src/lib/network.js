/**
 * État réseau — source de vérité unique pour tout le projet.
 *
 * Utilise @capacitor/network (fiable sur natif iOS/Android, fallback
 * navigator.onLine sur web). Réutilisable partout : décision offline-first
 * au démarrage (router guard), file de synchronisation, téléchargement audio…
 *
 * `isOnline()` est asynchrone car Network.getStatus() l'est. On garde aussi
 * un cache `lastKnownOnline` mis à jour par un listener, pour les lectures
 * synchrones rapides (ex : afficher/masquer une bannière).
 */

import { Network } from '@capacitor/network'

let lastKnownOnline = true
let started = false

/**
 * Retourne l'état réseau courant (vrai si connecté).
 * @returns {Promise<boolean>}
 */
export async function isOnline() {
  try {
    const status = await Network.getStatus()
    lastKnownOnline = status.connected
    return status.connected
  } catch {
    // En cas d'échec du plugin, on retombe sur l'API web (web/dev).
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true
    lastKnownOnline = online
    return online
  }
}

/** Lecture synchrone du dernier état connu (sans await). */
export function isOnlineCached() {
  return lastKnownOnline
}

/**
 * Démarre l'écoute des changements de connexion. Idempotent.
 * @param {(connected: boolean) => void} [onChange] callback optionnel
 */
export function watchNetwork(onChange) {
  if (started) return
  started = true
  Network.addListener('networkStatusChange', (status) => {
    lastKnownOnline = status.connected
    onChange?.(status.connected)
  })
  // Initialise le cache au démarrage.
  isOnline()
}
