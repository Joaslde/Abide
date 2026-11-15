<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/settings" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('premium.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="wrap">
        <!-- ── Abonné payant : statut + gestion de l'abonnement ── -->
        <template v-if="paidActive">
          <div class="intro">
            <ion-icon :icon="sparkles" class="intro-icon" />
            <h1 class="intro-title">
              {{ firstName ? t('premium.activeTitleNamed', { name: firstName }) : t('premium.activeTitle') }}
            </h1>
            <p class="intro-text">{{ t('premium.activeUntil', { date: expiryLabel }) }}</p>
          </div>
          <button class="btn-secondary" @click="onManage">{{ t('premium.manage') }}</button>
        </template>

        <!-- ── Offre (non abonné, ou premium offert par parrainage) ── -->
        <template v-else>
          <div class="intro">
            <ion-icon :icon="sparkles" class="intro-icon" />
            <h1 class="intro-title">
              {{ firstName ? t('premium.headingNamed', { name: firstName }) : t('premium.heading') }}
            </h1>
            <p class="intro-text">{{ t('premium.subtitle') }}</p>
          </div>

          <p v-if="referralActive" class="referral-note">
            {{ t('premium.activeReferral', { date: expiryLabel }) }}
          </p>

          <div class="card-premium">
            <span class="badge">{{ t('premium.title') }}</span>

            <span class="section-label">{{ t('premium.featuresLabel') }}</span>
            <ul class="features">
              <li><ion-icon :icon="checkmark" aria-hidden="true" />{{ t('premium.featureNoAds') }}</li>
              <li>
                <ion-icon :icon="checkmark" aria-hidden="true" />
                {{ t('premium.featureAi', { premium: AI_PREMIUM_LIMIT, free: AI_FREE_LIMIT }) }}
              </li>
              <li><ion-icon :icon="checkmark" aria-hidden="true" />{{ t('premium.featureQuiz') }}</li>
              <li><ion-icon :icon="checkmark" aria-hidden="true" />{{ t('premium.featureSupport') }}</li>
            </ul>

            <!-- Prix RÉEL lu chez Google Play (devise locale), jamais codé en dur. -->
            <p v-if="sub.offer" class="price">{{ t('premium.perMonth', { price: sub.offer.priceString }) }}</p>
            <p v-else-if="sub.loadingOffer" class="price-hint">{{ t('premium.loadingOffer') }}</p>
            <p v-else class="price-hint">{{ t('premium.unavailable') }}</p>

            <button
              v-if="sub.offer"
              class="btn-primary"
              :disabled="sub.busy"
              @click="onSubscribe"
            >
              {{ sub.busy ? t('premium.processing') : t('premium.subscribe') }}
            </button>
            <button
              v-else-if="!sub.loadingOffer"
              class="btn-secondary"
              @click="sub.loadOffer()"
            >
              {{ t('premium.retry') }}
            </button>
          </div>

          <p class="free-note">{{ t('premium.freeNote') }}</p>

          <button v-if="sub.offer" class="link-btn" :disabled="sub.busy" @click="onRestore">
            {{ t('premium.restore') }}
          </button>

          <p class="legal">{{ t('premium.legal') }}</p>
          <div class="legal-links">
            <button class="link-btn small" @click="openLegal('terms')">{{ t('premium.terms') }}</button>
            <span aria-hidden="true">·</span>
            <button class="link-btn small" @click="openLegal('privacy')">{{ t('premium.privacy') }}</button>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonIcon, toastController
} from '@ionic/vue'
import { sparkles, checkmark } from 'ionicons/icons'
import { Browser } from '@capacitor/browser'
import { dateLocale } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'

// Plafonds du Guide IA, alignés sur l'Edge Function ai-chat
// (DEFAULT_DAILY_LIMIT et PREMIUM_DAILY_LIMIT). Affichage uniquement : la
// limite réelle est appliquée côté serveur.
const AI_FREE_LIMIT = 15
const AI_PREMIUM_LIMIT = 50

const LEGAL_URLS = {
  terms: 'https://toabide.online/terms.html',
  privacy: 'https://toabide.online/privacy.html'
}

const { t, locale } = useI18n()
const auth = useAuthStore()
const sub = useSubscriptionStore()

const firstName = computed(() => auth.firstName)

/** Premium payé actif → écran de gestion. Le parrainage, lui, garde l'offre visible. */
const paidActive = computed(() =>
  auth.isPremium && ['google_iap', 'apple_iap'].includes(auth.profile?.premium_source)
)
const referralActive = computed(() =>
  auth.isPremium && auth.profile?.premium_source === 'referral'
)

const expiryLabel = computed(() => {
  const expires = auth.profile?.premium_expires
  if (!expires) return ''
  return new Date(expires).toLocaleDateString(dateLocale(locale.value))
})

onMounted(() => {
  if (!paidActive.value) sub.loadOffer()
})

