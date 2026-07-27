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

## ⚠️ COORDINATION — 2 SESSIONS EN PARALLÈLE (2026-07-25)

> Deux sessions Claude travaillent en même temps sur ce projet. Règles de non-collision :
>
> | Session | Périmètre EXCLUSIF |
> |---------|--------------------|
> | **A — Parrainage** | migrations `referrals`/`referral_code`, **trigger `protect_premium_columns`**, Edge Functions `referral-*`, SDK AppsFlyer, `ReferralView.vue` |
> | **B — Limites IA** | Edge Function `ai-chat` (quota), table `ai_sessions`, écran « quota atteint » côté client |
>
> - Le **trigger `protect_premium_columns` appartient à la session Parrainage** (Étape 0
>   de son plan, et sa logique de paliers doit pouvoir écrire `premium_expires` côté serveur).
>   La session Limites IA n'y touche PAS.
> - `tasks/todo.md` : mis à jour par la session Limites IA le 2026-07-25 (état réel remis à
>   plat, cf. ci-dessous). Le Parrainage part de cette base.

---

## ÉTAT RÉEL VALIDÉ SUR APPAREIL — 2026-07-26 (fin de journée)

> Mis à jour après vérification indépendante (base Supabase interrogée directement,
> pas de confiance aveugle dans les cases cochées précédentes). Ce qui suit fait foi.

**✅ FONCTIONNE, testé sur Android réel :**
- Quiz de chapitre (génération IA, étoiles, rejeu, variété garantie, quota 5/jour)
- Guide IA : quota 7 msg/jour, langue de réponse suit l'interface OU le message
  de l'utilisateur, mémoire de conversation adaptée à la langue
- Surlignages, Note IA (export message → remarque, badge doré)
- Parcours onboarding complet
- Téléchargement d'une version Bible + lecture offline + **bascule auto langue↔version**
  (si version installée) + **proposition de téléchargement** si absente
- Pubs AdMob (interstitiels de TEST)
- Streak / flammes, audio en background
- Google Sign-In natif + OAuth **publié en production**
- Session persistante, navigation Welcome/onboarding conforme au spec
- **Catalogue de 13 plans de lecture** (4 vie · 5 biblique · 4 discipline), vignettes
  vérifiées visuellement, aperçu jour par jour avant activation, vue du parcours
  en cours avec progression, lien depuis Plus
- **Programme de parrainage COMPLET** — vérifié en base réelle (trigger sécurité actif,
  table `referrals` + `referral_code` présents), Edge Functions déployées, OneLink
  configuré, écran fonctionnel. Le parcours d'attribution réel (installation via lien →
  compte → filleul compté) n'est PAS encore testable : nécessite la publication Play Store.
- **Faille RLS `is_premium` CORRIGÉE** — trigger `protect_premium_columns` actif en prod.

**✅ Plans par profil — FAIT (2026-07-27)** : `PROFILE_PRESET_IDS` (planGenerator.js)
associe chacun des 5 profils onboarding à un VRAI preset (plus de portée générique) :
source→learn-to-pray · marcheur→creation-to-covenant · explorateur→identity-in-christ ·
veilleur→peace-over-anxiety · porteur→**sharing-your-faith (nouveau 14e plan, créé pour
combler ce profil**, vignette vérifiée visuellement, 0 erreur de validation canon).
« Plan selon mon profil » sans profil détecté → alerte + bouton vers l'onboarding
(déjà en place dans PlanChooseView, i18n `plan.choose.noProfile*`).

**🚧 CE QU'IL RESTE VRAIMENT POUR LE MVP :**
1. **Publication Play Store** — voir section dédiée ci-dessous. C'est le seul gros morceau restant.
2. **SMTP Resend** — compte + domaine en cours côté utilisateur ; clé à fournir, puis
   configuration du template OTP dans Supabase → débloque le mot de passe oublié.
3. **Mini-site (landing + politique de confidentialité)** — livré dans `landing/`
   (index/privacy/terms, statique, zéro dépendance), en attente de déploiement par
   l'utilisateur puis fourniture des URLs finales (fiche Play Console + SettingsView).

**✅ Code de parrainage manuel à l'onboarding — FAIT (2026-07-27)**
> Contournement TEMPORAIRE : le lien OneLink ne peut pas être testé tant que l'app
> n'est pas publiée (redirige vers une fiche Play Store inexistante). En attendant :
- [x] `OnboardingReferralView.vue` — nouvel écran entre Welcome et Quiz : « As-tu été
      invité par un ami ? » Oui/Non → si Oui, champ code (optionnel, passable) →
      appelle `referral-attribute` directement (même Edge Function, idempotente)
- [x] Route `/onboarding/referral`, `OnboardingWelcomeView.startQuiz()` y redirige
- [x] `src/lib/appsflyer.js` : `storePendingReferralCode` exportée (réutilisable)
- [x] `ReferralView.vue` : bouton « Partager mon lien » **commenté** (pas supprimé)
      avec justification inline — le code reste affiché pour transmission à l'oral
- [x] i18n fr/en `onboarding.referral.*`
- [x] `vite build` OK, APK installé
- [ ] ⚠️ À TESTER : onboarding → répondre Oui → coller un vrai code de parrainage
      existant → doit incrémenter le compteur de filleuls du parrain (vérifier dans
      ReferralView du COMPTE PARRAIN) · code invalide → message d'erreur clair ·
      Non/Passer → onboarding continue normalement
- [ ] Réactiver le partage de lien (décommenter `ReferralView.vue`) une fois l'app
      publiée sur le Play Store et le OneLink vérifié fonctionnel en conditions réelles
- [x] Vérifié : `isPremium` (parrainage) coupe déjà les pubs automatiquement
      (`stores/ads.js` teste `!isPremium` avant chaque appel AdMob) — rien à faire

**⚠️ Icône/screenshots/politique de confidentialité ne sont PAS reportables — Google
Play les EXIGE dès la 1re soumission. Décision utilisateur : version PROVISOIRE de
chacun maintenant → publication → remplacement par les versions définitives via une
mise à jour ultérieure (rapide à approuver). Voir section « Publication Play Store ».**

**⏸️ VRAIMENT REPORTABLE APRÈS LE DÉPLOIEMENT :**
- Icône app + splash screen DÉFINITIFS (une version provisoire suffit pour publier)
- Notifications push serveur (les notifications LOCALES couvrent déjà les besoins)
- **iOS entièrement** — lancement Android d'abord, un Mac sera obtenu plus tard
- Paiements (KKiaPay/FedaPay/RevenueCat) — le MVP reste 100 % gratuit
- Vraies publicités AdMob : rester en mode TEST jusqu'au lancement (voir §1.7)

---

## En Cours

### Bascule langue ↔ version Bible — BUG CORRIGÉ ✅ (2026-07-26)
- [x] `setLocalePref` appelait `versions.installed` SANS avoir appelé `loadInstalled()`
      → depuis les Réglages, la liste ne contenait que la LSG bundlée, donc la KJV
      pourtant téléchargée n'était jamais trouvée. Fix : `await versions.loadInstalled()`
      avant la recherche + on ne touche à rien si la version active est déjà dans la
      bonne langue (respecte un choix manuel). Cf. lessons.md.
- [ ] ⚠️ À TESTER : KJV téléchargée → Réglages › Langue › English → la Bible doit
      basculer seule (verset du jour, lecture) · retour en Français → LSG

