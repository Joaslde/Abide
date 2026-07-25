/**
 * Base de données UTILISATEUR locale (surlignages, signets, notes).
 *
 * Séparée de la base Bible (readonly) : `abide_user` est INSCRIPTIBLE.
 * Local-first : tout s'écrit ici d'abord ; la file de sync Supabase viendra
 * plus tard (cf. stratégie offline actée dans lessons.md 2026-06-22).
 *
 * Deux moteurs derrière la même API :
 *   - NATIF : @capacitor-community/sqlite (connexion lecture/écriture).
 *   - WEB   : localStorage (sql.js est en mémoire seulement → inadapté à la
 *             persistance web ; localStorage suffit pour le dev navigateur).
 */

import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()
const DB_NAME = 'abide_user'

/* ───────────────────────── DDL ───────────────────────── */

const DDL = `
CREATE TABLE IF NOT EXISTS highlights (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  book_name TEXT,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  color TEXT NOT NULL,
  text TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS hl_chapter ON highlights (version_id, book_id, chapter);
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  book_name TEXT,
  chapter INTEGER NOT NULL,
  snippet TEXT,
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT,
  body TEXT,
  show_verses INTEGER DEFAULT 0,
  source TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS reading_plans (
  id TEXT PRIMARY KEY,
  plan_type TEXT,
  total_days INTEGER,
  current_day INTEGER DEFAULT 1,
  scope TEXT,
  schedule TEXT,
  title TEXT,
  template_id TEXT,
  source TEXT,
  started_at TEXT,
  completed_at TEXT,
  is_active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS reading_progress (
  id TEXT PRIMARY KEY,
  version_id TEXT,
  book_id TEXT,
  chapter INTEGER,
  read_at TEXT
);
CREATE INDEX IF NOT EXISTS rp_book ON reading_progress (version_id, book_id);
CREATE TABLE IF NOT EXISTS streak (
  id INTEGER PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active TEXT
);
CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  score INTEGER NOT NULL,
  stars INTEGER NOT NULL,
  taken_at TEXT
);
CREATE INDEX IF NOT EXISTS qr_book ON quiz_results (book_id);
CREATE TABLE IF NOT EXISTS prayers (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  is_answered INTEGER DEFAULT 0,
  answered_at TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS prayer_moments (
  id TEXT PRIMARY KEY,
  date TEXT,
  type TEXT,
  done_at TEXT
);
CREATE TABLE IF NOT EXISTS fasting (
  id TEXT PRIMARY KEY,
  type TEXT,
  start TEXT,
  end TEXT,
  joined_at TEXT,
  completed_at TEXT,
  status TEXT DEFAULT 'joined'
);
CREATE TABLE IF NOT EXISTS activity_days (
  day TEXT PRIMARY KEY,
  first_at TEXT
);
`

/* ─────────────────── clés d'identité (partagées) ─────────────────── */

export function highlightId(versionId, bookId, chapter, verse) {
  return `${versionId}|${bookId}|${chapter}|${verse}`
}
export function bookmarkId(versionId, bookId, chapter) {
  return `${versionId}|${bookId}|${chapter}`
}

/* ───────────────────────── NATIF (SQLite) ───────────────────────── */

let conn = null
let initPromise = null

// Colonnes ajoutées APRÈS coup à des tables déjà créées sur les appareils.
// CREATE TABLE IF NOT EXISTS n'ajoute PAS de colonne à une table existante →
// on force les ALTER (ignore l'erreur « duplicate column » si déjà présentes).
const MIGRATIONS = [
  'ALTER TABLE reading_plans ADD COLUMN title TEXT',
  'ALTER TABLE reading_plans ADD COLUMN template_id TEXT',
  'ALTER TABLE reading_plans ADD COLUMN source TEXT',
  // Origine d'une note : null = créée manuellement, 'ai' = exportée du Guide.
  'ALTER TABLE notes ADD COLUMN source TEXT',
  // Progression devenue GLOBALE : l'id passe de "VERSION|LIVRE|CH" à "LIVRE|CH".
  // On dédoublonne (garde la lecture la plus récente) puis on réécrit les ids.
  `DELETE FROM reading_progress WHERE rowid NOT IN (
     SELECT MAX(rowid) FROM reading_progress GROUP BY book_id, chapter
   )`,
  `UPDATE reading_progress SET id = book_id || '|' || chapter
   WHERE id LIKE '%|%|%'`,
  // Le streak a sa propre table (activity_days) : « a ouvert la Bible ce jour-là »
  // est un FAIT immuable, alors que reading_progress est un choix révocable
  // (décocher « lu » ne doit jamais effacer un jour de série passé).
  // Reprise de l'historique existant pour ne perdre aucune série en cours.
  `INSERT OR IGNORE INTO activity_days (day, first_at)
   SELECT substr(read_at, 1, 10), MIN(read_at) FROM reading_progress
   WHERE read_at IS NOT NULL GROUP BY substr(read_at, 1, 10)`
]

