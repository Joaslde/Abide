<template>
  <ion-modal
    :is-open="open"
    class="share-sheet"
    :initial-breakpoint="1"
    :breakpoints="[0, 1]"
    @did-dismiss="close"
  >
    <div class="sheet">
      <div class="handle" aria-hidden="true"></div>

      <h2 class="sheet-title">{{ t('home.share.title') }}</h2>

      <!-- Aperçu RÉEL de l'image générée : la personne voit exactement ce
           qu'elle s'apprête à publier, avant de choisir où l'envoyer. -->
      <div class="preview-wrap">
        <div v-if="building" class="preview-loading">
          <ion-spinner name="crescent" />
          <p>{{ t('home.share.building') }}</p>
        </div>
        <img v-else-if="previewSrc" class="preview" :src="previewSrc" :alt="reference" />
        <p v-else class="preview-error">{{ t('home.share.error') }}</p>
      </div>

      <div class="actions">
        <button class="act act-primary" :disabled="!previewSrc || busy" @click="onShare">
          <ion-icon :icon="shareSocialOutline" />
          <span>{{ t('home.share.shareTo') }}</span>
        </button>

        <button class="act" :disabled="!previewSrc || busy" @click="onDownload">
          <ion-icon :icon="downloadOutline" />
          <span>{{ t('home.share.download') }}</span>
        </button>
      </div>

      <!-- Pourquoi une seule entrée « Partager » plutôt que des boutons
           WhatsApp / Instagram / Facebook séparés : aucune de ces apps
           n'accepte qu'on lui impose une image depuis l'extérieur. La feuille
           du système les liste toutes et respecte les apps réellement
           installées — c'est aussi ce que fait YouVersion. -->
      <p class="hint">{{ t('home.share.hint') }}</p>

      <button class="cancel" @click="close">{{ t('common.cancel') }}</button>
    </div>
  </ion-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { IonModal, IonIcon, IonSpinner, toastController } from '@ionic/vue'
import { shareSocialOutline, downloadOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { buildVerseImage } from '@/lib/verse-image'
import { shareVerseImage, downloadVerseImage, canShare } from '@/lib/verse-share'

const props = defineProps({
  open: { type: Boolean, default: false },
  text: { type: String, default: '' },
  reference: { type: String, default: '' },
  background: { type: String, default: '' }
})
const emit = defineEmits(['close'])

const { t } = useI18n()

const building = ref(false)
const busy = ref(false)
const base64 = ref('')
const previewSrc = ref('')

/**
 * Génère l'image à L'OUVERTURE de la feuille, pas au montage : inutile de
 * dessiner un canvas 1080×1350 tant que personne ne demande à partager.
 * Le résultat est mémorisé tant que la feuille reste ouverte.
 */
watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    if (base64.value) return // déjà générée pour ce verset

    building.value = true
    try {
      base64.value = await buildVerseImage({
        text: props.text,
        reference: props.reference,
        background: props.background,
        appName: t('imageSignature.appName'),
        storeLine: t('imageSignature.store')
      })
      previewSrc.value = `data:image/png;base64,${base64.value}`
    } catch (e) {
      console.error('[share] génération de l’image impossible', e)
      previewSrc.value = ''
    } finally {
      building.value = false
    }
  }
)

async function toast(message) {
  const el = await toastController.create({ message, duration: 2200, position: 'bottom' })
  await el.present()
}

async function onShare() {
  if (!base64.value || busy.value) return
  busy.value = true
  try {
    const res = await shareVerseImage({
      base64: base64.value,
      reference: props.reference,
      text: props.text
    })
    if (res === 'shared') close()
    else if (res === 'unavailable') await toast(t('home.share.unavailable'))
    // 'cancelled' : la personne a fermé la feuille, on ne dit rien.
  } catch (e) {
    console.error('[share] partage impossible', e)
    await toast(t('home.share.error'))
  } finally {
    busy.value = false
  }
}

async function onDownload() {
  if (!base64.value || busy.value) return
  busy.value = true
  try {
    await downloadVerseImage({ base64: base64.value, reference: props.reference })
    await toast(t('home.share.downloaded'))
  } catch (e) {
    console.error('[share] téléchargement impossible', e)
    await toast(t('home.share.error'))
  } finally {
    busy.value = false
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.sheet {
  background: var(--navy2);
  padding: var(--space-3) var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.handle {
  width: 38px;
  height: 4px;
  background: var(--gold-border-md);
  border-radius: var(--radius-full);
}

.sheet-title {
  font-family: var(--font-app);
  font-size: 17px;
  font-weight: 700;
  color: var(--cream);
  margin: var(--space-2) 0 0;
}

/* Aperçu au ratio 4:5 de l'image finale : ce qu'on voit est ce qu'on partage. */
.preview-wrap {
  width: min(58vw, 240px);
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--gold-border);
  background: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview { width: 100%; height: 100%; object-fit: cover; display: block; }

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}
.preview-loading ion-spinner { --color: var(--gold); }
.preview-loading p,
.preview-error {
  font-family: var(--font-app);
  font-size: 12px;
  color: var(--muted);
  margin: 0;
  text-align: center;
  padding: 0 var(--space-3);
}

.actions {
  display: flex;
  gap: var(--space-2);
  width: 100%;
  max-width: 340px;
}

.act {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: var(--space-3) var(--space-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--gold-border-md);
  background: var(--card-bg);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--duration-fast, 140ms) ease, opacity 160ms ease;
}
.act ion-icon { font-size: 22px; color: var(--gold); }
.act:active { transform: scale(0.97); }
.act:disabled { opacity: 0.45; pointer-events: none; }

.act-primary {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--navy);
}
.act-primary ion-icon { color: var(--navy); }

.hint {
  font-family: var(--font-app);
  font-size: 11px;
  line-height: 1.45;
  color: var(--muted);
  text-align: center;
  margin: 0;
  max-width: 300px;
}

.cancel {
  background: none;
  border: none;
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 14px;
  padding: var(--space-2);
  cursor: pointer;
}
</style>
