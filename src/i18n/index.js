import { createI18n } from 'vue-i18n'
import fr from './locales/fr.js'
import en from './locales/en.js'
import es from './locales/es.js'

/**
 * Instance i18n d'Abide.
 * La locale réelle est appliquée par le store preferences au démarrage
 * (selon la préférence sauvegardée, sinon la langue du téléphone).
 */
export const SUPPORTED_LOCALES = ['fr', 'en', 'es']

/**
 * Nom de chaque langue DANS cette langue (convention des sélecteurs de langue :
 * quelqu'un qui ne lit pas la langue actuelle retrouve quand même la sienne).
 */
export const LANGUAGE_NAMES = { fr: 'Français', en: 'English', es: 'Español' }

/** Locale BCP 47 utilisée pour formater les dates (toLocaleDateString). */
export const DATE_LOCALES = { fr: 'fr-FR', en: 'en-US', es: 'es-ES' }

/** Initiales des jours, lundi → dimanche (en espagnol, X = miércoles). */
export const WEEKDAY_LETTERS = {
  fr: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  es: ['L', 'M', 'X', 'J', 'V', 'S', 'D']
}

/** Locale de date pour une langue de l'interface (repli français). */
export function dateLocale(locale) {
  return DATE_LOCALES[locale] ?? DATE_LOCALES.fr
}

export const i18n = createI18n({
  legacy: false,           // Composition API
  locale: 'fr',            // valeur initiale, écrasée par preferences.init()
  fallbackLocale: 'fr',
  messages: { fr, en, es }
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
