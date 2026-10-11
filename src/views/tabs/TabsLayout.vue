<template>
  <ion-page>
    <ion-tabs @ionTabsWillChange="onTabChange">
      <ion-router-outlet />

      <ion-tab-bar slot="bottom" class="floating-bar" ref="barEl">
        <!-- Pastille GLISSANTE : un seul élément pour toute la barre, dont on
             anime la position. Chaque onglet animait auparavant son propre
             fond, ce qui donnait un fondu (disparition/apparition) au lieu
             d'un déplacement. Ici la pastille se DÉPLACE d'un onglet à l'autre. -->
        <span class="pill-indicator" :class="{ 'no-anim': firstPaint }" :style="indicatorStyle" aria-hidden="true" />
        <ion-tab-button tab="home" href="/tabs/home">
          <span class="pill">
            <nav-icon name="home" :active="active === 'home'" />
            <ion-label>{{ t('home.tab') }}</ion-label>
          </span>
        </ion-tab-button>

        <!-- 1er clic de la session sur l'onglet Bible → reprend le dernier
             chapitre lu (consumeResumePath). Les clics suivants = normal.
             La route interne reste /tabs/immersion (label = « Bible »). -->
        <ion-tab-button tab="immersion" href="/tabs/immersion" @click="onBibleTab">
          <span class="pill">
            <nav-icon name="bible" :active="active === 'immersion'" />
            <ion-label>{{ t('bible.tab') }}</ion-label>
          </span>
        </ion-tab-button>

        <ion-tab-button tab="ancre" href="/tabs/ancre">
          <span class="pill">
            <nav-icon name="anchor" :active="active === 'ancre'" />
            <ion-label>L'Ancre</ion-label>
          </span>
        </ion-tab-button>

        <ion-tab-button tab="plus" href="/tabs/plus">
          <span class="pill">
            <nav-icon name="more" :active="active === 'plus'" />
            <ion-label>{{ t('plus.tab') }}</ion-label>
          </span>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  IonPage, IonTabs, IonRouterOutlet, IonTabBar,
  IonTabButton, IonLabel
} from '@ionic/vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { consumeResumePath } from '@/router'
import NavIcon from '@/components/shared/NavIcon.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

/**
 * Onglet actif suivi en JS (et pas seulement via la classe `tab-selected`
 * d'Ionic) : les icônes ont besoin de la valeur comme PROP pour épaissir leur
 * trait, ce qu'une classe CSS seule ne permet pas sur un SVG inline.
 */
const active = ref('home')

function syncActive(path) {
  if (path.startsWith('/tabs/immersion')) active.value = 'immersion'
  else if (path.startsWith('/tabs/ancre')) active.value = 'ancre'
  else if (path.startsWith('/tabs/plus')) active.value = 'plus'
  else if (path.startsWith('/tabs/home')) active.value = 'home'
  // Sanctuaire & autres sous-routes : on laisse l'onglet précédent en place
  // (elles n'ont pas d'onglet dédié dans la barre).
}

syncActive(route.path)
watch(() => route.path, syncActive)

/**
 * PASTILLE GLISSANTE.
 * On mesure la position réelle du bouton actif et on déplace un unique
 * élément. Mesurer plutôt que calculer `index * largeur` : les onglets n'ont
 * pas tous la même largeur (les labels diffèrent, « L'Ancre » est plus large
 * que « Plus »), et une pastille de largeur fixe déborderait.
 */
const barEl = ref(null)
const indicatorStyle = ref({})
const firstPaint = ref(true)

function moveIndicator() {
  // `barEl` est un composant Ionic : $el donne l'élément hôte réel.
  const host = barEl.value?.$el ?? barEl.value
  if (!host) return
  const btn = host.querySelector('ion-tab-button.tab-selected')
  const pill = btn?.querySelector('.pill')
  if (!pill) return

  const hostBox = host.getBoundingClientRect()
  const pillBox = pill.getBoundingClientRect()
  if (!pillBox.width) return // barre pas encore mise en page

  indicatorStyle.value = {
    '--pill-x': `${pillBox.left - hostBox.left}px`,
    '--pill-w': `${pillBox.width}px`
  }
}

/** Repositionne après le rendu (la classe tab-selected arrive après le tick). */
async function syncIndicator() {
  await nextTick()
  moveIndicator()
  // Second passage : Ionic ajuste parfois la largeur du label juste après
  // (police chargée, transition d'onglet), ce qui décalait la pastille.
  requestAnimationFrame(moveIndicator)
}

