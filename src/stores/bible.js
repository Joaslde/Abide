import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBibleStore = defineStore('bible', () => {
  const activeVersion = ref('LSG1910')
  const activeBook = ref('GEN')
  const activeChapter = ref(1)
  const fontSize = ref(16)
  const darkMode = ref(false)

  function setVersion(versionId) {
    activeVersion.value = versionId
  }

  function setBook(bookId) {
    activeBook.value = bookId
    activeChapter.value = 1
  }

  function setChapter(chapter) {
    activeChapter.value = chapter
  }

  return {
    activeVersion,
    activeBook,
    activeChapter,
    fontSize,
    darkMode,
    setVersion,
    setBook,
    setChapter
  }
}, { persist: true })
