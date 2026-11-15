// Edge Function : premium-sync
// Appelée par l'app juste après un achat ou un « Restaurer mes achats », pour
// que le premium s'active sans attendre le webhook (qui peut arriver avec
// quelques secondes de retard).
//
// Sécurité (SECURITY.md §5) : l'app ne déclare RIEN. L'identité vient
// EXCLUSIVEMENT du JWT, et l'état de l'abonnement est relu auprès de l'API
// RevenueCat, exactement comme pour le webhook. Appeler cette fonction sans
// avoir payé ne donne donc aucun premium.
//
// Secrets requis :
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
//   REVENUECAT_SECRET_API_KEY (voir _shared/premium-sync.ts)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { syncUserPremium } from '../_shared/premium-sync.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

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
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }
    })
    const { data: userData } = await userClient.auth.getUser()
    const user = userData?.user
    if (!user) return json({ error: 'unauthorized' }, 401)

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const state = await syncUserPremium(admin, user.id)
    return json(state)
  } catch (e) {
    console.error('premium-sync: exception', String(e))
    return json({ error: 'sync_failed' }, 500)
  }
})
