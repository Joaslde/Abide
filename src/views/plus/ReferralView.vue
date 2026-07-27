<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/settings" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('referral.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="wrap">
        <div class="intro">
          <ion-icon :icon="giftOutline" class="intro-icon" />
          <h1 class="intro-title">{{ t('referral.heading') }}</h1>
          <p class="intro-text">{{ t('referral.description') }}</p>
        </div>

        <!-- ── Code (à donner directement) ── -->
        <div class="group">
          <div class="item code-item">
            <div class="item-lead">
              <ion-icon :icon="linkOutline" />
              <span>{{ loading ? t('common.loading') : (referralCode || '—') }}</span>
            </div>
          </div>
          <!-- ⚠️ Partage du LIEN désactivé temporairement (2026-07-27) : le lien
               OneLink AppsFlyer redirige vers la fiche Play Store, INEXISTANTE
               tant que l'app n'est pas publiée — le lien ne mène nulle part.
               En attendant, le code s'affiche ci-dessus et se transmet à l'oral
               ou par message ; la personne invitée le saisit manuellement à
               l'onboarding (OnboardingReferralView.vue). Réactiver ce bouton
               une fois l'app publiée et le lien vérifié fonctionnel. -->
          <!--
          <button class="item tappable" :disabled="!shareLink" @click="onShare">
            <div class="item-lead">
              <ion-icon :icon="shareSocialOutline" />
              <span>{{ t('referral.share') }}</span>
            </div>
          </button>
          -->
        </div>

        <!-- ── Progression vers le prochain palier ── -->
        <div class="group">
          <div class="progress-block">
            <p class="progress-count">
              {{ t('referral.referralCount', { count: referralCount }) }}
            </p>
            <div class="tiers-row">
              <div v-for="tier in TIERS" :key="tier.threshold" class="tier" :class="{ reached: referralCount >= tier.threshold }">
                <span class="tier-count">{{ tier.threshold }}</span>
                <span class="tier-days">{{ t('referral.daysShort', { days: tier.days }) }}</span>
              </div>
            </div>
            <p v-if="nextTier" class="progress-hint">
              {{ t('referral.nextTierHint', { remaining: nextTier.remaining, days: nextTier.days }) }}
            </p>
            <p v-else class="progress-hint max">{{ t('referral.allTiersReached') }}</p>
          </div>
        </div>

        <!-- ── Statut premium actif via parrainage ── -->
        <div v-if="auth.isPremium && auth.profile?.premium_source === 'referral'" class="group">
          <div class="item">
            <div class="item-lead">
              <ion-icon :icon="sparkles" />
              <span>{{ t('referral.premiumActiveUntil', { date: premiumExpiryLabel }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonIcon, toastController
} from '@ionic/vue'
import {
  giftOutline, linkOutline, shareSocialOutline, sparkles
} from 'ionicons/icons'
import { Share } from '@capacitor/share'
import { Clipboard } from '@capacitor/clipboard'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()

// Paliers affichés — DOIVENT rester alignés sur TIERS de l'Edge Function
// referral-attribute (source de vérité serveur). Purement décoratif ici : la
// vraie logique de récompense est calculée et appliquée côté serveur.
// Révisés le 2026-07-27 (5/10/15 → 7/14/30j jugés trop faciles).
const TIERS = [
  { threshold: 10, days: 10 },
  { threshold: 25, days: 30 },
  { threshold: 50, days: 90 }
]

const loading = ref(true)
const referralCode = ref('')
const referralCount = ref(0)

// OneLink créé dans le dashboard AppsFlyer (Engagement & Deep Linking). Le code
// du parrain est un paramètre custom : le SDK AppsFlyer côté filleul le lira
// depuis les données de conversion (af_referral_code) — cf. src/lib/appsflyer.js.
const ONELINK_BASE = import.meta.env.VITE_APPSFLYER_ONELINK_URL || ''
const shareLink = computed(() =>
  referralCode.value && ONELINK_BASE
    ? `${ONELINK_BASE}?af_referral_code=${referralCode.value}`
    : ''
)

const nextTier = computed(() => {
  const upcoming = TIERS.find((tier) => referralCount.value < tier.threshold)
  if (!upcoming) return null
  return { remaining: upcoming.threshold - referralCount.value, days: upcoming.days }
})

const premiumExpiryLabel = computed(() => {
  const expires = auth.profile?.premium_expires
  if (!expires) return ''
  return new Date(expires).toLocaleDateString()
})

onMounted(async () => {
  try {
    const { data, error } = await supabase.functions.invoke('referral-get-code')
    if (!error && data?.referralCode) referralCode.value = data.referralCode
  } catch {
    /* hors ligne : le code reste vide, l'utilisateur peut réessayer en rouvrant l'écran */
  }

  const { count } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', auth.user?.id)
  referralCount.value = count ?? 0

  loading.value = false
})

async function onShare() {
  const text = t('referral.shareMessage', { link: shareLink.value })
  try {
    await Share.share({ title: t('referral.title'), text })
  } catch {
    if (navigator.share) {
      try { await navigator.share({ title: t('referral.title'), text }) } catch { /* annulé */ }
      return
    }
    await Clipboard.write({ string: text })
    const toast = await toastController.create({
      message: t('referral.linkCopied'), duration: 1800, position: 'bottom'
    })
    await toast.present()
  }
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy); }
ion-title { font-family: var(--font-app); font-weight: 600; }
ion-content { --background: var(--navy); }

.wrap { padding: var(--space-4) var(--space-4) var(--space-10); }

/* ── Intro ── */
.intro { text-align: center; padding: var(--space-4) var(--space-4) var(--space-6); }
.intro-icon { font-size: 40px; color: var(--gold); margin-bottom: var(--space-3); }
.intro-title {
  font-family: var(--font-app);
  font-size: 20px;
  font-weight: 700;
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

/* ── Blocs groupés (façon iOS, cohérent avec SettingsView) ── */
.group {
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  overflow: hidden;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 54px;
  padding: 0 var(--space-4);
  background: transparent;
  border: none;
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 15px;
  text-align: left;
}
.item + .item { border-top: 1px solid var(--gold-border); }
.tappable { cursor: pointer; }
.tappable:active { background: var(--navy2); }
.tappable:disabled { opacity: 0.5; cursor: default; }

.item-lead { display: flex; align-items: center; gap: var(--space-3); min-width: 0; }
.item-lead ion-icon { font-size: 20px; color: var(--gold); flex-shrink: 0; }
.item-lead span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.code-item .item-lead span {
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--gold);
}

/* ── Progression paliers ── */
.progress-block { padding: var(--space-4); }
.progress-count {
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 600;
  color: var(--cream);
  margin: 0 0 var(--space-4);
  text-align: center;
}
.tiers-row { display: flex; gap: var(--space-3); margin-bottom: var(--space-4); }
.tier {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-3) var(--space-2);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  opacity: 0.5;
}
.tier.reached {
  opacity: 1;
  border-color: var(--gold);
  background: color-mix(in srgb, var(--gold) 10%, transparent);
}
.tier-count {
  font-family: var(--font-app);
  font-size: 18px;
  font-weight: 700;
  color: var(--gold);
}
.tier-days {
  font-family: var(--font-app);
  font-size: 11px;
  color: var(--muted);
}
.progress-hint {
  font-family: var(--font-app);
  font-size: 13px;
  color: var(--muted);
  text-align: center;
  margin: 0;
}
.progress-hint.max { color: var(--gold); font-weight: 600; }
</style>
