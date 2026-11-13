/**
 * Ajuste la taille de police d'un élément pour que son texte tienne EN ENTIER.
 *
 * Pourquoi pas `clamp()` en CSS : clamp() s'adapte à la largeur de l'ÉCRAN, pas
 * à la longueur du MOT. « Proverbes 21 » et « Deutéronome 21 » recevaient donc
 * la même taille, et le second se faisait tronquer en « Deutérono… ».
 * Ici on mesure le débordement réel (scrollWidth > clientWidth) et on réduit
 * jusqu'à ce que le texte tienne, la taille devient propre à chaque titre.
 *
 * Un titre court garde la taille maximale : on ne rapetisse que ce qui déborde.
 */
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

/**
 * @param {import('vue').Ref<HTMLElement|null>|Array<import('vue').Ref>} elRef
 *   élément à ajuster, ou GROUPE d'éléments qui doivent garder la même taille
 *   (ex. onglets AT/NT : tous prennent la taille du plus contraint)
 * @param {object}  [opts]
 * @param {number}  [opts.max=16]   taille idéale, en px
 * @param {number}  [opts.min=10]   plancher de lisibilité, en px
 * @param {number}  [opts.step=0.5] finesse de la décroissance
 * @param {Array}   [opts.watch=[]] sources qui doivent relancer la mesure
 */
export function useFitText(elRef, { max = 16, min = 10, step = 0.5, watch: sources = [] } = {}) {
  let observer = null

  const refs = Array.isArray(elRef) ? elRef : [elRef]
  const elements = () => refs.map((r) => r.value?.$el ?? r.value).filter(Boolean)

  function fit() {
    const sizes = elements().map(fitOne).filter((v) => v != null)
    // Groupe : tout le monde à la plus petite taille trouvée, pour un rendu
    // régulier (deux onglets côte à côte de tailles différentes font négligé).
    if (refs.length > 1 && sizes.length) {
      const smallest = Math.min(...sizes)
      for (const el of elements()) el.style.fontSize = `${smallest}px`
    }
  }

  /** Ajuste un élément ; renvoie la taille CSS retenue (null si non mesurable). */
  function fitOne(el) {

    // On repart toujours de la taille maximale : sans ça, un titre court
    // affiché après un titre long garderait la petite taille de ce dernier.
    el.style.fontSize = `${max}px`

    // La mesure est faite sur l'élément qui porte réellement l'ellipsis.
    // Rien à faire si le conteneur n'a pas encore de largeur (pas encore peint).
    if (!el.clientWidth) return null

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

    // ⚠️ scrollWidth et clientWidth sont des ENTIERS arrondis : un texte de
    // 150,4 px dans 150 px donne 150 = 150, la boucle s'arrête alors que
    // l'ellipsis coupe encore le texte (« Nouveau Testa… » sur un Pixel 8 Pro
    // avec police système à 115 %, constaté le 2026-11-13). L'ancienne marge
    // « + 1 » aggravait le cas. Comparaison stricte, puis un cran de sécurité
    // dès qu'il a fallu réduire : il absorbe la fraction de pixel invisible.
    let shrunk = false
    while (el.scrollWidth > el.clientWidth && size > cssMin) {
      size = Math.max(cssMin, size - step)
      el.style.fontSize = `${size}px`
      shrunk = true
    }
    if (shrunk && size > cssMin) {
      size = Math.max(cssMin, size - step)
      el.style.fontSize = `${size}px`
    }
    return size
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
    // qui s'ajoutent). Observer l'élément lui-même créerait une boucle, on
    // modifie sa police, ce qui déclencherait une nouvelle mesure.
    if (typeof ResizeObserver === 'undefined') return
    observer = new ResizeObserver(() => fit())
    for (const el of elements()) {
      if (el.parentElement) observer.observe(el.parentElement)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  for (const source of sources) watch(source, scheduleFit)

  return { fit: scheduleFit }
}
