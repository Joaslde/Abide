<template>
  <!-- L'Ancre = Guide IA façon chatbot. UN SEUL ion-page : menu (tiroir) +
       zone principale (id=ai-main). Ne PAS imbriquer un second ion-page dedans
       (écran vide sinon). -->
  <ion-page>
    <!-- Tiroir latéral : historique des discussions -->
    <ion-menu menu-id="ai-menu" content-id="ai-main" type="overlay">
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-title>{{ t('ai.history') }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="drawer">
        <button class="new-btn" @click="newChat">
          <ion-icon :icon="addOutline" />
          <span>{{ t('ai.newConversation') }}</span>
        </button>

        <div v-if="store.conversations.length === 0" class="drawer-empty">
          {{ t('ai.emptyState') }}
        </div>

        <ion-list v-else lines="none" class="conv-list">
          <ion-item-sliding v-for="c in store.conversations" :key="c.id">
            <ion-item
              button
              class="conv-item"
              :class="{ active: c.id === store.activeId }"
              @click="openChat(c.id)"
            >
              <ion-icon :icon="chatbubbleEllipsesOutline" slot="start" class="conv-ico" />
              <ion-label class="conv-label">{{ c.title }}</ion-label>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="medium" @click="renameChat(c)">
                <ion-icon slot="icon-only" :icon="pencilOutline" />
              </ion-item-option>
              <ion-item-option color="danger" @click="confirmDelete(c)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </ion-content>
    </ion-menu>

    <!-- Zone principale (le chat) -->
    <div id="ai-main" class="ion-page">
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button menu="ai-menu" :aria-label="t('ai.history')" />
          </ion-buttons>
          <!-- Tap sur le titre d'une discussion existante → renommer. -->
          <ion-title
            :class="{ renamable: !!store.activeConversation }"
            @click="store.activeConversation && renameChat(store.activeConversation)"
          >
            {{ store.activeConversation?.title || t('ai.title') }}
          </ion-title>
          <ion-buttons slot="end">
            <ion-button :aria-label="t('ai.newConversation')" @click="newChat">
              <ion-icon slot="icon-only" :icon="createOutline" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content ref="contentRef" :fullscreen="true" @click="showModes = false">
        <div class="chat">
          <!-- Accueil discussion vierge : salutation + choix du mode. -->
          <div v-if="store.messages.length === 0" class="intro">
            <ion-icon :icon="sparklesOutline" class="intro-star" />
            <h2 class="intro-hello">{{ greeting }}</h2>
            <p class="intro-text">{{ t('ai.emptyChatHint') }}</p>
            <mode-selector v-model="localMode" @update:modelValue="onModeChange" />
          </div>

          <chat-bubble
            v-for="m in store.messages"
            :key="m.id"
            :message="m"
            :can-edit="editableIds.includes(m.id)"
            :can-regenerate="m.id === lastAiId && !store.loading"
            @openRef="openRef"
            @edit="onEditMessage"
            @regenerate="onRegenerate"
          />

          <div v-if="store.loading" class="bubble-row ai">
            <div class="bubble typing">
              <span class="dot" /><span class="dot" /><span class="dot" />
            </div>
          </div>
        </div>
      </ion-content>

      <ion-footer class="ion-no-border">
        <div v-if="!online" class="offline-bar">
          <ion-icon :icon="cloudOfflineOutline" />
          <span>{{ t('ai.offlineNotice') }}</span>
        </div>
        <!-- Sélecteur de mode « drop-up » : la personne change de mode quand
             elle veut, en cours de conversation. -->
        <transition name="modeup">
          <div v-if="showModes" class="mode-dropup">
            <button
              v-for="m in MODES"
              :key="m"
              class="mode-option"
              :class="{ active: localMode === m }"
              @click="pickMode(m)"
            >
              <ion-icon :icon="MODE_ICONS[m]" />
              <span>{{ t(`ai.modes.${m}`) }}</span>
              <ion-icon v-if="localMode === m" :icon="checkmarkOutline" class="mode-check" />
            </button>
          </div>
        </transition>

        <div class="composer" :class="{ disabled: !online }">
          <div class="composer-pill">
            <!-- Bouton de mode courant : icône + chevron seulement (compact).
                 Les libellés apparaissent dans le drop-up. -->
            <button
              class="mode-btn"
              :aria-label="t('ai.changeMode')"
              @click="showModes = !showModes"
            >
              <ion-icon :icon="MODE_ICONS[localMode]" class="mode-btn-icon" />
              <ion-icon :icon="chevronUpOutline" class="mode-btn-caret" :class="{ open: showModes }" />
            </button>
            <!-- auto-grow OFF : il pose une hauteur inline qui grandit sans fin
                 et empêche le scroll interne. On fixe rows + max-height (CSS). -->
            <ion-textarea
              v-model="draft"
              class="composer-input"
              :auto-grow="false"
              :rows="composerRows"
              :maxlength="2000"
              :disabled="!online || store.sending"
              :placeholder="t('ai.placeholder')"
            />
          </div>
          <button class="send-btn" :disabled="!canSend" :aria-label="t('ai.send')" @click="send">
            <ion-icon :icon="store.sending ? ellipsisHorizontal : sendOutline" />
          </button>
        </div>
      </ion-footer>
    </div>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonMenu, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonMenuButton, IonContent, IonFooter, IonList, IonItem, IonItemSliding,
  IonItemOptions, IonItemOption, IonIcon, IonLabel, IonTextarea,
  menuController, alertController, toastController, onIonViewWillEnter
} from '@ionic/vue'
import {
  addOutline, trashOutline, chatbubbleEllipsesOutline, sendOutline,
  ellipsisHorizontal, createOutline, sparklesOutline, cloudOfflineOutline,
  pencilOutline, chevronUpOutline, checkmarkOutline
} from 'ionicons/icons'
import { useAIStore } from '@/stores/ai'
import { useAuthStore } from '@/stores/auth'
import { useBibleStore } from '@/stores/bible'
import { useAdsStore } from '@/stores/ads'
import { isOnline } from '@/lib/network'
import ChatBubble from '@/components/ai/ChatBubble.vue'
import ModeSelector, { MODES, MODE_ICONS } from '@/components/ai/ModeSelector.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store = useAIStore()
const auth = useAuthStore()
const bible = useBibleStore()
const ads = useAdsStore()

