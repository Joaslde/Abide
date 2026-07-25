<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/sanctuaire" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('sanctuaire.fasting.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="wrap">
        <!-- ─── Carte du jour ─── -->
        <section class="card">
          <!-- Participation en cours -->
          <template v-if="fasting.isParticipating">
            <span class="block-label">{{ t('sanctuaire.fasting.activeLabel') }}</span>
            <p class="big">{{ t(`sanctuaire.fasts.${fasting.participation.type}.title`) }}</p>
            <p class="sub">
              {{ t('sanctuaire.fasting.dayOf', { day: fasting.progress.day, total: fasting.progress.total }) }}
            </p>
            <div class="bar"><div class="fill" :style="{ width: percent + '%' }" /></div>
            <p class="verse-hint">« {{ encouragement.text }} »</p>
            <button class="ghost-btn danger" @click="confirmLeave">
              {{ t('sanctuaire.fasting.leave') }}
            </button>
          </template>

          <!-- Jeûne calendaire aujourd'hui, pas encore rejoint -->
          <template v-else-if="fasting.todayFast">
            <span class="block-label">{{ t('sanctuaire.fasting.todayLabel') }}</span>
            <p class="big">{{ t(`sanctuaire.fasts.${fasting.todayFast.type}.title`) }}</p>
            <p class="sub">{{ t(`sanctuaire.fasts.${fasting.todayFast.type}.desc`) }}</p>
            <button class="main-btn" @click="join(fasting.todayFast)">
              {{ t('sanctuaire.fasting.join') }}
            </button>
          </template>

          <!-- Prochain jeûne -->
          <template v-else-if="fasting.upcomingFast">
            <span class="block-label">{{ t('sanctuaire.fasting.nextLabel') }}</span>
            <p class="big">{{ t(`sanctuaire.fasts.${fasting.upcomingFast.type}.title`) }}</p>
            <p class="sub">
              {{ t('sanctuaire.fasting.startsIn', { days: daysUntil }) }} —
              {{ t(`sanctuaire.fasts.${fasting.upcomingFast.type}.desc`) }}
            </p>
          </template>
        </section>

        <!-- ─── Calendrier navigable ─── -->
        <fasting-calendar />

        <!-- ─── Jeûne personnel ─── -->
        <section v-if="!fasting.isParticipating" class="card">
          <span class="block-label">{{ t('sanctuaire.fasting.personalTitle') }}</span>
          <p class="sub">{{ t('sanctuaire.fasting.personalDesc') }}</p>
          <div class="chips">
            <button
              v-for="d in [3, 7, 21, 40]"
              :key="d"
              class="chip"
              :class="{ active: personalDays === d }"
              @click="personalDays = d"
            >
              {{ t('sanctuaire.fasting.nDays', { n: d }) }}
            </button>
          </div>
          <button class="main-btn" @click="startPersonal">
            {{ t('sanctuaire.fasting.startPersonal') }}
          </button>
        </section>

        <!-- ─── Historique ─── -->
        <section v-if="pastFasts.length" class="card">
          <span class="block-label">{{ t('sanctuaire.fasting.historyTitle') }}</span>
          <div v-for="f in pastFasts" :key="f.id" class="hist">
            <ion-icon
              :icon="f.status === 'completed' ? checkmarkCircle : closeCircleOutline"
              :class="f.status === 'completed' ? 'ok' : 'ko'"
            />
            <span class="hist-name">{{ t(`sanctuaire.fasts.${f.type}.title`) }}</span>
            <span class="hist-date">{{ f.start }}</span>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonIcon, alertController, toastController, onIonViewWillEnter
} from '@ionic/vue'
import { checkmarkCircle, closeCircleOutline } from 'ionicons/icons'
import { useFastingStore } from '@/stores/fasting'
import { fastingEncouragement } from '@/data/prayerPool'
import {
  scheduleActiveFast, cancelActiveFast, scheduleUpcomingFast
} from '@/lib/notifications'
import FastingCalendar from '@/components/sanctuaire/FastingCalendar.vue'

