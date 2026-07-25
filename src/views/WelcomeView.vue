<template>
  <ion-page>
    <ion-content :fullscreen="true" :scroll-y="false" class="welcome-content">
      <div class="welcome">
        <!-- Image de fond (vraie photo) couvrant tout l'écran -->
        <img class="bg-photo" :src="welcomeImg" alt="" aria-hidden="true" />

        <!-- Overlay : transparent en haut → navy opaque en bas.
             Tous les éléments reposent sur la partie sombre du bas. -->
        <div class="overlay"></div>

        <!-- Bouton Skip (accès invité) -->
        <button class="skip-btn" @click="onSkip">{{ t('common.skip') }}</button>

        <!-- Contenu (ancré en bas sur la zone sombre) -->
        <div class="content">
          <div class="brand-block">
            <h1 class="brand">{{ t('common.appName') }}</h1>
            <p class="slogan">{{ t('welcome.slogan') }}</p>
            <p class="reference">{{ t('welcome.reference') }}</p>
          </div>

          <div class="actions">
            <button class="oauth-btn" :disabled="loading" @click="onGoogle">
              <svg class="g-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
              </svg>
              {{ t('welcome.continueGoogle') }}
            </button>

            <button class="email-btn" @click="onEmail">
              {{ t('welcome.continueEmail') }}
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
import { IonPage, IonContent } from '@ionic/vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useAuthStore } from '@/stores/auth'
import welcomeImg from '@/assets/images/welcome-cross.jpg'

const { t } = useI18n()
const router = useRouter()
const prefs = usePreferencesStore()
const auth = useAuthStore()
const loading = ref(false)

/** Accès invité : lecture Bible + audio uniquement, le reste demandera la connexion. */
async function onSkip() {
  await prefs.completeFirstLaunch()
  router.replace('/tabs/immersion')
}

async function onEmail() {
  await prefs.completeFirstLaunch()
  router.replace('/auth/login')
}

async function onGoogle() {
  loading.value = true
  try {
    await prefs.completeFirstLaunch()
    await auth.loginWithGoogle()
    // NATIF : session prête → on route (le guard décide onboarding vs accueil).
    if (auth.isAuthenticated) router.replace('/')
  } catch {
    // Provider Google pas encore configuré → on bascule sur l'email.
    router.replace('/auth/login')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* L'écran Welcome reste toujours sombre (c'est une image), même en thème clair. */
.welcome-content { --background: #0B1624; }

.welcome {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.bg-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Image poussée vers le haut : la croix (centre-haut) reste visible
     même quand le bas est masqué par l'overlay sombre. */
  object-position: center top;
}

/* Dégradé vertical : laisse voir l'image en haut, s'assombrit jusqu'au navy en bas */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(11, 22, 36, 0.10) 0%,
    rgba(11, 22, 36, 0.35) 38%,
    rgba(11, 22, 36, 0.80) 60%,
    rgba(11, 22, 36, 0.97) 78%,
    #0B1624 100%
  );
}

.skip-btn {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 14px);
  right: 16px;
  z-index: 2;
  background: rgba(11, 22, 36, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #F5F0E6;
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  backdrop-filter: blur(6px);
  cursor: pointer;
}

/* Contenu ancré en bas, sur la zone sombre */
.content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 0 var(--space-5) calc(env(safe-area-inset-bottom, 0px) + var(--space-8));
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.brand-block { text-align: center; animation: fadeUp 0.8s ease-out both; }
.brand {
  font-family: var(--font-app);
  font-weight: 600;
  font-size: 3rem;
  letter-spacing: 0.02em;
  color: #FFFFFF;
  margin: 0;
  line-height: 1;
}
.slogan {
  font-style: italic;
  color: rgba(245, 240, 230, 0.78);
  font-size: 1.05rem;
  margin: var(--space-3) auto 0;
  max-width: 320px;
  line-height: 1.5;
}
.reference {
  color: var(--gold);
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-top: var(--space-2);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  animation: fadeUp 0.8s ease-out 0.15s both;
}

.oauth-btn,
.email-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  padding: 16px;
  border-radius: var(--radius-full);
  font-family: var(--font-app);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--duration-fast);
}
.oauth-btn:active,
.email-btn:active { transform: scale(0.98); }

.oauth-btn { background: #FFFFFF; color: #1a1a1a; border: none; }
.oauth-btn:disabled { opacity: 0.6; }
.g-icon { width: 20px; height: 20px; }

.email-btn {
  background: rgba(255, 255, 255, 0.06);
  color: #F5F0E6;
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.email-btn:active { background: rgba(255, 255, 255, 0.12); }
</style>
