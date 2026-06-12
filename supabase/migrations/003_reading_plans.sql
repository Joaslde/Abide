-- Migration 003 : Plans de lecture
-- Dépendances : 001_profiles.sql

CREATE TABLE reading_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type   TEXT NOT NULL CHECK (plan_type IN ('7j', '30j', '90j', 'custom')),
  current_day INT DEFAULT 1,
  total_days  INT NOT NULL,
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
  schedule    JSONB NOT NULL
  -- schedule : [{day: 1, book_id: "GEN", chapter: 1}, ...]
);

-- Index : plan actif d'un utilisateur
CREATE INDEX reading_plans_active_idx ON reading_plans (user_id, is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur gère ses plans de lecture"
  ON reading_plans FOR ALL
  USING (auth.uid() = user_id);
