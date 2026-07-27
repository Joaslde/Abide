<template>
  <ion-app>
    <ion-router-outlet />
    <!-- Lecteur audio global (panneau expansible + mini-barre) : survit à la
         navigation (comme une appli musique). Visible seulement pendant la lecture. -->
    <audio-player-sheet />
    <!-- Splash animé d'ouverture (1× par démarrage à froid). -->
    <splash-overlay v-if="showSplash" />
  </ion-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { warmUpBible } from '@/lib/bible-db'
import { initUserDb } from '@/lib/user-db'
import { useStreakStore } from '@/stores/streak'
import { usePlanStore } from '@/stores/plan'
import { useBackgroundMusicStore } from '@/stores/backgroundMusic'
import { rescheduleFromStores, registerNotificationTapHandler } from '@/lib/notifications'
import { initAdMob } from '@/lib/admob'
import { initAppsFlyer } from '@/lib/appsflyer'
import AudioPlayerSheet from '@/components/bible/AudioPlayerSheet.vue'
import SplashOverlay from '@/components/SplashOverlay.vue'
import router from '@/router'

// Splash affiché une seule fois, au démarrage à froid de l'app.
const showSplash = ref(true)

const streak = useStreakStore()
const plan = usePlanStore()
const bgMusic = useBackgroundMusicStore()

// Préférences + session auth sont initialisées dans main.js (bootstrap),
// avant le montage, pour que les guards du router aient le bon état.

// Les plugins/ressources natifs s'initialisent ici au démarrage de l'app.
onMounted(() => {
  // Prépare ET préchauffe la Bible locale (copie le .db bundlé sur natif,
  // charge le WASM sur web, puis chauffe le cache SQLite). Non bloquant :
  // les vues attendent l'init via leurs propres getters, mais grâce au
  // préchauffage la 1re ouverture de chapitre est quasi instantanée.
  warmUpBible()
  // Tap sur une notification (prière/jeûne) → ouvre directement l'écran concerné.
  registerNotificationTapHandler(router)
  // Initialise le SDK AdMob (interstitiels). No-op sur web / si non natif.
  initAdMob()
  // Initialise AppsFlyer (attribution des installs via lien de parrainage).
  // No-op sur web / si non natif / si aucune Dev Key configurée.
  initAppsFlyer()
  // Charge la préférence « musique de fond » (esclave de l'audio Bible).
  bgMusic.init()
  // Prépare la base de données utilisateur (surlignages, signets, notes) puis
  // charge streak + plan (pour que le calcul de streak ait le bon last_active).
  initUserDb().then(async () => {
    streak.load()
    plan.loadActivePlan()
    // Sanctuaire : re-planifier les notifications locales (rappels de prière +
    // accompagnement du jeûne actif OU annonces du prochain). Idempotent.
    // rescheduleFromStores() charge fasting/prayer et gère elle-même ses erreurs
    // (une exception ici ne doit JAMAIS faire échouer tout le boot).
    await rescheduleFromStores()
  }).catch((e) => console.error('[boot] initUserDb a échoué', e))
})
</script>
