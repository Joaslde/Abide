<template>
  <div class="vod">
    <!-- Paysage du jour, assombri : donne du souffle au verset sans jamais
         concurrencer sa lisibilité. Bundlé → disponible hors ligne. -->
    <img class="vod-bg" :src="background" alt="" aria-hidden="true" />
    <div class="vod-scrim"></div>

    <div class="vod-inner">
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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

/**
 * Paysages de fond — bundlés par Vite (donc disponibles 100 % HORS LIGNE).
 * `eager` + `as: 'url'` : on ne récupère que les URLs (les fichiers sont émis
 * tels quels, rien n'est inliné), et la liste est connue dès le chargement —
 * pas d'attente réseau ni de chargement asynchrone à l'affichage.
 * On trie pour garantir un ordre STABLE : sans ça l'ordre du glob pourrait
 * varier entre deux builds et changer l'image d'un même jour.
 */
const BACKGROUNDS = Object.entries(
  import.meta.glob('../../assets/backgrounds/*.webp', { eager: true, as: 'url' })
)
  .sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([, url]) => url)

const ref_ = todayRef()
const text = ref('')
const bookName = ref(ref_.book_id)

/**
 * Image du jour. Le quantième de l'année fait tourner la collection : on
 * parcourt TOUTES les images avant d'en revoir une (avec 38 paysages, un même
 * fond ne revient qu'après 38 jours). Déterministe : le fond ne change pas si
 * l'utilisateur rouvre l'app dans la journée — l'écran reste « le sien ».
 */
const background = computed(() => {
  if (!BACKGROUNDS.length) return ''
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((new Date() - start) / 86400000)
  return BACKGROUNDS[dayOfYear % BACKGROUNDS.length]
})

const reference = computed(() => {
  const v = ref_.verse_end && ref_.verse_end > ref_.verse_start
    ? `${ref_.verse_start}-${ref_.verse_end}`
    : `${ref_.verse_start}`
  return `${bookName.value} ${ref_.chapter}:${v}`
})

/**
 * (Re)charge le texte dans la version ACTIVE. Rejoué à chaque changement de
 * version — pas seulement au montage — car la Bible peut basculer de langue
 * en cours de vie (ex : bascule auto quand l'utilisateur change la langue de
 * l'app et qu'une version dans cette langue est déjà installée, cf. preferences.js).
 */
async function loadText() {
  bookName.value = (await getBookName(bible.activeVersion, ref_.book_id)) || ref_.book_id
  const verses = await getVerses(bible.activeVersion, ref_.book_id, ref_.chapter)
  const end = ref_.verse_end || ref_.verse_start
  text.value = verses
    .filter((x) => x.verse >= ref_.verse_start && x.verse <= end)
    .map((x) => x.text)
    .join(' ')
}

watch(() => bible.activeVersion, loadText, { immediate: true })

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
  position: relative;
  isolation: isolate; /* confine les z-index du fond à la carte */
  overflow: hidden;
  border: 1px solid var(--gold-border-md);
  border-radius: var(--radius-md);
  /* Repli si une image manque : l'ancien dégradé reste visible. */
  background: linear-gradient(160deg, var(--navy2), var(--card-bg));
}

.vod-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* Voile sombre : plus dense en bas, là où vivent la référence et les boutons.
   Teinté navy (et pas noir pur) pour rester dans la palette de marque. */
.vod-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(
      to bottom,
      rgba(11, 22, 36, 0.62) 0%,
      rgba(11, 22, 36, 0.74) 45%,
      rgba(11, 22, 36, 0.90) 100%
    );
}

.vod-inner {
  position: relative;
  z-index: 2;
  padding: var(--space-5);
}
.vod-label {
  font-family: var(--font-app);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  /* Or clair en dur : même raison que .vod-text (fond sombre dans les 2 thèmes). */
  color: #E8C96B;
  margin: 0 0 var(--space-3);
}
.vod-text {
  font-family: var(--font-bible, var(--font-app));
  font-size: 18px;
  line-height: 1.65;
  /* ⚠️ Couleur EN DUR, pas var(--cream) : en thème clair cette variable devient
     un brun foncé, illisible sur la photo. La carte est sombre dans les DEUX
     thèmes (c'est une carte « héros », comme l'écran de bienvenue). */
  color: #F5F0E6;
  text-shadow: 0 1px 12px rgba(11, 22, 36, 0.55);
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
  color: #E8C96B; /* en dur : carte sombre dans les 2 thèmes */
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
  /* Léger effet verre sur la photo (plutôt qu'un aplat qui ferait tache). */
  background: rgba(245, 240, 230, 0.10);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(232, 201, 107, 0.34);
  border-radius: var(--radius-full);
  color: #E8C96B;
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--duration-fast);
}
.vod-meditate:active { background: var(--gold-border-md); }
.vod-meditate ion-icon { font-size: 15px; }
</style>
