import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { useAudioStore } from './audio'
import musicUrl from '@/assets/audio/background-calm.mp3'

/**
 * Musique de fond « récessive » de la lecture audio.
 *
 * Relation ESCLAVE de l'audio Bible (store audio) — jamais l'inverse :
 *   - audio Bible play  → la musique play (volume bas, en boucle)
 *   - audio Bible pause → la musique pause
 *   - audio Bible stop  (currentUrl = null) → la musique s'arrête
 *   - bouton on/off dédié : coupe la musique SEULE (l'audio Bible continue)
 * Pas de contrôle écran verrouillé : ce n'est qu'un fond, pas un player à part.
 * Un simple <audio loop> HTML5 à faible volume — aucun plugin natif requis.
 */
const KEY = 'abide.bgmusic.enabled'
const VOLUME = 0.24 // volume bas : accompagne sans couvrir la voix

export const useBackgroundMusicStore = defineStore('backgroundMusic', () => {
  const audio = useAudioStore()

  // Préférence utilisateur : la musique de fond est-elle activée ? (persistée)
  const enabled = ref(false)
  let el = null // élément <audio> (créé à la 1re activation, réutilisé ensuite)

  async function init() {
    try {
      const { value } = await Preferences.get({ key: KEY })
      enabled.value = value === 'true'
    } catch { /* défaut = désactivée */ }
  }

  function ensureElement() {
    if (el) return el
    el = new Audio(musicUrl)
    el.loop = true
    el.volume = VOLUME
    return el
  }

  /** Aligne la lecture de la musique sur l'état voulu (enabled ET audio en cours). */
  function sync() {
    const shouldPlay = enabled.value && audio.isPlaying && !!audio.currentUrl
    if (shouldPlay) {
      ensureElement().play().catch(() => { /* autoplay bloqué / pas d'interaction */ })
    } else if (el) {
      el.pause()
    }
  }

  /** Bascule on/off (bouton dédié). Persiste le choix. */
  async function toggle() {
    enabled.value = !enabled.value
    try { await Preferences.set({ key: KEY, value: String(enabled.value) }) } catch { /* noop */ }
    sync()
  }

  // La musique suit l'audio Bible : on réagit à ses play/pause et à l'arrêt.
  watch(() => audio.isPlaying, sync)
  watch(() => audio.currentUrl, (url) => {
    if (!url && el) { el.pause(); el.currentTime = 0 } // stop complet → rembobine
    else sync()
  })

  return { enabled, init, toggle }
})
