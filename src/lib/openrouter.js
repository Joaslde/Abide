/**
 * Ce fichier est réservé à la documentation de l'interface OpenRouter.
 * Les appels LLM se font via l'Edge Function Supabase `ai-chat` — jamais côté client.
 * La clé OpenRouter n'est JAMAIS exposée au client.
 *
 * Ce module peut être utilisé pour des scripts Node.js côté développement uniquement.
 */

export const OPENROUTER_MODELS = {
  fast: 'openai/gpt-4o-mini',
  balanced: 'google/gemini-flash-1.5'
}
