/**
 * Ordre canonique des 66 livres et leurs noms par langue, partagés par les
 * scripts de génération (generate-version.js, generate-version-ebible.js).
 * Les ID de livres sont CANONIQUES pour toutes les versions : c'est ce qui permet
 * de garder la position de lecture quand on change de version.
 */

// Ordre canonique des 66 livres (id partagé). Les noms sont par langue.
export const CANON = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI',
  '1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER',
  'LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP',
  'HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL',
  'EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE',
  '2PE','1JN','2JN','3JN','JUD','REV'
]
export const OT_COUNT = 39 // les 39 premiers = Ancien Testament

// Noms anglais (KJV) dans l'ordre canonique.
export const NAMES_EN = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
  '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
]

// Noms français (Darby, etc.) dans l'ordre canonique.
export const NAMES_FR = [
  'Genèse','Exode','Lévitique','Nombres','Deutéronome','Josué','Juges','Ruth',
  '1 Samuel','2 Samuel','1 Rois','2 Rois','1 Chroniques','2 Chroniques','Esdras',
  'Néhémie','Esther','Job','Psaumes','Proverbes','Ecclésiaste','Cantique des Cantiques',
  'Ésaïe','Jérémie','Lamentations','Ézéchiel','Daniel','Osée','Joël','Amos',
  'Abdias','Jonas','Michée','Nahoum','Habacuc','Sophonie','Aggée','Zacharie',
  'Malachie','Matthieu','Marc','Luc','Jean','Actes','Romains','1 Corinthiens',
  '2 Corinthiens','Galates','Éphésiens','Philippiens','Colossiens',
  '1 Thessaloniciens','2 Thessaloniciens','1 Timothée','2 Timothée','Tite','Philémon',
  'Hébreux','Jacques','1 Pierre','2 Pierre','1 Jean','2 Jean','3 Jean','Jude','Apocalypse'
]

// Noms espagnols (Reina-Valera) dans l'ordre canonique.
export const NAMES_ES = [
  'Génesis','Éxodo','Levítico','Números','Deuteronomio','Josué','Jueces','Rut',
  '1 Samuel','2 Samuel','1 Reyes','2 Reyes','1 Crónicas','2 Crónicas','Esdras',
  'Nehemías','Ester','Job','Salmos','Proverbios','Eclesiastés','Cantares',
  'Isaías','Jeremías','Lamentaciones','Ezequiel','Daniel','Oseas','Joel','Amós',
  'Abdías','Jonás','Miqueas','Nahúm','Habacuc','Sofonías','Hageo','Zacarías',
  'Malaquías','Mateo','Marcos','Lucas','Juan','Hechos','Romanos','1 Corintios',
  '2 Corintios','Gálatas','Efesios','Filipenses','Colosenses',
  '1 Tesalonicenses','2 Tesalonicenses','1 Timoteo','2 Timoteo','Tito','Filemón',
  'Hebreos','Santiago','1 Pedro','2 Pedro','1 Juan','2 Juan','3 Juan','Judas','Apocalipsis'
]

export const NAMES_BY_LANGUAGE = { en: NAMES_EN, fr: NAMES_FR, es: NAMES_ES }
