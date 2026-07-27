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
          <button class="big-card profile" @click="chooseProfilePlan()">
            <ion-icon :icon="sparkles" />
            <div class="bc-text">
              <span class="bc-title">{{ t('plan.choose.profileCard') }}</span>
              <span class="bc-desc">{{ t('plan.choose.profileDesc') }}</span>
            </div>
          </button>
        </section>

        <!-- Blocs « Parcours » (préétablis), groupés par catégorie -->
        <section v-for="cat in PLAN_CATEGORIES" :key="cat" class="block">
          <p class="block-label">{{ t(`plan.categories.${cat}`) }}</p>
          <button
            v-for="p in presetsByCategory(cat)"
            :key="p.id"
            class="big-card"
            @click="preview(p.id)"
          >
            <!-- Vignette du parcours (bundlée, offline). Repli sur l'icône si absente. -->
            <img v-if="planThumb(p.id)" :src="planThumb(p.id)" class="thumb" alt="" />
            <ion-icon v-else :icon="compass" />
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
import { useAuthStore } from '@/stores/auth'
import { PLAN_CATEGORIES, presetsByCategory, planThumb } from '@/data/presetPlans'
import { scopeLabelKey } from '@/data/planLabels'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const plan = usePlanStore()

const activeTitle = computed(() => {
  const p = plan.activePlan
  if (!p) return ''
  return p.title ? t(p.title) : t(scopeLabelKey(p.scope))
})

/**
 * Ouvre l'APERÇU d'un parcours (détail jour par jour) plutôt que de le créer
 * directement : la personne voit ce qu'elle s'engage à lire avant de démarrer.
 * La création se fait depuis cet écran d'aperçu.
 */
function preview(templateId) {
  router.push(`/tabs/immersion/plan/preview/${templateId}`)
}

/** Crée un plan (confirmation si un plan est déjà actif). */
/**
 * Plan « Pour toi » — exige le profil spirituel (onboarding terminé).
 *
 * ⚠️ Sans cette barrière, createPlan({source:'profile'}) lève 'no_profile' :
 * on générerait sinon un plan présenté comme adapté alors qu'aucun profil
 * n'a été détecté. Mieux vaut expliquer et proposer le quiz.
 */
async function chooseProfilePlan() {
  if (plan.hasKnownProfile()) {
    await choose({ source: 'profile' })
    return
  }

  const alert = await alertController.create({
    header: t('plan.choose.noProfileTitle'),
    message: t('plan.choose.noProfileMsg'),
    buttons: [
      { text: t('common.cancel'), role: 'cancel' },
      {
        text: t('plan.choose.noProfileCta'),
        role: 'confirm',
        handler: () => { startOnboarding() }
      }
    ]
  })
  await alert.present()
}

/** Ouvre le quiz d'onboarding, en levant d'abord un éventuel report de 3 mois. */
async function startOnboarding() {
  if (auth.profile?.onboarding_snooze_until) {
    try {
      await auth.updateProfile({ onboarding_snooze_until: null })
    } catch (e) {
      console.warn('[plan] levée du snooze impossible', e)
    }
  }
  router.push('/onboarding/quiz')
}

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
/* Vignette carrée du parcours, à gauche du texte (même emprise que l'icône). */
.thumb {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--gold-border);
}
.big-card.profile { border-color: var(--gold-border-md); background: linear-gradient(160deg, var(--navy2), var(--card-bg)); }
.bc-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.bc-title { font-family: var(--font-app); font-size: 16px; font-weight: 600; color: var(--cream); }
.bc-desc { font-family: var(--font-app); font-size: 12px; color: var(--muted); line-height: 1.4; }
</style>
