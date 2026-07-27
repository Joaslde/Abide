<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/settings" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('settings.language') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="wrap">
        <div class="group">
          <button
            v-for="opt in options"
            :key="opt.code"
            class="item tappable"
            @click="choose(opt.code)"
          >
            <span class="label">{{ opt.label }}</span>
            <ion-icon v-if="prefs.locale === opt.code" class="check" :icon="checkmark" />
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  IonButtons, IonBackButton, alertController
} from '@ionic/vue'
import { checkmark } from 'ionicons/icons'
import { usePreferencesStore } from '@/stores/preferences'

const { t } = useI18n()
const router = useRouter()
const prefs = usePreferencesStore()

const options = computed(() => [
  { code: 'fr', label: t('settings.french') },
  { code: 'en', label: t('settings.english') }
])

/**
 * Change la langue. Si aucune version de Bible dans cette langue n'est
 * installée (donc la lecture reste dans l'ancienne langue), on le PROPOSE
 * explicitement plutôt que de laisser la personne le découvrir seule dans
 * le lecteur — cf. lessons.md 2026-07-26.
 */
async function choose(code) {
  const { noBibleVersion } = await prefs.setLocalePref(code)
  if (noBibleVersion) await offerBibleDownload(code)
}

async function offerBibleDownload(code) {
  const alert = await alertController.create({
    header: t('settings.noBibleInLanguage.title'),
    message: t('settings.noBibleInLanguage.message'),
    buttons: [
      { text: t('common.cancel'), role: 'cancel' },
      {
        text: t('settings.noBibleInLanguage.download'),
        role: 'confirm',
        handler: () => router.push('/tabs/immersion/store')
      }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy); }
ion-title { font-family: var(--font-app); font-weight: 600; }
ion-content { --background: var(--navy); }

.wrap { padding: var(--space-4); }
.group {
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
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
  cursor: pointer;
}
.item + .item { border-top: 1px solid var(--gold-border); }
.item:active { background: var(--navy2); }
.label {
  font-family: var(--font-app);
  font-size: 15px;
  color: var(--cream);
}
.check { color: var(--gold); font-size: 20px; }
</style>
