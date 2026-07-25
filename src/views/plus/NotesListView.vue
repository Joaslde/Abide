<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/plus" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('plus.notes') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="notes.length === 0" class="empty">{{ t('notes.empty') }}</div>

      <ion-list v-else lines="none">
        <ion-item-sliding v-for="n in notes" :key="n.id">
          <ion-item button class="row" @click="open(n.id)">
            <ion-icon :icon="n.source === 'ai' ? sparkles : documentTextOutline" class="n-icon" />
            <div class="row-main">
              <span class="n-title-row">
                <span class="n-title">{{ n.title || t('notes.untitled') }}</span>
                <span v-if="n.source === 'ai'" class="ai-badge">{{ t('notes.aiBadge') }}</span>
              </span>
              <span class="n-snippet">{{ preview(n.body) }}</span>
            </div>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger" @click="remove(n.id)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button class="add-fab" :aria-label="t('notes.new')" @click="create">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
  IonList, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon,
  IonFab, IonFabButton, onIonViewWillEnter
} from '@ionic/vue'
import { documentTextOutline, trashOutline, add, sparkles } from 'ionicons/icons'
import { listNotes, deleteNote } from '@/lib/user-db'

const { t } = useI18n()
const router = useRouter()
const notes = ref([])

async function refresh() {
  notes.value = await listNotes()
}
// Recharge à chaque entrée dans la vue (retour depuis l'éditeur).
onIonViewWillEnter(refresh)

/** Enlève les tags @[libellé](réf) de l'aperçu → garde juste le libellé. */
function preview(body) {
  if (!body) return ''
  return body.replace(/@\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 90)
}

function create() {
  // Nouvel id ; l'éditeur crée la note à la 1re sauvegarde.
  router.push(`/tabs/plus/notes/${Date.now().toString(36)}`)
}

function open(id) {
  router.push(`/tabs/plus/notes/${id}`)
}

async function remove(id) {
  await deleteNote(id)
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
.n-icon { color: var(--gold); font-size: 20px; margin-right: var(--space-3); flex-shrink: 0; }
.row-main { display: flex; flex-direction: column; gap: 3px; padding: var(--space-2) 0; min-width: 0; }
.n-title-row { display: flex; align-items: center; gap: var(--space-2); min-width: 0; }
.n-title {
  font-family: var(--font-app);
  font-size: 16px;
  font-weight: 600;
  color: var(--cream);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Badge « créée par le Guide » (doré, cohérent avec l'icône sparkles). */
.ai-badge {
  flex-shrink: 0;
  font-family: var(--font-app);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--gold);
  background: var(--gold-border);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  padding: 1px 7px;
}
.n-snippet {
  font-family: var(--font-app);
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.add-fab {
  --background: var(--gold);
  --color: var(--navy);
  --box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}
</style>
