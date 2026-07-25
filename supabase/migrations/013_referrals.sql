-- Migration 013 : Programme de parrainage
--
-- Un utilisateur génère un code de parrainage unique. Quand un filleul installe
-- l'app via son lien (attribution AppsFlyer) et crée un compte, une ligne est
-- enregistrée dans `referrals`. Les paliers de récompense (nombre de filleuls →
-- jours premium) sont calculés et appliqués côté serveur uniquement (Edge
-- Functions, service_role) — jamais par le client.

ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;

-- 'referral' ajouté aux sources premium possibles.
ALTER TABLE profiles DROP CONSTRAINT profiles_premium_source_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_premium_source_check
  CHECK (premium_source IN ('kkiapay', 'fedapay', 'apple_iap', 'google_iap', 'referral'));

-- Une ligne par filleul attribué. referred_id UNIQUE = un filleul ne peut être
-- compté qu'une seule fois (idempotence + anti-fraude basique).
CREATE TABLE referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id   UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX referrals_referrer ON referrals(referrer_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Le parrain peut lire SES filleuls (écran Parrainage). Aucune écriture cliente :
-- seules les Edge Functions (service_role) insèrent dans cette table.
CREATE POLICY "own_referrals_read" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);
