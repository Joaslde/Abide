// Edge Function : referral-get-code
// Retourne le code de parrainage de l'utilisateur authentifié, en le générant
// à la première demande (idempotent : un utilisateur garde toujours le même code).
//
// Centralisé côté serveur (plutôt qu'un simple update() client) pour gérer
// proprement les collisions UNIQUE avec retry, sans course entre deux appels
// client concurrents.
//
// Secrets requis (déjà présents pour ai-chat / delete-account) :
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sans 0/O/1/I (ambiguïté visuelle)
const CODE_LEN = 6
const MAX_RETRIES = 5

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  })
}

function randomCode(): string {
  let out = ''
  for (let i = 0; i < CODE_LEN; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: userData } = await userClient.auth.getUser()
    const user = userData?.user
    if (!user) return json({ error: 'unauthorized' }, 401)

    const admin = createClient(supabaseUrl, serviceKey)

    const { data: profile } = await admin
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.referral_code) {
      return json({ referralCode: profile.referral_code })
    }

    // Génération avec retry en cas de collision (contrainte UNIQUE).
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const code = randomCode()
      const { error } = await admin
        .from('profiles')
        .update({ referral_code: code })
        .eq('id', user.id)

      if (!error) return json({ referralCode: code })
      if (error.code !== '23505') {
        console.error('referral-get-code: échec update', error.message)
        return json({ error: 'generation_failed' }, 500)
      }
      // 23505 = collision de code → on retente avec un nouveau code aléatoire.
    }

    return json({ error: 'generation_failed' }, 500)
  } catch (e) {
    console.error('referral-get-code: exception', e)
    return json({ error: 'internal_error' }, 500)
  }
})
