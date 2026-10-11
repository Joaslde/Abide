import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { getBooks } from '@/lib/bible-db'
import { useBibleVersionsStore } from '@/stores/bibleVersions'

/** Clé de persistance de la version Bible active (stockage natif). */
const VERSION_KEY = 'abide.bible.activeVersion'

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
    // ⚠️ PERSISTER : sans ça, activeVersion repartait à 'LSG1910' en dur à chaque
    // démarrage. Résultat : l'app passée en anglais rouvrait avec la Bible et le
    // verset du jour en français, alors que la locale, elle, était bien restaurée
    // (bug 2026-07-26).
    await Preferences.set({ key: VERSION_KEY, value: versionId })
    await loadBooks(true)
  }

  /**
   * Restaure la version active depuis le stockage natif. Appelée au démarrage,
   * AVANT le premier rendu qui dépend de la Bible (verset du jour, lecteur).
   * Silencieuse : toute erreur laisse simplement la LSG bundlée par défaut.
   */
  async function restoreVersion() {
    try {
      const { value } = await Preferences.get({ key: VERSION_KEY })
      if (!value || value === activeVersion.value) return
      const versions = useBibleVersionsStore()
      await versions.loadInstalled()
      // La version a pu être désinstallée entre deux lancements → on ne bascule
      // que si son .db est réellement présent, sinon on reste sur la LSG.
      if (!versions.installedIds.includes(value)) return
      await versions.activate(value)
      activeVersion.value = value
      booksLoaded.value = false
    } catch (e) {
      console.warn('[bible] restauration de la version impossible', e)
    }
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
    restoreVersion,
    setBook,
    setChapter
  }
})
