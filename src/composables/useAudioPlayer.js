import { Capacitor } from '@capacitor/core'
import { toastController } from '@ionic/vue'
import { CapacitorMusicControls } from 'capacitor-music-controls-plugin'
import { i18n } from '@/i18n'
import { useAudioStore } from '@/stores/audio'
import { useAudioDownloadsStore } from '@/stores/audioDownloads'
import { useBibleStore } from '@/stores/bible'
import { useStreakStore } from '@/stores/streak'
import { markChapterRead } from '@/lib/user-db'
import { getAudioUrl, getTimestamps, filesetForBook } from '@/lib/biblebrain'
import { getChapterCount, getBookName } from '@/lib/bible-db'

/**
 * Lecteur audio Bible (streaming) — SINGLETON au niveau module.
 *
 * Un unique élément <audio> sert toute l'app : la lecture survit à la
 * navigation (mini-barre montée globalement). Les contrôles natifs de l'écran
 * verrouillé (play/pause/seek) sont fournis par capacitor-music-controls-plugin
 * sur mobile ; sur web on s'appuie sur la Media Session API quand elle existe.
 *
 * Le composable ne stocke PAS d'état réactif lui-même : il pousse tout dans le
 * store `audio` (source unique). Les vues lisent le store.
 */

const VITESSES = [0.75, 1, 1.25, 1.5]
const SKIP = 15 // secondes pour les sauts avant/arrière

let audioEl = null
let controlsReady = false // music-controls créé pour la piste courante
let listenersBound = false
let rafId = null // ticker de position (requestAnimationFrame)

/**
 * Ticker haute fréquence : pousse la position de lecture à ~60 fps tant que
 * l'audio joue. Bien plus fluide que l'event 'timeupdate' (qui peut ne se
 * déclencher que toutes les ~250 ms → surbrillance qui saute / semble figée).
 */
