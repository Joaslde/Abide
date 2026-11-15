/**
 * Règles d'emplacement des publicités : écrans où une pub ne doit JAMAIS
 * apparaître. Partagé par le routeur (déclenchement à la navigation) et par le
 * store des pubs (vérification au moment même de l'affichage).
 *
 * Pourquoi deux vérifications : une pub se CHARGE pendant une à trois secondes
 * avant de s'afficher. Vérifier seulement l'écran de départ laissait passer le
 * cas où l'utilisateur ouvrait un chapitre ou entrait dans l'onboarding pendant
 * le chargement : la pub s'affichait alors par-dessus (signalé le 2026-11-12).
 */
export const AD_PROTECTED_PREFIXES = [
  '/tabs/immersion/book/', // lecture d'un livre ou d'un chapitre (texte biblique)
  '/tabs/sanctuaire/moment', // prière guidée du matin/soir
  '/tabs/ancre', // Guide IA : pub gérée à l'ouverture, pas via la navigation
  '/premium', // écran Abide Plus : jamais de pub par-dessus l'offre sans pub
  '/auth', '/onboarding', '/welcome'
]

/** L'écran à ce chemin interdit-il les pubs ? */
export function isAdProtectedPath(path) {
  return AD_PROTECTED_PREFIXES.some((p) => String(path).startsWith(p))
}

/**
 * Chemin de l'écran affiché MAINTENANT (historique en hash : « #/tabs/home »).
 * Lu sur l'URL plutôt que via le routeur, pour éviter un import circulaire
 * routeur ↔ store des pubs.
 */
export function currentPath() {
  return (window.location.hash || '#/').slice(1)
}
