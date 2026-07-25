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



  Voilà exactement la structure que je désire Mais tout en respectant notre charte graphique et en utilisant les couleurs. En haut à droite il y a toujours le bouton ski juste en bas il y a habit écrit avec la même police habituelle emballait le mot bienvenue en français ou bien Welcome en anglais et ensuite il y a "Let's get ...."(Bref le texte de courtoisie pour la connexion) en dessous. Ensuite le champ Email mot de passe le mot mot de passe oublié et le gros bouton se connecter en bas il y a se connecter avec Google juste le bouton se connecter avec Google et tout en bas hein Y a je n'ai pas de compte. Qui permet d'ouvrir maintenant la vue du register. 
  