onMounted(async () => {
  await syncIndicator()
  // L'animation n'est activée qu'APRÈS le placement initial, sinon la pastille
  // traverse la barre depuis la gauche à chaque ouverture de l'app.
  requestAnimationFrame(() => { firstPaint.value = false })
  window.addEventListener('resize', moveIndicator)
  observeTabClasses()
})

/**
 * Ionic pose/retire `tab-selected` de façon asynchrone, parfois sans que ni
 * `active` ni la route ne changent au même instant. On observe donc
 * directement l'attribut class des boutons : c'est ce que l'œil voit.
 */
let classObserver = null

function observeTabClasses() {
  const host = barEl.value?.$el ?? barEl.value
  if (!host || classObserver) return
  classObserver = new MutationObserver(() => moveIndicator())
  host.querySelectorAll('ion-tab-button').forEach((b) => {
    classObserver.observe(b, { attributes: true, attributeFilter: ['class'] })
  })
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', moveIndicator)
  classObserver?.disconnect()
  classObserver = null
})

// La pastille suit `tab-selected` — la SEULE source de vérité. `active` ne
// suffit pas : sur les sous-routes (un chapitre ouvert depuis l'onglet Bible)
// il reste volontairement inchangé alors qu'Ionic, lui, déplace la classe.
// D'où une pastille qui restait sur l'onglet précédent.
watch(active, syncIndicator)
watch(() => route.path, syncIndicator)

function onTabChange(e) {
  if (e?.detail?.tab) active.value = e.detail.tab
}

/** 1er clic sur l'onglet Bible → reprise du dernier chapitre lu. */
function onBibleTab() {
  const last = consumeResumePath()
  if (last && router.currentRoute.value.path !== last) {
    // nextTick léger : laisser Ionic traiter le clic d'onglet d'abord.
    setTimeout(() => router.push(last), 0)
  }
}
</script>

<style scoped>
/* ── Barre FLOTTANTE (façon iOS) ───────────────────────────────────────────
   La barre ne touche plus les bords : elle « lévite » au-dessus du contenu,
   arrondie en gélule, posée sur une ombre douce. L'onglet actif reçoit une
   PASTILLE PLEINE (et pas un simple changement de couleur) : c'est ce qui
   donne le repère visuel immédiat de la maquette de référence.              */
.floating-bar {
  /* Thème sombre (défaut) — navy translucide, liseré doré très discret. */
  --nav-bg: rgba(17, 30, 49, 0.82);
  --nav-border: rgba(201, 168, 76, 0.16);
  --nav-idle: rgba(245, 240, 230, 0.55);
  --nav-active-bg: var(--gold);
  --nav-active-fg: #0B1624;

  --background: transparent;
  --border: none;

  position: absolute;
  left: max(env(safe-area-inset-left, 0px), var(--space-4, 16px));
  right: max(env(safe-area-inset-right, 0px), var(--space-4, 16px));
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--space-3, 12px));
  width: auto;

  /* ⚠️ Ionic pilote la hauteur via --height (shadow DOM) : un `height` seul est
     IGNORÉ et la barre gardait sa hauteur par défaut, d'où la pastille active
     qui débordait par le bas. On fixe les deux. */
  --height: 62px;
  height: 62px;
  /* Padding latéral GÉNÉREUX : la gélule a un rayon de 31px, ses coins
     « rentrent » vers l'intérieur. Trop peu de padding et les coins de la
     pastille ressortaient de la courbe. */
  padding: 0 14px;
  border-radius: 999px;

  /* Verre dépoli : on devine le contenu qui défile dessous. */
  background: var(--nav-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--nav-border);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.30),
    0 2px 8px rgba(0, 0, 0, 0.18);

  /* La barre flotte : le contenu passe DERRIÈRE elle, pas dessous. */
  contain: none;
  overflow: visible;
}

/* Thème clair — contraste inversé : pastille navy sur gélule ivoire. */
:global(html.light) .floating-bar,
:global(html[data-theme='light']) .floating-bar {
  --nav-bg: rgba(255, 255, 255, 0.86);
  --nav-border: rgba(28, 18, 8, 0.08);
  --nav-idle: rgba(28, 18, 8, 0.55);
  --nav-active-bg: #0B1624;
  --nav-active-fg: #F5F0E6;
  box-shadow:
    0 8px 28px rgba(28, 18, 8, 0.12),
    0 2px 8px rgba(28, 18, 8, 0.06);
}

