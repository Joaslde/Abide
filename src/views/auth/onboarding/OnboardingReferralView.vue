<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ref-content">
      <img class="bg-photo" :src="bgImg" alt="" aria-hidden="true" />
      <div class="bg-overlay"></div>

      <div class="ref-wrap">
        <div class="ref-text">
          <h1 class="title">{{ t('onboarding.referral.title') }}</h1>
          <p class="body">{{ t('onboarding.referral.body') }}</p>
        </div>

        <!-- Oui / Non -->
        <div v-if="invited === null" class="choice-row">
          <button class="choice-pill" @click="invited = true">
            {{ t('onboarding.referral.yes') }}
          </button>
          <button class="choice-pill ghost" @click="skip">
            {{ t('onboarding.referral.no') }}
          </button>
        </div>

        <!-- Champ code (optionnel — peut aussi passer d'ici) -->
        <div v-else class="code-block">
          <ion-input
            v-model="code"
            class="code-input"
            :placeholder="t('onboarding.referral.placeholder')"
            autocapitalize="characters"
            :maxlength="10"
            @ionInput="error = ''"
          />
          <p v-if="error" class="error">{{ error }}</p>

          <div class="ref-actions">
            <button class="primary-pill" :disabled="submitting" @click="submit">
              {{ submitting ? t('common.loading') : t('onboarding.referral.confirm') }}
            </button>
            <button class="ghost-btn" :disabled="submitting" @click="skip">
              {{ t('onboarding.quiz.skipQuestion') }}
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent, IonInput } from '@ionic/vue'
import { supabase } from '@/lib/supabase'
import { isOnline } from '@/lib/network'
import bgImg from '@/assets/images/welcome-cross.jpg'

const { t } = useI18n()
const router = useRouter()

// null = pas encore répondu · true = "oui" (affiche le champ code)
const invited = ref(null)
const code = ref('')
const error = ref('')
const submitting = ref(false)

/**
 * Contournement TEMPORAIRE : tant que l'app n'est pas publiée sur le Play
 * Store, le lien OneLink du parrainage ne peut pas être testé (AppsFlyer
 * redirige vers une fiche Store inexistante). Cette saisie manuelle appelle
 * directement referral-attribute — même Edge Function, même garanties
 * (idempotente via la contrainte UNIQUE referred_id, whitelist de format,
 * anti auto-parrainage) — sans dépendre du mécanisme d'attribution
 * automatique côté auth.js, qui a déjà tenté sa seule tentative à
 * l'inscription (avant que l'onboarding, donc ce code, n'existe).
 */
async function submit() {
  const value = code.value.trim().toUpperCase()
  if (!value) { skip(); return }

  if (!(await isOnline())) {
    error.value = t('onboarding.referral.offline')
    return
  }

  submitting.value = true
  error.value = ''
  try {
    const { data, error: fnError } = await supabase.functions.invoke('referral-attribute', {
      body: { referralCode: value }
    })
    if (fnError || data?.error === 'code_not_found') {
      error.value = t('onboarding.referral.notFound')
      return
    }
    // self_referral / autres erreurs métier : on n'alarme pas plus qu'il ne
    // faut, l'onboarding continue normalement (ce n'est jamais bloquant).
    goNext()
  } catch {
    error.value = t('onboarding.referral.error')
  } finally {
    submitting.value = false
  }
}

function skip() {
  goNext()
}

function goNext() {
  router.replace('/onboarding/quiz')
}
</script>

<style scoped>
.ref-content { --background: var(--navy); }

.bg-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  opacity: 0.1;
  z-index: 0;
  pointer-events: none;
}
.bg-overlay {
  position: absolute;
  inset: 0;
  background: var(--navy);
  opacity: 0.85;
  z-index: 0;
  pointer-events: none;
}

.ref-wrap {
  position: relative;
  z-index: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: calc(env(safe-area-inset-top, 0px) + var(--space-8)) var(--space-6) var(--space-8);
  max-width: 540px;
  margin: 0 auto;
}

.ref-text { text-align: center; margin-bottom: var(--space-8); }
.title {
  font-family: var(--font-app);
  font-weight: 700;
  font-size: 2rem;
  line-height: 1.25;
  color: var(--gold);
  margin: 0 0 var(--space-4);
}
.body {
  font-family: var(--font-app);
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--cream);
  margin: 0;
}

.choice-row { display: flex; flex-direction: column; gap: var(--space-3); }
.choice-pill {
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
  transition: transform var(--duration-fast);
}
.choice-pill:active { transform: scale(0.98); }
.choice-pill.ghost {
  background: none;
  border: 1px solid var(--gold-border-md);
  color: var(--gold);
}

.code-block { display: flex; flex-direction: column; gap: var(--space-3); }
.code-input {
  --background: var(--card-bg);
  --color: var(--cream);
  --placeholder-color: var(--muted);
  --padding-start: 18px;
  --padding-end: 18px;
  --padding-top: 15px;
  --padding-bottom: 15px;
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  font-family: var(--font-app);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
}
.error {
  color: #e0827a;
  font-family: var(--font-app);
  font-size: 13px;
  text-align: center;
  margin: 0;
}

.ref-actions { display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-3); }
.primary-pill {
  width: 100%;
  padding: 17px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--gold);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--duration-fast), opacity var(--duration-normal);
}
.primary-pill:active { transform: scale(0.98); }
.primary-pill:disabled { opacity: 0.6; cursor: not-allowed; }
.ghost-btn {
  width: 100%;
  padding: 15px;
  border: none;
  background: none;
  color: var(--cream-70);
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.ghost-btn:hover { color: var(--cream); }
.ghost-btn:disabled { opacity: 0.5; }
</style>
