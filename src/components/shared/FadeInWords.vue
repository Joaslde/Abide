<template>
  <component :is="tag" class="fade-words">
    <span
      v-for="(w, i) in words"
      :key="i"
      class="fade-word"
      :style="{ animationDelay: (startDelay + i * stagger) + 'ms' }"
    >{{ w + ' ' }}</span>
  </component>
</template>

<script setup>
/**
 * Révèle un texte mot par mot en fondu linéaire (un à un).
 * Réutilisable sur toutes les vues immersives de l'onboarding.
 * Émet `done` une fois le dernier mot apparu (pour enchaîner boutons / vue suivante).
 */
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  /** Délai entre chaque mot (ms). */
  stagger: { type: Number, default: 75 },
  /** Délai avant le tout premier mot (ms) — utile pour chaîner plusieurs blocs. */
  startDelay: { type: Number, default: 0 },
  /** Durée du fondu d'un mot (ms). */
  fadeDuration: { type: Number, default: 500 },
  /** Balise HTML du conteneur. */
  tag: { type: String, default: 'p' }
})

const emit = defineEmits(['done'])

const words = computed(() => props.text.split(/\s+/).filter(Boolean))

let timer = null
onMounted(() => {
  const total = props.startDelay + words.value.length * props.stagger + props.fadeDuration
  timer = setTimeout(() => emit('done'), total)
})
onUnmounted(() => clearTimeout(timer))

// Exposé pour permettre au parent de calculer le délai du bloc suivant.
defineExpose({
  duration: computed(() => props.startDelay + words.value.length * props.stagger + props.fadeDuration)
})
</script>

<style scoped>
.fade-words { margin: 0; }
.fade-word {
  display: inline;
  opacity: 0;
  animation: fadeWord var(--fade-word-duration, 0.5s) linear forwards;
  will-change: opacity;
}
@keyframes fadeWord {
  to { opacity: 1; }
}
</style>
