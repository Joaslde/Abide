// Edge Function : delete-account
// Suppression RGPD du compte de l'utilisateur AUTHENTIFIÉ (SECURITY.md §"Suppression de compte").
//
// Règles :
//   1. Identité confirmée côté serveur : on n'accepte QUE le user du JWT — jamais
//      un id passé par le client (le service_role bypasse le RLS, cf. SECURITY.md
//      §"Le piège service_role").
//   2. Suppression RÉELLE, pas un flag "deleted" : on efface les données applicatives
//      de l'utilisateur puis le compte auth lui-même (auth.admin.deleteUser).
//   3. Les données strictement LOCALES (user-db : surlignages, notes, prières hors
//      ligne, progression) vivent sur l'appareil — le client les efface de son côté
//      après le succès de cette fonction.
//
// Secrets requis (déjà présents pour ai-chat) :
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // — Auth : l'identité vient EXCLUSIVEMENT du JWT (jamais du body) —
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: userData } = await userClient.auth.getUser()
    const user = userData?.user
    if (!user) return json({ error: 'unauthorized' }, 401)

    const admin = createClient(supabaseUrl, serviceKey)
    const uid = user.id

    // — 1. Supprimer la ligne profiles (id = auth uid). Toutes les tables de
    //   données (ai_conversations→ai_messages, ai_sessions, prayers, reading_plans,
    //   reading_progress, streaks) ont une FK ON DELETE CASCADE vers profiles :
    //   cette seule suppression efface donc TOUTES les données applicatives. —
    const { error: profileError } = await admin.from('profiles').delete().eq('id', uid)
    if (profileError) {
      console.error('delete-account: échec suppression profiles', profileError.message)
      return json({ error: 'delete_failed' }, 500)
    }

    // — 2. Supprimer RÉELLEMENT le compte auth (profiles n'a PAS de FK vers
    //   auth.users → il faut le faire explicitement). Dernier car irréversible. —
    const { error: authError } = await admin.auth.admin.deleteUser(uid)
    if (authError) {
      console.error('delete-account: échec deleteUser', authError.message)
      return json({ error: 'auth_delete_failed' }, 500)
    }

    return json({ success: true })
  } catch (e) {
    console.error('delete-account: exception', e)
    return json({ error: 'internal_error' }, 500)
  }
})
