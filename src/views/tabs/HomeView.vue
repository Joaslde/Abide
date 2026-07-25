<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>{{ greeting }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="home">
        <verse-of-day-card />
        <!-- Moment de prière du jour (matin/soir selon l'heure) → Sanctuaire. -->
        <prayer-moment-card />
        <streak-week />
        <daily-plan-card />
      </div>
    </ion-content>

    <!-- Overlay flamme (Lottie) au 1er streak du jour -->
    <streak-fire-overlay ref="fireOverlay" :count="streak.currentStreak" />
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useStreakStore } from '@/stores/streak'
import { usePlanStore } from '@/stores/plan'
import { usePrayerStore } from '@/stores/prayer'
import { usePreferencesStore } from '@/stores/preferences'
import { localDateStr } from '@/stores/streak'
import VerseOfDayCard from '@/components/home/VerseOfDayCard.vue'
import PrayerMomentCard from '@/components/sanctuaire/PrayerMomentCard.vue'
import StreakWeek from '@/components/home/StreakWeek.vue'
import DailyPlanCard from '@/components/plan/DailyPlanCard.vue'
import StreakFireOverlay from '@/components/home/StreakFireOverlay.vue'

const { t } = useI18n()
const auth = useAuthStore()
const streak = useStreakStore()
const plan = usePlanStore()
const prayer = usePrayerStore()
const prefs = usePreferencesStore()

const fireOverlay = ref(null)

const greeting = computed(() =>
  auth.firstName ? t('home.greeting', { name: auth.firstName }) : t('home.greetingNoName')
)

// À chaque entrée sur l'Accueil : recharger streak/plan et jouer l'overlay si
// le streak a augmenté aujourd'hui ET qu'on ne l'a pas encore montré.
onIonViewWillEnter(async () => {
  await Promise.all([streak.load(), plan.loadActivePlan(), prayer.load()])
  const today = localDateStr()
  if (streak.justIncremented && prefs.streakOverlayDate !== today) {
    streak.clearJustIncremented()
    prefs.setStreakOverlayDate(today)
    fireOverlay.value?.show()
  }
})
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; }
ion-content { --background: var(--navy); }

.home {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-4) var(--space-8);
}
</style>
