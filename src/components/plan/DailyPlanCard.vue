<template>
  <div class="plan-card">
    <!-- Aucun plan → invitation -->
    <template v-if="!plan.activePlan">
      <p class="pc-label">{{ t('plan.title') }}</p>
      <p class="pc-empty">{{ t('plan.noPlan') }}</p>
      <button class="pc-cta" @click="goSetup">{{ t('plan.start') }}</button>
    </template>

    <!-- Plan terminé -->
    <template v-else-if="plan.isCompleted">
      <p class="pc-label">{{ t('plan.title') }}</p>
      <p class="pc-done">🎉 {{ t('plan.completed') }}</p>
      <button class="pc-cta" @click="goSetup">{{ t('plan.startNew') }}</button>
    </template>

    <!-- Plan actif -->
    <template v-else>
      <div class="pc-head">
        <!-- Vignette du parcours en cours (préétablis uniquement : un plan
             sur mesure n'a pas d'image dédiée). -->
        <img v-if="activeThumb" :src="activeThumb" class="pc-thumb" alt="" />
        <div class="pc-titles">
          <p class="pc-name">{{ activeTitle }}</p>
          <p class="pc-label">{{ t('plan.dayOf', { day: plan.currentDay, total: plan.totalDays }) }}</p>
        </div>
        <button class="pc-change" @click="goSetup">{{ t('plan.change') }}</button>
      </div>

      <!-- Voir tout le parcours : jours faits, jour en cours, jours à venir. -->
      <button class="pc-journey" @click="goJourney">
        <ion-icon :icon="listOutline" />
        <span>{{ t('plan.journey.see') }}</span>
      </button>

      <div class="pc-items">
        <button
          v-for="(it, i) in plan.todayItems"
          :key="i"
          class="pc-item"
          @click="openChapter(it)"
        >
          {{ bookLabels[it.book_id] || it.book_id }} {{ it.chapter }}
        </button>
      </div>

      <div class="pc-bar"><div class="pc-fill" :style="{ width: plan.progress + '%' }" /></div>

      <button class="pc-cta" @click="markDone">{{ t('plan.markRead') }}</button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon, toastController } from '@ionic/vue'
import { listOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { usePlanStore } from '@/stores/plan'
import { useBibleStore } from '@/stores/bible'
import { getBooks } from '@/lib/bible-db'
import { scopeLabelKey } from '@/data/planLabels'
import { planThumb } from '@/data/presetPlans'

const { t } = useI18n()
const router = useRouter()
const plan = usePlanStore()
const bible = useBibleStore()

// Titre affiché : titre i18n (profil/préétabli) ou libellé dérivé de la portée (custom).
const activeTitle = computed(() => {
  const p = plan.activePlan
  if (!p) return ''
  return p.title ? t(p.title) : t(scopeLabelKey(p.scope))
})

// Vignette du parcours : seuls les préétablis en ont une (template_id).
// Un plan sur mesure ou « selon mon profil » n'affiche rien (repli silencieux).
const activeThumb = computed(() => {
  const id = plan.activePlan?.template_id
  return id ? planThumb(id) : ''
})

// Nom lisible des livres (pour l'affichage des chapitres du jour).
const bookLabels = ref({})
onMounted(async () => {
  const books = await getBooks(bible.activeVersion)
  bookLabels.value = Object.fromEntries(books.map((b) => [b.book_id, b.name]))
})

function goSetup() {
  router.push('/tabs/immersion/plan')
}

function goJourney() {
  router.push('/tabs/immersion/plan/journey')
}

function openChapter(it) {
  router.push(`/tabs/immersion/book/${it.book_id}/${it.chapter}`)
}

async function markDone() {
  await plan.completeToday()
  const tt = await toastController.create({
    message: plan.isCompleted ? t('plan.completed') : t('plan.dayDone'),
    duration: 1600, position: 'bottom', color: 'dark'
  })
  await tt.present()
}
</script>

<style scoped>
.plan-card {
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
.pc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); }
/* Vignette du parcours en cours (même langage visuel que l'écran de choix). */
.pc-thumb {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--gold-border);
}
.pc-titles { min-width: 0; flex: 1; }
.pc-name {
  font-family: var(--font-app);
  font-size: 16px;
  font-weight: 600;
  color: var(--cream);
  margin: 0 0 2px;
}
.pc-label {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 var(--space-2);
}
.pc-change {
  background: none; border: none; padding: 0;
  color: var(--muted); font-family: var(--font-app); font-size: 12px; cursor: pointer;
}
.pc-empty, .pc-done {
  font-family: var(--font-app);
  font-size: 15px;
  color: var(--cream);
  margin: 0 0 var(--space-4);
}

/* Lien discret vers le parcours complet (sous le titre, avant les chapitres). */
.pc-journey {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  margin: 0 0 var(--space-3);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 12px;
  cursor: pointer;
}
.pc-journey ion-icon { font-size: 15px; }

.pc-items { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3); }
.pc-item {
  padding: 6px 12px;
  background: var(--navy2);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 14px;
  cursor: pointer;
}
.pc-item:active { border-color: var(--gold); }

.pc-bar {
  height: 6px;
  background: var(--gold-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-4);
}
.pc-fill { height: 100%; background: var(--gold); transition: width var(--duration-normal); }

.pc-cta {
  width: 100%;
  padding: 12px;
  background: var(--gold);
  border: none;
  border-radius: var(--radius-md);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
