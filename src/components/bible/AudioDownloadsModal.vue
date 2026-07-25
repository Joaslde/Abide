<template>
  <!-- Store des téléchargements audio : livres offline, poids, suppression. -->
  <ion-modal
    :is-open="audio.showDownloads"
    :initial-breakpoint="0.6"
    :breakpoints="[0, 0.6, 0.9]"
    @did-dismiss="audio.showDownloads = false"
  >
    <div class="dl-sheet">
      <div class="sheet-handle" />
      <h2 class="sheet-title">{{ t('bible.audio.myDownloads') }}</h2>

      <!-- Total utilisé -->
      <p v-if="dl.downloads.length" class="total">
        {{ t('bible.audio.totalUsed', { count: dl.downloads.length, size: fmtSize(dl.totalSizeBytes) }) }}
      </p>

      <!-- Liste des livres téléchargés -->
      <ul v-if="dl.downloads.length" class="dl-list">
        <li v-for="d in dl.downloads" :key="`${d.versionId}:${d.bookId}`" class="dl-item">
          <div class="dl-info">
            <span class="dl-book">{{ d.bookName || d.bookId }}</span>
            <span class="dl-meta">{{ versionLabel(d.versionId) }} · {{ d.chapters }} ch. · {{ fmtSize(d.sizeBytes) }}</span>
          </div>
          <button class="del-btn" :aria-label="t('bible.audio.deleteDownload')" @click="confirmDelete(d)">
            <ion-icon :icon="trashOutline" />
          </button>
        </li>
      </ul>

      <!-- Vide -->
      <p v-else class="empty">{{ t('bible.audio.noDownloads') }}</p>
    </div>
  </ion-modal>
</template>

<script setup>
import { onMounted } from 'vue'
import { IonModal, IonIcon, alertController, toastController } from '@ionic/vue'
import { trashOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useAudioStore } from '@/stores/audio'
import { useAudioDownloadsStore } from '@/stores/audioDownloads'

const { t } = useI18n()
const audio = useAudioStore()
const dl = useAudioDownloadsStore()

onMounted(() => dl.load())

function fmtSize(bytes) {
  if (!bytes) return '0 Mo'
  return `${(bytes / 1e6).toFixed(1)} Mo`
}

function versionLabel(versionId) {
  return versionId === 'LSG1910' ? 'LSG' : versionId
}

async function confirmDelete(d) {
  const alert = await alertController.create({
    header: d.bookName || d.bookId,
    message: t('bible.audio.deleteConfirm'),
    buttons: [
      { text: t('common.cancel'), role: 'cancel' },
      {
        text: t('bible.audio.deleteDownload'),
        role: 'destructive',
        handler: async () => {
          await dl.deleteBook(d.versionId, d.bookId)
          const tt = await toastController.create({
            message: t('bible.audio.deleted'),
            duration: 1800,
            position: 'bottom',
            color: 'dark'
          })
          await tt.present()
        }
      }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
.dl-sheet {
  background: var(--navy2);
  padding: 0 var(--space-5) calc(env(safe-area-inset-bottom, 0px) + var(--space-6));
  height: 100%;
  overflow-y: auto;
}
.sheet-handle {
  width: 38px;
  height: 4px;
  background: var(--gold-border-md);
  border-radius: var(--radius-full);
  margin: 10px auto var(--space-4);
}
.sheet-title {
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  text-align: center;
  margin: 0 0 var(--space-3);
}
.total {
  font-family: var(--font-app);
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  margin: 0 0 var(--space-4);
}

.dl-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.dl-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
}
.dl-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.dl-book {
  font-family: var(--font-app);
  font-size: 14px;
  font-weight: 600;
  color: var(--cream);
}
.dl-meta {
  font-family: var(--font-app);
  font-size: 11px;
  color: var(--muted);
}
.del-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 19px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.del-btn:active { color: var(--gold); background: var(--navy); }

.empty {
  font-family: var(--font-app);
  font-size: 13px;
  color: var(--muted);
  text-align: center;
  padding: var(--space-8) var(--space-4);
  line-height: 1.6;
}
</style>
