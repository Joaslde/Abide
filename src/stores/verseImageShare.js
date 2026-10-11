import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Pilote la feuille de partage d'un verset en image.
 *
 * POURQUOI UN STORE : `VerseActionBar` est monté dans `BibleChapterView`, et
 * Ionic garde PLUSIEURS instances de cette vue en cache quand on navigue de
 * chapitre en chapitre. Chaque instance montait donc sa propre feuille via
 * `<teleport to="body">` — constaté le 2026-09-10 : 2 feuilles dans le DOM,
 * 76 vignettes de fond au lieu de 38, et deux images générées en parallèle.
 *
 * Le store porte l'état, une SEULE feuille est montée dans App.vue.
 */
export const useVerseImageShareStore = defineStore('verseImageShare', () => {
  const open = ref(false)
  const text = ref('')
  const reference = ref('')

  function show({ text: t, reference: r }) {
    text.value = t
    reference.value = r
    open.value = true
  }

  function hide() {
    open.value = false
    // Le texte est conservé le temps de l'animation de fermeture : le vider
    // tout de suite ferait disparaître l'aperçu avant que la feuille ne glisse.
  }

  return { open, text, reference, show, hide }
})
