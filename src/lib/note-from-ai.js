/**
 * Conversion d'un message du Guide IA → contenu de remarque (Note).
 *
 * L'IA AGIT : l'utilisateur exporte une réponse du Guide dans une note. On veut :
 *   - un texte PROPRE (le Markdown des réponses IA — titres #, gras **, listes —
 *     n'est PAS rendu par l'éditeur de notes, seuls les tags @verset le sont) ;
 *   - les références bibliques citées converties en TAGS de note cliquables,
 *     au format `@[Libellé](CODE.chapitre.verset)` (cf. NoteEditView / TAG_RE).
 *
 * Fonctions PURES (entrée → sortie, sans effet de bord) : testables sans Vue.
 */

import { splitByRefs } from '@/lib/bible-refs'

/**
 * Retire le balisage Markdown lourd d'un texte IA pour le rendre lisible en
 * texte courant (les notes n'affichent pas le Markdown). On reste conservateur :
 * on enlève les marqueurs, on garde le texte et les sauts de ligne.
 * @param {string} md
 * @returns {string}
 */
export function stripMarkdown(md) {
  return (md || '')
    // Titres : « ## Titre » → « Titre »
    .replace(/^#{1,6}\s+/gm, '')
    // Gras/italique : **x**, __x__, *x*, _x_ → x
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Puces : « - x » / « * x » / « + x » → « • x »
    .replace(/^\s*[-*+]\s+/gm, '• ')
    // Citations : « > x » → « x »
    .replace(/^\s*>\s?/gm, '')
    // Code inline : `x` → x
    .replace(/`([^`]+)`/g, '$1')
    // Liens Markdown [texte](url) → texte (on ne veut pas d'URL dans une note)
    .replace(/\[([^\]]+)\]\((?:https?:)?[^)]+\)/g, '$1')
    // Espaces de fin de ligne + lignes vides multiples
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Transforme le contenu d'un message IA en corps de note :
 *  - nettoie le Markdown ;
 *  - remplace chaque référence détectée par un tag `@[Libellé](CODE.ch.v)`.
 * @param {string} content - message.content de l'IA (Markdown)
 * @returns {string} corps prêt pour saveNote({ body })
 */
export function aiMessageToNoteBody(content) {
  const clean = stripMarkdown(content)
  // splitByRefs découpe en segments texte / ref (mêmes regex que le rendu inline
  // des références dans le chat → cohérence garantie).
  const segments = splitByRefs(clean)
  return segments
    .map((seg) => {
      if (seg.type !== 'ref') return seg.value
      // seg.value = libellé exact tel qu'écrit (« Jean 3.16 »). Le tag pointe le
      // verset unique cité ; le picker de notes gère aussi les plages, mais l'IA
      // cite verset par verset → range = le verset seul.
      const label = seg.value
      const ref = `${seg.code}.${seg.chapter}.${seg.verse}`
      return `@[${label}](${ref})`
    })
    .join('')
}

/**
 * Titre par défaut d'une note exportée : les premiers mots du message nettoyé,
 * sans les tags/références, borné. Repli sur un libellé générique.
 * @param {string} content
 * @param {string} fallback - libellé i18n (« Note du Guide »)
 * @returns {string}
 */
export function aiNoteTitle(content, fallback) {
  const firstLine = stripMarkdown(content)
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0) || ''
  const words = firstLine.split(/\s+/).slice(0, 7).join(' ')
  const title = words.length > 60 ? words.slice(0, 60).trim() + '…' : words
  return title || fallback
}
