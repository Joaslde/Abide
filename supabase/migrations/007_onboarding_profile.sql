-- Migration 007 : Champs de profilage onboarding
-- Dépendances : profiles (migration 001)
-- Ajoute les colonnes recueillies par le quiz d'onboarding (docs/onboarding-quiz.md).
-- Stockage = colonnes dédiées typées (requêtables pour l'agrégation anonymisée).

-- ─── BLOC 1 : Identité ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT
  CHECK (gender IN ('homme', 'femme'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
-- church_name existe déjà (migration 001) — réutilisé tel quel.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS church_denomination TEXT
  CHECK (church_denomination IN ('catholique', 'protestant', 'evangelique', 'pentecotiste', 'autre'));

-- ─── BLOC 2 : Parcours de foi ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS faith_duration TEXT
  CHECK (faith_duration IN ('new', 'few_years', 'long', 'very_long', 'undecided'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS faith_stage TEXT
  CHECK (faith_stage IN ('growing', 'new_convert', 'seeker', 'returning'));

-- ─── BLOC 3 : Niveau biblique ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bible_familiarity TEXT
  CHECK (bible_familiarity IN ('lost', 'struggling', 'comfortable', 'can_teach'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bible_landmarks INT
  CHECK (bible_landmarks BETWEEN 0 AND 5);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reading_frequency TEXT
  CHECK (reading_frequency IN ('never', 'sometimes', 'weekly', 'daily'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS depth_interest TEXT
  CHECK (depth_interest IN ('basics', 'application', 'meaning', 'theology'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bible_level TEXT
  CHECK (bible_level IN ('decouverte', 'croissance', 'affermi', 'profond'));

-- ─── BLOC 4 : Vie spirituelle & disponibilité ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_challenge TEXT
  CHECK (main_challenge IN ('regularity', 'understanding', 'motivation', 'hardship', 'evangelism'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_time_slot TEXT
  CHECK (preferred_time_slot IN ('morning', 'noon', 'evening', 'night'));
-- daily_minutes : on réutilise daily_goal_min (déjà présent, migration 001).

-- ─── Profil final attribué ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_profile TEXT
  CHECK (user_profile IN ('source', 'marcheur', 'explorateur', 'veilleur', 'porteur'));
-- onboarding_pillar existe déjà (migration 001) — rempli avec le pilier du profil.

-- ─── Consentement données (RGPD) ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_date TIMESTAMPTZ;
