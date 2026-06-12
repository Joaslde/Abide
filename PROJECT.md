# PROJECT.md — Abide
> Source de verite absolue du projet. A lire et maintenir a jour en permanence.
> Derniere mise a jour : Juin 2026

---

## 1. Vision

**Abide** est une application mobile SaaS freemium de croissance spirituelle chretienne,
concue pour les chretiens francophones africains et leur diaspora.

**Verset fondateur :** Jean 15:4 — "Demeurez en moi, et je demeurerai en vous."

**Problemes resolus :**
- Manque de regularite dans la lecture et la priere quotidienne
- Contenu biblique inadapte aux codes culturels africains
- Absence d'outil d'approfondissement de la Parole accessible et personnalise

**Objectif :** 100 000 utilisateurs en 6 mois.

---

## 2. Audience Cible

| Profil | Description |
|--------|-------------|
| Chretien actif/occupe | Professionnel, etudiant, parent — peu de temps mais vraie volonte |
| Nouveau converti | A besoin d'un cadre progressif, bienveillant, sans jugement |
| Chretien en quete de discipline | Veut structurer sa vie de priere, ses jeunes, surmonter des defis |

**Marche principal :** Afrique de l'Ouest francophone (Benin, CI, Senegal, Togo, Cameroun)
**Marche secondaire :** Diaspora africaine (France, Belgique, Canada)

---

## 3. Stack Technique

### Mobile
| Role | Technologie | Justification |
|------|------------|---------------|
| Framework UI | Vue 3 + Ionic | Specialite du dev, composants natifs iOS/Android automatiques |
| Runtime natif | Capacitor 6 | Acces APIs natives : audio background, notifs, fichiers |
| Langage | JavaScript (Composition API) | Maitrise du dev — PAS TypeScript |
| State | Pinia | Standard Vue 3, leger et reactif |
| Routing | Vue Router + Ionic Tabs | Navigation naturelle mobile |
| Storage local | capacitor-sqlite | Bible offline, donnees locales |
| Audio natif | @capacitor-community/audio | Background audio (ecran verrouille) |
| Notifications | @capacitor/push-notifications | FCM (Android) + APNs (iOS) |
| Publicite | capacitor-admob | Google AdMob plan gratuit |

### Backend
| Role | Technologie |
|------|------------|
| Base de donnees | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Magic Link) |
| Serverless | Supabase Edge Functions (Deno) |
| Vecteurs RAG | Supabase pgvector |
| Temps reel | Supabase Realtime |

### Infrastructure
| Role | Technologie |
|------|------------|
| Stockage fichiers audio | Cloudflare R2 (egress gratuit) |
| Landing page | Nuxt 3 + Vercel |

### APIs Externes
| Role | Service | Cout | Notes |
|------|---------|------|-------|
| Bible texte (offline, public domain) | LSG 1910 SQLite bundlee | Gratuit | Bundlee dans l'app |
| Bible texte (autres versions) | API.Bible + Free Use Bible API | Gratuit/partenariat | Telechargement a la demande |
| Bible audio (toutes versions) | BibleBrain / FCBH API | Gratuit (partenariat) | Enregistrements humains avec timestamps |
| LLM guide IA | OpenRouter | ~0,15$/M tokens | GPT-4o-mini ou Gemini Flash |
| TTS voix IA | OpenAI TTS | ~0,015$/1K chars | Uniquement pour reponses guide IA |
| Paiement local Android | KKiaPay + FedaPay SDK | ~2-3%/transaction | Mobile Money + cartes locales |
| Paiement iOS/diaspora | RevenueCat + Apple IAP | 15-30% stores | Cartes internationales |
| Publicite | Google AdMob | Revenus CPM | Plan gratuit uniquement |
| Analytics | PostHog | Gratuit < 1M events | |

> IMPORTANT : ElevenLabs n'est PAS utilise dans ce projet.
> La voix du guide IA utilise OpenAI TTS uniquement.
> L'audio Bible utilise exclusivement les enregistrements humains de BibleBrain.

---

## 4. Strategie Contenu Biblique (CRITIQUE)