const draft = ref('')
const online = ref(true)

/**
 * Le champ grandit de 1 à 5 lignes, puis le texte DÉFILE (max-height + overflow
 * en CSS). On n'utilise pas auto-grow d'Ionic : il pose une hauteur inline qui
 * grandit sans fin et empêche tout scroll interne.
 */
const composerRows = computed(() => {
  const lines = (draft.value.match(/\n/g)?.length ?? 0) + 1
  // ~38 caractères par ligne visuelle sur mobile → estimation du retour à la ligne.
  const wrapped = Math.ceil((draft.value.length || 1) / 38)
  return Math.min(5, Math.max(1, lines, wrapped))
})
const localMode = ref('enseignement')
const contentRef = ref(null)

const canSend = computed(
  () => online.value && !store.sending && draft.value.trim().length > 0
)

/** Salutation selon l'heure + prénom (repli gracieux). */
const greeting = computed(() => {
  const h = new Date().getHours()
  const period = h < 12 ? t('ai.morning') : h < 18 ? t('ai.afternoon') : t('ai.evening')
  const name = auth.firstName
  return name ? `${period} ${name}` : period
})

onMounted(async () => {
  online.value = await isOnline()
  await store.loadConversations()
  if (!store.activeId) store.startDraft(store.mode)
  localMode.value = store.mode
  scrollToBottom()
})
onIonViewWillEnter(async () => {
  online.value = await isOnline()
  await store.loadConversations()
  const fromVerse = !!route.query.prefill
  applyPrefill()
  // Pub à l'ouverture du Guide : « méditer sur un verset » → à chaque fois,
  // ouverture normale → throttlée (1/4 min). Le store gère !isPremium.
  if (fromVerse) ads.onMeditateVerse()
  else ads.onOpenAiGuide()
})

/**
 * Arrivée depuis « Guide IA » (sélection de versets) : ?prefill=… →
 * nouvelle discussion vierge avec le passage déjà dans le champ.
 */
function applyPrefill() {
  const text = route.query.prefill
  if (!text) return
  // ?mode= permet d'ouvrir directement dans le bon mode (ex : Méditer avec le Guide).
  const wanted = route.query.mode
  const mode = MODES.includes(wanted) ? wanted : store.mode
  store.startDraft(mode)
  localMode.value = mode
  draft.value = `${text}\n\n`
  // Nettoie l'URL pour ne pas repréremplir à chaque retour sur l'onglet.
  router.replace({ path: '/tabs/ancre' })
  nextTick(() => scrollToBottom())
}

/** Renommer la discussion active (ou celle passée en paramètre). */
async function renameChat(conv) {
  const alert = await alertController.create({
    header: t('ai.renameTitle'),
    inputs: [{ name: 'title', type: 'text', value: conv.title, placeholder: t('ai.renamePlaceholder') }],
    buttons: [
      { text: t('common.cancel'), role: 'cancel' },
      {
        text: t('common.save'),
        handler: async (d) => {
          const title = (d.title ?? '').trim()
          if (!title) return
          try {
            await store.renameConversation(conv.id, title)
          } catch {
            const tt = await toastController.create({ message: t('ai.error'), duration: 1800, color: 'danger' })
            await tt.present()
          }
        }
      }
    ]
  })
  await alert.present()
}