- [x] **Proposition de téléchargement faite** (2026-07-26) : `setLocalePref` retourne
      `{ noBibleVersion }` (pas d'accès UI dans le store) ; `LanguageView.vue` affiche
      une alerte « Bible en anglais indisponible → Télécharger ? » qui mène au store
      de versions (`/tabs/immersion/store`) si aucune version dans la nouvelle langue
      n'est installée. i18n fr/en (`settings.noBibleInLanguage.*`). Décision utilisateur :
      pas de bundling KJV (poids +6,3 Mo pour tous, préféré la proposition ciblée).
- [ ] ⚠️ À TESTER : passer en anglais SANS version anglaise → alerte → Télécharger →
      store de versions · passer en anglais AVEC KJV déjà installée → bascule silencieuse
      (pas d'alerte, comportement du fix précédent)

### Écran de détail / parcours d'un plan 🚧 (planifié 2026-07-26)
> Demandé par l'utilisateur : avant d'activer un plan, voir le détail JOUR PAR JOUR
> des passages (défilable), avec le bouton « Commencer » / « Remplacer » en bas.
> Et depuis l'accueil, un bouton pour revoir son parcours (jours faits / restants).
> UN SEUL composant, deux modes — évite de dupliquer la liste jour par jour.

- [x] `PlanDetailView.vue` : liste jour par jour (Jour N + chapitres cliquables), défilable
- [x] Mode APERÇU (`plan/preview/:templateId`) : titre + image + desc + CTA bas
      (« Commencer » ou « Remplacer le plan en cours » si un plan est déjà actif)
- [x] Mode PARCOURS (`plan/journey`) : plan actif, jours complétés ✓, jour courant mis
      en avant, jours à venir estompés
- [x] PlanChooseView : cliquer un parcours ouvre l'APERÇU (au lieu de créer directement)
- [x] DailyPlanCard (accueil) : bouton « Voir tout le parcours » → mode PARCOURS
- [x] PlusTab : lien « Ma lecture » → plans de lecture
- [x] i18n fr/en (`plan.preview.*`, `plan.journey.*`, `plus.myReading`)
- [x] `vite build` OK
- [ ] ⚠️ À TESTER SUR APPAREIL : cliquer un plan → aperçu jour par jour défilable →
      Commencer → accueil · « Voir tout le parcours » → jours ✓/courant/à venir ·
      remplacer un plan en cours (confirmation) · Plus › Ma lecture

### Catalogue de plans de lecture ✅ (2026-07-26)
> 12 nouveaux plans thématiques (+ « Connaître Jésus » existant = 13), générés par
> IA externe puis **validés par script contre le CANON** (livre existant, chapitre
> <= nb réel, aucun doublon, aucun jour vide) → 0 erreur.
> Répartition : 4 « vie » · 5 « biblique » · 4 « discipline ».

- [x] 12 plans intégrés dans `src/data/presetPlans.js` (généré par script, pas à la main)
- [x] Champ `category` + `PLAN_CATEGORIES` + `presetsByCategory()` → écran de choix groupé
- [x] i18n fr **et** en : `plan.presets.<id>.title/desc` + `plan.categories.*`
- [x] Vignettes carrées : `scripts/fetch-plan-thumbs.js` (Unsplash, licence commerciale),
      bundlées dans `src/assets/plans/<id>.webp` — 82 Ko au total, 100 % offline
- [x] **Revue visuelle faite** : 6 images inadaptées détectées et remplacées
      (posture de yoga, poignée de main corporate, doublon, peinture abstraite,
      concert rock, texte incrusté) — cf. lessons.md
- [x] Affichage : vignette 56px à gauche dans PlanChooseView, 48px dans DailyPlanCard (accueil)
- [x] `vite build` OK · plannings vérifiés (aucun jour vide, max 2 chapitres/jour)
- [ ] ⚠️ À TESTER SUR APPAREIL : écran de choix (3 catégories, 13 plans, vignettes),
      démarrer un plan, vignette visible sur l'accueil, plan sur mesure sans vignette
- [ ] **Prochaine étape** : plans par PROFIL — `PROFILE_RECIPES` (planGenerator.js) pointe
      encore vers des portées génériques (« tout Jean », « tous les Psaumes »). À remplacer
      par 1-2 vrais plans thématiques par profil. ⚠️ Le profil `porteur` (évangélisation)
      n'est couvert par AUCUN des 12 plans actuels → il en faudra un nouveau.

### Publication Play Store (1re version) 🚧 (planifié 2026-07-26)
> Objectif : passer la 1re revue Google Play avec le MINIMUM viable, pour que le
> lien OneLink du parrainage devienne réellement fonctionnel. Versions PROVISOIRES
> acceptées pour icône/captures/politique — remplacées plus tard sans re-publication
> lourde (les mises à jour sont approuvées bien plus vite que la 1re soumission).
> État natif vérifié le 2026-07-26 : applicationId com.abide.app ✅ · targetSdk 36 ✅
> (au-delà du minimum Google actuel) · AUCUNE config de signature release ❌ ·
> icône = placeholder Capacitor générique ❌ · aucune page de politique trouvée ❌.

**Actions UTILISATEUR (comptes, paiement, éditorial — hors de portée de Claude) :**
- [ ] Créer le compte Google Play Console (25 $ US, paiement unique à vie) — https://play.google.com/console/signup
- [ ] Vérification d'identité Google (peut prendre 1-2 jours, à lancer TÔT)
- [ ] Créer la fiche de l'app dans la Console (nom, description courte/longue, catégorie,
      classification de contenu — questionnaire Google, public cible)
- [ ] Fournir le texte de la politique de confidentialité (Claude peut rédiger un brouillon
      adapté à Abide — collecte de compte, données Bible locales, IA — mais la publier à une
      URL stable, ex. la landing Nuxt, est une action utilisateur)
- [ ] Décider où héberger la page politique de confidentialité (landing Nuxt existante ?
      simple page statique ?) — donner l'URL à Claude une fois en ligne

**Actions CLAUDE (technique, une fois les infos ci-dessus disponibles) :**
- [ ] ⏸️ **EN PAUSE (décision 2026-07-26)** : générer la clé de signature (keystore) release
      + configurer `signingConfigs` — l'utilisateur attend que l'app soit VRAIMENT prête avant
      cette étape irréversible (garder le keystore ce n'est pas le sujet, le TIMING l'est :
      pas de keystore "d'essai" à jeter, on le crée une seule fois pour de bon)
- [ ] Générer un Android App Bundle (.aab) signé en release (pas l'APK debug utilisé jusqu'ici)
- [ ] Icône app PROVISOIRE (toutes résolutions mipmap) — un visuel simple aux couleurs de la
      marque (or/navy), pas besoin d'être définitif
- [ ] 2-3 captures d'écran provisoires (screenshot direct de l'app sur l'appareil de test :
      Bible, Guide IA, Sanctuaire) — suffisant pour la fiche Store minimale