Cette section explique comment obtenir et integrer tous les contenus bibliques
(textes et audios) dans l'application. C'est une des taches les plus importantes
du projet et elle conditionne toutes les fonctionnalites de lecture.

---

### 4.1 Textes Bibliques — Comment les obtenir

Les versions de la Bible se divisent en deux categories :

#### Versions domaine public (integrables librement, sans permission)

| Version | Langue | Source | Format |
|---------|--------|--------|--------|
| Louis Segond 1910 (LSG) | Francais | eBible.org | SQLite / JSON |
| Ostervald 1744 | Francais | eBible.org | SQLite / JSON |
| Darby 1885 | Francais | eBible.org | SQLite / JSON |
| King James Version (KJV) | Anglais | eBible.org | SQLite / JSON |
| World English Bible (WEB) | Anglais | eBible.org | SQLite / JSON |

**Processus d'integration :**
1. Telecharger le fichier depuis eBible.org (format USFM ou JSON disponible)
2. Convertir en SQLite avec un script de migration (une table `verses` avec book, chapter, verse, text)
3. Pour la LSG 1910 : la bundler directement dans l'app (`src/assets/bibles/lsg1910.db`)
4. Pour les autres versions public domain : les stocker sur Cloudflare R2, telechargement a la demande
5. Alternative : utiliser la Free Use Bible API (@helloao/cli, 1000+ traductions, aucune cle API)

#### Versions sous copyright (accord necessaire avant integration)

| Version | Langue | Comment l'obtenir |
|---------|--------|-----------------|
| Segond 21 (S21) | Francais | Contacter Societe Biblique de Geneve |
| NEG 1979 | Francais | Contacter Alliance Biblique Francaise |
| Bible en Francais Courant (BFC) | Francais | Alliance Biblique Francaise |

**Processus :**
- Contacter l'editeur AVANT d'integrer
- Obtenir un accord ecrit (souvent gratuit pour apps missionnaires)
- Ces versions sont disponibles via API.Bible apres accord avec ABS (American Bible Society)

**API.Bible** (api.scripture.api.bible) :
- Creer un compte developpeur gratuit
- Obtenir une cle API
- Lister les versions disponibles : `GET /bibles`
- Recuprer les chapitres : `GET /bibles/{bibleId}/chapters/{chapterId}`
- NE PAS appeler l'API a chaque lecture — toujours telecharger et mettre en cache localement

---

### 4.2 Audio Biblique — Comment l'obtenir

**Source unique : BibleBrain / Faith Comes By Hearing (FCBH)**
Site : biblebrain.com | API : 4.dbt.io

L'audio Bible existe deja, enregistre par des lecteurs humains professionnels.
Il est synchronise verset par verset avec des timestamps precis.
On ne genere pas d'audio Bible — on utilise ce qui existe.

#### Etape 1 : Obtenir une cle API BibleBrain
1. Aller sur biblebrain.com
2. Creer un compte developpeur (gratuit, immediat)
3. Obtenir la cle API (`key`)
4. Cette cle permet d'acceder a tout le contenu en developpement

#### Etape 2 : Lister les versions disponibles
```
GET https://4.dbt.io/api/bibles?language_code=fra&media=audio&key=CLE_API
-> Retourne la liste des versions audio disponibles en francais
```

#### Etape 3 : Pour chaque version, obtenir les fichiers audio
```
GET https://4.dbt.io/api/bibles/filesets/{filesetId}?key=CLE_API
-> Retourne les URLs des fichiers MP3 par livre/chapitre

GET https://4.dbt.io/api/timestamps/{filesetId}/{bookId}/{chapter}?key=CLE_API
-> Retourne les timestamps precis pour chaque verset (debut/fin en secondes)
```

#### Etape 4 : Strategie de livraison audio

**Option A — Streaming direct (MVP recommande)**
- L'app appelle BibleBrain API -> recoit l'URL du fichier audio
- Le player streame directement depuis le CDN de FCBH
- Aucun stockage necessaire, implementable immediatement
- Ideal pour le lancement

