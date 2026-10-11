/**
 * Limites de ce qu'une image de partage peut raisonnablement porter.
 *
 * POURQUOI CES LIMITES : une image carrée lue sur un fil Instagram ou un statut
 * WhatsApp se regarde deux secondes. Au-delà de ~300 caractères, le texte doit
 * tellement rétrécir qu'il devient illisible sur téléphone — l'image perd tout
 * son intérêt. Mieux vaut refuser clairement que produire une image ratée.
 *
 * On refuse sur DEUX critères indépendants, parce qu'ils ne se recoupent pas :
 * 3 versets des Psaumes peuvent être plus courts qu'un seul verset d'Ésaïe.
 */

/** Au-delà, l'image devient un mur de texte : on refuse. */
export const MAX_VERSES = 3

/**
 * Caractères max, espaces compris. Calibré sur la zone de texte de
 * `buildVerseImage` (760 px de haut à 1080 px de large, police min. 30 px) :
 * au-delà de ~320 caractères le texte déborde ou passe sous le seuil lisible.
 */
export const MAX_CHARS = 320

/**
 * Une sélection peut-elle devenir une image partageable ?
 *
 * @param {Array<{verse: number, text: string}>} verses
 * @returns {{ ok: boolean, reason?: 'too-many-verses'|'too-long', count: number, chars: number }}
 */
export function checkVerseImageLimits(verses) {
  const count = verses.length
  const chars = verses.reduce((sum, v) => sum + (v.text?.length ?? 0), 0)

  // L'ordre compte : le nombre de versets est ce que la personne contrôle
  // directement (elle vient de les sélectionner), la longueur est plus abstraite.
  // On signale donc d'abord le critère sur lequel elle peut agir intuitivement.
  if (count > MAX_VERSES) return { ok: false, reason: 'too-many-verses', count, chars }
  if (chars > MAX_CHARS) return { ok: false, reason: 'too-long', count, chars }

  return { ok: true, count, chars }
}

/**
 * Assemble le texte des versets pour l'image.
 *
 * Les numéros de verset sont VOLONTAIREMENT omis quand il n'y en a qu'un : sur
 * une image, « 16. Car Dieu a tant aimé… » fait maladroit, alors que sur
 * plusieurs versets les numéros aident à suivre.
 */
export function buildImageText(verses) {
  if (verses.length === 1) return verses[0].text
  return verses.map((v) => `${v.verse}. ${v.text}`).join(' ')
}
