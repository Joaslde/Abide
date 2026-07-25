import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

/* Ionic core CSS */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Design system Abide (palette navy/gold, fonts, utilitaires) */
import './theme/variables.css'

import { usePreferencesStore } from './stores/preferences'
import { useAuthStore } from './stores/auth'
import { watchNetwork } from './lib/network'
import { pushUserData } from './lib/sync'

const app = createApp(App)
  .use(IonicVue)
  .use(createPinia())
  .use(router)
  .use(i18n)

/**
 * Démarrage : on charge préférences (thème + langue) ET session auth
 * AVANT le premier rendu, pour que les guards du router aient le bon état
 * (premier lancement, connexion, onboarding).
 */
/**
 * Borne une promesse : si elle n'aboutit pas à temps (réseau absent, DNS KO,
 * retry infini de Supabase…), on continue sans elle plutôt que de bloquer le
 * démarrage. Ne rejette jamais : un échec d'init ne doit pas casser le boot.
 */
function withTimeout(promise, ms, label = '') {
  return Promise.race([
    Promise.resolve(promise).catch((e) => {
      console.warn(`[bootstrap] ${label} a échoué :`, e?.message ?? e)
    }),
    new Promise((resolve) =>
      setTimeout(() => {
        console.warn(`[bootstrap] ${label} : délai dépassé (${ms} ms) → on démarre sans.`)
        resolve()
      }, ms)
    )
  ])
}

async function bootstrap() {
  const prefs = usePreferencesStore()
  const auth = useAuthStore()

  // Écoute des changements de connexion (source de vérité réseau du projet).
  // Au retour du réseau → sync best-effort des données utilisateur locales.
  watchNetwork((online) => {
    if (online) pushUserData()
  })

  // Si on revient d'un OAuth (Google), l'URL contient ?code=... → échanger contre session
  // AVANT d'initialiser le reste, pour que les guards aient déjà la session.
  // Borné également : cet échange est réseau, il ne doit pas bloquer le boot.
  let cameFromOAuth = false
  try {
    cameFromOAuth = await Promise.race([
      auth.handleOAuthCallback(),
      new Promise((resolve) => setTimeout(() => resolve(false), 3000))
    ])
  } catch (e) {
    console.error('OAuth callback failed:', e)
  }

  // ⚠️ OFFLINE-FIRST : rien ne doit empêcher l'app de se monter.
  // getSession() n'est PAS purement local : si le token est expiré, Supabase
  // tente un refresh_token réseau et RETRY en boucle. Hors ligne (ou DNS KO),
  // auth.init() ne se résout jamais → écran vide au démarrage.
  // On borne donc l'init auth : au-delà du délai, on démarre sans elle
  // (la session sera rétablie par onAuthStateChange au retour du réseau).
  await Promise.all([
    prefs.init(), // local (Preferences) : rapide et sûr
    withTimeout(auth.init(), 3000, 'auth.init')
  ])
  await router.isReady()

  // Après un OAuth réussi, router vers onboarding ou l'app (le guard s'en charge ensuite).
  // (La reprise de lecture, elle, se fait au 1er clic sur l'onglet Bible — TabsLayout.)
  if (cameFromOAuth && auth.isAuthenticated) {
    router.replace(auth.shouldOnboard ? '/onboarding' : '/tabs/immersion')
  }

  app.mount('#app')
}

// Filet de sécurité : quoi qu'il arrive au démarrage, l'app DOIT se monter.
// Un écran vide est le pire échec possible (l'utilisateur ne peut rien faire,
// même pas lire sa Bible hors ligne).
bootstrap().catch((e) => {
  console.error('[bootstrap] échec — montage de secours :', e)
  try {
    app.mount('#app')
  } catch { /* déjà monté */ }
})