**Option B — Telechargement offline (Phase 2, premium)**
- L'utilisateur choisit une version a telecharger
- L'app recupere les fichiers MP3 depuis BibleBrain
- Les stocke sur le device via capacitor-filesystem
- Lecture offline disponible pour les abonnes premium

**Note sur le partenariat FCBH :**
- La cle dev permet les tests et le developpement sans restriction
- Pour la mise en production commerciale : contacter FCBH (biblebrain.com/contact)
- Leur mission = diffuser la Parole -> accord favorable pour les apps chretiennes
- Le contenu Bible (texte + audio) reste gratuit pour tous les utilisateurs d'Abide

#### Versions audio disponibles confirmees

| Langue | Versions disponibles | Notes |
|--------|---------------------|-------|
| Francais | LSG 1910, LSG dramatisee | Confirme sur BibleBrain |
| Anglais | KJV, WEB, dramatisee | Nombreuses options |
| Fongbe (Benin) | NT + portions | Via app "Benin Bible" FCBH |
| Yoruba | Disponible | Via FCBH |
| Autres langues beninnoises | Goun, Mina, Bariba | Via FCBH "Benin Bible" |

---

### 4.3 Implementation dans l'App — Architecture Donnees

```
Structure SQLite locale (Bible texte)
├── Table: versions
│   ├── id (ex: "LSG1910")
│   ├── name ("Louis Segond 1910")
│   ├── language ("fr")
│   ├── is_bundled (true/false)
│   ├── is_downloaded (true/false)
│   └── download_size_mb
│
├── Table: books
│   ├── version_id
│   ├── book_id (ex: "MAT")
│   ├── name ("Matthieu")
│   ├── testament ("NT" / "OT")
│   └── chapter_count
│
└── Table: verses
    ├── version_id
    ├── book_id
    ├── chapter
    ├── verse
    └── text

Structure Cloudflare R2 (Audio)
├── audio/
│   ├── {version_id}/
│   │   ├── {book_id}/
│   │   │   ├── {chapter}.mp3
│   │   │   └── {chapter}_timestamps.json
│   │   └── ...
│   └── ...
└── ai-tts-cache/
    └── {hash_du_contenu}.mp3    <- Cache reponses guide IA

Timestamps JSON format
{
  "verses": [
    { "verse": 1, "start": 0.0, "end": 4.2 },
    { "verse": 2, "start": 4.2, "end": 9.1 },
    ...
  ]
}
```

---

### 4.4 Processus de Developpement — Recuperation des Contenus Externes

Quand une fonctionnalite necessite du contenu externe (Bible, audio), voici le processus :

**Pour les textes :**
1. Verifier si la version est domaine public → eBible.org ou Free Use Bible API
2. Telecharger le fichier source (USFM/JSON)
3. Executer le script de conversion SQLite (`scripts/convert-bible.js`)
4. Pour LSG 1910 : copier dans `src/assets/bibles/`
5. Pour autres versions : uploader sur Cloudflare R2 sous `bibles/{version_id}.db`

**Pour les audios :**
1. Appeler BibleBrain API avec la cle dev pour lister les filesets disponibles
2. Documenter les IDs de fileset dans `src/lib/biblebrain.js`
3. En streaming MVP : passer directement l'URL au player audio
4. En mode offline : telecharger les MP3 et stocker sur R2 + device

**Variables d'environnement necessaires :**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BIBLEBRAIN_KEY=         <- Cle API BibleBrain (pas de prefix VITE si Edge Function)
VITE_OPENROUTER_KEY=         <- Attention : mettre en Edge Function, pas exposer au client
VITE_OPENAI_KEY=             <- Pour TTS, Edge Function uniquement
VITE_KKIAPAY_PUBLIC_KEY=
VITE_FEDAPAY_PUBLIC_KEY=
VITE_ADMOB_APP_ID=
```

---

## 5. Architecture de l'Application

### Vue Globale
```
Application Mobile (Vue 3 + Ionic + Capacitor)
  |
  |-- SQLite local (Bible texte, offline)
  |-- Audio Natif Capacitor (background, verrouillage)
  |-- Push Notifications (FCM + APNs)
  |-- KKiaPay + FedaPay SDK (paiement Android)
  |-- AdMob (publicites plan gratuit)
  |-- RevenueCat (abonnements iOS)
  |
  | HTTPS
  |
