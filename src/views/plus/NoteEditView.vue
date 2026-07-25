<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/plus/notes" :text="''" />
        </ion-buttons>
        <ion-title>{{ t('notes.title') }}</ion-title>
        <ion-buttons slot="end">
          <!-- Toggle : afficher le texte des versets tagués dans la note. -->
          <ion-button
            :aria-label="t('notes.toggleVerses')"
            :class="{ active: showVerses }"
            @click="toggleVerses"
          >
            <ion-icon slot="icon-only" :icon="showVerses ? eyeOutline : eyeOffOutline" />
          </ion-button>
          <ion-button :aria-label="t('notes.readMode')" @click="reading = !reading">
            <ion-icon slot="icon-only" :icon="reading ? createOutline : bookOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="note-content">
      <!-- ─────────── MODE ÉDITION ─────────── -->
      <div v-if="!reading" class="editor">
        <ion-input
          v-model="title"
          class="title-input"
          :placeholder="t('notes.titlePlaceholder')"
          @ionInput="scheduleSave"
        />
        <ion-textarea
          v-model="body"
          class="body-input"
          :auto-grow="true"
          :rows="12"
          :placeholder="t('notes.bodyPlaceholder')"
          @ionInput="onBodyInput"
        />
        <p class="tag-hint">{{ t('notes.tagHint') }}</p>
      </div>

      <!-- ─────────── MODE LECTURE ─────────── -->
      <div v-else class="reader">
        <h1 class="read-title">{{ title || t('notes.untitled') }}</h1>
        <div class="read-body">
          <template v-for="(seg, i) in segments" :key="i">
            <!-- Texte libre -->
            <span v-if="seg.type === 'text'" class="free-text">{{ seg.value }}</span>

            <!-- Tag, versets AFFICHÉS : bloc citation -->
            <span
              v-else-if="showVerses"
              class="verse-block"
              @click="goToRef(seg.ref)"
            >
              <span class="vb-ref">{{ seg.label }}</span>
              <span class="vb-text">{{ verseTexts[seg.ref] || '…' }}</span>
            </span>

            <!-- Tag, versets MASQUÉS : chip cliquable -->
            <button v-else class="tag-chip" @click="goToRef(seg.ref)">
              {{ seg.label }}
            </button>
          </template>
        </div>
      </div>
    </ion-content>

    <verse-picker-modal :open="pickerOpen" @close="pickerOpen = false" @pick="onPick" />
  </ion-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonTitle,
  IonContent, IonIcon, IonInput, IonTextarea, onIonViewWillLeave
} from '@ionic/vue'
import {
  eyeOutline, eyeOffOutline, createOutline, bookOutline
} from 'ionicons/icons'
import { getVerses } from '@/lib/bible-db'
import { useBibleStore } from '@/stores/bible'
import { getNote, saveNote } from '@/lib/user-db'
import VersePickerModal from '@/components/notes/VersePickerModal.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const bibleStore = useBibleStore()

const id = route.params.id
const title = ref('')
const body = ref('')
const showVerses = ref(false)
const reading = ref(false)
const pickerOpen = ref(false)
const verseTexts = ref({}) // ref → texte concaténé (mode affichage versets)
let prevBody = '' // pour détecter l'ajout d'un « @ »

// Un tag = @[Libellé](BOOK.chapter.range)
const TAG_RE = /@\[([^\]]+)\]\(([^)]+)\)/g

onMounted(async () => {
  const n = await getNote(id)
  if (n) {
    title.value = n.title ?? ''
    body.value = n.body ?? ''
    showVerses.value = !!n.show_verses
  }
  prevBody = body.value
})

// Sauvegarde en quittant la vue (retour arrière natif non perturbé).
onIonViewWillLeave(saveNow)

/* ─────────── Sauvegarde (debounce) ─────────── */
let saveTimer = null
function scheduleSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveNow, 600)
}
async function saveNow() {
  clearTimeout(saveTimer)
  // Ne pas créer de note vide.
  if (!title.value.trim() && !body.value.trim()) return
  await saveNote({ id, title: title.value, body: body.value, show_verses: showVerses.value })
}

/* ─────────── Détection du @ pour ouvrir le picker ─────────── */
let atPos = -1
function onBodyInput(e) {
  const val = e.detail?.value ?? body.value
  // Un seul caractère ajouté, et c'est « @ » → ouvrir le sélecteur.
  if (val.length === prevBody.length + 1) {
    // Position du caractère nouvellement inséré (diff simple).
    let i = 0
    while (i < prevBody.length && prevBody[i] === val[i]) i++
    if (val[i] === '@') {
      atPos = i
      pickerOpen.value = true
    }
  }
  prevBody = val
  scheduleSave()
}

