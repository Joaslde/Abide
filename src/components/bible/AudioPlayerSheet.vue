<template>
  <!-- Panneau lecteur audio global (style YouVersion) : étendu = panneau complet
       qui sort du bas ; replié = mini-barre. Monté dans App.vue, survit à la
       navigation. Visible seulement quand une piste est chargée. -->
  <teleport to="body">
    <!-- Voile : un tap à l'extérieur du panneau étendu le replie en mini-barre. -->
    <transition name="scrim-fade">
      <div
        v-if="audio.currentUrl && audio.expanded"
        class="sheet-scrim"
        @click="audio.expanded = false"
      />
    </transition>

    <transition name="sheet-slide">
      <div
        v-if="audio.currentUrl"
        class="player-sheet"
        :class="{ expanded: audio.expanded, dragging: dragY > 0 }"
        :style="audio.expanded && dragY ? { transform: `translateY(${dragY}px)` } : null"
      >
        <!-- ═══════════════ ÉTAT ÉTENDU ═══════════════ -->
        <div v-if="audio.expanded" class="full">
          <!-- Poignée + replier : cliquable ET glissable vers le bas pour fermer. -->
          <button
            class="collapse-btn"
            :aria-label="t('bible.audio.collapse')"
            @click="audio.expanded = false"
            @touchstart.passive="onDragStart"
            @touchmove.passive="onDragMove"
            @touchend="onDragEnd"
          >
            <div class="handle" />
            <ion-icon :icon="chevronDownOutline" />
          </button>

          <!-- Titre + source -->
          <h2 ref="fullTitleEl" class="title">{{ shortBookName }} {{ audio.currentChapter }}</h2>
          <p class="copyright">{{ audio.copyright }}</p>

          <!-- Cercle téléchargement (livre entier, offline) + musique de fond côte à côte -->
          <div class="dl-music-row">
            <download-circle
              v-if="audio.currentBook"
              :version-id="audio.versionId"
              :book-id="audio.currentBook"
              :book-name="audio.currentBookName"
            />
            <!-- Musique de fond : rond + label ON/OFF. Trait barré quand OFF. -->
            <button
              class="music-circle-wrap"
              :aria-label="t('bible.audio.bgMusic')"
              @click="bgMusic.toggle()"
            >
              <span class="music-circle" :class="{ off: !bgMusic.enabled }">
                <ion-icon :icon="musicalNotes" />
              </span>
              <span class="music-label">{{ bgMusic.enabled ? t('bible.audio.on') : t('bible.audio.off') }}</span>
            </button>
          </div>

          <!-- Contrôles principaux -->
          <div class="main-controls">
            <button class="ctrl" :aria-label="t('bible.previousChapter')" @click="player.prevChapter()">
              <ion-icon :icon="playSkipBack" />
            </button>
            <button class="ctrl" :aria-label="t('bible.audio.back15')" @click="player.seekBy(-15)">
              <ion-icon :icon="playBack" />
              <span class="skip-num">15</span>
            </button>
            <button class="ctrl play-big" :aria-label="audio.isPlaying ? t('bible.audio.pause') : t('bible.audio.play')" @click="player.togglePlay()">
              <ion-icon :icon="audio.isLoading ? ellipsisHorizontal : (audio.isPlaying ? pause : play)" />
            </button>
            <button class="ctrl" :aria-label="t('bible.audio.fwd15')" @click="player.seekBy(15)">
              <ion-icon :icon="playForward" />
              <span class="skip-num">15</span>
            </button>
            <button class="ctrl" :aria-label="t('bible.nextChapter')" @click="player.nextChapter()">
              <ion-icon :icon="playSkipForward" />
            </button>
          </div>

          <!-- Progression avec bille + temps -->
          <div class="progress-row">
            <span class="time">{{ fmt(audio.position) }}</span>
            <input
              class="range"
              type="range"
              min="0"
              :max="audio.duration || 0"
              step="0.1"
              :value="audio.position"
              :aria-label="t('bible.audio.progress')"
              @input="onSeekInput"
            />
            <span class="time">{{ fmt(audio.duration) }}</span>
          </div>

          <!-- Bas : vitesse (encerclée) + Mes téléchargements + fermer -->
          <div class="bottom-row">
            <button class="speed-circle" :aria-label="t('bible.audio.speed')" @click="player.cycleSpeed()">
              {{ audio.playbackSpeed }}x
            </button>
            <button class="downloads-btn" @click="openDownloads">
              <ion-icon :icon="folderOpenOutline" />
              <span>{{ t('bible.audio.myDownloads') }}</span>
            </button>
            <button class="close-circle" :aria-label="t('common.close')" @click="player.stop()">
              <ion-icon :icon="closeOutline" />
            </button>
          </div>
        </div>

        <!-- ═══════════════ ÉTAT REPLIÉ (mini-barre) ═══════════════ -->
        <div v-else class="mini">
          <!-- Progression fine avec bille -->
          <input
            class="range mini-range"
            type="range"
            min="0"
            :max="audio.duration || 0"
            step="0.1"
            :value="audio.position"
            :aria-label="t('bible.audio.progress')"
            @input="onSeekInput"
          />

          <div class="mini-body">
            <button class="expand-btn" :aria-label="t('bible.audio.expand')" @click="audio.expanded = true">
              <ion-icon :icon="chevronUpOutline" />
            </button>

            <!-- Tap sur le nom du livre = agrandir le panneau (comme le bouton). -->
            <button class="track-info" @click="audio.expanded = true">
              <span ref="miniTitleEl" class="track-title">{{ shortBookName }} {{ audio.currentChapter }}</span>
              <span class="track-copyright">{{ audio.copyright }}</span>
            </button>

            <div class="mini-controls">
              <button class="ctrl speed" :aria-label="t('bible.audio.speed')" @click="player.cycleSpeed()">
                {{ audio.playbackSpeed }}x
              </button>
              <button class="ctrl" :aria-label="t('bible.audio.back15')" @click="player.seekBy(-15)">
                <ion-icon :icon="playBack" />
                <span class="skip-num">15</span>
              </button>
              <button class="ctrl mini-play" :aria-label="audio.isPlaying ? t('bible.audio.pause') : t('bible.audio.play')" @click="player.togglePlay()">
                <ion-icon :icon="audio.isLoading ? ellipsisHorizontal : (audio.isPlaying ? pause : play)" />
              </button>
              <button class="ctrl" :aria-label="t('bible.audio.fwd15')" @click="player.seekBy(15)">
                <ion-icon :icon="playForward" />
                <span class="skip-num">15</span>
              </button>
              <button class="ctrl" :aria-label="t('common.close')" @click="player.stop()">
                <ion-icon :icon="closeOutline" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Store des téléchargements -->
    <audio-downloads-modal />
  </teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useFitText } from '@/composables/useFitText'
