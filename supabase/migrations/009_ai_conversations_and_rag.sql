-- 009_ai_conversations_and_rag.sql
-- Guide IA (L'Ancre) : conversations enregistrées + recherche vectorielle (RAG).
-- Appliquée via MCP le 2026-07-07.

-- 1. Redimensionner l'embedding pour Hugging Face (768 dims au lieu d'OpenAI 1536).
--    La table bible_embeddings est vide → aucun risque de perte de données.
--    Modèle : sentence-transformers/paraphrase-multilingual-mpnet-base-v2 (multilingue FR/EN).
ALTER TABLE bible_embeddings ALTER COLUMN embedding TYPE vector(768);

-- 2. Conversations + messages (sessions de discussion IA, une par conversation).
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nouvelle discussion',
  mode TEXT DEFAULT 'enseignement' CHECK (mode IN ('enseignement','predication','meditation','theologie')),
  summary TEXT,                    -- mémoire compressée de l'historique ancien
  summarized_upto INT DEFAULT 0,   -- nb de messages déjà résumés dans summary
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  verse_refs JSONB,                -- versets cités par le RAG (affichage "sources")
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ai_messages_conv ON ai_messages(conversation_id, created_at);

-- RLS : chacun n'accède qu'à SES conversations/messages.
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_messages" ON ai_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);

-- 3. Recherche vectorielle (RAG) : top match_count versets les plus proches en sens.
CREATE OR REPLACE FUNCTION match_bible_embeddings(query_embedding vector(768), match_count int)
RETURNS TABLE (book text, chapter int, verse int, text text, similarity float)
LANGUAGE sql STABLE AS $$
  SELECT book, chapter, verse, text, 1 - (embedding <=> query_embedding) AS similarity
  FROM bible_embeddings
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
