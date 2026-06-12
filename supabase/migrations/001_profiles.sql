-- Migration 001 : Table profiles + trigger création automatique
-- Dépendances : auth.users (Supabase Auth)

CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name      TEXT,
  church_name       TEXT,
  preferred_lang    TEXT DEFAULT 'fr',
  preferred_version TEXT DEFAULT 'LSG1910',
  daily_goal_min    INT DEFAULT 10,
  is_premium        BOOLEAN DEFAULT FALSE,
  premium_expires   TIMESTAMPTZ,
  premium_source    TEXT CHECK (premium_source IN ('kkiapay', 'fedapay', 'apple_iap', 'google_iap')),
  onboarding_done   BOOLEAN DEFAULT FALSE,
  onboarding_pillar TEXT CHECK (onboarding_pillar IN ('immersion', 'sanctuaire', 'ancre', 'phare')),
  notif_time        TIME DEFAULT '07:00:00',
  push_token        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger : mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger : créer le profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur lit son propre profil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utilisateur modifie son propre profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
