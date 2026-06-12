/**
 * OpenAI TTS — Uniquement pour vocaliser les réponses du guide IA.
 * JAMAIS utilisé pour les textes bibliques (BibleBrain uniquement).
 * Les requêtes TTS passent par l'Edge Function Supabase pour cacher la clé.
 * Les fichiers générés sont mis en cache sur Cloudflare R2.
 */

import { supabase } from './supabase'

/**
 * @param {string} text - Le texte de la réponse IA à vocaliser
 * @returns {Promise<string>} URL audio (R2 ou data URL)
 */
export async function generateTTS(text) {
  const { data, error } = await supabase.functions.invoke('ai-tts', {
    body: { text }
  })
  if (error) throw error
  return data.audio_url
}
