<template>
  <div class="streak" :class="{ blaze: blazing }">
    <div class="streak-head">
      <span class="head-flame-wrap">
        <ion-icon :icon="flame" class="head-flame" />
      </span>
      <span class="streak-total">{{ t('streak.days', { n: streak.currentStreak }, streak.currentStreak) }}</span>
    </div>
    <div class="week">
      <div v-for="(active, i) in streak.week" :key="i" class="day" :class="{ active, today: i === todayIdx }">
        <div class="dot">
          <ion-icon v-if="active" :icon="flame" class="day-flame" />
        </div>
        <span class="label">{{ dayLetters[i] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { flame } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { WEEKDAY_LETTERS } from '@/i18n'
import { useStreakStore, STREAK_BLAZE_FROM } from '@/stores/streak'

const { t, locale } = useI18n()
const streak = useStreakStore()

// Première lettre des jours lundi→dimanche selon la langue.
const dayLetters = computed(() => WEEKDAY_LETTERS[locale.value] ?? WEEKDAY_LETTERS.fr)

// Série d'au moins 10 jours : la flamme de l'en-tête s'embrase.
const blazing = computed(() => streak.currentStreak >= STREAK_BLAZE_FROM)

// Index du jour courant (0 = lundi).
const todayIdx = computed(() => (new Date().getDay() + 6) % 7)
</script>

<style scoped>
.streak {
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
.streak-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--space-3);
}
.head-flame-wrap { display: inline-flex; position: relative; }
.head-flame { color: var(--gold); font-size: 20px; }

/* ── Série de 10 jours et plus : flamme embrasée ── */
.streak.blaze {
  border-color: rgba(230, 162, 60, 0.45);
  box-shadow: inset 0 0 24px rgba(230, 120, 40, 0.12);
}
.blaze .head-flame-wrap::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(240, 140, 50, 0.55), transparent 70%);
  animation: blaze-glow 1.8s ease-in-out infinite;
}
.blaze .head-flame {
  position: relative;
  font-size: 30px;
  color: #F2A23A;
  filter: drop-shadow(0 0 6px rgba(240, 120, 40, 0.8));
  transform-origin: 50% 90%;
  animation: blaze-flicker 1.4s ease-in-out infinite;
}
.blaze .streak-total { color: var(--gold); font-size: 17px; }
@keyframes blaze-flicker {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.08, 1.12) rotate(-3deg); }
  50% { transform: scale(0.96, 1.04) rotate(2deg); }
  75% { transform: scale(1.06, 1.1) rotate(-1deg); }
}
@keyframes blaze-glow {
  0%, 100% { opacity: 0.6; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.15); }
}
@media (prefers-reduced-motion: reduce) {
  .blaze .head-flame, .blaze .head-flame-wrap::before { animation: none; }
}
.streak-total {
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 600;
  color: var(--cream);
}

.week {
  display: flex;
  justify-content: space-between;
}
.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--navy2);
  border: 1px solid var(--gold-border);
  transition: all var(--duration-normal);
}
.day.active .dot {
  background: linear-gradient(160deg, #E6A23C, #C9302C);
  border-color: transparent;
  box-shadow: 0 0 12px rgba(230, 162, 60, 0.5);
}
.day.today .dot { border-color: var(--gold); }
.day-flame { color: #fff; font-size: 18px; }
.label {
  font-family: var(--font-app);
  font-size: 11px;
  color: var(--muted);
}
.day.today .label { color: var(--gold); font-weight: 600; }
</style>
