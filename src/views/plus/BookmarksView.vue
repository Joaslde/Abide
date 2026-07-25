<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/plus" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('plus.bookmarks') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="items.length === 0" class="empty">{{ t('plus.emptyBookmarks') }}</div>

      <ion-list v-else lines="none">
        <ion-item-sliding v-for="b in items" :key="b.id">
          <ion-item button class="row" @click="openChapter(b)">
            <ion-icon :icon="bookmark" class="bm-icon" />
            <div class="row-main">
              <span class="ref">{{ b.book_name }} {{ b.chapter }}</span>
              <span class="text">{{ b.snippet }}</span>
            </div>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger" @click="remove(b)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
  IonList, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon
} from '@ionic/vue'
import { bookmark, trashOutline } from 'ionicons/icons'
import { listBookmarks, toggleBookmark } from '@/lib/user-db'

const { t } = useI18n()
const router = useRouter()
const items = ref([])

async function refresh() {
  items.value = await listBookmarks()
}
onMounted(refresh)

function openChapter(b) {
  router.push(`/tabs/immersion/book/${b.book_id}/${b.chapter}`)
}

async function remove(b) {
  // toggle sur un signet existant = suppression.
  await toggleBookmark({
    version_id: b.version_id, book_id: b.book_id, book_name: b.book_name, chapter: b.chapter
  })
  await refresh()
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; }
ion-content { --background: var(--navy); }
ion-list { background: transparent; }

.empty {
  text-align: center;
  color: var(--muted);
  font-family: var(--font-app);
  padding: var(--space-12) var(--space-5);
}

.row { --background: transparent; --border-color: var(--gold-border); }
.bm-icon { color: var(--gold); font-size: 18px; margin-right: var(--space-3); flex-shrink: 0; }
.row-main { display: flex; flex-direction: column; gap: 3px; padding: var(--space-2) 0; }
.ref {
  font-family: var(--font-app);
  font-size: 16px;
  font-weight: 600;
  color: var(--cream);
}
.text {
  font-family: var(--font-app);
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
