/**
 * Synchronisation des données utilisateur entre SQLite (local) et Supabase.
 *
 * PROMESSE PRODUIT : tout ce que l'utilisateur crée localement doit remonter
 * dans le cloud dès qu'il y a du réseau, et redescendre à l'identique sur un
 * nouvel appareil. Avant le 2026-09-07, seules 3 tables sur 11 étaient
 * poussées — d'où une perte définitive de surlignages/notes/signets lors d'un
 * effacement des données. Voir docs/sync-plan.md et tasks/lessons.md.
 *
 * ARCHITECTURE
 * - Local-first : SQLite reste la source d'affichage. La sync ne bloque JAMAIS
 *   l'interface et échoue en silence (on réessaie au prochain déclenchement).
 * - Idempotence : chaque ligne cloud porte `local_id` (l'id SQLite) avec un
 *   UNIQUE (user_id, local_id). On fait donc des UPSERT, jamais des INSERT —
 *   c'est ce qui manquait et qui a produit 1069 lignes de plans pour 2 users.
 * - Sens :
 *     pushUserData() → local vers cloud (au retour du réseau, après modification)
 *     pullUserData() → cloud vers local (à la connexion, ou si base locale vide)
 */

import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { isOnline } from '@/lib/network'
import {
  getStreak, setStreak,
  listPrayers, savePrayer,
  listAllHighlights, setHighlights,
  listBookmarks, toggleBookmark, isBookmarked, bookmarkId,
  listNotes, saveNote,
  listAllReadChapters, markChapterRead,
  listAllQuizResults, saveQuizResult,
  listAllPrayerMoments, markPrayerMoment,
  listAllFasting, joinFast,
  listAllActivityDays, markActiveDay,
  listAllPlans, savePlan
} from '@/lib/user-db'

let syncing = false
let pulling = false

/** Découpe un tableau en lots — évite les requêtes géantes (644 chapitres lus). */
function chunk(arr, size = 200) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/** Upsert par lots, silencieux en cas d'échec partiel. */
async function upsertAll(table, rows, onConflict) {
  if (!rows.length) return
  for (const batch of chunk(rows)) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict })
    if (error) console.warn(`[sync] push ${table} :`, error.message)
  }
}

/* ══════════════════════════ PUSH : local → cloud ══════════════════════════ */

/**
 * Pousse TOUTES les données locales vers Supabase.
 * Appelé au retour du réseau (main.js) et après une modification locale.
 */
