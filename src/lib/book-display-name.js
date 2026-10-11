/**
 * Nom de livre abrégé pour les barres de titre étroites.
 *
 * POURQUOI : « Cantique des Cantiques 8 » fait 24 caractères. Dans une barre
 * partagée avec la flèche de retour, le bouton lecture, le badge de version et
 * les réglages, il ne reste qu'une centaine de pixels — même réduit à 11px
 * (limite de lisibilité), le titre restait tronqué en « Cantique des Canti… ».
 *
 * Réduire encore la police n'est pas une option : en dessous de 11px le texte
 * devient illisible, et une ellipsis reste une ellipsis. On abrège donc les
 * quelques noms réellement problématiques, comme le font les Bibles papier.
 *
 * ⚠️ N'affecte QUE l'affichage dans les barres contraintes. Le nom complet
 * reste utilisé partout où la place existe : en-tête du chapitre dans le texte,
 * listes de livres, recherche, partage.
 */

/**
 * Abréviations usuelles, par identifiant de livre (codes USFM, stables quelle
 * que soit la version installée). Seuls les noms qui débordent réellement
 * figurent ici — un nom qui tient ne doit jamais être abrégé.
 */
const SHORT_NAMES = {
  fr: {
    SNG: 'Cantiques',        // Cantique des Cantiques
    LAM: 'Lamentations',     // Lamentations de Jérémie
    ECC: 'Ecclésiaste'       // parfois « L'Ecclésiaste »
  },
  en: {
    SNG: 'Song of Songs'     // Song of Solomon
  }
}

/**
 * Correspondance par NOM COMPLET, pour les appelants qui n'ont pas le bookId
 * sous la main (le store audio ne le conserve pas). Insensible à la casse et
 * aux accents afin de couvrir les variantes entre versions.
 */
const BY_FULL_NAME = {
  'cantique des cantiques': 'Cantiques',
  'le cantique des cantiques': 'Cantiques',
  'lamentations de jeremie': 'Lamentations',
  'song of solomon': 'Song of Songs',
  'the song of solomon': 'Song of Songs'
}

/** Minuscule sans accents : « Cantique des Cantiques » → « cantique des cantiques ». */
function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/**
 * @param {string} bookId     identifiant USFM (« SNG », « 1TH »…), ou null
 * @param {string} fullName   nom complet issu de la base
 * @param {string} [locale]   langue de l'interface
 * @returns {string} nom à afficher dans une barre étroite
 */
export function displayBookName(bookId, fullName, locale = 'fr') {
  const lang = String(locale).slice(0, 2)
  const short = (bookId && SHORT_NAMES[lang]?.[bookId]) || BY_FULL_NAME[normalize(fullName)]
  if (!short) return fullName

  // Garde-fou : si la base fournit déjà un nom court (certaines versions
  // abrègent d'elles-mêmes), on ne rallonge pas.
  return fullName && fullName.length <= short.length ? fullName : short
}