import { displayBookName } from '@/lib/book-display-name'
import { useRoute } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import {
  play, pause, playBack, playForward, playSkipBack, playSkipForward,
  closeOutline, ellipsisHorizontal, chevronDownOutline, chevronUpOutline,
  folderOpenOutline, musicalNotes
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useAudioStore } from '@/stores/audio'
import { useBackgroundMusicStore } from '@/stores/backgroundMusic'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import DownloadCircle from '@/components/bible/DownloadCircle.vue'
import AudioDownloadsModal from '@/components/bible/AudioDownloadsModal.vue'

const { t, locale } = useI18n()
const route = useRoute()
const audio = useAudioStore()

/**
 * Titres du lecteur : la taille suit la LONGUEUR du nom, pas la largeur d'écran.
 * La mini-barre partage sa ligne avec six contrôles — « Proverbes 21 » y était
 * tronqué en « Proverbe… ». Re-mesuré à chaque changement de chapitre.
 */
const fullTitleEl = ref(null)
const miniTitleEl = ref(null)

/**
 * Nom abrégé : « Cantique des Cantiques 8 » (24 caractères) ne tient dans
 * aucune des deux barres, même réduit au plancher de lisibilité. On l'abrège
 * en « Cantiques 8 », comme le font les Bibles papier.
 */
const shortBookName = computed(() =>
  displayBookName(null, audio.currentBookName, locale.value)
)

const titleSources = [shortBookName, () => audio.currentChapter]
useFitText(fullTitleEl, { max: 24, min: 15, watch: titleSources })
useFitText(miniTitleEl, { max: 13, min: 9.5, step: 0.25, watch: titleSources })
const bgMusic = useBackgroundMusicStore()
const player = useAudioPlayer()

// Quitter la vue chapitre → replier le panneau en mini-barre (la lecture continue).
watch(() => route.path, (path) => {
  if (audio.expanded && !path.startsWith('/tabs/immersion/book/')) audio.expanded = false
})

