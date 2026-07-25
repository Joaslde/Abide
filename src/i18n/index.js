import { createI18n } from 'vue-i18n'
import fr from './locales/fr.js'
import en from './locales/en.js'

/**
 * Instance i18n d'Abide.
 * La locale réelle est appliquée par le store preferences au démarrage
 * (selon la préférence sauvegardée, sinon la langue du téléphone).
 */
export const SUPPORTED_LOCALES = ['fr', 'en']

export const i18n = createI18n({
  legacy: false,           // Composition API
  locale: 'fr',            // valeur initiale, écrasée par preferences.init()
  fallbackLocale: 'fr',
  messages: { fr, en }
})

/** Détecte la langue du téléphone/navigateur, repli sur 'fr'. */
export function detectDeviceLocale() {
  const lang = (navigator.language || 'fr').slice(0, 2).toLowerCase()
  return SUPPORTED_LOCALES.includes(lang) ? lang : 'fr'
}

export function setLocale(locale) {
  if (SUPPORTED_LOCALES.includes(locale)) {
    i18n.global.locale.value = locale
    document.documentElement.setAttribute('lang', locale)
  }
}
