/**
 * Interface SQLite pour la Bible locale.
 * Utilise @capacitor-community/sqlite pour lire lsg1910.db bundlée.
 * Toutes les opérations sont en lecture seule (la DB est en assets/).
 */

let db = null

async function openDatabase() {
  if (db) return db

  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite')
  const sqlite = new SQLiteConnection(CapacitorSQLite)

  // En développement web, on utilise jeep-sqlite (fallback)
  const platform = (await import('@capacitor/core')).Capacitor.getPlatform()

  if (platform === 'web') {
    await sqlite.initWebStore()
  }

  db = await sqlite.createConnection('lsg1910', false, 'no-encryption', 1, false)
  await db.open()
  return db
}

/**
 * @returns {Promise<Array<{id: string, name: string, is_bundled: boolean}>>}
 */
export async function getVersions() {
  const conn = await openDatabase()
  const result = await conn.query('SELECT * FROM versions ORDER BY name')
  return result.values ?? []
}

/**
 * @param {string} versionId
 * @returns {Promise<Array<{book_id: string, name: string, testament: string, chapter_count: number}>>}
 */
export async function getBooks(versionId) {
  const conn = await openDatabase()
  const result = await conn.query(
    'SELECT * FROM books WHERE version_id = ? ORDER BY rowid',
    [versionId]
  )
  return result.values ?? []
}

/**
 * @param {string} versionId
 * @param {string} bookId
 * @returns {Promise<number>}
 */
export async function getChapterCount(versionId, bookId) {
  const conn = await openDatabase()
  const result = await conn.query(
    'SELECT chapter_count FROM books WHERE version_id = ? AND book_id = ?',
    [versionId, bookId]
  )
  return result.values?.[0]?.chapter_count ?? 0
}

/**
 * @param {string} versionId
 * @param {string} bookId
 * @param {number} chapter
 * @returns {Promise<Array<{verse: number, text: string}>>}
 */
export async function getVerses(versionId, bookId, chapter) {
  const conn = await openDatabase()
  const result = await conn.query(
    'SELECT verse, text FROM verses WHERE version_id = ? AND book_id = ? AND chapter = ? ORDER BY verse',
    [versionId, bookId, chapter]
  )
  return result.values ?? []
}
