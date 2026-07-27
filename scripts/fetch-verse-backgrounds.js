/**
 * Télécharge et optimise les images de fond du « Verset du jour ».
 *
 *   node scripts/fetch-verse-backgrounds.js
 *
 * Source : Unsplash (licence gratuite, usage commercial autorisé, sans
 * attribution obligatoire — https://unsplash.com/license).
 *
 * POURQUOI SI PETIT ? Les images sont AFFICHÉES ASSOMBRIES DERRIÈRE DU TEXTE
 * dans une carte d'environ 350×190 pt. On peut donc compresser très fort sans
 * que ça se voie : ~45 Ko/image en WebP au lieu de ~2 Mo pour l'original.
 * 40 images ≈ 1,8 Mo bundlés — acceptable pour du 100 % offline.
 *
 * ⚠️ REVUE HUMAINE OBLIGATOIRE : le script ne peut pas juger du CONTENU des
 * photos. Après exécution, ouvrir src/assets/backgrounds/ et supprimer toute
 * image qui ne correspond pas (visage trop présent, scène urbaine, ambiance
 * inadaptée…). La numérotation n'a pas besoin d'être continue : le composant
 * lit la liste réelle des fichiers via import.meta.glob.
 */
import { writeFile, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'backgrounds')

// Dimensions cibles : ~2× la taille d'affichage de la carte, suffisant sur
// écran haute densité une fois l'image assombrie.
const WIDTH = 760
const HEIGHT = 420
const QUALITY = 68 // WebP : au-delà, le gain visuel est nul sur une image sombre

/**
 * Photos Unsplash — paysages inspirants (montagnes, mer, aube, vallées,
 * déserts, forêts, ciels). IDs stables (permaliens Unsplash).
 */
const PHOTO_IDS = [
  'photo-1506905925346-21bda4d32df4', // montagnes brumeuses
  'photo-1470071459604-3b5ec3a7fe05', // forêt de conifères dans la brume
  'photo-1441974231531-c6227db76b6e', // sous-bois lumineux
  'photo-1472214103451-9374bd1c798e', // colline verte, ciel dramatique
  'photo-1447752875215-b2761acb3c5d', // forêt, rayons de soleil
  'photo-1418065460487-3e41a6c84dc5', // prairie au crépuscule
  'photo-1439853949127-fa647821eba0', // côte rocheuse
  'photo-1433086966358-54859d0ed716', // cascade
  'photo-1426604966848-d7adac402bff', // vallée verdoyante
  'photo-1490750967868-88aa4486c946', // champ de fleurs, lumière douce
  'photo-1501854140801-50d01698950b', // collines vues du ciel
  'photo-1475924156734-496f6cac6ec1', // mer au coucher du soleil
  'photo-1444927714506-8492d94b4e3d', // océan, horizon
  'photo-1505118380757-91f5f5632de0', // lac de montagne
  'photo-1465146344425-f00d5f5c8f07', // nature, fleurs blanches
  'photo-1519681393784-d120267933ba', // montagne enneigée, nuit étoilée
  'photo-1506744038136-46273834b3fb', // lac et forêt
  'photo-1470252649378-9c29740c9fa8', // aube sur les montagnes
  'photo-1493246507139-91e8fad9978e', // désert, dunes
  'photo-1454391304352-2bf4678b1a7a', // route de campagne
  'photo-1508739773434-c26b3d09e071', // lac paisible
  'photo-1502082553048-f009c37129b9', // forêt verticale
  'photo-1520962880247-cfaf541c8724', // ciel étoilé
  'photo-1477601263568-180e2c6d046e', // aurore
  'photo-1416879595882-3373a0480b5b', // pins et brume
  'photo-1445264718234-a623be589d37', // vagues
  'photo-1490730141103-6cac27aaab94', // champ doré au soleil
  'photo-1500534314209-a25ddb2bd429', // sommet nuageux
  'photo-1421789665209-c9b2a435e3dc', // lever de soleil sur l'eau
  'photo-1470770841072-f978cf4d019e', // lac alpin
  'photo-1476231682828-37e571bc172f', // forêt d'automne
  'photo-1523712999610-f77fbcfc3843', // canopée
  'photo-1447933601403-0c6688de566e', // ciel et nuages
  'photo-1458668383970-8ddd3927deed', // montagnes bleutées
  'photo-1462400362591-9ca55235346a', // horizon marin
  'photo-1486728297118-82a07bc48a28', // vallée au lever du jour
  'photo-1497436072909-60f360e1d4b1', // rivière en montagne
  'photo-1418065460487-3e41a6c84dc5', // plaine, lumière rasante
  'photo-1504198453319-5ce911bafcde', // brume matinale
  'photo-1511884642898-4c92249e20b6' // mer calme, ciel pastel
]

async function fetchOne(id, index) {
  // `w` généreux à la source : on recadre nous-mêmes ensuite avec sharp.
  const url = `https://images.unsplash.com/${id}?w=1400&q=80&fm=jpg&fit=max`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())

  const name = `bg-${String(index + 1).padStart(2, '0')}.webp`
  const out = await sharp(buf)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
    .webp({ quality: QUALITY })
    .toBuffer()

  await writeFile(path.join(OUT_DIR, name), out)
  return { name, kb: Math.round(out.length / 1024) }
}

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  // Dédoublonnage : la liste est maintenue à la main, une répétition est vite
  // arrivée et gaspillerait de la place pour une image déjà présente.
  const ids = [...new Set(PHOTO_IDS)]
  if (ids.length !== PHOTO_IDS.length) {
    console.log(`(${PHOTO_IDS.length - ids.length} doublon(s) ignoré(s))`)
  }

  let total = 0
  let ok = 0
  for (const [i, id] of ids.entries()) {
    try {
      const { name, kb } = await fetchOne(id, i)
      total += kb
      ok++
      console.log(`✓ ${name}  ${kb} Ko`)
    } catch (e) {
      // On continue : une photo retirée d'Unsplash ne doit pas tout arrêter.
      console.warn(`✗ ${id} — ${e.message}`)
    }
  }

  const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith('.webp'))
  console.log(`\n${ok}/${ids.length} téléchargées · ${files.length} fichiers · ${(total / 1024).toFixed(1)} Mo`)
  console.log('\n⚠️  Ouvre src/assets/backgrounds/ et supprime les images qui ne conviennent pas.')
}

main()