Supabase
  |-- PostgreSQL (donnees utilisateurs)
  |-- Auth (sessions, tokens)
  |-- Edge Functions (logique serveur critique)
  |-- pgvector (embeddings RAG)
  |
  |________|_________|
  |        |         |
OpenRouter FCBH API  Cloudflare R2
(LLM+TTS) (Audio)   (Fichiers audio caches)
```

### Donnees Locales (device)
- Bible LSG 1910 complete (SQLite bundlee, ~8MB, toujours disponible)
- Versions Bible telechargees par l'utilisateur (~10-15MB/version)
- Plan de lecture actif + progression du jour
- Cache audio recent (passages ecoutes recemment)
- Journal de prieres (offline-first, sync au retour en ligne)
- Preferences et parametres

### Donnees Serveur (Supabase)
- Profil utilisateur + statut premium
- Streak et statistiques cross-device
- Compteur sessions IA (OBLIGATOIREMENT cote serveur)
- Embeddings bibliques (pgvector pour RAG)

---

## 6. Structure Complete du Projet

```
abide/
|-- src/
|   |-- main.js
|   |-- App.vue
|   |
|   |-- router/
|   |   `-- index.js                    # Routes + guards auth
|   |
|   |-- stores/
|   |   |-- auth.js                     # Session, profil, is_premium
|   |   |-- bible.js                    # Version active, livre/chapitre courant
|   |   |-- audio.js                    # Etat player, file de lecture
|   |   |-- ai.js                       # Sessions IA, historique chat, mode actif
|   |   |-- plan.js                     # Plan de lecture actif, progression
|   |   |-- streak.js                   # Streak courant, stats
|   |   `-- ads.js                      # Etat AdMob, contexte d'affichage
|   |
|   |-- views/
|   |   |-- auth/
|   |   |   |-- LoginView.vue
|   |   |   |-- RegisterView.vue
|   |   |   `-- onboarding/
|   |   |       |-- Step1Needs.vue      # Besoins spirituels (anxiete/deuil/joie/leadership)
|   |   |       |-- Step2Time.vue       # Disponibilite (5/10/20 min/jour)
|   |   |       |-- Step3Church.vue     # Eglise d'appartenance
|   |   |       `-- Step4Pillar.vue     # Pilier recommande + confirmation
|   |   |
|   |   |-- tabs/
|   |   |   |-- TabsLayout.vue          # Barre 4 tabs (icones piliers)
|   |   |   |-- ImmersionTab.vue        # Pilier 1 : accueil Bible + plan du jour
|   |   |   |-- SanctuaireTab.vue       # Pilier 2 : priere + jeune
|   |   |   |-- AncreTab.vue            # Pilier 3 : guide IA
|   |   |   `-- PhareTab.vue            # Pilier 4 : evangelisation
|   |   |
|   |   |-- bible/
|   |   |   |-- BibleHomeView.vue       # Choix version + navigation livre
|   |   |   |-- BibleBookView.vue       # Liste chapitres d'un livre
|   |   |   `-- BibleChapterView.vue    # Lecteur verset par verset
|   |   |
|   |   |-- audio/
|   |   |   `-- AudioPlayerView.vue     # Player plein ecran avec controles
|   |   |
|   |   |-- ai/
|   |   |   |-- AIChatView.vue          # Chat avec guide IA (4 modes)
|   |   |   `-- SermonDecoderView.vue   # Upload audio -> resume + versets
|   |   |
|   |   |-- prayer/
|   |   |   |-- PrayerJournalView.vue   # Liste des prieres + ajout
|   |   |   `-- PrayerDetailView.vue    # Detail + marquer comme exaucee
|   |   |
|   |   |-- fasting/
|   |   |   `-- FastingView.vue         # Tracker jeune + defis 21/40/60j
|   |   |
|   |   |-- premium/
|   |   |   `-- PaywallView.vue         # Choix plan + boutons paiement
|   |   |
|   |   `-- settings/
|   |       `-- SettingsView.vue        # Heure notif, langue, version Bible
|   |
|   |-- components/
|   |   |-- bible/
|   |   |   |-- VerseItem.vue           # Rendu d'un verset (texte + numero)
|   |   |   |-- ChapterNavigator.vue    # Prev/Next chapitre
|   |   |   `-- VersionSelector.vue     # Selecteur version + download
|   |   |
|   |   |-- audio/
|   |   |   |-- MiniPlayer.vue          # Barre player persistante en bas
|   |   |   `-- FullPlayer.vue          # Controls complets (play/pause/speed)
|   |   |
|   |   |-- ai/
|   |   |   |-- ChatBubble.vue          # Bulle message (user ou IA)
|   |   |   |-- ModeSelector.vue        # Ens./Predication/Meditation/Theologie
|   |   |   `-- SessionCounter.vue      # "3 sessions restantes aujourd'hui"
|   |   |
|   |   |-- plan/
|   |   |   |-- DailyPlanCard.vue       # Carte plan du jour (chapitre + progres)
|   |   |   `-- StreakBadge.vue         # Badge nombre de jours consecutifs
|   |   |
|   |   |-- ads/
|   |   |   `-- AdBanner.vue            # Banniere AdMob (non-premium seulement)
|   |   |
|   |   |-- payment/
|   |   |   |-- PremiumGate.vue         # HOC : bloque si non-premium
|   |   |   `-- PaymentSheet.vue        # Modal : KKiaPay | FedaPay | IAP
|   |   |
|   |   `-- shared/
|   |       |-- AppHeader.vue
|   |       |-- LoadingSpinner.vue
|   |       `-- EmptyState.vue
|   |
|   |-- composables/
|   |   |-- useBible.js                 # CRUD SQLite, telechargement versions
|   |   |-- useAudio.js                 # BibleBrain API + player Capacitor
|   |   |-- useAI.js                    # Appel Edge Function ai-chat + streaming
|   |   |-- usePremium.js               # Verif statut + declenchement paywall
|   |   |-- useNotifications.js         # Enregistrement FCM/APNs + scheduling
|   |   `-- useAdMob.js                 # Init + show/hide selon contexte
|   |
|   |-- lib/
|   |   |-- supabase.js                 # Client Supabase initialise (singleton)
|   |   |-- openrouter.js               # (reserve, appels via Edge Function)
|   |   |-- bible-db.js                 # Interface SQLite : get verses, books, etc.
|   |   |-- biblebrain.js               # FCBH API : list versions, get audio URLs, timestamps
|   |   |-- tts.js                      # OpenAI TTS : synthese vocale reponses IA
|   |   |-- kkiapay.js                  # SDK KKiaPay initialisation + paiement
|   |   `-- admob.js                    # AdMob initialisation + banniere
|   |
|   `-- assets/
|       |-- bibles/
|       |   `-- lsg1910.db              # LSG 1910 bundlee (domaine public, ~8MB)
|       `-- sounds/                     # Soundscapes optionnels
|
|-- supabase/
|   |-- migrations/
|   |   |-- 001_profiles.sql
|   |   |-- 002_reading_progress.sql
|   |   |-- 003_reading_plans.sql
|   |   |-- 004_ai_sessions.sql
|   |   |-- 005_prayers.sql
|   |   `-- 006_bible_embeddings.sql
|   |
|   `-- functions/
|       |-- ai-chat/index.js            # Verif compteur + RAG + OpenRouter
|       |-- payment-webhook/index.js    # KKiaPay/RevenueCat -> activation premium
|       `-- push-cron/index.js          # Cron horaire -> notifications quotidiennes
|
|-- scripts/
|   |-- convert-bible.js               # Convertit USFM/JSON -> SQLite
|   `-- seed-embeddings.js             # Genere les embeddings pgvector depuis LSG
|
|-- tasks/
|   |-- todo.md
|   `-- lessons.md
|
|-- android/
|-- ios/
|-- capacitor.config.js
|-- ionic.config.json
|-- vite.config.js
|-- .env.local                         # Variables d'environnement (jamais commit)
|-- package.json
|-- PROJECT.md
|-- CLAUDE.md
|-- SECURITY.md
`-- design-pattern.md
```

---

## 7. Schema Base de Donnees

```sql
CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name      TEXT,
  church_name       TEXT,
  preferred_lang    TEXT DEFAULT 'fr',
  preferred_version TEXT DEFAULT 'LSG1910',
  daily_goal_min    INT DEFAULT 10,
  is_premium        BOOLEAN DEFAULT FALSE,
  premium_expires   TIMESTAMPTZ,
  premium_source    TEXT,   -- 'kkiapay'|'fedapay'|'apple_iap'|'google_iap'
  onboarding_done   BOOLEAN DEFAULT FALSE,
  onboarding_pillar TEXT,   -- 'immersion'|'sanctuaire'|'ancre'|'phare'
  notif_time        TIME DEFAULT '07:00:00',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reading_progress (
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  version   TEXT,
  book_id   TEXT,
  chapter   INT,
  read_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, version, book_id, chapter)
);