/** Ouvrir « Mes téléchargements » (le store audio ferme le panneau tout seul). */
function openDownloads() {
  audio.showDownloads = true
}

// ─── Glisser vers le bas depuis la poignée pour replier le panneau ───
const dragY = ref(0)
let dragStartY = 0
const CLOSE_THRESHOLD = 90 // px de glissement au-delà desquels on replie

function onDragStart(e) {
  dragStartY = e.touches[0].clientY
  dragY.value = 0
}
function onDragMove(e) {
  const dy = e.touches[0].clientY - dragStartY
  dragY.value = Math.max(0, dy) // uniquement vers le bas
}
function onDragEnd() {
  if (dragY.value > CLOSE_THRESHOLD) audio.expanded = false
  dragY.value = 0
}

/** mm:ss */
function fmt(sec) {
  const s = Math.max(0, Math.floor(sec || 0))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function onSeekInput(e) {
  player.seekTo(Number(e.target.value))
}
</script>

<style scoped>
/* Voile derrière le panneau étendu : tap = replier. Léger, non bloquant. */
.sheet-scrim {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* S'arrête au-dessus de la barre d'onglets → elle reste cliquable. */
  bottom: calc(env(safe-area-inset-bottom, 0px) + 84px);
  z-index: 37;
  background: rgba(0, 0, 0, 0.4);
}
.scrim-fade-enter-active, .scrim-fade-leave-active {
  transition: opacity var(--duration-normal);
}
.scrim-fade-enter-from, .scrim-fade-leave-to { opacity: 0; }

.player-sheet {
  position: fixed;
  /* Aligné sur la gélule de navigation (mêmes marges latérales) : les deux
     éléments flottants forment une pile cohérente. */
  left: max(env(safe-area-inset-left, 0px), var(--space-4, 16px));
  right: max(env(safe-area-inset-right, 0px), var(--space-4, 16px));
  /* ⚠️ DISJOINT de la barre d'onglets, pas collé : 62px (hauteur de la gélule)
     + 12px (sa marge basse) + 10px d'écart visible. L'ancienne valeur (56px)
     datait de la barre pleine largeur et provoquait un chevauchement. */
  bottom: calc(env(safe-area-inset-bottom, 0px) + 84px);
  z-index: 38;
  background: var(--navy2);
  border: 1px solid var(--gold-border-md);
  /* Arrondi sur les QUATRE coins : le lecteur flotte, il n'est plus ancré au
     bas de l'écran — des angles droits en bas trahissaient l'ancien collage. */
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  /* Retour élastique quand on relâche le glissement (dragging = pas de transition). */
  transition: transform var(--duration-normal) cubic-bezier(0.32, 0.72, 0, 1);
}
.player-sheet.dragging { transition: none; }

/* ─────────── Étendu ─────────── */
.full {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 var(--space-5) var(--space-4);
}

.collapse-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
  padding: 8px 0 2px;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 18px;
  cursor: pointer;
}
.handle {
  width: 38px;
  height: 4px;
  background: var(--gold-border-md);
  border-radius: var(--radius-full);
}

.title {
  font-family: var(--font-app);
  /* Taille pilotée par useFitText : elle dépend de la longueur du nom
     (« Ecclésiaste 12 » rétrécit, « Job 3 » garde 24px). */
  font-size: 24px;
  font-weight: 700;
  color: var(--cream);
  margin: var(--space-2) 0 2px;
  text-align: center;
  /* 94 % plutôt que 88 : le titre est centré et n'a rien à ses côtés, autant
     lui laisser la largeur du panneau. Mesuré : « 1 Thessaloniciens 1 » réclame
     286px là où 88 % n'en offraient que 252. */
  max-width: 94%;
  margin-inline: auto;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.copyright {
  font-family: var(--font-app);
  font-size: 11px;
  color: var(--muted);
  margin: 0 0 var(--space-4);
  text-align: center;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.main-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.ctrl {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  color: var(--cream);
  cursor: pointer;
  border-radius: var(--radius-full);
}
.ctrl ion-icon { font-size: 24px; }
.ctrl:active { background: var(--card-bg); }

.play-big {
  width: 64px;
  height: 64px;
  background: var(--gold);
  color: var(--navy);
}
.play-big ion-icon { font-size: 30px; }
.play-big:active { background: var(--gold); opacity: 0.85; }

.skip-num {
  position: absolute;
  font-family: var(--font-app);
  font-size: 8px;
  font-weight: 700;
}

/* Progression + temps */
.progress-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  margin-top: var(--space-4);
}
.time {
  font-family: var(--font-app);
  font-size: 11px;
  color: var(--muted);
  min-width: 38px;
  text-align: center;
}

/* Range avec BILLE (thumb) — saisissable au doigt */
.range {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: var(--gold-border);
  border-radius: var(--radius-full);
  outline: none;
  cursor: pointer;
}
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--gold);
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}
.range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--gold);
  border: none;
}

