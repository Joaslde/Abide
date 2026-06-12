# tasks/todo.md — Abide | Roadmap & Suivi Détaillé

> RÈGLE ABSOLUE : Ce fichier est à consulter ET mettre à jour **avant** chaque
> implémentation (planification) et **après** chaque implémentation (statut).
>
> - Ne jamais commencer une tâche sans l'avoir écrite et décomposée ici.
> - Ne jamais cocher une tâche sans preuve qu'elle compile et fonctionne (iOS + Android).
> - Chaque tâche doit être atomique : réalisable et testable indépendamment.
> - Si une tâche cache des sous-tâches, les décomposer AVANT de coder.
> - Toute tâche imprévue découverte en cours → l'ajouter immédiatement.

---

## En Cours

*(Claude déplace ici la tâche active, décomposée en sous-étapes, avant de coder)*

---

## Phase Actuelle : Phase 0 — Setup & Fondations

---

# PHASE 0 — Setup & Fondations (Semaine 1)

## 0.1 Initialisation du projet
- [ ] `ionic start abide blank --type vue` (Vue 3 + Ionic)
- [ ] Installer Capacitor 6 + `npx cap init`
- [ ] Configurer `capacitor.config.js` (appId, appName, plugins)
- [ ] Configurer Vite : alias `@/` → `src/`, variables d'env
- [ ] Ajouter `.gitignore` (node_modules, .env.local, ios/, android/, dist/)
- [ ] Init Git + premier commit
- [ ] Créer `.env.example` documentant toutes les variables nécessaires

## 0.2 Structure & outils de base
- [ ] Créer l'arborescence complète (views, components, composables, lib, stores, assets)
- [ ] Installer + configurer Pinia (créer les stores vides : auth, bible, audio, ai, plan, streak, ads)
- [ ] Installer + configurer Vue Router (routes vides + structure tabs)
- [ ] Configurer ESLint + Prettier (cohérence du code)
- [ ] Créer `src/lib/supabase.js` (client singleton)

## 0.3 Supabase
- [ ] Créer le projet Supabase
- [ ] Activer l'extension pgvector
- [ ] Migration 001_profiles.sql
- [ ] Migration 002_reading_progress.sql
- [ ] Migration 003_reading_plans.sql
- [ ] Migration 004_ai_sessions.sql
- [ ] Migration 005_prayers.sql
- [ ] Migration 006_bible_embeddings.sql
- [ ] Activer Row Level Security (RLS) sur toutes les tables
- [ ] Écrire les policies RLS (chaque user accède uniquement à ses données)
- [ ] Tester les migrations en local (`supabase db reset`)

## 0.4 Contenu biblique de base
- [ ] Télécharger LSG 1910 depuis eBible.org (format USFM ou JSON)
- [ ] Écrire `scripts/convert-bible.js` (USFM/JSON → SQLite)
- [ ] Générer `src/assets/bibles/lsg1910.db`
- [ ] Installer capacitor-sqlite
- [ ] Tester lecture d'un verset depuis la Bible locale

## 0.5 APIs externes (comptes + tests)
- [ ] Créer compte BibleBrain + obtenir clé API dev
- [ ] Tester appel BibleBrain (lister versions audio françaises)
- [ ] Créer compte OpenRouter + tester un appel LLM
- [ ] Créer bucket Cloudflare R2 + configurer CORS

## 0.6 Build & vérification
- [ ] Configurer EAS (Expo Application Services)
- [ ] Premier build Android (`npx cap run android`)
- [ ] Premier build iOS (`npx cap run ios`)
- [ ] Vérifier que l'app démarre sur les deux simulateurs

---

# PHASE 1 — MVP (Semaines 2–6) | Objectif : 1 000 users gratuits

## 1.1 — AUTHENTIFICATION (sécurisée et complète)

