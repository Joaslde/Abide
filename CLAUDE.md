# CLAUDE.md — Abide
> Règles de développement absolues pour ce projet.
> Inspiré des principes de Boris Cherny (créateur de Claude Code) — personnalisé pour Abide.

---

## DÉMARRAGE DE SESSION

Avant de toucher quoi que ce soit, dans cet ordre exact :

1. **Lire `tasks/lessons.md`** — appliquer toutes les leçons enregistrées
2. **Lire `tasks/todo.md`** — comprendre l'état actuel du projet
3. Si l'un des deux n'existe pas → le créer immédiatement avant de commencer
4. **Pour toute tâche impliquant l'auth, les paiements, l'IA ou les données utilisateurs** → lire `SECURITY.md` en entier avant d'écrire une ligne
5. **Pour toute tâche impliquant de l'UI, des composants ou des écrans** → lire `design-pattern.md` avant de commencer

---

## STACK TECHNIQUE (immuable — ne jamais dévier sans discussion explicite)

```
Mobile     : Vue 3 + Ionic Framework + Capacitor 6
Langage    : JavaScript (Composition API) — PAS TypeScript
State      : Pinia
Routing    : Vue Router + Ionic Tabs
Storage    : capacitor-sqlite (Bible) + @capacitor/preferences (prefs)
Audio      : @capacitor-community/audio (background natif)
Notifs     : @capacitor/push-notifications (FCM + APNs)
Pub        : capacitor-admob (Google AdMob)

Backend    : Supabase (PostgreSQL + Auth + Edge Functions + pgvector)
CDN/Files  : Cloudflare R2

IA LLM     : OpenRouter (GPT-4o-mini / Gemini Flash selon contexte)
TTS        : OpenAI TTS uniquement (voix du guide IA)
Bible txt  : LSG 1910 SQLite bundlée + API.Bible
Bible audio: BibleBrain / FCBH API (enregistrements humains, PAS de TTS)
Paiement   : KKiaPay + FedaPay (Android) — RevenueCat + IAP (iOS)
Analytics  : PostHog
Landing    : Nuxt 3 + Vercel
```

Ne jamais introduire une nouvelle dépendance majeure sans vérifier qu'elle est compatible Capacitor + Ionic + Vue 3.

---

## WORKFLOW

### 1. Planifier d'abord

- Passer en mode plan pour toute tâche de 3 étapes ou plus
- Écrire le plan dans `tasks/todo.md` avant d'implémenter
- Si quelque chose ne va pas en cours d'implémentation → **STOP**, re-planifier, ne jamais forcer une solution qui semble bancale

### 2. Stratégie sous-agents

- Utiliser des sous-agents pour garder le contexte principal propre
- Une tâche ciblée par sous-agent (ex : "implémenter le lecteur Bible", "créer l'Edge Function ai-chat")
- Investir plus de compute sur les problèmes complexes (logique paiement, RAG, Edge Functions)

### 3. Boucle d'auto-amélioration

