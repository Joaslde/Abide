<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/settings" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('settings.bibleReading') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="wrap">

        <!-- Aperçu en direct -->
        <div class="preview" :style="{ fontSize: prefs.bibleFontSize + 'px' }">
          <p>{{ sampleVerse }}</p>
        </div>

        <!-- Taille -->
        <p class="group-label">{{ t('settings.bibleFontSize') }}</p>
        <div class="group">
          <div class="item">
            <div class="size-control">
              <button class="size-btn" @click="setSize(prefs.bibleFontSize - 2)" :disabled="prefs.bibleFontSize <= 16">−</button>
              <span class="size-val">{{ prefs.bibleFontSize }}</span>
              <button class="size-btn" @click="setSize(prefs.bibleFontSize + 2)" :disabled="prefs.bibleFontSize >= 24">+</button>
            </div>
          </div>
        </div>

        <!-- Police -->
        <p class="group-label">{{ t('settings.bibleFont') }}</p>
        <div class="group">
          <button
            v-for="f in prefs.BIBLE_FONTS"
            :key="f.id ?? 'default'"
            class="item tappable"
            @click="prefs.setBibleFont(f.id)"
          >
            <span class="label" :style="{ fontFamily: f.stack }">{{ f.label }}</span>
            <ion-icon v-if="prefs.bibleFont === f.id" class="check" :icon="checkmark" />
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

const { t, locale } = useI18n()
const prefs = usePreferencesStore()

const sampleVerse = computed(() =>
  locale.value === 'en'
    ? '“In the beginning was the Word, and the Word was with God, and the Word was God.” — John 1:1'
    : '« Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu. » — Jean 1:1'
)

function setSize(v) {
  prefs.setBibleFontSize(v)
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy); }
ion-title { font-family: var(--font-app); font-weight: 600; }
ion-content { --background: var(--navy); }

.wrap { padding: var(--space-4); }

.preview {
  background: var(--card-bg);
  border-left: 3px solid var(--gold);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  color: var(--cream);
  font-family: var(--font-bible);
  line-height: 1.85;
}
.preview p { margin: 0; }

.group-label {
  font-family: var(--font-app);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 var(--space-3) 4px;
}
.group {
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-4);
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
}
.item + .item { border-top: 1px solid var(--gold-border); }
.tappable { cursor: pointer; }
.tappable:active { background: var(--navy2); }
.label { font-size: 16px; color: var(--cream); }
.check { color: var(--gold); font-size: 20px; }

.size-control {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  width: 100%;
  justify-content: center;
}
.size-btn {
  width: 44px; height: 44px;
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-sm);
  background: var(--navy2);
  color: var(--gold);
  font-size: 22px;
  cursor: pointer;
}
.size-btn:disabled { opacity: 0.35; }
.size-val {
  font-family: var(--font-app);
  font-size: 17px;
  color: var(--cream);
  min-width: 36px;
  text-align: center;
}
</style>
