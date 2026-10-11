<template>
  <ion-modal :is-open="open" @did-dismiss="close">
    <ion-page>
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="close">{{ t('common.cancel') }}</ion-button>
          </ion-buttons>
          <ion-title>{{ t('settings.reportBug') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content :fullscreen="true">
        <div class="wrap">
          <p class="intro">{{ t('settings.reportBugIntro') }}</p>

          <ion-textarea
            v-model="message"
            class="field"
            :auto-grow="false"
            :rows="8"
            :maxlength="2000"
            :disabled="sending"
            :placeholder="t('settings.reportBugPlaceholder')"
          />
          <p class="count">{{ message.length }} / 2000</p>

          <!-- Invité : on dit clairement qu'on ne pourra pas répondre, plutôt
               que de laisser croire à un échange possible. -->
          <p v-if="!auth.isAuthenticated" class="hint">
            {{ t('settings.reportBugGuestHint') }}
          </p>

          <button class="send" :disabled="!canSend" @click="submit">
            <ion-icon :icon="sending ? ellipsisHorizontal : sendOutline" />
            <span>{{ t('settings.reportBugSend') }}</span>
          </button>
        </div>
      </ion-content>
    </ion-page>
  </ion-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  IonModal, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonTextarea, IonIcon, toastController
} from '@ionic/vue'
import { sendOutline, ellipsisHorizontal } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { Capacitor } from '@capacitor/core'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

// Même source que l'affichage « Version » des Réglages.
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const auth = useAuthStore()

const message = ref('')
const sending = ref(false)

const canSend = computed(() => message.value.trim().length >= 5 && !sending.value)

function close() {
  if (sending.value) return // ne pas fermer pendant l'envoi
  emit('close')
}

async function submit() {
  if (!canSend.value) return
  sending.value = true
  try {
    // L'identité est RECOPIÉE dans la ligne (pas seulement référencée) : si le
    // compte est supprimé plus tard, on garde de quoi recouper le signalement.
    const { error } = await supabase.from('bug_reports').insert({
      user_id: auth.user?.id ?? null,
      display_name: auth.fullName || null,
      email: auth.user?.email ?? null,
      message: message.value.trim(),
      app_version: APP_VERSION,
      platform: Capacitor.getPlatform(),
      locale: locale.value
    })
    if (error) throw error

    message.value = ''
    emit('close')
    const ok = await toastController.create({
      message: t('settings.reportBugSent'),
      duration: 3000,
      position: 'bottom',
      color: 'success'
    })
    await ok.present()
  } catch (e) {
    console.error('[bug-report] envoi échoué', e)
    const ko = await toastController.create({
      message: t('settings.reportBugError'),
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    })
    await ko.present()
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; font-size: 16px; }
ion-content { --background: var(--navy); }

.wrap { padding: var(--space-4) var(--space-4) var(--space-8); }

.intro {
  font-family: var(--font-app);
  font-size: 14px;
  line-height: 1.6;
  color: var(--cream-70);
  margin: 0 0 var(--space-4);
}

.field {
  --background: var(--card-bg);
  --color: var(--cream);
  --placeholder-color: var(--muted);
  --padding-start: var(--space-3);
  --padding-end: var(--space-3);
  --padding-top: var(--space-3);
  --padding-bottom: var(--space-3);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  font-family: var(--font-app);
  font-size: 15px;
}

.count {
  font-family: var(--font-app);
  font-size: 12px;
  color: var(--muted);
  text-align: right;
  margin: var(--space-2) 0 0;
}

.hint {
  font-family: var(--font-app);
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted);
  margin: var(--space-3) 0 0;
}

.send {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-6);
  padding: 16px;
  background: var(--gold);
  border: none;
  border-radius: var(--radius-full);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity var(--duration-fast);
}
.send:disabled { opacity: 0.45; cursor: default; }
.send ion-icon { font-size: 19px; }
</style>
