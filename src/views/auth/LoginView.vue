<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <!-- Fond : image de la croix très discrète + overlay navy quasi opaque -->
      <img class="bg-photo" :src="bgImg" alt="" aria-hidden="true" />
      <div class="bg-overlay"></div>

      <!-- Skip (accès invité) -->
      <button class="skip-btn" @click="onSkip">{{ t('common.skip') }}</button>

      <div class="auth-wrap">
        <!-- En-tête : logo + titre + sous-titre -->
        <header class="auth-head">
          <h1 class="brand">{{ t('common.appName') }}</h1>
          <h2 class="title">{{ t('auth.welcomeBack') }}</h2>
          <p class="subtitle">{{ t('auth.loginSubtitle') }}</p>
        </header>

        <!-- Formulaire -->
        <form class="auth-form" @submit.prevent="onSubmit">
          <input
            v-model.trim="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            class="input"
            :placeholder="t('auth.email')"
            required
          />

          <div class="input-wrap">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              class="input"
              :placeholder="t('auth.password')"
              required
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Masquer' : 'Afficher'">
              <ion-icon :icon="showPassword ? eyeOff : eye" />
            </button>
          </div>

          <button type="button" class="forgot" @click="goForgot">
            {{ t('auth.forgotLink') }}
          </button>

          <p v-if="errorMsg" class="msg msg-error">{{ errorMsg }}</p>

          <button type="submit" class="primary-pill" :disabled="loading">
            {{ loading ? t('auth.signingIn') : t('auth.signIn') }}
          </button>

          <div class="divider"><span>{{ t('common.or') }}</span></div>

          <button type="button" class="google-pill" :disabled="loading" @click="onGoogle">
            <svg class="g-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
            </svg>
            {{ t('auth.googleSignIn') }}
          </button>
        </form>

        <!-- Lien inscription -->
        <button type="button" class="switch" @click="goRegister">
          {{ t('auth.noAccountQuestion') }}
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { eye, eyeOff } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import bgImg from '@/assets/images/welcome-cross.jpg'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const prefs = usePreferencesStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    // Le guard router redirige vers /onboarding ou l'app selon shouldOnboard.
    router.replace('/')
  } catch (e) {
    errorMsg.value = e.code ? t(`auth.errors.${e.code}`) : e.message
  } finally {
    loading.value = false
  }
}

async function onGoogle() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.loginWithGoogle()
    // NATIF : signIn a résolu → la session est prête, on route (le guard décide
    // onboarding vs accueil). WEB : la ligne n'est pas atteinte (redirection
    // navigateur), le retour est géré au bootstrap (main.js).
    if (auth.isAuthenticated) router.replace('/')
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}

async function onSkip() {
  await prefs.completeFirstLaunch()
  router.replace('/tabs/immersion')
}

function goForgot() { router.push('/auth/forgot') }
function goRegister() { router.push('/auth/register') }
</script>

<style scoped>
.auth-content { --background: var(--navy); }

/* Image de fond très discrète (la croix se devine à peine) */
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

/* Overlay navy quasi opaque par-dessus l'image */
.bg-overlay {
  position: absolute;
  inset: 0;
  background: var(--navy);
  opacity: 0.82;
  z-index: 0;
  pointer-events: none;
}

.skip-btn {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 14px);
  right: 16px;
  z-index: 2;
  background: none;
  border: none;
  color: var(--cream-70);
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 500;
  padding: 8px 12px;
  cursor: pointer;
}

.auth-wrap {
  position: relative;
  z-index: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-8) var(--space-6);
  max-width: 460px;
  margin: 0 auto;
  background-image: radial-gradient(
    ellipse 70% 50% at 50% 18%,
    var(--gold-glow) 0%,
    transparent 70%
  );
  animation: fadeUp 0.6s ease-out both;
}

/* === EN-TÊTE === */
.auth-head { text-align: center; margin-bottom: var(--space-10); }
.brand {
  font-family: var(--font-app);
  font-weight: 600;
  font-size: 1.9rem;
  letter-spacing: 0.02em;
  color: var(--gold);
  margin: 0 0 var(--space-6);
  line-height: 1;
}
.title {
  font-family: var(--font-app);
  font-weight: 700;
  font-size: 1.9rem;
  color: var(--cream);
  margin: 0;
}
.subtitle {
  font-family: var(--font-app);
  color: var(--muted);
  font-size: 15px;
  margin-top: var(--space-2);
}

/* === FORMULAIRE === */
.auth-form { display: flex; flex-direction: column; }

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: var(--space-4);
}
.input-wrap .input {
  flex: 1;
  margin-bottom: 0;
  padding-right: 48px;
}
.eye-btn {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color var(--duration-normal);
}
.eye-btn:hover { color: var(--cream); }

.input {
  background-color: transparent;
  border: 1px solid var(--gold-border-md);
  color: var(--cream);
  padding: 17px 18px;
  border-radius: var(--radius-md);
  font-family: var(--font-app);
  font-size: 15px;
  margin-bottom: var(--space-4);
  transition: border-color var(--duration-normal), box-shadow var(--duration-normal);
}
.input::placeholder { color: var(--muted); }
.input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
}

.forgot {
  align-self: center;
  background: none;
  border: none;
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 14px;
  padding: var(--space-2) 0;
  margin-bottom: var(--space-5);
  cursor: pointer;
}
.forgot:hover { color: var(--cream); }

/* Gros bouton principal (pill blanc) */
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
.primary-pill:disabled { opacity: 0.6; cursor: not-allowed; }

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  margin: var(--space-5) 0;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--gold-border);
}
.divider span { padding: 0 var(--space-4); }

/* Bouton Google (pill sombre, contour doré) */
.google-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  padding: 16px;
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  background: var(--navy2);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--duration-fast), border-color var(--duration-normal);
}
.google-pill:active { transform: scale(0.98); }
.google-pill:hover { border-color: var(--gold); }
.google-pill:disabled { opacity: 0.6; }
.g-icon { width: 20px; height: 20px; }

.msg { font-family: var(--font-app); font-size: 13px; margin: 0 0 var(--space-4); text-align: center; }
.msg-error { color: var(--color-error); }

/* Lien inscription tout en bas */
.switch {
  display: block;
  margin: var(--space-10) auto 0;
  background: none;
  border: none;
  color: var(--cream);
  font-family: var(--font-app);
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}
.switch:hover { color: var(--gold); }
</style>
