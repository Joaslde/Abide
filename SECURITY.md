# SECURITY.md — Abide | Règles de Sécurité Non Négociables

> À LIRE INTÉGRALEMENT avant toute fonctionnalité touchant : auth, paiements,
> données utilisateur, IA, appels API externes, ou stockage.
>
> Ces règles ne sont pas des suggestions. Une seule faille ici peut coûter
> des milliers de dollars (IA non limitée), exposer les données de tous les
> utilisateurs (RLS désactivé), ou faire bannir l'app (paiements non conformes).
>
> RÈGLE D'OR : Ne jamais faire confiance au client. Le téléphone de l'utilisateur
> est un environnement hostile. Tout ce qui compte se valide côté serveur.

---

## 0. Les 10 Commandements (résumé exécutable)

1. Le client ne décide JAMAIS de rien d'important (premium, limites, prix)
2. RLS activé sur 100% des tables, sans exception
3. Aucun secret dans le code client (uniquement Edge Functions)
4. Toute limite (IA, API) vérifiée côté serveur AVANT l'action coûteuse
5. Tout paiement validé server-to-server avant d'accorder quoi que ce soit
6. Tout input utilisateur est hostile jusqu'à preuve du contraire
7. Rate limiting sur tout ce qui coûte de l'argent ou peut être abusé
8. Les webhooks sont signés et vérifiés, jamais traités à l'aveugle
9. Logs et monitoring sur tout ce qui touche l'argent et l'IA
10. En cas de doute sur la sécurité d'une approche, choisir la plus stricte

---

## 1. Authentification & Sessions

### Règles absolues
- Utiliser Supabase Auth — ne jamais coder son propre système d'auth maison
- Les mots de passe ne sont JAMAIS stockés ou loggés en clair (Supabase gère le hash)
- Imposer une politique de mot de passe : minimum 8 caractères
- Activer la confirmation email obligatoire avant accès aux fonctionnalités
- Les tokens de session sont stockés de manière sécurisée (capacitor-preferences, pas localStorage web exposé)

### Protection contre les attaques
- **Bruteforce login** : activer le rate limiting Supabase Auth (tentatives limitées par IP/email)
- **Énumération de comptes** : message d'erreur générique ("identifiants incorrects"), ne jamais révéler si l'email existe
- **Token theft** : durée de vie courte des access tokens + refresh tokens, rotation activée
- **Session hijacking** : forcer HTTPS partout, jamais de token dans une URL

### OAuth Google
- Valider le `redirect_uri` strictement (whitelist des deep links autorisés)
- Vérifier le state OAuth pour prévenir le CSRF
- Ne jamais accepter un token OAuth sans le valider auprès de Google

### Suppression de compte (RGPD)
- Cascade complète : supprimer profil, prières, progression, sessions IA, embeddings liés
- Confirmer l'identité avant suppression
- Suppression réelle, pas juste un flag "deleted"

---

## 2. Row Level Security (RLS) — Supabase

### Non négociable
- **RLS est activé sur TOUTES les tables. Aucune exception.**
- Une table sans policy RLS = données accessibles par n'importe qui avec la clé anon
- Tester chaque policy : un user ne doit JAMAIS pouvoir lire/écrire les données d'un autre

### Policies par table
```sql
-- profiles : chaque user accède uniquement à son profil
CREATE POLICY "own_profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- reading_progress : uniquement ses propres données
CREATE POLICY "own_progress" ON reading_progress
  FOR ALL USING (auth.uid() = user_id);

-- prayers : strictement privé
CREATE POLICY "own_prayers" ON prayers
  FOR ALL USING (auth.uid() = user_id);

-- ai_sessions : LECTURE SEULE pour le client, écriture réservée aux Edge Functions
CREATE POLICY "read_own_sessions" ON ai_sessions
  FOR SELECT USING (auth.uid() = user_id);
-- PAS de policy INSERT/UPDATE pour le client → seules les Edge Functions
-- (service_role) peuvent modifier le compteur

-- bible_embeddings : lecture publique (contenu non sensible), pas d'écriture client
CREATE POLICY "read_embeddings" ON bible_embeddings
  FOR SELECT USING (true);
```

