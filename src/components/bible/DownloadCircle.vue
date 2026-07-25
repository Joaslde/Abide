<template>
  <div class="dl-wrap">
    <button
      class="dl-circle"
      :class="{ done: downloaded, busy: downloading }"
      :aria-label="label"
      :disabled="downloaded"
      @click="onClick"
    >
      <!-- Anneau de progression (SVG) pendant le téléchargement -->
      <svg v-if="downloading" class="ring" viewBox="0 0 64 64">
        <circle class="ring-bg" cx="32" cy="32" r="29" />
        <circle
          class="ring-fill"
          cx="32" cy="32" r="29"
          :stroke-dasharray="CIRCUMFERENCE"
          :stroke-dashoffset="CIRCUMFERENCE * (1 - percent / 100)"
        />
      </svg>

      <!-- Contenu central selon l'état -->
      <div class="inner">
        <template v-if="downloading">
          <span class="pct">{{ percent }}%</span>
        </template>
        <template v-else-if="downloaded">
          <ion-icon :icon="checkmarkOutline" class="check" />
        </template>
        <template v-else>
          <ion-icon :icon="downloadOutline" class="dl-icon" />
          <span v-if="sizeMo" class="size-num">{{ sizeMo }}</span>
          <span v-if="sizeMo" class="size-unit">Mo</span>
        </template>
      </div>
    </button>

    <!-- Libellé sous le cercle quand téléchargé -->
    <p v-if="downloaded" class="done-label">{{ t('bible.audio.downloaded') }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { IonIcon, toastController } from '@ionic/vue'
import { downloadOutline, checkmarkOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { Capacitor } from '@capacitor/core'
import { useAudioDownloadsStore } from '@/stores/audioDownloads'

const props = defineProps({
  versionId: { type: String, required: true },
  bookId: { type: String, required: true },
  bookName: { type: String, default: '' }
})

const { t } = useI18n()
const dl = useAudioDownloadsStore()

const CIRCUMFERENCE = 2 * Math.PI * 29

const estimatedBytes = ref(null)

const downloaded = computed(() => dl.isDownloaded(props.versionId, props.bookId))
const downloading = computed(() => dl.isDownloading(props.versionId, props.bookId))
const percent = computed(() => dl.progress?.percent ?? 0)

const sizeMo = computed(() => {
  if (!estimatedBytes.value) return null
  return Math.max(1, Math.round(estimatedBytes.value / 1e6))
})

const label = computed(() => {
  if (downloaded.value) return t('bible.audio.downloaded')
  if (downloading.value) return t('bible.audio.downloading')
  return t('bible.audio.download')
})

async function refreshEstimate() {
  if (downloaded.value) return
  estimatedBytes.value = await dl.estimateBookSize(props.versionId, props.bookId)
}

onMounted(async () => {
  await dl.load()
  refreshEstimate()
})
watch(() => [props.versionId, props.bookId], refreshEstimate)

async function toastMsg(message) {
  const tt = await toastController.create({ message, duration: 2200, position: 'bottom', color: 'dark' })
  await tt.present()
}

async function onClick() {
  // Déjà téléchargé (✓) ou en cours → non cliquable (le ✓ est informatif ;
  // la suppression se fait dans « Mes téléchargements »).
  if (downloading.value || downloaded.value) return

  // Téléchargement : natif uniquement (CORS CloudFront bloque le web).
  if (!Capacitor.isNativePlatform()) {
    await toastMsg(t('bible.audio.webOnly'))
    return
  }
  const ok = await dl.downloadBook(props.versionId, props.bookId, props.bookName)
  if (!ok) await toastMsg(t('bible.audio.downloadError'))
}
</script>

<style scoped>
.dl-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.dl-circle {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1.5px solid var(--gold-border-md);
  background: var(--card-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--duration-fast);
}
.dl-circle:active { border-color: var(--gold); }
.dl-circle.done { border-color: var(--gold); cursor: default; }
.dl-circle:disabled { cursor: default; }
.dl-circle.busy { border-color: transparent; }

/* Anneau SVG de progression */
.ring {
  position: absolute;
  inset: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  transform: rotate(-90deg);
}
.ring-bg {
  fill: none;
  stroke: var(--gold-border);
  stroke-width: 3;
}
.ring-fill {
  fill: none;
  stroke: var(--gold);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.4s ease;
}

.inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  gap: 1px;
}
.dl-icon { font-size: 18px; color: var(--gold); }
.size-num {
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 700;
  color: var(--cream);
}
.size-unit {
  font-family: var(--font-app);
  font-size: 9px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.pct {
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 700;
  color: var(--gold);
}
.check { font-size: 26px; color: var(--gold); }

.done-label {
  margin: 0;
  font-family: var(--font-app);
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  max-width: 180px;
}
</style>