CREATE TABLE streaks (
  user_id         UUID PRIMARY KEY REFERENCES profiles(id),
  current_streak  INT DEFAULT 0,
  longest_streak  INT DEFAULT 0,
  last_active     DATE
);

CREATE TABLE reading_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type   TEXT NOT NULL,
  current_day INT DEFAULT 1,
  total_days  INT NOT NULL,
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  schedule    JSONB NOT NULL
);

-- CRITIQUE : source de verite du compteur IA, verifie cote serveur
CREATE TABLE ai_sessions (
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date           DATE DEFAULT CURRENT_DATE,
  sessions_used  INT DEFAULT 0,
  sessions_limit INT DEFAULT 1,   -- 1 gratuit / 5 premium
  PRIMARY KEY (user_id, date)
);

CREATE TABLE prayers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bible_embeddings (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version   TEXT NOT NULL,
  book      TEXT NOT NULL,
  chapter   INT NOT NULL,
  verse     INT NOT NULL,
  text      TEXT NOT NULL,
  embedding VECTOR(1536)
);
CREATE INDEX ON bible_embeddings USING ivfflat (embedding vector_cosine_ops);
```

---

## 8. Edge Functions Supabase

### ai-chat — Guide IA avec compteur de securite
```
POST /functions/v1/ai-chat
{ user_id, message, mode, passage_ref }

