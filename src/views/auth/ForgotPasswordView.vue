<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <img class="bg-photo" :src="bgImg" alt="" aria-hidden="true" />
      <div class="bg-overlay"></div>

      <button class="back-btn" @click="goLogin">
        <ion-icon :icon="chevronBack" />
        {{ t('common.back') }}
      </button>

      <div class="auth-wrap">
        <header class="auth-head">
          <h2 class="title">{{ t('auth.forgotTitle') }}</h2>
          <p class="subtitle">{{ t('auth.forgotIntro') }}</p>
        </header>

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

          <p v-if="errorMsg" class="msg msg-error">{{ errorMsg }}</p>

          <button type="submit" class="primary-pill" :disabled="loading || !email">
            {{ loading ? t('auth.sending') : t('auth.sendCode') }}
          </button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { chevronBack } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import bgImg from '@/assets/images/welcome-cross.jpg'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.sendResetOtp(email.value)
    // Anti-énumération : on avance toujours vers la saisie du code,
    // que l'email existe ou non (SECURITY.md §1).
    router.push({ path: '/auth/verify-otp', query: { email: email.value } })
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}

function goLogin() { router.replace('/auth/login') }
</script>

<style scoped>
.auth-content { --background: var(--navy); }

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

.back-btn {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  left: 8px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  color: var(--cream-70);
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 500;
  padding: 8px 12px;
  cursor: pointer;
}
.back-btn ion-icon { font-size: 20px; }

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

.auth-head { margin-bottom: var(--space-8); }
.title {
  font-family: var(--font-app);
  font-weight: 700;
  font-size: 2rem;
  color: var(--cream);
  margin: 0 0 var(--space-3);
  line-height: 1.15;
}
.subtitle {
  font-family: var(--font-app);
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
}

.auth-form { display: flex; flex-direction: column; }

.input {
  background-color: transparent;
  border: 1px solid var(--gold-border-md);
  color: var(--cream);
  padding: 17px 18px;
  border-radius: var(--radius-md);
  font-family: var(--font-app);
  font-size: 15px;
  margin-bottom: var(--space-5);
  transition: border-color var(--duration-normal), box-shadow var(--duration-normal);
}
.input::placeholder { color: var(--muted); }
.input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
}

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

.msg { font-family: var(--font-app); font-size: 13px; margin: 0 0 var(--space-4); text-align: center; }
.msg-error { color: var(--color-error); }
</style>
