-- Migration 012 : Verrouillage des colonnes premium sur profiles
--
-- FAILLE CORRIGÉE (découverte le 2026-07-13, avant l'implémentation du parrainage) :
-- La policy RLS "Utilisateur modifie son propre profil" (001_profiles.sql) autorise
-- `auth.uid() = id` en UPDATE SANS restreindre les colonnes modifiables. Un client
-- authentifié pouvait donc faire `update({ is_premium: true })` sur SON PROPRE profil
-- et obtenir le premium gratuitement — en violation directe de SECURITY.md §2
-- ("Champs critiques jamais modifiables par le client").
--
-- Cette migration bloque, via trigger, toute modification cliente de is_premium,
-- premium_expires et premium_source. Seul le rôle service_role (utilisé exclusivement
-- par les Edge Functions, jamais exposé au client) peut les modifier.

CREATE OR REPLACE FUNCTION protect_premium_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() != 'service_role' THEN
    IF NEW.is_premium IS DISTINCT FROM OLD.is_premium
       OR NEW.premium_expires IS DISTINCT FROM OLD.premium_expires
       OR NEW.premium_source IS DISTINCT FROM OLD.premium_source THEN
      RAISE EXCEPTION 'is_premium, premium_expires et premium_source sont réservés au serveur';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_protect_premium
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_premium_columns();

-- RÈGLE POUR LA SUITE : toute nouvelle colonne sensible ajoutée à `profiles`
-- (ex: futurs champs liés à un statut ou une limite) doit être ajoutée à cette
-- fonction, sinon elle reste modifiable par le client via son propre update().
