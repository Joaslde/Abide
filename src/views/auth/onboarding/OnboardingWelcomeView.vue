<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ob-content">
      <img class="bg-photo" :src="bgImg" alt="" aria-hidden="true" />
      <div class="bg-overlay"></div>

      <div class="ob-wrap">
        <div class="ob-text">
          <fade-in-words
            class="greeting"
            tag="h1"
            :text="greetingText"
            :stagger="270"
          />
          <fade-in-words
            class="body"
            tag="p"
            :text="bodyText"
            :stagger="165"
            :start-delay="bodyStartDelay"
            @done="showButtons = true"
          />
        </div>

        <transition name="rise">
          <div v-if="showButtons" class="ob-actions">
            <button class="primary-pill" @click="startQuiz">
              {{ t('onboarding.startQuiz') }}
            </button>
            <button class="ghost-btn" @click="doLater">
              {{ t('onboarding.laterButton') }}
            </button>
            <button class="ghost-btn subtle" @click="skipOnboarding" :disabled="skipping">
              {{ t('onboarding.skipQuiz') }}
            </button>
          </div>
        </transition>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonPage, IonContent } from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import FadeInWords from '@/components/shared/FadeInWords.vue'
import bgImg from '@/assets/images/welcome-cross.jpg'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const showButtons = ref(false)
const skipping = ref(false)

const greetingText = computed(() =>
  auth.firstName
    ? t('onboarding.greeting', { name: auth.firstName })
    : t('onboarding.greetingNoName')
)
const bodyText = computed(() => t('onboarding.welcomeBody'))

// Le corps commence à apparaître une fois la salutation terminée.
const bodyStartDelay = computed(() => {
  const greetingWords = greetingText.value.split(/\s+/).filter(Boolean).length
  return greetingWords * 270 + 800
})

function startQuiz() {
  router.push('/onboarding/quiz')
}

/**
 * "Je le ferai plus tard" : on NE marque RIEN.
 * → au prochain démarrage de l'app, le guard reproposera l'onboarding.
 */
function doLater() {
  router.replace('/tabs/immersion')
}

/**
 * "Non merci…" : on met l'onboarding EN SOMMEIL 3 mois (onboarding_snooze_until).
 * Pendant ce délai, le quiz n'est plus reproposé ; passé 3 mois, il réapparaît
 * (on veut quand même que l'utilisateur le remplisse à un moment).
 */
async function skipOnboarding() {
  skipping.value = true
  try {
    const until = new Date()
    until.setMonth(until.getMonth() + 3)
    await auth.updateProfile({ onboarding_snooze_until: until.toISOString() })
  } catch (e) {
    console.error('skip onboarding:', e)
  } finally {
    router.replace('/tabs/immersion')
  }
}
</script>

<style scoped>
.ob-content { --background: var(--navy); }

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

.ob-wrap {
  position: relative;
  z-index: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: calc(env(safe-area-inset-top, 0px) + var(--space-12, 56px)) var(--space-6) var(--space-8);
  max-width: 540px;
  margin: 0 auto;
  background-image: radial-gradient(
    ellipse 80% 45% at 50% 18%,
    var(--gold-glow) 0%,
    transparent 70%
  );
}

.ob-text { flex: 0 0 auto; text-align: center; margin-top: var(--space-6); }

.greeting {
  font-family: var(--font-app);
  font-weight: 700;
  font-size: 2.9rem;
  line-height: 1.15;
  color: var(--gold);
  margin: 0 0 var(--space-8);
}
.body {
  font-family: var(--font-app);
  font-weight: 400;
  font-size: 1.5rem;
  line-height: 1.65;
  color: var(--cream);
}

/* Les boutons sont poussés en bas de l'écran. */
.ob-actions {
  margin-top: auto;
  padding-top: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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
  transition: transform var(--duration-fast);
}
.primary-pill:active { transform: scale(0.98); }

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
  transition: color var(--duration-normal);
}
.ghost-btn:hover { color: var(--cream); }
.ghost-btn:disabled { opacity: 0.5; }
.ghost-btn.subtle { color: var(--cream-50); font-size: 13px; }
.ghost-btn.subtle:hover { color: var(--cream-70); }

/* Apparition des boutons une fois le texte révélé */
.rise-enter-active { transition: opacity 0.7s ease, transform 0.7s ease; }
.rise-enter-from { opacity: 0; transform: translateY(16px); }
</style>
