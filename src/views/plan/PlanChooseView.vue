<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('plan.choose.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="choose">
        <!-- Plan en cours -->
        <div v-if="plan.activePlan" class="current">
          {{ t('plan.choose.current', { title: activeTitle }) }}
        </div>

        <!-- Bloc « Pour toi » (profil) -->
        <section class="block">
          <p class="block-label">{{ t('plan.choose.forYou') }}</p>
          <button class="big-card profile" @click="choose({ source: 'profile' })">
            <ion-icon :icon="sparkles" />
            <div class="bc-text">
              <span class="bc-title">{{ t('plan.choose.profileCard') }}</span>
              <span class="bc-desc">{{ t('plan.choose.profileDesc') }}</span>
            </div>
          </button>
        </section>

        <!-- Bloc « Parcours » (préétablis) -->
        <section class="block">
          <p class="block-label">{{ t('plan.choose.journeys') }}</p>
          <button
            v-for="p in presets"
            :key="p.id"
            class="big-card"
            @click="choose({ source: 'template', templateId: p.id })"
          >
            <ion-icon :icon="compass" />
            <div class="bc-text">
              <span class="bc-title">{{ t(p.title) }}</span>
              <span class="bc-desc">{{ t(p.desc) }} · {{ t('plan.days', { n: p.days }, p.days) }}</span>
            </div>
          </button>
        </section>

        <!-- Bloc « Créer le mien » (custom) -->
        <section class="block">
          <p class="block-label">{{ t('plan.choose.own') }}</p>
          <button class="big-card" @click="goCustom">
            <ion-icon :icon="createOutline" />
            <div class="bc-text">
              <span class="bc-title">{{ t('plan.choose.customCard') }}</span>
              <span class="bc-desc">{{ t('plan.choose.customDesc') }}</span>
            </div>
          </button>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonIcon,
  alertController
} from '@ionic/vue'
import { sparkles, compass, createOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { usePlanStore } from '@/stores/plan'
import { PRESET_PLANS } from '@/data/presetPlans'
import { scopeLabelKey } from '@/data/planLabels'

const { t } = useI18n()
const router = useRouter()
const plan = usePlanStore()

const presets = PRESET_PLANS

const activeTitle = computed(() => {
  const p = plan.activePlan
  if (!p) return ''
  return p.title ? t(p.title) : t(scopeLabelKey(p.scope))
})

/** Crée un plan (confirmation si un plan est déjà actif). */
async function choose(descriptor) {
  if (plan.activePlan && !plan.isCompleted) {
    const alert = await alertController.create({
      header: t('plan.replace'),
      message: t('plan.replaceWarn'),
      buttons: [
        { text: t('common.cancel'), role: 'cancel' },
        { text: t('plan.replace'), role: 'confirm', handler: () => doCreate(descriptor) }
      ]
    })
    await alert.present()
    return
  }
  await doCreate(descriptor)
}

async function doCreate(descriptor) {
  await plan.createPlan(descriptor)
  router.replace('/tabs/home')
}

function goCustom() {
  router.push('/tabs/immersion/plan/custom')
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; font-size: 16px; }
ion-content { --background: var(--navy); }

.choose { padding: var(--space-4) var(--space-4) var(--space-8); }
.current {
  background: var(--gold-border);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 13px;
  margin-bottom: var(--space-4);
}

.block { margin-bottom: var(--space-5); }
.block-label {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 var(--space-3);
}

.big-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-4);
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  margin-bottom: var(--space-2);
  transition: border-color var(--duration-fast);
}
.big-card:active { border-color: var(--gold); }
.big-card > ion-icon { font-size: 26px; color: var(--gold); flex-shrink: 0; }
.big-card.profile { border-color: var(--gold-border-md); background: linear-gradient(160deg, var(--navy2), var(--card-bg)); }
.bc-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.bc-title { font-family: var(--font-app); font-size: 16px; font-weight: 600; color: var(--cream); }
.bc-desc { font-family: var(--font-app); font-size: 12px; color: var(--muted); line-height: 1.4; }
</style>
