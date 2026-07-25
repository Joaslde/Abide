/**
 * Interface SQLite pour la Bible locale (lecture seule, 100 % offline).
 *
 * Multi-versions : la LSG 1910 est BUNDLÉE (embarquée dans l'app), les autres
 * versions (KJV…) sont TÉLÉCHARGÉES depuis Cloudflare R2 et stockées dans le
 * device. Chaque version est un fichier .db autonome (mêmes tables
 * versions/books/verses).
 *
 * On garde UNE SEULE base ouverte à la fois (« base active ») : changer de
 * version ferme l'ancienne connexion et ouvre la nouvelle. Plus léger en
 * mémoire (un seul .db chargé) et conforme à l'usage (on lit une version à la
 * fois). switchVersion(id) bascule, les vues relisent ensuite normalement.
 *
 * Deux moteurs derrière la même API :
 *   - WEB / DEV  → sql.js (WASM), .db chargé en mémoire depuis une URL.
 *   - NATIF      → @capacitor-community/sqlite. Le .db bundlé arrive par
 *                  copyFromAssets ; les .db téléchargés par getFromHTTPRequest.
 *
 * L'API (getVersions/getBooks/getChapterCount/getVerses/getBookName) prend
 * toujours un versionId, mais ce versionId DOIT être celui de la base active.
 */

import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()

// Version bundlée (toujours disponible, embarquée dans l'app).
export const BUNDLED_VERSION = 'LSG1910'

// Map versionId → nom logique du fichier .db (sans suffixe SQLite, côté natif).
// Le bundlé a un nom fixe ; les téléchargés suivent <id_minuscule>.
const DB_NAME_BY_VERSION = {
  LSG1910: 'lsg1910'
}

// URL web (dev) du .db bundlé pour sql.js.
const WEB_BUNDLED_URL = '/db/lsg1910.db'
const WEB_WASM_URL = '/sql-wasm.wasm'

/* ───────────────────────── ÉTAT INTERNE ───────────────────────── */

let activeVersion = BUNDLED_VERSION
let webDb = null // instance sql.js de la base active (web)
let nativeConn = null // connexion @capacitor-community/sqlite de la base active
let sqlitePlugin = null // instance SQLiteConnection (natif), créée une fois
let SQLjs = null // factory sql.js (web), chargée une fois
let initPromise = null // init de la base active en cours

// URLs web des versions téléchargées (web/dev : on garde l'ArrayBuffer en mémoire).
const webDownloaded = new Map() // versionId → Uint8Array

/* ───────────────────────── INITIALISATION ───────────────────────── */

/** Nom logique du fichier .db pour une version (natif). */
function dbNameFor(versionId) {
  return DB_NAME_BY_VERSION[versionId] || versionId.toLowerCase()
}

/**
 * Prépare/ouvre la base de la version ACTIVE. Idempotent.
 * À appeler au démarrage (App.vue) et en garde dans chaque getter.
 */
export async function initBible() {
  if (initPromise) return initPromise
  initPromise = isNative ? openNative(activeVersion) : openWeb(activeVersion)
  return initPromise
}

/* ---- WEB (sql.js) ---- */

async function ensureSqlJs() {
  if (SQLjs) return SQLjs
  const initSqlJs = (await import('sql.js/dist/sql-wasm.js')).default
  SQLjs = await initSqlJs({ locateFile: () => WEB_WASM_URL })
  return SQLjs
}

async function openWeb(versionId) {
  const SQL = await ensureSqlJs()
  let bytes
  if (versionId === BUNDLED_VERSION) {
    const res = await fetch(WEB_BUNDLED_URL)
    if (!res.ok) throw new Error(`Bible introuvable (${WEB_BUNDLED_URL}) : HTTP ${res.status}`)
    bytes = new Uint8Array(await res.arrayBuffer())
  } else {
    bytes = webDownloaded.get(versionId)
    if (!bytes) throw new Error(`Version ${versionId} non téléchargée (web).`)
  }
  webDb = new SQL.Database(bytes)
}

/* ---- NATIF (@capacitor-community/sqlite) ---- */

async function ensurePlugin() {
  if (sqlitePlugin) return sqlitePlugin
  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite')
  sqlitePlugin = new SQLiteConnection(CapacitorSQLite)
  return sqlitePlugin
}

async function openNative(versionId) {
  const sqlite = await ensurePlugin()

  // Le bundlé doit d'abord être copié des assets vers le storage (idempotent).
  if (versionId === BUNDLED_VERSION) {
    await sqlite.copyFromAssets(false)
  }

  const dbName = dbNameFor(versionId)
  const READONLY = true
  const isConn = (await sqlite.isConnection(dbName, READONLY)).result
  nativeConn = isConn
    ? await sqlite.retrieveConnection(dbName, READONLY)
    : await sqlite.createConnection(dbName, false, 'no-encryption', 1, READONLY)

  await nativeConn.open()
}

