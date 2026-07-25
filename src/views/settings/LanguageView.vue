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
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  IonButtons, IonBackButton
} from '@ionic/vue'
import { checkmark } from 'ionicons/icons'
import { usePreferencesStore } from '@/stores/preferences'

const { t } = useI18n()
const prefs = usePreferencesStore()

const options = computed(() => [
  { code: 'fr', label: t('settings.french') },
  { code: 'en', label: t('settings.english') }
])

function choose(code) {
  prefs.setLocalePref(code)
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
