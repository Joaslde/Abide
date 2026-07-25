/**
 * Client BibleBrain / FCBH API (4.dbt.io)
 * Audio Bible exclusivement — jamais de TTS pour les textes sacrés.
 *
 * Mode RÉEL (clé reçue le 2026-06-26). La clé vit dans .env.local
 * (VITE_BIBLEBRAIN_KEY) — jamais en dur.
 *
 * Restrictions BibleBrain (email officiel) :
 *  - Audio = streaming libre ; téléchargement UNIQUEMENT via l'endpoint /download.
 *  - Jamais derrière un paywall.
 *  - Le copyright doit rester visible dans le lecteur.
 *
 * Filesets vérifiés (sondage API du 2026-06-26) :
 *  - LSG 1910 (Bible FRNTLS) : NT FRNTLSN2DA (timestamps OK) / OT FRNTLSO2DA (timestamps ABSENTS)
 *  - KJV       (Bible ENGKJV) : NT ENGKJVN2DA (timestamps OK) / OT ENGKJVO1DA (timestamps OK)
 */

import { Capacitor, CapacitorHttp } from '@capacitor/core'

const BASE_URL = 'https://4.dbt.io/api'

// Ordre canonique : les 27 derniers livres = Nouveau Testament.
const NT_BOOKS = new Set([
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP',
  'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE',
  '1JN', '2JN', '3JN', 'JUD', 'REV'
])

/**
 * Correspondance version TEXTE (id de notre app) → audio BibleBrain.
 * Étendre cette table quand de nouveaux audios sont disponibles.
 */
export const AUDIO_MAP = {
  LSG1910: {
    bibleId: 'FRNTLS',
    copyright: '© Tresorsonore — Faith Comes By Hearing',
    nt: 'FRNTLSN2DA',
    ot: 'FRNTLSO2DA',
    otTimestamps: false // l'AT LSG n'a pas de timestamps (sondé)
  },
  KJV: {
    bibleId: 'ENGKJV',
    copyright: '© Faith Comes By Hearing',
    nt: 'ENGKJVN2DA',
    ot: 'ENGKJVO1DA',
    otTimestamps: true
  },
  WEB: {
    bibleId: 'ENGWWH',
    copyright: '© World English Bible (domaine public) — Faith Comes By Hearing',
    nt: 'EN1WEBN2DA',
    ot: 'EN1WEBO2DA',
    otTimestamps: false // l'AT WEB n'a pas de timestamps (sondé)
  }
}

function getKey() {
  const key = import.meta.env.VITE_BIBLEBRAIN_KEY
  if (!key) throw new Error('VITE_BIBLEBRAIN_KEY manquante — clé BibleBrain absente du .env.local')
  return key
}

/**
 * GET JSON. Sur natif on passe par CapacitorHttp (évite les restrictions CORS
 * de la WebView) ; sur web on utilise fetch classique.
 */
async function getJson(url) {
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.get({ url })
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`BibleBrain HTTP ${res.status}`)
    }
    return typeof res.data === 'string' ? JSON.parse(res.data) : res.data
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BibleBrain HTTP ${res.status}`)
  return res.json()
}

/* ─────────────────────────── API PUBLIQUE ─────────────────────────── */

/** Y a-t-il un audio disponible pour cette version ? */
export function audioForVersion(versionId) {
  return AUDIO_MAP[versionId] ?? null
}

/**
 * Choisit le bon fileset (NT ou OT) pour un livre donné d'une version.
 * @returns {{ filesetId: string, copyright: string, hasTimestamps: boolean } | null}
 */
export function filesetForBook(versionId, bookId) {
  const map = AUDIO_MAP[versionId]
  if (!map) return null
  const isNT = NT_BOOKS.has(bookId)
  const filesetId = isNT ? map.nt : map.ot
  if (!filesetId) return null
  // Le NT a toujours des timestamps ; l'AT dépend de la version (flag otTimestamps).
  const hasTimestamps = isNT ? true : map.otTimestamps !== false
  return { filesetId, copyright: map.copyright, hasTimestamps }
}

/**
 * Lister les versions audio disponibles dans une langue (diagnostic / future UI).
 * @param {string} langCode - ex: 'fra', 'eng'
 */
export async function getAudioVersions(langCode = 'fra') {
  const url = `${BASE_URL}/bibles/?v=4&language_code=${langCode}&key=${getKey()}`
  const data = await getJson(url)
  return data.data ?? []
}

/**
 * URL MP3 (streaming) d'un chapitre. ⚠️ URL signée (token expirant) :
 * à (ré)obtenir à chaque lecture, ne pas mettre en cache pour le streaming.
 * @returns {Promise<string|null>}
 */
export async function getAudioUrl(filesetId, bookId, chapter) {
  const url = `${BASE_URL}/bibles/filesets/${filesetId}/${bookId}/${chapter}?v=4&key=${getKey()}`
  const data = await getJson(url)
  return data.data?.[0]?.path ?? null
}

/**
 * URL MP3 pour TÉLÉCHARGEMENT offline — via l'endpoint /download, le SEUL
 * autorisé par BibleBrain pour stocker l'audio localement (email officiel).
 * L'URL retournée est signée/expirante : à consommer immédiatement
 * (Filesystem.downloadFile), jamais à persister.
 * @returns {Promise<string|null>}
 */
export async function getDownloadUrl(filesetId, bookId, chapter) {
  const url = `${BASE_URL}/download/${filesetId}/${bookId}/${chapter}?v=4&key=${getKey()}`
  const data = await getJson(url)
  return data.data?.[0]?.path ?? null
}

/**
 * Timestamps par verset (synchronisation texte/audio).
 * Retourne [] si l'API n'en fournit pas (ex : AT LSG) — l'appelant gère l'absence.
 * `end` est laissé à 0 ici ; il est calculé par le player (start du verset suivant
 * / durée totale pour le dernier).
 * @returns {Promise<Array<{verse:number, start:number, end:number}>>}
 */
export async function getTimestamps(filesetId, bookId, chapter) {
  try {
    const url = `${BASE_URL}/timestamps/${filesetId}/${bookId}/${chapter}?v=4&key=${getKey()}`
    const data = await getJson(url)
    const rows = data.data ?? []
    const out = rows
      .map((t) => ({
        verse: Number(t.verse_start),
        start: parseFloat(t.timestamp),
        end: 0
      }))
      // Certaines versions (ex : KJV) commencent par un "verset 0" (titre/intro) :
      // on l'écarte pour que le 1er vrai verset soit la référence de départ.
      .filter((t) => Number.isFinite(t.verse) && t.verse >= 1 && Number.isFinite(t.start))
    return out
  } catch {
    // Pas de timestamps pour ce chapitre → lecture sans surbrillance.
    return []
  }
}

/** Indique que l'audio réel est branché (utilisé par d'éventuels écrans de diagnostic). */
export const isMockMode = () => false