/**
 * Bascule la base active vers une autre version DÉJÀ installée.
 * Ferme proprement la base précédente puis ouvre la nouvelle.
 * @param {string} versionId
 */
export async function switchVersion(versionId) {
  if (versionId === activeVersion && initPromise) {
    await initPromise
    return
  }
  // Ferme la base courante.
  try {
    if (isNative && nativeConn) {
      await nativeConn.close()
      const sqlite = await ensurePlugin()
      await sqlite.closeConnection(dbNameFor(activeVersion), true)
    } else if (webDb) {
      webDb.close()
    }
  } catch (e) {
    console.warn('Fermeture base précédente :', e?.message)
  }
  webDb = null
  nativeConn = null
  activeVersion = versionId
  initPromise = isNative ? openNative(versionId) : openWeb(versionId)
  await initPromise
}

/** Version actuellement ouverte. */
export function getActiveVersion() {
  return activeVersion
}

/* ───────────────────────── TÉLÉCHARGEMENT ───────────────────────── */

/**
 * Télécharge le .db d'une version depuis une URL (R2) et l'installe dans le
 * device, prêt à être ouvert. Offline permanent ensuite.
 *
 * @param {string} versionId  ex : 'KJV'
 * @param {string} url        URL publique du .db (manifeste R2)
 */
export async function downloadVersion(versionId, url) {
  if (isNative) {
    const sqlite = await ensurePlugin()
    // getFromHTTPRequest télécharge le .db directement dans le dossier des
    // bases du plugin (nom = celui encodé dans l'URL). On s'assure que le
    // fichier distant est nommé "<dbName>SQLite.db" pour être reconnu.
    await sqlite.getFromHTTPRequest(url, true)
  } else {
    // Web/dev : on garde les octets en mémoire (pas de FS persistant simple).
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Téléchargement échoué : HTTP ${res.status}`)
    webDownloaded.set(versionId, new Uint8Array(await res.arrayBuffer()))
  }
}

/**
 * Une version est-elle installée localement (lisible offline) ?
 * @param {string} versionId
 * @returns {Promise<boolean>}
 */
export async function isVersionInstalled(versionId) {
  if (versionId === BUNDLED_VERSION) return true
  if (isNative) {
    const sqlite = await ensurePlugin()
    const dbName = dbNameFor(versionId)
    try {
      // isDatabase attend le nom LOGIQUE (sans suffixe) : il rajoute lui-même
      // "SQLite.db". Lui passer "kjvSQLite.db" le ferait chercher
      // "kjvSQLiteSQLite.db" → introuvable → version crue désinstallée à tort.
      return (await sqlite.isDatabase(dbName)).result === true
    } catch {
      return false
    }
  }
  return webDownloaded.has(versionId)
}

/* ───────────────────────── REQUÊTE INTERNE ───────────────────────── */

async function query(sql, params = []) {
  await initBible()
  if (isNative) {
    const result = await nativeConn.query(sql, params)
    return result.values ?? []
  }
  const stmt = webDb.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

/**
 * Préchauffe la base active : force l'init + une requête légère pour chauffer
 * le cache de pages SQLite avant la 1re lecture (sinon « Ouverture de la
 * Bible… » trop long sur appareil bas de gamme). Non bloquant.
 */
export async function warmUpBible() {
  try {
    await initBible()
    await query('SELECT verse FROM verses WHERE book_id = ? AND chapter = 1 LIMIT 1', ['GEN'])
  } catch (e) {
    console.error('Préchauffage Bible échoué :', e)
  }
}

/* ───────────────────────── API PUBLIQUE ───────────────────────── */

/**
 * Versions présentes DANS la base active (toujours 1 ligne : la version active).
 * Pour le catalogue complet (installées + téléchargeables), voir le store
 * bibleVersions qui lit le manifeste R2.
 */
export async function getVersions() {
  return query('SELECT * FROM versions ORDER BY name')
}

export async function getBooks(versionId) {
  return query(
    'SELECT book_id, name, testament, chapter_count FROM books WHERE version_id = ? ORDER BY rowid',
    [versionId]
  )
}

export async function getChapterCount(versionId, bookId) {
  const rows = await query(
    'SELECT chapter_count FROM books WHERE version_id = ? AND book_id = ?',
    [versionId, bookId]
  )
  return rows[0]?.chapter_count ?? 0
}

export async function getBookName(versionId, bookId) {
  const rows = await query(
    'SELECT name FROM books WHERE version_id = ? AND book_id = ?',
    [versionId, bookId]
  )
  return rows[0]?.name ?? null
}

export async function getVerses(versionId, bookId, chapter) {
  return query(
    'SELECT verse, text FROM verses WHERE version_id = ? AND book_id = ? AND chapter = ? ORDER BY verse',
    [versionId, bookId, chapter]
  )
}
