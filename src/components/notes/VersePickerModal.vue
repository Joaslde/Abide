<template>
  <ion-modal :is-open="open" @did-dismiss="$emit('close')">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="back">
            <ion-icon slot="icon-only" :icon="step === 'books' ? closeOutline : arrowBack" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ headerTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="picker">
      <!-- Étape 1 : choisir le livre -->
      <div v-if="step === 'books'" class="list">
        <button v-for="b in books" :key="b.book_id" class="pick-row" @click="chooseBook(b)">
          <span>{{ b.name }}</span>
          <span class="meta">{{ b.chapter_count }}</span>
        </button>
      </div>

      <!-- Étape 2 : choisir le chapitre -->
      <div v-else-if="step === 'chapters'" class="chapter-grid">
        <button
          v-for="c in chapterCount"
          :key="c"
          class="chip"
          @click="chooseChapter(c)"
        >{{ c }}</button>
      </div>

      <!-- Étape 3 : verset début / fin (optionnel) -->
      <div v-else class="verse-step">
        <p class="hint">{{ t('notes.picker.verseHint') }}</p>
        <div class="verse-fields">
          <label>
            <span>{{ t('notes.picker.from') }}</span>
            <select v-model.number="vStart">
              <option v-for="v in verseCount" :key="v" :value="v">{{ v }}</option>
            </select>
          </label>
          <label>
            <span>{{ t('notes.picker.to') }}</span>
            <select v-model.number="vEnd">
              <option :value="0">—</option>
              <option v-for="v in verseCount" :key="v" :value="v">{{ v }}</option>
            </select>
          </label>
        </div>
        <button class="confirm" @click="confirm">{{ t('notes.picker.insert') }}</button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  IonModal, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonIcon
} from '@ionic/vue'
import { closeOutline, arrowBack } from 'ionicons/icons'
import { useBibleStore } from '@/stores/bible'
import { getChapterCount, getVerses } from '@/lib/bible-db'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'pick'])

const { t } = useI18n()
const store = useBibleStore()

const step = ref('books')
const book = ref(null)
const chapterCount = ref(0)
const chapter = ref(0)
const verseCount = ref(0)
const vStart = ref(1)
const vEnd = ref(0)

const books = computed(() => store.books)

const headerTitle = computed(() => {
  if (step.value === 'books') return t('notes.picker.chooseBook')
  if (step.value === 'chapters') return book.value?.name ?? ''
  return `${book.value?.name} ${chapter.value}`
})

// À l'ouverture, s'assurer que les livres sont chargés et repartir de zéro.
watch(() => props.open, async (o) => {
  if (o) {
    await store.loadBooks()
    step.value = 'books'
  }
})

async function chooseBook(b) {
  book.value = b
  chapterCount.value = b.chapter_count || (await getChapterCount(store.activeVersion, b.book_id))
  step.value = 'chapters'
}

async function chooseChapter(c) {
  chapter.value = c
  const verses = await getVerses(store.activeVersion, book.value.book_id, c)
  verseCount.value = verses.length
  vStart.value = 1
  vEnd.value = 0
  step.value = 'verse'
}

function back() {
  if (step.value === 'verse') step.value = 'chapters'
  else if (step.value === 'chapters') step.value = 'books'
  else emit('close')
}

function confirm() {
  const bk = book.value
  const start = vStart.value
  const end = vEnd.value && vEnd.value > start ? vEnd.value : 0
  // Libellé lisible + réf stable "BOOK.chapter.vStart[-vEnd]".
  const range = end ? `${start}-${end}` : `${start}`
  const label = `${bk.name} ${chapter.value}:${range}`
  const ref = `${bk.book_id}.${chapter.value}.${range}`
  emit('pick', { label, ref })
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; font-size: 16px; }
.picker { --background: var(--navy); }

.list { padding: var(--space-2) 0; }
.pick-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-4) var(--space-5);
  background: none;
  border: none;
  border-bottom: 1px solid var(--gold-border);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 16px;
  cursor: pointer;
}
.pick-row:active { background: var(--card-bg); }
.pick-row .meta { color: var(--muted); font-size: 12px; }

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
  padding: var(--space-4);
}
.chip {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-sm);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 15px;
  cursor: pointer;
}
.chip:active { border-color: var(--gold); }

.verse-step { padding: var(--space-6) var(--space-5); }
.hint { color: var(--muted); font-family: var(--font-app); font-size: 13px; margin: 0 0 var(--space-4); }
.verse-fields { display: flex; gap: var(--space-4); margin-bottom: var(--space-6); }
.verse-fields label {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: var(--font-app);
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.verse-fields select {
  padding: 10px;
  background: var(--card-bg);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 16px;
}
.confirm {
  width: 100%;
  padding: 14px;
  background: var(--gold);
  border: none;
  border-radius: var(--radius-md);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>