watch(() => store.messages.length, scrollToBottom)
watch(() => store.activeId, () => { localMode.value = store.mode; scrollToBottom() })

async function scrollToBottom() {
  await nextTick()
  const el = await contentRef.value?.$el?.getScrollElement?.()
  if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
}

function onModeChange(m) { store.setMode(m) }

/* ── Sélecteur de mode « drop-up » dans le champ de saisie ── */
const showModes = ref(false)
function pickMode(m) {
  localMode.value = m
  store.setMode(m)
  showModes.value = false
}

/**
 * Les DEUX derniers messages de l'utilisateur sont modifiables/renvoyables.
 * (Modifier un message plus ancien effacerait trop d'échanges.)
 */
const editableIds = computed(() => {
  const userIds = store.messages.filter((m) => m.role === 'user').map((m) => m.id)
  return userIds.slice(-2)
})

/** Id de la DERNIÈRE réponse de l'IA → seule à pouvoir être régénérée. */
const lastAiId = computed(() => {
  const ai = store.messages.filter((m) => m.role === 'assistant')
  return ai.length ? ai[ai.length - 1].id : null
})

/** Modifier un message envoyé → remplace et relance la réponse de l'IA. */
async function onEditMessage({ id, text }) {
  try {
    await store.editLastUserMessage(id, text)
  } catch {
    const tt = await toastController.create({ message: t('ai.error'), duration: 2000, color: 'danger' })
    await tt.present()
  }
}

/** Régénérer la dernière réponse de l'IA (même question, nouvelle réponse). */
async function onRegenerate() {
  try {
    await store.regenerateLast()
  } catch {
    const tt = await toastController.create({ message: t('ai.error'), duration: 2000, color: 'danger' })
    await tt.present()
  }
}

async function newChat() {
  store.startDraft(store.mode)
  draft.value = ''
  await menuController.close('ai-menu')
}

async function openChat(id) {
  await store.openConversation(id)
  await menuController.close('ai-menu')
}

async function send() {
  if (!canSend.value) return
  const text = draft.value
  draft.value = ''
  try {
    await store.sendMessage(text)
  } catch {
    const tt = await toastController.create({
      message: t('ai.error'), duration: 2000, position: 'bottom', color: 'danger'
    })
    await tt.present()
  }
  scrollToBottom()
}

async function confirmDelete(c) {
  const alert = await alertController.create({
    header: c.title,
    message: t('ai.deleteConfirm'),
    buttons: [
      { text: t('common.cancel'), role: 'cancel' },
      {
        text: t('common.delete'),
        role: 'destructive',
        handler: async () => {
          await store.deleteConversation(c.id)
          if (store.activeId === null) store.startDraft(store.mode)
        }
      }
    ]
  })
  await alert.present()
}

/** Tap sur un verset cité → ouvre le chapitre + surbrillance douce du verset. */
function openRef(r) {
  const m = r.ref.match(/^(\S+)\s+(\d+)\.(\d+)/)
  if (!m) return
  bible.setBook(m[1])
  // ?v=N : le lecteur scrolle vers ce verset et le met en surbrillance ~2,5 s.
  router.push(`/tabs/immersion/book/${m[1]}/${m[2]}?v=${m[3]}`)
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; font-size: 16px; }
ion-content { --background: var(--navy); }

/* ─────────── Tiroir ─────────── */
ion-menu { --width: 82%; --max-width: 340px; }
.drawer { --background: var(--navy); }
.new-btn {
  display: flex; align-items: center; gap: 10px;
  width: calc(100% - 2 * var(--space-4));
  margin: var(--space-4);
  padding: 12px 16px;
  background: var(--gold-border);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 15px; font-weight: 600;
  cursor: pointer;
}
.new-btn ion-icon { font-size: 20px; }
.drawer-empty {
  padding: var(--space-6) var(--space-5);
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 13px; text-align: center;
}
.conv-list { background: transparent; }
.conv-item { --background: transparent; --color: var(--cream); --min-height: 48px; }
.conv-item.active { --background: var(--card-bg); }
.conv-ico { color: var(--gold); font-size: 18px; margin-right: 10px; }
.conv-label {
  font-family: var(--font-app); font-size: 14px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ─────────── Chat ─────────── */
.chat { padding: var(--space-4) var(--space-4) var(--space-6); min-height: 100%; }
.intro {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 20vh var(--space-4) var(--space-8);
}
.intro-star { font-size: 40px; color: var(--gold); margin-bottom: var(--space-3); }
.intro-hello {
  font-family: var(--font-app); font-size: 26px; font-weight: 300;
  color: var(--cream); margin: 0 0 var(--space-2);
}
.intro-text {
  font-family: var(--font-app); font-size: 14px; color: var(--muted);
  margin: 0 0 var(--space-5); line-height: 1.5; max-width: 300px;
}

.bubble-row { display: flex; margin-bottom: var(--space-3); }
.bubble-row.ai { justify-content: flex-start; }
.typing {
  display: flex; gap: 4px; padding: 14px 16px;
  background: var(--card-bg); border: 1px solid var(--gold-border);
  border-radius: 16px; border-bottom-left-radius: 4px;
}
.dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); animation: blink 1.4s infinite both; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }

