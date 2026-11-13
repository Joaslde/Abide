/**
 * Typographie maison : aucun tiret cadratin (U+2014) ni demi-cadratin (U+2013)
 * à l'écran. Les textes écrits à la main n'en contiennent plus ; ce filtre
 * s'applique aux textes GÉNÉRÉS (Guide IA, quiz), où le modèle en produit
 * spontanément même quand on lui demande de s'en passer.
 *
 * Remplacements, du plus précis au plus général :
 *   « **Titre** <tiret> texte »  → « **Titre** : texte »
 *   « 3<tiret>5 »                → « 3-5 » (intervalle)
 *   ligne qui commence par un tiret (attribution d'une citation) → tiret retiré
 *   « mot <tiret> mot » ou « mot<tiret>mot » → « mot, mot »
 */
const DASH = '[\\u2013\\u2014]'
const BOLD_LEAD = new RegExp(`(\\*\\*[^*\\n]+\\*\\*)[ \\t]*${DASH}[ \\t]*`, 'g')
const RANGE = new RegExp(`(\\d)[ \\t]*${DASH}[ \\t]*(\\d)`, 'g')
const LINE_START = new RegExp(`^([ \\t]*)${DASH}[ \\t]*`, 'gm')
const ANY = new RegExp(`[ \\t]*${DASH}[ \\t]*`, 'g')

/**
 * @param {string} text
 * @param {string} [locale]  'fr' : espace avant les deux-points
 * @returns {string}
 */
export function withoutLongDashes(text, locale = 'fr') {
  if (!text) return text ?? ''
  const colon = locale === 'fr' ? ' : ' : ': '
  return String(text)
    .replace(BOLD_LEAD, `$1${colon}`)
    .replace(RANGE, '$1-$2')
    .replace(LINE_START, '$1')
    .replace(ANY, ', ')
}