### Champs critiques jamais modifiables par le client
- `profiles.is_premium` — JAMAIS modifiable côté client (uniquement Edge Function service_role)
- `profiles.premium_expires` — idem
- `profiles.premium_source` — idem
- `ai_sessions.sessions_used` — idem
- `ai_sessions.sessions_limit` — idem

> Ces champs sont la cible n°1 d'un attaquant. S'ils sont modifiables côté
> client, n'importe qui devient premium gratuitement et l'IA devient illimitée.

---

## 3. Gestion des Secrets & Clés API

### Classification des clés
| Clé | Où elle vit | Exposable au client ? |
|-----|-------------|----------------------|
| Supabase anon key | Client (VITE_) | OUI (protégée par RLS) |
| Supabase service_role key | Edge Functions UNIQUEMENT | JAMAIS |
| OpenRouter API key | Edge Functions UNIQUEMENT | JAMAIS |
| OpenAI API key (TTS) | Edge Functions UNIQUEMENT | JAMAIS |
| BibleBrain key | Edge Function (proxy recommandé) | À éviter côté client |
| KKiaPay public key | Client (VITE_) | OUI (clé publique) |
| KKiaPay private key | Edge Functions UNIQUEMENT | JAMAIS |
| AdMob App ID | Client | OUI (public par nature) |
| Cloudflare R2 access/secret keys | Scripts LOCAUX d'upload UNIQUEMENT | JAMAIS dans l'app |
| URL publique R2 + manifeste Bible | Client (VITE_) | OUI (contenu public, lecture seule) |

### Règles
- Les clés sont dans `.env.local` (jamais commité) — `.gitignore` vérifié
- Seules les variables `VITE_` sont exposées au client
- Une clé `VITE_` ne contient JAMAIS un secret
- Les secrets serveur sont dans les Supabase Edge Functions Secrets (`supabase secrets set`)
- Rotation des clés possible sans redéploiement du client (clés serveur)
- Si une clé fuit : la révoquer immédiatement et la régénérer

### Le piège mortel : OpenRouter côté client
- Ne JAMAIS mettre la clé OpenRouter dans l'app
- Un attaquant qui extrait la clé du bundle peut générer pour des milliers de dollars sur ton compte
- TOUS les appels LLM passent par l'Edge Function `ai-chat` qui détient la clé

### Bucket R2 public (versions Bible téléchargeables) — séparation stricte
- Le bucket R2 public ne contient QUE des fichiers publics, en LECTURE SEULE :
  des `.db` de Bible (texte du domaine public) + le manifeste JSON des versions.
- Il ne contient AUCUN secret et AUCUNE donnée utilisateur. Les données utilisateurs
  (profils, prières, premium…) vivent dans Supabase PostgreSQL, protégées par RLS,
  sur un service totalement séparé. Un bucket R2 public n'ouvre AUCUN chemin vers Supabase.
- L'app ne fait que TÉLÉCHARGER une URL publique. Les clés secrètes R2 (write) restent
  sur la machine de dev (scripts `generate-version.js` / `upload-version.js`) — jamais dans l'APK.
- « Public » = lecture seule : personne ne peut écrire/modifier le bucket sans les clés secrètes.
- Mettre les clés R2 dans l'app serait le vrai danger (accès write si décompilation) → on passe
  donc toujours par URL publique, jamais par clés côté client.

---

## 4. Sécurité de l'IA (le risque financier n°1)

### Le scénario catastrophe
Sans protection, un utilisateur (ou un bot) peut :
- Spammer l'endpoint IA → facture OpenRouter explosive
- Extraire la clé API → utilisation illimitée sur ton compte
- Envoyer des prompts géants → coût par requête démultiplié
- Détourner l'IA de sa fonction (jailbreak, génération de contenu hors-sujet)

### Protections obligatoires

