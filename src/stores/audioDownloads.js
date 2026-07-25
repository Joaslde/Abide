import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Capacitor, CapacitorHttp } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Preferences } from '@capacitor/preferences'
import { getDownloadUrl, getTimestamps, filesetForBook } from '@/lib/biblebrain'
import { getChapterCount } from '@/lib/bible-db'

/**
 * Téléchargements audio Bible (offline, livre par livre).
 *
 * - Fichiers : Directory.Data → audio/{versionId}/{bookId}/{chapter}.mp3
 *   + audio/{versionId}/{bookId}/timestamps.json ({ "1": [{verse,start,end}], … })
 * - Métadonnées persistées dans Preferences (offline-safe, comme les versions
 *   texte — voir lessons 2026-06-26 : métadonnées COMPLÈTES, pas juste des ids).
 * - Les URLs BibleBrain /download sont signées/expirantes → on télécharge le
 *   FICHIER immédiatement, on ne stocke jamais l'URL.
 * - Reprise idempotente : un chapitre déjà présent sur disque n'est pas retéléchargé.
 */

const STORAGE_KEY = 'abide.audio.downloads.v1'

export function bookKeyOf(versionId, bookId) {
  return `${versionId}:${bookId}`
}

export function audioDir(versionId, bookId) {
  return `audio/${versionId}/${bookId}`
}

export function chapterPath(versionId, bookId, chapter) {
  return `${audioDir(versionId, bookId)}/${chapter}.mp3`
}

export function timestampsPath(versionId, bookId) {
  return `${audioDir(versionId, bookId)}/timestamps.json`
}

