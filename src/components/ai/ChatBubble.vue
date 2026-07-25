<template>
  <div class="bubble-wrap" :class="isUser ? 'user' : 'ai'">
    <div class="bubble-row">
      <div
        class="bubble"
        :class="{ selectable: selecting }"
        @touchstart.passive="onTouchStart"
        @touchend="onTouchEnd"
        @touchmove.passive="onTouchMove"
        @contextmenu.prevent
      >
        <!-- Mode édition (messages utilisateur uniquement, via appui long). -->
        <div v-if="editing" class="edit-box">
          <ion-textarea
            v-model="editText"
            class="edit-input"
            :auto-grow="true"
            :rows="2"
            :maxlength="2000"
          />
          <div class="edit-actions">
            <button class="edit-btn cancel" @click="cancelEdit">{{ t('common.cancel') }}</button>
            <button class="edit-btn confirm" :disabled="!editText.trim()" @click="confirmEdit">
              {{ t('ai.resend') }}
            </button>
          </div>
        </div>

        <template v-else>
          <!-- Réponse IA : Markdown rendu + références cliquables dans le texte.
               Message utilisateur : texte brut (pas de rendu, pas d'injection). -->
          <markdown-message
            v-if="!isUser"
            :content="message.content"
            @openRef="onInlineRef"
          />
          <p v-else class="content">{{ message.content }}</p>

          <!-- Versets cités par le RAG (réponses IA uniquement). -->
          <div v-if="!isUser && refs.length" class="sources">
            <span class="sources-label">{{ t('ai.sources') }}</span>
            <button
              v-for="(r, i) in refs"
              :key="i"
              class="source-chip"
              @click="$emit('openRef', r)"
            >
              {{ r.label || r.ref }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Actions VISIBLES : uniquement sous les réponses de l'IA.
         (Sous les messages utilisateur elles rognaient la largeur → appui long.) -->
    <div v-if="!isUser && !editing" class="actions">
      <button class="act" :aria-label="t('ai.copy')" @click="copyMessage">
        <ion-icon :icon="copied ? checkmarkOutline : copyOutline" />
      </button>
      <button class="act" :aria-label="t('ai.selectText')" @click="enableSelection">
        <ion-icon :icon="textOutline" />
      </button>
      <button class="act" :aria-label="t('ai.exportToNote')" @click="exportToNote">
        <ion-icon :icon="documentTextOutline" />
      </button>
      <button
        v-if="canRegenerate"
        class="act"
        :aria-label="t('ai.regenerate')"
        @click="$emit('regenerate')"
      >
        <ion-icon :icon="refreshOutline" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { IonIcon, IonTextarea, actionSheetController, toastController } from '@ionic/vue'
import {
  copyOutline, checkmarkOutline, pencilOutline, textOutline, refreshOutline,
  documentTextOutline
} from 'ionicons/icons'
import { Clipboard } from '@capacitor/clipboard'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import MarkdownMessage from '@/components/ai/MarkdownMessage.vue'
import { saveNote } from '@/lib/user-db'
import { aiMessageToNoteBody, aiNoteTitle } from '@/lib/note-from-ai'

const { t } = useI18n()
const router = useRouter()
const props = defineProps({
  message: { type: Object, required: true },
  /** Message utilisateur assez récent pour être modifié/renvoyé ? */
  canEdit: { type: Boolean, default: false },
  /** Dernière réponse de l'IA → régénérable. */
  canRegenerate: { type: Boolean, default: false }
})
const emit = defineEmits(['openRef', 'edit', 'regenerate'])

const isUser = computed(() => props.message.role === 'user')
const refs = computed(() => props.message.verse_refs ?? [])

/**
 * Référence cliquée DANS le texte : on la renvoie au parent au même format
 * que les chips « Sources » (« JHN 3.16 ») pour réutiliser la même navigation.
 */
function onInlineRef({ code, chapter, verse }) {
  emit('openRef', { ref: `${code} ${chapter}.${verse}` })
}

/* ── Copier ── */
const copied = ref(false)
async function copyMessage() {
  try {
    await Clipboard.write({ string: props.message.content })
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch { /* rien à signaler */ }
}

/* ── Exporter en note (l'IA AGIT) ── */
async function exportToNote() {
  const id = `ai-${Date.now().toString(36)}`
  const body = aiMessageToNoteBody(props.message.content)
  const title = aiNoteTitle(props.message.content, t('notes.defaultAiTitle'))
  await saveNote({ id, title, body, show_verses: false, source: 'ai' })
  const toast = await toastController.create({
    message: t('notes.exportedFromAi'), duration: 1800, position: 'bottom'
  })
  await toast.present()
  // Ouvre la note directement : l'utilisateur voit le résultat et peut ajuster.
  router.push(`/tabs/plus/notes/${id}`)
}

/* ── Sélection de texte : on autorise la sélection native sur la bulle ── */
const selecting = ref(false)
function enableSelection() {
  selecting.value = true
  // La sélection reste active jusqu'au prochain tap ailleurs.
  setTimeout(() => {
    document.addEventListener('touchstart', disableSelectionOnce, { once: true })
  }, 400)
}
function disableSelectionOnce() {
  selecting.value = false
}

/* ── Appui long : menu d'actions (messages utilisateur ; IA = sélection) ── */
const LONG_PRESS_MS = 450
let timer = null
let moved = false

function onTouchStart() {
  moved = false
  timer = setTimeout(async () => {
    timer = null
    if (moved) return
    try { await Haptics.impact({ style: ImpactStyle.Medium }) } catch { /* web */ }
    if (isUser.value) openUserActions()
    else enableSelection() // sur l'IA, l'appui long permet de sélectionner du texte
  }, LONG_PRESS_MS)
}
function onTouchMove() {
  moved = true
  cancelTimer()
}
function onTouchEnd() {
  cancelTimer()
}
function cancelTimer() {
  if (timer) { clearTimeout(timer); timer = null }
}

/** Menu d'actions d'un message utilisateur (appui long). */
async function openUserActions() {
  const buttons = [
    { text: t('ai.copy'), icon: copyOutline, handler: copyMessage },
    { text: t('ai.selectText'), icon: textOutline, handler: enableSelection }
  ]
  if (props.canEdit) {
    buttons.push({ text: t('ai.edit'), icon: pencilOutline, handler: startEdit })
  }
  buttons.push({ text: t('common.cancel'), role: 'cancel' })

  const sheet = await actionSheetController.create({
    header: t('ai.messageActions'),
    buttons
  })
  await sheet.present()
}

/* ── Édition + renvoi ── */
const editing = ref(false)
const editText = ref('')

function startEdit() {
  editText.value = props.message.content
  editing.value = true
}
function cancelEdit() {
  editing.value = false
}
function confirmEdit() {
  const text = editText.value.trim()
  if (!text) return
  editing.value = false
  emit('edit', { id: props.message.id, text })
}
</script>

<style scoped>
.bubble-wrap { display: flex; flex-direction: column; margin-bottom: var(--space-3); }
.bubble-wrap.user { align-items: flex-end; }
.bubble-wrap.ai { align-items: flex-start; }

/* La rangée occupe toute la largeur : la bulle peut donc s'étendre au maximum
   sans être bridée par des actions placées à côté. */
.bubble-row { display: flex; width: 100%; }
.bubble-wrap.user .bubble-row { justify-content: flex-end; }
.bubble-wrap.ai .bubble-row { justify-content: flex-start; }

.bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  font-family: var(--font-app);
  font-size: 15px;
  line-height: 1.55;
  /* Pas de sélection native par défaut (sinon l'appui long ouvre le menu du
     navigateur au lieu de notre menu d'actions). Activée à la demande. */
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
/* Sélection de texte activée (action « Sélectionner du texte » ou appui long IA). */
.bubble.selectable {
  -webkit-user-select: text;
  user-select: text;
  -webkit-touch-callout: default;
}
.bubble-wrap.user .bubble {
  background: var(--gold);
  color: var(--navy);
  border-bottom-right-radius: 4px;
}
.bubble-wrap.ai .bubble {
  background: var(--card-bg);
  color: var(--cream);
  border: 1px solid var(--gold-border);
  border-bottom-left-radius: 4px;
}
/* Le texte va à la ligne normalement et n'est jamais coupé caractère par
   caractère (« Yo » ne doit pas s'empiler verticalement). */
.content {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: normal;
}

/* Actions discrètes sous la bulle (réponses IA uniquement). */
.actions {
  display: flex;
  gap: 2px;
  margin-top: 2px;
  padding: 0 4px;
}
.act {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
}
.act:active { background: var(--card-bg); }
.act ion-icon { font-size: 15px; }

/* Édition */
.edit-box { min-width: 220px; }
.edit-input {
  --background: rgba(0, 0, 0, 0.12);
  --color: var(--navy);
  --padding-start: 8px; --padding-end: 8px;
  --padding-top: 6px; --padding-bottom: 6px;
  --border-width: 0;
  --highlight-height: 0;
  border-radius: 10px;
  font-size: 15px;
}
.edit-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 8px; }
.edit-btn {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  border: none;
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.edit-btn.cancel { background: transparent; color: var(--navy); opacity: 0.7; }
.edit-btn.confirm { background: var(--navy); color: var(--gold); }
.edit-btn:disabled { opacity: 0.4; cursor: default; }

.sources {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--gold-border);
}
.sources-label {
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}
.source-chip {
  padding: 3px 9px;
  background: var(--gold-border);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.source-chip:active { background: var(--gold-border-md); }
</style>
