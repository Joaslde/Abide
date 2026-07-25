-- 011_ai_mode_etude.sql
-- Ajoute le mode « etude » au Guide IA : accompagnement d'étude biblique.
-- Ce n'est PAS un interrogateur socratique inerte : il enseigne, rebondit sur les
-- réponses de la personne, valide/enrichit/corrige avec douceur, et fait progresser
-- la compréhension par elle-même, petit à petit. La question est un outil, pas une posture.
-- Appliquée via MCP le 2026-07-08.

ALTER TABLE ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_mode_check;
ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_mode_check
  CHECK (mode IN ('enseignement','predication','meditation','theologie','etude'));