- [ ] Rédiger le brouillon de politique de confidentialité (à valider/publier par l'utilisateur)
- [ ] Vérifier `targetSdkVersion` contre l'exigence Google Play en vigueur au moment de la
      soumission (change chaque année — déjà à 36, probablement conforme, à reconfirmer)
- [ ] Vérifier qu'aucun log de debug / clé de test ne fuite dans le build release
      (SECURITY.md §10 : désactiver le mode debug WebView en production)

**Vérif avant soumission :**
- [ ] `./gradlew bundleRelease` réussit et produit un .aab signé
- [ ] Test d'installation de l'AAB via `bundletool` ou upload en test interne Play Console
      AVANT la soumission publique (détecte les crashs liés au mode release/minification)
- [ ] Une fois approuvée : tester le lien OneLink du parrainage en conditions réelles
      (2e appareil → installe via le lien → inscription → filleul compté)

### Limites d'usage IA (sans paiement) 🚧 (planifié 2026-07-25) — SESSION B
> MVP gratuit : pas de paywall, mais un plafond pour que les coûts OpenRouter restent
> supportables. Quand le quota est atteint → message pastoral « reviens demain », jamais
> une erreur technique. Quota **modifiable sans redéploiement** (colonne en base).
> La table `ai_sessions` (user_id, date, sessions_used, sessions_limit) EXISTE DÉJÀ
> (migration 004) mais n'est ni lue ni écrite → c'est tout le travail.

- [x] `ai-chat` : quota du jour vérifié AVANT l'embedding ET l'appel LLM → 429 si dépassé
      (ordre vérifié par script : quota@27022 < embed@27625 < llm@30333 → coût nul)
- [x] `ai-chat` : `sessions_used` incrémenté APRÈS la réponse persistée uniquement —
      une erreur LLM sort par le catch sans rien décompter (on ne fait pas payer un échec)
- [x] Premium actif (is_premium + premium_expires non expiré) → quota ignoré, illimité
- [x] Quota Guide = **7 msg/jour** (migrations successives : 1 → 15 → 10 → `ai_daily_quota_7`).
      Le quota à 10 a été validé sur appareil, puis resserré à 7 pour pousser au parrainage.
- [x] **Quota QUIZ = 5/jour**, compteur SÉPARÉ (colonnes `quiz_used`/`quiz_limit`,
      migration `ai_sessions_quiz_quota`) : épuiser ses quiz ne bloque pas le Guide.
      Un quiz coûte ~3× un message (le chapitre entier part au LLM).
- [x] `quiz-chapter` déployée avec quota + exemption premium ; `generation_failed`
      ne décompte RIEN (échec de génération jamais facturé à l'utilisateur)
- [x] `quiz.js` : `isQuotaError()` (même piège `error.context` que ai.js) et le catch
      préserve les cas métier 'offline'/'quota' au lieu de tout écraser en 'failed'
- [x] Rejeu depuis le modal : fermait en SILENCE → affiche maintenant la raison
      (sans ça, un quota atteint passait pour un bug)
- [x] i18n fr/en `quiz.quotaReached`

> 📍 **OÙ CHANGER LES QUOTAS** (aucun redéploiement, SQL seul) :
> ```sql
> -- Guide IA (messages/jour) :
> ALTER TABLE ai_sessions ALTER COLUMN sessions_limit SET DEFAULT 20;
> -- Quiz (quiz/jour) :
> ALTER TABLE ai_sessions ALTER COLUMN quiz_limit SET DEFAULT 8;
> -- Appliquer aussi aux utilisateurs DÉJÀ actifs aujourd'hui :
> UPDATE ai_sessions SET sessions_limit = 20, quiz_limit = 8 WHERE date = CURRENT_DATE;
> ```
> Le DEFAULT ne vaut que pour les lignes créées ensuite : sans l'UPDATE, ceux qui ont
> déjà posé une question aujourd'hui gardent l'ancienne limite jusqu'à demain.
>
> ⚠️ **2026-07-26 : sessions_limit temporairement remonté à 20** (pour tests) — était
> à 7. **À REMETTRE À 7** avant le déploiement public :
> `ALTER TABLE ai_sessions ALTER COLUMN sessions_limit SET DEFAULT 7;`
> (quiz_limit non touché cette fois, resté à sa valeur précédente)
>
> **Premium = illimité** sur les deux compteurs. Aujourd'hui le premium s'obtient par
> PARRAINAGE (pas par paiement) : la logique est déjà en place, rien à changer quand
> le paiement arrivera.

### Correctifs 2026-07-26 (bugs remontés en test appareil)
- [x] **BUG quiz fantôme** : le quiz se régénérait pendant qu'on y répondait, et des quiz
      « en retard » s'ouvraient tout seuls. CAUSE : `await ads.onStartQuiz()` (la pub) dure
      plusieurs secondes SANS que l'écran bouge → l'utilisateur reclique → chaque clic lance
      sa propre génération, les réponses reviennent en décalé et s'écrasent. Le garde
      `if (loading.value)` du store ne protégeait pas : `loading` n'est levé qu'APRÈS la pub.
      FIX (3 volets) : verrou `openingQuiz`/`retrying` pris AVANT la pub · modal ouvert
      IMMÉDIATEMENT (affiche « Préparation… », l'écran réagit au clic) · même traitement
      sur « Refaire le quiz ».
- [x] **BUG scroll verset** : un lien de source IA surlignait le bon verset mais laissait la
      vue en haut du chapitre (il fallait défiler à la main). CAUSE : un seul `nextTick()` ne
      suffit pas — Ionic monte la vue avec une transition et l'`ion-content` n'est pas encore
      scrollable, donc `scrollIntoView` partait dans le vide. FIX : réessai jusqu'à 20 fois
      (~2,8 s max) avec vérification réelle via `getBoundingClientRect()`, 1re passe en
      `auto` puis `smooth`. + 2 watchers ajoutés : changement de chapitre ET changement de
      `?v=` seul (source IA vers le chapitre DÉJÀ ouvert → aucun hook ne se déclenchait).
- [x] **Incitation au parrainage** : les 3 toasts de quota (Guide, quiz, rejeu) portent un
      bouton « Inviter mes proches » → `/tabs/plus/referral`, durée portée à 9 s (il faut le
      temps de lire ET d'appuyer). Le texte explique le gain : chaque inscription = des jours
      d'accès illimité. Depuis le modal quiz, `emit('close')` AVANT `router.push` (sinon la
      page s'ouvrirait derrière le modal resté superposé).
- [x] i18n fr/en `ai.quotaCta` + `quiz.quotaCta` ; textes de quota réécrits
- [x] `vite build` OK · `cap sync` OK · APK installé sur l'appareil
- [ ] ⚠️ À TESTER : reclics rapides sur Quiz → une seule génération · lien de source IA →
      la vue se positionne SUR le verset · bouton « Inviter mes proches » dans les 3 toasts
- [x] Client `ai.js` : `readQuotaError()` relit `error.context` (⚠️ `functions.invoke` ne
      parse PAS le corps des réponses non-2xx → sans ça un 429 = « erreur serveur »)
- [x] Client : question retirée de l'affichage optimiste + remise dans le champ de saisie
      (elle n'est pas perdue, elle est renvoyable demain telle quelle)
- [x] `AncreTab` : `presentChatError()` factorise les 3 catch — toast ambre pastoral avec
      le prénom pour le quota, rouge seulement pour les vraies pannes
- [x] i18n fr/en `ai.quotaReached` + `ai.quotaReachedNamed`
- [x] `// TODO(limites)` retiré de l'en-tête de la fonction
- [x] `vite build` compile sans erreur
- [x] `ai-chat` DÉPLOYÉE en production — **version 11 ACTIVE**, quota effectif (2026-07-25).
      Déploiement : `SUPABASE_ACCESS_TOKEN` vient de `ACCESS_TOKEN_SUPABASE` (.env.local),
      puis `npx supabase functions deploy ai-chat --project-ref … --no-verify-jwt`.
- [ ] ⚠️ À TESTER SUR APPAREIL : épuiser le quota → toast pastoral (pas rouge) · la
      question reste dans le champ · le lendemain le compteur repart · un premium n'est
      jamais bloqué

### Programme de parrainage (affiliation) 🚧 (planifié 2026-07-13) — SESSION A
> Chaque utilisateur génère un lien de parrainage (AppsFlyer, compte déjà créé,
> app com.abide.app enregistrée). Filleul = installation via lien + compte créé.
> Paliers FIXES (non cumulatifs, remplace/étend) : 10→10j premium · 25→30j · 50→90j
> (révisés le 2026-07-27 : 5/10/15→7/14/30j jugés trop faciles à atteindre).
> Si premium payé déjà plus loin dans le temps → on garde la date la plus lointaine.
> Plan complet : C:\Users\DELL\.claude\plans\temporal-bubbling-sky.md

- [x] **Étape 0 (BLOQUANT, sécurité)** : migration trigger `protect_premium_columns` sur
      `profiles` — bloque toute modif cliente de is_premium/premium_expires/premium_source
      (faille RLS actuelle découverte : policy UPDATE ne restreint aucune colonne)
- [x] Entrée `SECU` dans tasks/lessons.md pour la faille RLS + le fix
- [x] Étape 1 : migration `referrals` (table + policy lecture) + `profiles.referral_code`
      + ajouter `'referral'` à la contrainte CHECK premium_source
- [x] Étape 2 : Edge Function `referral-attribute` (JWT filleul, whitelist code, anti
      auto-parrainage, idempotent via UNIQUE referred_id)
- [x] Étape 2b : logique de palier serveur (seuils en dur, MAX avec expiry existant)
- [x] Étape 2c : Edge Function/logique `referral-get-or-create-code` (génération + retry collision)
- [x] Étape 3 : SDK AppsFlyer Capacitor (vérifier compat Capacitor 6), init dans App.vue,
      écoute attribution → stocke `pending_referral_code` (Preferences)
- [x] Étape 4 : template OneLink côté dashboard AppsFlyer (manuel, utilisateur)
- [x] Étape 5 : client — après inscription réussie, lire pending_referral_code → appeler
      referral-attribute une fois → effacer la clé
- [x] Étape 6 : ReferralView.vue (pattern SettingsView : div.group/button.item) + route
      plus/referral + point d'entrée dans Plus/Settings
- [x] Étape 7 : i18n fr/en `referral.*`
- [x] Vérif : `supabase db reset` local, test trigger bloque bien is_premium côté client,
      `supabase functions serve` (code valide/invalide/déjà utilisé/auto-parrainage),
      `vite build`, test appareil réel (partage lien → 2e device → compte → referrals à jour)

### La Note IA — exporter un message du Guide en remarque 🚧 (planifié 2026-07-13)
> L'IA AGIT (2e endroit) : depuis une réponse du Guide, bouton « Exporter en note »
> → crée une remarque avec le texte (Markdown nettoyé en texte simple) + les versets
> cités convertis en tags @[…](). Ouvre la note directement (l'utilisateur ajuste).
> Dans la liste des remarques, celles créées par l'IA portent un badge doré (sparkles).

- [x] user-db.js : colonne `source` sur `notes` (null=manuelle, 'ai') + ALTER migration + saveNote écrit/préserve source
- [x] src/lib/note-from-ai.js : aiMessageToNoteBody (réutilise splitByRefs, tags @[…](), nettoie le Markdown) + aiNoteTitle
- [x] ChatBubble : action « Exporter en note » (barre d'actions IA) → crée note source:'ai' → navigue vers l'éditeur + toast
- [x] NotesListView : badge doré « Guide » + icône sparkles si note.source === 'ai'
- [x] i18n fr/en : ai.exportToNote, notes.defaultAiTitle, notes.aiBadge, notes.exportedFromAi
- [x] `vite build` compile sans erreur
- [x] À TESTER SUR APPAREIL : exporter → note ouverte, versets en @tags cliquables, badge dans la liste, édition ne perd pas le badge ✅ validé appareil 2026-07-25


### Quiz de fin de chapitre (Pilier IA — idée 13, version chapitre) 🚧 (planifié 2026-07-10)
> Demandé par l'utilisateur : un bouton en bas de chaque chapitre qui génère un
> QCM de 5 questions sur le chapitre lu (connexion requise). ≥3 bonnes = réussi.
> Barème étoiles : 3=★ · 4=★★ · 5=★★★. On garde le MEILLEUR score (rejouer ne fait
> jamais perdre). Résultat stocké LOCAL (SQLite abide_user), affiché offline.
> Génération = Edge Function sur le VRAI texte du chapitre (zéro hallucination).
> ⚠️ `// TODO(limites)` assumé comme ai-chat (phase de test, illimité).

- [x] user-db.js : table `quiz_results` (id=bookId|chapter, score, stars, best-score) + get/save/quizResultsFor
- [x] Edge Function `quiz-chapter` : texte réel du chapitre (bible_embeddings) → JSON 5 QCM validé strictement
- [x] store `quiz.js` : generateQuiz (offline → erreur claire), session en cours, finishQuiz (étoiles + save local)
- [x] Bouton « Quiz » dans le footer .chap-actions de BibleChapterView (icône sparkles, style des 2 boutons existants)
- [x] ChapterQuizModal.vue : plein écran, 1 question/écran, feedback, écran résultat (étoiles + libellé + refaire)
- [x] Étoiles sur la grille BibleBookView (rangée basse du .chapter-cell, opposée à la pastille « lu »)
- [x] i18n fr/en section `quiz` + offline toast
- [x] docs/ai-roadmap.md : idée 13 → 🟨 (quiz par chapitre livré ; niveau/mémorisation = Vague 4)
- [x] `vite build` compile sans erreur
- [x] DÉPLOYER l'Edge Function : `supabase functions deploy quiz-chapter` (secrets déjà en place : OPENROUTER_KEY, SUPABASE_*) ✅ validé appareil 2026-07-25
- [x] À TESTER SUR APPAREIL : générer, répondre, étoiles sur la grille, offline → message, rejouer garde le best ✅ validé appareil 2026-07-25

### Phase 1.0 — Fondations Préférences (thème + langue + police) ⚡ PRIORITAIRE
> Demandé par l'utilisateur le 2026-06-18 : à poser AVANT de continuer l'auth.
- [x] Installer vue-i18n + créer `src/i18n/` (messages fr + en)
- [x] Store `preferences.js` (locale, theme, bibleFont, bibleFontSize) persisté via @capacitor/preferences
- [x] Refondre les polices : serif système → fallback **Roboto Serif** (Cormorant/Playfair/Lora/DM Sans retirés)
- [x] Thème dark + light + suivi système, appliqué via classe sur <html>
- [x] Init i18n + préférences dans main.js (avant montage, pour les guards)
- [x] Documenter polices+thème dans `design-pattern.md`
- [x] Documenter architecture préférences + parcours invité dans `PROJECT.md`

### Phase 1.0b — Écran de Bienvenue (Welcome) + parcours invité
- [x] WelcomeView (vraie photo croix + overlay dégradé vertical, Skip, "Abide"+slogan, btn Google, btn Email)
- [x] N'apparaît qu'au tout premier lancement (flag firstLaunchDone en Preferences)
- [x] Skip → accès invité (lecture Bible + audio uniquement), reste → login requis
- [x] Router : route /welcome + guard premier lancement + accès invité Bible/audio
- [x] Traduire LoginView/RegisterView/ForgotPasswordView avec i18n
- [x] LoginView (structure Opal : Skip, logo, Welcome back, sous-titre, Email, Password, Forgot, gros bouton, Google, lien Register)
- [x] RegisterView (même structure : + Prénom, force du mot de passe, Google)
- [x] Inscription sans confirmation email (session immédiate → redirection /onboarding) — Confirm email désactivé dans Supabase
- [x] Google Cloud : projet `abide-499910`, écran consentement, client OAuth **Web** créé (id 34894391883-...)
- [x] Coller Client ID + Secret dans Supabase Dashboard (Auth → Providers → Google) ✅
- [x] Désactiver "Confirm email" dans Supabase Dashboard ✅
- [x] `loginWithGoogle()` web testable (signInWithOAuth + route /auth/callback)

### Phase 1.1 — Authentification (UI + flux)
- [x] Créer le design system : `src/theme/variables.css` (palette navy/gold, fonts) + import dans main.js
- [x] Charger les Google Fonts (Cormorant, Playfair, Lora, DM Sans) dans index.html
- [x] LoginView complète (email/password, magic link, lien mot de passe oublié, erreurs génériques)
- [x] RegisterView complète (email/password, force du mot de passe, écran "vérifie ta boîte mail")
- [x] ForgotPasswordView (saisie email + envoi lien reset)
- [x] Renforcer le store auth (messages d'erreur génériques anti-énumération, register avec display_name)
- [x] Vérifier le guard router (déjà en place) + redirection post-login
- [x] `vite build` compile sans erreur
- [ ] Test navigateur du flux (inscription → email → login) ← EN COURS (toi)

> Note : Google OAuth + deep links Capacitor reportés (nécessitent config Google Cloud) — fait plus tard dans 1.1.
> Note : suppression de compte RGPD + reset password depuis deep link → après config Supabase Auth.

---

## Phase Actuelle : Phase 1 — MVP

---

# PHASE 0 — Setup & Fondations ✅ (12 juin 2026)

## 0.1 Initialisation du projet
- [x] Setup Vue 3 + Ionic 8 + Capacitor 6 (installation manuelle, dossier non vide)
- [x] Configurer `capacitor.config.json` (appId: com.abide.app, appName: Abide)
- [x] Configurer Vite : alias `@/` → `src/`, variables d'env
- [x] Ajouter `.gitignore` (node_modules, .env.local, ios/, android/, dist/)
- [x] Init Git + premier commit
- [x] Créer `.env.example` documentant toutes les variables nécessaires

## 0.2 Structure & outils de base
- [x] Créer l'arborescence complète (views, components, composables, lib, stores, assets)
- [x] Installer + configurer Pinia (stores : auth, bible, audio, ai, plan, streak, ads)
- [x] Installer + configurer Vue Router (routes + guards auth + structure tabs)
- [x] Créer `src/lib/supabase.js` (client singleton)
- [ ] Configurer ESLint + Prettier (cohérence du code) ← à faire en Phase 1

## 0.3 Supabase
- [x] Projet Supabase existant (URL + clé dans .env.local)
- [ ] Activer l'extension pgvector (Dashboard → Database → Extensions)
- [x] Migration 001_profiles.sql (avec trigger création auto + RLS)
- [x] Migration 002_reading_progress.sql (+ streaks + RLS)
- [x] Migration 003_reading_plans.sql (+ RLS)
- [x] Migration 004_ai_sessions.sql (+ RLS, INSERT/UPDATE via Edge Function uniquement)
- [x] Migration 005_prayers.sql (+ RLS)
- [x] Migration 006_bible_embeddings.sql (pgvector + fonction search_bible)
- [ ] Appliquer les migrations sur le projet Supabase ← à faire manuellement (Dashboard SQL Editor)
- [ ] Tester les migrations en local (`supabase db reset`) ← optionnel, CLI Supabase à installer

## 0.4 Contenu biblique de base
- [x] Écrire `scripts/convert-bible.js` (getbible.net API → SQLite)
- [x] Générer `src/assets/bibles/lsg1910.db` (31 170 versets, 6.65 MB)
- [x] `@capacitor-community/sqlite` installé
- [x] Tester lecture d'un verset depuis la Bible locale ✅ (sur Android réel, offline, 2026-06-25)

## 0.5 APIs externes (comptes + tests)
- [ ] Créer compte BibleBrain + obtenir clé API dev ← **BLOQUANT pour l'audio**
- [ ] Tester appel BibleBrain (lister versions audio françaises)
- [x] OpenRouter testé ✅ (GPT-4o-mini répond correctement)
- [x] Cloudflare R2 : credentials dans .env.local ✅

## 0.6 Build & vérification
- [x] ~~EAS~~ — n'est pas utilisé (c'est Expo). Capacitor utilisé directement.
- [x] Plateforme Android ajoutée (dossier android/ généré)
- [x] Premier build Android debug (`gradlew assembleDebug`) + install sur appareil réel ✅ (2026-06-25)
- [ ] Premier build iOS ← nécessite un Mac + Xcode
- [x] `vite build` compilé sans erreur ✅

---

# PHASE 1 — MVP (Semaines 2–6) | Objectif : 1 000 users gratuits

## 1.1 — AUTHENTIFICATION (sécurisée et complète)

### Configuration Supabase Auth
- [x] Activer les providers : Email/Password + Google OAuth dans Supabase (Google : config Dashboard à finaliser par l'utilisateur)
- [x] Google OAuth : projet Google Cloud `abide-499910` + écran consentement + client OAuth Web créé
- [ ] Configurer les templates d'email Supabase (reset password) en français
- [ ] Configurer la durée de session (JWT 604800) et le refresh token rolling

> ⚠️ **BLOQUANT AVANT TOUTE COMPILATION ANDROID** — Login Google natif obligatoire :
> L'utilisateur ne doit JAMAIS sortir de l'app vers un navigateur pour se connecter.
> Le flow web `signInWithOAuth` (navigateur) ne sert qu'aux tests en dev web.
> Dès le premier `npx cap add android` / test sur appareil, il FAUT :
> - [ ] Installer `@codetrix-studio/capacitor-google-auth` (plugin natif)
> - [ ] Créer un client OAuth **Android** dans Google Cloud (package `com.abide.app` + SHA-1 via `./gradlew signingReport`)
> - [ ] Configurer `serverClientId` (= client Web) dans capacitor.config.json
> - [ ] `loginWithGoogle()` : sur natif → `GoogleAuth.signIn()` → `supabase.auth.signInWithIdToken({ provider:'google', token: idToken })`
> - [ ] Tester le sign-in natif sur émulateur/appareil Android (popup natif, pas de navigateur)
> Client OAuth **iOS** : à créer quand on aura un Mac + Xcode.

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
- [x] Lien "Mot de passe oublié" sur LoginView
- [x] ForgotPasswordView — saisie email + envoi **code OTP** (6 chiffres, anti-énumération)
- [x] VerifyOtpView — 6 cases auto-focus + collage + resend 60s (verifyOtp type email)
- [x] ResetPasswordView — nouveau mot de passe + confirmation (session OTP requise)
- [ ] ⛔ BLOQUÉ-SMTP : Template email "Magic Link" → {{ .Token }} (code 6 chiffres)
      Supabase interdit l'édition des templates sur le SMTP par défaut.
      → Nécessite un SMTP custom (Resend recommandé, gratuit 3000/mois).
      Tant que ce n'est pas fait : le flow OTP est codé mais NON TESTABLE.
- [ ] ⛔ BLOQUÉ-SMTP : Configurer SMTP custom (Resend) dans Supabase → débloque tous les templates
- [ ] Tester le flow complet mot de passe oublié (forgot → OTP → reset) une fois SMTP en place
- [ ] ~~ResetPasswordView depuis deep link email~~ → remplacé par flow OTP ci-dessus
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

## 1.2 — ONBOARDING ✅ (2026-06-23)

- [x] OnboardingWelcomeView — salutation animée FadeInWords (prénom en or, mots mot par mot)
- [x] 3 boutons : "Oui avec plaisir" → quiz | "Je le ferai plus tard" → app (revient) | "Non merci…" → app (définitif, onboarding_done=true)
- [x] Migration 007_onboarding_profile.sql — 17 colonnes ajoutées sur `profiles` ✅ APPLIQUÉE
- [x] `src/data/onboardingQuiz.js` — config data-driven des 13 questions (type, field, options, scoring)
- [x] `src/data/onboardingScoring.js` — fonctions pures : computeBibleLevel, computeProfile, pillarForProfile, notifTimeForSlot
- [x] `src/stores/onboarding.js` — answers, currentIndex, canGoNext, next/prev/reset/finish
- [x] `src/components/shared/ProgressBar.vue` — 4 segments gold
- [x] `src/components/onboarding/ChoiceOption.vue` — carte option single/multi, bordure gold si sélectionné
- [x] `src/components/onboarding/DatePicker.vue` — ion-datetime + affichage âge en direct
- [x] `src/components/onboarding/CountryCityInput.vue` — pays (Bénin défaut) + ville libre
- [x] `src/components/onboarding/ChurchInput.vue` — nom église + dénomination (question optionnelle)
- [x] `QuizQuestionView.vue` — vue unique pilotée par onboardingQuiz.js (13 questions × 1 vue)
- [x] `ProfileRevealView.vue` — symbole animé, profil en or, FadeInWords, RGPD consent, bouton démarrer
- [x] i18n fr + en : section onboarding complète (q1–q13, profils, niveaux, révélation)
- [x] `auth.firstName` computed (source unique : profile.display_name → user_metadata → first word)
- [x] Règle marque "utiliser le prénom souvent" documentée dans CLAUDE.md + PROJECT.md
- [x] `stores/ads.js` — contexte 'onboarding' ajouté à AD_BLOCKED_CONTEXTS
- [x] TEST COMPLET à faire : parcours quiz entier → ProfileRevealView → vérifier colonnes en DB ✅ validé appareil 2026-07-25

## 1.3 — LECTEUR BIBLE (Pilier Immersion) 🚧 (texte fait le 2026-06-23)

### Accès aux données ✅
- [x] bible-db.js : chargement DB double moteur — sql.js (web/dev) + copyFromAssets (natif), 100% offline
- [x] bible-db.js : `getVersions()` (versions installées localement)
- [x] bible-db.js : `getBooks(versionId)` (liste des livres, ordre canonique)
- [x] bible-db.js : `getChapterCount(versionId, bookId)`
- [x] bible-db.js : `getBookName(versionId, bookId)` (repli arrivée directe par URL)
- [x] bible-db.js : `getVerses(versionId, bookId, chapter)`
- [x] `initBible()` appelée au démarrage dans App.vue (onMounted)
- [x] Store bible.js (version/livre/chapitre actifs + cache des livres AT/NT)
- [x] .db bundlé : **public/assets/databases/lsg1910SQLite.db + databases.json** (natif — copyFromAssets cherche là, voir lesson 2026-06-25) ; public/db + public/sql-wasm.wasm (web/sql.js)

### Interface de lecture ✅
- [x] BibleHomeView — onglets AT/NT (swipe horizontal) + badge version déroulable + liste livres avec nb chapitres
- [x] BibleBookView — nom du livre + grille des chapitres
- [x] BibleChapterView — versets (police var(--font-bible), taille réglable 16→24px) + nav prev/next + swipe + réglages
- [x] Composant VerseItem (numéro doré + texte ALIGNÉ À GAUCHE — changé le 2026-07-21, plus de justify)
- [x] Header chapitre façon éditoriale (2026-07-21) : gros chiffre flottant à gauche (float, 76px),
      le texte du 1er verset s'enroule autour (effet "journal") puis passe pleine largeur dessous.
      Marge droite du lecteur resserrée (space-3 au lieu de space-6).
- [x] ChapterNavigator (prev/next) — intégré en footer de BibleChapterView
- [x] Réglage taille de police (sheet, persisté via preferences.bibleFontSize)
- [x] Composant VersionSelector (bottom sheet : versions installées + bouton "Ajouter" → store à venir)
- [x] ImmersionTab branché sur BibleHomeView (la Bible EST le pilier Immersion)
- [x] i18n fr/en section `bible`
- [x] Mode jour/nuit : géré globalement par preferences.theme (pas de toggle local Bible)
- [x] ✅ TEST APPAREIL Android réel (Infinix X6511B) : Bible lue 100% offline, tous chapitres/versets OK (2026-06-25)
- [x] Bug défilement NT (vide après Apocalypse 22) corrigé : 1 seul testament rendu à la fois + transition glissement (2026-06-25)
- [x] Appui long sur verset → mode sélection multi-versets + barre d'actions (2026-06-25)
- [x] Action COPIER fonctionnelle (texte + référence "Livre Ch:V" + version) via @capacitor/clipboard (2026-06-25)
- [x] Actions Surligner/Sauvegarder/Guide IA/Partager : UI prête, toast "bientôt" (branchées plus tard)
- [x] Perf : connexion SQLite native en readonly + warmUpBible() au démarrage (réduit "Ouverture de la Bible…")
- [x] ✅ TEST APPAREIL : scroll NT, copie multi-versets, "Opening the Bible" OK (2026-06-26)
- [ ] Refonte barre d'action façon YouVersion : voile sticky bas + rangée de pastilles couleur (highlight) + Copier/Comparer/Partager/Note (2026-06-26)
- [ ] Badge version dans vue chapitre (header droite) → change de version en gardant chapitre+versets
- [ ] Panneau ⚙️ réglages lecture : taille texte + choix police (6-7 polices) + mode clair/sombre
- [ ] ⚠️ IMPORTANT — PERSISTANCE OFFLINE DES SURLIGNAGES (demandé 2026-06-26) : le highlight est VISUEL pour l'instant (en mémoire, perdu au changement de chapitre/redémarrage). À brancher : sauvegarde locale SQLite (table highlights : version_id, book_id, chapter, verse, color) + file de sync vers Supabase (local-first). NE PAS OUBLIER.

### Progression (à faire — local-first + sync queue)
- [ ] Marquer un chapitre comme lu → reading_progress (local d'abord, sync Supabase)
- [ ] Indicateur visuel chapitres déjà lus
- [ ] Tester lecture offline (sans connexion) + sync au retour en ligne

## 1.4 — AUDIO BIBLE (Pilier Immersion) 🚧 (streaming codé le 2026-06-26)

### Intégration BibleBrain ✅
- [x] Clé reçue (VITE_BIBLEBRAIN_KEY) + filesets sondés (LSG FRNTLSN2DA/FRNTLSO2DA, KJV ENGKJVN2DA/ENGKJVO1DA)
- [x] biblebrain.js : USE_MOCK=false, format réel (data[0].path, timestamps verse_start/timestamp)
- [x] biblebrain.js : AUDIO_MAP (version texte → audio) + audioForVersion() + filesetForBook() (NT/OT auto)
- [x] biblebrain.js : getAudioUrl (CapacitorHttp natif / fetch web), getTimestamps (repli [] si absent)
- [x] Documenté : AT LSG sans timestamps (audio OK, pas de surbrillance) → repli gracieux

### Player audio (streaming) ✅
- [x] ~~@capacitor-community/audio~~ (INEXISTANT) → capacitor-music-controls-plugin@6.1.0 + <audio> HTML5
- [x] useAudioPlayer.js (singleton) : playChapter, togglePlay, seekBy(±15), cycleSpeed, next/prevChapter, stop
- [x] Store audio.js complété : timestamps, copyright, activeVerse (dérivé position), playingKey
- [x] Contrôles lock-screen / notification média (music-controls natif) + Media Session (web)
- [x] À TESTER SUR APPAREIL : lecture background écran verrouillé + contrôles play/pause/seek (cap sync requis) ✅ validé appareil 2026-07-25

### Interface player ✅
- [x] AudioPlayerBar (mini-barre persistante, montée GLOBALEMENT dans App.vue — survit à la navigation)
- [x] Bouton ▶️/⏸️ dans le header du chapitre (à côté du pill version + ⚙️)
- [x] Synchronisation texte : verset actif surligné en or (classe .reading) selon timestamp
- [x] Défilement automatique du texte pendant la lecture (scrollIntoView sur le verset actif)
- [x] Copyright affiché dans la barre (exigence BibleBrain)
- [x] Contrôles : play/pause, vitesse (0.75/1/1.25/1.5), −15s/+15s, seek tap sur progression
- [x] Test navigateur + appareil réel (Infinix) : lecture NT LSG/KJV + surbrillance + scroll ✅ (2026-06-28)
- [x] Contrôles lock-screen + notification testés OK sur appareil ✅ (2026-06-28)
- [x] Bug pause=stop corrigé (music-controls-destroy émis au pause → ne plus appeler stop(), dismissable/hasClose=false)
- [ ] ~~AudioPlayerView plein écran~~ → reporté (la mini-barre suffit pour le MVP)

### Téléchargement offline 🚧 (codé le 2026-06-28 — style YouVersion)
- [x] Endpoint /download BibleBrain (seul autorisé) : getDownloadUrl() dans biblebrain.js
- [x] @capacitor/filesystem@6 installé — MP3 + timestamps.json dans Directory.Data (audio/{version}/{livre}/)
- [x] stores/audioDownloads.js : downloadBook (séquentiel, reprise idempotente), deleteBook, estimateBookSize (HEAD), progression réactive
- [x] Lecture locale d'abord dans useAudioPlayer (localChapterSource → convertFileSrc) — offline transparent
- [x] AudioPlayerSheet.vue : panneau expansible (remplace AudioPlayerBar) — étendu (titre, copyright, cercle ⬇, contrôles complets, bille+temps, vitesse encerclée, bouton téléchargements) ↔ replié (mini-barre + bille + bouton agrandir)
- [x] DownloadCircle.vue : cercle ⬇+Mo / anneau SVG progression / ✓ téléchargé (clic → download ou suppression)
- [x] AudioDownloadsModal.vue : store des téléchargements (total utilisé, liste, 🗑 suppression)
- [x] Clic ▶️ header chapitre → panneau complet s'ouvre + lecture démarre
- [x] Bille (thumb) sur la progression (input range stylé) — feedback appareil 2026-06-28
- [x] À TESTER SUR APPAREIL : télécharger un livre → anneau progression → ✓ → mode avion → lecture offline + surbrillance ✅ validé appareil 2026-07-25
- [ ] Vérifier filesets OT/KJV autorisés sur /download (sonde coupée — NT LSG confirmé 200)

### Musique de fond ✅ (codé le 2026-07-21, validé appareil)
- [x] src/assets/audio/background-calm.mp3 empaqueté dans l'app (6,5 Mo, bundlé par Vite → offline)
- [x] Store backgroundMusic.js : logique RÉCESSIVE — esclave de audio.isPlaying/currentUrl
      (play/pause/stop de l'audio Bible entraîne la musique ; jamais l'inverse)
- [x] Bouton on/off dédié (persisté via @capacitor/preferences) : coupe la musique SEULE, l'audio Bible continue
- [x] Pas de contrôle écran verrouillé pour la musique (simple <audio loop>, pas un player à part)
- [x] UI : rond + label ON/OFF sous le cercle (AudioPlayerSheet, panneau étendu), trait diagonal si OFF
- [x] Layout validé : cercle téléchargement CENTRÉ (grid 3 colonnes) + bouton musique à droite, espacé
- [x] Volume 0.24 (ajusté après test appareil, ni trop discret ni trop couvrant)

## 1.5 — ACCUEIL + PLAN DE LECTURE & STREAK 🚧 (codé le 2026-07-06)

### Accueil (nouvel onglet, 1er) + restructuration barre
- [x] Barre du bas réorganisée : **Accueil · Bible · L'Ancre · Plus** (Immersion renommé « Bible », route interne inchangée ; Sanctuaire retiré de la barre, route conservée)
- [x] HomeView : salutation prénom + Verset du jour + Streak hebdo + Carte plan
- [x] VerseOfDayCard : 366 références locales (src/data/verseOfDay.js, cycle annuel, texte via bible-db offline), référence cliquable → Bible
- [x] Route /tabs/home (invité OK, hors-ligne OK) + redirects / et /tabs → home + guard

### Plan de lecture ✅
- [x] planGenerator.js (CANON 66 livres + buildSchedule, portées full/nt/psalms) — fonctions pures
- [x] plan.js store : loadActivePlan, createPlan (7j/30j/90j), todayItems, completeToday, progression (markRead/readChapters)
- [x] Sauvegarde locale (user-db reading_plans) + sync best-effort Supabase (sync.js)
- [x] DailyPlanCard : jour N/total, chapitres du jour (lire), barre progression, « Marquer comme lu »
- [x] PlanSetupView : choix durée + portée, création/remplacement (route /tabs/immersion/plan)
- [x] Pastille chapitres lus dans BibleBookView

### Streak ✅
- [x] streak.js store : nextStreak (pur), registerReadToday, week (7 jours), justIncremented
- [x] Logique permissive : lire n'importe quel chapitre dans la journée fait avancer le streak
- [x] Sauvegarde locale (user-db streak) + sync best-effort (streaks Supabase)
- [x] StreakWeek : ligne L-M-M-J-V-S-D, jour lu en flamme, compteur « X jours »
- [x] StreakFireOverlay : animation Lottie (lottie-web + fire.json) au 1er streak du jour (flag date preferences)
- [x] Messages d'encouragement par palier (i18n streak.msg.*)
- [x] À TESTER SUR APPAREIL : lire → flamme + overlay ; tuer/rouvrir → conservé ; jour suivant → +1 ✅ validé appareil 2026-07-25
- [ ] Déclenchement au chapitre ouvert (BibleChapterView.load : markRead + registerReadToday) — testé web, à confirmer appareil

### Plans enrichis (3 types) + Splash ✅ (codé le 2026-07-06)
- [x] 3 types de plans : profil (règle locale par user_profile) / custom (contenu + durée libre + choix livre) / préétablis bundlés
- [x] planGenerator : scope 'ot'/'book' + buildScheduleFromChapters + PROFILE_RECIPES + recipeForProfile
- [x] presetPlans.js : parcours « Connaître Jésus » (21j, 4 Évangiles) + presetToPlan ; structure prête pour catalogue Supabase
- [x] store plan : createPlan unifié ({source: custom|profile|template}) + title/source/template_id ; user-db colonnes ajoutées
- [x] PlanChooseView (3 blocs : Pour toi / Parcours / Créer le mien) route /tabs/immersion/plan
- [x] PlanCustomView (durée libre + portée avec ion-select des 66 livres) route .../plan/custom
- [x] DailyPlanCard affiche le titre du plan actif ; un seul plan actif (remplacement avec confirmation)
- [x] Splash animé au démarrage : pool 5 animations Lottie + pool de textes (fr/en), tirage aléatoire, skippable (SplashOverlay dans App.vue)
- [ ] ⚠️ À TESTER SUR APPAREIL : les 3 types de plans + splash varié + persistance

### Reporté (noté)
- [ ] Catalogue Supabase plan_templates (ajouter des préétablis sans rebuild) + plans profil éditables en base
- [ ] Autres parcours thématiques (« Se libérer du péché »…)
- [ ] Prière brève sur l'Accueil
- [ ] Sync bidirectionnelle robuste (pull + file de sync + reading_progress par lots)
- [ ] Petits restes Bible : marquer chapitre lu explicitement (déjà auto à l'ouverture)

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

## 1.7 — PUBLICITÉS ADMOB 🚧 (codé le 2026-07-18, modèle YouVersion : interstitiels)

> STRATÉGIE (2026-07-18) : PLUS de bannières. Uniquement des INTERSTITIELS plein écran
> (parfois vidéo), façon YouVersion. Voir CLAUDE.md §AdMob pour la politique complète.

- [x] Installer @capacitor-community/admob@6.2.0 (Capacitor 6 compatible)
- [x] admob.js : initAdMob() + showInterstitial() (prepare + show, ne bloque jamais)
- [x] Store ads.js : règles métier (!isPremium, cooldown 4 min « soft ») + points d'entrée
      sémantiques (onNavigation, onOpenAiGuide, onStartQuiz, onMeditateVerse)
- [x] Déclencheur navigation : router.afterEach throttlé, exclut écrans protégés + Ancre/IA
- [x] Déclencheur ouverture Guide IA (AncreTab onIonViewWillEnter, throttlé)
- [x] Déclencheur « méditer sur un verset » (AncreTab, ?prefill → à chaque fois)
- [x] Déclencheur quiz : lancement (BibleChapterView) + rejeu (ChapterQuizModal), à chaque fois
- [x] AndroidManifest : APPLICATION_ID AdMob (⚠️ ID de TEST — à remplacer)
- [x] Règle stricte !authStore.isPremium (appliquée dans le store, sans exception)
- [x] Règle stricte : jamais pendant Bible/audio/prière/échange IA (exclusions router + design)
- [x] Compte Google AdMob créé (2026-07-18) + app « Abide » Android déclarée
- [x] App ID réel dans AndroidManifest : ca-app-pub-4844051778459996~4079944831
- [x] Ad Unit interstitiel créé : ca-app-pub-4844051778459996/6546326075 (stocké commenté dans .env.local)
- [x] IDs de TEST toujours actifs en dev (VITE_ADMOB_INTERSTITIAL_ID commenté → isTesting auto)
- [ ] ⚠️ AU LANCEMENT SEULEMENT : (1) finir profil de PAIEMENT AdMob (compte en « Examen requis »),
      (2) décommenter VITE_ADMOB_INTERSTITIAL_ID dans .env.local. NE PAS cliquer ses vraies pubs avant (bannissement).
- [ ] iOS : ajouter GADApplicationIdentifier dans Info.plist + App ID iOS (build Mac)
- [x] À TESTER SUR APPAREIL : pub à l'ouverture IA, au quiz, à la navigation (cooldown), jamais si premium ✅ validé appareil 2026-07-25

## 1.8 — SETTINGS & PROFIL 🚧 (codé le 2026-07-17)

- [x] SettingsView (structure, accessible invités + section Compte si connecté)
- [x] Réglage langue de l'interface (fr/en, store preferences)
- [x] Mode jour/nuit global (system/dark/light, store preferences)
- [x] Réglage police + taille du texte Bible
- [x] Modification mot de passe (→ flux OTP /auth/forgot)
- [x] Déconnexion (avec confirmation)
- [x] Suppression de compte — parcours exigeant (sous-page → avertissement détaillé →
      recopie du mot SUPPRIMER/DELETE) + Edge Function delete-account (RGPD, cascade profiles
      + auth.admin.deleteUser + purge locale clearAllLocalData). Déployée 2026-07-17.
- [x] Lien Settings depuis l'onglet Plus (icône engrenage header)
- [ ] Réglage heure de notification (rappels prière/streak configurables — reporté avec le lot notif)
- [ ] Réglage version Bible préférée (le VersionSelector existe déjà dans le lecteur — à relier ?)
- [ ] Lien CGU + politique de confidentialité (clés i18n prêtes, manque les URLs/pages réelles)

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

## 2.2 — GUIDE IA (Pilier L'Ancre) 🚧 (architecture faite 2026-07-07)

> 🗺️ **VISION & ROADMAP COMPLÈTE : voir `docs/ai-roadmap.md`** (18 fonctionnalités évaluées,
> plan en 4 vagues, la fonctionnalité phare « Dossier d'étude »). Principe : ne PAS faire un
> ChatGPT biblique, mais une IA profondément intégrée à une Bible structurée.

> ⚠️ **COMPTEUR SESSIONS / PAIEMENT / PUB PAS ENCORE BRANCHÉS** (décidé 2026-07-07).
> L'IA est fonctionnelle SANS limite pour l'instant. Avant tout déploiement public :
> repasser SECURITY.md §4 → brancher le compteur ai_sessions (403 si dépassé), rate limiting,
> monitoring des coûts. Marqué `// TODO(limites)` dans supabase/functions/ai-chat/index.ts.
> **C'est la Vague 0 de la roadmap : bloquant avant toute fonctionnalité IA coûteuse.**

### Préparation RAG ✅ (seed complet le 2026-07-08)
- [x] scripts/seed-embeddings.js (embeddings via **Hugging Face** gratuit, PAS OpenAI — voir note clé)
- [x] Recherche vectorielle pgvector vérifiée : « aimer ses ennemis » → Matthieu 5.44 (sim 0.728) ✅
- [x] **Seed COMPLET : 31 074 versets, 66 livres** (768 dims, multilingual-mpnet) — toute la Bible indexée
- [x] Sources = références CITÉES par le LLM, vérifiées contre la vraie Bible (hallucinations écartées + loggées)

### Edge Function ai-chat ✅ (déployée)
- [x] Structure + auth JWT (vérif passerelle + getUser interne)
- [ ] ~~Compteur sessions~~ → **reporté** (lot limites/paiement), `// TODO(limites)` dans le code
- [x] Embedding question via **Hugging Face** (OpenRouter n'a PAS d'endpoint embeddings — voir lessons)
- [x] Recherche Top 5 versets pertinents (RPC match_bible_embeddings)
- [x] Prompt système par mode (enseignement/prédication/méditation/théologie)
- [x] Appel OpenRouter (gpt-4o-mini)
- [x] **Mémoire compressée** : résumé auto de l'historique ancien au-delà d'un seuil (summary/summarized_upto)
- [x] Persistance des 2 messages + titre auto au 1er échange + verse_refs (sources)
- [x] Déployée avec secrets OPENROUTER_KEY + HUGGINGFACE_KEY (SUPABASE_* auto-injectés)

### Interface chat ✅
- [x] ConversationsListView (liste des sessions + bouton nouvelle + suppression + avertissement offline)
- [x] AIChatView (conversation, bulles, auto-scroll, composer ion-textarea, typing dots)
- [x] Composant ModeSelector (4 modes)
- [x] Composant ChatBubble (user/IA + puces de versets cités, tap → ouvre le chapitre)
- [x] Store ai.js (conversations, messages, sendMessage via Edge Function, mode)
- [x] Disclaimer pastoral + notice « connexion requise » (IA = online only)
- [ ] ~~SessionCounter~~ → reporté (lot limites)
- [ ] ⚠️ À TESTER SUR APPAREIL : créer une discussion, poser une question, vérifier réponse + versets cités

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

## 2.3 — SANCTUAIRE (Prière & Jeûne) ✅ (implémenté le 2026-07-14)

### Journal de prières ✅
- [x] PrayerJournalView (liste + ajout)
- [x] Ajout d'une prière (formulaire)
- [x] Marquer comme exaucée (+ date) — sliding item
- [x] Timeline des exaucements (historique de gratitude)
- [x] Persistance offline-first + sync Supabase (table prayers, migration 011 local_id)
- [ ] PrayerDetailView (contenu + actions) — non retenu pour l'instant (liste + sliding suffisent)

### Moments de prière ✅
- [x] Prière du matin / du soir liée au verset du jour (PrayerMomentView)
- [x] Pool local curé fr/en (src/data/prayerPool.js) — tirage déterministe par date
- [x] Bouton « ✨ prière personnalisée » → Guide IA (prefill, mécanisme existant)
- [x] Sujets de prière à cocher + bouton « Amen » → marque le moment fait
- [x] Carte sur l'Accueil (matin/soir selon l'heure) + entrée onglet Plus

### Tracker de jeûne ✅
- [x] FastingView (jeûne du jour / prochain + participation)
- [x] Calendrier mensuel navigable (FastingCalendar.vue, jours teintés par type + légende)
- [x] Jeûnes calculés sans maintenance annuelle (Computus) : janvier 21j, Carême, Vendredi Saint, Avent
- [x] Jeûne personnel libre (3/7/21/40 j) + progression jour X/N
- [x] Méditations ciblées aux heures de faim (12h/16h) — notifications locales depuis le pool
- [x] Historique des jeûnes terminés
- [ ] Sync Supabase du jeûne (local-only pour l'instant — à faire avec la file de sync)

### Notifications locales ✅
- [x] ~~Rappels de prière matin (7h) / soir (20h30), répétitifs~~ → REFONTE 2026-07-21 :
      rappels MULTI-CRÉNEAUX conditionnels — matin 10h·12h, soir 18h·20h·22h. On relance
      TANT QUE le moment n'est pas accompli ; dès le « Amen », les rappels restants de ce
      moment sont annulés (cancelPrayerReminders). Textes variés : le créneau fixe le ton
      (douce → relance → nocturne), la date choisit la variante. Testé (Node) : créneaux
      restants selon l'heure, skip si déjà fait, ids sans collision, rotation sur 4 jours.
- [x] Notifications DÉPLIABLES (largeBody + summaryText) — corrige le texte tronqué
      sans bouton d'expansion. Appliqué à prière, jeûne (verset+note) et streak.
- [x] Accompagnement de jeûne : J-3, J-1, jour J, encouragements 12h/16h, ton « fin approche », félicitations
- [x] Alerte streak en danger, 2 paliers (19h doux, 22h urgent, si Bible pas encore ouverte et série en cours)
- [x] Relance série perdue matin(10h)+soir(19h) sur J+1 à J+3, ton direct façon Duolingo (détectée au load())
- [x] Textes variés par jour (src/data/streakMessages.js, 4 formulations/situation, jamais 2x de suite)
- [x] Tap sur notification → ouvre l'écran concerné (extra.route + listener global App.vue)
- [x] Idempotence : plages d'ids réservées, re-planification à chaque démarrage
- [ ] Heures de rappel configurables (Settings — plus tard)
- [ ] Son de notification personnalisé (⚠️ en attente d'un fichier audio ~1-2s à fournir)

## 2.4 — VERSIONS BIBLE SUPPLÉMENTAIRES

### Mécanique de téléchargement ✅ (codée le 2026-06-25, KJV de test)
- [x] scripts/generate-version.js — génère un .db de version depuis getbible.net (is_bundled=0)
- [x] KJV générée (dist-bibles/kjvSQLite.db, 31102 versets, domaine public)
- [x] scripts/upload-version.js — upload R2 + manifeste JSON (clés secrètes locales)
- [x] bible-db.js multi-versions : base active unique, switchVersion(), downloadVersion(), isVersionInstalled()
- [x] store bibleVersions.js — catalogue (manifeste R2 + installées), download, activate, persistance
- [x] BibleStoreView — page Store (liste, Télécharger, Choisir, badge Active)
- [x] VersionSelector → "Ajouter une version" ouvre /bible/store ; ne liste que les installées
- [x] Changement de version garde livre+chapitre (ID canoniques partagés)
- [x] SECURITY.md : séparation bucket R2 public / données Supabase documentée
- [x] ✅ CÔTÉ UTILISATEUR (R2) : accès public bucket activé + R2_PUBLIC_BASE_URL & VITE_BIBLE_MANIFEST_URL remplis
- [x] ✅ 7 VERSIONS SUR R2 (2026-06-26) : 3 FR complètes (LSG bundlé, Darby, Martin 1744) + 4 EN (KJV, WEB, ASV, YLT)
- [x] À TESTER SUR APPAREIL : télécharger une version → couper réseau → lire offline → rebascule LSG ✅ validé appareil 2026-07-25

### 📌 PLUS DE VERSIONS = PLUS TARD (décidé 2026-06-26 — on avance sur l'audio d'abord)
> SOURCES FR ÉPUISÉES : getbible.net = seulement 3 FR (toutes prises : darby, ls1910, martin).
> BibleBrain texte : Ostervald (FRNO96) est NT-SEULEMENT (incomplet → exclu). Seules Darby/LSG
> y sont complètes (déjà possédées). Le FR moderne (Segond 21, Semeur, NBS, BFC) est SOUS COPYRIGHT.
> Pistes restantes pour + de FR : (1) eBible.org → Crampon 1923 ? (nouveau pipeline USFM à écrire)
> (2) API.Bible avec LICENCE COMMERCIALE (Phase 2) → débloque Segond 21, Semeur, etc.
- [ ] eBible.org : écrire pipeline USFM/VPL → SQLite (tenter Crampon 1923 FR + langues africaines pour Fon)
- [ ] Obtenir accord commercial API.Bible (versions sous copyright)
- [ ] Téléchargement audio BibleBrain par version (offline premium)
- [ ] Gestionnaire d'espace disque (taille, suppression de version)
- [ ] Barre de progression fine du téléchargement (getFromHTTPRequest est atomique → à voir)

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
