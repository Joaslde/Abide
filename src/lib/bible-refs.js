/**
 * Détection des références bibliques dans un texte libre.
 *
 * Utilisé côté CLIENT pour rendre les références citées par l'IA cliquables
 * directement dans le corps du message (« Matthieu 6.8 » → ouvre le chapitre).
 *
 * ⚠️ Cette table doit rester alignée sur BOOK_CODES de l'Edge Function
 * `supabase/functions/ai-chat/index.ts` (qui, elle, sert à VÉRIFIER les
 * références contre la vraie Bible avant de les afficher en sources).
 */

/** Nom de livre (FR/EN, variantes courantes) → code canonique. */
export const BOOK_CODES = {
  genese: 'GEN', genesis: 'GEN', exode: 'EXO', exodus: 'EXO', levitique: 'LEV', leviticus: 'LEV',
  nombres: 'NUM', numbers: 'NUM', deuteronome: 'DEU', deuteronomy: 'DEU',
  josue: 'JOS', joshua: 'JOS', juges: 'JDG', judges: 'JDG', ruth: 'RUT',
  '1samuel': '1SA', '2samuel': '2SA', '1rois': '1KI', '2rois': '2KI', '1kings': '1KI', '2kings': '2KI',
  '1chroniques': '1CH', '2chroniques': '2CH', '1chronicles': '1CH', '2chronicles': '2CH',
  esdras: 'EZR', ezra: 'EZR', nehemie: 'NEH', nehemiah: 'NEH', esther: 'EST',
  job: 'JOB', psaume: 'PSA', psaumes: 'PSA', psalm: 'PSA', psalms: 'PSA',
  proverbes: 'PRO', proverbs: 'PRO', ecclesiaste: 'ECC', ecclesiastes: 'ECC',
  cantique: 'SNG', cantiquedescantiques: 'SNG', songofsolomon: 'SNG',
  esaie: 'ISA', isaie: 'ISA', isaiah: 'ISA', jeremie: 'JER', jeremiah: 'JER',
  lamentations: 'LAM', ezechiel: 'EZK', ezekiel: 'EZK', daniel: 'DAN',
  osee: 'HOS', hosea: 'HOS', joel: 'JOL', amos: 'AMO', abdias: 'OBA', obadiah: 'OBA',
  jonas: 'JON', jonah: 'JON', michee: 'MIC', micah: 'MIC', nahum: 'NAM', nahoum: 'NAM',
  habacuc: 'HAB', habakkuk: 'HAB', sophonie: 'ZEP', zephaniah: 'ZEP',
  aggee: 'HAG', haggai: 'HAG', zacharie: 'ZEC', zechariah: 'ZEC', malachie: 'MAL', malachi: 'MAL',
  matthieu: 'MAT', matthew: 'MAT', marc: 'MRK', mark: 'MRK', luc: 'LUK', luke: 'LUK',
  jean: 'JHN', john: 'JHN', actes: 'ACT', acts: 'ACT',
  romains: 'ROM', romans: 'ROM', '1corinthiens': '1CO', '2corinthiens': '2CO',
  '1corinthians': '1CO', '2corinthians': '2CO', galates: 'GAL', galatians: 'GAL',
  ephesiens: 'EPH', ephesians: 'EPH', philippiens: 'PHP', philippians: 'PHP',
  colossiens: 'COL', colossians: 'COL',
  '1thessaloniciens': '1TH', '2thessaloniciens': '2TH', '1thessalonians': '1TH', '2thessalonians': '2TH',
  '1timothee': '1TI', '2timothee': '2TI', '1timothy': '1TI', '2timothy': '2TI',
  tite: 'TIT', titus: 'TIT', philemon: 'PHM',
  hebreux: 'HEB', hebrews: 'HEB', jacques: 'JAS', james: 'JAS',
  '1pierre': '1PE', '2pierre': '2PE', '1peter': '1PE', '2peter': '2PE',
  '1jean': '1JN', '2jean': '2JN', '3jean': '3JN', '1john': '1JN', '2john': '2JN', '3john': '3JN',
  jude: 'JUD', apocalypse: 'REV', revelation: 'REV'
}

/** Normalise un nom de livre : minuscules, sans accents/espaces/points. */
export function normalizeBook(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s.]/g, '')
    .replace(/^(premiere?|1er|1ere)/, '1')
    .replace(/^(deuxieme|2eme|2e)/, '2')
    .replace(/^(troisieme|3eme|3e)/, '3')
}

/** Regex compacte : « Jean 3.16 », « Jean 3:16 », « 1 Corinthiens 13:4 ». */
export const REF_REGEX =
  /\b((?:[123]\s*)?[A-Za-zÀ-ÿ]{3,20}(?:\s+des\s+[A-Za-zÀ-ÿ]+)?)\s+(\d{1,3})\s*[.:]\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?/g

/** Regex verbose (filet) : « Luc chapitre 22, verset 19 ». */
export const REF_REGEX_VERBOSE =
  /\b((?:[123]\s*)?[A-Za-zÀ-ÿ]{3,20}(?:\s+des\s+[A-Za-zÀ-ÿ]+)?)\s+chapitre\s+(\d{1,3})[,\s]+versets?\s+(\d{1,3})/gi

/**
 * Analyse une référence détectée. Retourne null si le nom n'est pas un livre
 * connu (évite les faux positifs : « 3.16 euros », « il est 14:30 »).
 */
export function parseRef(bookName, chapter, verse) {
  const code = BOOK_CODES[normalizeBook(bookName)]
  if (!code) return null
  return { code, chapter: Number(chapter), verse: Number(verse) }
}

/**
 * Découpe un texte en segments : { type: 'text' } et { type: 'ref' }.
 * Permet de rendre les références comme de vrais boutons cliquables.
 */
export function splitByRefs(text) {
  // On collecte les correspondances des DEUX formats (compact + verbose), puis
  // on les trie par position pour découper le texte proprement.
  const matches = []
  for (const src of [REF_REGEX, REF_REGEX_VERBOSE]) {
    const re = new RegExp(src.source, src.flags)
    let m
    while ((m = re.exec(text)) !== null) {
      const parsed = parseRef(m[1], m[2], m[3])
      if (!parsed) continue // pas un livre connu → on ignore
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], ...parsed })
    }
  }
  if (!matches.length) return [{ type: 'text', value: text }]

  matches.sort((a, b) => a.start - b.start)

  const segments = []
  let lastIndex = 0
  for (const mt of matches) {
    if (mt.start < lastIndex) continue // chevauchement (déjà couvert) → on saute
    if (mt.start > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, mt.start) })
    }
    segments.push({
      type: 'ref',
      value: mt.text, // libellé exact tel qu'écrit dans le message
      code: mt.code,
      chapter: mt.chapter,
      verse: mt.verse
    })
    lastIndex = mt.end
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }
  return segments
}
