-- 010_ai_conversations_default_user.sql
-- La colonne user_id est NOT NULL sans défaut → l'insert client (qui ne fournit
-- pas user_id) violait la contrainte. DEFAULT auth.uid() : le serveur remplit
-- automatiquement l'utilisateur courant (la RLS garantit déjà user_id = auth.uid()).
-- Appliquée via MCP le 2026-07-07.
ALTER TABLE ai_conversations ALTER COLUMN user_id SET DEFAULT auth.uid();