/* Bas du panneau */
.bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: var(--space-4);
}
.speed-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid var(--gold-border-md);
  background: none;
  color: var(--gold);
  font-family: var(--font-app);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.speed-circle:active { border-color: var(--gold); }
.downloads-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--card-bg);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-full);
  color: var(--cream);
  font-family: var(--font-app);
  font-size: 12px;
  cursor: pointer;
}
.downloads-btn ion-icon { font-size: 16px; color: var(--gold); }
.close-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid var(--gold-border);
  background: none;
  color: var(--muted);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 3 colonnes : gauche vide · cercle téléchargement CENTRÉ · bouton musique à droite.
   Le cercle reste exactement centré (au-dessus du bouton pause), la musique s'aligne
   à sa droite sans le décaler. */
.dl-music-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
}
.dl-music-row > :first-child { grid-column: 2; } /* download-circle → colonne centrale */
.music-circle-wrap {
  grid-column: 3;
  justify-self: start;
  align-self: center;
  margin-left: var(--space-8); /* éloigne le bouton musique du cercle central */
}

/* Musique de fond : rond + label ON/OFF dessous. */
.music-circle-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
}
.music-circle {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid var(--gold-border-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
}
.music-circle ion-icon { font-size: 20px; }
/* État OFF : icône atténuée + trait diagonal barré (comme « son coupé »). */
.music-circle.off { color: var(--muted); border-color: var(--gold-border); }
.music-circle.off::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 1.5px;
  background: var(--muted);
  transform: rotate(-45deg);
}
.music-label {
  font-family: var(--font-app);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--muted);
}

/* ─────────── Mini-barre ─────────── */
.mini-range {
  width: 100%;
  height: 3px;
  display: block;
}
.mini-range::-webkit-slider-thumb {
  width: 13px;
  height: 13px;
}

.mini-body {
  display: flex;
  align-items: center;
  /* Espacement resserré : chaque pixel gagné ici va au titre, qui était
     tronqué en « Proverbe… » alors que six contrôles se partageaient la barre. */
  gap: 4px;
  padding: var(--space-1) var(--space-2) var(--space-2);
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 26px au lieu de 32 : la zone tactile reste confortable (le bouton est
     entouré de vide) et on rend 6px au titre. */
  width: 26px;
  height: 32px;
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--gold);
  font-size: 20px;
  cursor: pointer;
  flex-shrink: 0;
}

.track-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* min-width: 0 (et pas un plancher en px) : c'est ce qui autorise l'élément
     flex à se rétrécir. useFitText réduit ensuite la police jusqu'à ce que le
     nom tienne dans la largeur réellement disponible. Un min-width en dur
     empêchait au contraire le calcul d'aboutir. */
  min-width: 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  flex: 1;
}
.track-title {
  font-family: var(--font-app);
  /* Taille de départ, réduite par useFitText si le nom déborde. */
  font-size: 13px;
  font-weight: 600;
  color: var(--cream);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.track-copyright {
  font-family: var(--font-app);
  font-size: 9px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.mini-controls {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}
.mini-controls .ctrl {
  /* 30px au lieu de 36 : cinq contrôles, soit 30px rendus au titre, sans
     descendre sous le seuil de confort tactile (la hauteur reste à 36). */
  width: 30px;
  height: 36px;
}
.mini-controls .ctrl ion-icon { font-size: 20px; }
.mini-play ion-icon { font-size: 26px !important; color: var(--gold); }
.ctrl.speed {
  width: auto;
  padding: 0 6px;
  font-family: var(--font-app);
  font-size: 11px;
  font-weight: 600;
  color: var(--gold);
}

/* Transitions */
.sheet-slide-enter-active, .sheet-slide-leave-active {
  transition: transform var(--duration-normal) cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-slide-enter-from, .sheet-slide-leave-to { transform: translateY(100%); }
</style>
