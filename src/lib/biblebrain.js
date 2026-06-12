/**
 * Client BibleBrain / FCBH API (4.dbt.io)
 * Audio Bible exclusivement — pas de TTS pour les textes sacrés.
 *
 * IDs de fileset connus (à compléter après avoir la clé API) :
 * - FRASGN2DA : LSG 1910 Dramatisé (à vérifier)
 * - FRALSG2DA : LSG 1910 Audio (à vérifier)
 */

const BASE_URL = 'https://4.dbt.io/api'

function getKey() {
  const key = import.meta.env.VITE_BIBLEBRAIN_KEY
  if (!key) throw new Error('VITE_BIBLEBRAIN_KEY manquante — créer un compte sur biblebrain.com')
  return key
}

/**
 * Lister les versions audio disponibles dans une langue.
 * @param {string} langCode - ex: 'fra' pour français
 * @returns {Promise<Array>}
 */
export async function getAudioVersions(langCode = 'fra') {
  const key = getKey()
  const res = await fetch(
    `${BASE_URL}/bibles?language_code=${langCode}&media=audio_drama,audio&key=${key}&v=4`
  )
  if (!res.ok) throw new Error(`BibleBrain error ${res.status}`)
  const data = await res.json()
  return data.data ?? []
}

/**
 * Obtenir l'URL d'un fichier audio pour un livre/chapitre.
 * @param {string} filesetId
 * @param {string} bookId - ex: 'MAT'
 * @param {number} chapter
 * @returns {Promise<string>} URL du fichier MP3
 */
export async function getAudioUrl(filesetId, bookId, chapter) {
  const key = getKey()
  const res = await fetch(
    `${BASE_URL}/bibles/filesets/${filesetId}/${bookId}/${chapter}?key=${key}&v=4`
  )
  if (!res.ok) throw new Error(`BibleBrain error ${res.status}`)
  const data = await res.json()
  // L'API retourne un tableau — prendre la première entrée
  return data.data?.[0]?.path ?? null
}

/**
 * Obtenir les timestamps par verset pour synchronisation texte/audio.
 * @param {string} filesetId
 * @param {string} bookId
 * @param {number} chapter
 * @returns {Promise<Array<{verse: number, start: number, end: number}>>}
 */
export async function getTimestamps(filesetId, bookId, chapter) {
  const key = getKey()
  const res = await fetch(
    `${BASE_URL}/timestamps/${filesetId}/${bookId}/${chapter}?key=${key}&v=4`
  )
  if (!res.ok) throw new Error(`BibleBrain error ${res.status}`)
  const data = await res.json()
  return (data.data ?? []).map(t => ({
    verse: t.verse_start,
    start: parseFloat(t.timestamp),
    end: 0 // calculé en post-process par le player
  }))
}
