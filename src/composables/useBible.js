import { ref } from 'vue'
import { getBooks, getVerses, getChapterCount } from '@/lib/bible-db'
import { useBibleStore } from '@/stores/bible'

export function useBible() {
  const store = useBibleStore()
  const books = ref([])
  const verses = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadBooks(versionId = store.activeVersion) {
    loading.value = true
    error.value = null
    try {
      books.value = await getBooks(versionId)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadVerses(bookId, chapter, versionId = store.activeVersion) {
    loading.value = true
    error.value = null
    try {
      verses.value = await getVerses(versionId, bookId, chapter)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function getChapters(bookId, versionId = store.activeVersion) {
    return getChapterCount(versionId, bookId)
  }

  return { books, verses, loading, error, loadBooks, loadVerses, getChapters }
}
