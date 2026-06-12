/**
 * KKiaPay SDK — Paiement Mobile Money + cartes locales (Android)
 * Initialisation et déclenchement du paiement.
 * Le statut premium est validé UNIQUEMENT via le webhook Supabase.
 */

export function initKKiaPay(onSuccess, onFailed, onClose) {
  const script = document.createElement('script')
  script.src = 'https://cdn.kkiapay.me/k.js'
  script.async = true
  document.head.appendChild(script)

  window.addKkiapayListener('success', onSuccess)
  window.addKkiapayListener('failed', onFailed)
  window.addKkiapayListener('close', onClose)
}

/**
 * @param {object} options
 * @param {number} options.amount - Montant en FCFA
 * @param {string} options.reason - Description du paiement
 * @param {string} options.name - Nom de l'utilisateur
 * @param {string} options.email - Email de l'utilisateur
 */
export function openKKiaPay({ amount, reason, name, email }) {
  const publicKey = import.meta.env.VITE_KKIAPAY_PUBLIC_KEY
  if (!publicKey) throw new Error('VITE_KKIAPAY_PUBLIC_KEY manquante')

  window.openKkiapayWidget({
    amount,
    reason,
    name,
    email,
    key: publicKey,
    sandbox: import.meta.env.DEV
  })
}
