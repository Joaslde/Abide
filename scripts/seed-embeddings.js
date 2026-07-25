/**
 * Script : seed-embeddings.js
 * Génère les embeddings des versets de la LSG 1910 et les insère dans
 * bible_embeddings (Supabase, pgvector) pour le RAG du Guide IA.
 *
 * ⚠️ LOCAL UNIQUEMENT — utilise la clé service_role Supabase (.env.local).
 * Cette clé BYPASSE le RLS → jamais dans l'app.
 *
 * Embeddings : Hugging Face Inference API (gratuit), modèle multilingue
 * paraphrase-multilingual-mpnet-base-v2 (768 dims). Même modèle que l'Edge
 * Function ai-chat (cohérence question/versets).
 *
 * Usage :
 *   node scripts/seed-embeddings.js            # tout (31 170 versets, long)
 *   node scripts/seed-embeddings.js --books=MAT,MRK,LUK,JHN   # sous-ensemble
 *   node scripts/seed-embeddings.js --dry-run  # test découpage, sans API ni écriture
 *
 * Reprise : skip les versets déjà présents en base (idempotent).
 *
 * Prérequis .env.local :
 *   SUPABASE_URL (ou VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY, HUGGINGFACE_KEY
 */

import Database from 'better-sqlite3'
import { createClient } from '@supabase/supabase-js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
dotenv.config({ path: join(ROOT, '.env.local') })

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const HF_KEY = process.env.HUGGINGFACE_KEY
const EMBED_MODEL = 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2'
const HF_URL = `https://router.huggingface.co/hf-inference/models/${EMBED_MODEL}/pipeline/feature-extraction`

const args = process.argv.slice(2)
const DRY = args.includes('--dry-run')
const booksArg = args.find((a) => a.startsWith('--books='))
const ONLY_BOOKS = booksArg ? booksArg.split('=')[1].split(',') : null
const BATCH = 32 // versets par appel HF (batch → plus rapide)

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

/** Embeddings d'un batch de textes via HF (retourne un tableau de vecteurs). */
async function embedBatch(texts, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(HF_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${HF_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: texts, options: { wait_for_model: true } })
      })
      if (res.status === 503) { await sleep(4000 * (i + 1)); continue } // modèle en chargement
      if (!res.ok) throw new Error(`HF ${res.status}: ${(await res.text()).slice(0, 120)}`)
      return await res.json() // [[...768], [...768], ...]
    } catch (e) {
      if (i === retries - 1) throw e
      await sleep(2000 * (i + 1))
    }
  }
}

async function main() {
  if (!DRY && (!SUPABASE_URL || !SERVICE_KEY || !HF_KEY)) {
    console.error('❌ Manque SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / HUGGINGFACE_KEY dans .env.local')
    process.exit(1)
  }

  const db = new Database(join(ROOT, 'public/assets/databases/lsg1910SQLite.db'), { readonly: true })
  let rows = db.prepare('SELECT book_id, chapter, verse, text FROM verses ORDER BY rowid').all()
  if (ONLY_BOOKS) rows = rows.filter((r) => ONLY_BOOKS.includes(r.book_id))
  console.log(`${rows.length} versets à traiter${ONLY_BOOKS ? ` (livres : ${ONLY_BOOKS.join(',')})` : ''}${DRY ? ' [DRY-RUN]' : ''}`)

  if (DRY) {
    console.log('Exemple batch :', rows.slice(0, 3).map((r) => `${r.book_id} ${r.chapter}.${r.verse}`))
    console.log('DRY-RUN : aucun appel API, aucune écriture. OK.')
    return
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

  // Reprise : versets déjà présents (clé book|chapter|verse).
  const existing = new Set()
  {
    let from = 0
    for (;;) {
      const { data, error } = await supabase
        .from('bible_embeddings')
        .select('book, chapter, verse')
        .range(from, from + 999)
      if (error) { console.error('Lecture existants :', error.message); break }
      if (!data.length) break
      for (const d of data) existing.add(`${d.book}|${d.chapter}|${d.verse}`)
      if (data.length < 1000) break
      from += 1000
    }
  }
  const todo = rows.filter((r) => !existing.has(`${r.book_id}|${r.chapter}|${r.verse}`))
  console.log(`${existing.size} déjà présents → ${todo.length} à générer.`)

  let done = 0
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH)
    const vectors = await embedBatch(batch.map((r) => r.text))
    const insert = batch.map((r, k) => ({
      version: 'LSG1910',
      book: r.book_id,
      chapter: r.chapter,
      verse: r.verse,
      text: r.text,
      embedding: vectors[k]
    }))
    const { error } = await supabase.from('bible_embeddings').insert(insert)
    if (error) { console.error(`\nErreur insert @${i}:`, error.message); await sleep(3000); continue }
    done += batch.length
    process.stdout.write(`\r  ${done}/${todo.length} versets embeddés…`)
    await sleep(200) // douceur sur le tier gratuit HF
  }
  console.log(`\n✅ Terminé : ${done} embeddings insérés.`)
}

main().catch((e) => { console.error('\n❌', e.message); process.exit(1) })
