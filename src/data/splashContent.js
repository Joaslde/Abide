/**
 * Contenu du splash animé d'ouverture : pool d'animations Lottie + pool de
 * textes (versets / messages courts, contexte chrétien). À chaque ouverture,
 * on tire une paire (anim + texte) au hasard → variété maximale.
 *
 * Tout est bundlé → 100 % offline.
 */

import anim1 from '@/assets/lottie/splash/anim1.json'
import anim2 from '@/assets/lottie/splash/anim2.json'
import anim3 from '@/assets/lottie/splash/anim3.json'
import anim4 from '@/assets/lottie/splash/anim4.json'
import anim5 from '@/assets/lottie/splash/anim5.json'

export const SPLASH_ANIMATIONS = [anim1, anim2, anim3, anim4, anim5]

/** Messages du splash (fr + en). Courts, encourageants, spirituels. */
export const SPLASH_MESSAGES = {
  fr: [
    'Demeurez en moi, et je demeurerai en vous.',
    'Sa parole est une lampe à mes pieds.',
    'Nouveau jour, nouvelle grâce.',
    'Sois tranquille, et sache que je suis Dieu.',
    'Ses compassions se renouvellent chaque matin.',
    'Approche-toi de Dieu, et il s’approchera de toi.',
    'Que la paix de Christ règne dans ton cœur.',
    'Cherche premièrement le royaume de Dieu.',
    'Prends courage, il marche avec toi.',
    'Un temps pour écouter sa voix.'
  ],
  en: [
    'Abide in me, and I in you.',
    'Your word is a lamp to my feet.',
    'New day, new grace.',
    'Be still, and know that I am God.',
    'His mercies are new every morning.',
    'Draw near to God, and he will draw near to you.',
    'Let the peace of Christ rule in your heart.',
    'Seek first the kingdom of God.',
    'Take heart, he walks with you.',
    'A moment to hear his voice.'
  ]
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Tire une animation + un message (dans la langue donnée) au hasard. */
export function randomSplash(locale = 'fr') {
  const messages = SPLASH_MESSAGES[locale] ?? SPLASH_MESSAGES.fr
  return { animation: pick(SPLASH_ANIMATIONS), message: pick(messages) }
}
