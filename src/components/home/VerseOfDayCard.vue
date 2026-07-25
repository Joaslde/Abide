<template>
  <div class="vod">
    <p class="vod-label">{{ t('home.verseOfDay') }}</p>
    <p class="vod-text">« {{ text || '…' }} »</p>
    <div class="vod-actions">
      <button class="vod-ref" @click="open">
        {{ reference }}
        <ion-icon :icon="arrowForward" />
      </button>
      <!-- Méditer ce verset avec le Guide IA (mode méditation, verset prérempli). -->
      <button class="vod-meditate" @click="meditate">
        <ion-icon :icon="sparklesOutline" />
        <span>{{ t('home.meditateWithGuide') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { arrowForward, sparklesOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useBibleStore } from '@/stores/bible'
import { getVerses, getBookName } from '@/lib/bible-db'
import { todayRef } from '@/data/verseOfDay'

const { t } = useI18n()
const router = useRouter()
const bible = useBibleStore()

const ref_ = todayRef()
const text = ref('')
const bookName = ref(ref_.book_id)

const reference = computed(() => {
  const v = ref_.verse_end && ref_.verse_end > ref_.verse_start
    ? `${ref_.verse_start}-${ref_.verse_end}`
    : `${ref_.verse_start}`
  return `${bookName.value} ${ref_.chapter}:${v}`
})

onMounted(async () => {
  bookName.value = (await getBookName(bible.activeVersion, ref_.book_id)) || ref_.book_id
  const verses = await getVerses(bible.activeVersion, ref_.book_id, ref_.chapter)
  const end = ref_.verse_end || ref_.verse_start
  text.value = verses
    .filter((x) => x.verse >= ref_.verse_start && x.verse <= end)
    .map((x) => x.text)
    .join(' ')
})

/** Ouvre la Bible au chapitre du passage (le lecteur scrolle au verset). */
function open() {
  router.push(`/tabs/immersion/book/${ref_.book_id}/${ref_.chapter}`)
}

/** Ouvre le Guide IA en mode MÉDITATION, avec ce verset déjà dans le champ. */
function meditate() {
  const prefill = `« ${text.value} »\n— ${reference.value}\n\n`
  router.push({ path: '/tabs/ancre', query: { prefill, mode: 'meditation' } })
}
</script>

<style scoped>
.vod {
  background: linear-gradient(160deg, var(--navy2), var(--card-bg));
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  padding: var(--space-5);
}
.vod-label {
  font-family: var(--font-app);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 var(--space-3);
}
.vod-text {
  font-family: var(--font-bible, var(--font-app));
  font-size: 18px;
  line-height: 1.65;
  color: var(--cream);
  margin: 0 0 var(--space-4);
}
.vod-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.vod-ref {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.vod-ref ion-icon { font-size: 15px; }

/* Méditer avec le Guide IA */
.vod-meditate {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--gold-border);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--duration-fast);
}
.vod-meditate:active { background: var(--gold-border-md); }
.vod-meditate ion-icon { font-size: 15px; }
</style>
