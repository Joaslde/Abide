// Edge Function : quiz-chapter
// Génère un QCM de 5 questions sur un chapitre biblique précis, pour le quiz de
// fin de chapitre (L'Ancre). Architecture :
//   1. Auth (JWT) obligatoire
//   2. Validation input (livre canonique connu + chapitre valide)
//   3. On lit le VRAI texte du chapitre depuis bible_embeddings (source de vérité)
//      → l'IA travaille sur le texte réel, pas sa mémoire → zéro hallucination
//   4. OpenRouter renvoie un JSON strict : 5 questions × 4 options × 1 bonne réponse
//   5. Validation STRICTE du JSON (tout output LLM est hostile — SECURITY.md §6)
//
// QUOTA (2026-07-25) : quota quotidien de quiz vérifié AVANT tout appel LLM
//    (colonnes ai_sessions.quiz_used / quiz_limit, compteur SÉPARÉ du Guide).
//    Premium (parrainage aujourd'hui, paiement plus tard) → illimité.
// ⚠️ Ancien TODO(limites) levé.
//    (phase de test illimitée, comme ai-chat). À brancher AVANT tout déploiement
//    public (cf. SECURITY.md §4).
//
// Secrets requis : OPENROUTER_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const CHAT_MODEL = 'openai/gpt-4o-mini' // modèle éco (SECURITY.md §12)
const QUESTION_COUNT = 5
const OPTION_COUNT = 4
const MAX_TOKENS = 1400 // 5 questions structurées
// Repli si la création de la ligne ai_sessions échoue : la VRAIE limite vit en base
// (DEFAULT de ai_sessions.quiz_limit) et s'ajuste en SQL, sans redéploiement.
const DEFAULT_QUIZ_LIMIT = 5

/** Codes de livres canoniques valides (les 66 livres). Whitelist de l'input. */
const VALID_BOOKS = new Set([
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI',
  '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER',
  'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP',
  'HAG', 'ZEC', 'MAL', 'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL',
  'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE',
  '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
])

/** Appel chat OpenRouter, en imposant une réponse JSON. */
async function chatJson(messages: unknown[], orKey: string, maxTokens: number): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${orKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://abide.app',
      'X-Title': 'Abide'
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      max_tokens: maxTokens,
      // Température haute + top_p : force la variété d'un quiz à l'autre sur le
      // MÊME chapitre (sinon le modèle re-pose toujours les questions évidentes).
      temperature: 1.0,
      top_p: 0.95,
      response_format: { type: 'json_object' }
    })
  })
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

/**
 * Valide et NORMALISE le quiz produit par le LLM. Tout output LLM est hostile :
 * on n'accepte QUE la forme exacte attendue, sinon on rejette.
 * Retourne les questions nettoyées ({ question, options[4], correctIndex }) ou null.
 */
