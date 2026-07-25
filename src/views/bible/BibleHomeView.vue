<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>{{ t('bible.title') }}</ion-title>
        <ion-buttons slot="end">
          <!-- Badge version déroulable -->
          <button class="version-badge" @click="showVersions = true">
            <span>{{ activeVersionName }}</span>
            <ion-icon :icon="chevronDown" />
          </button>
        </ion-buttons>
      </ion-toolbar>

      <!-- Onglets AT / NT -->
      <ion-segment :value="testament" @ionChange="onSegment" class="testament-seg">
        <ion-segment-button value="OT">
          <ion-label>{{ t('bible.oldTestament') }}</ion-label>
        </ion-segment-button>
        <ion-segment-button value="NT">
          <ion-label>{{ t('bible.newTestament') }}</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-header>

    <ion-content
      :fullscreen="true"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div v-if="!store.booksLoaded" class="state-msg">{{ t('bible.loading') }}</div>

      <!-- Un seul testament rendu à la fois : la hauteur suit son contenu,
           donc le défilement s'arrête au dernier livre (pas de vide).
           La transition donne le glissement gauche/droite au changement. -->
      <transition v-else :name="slideDir" mode="out-in">
        <div :key="testament" class="testament-pane">
          <button
            v-for="book in currentBooks"
            :key="book.book_id"
            class="book-row"
            @click="openBook(book.book_id)"
          >
            <span class="book-name">{{ book.name }}</span>
            <span class="book-meta">{{ book.chapter_count }} {{ t('bible.chapters') }}</span>
          </button>
        </div>
      </transition>

      <!-- Bulle de recherche de livre (bas à droite, discrète). -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button class="search-fab" :aria-label="t('bible.search.title')" @click="openSearch">
          <ion-icon :icon="searchOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <version-selector
      :open="showVersions"
      :versions="versions"
      :active-version="store.activeVersion"
      @close="showVersions = false"
      @select="onSelectVersion"
      @add="onAddVersion"
    />
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent,
  IonSegment, IonSegmentButton, IonLabel, IonIcon, IonFab, IonFabButton
} from '@ionic/vue'
import { chevronDown, searchOutline } from 'ionicons/icons'
import { useBibleStore } from '@/stores/bible'
import { useBibleVersionsStore } from '@/stores/bibleVersions'
import VersionSelector from '@/components/bible/VersionSelector.vue'

const { t } = useI18n()
const router = useRouter()
const store = useBibleStore()
const versionsStore = useBibleVersionsStore()

const testament = ref('OT')
const slideDir = ref('slide-left') // direction de la transition (OT→NT = vers la gauche)
const showVersions = ref(false)

// Le sélecteur ne propose que les versions INSTALLÉES (téléchargées + bundlée).
const versions = computed(() => versionsStore.installed)

const currentBooks = computed(() =>
  testament.value === 'OT' ? store.oldTestament : store.newTestament
)

/** Change de testament en choisissant la direction de glissement. */
function setTestament(value) {
  if (value === testament.value) return
  slideDir.value = value === 'NT' ? 'slide-left' : 'slide-right'
  testament.value = value
}

const activeVersionName = computed(() => {
  const v = versions.value.find((x) => x.id === store.activeVersion)
  // Repli : forme courte connue, sinon l'id.
  return v?.id === 'LSG1910' ? 'LSG 1910' : (v?.name ?? store.activeVersion)
})

onMounted(async () => {
  await store.loadBooks()
  // Catalogue des versions installées (pour le sélecteur) + manifeste distant.
  await versionsStore.loadInstalled()
  versionsStore.fetchManifest() // non bloquant
})

function onSegment(e) {
  setTestament(e.detail.value)
}

function openBook(bookId) {
  store.setBook(bookId)
  router.push(`/tabs/immersion/book/${bookId}`)
}

/* Swipe horizontal pour passer d'un testament à l'autre. */
let startX = 0
function onTouchStart(e) {
  startX = e.touches[0].clientX
}
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - startX
  if (Math.abs(dx) < 60) return
  if (dx < 0 && testament.value === 'OT') setTestament('NT')
  else if (dx > 0 && testament.value === 'NT') setTestament('OT')
}

async function onSelectVersion(id) {
  if (id !== store.activeVersion) await store.setVersion(id)
}

function onAddVersion() {
  showVersions.value = false
  router.push('/tabs/immersion/store')
}

function openSearch() {
  router.push('/tabs/immersion/search')
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title {
  font-family: var(--font-app);
  font-weight: 600;
}

.version-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: var(--space-3);
  padding: 6px 12px;
  background: var(--card-bg);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.03em;
  cursor: pointer;
}
.version-badge ion-icon { font-size: 14px; }

.testament-seg {
  --background: var(--navy);
  padding: var(--space-2) var(--space-4) var(--space-3);
}
ion-segment-button {
  --color: var(--muted);
  --color-checked: var(--gold);
  --indicator-color: var(--gold);
  font-family: var(--font-app);
  text-transform: none;
  letter-spacing: 0.02em;
  font-size: 14px;
}

.state-msg {
  text-align: center;
  color: var(--muted);
  padding: var(--space-12) var(--space-5);
  font-family: var(--font-app);
}

/* Un seul testament rendu à la fois → hauteur naturelle, scroll correct. */
.testament-pane {
  padding: var(--space-2) var(--space-4) var(--space-8);
}

/* Transitions de glissement gauche/droite entre AT et NT. */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform var(--duration-normal) ease, opacity var(--duration-normal) ease;
}
.slide-left-enter-from { transform: translateX(40px); opacity: 0; }
.slide-left-leave-to { transform: translateX(-40px); opacity: 0; }
.slide-right-enter-from { transform: translateX(-40px); opacity: 0; }
.slide-right-leave-to { transform: translateX(40px); opacity: 0; }

.book-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-4) var(--space-3);
  background: none;
  border: none;
  border-bottom: 1px solid var(--gold-border);
  cursor: pointer;
  text-align: left;
  transition: background var(--duration-fast);
}
.book-row:active { background: var(--card-bg); }
.book-name {
  font-family: var(--font-app);
  font-size: 17px;
  color: var(--cream);
}
.book-meta {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.05em;
  color: var(--muted);
}

/* Bulle de recherche — discrète, dorée, pas trop grosse pour ne pas cacher le texte. */
.search-fab {
  --background: var(--navy2);
  --background-activated: var(--card-bg);
  --color: var(--gold);
  --box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4);
  --border-radius: 50%;
  width: 46px;
  height: 46px;
  border: 1px solid var(--gold-border-md);
  border-radius: 50%;
}
.search-fab ion-icon { font-size: 20px; }
</style>