async function runMigrations() {
  for (const sql of MIGRATIONS) {
    try {
      await conn.execute(sql)
    } catch {
      /* déjà appliqué / colonne présente → on ignore */
    }
  }
}

async function openNative() {
  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite')
  const sqlite = new SQLiteConnection(CapacitorSQLite)
  // readonly=false → base inscriptible (la base Bible, elle, est readonly).
  conn = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false)
  await conn.open()
  await conn.execute(DDL)
  await runMigrations()
}

/* ───────────────────────── WEB (localStorage) ───────────────────────── */

const LS_PREFIX = 'abide.user.'

function lsRead(table) {
  try {
    return JSON.parse(localStorage.getItem(LS_PREFIX + table) || '[]')
  } catch {
    return []
  }
}
function lsWrite(table, rows) {
  localStorage.setItem(LS_PREFIX + table, JSON.stringify(rows))
}

/* ───────────────────────── INIT ───────────────────────── */

export async function initUserDb() {
  if (initPromise) return initPromise
  initPromise = isNative ? openNative() : Promise.resolve(migrateWebActivityDays())
  return initPromise
}

/**
 * Équivalent web de la migration SQL `activity_days` : reprend les jours
 * d'activité depuis l'historique reading_progress existant (une seule fois),
 * pour ne pas remettre à zéro la série des utilisateurs web déjà installés.
 */
function migrateWebActivityDays() {
  try {
    if (localStorage.getItem(LS_PREFIX + 'activity_days')) return // déjà fait
    const days = new Map()
    for (const r of lsRead('reading_progress')) {
      const day = (r.read_at || '').slice(0, 10)
      if (!day) continue
      if (!days.has(day) || r.read_at < days.get(day)) days.set(day, r.read_at)
    }
    lsWrite('activity_days', [...days].map(([day, first_at]) => ({ day, first_at })))
  } catch { /* stockage indisponible → on repart simplement de zéro */ }
}

/* ───────────────────────── HIGHLIGHTS ───────────────────────── */

/** Surlignages d'un chapitre → [{verse, color}] */
export async function highlightsFor(versionId, bookId, chapter) {
  await initUserDb()
  if (isNative) {
    const res = await conn.query(
      'SELECT verse, color FROM highlights WHERE version_id=? AND book_id=? AND chapter=?',
      [versionId, bookId, chapter]
    )
    return res.values ?? []
  }
  return lsRead('highlights')
    .filter((h) => h.version_id === versionId && h.book_id === bookId && h.chapter === chapter)
    .map((h) => ({ verse: h.verse, color: h.color }))
}


/**
 * Écrit/remplace des surlignages. rows = [{version_id, book_id, book_name,
 * chapter, verse, color, text}]. Upsert par id.
 * 
 * 
 */
