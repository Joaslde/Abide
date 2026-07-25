<template>
  <!-- Le pilier Immersion EST le lecteur Bible. La vue d'accueil de la Bible
       (onglets AT/NT + liste des livres) s'affiche directement dans l'onglet.
       Les sous-écrans (livre, chapitre) sont des routes sous l'onglet /tabs/immersion/*. -->
  <bible-home-view />
</template>

<script setup>
import BibleHomeView from '@/views/bible/BibleHomeView.vue'
</script>