async function toast(message, duration = 2600) {
  const el = await toastController.create({ message, duration, position: 'bottom' })
  await el.present()
}

async function onSubscribe() {
  try {
    const result = await sub.buy()
    if (result === 'active') {
      await toast(firstName.value
        ? t('premium.thanksNamed', { name: firstName.value })
        : t('premium.thanks'))
    } else if (result === 'pending') {
      await toast(t('premium.pending'), 4000)
    }
    // 'cancelled' : la personne a fermé la fenêtre Google Play, rien à dire.
  } catch (e) {
    console.warn('[paywall] achat échoué', e)
    await toast(t('premium.error'))
  }
}

async function onRestore() {
  try {
    const active = await sub.restorePurchases()
    await toast(active ? t('premium.restored') : t('premium.nothingToRestore'))
  } catch (e) {
    console.warn('[paywall] restauration échouée', e)
    await toast(t('premium.restoreError'))
  }
}

async function onManage() {
  try {
    await sub.manage()
  } catch (e) {
    console.warn('[paywall] gestion indisponible', e)
  }
}

async function openLegal(key) {
  await Browser.open({ url: LEGAL_URLS[key] })
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy); }
ion-title { font-family: var(--font-app); font-weight: 600; }
ion-content {
  --background: var(--navy);
  background-image: radial-gradient(ellipse 70% 60% at 50% 20%, var(--gold-glow) 0%, transparent 70%);
}

.wrap { padding: var(--space-4) var(--space-5) var(--space-10); }

/* ── Intro ── */
.intro { text-align: center; padding: var(--space-4) var(--space-2) var(--space-6); }
.intro-icon { font-size: 40px; color: var(--gold); margin-bottom: var(--space-3); }
.intro-title {
  font-family: var(--font-app);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--cream);
  margin: 0 0 var(--space-2);
}
.intro-text {
  font-family: var(--font-app);
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
}

.referral-note {
  font-family: var(--font-app);
  font-size: 13px;
  line-height: 1.5;
  color: var(--gold);
  text-align: center;
  margin: 0 0 var(--space-4);
}

/* ── Card premium (design-pattern.md : bordure or + badge « Abide Plus ») ── */
.card-premium {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--gold);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-5) var(--space-5);
}
.badge {
  position: absolute;
  top: -1px;
  right: var(--space-4);
  background: var(--gold);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 0 0 var(--radius-sharp) var(--radius-sharp);
}
.section-label {
  display: block;
  font-family: var(--font-app);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: var(--space-3);
}

.features { list-style: none; margin: 0 0 var(--space-6); padding: 0; }
.features li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-family: var(--font-app);
  font-size: 15px;
  line-height: 1.45;
  color: var(--cream);
  padding: var(--space-2) 0;
}
.features ion-icon { flex-shrink: 0; font-size: 18px; color: var(--gold); margin-top: 2px; }

.price {
  font-family: var(--font-app);
  font-size: 28px;
  font-weight: 300;
  /* --cream et non --white : en thème clair, --white resterait blanc sur la carte blanche. */
  color: var(--cream);
  text-align: center;
  margin: 0 0 var(--space-4);
}
.price-hint {
  font-family: var(--font-app);
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
  text-align: center;
  margin: 0 0 var(--space-4);
}

/* ── Boutons (radius 2px, style éditorial) ── */
.btn-primary,
.btn-secondary {
  display: block;
  width: 100%;
  min-height: 48px;
  padding: 14px 20px;
  border-radius: var(--radius-sharp);
  font-family: var(--font-app);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform var(--duration-fast, 150ms), background 0.3s;
}
.btn-primary {
  background: var(--gold);
  color: var(--navy);
  border: none;
  box-shadow: 0 4px 20px rgba(201, 168, 76, 0.3);
}
.btn-primary:active,
.btn-secondary:active { transform: scale(0.97); }
.btn-primary:disabled { opacity: 0.6; cursor: default; }
.btn-secondary {
  background: transparent;
  color: var(--gold);
  border: 1px solid var(--gold-border-md);
}

.free-note {
  font-family: var(--font-app);
  font-size: 13px;
  line-height: 1.5;
  color: var(--cream-70);
  text-align: center;
  margin: var(--space-5) 0 var(--space-2);
}

.link-btn {
  display: block;
  margin: 0 auto;
  min-height: 44px;
  padding: 0 var(--space-3);
  background: transparent;
  border: none;
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 14px;
  cursor: pointer;
}
.link-btn.small { display: inline-block; font-size: 12px; color: var(--muted); }
.link-btn:disabled { opacity: 0.5; }

.legal {
  font-family: var(--font-app);
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted);
  text-align: center;
  margin: var(--space-4) 0 0;
}
.legal-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-1);
  color: var(--muted);
  font-size: 12px;
}
</style>