function validateQuiz(raw: unknown): Array<{ question: string; options: string[]; correctIndex: number }> | null {
  // Le LLM renvoie un objet { questions: [...] } (json_object impose un objet racine).
  const list = (raw as any)?.questions
  if (!Array.isArray(list) || list.length < QUESTION_COUNT) return null

  const out: Array<{ question: string; options: string[]; correctIndex: number }> = []
  for (const q of list.slice(0, QUESTION_COUNT)) {
    const question = typeof q?.question === 'string' ? q.question.trim() : ''
    const options = Array.isArray(q?.options)
      ? q.options.map((o: unknown) => (typeof o === 'string' ? o.trim() : '')).filter(Boolean)
      : []
    const correctIndex = Number(q?.correctIndex)
    if (
      !question ||
      options.length !== OPTION_COUNT ||
      !Number.isInteger(correctIndex) ||
      correctIndex < 0 ||
      correctIndex >= OPTION_COUNT
    ) {
      return null
    }
    out.push({ question, options, correctIndex })
  }
  return out.length === QUESTION_COUNT ? out : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const orKey = Deno.env.get('OPENROUTER_KEY')!
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // — Auth : on identifie l'utilisateur via son JWT —
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: userData } = await userClient.auth.getUser()
    const user = userData?.user
    if (!user) return json({ error: 'unauthorized' }, 401)

    // — Input (tout input client est hostile : SECURITY.md §6) —
    const body = await req.json()
    const bookId = String(body?.bookId ?? '').toUpperCase()
    const chapter = Number(body?.chapter)
    if (!VALID_BOOKS.has(bookId)) return json({ error: 'bad_request' }, 400)
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > 150) return json({ error: 'bad_request' }, 400)

    // service_role : lecture serveur (bible_embeddings = contenu public).
    const admin = createClient(supabaseUrl, serviceKey)

    // — QUOTA QUIZ QUOTIDIEN (avant TOUT appel LLM → un refus coûte 0) —
    // Compteur SÉPARÉ de celui du Guide (colonnes quiz_used/quiz_limit sur la
    // même ligne du jour) : épuiser ses quiz ne bloque pas le Guide, et inversement.
    // Premium actif (aujourd'hui obtenu par PARRAINAGE, demain par paiement) → illimité.
    const { data: profile } = await admin
      .from('profiles')
      .select('is_premium, premium_expires')
      .eq('id', user.id)
      .single()

    const premiumActive =
      profile?.is_premium === true &&
      (!profile.premium_expires || new Date(profile.premium_expires) > new Date())

    const today = new Date().toISOString().slice(0, 10)
    let quotaRow: { quiz_used: number; quiz_limit: number } | null = null

    if (!premiumActive) {
      const { data: existing } = await admin
        .from('ai_sessions')
        .select('quiz_used, quiz_limit')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

      if (existing) {
        quotaRow = existing
      } else {
        const { data: created } = await admin
          .from('ai_sessions')
          .insert({ user_id: user.id, date: today })
          .select('quiz_used, quiz_limit')
          .single()
        quotaRow = created ?? { quiz_used: 0, quiz_limit: DEFAULT_QUIZ_LIMIT }
      }

      if (quotaRow.quiz_used >= quotaRow.quiz_limit) {
        return json(
          { error: 'quota_exceeded', limit: quotaRow.quiz_limit, used: quotaRow.quiz_used },
          429
        )
      }
    }

    // — Texte réel du chapitre (source de vérité) —
    const { data: rows } = await admin
      .from('bible_embeddings')
      .select('verse, text')
      .eq('book', bookId)
      .eq('chapter', chapter)
      .order('verse', { ascending: true })

    if (!rows || rows.length === 0) return json({ error: 'chapter_not_found' }, 404)

    const chapterText = rows.map((r: any) => `${r.verse}. ${r.text}`).join('\n')

    // — Prompt : QCM en JSON strict —
    const sys = `Tu es un concepteur de quiz biblique pour une application de lecture. À partir du TEXTE EXACT d'un chapitre de la Bible (fourni ci-dessous), tu génères un QCM pour vérifier la compréhension de ce que la personne vient de lire.

RÈGLES ABSOLUES :
- Génère EXACTEMENT ${QUESTION_COUNT} questions.
- Chaque question a EXACTEMENT ${OPTION_COUNT} propositions de réponse, dont UNE SEULE correcte.
- Les questions portent UNIQUEMENT sur le contenu du chapitre fourni (faits, personnages, paroles, enchaînement, sens). N'invente RIEN qui ne soit dans le texte.
- Les mauvaises réponses (distracteurs) doivent être plausibles mais clairement fausses au regard du texte.
- Français clair, questions courtes, ton bienveillant. Pas de piège tordu.
- Ne cite pas les numéros de versets dans les questions (la personne teste sa mémoire du chapitre, pas sa capacité à retrouver un verset).

VARIÉTÉ (TRÈS IMPORTANT) — la personne peut REFAIRE le quiz plusieurs fois sur le même chapitre :
- À CHAQUE génération, produis des questions DIFFÉRENTES des quiz précédents possibles. Évite de reposer systématiquement les mêmes questions "évidentes".
- Puise dans des ANGLES variés : un fait précis, un personnage et son rôle, une parole/citation et qui la prononce, une cause et sa conséquence, l'ordre des événements, une intention ou un sens, un détail secondaire souvent négligé.
- Reformule, change les tournures, explore différentes parties du chapitre. Deux quiz du même chapitre ne doivent PAS se ressembler.
- Utilise la graine de variété ci-dessous pour choisir un angle d'attaque différent (ne la mentionne jamais dans les questions).

FORMAT DE SORTIE — un objet JSON STRICT, rien d'autre :
{
  "questions": [
    { "question": "…", "options": ["…","…","…","…"], "correctIndex": 0 }
  ]
}
"correctIndex" est l'index (0 à ${OPTION_COUNT - 1}) de la bonne réponse dans "options". Mélange la position de la bonne réponse d'une question à l'autre.`

    // Graine de variété : change à chaque appel → pousse le modèle vers un
    // angle différent quand la personne refait le quiz du même chapitre.
    const seed = Math.floor(Math.random() * 1_000_000)
    const usr = `Graine de variété (pour diversifier l'angle des questions, ne pas la citer) : ${seed}\n\nChapitre à quizzer (texte exact, verset par verset) :\n\n${chapterText}`

    const answer = await chatJson(
      [
        { role: 'system', content: sys },
        { role: 'user', content: usr }
      ],
      orKey,
      MAX_TOKENS
    )

    let parsed: unknown
    try {
      parsed = JSON.parse(answer)
    } catch {
      return json({ error: 'generation_failed' }, 502)
    }

    const questions = validateQuiz(parsed)
    if (!questions) return json({ error: 'generation_failed' }, 502)

    // — Consommation du quota : SEULEMENT ici, quiz valide en main. Les sorties
    //   `generation_failed` ci-dessus partent sans rien décompter : on ne fait
    //   jamais payer un échec de génération à l'utilisateur.
    let remaining: number | null = null
    if (!premiumActive && quotaRow) {
      const used = quotaRow.quiz_used + 1
      await admin
        .from('ai_sessions')
        .update({ quiz_used: used })
        .eq('user_id', user.id)
        .eq('date', today)
      remaining = Math.max(0, quotaRow.quiz_limit - used)
    }

    return json({ questions, remaining })
  } catch (_e) {
    // On ne fuit pas de détails techniques au client (SECURITY.md §9).
    return json({ error: 'server_error' }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  })
}
