<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/sanctuaire" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('sanctuaire.journal.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="wrap">
        <!-- Ajout d'un sujet -->
        <div class="add-row">
          <div class="add-pill">
            <ion-input
              v-model="draft"
              class="add-input"
              :placeholder="t('sanctuaire.journal.placeholder')"
              :maxlength="300"
              @keyup.enter="add"
            />
          </div>
          <button class="add-btn" :disabled="!draft.trim()" :aria-label="t('sanctuaire.journal.add')" @click="add">
            <ion-icon :icon="addOutline" />
          </button>
        </div>

        <!-- Sujets portés -->
        <p v-if="prayer.activePrayers.length === 0 && prayer.answeredTimeline.length === 0" class="empty">
          {{ t('sanctuaire.journal.empty') }}
        </p>

        <ion-list v-if="prayer.activePrayers.length" lines="none" class="plist">
          <ion-item-sliding v-for="p in prayer.activePrayers" :key="p.id">
            <ion-item class="pitem">
              <ion-label class="ptext">{{ p.content }}</ion-label>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option class="opt-answered" @click="markAnswered(p.id)">
                <ion-icon slot="icon-only" :icon="checkmarkDoneOutline" />
              </ion-item-option>
              <ion-item-option color="danger" @click="remove(p.id)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
        <p v-if="prayer.activePrayers.length" class="hint">{{ t('sanctuaire.journal.swipeHint') }}</p>

        <!-- Timeline de gratitude (exaucées) -->
        <section v-if="prayer.answeredTimeline.length" class="answered">
          <span class="block-label">{{ t('sanctuaire.journal.answeredTitle') }}</span>
          <div v-for="p in prayer.answeredTimeline" :key="p.id" class="answered-item">
            <ion-icon :icon="checkmarkCircle" class="answered-ico" />
            <div class="answered-main">
              <p class="answered-text">{{ p.content }}</p>
              <span class="answered-date">{{ formatDate(p.answered_at) }}</span>
            </div>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent,
  IonInput, IonList, IonItem, IonItemSliding, IonItemOptions, IonItemOption,
  IonLabel, IonIcon, toastController, onIonViewWillEnter
} from '@ionic/vue'
import {
  addOutline, trashOutline, checkmarkDoneOutline, checkmarkCircle
} from 'ionicons/icons'
import { usePrayerStore } from '@/stores/prayer'

const { t, locale } = useI18n()
const prayer = usePrayerStore()
const draft = ref('')

onIonViewWillEnter(() => prayer.load())

async function add() {
  const text = draft.value.trim()
  if (!text) return
  draft.value = ''
  await prayer.add(text)
}

async function markAnswered(id) {
  await prayer.markAnswered(id)
  const toast = await toastController.create({
    message: t('sanctuaire.journal.answeredToast'),
    duration: 2000,
    position: 'bottom'
  })
  await toast.present()
}

async function remove(id) {
  await prayer.remove(id)
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; }

.wrap { padding: var(--space-4) var(--space-4) var(--space-10); }

.add-row { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4); }
.add-pill {
  flex: 1;
  background: var(--card-bg);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  padding: 2px 8px;
}
.add-input {
  --background: transparent;
  --color: var(--cream);
  --placeholder-color: var(--muted);
  --padding-start: 8px;
  font-family: var(--font-app);
  font-size: 15px;
}
.add-btn {
  width: 44px; height: 44px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--gold);
  border: none; border-radius: 50%;
  color: var(--navy);
  cursor: pointer;
}
.add-btn:disabled { opacity: 0.4; }
.add-btn ion-icon { font-size: 22px; }

.empty {
  text-align: center;
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 14px;
  line-height: 1.6;
  padding: var(--space-8) var(--space-4);
}

.plist { background: transparent; }
.pitem {
  --background: var(--card-bg);
  --color: var(--cream);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
}
.ptext { font-family: var(--font-app); font-size: 15px; white-space: normal; }
.opt-answered { --background: #3e7a4e; color: #fff; }

.hint {
  margin: 4px 2px 0;
  font-family: var(--font-app);
  font-size: 12px;
  color: var(--muted);
}

.answered { margin-top: var(--space-6); }
.block-label {
  display: block;
  font-family: var(--font-app);
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gold);
  margin-bottom: var(--space-3);
}
.answered-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: var(--space-3) 2px;
  border-bottom: 1px solid var(--gold-border);
}
.answered-ico { font-size: 18px; color: var(--gold); flex-shrink: 0; margin-top: 2px; }
.answered-main { min-width: 0; }
.answered-text {
  margin: 0 0 2px;
  font-family: var(--font-app);
  font-size: 14px;
  color: var(--cream);
  line-height: 1.5;
}
.answered-date { font-family: var(--font-app); font-size: 12px; color: var(--muted); }
</style>
