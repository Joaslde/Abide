import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!session.value)
  const user = computed(() => session.value?.user ?? null)
  const isPremium = computed(() => profile.value?.is_premium ?? false)
  const onboardingDone = computed(() => profile.value?.onboarding_done ?? false)

  async function init() {
    loading.value = true
    try {
      const { data } = await supabase.auth.getSession()
      session.value = data.session

      if (session.value) {
        await fetchProfile()
      }

      supabase.auth.onAuthStateChange(async (event, newSession) => {
        session.value = newSession
        if (newSession) {
          await fetchProfile()
        } else {
          profile.value = null
        }
      })
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
    if (!error) profile.value = data
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    session.value = data.session
    await fetchProfile()
  }

  async function register(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    session.value = null
    profile.value = null
  }

  async function sendMagicLink(email) {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) throw error
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
  }

  return {
    session,
    profile,
    loading,
    isAuthenticated,
    user,
    isPremium,
    onboardingDone,
    init,
    fetchProfile,
    login,
    register,
    logout,
    sendMagicLink,
    updateProfile
  }
})
