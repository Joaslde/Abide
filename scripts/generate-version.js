/**
 * Script : generate-version.js
 * Génère une base SQLite de Bible (1 version) depuis getbible.net API.
 *
 * Usage :
 *   node scripts/generate-version.js kjv
 *   node scripts/generate-version.js darby
 *
 * Le 1er argument = clé de version dans VERSIONS ci-dessous.
 * Produit : dist-bibles/<id>SQLite.db (prêt à être uploadé sur R2).
 *
 * Schéma identique à lsg1910.db (versions/books/verses) → compatible bible-db.js.
 * is_bundled = 0 (version téléchargeable, pas embarquée dans l'app).
 *
 * Les ID de livres (GEN, EXO…) sont CANONIQUES et partagés entre toutes les
 * versions : c'est ce qui permet de garder la position de lecture quand on
 * change de version. Seuls les NOMS de livres changent selon la langue.
 */

import Database from 'better-sqlite3'
import { CANON, OT_COUNT, NAMES_EN, NAMES_FR, NAMES_ES } from './bible-canon.js'
import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')




// Catalogue des versions générables.
const VERSIONS = {
  kjv: {
    id: 'KJV',
    name: 'King James Version',
    language: 'en',
    apiKey: 'kjv',
    names: NAMES_EN
  },
  web: {
    id: 'WEB',
    name: 'World English Bible',
    language: 'en',
    apiKey: 'web',
    names: NAMES_EN
  },
  asv: {
    id: 'ASV',
    name: 'American Standard Version',
    language: 'en',
    apiKey: 'asv',
    names: NAMES_EN
  },
  darby: {
    id: 'DARBY_FR',
    name: 'Darby (Français)',
    language: 'fr',
    apiKey: 'darby',
    names: NAMES_FR
  },
  ylt: {
    id: 'YLT',
    name: "Young's Literal Translation",
    language: 'en',
    apiKey: 'ylt',
    names: NAMES_EN
  },
  martin: {
    id: 'MARTIN_FR',
    name: 'Martin 1744 (Français)',
    language: 'fr',
    apiKey: 'martin',
    names: NAMES_FR
  },
  akjv: {
    id: 'AKJV',
    name: 'American King James Version',
    language: 'en',
    apiKey: 'akjv',
    names: NAMES_EN
  },
  sse: {
    id: 'SSE_ES',
    name: 'Sagradas Escrituras 1569',
    language: 'es',
    apiKey: 'sse',
    names: NAMES_ES
  }
  // Note : 'tyndale' (apiKey getbible.net) est partiel, seulement NT + quelques livres AT.
  // Les livres 6-39 retournent 404. Ne pas uploader : mauvaise expérience utilisateur.
  // bbe, neg1979, nbs : introuvables sur getbible.net (404 sur le livre 1).
}

// Retire les marques de paragraphe (¶) et les espaces multiples laissés par
// certaines versions de getbible.net (AKJV, Sagradas Escrituras…).
function cleanText(text) {
  return text.replace(/¶/g, '').replace(/\s+/g, ' ').trim()
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchBook(apiKey, bookNr, retries = 3) {
  const url = `https://api.getbible.net/v2/${apiKey}/${bookNr}.json`
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      if (i === retries - 1) throw e
      await sleep(1500 * (i + 1))
    }
  }
}

async function main() {
  const key = process.argv[2]
  const cfg = VERSIONS[key]
  if (!cfg) {
    console.error(`Version inconnue : "${key}". Disponibles : ${Object.keys(VERSIONS).join(', ')}`)
    process.exit(1)
  }

  const outDir = join(ROOT, 'dist-bibles')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const dbPath = join(outDir, `${cfg.id.toLowerCase()}SQLite.db`)

  const db = new Database(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS versions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'fr',
      is_bundled INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS books (
      version_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      name TEXT NOT NULL,
      testament TEXT NOT NULL CHECK (testament IN ('OT', 'NT')),
      chapter_count INTEGER NOT NULL,
      PRIMARY KEY (version_id, book_id)
    );
    CREATE TABLE IF NOT EXISTS verses (
      version_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      PRIMARY KEY (version_id, book_id, chapter, verse)
    );
    CREATE INDEX IF NOT EXISTS verses_lookup ON verses (version_id, book_id, chapter);
  `)

  // is_bundled = 0 : version téléchargeable (pas embarquée dans l'app).
  db.prepare(`INSERT OR REPLACE INTO versions (id, name, language, is_bundled) VALUES (?, ?, ?, 0)`)
    .run(cfg.id, cfg.name, cfg.language)

  const insertBook = db.prepare(
    `INSERT OR REPLACE INTO books (version_id, book_id, name, testament, chapter_count) VALUES (?, ?, ?, ?, ?)`
  )
  const insertVerse = db.prepare(
    `INSERT OR REPLACE INTO verses (version_id, book_id, chapter, verse, text) VALUES (?, ?, ?, ?, ?)`
  )

  let totalVerses = 0
  console.log(`Génération ${cfg.name} (${cfg.id})…`)

  for (let i = 0; i < CANON.length; i++) {
    const bookId = CANON[i]
    const bookName = cfg.names[i]
    const testament = i < OT_COUNT ? 'OT' : 'NT'
    process.stdout.write(`\n[${i + 1}/66] ${bookName}... `)
    try {
      const data = await fetchBook(cfg.apiKey, i + 1)
      const chapters = data.chapters ?? []
      insertBook.run(cfg.id, bookId, bookName, testament, chapters.length)

      const rows = []
      for (const ch of chapters) {
        for (const v of ch.verses ?? []) {
          rows.push([cfg.id, bookId, ch.chapter, v.verse, cleanText(v.text)])
        }
      }
      const insertMany = db.transaction((vs) => { for (const r of vs) insertVerse.run(...r) })
      insertMany(rows)
      totalVerses += rows.length
      process.stdout.write(`${chapters.length} ch, ${rows.length} v ✓`)
    } catch (e) {
      process.stdout.write(`ERREUR: ${e.message}`)
    }
    await sleep(100)
  }

  db.close()
  console.log(`\n\n✅ ${cfg.name} générée : ${totalVerses} versets`)
  console.log(`Fichier : ${dbPath}`)
}

main().catch(console.error)
