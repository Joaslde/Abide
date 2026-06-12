-- Migration 002 : Table reading_progress + streaks
-- Dépendances : 001_profiles.sql

CREATE TABLE reading_progress (
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  version   TEXT NOT NULL,
  book_id   TEXT NOT NULL,
  chapter   INT NOT NULL,
  read_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, version, book_id, chapter)
);

CREATE TABLE streaks (
  user_id         UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak  INT DEFAULT 0,
  longest_streak  INT DEFAULT 0,
  last_active     DATE
);

-- Index pour requêtes fréquentes (stats utilisateur)
CREATE INDEX reading_progress_user_idx ON reading_progress (user_id, read_at DESC);

-- RLS
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur gère sa progression"
  ON reading_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur lit son streak"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur modifie son streak"
  ON streaks FOR ALL
  USING (auth.uid() = user_id);