ion-tab-button {
  --background: transparent;
  --background-focused: transparent;
  --ripple-color: transparent;
  --color: var(--nav-idle);
  --color-selected: var(--nav-active-fg);
  color: var(--nav-idle);
  /* Le bouton occupe toute la hauteur de la barre et centre sa pastille :
     sans ça Ionic impose sa propre hauteur minimale et la pastille dépasse. */
  min-height: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* La pastille porte le fond actif, PAS le bouton entier : sinon le fond
   couvrirait toute la zone tactile (bien plus large que le contenu). */
.pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 12px;
  /* Bornée dans les DEUX axes : en largeur pour ne pas empiéter sur les
     onglets voisins, en hauteur pour rester dans la gélule (62 − 2×5 marge). */
  max-width: 100%;
  max-height: 52px;
  border-radius: 999px;
  transition:
    color var(--duration-normal, 220ms) ease,
    transform var(--duration-fast, 140ms) ease;
}

/* Seule la COULEUR change ici : le fond est porté par .pill-indicator, qui
   glisse. Un fond par pastille rendrait le déplacement invisible. */
ion-tab-button.tab-selected .pill {
  color: var(--nav-active-fg);
}

/* Pastille glissante — se déplace et s'étire vers l'onglet actif.
   Courbe légèrement élastique (léger dépassement) pour un mouvement vivant
   plutôt qu'un glissement mécanique. */
.pill-indicator {
  position: absolute;
  top: 50%;
  left: 0;
  height: 52px;
  border-radius: 999px;
  background: var(--nav-active-bg);
  pointer-events: none;
  z-index: 0;
  transform: translate3d(var(--pill-x, 0px), -50%, 0);
  width: var(--pill-w, 0px);
  transition:
    transform 420ms cubic-bezier(0.34, 1.4, 0.5, 1),
    width 420ms cubic-bezier(0.34, 1.4, 0.5, 1);
}

/* Premier rendu : la pastille se place sans animer (sinon elle traverse la
   barre depuis la gauche à chaque ouverture de l'app). */
.pill-indicator.no-anim { transition: none; }

/* Le contenu de l'onglet passe AU-DESSUS de la pastille. */
.pill { position: relative; z-index: 1; }

@media (prefers-reduced-motion: reduce) {
  .pill-indicator { transition: none; }
}

/* Retour tactile : la pastille s'enfonce légèrement. */
ion-tab-button:active .pill { transform: scale(0.94); }

ion-label {
  font-family: var(--font-app);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.1;
  margin: 0;
  /* JAMAIS sur deux lignes : « La Bible » passait à la ligne et décalait les
     icônes voisines vers le haut. */
  white-space: nowrap;
  /* Ionic rétrécit le label des onglets inactifs : on fige la taille. */
  transform: none !important;
}
</style>

<!-- NON scopé : doit atteindre les ion-content des pages ENFANTS (Accueil,
     Bible, Ancre, Plus…), que `scoped` n'atteindrait pas. -->
<style>
/* La barre étant flottante (position: absolute), elle ne réserve plus d'espace
   dans le flux : sans cette réserve, le dernier élément de chaque page passerait
   DERRIÈRE la gélule. 62px de hauteur + 12px de marge + une respiration. */
ion-tabs ion-content {
  --padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 84px);
}

/* Lecteur audio à l'écran (classe posée sur <html> par App.vue) : il flotte
   AU-DESSUS de la barre d'onglets, donc il faut creuser d'autant plus. Sinon,
   arrivé en bas d'une page, le dernier contenu se retrouvait masqué par le
   lecteur. +72px = hauteur de la mini-barre repliée + son écart. */
html.player-visible ion-tabs ion-content {
  --padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 156px);
}
html.player-visible ion-tabs ion-footer {
  margin-bottom: calc(env(safe-area-inset-bottom, 0px) + 146px);
}

/* Pages À FOOTER (composer du Guide, navigation de chapitre) : le footer est
   collé en bas de page, donc la barre flottante se posait DESSUS — le composer
   du Guide devenait inutilisable et le fond du footer dépassait tout autour de
   la gélule (le « trait » visible sous la barre). On remonte le footer au-dessus.
   74px = 62 (hauteur de barre) + 12 (marge basse). */
ion-tabs ion-footer {
  margin-bottom: calc(env(safe-area-inset-bottom, 0px) + 74px);
  /* Le safe-area est déjà pris en compte ci-dessus : pas de double marge. */
  padding-bottom: 0;
}

/* Sur ces pages, le footer fournit déjà le dégagement : la réserve du contenu
   ferait doublon et laisserait un grand vide au-dessus du footer. */
ion-tabs ion-page:has(ion-footer) ion-content {
  --padding-bottom: var(--space-4, 16px);
}
</style>
