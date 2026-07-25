<template>
  <div class="streak">
    <div class="streak-head">
      <ion-icon :icon="flame" class="head-flame" />
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
import { useStreakStore } from '@/stores/streak'

const { t, locale } = useI18n()
const streak = useStreakStore()

// Première lettre des jours lundi→dimanche selon la langue.
const dayLetters = computed(() =>
  locale.value === 'en'
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['L', 'M', 'M', 'J', 'V', 'S', 'D']
)

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
.head-flame { color: var(--gold); font-size: 20px; }
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