### Configuration Supabase Auth
- [ ] Activer les providers : Email/Password + Google OAuth dans Supabase
- [ ] Configurer Google OAuth (créer projet Google Cloud, OAuth consent screen, client IDs iOS + Android + Web)
- [ ] Configurer les redirect URLs (deep links Capacitor `abide://auth/callback`)
- [ ] Configurer les templates d'email Supabase (confirmation, reset, magic link) en français
- [ ] Configurer la durée de session et le refresh token

### Inscription (Register)
- [ ] RegisterView — formulaire email + mot de passe
- [ ] Validation email (format) côté client
- [ ] Validation force du mot de passe (min 8 car, règles claires affichées)
- [ ] Indicateur visuel de force du mot de passe
- [ ] Bouton "S'inscrire avec Google" (OAuth)
- [ ] Gestion erreur "email déjà utilisé"
- [ ] Envoi email de confirmation + écran "Vérifie ta boîte mail"
- [ ] Création automatique du profil dans `profiles` (trigger Supabase ou côté client après confirmation)

### Connexion (Login)
- [ ] LoginView — formulaire email + mot de passe
- [ ] Bouton "Se connecter avec Google" (OAuth)
- [ ] Option "Lien magique" (Magic Link sans mot de passe)
- [ ] Gestion erreurs (mauvais identifiants, email non confirmé, compte inexistant)
- [ ] Limitation tentatives (anti-bruteforce — rate limiting Supabase)
- [ ] Redirection vers onboarding si première connexion, sinon vers l'app

### Mot de passe oublié / modification
- [ ] Lien "Mot de passe oublié" sur LoginView
- [ ] ForgotPasswordView — saisie email + envoi lien de réinitialisation
- [ ] ResetPasswordView — nouveau mot de passe (depuis le deep link email)
- [ ] Dans Settings : modification du mot de passe (ancien + nouveau)
- [ ] Dans Settings : modification de l'email (avec re-confirmation)

### Session & sécurité
- [ ] Store auth.js : session, user, profil, is_premium, méthodes login/logout
- [ ] Persistance de session (capacitor-preferences, refresh automatique)
- [ ] Guard de navigation (router) : rediriger non-connectés vers Login
- [ ] Guard onboarding : rediriger vers onboarding si `onboarding_done = false`
- [ ] Déconnexion (logout) + nettoyage session locale
- [ ] Gestion expiration token (refresh transparent ou re-login)
- [ ] Suppression de compte (RGPD — option dans Settings + cascade Supabase)
- [ ] Tester : inscription email, login email, Google OAuth, magic link, reset password — sur iOS ET Android

## 1.2 — ONBOARDING

- [ ] OnboardingLayout (barre de progression 4 étapes)
- [ ] Step1Needs — "Qu'est-ce qui te pèse en ce moment ?" (anxiété/régularité/deuil/croissance)
- [ ] Step2Time — "Combien de temps par jour ?" (5/10/20 min/plus)
- [ ] Step3Church — "Tu fais partie d'une église ?" (nom optionnel)
- [ ] Step4Pillar — calcul du pilier recommandé selon réponses + confirmation
- [ ] Sauvegarde des réponses dans `profiles` (onboarding_pillar, daily_goal_min, church_name)
- [ ] Marquer `onboarding_done = true` à la fin
- [ ] Possibilité de passer (skip) l'onboarding
- [ ] Tester le parcours complet + persistance

## 1.3 — LECTEUR BIBLE (Pilier Immersion)

### Accès aux données
- [ ] bible-db.js : `getVersions()` (versions disponibles localement)
- [ ] bible-db.js : `getBooks(versionId)` (liste des livres)
- [ ] bible-db.js : `getChapterCount(versionId, bookId)`
- [ ] bible-db.js : `getVerses(versionId, bookId, chapter)`
- [ ] Store bible.js (version active, livre, chapitre courant, persistance)

