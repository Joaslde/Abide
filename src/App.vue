<template>
  <ion-app>
    <ion-router-outlet />
    <!-- Lecteur audio global (panneau expansible + mini-barre) : survit à la
         navigation (comme une appli musique). Visible seulement pendant la lecture.
         MASQUÉ sur l'Ancre (Guide IA) : l'écran de conversation doit rester
         dégagé — la lecture, elle, CONTINUE (on ne cache que l'interface). -->
    <audio-player-sheet v-if="!hidePlayer" />
    <!-- Splash animé d'ouverture (1× par démarrage à froid). -->
    <splash-overlay v-if="showSplash" />

    <!-- Partage d'un verset en image. Monté ICI et nulle part ailleurs :
         Ionic garde plusieurs BibleChapterView en cache, donc plusieurs
         VerseActionBar — une feuille par barre aurait dupliqué le composant
         (constaté le 2026-09-10 : 2 feuilles, 2 images générées en parallèle). -->
    <verse-image-sheet
      :open="imageShare.open"
      :text="imageShare.text"
      :reference="imageShare.reference"
      @close="onImageShareClose"
    />
  </ion-app>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { IonApp, IonRouterOutlet, alertController } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { warmUpBible } from '@/lib/bible-db'
import { initUserDb } from '@/lib/user-db'
import { useStreakStore } from '@/stores/streak'
import { useAudioStore } from '@/stores/audio'
import { useBibleStore } from '@/stores/bible'
import { usePlanStore } from '@/stores/plan'
import { useBackgroundMusicStore } from '@/stores/backgroundMusic'
import { useVerseImageShareStore } from '@/stores/verseImageShare'
import { useVerseSelectionStore } from '@/stores/verseSelection'
import VerseImageSheet from '@/components/bible/VerseImageSheet.vue'
import { rescheduleFromStores, registerNotificationTapHandler, ensureNotificationPermission } from '@/lib/notifications'
import { initAdMob } from '@/lib/admob'
import { initAppsFlyer } from '@/lib/appsflyer'
import { shouldAskBatteryExemption, requestIgnoreBatteryOptimizations } from '@/lib/battery-optimization'
import AudioPlayerSheet from '@/components/bible/AudioPlayerSheet.vue'
import SplashOverlay from '@/components/SplashOverlay.vue'
import router from '@/router'

const { t } = useI18n()

// Splash affiché une seule fois, au démarrage à froid de l'app.
const showSplash = ref(true)

// Écrans où le lecteur audio ne doit PAS s'afficher (l'audio continue de jouer).
const route = useRoute()
const audio = useAudioStore()
const bible = useBibleStore()
const hidePlayer = computed(() => route.path.startsWith('/tabs/ancre'))

/**
 * Le lecteur est-il RÉELLEMENT à l'écran ? (audio chargé ET écran autorisé)
 * On pose une classe sur <html> plutôt que de passer une prop à chaque vue :
 * la réserve d'espace en bas des pages est ainsi gérée en un seul endroit
 * (voir la règle `.player-visible` dans TabsLayout), sans toucher aux 15 vues.
 */
const playerVisible = computed(() => !!audio.currentUrl && !hidePlayer.value)
watchEffect(() => {
  document.documentElement.classList.toggle('player-visible', playerVisible.value)
})

const streak = useStreakStore()
const plan = usePlanStore()
const bgMusic = useBackgroundMusicStore()
const imageShare = useVerseImageShareStore()
const verseSelection = useVerseSelectionStore()

/**
 * Fermeture de la feuille de partage : on vide AUSSI la sélection de versets.
 * Sans ça, la barre d'actions resterait ouverte derrière, ce qui donnerait
 * l'impression que le partage n'a pas abouti.
 */
function onImageShareClose() {
  imageShare.hide()
  verseSelection.clear()
}

// Préférences + session auth sont initialisées dans main.js (bootstrap),
// avant le montage, pour que les guards du router aient le bon état.

// Les plugins/ressources natifs s'initialisent ici au démarrage de l'app.
onMounted(() => {
  // Prépare ET préchauffe la Bible locale (copie le .db bundlé sur natif,
  // charge le WASM sur web, puis chauffe le cache SQLite). Non bloquant :
  // les vues attendent l'init via leurs propres getters, mais grâce au
  // préchauffage la 1re ouverture de chapitre est quasi instantanée.
  // Restaure la version Bible choisie AVANT le préchauffage : sinon l'app
  // rouvrait toujours sur la LSG française, même après un passage en anglais
  // (le verset du jour et le lecteur repartaient en FR — bug 2026-07-26).
  warmUpBible().then(() => bible.restoreVersion())
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
    // Demande la permission de notification AU PREMIER LANCEMENT.
    // ⚠️ Android ≥ 6 n'accorde plus rien à l'installation : toute permission
    // « dangereuse » (ici POST_NOTIFICATIONS, la seule de l'app) doit être
    // demandée à l'exécution. On le fait ici, dès le boot, plutôt que d'attendre
    // qu'un écran en ait besoin — sinon la personne pourrait passer des jours
    // sans rappels sans jamais avoir vu la demande.
    await ensureNotificationPermission()

    await rescheduleFromStores()

    // Les rappels ne servent à rien si le système tue les alarmes à la
    // fermeture de l'app (ROM Infinix/Xiaomi/Huawei…). On propose l'exemption
    // APRÈS la planification : ainsi on ne la demande qu'à quelqu'un qui a
    // réellement des notifications en attente. Une seule fois, jamais insistant.
    maybeAskBatteryExemption()
  }).catch((e) => console.error('[boot] initUserDb a échoué', e))
})

/**
 * Propose l'exemption d'optimisation batterie, en EXPLIQUANT d'abord pourquoi.
 * Ouvrir la boîte système sans contexte serait incompréhensible pour la personne.
 */
async function maybeAskBatteryExemption() {
  try {
    if (!(await shouldAskBatteryExemption())) return
    const alert = await alertController.create({
      header: t('settings.batteryTitle'),
      message: t('settings.batteryMsg'),
      buttons: [
        { text: t('settings.batteryLater'), role: 'cancel' },
        { text: t('settings.batteryAllow'), role: 'confirm',
          handler: () => { requestIgnoreBatteryOptimizations() } }
      ]
    })
    await alert.present()
  } catch (e) {
    console.warn('[battery] proposition impossible', e)
  }
}
</script>
