/**
 * Télécharge et optimise les VIGNETTES des plans de lecture.
 *
 *   node scripts/fetch-plan-thumbs.js
 *
 * Source : Unsplash (licence gratuite, usage commercial autorisé, sans
 * attribution obligatoire — https://unsplash.com/license).
 *
 * Contrairement aux fonds du « Verset du jour » (paysages génériques), ces
 * images sont DESCRIPTIVES : chacune doit évoquer le thème de son plan
 * (anxiété, deuil, pardon, prière…). Elles sont affichées en petite vignette
 * CARRÉE (~64 pt) à gauche du titre dans l'écran de choix des plans, et sur
 * l'accueil pour le plan en cours.
 *
 * POIDS : 220×220 en WebP q70 ≈ 8-15 Ko/image → 13 images ≈ 150 Ko bundlés.
 * Négligeable, et 100 % offline (aucun appel réseau à l'affichage).
 *
 * ⚠️ REVUE HUMAINE OBLIGATOIRE : le script ne peut pas juger du CONTENU des
 * photos. Après exécution, ouvrir src/assets/plans/ et vérifier que chaque
 * image correspond bien à son thème et convient au ton pastoral de l'app
 * (pas d'image choquante, pas de visage trop identifiable, rien d'ambigu).
 * Pour remplacer une image : trouver une photo sur unsplash.com, copier l'id
 * de son URL (partie « photo-xxxxxxxx »), le coller ci-dessous, relancer.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'plans')

// Vignette carrée. 220 px = ~2× la taille d'affichage (64 pt) sur écran dense.
const SIZE = 220
const QUALITY = 70

/**
 * id du plan (= presetPlans.js) → photo Unsplash évoquant le thème.
 * Le commentaire décrit ce que l'image DEVRAIT montrer : il sert de repère
 * lors de la revue visuelle, et de consigne si l'image doit être remplacée.
 */
const PLAN_PHOTOS = {
  // — Parcours bibliques —
  // ⚠️ know-jesus / life-of-david / women-of-the-bible : aucune photo libre
  // vraiment ILLUSTRATIVE trouvée (croix, berger, figure féminine) sans tomber
  // sur du hors-sujet. On retombe volontairement sur des paysages ÉVOCATEURS et
  // déjà validés (mêmes ids que scripts/fetch-verse-backgrounds.js) plutôt que
  // sur une image fausse. À améliorer si de meilleures photos sont trouvées.
  'know-jesus': 'photo-1470252649378-9c29740c9fa8',        // aube sur les montagnes (la lumière qui se lève)
  'life-of-david': 'photo-1426604966848-d7adac402bff',     // vallée verdoyante (pays du berger)
  'parables-of-jesus': 'photo-1500382017468-9049fed747ef', // champ de blé (le semeur) ✔ vérifié
  'women-of-the-bible': 'photo-1490750967868-88aa4486c946', // champ de fleurs, lumière douce
  'creation-to-covenant': 'photo-1419242902214-272b3f66ee7a', // voie lactée (« compte les étoiles ») ✔ vérifié

  // — Thèmes de vie —
  'peace-over-anxiety': 'photo-1473186578172-c141e6798cf4', // chaises face à la mer, calme ✔ vérifié
  'grief-and-comfort': 'photo-1494972308805-463bc619d34e',  // roses (recueillement) ✔ vérifié
  'path-of-forgiveness': 'photo-1490578474895-699cd4e2cf59', // amis assis côte à côte, de dos ✔ vérifié
  'identity-in-christ': 'photo-1499209974431-9dddcece7f88',  // bras ouverts au soleil levant ✔ vérifié

  // — Disciplines spirituelles —
  'learn-to-pray': 'photo-1478147427282-58a87a120781',      // mains levées dans la lumière ✔ vérifié
  'cultivating-gratitude': 'photo-1490730141103-6cac27aaab94', // silhouette bras ouverts, plage ✔ vérifié
  'study-the-bible': 'photo-1504052434569-70ad5836ab65',    // Bible ouverte, lecture ✔ vérifié
  'hearing-gods-voice': 'photo-1476231682828-37e571bc172f'  // chemin en forêt vue du ciel ✔ vérifié
}

async function fetchOne(planId, photoId) {
  const url = `https://images.unsplash.com/${photoId}?w=800&q=80&fm=jpg&fit=max`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())

  const name = `${planId}.webp`
  const out = await sharp(buf)
    // `attention` recadre sur la zone visuellement la plus saillante : sur un
    // carré serré, c'est ce qui garde le sujet plutôt qu'un coin vide.
    .resize(SIZE, SIZE, { fit: 'cover', position: 'attention' })
    .webp({ quality: QUALITY })
    .toBuffer()

  await writeFile(path.join(OUT_DIR, name), out)
  return { name, kb: Math.round(out.length / 1024) }
}

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  let total = 0
  let ok = 0
  const failed = []
  for (const [planId, photoId] of Object.entries(PLAN_PHOTOS)) {
    try {
      const { name, kb } = await fetchOne(planId, photoId)
      total += kb
      ok++
      console.log(`✓ ${name}  ${kb} Ko`)
    } catch (e) {
      // Une photo retirée d'Unsplash ne doit pas interrompre le reste.
      failed.push(planId)
      console.warn(`✗ ${planId} (${photoId}) — ${e.message}`)
    }
  }

  console.log(`\n${ok}/${Object.keys(PLAN_PHOTOS).length} téléchargées · ${total} Ko`)
  if (failed.length) {
    console.log(`\n⚠️  À corriger (id introuvable) : ${failed.join(', ')}`)
  }
  console.log('\n⚠️  REVUE VISUELLE : ouvre src/assets/plans/ et vérifie que chaque')
  console.log('   image correspond à son thème. Remplace les ids qui ne vont pas.')
}

main()
