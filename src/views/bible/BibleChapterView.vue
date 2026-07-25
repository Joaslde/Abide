<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/tabs/immersion/book/${bookId}`" :text="''" />
        </ion-buttons>
        <ion-title>{{ bookName }} {{ chapter }}</ion-title>
        <ion-buttons slot="end">
          <!-- Écouter le chapitre (streaming audio + surbrillance versets). -->
          <ion-button :aria-label="t('bible.audio.listen')" @click="onToggleAudio">
            <ion-icon slot="icon-only" :icon="isThisChapterPlaying ? pauseCircle : playCircle" />
          </ion-button>
          <!-- Badge version : ouvre le sélecteur, on reste au même chapitre. -->
          <button class="version-pill" @click="showVersions = true">
            {{ versionLabel }}
            <ion-icon :icon="chevronDown" />
          </button>
          <ion-button @click="showSettings = true" :aria-label="t('bible.readerSettings')">
            <ion-icon slot="icon-only" :icon="settingsOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content
      :fullscreen="true"
      :style="{ '--bible-font-size': prefs.bibleFontSize + 'px' }"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <!-- Quand le panneau d'actions est ouvert, on réserve de l'espace en bas
           pour que TOUS les versets restent atteignables au-dessus du panneau. -->
      <div class="reader" :class="{ 'sel-padding': selection.hasSelection, 'audio-active': audioReadingMode }">
        <header class="chap-head">
          <span class="chap-book">{{ bookName }}</span>
          <h1 class="chap-num">{{ chapter }}</h1>
        </header>

        <div v-if="loading" class="state-msg">{{ t('bible.loading') }}</div>
        <div v-else-if="verses.length === 0" class="state-msg">{{ t('bible.empty') }}</div>

        <verse-item
          v-for="v in verses"
          :id="`verse-${v.verse}`"
          :key="v.verse"
          :verse="v.verse"
          :text="v.text"
          :is-selected="selection.isSelected(v.verse)"
          :selection-active="selection.active"
          :highlight-color="userData.highlightOf(v.verse)"
          :is-reading="(isThisChapterPlaying && audio.activeVerse === v.verse) || flashVerse === v.verse"
          @longpress="onLongPress"
          @tap="onVerseTap"
        />
      </div>

      <!-- Barre d'actions sur la sélection (copier, surligner, IA, partager…) -->
      <verse-action-bar />

      <!-- Bulles flottantes préc./suiv. (façon YouVersion) : ne prennent pas de
           place dans le texte. Masquées quand une sélection est en cours. -->
      <button
        v-show="chapter > 1 && !selection.hasSelection"
        class="nav-bubble left"
        :aria-label="t('bible.previousChapter')"
        @click="goChapter(chapter - 1)"
      >
        <ion-icon :icon="chevronBack" />
      </button>
      <button
        v-show="chapter < chapterCount && !selection.hasSelection"
        class="nav-bubble right"
        :aria-label="t('bible.nextChapter')"
        @click="goChapter(chapter + 1)"
      >
        <ion-icon :icon="chevronForward" />
      </button>
    </ion-content>

    <!-- Barre d'actions du chapitre (signet…). -->
    <ion-footer class="ion-no-border">
      <div class="chap-actions">
        <button
          class="action-btn"
          :class="{ active: userData.currentBookmarked }"
          :aria-label="t('bible.bookmarkChapter')"
          @click="onToggleBookmark"
        >
          <ion-icon :icon="userData.currentBookmarked ? bookmark : bookmarkOutline" />
          <span>{{ userData.currentBookmarked ? t('bible.bookmarked') : t('bible.bookmark') }}</span>
        </button>

        <!-- Marquer explicitement ce chapitre comme lu (progression globale). -->
        <button
          class="action-btn"
          :class="{ active: isRead }"
          :aria-label="t('bible.markRead')"
          @click="toggleRead"
        >
          <ion-icon :icon="isRead ? checkmarkCircle : checkmarkCircleOutline" />
          <span>{{ isRead ? t('bible.readDone') : t('bible.markRead') }}</span>
        </button>

        <!-- Quiz du chapitre (IA — connexion requise). -->
        <button
          class="action-btn"
          :class="{ active: chapterStars > 0 }"
          :aria-label="t('quiz.button')"
          @click="onOpenQuiz"
        >
          <ion-icon :icon="chapterStars > 0 ? sparkles : sparklesOutline" />
          <span>{{ t('quiz.button') }}</span>
        </button>
      </div>
    </ion-footer>

    <!-- Panneau réglages lecture : taille + police + thème -->
    <reader-settings :open="showSettings" @close="showSettings = false" />

    <!-- Sélecteur de version : on change de version en gardant chapitre+versets -->
    <version-selector
      :open="showVersions"
      :versions="versionsStore.installed"
      :active-version="store.activeVersion"
      @select="onSelectVersion"
      @add="onAddVersion"
      @close="showVersions = false"
    />

    <!-- Quiz de fin de chapitre (généré par l'IA, connexion requise) -->
    <chapter-quiz-modal :open="showQuiz" @close="onQuizClose" />
  </ion-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBackButton,
  IonContent, IonFooter, IonIcon, toastController
} from '@ionic/vue'
import {
  chevronBack, chevronForward, chevronDown, settingsOutline, playCircle, pauseCircle,
  bookmark, bookmarkOutline, checkmarkCircle, checkmarkCircleOutline, sparkles, sparklesOutline
} from 'ionicons/icons'
import { useBibleStore } from '@/stores/bible'
import { usePreferencesStore } from '@/stores/preferences'
import { useBibleVersionsStore } from '@/stores/bibleVersions'
import { useVerseSelectionStore } from '@/stores/verseSelection'
import { useUserDataStore } from '@/stores/userData'
import { usePlanStore } from '@/stores/plan'
import { useStreakStore } from '@/stores/streak'
import { useAudioStore } from '@/stores/audio'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { getVerses, getBookName, getChapterCount } from '@/lib/bible-db'
import { isChapterRead, unmarkChapterRead, getQuizResult } from '@/lib/user-db'
import { isOnline } from '@/lib/network'
import { useQuizStore } from '@/stores/quiz'
import { useAdsStore } from '@/stores/ads'
import VerseItem from '@/components/bible/VerseItem.vue'
import VerseActionBar from '@/components/bible/VerseActionBar.vue'
import ReaderSettings from '@/components/bible/ReaderSettings.vue'
import VersionSelector from '@/components/bible/VersionSelector.vue'
import ChapterQuizModal from '@/components/bible/ChapterQuizModal.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useBibleStore()
const prefs = usePreferencesStore()
const versionsStore = useBibleVersionsStore()
const selection = useVerseSelectionStore()
const userData = useUserDataStore()
const plan = usePlanStore()
const streak = useStreakStore()
const audio = useAudioStore()
const player = useAudioPlayer()
const quiz = useQuizStore()
const ads = useAdsStore()

const bookId = route.params.bookId
const chapter = ref(Number(route.params.chapter) || 1)
const bookName = ref('')
const chapterCount = ref(0)
const verses = ref([])
const loading = ref(true)
const showSettings = ref(false)
const showVersions = ref(false)
// Verset mis brièvement en évidence (arrivée depuis une source du Guide IA, ?v=N).
const flashVerse = ref(null)
// Ce chapitre est-il marqué comme lu ? (progression globale, choix explicite)
const isRead = ref(false)
// Quiz : modal ouvert ? + nb d'étoiles obtenues sur ce chapitre (pour l'icône).
const showQuiz = ref(false)
const chapterStars = ref(0)

// Libellé court de la version active (ex : "LSG 1910" → "LSG").
const versionLabel = computed(() => {
  const v = versionsStore.installed.find((x) => x.id === store.activeVersion)
  if (store.activeVersion === 'LSG1910') return 'LSG'
  return v?.id ?? store.activeVersion
})

// Le chapitre affiché est-il celui qui joue actuellement ?
const isThisChapterPlaying = computed(() =>
  audio.playingKey === `${store.activeVersion}:${bookId}:${chapter.value}`
)

// Mode lecture audio actif : on n'atténue les autres versets QUE s'il y a une
// synchro possible (timestamps présents). Sans timestamps (ex : AT LSG), l'audio
// joue mais le texte reste normal (rien à surligner). À la fermeture de l'audio,
// playingKey redevient null → tout revient à l'état normal.
const audioReadingMode = computed(
  () => isThisChapterPlaying.value && audio.timestamps.length > 0
)

/**
 * ▶️/⏸️ : lance la lecture du chapitre courant (et OUVRE le panneau complet,
 * style YouVersion), ou met en pause si déjà en lecture.
 */
async function onToggleAudio() {
  if (isThisChapterPlaying.value) {
    player.togglePlay()
    return
  }
  const ok = await player.playChapter({
    versionId: store.activeVersion,
    bookId,
    bookName: bookName.value,
    chapter: chapter.value
  })
  if (ok) audio.expanded = true
}

async function load() {
  loading.value = true
  // Changer de chapitre annule la sélection en cours.
  selection.clear()
  store.setBook(bookId)
  store.setChapter(chapter.value)
  bookName.value = store.currentBookName || (await getBookName(store.activeVersion, bookId)) || bookId
  chapterCount.value = store.currentChapterCount || (await getChapterCount(store.activeVersion, bookId))
  verses.value = await getVerses(store.activeVersion, bookId, chapter.value)
  loading.value = false
  // Surlignages + signet persistés de ce chapitre (SQLite local).
  userData.loadChapter({
    versionId: store.activeVersion, bookId, bookName: bookName.value, chapter: chapter.value
  })
  // Mémorise la position pour la reprise au prochain lancement de l'app.
  prefs.setLastReadPath(`/tabs/immersion/book/${bookId}/${chapter.value}`)
  // Le streak avance dès qu'on ouvre un chapitre (règle permissive assumée).
  // En revanche « chapitre lu » est désormais un choix EXPLICITE de l'utilisateur
  // (bouton dans le footer) → voir toggleRead().
  streak.registerReadToday()
  isRead.value = await isChapterRead(bookId, chapter.value)
  // Étoiles déjà obtenues au quiz de ce chapitre (offline-safe, local).
  const qr = await getQuizResult(bookId, chapter.value)
  chapterStars.value = qr?.stars ?? 0
}

/**
 * Ouvre le quiz du chapitre. Nécessite une connexion (la génération passe par
 * l'Edge Function). Hors ligne → toast informatif, on n'ouvre pas le modal.
 */
async function onOpenQuiz() {
  if (!(await isOnline())) {
    const tt = await toastController.create({
      message: t('quiz.offline'), duration: 2500, position: 'bottom'
    })
    await tt.present()
    return
  }
  // Pub vidéo avant le quiz (à chaque fois, sauf premium). Attend sa fermeture
  // puis ouvre le quiz — l'échec de la pub ne bloque jamais l'accès.
  await ads.onStartQuiz()
  showQuiz.value = true
  try {
    await quiz.generateQuiz({
      versionId: store.activeVersion, bookId, bookName: bookName.value, chapter: chapter.value
    })
  } catch (e) {
    showQuiz.value = false
    const tt = await toastController.create({
      message: e?.message === 'offline' ? t('quiz.offline') : t('quiz.error'),
      duration: 2500, position: 'bottom', color: e?.message === 'offline' ? undefined : 'danger'
    })
    await tt.present()
  }
}

/** Fermeture du modal quiz : rafraîchir les étoiles (un record a pu tomber). */
async function onQuizClose() {
  showQuiz.value = false
  const qr = await getQuizResult(bookId, chapter.value)
  chapterStars.value = qr?.stars ?? 0
}

/** Marque / démarque explicitement ce chapitre comme lu (progression globale). */
async function toggleRead() {
  if (isRead.value) {
    await unmarkChapterRead(bookId, chapter.value)
    isRead.value = false
  } else {
    await plan.markRead(store.activeVersion, bookId, chapter.value)
    isRead.value = true
  }
}

/**
 * Change de version EN RESTANT au même livre/chapitre (ids canoniques partagés).
 * On recharge juste les versets de la nouvelle version pour ce chapitre.
 */
async function onSelectVersion(versionId) {
  showVersions.value = false
  if (versionId === store.activeVersion) return
  loading.value = true
  try {
    await store.setVersion(versionId)
    bookName.value = (await getBookName(versionId, bookId)) || bookName.value
    chapterCount.value = (await getChapterCount(versionId, bookId)) || chapterCount.value
    verses.value = await getVerses(versionId, bookId, chapter.value)
  } catch {
    const tt = await toastController.create({
      message: t('bible.store.switchError'), duration: 2000, position: 'bottom', color: 'danger'
    })
    await tt.present()
  } finally {
    loading.value = false
  }
}

function onAddVersion() {
  showVersions.value = false
  router.push('/tabs/immersion/store')
}

/** Pose/retire le signet du chapitre (aperçu = 1er verset, comme YouVersion). */
function onToggleBookmark() {
  const snippet = verses.value[0]?.text ?? ''
  userData.toggleCurrentBookmark(snippet)
}

/** Contexte courant pour la sélection (version + livre + chapitre). */
function selectionContext() {
  return {
    versionId: store.activeVersion,
    bookId,
    bookName: bookName.value,
    chapter: chapter.value
  }
}

function onLongPress({ verse, text }) {
  selection.start(selectionContext(), verse, text)
}

function onVerseTap({ verse, text }) {
  selection.toggle(verse, text)
}

/**
 * Arrivée depuis une source du Guide IA (?v=N) : on défile jusqu'au verset et on
 * le met en évidence brièvement (~2,5 s), sans surbrillance permanente.
 */
async function flashTargetVerse() {
  const n = Number(route.query.v)
  if (!n) return
  await nextTick()
  const el = document.getElementById(`verse-${n}`)
  if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  flashVerse.value = n
  setTimeout(() => { flashVerse.value = null }, 2500)
}

onMounted(async () => {
  await load()
  flashTargetVerse()
  // Versions installées (pour le sélecteur du header) — offline-safe.
  await versionsStore.loadInstalled()
})

// Réagir au changement de chapitre dans l'URL (prev/next, swipe).
watch(() => route.params.chapter, (c) => {
  const n = Number(c)
  if (n && n !== chapter.value) {
    chapter.value = n
    load()
  }
})

// Auto-scroll vers le verset en cours de lecture audio (sync timestamps).
// On ne défile que si CE chapitre est celui qui joue.
watch(() => audio.activeVerse, (verse) => {
  if (!verse || !isThisChapterPlaying.value) return
  const el = document.getElementById(`verse-${verse}`)
  if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
})

function goChapter(n) {
  if (n < 1 || n > chapterCount.value) return
  // replace pour ne pas empiler 50 entrées d'historique en lecture continue.
  router.replace(`/tabs/immersion/book/${bookId}/${n}`)
}

/* Swipe horizontal = chapitre précédent / suivant. */
let startX = 0
let startY = 0
function onTouchStart(e) {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
}
function onTouchEnd(e) {
  // En mode sélection, le swipe ne change pas de chapitre (gestes réservés
  // à la sélection de versets).
  if (selection.active) return
  const dx = e.changedTouches[0].clientX - startX
  const dy = e.changedTouches[0].clientY - startY
  // Ignorer si geste majoritairement vertical (scroll).
  if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy)) return
  if (dx < 0) goChapter(chapter.value + 1)
  else goChapter(chapter.value - 1)
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; font-size: 16px; }
ion-content { --background: var(--navy); }

/* top | right (réduite) | bottom | left */
.reader { padding: var(--space-4) var(--space-3) var(--space-8) var(--space-4); }
/* Espace réservé sous le texte tant que le panneau d'actions est ouvert. */
.reader.sel-padding { padding-bottom: 280px; }

/* Mode lecture audio : tous les versets sont atténués SAUF celui qui est lu
   (carte jaune, gérée dans VerseItem). Concentre l'attention sur le verset en
   cours. Désactivé automatiquement à la fermeture de l'audio. */
.reader.audio-active :deep(.verse:not(.reading)) {
  opacity: 0.32;
}

/* display: contents → le header ne crée pas de boîte : le libellé et le chiffre
   deviennent frères directs des versets, ce qui permet au chiffre de FLOTTER et
   au texte des versets de s'enrouler autour (effet journal). */
.chap-head {
  display: contents;
}
.chap-book {
  display: block;
  text-align: left;
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: var(--space-2);
}
/* Le gros chiffre flotte à gauche : le texte du 1er verset coule à sa droite
   puis passe dessous (façon éditoriale, comme l'image du Psaume 35). */
.chap-num {
  float: left;
  font-family: var(--font-app);
  font-size: 76px;
  font-weight: 300;
  color: var(--cream);
  line-height: 0.82;
  margin: 4px var(--space-4) 2px 0;
}

.state-msg {
  text-align: center;
  color: var(--muted);
  padding: var(--space-10) 0;
  font-family: var(--font-app);
}

/* Bulles flottantes préc./suiv. (mi-hauteur, semi-transparentes). */
.nav-bubble {
  position: fixed;
  /* Plus bas, au niveau du footer (le bouton signet est centré → les bulles
     latérales ne le recouvrent pas), donc plus accessibles au pouce. */
  bottom: calc(env(safe-area-inset-bottom, 0px) + 66px);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--navy2) 82%, transparent);
  border: 1px solid var(--gold-border-md);
  color: var(--gold);
  cursor: pointer;
  backdrop-filter: blur(3px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}
.nav-bubble.left { left: 12px; }
.nav-bubble.right { right: 12px; }
.nav-bubble ion-icon { font-size: 22px; }
.nav-bubble:active { background: var(--card-bg); }

/* Barre d'actions du chapitre (signet, etc.). */
ion-footer .chap-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-6);
  padding: var(--space-2) var(--space-4) calc(env(safe-area-inset-bottom, 0px) + var(--space-2));
  background: var(--navy2);
  border-top: 1px solid var(--gold-border);
}
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 16px;
  background: none;
  border: none;
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 11px;
  cursor: pointer;
  transition: color var(--duration-fast);
}
.action-btn ion-icon { font-size: 22px; }
.action-btn.active { color: var(--gold); }

/* Badge version dans le header */
.version-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 30px;
  padding: 0 10px;
  margin-right: 2px;
  background: var(--card-bg);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.version-pill ion-icon { font-size: 14px; }
.version-pill:active { background: var(--gold-border); }
</style>
