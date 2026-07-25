/**
 * Synchronisation best-effort des données utilisateur locales → Supabase.
 *
 * Local-first : le local (user-db) reste la source d'affichage. Cette sync
 * POUSSE simplement plans / progression / streak vers Supabase quand
 * l'utilisateur est connecté ET en ligne. Non bloquante, silencieuse en cas
 * d'échec (on réessaiera au prochain déclenchement).
 *
 * ⚠️ v1 = push seulement. La file de sync robuste + pull bidirectionnel avec
 * résolution de conflits fine sont une itération suivante.
 */

import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { isOnline } from '@/lib/network'
import { getActivePlan, getStreak, listPrayers } from '@/lib/user-db'

let syncing = false

/** Pousse les données locales vers Supabase (si connecté + en ligne). */
export async function pushUserData() {
  if (syncing) return
  const auth = useAuthStore()
  if (!auth.isAuthenticated) return
  if (!(await isOnline())) return

  syncing = true
  try {
    const userId = auth.user?.id
    if (!userId) return

    // 1) Plan actif : on désactive les plans distants puis on (ré)insère le
    //    plan courant (id UUID généré côté Supabase). Idempotent, pas de doublon
    //    de plan ACTIF. (Le local reste la source d'affichage.)
    const plan = await getActivePlan()
    if (plan) {
      await supabase.from('reading_plans').update({ is_active: false })
        .eq('user_id', userId).eq('is_active', true)
      await supabase.from('reading_plans').insert({
        user_id: userId,
        plan_type: plan.plan_type,
        total_days: plan.total_days,
        current_day: plan.current_day,
        schedule: plan.schedule,
        is_active: true,
        completed_at: plan.completed_at ?? null
      })
    }

    // 2) Streak
    const streak = await getStreak()
    await supabase.from('streaks').upsert({
      user_id: userId,
      current_streak: streak.current_streak ?? 0,
      longest_streak: streak.longest_streak ?? 0,
      last_active: streak.last_active ?? null
    }, { onConflict: 'user_id' })

    // 3) Prières : upsert par (user_id, local_id) → idempotent, pas de doublon.
    const prayers = await listPrayers()
    if (prayers.length) {
      await supabase.from('prayers').upsert(
        prayers.map((p) => ({
          user_id: userId,
          local_id: p.id,
          content: p.content,
          is_answered: !!p.is_answered,
          answered_at: p.answered_at ?? null
        })),
        { onConflict: 'user_id,local_id' }
      )
    }

    // 4) La progression des chapitres (reading_progress) peut être volumineuse :
    //    on la synchronisera par lots dans une itération suivante (file de sync).
  } catch {
    /* échec réseau/serveur → silencieux, on réessaiera plus tard */
  } finally {
    syncing = false
  }
}