function startTicker(store) {
  cancelTicker()
  const tick = () => {
    if (audioEl && !audioEl.paused) {
      store.setPosition(audioEl.currentTime || 0)
    }
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}
function cancelTicker() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function isNative() {
  return Capacitor.isNativePlatform()
}

/** Élément <audio> unique, créé à la demande. */
function getAudioEl(store) {
  if (audioEl) return audioEl
  audioEl = new Audio()
  audioEl.preload = 'auto'

  audioEl.addEventListener('loadedmetadata', () => {
    store.setDuration(audioEl.duration || 0)
    finalizeTimestamps(store)
  })
  audioEl.addEventListener('timeupdate', () => {
    store.setPosition(audioEl.currentTime || 0)
    updateElapsed(store)
  })
  audioEl.addEventListener('play', () => {
    store.setPlaying(true)
    syncControlsPlaying(true)
    startTicker(store)
  })
  audioEl.addEventListener('pause', () => {
    store.setPlaying(false)
    syncControlsPlaying(false)
    cancelTicker()
  })
  audioEl.addEventListener('waiting', () => store.setLoading(true))
  audioEl.addEventListener('playing', () => store.setLoading(false))
  audioEl.addEventListener('ended', () => {
    cancelTicker()
    onEnded(store)
  })
  return audioEl
}

/** Calcule le `end` de chaque timestamp (start du suivant ; dernier = durée). */
function finalizeTimestamps(store) {
  const ts = store.timestamps
  if (!ts.length) return
  const dur = store.duration || 0
  const filled = ts.map((t, i) => ({
    ...t,
    end: i < ts.length - 1 ? ts[i + 1].start : dur || t.start + 5
  }))
  store.setTimestamps(filled)
}

async function toast(message) {
  const tt = await toastController.create({
    message,
    duration: 2200,
    position: 'bottom',
    color: 'dark'
  })
  await tt.present()
}

function t(key) {
  return i18n.global.t(key)
}

/* ───────────────────────── music-controls (natif) ───────────────────────── */

/**
 * Plugin music-controls (import STATIQUE — l'import dynamique gelait sur natif
 * et bloquait toute la suite de playChapter). Renvoie le plugin sur natif, null
 * sur web. Branche les listeners d'events une seule fois.
 */
function ensureControlsPlugin() {
  if (!isNative()) return null
  bindControlListeners()
  return CapacitorMusicControls
}

function bindControlListeners() {
  if (listenersBound) return
  listenersBound = true
  // Les events natifs arrivent via 'controlsNotification' (info.message).
  CapacitorMusicControls.addListener('controlsNotification', (info) => handleControlEvent(info?.message))
  // Et aussi via un event DOM selon les versions du plugin.
  document.addEventListener('controlsNotification', (e) => handleControlEvent(e?.message))
}

function handleControlEvent(message) {
  if (!message) return
  switch (message) {
    case 'music-controls-play':
      resume()
      break
    case 'music-controls-pause':
      pause()
      break
    case 'music-controls-toggle-play-pause':
      togglePlay()
      break
    case 'music-controls-next':
      nextChapter()
      break
    case 'music-controls-previous':
      prevChapter()
      break
    case 'music-controls-skip-forward':
      seekBy(SKIP)
      break
    case 'music-controls-skip-backward':
      seekBy(-SKIP)
      break
    case 'music-controls-destroy':
      // ⚠️ Ce plugin émet 'destroy' même lors d'un simple pause (pas seulement à
      // la fermeture) → NE PAS appeler stop() ici (ça réinitialisait tout). On se
      // contente d'une pause de sécurité. L'arrêt complet passe par le bouton ✕
      // de l'app (player.stop()).
      pause()
      break
    default:
      break
  }
}

async function createControls(store) {
  const plugin = ensureControlsPlugin()
  if (!plugin) return
  try {
    await plugin.destroy().catch(() => {})
    // ⚠️ Le plugin appelle .isEmpty() sur cover/album/ticker/icônes SANS vérifier
    // null → fournir des chaînes VIDES partout (sinon NullPointerException → crash).
    // Chaîne vide = le plugin utilise ses icônes média Android par défaut.
    await plugin.create({
      track: `${store.currentBookName} ${store.currentChapter}`,
      artist: store.copyright || 'Abide',
      cover: '',
      album: '',
      ticker: '',
      isPlaying: true,
      // dismissable/hasClose = false : la notif ne doit PAS pouvoir être balayée
      // ni fermée depuis la barre système (ce plugin émet alors 'music-controls-destroy'
      // même lors d'un simple pause → cassait la lecture). Seul le bouton ✕ de
      // l'app arrête vraiment (via stop()).
      dismissable: false,
      hasPrev: true,
      hasNext: true,
      hasSkipForward: true,
      hasSkipBackward: true,
      skipForwardInterval: SKIP,
      skipBackwardInterval: SKIP,
      hasScrubbing: false,
      hasClose: false,
      duration: Math.floor(store.duration || 0),
      elapsed: 0,
      playIcon: '',
      pauseIcon: '',
      prevIcon: '',
      nextIcon: '',
      closeIcon: '',
      notificationIcon: ''
    })
    controlsReady = true
  } catch {
    /* le plugin peut échouer sur certains appareils — la lecture continue */
  }
}

function syncControlsPlaying(playing) {
  if (isNative() && controlsReady) {
    try {
      CapacitorMusicControls.updateIsPlaying({ isPlaying: playing })
    } catch { /* noop */ }
  }
  // Media Session (web / PWA)
  if (!isNative() && 'mediaSession' in navigator) {
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
  }
}

let lastElapsedPush = 0
function updateElapsed(store) {
  if (!isNative() || !controlsReady) return
  const now = Date.now()
  if (now - lastElapsedPush < 1000) return // throttle 1s
  lastElapsedPush = now
  try {
    CapacitorMusicControls.updateElapsed({ elapsed: Math.floor(store.position), isPlaying: store.isPlaying })
  } catch { /* noop */ }
}

function setupMediaSession(store) {
  if (isNative() || !('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = new window.MediaMetadata({
    title: `${store.currentBookName} ${store.currentChapter}`,
    artist: store.copyright || 'Abide',
    album: 'Abide'
  })
  const set = (action, handler) => {
    try { navigator.mediaSession.setActionHandler(action, handler) } catch { /* unsupported */ }
  }
  set('play', resume)
  set('pause', pause)
  set('nexttrack', nextChapter)
  set('previoustrack', prevChapter)
  set('seekforward', () => seekBy(SKIP))
  set('seekbackward', () => seekBy(-SKIP))
}

/* ───────────────────────────── actions ───────────────────────────── */

async function onEnded(store) {
  // Un chapitre écouté JUSQU'AU BOUT compte comme lu (online comme offline) :
  // on le marque automatiquement + on met à jour le streak, sans action manuelle.
  if (store.versionId && store.currentBook && store.currentChapter) {
    try {
      await markChapterRead(store.versionId, store.currentBook, store.currentChapter)
      await useStreakStore().registerReadToday()
    } catch { /* la progression ne doit jamais bloquer l'enchaînement audio */ }
  }
  // Enchaîne automatiquement le chapitre suivant s'il existe.
  nextChapter()
}

/**
 * Lance la lecture d'un chapitre. Recharge URL + timestamps à chaque fois
 * (URL signée expirante → jamais de cache en streaming).
 */
async function playChapter({ versionId, bookId, bookName, chapter }) {
  const store = useAudioStore()
  const fs = filesetForBook(versionId, bookId)
  if (!fs) {
    await toast(t('bible.audio.unavailable'))
    return false
  }

  const el = getAudioEl(store)
  store.setLoading(true)
  try {
    // 0) OFFLINE D'ABORD : si le livre est téléchargé, on lit les fichiers
    //    locaux (MP3 + timestamps) — aucun réseau nécessaire.
    const downloadsStore = useAudioDownloadsStore()
    await downloadsStore.load()
    const local = await downloadsStore.localChapterSource(versionId, bookId, chapter)

    // 1) Sinon, l'URL de streaming (signée, fraîche à chaque lecture).
    const url = local?.src ?? (await getAudioUrl(fs.filesetId, bookId, chapter))
    if (!url) {
      store.setLoading(false)
      await toast(t('bible.audio.unavailable'))
      return false
    }

    store.setTrack({
      url,
      version: versionId,
      book: bookId,
      bookName,
      chapter,
      copyright: fs.copyright
    })
    store.setTimestamps(local?.timestamps?.length ? local.timestamps : [])

    el.src = url
    el.playbackRate = store.playbackSpeed
    await el.play()

    // 2) Timestamps : locaux déjà posés ci-dessus ; sinon chargés EN ARRIÈRE-PLAN
    //    (avec réessais) — lancés AVANT les contrôles natifs pour qu'aucun souci
    //    de plugin ne les bloque.
    if (local?.timestamps?.length) {
      finalizeTimestamps(store)
    } else if (fs.hasTimestamps) {
      loadTimestampsInBackground(store, fs.filesetId, bookId, chapter, store.playingKey)
    }

    // 3) Contrôles écran verrouillé : fire-and-forget (jamais d'await ici, pour
    //    ne pas bloquer la lecture/les timestamps si le plugin pose souci).
    if (isNative()) createControls(store)
    else setupMediaSession(store)

    return true
  } catch {
    store.setLoading(false)
    await toast(t('bible.audio.error'))
    return false
  }
}

/**
 * Charge les timestamps en tâche de fond, avec réessais (connexion lente/instable).
 * Ne les applique que si la piste courante est toujours CE chapitre (évite
 * d'écraser les timestamps si l'utilisateur a déjà changé de chapitre).
 */
async function loadTimestampsInBackground(store, filesetId, bookId, chapter, expectedKey, attempt = 0) {
  const ts = await getTimestamps(filesetId, bookId, chapter)
  // L'utilisateur a-t-il changé de piste entre-temps ?
  if (store.playingKey !== expectedKey) return
  if (ts.length) {
    store.setTimestamps(ts)
    finalizeTimestamps(store)
    return
  }
  // Échec / vide → réessayer jusqu'à 3 fois (backoff léger).
  if (attempt < 3) {
    setTimeout(
      () => loadTimestampsInBackground(store, filesetId, bookId, chapter, expectedKey, attempt + 1),
      800 * (attempt + 1)
    )
  }
}

function togglePlay() {
  if (!audioEl) return
  if (audioEl.paused) resume()
  else pause()
}

function resume() {
  if (audioEl) audioEl.play().catch(() => {})
}

function pause() {
  if (audioEl) audioEl.pause()
}

function seekBy(delta) {
  if (!audioEl) return
  const store = useAudioStore()
  const target = Math.min(Math.max(0, (audioEl.currentTime || 0) + delta), store.duration || 0)
  audioEl.currentTime = target
  store.setPosition(target)
}

function seekTo(sec) {
  if (!audioEl) return
  const store = useAudioStore()
  const target = Math.min(Math.max(0, sec), store.duration || 0)
  audioEl.currentTime = target
  store.setPosition(target)
}

function cycleSpeed() {
  const store = useAudioStore()
  const idx = VITESSES.indexOf(store.playbackSpeed)
  const next = VITESSES[(idx + 1) % VITESSES.length]
  store.setSpeed(next)
  if (audioEl) audioEl.playbackRate = next
  return next
}

async function nextChapter() {
  const store = useAudioStore()
  if (!store.currentBook) return
  const count = await getChapterCount(store.versionId, store.currentBook)
  if (store.currentChapter >= count) {
    stop()
    return
  }
  const bookName = store.currentBookName || (await getBookName(store.versionId, store.currentBook))
  await playChapter({
    versionId: store.versionId,
    bookId: store.currentBook,
    bookName,
    chapter: store.currentChapter + 1
  })
}

async function prevChapter() {
  const store = useAudioStore()
  if (!store.currentBook) return
  if (store.currentChapter <= 1) {
    seekTo(0)
    return
  }
  const bookName = store.currentBookName || (await getBookName(store.versionId, store.currentBook))
  await playChapter({
    versionId: store.versionId,
    bookId: store.currentBook,
    bookName,
    chapter: store.currentChapter - 1
  })
}

function stop() {
  const store = useAudioStore()
  cancelTicker()
  if (audioEl) {
    audioEl.pause()
    audioEl.removeAttribute('src')
    audioEl.load()
  }
  if (isNative()) {
    CapacitorMusicControls.destroy().catch(() => {})
  }
  controlsReady = false
  store.reset()
}

/**
 * Hook composable : expose les actions. L'état se lit depuis le store `audio`.
 * (Toutes les fonctions sont au niveau module → un seul lecteur partagé.)
 */
export function useAudioPlayer() {
  return {
    playChapter,
    togglePlay,
    resume,
    pause,
    seekBy,
    seekTo,
    cycleSpeed,
    nextChapter,
    prevChapter,
    stop
  }
}
