<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/immersion/plan" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('plan.custom.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="setup">
        <!-- Portée -->
        <section class="block">
          <p class="block-label">{{ t('plan.scope') }}</p>
          <div class="scope-list">
            <button
              v-for="s in scopes"
              :key="s"
              class="scope"
              :class="{ active: scope === s }"
              @click="scope = s"
            >
              <span class="scope-name">{{ t('plan.scopes.' + s) }}</span>
              <ion-icon v-if="scope === s" :icon="checkmarkCircle" />
            </button>
          </div>

          <!-- Choix du livre si portée = « un livre » -->
          <ion-select
            v-if="scope === 'book'"
            v-model="bookId"
            class="book-select"
            :placeholder="t('plan.custom.pickBook')"
            interface="action-sheet"
          >
            <ion-select-option v-for="b in books" :key="b.id" :value="b.id">
              {{ b.name }}
            </ion-select-option>
          </ion-select>
        </section>

        <!-- Durée -->
        <section class="block">
          <p class="block-label">{{ t('plan.duration') }}</p>
          <div class="cards">
            <button
              v-for="d in presetDays"
              :key="d"
              class="card"
              :class="{ active: !customDays && days === d }"
              @click="setDays(d)"
            >
              <span class="card-num">{{ d }}</span>
              <span class="card-unit">{{ t('plan.days', { n: d }, d) }}</span>
            </button>
          </div>
          <!-- Durée libre -->
          <div class="free-days">
            <span>{{ t('plan.custom.customDays') }}</span>
            <ion-input
              v-model.number="customDays"
              type="number"
              inputmode="numeric"
              min="1"
              max="365"
              class="days-input"
              :placeholder="'—'"
            />
          </div>
        </section>

        <button class="create" :disabled="!canCreate" @click="create">
          {{ t('plan.create') }}
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonIcon,
  IonSelect, IonSelectOption, IonInput
} from '@ionic/vue'
import { checkmarkCircle } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { usePlanStore } from '@/stores/plan'
import { useBibleStore } from '@/stores/bible'
import { getBooks } from '@/lib/bible-db'

const { t } = useI18n()
const router = useRouter()
const plan = usePlanStore()
const bible = useBibleStore()

const scopes = ['full', 'ot', 'nt', 'psalms', 'book']
const presetDays = [7, 30, 90]

const scope = ref('nt')
const days = ref(30)
const customDays = ref(null)
const bookId = ref(null)
const books = ref([])

onMounted(async () => {
  books.value = await getBooks(bible.activeVersion)
})

const effectiveDays = computed(() => {
  const c = Number(customDays.value)
  return c && c > 0 ? Math.min(365, c) : days.value
})

const canCreate = computed(() => {
  if (scope.value === 'book' && !bookId.value) return false
  return effectiveDays.value > 0
})

function setDays(d) {
  days.value = d
  customDays.value = null
}

async function create() {
  if (!canCreate.value) return
  await plan.createPlan({
    source: 'custom',
    scope: scope.value,
    bookId: scope.value === 'book' ? bookId.value : null,
    days: effectiveDays.value
  })
  router.replace('/tabs/home')
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; font-size: 16px; }
ion-content { --background: var(--navy); }

.setup { padding: var(--space-5); }
.block { margin-bottom: var(--space-6); }
.block-label {
  font-family: var(--font-app);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 var(--space-3);
}

.scope-list { display: flex; flex-direction: column; gap: var(--space-2); }
.scope {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 15px;
  cursor: pointer;
}
.scope.active { border-color: var(--gold); }
.scope ion-icon { color: var(--gold); font-size: 20px; }

.book-select {
  margin-top: var(--space-3);
  --background: var(--card-bg);
  --color: var(--cream);
  --padding-start: var(--space-4);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  font-family: var(--font-app);
}

.cards { display: flex; gap: var(--space-3); }
.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-4);
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--duration-fast);
}
.card.active { border-color: var(--gold); }
.card-num { font-family: var(--font-app); font-size: 24px; font-weight: 700; color: var(--cream); }
.card.active .card-num { color: var(--gold); }
.card-unit { font-family: var(--font-app); font-size: 11px; color: var(--muted); }

.free-days {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 14px;
}
.days-input {
  --color: var(--cream);
  max-width: 90px;
  text-align: right;
  font-family: var(--font-app);
}

.create {
  width: 100%;
  padding: 15px;
  background: var(--gold);
  border: none;
  border-radius: var(--radius-md);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: var(--space-2);
}
.create:disabled { opacity: 0.5; }
</style>