**Compteur de sessions (côté serveur, absolu)**
- Vérifié dans l'Edge Function ai-chat AVANT tout appel à OpenRouter
- Si `sessions_used >= sessions_limit` → 403, l'appel LLM n'a jamais lieu
- Le compteur est en base (ai_sessions), modifiable uniquement par service_role
- Reset quotidien (clé = user_id + date)

**Limite de taille des inputs**
- Longueur max du message utilisateur (ex: 2 000 caractères)
- Rejeter au-delà AVANT d'appeler le LLM
- Limiter le nombre de tokens en sortie (max_tokens dans la requête)

**Rate limiting par utilisateur**
- Limiter le nombre de requêtes IA par minute (ex: 5/min même pour premium)
- Empêche le spam même dans la limite quotidienne de sessions
- Implémenté via un compteur temporel en base ou en cache

**Protection du prompt système**
- Le prompt système (instructions du guide IA) vit dans l'Edge Function, pas dans le client
- Instructions strictes : rester dans le rôle (guide spirituel chrétien), refuser le hors-sujet
- Ne jamais exposer le prompt système à l'utilisateur
- Filtrer/refuser les tentatives de jailbreak ("ignore tes instructions", etc.)

**Monitoring des coûts IA**
- Logger chaque appel IA (user_id, tokens utilisés, coût estimé, timestamp)
- Alerte automatique si le coût quotidien dépasse un seuil défini
- Dashboard de suivi des coûts par jour
- Détection d'anomalie : un user qui consomme anormalement → investigation

**Qualité théologique (risque réputationnel)**
- RAG obligatoire : ancrer les réponses dans les versets réels (pgvector)
- Avertissement clair dans l'app : "outil d'aide, pas un substitut au pasteur"
- Mécanisme de signalement des mauvaises réponses
- Modération : logguer les réponses signalées pour révision

---

## 5. Sécurité des Paiements

### Règle fondamentale
**Le client ne déclare JAMAIS qu'il a payé. Le serveur le vérifie.**

### Flux sécurisé obligatoire
1. L'utilisateur initie le paiement (KKiaPay/FedaPay/IAP)
2. Le prestataire de paiement traite la transaction
3. Le prestataire envoie un **webhook signé** à l'Edge Function payment-webhook
4. L'Edge Function **valide la signature** du webhook (HMAC)
5. L'Edge Function **appelle l'API du prestataire** pour confirmer la transaction (server-to-server)
6. Seulement si confirmé → `is_premium = true` (via service_role)

