# Chantier — Synchronisation complète des données utilisateur

> Établi le 2026-09-07, après la perte de données causée par un `pm clear`.
> Objectif énoncé par l'utilisateur dès le départ : **tout ce qui est enregistré
> localement doit remonter dans le cloud dès qu'il y a du réseau**, pour être
> restauré à l'identique sur un nouvel appareil.

---

## Constat de départ

`src/lib/sync.js` ne pousse que **3 choses sur 11** : `reading_plans`, `streaks`,
`prayers`. Tout le reste ne quitte jamais l'appareil.

| Donnée locale (SQLite) | Table Supabase | Poussée ? | Action |
|---|---|---|---|
| `highlights` (surlignages) | ❌ absente | ❌ | créer + sync |
| `bookmarks` (signets) | ❌ absente | ❌ | créer + sync |
| `notes` (remarques) | ❌ absente | ❌ | créer + sync |
| `quiz_results` (étoiles) | ❌ absente | ❌ | créer + sync |
| `prayer_moments` | ❌ absente | ❌ | créer + sync |
| `fasting` (jeûnes) | ❌ absente | ❌ | créer + sync |
| `activity_days` | ❌ absente | ❌ | créer + sync |
| `reading_progress` (chapitres lus) | ✅ existe | ❌ **jamais alimentée** | brancher |
| `reading_plans` | ✅ existe | ⚠️ colonnes manquantes | compléter |
| `streak` | ✅ existe | ✅ | RAS |
| `prayers` | ✅ existe | ✅ | RAS |

## Deux bugs découverts en analysant l'existant

1. **`reading_plans` duplique à chaque sync** — 736 lignes pour un seul
   utilisateur, dont 664 créées avant aujourd'hui. Le push fait un `insert`
   sans clé d'unicité (`sync.js:39`), au lieu d'un `upsert` sur un `local_id`.
2. **`reading_plans` cloud perd des colonnes** : `scope`, `title`,
   `template_id`, `source` existent en local mais pas en base → un plan restauré
   depuis le cloud serait incomplet (titre et parcours perdus).

---

## Principes de conception

- **Local-first** : l'écriture locale reste la source de vérité immédiate ;
  la sync est best-effort et ne bloque jamais l'interface.
- **`local_id` partout** : chaque ligne cloud porte l'id SQLite d'origine, avec
  une contrainte `UNIQUE (user_id, local_id)`. C'est ce qui rend le push
  **idempotent** (upsert au lieu d'insert) et évite la duplication constatée.
- **`updated_at` sur chaque table** : nécessaire pour arbitrer les conflits
  (le plus récent gagne) lors d'un pull depuis un autre appareil.
- **RLS stricte** : `user_id = auth.uid()` en SELECT/INSERT/UPDATE/DELETE,
  comme sur les tables existantes. Jamais désactivée (CLAUDE.md).
- **Pull au login** : à la connexion sur un appareil vierge, on télécharge tout
  et on réinjecte en SQLite — c'est ce qui rend la promesse « je change de
  téléphone et je retrouve tout » réellement vraie.

---

## Étapes

### 1. Migrations Supabase (DDL)
- [ ] `highlights`, `bookmarks`, `notes`, `quiz_results`, `prayer_moments`,
      `fasting`, `activity_days` — avec `user_id`, `local_id`, `updated_at`,
      index et policies RLS
- [ ] `reading_plans` : ajouter `scope`, `title`, `template_id`, `source`, `local_id`
- [ ] Contraintes `UNIQUE (user_id, local_id)` sur toutes les tables synchronisées
- [ ] **Nettoyer les 736 doublons** de `reading_plans` (garder le plus récent)

### 2. Push (local → cloud)
- [ ] Étendre `pushUserData()` à toutes les tables
- [ ] Passer `reading_plans` de `insert` à `upsert` (corrige la duplication)
- [ ] Brancher `reading_progress` (table existante, jamais alimentée)
- [ ] Déclencher : au retour du réseau (déjà câblé dans `main.js` via
      `watchNetwork`) **et** après chaque modification locale

### 3. Pull (cloud → local)
- [ ] `pullUserData()` : télécharge tout et réinjecte en SQLite
- [ ] Appelé à la connexion, et si la base locale est vide
- [ ] Arbitrage par `updated_at` : le plus récent gagne

### 4. Vérification
- [ ] Lire un chapitre → vérifier la ligne dans Supabase
- [ ] Surligner un verset → idem
- [ ] Effacer les données de l'app → se reconnecter → **tout doit revenir**
- [ ] Mode avion : les écritures locales fonctionnent, la sync part au retour du réseau
- [ ] Relancer la sync deux fois → **aucun doublon créé**

---

## Ce qui restera hors scope

- Résolution fine des conflits multi-appareils simultanés (rare pour cet usage) :
  on s'en tient au « plus récent gagne ».
- `lastReadPath` (reprise de lecture) : préférence locale, pas une donnée
  utilisateur à conserver entre appareils.
