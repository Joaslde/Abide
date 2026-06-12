import { useAudioStore } from '@/stores/audio'
import { getAudioUrl, getTimestamps } from '@/lib/biblebrain'

export function useAudio() {
  const store = useAudioStore()

  async function playChapter(filesetId, bookId, chapter) {
    const url = await getAudioUrl(filesetId, bookId, chapter)
    if (!url) throw new Error('URL audio introuvable')

    store.setTrack({ url, book: bookId, chapter })
    // L'intégration du plugin @capacitor-community/audio se fait en Phase 1
    store.setPlaying(true)
  }

  async function loadTimestamps(filesetId, bookId, chapter) {
    return getTimestamps(filesetId, bookId, chapter)
  }

  function pause() {
    store.setPlaying(false)
  }

  function resume() {
    store.setPlaying(true)
  }

  function stop() {
    store.reset()
  }

  return { store, playChapter, loadTimestamps, pause, resume, stop }
}
