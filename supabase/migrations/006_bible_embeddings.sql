-- Migration 006 : Embeddings bibliques pour le RAG du guide IA
-- Dépendances : Extension pgvector activée dans Supabase Dashboard
-- Extensions → pgvector → Enable

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE bible_embeddings (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version   TEXT NOT NULL DEFAULT 'LSG1910',
  book      TEXT NOT NULL,
  chapter   INT NOT NULL,
  verse     INT NOT NULL,
  text      TEXT NOT NULL,
  embedding VECTOR(1536),  -- Dimension OpenAI text-embedding-3-small
  UNIQUE (version, book, chapter, verse)
);

-- Index IVFFLAT pour la recherche vectorielle (pgvector)
-- À construire après insertion des données (script seed-embeddings.js)
CREATE INDEX bible_embeddings_ivfflat_idx
  ON bible_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RLS : lecture publique (pas de données sensibles, c'est le texte biblique)
ALTER TABLE bible_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des embeddings"
  ON bible_embeddings FOR SELECT
  TO authenticated
  USING (true);

-- Fonction de recherche vectorielle (appelée depuis l'Edge Function ai-chat)
CREATE OR REPLACE FUNCTION search_bible(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  bible_version TEXT DEFAULT 'LSG1910'
)
RETURNS TABLE (
  book    TEXT,
  chapter INT,
  verse   INT,
  text    TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    be.book,
    be.chapter,
    be.verse,
    be.text,
    1 - (be.embedding <=> query_embedding) AS similarity
  FROM bible_embeddings be
  WHERE be.version = bible_version
  ORDER BY be.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
