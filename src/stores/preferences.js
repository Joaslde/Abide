import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { setLocale, detectDeviceLocale } from '@/i18n'

/**
 * Store des préférences globales de l'application.
 *
 * - locale      : 'fr' | 'en'              (par défaut : langue du téléphone)
 * - theme       : 'system' | 'dark' | 'light'  (par défaut : système)
 * - bibleFont   : null | nom de police     (null = utilise la police de l'app)
 * - bibleFontSize : 16..24                 (taille du texte biblique)
 * - firstLaunchDone : bool                 (l'écran Welcome ne s'affiche qu'une fois)
 *
 * Persistance : @capacitor/preferences (natif sur mobile, localStorage sur web).
 * La police de l'app suit celle du téléphone (system-ui), fallback Roboto Serif
 * — géré entièrement en CSS dans variables.css, pas ici.
 */
const KEY = 'abide.preferences'

export const usePreferencesStore = defineStore('preferences', () => {
  const locale = ref('fr')
  const theme = ref('system')
  const bibleFont = ref(null)
  const bibleFontSize = ref(18)
  const firstLaunchDone = ref(false)
  // Dernier chapitre lu (ex : '/tabs/immersion/book/JHN/3') → reprise au démarrage de l'app.
  const lastReadPath = ref(null)
  // Date (YYYY-MM-DD) où l'overlay flamme du streak a déjà été montré (1×/jour).
  const streakOverlayDate = ref(null)
  const ready = ref(false)

  /** Charge les préférences sauvegardées et les applique. */
  async function init() {
    try {
      const { value } = await Preferences.get({ key: KEY })
      if (value) {
        const saved = JSON.parse(value)
        locale.value = saved.locale ?? detectDeviceLocale()
        theme.value = saved.theme ?? 'system'
        bibleFont.value = saved.bibleFont ?? null
        bibleFontSize.value = saved.bibleFontSize ?? 18
        firstLaunchDone.value = saved.firstLaunchDone ?? false
        lastReadPath.value = saved.lastReadPath ?? null
        streakOverlayDate.value = saved.streakOverlayDate ?? null
      } else {
        // Tout premier lancement : on adopte la langue du téléphone.
        locale.value = detectDeviceLocale()
      }
    } catch {
      locale.value = detectDeviceLocale()
    }
    applyLocale()
    applyTheme()
    applyBibleFont()
    watchSystemTheme()
    ready.value = true
  }

  async function persist() {
    await Preferences.set({
      key: KEY,
      value: JSON.stringify({
        locale: locale.value,
        theme: theme.value,
        bibleFont: bibleFont.value,
        bibleFontSize: bibleFontSize.value,
        firstLaunchDone: firstLaunchDone.value,
        lastReadPath: lastReadPath.value,
        streakOverlayDate: streakOverlayDate.value
      })
    })
  }

  /** Mémorise le dernier chapitre lu (pour la reprise au prochain lancement). */
  async function setLastReadPath(path) {
    lastReadPath.value = path
    await persist()
  }

  /** Mémorise la date où l'overlay flamme du streak a été montré (1×/jour). */
  async function setStreakOverlayDate(date) {
    streakOverlayDate.value = date
    await persist()
  }

  function applyLocale() {
    setLocale(locale.value)
  }

  /** Résout 'system' selon la préférence du téléphone, puis applique la classe. */
  function applyTheme() {
    const isLight =
      theme.value === 'light' ||
      (theme.value === 'system' &&
        window.matchMedia('(prefers-color-scheme: light)').matches)
    document.documentElement.classList.toggle('theme-light', isLight)
  }

  /** Si l'utilisateur est en mode 'system', réagir aux changements de l'OS. */
  function watchSystemTheme() {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    mq.addEventListener?.('change', () => {
      if (theme.value === 'system') applyTheme()
    })
  }

  async function setLocalePref(value) {
    locale.value = value
    applyLocale()
    await persist()
  }

  async function setTheme(value) {
    theme.value = value
    applyTheme()
    await persist()
  }

  /**
   * Le thème est-il sombre EN CE MOMENT ? Résout 'system' selon l'OS.
   * Sert au toggle binaire sombre/clair de l'écran Paramètres.
   */
  function isDarkNow() {
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    // 'system' → suit l'OS (défaut au 1er lancement).
    return !window.matchMedia('(prefers-color-scheme: light)').matches
  }

  /** Bascule sombre ↔ clair (écrit une valeur EXPLICITE, on quitte 'system'). */
  async function toggleDark(dark) {
    await setTheme(dark ? 'dark' : 'light')
  }

  /**
   * Polices proposées pour la lecture de la Bible. `id` = valeur stockée,
   * `stack` = font-family CSS appliquée à --font-bible-user. La 1re (défaut)
   * suit la police de l'app. Les autres sont des familles largement dispo
   * (system fonts) pour rester offline-safe — pas de Google Fonts à charger.
   */
  const BIBLE_FONTS = [
    { id: null, label: 'Par défaut', stack: 'var(--font-app)' },
    { id: 'serif', label: 'Serif', stack: "Georgia, 'Times New Roman', serif" },
    { id: 'sans', label: 'Sans', stack: "system-ui, 'Segoe UI', Roboto, sans-serif" },
    { id: 'georgia', label: 'Georgia', stack: "Georgia, serif" },
    { id: 'palatino', label: 'Palatino', stack: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
    { id: 'garamond', label: 'Garamond', stack: "Garamond, 'EB Garamond', serif" },
    { id: 'mono', label: 'Mono', stack: "'Courier New', ui-monospace, monospace" }
  ]

  /** Applique la police choisie à la variable CSS lue par le texte biblique. */
  function applyBibleFont() {
    const font = BIBLE_FONTS.find((f) => f.id === bibleFont.value) ?? BIBLE_FONTS[0]
    document.documentElement.style.setProperty('--font-bible-user', font.stack)
  }

  async function setBibleFont(value) {
    bibleFont.value = value
    applyBibleFont()
    await persist()
  }

  async function setBibleFontSize(value) {
    bibleFontSize.value = Math.min(24, Math.max(16, value))
    await persist()
  }

  /** Marque le premier lancement comme effectué (après Welcome). */
  async function completeFirstLaunch() {
    firstLaunchDone.value = true
    await persist()
  }

  return {
    locale,
    theme,
    bibleFont,
    bibleFontSize,
    firstLaunchDone,
    lastReadPath,
    streakOverlayDate,
    ready,
    BIBLE_FONTS,
    init,
    setLocalePref,
    setTheme,
    isDarkNow,
    toggleDark,
    setBibleFont,
    setBibleFontSize,
    completeFirstLaunch,
    setLastReadPath,
    setStreakOverlayDate
  }
})
