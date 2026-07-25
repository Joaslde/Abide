<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>{{ t('plus.title') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="go('/settings')" :aria-label="t('settings.title')">
            <ion-icon slot="icon-only" :icon="settingsOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Sanctuaire : prière + jeûne (accès permanent). -->
      <section class="block">
        <p class="block-label">{{ t('sanctuaire.title') }}</p>
        <div class="grid">
          <button class="card" @click="go('/tabs/sanctuaire')">
            <ion-icon :icon="heartOutline" />
            <span>{{ t('sanctuaire.title') }}</span>
          </button>
          <button class="card" @click="go('/tabs/sanctuaire/journal')">
            <ion-icon :icon="bookOutline" />
            <span>{{ t('sanctuaire.journal.title') }}</span>
          </button>
          <button class="card" @click="go('/tabs/sanctuaire/fasting')">
            <ion-icon :icon="flameOutline" />
            <span>{{ t('sanctuaire.fasting.title') }}</span>
          </button>
        </div>
      </section>

      <section class="block">
        <p class="block-label">{{ t('plus.myNotes') }}</p>
        <div class="grid">
          <button class="card" @click="go('/tabs/plus/notes')">
            <ion-icon :icon="createOutline" />
            <span>{{ t('plus.notes') }}</span>
          </button>
          <button class="card" @click="go('/tabs/plus/bookmarks')">
            <ion-icon :icon="bookmarkOutline" />
            <span>{{ t('plus.bookmarks') }}</span>
          </button>
          <button class="card" @click="go('/tabs/plus/highlights')">
            <ion-icon :icon="colorWandOutline" />
            <span>{{ t('plus.highlights') }}</span>
          </button>
        </div>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  IonButtons, IonButton
} from '@ionic/vue'
import {
  createOutline, bookmarkOutline, colorWandOutline,
  heartOutline, bookOutline, flameOutline, settingsOutline
} from 'ionicons/icons'

const { t } = useI18n()
const router = useRouter()

function go(path) {
  router.push(path)
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; }

.block { padding: var(--space-4) var(--space-4) var(--space-2); }
.block-label {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 var(--space-3);
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  aspect-ratio: 1;
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 13px;
  cursor: pointer;
  transition: border-color var(--duration-fast);
}
.card:active { border-color: var(--gold); }
.card ion-icon { font-size: 26px; color: var(--gold); }
</style>
