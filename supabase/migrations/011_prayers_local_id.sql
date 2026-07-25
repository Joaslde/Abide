-- 011_prayers_local_id.sql
-- Sync best-effort des prières : l'id local (user-db) est un texte (Date.now
-- base36), l'id distant un UUID. On mappe via local_id pour un upsert idempotent
-- (pas de doublon quand on re-pousse). Appliquée via MCP le 2026-07-14.
ALTER TABLE prayers ADD COLUMN IF NOT EXISTS local_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS prayers_user_local
  ON prayers (user_id, local_id) WHERE local_id IS NOT NULL;
