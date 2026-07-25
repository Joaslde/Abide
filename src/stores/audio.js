import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

/**
 * Store de l'état de lecture audio (streaming Bible).
 *
 * Source unique de vérité pour : piste courante, position, vitesse, timestamps
 * de synchronisation et verset actif. Le composable `useAudioPlayer` pilote
 * l'élément <audio> réel et pousse l'état ici ; les vues (lecteur, mini-barre,
 * surbrillance des versets) ne font que LIRE ce store.
 */
export const useAudioStore = defineStore('audio', () => {
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentUrl = ref(null)

  // UI du panneau lecteur : étendu (panneau complet) ou replié (mini-barre).
  const expanded = ref(false)
  // Ouverture du modal « Mes téléchargements ».
  const showDownloads = ref(false)

  // Exclusion mutuelle : jamais le panneau lecteur ET le store ouverts en même
  // temps. Ouvrir l'un ferme automatiquement l'autre (peu importe la source).
  watch(expanded, (v) => { if (v) showDownloads.value = false })
  watch(showDownloads, (v) => { if (v) expanded.value = false })

  // Contexte de la piste (pour titre, retour au chapitre, enchaînement).
  const versionId = ref(null)
  const currentBook = ref(null)
  const currentBookName = ref('')
  const currentChapter = ref(null)

  const playbackSpeed = ref(1.0)
  const duration = ref(0)
  const position = ref(0)

  // Synchronisation texte/audio.
  const timestamps = ref([]) // [{ verse, start, end }]
  const copyright = ref('')

  const progress = computed(() => {
    if (!duration.value) return 0
    return (position.value / duration.value) * 100
  })

  /**
   * Verset actuellement lu, dérivé de la position et des timestamps.
   * = le dernier verset dont `start <= position`. null si pas de timestamps.
   */
  const activeVerse = computed(() => {
    const ts = timestamps.value
    if (!ts.length) return null
    // Par défaut le 1er verset (couvre une éventuelle intro avant son timestamp).
    let current = ts[0].verse
    for (const t of ts) {
      if (position.value + 0.15 >= t.start) current = t.verse
      else break
    }
    return current
  })

  /** Clé d'identité de la piste en lecture (pour savoir si un chapitre affiché = celui qui joue). */
  const playingKey = computed(() => {
    if (!currentUrl.value) return null
    return `${versionId.value}:${currentBook.value}:${currentChapter.value}`
  })

  function setTrack({ url, version, book, bookName, chapter, copyright: cr }) {
    currentUrl.value = url
    versionId.value = version
    currentBook.value = book
    currentBookName.value = bookName ?? ''
    currentChapter.value = chapter
    copyright.value = cr ?? ''
    position.value = 0
    duration.value = 0
  }

  function setTimestamps(list) {
    timestamps.value = Array.isArray(list) ? list : []
  }

  function setPlaying(val) {
    isPlaying.value = val
  }

  function setLoading(val) {
    isLoading.value = val
  }

  function setPosition(sec) {
    position.value = sec
  }

  function setDuration(sec) {
    duration.value = sec
  }

  function setSpeed(val) {
    playbackSpeed.value = val
  }

  function reset() {
    isPlaying.value = false
    isLoading.value = false
    currentUrl.value = null
    expanded.value = false
    versionId.value = null
    currentBook.value = null
    currentBookName.value = ''
    currentChapter.value = null
    position.value = 0
    duration.value = 0
    timestamps.value = []
    copyright.value = ''
  }

  return {
    isPlaying,
    isLoading,
    currentUrl,
    expanded,
    showDownloads,
    versionId,
    currentBook,
    currentBookName,
    currentChapter,
    playbackSpeed,
    duration,
    position,
    timestamps,
    copyright,
    progress,
    activeVerse,
    playingKey,
    setTrack,
    setTimestamps,
    setPlaying,
    setLoading,
    setPosition,
    setDuration,
    setSpeed,
    reset
  }
})