ion-footer { --background: var(--navy2); }
.offline-bar {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 6px var(--space-4);
  background: var(--navy2); color: var(--muted);
  font-family: var(--font-app); font-size: 12px;
}
.offline-bar ion-icon { font-size: 15px; color: var(--gold); }
.composer {
  display: flex; align-items: flex-end; gap: var(--space-2);
  padding: var(--space-2) var(--space-3)
           calc(env(safe-area-inset-bottom, 0px) + var(--space-2));
  background: var(--navy2);
  /* Pas de ligne dorée en haut : le champ est une pilule autonome. */
}
.composer.disabled { opacity: 0.7; }

/* Titre cliquable (renommer la discussion). */
ion-title.renamable { cursor: pointer; }

/* Pilule cylindrique qui contient le textarea (Ionic dessine son propre fond
   à l'intérieur → on stylise l'enveloppe, pas ion-textarea directement). */
/* ─── Sélecteur de mode (drop-up) ─── */
.mode-dropup {
  margin: 0 var(--space-3) var(--space-2);
  padding: var(--space-2);
  background: var(--navy2);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.35);
}
.mode-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}
.mode-option:active { background: var(--card-bg); }
.mode-option.active { color: var(--gold); }
.mode-option ion-icon { font-size: 18px; color: var(--gold); flex-shrink: 0; }
.mode-check { margin-left: auto; font-size: 16px !important; }

.modeup-enter-active, .modeup-leave-active {
  transition: opacity var(--duration-fast), transform var(--duration-fast);
}
.modeup-enter-from, .modeup-leave-to { opacity: 0; transform: translateY(8px); }

/* Bouton du mode courant : compact (icône + chevron), aligné avec le bouton d'envoi. */
.mode-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
  flex-shrink: 0;
  width: 42px;
  height: 34px;
  padding: 0;
  background: none;
  border: none;
  color: var(--gold);
  cursor: pointer;
  border-radius: var(--radius-full);
}
.mode-btn:active { background: var(--gold-border); }
.mode-btn-icon { font-size: 19px; }
.mode-btn-caret {
  font-size: 11px;
  transition: transform var(--duration-fast);
}
.mode-btn-caret.open { transform: rotate(180deg); }

.composer-pill {
  flex: 1;
  display: flex;
  /* Le bouton de mode reste en bas quand le champ grandit sur plusieurs lignes. */
  align-items: flex-end;
  gap: 2px;
  min-width: 0;
  background: var(--card-bg);
  border: 1px solid var(--gold-border-md);
  border-radius: 22px;
  padding: 4px 6px 4px 4px;
  /* Le contenu scrolle DANS le textarea natif → pas de clipping ici. */
  overflow: hidden;
}
.composer-input {
  flex: 1;
  --background: transparent;
  --color: var(--cream);
  --placeholder-color: var(--muted);
  --padding-start: 6px; --padding-end: 8px;
  --padding-top: 6px; --padding-bottom: 6px;
  --border-width: 0;
  --highlight-height: 0; /* supprime la ligne de focus Ionic */
  background: transparent;
  font-family: var(--font-app); font-size: 15px;
  max-height: 120px;
  margin: 0;
}
/* Un texte long doit pouvoir DÉFILER au doigt dans le champ (sinon il fallait
   déplacer le curseur pour voir la suite). Le scroll appartient au <textarea>
   natif encapsulé par ion-textarea.
   ⚠️ ion-textarea n'a PAS de shadow DOM ni de part="native" → `::part(native)`
   n'a aucun effet. On cible sa classe interne `.native-textarea` via :deep(). */
.composer-input :deep(.native-textarea),
.composer-input :deep(textarea) {
  min-height: 24px;
  max-height: 110px;      /* ~5 lignes, puis on défile */
  height: auto;
  overflow-y: auto !important;
  overscroll-behavior: contain; /* le geste ne déborde pas sur la liste de messages */
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  resize: none;
}
.send-btn {
  flex-shrink: 0; width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  background: var(--gold); border: none; border-radius: 50%;
  color: var(--navy); cursor: pointer;
}
.send-btn:disabled { opacity: 0.4; cursor: default; }
.send-btn ion-icon { font-size: 20px; }
</style>
