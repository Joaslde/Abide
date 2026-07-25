<template>
  <ion-page>
    <ion-content :fullscreen="true" class="r-content">
      <img class="bg-photo" :src="bgImg" alt="" aria-hidden="true" />
      <div class="bg-overlay"></div>

      <div class="r-wrap">
        <div class="r-top">
          <!-- Symbole du profil -->
          <div class="symbol">{{ profileSymbol }}</div>

          <p class="you-are">{{ t('onboarding.reveal.youAre', { name: auth.firstName }) }}</p>
          <h1 class="profile-name">{{ t(`onboarding.profiles.${result.profile}.name`) }}</h1>

          <fade-in-words
            class="profile-desc"
            tag="p"
            :text="t(`onboarding.profiles.${result.profile}.description`)"
            :stagger="35"
          />

          <div class="meta">
            <div class="meta-row">
              <span class="meta-label">{{ t('onboarding.reveal.yourLevel') }}</span>
              <span class="meta-value">{{ t(`onboarding.levels.${result.level}`) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">{{ t('onboarding.reveal.yourPillar') }}</span>
              <span class="meta-value">{{ t(`onboarding.pillars.${result.pillar}`) }}</span>
            </div>
          </div>
        </div>

        <div class="r-bottom">
          <!-- Consentement RGPD (non bloquant) -->
          <label class="consent">
            <input type="checkbox" v-model="consent" class="consent-box" />
            <span class="consent-text">
              {{ t('onboarding.reveal.consent') }}
            </span>
          </label>

          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

          <button class="primary-pill" :disabled="saving" @click="start">
            {{ saving ? t('common.loading') : t('onboarding.reveal.start') }}
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent } from '@ionic/vue'
import { useOnboardingStore } from '@/stores/onboarding'
import { useAuthStore } from '@/stores/auth'
import FadeInWords from '@/components/shared/FadeInWords.vue'
import bgImg from '@/assets/images/welcome-cross.jpg'

const { t } = useI18n()
const router = useRouter()
const ob = useOnboardingStore()
const auth = useAuthStore()

const consent = ref(false)
const saving = ref(false)
const errorMsg = ref('')

const result = computed(() => ob.result)

const SYMBOLS = {
  source: '💧',
  marcheur: '🥾',
  explorateur: '🧭',
  veilleur: '🕯️',
  porteur: '🚨'
}
const profileSymbol = computed(() => SYMBOLS[result.value.profile] || '✨')

// Sécurité : on n'arrive ici qu'après avoir répondu au quiz.
onMounted(() => {
  if (Object.keys(ob.answers).length === 0) router.replace('/onboarding')
})

async function start() {
  errorMsg.value = ''
  saving.value = true
  try {
    await ob.finish(consent.value)
    const pillar = result.value.pillar
    ob.reset()
    router.replace(`/tabs/${pillar}`)
  } catch (e) {
    errorMsg.value = e.message
    saving.value = false
  }
}
</script>

<style scoped>
.r-content { --background: var(--navy); }

.bg-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  opacity: 0.12;
  z-index: 0;
  pointer-events: none;
}
.bg-overlay {
  position: absolute;
  inset: 0;
  background: var(--navy);
  opacity: 0.82;
  z-index: 0;
  pointer-events: none;
}

.r-wrap {
  position: relative;
  z-index: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 0px) + var(--space-10)) var(--space-6) var(--space-8);
  max-width: 540px;
  margin: 0 auto;
  background-image: radial-gradient(
    ellipse 80% 45% at 50% 22%,
    var(--gold-glow) 0%,
    transparent 70%
  );
}

.r-top { text-align: center; }
.symbol {
  font-size: 4rem;
  margin-bottom: var(--space-6);
  animation: breath var(--duration-breath) ease-in-out infinite;
}
@keyframes breath {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.08); opacity: 1; }
}
.you-are {
  font-family: var(--font-app);
  font-size: 1.1rem;
  color: var(--muted);
  margin: 0 0 var(--space-2);
}
.profile-name {
  font-family: var(--font-app);
  font-weight: 700;
  font-size: 2.6rem;
  color: var(--gold);
  margin: 0 0 var(--space-6);
  line-height: 1.1;
}
.profile-desc {
  font-family: var(--font-app);
  font-size: 1.2rem;
  line-height: 1.65;
  color: var(--cream);
  margin: 0 0 var(--space-8);
}

.meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  border-top: 1px solid var(--gold-border);
  padding-top: var(--space-5);
}
.meta-row { display: flex; justify-content: space-between; align-items: center; }
.meta-label { font-family: var(--font-app); color: var(--muted); font-size: 0.95rem; }
.meta-value { font-family: var(--font-app); color: var(--cream); font-weight: 600; font-size: 1.05rem; }

.r-bottom { display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-8); }
.consent { display: flex; align-items: flex-start; gap: var(--space-3); cursor: pointer; }
.consent-box {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: var(--gold);
}
.consent-text {
  font-family: var(--font-app);
  font-size: 0.85rem;
  color: var(--cream-70);
  line-height: 1.5;
}

.error { color: var(--color-error); font-family: var(--font-app); font-size: 13px; text-align: center; margin: 0; }

.primary-pill {
  width: 100%;
  padding: 17px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--cream);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--duration-fast), opacity var(--duration-normal);
}
.primary-pill:active { transform: scale(0.98); }
.primary-pill:disabled { opacity: 0.6; }
</style>
