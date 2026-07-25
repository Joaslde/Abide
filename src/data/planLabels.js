/**
 * Libellés d'affichage des plans (clés i18n).
 * Les plans profil/préétablis portent leur propre `title` (clé i18n).
 * Les plans custom n'ont pas de titre → on dérive un libellé de leur portée.
 */
export function scopeLabelKey(scope) {
  switch (scope) {
    case 'full': return 'plan.scopes.full'
    case 'ot': return 'plan.scopes.ot'
    case 'nt': return 'plan.scopes.nt'
    case 'psalms': return 'plan.scopes.psalms'
    case 'book': return 'plan.scopes.book'
    case 'preset': return 'plan.title'
    default: return 'plan.title'
  }
}
