// Edge Function : referral-attribute
// Enregistre l'attribution d'un filleul à son parrain, puis recalcule le palier
// de récompense du parrain (SECURITY.md §5 : le client ne décide jamais du premium).
//
// Appelée UNE FOIS par le client, juste après la création de compte du FILLEUL,
// si un code de parrainage a été reçu par AppsFlyer au premier lancement.
//
// Règles (cf. SECURITY.md + pattern delete-account/index.ts) :
//   1. L'identité du FILLEUL vient EXCLUSIVEMENT du JWT — jamais du body.
//   2. Le code de parrainage est un input hostile : validé par whitelist de format.
//   3. Idempotent : un même filleul déjà attribué (contrainte UNIQUE referred_id)
//      → no-op silencieux, pas d'erreur.
//   4. Auto-parrainage refusé.
//   5. is_premium/premium_expires/premium_source ne sont modifiés que via le
//      client service_role (le trigger protect_premium_columns bloque le reste).
//
// Secrets requis (déjà présents pour ai-chat / delete-account) :
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Paliers de récompense : [nombre de filleuls requis, jours de premium accordés].
// Codés en dur côté serveur — jamais transmis ni décidés par le client.
// Révisés le 2026-07-27 (les précédents : 5/10/15 → 7/14/30j étaient trop
// faciles à atteindre pour un vrai effort de croissance).
// ⚠️ Doivent rester alignés avec TIERS dans src/views/plus/ReferralView.vue.
const TIERS: Array<[number, number]> = [
  [10, 10],
  [25, 30],
  [50, 90]
]

const CODE_RE = /^[A-Z0-9]{6,10}$/

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // — Auth : l'identité du filleul vient EXCLUSIVEMENT du JWT —
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: userData } = await userClient.auth.getUser()
    const referredUser = userData?.user
    if (!referredUser) return json({ error: 'unauthorized' }, 401)

    // — Input hostile : whitelist de format stricte —
    const body = await req.json()
    const referralCode = String(body?.referralCode ?? '').toUpperCase().trim()
    if (!CODE_RE.test(referralCode)) return json({ error: 'bad_request' }, 400)

    const admin = createClient(supabaseUrl, serviceKey)

    // — Retrouver le parrain par son code —
    const { data: referrer } = await admin
      .from('profiles')
      .select('id')
      .eq('referral_code', referralCode)
      .maybeSingle()

    if (!referrer) return json({ error: 'code_not_found' }, 404)
    if (referrer.id === referredUser.id) return json({ error: 'self_referral' }, 400)

    // — Enregistrer l'attribution (idempotent via UNIQUE referred_id) —
    const { error: insertError } = await admin
      .from('referrals')
      .insert({ referrer_id: referrer.id, referred_id: referredUser.id })

    if (insertError) {
      // Conflit = déjà attribué (referred_id UNIQUE) → no-op silencieux, pas une erreur.
      if (insertError.code === '23505') return json({ success: true, alreadyAttributed: true })
      console.error('referral-attribute: échec insertion', insertError.message)
      return json({ error: 'attribution_failed' }, 500)
    }

    // — Recalculer le palier du parrain (nouvelle attribution réussie) —
    await applyReferralTier(admin, referrer.id)

    return json({ success: true })
  } catch (e) {
    console.error('referral-attribute: exception', e)
    return json({ error: 'internal_error' }, 500)
  }
})

/**
 * Recalcule le palier atteint par un parrain et met à jour son premium si besoin.
 * Idempotent : peut être rappelée sans dupliquer d'effet (recalcul complet, pas
 * d'incrément). Ne raccourcit JAMAIS un premium existant plus lointain (payé ou non).
 */
async function applyReferralTier(admin: ReturnType<typeof createClient>, referrerId: string) {
  const { count } = await admin
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', referrerId)

  const referralCount = count ?? 0

  // Palier le plus haut atteint (TIERS est croissant).
  let daysGranted = 0
  for (const [threshold, days] of TIERS) {
    if (referralCount >= threshold) daysGranted = days
  }
  if (daysGranted === 0) return // aucun palier atteint, rien à faire

  const { data: profile } = await admin
    .from('profiles')
    .select('premium_expires')
    .eq('id', referrerId)
    .maybeSingle()

  const now = Date.now()
  const tierExpiry = now + daysGranted * 24 * 60 * 60 * 1000
  const existingExpiry = profile?.premium_expires ? new Date(profile.premium_expires).getTime() : 0

  // On garde toujours la date la plus lointaine (ne raccourcit jamais un premium
  // existant, payé ou issu d'un palier de parrainage précédent).
  const finalExpiry = Math.max(tierExpiry, existingExpiry)

  await admin
    .from('profiles')
    .update({
      is_premium: true,
      premium_expires: new Date(finalExpiry).toISOString(),
      // Ne change la source que si le palier de parrainage est celui qui a fixé
      // la date finale la plus lointaine (sinon on n'écrase pas un abonnement payé).
      ...(finalExpiry === tierExpiry ? { premium_source: 'referral' } : {})
    })
    .eq('id', referrerId)
}