export async function pushUserData() {
  if (syncing) return
  const auth = useAuthStore()
  if (!auth.isAuthenticated) return
  if (!(await isOnline())) return

  const userId = auth.user?.id
  if (!userId) return

  syncing = true
  try {
    const [
      streak, prayers, highlights, bookmarks, notes,
      progress, quizzes, moments, fasts, days, plans
    ] = await Promise.all([
      getStreak(), listPrayers(), listAllHighlights(), listBookmarks(), listNotes(),
      listAllReadChapters(), listAllQuizResults(), listAllPrayerMoments(),
      listAllFasting(), listAllActivityDays(), listAllPlans()
    ])

    // — Streak (une seule ligne par utilisateur) —
    await supabase.from('streaks').upsert({
      user_id: userId,
      current_streak: streak.current_streak ?? 0,
      longest_streak: streak.longest_streak ?? 0,
      last_active: streak.last_active ?? null
    }, { onConflict: 'user_id' })

    // — Prières —
    await upsertAll('prayers', prayers.map((p) => ({
      user_id: userId, local_id: p.id,
      content: p.content,
      is_answered: !!p.is_answered,
      answered_at: p.answered_at ?? null
    })), 'user_id,local_id')

    // — Surlignages —
    await upsertAll('highlights', highlights.map((h) => ({
      user_id: userId, local_id: h.id,
      version_id: h.version_id, book_id: h.book_id, book_name: h.book_name ?? null,
      chapter: h.chapter, verse: h.verse, color: h.color, text: h.text ?? null,
      created_at: h.created_at ?? null
    })), 'user_id,local_id')

    // — Signets —
    await upsertAll('bookmarks', bookmarks.map((b) => ({
      user_id: userId, local_id: b.id,
      version_id: b.version_id, book_id: b.book_id, book_name: b.book_name ?? null,
      chapter: b.chapter, snippet: b.snippet ?? null,
      created_at: b.created_at ?? null
    })), 'user_id,local_id')

    // — Notes —
    await upsertAll('notes', notes.map((n) => ({
      user_id: userId, local_id: n.id,
      title: n.title ?? null, body: n.body ?? null,
      show_verses: !!n.show_verses, source: n.source ?? null,
      created_at: n.created_at ?? null, updated_at: n.updated_at ?? new Date().toISOString()
    })), 'user_id,local_id')

    // — Progression de lecture — la table existait mais n'était JAMAIS alimentée.
    //   Sa clé primaire est (user_id, version, book_id, chapter) : pas de local_id.
    await upsertAll('reading_progress', progress.map((r) => ({
      user_id: userId,
      version: r.version_id, book_id: r.book_id, chapter: r.chapter,
      read_at: r.read_at ?? null
    })), 'user_id,version,book_id,chapter')

    // — Résultats de quiz —
    await upsertAll('quiz_results', quizzes.map((q) => ({
      user_id: userId, local_id: q.id,
      book_id: q.book_id, chapter: q.chapter,
      score: q.score, stars: q.stars, taken_at: q.taken_at ?? null
    })), 'user_id,local_id')

    // — Moments de prière —
    await upsertAll('prayer_moments', moments.map((m) => ({
      user_id: userId, local_id: m.id,
      date: m.date, type: m.type, done_at: m.done_at ?? null
    })), 'user_id,local_id')

    // — Jeûnes — `start`/`end` sont des mots réservés SQL : renommés côté cloud.
    await upsertAll('fasting', fasts.map((f) => ({
      user_id: userId, local_id: f.id,
      type: f.type ?? null, start_date: f.start ?? null, end_date: f.end ?? null,
      joined_at: f.joined_at ?? null, completed_at: f.completed_at ?? null,
      status: f.status ?? 'joined'
    })), 'user_id,local_id')

    // — Jours d'activité (clé naturelle : le jour lui-même) —
    await upsertAll('activity_days', days.map((d) => ({
      user_id: userId, day: d.day, first_at: d.first_at ?? null
    })), 'user_id,day')

    // — Plans de lecture —
    // ⚠️ UPSERT sur local_id, pas INSERT : l'ancien code réinsérait le plan actif
    //    à CHAQUE sync, d'où 1069 lignes pour 2 utilisateurs.
    await upsertAll('reading_plans', plans.map((p) => ({
      user_id: userId, local_id: p.id,
      plan_type: p.plan_type, total_days: p.total_days, current_day: p.current_day,
      scope: p.scope ?? null, title: p.title ?? null,
      template_id: p.template_id ?? null, source: p.source ?? null,
      schedule: typeof p.schedule === 'string' ? JSON.parse(p.schedule) : p.schedule,
      is_active: !!p.is_active,
      started_at: p.started_at ?? null, completed_at: p.completed_at ?? null
    })), 'user_id,local_id')
  } catch (e) {
    console.warn('[sync] push interrompu :', e?.message ?? e)
  } finally {
    syncing = false
  }
}

/* ══════════════════════════ PULL : cloud → local ══════════════════════════ */

/**
 * Restaure les données depuis Supabase vers SQLite.
 *
 * C'est ce qui rend vraie la promesse « je change de téléphone et je retrouve
 * tout ». Appelé à la connexion. Les écritures locales utilisent les fonctions
 * existantes de user-db (INSERT OR REPLACE sur des ids déterministes), donc
 * rejouer un pull ne crée aucun doublon.
 *
 * @returns {Promise<Object|null>} compte des éléments restaurés, ou null
 */
