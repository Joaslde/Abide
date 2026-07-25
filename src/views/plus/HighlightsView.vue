<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/plus" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('plus.highlights') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="items.length === 0" class="empty">{{ t('plus.emptyHighlights') }}</div>

      <ion-list v-else lines="none">
        <ion-item-sliding v-for="h in items" :key="h.id">
          <ion-item button class="row" @click="openChapter(h)">
            <div class="dot" :style="{ background: h.color }" />
            <div class="row-main">
              <span class="ref">{{ h.book_name }} {{ h.chapter }}:{{ h.verse }}</span>
              <span class="text">{{ h.text }}</span>
            </div>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger" @click="remove(h.id)">
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
import { trashOutline } from 'ionicons/icons'
import { useUserDataStore } from '@/stores/userData'

const { t } = useI18n()
const router = useRouter()
const userData = useUserDataStore()
const items = ref([])

async function refresh() {
  items.value = await userData.listAllHighlights()
}
onMounted(refresh)

function openChapter(h) {
  router.push(`/tabs/immersion/book/${h.book_id}/${h.chapter}`)
}

async function remove(id) {
  await userData.removeHighlight(id)
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
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: var(--space-3);
  flex-shrink: 0;
}
.row-main { display: flex; flex-direction: column; gap: 3px; padding: var(--space-2) 0; }
.ref {
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 600;
  color: var(--gold);
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
