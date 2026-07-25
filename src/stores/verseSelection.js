import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Sélection de versets pour les actions (copier, surligner, partager, IA…).
 *
 * Le mode sélection s'active par un appui long sur un verset, puis chaque tap
 * ajoute/retire un verset. La sélection est liée à UN contexte précis
 * (version + livre + chapitre) : changer de chapitre la réinitialise, car on
 * ne mélange pas des versets de chapitres différents dans une même action.
 *
 * Ce store ne contient AUCUNE logique d'action (copie, sauvegarde…) : il ne
 * fait que tenir l'état de la sélection. Les actions vivent dans le composable
 * useVerseActions (presse-papier, etc.), pour garder une responsabilité unique.
 */
export const useVerseSelectionStore = defineStore('verseSelection', () => {
  const active = ref(false) // mode sélection en cours ?
  const context = ref(null) // { versionId, bookId, bookName, chapter }
  // Map<numéro de verset, texte> — garde le texte pour formater la copie.
  const selected = ref(new Map())
  // NOTE : les SURLIGNAGES ne vivent plus ici — ils sont PERSISTÉS dans le
  // store userData (SQLite local via user-db.js). Ce store ne gère que la
  // sélection temporaire (responsabilité unique).

  const count = computed(() => selected.value.size)
  const hasSelection = computed(() => selected.value.size > 0)

  /** Numéros de versets sélectionnés, triés croissant. */
  const sortedVerses = computed(() =>
    [...selected.value.keys()].sort((a, b) => a - b)
  )

  /** Démarre la sélection sur un contexte donné et coche le 1er verset. */
  function start(ctx, verse, text) {
    // Nouveau contexte (autre chapitre/version) → on repart de zéro.
    if (
      !context.value ||
      context.value.versionId !== ctx.versionId ||
      context.value.bookId !== ctx.bookId ||
      context.value.chapter !== ctx.chapter
    ) {
      selected.value = new Map()
      context.value = ctx
    }
    active.value = true
    toggle(verse, text)
  }

  /** Coche/décoche un verset. Si la sélection devient vide → on sort du mode. */
  function toggle(verse, text) {
    const next = new Map(selected.value)
    if (next.has(verse)) next.delete(verse)
    else next.set(verse, text)
    selected.value = next
    if (next.size === 0) clear()
  }

  function isSelected(verse) {
    return selected.value.has(verse)
  }

  /** Quitte le mode sélection et vide la sélection. */
  function clear() {
    active.value = false
    selected.value = new Map()
    context.value = null
  }

  /**
   * Référence lisible de la sélection (ex : "Genèse 1:1-3" ou "Jean 3:16").
   * Versets contigus → plage ; sinon liste séparée par des virgules.
   */
  const reference = computed(() => {
    if (!context.value || selected.value.size === 0) return ''
    const nums = sortedVerses.value
    const ranges = []
    let start = nums[0]
    let prev = nums[0]
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === prev + 1) {
        prev = nums[i]
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`)
        start = prev = nums[i]
      }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`)
    return `${context.value.bookName} ${context.value.chapter}:${ranges.join(',')}`
  })

  return {
    active,
    context,
    selected,
    count,
    hasSelection,
    sortedVerses,
    reference,
    start,
    toggle,
    isSelected,
    clear
  }
})
