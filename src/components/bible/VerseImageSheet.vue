<template>
  <ion-modal
    :is-open="open"
    class="verse-image-sheet"
    :initial-breakpoint="1"
    :breakpoints="[0, 1]"
    @did-dismiss="close"
  >
    <div class="sheet">
      <div class="handle" aria-hidden="true"></div>

      <header class="sheet-head">
        <h2 class="sheet-title">{{ t('bible.shareImage.title') }}</h2>
        <span class="sheet-ref">{{ reference }}</span>
      </header>

      <!-- Aperçu RÉEL de l'image générée : ce qu'on voit est ce qu'on partage. -->
      <div class="preview-wrap">
        <div v-if="building" class="preview-state">
          <ion-spinner name="crescent" />
        </div>
        <img v-else-if="previewSrc" class="preview" :src="previewSrc" :alt="reference" />
        <p v-else class="preview-state error">{{ t('bible.shareImage.error') }}</p>
      </div>

      <!-- Choix du fond : bandeau horizontal, tous les paysages bundlés.
           Le fond sélectionné est régénéré à la volée dans l'aperçu. -->
      <div class="bg-strip" role="radiogroup" :aria-label="t('bible.shareImage.chooseBackground')">
        <button
          v-for="(bg, i) in backgrounds"
          :key="bg"
          class="bg-thumb"
          :class="{ active: i === bgIndex }"
          role="radio"
          :aria-checked="i === bgIndex"
          :aria-label="`${t('bible.shareImage.background')} ${i + 1}`"
          @click="selectBackground(i)"
        >
          <img :src="bg" alt="" loading="lazy" />
        </button>
      </div>

      <div class="actions">
        <button class="act act-primary" :disabled="!base64 || busy" @click="onShare">
          <ion-icon :icon="shareSocialOutline" />
          <span>{{ t('bible.shareImage.share') }}</span>
        </button>
        <button class="act" :disabled="!base64 || busy" @click="onDownload">
          <ion-icon :icon="downloadOutline" />
          <span>{{ t('bible.shareImage.download') }}</span>
        </button>
      </div>

      <button class="cancel" @click="close">{{ t('common.cancel') }}</button>
    </div>
  </ion-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { IonModal, IonIcon, IonSpinner, toastController } from '@ionic/vue'
import { shareSocialOutline, downloadOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { buildVerseImage } from '@/lib/verse-image'
import { shareVerseImage, downloadVerseImage } from '@/lib/verse-share'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** Texte déjà assemblé (cf. buildImageText) */
  text: { type: String, default: '' },
  reference: { type: String, default: '' }
})
const emit = defineEmits(['close'])

const { t } = useI18n()

/**
 * Paysages bundlés par Vite — donc disponibles 100 % HORS LIGNE, comme pour la
 * carte du verset du jour. Même glob, même tri stable.
 */
const backgrounds = Object.entries(
  import.meta.glob('../../assets/backgrounds/*.webp', { eager: true, as: 'url' })
)
  .sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([, url]) => url)

/**
 * Intitulé affiché en haut de l'image : le nom du livre, en capitales.
 * Extrait de la référence (« Jean 3:16 » → « JEAN ») plutôt que passé en prop,
 * pour que l'appelant n'ait qu'une seule information à fournir.
 */
const bookLabel = computed(() => {
  const ref = props.reference ?? ''
  // Retire le dernier segment « chapitre:verset(s) » : ce qui reste est le livre.
  const book = ref.replace(/\s+\d+\s*:\s*[\d-]+\s*$/, '').trim()
  return (book || ref).toUpperCase()
})

const bgIndex = ref(0)
const building = ref(false)
const busy = ref(false)
const base64 = ref('')
const previewSrc = ref('')

/** (Re)génère l'aperçu pour le fond courant. */
async function regenerate() {
  if (!props.text) return
  building.value = true
  try {
    base64.value = await buildVerseImage({
      text: props.text,
      reference: props.reference,
      background: backgrounds[bgIndex.value],
      // Pas « VERSET DU JOUR » ici : la personne partage un passage qu'elle a
      // choisi elle-même. On reprend le nom du livre, en capitales pour tenir
      // le rôle d'intitulé (« JEAN », « PSAUMES »…).
      label: bookLabel.value,
      appName: t('imageSignature.appName'),
      storeLine: t('imageSignature.store')
    })
    previewSrc.value = `data:image/png;base64,${base64.value}`
  } catch (e) {
    console.error('[share] génération de l’image impossible', e)
    base64.value = ''
    previewSrc.value = ''
  } finally {
    building.value = false
  }
}

function selectBackground(i) {
  if (i === bgIndex.value || building.value) return
  bgIndex.value = i
  regenerate()
}

// À l'ouverture : fond aléatoire (l'image ne se répète pas d'un partage à
// l'autre) puis génération. Fermé → on libère l'aperçu, ces PNG pèsent ~2 Mo.
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      bgIndex.value = Math.floor(Math.random() * backgrounds.length)
      regenerate()
    } else {
      base64.value = ''
      previewSrc.value = ''
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
    else if (res === 'unavailable') await toast(t('bible.shareImage.unavailable'))
    // 'cancelled' : la personne a fermé la feuille système, on ne dit rien.
  } catch (e) {
    console.error('[share] partage impossible', e)
    await toast(t('bible.shareImage.error'))
  } finally {
    busy.value = false
  }
}

async function onDownload() {
  if (!base64.value || busy.value) return
  busy.value = true
  try {
    await downloadVerseImage({ base64: base64.value, reference: props.reference })
    await toast(t('bible.shareImage.downloaded'))
  } catch (e) {
    console.error('[share] téléchargement impossible', e)
    await toast(t('bible.shareImage.error'))
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

.sheet-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: var(--space-2);
}
.sheet-title {
  font-family: var(--font-app);
  font-size: 17px;
  font-weight: 700;
  color: var(--cream);
  margin: 0;
}
.sheet-ref {
  font-family: var(--font-app);
  font-size: 12px;
  color: var(--gold);
}

/* Aperçu au ratio 4:5 de l'image finale. */
.preview-wrap {
  width: min(52vw, 210px);
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

.preview-state {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-app);
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  padding: 0 var(--space-3);
  margin: 0;
}
.preview-state ion-spinner { --color: var(--gold); }

/* Bandeau de fonds : défilement horizontal, pas de retour à la ligne. */
.bg-strip {
  display: flex;
  gap: var(--space-2);
  width: 100%;
  overflow-x: auto;
  padding: 2px var(--space-1) var(--space-1);
  /* Masque la barre de défilement (le geste reste naturel sur mobile). */
  scrollbar-width: none;
}
.bg-strip::-webkit-scrollbar { display: none; }

.bg-thumb {
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  padding: 0;
  border-radius: var(--radius-sm, 10px);
  overflow: hidden;
  border: 2px solid transparent;
  background: none;
  cursor: pointer;
  transition: border-color 160ms ease, transform var(--duration-fast, 140ms) ease;
}
.bg-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bg-thumb.active { border-color: var(--gold); }
.bg-thumb:active { transform: scale(0.94); }

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