1. Verifier sessions_used < sessions_limit dans ai_sessions
   -> Si depasse : retourner 403 {"error": "daily_limit_reached"}
2. Embedder la question (OpenAI text-embedding-3-small)
3. Rechercher Top 5 versets pertinents dans bible_embeddings (pgvector)
4. Construire le prompt selon le mode :
   - Enseignement : analyse pedagogique + contexte historique
   - Predication : sermon structure, appellatif
   - Meditation : contemplation, lectio divina
   - Theologie : approfondissement doctrinal
5. Appeler OpenRouter (GPT-4o-mini ou Gemini Flash)
6. Incrementer sessions_used dans ai_sessions
7. Optionnel : generer audio via OpenAI TTS si requested=true
8. Retourner { text, audio_url? }
```

### payment-webhook — Activation premium securisee
```
POST /functions/v1/payment-webhook
Headers: X-Webhook-Signature

1. Valider signature HMAC du webhook entrant
2. Identifier la source (KKiaPay | FedaPay | RevenueCat)
3. Verifier le paiement en appelant l'API source (server-to-server)
4. Si valide :
   UPDATE profiles SET
     is_premium = true,
     premium_expires = NOW() + INTERVAL '30 days',
     premium_source = source
   WHERE id = user_id
   UPDATE ai_sessions SET sessions_limit = 5
     WHERE user_id = user_id AND date = CURRENT_DATE
