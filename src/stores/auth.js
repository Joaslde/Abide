import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { supabase } from '@/lib/supabase'
import { getPendingReferralCode, clearPendingReferralCode } from '@/lib/appsflyer'

// Cache local du profil : consultable hors ligne (vue Profil). Le profil vit
// d'abord en ligne (source de vérité Supabase) ; on en garde une copie locale
// pour l'afficher sans réseau. Effacé au logout / à la suppression de compte.
const PROFILE_CACHE_KEY = 'abide.profile'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const profile = ref(null)
  const loading = ref(true)
  // Promesse d'initialisation : le guard du router l'attend pour ne JAMAIS
  // décider (Welcome / onboarding) avant que la session soit restaurée du
  // storage natif (async). Évite d'afficher la connexion alors qu'une session
  // existe mais n'est pas encore chargée.
  let initPromise = null

  const isAuthenticated = computed(() => !!session.value)
  const user = computed(() => session.value?.user ?? null)
  const isPremium = computed(() => profile.value?.is_premium ?? false)
  const onboardingDone = computed(() => profile.value?.onboarding_done ?? false)
  /**
   * L'onboarding est-il « en sommeil » ? (bouton « Non merci » → report 3 mois).
   * Tant que la date de réveil n'est pas passée, on ne repropose PAS le quiz.
   */
  const onboardingSnoozed = computed(() => {
    const until = profile.value?.onboarding_snooze_until
    return !!until && new Date(until) > new Date()
  })
  /** Faut-il proposer l'onboarding ? (pas fait ET pas en sommeil actif). */
  const shouldOnboard = computed(() => !onboardingDone.value && !onboardingSnoozed.value)

  /**
   * Prénom de l'utilisateur (premier mot du nom).
   * Source : display_name du profil, sinon métadonnées OAuth (Google).
   * Règle de marque : on utilise le prénom fréquemment (salutations, quiz,
   * notifications, IA). Toujours prévoir un repli si absent → chaîne vide.
   */
  const fullName = computed(() =>
    (profile.value?.display_name ||
     user.value?.user_metadata?.full_name ||
     user.value?.user_metadata?.name ||
     '').trim()
  )

  const firstName = computed(() => fullName.value.split(/\s+/)[0] || '')

  /**
   * Initiales pour l'avatar (1 à 2 lettres). Repli sur la 1re lettre de l'email
   * si aucun nom, chaîne vide en tout dernier recours (jamais de placeholder moche).
   */
  const initials = computed(() => {
    const parts = fullName.value.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    const email = user.value?.email
    return email ? email[0].toUpperCase() : ''
  })

  /**
   * L'init est-elle TERMINÉE ? Permet au guard du router de rester SYNCHRONE
   * une fois la session restaurée : un `await` sur une promesse déjà résolue
   * reporte quand même la décision au microtask suivant, ce qui désordonnait
   * deux clics d'onglet rapprochés (bug de navigation 2026-07-26).
   */
  const ready = ref(false)

  /** Init idempotente : renvoie toujours la même promesse (le guard l'attend). */
  function init() {
    if (!initPromise) initPromise = doInit().finally(() => { ready.value = true })
    return initPromise
  }

  async function doInit() {
    loading.value = true
    try {
      // getSession() lit le token depuis le storage LOCAL (pas de réseau) :
      // le démarrage hors ligne fonctionne. fetchProfile() requiert le réseau,
      // mais son échec ne doit jamais bloquer le boot → try/catch dédié.
      const { data } = await supabase.auth.getSession()
      session.value = data.session

      if (session.value) {
        // 1) Cache local D'ABORD (instantané, sans réseau) : on connaît tout de
        //    suite onboarding_done/is_premium. Évite que le boot borné (3s) ou un
        //    réseau lent ne rende un profil vide → onboarding qui réapparaît alors
        //    qu'il est fait. Le fetch réseau ne fait ensuite que rafraîchir.
        await loadCachedProfile()
        try {
          await fetchProfile()
        } catch {
          // Hors ligne / lent : on garde la copie locale déjà chargée.
        }
      }

      supabase.auth.onAuthStateChange(async (event, newSession) => {
        session.value = newSession
        if (newSession) {
          try {
            await fetchProfile()
          } catch {
            /* hors ligne : on ignore, profil rechargé plus tard */
          }
        } else {
          profile.value = null
        }
      })
    } catch {
      // Échec inattendu (storage corrompu, etc.) : on démarre en invité.
      session.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!user.value) return
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    if (!error) {
      profile.value = data
      // Copie locale pour consultation hors ligne (vue Profil).
      Preferences.set({ key: PROFILE_CACHE_KEY, value: JSON.stringify(data) }).catch(() => {})
    }
  }

  /**
   * Recharge le profil depuis le cache local (hors ligne). Appelé au boot quand
   * une session existe mais que fetchProfile() a échoué faute de réseau.
   */
  async function loadCachedProfile() {
    if (profile.value) return
    try {
      const { value } = await Preferences.get({ key: PROFILE_CACHE_KEY })
      if (value) profile.value = JSON.parse(value)
    } catch { /* pas de cache → rien à faire */ }
  }

  /**
   * Programme de parrainage : tente l'attribution d'un filleul à SON parrain,
   * une seule fois, UNIQUEMENT si le compte vient d'être créé (jamais sur une
   * reconnexion — sinon un compte existant pourrait être ré-attribué si un code
   * traîne en local). Signal de « nouveau compte » : created_at === last_sign_in_at
   * (identique à la première seconde près, standard Supabase Auth, valable aussi
   * pour OAuth/Google). Non bloquant : un échec (offline, pas de code en attente)
   * n'empêche jamais la connexion elle-même.
   */
  async function attributeReferralIfNewAccount(supaUser) {
    try {
      if (!supaUser?.created_at || !supaUser?.last_sign_in_at) return
      const isNewAccount = supaUser.created_at === supaUser.last_sign_in_at
      if (!isNewAccount) return

      const referralCode = await getPendingReferralCode()
      if (!referralCode) return

      await supabase.functions.invoke('referral-attribute', { body: { referralCode } })
    } catch {
      // Échec réseau/serveur : on n'insiste pas (SECURITY.md — non bloquant pour
      // une fonctionnalité non critique au parcours). Le code reste en attente
      // en local si la tentative n'a même pas pu partir.
      return
    } finally {
      // Tenté une seule fois par install, succès ou échec de l'appel serveur.
      await clearPendingReferralCode()
    }
  }

  /**
   * Connexion email + mot de passe.
   * SECURITY.md §1 : message d'erreur générique (anti-énumération de comptes).
   * On ne révèle jamais si l'email existe ou si c'est le mot de passe qui est faux.
   */
  /** Construit une erreur avec un code traduisible côté vue (i18n). */
  function codedError(code) {
    const e = new Error(code)
    e.code = code
    return e
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Cas particulier non sensible : email non confirmé → on guide l'utilisateur.
      if (error.message?.toLowerCase().includes('not confirmed')) {
        throw codedError('emailNotConfirmed')
      }
      throw codedError('invalidCredentials')
    }
    session.value = data.session
    await fetchProfile()
  }

  /**
   * Inscription email + mot de passe.
   * display_name est passé en metadata → repris par le trigger handle_new_user.
   */
  async function register(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName || null }
      }
    })
    if (error) {
      if (error.message?.toLowerCase().includes('already') ||
          error.message?.toLowerCase().includes('registered')) {
        throw codedError('emailInUse')
      }
      throw new Error(error.message)
    }
    // Email confirm désactivé dans Supabase → session active immédiatement après inscription.
    if (data.session) {
      session.value = data.session
      await fetchProfile()
      await attributeReferralIfNewAccount(data.user)
    }
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    // Natif : déconnecter aussi le compte Google du plugin, sinon le sélecteur
    // de compte ne réapparaît pas à la reconnexion (il reconnecte en silence).
    if (Capacitor.isNativePlatform()) {
      try {
        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')
        await GoogleAuth.signOut()
      } catch { /* pas connecté via Google, ou plugin indisponible */ }
    }
    session.value = null
    profile.value = null
    Preferences.remove({ key: PROFILE_CACHE_KEY }).catch(() => {})
  }

  /**
   * Connexion via Google.
   *
   * NATIF (Android/iOS) : sélecteur de compte Google NATIF (pas de navigateur).
   * Le plugin renvoie un idToken signé par Google, qu'on échange directement
   * contre une session Supabase (signInWithIdToken). Nécessite que le Client ID
   * Android ET le Web Client ID soient tous deux déclarés côté Supabase
   * (Auth → Providers → Google, liste séparée par des virgules).
   *
   * WEB : repli sur le flux OAuth classique (redirection navigateur + PKCE).
   * SECURITY.md §1 : le redirect_uri est strictement défini ici.
   */
  async function loginWithGoogle() {
    if (Capacitor.isNativePlatform()) {
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')
      // On passe le clientId EXPLICITEMENT (le WEB client id : c'est lui que
      // Google doit mettre dans l'audience de l'idToken pour que Supabase
      // l'accepte). Ne pas se reposer uniquement sur capacitor.config.json :
      // selon les versions du plugin, initialize() sans argument peut ne pas
      // propager serverClientId → idToken absent et flux avorté (code 12501).
      await GoogleAuth.initialize({
        clientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true
      })
      const googleUser = await GoogleAuth.signIn()
      const idToken = googleUser?.authentication?.idToken
      if (!idToken) throw new Error('google_no_id_token')

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken
      })
      if (error) throw new Error(error.message)
      session.value = data.session
      await fetchProfile()
      await attributeReferralIfNewAccount(data.user)
      return
    }

    // Web : retour sur la racine, Supabase ajoute ?code=... (flow PKCE).
    // L'échange code→session est fait au démarrage (bootstrap, voir main.js).
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    })
    if (error) throw new Error(error.message)
  }

  /**
   * Échange le ?code=... présent dans l'URL (retour OAuth PKCE) contre une session.
   * Appelé au démarrage si l'URL contient un code. Nettoie l'URL après.
   * @returns {boolean} true si une session a été créée
   */
  async function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return false

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    // Nettoyer l'URL (retirer ?code=...) quel que soit le résultat.
    window.history.replaceState({}, '', window.location.pathname)
    if (error) throw new Error(error.message)

    session.value = data.session
    await fetchProfile()
    await attributeReferralIfNewAccount(data.user)
    return true
  }

  // ─── Mot de passe oublié via OTP (code à 6 chiffres par email) ───
  // Flow en 3 temps : envoi du code → vérification → nouveau mot de passe.
  // On passe par signInWithOtp (canal "Magic Link") car resetPasswordForEmail
  // n'envoie qu'un lien, jamais un code exploitable côté UI.

  /**
   * Envoie un code OTP de réinitialisation à l'email.
   * SECURITY.md §1 : shouldCreateUser=false → ne crée pas de compte fantôme,
   * et on ne révèle jamais si l'email existe (la vue affiche toujours le même message).
   */
  async function sendResetOtp(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    })
    // On n'expose pas l'erreur "user not found" → anti-énumération.
    if (error && !error.message?.toLowerCase().includes('not found')) {
      throw new Error(error.message)
    }
  }

  /**
   * Vérifie le code OTP saisi. En cas de succès, une session de récupération
   * est créée → on peut ensuite changer le mot de passe.
   */
  async function verifyResetOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })
    if (error) throw codedError('invalidOtp')
    session.value = data.session
    await fetchProfile()
  }

  /** Définit le nouveau mot de passe (nécessite une session active = OTP vérifié). */
  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }

  async function updateProfile(updates) {
    if (!user.value) return
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()
    if (error) throw error
    profile.value = data
    // ⚠️ Rafraîchir le CACHE LOCAL : sinon au prochain démarrage, loadCachedProfile()
    // rechargerait l'ancienne version (ex: onboarding_done encore false) et le guard
    // reproposerait l'onboarding avant que le fetch réseau ne corrige.
    Preferences.set({ key: PROFILE_CACHE_KEY, value: JSON.stringify(data) }).catch(() => {})
  }

  /**
   * Suppression DÉFINITIVE du compte (RGPD). Ordre :
   *   1. Edge Function delete-account : efface profil + données Supabase (cascade)
   *      + le compte auth lui-même, identité validée côté serveur via le JWT.
   *   2. Purge des données locales de l'appareil (user-db).
   *   3. Nettoyage de la session locale.
   * Lève une erreur si l'étape serveur échoue (rien n'est purgé localement alors).
   */
  async function deleteAccount() {
    const { data, error } = await supabase.functions.invoke('delete-account')
    if (error || !data?.success) {
      throw new Error(error?.message || 'delete_failed')
    }
    // Import dynamique : user-db charge SQLite/localStorage, on ne le tire que si besoin.
    const { clearAllLocalData } = await import('@/lib/user-db')
    await clearAllLocalData()
    await supabase.auth.signOut().catch(() => {})
    session.value = null
    profile.value = null
    Preferences.remove({ key: PROFILE_CACHE_KEY }).catch(() => {})
  }

  return {
    session,
    profile,
    loading,
    ready, // init terminée → le guard du router peut rester synchrone
    isAuthenticated,
    user,
    isPremium,
    onboardingDone,
    onboardingSnoozed,
    shouldOnboard,
    firstName,
    fullName,
    initials,
    init,
    fetchProfile,
    loadCachedProfile,
    login,
    register,
    logout,
    loginWithGoogle,
    handleOAuthCallback,
    sendResetOtp,
    verifyResetOtp,
    updatePassword,
    updateProfile,
    deleteAccount
  }
})
