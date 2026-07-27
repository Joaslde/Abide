<template>
  <svg
    class="nav-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Accueil : maison épurée, toit d'un seul trait. -->
    <template v-if="name === 'home'">
      <path d="M3.2 10.4 12 3.6l8.8 6.8" />
      <path d="M5.4 9.2V19a1.4 1.4 0 0 0 1.4 1.4h10.4a1.4 1.4 0 0 0 1.4-1.4V9.2" />
      <path d="M9.8 20.4v-5.2a2.2 2.2 0 0 1 4.4 0v5.2" />
    </template>

    <!-- Bible : livre OUVERT avec ruban marque-page — bien plus parlant
         qu'un livre fermé, et c'est l'objet central de l'app. -->
    <template v-else-if="name === 'bible'">
      <path d="M12 6.6C10.4 5.3 8.4 4.6 6.2 4.6H4.4a.9.9 0 0 0-.9.9v11.6a.9.9 0 0 0 .9.9h1.8c2.2 0 4.2.7 5.8 2" />
      <path d="M12 6.6c1.6-1.3 3.6-2 5.8-2h1.8a.9.9 0 0 1 .9.9v11.6a.9.9 0 0 1-.9.9h-1.8c-2.2 0-4.2.7-5.8 2" />
      <path d="M12 6.6V20" />
      <!-- Ruban : signe distinctif d'une Bible. -->
      <path d="M15.4 4.8v4.3l1.5-1.1 1.5 1.1V4.8" :stroke-width="strokeWidth * 0.85" />
    </template>

    <!-- L'Ancre : vraie ancre (Hébreux 6.19 — « une ancre de l'âme »).
         Donne enfin du sens au nom de l'onglet, là où une boussole n'en avait pas. -->
    <template v-else-if="name === 'anchor'">
      <circle cx="12" cy="5" r="2.1" />
      <path d="M12 7.1V21" />
      <path d="M8.4 10.1h7.2" />
      <path d="M4.5 14.4c0 4 3.4 6.6 7.5 6.6s7.5-2.6 7.5-6.6" />
    </template>

    <!-- Plus : trois points, alignés sur le repère visuel universel. -->
    <template v-else-if="name === 'more'">
      <circle cx="5.6" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18.4" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </template>
  </svg>
</template>

<script setup>
/**
 * Icônes de navigation dessinées à la main (SVG inline).
 *
 * Pourquoi pas Ionicons ? Deux raisons :
 *  - Ionicons n'a AUCUNE icône d'ancre, alors que c'est le nom même de l'onglet
 *    du Guide IA (et un symbole chrétien fort : Hébreux 6.19).
 *  - Un jeu dessiné pour l'app donne une cohérence de trait que des icônes
 *    génériques n'ont pas (même graisse, mêmes terminaisons arrondies).
 *
 * Le trait s'épaissit légèrement à l'état actif (voir `active`) : c'est plus
 * subtil qu'un changement de couleur seul et ça se lit à petite taille.
 */
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true }, // home | bible | anchor | more
  active: { type: Boolean, default: false }
})

// computed (et non une constante) : sinon la graisse resterait figée à la
// valeur du premier rendu et ne suivrait jamais le changement d'onglet.
const strokeWidth = computed(() => (props.active ? 1.9 : 1.6))
</script>

<style scoped>
.nav-icon {
  width: 21px;
  height: 21px;
  flex: none; /* ne se comprime pas si le libellé est large */
  display: block;
  /* La graisse suit l'état actif sans reflow (transition sur l'attribut SVG). */
  transition: stroke-width var(--duration-normal, 220ms) ease;
}
</style>