/** Insère le tag à la place du @ déclencheur. */
function onPick({ label, ref }) {
  pickerOpen.value = false
  const tag = `@[${label}](${ref})`
  const b = body.value
  if (atPos >= 0 && b[atPos] === '@') {
    body.value = b.slice(0, atPos) + tag + b.slice(atPos + 1)
  } else {
    body.value = b + tag
  }
  prevBody = body.value
  atPos = -1
  scheduleSave()
}

/* ─────────── Rendu lecture : découpe texte / tags ─────────── */
const segments = computed(() => {
  const out = []
  let last = 0
  const src = body.value
  for (const m of src.matchAll(TAG_RE)) {
    if (m.index > last) out.push({ type: 'text', value: src.slice(last, m.index) })
    out.push({ type: 'tag', label: m[1], ref: m[2] })
    last = m.index + m[0].length
  }
  if (last < src.length) out.push({ type: 'text', value: src.slice(last) })
  return out
})

/** Parse "BOOK.chapter.vStart[-vEnd]". */
function parseRef(ref) {
  const [bookId, chapter, range] = ref.split('.')
  const [a, b] = (range || '').split('-').map(Number)
  return { bookId, chapter: Number(chapter), vStart: a || 1, vEnd: b || a || 1 }
}

/** Charge le texte des versets tagués quand l'affichage est activé. */
async function loadVerseTexts() {
  if (!showVerses.value || !reading.value) return
  for (const seg of segments.value) {
    if (seg.type !== 'tag' || verseTexts.value[seg.ref]) continue
    const { bookId, chapter, vStart, vEnd } = parseRef(seg.ref)
    const verses = await getVerses(bibleStore.activeVersion, bookId, chapter)
    const picked = verses
      .filter((v) => v.verse >= vStart && v.verse <= vEnd)
      .map((v) => `${v.verse}. ${v.text}`)
      .join(' ')
    verseTexts.value = { ...verseTexts.value, [seg.ref]: picked }
  }
}
watch([reading, showVerses, body], loadVerseTexts)

function toggleVerses() {
  showVerses.value = !showVerses.value
  scheduleSave()
  loadVerseTexts()
}

function goToRef(ref) {
  const { bookId, chapter } = parseRef(ref)
  saveNow()
  router.push(`/tabs/immersion/book/${bookId}/${chapter}`)
}
</script>

<style scoped>
ion-toolbar { --background: var(--navy2); }
ion-title { font-family: var(--font-app); font-weight: 600; font-size: 16px; }
ion-button.active { color: var(--gold); }
.note-content { --background: var(--navy); }

/* Édition */
.editor { padding: var(--space-4) var(--space-5) var(--space-10); }
.title-input {
  --background: transparent;
  --color: var(--cream);
  --placeholder-color: var(--muted);
  --padding-start: 0;
  --padding-end: 0;
  font-family: var(--font-app);
  font-size: 22px;
  font-weight: 600;
  margin-bottom: var(--space-2);
  border-bottom: 1px solid var(--gold-border);
}
.body-input {
  --background: transparent;
  --color: var(--cream);
  --placeholder-color: var(--muted);
  --padding-start: 0;
  --padding-end: 0;
  font-family: var(--font-app);
  font-size: 16px;
  line-height: 1.7;
  margin-top: var(--space-2);
}
.tag-hint {
  color: var(--muted);
  font-family: var(--font-app);
  font-size: 12px;
  margin-top: var(--space-3);
}

/* Lecture */
.reader { padding: var(--space-5) var(--space-5) var(--space-10); }
.read-title {
  font-family: var(--font-app);
  font-size: 24px;
  font-weight: 600;
  color: var(--cream);
  margin: 0 0 var(--space-4);
}
.read-body {
  font-family: var(--font-app);
  font-size: 16px;
  line-height: 1.8;
  color: var(--cream);
  white-space: pre-wrap;
}
.free-text { white-space: pre-wrap; }

/* Tag chip (versets masqués) */
.tag-chip {
  display: inline;
  background: var(--gold-border);
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-full);
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 14px;
  font-weight: 600;
  padding: 2px 10px;
  margin: 0 2px;
  cursor: pointer;
}

/* Bloc citation (versets affichés) — différencié du texte de l'utilisateur. */
.verse-block {
  display: block;
  margin: var(--space-3) auto;
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid var(--gold);
  background: var(--card-bg);
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: center;
}
.vb-ref {
  display: block;
  font-family: var(--font-app);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--gold);
  margin-bottom: 4px;
}
.vb-text {
  display: block;
  font-family: var(--font-bible, var(--font-app));
  font-style: italic;
  font-size: 15px;
  line-height: 1.6;
  color: var(--cream);
}
</style>
