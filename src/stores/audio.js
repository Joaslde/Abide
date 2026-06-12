import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  const isPlaying = ref(false)
  const currentUrl = ref(null)
  const currentBook = ref(null)
  const currentChapter = ref(null)
  const currentVerse = ref(null)
  const playbackSpeed = ref(1.0)
  const duration = ref(0)
  const position = ref(0)

  const progress = computed(() => {
    if (!duration.value) return 0
    return (position.value / duration.value) * 100
  })

  function setTrack({ url, book, chapter }) {
    currentUrl.value = url
    currentBook.value = book
    currentChapter.value = chapter
    currentVerse.value = null
    position.value = 0
  }

  function setPlaying(val) {
    isPlaying.value = val
  }

  function setCurrentVerse(verse) {
    currentVerse.value = verse
  }

  function reset() {
    isPlaying.value = false
    currentUrl.value = null
    currentVerse.value = null
    position.value = 0
    duration.value = 0
  }

  return {
    isPlaying,
    currentUrl,
    currentBook,
    currentChapter,
    currentVerse,
    playbackSpeed,
    duration,
    position,
    progress,
    setTrack,
    setPlaying,
    setCurrentVerse,
    reset
  }
})