export async function setHighlights(rows) {
  await initUserDb()
  const now = new Date().toISOString()
  if (isNative) {
    for (const r of rows) {
      await conn.run(
        `INSERT OR REPLACE INTO highlights
         (id, version_id, book_id, book_name, chapter, verse, color, text, created_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          highlightId(r.version_id, r.book_id, r.chapter, r.verse),
          r.version_id, r.book_id, r.book_name ?? '', r.chapter, r.verse,
          r.color, r.text ?? '', now
        ]
      )
    }
    return
  }
  const all = lsRead('highlights')
  for (const r of rows) {
    const id = highlightId(r.version_id, r.book_id, r.chapter, r.verse)
    const idx = all.findIndex((h) => h.id === id)
    const entry = { id, ...r, created_at: now }
    if (idx >= 0) all[idx] = entry
    else all.push(entry)
  }
  lsWrite('highlights', all)
}

/** Supprime des surlignages par ids. */
export async function removeHighlights(ids) {
  await initUserDb()
  if (isNative) {
    for (const id of ids) {
      await conn.run('DELETE FROM highlights WHERE id=?', [id])
    }
    return
  }
  const keep = lsRead('highlights').filter((h) => !ids.includes(h.id))
  lsWrite('highlights', keep)
}

/** Tous les surlignages (liste « Surlignés »), plus récents d'abord. */
export async function listAllHighlights() {
  await initUserDb()
  if (isNative) {
    const res = await conn.query('SELECT * FROM highlights ORDER BY created_at DESC')
    return res.values ?? []
  }
  return lsRead('highlights').sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
}

/* ───────────────────────── BOOKMARKS ───────────────────────── */

export async function isBookmarked(id) {
  await initUserDb()
  if (isNative) {
    const res = await conn.query('SELECT id FROM bookmarks WHERE id=?', [id])
    return (res.values ?? []).length > 0
  }
  return lsRead('bookmarks').some((b) => b.id === id)
}

/** Ajoute/retire un signet de chapitre. Retourne le nouvel état (true = posé). */
export async function toggleBookmark(entry) {
  await initUserDb()
  const id = bookmarkId(entry.version_id, entry.book_id, entry.chapter)
  const exists = await isBookmarked(id)
  if (isNative) {
    if (exists) {
      await conn.run('DELETE FROM bookmarks WHERE id=?', [id])
    } else {
      await conn.run(
        `INSERT INTO bookmarks (id, version_id, book_id, book_name, chapter, snippet, created_at)
         VALUES (?,?,?,?,?,?,?)`,
        [id, entry.version_id, entry.book_id, entry.book_name ?? '', entry.chapter,
         entry.snippet ?? '', new Date().toISOString()]
      )
    }
    return !exists
  }
  let all = lsRead('bookmarks')
  if (exists) all = all.filter((b) => b.id !== id)
  else all.push({ id, ...entry, created_at: new Date().toISOString() })
  lsWrite('bookmarks', all)
  return !exists
}

export async function listBookmarks() {
  await initUserDb()
  if (isNative) {
    const res = await conn.query('SELECT * FROM bookmarks ORDER BY created_at DESC')
    return res.values ?? []
  }
  return lsRead('bookmarks').sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
}

/* ───────────────────────── NOTES ───────────────────────── */

export async function listNotes() {
  await initUserDb()
  if (isNative) {
    const res = await conn.query('SELECT * FROM notes ORDER BY updated_at DESC')
    return res.values ?? []
  }
  return lsRead('notes').sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
}

export async function getNote(id) {
  await initUserDb()
  if (isNative) {
    const res = await conn.query('SELECT * FROM notes WHERE id=?', [id])
    return res.values?.[0] ?? null
  }
  return lsRead('notes').find((n) => n.id === id) ?? null
}

/**
 * Crée ou met à jour une note. note = {id, title, body, show_verses, source?}.
 * `source` ('ai' | null) : origine de la note. Non fourni lors d'une édition
 * normale → on PRÉSERVE la valeur existante (ne jamais effacer le badge IA).
 */
export async function saveNote(note) {
  await initUserDb()
  const now = new Date().toISOString()
  if (isNative) {
    const existing = await getNote(note.id)
    const source = note.source !== undefined ? note.source : (existing?.source ?? null)
    await conn.run(
      `INSERT OR REPLACE INTO notes (id, title, body, show_verses, source, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?)`,
      [note.id, note.title ?? '', note.body ?? '', note.show_verses ? 1 : 0,
       source, existing?.created_at ?? now, now]
    )
    return
  }
  const all = lsRead('notes')
  const idx = all.findIndex((n) => n.id === note.id)
  if (idx >= 0) {
    // Préserver source si non fourni (édition normale).
    const source = note.source !== undefined ? note.source : all[idx].source
    all[idx] = { ...all[idx], ...note, source, show_verses: note.show_verses ? 1 : 0, updated_at: now }
  } else {
    all.push({ ...note, source: note.source ?? null, show_verses: note.show_verses ? 1 : 0, created_at: now, updated_at: now })
  }
  lsWrite('notes', all)
}

export async function deleteNote(id) {
  await initUserDb()
  if (isNative) {
    await conn.run('DELETE FROM notes WHERE id=?', [id])
    return
  }
  lsWrite('notes', lsRead('notes').filter((n) => n.id !== id))
}

/* ───────────────────────── PLANS DE LECTURE ───────────────────────── */

/** Plan de lecture actif (ou null). schedule est parsé en objet. */
export async function getActivePlan() {
  await initUserDb()
  let row
  if (isNative) {
    const res = await conn.query('SELECT * FROM reading_plans WHERE is_active=1 LIMIT 1')
    row = res.values?.[0]
  } else {
    row = lsRead('reading_plans').find((p) => p.is_active)
  }
  if (!row) return null
  return { ...row, schedule: typeof row.schedule === 'string' ? JSON.parse(row.schedule) : row.schedule }
}

/** Désactive tous les plans (avant d'en créer un nouveau). */
export async function deactivatePlans() {
  await initUserDb()
  if (isNative) {
    await conn.run('UPDATE reading_plans SET is_active=0', [])
    return
  }
  lsWrite('reading_plans', lsRead('reading_plans').map((p) => ({ ...p, is_active: 0 })))
}

/** Crée/remplace un plan (upsert). schedule = tableau (sérialisé en JSON). */
export async function savePlan(plan) {
  await initUserDb()
  const scheduleStr = JSON.stringify(plan.schedule ?? [])
  if (isNative) {
    await conn.run(
      `INSERT OR REPLACE INTO reading_plans
       (id, plan_type, total_days, current_day, scope, schedule, title, template_id, source, started_at, completed_at, is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [plan.id, plan.plan_type, plan.total_days, plan.current_day ?? 1, plan.scope,
       scheduleStr, plan.title ?? null, plan.template_id ?? null, plan.source ?? null,
       plan.started_at ?? new Date().toISOString(), plan.completed_at ?? null,
       plan.is_active ? 1 : 0]
    )
    return
  }
  const all = lsRead('reading_plans').filter((p) => p.id !== plan.id)
  all.push({ ...plan, schedule: scheduleStr, is_active: plan.is_active ? 1 : 0,
    started_at: plan.started_at ?? new Date().toISOString() })
  lsWrite('reading_plans', all)
}

/** Met à jour le jour courant (et completed_at si fourni). */
export async function setPlanDay(id, day, completedAt = null) {
  await initUserDb()
  if (isNative) {
    await conn.run('UPDATE reading_plans SET current_day=?, completed_at=? WHERE id=?',
      [day, completedAt, id])
    return
  }
  lsWrite('reading_plans', lsRead('reading_plans').map(
    (p) => (p.id === id ? { ...p, current_day: day, completed_at: completedAt } : p)
  ))
}

/* ───────────────────────── PROGRESSION (chapitres lus) ───────────────────────── */

/**
 * Progression GLOBALE : un chapitre lu l'est quelle que soit la version (les ids
 * de livres sont canoniques). La version reste stockée à titre informatif
 * (dernière version dans laquelle il a été lu).
 */
function progressId(bookId, chapter) {
  return `${bookId}|${chapter}`
}

/** Marque un chapitre comme lu (idempotent). */
export async function markChapterRead(versionId, bookId, chapter) {
  await initUserDb()
  const id = progressId(bookId, chapter)
  const now = new Date().toISOString()
  if (isNative) {
    await conn.run(
      `INSERT OR REPLACE INTO reading_progress (id, version_id, book_id, chapter, read_at)
       VALUES (?,?,?,?,?)`,
      [id, versionId, bookId, chapter, now]
    )
    return
  }
  const all = lsRead('reading_progress').filter((r) => r.id !== id)
  all.push({ id, version_id: versionId, book_id: bookId, chapter, read_at: now })
  lsWrite('reading_progress', all)
}

/** Retire la marque « lu » d'un chapitre. */
export async function unmarkChapterRead(bookId, chapter) {
  await initUserDb()
  const id = progressId(bookId, chapter)
  if (isNative) {
    await conn.run('DELETE FROM reading_progress WHERE id=?', [id])
    return
  }
  lsWrite('reading_progress', lsRead('reading_progress').filter((r) => r.id !== id))
}

/** Ce chapitre est-il marqué comme lu ? (toutes versions confondues) */
export async function isChapterRead(bookId, chapter) {
  await initUserDb()
  const id = progressId(bookId, chapter)
  if (isNative) {
    const res = await conn.query('SELECT id FROM reading_progress WHERE id=?', [id])
    return (res.values ?? []).length > 0
  }
  return lsRead('reading_progress').some((r) => r.id === id)
}

/**
 * Chapitres lus d'un livre → Set de numéros (pour la pastille).
 * Ignore la version (progression globale).
 */
export async function readChaptersFor(_versionId, bookId) {
  await initUserDb()
  if (isNative) {
    const res = await conn.query(
      'SELECT chapter FROM reading_progress WHERE book_id=?',
      [bookId]
    )
    return new Set((res.values ?? []).map((r) => r.chapter))
  }
  return new Set(
    lsRead('reading_progress')
      .filter((r) => r.book_id === bookId)
      .map((r) => r.chapter)
  )
}

/* ───────────────────── ACTIVITÉ QUOTIDIENNE (source du streak) ───────────────────── */

/**
 * Marque AUJOURD'HUI comme un jour d'activité (l'utilisateur a ouvert un
 * chapitre). Idempotent : le premier passage du jour fait foi.
 *
 * ⚠️ Table distincte de reading_progress À DESSEIN : ouvrir la Bible est un FAIT
 * (règle permissive du streak), alors que « chapitre lu » est un choix explicite
 * et RÉVOCABLE. Les mélanger faisait qu'un jour sans chapitre coché valait 0 —
 * et que décocher un chapitre aurait effacé un jour de série passé.
 * @param {string} day  'YYYY-MM-DD' (date LOCALE — le streak suit le fuseau user)
 */
export async function markActiveDay(day) {
  await initUserDb()
  const now = new Date().toISOString()
  if (isNative) {
    await conn.run(
      'INSERT OR IGNORE INTO activity_days (day, first_at) VALUES (?,?)', [day, now]
    )
    return
  }
  const all = lsRead('activity_days')
  if (!all.some((r) => r.day === day)) {
    all.push({ day, first_at: now })
    lsWrite('activity_days', all)
  }
}

/**
 * TOUTES les dates (YYYY-MM-DD) où l'utilisateur a ouvert la Bible.
 * Source de vérité du streak (Duolingo-like) : on recompte la série depuis
 * l'historique réel, jamais depuis un compteur stocké (corruptible).
 */
export async function allReadDates() {
  await initUserDb()
  let rows
  if (isNative) {
    const res = await conn.query('SELECT day FROM activity_days')
    rows = res.values ?? []
  } else {
    rows = lsRead('activity_days')
  }
  return new Set(rows.map((r) => r.day).filter(Boolean))
}

/** Jours d'activité (YYYY-MM-DD) dans [startDay, endDay] inclus. */
export async function readDatesInRange(startDay, endDay) {
  await initUserDb()
  let rows
  if (isNative) {
    const res = await conn.query(
      'SELECT day FROM activity_days WHERE day>=? AND day<=?', [startDay, endDay]
    )
    rows = res.values ?? []
  } else {
    rows = lsRead('activity_days').filter((r) => r.day >= startDay && r.day <= endDay)
  }
  return new Set(rows.map((r) => r.day).filter(Boolean))
}

/* ───────────────────────── STREAK ───────────────────────── */

export async function getStreak() {
  await initUserDb()
  let row
  if (isNative) {
    const res = await conn.query('SELECT * FROM streak WHERE id=1')
    row = res.values?.[0]
  } else {
    row = lsRead('streak')[0]
  }
  return row ?? { current_streak: 0, longest_streak: 0, last_active: null }
}

export async function setStreak({ current_streak, longest_streak, last_active }) {
  await initUserDb()
  if (isNative) {
    await conn.run(
      `INSERT OR REPLACE INTO streak (id, current_streak, longest_streak, last_active)
       VALUES (1,?,?,?)`,
      [current_streak, longest_streak, last_active]
    )
    return
  }
  lsWrite('streak', [{ id: 1, current_streak, longest_streak, last_active }])
}

/* ───────────────────────── QUIZ (résultats par chapitre) ───────────────────────── */

/**
 * Résultat de quiz GLOBAL par chapitre (comme reading_progress : le contenu du
 * chapitre est le même quelle que soit la version → les ids de livres sont
 * canoniques). On ne garde QUE le meilleur score (rejouer ne fait jamais perdre
 * d'étoiles — décision utilisateur 2026-07-10).
 *
 * ⚠️ TODO(sync) : purement local pour l'instant, comme reading_progress dont la
 * sync Supabase est reportée (cf. sync.js). À pousser par lots plus tard.
 */
function quizId(bookId, chapter) {
  return `${bookId}|${chapter}`
}

/** Résultat du quiz d'un chapitre → { score, stars } ou null. */
export async function getQuizResult(bookId, chapter) {
  await initUserDb()
  const id = quizId(bookId, chapter)
  if (isNative) {
    const res = await conn.query('SELECT score, stars FROM quiz_results WHERE id=?', [id])
    return res.values?.[0] ?? null
  }
  return lsRead('quiz_results').find((r) => r.id === id) ?? null
}

/**
 * Enregistre un résultat de quiz SI c'est un nouveau record (score strictement
 * supérieur au meilleur enregistré). Retourne le résultat CONSERVÉ { score,
 * stars, isBest } — isBest=true si ce résultat vient de battre l'ancien.
 */
export async function saveQuizResult(bookId, chapter, score, stars) {
  await initUserDb()
  const id = quizId(bookId, chapter)
  const now = new Date().toISOString()
  const prev = await getQuizResult(bookId, chapter)
  // On ne remplace que si le nouveau score est meilleur (best-score).
  if (prev && prev.score >= score) {
    return { score: prev.score, stars: prev.stars, isBest: false }
  }
  if (isNative) {
    await conn.run(
      `INSERT OR REPLACE INTO quiz_results (id, book_id, chapter, score, stars, taken_at)
       VALUES (?,?,?,?,?,?)`,
      [id, bookId, chapter, score, stars, now]
    )
  } else {
    const all = lsRead('quiz_results').filter((r) => r.id !== id)
    all.push({ id, book_id: bookId, chapter, score, stars, taken_at: now })
    lsWrite('quiz_results', all)
  }
  return { score, stars, isBest: true }
}

/**
 * Résultats de quiz d'un livre → Map<chapitre, étoiles> (pour la grille de
 * chapitres). Ignore la version (résultat global).
 */
export async function quizResultsFor(bookId) {
  await initUserDb()
  if (isNative) {
    const res = await conn.query('SELECT chapter, stars FROM quiz_results WHERE book_id=?', [bookId])
    return new Map((res.values ?? []).map((r) => [r.chapter, r.stars]))
  }
  return new Map(
    lsRead('quiz_results')
      .filter((r) => r.book_id === bookId)
      .map((r) => [r.chapter, r.stars])
  )
}

/* ───────────────────────── SANCTUAIRE : PRIÈRES ───────────────────────── */

/** Tous les sujets de prière, plus récents d'abord. */
export async function listPrayers() {
  await initUserDb()
  if (isNative) {
    const res = await conn.query('SELECT * FROM prayers ORDER BY created_at DESC')
    return res.values ?? []
  }
  return lsRead('prayers').sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
}

/** Ajoute/remplace un sujet de prière. { id, content, is_answered?, answered_at? } */
export async function savePrayer(p) {
  await initUserDb()
  const now = new Date().toISOString()
  const row = {
    id: p.id,
    content: p.content,
    is_answered: p.is_answered ? 1 : 0,
    answered_at: p.answered_at ?? null,
    created_at: p.created_at ?? now,
    updated_at: now
  }
  if (isNative) {
    await conn.run(
      `INSERT OR REPLACE INTO prayers (id, content, is_answered, answered_at, created_at, updated_at)
       VALUES (?,?,?,?,?,?)`,
      [row.id, row.content, row.is_answered, row.answered_at, row.created_at, row.updated_at]
    )
    return row
  }
  const all = lsRead('prayers').filter((x) => x.id !== row.id)
  all.push(row)
  lsWrite('prayers', all)
  return row
}

export async function deletePrayer(id) {
  await initUserDb()
  if (isNative) {
    await conn.run('DELETE FROM prayers WHERE id=?', [id])
    return
  }
  lsWrite('prayers', lsRead('prayers').filter((p) => p.id !== id))
}

/* ─────────────── SANCTUAIRE : MOMENTS DE PRIÈRE (matin/soir) ─────────────── */

/** Marque le moment (morning|evening) comme fait pour une date. */
export async function markPrayerMoment(date, type) {
  await initUserDb()
  const id = `${date}|${type}`
  const now = new Date().toISOString()
  if (isNative) {
    await conn.run(
      'INSERT OR REPLACE INTO prayer_moments (id, date, type, done_at) VALUES (?,?,?,?)',
      [id, date, type, now]
    )
    return
  }
  const all = lsRead('prayer_moments').filter((m) => m.id !== id)
  all.push({ id, date, type, done_at: now })
  lsWrite('prayer_moments', all)
}

/** Le moment (morning|evening) a-t-il été fait à cette date ? */
export async function isPrayerMomentDone(date, type) {
  await initUserDb()
  const id = `${date}|${type}`
  if (isNative) {
    const res = await conn.query('SELECT id FROM prayer_moments WHERE id=?', [id])
    return (res.values ?? []).length > 0
  }
  return lsRead('prayer_moments').some((m) => m.id === id)
}

/* ───────────────────────── SANCTUAIRE : JEÛNE ───────────────────────── */

/** Participation active (status=joined et end >= aujourd'hui), ou null. */
export async function activeFast(todayIso) {
  await initUserDb()
  if (isNative) {
    const res = await conn.query(
      "SELECT * FROM fasting WHERE status='joined' AND end >= ? ORDER BY joined_at DESC LIMIT 1",
      [todayIso]
    )
    return (res.values ?? [])[0] ?? null
  }
  return (
    lsRead('fasting')
      .filter((f) => f.status === 'joined' && f.end >= todayIso)
      .sort((a, b) => (b.joined_at || '').localeCompare(a.joined_at || ''))[0] ?? null
  )
}

/** Rejoindre un jeûne (calendaire ou personnel). */
export async function joinFast({ id, type, start, end }) {
  await initUserDb()
  const now = new Date().toISOString()
  if (isNative) {
    await conn.run(
      `INSERT OR REPLACE INTO fasting (id, type, start, end, joined_at, completed_at, status)
       VALUES (?,?,?,?,?,NULL,'joined')`,
      [id, type, start, end, now]
    )
    return
  }
  const all = lsRead('fasting').filter((f) => f.id !== id)
  all.push({ id, type, start, end, joined_at: now, completed_at: null, status: 'joined' })
  lsWrite('fasting', all)
}

/** Quitter (abandonner) un jeûne en cours. */
export async function leaveFast(id) {
  await initUserDb()
  if (isNative) {
    await conn.run("UPDATE fasting SET status='abandoned' WHERE id=?", [id])
    return
  }
  const all = lsRead('fasting')
  const f = all.find((x) => x.id === id)
  if (f) f.status = 'abandoned'
  lsWrite('fasting', all)
}

/** Marquer un jeûne comme terminé (dernier jour atteint). */
export async function completeFast(id) {
  await initUserDb()
  const now = new Date().toISOString()
  if (isNative) {
    await conn.run("UPDATE fasting SET status='completed', completed_at=? WHERE id=?", [now, id])
    return
  }
  const all = lsRead('fasting')
  const f = all.find((x) => x.id === id)
  if (f) {
    f.status = 'completed'
    f.completed_at = now
  }
  lsWrite('fasting', all)
}

/** Historique des jeûnes (tous statuts), plus récents d'abord. */
export async function fastHistory() {
  await initUserDb()
  if (isNative) {
    const res = await conn.query('SELECT * FROM fasting ORDER BY start DESC')
    return res.values ?? []
  }
  return lsRead('fasting').sort((a, b) => (b.start || '').localeCompare(a.start || ''))
}

/* ───────────────────────── PURGE LOCALE (suppression de compte) ───────────────────────── */

/** Toutes les tables de données utilisateur locales (hors Bible, qui est read-only). */
const USER_TABLES = [
  'highlights', 'bookmarks', 'notes', 'reading_plans', 'reading_progress',
  'streak', 'quiz_results', 'prayers', 'prayer_moments', 'fasting', 'activity_days'
]

/**
 * Efface TOUTES les données utilisateur locales (suppression de compte RGPD).
 * Vide chaque table (natif) ou clé localStorage (web) sans supprimer la base
 * elle-même — les tables restent prêtes à être réutilisées si l'utilisateur
 * recrée un compte. La Bible (base read-only séparée) n'est jamais touchée.
 */
export async function clearAllLocalData() {
  await initUserDb()
  if (isNative) {
    for (const table of USER_TABLES) {
      await conn.execute(`DELETE FROM ${table}`).catch(() => {})
    }
    return
  }
  for (const table of USER_TABLES) {
    localStorage.removeItem(LS_PREFIX + table)
  }
}
