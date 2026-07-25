import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

/**
 * Guide IA (L'Ancre) — conversations enregistrées + chat via Edge Function.
 *
 * Le chat (OpenRouter) et le RAG (recherche de versets) vivent dans l'Edge
 * Function `ai-chat` : le client n'appelle JAMAIS OpenRouter/HF directement
 * (aucune clé côté client — SECURITY.md). Les conversations/messages sont dans
 * Supabase (tables ai_conversations / ai_messages, RLS par utilisateur).
 *
 * ⚠️ Le compteur de sessions (quota gratuit/premium) n'est PAS encore branché
 * (lot « limites/paiement » à venir).
 */
export const useAIStore = defineStore('ai', () => {
  const conversations = ref([]) // liste résumée (sans les messages)
  const activeId = ref(null)
  const messages = ref([]) // messages de la conversation active
  const mode = ref('enseignement')
  const loading = ref(false) // envoi d'un message en cours
  const sending = ref(false)

  const activeConversation = computed(
    () => conversations.value.find((c) => c.id === activeId.value) ?? null
  )

  /** Liste des conversations de l'utilisateur (plus récentes d'abord). */
  async function loadConversations() {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('id, title, mode, updated_at')
      .order('updated_at', { ascending: false })
    if (!error) conversations.value = data ?? []
  }

  /** Crée une nouvelle conversation et la rend active. Retourne son id. */
  async function createConversation(newMode = 'enseignement') {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ mode: newMode })
      .select('id, title, mode, updated_at')
      .single()
    if (error) throw error
    conversations.value = [data, ...conversations.value]
    activeId.value = data.id
    messages.value = []
    mode.value = newMode
    return data.id
  }

  /**
   * Prépare une NOUVELLE discussion « vierge » sans encore créer la ligne en base
   * (elle sera créée au 1er message envoyé). Évite d'accumuler des conversations
   * vides si l'utilisateur ouvre le chat sans écrire.
   */
  function startDraft(newMode = 'enseignement') {
    activeId.value = null
    messages.value = []
    mode.value = newMode
  }

  /** Ouvre une conversation existante et charge ses messages. */
  async function openConversation(id) {
    activeId.value = id
    messages.value = []
    const { data, error } = await supabase
      .from('ai_messages')
      .select('id, role, content, verse_refs, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
    if (!error) {
      // Filet pour les anciennes conversations où question + réponse partagent le
      // MÊME created_at : à égalité, l'utilisateur passe toujours avant l'IA.
      messages.value = (data ?? []).sort((a, b) => {
        if (a.created_at !== b.created_at) return a.created_at < b.created_at ? -1 : 1
        if (a.role === b.role) return 0
        return a.role === 'user' ? -1 : 1
      })
    }
    const conv = conversations.value.find((c) => c.id === id)
    if (conv) mode.value = conv.mode
  }

  /** Renomme une conversation. */
  async function renameConversation(id, title) {
    const clean = (title ?? '').trim()
    if (!clean) return
    const { error } = await supabase
      .from('ai_conversations')
      .update({ title: clean })
      .eq('id', id)
    if (error) throw error
    const conv = conversations.value.find((c) => c.id === id)
    if (conv) conv.title = clean
  }

  /**
   * Modifie un message utilisateur déjà envoyé et relance la réponse de l'IA.
   * On supprime en base ce message ET tout ce qui suit (la réponse devient
   * caduque), puis on renvoie le nouveau texte.
   */
  async function editLastUserMessage(messageId, newText) {
    const clean = (newText ?? '').trim()
    if (!clean || !activeId.value || sending.value) return
    const idx = messages.value.findIndex((m) => m.id === messageId)
    if (idx < 0) return

    // Supprimer en base les messages persistés à partir de celui-ci.
    const toDelete = messages.value.slice(idx).map((m) => m.id).filter((id) => !String(id).startsWith('tmp-'))
    if (toDelete.length) {
      await supabase.from('ai_messages').delete().in('id', toDelete)
    }
    // Retirer localement, puis renvoyer le message corrigé.
    messages.value = messages.value.slice(0, idx)
    await sendMessage(clean)
  }

  /**
   * Régénère la DERNIÈRE réponse de l'IA : on supprime cette réponse et on
   * repose la même question. Utile quand la réponse ne convient pas.
   */
  async function regenerateLast() {
    if (!activeId.value || sending.value) return
    const msgs = messages.value
    const lastAiIdx = msgs.map((m) => m.role).lastIndexOf('assistant')
    if (lastAiIdx < 0) return
    // La question qui a produit cette réponse.
    const lastUser = [...msgs.slice(0, lastAiIdx)].reverse().find((m) => m.role === 'user')
    if (!lastUser) return

    // Supprime la réponse (et tout ce qui suit) en base puis localement.
    const toDelete = msgs.slice(lastAiIdx).map((m) => m.id).filter((id) => !String(id).startsWith('tmp-'))
    if (toDelete.length) await supabase.from('ai_messages').delete().in('id', toDelete)
    messages.value = msgs.slice(0, lastAiIdx)

    // On repose la question : sendMessage réinsère le message user → on retire
    // d'abord l'ancien pour éviter le doublon.
    const userIdx = messages.value.findIndex((m) => m.id === lastUser.id)
    if (userIdx >= 0) {
      const userIds = [lastUser.id].filter((id) => !String(id).startsWith('tmp-'))
      if (userIds.length) await supabase.from('ai_messages').delete().in('id', userIds)
      messages.value = messages.value.slice(0, userIdx)
    }
    await sendMessage(lastUser.content)
  }

  /** Supprime une conversation (cascade sur ses messages). */
  async function deleteConversation(id) {
    await supabase.from('ai_conversations').delete().eq('id', id)
    conversations.value = conversations.value.filter((c) => c.id !== id)
    if (activeId.value === id) {
      activeId.value = null
      messages.value = []
    }
  }

  /**
   * Envoie un message : l'affiche immédiatement (optimiste), appelle l'Edge
   * Function ai-chat, puis affiche la réponse. Le serveur persiste les 2
   * messages (on recharge donc depuis la base pour avoir les ids/verse_refs).
   */
  async function sendMessage(text) {
    const content = (text ?? '').trim()
    if (!content || sending.value) return
    sending.value = true
    // Brouillon (pas encore de conversation en base) → on la crée maintenant.
    if (!activeId.value) {
      try {
        await createConversation(mode.value)
      } catch {
        sending.value = false
        throw new Error('create_failed')
      }
    }
    // Affichage optimiste du message utilisateur + bulle « … » de l'IA.
    messages.value.push({ id: `tmp-u-${Date.now()}`, role: 'user', content })
    loading.value = true
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { conversationId: activeId.value, message: content, mode: mode.value }
      })
      if (error || data?.error) throw error || new Error(data.error)
      messages.value.push({
        id: `tmp-a-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        verse_refs: data.verseRefs ?? []
      })
      // Le titre a pu être auto-généré au 1er échange → rafraîchir la liste.
      await loadConversations()
    } finally {
      loading.value = false
      sending.value = false
    }
  }

  function setMode(m) {
    mode.value = m
  }

  return {
    conversations,
    activeId,
    messages,
    mode,
    loading,
    sending,
    activeConversation,
    loadConversations,
    createConversation,
    startDraft,
    openConversation,
    deleteConversation,
    renameConversation,
    sendMessage,
    editLastUserMessage,
    regenerateLast,
    setMode
  }
})
