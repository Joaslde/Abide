import { useAIStore } from '@/stores/ai'
import { supabase } from '@/lib/supabase'

export function useAI() {
  const store = useAIStore()

  async function sendMessage(message, passageRef = null) {
    if (!store.hasSessionsLeft) {
      throw new Error('daily_limit_reached')
    }

    store.addMessage('user', message)
    store.loading = true

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          mode: store.mode,
          passage_ref: passageRef
        }
      })

      if (error) throw error
      if (data.error === 'daily_limit_reached') throw new Error('daily_limit_reached')

      store.addMessage('assistant', data.text)
      return data
    } finally {
      store.loading = false
    }
  }

  return { store, sendMessage }
}
