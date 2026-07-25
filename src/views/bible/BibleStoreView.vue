<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/immersion" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('bible.store.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="store">
        <p class="intro">{{ t('bible.store.intro') }}</p>

        <!-- Erreur de chargement du manifeste (réseau ou pas d'URL) -->
        <div v-if="store.manifestError && store.catalog.length <= 1" class="state-msg">
          {{ t('bible.store.offline') }}
        </div>

        <ul class="ver-list">
          <li v-for="v in store.catalog" :key="v.id" class="ver-card">
            <div class="ver-info">
              <span class="ver-name">{{ v.name }}</span>
              <span class="ver-sub">
                {{ v.language?.toUpperCase() }}
                <template v-if="v.bundled"> · {{ t('bible.store.bundled') }}</template>
                <template v-else-if="v.size"> · {{ mb(v.size) }} Mo</template>
              </span>
            </div>

            <!-- Version installée → bouton Sélectionner (ou badge Active) -->
            <template v-if="v.installed">
              <span v-if="v.id === activeVersion" class="badge-active">
                <ion-icon :icon="checkmark" /> {{ t('bible.store.active') }}
              </span>
              <button v-else class="btn select" @click="select(v.id)">
                {{ t('bible.store.select') }}
              </button>
            </template>

            <!-- Téléchargement en cours -->
            <span v-else-if="store.isDownloading(v.id)" class="downloading">
              <ion-spinner name="crescent" />
            </span>

            <!-- Téléchargeable -->
            <button v-else class="btn download" @click="download(v.id)">
              <ion-icon :icon="downloadOutline" />
              {{ t('bible.store.download') }}
            </button>
          </li>
        </ul>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonIcon, IonSpinner, toastController
} from '@ionic/vue'
import { checkmark, downloadOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useBibleVersionsStore } from '@/stores/bibleVersions'
import { useBibleStore } from '@/stores/bible'

const { t } = useI18n()
const store = useBibleVersionsStore()
const bible = useBibleStore()

const activeVersion = computed(() => bible.activeVersion)

function mb(bytes) {
  return (bytes / 1e6).toFixed(1)
}

async function toast(message, color = 'dark') {
  const tt = await toastController.create({ message, duration: 2000, position: 'bottom', color })
  await tt.present()
}

onMounted(async () => {
  await store.loadInstalled()
  await store.fetchManifest()
})

async function download(id) {
  try {
    await toast(t('bible.store.downloading'))
    await store.download(id)
    await toast(t('bible.store.downloaded'), 'success')
  } catch {
    await toast(t('bible.store.downloadError'), 'danger')
  }
}

async function select(id) {
  try {
    await bible.setVersion(id)
    await toast(t('bible.store.switched'), 'success')
  } catch {
    await toast(t('bible.store.switchError'), 'danger')
  }
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; font-size: 16px; }
ion-content { --background: var(--navy); }

.store { padding: var(--space-4) var(--space-5) var(--space-8); }
.intro {
  font-family: var(--font-app);
  font-size: 14px;
  color: var(--muted);
  margin: 0 0 var(--space-5);
  line-height: 1.5;
}
.state-msg {
  text-align: center;
  color: var(--muted);
  padding: var(--space-8) 0;
  font-family: var(--font-app);
}

.ver-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-3); }
.ver-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
}
.ver-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ver-name { font-family: var(--font-app); font-size: 16px; color: var(--cream); }
.ver-sub { font-size: 11px; letter-spacing: 0.06em; color: var(--muted); text-transform: uppercase; }

.btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 16px;
  border-radius: var(--radius-full);
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: transform var(--duration-fast);
}
.btn:active { transform: scale(0.96); }
.btn ion-icon { font-size: 16px; }
.btn.download { background: var(--gold); color: var(--navy); border: none; }
.btn.select { background: none; border: 1px solid var(--gold-border-md); color: var(--gold); }

.badge-active {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  color: var(--gold);
}
.badge-active ion-icon { font-size: 16px; }

.downloading { display: flex; align-items: center; }
.downloading ion-spinner { color: var(--gold); width: 24px; height: 24px; }
</style>
