// Logique partagée par payment-webhook et premium-sync.
//
// Principe (SECURITY.md §5) : on ne fait JAMAIS confiance au contenu d'un
// webhook ni à l'app pour décider du premium. On redemande l'état réel de
// l'abonnement à l'API REST de RevenueCat (qui a elle-même validé l'achat
// auprès de Google Play), puis on l'enregistre. C'est un recalcul COMPLET à
// partir de l'état actuel : rejouer 2 fois le même événement donne le même
// résultat (idempotent par construction).
//
// Secrets requis :
//   REVENUECAT_SECRET_API_KEY  clé secrète v1 du projet RevenueCat (sk_...)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

/** Identifiant de l'entitlement configuré dans RevenueCat. */
export const ENTITLEMENT_ID = 'premium'

/** L'identifiant RevenueCat d'un utilisateur Abide = son id Supabase (UUID). */
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Un entitlement sans date de fin (achat à vie) n'est pas vendu par Abide ;
// s'il apparaissait, on le borne loin plutôt que de le perdre.
const NO_EXPIRY_FALLBACK = '2100-01-01T00:00:00Z'

export interface PremiumState {
  premium: boolean
  expires: string | null
}

/**
 * Relit l'abonnement d'un utilisateur chez RevenueCat, l'enregistre dans
 * `subscriptions`, puis recalcule son statut dans `profiles`.
 * Lève une erreur si RevenueCat ne répond pas : l'appelant renvoie alors 5xx
 * (RevenueCat réessaiera le webhook).
 */
export async function syncUserPremium(admin: SupabaseClient, userId: string): Promise<PremiumState> {
  if (!UUID_RE.test(userId)) throw new Error('invalid_user_id')

  const apiKey = Deno.env.get('REVENUECAT_SECRET_API_KEY')
  if (!apiKey) throw new Error('missing_revenuecat_key')

  const res = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } }
  )
  if (!res.ok) throw new Error(`revenuecat_http_${res.status}`)

  const body = await res.json()
  const subscriber = body?.subscriber ?? {}
  const entitlement = subscriber.entitlements?.[ENTITLEMENT_ID]

  let entitlementExpires: string | null = null
  let productId: string | null = null
  let store: string | null = null
  let willRenew: boolean | null = null

  if (entitlement) {
    productId = entitlement.product_identifier ?? null
    const expiresDate: string = entitlement.expires_date ?? NO_EXPIRY_FALLBACK
    entitlementExpires = expiresDate
    const sub = productId ? subscriber.subscriptions?.[productId] : null
    store = sub?.store ?? null
    // Remboursé : l'accès s'arrête à la date du remboursement, quoi qu'indique
    // l'entitlement (sécurité supplémentaire, RevenueCat l'expire normalement).
    if (sub?.refunded_at && new Date(sub.refunded_at) < new Date(expiresDate)) {
      entitlementExpires = sub.refunded_at
    }
    willRenew = sub ? !sub.unsubscribe_detected_at && !sub.billing_issues_detected_at : null
  }

  const { error: upsertError } = await admin.from('subscriptions').upsert({
    user_id: userId,
    entitlement_expires: entitlementExpires,
    product_id: productId,
    store,
    will_renew: willRenew,
    updated_at: new Date().toISOString()
  })
  // 23503 = clé étrangère : aucun profil Abide pour cet identifiant, rien à mettre à jour.
  if (upsertError?.code === '23503') return { premium: false, expires: null }
  if (upsertError) throw new Error(`subscriptions_upsert: ${upsertError.message}`)

  const { error: rpcError } = await admin.rpc('recompute_premium', { p_user_id: userId })
  if (rpcError) throw new Error(`recompute_premium: ${rpcError.message}`)

  const { data: profile } = await admin
    .from('profiles')
    .select('premium_expires')
    .eq('id', userId)
    .maybeSingle()

  const expires = profile?.premium_expires ?? null
  return { premium: !!expires && new Date(expires) > new Date(), expires }
}