### Interface de lecture
- [ ] BibleHomeView — sélection version + grille des livres (AT/NT)
- [ ] BibleBookView — grille des chapitres d'un livre
- [ ] BibleChapterView — affichage des versets du chapitre
- [ ] Composant VerseItem (numéro + texte, lisible, espacé)
- [ ] Composant ChapterNavigator (prev/next, swipe gauche/droite)
- [ ] Mode jour / nuit (toggle + persistance)
- [ ] Réglage taille de police (accessibilité)
- [ ] Surlignage de versets (tap long → sauvegarde locale)
- [ ] Composant VersionSelector (changer de version)

### Progression
- [ ] Marquer un chapitre comme lu → enregistrer dans reading_progress (Supabase)
- [ ] Indicateur visuel chapitres déjà lus
- [ ] Tester lecture offline (sans connexion) + sync au retour en ligne

## 1.4 — AUDIO BIBLE (Pilier Immersion)

### Intégration BibleBrain
- [ ] biblebrain.js : `getAudioVersions(lang)` (versions audio dispo)
- [ ] biblebrain.js : `getAudioUrl(filesetId, bookId, chapter)`
- [ ] biblebrain.js : `getTimestamps(filesetId, bookId, chapter)` (sync par verset)
- [ ] Documenter les filesetId français dans le code

### Player audio natif
- [ ] Installer @capacitor-community/audio
- [ ] useAudio.js : load(), play(), pause(), seek(), setSpeed()
- [ ] Vérifier lecture en background (écran verrouillé) iOS + Android
- [ ] Contrôles dans le centre de notification (lock screen controls)
- [ ] Store audio.js (état, position, chapitre courant, vitesse)