### Ce qui est INTERDIT
- Activer le premium parce que le client envoie "j'ai payé" → JAMAIS
- Faire confiance au montant envoyé par le client → toujours vérifier côté serveur
- Traiter un webhook sans valider sa signature → faille critique
- Stocker des données de carte bancaire → jamais (les prestataires s'en chargent)

### Protections webhook
- Valider la signature HMAC de chaque webhook entrant
- Vérifier que la transaction existe vraiment auprès du prestataire
- Idempotence : un même webhook reçu 2 fois ne double pas l'abonnement
- Vérifier le montant et la devise attendus
- Logger tous les événements de paiement (audit trail)

### Validation des reçus IAP (Apple/Google)
- Valider les reçus Apple côté serveur auprès des serveurs Apple
- Valider les achats Google côté serveur auprès de l'API Google Play
- RevenueCat gère cette validation — ne jamais la court-circuiter

### Conformité stores
- Respecter les règles Apple/Google sur les paiements digitaux
- iOS : présenter l'IAP comme requis par Apple
- Ne jamais essayer de contourner les règles des stores de façon détectable

---

## 6. Validation des Inputs (tout input est hostile)

### Règles générales
- Valider TOUS les inputs côté serveur, même si déjà validés côté client
- La validation client est pour l'UX, la validation serveur est pour la sécurité
- Whitelist plutôt que blacklist (autoriser ce qui est connu bon)

### Injection SQL
- Toujours utiliser les requêtes paramétrées Supabase (jamais de concaténation de chaînes)
- Ne jamais construire de SQL avec des inputs utilisateur bruts
- Le query builder Supabase protège par défaut — ne pas le contourner

### Injection de prompt (IA)
- Traiter le message utilisateur comme une donnée, pas comme une instruction
- Séparer clairement le prompt système des inputs utilisateur
- Détecter et neutraliser les tentatives de manipulation

### XSS (contenu affiché)
- Échapper tout contenu utilisateur affiché (Vue le fait par défaut avec `{{ }}`)
- Ne JAMAIS utiliser `v-html` avec du contenu utilisateur non assaini
- Méfiance avec le contenu généré par l'IA affiché en HTML

### Upload de fichiers (décrypteur de prédications)
- Limiter la taille des fichiers audio uploadés
- Valider le type MIME réel (pas juste l'extension)
- Scanner/limiter avant traitement
- Stocker hors de la racine web, jamais exécutable

---

## 7. Rate Limiting & Protection contre l'Abus

### Endpoints à protéger absolument
| Endpoint | Limite recommandée | Raison |
|----------|-------------------|--------|
| ai-chat | 5/min + quota quotidien | Coût LLM |
| TTS (audio IA) | Quota + cache | Coût OpenAI |
| Auth login | 5-10/min par IP | Anti-bruteforce |
| Register | Limité par IP | Anti-spam comptes |
| payment-webhook | Idempotence | Anti-replay |
| Téléchargement Bible | Raisonnable | Bande passante R2 |

### Implémentation
- Rate limiting au niveau Edge Function (compteur en base ou cache)
- Rate limiting Supabase Auth (intégré)
- Cloudflare devant les assets (protection DDoS + rate limiting)
- Réponses 429 (Too Many Requests) propres avec retry-after

### Protection serveur
- Pas de requête non authentifiée vers les endpoints sensibles
- Timeout sur les appels externes (ne pas bloquer indéfiniment)
- Circuit breaker si un service externe est down (ne pas cascader les erreurs)

---

## 8. Sécurité du Stockage & Données

### Données locales (device)
- Les données sensibles locales sont dans le storage sécurisé Capacitor
- La Bible et les audios téléchargés ne sont pas sensibles (contenu public)
- Le token de session est stocké de manière sécurisée

### Cloudflare R2
- Buckets privés par défaut (pas d'accès public direct sauf contenu Bible)
- URLs signées pour le contenu premium si nécessaire
- CORS configuré strictement (uniquement les domaines autorisés)
- Pas de listing public des buckets

### Données en transit
- HTTPS/TLS partout, sans exception
- Certificate pinning envisageable pour les appels critiques (paiement)

### Données personnelles (RGPD / protection)
- Collecter le minimum nécessaire (église = optionnel)
- Politique de confidentialité claire et accessible
- Droit à l'export et à la suppression des données
- Ne pas logger de données personnelles sensibles
- Les données agrégées (partenariats églises) sont anonymisées

---

## 9. Edge Functions — Sécurité

### Règles
- Toujours vérifier l'authentification au début (sauf webhooks signés)
- Utiliser service_role uniquement pour les opérations légitimes (jamais exposé)
- Valider tous les inputs reçus
- Gérer les erreurs sans fuiter d'informations sensibles (pas de stack trace au client)
- Timeout sur les appels externes
- Logger les opérations sensibles (sans données personnelles)

### Le piège service_role
- La clé service_role BYPASSE le RLS — pouvoir total sur la base
- Elle vit UNIQUEMENT dans les Edge Functions, jamais exposée
- Une Edge Function avec service_role doit valider rigoureusement qui appelle et pourquoi
- Ne jamais relayer une action client directement avec service_role sans validation

---

## 10. Sécurité Mobile (Capacitor)

### Build & distribution
- Activer le code obfuscation/minification en production
- Ne pas laisser de logs de debug en production
- Désactiver le mode debug WebView en production
- Vérifier les permissions natives demandées (minimum nécessaire)

### Permissions
- Demander uniquement les permissions utilisées (notifications, stockage)
- Justifier chaque permission (requis par les stores)
- Géolocalisation (Phase 3) : demander au moment de l'usage, pas au démarrage

### Deep links
- Valider strictement les deep links entrants (auth callback, paiement)
- Ne jamais exécuter d'action sensible sur un deep link non vérifié

### Communication WebView ↔ Natif
- Valider les données passées entre la couche web et native
- Ne pas exposer d'API native sensible à du JS non contrôlé

---

## 11. Monitoring & Détection d'Incidents

### À monitorer en permanence
- Coûts IA quotidiens (alerte si dépassement de seuil)
- Coûts TTS
- Taux d'erreur des Edge Functions
- Tentatives d'authentification échouées (pics = attaque)
- Webhooks de paiement échoués ou suspects
- Utilisation anormale par utilisateur (spam, abus)
- Bande passante R2 (pics inattendus)

### Outils
- PostHog pour l'analytics et la détection de comportements anormaux
- Logs Supabase Edge Functions
- Dashboard de coûts (IA, TTS, infra)
- Monitoring d'erreurs (Sentry recommandé en Phase 3)

### Réponse aux incidents
- Procédure de révocation de clé en cas de fuite
- Capacité à désactiver une fonctionnalité (feature flag) en urgence
- Capacité à bloquer un utilisateur abusif
- Sauvegarde régulière de la base (Supabase backups activés)

---

## 12. Performance (éviter les bugs et la surexploitation)

### Base de données
- Index sur toutes les colonnes utilisées dans les WHERE et JOIN
- Index ivfflat sur les embeddings (recherche vectorielle rapide)
- Éviter les requêtes N+1 (charger en batch)
- Pagination sur toutes les listes longues (prières, progression)
- Ne jamais charger toute la Bible serveur (elle est en local SQLite)

### Appels réseau
- Mettre en cache ce qui est cachable (réponses TTS, audio, versets)
- Ne jamais appeler une API à chaque scroll/frappe (debounce)
- Lecture Bible = SQLite local, JAMAIS d'appel réseau par verset
- Audio = streaming ou téléchargé une fois, pas re-téléchargé

### Coûts maîtrisés
- Cache TTS sur R2 (un passage généré une fois = servi gratuitement ensuite)
- Cache des réponses IA fréquentes si pertinent
- Egress R2 gratuit (pas de surprise de bande passante)
- Modèle LLM économique par défaut (GPT-4o-mini, pas GPT-4o)

### Mobile
- Lazy loading des écrans et modules lourds
- Virtual scroll pour les longues listes (Bible)
- Optimiser la taille du bundle
- Décharger l'audio non utilisé de la mémoire

---

## 13. Checklist Avant Chaque Déploiement

- [ ] RLS activé et testé sur toutes les nouvelles tables
- [ ] Aucun secret dans le code client (grep des clés)
- [ ] Tous les nouveaux endpoints sensibles ont une vérification d'auth
- [ ] Les limites IA/rate limiting sont en place côté serveur
- [ ] Les inputs utilisateur sont validés côté serveur
- [ ] Les webhooks valident leur signature
- [ ] Pas de logs de debug en production
- [ ] Les variables d'env de production sont correctes
- [ ] Les permissions natives sont justifiées et minimales
- [ ] Le monitoring/alerting couvre les nouveaux endpoints coûteux

---

## 14. En Cas de Doute

Si une approche pourrait potentiellement :
- Exposer des données utilisateur
- Permettre de contourner une limite ou un paiement
- Coûter de l'argent de façon non contrôlée
- Faire confiance au client pour quelque chose d'important

→ **STOP. Choisir l'approche la plus stricte. Documenter la décision dans lessons.md.**

La sécurité n'est jamais "on verra plus tard". Une faille en production coûte
infiniment plus cher que le temps de bien faire dès le début.

---

*Document vivant — à enrichir à chaque nouvelle faille identifiée ou règle adoptée.*
*Dernière mise à jour : Juin 2026*
