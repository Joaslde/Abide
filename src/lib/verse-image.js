/**
 * Génération de l'image partageable du verset du jour.
 *
 * On dessine dans un <canvas> plutôt que de photographier le DOM : aucune
 * dépendance (html2canvas pèse 200 ko et rend mal les dégradés), un rendu
 * identique sur tous les appareils, et une maîtrise totale de la composition.
 *
 * Format 1080×1350 (4:5) : le ratio le plus haut accepté par Instagram, celui
 * qui occupe le plus de surface dans un fil. Il passe aussi en statut WhatsApp
 * et en publication Facebook sans recadrage.
 */

const W = 1080
const H = 1350

/** Palette — reprise de theme/variables.css pour rester dans la charte. */
const NAVY = '#0B1624'
const GOLD = '#C9A84C'
const CREAM = '#F5F0E6'

const FONT_SERIF = "ui-serif, 'Roboto Serif', Georgia, 'Times New Roman', serif"

/**
 * Découpe un texte en lignes qui tiennent dans `maxWidth`.
 * Mesure réellement chaque mot (ctx.measureText) : une découpe au nombre de
 * caractères casserait sur les mots longs et sur les polices proportionnelles.
 */
function wrapText(ctx, text, maxWidth) {
  // ⚠️ On ne coupe QUE sur les espaces sécables : `\s` inclurait U+00A0 et
  // U+202F (espaces insécables), ce qui viderait de son sens la protection
  // contre les orphelins (guillemet fermant renvoyé seul à la ligne).
  const words = text.split(/[^\S  ]+/)
  const lines = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * Cherche la plus grande taille de police qui fait tenir le verset dans la
 * zone disponible. Un verset court mérite de grands caractères ; un passage
 * long doit rétrécir plutôt que déborder ou se faire tronquer.
 */
function fitText(ctx, text, maxWidth, maxHeight, { max = 64, min = 30 } = {}) {
  for (let size = max; size >= min; size -= 2) {
    ctx.font = `italic ${size}px ${FONT_SERIF}`
    const lines = wrapText(ctx, text, maxWidth)
    const lineHeight = size * 1.42
    if (lines.length * lineHeight <= maxHeight) {
      return { size, lines, lineHeight }
    }
  }
  // Repli : à la taille minimale on accepte le débordement plutôt que de
  // renvoyer un rendu vide — mieux vaut une image imparfaite qu'aucune image.
  ctx.font = `italic ${min}px ${FONT_SERIF}`
  return { size: min, lines: wrapText(ctx, text, maxWidth), lineHeight: min * 1.42 }
}

/** Charge une image et attend qu'elle soit décodée (sinon draw dessine du vide). */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image introuvable : ${src}`))
    img.src = src
  })
}

/**
 * Dessine l'image de fond en « cover » : elle remplit tout le cadre sans se
 * déformer, la surface excédentaire étant rognée de façon centrée.
 */
function drawCover(ctx, img) {
  const scale = Math.max(W / img.width, H / img.height)
  const w = img.width * scale
  const h = img.height * scale
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
}

/**
 * Compose l'image du verset et la renvoie en base64 (sans préfixe data:).
 *
 * @param {object} o
 * @param {string} o.text        texte du verset
 * @param {string} o.reference   « Psaumes 46:1 »
 * @param {string} o.background  URL de l'image de fond (bundlée par Vite)
 * @param {string} o.appName     nom de l'app, en bas (identique au nom Play Store)
 * @param {string} o.storeLine   mention du magasin, sous le nom
 * @param {string} o.label       intitulé en haut (« VERSET DU JOUR », « JEAN 3 »…)
 * @returns {Promise<string>} PNG encodé en base64
 */
export async function buildVerseImage({
  text,
  reference,
  background,
  appName = 'Abide — Bible & Guide IA',
  storeLine = 'Sur Google Play',
  label = 'VERSET DU JOUR'
}) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Fond navy d'abord : il reste visible si l'image de fond manque, et évite
  // un canvas transparent (qui deviendrait noir ou blanc selon les apps).
  ctx.fillStyle = NAVY
  ctx.fillRect(0, 0, W, H)

  try {
    if (background) drawCover(ctx, await loadImage(background))
  } catch {
    /* sans conséquence : le fond navy suffit */
  }

  // Voile sombre — même logique que la carte à l'écran : le verset doit rester
  // lisible quel que soit le paysage, y compris sur un ciel clair.
  const scrim = ctx.createLinearGradient(0, 0, 0, H)
  scrim.addColorStop(0, 'rgba(11, 22, 36, 0.68)')
  scrim.addColorStop(0.35, 'rgba(11, 22, 36, 0.82)')
  scrim.addColorStop(0.75, 'rgba(11, 22, 36, 0.86)')
  scrim.addColorStop(1, 'rgba(11, 22, 36, 0.94)')
  ctx.fillStyle = scrim
  ctx.fillRect(0, 0, W, H)

  // Ombre portée douce sous le texte : sur un fond très clair (ciel, neige),
  // le voile seul ne suffit pas toujours à détacher les lettres.
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 2

  const margin = 96
  const contentWidth = W - margin * 2

  // ── Filet doré + intitulé ────────────────────────────────────────────────
  ctx.fillStyle = GOLD
  ctx.fillRect(margin, 150, 68, 3)

  ctx.font = `600 26px ${FONT_SERIF}`
  ctx.fillStyle = GOLD
  ctx.textAlign = 'left'
  ctx.letterSpacing = '3px' // supporté par Chromium (donc par la WebView Android)
  ctx.fillText(label, margin, 210)
  ctx.letterSpacing = '0px'

  // ── Verset ───────────────────────────────────────────────────────────────
  // Zone de texte bornée : on garde de l'air au-dessus (intitulé) et en
  // dessous (référence + signature).
  // Le verset occupe la moitié basse-centrale : assez d'air sous l'intitulé,
  // sans laisser le grand vide qu'un textTop trop bas produisait.
  const textTop = 268
  // 738 (et non 760) : la signature occupe désormais deux lignes (nom + Store),
  // la référence a donc été remontée — la zone de texte rend la place d'autant.
  const textMaxHeight = 738
  // ⚠️ Espace INSÉCABLE avant le guillemet fermant : sans elle, wrapText peut
  // renvoyer « » » seul sur la dernière ligne (constaté sur Jean 3:16), ce qui
  // fait un orphelin disgracieux. L'espace fine insécable (U+202F) est aussi
  // la ponctuation française correcte devant un guillemet fermant.
  const quoted = `« ${text} »`
  const { lines, lineHeight } = fitText(ctx, quoted, contentWidth, textMaxHeight)

  // Bloc centré verticalement dans sa zone : une image équilibrée que le
  // verset soit court ou long.
  const blockHeight = lines.length * lineHeight
  let y = textTop + (textMaxHeight - blockHeight) / 2 + lineHeight * 0.8

  ctx.fillStyle = CREAM
  ctx.textAlign = 'left'
  for (const line of lines) {
    ctx.fillText(line, margin, y)
    y += lineHeight
  }

  // ── Référence ────────────────────────────────────────────────────────────
  ctx.font = `700 38px ${FONT_SERIF}`
  ctx.fillStyle = GOLD
  ctx.fillText(reference, margin, H - 212)

  // ── Signature ────────────────────────────────────────────────────────────
  // Ombre retirée : sur un filet de 2px elle baverait au lieu de détacher.
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // Signature en DEUX niveaux : le nom (qu'on retrouve tel quel sur le Store,
  // donc cherchable) puis la mention du Store, plus effacée.
  // Volontairement discrète : une image de verset partagée est d'abord un
  // geste personnel — trop d'insistance la ferait passer pour une publicité,
  // et les gens cesseraient de la partager.
  ctx.fillStyle = 'rgba(201, 168, 76, 0.34)'
  ctx.fillRect(margin, H - 148, 44, 2)

  ctx.font = `600 25px ${FONT_SERIF}`
  ctx.fillStyle = 'rgba(245, 240, 230, 0.62)'
  ctx.letterSpacing = '1.5px'
  ctx.fillText(appName, margin, H - 100)

  // Mention Store : plus petite, plus transparente — lisible si on la cherche,
  // invisible si on regarde le verset.
  ctx.font = `400 19px ${FONT_SERIF}`
  ctx.fillStyle = 'rgba(245, 240, 230, 0.38)'
  ctx.letterSpacing = '0.5px'
  ctx.fillText(storeLine, margin, H - 66)
  ctx.letterSpacing = '0px'

  // toDataURL renvoie « data:image/png;base64,XXXX » : on ne garde que XXXX,
  // format attendu par Filesystem.writeFile.
  return canvas.toDataURL('image/png').split(',')[1]
}