### Interface player
- [ ] Composant MiniPlayer (barre persistante bas d'écran)
- [ ] AudioPlayerView (plein écran : play/pause/vitesse/-15s/+15s)
- [ ] Synchronisation texte : verset actif surligné selon timestamp
- [ ] Défilement automatique du texte pendant la lecture
- [ ] Tester audio streaming + background sur iOS ET Android

## 1.5 — PLAN DE LECTURE & STREAK

### Plan de lecture
- [ ] Algorithme génération plan (7j/30j/90j selon daily_goal_min)
- [ ] plan.js store (plan actif, jour courant, schedule JSON)
- [ ] Sauvegarde plan dans reading_plans (Supabase)
- [ ] Composant DailyPlanCard (chapitre du jour + bouton lire/écouter)
- [ ] Marquer le jour comme complété → avancer current_day
- [ ] Écran de sélection/changement de plan

### Streak
- [ ] streak.js store (current_streak, longest_streak, last_active)
- [ ] Logique : incrémenter si lecture aujourd'hui, reset si jour manqué
- [ ] Sauvegarde dans table streaks (Supabase)
- [ ] Composant StreakBadge (X jours consécutifs)
- [ ] Message d'encouragement selon le streak
- [ ] Tester le calcul du streak sur plusieurs jours (changement de date)

## 1.6 — NOTIFICATIONS

- [ ] Installer @capacitor/push-notifications
- [ ] Configurer FCM (Firebase) pour Android
- [ ] Configurer APNs (certificats Apple) pour iOS
- [ ] useNotifications.js : demande permission + enregistrement token
- [ ] Stocker le token push dans le profil (Supabase)
- [ ] Edge Function push-cron (cron horaire pg_cron)
- [ ] Notification rappel lecture quotidien (heure de notif_time)
- [ ] Notification Flash-Verset (1 verset/jour)
- [ ] Notification rappel streak (si risque de rupture)
- [ ] Réglage heure de notification dans Settings
- [ ] Tester réception notification iOS ET Android

## 1.7 — PUBLICITÉS ADMOB

- [ ] Créer compte Google AdMob + App IDs iOS + Android
- [ ] Créer les unités publicitaires (bannière)
- [ ] Installer capacitor-admob
- [ ] admob.js : init(), showBanner(), hideBanner()
- [ ] useAdMob.js : logique d'affichage contextuel
- [ ] Store ads.js (état, contexte courant)
- [ ] Composant AdBanner
- [ ] Règle stricte : afficher seulement si `!authStore.isPremium`
- [ ] Règle stricte : masquer pendant Bible, audio, prière, IA
- [ ] Tester avec des IDs de test AdMob (pas de vraies pubs en dev)

## 1.8 — SETTINGS & PROFIL

- [ ] SettingsView (structure)
- [ ] Réglage heure de notification
- [ ] Réglage langue de l'interface
- [ ] Réglage version Bible préférée
- [ ] Mode jour/nuit global
- [ ] Modification mot de passe / email
- [ ] Déconnexion
- [ ] Suppression de compte
- [ ] Lien CGU + politique de confidentialité

## 1.9 — INFRASTRUCTURE & LANCEMENT MVP

- [ ] Landing page Nuxt 3 (hero + présentation + waitlist)
- [ ] Formulaire liste d'attente (email → Supabase ou service email)
- [ ] Déploiement landing sur Vercel + domaine
- [ ] Icône app + splash screen (iOS + Android)
- [ ] Configurer les métadonnées stores (description, screenshots, mots-clés)
- [ ] Build de production iOS → TestFlight
- [ ] Build de production Android → test interne Play Console
- [ ] Tests bêta sur appareils réels
- [ ] Soumission App Store (review)
- [ ] Soumission Google Play (review)

---

# PHASE 2 — Premium (Semaines 7–12) | Objectif : Monétisation

## 2.1 — PAIEMENTS

### KKiaPay (Android — Mobile Money + cartes locales)
- [ ] Créer compte KKiaPay développeur + clés API
- [ ] Installer / intégrer le SDK KKiaPay
- [ ] kkiapay.js : initPayment(), gestion callback succès/échec
- [ ] Tester paiement Mobile Money en sandbox

### FedaPay (Android — alternative béninoise)
- [ ] Créer compte FedaPay + clés API
- [ ] Intégrer le SDK FedaPay
- [ ] fedapay.js : initPayment(), callback
- [ ] Tester en sandbox

### RevenueCat (iOS — IAP)
- [ ] Créer compte RevenueCat + configurer les produits (mensuel/annuel)
- [ ] Configurer les abonnements dans App Store Connect
- [ ] Intégrer le SDK RevenueCat
- [ ] Tester achat sandbox iOS

### Backend & activation
- [ ] Edge Function payment-webhook (structure)
- [ ] Validation signature HMAC du webhook
- [ ] Vérification server-to-server du paiement (appel API source)
- [ ] UPDATE profiles : is_premium, premium_expires, premium_source, sessions_limit=5
- [ ] Webhook KKiaPay → activation
- [ ] Webhook FedaPay → activation
- [ ] Webhook RevenueCat → activation
- [ ] Gestion expiration / renouvellement / annulation d'abonnement

### Interface
- [ ] PaywallView (présentation plans + tarifs)
- [ ] Composant PaymentSheet (modal : Mobile Money/carte locale | Apple/Google Pay)
- [ ] Composant PremiumGate (bloque feature si non-premium → ouvre paywall)
- [ ] usePremium.js (vérif statut, déclenchement paywall)
- [ ] Détection retour de paiement → recharger profil → débloquer accès
- [ ] Suppression AdMob dès is_premium = true
- [ ] Tester le flux complet : paiement → webhook → activation → accès débloqué

## 2.2 — GUIDE IA (Pilier L'Ancre)

### Préparation RAG
- [ ] Script seed-embeddings.js (générer embeddings LSG → bible_embeddings)
- [ ] Vérifier la recherche vectorielle pgvector (top K versets)

### Edge Function ai-chat
- [ ] Structure de la fonction + auth
- [ ] Vérification compteur sessions (403 si dépassé) AVANT tout appel LLM
- [ ] Embedding de la question (OpenAI text-embedding-3-small)
- [ ] Recherche Top 5 versets pertinents (pgvector)
- [ ] Construction du prompt selon le mode (Enseignement/Prédication/Méditation/Théologie)
- [ ] Appel OpenRouter (GPT-4o-mini)
- [ ] Incrémentation sessions_used
- [ ] Retour réponse (streaming si possible)
- [ ] Tester limite : 1/jour gratuit, 5/jour premium

### Interface chat
- [ ] AIChatView (interface conversationnelle)
- [ ] Composant ModeSelector (4 modes avec descriptions)
- [ ] Composant ChatBubble (user + IA)
- [ ] Composant SessionCounter ("X sessions restantes aujourd'hui")
- [ ] Sélection du passage (saisie libre ou depuis le lecteur Bible)
- [ ] Store ai.js (historique, mode, sessions restantes)
- [ ] Message élégant quand limite atteinte (pas technique)

### Audio des réponses IA (TTS)
- [ ] tts.js : OpenAI TTS (texte → audio)
- [ ] Cache des audios générés sur Cloudflare R2 (clé = hash du contenu)
- [ ] Vérifier le cache avant de regénérer
- [ ] Bouton "Écouter" sur les réponses IA (premium)
- [ ] Lecture via le player audio natif

### Décrypteur de prédications
- [ ] SermonDecoderView (upload fichier audio)
- [ ] Transcription (Whisper API ou équivalent)
- [ ] Résumé + extraction versets clés (LLM)
- [ ] Affichage structuré du résultat

## 2.3 — SANCTUAIRE (Prière & Jeûne)

### Journal de prières
- [ ] PrayerJournalView (liste + ajout)
- [ ] Ajout d'une prière (formulaire)
- [ ] PrayerDetailView (contenu + actions)
- [ ] Marquer comme exaucée (+ date)
- [ ] Timeline des exaucements (historique de gratitude)
- [ ] Persistance offline-first + sync Supabase (table prayers)

### Tracker de jeûne
- [ ] FastingView (jeûne actif + planification)
- [ ] Défis 21 / 40 / 60 jours (sélection + suivi)
- [ ] Méditations ciblées aux heures de faim (notifications)
- [ ] Progression visuelle du défi

## 2.4 — VERSIONS BIBLE SUPPLÉMENTAIRES

- [ ] Obtenir accord commercial API.Bible (versions sous copyright)
- [ ] VersionSelector — interface téléchargement + gestion
- [ ] Téléchargement SQLite par version (depuis R2)
- [ ] Téléchargement audio BibleBrain par version (offline premium)
- [ ] Gestionnaire d'espace disque (taille, suppression)
- [ ] Indicateur de versions téléchargées vs en ligne

---

# PHASE 3 — Croissance (Mois 3–6)

## 3.1 — Pilier Phare (Évangélisation)
- [ ] Parcours "Premiers Pas" gamifié (tunnel interactif)
- [ ] Hub des chercheurs (questions anonymes)
- [ ] Mise en relation mentor / chercheur
- [ ] Ressources de partage (versets, outils)

## 3.2 — Langues & Internationalisation
- [ ] Partenariat FCBH pour Bible Fon + langues béninoises
- [ ] Intégration Bible Fon (texte + audio)
- [ ] Version anglaise de l'app (i18n complet)
- [ ] KJV + audio BibleBrain EN

## 3.3 — Croissance & Rétention
- [ ] Notifications géolocalisées (geofences Capacitor)
- [ ] Partage de versets (génération image + réseaux sociaux)
- [ ] Liens d'affiliation trackés (pasteurs, influenceurs)
- [ ] Programme de parrainage

## 3.4 — Optimisation Technique
- [ ] Virtual scroll pour le lecteur Bible (perf)
- [ ] Lazy loading des modules
- [ ] Mode offline complet (sync queue robuste)
- [ ] Audit performance + réduction taille bundle
- [ ] Monitoring erreurs (Sentry ou équivalent)

---

## Terminé

*(Claude déplace ici les tâches complétées avec la date)*

---

## Tâches Imprévues / Bloquantes

*(Claude note ici tout ce qui surgit en cours de développement)*

---

*Dernière mise à jour : Juin 2026 | Prochaine tâche : Phase 0.1*
