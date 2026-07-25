<template>
  <p
    class="verse"
    :class="{ selected: isSelected, highlighted: !!highlightColor, reading: isReading }"
    :style="highlightColor ? { '--hl': highlightColor } : null"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
    @touchmove.passive="onTouchMove"
    @contextmenu.prevent
  >
    <span class="verse-num">{{ verse }}</span>
    <span class="verse-text">{{ text }}</span>
  </p>
</template>

<script setup>
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const props = defineProps({
  verse: { type: Number, required: true },
  text: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
  selectionActive: { type: Boolean, default: false },
  highlightColor: { type: String, default: null },
  isReading: { type: Boolean, default: false }
})

const emit = defineEmits(['longpress', 'tap'])

const LONG_PRESS_MS = 450
const MOVE_TOLERANCE = 10 // px : au-delà, c'est un scroll, pas un appui

let timer = null
let startX = 0
let startY = 0
let moved = false

function onTouchStart(e) {
  moved = false
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  timer = setTimeout(async () => {
    timer = null
    if (moved) return
    // Retour tactile natif pour signaler l'entrée en sélection.
    try { await Haptics.impact({ style: ImpactStyle.Medium }) } catch { /* web */ }
    emit('longpress', { verse: props.verse, text: props.text })
  }, LONG_PRESS_MS)
}

function onTouchMove(e) {
  const dx = Math.abs(e.touches[0].clientX - startX)
  const dy = Math.abs(e.touches[0].clientY - startY)
  if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) {
    moved = true
    cancelTimer()
  }
}

function onTouchEnd() {
  // Appui long déjà déclenché → rien à faire ici.
  if (timer === null) return
  cancelTimer()
  if (moved) return
  // Tap court : ne sélectionne QUE si on est déjà en mode sélection.
  if (props.selectionActive) emit('tap', { verse: props.verse, text: props.text })
}

function cancelTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}
</script>

<style scoped>
.verse {
  margin: 0 0 var(--space-4);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: var(--font-bible);
  font-size: var(--bible-font-size);
  line-height: 1.85;
  color: var(--cream);
  text-align: left;
  transition: background var(--duration-fast), color var(--duration-fast), opacity var(--duration-normal);
  /* Empêche la sélection de texte native du navigateur pendant l'appui long. */
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
/* Surlignage : fond teinté semi-transparent (lisible sur fond sombre).
   color-mix garde la couleur choisie mais atténuée pour ne pas écraser le texte. */
.verse.highlighted {
  background: color-mix(in srgb, var(--hl) 32%, transparent);
}
.verse.selected {
  background: var(--gold-border-md);
}
/* Verset en cours de lecture audio : CARTE JAUNE nette + texte sombre lisible.
   Les AUTRES versets sont atténués par le parent (.reader.audio-active) pour
   concentrer l'attention sur le verset lu. Distinct de .selected et .highlighted. */
.verse.reading {
  background: #ecc94b;
  color: var(--navy);
  border-radius: 10px;
  padding: 10px 12px;
  opacity: 1 !important;
}
.verse.reading .verse-num {
  color: var(--navy);
  opacity: 0.7;
}
.verse-num {
  font-family: var(--font-app);
  font-size: 0.7em;
  font-weight: 600;
  color: var(--gold);
  vertical-align: super;
  margin-right: 6px;
  letter-spacing: 0.02em;
}
.verse-text { white-space: pre-wrap; }
</style>