5. Retourner 200
```

### push-cron — Notifications quotidiennes
```
CRON : toutes les heures (via pg_cron)
SELECT id, notif_time FROM profiles
WHERE notif_time >= NOW()::TIME AND notif_time < (NOW() + INTERVAL '1 hour')::TIME
-> Envoyer notification push personnalisee a chaque user via FCM/APNs
```

---

## 9. Parcours Utilisateur (User Journey)

### Premier lancement
```
Splash screen (2s)
     |
     v
Onboarding (premiere fois uniquement)
  -> Etape 1 : "Qu'est-ce qui te pese spirituellement en ce moment ?"
     (Anxiete / Manque de regularite / Deuil / Croissance)
  -> Etape 2 : "Combien de temps peux-tu donner a Dieu chaque jour ?"
     (5 min / 10 min / 20 min / Plus)
  -> Etape 3 : "Tu fais partie d'une eglise ?" (nom optionnel)
  -> Etape 4 : Pilier recommande + "Commencer avec [Immersion/Sanctuaire/Ancre/Phare]"
     |
     v
Creation de compte (email + Magic Link)
     |
     v
Page principale (TabsLayout) - Pilier recommande actif
```

### Session quotidienne type
```
Notification matin (7h par defaut) : "La journee a ete longue. 3 min avec Sa Parole ?"
     |
     v
Ouverture app -> Onglet Immersion
  -> Carte "Plan du jour" : chapitre recommande
  -> Bouton "Lire" ou "Ecouter"
     |
     v
[Option Lire] BibleChapterView
  -> LSG 1910 offline ou version telechargee
  -> Verset surligne, navigation chapitre suivant
  -> Mini player si audio actif

[Option Ecouter] AudioPlayerView
  -> Streaming BibleBrain (voix humaine)
  -> Texte defilant synchronise par verset
  -> Fonctionne en background (ecran verrouille)
     |
     v
Fin de session -> Mise a jour streak
  -> "5 jours consecutifs avec la Parole !"
  -> Badge streak mis a jour

[Plan gratuit] : Banniere AdMob sur la page de navigation
[Plan premium] : Zero publicite
```

### Interaction avec le Guide IA
```
Onglet "L'Ancre"
  -> SessionCounter : "3 sessions disponibles aujourd'hui"
  -> Choix du mode : Enseignement / Predication / Meditation / Theologie
  -> Choix du passage : saisie libre ou selection depuis lecteur Bible
     |
     v
Edge Function ai-chat
  1. Verif compteur (403 si depasse)
  2. RAG : versets pertinents
  3. LLM : generation contenu selon mode
  4. Affichage texte en streaming
     |
     v
Bouton "Ecouter" (premium) -> OpenAI TTS -> lecture audio de la reponse
```

### Passage au Premium
```
Feature bloquee (ex: 2e session IA) -> PremiumGate
     |
     v
PaywallView
  -> "Abide Plus — 1 000 FCFA/mois ou 5 000 FCFA/an"
  -> Bouton "Payer avec Mobile Money / Carte locale" -> KKiaPay ou FedaPay
  -> Bouton "Payer avec Apple Pay / Google Pay" -> RevenueCat IAP
     |
     v
Paiement confirme -> Webhook -> Supabase -> is_premium = true
  -> Retour app : acces debloque, publicites supprimees
