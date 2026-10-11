/**
 * Ajuste la taille de police d'un élément pour que son texte tienne EN ENTIER.
 *
 * Pourquoi pas `clamp()` en CSS : clamp() s'adapte à la largeur de l'ÉCRAN, pas
 * à la longueur du MOT. « Proverbes 21 » et « Deutéronome 21 » recevaient donc
 * la même taille, et le second se faisait tronquer en « Deutérono… ».
 * Ici on mesure le débordement réel (scrollWidth > clientWidth) et on réduit
 * jusqu'à ce que le texte tienne — la taille devient propre à chaque titre.
 *
 * Un titre court garde la taille maximale : on ne rapetisse que ce qui déborde.
 */
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

/**
 * @param {import('vue').Ref<HTMLElement|null>} elRef  élément à ajuster
 * @param {object}  [opts]
 * @param {number}  [opts.max=16]   taille idéale, en px
 * @param {number}  [opts.min=10]   plancher de lisibilité, en px
 * @param {number}  [opts.step=0.5] finesse de la décroissance
 * @param {Array}   [opts.watch=[]] sources qui doivent relancer la mesure
 */
export function useFitText(elRef, { max = 16, min = 10, step = 0.5, watch: sources = [] } = {}) {
  let observer = null

  function fit() {
    const el = elRef.value?.$el ?? elRef.value
    if (!el) return

    // On repart toujours de la taille maximale : sans ça, un titre court
    // affiché après un titre long garderait la petite taille de ce dernier.
    el.style.fontSize = `${max}px`

    // La mesure est faite sur l'élément qui porte réellement l'ellipsis.
    // Rien à faire si le conteneur n'a pas encore de largeur (pas encore peint).
    if (!el.clientWidth) return

    // ⚠️ Android applique son zoom texte système (Réglages → Affichage →
    // Taille de police) PAR-DESSUS la valeur CSS : un `24px` demandé devient
    // 27,6px à l'écran avec un zoom de 1,15. Sans en tenir compte, la boucle
    // descendait jusqu'à `min` en croyant écrire de petites valeurs, et le
    // texte restait tronqué. On travaille donc en px RÉELS, mesurés une fois.
    const rendered = parseFloat(getComputedStyle(el).fontSize) || max
    const scale = rendered / max || 1

    // Bornes converties dans l'espace « valeur CSS demandée ».
    const cssMin = min / scale
    let size = max

    // +1 : marge d'un pixel contre les arrondis de rendu, qui déclenchaient
    // une réduction inutile sur des titres qui tenaient tout juste.
    while (el.scrollWidth > el.clientWidth + 1 && size > cssMin) {
      size = Math.max(cssMin, size - step)
      el.style.fontSize = `${size}px`
    }
  }

  /** Mesure après le rendu : avant, scrollWidth vaut 0. */
  async function scheduleFit() {
    await nextTick()
    fit()
    // Second passage : la police du système peut arriver après le premier
    // rendu et changer la largeur mesurée.
    requestAnimationFrame(fit)
    // Troisième passage différé : certains conteneurs (la mini-barre du lecteur,
    // qui s'anime en apparaissant) n'ont leur largeur définitive qu'après la
    // transition. Sans lui, la mesure se faisait sur une largeur transitoire.
    setTimeout(fit, 320)
  }

  onMounted(() => {
    scheduleFit()

    // ResizeObserver sur le PARENT, pas sur l'élément : c'est la largeur
    // disponible qui change (rotation, apparition de la mini-barre, contrôles
    // qui s'ajoutent). Observer l'élément lui-même créerait une boucle — on
    // modifie sa police, ce qui déclencherait une nouvelle mesure.
    const el = elRef.value?.$el ?? elRef.value
    const target = el?.parentElement
    if (target && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => fit())
      observer.observe(target)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  for (const source of sources) watch(source, scheduleFit)

  return { fit: scheduleFit }
}
