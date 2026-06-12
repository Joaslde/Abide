-- Migration 005 : Journal de prières
-- Dépendances : 001_profiles.sql

CREATE TABLE prayers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMPTZ,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER prayers_updated_at
  BEFORE UPDATE ON prayers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index pour la liste de prières (tri par date)
CREATE INDEX prayers_user_idx ON prayers (user_id, created_at DESC);

-- RLS
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur gère ses prières"
  ON prayers FOR ALL
  USING (auth.uid() = user_id);