export async function pullUserData() {
  if (pulling) return null
  const auth = useAuthStore()
  if (!auth.isAuthenticated) return null
  if (!(await isOnline())) return null

  const userId = auth.user?.id
  if (!userId) return null

  pulling = true
  const counts = {}
  try {
    const q = (table) => supabase.from(table).select('*').eq('user_id', userId)

    const [
      streakRes, prayersRes, highlightsRes, bookmarksRes, notesRes,
      progressRes, quizRes, momentsRes, fastsRes, daysRes, plansRes
    ] = await Promise.all([
      q('streaks').maybeSingle(), q('prayers'), q('highlights'), q('bookmarks'),
      q('notes'), q('reading_progress'), q('quiz_results'), q('prayer_moments'),
      q('fasting'), q('activity_days'), q('reading_plans')
    ])

    // — Streak : on garde la MEILLEURE valeur des deux côtés. Le cloud peut être
    //   en retard (sync ratée) ; écraser aveuglément ferait perdre une série.
    const cloudStreak = streakRes.data
    if (cloudStreak) {
      const local = await getStreak()
      await setStreak({
        current_streak: Math.max(cloudStreak.current_streak ?? 0, local.current_streak ?? 0),
        longest_streak: Math.max(cloudStreak.longest_streak ?? 0, local.longest_streak ?? 0),
        last_active: [cloudStreak.last_active, local.last_active].filter(Boolean).sort().pop() ?? null
      })
      counts.streak = 1
    }

    for (const p of prayersRes.data ?? []) {
      await savePrayer({
        id: p.local_id, content: p.content,
        is_answered: p.is_answered ? 1 : 0, answered_at: p.answered_at
      })
    }
    counts.prayers = (prayersRes.data ?? []).length

    // Surlignages : setHighlights prend un TABLEAU PLAT de lignes et fait un
    // INSERT OR REPLACE par id déterministe → un seul appel, idempotent.
    const hlRows = (highlightsRes.data ?? []).map((h) => ({
      version_id: h.version_id, book_id: h.book_id, book_name: h.book_name,
      chapter: h.chapter, verse: h.verse, color: h.color, text: h.text
    }))
    if (hlRows.length) await setHighlights(hlRows)
    counts.highlights = hlRows.length

    // ⚠️ toggleBookmark BASCULE : sur un signet déjà présent il le supprimerait.
    //    On ne l'appelle donc que si le signet n'existe pas encore localement.
    let bmAdded = 0
    for (const b of bookmarksRes.data ?? []) {
      const entry = {
        version_id: b.version_id, book_id: b.book_id,
        book_name: b.book_name, chapter: b.chapter, snippet: b.snippet
      }
      const id = bookmarkId(b.version_id, b.book_id, b.chapter)
      if (!(await isBookmarked(id))) {
        await toggleBookmark(entry)
        bmAdded++
      }
    }
    counts.bookmarks = bmAdded

    for (const n of notesRes.data ?? []) {
      await saveNote({
        id: n.local_id, title: n.title, body: n.body,
        show_verses: n.show_verses ? 1 : 0, source: n.source
      })
    }
    counts.notes = (notesRes.data ?? []).length

    for (const r of progressRes.data ?? []) {
      await markChapterRead(r.version, r.book_id, r.chapter)
    }
    counts.progress = (progressRes.data ?? []).length

    for (const qz of quizRes.data ?? []) {
      await saveQuizResult(qz.book_id, qz.chapter, qz.score, qz.stars)
    }
    counts.quizzes = (quizRes.data ?? []).length

    for (const m of momentsRes.data ?? []) {
      await markPrayerMoment(m.date, m.type)
    }
    counts.moments = (momentsRes.data ?? []).length

    for (const f of fastsRes.data ?? []) {
      await joinFast({
        id: f.local_id, type: f.type,
        start: f.start_date, end: f.end_date
      })
    }
    counts.fasting = (fastsRes.data ?? []).length

    for (const d of daysRes.data ?? []) {
      await markActiveDay(d.day)
    }
    counts.days = (daysRes.data ?? []).length

    // Plans : on ne restaure que ceux issus de la nouvelle sync (local_id non
    // nul). Les lignes héritées, sans local_id ni titre, ne sont pas exploitables.
    for (const p of (plansRes.data ?? []).filter((x) => x.local_id)) {
      await savePlan({
        id: p.local_id, plan_type: p.plan_type, total_days: p.total_days,
        current_day: p.current_day, scope: p.scope, title: p.title,
        template_id: p.template_id, source: p.source,
        schedule: p.schedule, is_active: p.is_active ? 1 : 0,
        started_at: p.started_at, completed_at: p.completed_at
      })
    }
    counts.plans = (plansRes.data ?? []).filter((x) => x.local_id).length

    return counts
  } catch (e) {
    console.warn('[sync] pull interrompu :', e?.message ?? e)
    return null
  } finally {
    pulling = false
  }
}
