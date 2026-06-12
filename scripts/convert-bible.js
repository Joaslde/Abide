/**
 * Script : convert-bible.js
 * Génère src/assets/bibles/lsg1910.db depuis getbible.net API (gratuit, public domain).
 * Usage : node scripts/convert-bible.js
 *
 * Source : https://api.getbible.net/v2/ls1910/{bookNr}.json
 * Une requête par livre (66 requêtes total)
 */

import Database from 'better-sqlite3'
import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DB_PATH = join(ROOT, 'src', 'assets', 'bibles', 'lsg1910.db')
const API_BASE = 'https://api.getbible.net/v2/ls1910'

// Mapping numéro livre → métadonnées (getbible.net utilise 1-66)
const BOOKS = [
  { nr: 1,  id: 'GEN', name: 'Genèse', testament: 'OT' },
  { nr: 2,  id: 'EXO', name: 'Exode', testament: 'OT' },
  { nr: 3,  id: 'LEV', name: 'Lévitique', testament: 'OT' },
  { nr: 4,  id: 'NUM', name: 'Nombres', testament: 'OT' },
  { nr: 5,  id: 'DEU', name: 'Deutéronome', testament: 'OT' },
  { nr: 6,  id: 'JOS', name: 'Josué', testament: 'OT' },
  { nr: 7,  id: 'JDG', name: 'Juges', testament: 'OT' },
  { nr: 8,  id: 'RUT', name: 'Ruth', testament: 'OT' },
  { nr: 9,  id: '1SA', name: '1 Samuel', testament: 'OT' },
  { nr: 10, id: '2SA', name: '2 Samuel', testament: 'OT' },
  { nr: 11, id: '1KI', name: '1 Rois', testament: 'OT' },
  { nr: 12, id: '2KI', name: '2 Rois', testament: 'OT' },
  { nr: 13, id: '1CH', name: '1 Chroniques', testament: 'OT' },
  { nr: 14, id: '2CH', name: '2 Chroniques', testament: 'OT' },
  { nr: 15, id: 'EZR', name: 'Esdras', testament: 'OT' },
  { nr: 16, id: 'NEH', name: 'Néhémie', testament: 'OT' },
  { nr: 17, id: 'EST', name: 'Esther', testament: 'OT' },
  { nr: 18, id: 'JOB', name: 'Job', testament: 'OT' },
  { nr: 19, id: 'PSA', name: 'Psaumes', testament: 'OT' },
  { nr: 20, id: 'PRO', name: 'Proverbes', testament: 'OT' },
  { nr: 21, id: 'ECC', name: 'Ecclésiaste', testament: 'OT' },
  { nr: 22, id: 'SNG', name: 'Cantique des Cantiques', testament: 'OT' },
  { nr: 23, id: 'ISA', name: 'Ésaïe', testament: 'OT' },
  { nr: 24, id: 'JER', name: 'Jérémie', testament: 'OT' },
  { nr: 25, id: 'LAM', name: 'Lamentations', testament: 'OT' },
  { nr: 26, id: 'EZK', name: 'Ézéchiel', testament: 'OT' },
  { nr: 27, id: 'DAN', name: 'Daniel', testament: 'OT' },
  { nr: 28, id: 'HOS', name: 'Osée', testament: 'OT' },
  { nr: 29, id: 'JOL', name: 'Joël', testament: 'OT' },
  { nr: 30, id: 'AMO', name: 'Amos', testament: 'OT' },
  { nr: 31, id: 'OBA', name: 'Abdias', testament: 'OT' },
  { nr: 32, id: 'JON', name: 'Jonas', testament: 'OT' },
  { nr: 33, id: 'MIC', name: 'Michée', testament: 'OT' },
  { nr: 34, id: 'NAM', name: 'Nahoum', testament: 'OT' },
  { nr: 35, id: 'HAB', name: 'Habacuc', testament: 'OT' },
  { nr: 36, id: 'ZEP', name: 'Sophonie', testament: 'OT' },
  { nr: 37, id: 'HAG', name: 'Aggée', testament: 'OT' },
  { nr: 38, id: 'ZEC', name: 'Zacharie', testament: 'OT' },
  { nr: 39, id: 'MAL', name: 'Malachie', testament: 'OT' },
  { nr: 40, id: 'MAT', name: 'Matthieu', testament: 'NT' },
  { nr: 41, id: 'MRK', name: 'Marc', testament: 'NT' },
  { nr: 42, id: 'LUK', name: 'Luc', testament: 'NT' },
  { nr: 43, id: 'JHN', name: 'Jean', testament: 'NT' },
  { nr: 44, id: 'ACT', name: 'Actes', testament: 'NT' },
  { nr: 45, id: 'ROM', name: 'Romains', testament: 'NT' },
  { nr: 46, id: '1CO', name: '1 Corinthiens', testament: 'NT' },
  { nr: 47, id: '2CO', name: '2 Corinthiens', testament: 'NT' },
  { nr: 48, id: 'GAL', name: 'Galates', testament: 'NT' },
  { nr: 49, id: 'EPH', name: 'Éphésiens', testament: 'NT' },
  { nr: 50, id: 'PHP', name: 'Philippiens', testament: 'NT' },
  { nr: 51, id: 'COL', name: 'Colossiens', testament: 'NT' },
  { nr: 52, id: '1TH', name: '1 Thessaloniciens', testament: 'NT' },
  { nr: 53, id: '2TH', name: '2 Thessaloniciens', testament: 'NT' },
  { nr: 54, id: '1TI', name: '1 Timothée', testament: 'NT' },
  { nr: 55, id: '2TI', name: '2 Timothée', testament: 'NT' },
  { nr: 56, id: 'TIT', name: 'Tite', testament: 'NT' },
  { nr: 57, id: 'PHM', name: 'Philémon', testament: 'NT' },
  { nr: 58, id: 'HEB', name: 'Hébreux', testament: 'NT' },
  { nr: 59, id: 'JAS', name: 'Jacques', testament: 'NT' },
  { nr: 60, id: '1PE', name: '1 Pierre', testament: 'NT' },
  { nr: 61, id: '2PE', name: '2 Pierre', testament: 'NT' },
  { nr: 62, id: '1JN', name: '1 Jean', testament: 'NT' },
  { nr: 63, id: '2JN', name: '2 Jean', testament: 'NT' },
  { nr: 64, id: '3JN', name: '3 Jean', testament: 'NT' },
  { nr: 65, id: 'JUD', name: 'Jude', testament: 'NT' },
  { nr: 66, id: 'REV', name: 'Apocalypse', testament: 'NT' }
]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchBook(bookNr, retries = 3) {
  const url = `${API_BASE}/${bookNr}.json`
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
  const dir = join(ROOT, 'src', 'assets', 'bibles')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const db = new Database(DB_PATH)

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

  db.prepare(`INSERT OR REPLACE INTO versions (id, name, language) VALUES (?, ?, ?)`)
    .run('LSG1910', 'Louis Segond 1910', 'fr')

  const insertBook = db.prepare(
    `INSERT OR REPLACE INTO books (version_id, book_id, name, testament, chapter_count) VALUES (?, ?, ?, ?, ?)`
  )
  const insertVerse = db.prepare(
    `INSERT OR REPLACE INTO verses (version_id, book_id, chapter, verse, text) VALUES (?, ?, ?, ?, ?)`
  )

  let totalVerses = 0

  for (const book of BOOKS) {
    process.stdout.write(`\n[${book.nr}/66] ${book.name}... `)
    try {
      const data = await fetchBook(book.nr)
      const chapters = data.chapters ?? []

      insertBook.run('LSG1910', book.id, book.name, book.testament, chapters.length)

      const insertMany = db.transaction((verses) => {
        for (const v of verses) insertVerse.run(...v)
      })

      const allVerses = []
      for (const ch of chapters) {
        for (const v of (ch.verses ?? [])) {
          allVerses.push(['LSG1910', book.id, ch.chapter, v.verse, v.text.trim()])
        }
      }

      insertMany(allVerses)
      totalVerses += allVerses.length
      process.stdout.write(`${chapters.length} chapitres, ${allVerses.length} versets ✓`)
    } catch (e) {
      process.stdout.write(`ERREUR: ${e.message}`)
    }

    await sleep(100) // Respecter le serveur
  }

  db.close()
  console.log(`\n\nBible LSG 1910 générée : ${totalVerses} versets`)
  console.log(`Fichier : ${DB_PATH}`)
}

main().catch(console.error)
