/**
 * Script : generate-version-ebible.js
 * Génère une base SQLite de Bible (1 version) depuis eBible.org (format VPL :
 * une ligne par verset, « GEN 1:1 texte »).
 *
 * Usage :
 *   node scripts/generate-version-ebible.js bsb
 *
 * Produit : dist-bibles/<id>SQLite.db, au même schéma que generate-version.js
 * (versions/books/verses), donc compatible bible-db.js.
 *
 * Uniquement des versions DOMAINE PUBLIC (vérifié dans le catalogue eBible.org,
 * colonne Copyright). Les livres deutérocanoniques présents dans certaines
 * éditions sont ignorés : l'app ne gère que les 66 livres canoniques.
 */

import Database from 'better-sqlite3'
import JSZip from 'jszip'
import { mkdirSync, existsSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { CANON, OT_COUNT, NAMES_BY_LANGUAGE } from './bible-canon.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Codes de livres eBible (VPL) qui diffèrent de nos codes canoniques.
const EBIBLE_TO_CANON = {
  SOL: 'SNG', EZE: 'EZK', JOE: 'JOL', NAH: 'NAM', MAR: 'MRK', JOH: 'JHN',
  PHI: 'PHP', JAM: 'JAS', '1JO': '1JN', '2JO': '2JN', '3JO': '3JN'
}

// Catalogue des versions générables (clé CLI → métadonnées).
const VERSIONS = {
  bsb:      { id: 'BSB',          name: 'Berean Standard Bible',             language: 'en', ebible: 'engbsb' },
  bbe:      { id: 'BBE',          name: 'Bible in Basic English',            language: 'en', ebible: 'engBBE' },
  dra:      { id: 'DRA',          name: 'Douay-Rheims 1899',                 language: 'en', ebible: 'engDRA' },
  gnv:      { id: 'GNV',          name: 'Geneva Bible 1599',                 language: 'en', ebible: 'enggnv' },
  rv:       { id: 'RV1885',       name: 'Revised Version 1885',              language: 'en', ebible: 'eng-rv' },
  darbyen:  { id: 'DARBY_EN',     name: 'Darby Translation',                 language: 'en', ebible: 'engDBY' },
  webster:  { id: 'WEBSTER',      name: 'Noah Webster Bible',                language: 'en', ebible: 'engwebster' },
  msb:      { id: 'MSB',          name: 'Majority Standard Bible',           language: 'en', ebible: 'engmsb' },
  wmb:      { id: 'WMB',          name: 'World Messianic Bible',             language: 'en', ebible: 'engwmb' },
  ostervald:{ id: 'OSTERVALD_FR', name: 'Ostervald',                         language: 'fr', ebible: 'fra_fob' },
  blmfr:    { id: 'BLM_FR',       name: 'Sainte Bible libre pour le monde',  language: 'fr', ebible: 'frasbl' },
  rv1909:   { id: 'RV1909',       name: 'Reina-Valera 1909',                 language: 'es', ebible: 'spaRV1909' },
  bes:      { id: 'BES_ES',       name: 'La Biblia en Español Sencillo',     language: 'es', ebible: 'spabes' },
  blmes:    { id: 'BLM_ES',       name: 'Santa Biblia libre para el mundo',  language: 'es', ebible: 'spablm' },
  bll:      { id: 'BLL_ES',       name: 'Santa Biblia libre Latinoamericana', language: 'es', ebible: 'spabll' }
}

async function downloadVpl(ebibleId) {
  const url = `https://ebible.org/Scriptures/${ebibleId}_vpl.zip`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`)
  const zip = await JSZip.loadAsync(Buffer.from(await res.arrayBuffer()))
  const entry = zip.file(`${ebibleId}_vpl.txt`)
  if (!entry) throw new Error(`${ebibleId}_vpl.txt absent de l'archive`)
  return entry.async('string')
}

async function main() {
  const key = process.argv[2]
  const cfg = VERSIONS[key]
  if (!cfg) {
    console.error(`Version inconnue : "${key}". Disponibles : ${Object.keys(VERSIONS).join(', ')}`)
    process.exit(1)
  }
  const names = NAMES_BY_LANGUAGE[cfg.language]

  const outDir = join(ROOT, 'dist-bibles')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const dbPath = join(outDir, `${cfg.id.toLowerCase()}SQLite.db`)
  if (existsSync(dbPath)) rmSync(dbPath) // régénération propre

  console.log(`Téléchargement ${cfg.name} (${cfg.ebible})…`)
  const text = await downloadVpl(cfg.ebible)

  // verses[bookId][chapter] = [[verse, texte], ...]
  const verses = {}
  let ignored = 0
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(\S+) (\d+):(\d+) (.*)$/)
    if (!m) continue
    const book = EBIBLE_TO_CANON[m[1]] ?? m[1]
    if (!CANON.includes(book)) { ignored++; continue } // deutérocanoniques, etc.
    const t = m[4].trim()
    if (!t) continue
    ;((verses[book] ??= {})[Number(m[2])] ??= []).push([Number(m[3]), t])
  }

  const missing = CANON.filter((b) => !verses[b])
  if (missing.length) {
    console.error(`❌ Livres manquants (${missing.length}) : ${missing.join(', ')}. Version incomplète, abandon.`)
    process.exit(1)
  }

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
  db.prepare(`INSERT OR REPLACE INTO versions (id, name, language, is_bundled) VALUES (?, ?, ?, 0)`)
    .run(cfg.id, cfg.name, cfg.language)

  const insertBook = db.prepare(
    `INSERT OR REPLACE INTO books (version_id, book_id, name, testament, chapter_count) VALUES (?, ?, ?, ?, ?)`
  )
  const insertVerse = db.prepare(
    `INSERT OR REPLACE INTO verses (version_id, book_id, chapter, verse, text) VALUES (?, ?, ?, ?, ?)`
  )

  let total = 0
  db.transaction(() => {
    CANON.forEach((book, i) => {
      const chapters = verses[book]
      const chapterCount = Math.max(...Object.keys(chapters).map(Number))
      insertBook.run(cfg.id, book, names[i], i < OT_COUNT ? 'OT' : 'NT', chapterCount)
      for (const [ch, list] of Object.entries(chapters)) {
        for (const [v, t] of list) {
          insertVerse.run(cfg.id, book, Number(ch), v, t)
          total++
        }
      }
    })
  })()
  db.close()

  console.log(`✅ ${cfg.name} générée : 66 livres, ${total} versets${ignored ? ` (${ignored} versets hors canon ignorés)` : ''}`)
  console.log(`Fichier : ${dbPath}`)
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
