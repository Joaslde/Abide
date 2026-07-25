import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBooks } from '@/lib/bible-db'
import { useBibleVersionsStore } from '@/stores/bibleVersions'

/**
 * Store de navigation du lecteur Bible.
 *
 * - Position courante : version / livre / chapitre (persistée → reprise de lecture).
 * - Cache de la liste des livres (évite de re-interroger SQLite à chaque écran).
 *
 * La TAILLE et la POLICE du texte biblique ne sont PAS ici : elles vivent dans
 * le store `preferences` (bibleFontSize / bibleFont), source unique et persistée.
 */
export const useBibleStore = defineStore('bible', () => {
  const activeVersion = ref('LSG1910')
  const activeBook = ref('GEN')
  const activeChapter = ref(1)

  // Cache des livres de la version active.
  const books = ref([])
  const booksLoaded = ref(false)

  const oldTestament = computed(() => books.value.filter((b) => b.testament === 'OT'))
  const newTestament = computed(() => books.value.filter((b) => b.testament === 'NT'))

  const currentBook = computed(
    () => books.value.find((b) => b.book_id === activeBook.value) ?? null
  )
  const currentBookName = computed(() => currentBook.value?.name ?? '')
  const currentChapterCount = computed(() => currentBook.value?.chapter_count ?? 0)

  /** Charge (une fois) la liste des livres de la version active dans le cache. */
  async function loadBooks(force = false) {
    if (booksLoaded.value && !force) return
    books.value = await getBooks(activeVersion.value)
    booksLoaded.value = true
  }

  /**
   * Change de version : bascule la base active (bible-db) puis recharge les
   * livres. On GARDE activeBook/activeChapter (les ID de livres sont canoniques
   * et partagés entre versions) → la position de lecture est conservée.
   */
  async function setVersion(versionId) {
    if (versionId === activeVersion.value) return
    const versions = useBibleVersionsStore()
    await versions.activate(versionId) // ouvre la bonne base (.db)
    activeVersion.value = versionId
    booksLoaded.value = false
    await loadBooks(true)
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
    books,
    booksLoaded,
    oldTestament,
    newTestament,
    currentBook,
    currentBookName,
    currentChapterCount,
    loadBooks,
    setVersion,
    setBook,
    setChapter
  }
})
