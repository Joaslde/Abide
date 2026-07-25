import { createRouter, createWebHashHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import { isOnline } from '@/lib/network'

/**
 * Accès invité (sans connexion) : lecture de la Bible + audio uniquement.
 * Tout le reste (Sanctuaire, Ancre/IA, Phare, prière, premium, réglages)
 * exige une connexion → meta.requiresAuth.
 */
const routes = [
  {
    path: '/',
    redirect: '/tabs/home'
  },
  {
    path: '/welcome',
    component: () => import('@/views/WelcomeView.vue')
  },
  {
    path: '/auth/login',
    component: () => import('@/views/auth/LoginView.vue')
  },
  {
    path: '/auth/register',
    component: () => import('@/views/auth/RegisterView.vue')
  },
  {
    path: '/auth/forgot',
    component: () => import('@/views/auth/ForgotPasswordView.vue')
  },
  {
    path: '/auth/verify-otp',
    component: () => import('@/views/auth/VerifyOtpView.vue')
  },
  {
    path: '/auth/reset',
    component: () => import('@/views/auth/ResetPasswordView.vue')
  },
  {
    // Salutation animée (entrée de l'onboarding).
    path: '/onboarding',
    component: () => import('@/views/auth/onboarding/OnboardingWelcomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    // Quiz de personnalisation (vue unique pilotée par data, 13 questions).
    path: '/onboarding/quiz',
    component: () => import('@/views/auth/onboarding/QuizQuestionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    // Écran de révélation du profil.
    path: '/onboarding/reveal',
    component: () => import('@/views/auth/onboarding/ProfileRevealView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tabs',
    component: () => import('@/views/tabs/TabsLayout.vue'),
    children: [
      { path: '', redirect: '/tabs/home' },
      {
        // Accueil : verset du jour + streak + plan — données locales, invité OK.
        path: 'home',
        component: () => import('@/views/tabs/HomeView.vue')
      },
      {
        // Immersion (Bible/lecture) — accessible aux invités.
        // Toutes les sous-routes du lecteur vivent SOUS l'onglet : la barre
        // d'onglets reste visible partout et Ionic préserve la pile de l'onglet.
        // Chaque enfant a son composant (jamais de parent sans composant — lesson).
        path: 'immersion',
        component: () => import('@/views/tabs/ImmersionTab.vue')
      },
      {
        path: 'immersion/search',
        component: () => import('@/views/bible/BibleSearchView.vue')
      },
      {
        path: 'immersion/store',
        component: () => import('@/views/bible/BibleStoreView.vue')
      },
      {
        // Préfixe /book/ : pas d'ambiguïté avec search/store.
        path: 'immersion/book/:bookId',
        component: () => import('@/views/bible/BibleBookView.vue')
      },
      {
        path: 'immersion/book/:bookId/:chapter',
        component: () => import('@/views/bible/BibleChapterView.vue')
      },
      {
        // Choix d'un plan de lecture (profil / parcours / custom) — invité OK.
        path: 'immersion/plan',
        component: () => import('@/views/plan/PlanChooseView.vue')
      },
      {
        // Création d'un plan sur mesure.
        path: 'immersion/plan/custom',
        component: () => import('@/views/plan/PlanCustomView.vue')
      },
      {
        // Sanctuaire (prière + jeûne) — LOCAL-FIRST : accessible aux invités
        // et hors ligne (comme la Bible et Plus). Pas de requiresAuth.
        path: 'sanctuaire',
        component: () => import('@/views/tabs/SanctuaireTab.vue')
      },
      {
        path: 'sanctuaire/moment',
        component: () => import('@/views/sanctuaire/PrayerMomentView.vue')
      },
      {
        path: 'sanctuaire/journal',
        component: () => import('@/views/sanctuaire/PrayerJournalView.vue')
      },
      {
        path: 'sanctuaire/fasting',
        component: () => import('@/views/sanctuaire/FastingView.vue')
      },
      {
        // L'Ancre = Guide IA (chatbot). Chat direct + tiroir d'historique.
        path: 'ancre',
        component: () => import('@/views/tabs/AncreTab.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'phare',
        component: () => import('@/views/tabs/PhareTab.vue'),
        meta: { requiresAuth: true }
      },
      {
        // « Plus » : notes, signets, surlignés — données 100 % locales,
        // accessible aux invités (offline-first).
        path: 'plus',
        component: () => import('@/views/tabs/PlusTab.vue')
      },
      {
        path: 'plus/notes',
        component: () => import('@/views/plus/NotesListView.vue')
      },
      {
        path: 'plus/notes/:id',
        component: () => import('@/views/plus/NoteEditView.vue')
      },
      {
        path: 'plus/bookmarks',
        component: () => import('@/views/plus/BookmarksView.vue')
      },
      {
        path: 'plus/highlights',
        component: () => import('@/views/plus/HighlightsView.vue')
      }
    ]
  },
  // Compat : anciens chemins plats /bible/* → nouvel emplacement sous les tabs.
  {
    path: '/bible/:pathMatch(.*)*',
    redirect: '/tabs/immersion'
  },
  {
    // Audio Bible — accessible aux invités
    path: '/audio',
    component: () => import('@/views/audio/AudioPlayerView.vue')
  },
  // Routes APLATIES (même raison que /bible : pas de parent sans composant).
  {
    path: '/prayer',
    component: () => import('@/views/prayer/PrayerJournalView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/prayer/:id',
    component: () => import('@/views/prayer/PrayerDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/premium',
    component: () => import('@/views/premium/PaywallView.vue'),
    meta: { requiresAuth: true }
  },
  {
    // Réglages d'apparence = locaux → accessibles aux invités (local-first).
    // La carte profil renvoie à la connexion si invité.
    path: '/settings',
    component: () => import('@/views/settings/SettingsView.vue')
  },
  {
    // Langue et réglages de lecture Bible = locaux → invités OK.
    path: '/settings/language',
    component: () => import('@/views/settings/LanguageView.vue')
  },
  {
    path: '/settings/bible',
    component: () => import('@/views/settings/BibleSettingsView.vue')
  },
  {
    // Profil (infos identitaires + actions compte) → réservé aux connectés.
    path: '/settings/profile',
    component: () => import('@/views/settings/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    // Gestion / suppression de compte → réservé aux connectés.
    path: '/settings/account',
    component: () => import('@/views/settings/AccountManageView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const prefs = usePreferencesStore()


  // 1. Tout premier lancement (jamais ouvert l'app) → écran de bienvenue.
  //    Les utilisateurs déjà connectés ne le revoient pas.
  //
  //    OFFLINE-FIRST : la Welcome propose connexion Google/email, inutilisable
  //    sans réseau. Si on est hors ligne au premier lancement, on envoie
  //    directement l'utilisateur à la Bible (100% offline) SANS marquer
  //    firstLaunchDone. Ainsi, dès que le réseau revient, la Welcome
  //    réapparaît au lancement suivant pour proposer la connexion.
  if (!prefs.firstLaunchDone && !authStore.isAuthenticated) {
    const online = await isOnline()
    if (!online) {
      // Hors ligne : la Bible (et l'audio téléchargé) restent accessibles.
      // On laisse passer les routes invité, on bloque le reste vers la Bible.
      if (to.path.startsWith('/tabs/home') || to.path.startsWith('/tabs/immersion') || to.path.startsWith('/tabs/plus') || to.path.startsWith('/tabs/sanctuaire') || to.path.startsWith('/settings')) {
        return // accès autorisé
      }
      return '/tabs/home'
    }
    // En ligne : parcours normal via l'écran de bienvenue.
    if (to.path !== '/welcome' && !to.path.startsWith('/auth')) {
      return '/welcome'
    }
  }

  // 2. Routes protégées : rediriger les non-connectés vers la connexion.
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/auth/login'
  }

  // 3. Utilisateur connecté mais onboarding non terminé → forcer l'onboarding.
  //    SAUF hors ligne : l'onboarding sauvegarde le profil (réseau requis).
  //    On laisse donc accéder à la Bible offline ; l'onboarding sera proposé
  //    au prochain lancement avec réseau.
  if (
    authStore.isAuthenticated &&
    authStore.shouldOnboard &&
    !to.path.startsWith('/onboarding') &&
    !to.path.startsWith('/auth')
  ) {
    const online = await isOnline()
    if (!online) {
      if (to.path.startsWith('/tabs/home') || to.path.startsWith('/tabs/immersion') || to.path.startsWith('/tabs/plus') || to.path.startsWith('/tabs/sanctuaire')) {
        return // accès Bible autorisé hors ligne
      }
      return '/tabs/home'
    }
    return '/onboarding'
  }
})

/**
 * Publicité de navigation (interstitiel throttlé, modèle YouVersion).
 * Après chaque transition « neutre », on tente une pub (le store applique le
 * cooldown de 4 min et la règle !isPremium). On EXCLUT les écrans protégés
 * (lecture Bible, prière guidée) et l'Ancre/IA qui a son propre déclencheur
 * à l'ouverture (onOpenAiGuide) — sinon on doublerait la pub.
 */
const AD_PROTECTED_PREFIXES = [
  '/tabs/immersion/book/', // lecture d'un chapitre (le texte biblique)
  '/tabs/sanctuaire/moment', // prière guidée du matin/soir
  '/tabs/ancre', // Guide IA : pub gérée à l'ouverture, pas via la navigation
  '/auth', '/onboarding', '/welcome'
]
router.afterEach((to) => {
  if (AD_PROTECTED_PREFIXES.some((p) => to.path.startsWith(p))) return
  // Import paresseux : évite un cycle router ↔ store au chargement du module.
  import('@/stores/ads').then(({ useAdsStore }) => useAdsStore().onNavigation())
})

/**
 * Reprise de lecture — au 1er CLIC sur l'onglet Bible de la session (pas au
 * démarrage : l'app s'ouvre normalement). Consommé une seule fois : les clics
 * suivants gardent le comportement Ionic normal (retour à la racine de l'onglet).
 * Retourne le chemin du dernier chapitre lu, ou null.
 */
const CHAPTER_PATH = /^\/tabs\/immersion\/book\/[^/]+\/\d+$/
let resumeConsumed = false
export function consumeResumePath() {
  if (resumeConsumed) return null
  resumeConsumed = true
  const prefs = usePreferencesStore()
  let last = prefs.lastReadPath
  // Migration douce de l'ancien format plat (/bible/X/N).
  const old = last && last.match(/^\/bible\/([^/]+)\/(\d+)$/)
  if (old) last = `/tabs/immersion/book/${old[1]}/${old[2]}`
  return last && CHAPTER_PATH.test(last) ? last : null
}

export default router
