<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <img class="bg-photo" :src="bgImg" alt="" aria-hidden="true" />
      <div class="bg-overlay"></div>

      <div class="auth-wrap">
        <header class="auth-head">
          <h2 class="title">{{ t('auth.newPasswordTitle') }}</h2>
          <p class="subtitle">{{ t('auth.newPasswordIntro') }}</p>
        </header>

        <form class="auth-form" @submit.prevent="onSubmit">
          <div class="input-wrap">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              class="input"
              :placeholder="t('auth.newPassword')"
              required
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Masquer' : 'Afficher'">
              <ion-icon :icon="showPassword ? eyeOff : eye" />
            </button>
          </div>

          <div class="input-wrap">
            <input
              v-model="confirm"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              class="input"
              :placeholder="t('auth.confirmPassword')"
              required
            />
            <button type="button" class="eye-btn" @click="showConfirm = !showConfirm" :aria-label="showConfirm ? 'Masquer' : 'Afficher'">
              <ion-icon :icon="showConfirm ? eyeOff : eye" />
            </button>
          </div>

          <!-- Indice de validation en direct (non bloquant tant qu'on tape) -->
          <p v-if="hint" class="msg" :class="hint.ok ? 'msg-ok' : 'msg-hint'">{{ hint.text }}</p>
          <!-- Erreur serveur (ex : Supabase refuse un mot de passe identique à l'ancien) -->
          <p v-if="errorMsg" class="msg msg-error">{{ errorMsg }}</p>

          <button type="submit" class="primary-pill" :disabled="loading || !canSubmit">
            {{ loading ? t('common.loading') : t('common.save') }}
          </button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { eye, eyeOff } from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import bgImg from '@/assets/images/welcome-cross.jpg'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const password = ref('')
const confirm = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const errorMsg = ref('')

// Le bouton est actif dès que les deux champs sont valides ET identiques.
const canSubmit = computed(() =>
  password.value.length >= 8 &&
  confirm.value.length >= 8 &&
  password.value === confirm.value
)

/**
 * Retour visuel en direct, non bloquant :
 * - rien tant que les deux champs ne sont pas commencés
 * - "trop court" si < 8
 * - "ne correspondent pas" si divergents
 * - "✓ correspondent" si tout est bon
 */
const hint = computed(() => {
  if (!password.value || !confirm.value) return null
  if (password.value.length < 8) {
    return { ok: false, text: t('auth.errors.passwordTooShort') }
  }
  if (password.value !== confirm.value) {
    return { ok: false, text: t('auth.errors.passwordMismatch') }
  }
  return { ok: true, text: t('auth.passwordsMatch') }
})

// Dès que l'utilisateur modifie un champ, on efface l'erreur serveur précédente
// (sinon un ancien message "identique à l'ancien" reste affiché à tort).
watch([password, confirm], () => { errorMsg.value = '' })

// Sécurité : on ne peut changer le mot de passe que si l'OTP a créé une session.
onMounted(() => {
  if (!auth.isAuthenticated) router.replace('/auth/login')
})

async function onSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.updatePassword(password.value)
    // Mot de passe changé, session déjà active → on entre dans l'app.
    router.replace(auth.shouldOnboard ? '/onboarding' : '/tabs/immersion')
  } catch (e) {
    // Supabase rejette un mot de passe identique au précédent → message clair.
    const msg = (e.message || '').toLowerCase()
    if (msg.includes('different from the old') || msg.includes('should be different')) {
      errorMsg.value = t('auth.errors.passwordSameAsOld')
    } else {
      errorMsg.value = e.message
    }
  } finally {
    loading.value = false
  }
}
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

.primary-pill {
  width: 100%;
  margin-top: var(--space-2);
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
.msg-hint { color: var(--muted); }
.msg-ok { color: var(--color-success); }
</style>