- Après toute correction de bug → mettre à jour `tasks/lessons.md`
- Format d'entrée : `[date] | ce qui a mal tourné | règle pour l'éviter`
- Relire les leçons au démarrage de chaque session, sans exception

### 4. Standard de vérification et de test (OBLIGATOIRE)

**Après chaque fonctionnalité implémentée :**

- [ ] Le code compile sans erreur (`ionic build` ou `vite build`)
- [ ] Aucune erreur dans la console navigateur/appareil
- [ ] La fonctionnalité se comporte comme attendu sur iOS ET Android simulés
- [ ] Les cas d'erreur sont gérés (réseau absent, token expiré, limite IA atteinte)
- [ ] Si une Edge Function est modifiée : la tester avec `supabase functions serve` en local

**Ne jamais marquer une tâche comme terminée sans preuve que ça fonctionne.**  
Se demander : *"Est-ce qu'un développeur senior validerait ce code ?"*

Si des bugs sont détectés lors du test → les corriger immédiatement avant de passer à la suite. Ne jamais laisser un bug connu ouvert pour "plus tard".

### 5. Exiger l'élégance

- Pour tout changement non trivial : existe-t-il une solution plus simple ?
- Si un fix semble bricolé → le reconstruire proprement
- Ne pas sur-ingénieriser les choses simples
- Préférer la lisibilité à la performance prématurée
- Un composant Vue = une responsabilité. Si un composant fait trop de choses → le découper

### 6. Correction de bugs autonome

- Quand un bug est reçu : aller dans les logs, trouver la cause racine, résoudre
- Ne pas poser de questions inutiles pour des bugs clairs
- Toujours corriger la cause racine, jamais masquer le symptôme
- Après correction → ajouter une entrée dans `tasks/lessons.md`

---

## PRINCIPES FONDAMENTAUX

- **Simplicité d'abord** — toucher un minimum de code pour un résultat maximum
- **Pas de paresse** — causes racines uniquement, pas de fixes temporaires
- **Ne jamais supposer** — vérifier les chemins, APIs, variables avant utilisation
- **Une question en amont** — si une tâche est ambiguë, poser une seule question claire avant de commencer, ne jamais interrompre en cours d'implémentation
- **JavaScript propre** — pas de TypeScript, mais du JS structuré avec des JSDoc si nécessaire pour la clarté
- **Offline-first** — toujours penser à ce qui se passe sans connexion avant d'implémenter

---

## RÈGLES SPÉCIFIQUES AU PROJET

### Supabase

- Toujours utiliser le client Supabase initialisé dans `src/lib/supabase.js` — ne jamais créer une nouvelle instance
- Row Level Security (RLS) est activé sur toutes les tables — ne jamais désactiver
- Toute logique sensible (paiement, IA, statut premium) → Edge Function, jamais côté client
- Tester les migrations en local avec `supabase db reset` avant de les pousser

### Paiements (CRITIQUE)

- Le statut premium ne se met à jour que via le webhook Supabase (`payment-webhook`)
- Ne jamais faire confiance au client pour indiquer qu'un paiement a réussi
- Toujours valider le paiement en appelant l'API KKiaPay/FedaPay/RevenueCat côté serveur avant de marquer `is_premium = true`
- Lire `SECURITY.md` section "Paiements" avant toute modification du flux de paiement

### Intelligence Artificielle

- Le compteur de sessions IA est vérifié dans l'Edge Function `ai-chat` AVANT d'appeler OpenRouter
- Si `sessions_used >= sessions_limit` → retourner 403, ne jamais appeler le LLM
- L'architecture RAG (pgvector) est obligatoire pour toutes les réponses du guide IA
- Le TTS (voix) s'applique uniquement aux réponses générées par l'IA — jamais à la Bible (qui utilise BibleBrain)
- Mettre en cache les réponses TTS sur Cloudflare R2 (ne pas regénérer si déjà existant)

### Audio Bible

- L'audio Bible provient EXCLUSIVEMENT de BibleBrain/FCBH API
- Ne jamais utiliser OpenAI TTS pour lire des textes bibliques
- L'audio doit fonctionner en arrière-plan (écran verrouillé) via le plugin Capacitor natif

### AdMob (Publicités)

- Les publicités ne s'affichent JAMAIS pendant :
  - La lecture d'un passage biblique
  - La lecture audio (Bible ou IA)
  - Une session de prière (journal)
  - Une session avec le guide IA
- Les publicités s'affichent uniquement sur les pages de navigation
- Vérifier systématiquement `!authStore.isPremium` avant d'afficher une pub
- Ne jamais appeler AdMob si `isPremium === true`

### Capacitor / Mobile

- Tester toute nouvelle fonctionnalité sur iOS ET Android avant de valider
- Les plugins Capacitor s'initialisent dans `App.vue` au démarrage (pas dans les composants)
- Vérifier la compatibilité d'un plugin avec Capacitor 6 avant installation
- Le background audio utilise uniquement `@capacitor-community/audio` — ne pas utiliser la Web Audio API pour l'audio Bible

### Vue 3 / Ionic

- Utiliser la Composition API (`setup()` ou `<script setup>`) — pas l'Options API
- Les appels API se font dans les composables (`src/composables/`) ou les stores Pinia
- Ne jamais faire d'appel Supabase directement dans un composant Vue
- Nommage des composants : PascalCase (`VerseItem.vue`, `ChatBubble.vue`)
- Nommage des composables : camelCase préfixé `use` (`useBible.js`, `useAI.js`)
- Nommage des vues : suffixe `View` (`BibleChapterView.vue`, `AIChatView.vue`)

### Sécurité

- Lire `SECURITY.md` avant toute fonctionnalité impliquant : auth, paiements, données utilisateur, appels API externes
- Les clés API (Supabase, OpenRouter, KKiaPay, AdMob) sont UNIQUEMENT dans `.env` — jamais hardcodées dans le code
- Les variables d'environnement exposées au client sont préfixées `VITE_` — ne jamais y mettre de secrets
- Les secrets (clés privées, webhook secrets) vivent uniquement dans les Edge Functions Supabase

---

## GESTION DES TÂCHES

1. **Planifier** → écrire dans `tasks/todo.md` avec format checkbox
2. **Vérifier** → confirmer la compréhension de la tâche si ambiguë
3. **Implémenter** → en suivant toutes les règles ci-dessus
4. **Tester** → compiler, vérifier iOS + Android, cas d'erreur
5. **Marquer** → cocher la tâche dans `tasks/todo.md`
6. **Apprendre** → si correction de bug, mettre à jour `tasks/lessons.md`

### Format tasks/todo.md

```markdown
## En cours
- [ ] Description de la tâche (Phase X)

## À faire — Phase 1 MVP
- [ ] Feature A
- [ ] Feature B

## Terminé
- [x] Feature C — (date)
```

---

## APPRENTISSAGES

*(Claude remplit cette section dans tasks/lessons.md au fil du projet)*

Format d'entrée dans `tasks/lessons.md` :
```
[YYYY-MM-DD] | Problème rencontré | Règle à retenir pour éviter
```

Exemple :
```
[2026-06-15] | Le compteur IA était vérifié côté client, contournable | Toujours vérifier dans l'Edge Function avant d'appeler OpenRouter
[2026-06-18] | Plugin audio ne fonctionnait pas en background sur iOS | Initialiser le plugin dans App.vue au démarrage, pas dans le composant
```

---

## RÉFÉRENCES RAPIDES

| Besoin | Fichier |
|--------|---------|
| Comprendre le projet | `PROJECT.md` |
| Règles de sécurité | `SECURITY.md` |
| Design et charte graphique | `design-pattern.md` |
| État des tâches | `tasks/todo.md` |
| Leçons apprises | `tasks/lessons.md` |
| Client Supabase | `src/lib/supabase.js` |
| Client OpenRouter | `src/lib/openrouter.js` |
| Interface Bible SQLite | `src/lib/bible-db.js` |
| BibleBrain API | `src/lib/biblebrain.js` |
