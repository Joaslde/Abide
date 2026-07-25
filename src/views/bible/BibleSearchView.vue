<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="close" :aria-label="t('common.back')">
            <ion-icon slot="icon-only" :icon="arrowBack" />
          </ion-button>
        </ion-buttons>
        <!-- Champ de recherche : filtre les livres en direct (LIKE). -->
        <div class="search-field">
          <ion-icon :icon="searchOutline" class="search-icon" />
          <input
            ref="inputRef"
            v-model="query"
            class="search-input"
            :placeholder="t('bible.search.placeholder')"
            autocapitalize="words"
            autocomplete="off"
            spellcheck="false"
          />
          <button v-if="query" class="clear" :aria-label="t('common.close')" @click="query = ''">
            <ion-icon :icon="closeCircle" />
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Résultats en direct -->
      <div class="results">
        <button
          v-for="book in results"
          :key="book.book_id"
          class="result-row"
          @click="openBook(book.book_id)"
        >
          <div class="result-main">
            <span class="result-name">{{ book.name }}</span>
            <span class="result-testament">{{ testamentLabel(book.testament) }}</span>
          </div>
          <span class="result-meta">{{ book.chapter_count }} {{ t('bible.chapters') }}</span>
        </button>

        <p v-if="query && results.length === 0" class="empty">
          {{ t('bible.search.noResults', { query }) }}
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonContent, IonIcon
} from '@ionic/vue'
import { arrowBack, searchOutline, closeCircle } from 'ionicons/icons'
import { useBibleStore } from '@/stores/bible'

const { t } = useI18n()
const router = useRouter()
const store = useBibleStore()

const query = ref('')
const inputRef = ref(null)

/** Normalise pour une recherche insensible à la casse ET aux accents. */
function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

// Filtre les livres de la version active (LIKE sur le nom, ordre canonique).
const results = computed(() => {
  const q = normalize(query.value)
  if (!q) return store.books
  return store.books.filter((b) => normalize(b.name).includes(q))
})

function testamentLabel(t2) {
  return t2 === 'OT' ? t('bible.oldTestament') : t('bible.newTestament')
}

onMounted(async () => {
  await store.loadBooks()
  // Focus auto sur le champ pour taper immédiatement.
  await nextTick()
  inputRef.value?.focus()
})

function openBook(bookId) {
  store.setBook(bookId)
  // replace : la recherche ne reste pas dans l'historique (retour = accueil Bible).
  router.replace(`/tabs/immersion/book/${bookId}`)
}

function close() {
  router.back()
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }

.search-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  height: 40px;
  padding: 0 12px;
  margin: 0 var(--space-2);
  background: var(--card-bg);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
}
.search-icon { font-size: 18px; color: var(--gold); flex-shrink: 0; }
.search-input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 15px;
}
.search-input::placeholder { color: var(--muted); }
.clear {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 18px;
  display: flex;
  cursor: pointer;
  flex-shrink: 0;
}

.results {
  padding: var(--space-2) var(--space-4) var(--space-8);
}
.result-row {
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
.result-row:active { background: var(--card-bg); }
.result-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.result-name {
  font-family: var(--font-app);
  font-size: 17px;
  color: var(--cream);
}
.result-testament {
  font-family: var(--font-app);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.result-meta {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.05em;
  color: var(--muted);
}

.empty {
  text-align: center;
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 14px;
  padding: var(--space-10) var(--space-5);
  line-height: 1.5;
}
</style>
