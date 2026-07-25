<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/sanctuaire" :text="''" />
        </ion-buttons>
        <ion-title>{{ t(`sanctuaire.moment.${type}Title`) }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="flow">
        <!-- Salutation -->
        <p class="greet">{{ greeting }}</p>

        <!-- 1. Le verset du jour -->
        <section class="block">
          <span class="block-label">{{ t('home.verseOfDay') }}</span>
          <p class="verse-text">« {{ verseText }} »</p>
          <button class="verse-ref" @click="openVerse">{{ reference }} →</button>
        </section>

        <!-- 2. La prière guidée du moment -->
        <section class="block">
          <span class="block-label">{{ t(`sanctuaire.moment.${type}Prayer`) }}</span>
          <p class="prayer-text">{{ prayerText }}</p>
        </section>

        <!-- 3. Mes sujets de prière (cocher = « j'ai prié pour ») -->
        <section v-if="prayer.activePrayers.length" class="block">
          <span class="block-label">{{ t('sanctuaire.moment.subjects') }}</span>
          <label v-for="p in prayer.activePrayers" :key="p.id" class="subject">
            <input type="checkbox" v-model="prayed[p.id]" />
            <span :class="{ prayed: prayed[p.id] }">{{ p.content }}</span>
          </label>
        </section>

        <!-- 4. Prière personnalisée (IA, en ligne) -->
        <button class="ai-btn" @click="personalPrayer">
          <ion-icon :icon="sparklesOutline" />
          <span>{{ t('sanctuaire.moment.aiPrayer') }}</span>
        </button>

        <!-- 5. Amen -->
        <button class="amen-btn" :disabled="done" @click="amen">
          <ion-icon v-if="done" :icon="checkmarkCircle" />
          <span>{{ done ? t('sanctuaire.moment.doneToday') : t('sanctuaire.moment.amen') }}</span>
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonIcon, toastController
} from '@ionic/vue'
import { sparklesOutline, checkmarkCircle } from 'ionicons/icons'
import { usePrayerStore } from '@/stores/prayer'
import { useBibleStore } from '@/stores/bible'
import { useAuthStore } from '@/stores/auth'
import { getVerses, getBookName } from '@/lib/bible-db'
import { todayRef } from '@/data/verseOfDay'
import { prayerOfDay } from '@/data/prayerPool'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const prayer = usePrayerStore()
const bible = useBibleStore()
const auth = useAuthStore()

const type = computed(() => (route.query.type === 'evening' ? 'evening' : 'morning'))
const done = computed(() => prayer.momentDoneToday(type.value))

/** Salutation avec prénom (repli gracieux — règle de marque). */
const greeting = computed(() => {
  const base = t(`sanctuaire.moment.${type.value}Greeting`)
  return auth.firstName ? `${base}, ${auth.firstName}.` : `${base}.`
})

/* ── Verset du jour (même mécanisme que la carte de l'Accueil) ── */
const vRef = todayRef()
const verseText = ref('…')
const bookName = ref(vRef.book_id)
const reference = computed(() => {
  const v = vRef.verse_end && vRef.verse_end > vRef.verse_start
    ? `${vRef.verse_start}-${vRef.verse_end}`
    : `${vRef.verse_start}`
  return `${bookName.value} ${vRef.chapter}:${v}`
})

/* ── Prière du pool (déterministe par date) ── */
const prayerText = computed(() => prayerOfDay(type.value, locale.value))

/* ── Sujets cochés (état visuel de la session, non persisté) ── */
const prayed = reactive({})

onMounted(async () => {
  await prayer.load()
  bookName.value = (await getBookName(bible.activeVersion, vRef.book_id)) || vRef.book_id
  const verses = await getVerses(bible.activeVersion, vRef.book_id, vRef.chapter)
  const end = vRef.verse_end || vRef.verse_start
  verseText.value = verses
    .filter((x) => x.verse >= vRef.verse_start && x.verse <= end)
    .map((x) => x.text)
    .join(' ')
})

function openVerse() {
  bible.setBook(vRef.book_id)
  router.push(`/tabs/immersion/book/${vRef.book_id}/${vRef.chapter}?v=${vRef.verse_start}`)
}

/** « ✨ prière personnalisée » → l'Ancre (mode méditation) préremplie. */
function personalPrayer() {
  const prompt = t('sanctuaire.moment.aiPrefill', { reference: reference.value, verse: verseText.value })
  router.push({ path: '/tabs/ancre', query: { prefill: prompt, mode: 'meditation' } })
}

async function amen() {
  await prayer.completeMoment(type.value)
  const toast = await toastController.create({
    message: t('sanctuaire.moment.amenToast'),
    duration: 2000,
    position: 'bottom'
  })
  await toast.present()
  router.back()
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; }

.flow {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-5) var(--space-10);
}

.greet {
  margin: 0;
  font-family: var(--font-app);
  font-size: 22px;
  font-weight: 300;
  color: var(--cream);
}

.block {
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-4);
}
.block-label {
  display: block;
  font-family: var(--font-app);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 10px;
}
.verse-text {
  margin: 0 0 8px;
  font-family: var(--font-bible, var(--font-app));
  font-size: 17px;
  line-height: 1.7;
  color: var(--cream);
}
.verse-ref {
  background: none; border: none; padding: 0;
  font-family: var(--font-app);
  font-size: 13px; font-weight: 600;
  color: var(--gold);
  cursor: pointer;
}
.prayer-text {
  margin: 0;
  font-family: var(--font-app);
  font-size: 15px;
  line-height: 1.7;
  font-style: italic;
  color: var(--cream);
}

.subject {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
}
.subject input {
  margin-top: 3px;
  accent-color: var(--gold);
  width: 17px; height: 17px;
  flex-shrink: 0;
}
.subject span {
  font-family: var(--font-app);
  font-size: 15px;
  color: var(--cream);
  line-height: 1.5;
}
.subject span.prayed { opacity: 0.55; text-decoration: line-through; }

.ai-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px;
  background: var(--gold-border);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 14px; font-weight: 600;
  cursor: pointer;
}
.ai-btn ion-icon { font-size: 17px; }

.amen-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 15px;
  background: var(--gold);
  border: none;
  border-radius: var(--radius-full);
  color: var(--navy);
  font-family: var(--font-app);
  font-size: 16px; font-weight: 700;
  cursor: pointer;
}
.amen-btn:disabled { opacity: 0.55; cursor: default; }
.amen-btn ion-icon { font-size: 20px; }
</style>
