/**
 * Libellé COURT d'une version de la Bible, pour les badges et barres étroites
 * (vue Bible, vue chapitre). Le nom complet reste affiché dans le sélecteur de
 * versions et le catalogue, où la place existe.
 *
 * Pourquoi une table : l'identifiant technique (« BES_ES », « OSTERVALD_FR »)
 * n'est pas lisible, et le nom complet (« La Biblia en Español Sencillo »)
 * écrasait le titre de la vue Bible jusqu'à le réduire à « La… ».
 */
const SHORT_LABELS = {
  LSG1910: 'LSG',
  DARBY_FR: 'Darby',
  MARTIN_FR: 'Martin',
  OSTERVALD_FR: 'Ostervald',
  BLM_FR: 'BLM',
  KJV: 'KJV',
  WEB: 'WEB',
  ASV: 'ASV',
  YLT: 'YLT',
  BSB: 'BSB',
  BBE: 'BBE',
  GNV: 'Geneva',
  RV1885: 'RV',
  DARBY_EN: 'Darby',
  WEBSTER: 'Webster',
  MSB: 'MSB',
  WMB: 'WMB',
  AKJV: 'AKJV',
  RV1909: 'RV 1909',
  BES_ES: 'BES',
  BLM_ES: 'BLM',
  BLL_ES: 'BLL',
  SSE_ES: 'SSE'
}

/**
 * @param {string} versionId  identifiant de la version (ex. « BES_ES »)
 * @returns {string} libellé court ; repli : l'identifiant sans suffixe de langue
 */
export function versionShortLabel(versionId) {
  if (!versionId) return ''
  return SHORT_LABELS[versionId] ?? versionId.replace(/_(FR|EN|ES)$/, '')
}
