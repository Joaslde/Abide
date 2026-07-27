import { createRouter, createWebHashHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import { isOnlineCached } from '@/lib/network'

/**
 * Navigation invité EN COURS (bouton « Passer » de Welcome). En mémoire seulement
 * (variable de module) → se réinitialise à CHAQUE démarrage à froid de l'app.
 * Ainsi : sans session, on montre Welcome au démarrage ; une fois « Passer »
 * cliqué, l'invité navigue librement pendant sa session ; au prochain lancement,
 * Welcome réapparaît. Activé par enterGuestBrowsing() depuis WelcomeView.
 */
let guestBrowsing = false
export function enterGuestBrowsing() { guestBrowsing = true }

/**
 * Onboarding REPORTÉ pour cette session (bouton « Je le ferai plus tard »).
 * En mémoire seulement, comme guestBrowsing → se réinitialise au démarrage à
 * froid : la personne accède à l'accueil maintenant, et le quiz lui est
 * reproposé au prochain lancement de l'app. Rien n'est écrit en base (à la
 * différence de « Non merci » qui pose onboarding_snooze_until = +3 mois).
 */
let onboardingPostponed = false
export function postponeOnboarding() { onboardingPostponed = true }

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
    // Code de parrainage éventuel — AVANT le quiz. Contournement temporaire du
    // lien OneLink (non fonctionnel tant que l'app n'est pas publiée) : la
    // personne invitée peut saisir le code manuellement ici.
    path: '/onboarding/referral',
    component: () => import('@/views/auth/onboarding/OnboardingReferralView.vue'),
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
        // Parcours du plan ACTIF : jours faits / en cours / à venir.
        path: 'immersion/plan/journey',
        component: () => import('@/views/plan/PlanDetailView.vue')
      },
      {
        // Aperçu d'un parcours préétabli AVANT de le lancer (détail jour par jour).
        path: 'immersion/plan/preview/:templateId',
        component: () => import('@/views/plan/PlanDetailView.vue')
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
      },
      {
        // Programme de parrainage : nécessite un compte (le code est lié au profil).
        path: 'plus/referral',
        component: () => import('@/views/plus/ReferralView.vue'),
        meta: { requiresAuth: true }
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

  // Attendre que la session soit restaurée du storage natif (async) AVANT de
  // décider. Sinon, au démarrage à froid, isAuthenticated est encore false et
  // on redirigerait à tort. Borné à 3,5 s : la navigation ne doit jamais figer.
  //
  // ⚠️ On n'attend QUE tant que l'init n'est pas terminée. Une fois la session
  // restaurée, ce guard doit être SYNCHRONE : un `await` (même déjà résolu)
  // reporte la décision au microtask suivant, ce qui suffisait à désordonner
  // deux clics d'onglet rapprochés (Ionic n'attend pas le guard pour animer).
  if (!authStore.ready) {
    await Promise.race([
      authStore.init(),
      new Promise((resolve) => setTimeout(resolve, 3500))
    ])
  }

  // On laisse toujours passer les écrans d'auth/onboarding eux-mêmes (sinon boucle).
  const onAuthFlow = to.path.startsWith('/auth') || to.path.startsWith('/onboarding') || to.path === '/welcome'

  // ── HORS LIGNE : quoi qu'il arrive (session ou non), on va à l'Accueil ──
  //    (rien de ce qui exige le réseau — Welcome, connexion, onboarding — n'est
  //    utile sans internet ; la Bible et le reste local restent accessibles).
  //
  // ⚠️ Lecture SYNCHRONE du cache réseau (isOnlineCached), surtout pas `await
  // isOnline()` : ce dernier appelle le pont natif à CHAQUE navigation. Ionic
  // lance l'animation d'onglet sans attendre le guard, donc deux clics
  // rapprochés mettaient deux guards en vol dont les délais natifs variaient :
  // ils se résolvaient dans le désordre et on atterrissait sur le mauvais
  // onglet (bug intermittent 2026-07-26). Le cache est alimenté par le listener
  // natif démarré dans main.js (watchNetwork) → même fiabilité, coût nul.
  if (!isOnlineCached()) {
    return onAuthFlow ? '/tabs/home' : undefined
  }

  // ── EN LIGNE, PAS DE SESSION → écran Welcome (connexion) ──
  //    C'est l'ABSENCE de session qui déclenche Welcome, pas firstLaunchDone :
  //    tant qu'on n'est pas connecté, chaque OUVERTURE repropose la connexion.
  //    Exception : si l'utilisateur a cliqué « Passer » (guestBrowsing), il
  //    navigue librement pendant cette session d'usage (Welcome reviendra au
  //    prochain démarrage à froid, guestBrowsing étant en mémoire).
  if (!authStore.isAuthenticated) {
    if (onAuthFlow || guestBrowsing) return undefined
    return '/welcome'
  }

  // ── EN LIGNE, SESSION ACTIVE ──
  // Routes explicitement protégées (rare : la plupart passent par la logique ci-dessus).
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/auth/login'
  }

  // Onboarding pas encore fait ET pas en sommeil (report « Non merci » < 3 mois)
  // → on force l'onboarding. « Plus tard » ne pose aucun flag → reproposé ici.
  // Refusé (snooze actif) OU rempli → shouldOnboard = false → on laisse passer (Accueil).
  // « Plus tard » (onboardingPostponed) libère la navigation pour cette session
  // uniquement — au prochain démarrage le flag est perdu et le quiz revient.
  if (authStore.shouldOnboard && !onboardingPostponed && !to.path.startsWith('/onboarding')) {
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
