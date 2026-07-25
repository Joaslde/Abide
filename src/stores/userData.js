import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  highlightsFor, setHighlights, removeHighlights, listAllHighlights, highlightId,
  toggleBookmark as dbToggleBookmark, isBookmarked as dbIsBookmarked,
  bookmarkId, listBookmarks,
  listNotes, getNote, saveNote, deleteNote
} from '@/lib/user-db'

/**
 * Store des données UTILISATEUR locales (surlignages, signets, notes).
 *
 * État réactif au-dessus de user-db (SQLite natif / localStorage web).
 * Local-first : tout est écrit localement ; la sync Supabase viendra plus tard.
 */
export const useUserDataStore = defineStore('userData', () => {
  // Surlignages du chapitre AFFICHÉ : Map<verset, couleur>.
  const chapterHighlights = ref(new Map())
  // Contexte du chapitre chargé (pour savoir quoi recharger/écrire).
  const hlContext = ref(null) // { versionId, bookId, bookName, chapter }

  // Signet du chapitre affiché ?
  const currentBookmarked = ref(false)

  /** Couleur de surlignage persistée d'un verset du chapitre courant. */
  function highlightOf(verse) {
    return chapterHighlights.value.get(verse) ?? null
  }

  /** Charge les surlignages + l'état signet du chapitre affiché. */
  async function loadChapter(ctx) {
    hlContext.value = ctx
    const rows = await highlightsFor(ctx.versionId, ctx.bookId, ctx.chapter)
    chapterHighlights.value = new Map(rows.map((r) => [r.verse, r.color]))
    currentBookmarked.value = await dbIsBookmarked(
      bookmarkId(ctx.versionId, ctx.bookId, ctx.chapter)
    )
  }

  /**
   * Applique (ou retire si color=null) une couleur aux versets donnés.
   * verses = [{verse, text}] — le texte sert de snapshot pour la liste Surlignés.
   */
  async function applyHighlight(ctx, verses, color) {
    if (color) {
      await setHighlights(
        verses.map((v) => ({
          version_id: ctx.versionId,
          book_id: ctx.bookId,
          book_name: ctx.bookName,
          chapter: ctx.chapter,
          verse: v.verse,
          color,
          text: v.text
        }))
      )
    } else {
      await removeHighlights(
        verses.map((v) => highlightId(ctx.versionId, ctx.bookId, ctx.chapter, v.verse))
      )
    }
    // Mise à jour réactive locale (sans relire la DB).
    const next = new Map(chapterHighlights.value)
    for (const v of verses) {
      if (color) next.set(v.verse, color)
      else next.delete(v.verse)
    }
    chapterHighlights.value = next
  }

  /** Supprime un surlignage individuel (depuis la liste Surlignés). */
  async function removeHighlight(id) {
    await removeHighlights([id])
    // Si c'est le chapitre affiché, rafraîchir la Map.
    if (hlContext.value) {
      const parts = id.split('|')
      const c = hlContext.value
      if (parts[0] === c.versionId && parts[1] === c.bookId && Number(parts[2]) === c.chapter) {
        const next = new Map(chapterHighlights.value)
        next.delete(Number(parts[3]))
        chapterHighlights.value = next
      }
    }
  }

  /** Pose/retire le signet du chapitre affiché. */
  async function toggleCurrentBookmark(snippet) {
    const ctx = hlContext.value
    if (!ctx) return
    currentBookmarked.value = await dbToggleBookmark({
      version_id: ctx.versionId,
      book_id: ctx.bookId,
      book_name: ctx.bookName,
      chapter: ctx.chapter,
      snippet
    })
  }

  return {
    chapterHighlights,
    currentBookmarked,
    highlightOf,
    loadChapter,
    applyHighlight,
    removeHighlight,
    toggleCurrentBookmark,
    // Accès direct DB pour les vues listes (pas besoin d'état permanent).
    listAllHighlights,
    listBookmarks,
    listNotes,
    getNote,
    saveNote,
    deleteNote
  }
})
