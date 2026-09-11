# 📖 Abide, ta Bible, ta prière, ton guide au quotidien

Application mobile SaaS freemium de croissance spirituelle chrétienne, conçue pour accompagner les croyants dans leur quotidien, avec un contenu pensé pour les réalités culturelles africaines.

> Projet en développement actif, architecture offline first, IA pastorale intégrée.

---

## 🎯 Le problème résolu

- Manque de régularité dans la lecture et la prière quotidienne
- Absence de structure personnalisée et progressive
- Contenu biblique souvent inadapté aux réalités culturelles africaines

## ✨ Fonctionnalités clés

- 📖 **Lecteur Bible complet** : 5 traductions (LSG, KJV, WEB, Darby, Ostervald), 100% hors ligne
- 🎧 **Audio Bible humain** : enregistrements BibleBrain synchronisés au verset, lecture en arrière plan (écran verrouillé)
- 🤖 **Guide IA pastoral** : assistant spirituel RAG avec 4 modes (enseignement, prédication, méditation, théologie)
- 📅 **Plans de lecture** : 14 parcours thématiques adaptés au profil de l'utilisateur
- 🙏 **Sanctuaire de prière** : journal de prières, tracker de jeûne, défis spirituels
- 🔥 **Gamification** : streaks, badges, notifications personnalisées
- 💬 **Relation personnalisée** : utilisation fréquente du prénom, ton pastoral et bienveillant (tutoiement) dans toute l'app

## 🏗️ Stack technique

**Mobile**
- Vue 3 (Composition API, JavaScript pur, pas de TypeScript)
- Ionic Framework + Capacitor 6
- Pinia pour l'état global
- SQLite embarqué pour la Bible (lecture 100% offline)

**Backend**
- Supabase (PostgreSQL, Auth, Edge Functions, pgvector pour le RAG)
- Cloudflare R2 pour le stockage des fichiers et le cache audio

**Intelligence artificielle**
- OpenRouter (GPT-4o-mini / Gemini Flash selon le contexte)
- OpenAI TTS pour la voix du guide IA uniquement (jamais pour les textes bibliques)
- Architecture RAG obligatoire sur toutes les réponses du guide

**Audio**
- BibleBrain / FCBH API pour l'audio Bible (enregistrements humains exclusivement)

**Paiements**
- KKiaPay + FedaPay sur Android
- RevenueCat + In App Purchase sur iOS
- Statut premium validé uniquement côté serveur via webhook, jamais côté client

**Publicité**
- Google AdMob, modèle interstitiel uniquement (pas de bannières), inspiré de YouVersion
- Jamais affichée pendant la lecture, l'écoute audio, la prière ou la conversation avec l'IA

**Analytics**
- PostHog

## 🔒 Sécurité et exigence technique

- Row Level Security activée sur toutes les tables Supabase
- Toute logique sensible (paiement, IA, statut premium) exécutée en Edge Function, jamais côté client
- Compteur de sessions IA vérifié côté serveur avant chaque appel au LLM
- Clés API et secrets exclusivement en variables d'environnement, jamais hardcodés
- Approche offline first pensée dès la conception de chaque fonctionnalité

## 🧭 Philosophie de développement

Le projet suit une discipline stricte : planification avant implémentation, tests systématiques sur iOS et Android, correction des causes racines plutôt que des symptômes, et une boucle d'apprentissage continue documentée à chaque bug corrigé.

---

*Projet combinant spiritualité, IA conversationnelle et expérience mobile premium, pensé pour un usage quotidien durable plutôt qu'un simple outil de lecture.*
