<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="backHref" :text="''" />
        </ion-buttons>
        <ion-title>{{ isJourney ? t('plan.journey.title') : t('plan.preview.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="!schedule.length" class="state-msg">{{ t('plan.preview.notFound') }}</div>

      <div v-else class="detail" :class="{ 'has-cta': showCta }">
        <!-- En-tête : vignette + titre + description + durée -->
        <header class="head">
          <img v-if="thumb" :src="thumb" class="head-thumb" alt="" />
          <div class="head-text">
            <h1 class="head-title">{{ title }}</h1>
            <p v-if="desc" class="head-desc">{{ desc }}</p>
            <p class="head-meta">
              {{ t('plan.days', { n: totalDays }, totalDays) }}
              <template v-if="isJourney">
                · {{ t('plan.journey.dayProgress', { day: plan.currentDay, total: totalDays }) }}
              </template>
            </p>
          </div>
        </header>

        <!-- Barre de progression (mode parcours uniquement) -->
        <div v-if="isJourney" class="bar"><div class="fill" :style="{ width: plan.progress + '%' }" /></div>

        <!-- Liste jour par jour -->
        <ol class="days">
          <li
            v-for="d in schedule"
            :key="d.day"
            class="day"
            :class="isJourney ? dayState(d.day) : ''"
          >
            <div class="day-head">
              <span class="day-num">
                <ion-icon v-if="isJourney && dayState(d.day) === 'done'" :icon="checkmarkCircle" />
                <template v-else>{{ d.day }}</template>
              </span>
              <span class="day-label">{{ t('plan.journey.day', { n: d.day }) }}</span>
            </div>
            <div class="day-items">
              <button
                v-for="(it, i) in d.items"
                :key="i"
                class="chip"
                @click="openChapter(it)"
              >
                {{ bookLabels[it.book_id] || it.book_id }} {{ it.chapter }}
              </button>
            </div>
          </li>
        </ol>
      </div>
    </ion-content>

    <!-- CTA fixe en bas (mode aperçu uniquement) -->
    <ion-footer v-if="showCta" class="ion-no-border">
      <div class="cta-bar">
        <button class="cta" @click="start">
          {{ hasOtherActivePlan ? t('plan.preview.replace') : t('plan.preview.start') }}
        </button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonFooter, IonIcon, alertController
} from '@ionic/vue'
import { checkmarkCircle } from 'ionicons/icons'
import { usePlanStore } from '@/stores/plan'
import { useBibleStore } from '@/stores/bible'
import { getBooks } from '@/lib/bible-db'
import { getPreset, presetToPlan, planThumb } from '@/data/presetPlans'
import { scopeLabelKey } from '@/data/planLabels'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const plan = usePlanStore()
const bible = useBibleStore()

/**
 * Deux modes pour un même écran :
 *  - PARCOURS (`plan/journey`) : le plan ACTIF, avec l'avancement (jours faits/à venir).
 *  - APERÇU  (`plan/preview/:templateId`) : un préétabli qu'on n'a pas encore lancé,
 *    avec le bouton « Commencer » / « Remplacer » en bas.
 */
const isJourney = computed(() => !route.params.templateId)
const preset = computed(() =>
  route.params.templateId ? getPreset(route.params.templateId) : null
)

const backHref = computed(() => (isJourney.value ? '/tabs/home' : '/tabs/immersion/plan'))

/** Planning jour par jour : celui du plan actif, ou celui construit depuis le préétabli. */
const schedule = computed(() => {
  if (isJourney.value) return plan.activePlan?.schedule ?? []
  return preset.value ? presetToPlan(preset.value).schedule : []
})

const totalDays = computed(() =>
  isJourney.value ? plan.totalDays : (preset.value?.days ?? 0)
)

const title = computed(() => {
  if (isJourney.value) {
    const p = plan.activePlan
    if (!p) return ''
    return p.title ? t(p.title) : t(scopeLabelKey(p.scope))
  }
  return preset.value ? t(preset.value.title) : ''
})

const desc = computed(() => (preset.value ? t(preset.value.desc) : ''))

const thumb = computed(() => {
  const id = isJourney.value ? plan.activePlan?.template_id : preset.value?.id
  return id ? planThumb(id) : ''
})

// Le CTA n'a de sens qu'en aperçu d'un préétabli réellement trouvé.
const showCta = computed(() => !isJourney.value && !!preset.value)

/** Un AUTRE plan est-il en cours ? (→ le bouton devient « Remplacer »). */
const hasOtherActivePlan = computed(
  () => !!plan.activePlan && !plan.isCompleted && plan.activePlan.template_id !== preset.value?.id
)

/** État d'un jour en mode parcours : fait / en cours / à venir. */
function dayState(day) {
  if (day < plan.currentDay) return 'done'
  if (day === plan.currentDay) return 'current'
  return 'upcoming'
}

// Noms lisibles des livres (mêmes libellés que le reste de l'app).
const bookLabels = ref({})
onMounted(async () => {
  const books = await getBooks(bible.activeVersion)
  bookLabels.value = Object.fromEntries(books.map((b) => [b.book_id, b.name]))
})

function openChapter(it) {
  router.push(`/tabs/immersion/book/${it.book_id}/${it.chapter}`)
}

/** Lance le parcours (confirmation si un autre plan est déjà en cours). */
async function start() {
  if (hasOtherActivePlan.value) {
    const alert = await alertController.create({
      header: t('plan.replace'),
      message: t('plan.replaceWarn'),
      buttons: [
        { text: t('common.cancel'), role: 'cancel' },
        { text: t('plan.replace'), role: 'confirm', handler: doStart }
      ]
    })
    await alert.present()
    return
  }
  await doStart()
}

async function doStart() {
  await plan.createPlan({ source: 'template', templateId: preset.value.id })
  router.replace('/tabs/home')
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; font-size: 16px; }
ion-content { --background: var(--navy); }

.state-msg {
  text-align: center;
  color: var(--muted);
  font-family: var(--font-app);
  padding: var(--space-12) var(--space-5);
}

.detail { padding: var(--space-4) var(--space-4) var(--space-8); }
/* Espace réservé sous la liste quand le bouton fixe est affiché. */
.detail.has-cta { padding-bottom: 96px; }

/* En-tête */
.head { display: flex; gap: var(--space-4); margin-bottom: var(--space-4); }
.head-thumb {
  width: 72px; height: 72px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--gold-border);
}
.head-text { min-width: 0; }
.head-title {
  font-family: var(--font-app);
  font-size: 20px;
  font-weight: 700;
  color: var(--cream);
  margin: 0 0 4px;
  line-height: 1.25;
}
.head-desc {
  font-family: var(--font-app);
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0 0 6px;
}
.head-meta {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0;
}

/* Progression (mode parcours) */
.bar {
  height: 6px;
  background: var(--gold-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-5);
}
.fill { height: 100%; background: var(--gold); transition: width var(--duration-normal); }

/* Liste des jours */
.days { list-style: none; margin: 0; padding: 0; }
.day {
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--gold-border);
}
.day:last-child { border-bottom: none; }
.day-head { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
.day-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px; height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--gold-border-md);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 12px;
  font-weight: 600;
}
.day-num ion-icon { font-size: 18px; }
.day-label {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

/* États (mode parcours) */
.day.done .day-num { background: var(--gold); border-color: var(--gold); color: var(--navy); }
.day.done .day-label { color: var(--gold); }
.day.current .day-num { border-color: var(--gold); background: var(--gold-border); }
.day.current .day-label { color: var(--cream); font-weight: 600; }
.day.upcoming { opacity: 0.55; }

.day-items { display: flex; flex-wrap: wrap; gap: var(--space-2); padding-left: 38px; }
.chip {
  padding: 6px 12px;
  background: var(--navy2);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 14px;
  cursor: pointer;
}
.chip:active { border-color: var(--gold); }

/* CTA fixe */
.cta-bar {
  padding: var(--space-3) var(--space-4) calc(env(safe-area-inset-bottom, 0px) + var(--space-3));
  background: var(--navy2);
  border-top: 1px solid var(--gold-border);
}
.cta {
  width: 100%;
  padding: 14px;
  background: var(--gold);
  border: none;
  border-radius: var(--radius-md);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.cta:active { transform: scale(0.99); }
</style>
