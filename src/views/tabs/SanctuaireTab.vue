<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>{{ t('sanctuaire.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="wrap">
        <!-- ─── Moment de prière (matin/soir selon l'heure) ─── -->
        <button class="card moment" @click="openMoment">
          <div class="card-head">
            <ion-icon :icon="momentType === 'morning' ? sunnyOutline : moonOutline" class="card-ico" />
            <span class="card-label">{{ t(`sanctuaire.moment.${momentType}Title`) }}</span>
            <ion-icon v-if="momentDone" :icon="checkmarkCircle" class="done-ico" />
          </div>
          <p class="card-text">
            {{ momentDone ? t('sanctuaire.moment.doneHint') : t(`sanctuaire.moment.${momentType}Hint`) }}
          </p>
        </button>

        <!-- ─── Jeûne : en cours OU prochain ─── -->
        <button class="card fast" @click="router.push('/tabs/sanctuaire/fasting')">
          <div class="card-head">
            <ion-icon :icon="flameOutline" class="card-ico" />
            <span class="card-label">{{ t('sanctuaire.fasting.title') }}</span>
          </div>

          <template v-if="fasting.isParticipating">
            <p class="card-text strong">
              {{ t(`sanctuaire.fasts.${fasting.participation.type}.title`) }} —
              {{ t('sanctuaire.fasting.dayOf', { day: fasting.progress.day, total: fasting.progress.total }) }}
            </p>
            <div class="bar"><div class="fill" :style="{ width: fastPercent + '%' }" /></div>
          </template>
          <template v-else-if="fasting.todayFast">
            <p class="card-text">
              {{ t('sanctuaire.fasting.ongoingToday', { fast: t(`sanctuaire.fasts.${fasting.todayFast.type}.title`) }) }}
            </p>
          </template>
          <template v-else-if="fasting.upcomingFast">
            <p class="card-text">
              {{ t('sanctuaire.fasting.nextIn', {
                fast: t(`sanctuaire.fasts.${fasting.upcomingFast.type}.title`),
                days: daysUntilNext
              }) }}
            </p>
          </template>
        </button>

        <!-- ─── Journal de prières (aperçu) ─── -->
        <button class="card journal" @click="router.push('/tabs/sanctuaire/journal')">
          <div class="card-head">
            <ion-icon :icon="bookOutline" class="card-ico" />
            <span class="card-label">{{ t('sanctuaire.journal.title') }}</span>
            <span v-if="prayer.activePrayers.length" class="count">{{ prayer.activePrayers.length }}</span>
          </div>
          <p v-if="prayer.activePrayers.length === 0" class="card-text">
            {{ t('sanctuaire.journal.emptyHint') }}
          </p>
          <ul v-else class="preview">
            <li v-for="p in prayer.activePrayers.slice(0, 3)" :key="p.id">{{ p.content }}</li>
          </ul>
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, onIonViewWillEnter
} from '@ionic/vue'
import {
  sunnyOutline, moonOutline, flameOutline, bookOutline, checkmarkCircle
} from 'ionicons/icons'
import { usePrayerStore } from '@/stores/prayer'
import { useFastingStore } from '@/stores/fasting'

const { t } = useI18n()
const router = useRouter()
const prayer = usePrayerStore()
const fasting = useFastingStore()

/** Matin avant 18h, soir ensuite (simple et prévisible). */
const momentType = computed(() => (new Date().getHours() < 18 ? 'morning' : 'evening'))
const momentDone = computed(() => prayer.momentDoneToday(momentType.value))

const fastPercent = computed(() => {
  const p = fasting.progress
  return p ? Math.round((p.day / p.total) * 100) : 0
})

const daysUntilNext = computed(() => {
  const f = fasting.upcomingFast
  if (!f) return 0
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((new Date(f.start + 'T00:00:00') - now) / 86400000))
})

function openMoment() {
  router.push(`/tabs/sanctuaire/moment?type=${momentType.value}`)
}

// Rafraîchi à CHAQUE affichage (vue Ionic en cache — lesson 2026-07-09).
onIonViewWillEnter(async () => {
  await Promise.all([prayer.load(), fasting.load()])
})
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; }

.wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-4) var(--space-10);
}

.card {
  display: block;
  width: 100%;
  text-align: left;
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-4);
  cursor: pointer;
  transition: border-color var(--duration-fast);
}
.card:active { border-color: var(--gold-border-md); }

.card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.card-ico { font-size: 20px; color: var(--gold); flex-shrink: 0; }
.card-label {
  font-family: var(--font-app);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
}
.done-ico { margin-left: auto; font-size: 20px; color: var(--gold); }
.count {
  margin-left: auto;
  min-width: 22px; height: 22px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--gold-border);
  border-radius: var(--radius-full);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 12px; font-weight: 700;
}

.card-text {
  margin: 0;
  font-family: var(--font-app);
  font-size: 14px;
  line-height: 1.5;
  color: var(--cream);
}
.card-text.strong { font-weight: 600; }

.bar {
  height: 6px;
  margin-top: 10px;
  background: var(--gold-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.fill { height: 100%; background: var(--gold); border-radius: var(--radius-full); }

.preview {
  margin: 0; padding: 0 0 0 2px;
  list-style: none;
}
.preview li {
  font-family: var(--font-app);
  font-size: 14px;
  color: var(--cream);
  padding: 3px 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.preview li::before { content: '·'; color: var(--gold); margin-right: 8px; }
</style>