const { t, locale } = useI18n()
const fasting = useFastingStore()
const personalDays = ref(7)

onIonViewWillEnter(() => fasting.load())

const percent = computed(() => {
  const p = fasting.progress
  return p ? Math.round((p.day / p.total) * 100) : 0
})

const daysUntil = computed(() => {
  const f = fasting.upcomingFast
  if (!f) return 0
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((new Date(f.start + 'T00:00:00') - now) / 86400000))
})

/** Encouragement du jour (même pool que les notifications). */
const encouragement = computed(() => fastingEncouragement(locale.value, new Date(), 0))

const pastFasts = computed(() =>
  fasting.history.filter((f) => f.status !== 'joined')
)

async function join(fast) {
  await fasting.join(fast)
  await scheduleActiveFast(fasting.participation)
  const toast = await toastController.create({
    message: t('sanctuaire.fasting.joinedToast'),
    duration: 2200,
    position: 'bottom'
  })
  await toast.present()
}

async function startPersonal() {
  await fasting.startPersonal(personalDays.value)
  await scheduleActiveFast(fasting.participation)
  const toast = await toastController.create({
    message: t('sanctuaire.fasting.joinedToast'),
    duration: 2200,
    position: 'bottom'
  })
  await toast.present()
}

async function confirmLeave() {
  const alert = await alertController.create({
    header: t('sanctuaire.fasting.leaveTitle'),
    message: t('sanctuaire.fasting.leaveConfirm'),
    buttons: [
      { text: t('common.cancel'), role: 'cancel' },
      {
        text: t('sanctuaire.fasting.leave'),
        role: 'destructive',
        handler: async () => {
          await fasting.leave()
          await cancelActiveFast()
          // On rebranche les annonces du prochain jeûne calendaire.
          if (fasting.upcomingFast) await scheduleUpcomingFast(fasting.upcomingFast)
        }
      }
    ]
  })
  await alert.present()
}
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
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-4);
}
.block-label {
  display: block;
  font-family: var(--font-app);
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 8px;
}
.big {
  margin: 0 0 4px;
  font-family: var(--font-app);
  font-size: 20px; font-weight: 600;
  color: var(--cream);
}
.sub {
  margin: 0 0 var(--space-3);
  font-family: var(--font-app);
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

.bar {
  height: 7px;
  background: var(--gold-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-3);
}
.fill { height: 100%; background: var(--gold); }

.verse-hint {
  margin: 0 0 var(--space-3);
  font-family: var(--font-bible, var(--font-app));
  font-size: 14px;
  font-style: italic;
  color: var(--cream);
  line-height: 1.6;
}

.main-btn {
  width: 100%;
  padding: 13px;
  background: var(--gold);
  border: none;
  border-radius: var(--radius-full);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 15px; font-weight: 700;
  cursor: pointer;
}
.ghost-btn {
  width: 100%;
  padding: 11px;
  background: none;
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 14px;
  cursor: pointer;
}
.ghost-btn.danger { color: #e2777a; border-color: rgba(226, 119, 122, 0.4); }

.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: var(--space-3); }
.chip {
  padding: 8px 14px;
  background: none;
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 13px;
  cursor: pointer;
}
.chip.active { background: var(--gold-border); color: var(--gold); border-color: var(--gold); }

.hist {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--gold-border);
}
.hist:last-child { border-bottom: none; }
.hist ion-icon { font-size: 18px; flex-shrink: 0; }
.hist ion-icon.ok { color: var(--gold); }
.hist ion-icon.ko { color: var(--muted); }
.hist-name { font-family: var(--font-app); font-size: 14px; color: var(--cream); }
.hist-date { margin-left: auto; font-family: var(--font-app); font-size: 12px; color: var(--muted); }
</style>
