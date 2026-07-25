<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <img class="bg-photo" :src="bgImg" alt="" aria-hidden="true" />
      <div class="bg-overlay"></div>

      <button class="back-btn" @click="goBack">
        <ion-icon :icon="chevronBack" />
        {{ t('common.back') }}
      </button>

      <div class="auth-wrap">
        <header class="auth-head">
          <h2 class="title">{{ t('auth.verifyTitle') }}</h2>
          <p class="subtitle">{{ t('auth.verifyIntro', { email }) }}</p>
        </header>

        <form class="auth-form" @submit.prevent="onVerify">
          <div class="otp-row" @paste="onPaste">
            <input
              v-for="(d, i) in digits"
              :key="i"
              ref="boxes"
              v-model="digits[i]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="otp-box"
              :class="{ filled: digits[i] }"
              @input="onInput(i, $event)"
              @keydown.delete="onDelete(i, $event)"
            />
          </div>

          <button type="button" class="resend" :disabled="resendIn > 0 || loading" @click="onResend">
            {{ resendIn > 0 ? t('auth.resendIn', { s: resendIn }) : t('auth.resendCode') }}
          </button>

          <p v-if="errorMsg" class="msg msg-error">{{ errorMsg }}</p>

          <button type="submit" class="primary-pill" :disabled="loading || !isComplete">
            {{ loading ? t('auth.verifying') : t('auth.verify') }}
          </button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { chevronBack } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import bgImg from '@/assets/images/welcome-cross.jpg'

const OTP_LENGTH = 8
const RESEND_DELAY = 60

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const email = route.query.email || ''
const digits = ref(Array(OTP_LENGTH).fill(''))
const boxes = ref([])
const loading = ref(false)
const errorMsg = ref('')
const resendIn = ref(RESEND_DELAY)
let timer = null

const code = computed(() => digits.value.join(''))
const isComplete = computed(() => code.value.length === OTP_LENGTH)

// Sécurité : sans email en query, on ne peut rien vérifier → retour début.
onMounted(() => {
  if (!email) {
    router.replace('/auth/forgot')
    return
  }
  startResendTimer()
  nextTick(() => boxes.value[0]?.focus())
})

onUnmounted(() => clearInterval(timer))

function startResendTimer() {
  resendIn.value = RESEND_DELAY
  clearInterval(timer)
  timer = setInterval(() => {
    if (resendIn.value > 0) resendIn.value--
    else clearInterval(timer)
  }, 1000)
}

/** N'accepte qu'un chiffre, puis avance au champ suivant. */
function onInput(i, e) {
  const v = e.target.value.replace(/\D/g, '')
  digits.value[i] = v.slice(-1)
  if (digits.value[i] && i < OTP_LENGTH - 1) {
    boxes.value[i + 1]?.focus()
  }
}

/** Backspace sur une case vide → revenir à la précédente. */
function onDelete(i, e) {
  if (!digits.value[i] && i > 0) {
    boxes.value[i - 1]?.focus()
    e.preventDefault()
  }
}

/** Collage du code complet (ex : depuis l'email). */
function onPaste(e) {
  e.preventDefault()
  const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH)
  if (!pasted) return
  for (let i = 0; i < OTP_LENGTH; i++) digits.value[i] = pasted[i] || ''
  const next = Math.min(pasted.length, OTP_LENGTH - 1)
  nextTick(() => boxes.value[next]?.focus())
}

async function onVerify() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.verifyResetOtp(email, code.value)
    // OTP validé → session active → on peut définir le nouveau mot de passe.
    router.replace('/auth/reset')
  } catch (e) {
    errorMsg.value = e.code ? t(`auth.errors.${e.code}`) : e.message
    digits.value = Array(OTP_LENGTH).fill('')
    nextTick(() => boxes.value[0]?.focus())
  } finally {
    loading.value = false
  }
}

async function onResend() {
  errorMsg.value = ''
  try {
    await auth.sendResetOtp(email)
    startResendTimer()
  } catch (e) {
    errorMsg.value = e.message
  }
}

function goBack() { router.replace('/auth/forgot') }
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

/* === Cases OTP === */
.otp-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.otp-box {
  flex: 1;
  aspect-ratio: 1 / 1;
  min-width: 0;
  text-align: center;
  background-color: var(--navy2);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 24px;
  font-weight: 600;
  transition: border-color var(--duration-normal), box-shadow var(--duration-normal);
}
.otp-box.filled { border-color: var(--gold); }
.otp-box:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
}

.resend {
  align-self: center;
  background: none;
  border: none;
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 14px;
  font-weight: 600;
  padding: var(--space-2);
  margin-bottom: var(--space-5);
  cursor: pointer;
}
.resend:disabled { color: var(--muted); cursor: default; }

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
