<template>
  <div class="cal">
    <!-- Navigation mois -->
    <div class="cal-head">
      <button class="nav" :aria-label="t('common.back')" @click="shift(-1)">
        <ion-icon :icon="chevronBack" />
      </button>
      <span class="month-label">{{ monthLabel }}</span>
      <button class="nav" @click="shift(1)">
        <ion-icon :icon="chevronForward" />
      </button>
    </div>

    <!-- Jours de la semaine -->
    <div class="grid dow">
      <span v-for="d in dayNames" :key="d">{{ d }}</span>
    </div>

    <!-- Grille du mois -->
    <div class="grid days">
      <span
        v-for="(cell, i) in cells"
        :key="i"
        class="day"
        :class="[cell.fastType && `fast-${cell.fastType}`, { today: cell.isToday, out: !cell.inMonth }]"
      >
        {{ cell.day || '' }}
      </span>
    </div>

    <!-- Légende -->
    <div class="legend">
      <span v-for="type in legendTypes" :key="type" class="leg">
        <i class="dot" :class="`fast-${type}`" />
        {{ t(`sanctuaire.fasts.${type}.title`) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IonIcon } from '@ionic/vue'
import { chevronBack, chevronForward } from 'ionicons/icons'
import { fastsForMonth, isoDate } from '@/data/fastingCalendar'

const { t, locale } = useI18n()

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1) // 1-12

function shift(delta) {
  let m = month.value + delta
  let y = year.value
  if (m < 1) { m = 12; y-- }
  if (m > 12) { m = 1; y++ }
  month.value = m
  year.value = y
}

const monthLabel = computed(() =>
  new Date(year.value, month.value - 1, 1).toLocaleDateString(
    locale.value === 'en' ? 'en-US' : 'fr-FR',
    { month: 'long', year: 'numeric' }
  )
)

/** Lun→Dim (cohérent avec la ligne de streak). */
const dayNames = computed(() => {
  const base = locale.value === 'en'
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  return base
})

const cells = computed(() => {
  const fasts = fastsForMonth(year.value, month.value)
  const first = new Date(year.value, month.value - 1, 1)
  const daysInMonth = new Date(year.value, month.value, 0).getDate()
  const lead = (first.getDay() + 6) % 7 // 0 = lundi
  const todayIso = isoDate(new Date())

  const out = []
  for (let i = 0; i < lead; i++) out.push({ day: 0, inMonth: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year.value}-${String(month.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const fast = fasts.find((f) => f.start <= iso && f.end >= iso)
    out.push({
      day: d,
      inMonth: true,
      isToday: iso === todayIso,
      fastType: fast?.type ?? null
    })
  }
  return out
})

/** Types présents ce mois-ci (légende contextuelle, pas exhaustive). */
const legendTypes = computed(() => {
  const set = new Set(cells.value.map((c) => c.fastType).filter(Boolean))
  return [...set]
})
</script>

<style scoped>
.cal {
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-4);
}

.cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}
.month-label {
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 600;
  color: var(--cream);
  text-transform: capitalize;
}
.nav {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: none;
  border: 1px solid var(--gold-border);
  border-radius: 50%;
  color: var(--gold);
  cursor: pointer;
}
.nav ion-icon { font-size: 16px; }

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.dow span {
  text-align: center;
  font-family: var(--font-app);
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  padding-bottom: 4px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-app);
  font-size: 13px;
  color: var(--cream);
  border-radius: 50%;
}
.day.out { visibility: hidden; }
.day.today { outline: 1.5px solid var(--gold); outline-offset: -1.5px; font-weight: 700; }

/* Teintes par type de jeûne (semi-transparentes, lisibles sur navy). */
.day.fast-january,   .dot.fast-january   { background: rgba(217, 138, 78, 0.30); }
.day.fast-lent,      .dot.fast-lent      { background: rgba(155, 127, 208, 0.30); }
.day.fast-goodfriday,.dot.fast-goodfriday{ background: rgba(199, 125, 166, 0.45); }
.day.fast-advent,    .dot.fast-advent    { background: rgba(95, 168, 107, 0.30); }
.day.fast-personal,  .dot.fast-personal  { background: rgba(230, 200, 79, 0.30); }

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: var(--space-3);
}
.leg {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-app);
  font-size: 11px;
  color: var(--muted);
}
.dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