```

---

## 10. Fonctionnalites par Phase

### Phase 1 — MVP (Semaines 1-6) | Gratuit + AdMob

**Auth & Onboarding**
- Inscription / Connexion email + Magic Link
- Questionnaire onboarding 4 etapes avec orientation pilier
- Profil de base (nom, eglise, disponibilite, langue)

**Pilier Immersion**
- Lecteur Bible LSG 1910 offline (SQLite bundlee, toujours disponible)
- Navigation livre / chapitre / verset + mode nuit/jour
- Surlignage de versets
- Audio Bible en streaming (BibleBrain, voix humaine, synchronisation par verset)
- Controls audio : play, pause, vitesse, chapitre suivant
- Background audio (ecran verrouille)
- Plan de lecture standard (7j / 30j / 90j) selon disponibilite
- Suivi progression quotidien
- Streak de constance (jours consecutifs)
- Flash-Verset (notification quotidienne avec un verset)
- Rappel quotidien (heure personnalisable)

**Publicites**
- Banniere AdMob sur les pages de navigation (jamais pendant lecture/audio/priere/IA)

**Infrastructure**
- Landing page Nuxt 3 (Vercel) + liste d'attente email
- Supabase : auth + tables + Edge Functions deployees
- Build iOS + Android via Capacitor fonctionnel et soumis aux stores

---

### Phase 2 — Premium (Semaines 7-12)

**Monetisation**
- KKiaPay SDK integre (Android, Mobile Money + cartes locales)
- FedaPay SDK integre (Android, alternative beninoise)
- RevenueCat + Apple IAP (iOS, cartes internationales)
- Webhook paiement -> activation premium Supabase
- Suppression totale AdMob pour les premium
- PaywallView avec presentation des deux plans

**Pilier L'Ancre — Guide IA**
- Chat IA (4 modes : Enseignement, Predication, Meditation, Theologie)
- Architecture RAG (pgvector + LSG embeddings)
- Compteur sessions : 1/jour gratuit -> 5/jour premium
- Vérification compteur en Edge Function (jamais cote client)
- Ecoute audio des reponses IA (OpenAI TTS, premium uniquement)
- Cache TTS sur Cloudflare R2 (ne pas regenerer si deja existant)
- Decrypteur de predications (upload audio -> resume + versets cles)

**Pilier Sanctuaire**
- Journal de prieres (ajout, suivi, marquer comme exauce)
- Timeline des exaucements (historique de gratitude)
- Tracker de jeune avec meditations aux heures de faim
- Defis 21 / 40 / 60 jours

**Versions Bible**
- Telechargement de versions supplementaires (S21, NEG, KJV, WEB...)
- Gestionnaire avec taille et etat de telechargement
- Audio offline pour les versions telechargees (premium)

---

### Phase 3 — Croissance (Mois 3-6)

- Pilier Phare : parcours evangelisation gamifie + hub mentors
- Notifications geolocalisees (rappels selon lieu)
- Bible en Fon + langues beninnoises (via FCBH "Benin Bible")
- Version anglaise complete (KJV + BibleBrain EN)
- Partage de versets (image generee + texte, reseaux sociaux)
- Liens d'affiliation trackes (pasteurs, influenceurs)
- Optimisations perf Ionic (lazy loading, virtual scroll Bible)
- Mode offline complet avec sync intelligente

---

## 11. Modele Economique

| Plan | Prix | Contenu | Publicites |
|------|------|---------|------------|
| Gratuit | 0 | Bible LSG + BibleBrain audio + plan standard + 1 session IA/j | AdMob actif |
| Abide Plus | 1 000 FCFA/mois ou 5 000 FCFA/an | Tout + IA complete (5 sessions/j) + TTS + versions+ + jeune + evangelisation | Zero pub |

**Revenus additionnels :** AdMob CPM, affiliations, partenariats eglises/etats.

---

## 12. Regles Metier Non Negociables

1. Le statut premium est valide UNIQUEMENT via webhook Supabase — jamais depuis le client
2. Le compteur IA est verifie en Edge Function AVANT chaque appel LLM — jamais cote client
3. AdMob ne s'affiche JAMAIS pendant : lecture Bible, audio, priere, session IA
4. Les textes Bible sous copyright ne sont jamais integres sans accord ecrit
5. L'audio Bible provient EXCLUSIVEMENT de BibleBrain/FCBH — zero TTS pour les textes sacres
6. OpenAI TTS est utilise UNIQUEMENT pour vocaliser les reponses du guide IA
7. Tout paiement est valide server-to-server avant activation premium
8. Les cles API ne sont jamais exposees cote client (sauf VITE_ pour public keys)

---

## 13. Changelog

| Date | Version | Changement |
|------|---------|------------|
| Juin 2026 | 1.0 | Creation initiale |
| Juin 2026 | 1.1 | Ajout strategie contenu biblique + parcours utilisateur |
