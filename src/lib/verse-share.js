/**
 * Partage et téléchargement de l'image du verset du jour.
 *
 * ⚠️ Ce qu'Android permet réellement, et qui dicte la conception ci-dessous :
 * aucune application tierce n'accepte qu'on lui impose une image ET un
 * destinataire depuis l'extérieur. WhatsApp, Instagram et Facebook n'exposent
 * pas d'API publique pour « publier cette image ». La seule voie officielle est
 * la feuille de partage du système (ACTION_SEND), où la personne choisit
 * elle-même l'application de destination.
 *
 * On expose donc DEUX actions : « Partager » (feuille système, qui contient
 * déjà WhatsApp, Instagram, Facebook et le reste) et « Enregistrer » (l'image
 * atterrit dans Pictures/Abide, visible dans la galerie, prête à être publiée
 * à la main — c'est d'ailleurs le seul chemin fiable pour une story Instagram).
 */
import { Capacitor, registerPlugin } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

/**
 * Plugin natif maison : @capacitor/filesystem ne sait pas écrire dans la
 * galerie. Directory.Documents produit un fichier introuvable depuis Google
 * Photos — la personne croit que le téléchargement a échoué.
 */
const Gallery = registerPlugin('Gallery')

const isNative = Capacitor.isNativePlatform()

/** Nom de fichier lisible et unique : « abide-psaumes-46-1-1789012345.png ». */
function fileNameFor(reference) {
  const slug = reference
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `abide-${slug}-${Date.now()}.png`
}

/**
 * Écrit le PNG dans le cache de l'app et renvoie son URI natif.
 * Cache (et non Documents) : ces images sont jetables, Android peut les
 * nettoyer librement, et aucune permission de stockage n'est requise.
 */
async function writeToCache(base64, reference) {
  const path = fileNameFor(reference)
  await Filesystem.writeFile({ path, data: base64, directory: Directory.Cache })
  const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache })
  return uri
}

/**
 * Ouvre la feuille de partage du système avec l'image en pièce jointe.
 * @returns {Promise<'shared'|'cancelled'|'unavailable'>}
 */
export async function shareVerseImage({ base64, reference, text }) {
  if (!isNative) return 'unavailable'

  const uri = await writeToCache(base64, reference)
  try {
    await Share.share({
      // `text` accompagne l'image dans les apps qui gèrent les deux (WhatsApp,
      // e-mail). Instagram l'ignore : c'est le comportement normal du système.
      text: `« ${text} »\n— ${reference}`,
      files: [uri],
      dialogTitle: reference
    })
    return 'shared'
  } catch (e) {
    // Fermer la feuille de partage lève une exception : ce n'est pas une erreur.
    const msg = String(e?.message || e).toLowerCase()
    if (msg.includes('cancel') || msg.includes('abort')) return 'cancelled'
    throw e
  }
}

/**
 * Enregistre l'image dans la galerie de l'appareil.
 *
 * Passe par le plugin natif Gallery → MediaStore → Pictures/Abide. Aucune
 * permission n'est demandée sur Android 10+ (scoped storage) ; sur Android 9 et
 * moins, WRITE_EXTERNAL_STORAGE est déclarée avec maxSdkVersion="28".
 *
 * @returns {Promise<string>} URI de l'image enregistrée
 */
export async function downloadVerseImage({ base64, reference }) {
  const fileName = fileNameFor(reference)

  if (!isNative) {
    // Sur le web (dev), on déclenche un téléchargement navigateur classique.
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${base64}`
    a.download = fileName
    a.click()
    return fileName
  }

  // Pictures/Abide via le MediaStore : le dossier que TOUTES les galeries
  // indexent. L'image apparaît immédiatement dans Google Photos et dans la
  // galerie du constructeur, dans un album « Abide ».
  const { uri } = await Gallery.saveImage({ data: base64, fileName })
  return uri
}

/** Le partage natif est-il disponible ? (faux en navigateur de développement) */
export function canShare() {
  return isNative
}
