import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { Capacitor, CapacitorHttp } from '@capacitor/core'
import {
  BUNDLED_VERSION,
  downloadVersion,
  isVersionInstalled,
  switchVersion
} from '@/lib/bible-db'

/**
 * Catalogue des versions de la Bible (bundlée + téléchargeables).
 *
 * - La LSG 1910 est BUNDLÉE : toujours installée, jamais supprimable.
 * - Les autres viennent d'un MANIFESTE public sur R2 (VITE_BIBLE_MANIFEST_URL).
 *   Chaque entrée : { id, name, language, url, size }.
 * - On mémorise localement quelles versions sont installées (offline permanent)
 *   via @capacitor/preferences.
 *
 * Aucune clé secrète ici : on ne lit qu'une URL publique (manifeste) et on
 * télécharge des .db publics. L'upload vers R2 se fait hors app (scripts).
 */

// Métadonnées complètes des versions installées (id, name, language, size) —
// PAS juste les ids : il faut pouvoir afficher une version installée HORS LIGNE,
// même quand le manifeste distant n'est pas chargé.
const INSTALLED_KEY = 'abide.bible.installed.v2'
const MANIFEST_URL = import.meta.env.VITE_BIBLE_MANIFEST_URL || ''

// Version bundlée, toujours présente dans le catalogue.
const BUNDLED_ENTRY = {
  id: BUNDLED_VERSION,
  name: 'Louis Segond 1910',
  language: 'fr',
  size: 0
}

export const useBibleVersionsStore = defineStore('bibleVersions', () => {
  const remote = ref([]) // versions du manifeste (téléchargeables)
  // Versions installées localement, AVEC métadonnées (toujours le bundlé en 1er).
  const installedVersions = ref([{ ...BUNDLED_ENTRY }])
  const loadingManifest = ref(false)
  const manifestError = ref(null)
  // versionId → progression (0..1) pendant un téléchargement, sinon absent.
  const downloading = ref({})

  /** Liste des ids installés (commodité). */
  const installedIds = computed(() => installedVersions.value.map((v) => v.id))

  /**
   * Catalogue fusionné. Les versions INSTALLÉES viennent du stockage local
   * (donc visibles HORS LIGNE), les versions seulement téléchargeables viennent
   * du manifeste. Une version installée reste affichée même si le manifeste
   * n'est pas chargé (offline).
   */
  const catalog = computed(() => {
    const byId = new Map()
    // 1) Toutes les versions installées (offline-safe, métadonnées locales).
    for (const v of installedVersions.value) {
      byId.set(v.id, {
        ...v,
        bundled: v.id === BUNDLED_VERSION,
        installed: true
      })
    }
    // 2) Versions du manifeste pas encore installées (téléchargeables).
    for (const v of remote.value) {
      if (!byId.has(v.id)) {
        byId.set(v.id, { ...v, bundled: false, installed: false })
      }
    }
    return [...byId.values()]
  })

  const installed = computed(() => installedVersions.value.map((v) => ({
    ...v,
    bundled: v.id === BUNDLED_VERSION,
    installed: true
  })))

  function isDownloading(id) {
    return id in downloading.value
  }
  function progressOf(id) {
    return downloading.value[id] ?? 0
  }

  /**
   * Charge les versions installées depuis le storage (métadonnées complètes),
   * en VÉRIFIANT que le .db existe toujours réellement sur le device. Le bundlé
   * est toujours présent. Fonctionne hors ligne (aucun appel réseau).
   */
  async function loadInstalled() {
    try {
      const { value } = await Preferences.get({ key: INSTALLED_KEY })
      const saved = value ? JSON.parse(value) : []
      const verified = [{ ...BUNDLED_ENTRY }]
      for (const entry of saved) {
        if (!entry || entry.id === BUNDLED_VERSION) continue
        // On garde la version seulement si son fichier .db est bien présent.
        if (await isVersionInstalled(entry.id)) verified.push(entry)
      }
      installedVersions.value = verified
      await persistInstalled() // resynchronise le storage (purge les .db disparus)
    } catch {
      installedVersions.value = [{ ...BUNDLED_ENTRY }]
    }
  }

  async function persistInstalled() {
    // On ne persiste pas le bundlé (toujours réinjecté au chargement).
    const toSave = installedVersions.value.filter((v) => v.id !== BUNDLED_VERSION)
    await Preferences.set({ key: INSTALLED_KEY, value: JSON.stringify(toSave) })
  }

  /**
   * Récupère le manifeste des versions téléchargeables depuis R2.
   * Sur NATIF on passe par CapacitorHttp (requête native) : elle n'est PAS
   * soumise au CORS de la WebView, contrairement à fetch(). Sur web, fetch().
   */
  async function fetchManifest() {
    if (!MANIFEST_URL) {
      manifestError.value = 'no-manifest-url'
      console.warn('[bibleVersions] VITE_BIBLE_MANIFEST_URL est vide.')
      return
    }
    loadingManifest.value = true
    manifestError.value = null
    try {
      let data
      if (Capacitor.isNativePlatform()) {
        const res = await CapacitorHttp.get({ url: MANIFEST_URL, headers: { Accept: 'application/json' } })
        if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`)
        // CapacitorHttp parse parfois le JSON, parfois renvoie une string.
        data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
      } else {
        const res = await fetch(MANIFEST_URL, { cache: 'no-cache' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        data = await res.json()
      }
      remote.value = Array.isArray(data?.versions) ? data.versions : []
      console.log(`[bibleVersions] Manifeste OK : ${remote.value.length} version(s) distante(s).`)
    } catch (e) {
      manifestError.value = e.message
      remote.value = []
      console.error('[bibleVersions] Échec fetch manifeste :', MANIFEST_URL, e.message)
    } finally {
      loadingManifest.value = false
    }
  }

  /**
   * Télécharge puis installe une version (offline permanent ensuite).
   * @param {string} id
   */
  async function download(id) {
    const entry = remote.value.find((v) => v.id === id)
    if (!entry || installedIds.value.includes(id)) return
    downloading.value = { ...downloading.value, [id]: 0 }
    try {
      // getFromHTTPRequest ne donne pas de progression fine → on simule un
      // état "en cours" puis "terminé" (le plugin télécharge en un bloc).
      await downloadVersion(id, entry.url)
      // On mémorise les MÉTADONNÉES (pas juste l'id) pour pouvoir afficher la
      // version hors ligne, sans le manifeste.
      installedVersions.value = [
        ...installedVersions.value,
        { id: entry.id, name: entry.name, language: entry.language, size: entry.size ?? 0 }
      ]
      await persistInstalled()
    } catch (e) {
      manifestError.value = e.message
      throw e
    } finally {
      const next = { ...downloading.value }
      delete next[id]
      downloading.value = next
    }
  }

  /**
   * Bascule la version active (doit être installée). Garde livre+chapitre
   * courants côté store bible (les ID de livres sont canoniques).
   * @param {string} id
   */
  async function activate(id) {
    if (!installedIds.value.includes(id)) throw new Error(`Version ${id} non installée`)
    await switchVersion(id)
  }

  return {
    remote,
    installedVersions,
    installedIds,
    loadingManifest,
    manifestError,
    downloading,
    catalog,
    installed,
    isDownloading,
    progressOf,
    loadInstalled,
    fetchManifest,
    download,
    activate
  }
})
