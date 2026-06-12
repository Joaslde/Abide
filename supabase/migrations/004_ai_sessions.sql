-- Migration 004 : Compteur sessions IA (CRITIQUE — source de vérité côté serveur)
-- RÈGLE : Ce compteur est vérifié dans l'Edge Function ai-chat AVANT tout appel LLM.
-- Dépendances : 001_profiles.sql

CREATE TABLE ai_sessions (
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date           DATE DEFAULT CURRENT_DATE,
  sessions_used  INT DEFAULT 0,
  sessions_limit INT DEFAULT 1,  -- 1 gratuit / 5 premium
  PRIMARY KEY (user_id, date)
);

-- Index pour la vérification quotidienne dans l'Edge Function
CREATE INDEX ai_sessions_daily_idx ON ai_sessions (user_id, date);

-- RLS : lecture uniquement par le propriétaire.
-- Les Edge Functions utilisent le service_role_key (bypass RLS).
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur lit ses sessions IA"
  ON ai_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Pas de policy INSERT/UPDATE côté client — uniquement via Edge Function service_role
