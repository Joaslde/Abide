import { onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Détecte qu'un chapitre a été LU JUSQU'AU BOUT, pour le marquer comme lu
 * automatiquement (demande du 2026-11-12).
 *
 * « Lu » = la fin du chapitre (bloc d'actions) est à l'écran ET le lecteur est
 * resté un temps minimal sur le chapitre. Sans ce délai, descendre d'un coup en
 * bas pour changer de chapitre marquerait comme lu un texte survolé. Le délai
 * suit la longueur du texte, à une vitesse volontairement généreuse (lecture
 * rapide) : il ne doit jamais faire attendre quelqu'un qui lit vraiment.
 *
 * Un chapitre court qui tient entièrement à l'écran est donc marqué après ce
 * délai minimal, sans défilement.
 *
 * @param {import('vue').Ref<HTMLElement|null>} targetRef  élément de fin de chapitre
 * @param {object} opts
 * @param {() => boolean} opts.canTrigger  conditions métier (pas déjà lu, pas démarqué…)
 * @param {() => number} opts.textLength   nombre de caractères du chapitre
 * @param {() => void} opts.onReached      appelé une fois par visite du chapitre
 */
export function useChapterEndReached(targetRef, { canTrigger, textLength, onReached }) {
  const CHARS_PER_SECOND = 60 // lecture très rapide : on reste du côté du lecteur
  const MIN_MS = 4000
  const MAX_MS = 45000

  let observer = null
  let visible = false
  let fired = false
  let startedAt = 0
  let timer = null

  function minDwellMs() {
    const ms = (textLength() / CHARS_PER_SECOND) * 1000
    return Math.min(MAX_MS, Math.max(MIN_MS, ms))
  }

  function clearTimer() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  function fire() {
    fired = true
    clearTimer()
    onReached()
  }

  function evaluate() {
    if (fired || !startedAt || !visible || !canTrigger()) return
    const remaining = startedAt + minDwellMs() - Date.now()
    if (remaining <= 0) return fire()
    if (timer) return
    // À l'échéance on revérifie : la page a pu être quittée entre-temps (Ionic
    // la garde en mémoire, l'observateur la voit alors hors écran).
    timer = setTimeout(() => {
      timer = null
      evaluate()
    }, remaining + 50)
  }

  /** Mesure directe : l'observateur ne se redéclenche pas si l'état ne change pas. */
  function measureNow() {
    const el = targetRef.value
    if (!el) return false
    const r = el.getBoundingClientRect()
    const h = window.innerHeight || document.documentElement.clientHeight
    return r.height > 0 && r.top < h && r.bottom > 0
  }

  /** À appeler une fois le chapitre chargé (et à chaque changement de chapitre). */
  async function start() {
    clearTimer()
    fired = false
    startedAt = Date.now()
    await nextTick()
    visible = measureNow()
    evaluate()
  }

  /** Suspend la détection pendant un chargement. */
  function stop() {
    clearTimer()
    startedAt = 0
  }

  onMounted(() => {
    if (!('IntersectionObserver' in window) || !targetRef.value) return
    observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting)
        evaluate()
      },
      { threshold: 0.5 }
    )
    observer.observe(targetRef.value)
  })

  onUnmounted(() => {
    clearTimer()
    observer?.disconnect()
  })

  return { start, stop }
}
