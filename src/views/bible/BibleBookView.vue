<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/immersion" :text="''" />
        </ion-buttons>
        <ion-title>{{ bookName }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="book-head">
        <h1 class="book-title">{{ bookName }}</h1>
        <span class="book-sub">{{ chapterCount }} {{ t('bible.chapters') }}</span>
      </div>

      <div class="chapter-grid">
        <button
          v-for="n in chapterCount"
          :key="n"
          class="chapter-cell"
          :class="{ read: readChapters.has(n) }"
          @click="openChapter(n)"
        >
          {{ n }}
          <!-- Étoiles du quiz (1 à 3) obtenues sur ce chapitre. -->
          <span v-if="quizStars.get(n)" class="cell-stars">
            <ion-icon v-for="s in quizStars.get(n)" :key="s" :icon="star" />
          </span>
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon,
  onIonViewWillEnter
} from '@ionic/vue'
import { star } from 'ionicons/icons'
import { useBibleStore } from '@/stores/bible'
import { usePlanStore } from '@/stores/plan'
import { getBookName, getChapterCount } from '@/lib/bible-db'
import { quizResultsFor } from '@/lib/user-db'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useBibleStore()
const plan = usePlanStore()

const bookId = route.params.bookId
const bookName = ref('')
const chapterCount = ref(0)
const readChapters = ref(new Set()) // chapitres déjà lus → pastille
const quizStars = ref(new Map()) // chapitre → nb d'étoiles obtenues au quiz

onMounted(async () => {
  store.setBook(bookId)
  // Le cache du store couvre le cas nominal ; on interroge la DB en repli
  // (ex : arrivée directe par URL sans être passé par BibleHomeView).
  bookName.value = store.currentBookName || (await getBookName(store.activeVersion, bookId)) || bookId
  chapterCount.value = store.currentChapterCount || (await getChapterCount(store.activeVersion, bookId))
  await refreshProgress()
})

// Ionic GARDE la vue en cache : au retour depuis un chapitre, onMounted ne se
// rejoue pas. onIonViewWillEnter, si → on rafraîchit les pastilles « lu » et les
// étoiles de quiz à CHAQUE affichage (sinon elles n'apparaissent qu'après un
// aller-retour complet hors de la vue).
onIonViewWillEnter(refreshProgress)

async function refreshProgress() {
  readChapters.value = await plan.readChapters(store.activeVersion, bookId)
  quizStars.value = await quizResultsFor(bookId)
}

function openChapter(n) {
  store.setChapter(n)
  router.push(`/tabs/immersion/book/${bookId}/${n}`)
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; }

.book-head {
  padding: var(--space-6) var(--space-5) var(--space-4);
  text-align: center;
}
.book-title {
  font-family: var(--font-app);
  font-size: 28px;
  font-weight: 700;
  color: var(--cream);
  margin: 0 0 4px;
}
.book-sub {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5) var(--space-12);
}
@media (min-width: 420px) {
  .chapter-grid { grid-template-columns: repeat(6, 1fr); }
}
.chapter-cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 17px;
  cursor: pointer;
  transition: border-color var(--duration-fast), transform var(--duration-fast);
}

/* Étoiles du quiz : rangée discrète en bas de la case (n'empiète pas sur la
   pastille « lu » en haut à droite). */
.cell-stars {
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 1px;
  line-height: 0;
  pointer-events: none;
}
.cell-stars ion-icon {
  font-size: 9px;
  color: var(--gold);
}
.chapter-cell:active {
  border-color: var(--gold);
  transform: scale(0.95);
}
/* Chapitre déjà lu : pastille dorée en haut à droite. */
.chapter-cell.read {
  position: relative;
  border-color: var(--gold-border-md);
}
.chapter-cell.read::after {
  content: '';
  position: absolute;
  top: 5px;
  right: 5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
}
</style>
