import { createClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquantes dans .env.local')
}

/**
 * Adaptateur de stockage de session pour Capacitor.
 *
 * ⚠️ Par défaut, Supabase stocke la session dans le localStorage de la WEBVIEW.
 * Sur Android, « Vider le cache » de l'app efface ce localStorage → l'utilisateur
 * est DÉCONNECTÉ, et le stockage webview n'est de toute façon pas garanti stable
 * entre les lancements. On persiste donc la session dans @capacitor/preferences
 * (stockage NATIF durable, SharedPreferences Android / UserDefaults iOS).
 * Sur le web, on retombe sur localStorage (Preferences l'utilise en interne).
 */
const capacitorStorage = {
  getItem: async (key) => {
    const { value } = await Preferences.get({ key })
    return value ?? null
  },
  setItem: async (key, value) => {
    await Preferences.set({ key, value })
  },
  removeItem: async (key) => {
    await Preferences.remove({ key })
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Stockage NATIF sur mobile (survit au vidage de cache), localStorage sur web.
    storage: Capacitor.isNativePlatform() ? capacitorStorage : undefined,
    // PKCE : le retour OAuth se fait via ?code=... (query) au lieu du fragment #access_token=...
    // → évite la collision avec le hash routing d'Ionic (#/auth/callback).
    flowType: 'pkce',
    // On parse le code nous-mêmes dans AuthCallbackView (detectSessionInUrl ne gère pas
    // correctement les URLs hash-router), donc on désactive la détection automatique.
    detectSessionInUrl: false
  }
})
