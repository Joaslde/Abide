-- Migration 014 : abonnements payants (Google Play via RevenueCat)
--
-- ⚠️ NON APPLIQUÉE tant que l'utilisateur ne l'a pas validée (CLAUDE.md : toute
-- écriture Supabase après accord explicite).
--
-- Problème résolu : profiles.premium_expires est UNE seule date, partagée entre
-- le parrainage et le paiement. En cas de remboursement ou d'expiration de
-- l'abonnement, on ne savait plus quelle part venait du parrainage.
-- Solution : chaque source garde SA date, et le statut affiché est recalculé
-- par une fonction unique :
--   - payé       → subscriptions.entitlement_expires (écrit par payment-webhook / premium-sync)
--   - parrainage → profiles.referral_premium_until (écrit par referral-attribute)
--   - profiles.is_premium / premium_expires / premium_source = la plus lointaine
--     des deux, via recompute_premium(). Les lecteurs existants (ai-chat,
--     quiz-chapter, l'app) ne changent pas.

-- 1. Date de fin du premium de PARRAINAGE, séparée de l'abonnement payé.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_premium_until TIMESTAMPTZ;

-- Reprise de l'existant : aujourd'hui, tout premium vient du parrainage.
UPDATE profiles
SET referral_premium_until = premium_expires
WHERE premium_source = 'referral' AND referral_premium_until IS NULL;

-- 2. État de l'abonnement payé, un par utilisateur (miroir de RevenueCat).
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id             UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  entitlement_expires TIMESTAMPTZ,       -- fin de l'accès payé (NULL = aucun accès payé)
  product_id          TEXT,
  store               TEXT,              -- PLAY_STORE, APP_STORE… (valeur RevenueCat)
  will_renew          BOOLEAN,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Lecture de SA propre ligne uniquement. Aucune policy d'écriture : seules les
-- Edge Functions (service_role, qui contourne RLS) écrivent.
CREATE POLICY "Utilisateur lit son abonnement" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Journal des événements reçus de RevenueCat (audit + idempotence).
-- Aucune policy : illisible et inscriptible côté client, service_role uniquement.
-- Pas de clé étrangère sur l'utilisateur : le journal comptable doit survivre à
-- la suppression d'un compte (preuve de paiement / remboursement).
CREATE TABLE IF NOT EXISTS payment_events (
  event_id     TEXT PRIMARY KEY,         -- event.id RevenueCat (unique)
  app_user_id  TEXT,
  type         TEXT NOT NULL,            -- INITIAL_PURCHASE, RENEWAL, EXPIRATION…
  environment  TEXT,                     -- SANDBOX | PRODUCTION
  payload      JSONB NOT NULL,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- 4. La nouvelle colonne sensible rejoint le verrou du trigger (règle de la
-- migration 012 : toute colonne de statut ajoutée à profiles doit y figurer).
CREATE OR REPLACE FUNCTION protect_premium_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() != 'service_role' THEN
    IF NEW.is_premium IS DISTINCT FROM OLD.is_premium
       OR NEW.premium_expires IS DISTINCT FROM OLD.premium_expires
       OR NEW.premium_source IS DISTINCT FROM OLD.premium_source
       OR NEW.referral_premium_until IS DISTINCT FROM OLD.referral_premium_until THEN
      RAISE EXCEPTION 'is_premium, premium_expires, premium_source et referral_premium_until sont réservés au serveur';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recalcul du statut premium affiché à partir des deux sources.
-- Idempotent : on peut l'appeler autant de fois qu'on veut.
CREATE OR REPLACE FUNCTION recompute_premium(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_paid      TIMESTAMPTZ;
  v_store     TEXT;
  v_referral  TIMESTAMPTZ;
  v_best      TIMESTAMPTZ;
  v_source    TEXT;
BEGIN
  SELECT entitlement_expires, store INTO v_paid, v_store
  FROM subscriptions WHERE user_id = p_user_id;

  SELECT referral_premium_until INTO v_referral
  FROM profiles WHERE id = p_user_id;

  -- GREATEST ignore les NULL en PostgreSQL.
  v_best := GREATEST(v_paid, v_referral);

  IF v_best IS NULL THEN
    UPDATE profiles
    SET is_premium = FALSE, premium_expires = NULL, premium_source = NULL
    WHERE id = p_user_id;
    RETURN;
  END IF;

  IF v_paid IS NOT NULL AND v_paid >= COALESCE(v_referral, '-infinity'::TIMESTAMPTZ) THEN
    v_source := CASE WHEN v_store = 'APP_STORE' THEN 'apple_iap' ELSE 'google_iap' END;
  ELSE
    v_source := 'referral';
  END IF;

  UPDATE profiles
  SET is_premium = v_best > NOW(),
      premium_expires = v_best,
      premium_source = v_source
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Appelable UNIQUEMENT par les Edge Functions (service_role), jamais par le client.
REVOKE ALL ON FUNCTION recompute_premium(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION recompute_premium(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION recompute_premium(UUID) TO service_role;