export const useAudioDownloadsStore = defineStore('audioDownloads', () => {
  /** Livres téléchargés : [{versionId, bookId, bookName, chapters, sizeBytes, downloadedAt}] */
  const downloads = ref([])
  const loaded = ref(false)

  /** Téléchargement en cours : { key, done, total, percent } ou null. */
  const progress = ref(null)

  /** Estimations de taille (Mo) par bookKey — cache mémoire pour le cercle ⬇. */
  const sizeEstimates = ref({})

  const totalSizeBytes = computed(() =>
    downloads.value.reduce((sum, d) => sum + (d.sizeBytes || 0), 0)
  )

  function isDownloaded(versionId, bookId) {
    return downloads.value.some((d) => d.versionId === versionId && d.bookId === bookId)
  }

  function entryFor(versionId, bookId) {
    return downloads.value.find((d) => d.versionId === versionId && d.bookId === bookId) ?? null
  }

  function isDownloading(versionId, bookId) {
    return progress.value?.key === bookKeyOf(versionId, bookId)
  }

  async function load() {
    if (loaded.value) return
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY })
      if (value) downloads.value = JSON.parse(value)
    } catch { /* première utilisation */ }
    loaded.value = true
  }

  async function persist() {
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(downloads.value) })
  }

  /** Un fichier existe-t-il déjà ? (reprise idempotente) */
  async function fileExists(path) {
    try {
      await Filesystem.stat({ path, directory: Directory.Data })
      return true
    } catch {
      return false
    }
  }

  /**
   * Estimation de la taille du livre AVANT téléchargement : HEAD sur l'URL du
   * 1er chapitre × nb chapitres. Cache mémoire. Renvoie des octets ou null.
   */
  async function estimateBookSize(versionId, bookId) {
    const key = bookKeyOf(versionId, bookId)
    if (sizeEstimates.value[key] != null) return sizeEstimates.value[key]
    try {
      const fs = filesetForBook(versionId, bookId)
      if (!fs) return null
      const total = await getChapterCount(versionId, bookId)
      const url = await getDownloadUrl(fs.filesetId, bookId, 1)
      if (!url || !total) return null
      let bytes = null
      if (Capacitor.isNativePlatform()) {
        const res = await CapacitorHttp.request({ url, method: 'HEAD' })
        bytes = Number(res.headers?.['Content-Length'] ?? res.headers?.['content-length'])
      } else {
        const res = await fetch(url, { method: 'HEAD' }).catch(() => null)
        bytes = res ? Number(res.headers.get('content-length')) : null
      }
      if (!Number.isFinite(bytes) || bytes <= 0) return null
      const estimate = bytes * total
      sizeEstimates.value = { ...sizeEstimates.value, [key]: estimate }
      return estimate
    } catch {
      return null
    }
  }

  /**
   * Télécharge un livre complet (tous chapitres, séquentiel) + timestamps.
   * Progression exposée via `progress` (réactif). Idempotent : reprend là où
   * un téléchargement interrompu s'était arrêté.
   * @returns {Promise<boolean>} succès complet
   */
  async function downloadBook(versionId, bookId, bookName) {
    if (!Capacitor.isNativePlatform()) return false // natif uniquement (CORS CloudFront sur web)
    const key = bookKeyOf(versionId, bookId)
    if (progress.value) return false // un seul téléchargement à la fois
    const fs = filesetForBook(versionId, bookId)
    if (!fs) return false

    const total = await getChapterCount(versionId, bookId)
    if (!total) return false

    progress.value = { key, done: 0, total, percent: 0 }

    // Le dossier du livre doit exister AVANT downloadFile (qui ne crée pas les
    // dossiers parents — DownloadFileOptions n'a pas d'option recursive).
    try {
      await Filesystem.mkdir({ path: audioDir(versionId, bookId), directory: Directory.Data, recursive: true })
    } catch { /* existe déjà */ }

    // Timestamps existants (reprise) ou objet neuf.
    let allTimestamps = {}
    try {
      const existing = await Filesystem.readFile({
        path: timestampsPath(versionId, bookId),
        directory: Directory.Data,
        encoding: Encoding.UTF8
      })
      allTimestamps = JSON.parse(existing.data)
    } catch { /* pas encore de fichier */ }

    // Anneau de progression FLUIDE (par octet) : le listener met à jour le %
    // pendant le téléchargement de CHAQUE chapitre (sinon 0% figé sur le ch.1).
    let currentCh = 1
    const progListener = await Filesystem.addListener('progress', (status) => {
      const frac = status.contentLength ? Math.min(1, status.bytes / status.contentLength) : 0
      const overall = ((currentCh - 1) + frac) / total
      progress.value = { key, done: currentCh - 1, total, percent: Math.round(overall * 100) }
    })

    try {
      for (let ch = 1; ch <= total; ch++) {
        currentCh = ch
        const path = chapterPath(versionId, bookId, ch)

        if (!(await fileExists(path))) {
          const url = await getDownloadUrl(fs.filesetId, bookId, ch)
          if (!url) throw new Error(`URL indisponible ch.${ch}`)
          await Filesystem.downloadFile({
            url,
            path,
            directory: Directory.Data,
            progress: true
          })
        }

        if (fs.hasTimestamps && !allTimestamps[ch]) {
          const ts = await getTimestamps(fs.filesetId, bookId, ch)
          if (ts.length) allTimestamps[ch] = ts
        }

        progress.value = { key, done: ch, total, percent: Math.round((ch / total) * 100) }
      }
      await progListener.remove()

      // Timestamps du livre en un seul JSON.
      await Filesystem.writeFile({
        path: timestampsPath(versionId, bookId),
        directory: Directory.Data,
        data: JSON.stringify(allTimestamps),
        encoding: Encoding.UTF8,
        recursive: true
      })

      // Taille réelle totale.
      let sizeBytes = 0
      for (let ch = 1; ch <= total; ch++) {
        try {
          const st = await Filesystem.stat({
            path: chapterPath(versionId, bookId, ch),
            directory: Directory.Data
          })
          sizeBytes += st.size || 0
        } catch { /* ignorer */ }
      }

      downloads.value = [
        ...downloads.value.filter((d) => !(d.versionId === versionId && d.bookId === bookId)),
        { versionId, bookId, bookName, chapters: total, sizeBytes, downloadedAt: new Date().toISOString() }
      ]
      await persist()
      return true
    } catch {
      // Échec (réseau…) : on garde les chapitres déjà téléchargés (reprise future).
      return false
    } finally {
      try { await progListener.remove() } catch { /* déjà retiré */ }
      progress.value = null
    }
  }

  /** Supprime un livre téléchargé (fichiers + entrée). */
  async function deleteBook(versionId, bookId) {
    try {
      await Filesystem.rmdir({
        path: audioDir(versionId, bookId),
        directory: Directory.Data,
        recursive: true
      })
    } catch { /* dossier absent = déjà propre */ }
    downloads.value = downloads.value.filter(
      (d) => !(d.versionId === versionId && d.bookId === bookId)
    )
    await persist()
  }

  /**
   * Source locale pour un chapitre téléchargé : { src, timestamps } ou null.
   * `src` est une URL lisible par <audio> (convertFileSrc).
   */
  async function localChapterSource(versionId, bookId, chapter) {
    if (!isDownloaded(versionId, bookId)) return null
    try {
      const { uri } = await Filesystem.getUri({
        path: chapterPath(versionId, bookId, chapter),
        directory: Directory.Data
      })
      const src = Capacitor.convertFileSrc(uri)
      let timestamps = []
      try {
        const tsFile = await Filesystem.readFile({
          path: timestampsPath(versionId, bookId),
          directory: Directory.Data,
          encoding: Encoding.UTF8
        })
        timestamps = JSON.parse(tsFile.data)?.[chapter] ?? []
      } catch { /* pas de timestamps pour ce livre */ }
      return { src, timestamps }
    } catch {
      return null
    }
  }

  return {
    downloads,
    progress,
    totalSizeBytes,
    isDownloaded,
    entryFor,
    isDownloading,
    load,
    estimateBookSize,
    downloadBook,
    deleteBook,
    localChapterSource
  }
})
