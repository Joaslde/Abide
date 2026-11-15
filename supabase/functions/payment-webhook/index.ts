// Edge Function : payment-webhook
// Reçoit les webhooks RevenueCat (achat, renouvellement, annulation, expiration,
// remboursement, problème de facturation, transfert…) et met à jour le premium.
//
// SEUL chemin, avec premium-sync, qui écrit le statut payé (SECURITY.md §5).
//
// Sécurité :
//   1. Authentification : RevenueCat envoie l'en-tête Authorization configuré
//      dans son tableau de bord ; on le compare au secret REVENUECAT_WEBHOOK_AUTH
//      (comparaison à temps constant). Sinon → 401, rien n'est traité.
//   2. On ne croit PAS le contenu de l'événement : il sert seulement à savoir
//      QUELS utilisateurs relire. L'état réel est redemandé à l'API RevenueCat
//      (voir _shared/premium-sync.ts).
//   3. Idempotence : chaque événement est journalisé une seule fois
//      (payment_events.event_id unique) et le recalcul part de l'état actuel,
//      donc un webhook reçu 2 fois ne double rien.
//   4. Réponse 5xx en cas d'échec → RevenueCat réessaie plus tard.
//
// Déploiement : SANS vérification JWT (RevenueCat n'a pas de jeton Supabase) :
//   npx supabase functions deploy payment-webhook --no-verify-jwt --project-ref ...
//
// Secrets requis :
//   REVENUECAT_WEBHOOK_AUTH     valeur exacte de l'en-tête Authorization du webhook
//   REVENUECAT_SECRET_API_KEY   (voir _shared/premium-sync.ts)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { syncUserPremium, UUID_RE } from '../_shared/premium-sync.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

/** Comparaison à temps constant (évite de deviner le secret caractère par caractère). */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const x = enc.encode(a)
  const y = enc.encode(b)
  let diff = x.length ^ y.length
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  }
  return diff === 0
}

/** Tous les identifiants concernés par un événement (y compris un transfert). */
function userIdsOf(event: Record<string, unknown>): string[] {
  const ids = new Set<string>()
  const add = (v: unknown) => {
    if (typeof v === 'string' && UUID_RE.test(v)) ids.add(v.toLowerCase())
  }
  add(event.app_user_id)
  add(event.original_app_user_id)
  for (const key of ['aliases', 'transferred_from', 'transferred_to']) {
    const list = event[key]
    if (Array.isArray(list)) list.forEach(add)
  }
  // Les identifiants anonymes RevenueCat ($RCAnonymousID:...) sont ignorés :
  // un achat n'est possible qu'une fois connecté (l'app appelle logIn avec l'id Supabase).
  return [...ids]
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const expected = Deno.env.get('REVENUECAT_WEBHOOK_AUTH') ?? ''
  const received = req.headers.get('Authorization') ?? ''
  if (!expected || !safeEqual(received, expected)) {
    return json({ error: 'unauthorized' }, 401)
  }

  let event: Record<string, unknown>
  try {
    const body = await req.json()
    event = body?.event
    if (!event || typeof event !== 'object' || typeof event.id !== 'string' || typeof event.type !== 'string') {
      return json({ error: 'bad_request' }, 400)
    }
  } catch {
    return json({ error: 'bad_request' }, 400)
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Journal d'audit (une ligne par événement, doublons ignorés).
  const { error: logError } = await admin.from('payment_events').upsert(
    {
      event_id: event.id,
      app_user_id: typeof event.app_user_id === 'string' ? event.app_user_id : null,
      type: event.type,
      environment: typeof event.environment === 'string' ? event.environment : null,
      payload: event
    },
    { onConflict: 'event_id', ignoreDuplicates: true }
  )
  if (logError) console.error('payment-webhook: journal', logError.message)

  // Événement de test envoyé depuis le tableau de bord RevenueCat.
  if (event.type === 'TEST') return json({ ok: true, test: true })

  try {
    for (const userId of userIdsOf(event)) {
      await syncUserPremium(admin, userId)
    }
    return json({ ok: true })
  } catch (e) {
    console.error('payment-webhook: échec de synchronisation', event.type, String(e))
    return json({ error: 'sync_failed' }, 500)
  }
})
