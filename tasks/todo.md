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

## 🔴 EN COURS — Changement de package Android (2026-09-10)

> `com.abide.app` refusé par Play Console (déjà pris par un tiers). Remplacé par
> **`com.toabide.app`** dans tout le code (voir `tasks/lessons.md` 2026-09-10 pour le détail).
> Build Gradle vérifié OK. Reste à faire côté SERVICES EXTERNES (hors repo) :
>
> - [x] Google Cloud Console : nouveau Client OAuth **Android** créé avec `com.toabide.app`
>       + SHA-1 debug `D8:1D:64:09:F4:C8:72:28:3B:71:20:B0:EA:7C:A1:C7:7C:F3:05:CD`
>       → `34894391883-bemreedn3dq8htpuuv7viqeqp4o2d0v2.apps.googleusercontent.com`
>       (2026-09-10). Le Client ID **Web** (`serverClientId`) n'a pas changé.
> - [x] `capacitor.config.json` (androidClientId) + `.env.local` mis à jour avec le
>       nouveau Client ID Android, rebuild + resync + reinstall faits (2026-09-10)
> - [x] Supabase Dashboard → Auth → Providers → Google → "Authorized Client IDs" :
>       nouveau Client ID Android ajouté à la liste (2026-09-10)
> - [x] **Google Sign-In testé sur appareil réel avec le nouveau package : fonctionne** (2026-09-10)
> - [ ] AppsFlyer : **reporté après publication** (2026-09-10, décision utilisateur) — pas
>       de compte AppsFlyer créé pour l'instant (l'ancien test utilisait `com.abide.app`
>       + un email pro intérimaire). OneLink a de toute façon besoin que l'app soit déjà
>       publiée pour fonctionner (deferred deep linking) → recréer un compte DÉFINITIF au
>       moment de la publication, avec une adresse `@toabide.online` plutôt qu'un email
>       personnel (à créer : `contact@toabide.online` ou via Google Workspace).
> - [x] AdMob : magasin d'applications Google Play lié à `com.toabide.app` le 2026-09-11
>       (déclenché par l'existence de l'app sur Play Console, même en Test interne — pas
>       besoin d'attendre la production). Lien "Verify app to lift limit" cliqué, examen
>       AdMob en cours (délai variable, non bloquant pour la suite — continuer la fiche
>       Play Store pendant ce temps).

---

## ✅ ÉTAT AU 2026-10-12 : version 6 (1.4) PUBLIÉE en production (envoi n°6, 21:27)

> - [x] Pubs : cause trouvée (bloc « Enchères partenaires »), nouveau bloc Standard
>       ca-app-pub-4844051778459996/2317455341, « Test Ad » vérifié sur le téléphone
> - [x] AppsFlyer : nouvelle clé + OneLink https://toabide.onelink.me/2cce/wgcmxjw9,
>       code du parrain dans af_sub1, bouton « Partager mon lien » réactivé
> - [x] 16 Ko corrigé (SQLCipher 4.10.0 via patch-package), alignement vérifié
> - [x] AAB versionCode 6 / 1.4 construit (le 5 a été importé chez Google puis
>       bloqué par l'erreur 16 Ko, ne pas le réutiliser)
> - [x] Testé sur le téléphone sans désinstaller : Bible, notes, plans OK, aucun
>       plantage ni erreur SQLite (logcat), « Test Ad » affichée
> - [x] AAB versionCode 6 envoyé (après retrait du bundle 5 resté dans le brouillon)
>       et publié le 2026-10-12
> - [ ] Après publication : tester le parrainage complet (clic sur lien, installation,
>       inscription, compteur du parrain)
> - [ ] Plus tard : R8/obscurcissement (échéance Google février 2027), affichage
>       bord à bord, mise à jour du SDK AdMob avant le 30 juin 2027, suivi des coûts

---

## 🎉 ÉTAT AU 2026-10-11 : ABIDE EST EN PRODUCTION

> - [x] Accès production accordé, release Abide 1.2 (versionCode 4) publiée à 100 %
>       (monde entier), visible via https://play.google.com/store/apps/details?id=com.toabide.app
> - [x] Classification IARC reçue le 2026-10-08 (réponse « Non » aux achats numériques :
>       À REFAIRE le jour où Abide Plus devient payant)
> - [x] Premiers chiffres (2026-10-11) : 4 installations, 16 appareils actifs
> - [ ] Vérifier les vraies pubs sur le téléphone (AdGuard désactivé), SANS cliquer
> - [ ] Mise à jour 16 Ko (versionCode 5) : voir bloc DETTE TECHNIQUE plus bas
> - [ ] AppsFlyer définitif + OneLink (adresse @toabide.online)
> - [ ] Suivi des coûts : OpenRouter (recharge auto), Supabase, R2
> - [ ] Ajouter le lien Play Store sur toabide.online si besoin

---

## 🚀 ÉTAT AU 2026-10-02 : demande d'accès Production envoyée

> - [x] Test fermé : 12+ testeurs, 14 jours validés (3 cases cochées sur le tableau de bord)
> - [x] Vraies pubs AdMob activées dans `.env.local` (`VITE_ADMOB_INTERSTITIAL_ID`)
> - [x] AAB prêt : versionCode 4, versionName 1.2, signé, avec vraies pubs
>       (`android/app/build/outputs/bundle/release/app-release.aab`)
> - [x] Formulaire « Demander à publier en production » envoyé le 2026-10-02 à 21:44
> - [ ] **EN ATTENTE** : réponse de Google (7 jours ou moins, e-mail à ldejoas@gmail.com)
> - [ ] Dès accès accordé : Production → Créer une release → importer l'AAB v4 (import de
>       fichier) → notes de version → envoyer pour examen
> - [ ] Après publication : désactiver AdGuard sur le téléphone de test pour vérifier les
>       interstitiels. NE JAMAIS cliquer ses propres pubs.
> - [ ] Après publication : compte AppsFlyer définitif + OneLink (adresse @toabide.online)
> - [ ] Ne pas modifier fiche/testeurs pendant l'examen (risque de relancer une review)

---

## ⚠️ DETTE TECHNIQUE : pages mémoire 16 Ko (relevée le 2026-10-06)

> Play Console affiche une ERREUR sur la release de production (versionCode 4) :
> « Votre appli ne prend pas en charge les tailles de page de mémoire de 16 ko ».
> - Cause : `libsqlcipher.so` (4 variantes ABI) alignée sur 4 Ko (0x1000), mesuré sur l'AAB.
>   Elle vient de `net.zetetic:android-database-sqlcipher:4.5.3`, embarquée par
>   `@capacitor-community/sqlite@6.0.2` (dernière version de la lignée Capacitor 6).
> - Seule bibliothèque native de l'app. AGP 8.13 gère déjà l'alignement de l'archive.
> - Correctif connu : SQLCipher 4.10.0 (`net.zetetic:sqlcipher-android`) est aligné 16 Ko
>   (0x4000, vérifié). Embarqué par le plugin 7.0.3 (4.10.0) et 8.1.1 (4.17.0), qui exigent
>   Capacitor 7 ou 8 (projet actuel : Capacitor 6.2.1).
> - Voie retenue pour la correction : rétroporter le code Android du plugin 7.0.3 sur
>   Capacitor 6 via `patch-package`. L'API JS (definitions.d.ts) est identique entre 6.0.2
>   et 7.0.3. L'app n'utilise aucune base chiffrée (`'no-encryption'` partout), donc pas de
>   migration de clé. 10 fichiers Java diffèrent : risque principal = incompatibilité
>   d'API avec Capacitor 6, à détecter à la compilation.
> - DÉCISION (utilisateur, 2026-10-06) : publier d'abord tel quel via « Continuer quand
>   même », corriger après publication par une mise à jour (versionCode 5).
> - [ ] Après publication : appliquer la voie B, recontrôler l'alignement de TOUTES les
>       `.so` de l'AAB, tester sur téléphone avec les données existantes (Bible, notes,
>       plans), puis publier versionCode 5.
> - [ ] Si Google rejette la release à cause de cette erreur : faire la correction avant
>       de renvoyer.

---

## 📋 SUIVI — Formulaire de publication Google Play Console (2026-09-10)

> Progression détaillée du formulaire de création/soumission de l'app sur Play Console,
> écran par écran, pour reprendre exactement où on s'est arrêté d'une session à l'autre.

### Écran 1 — "Créer une application" (infos de base)
- [x] Nom de l'app : `Abide — Bible & Guide IA` (24/30 caractères)
- [x] Nom du package : `com.toabide.app` (validé disponible, cf. section changement de
      package ci-dessus)
- [x] Langue par défaut : Anglais (États-Unis) — en-US
- [x] Type : Appli (pas Jeu)
- [x] Gratuite ou payante : **Sans frais** (cohérent avec le modèle freemium — le premium
      se gère via IAP/KKiaPay dans l'app, pas via un prix Play Store)
- [x] Protection automatique de l'app (anti-sideloading) : laissée activée
- [x] Déclaration "Règlement du programme pour les développeurs" : cochée
- [x] Bouton "Créer une application" cliqué — app créée avec succès (2026-09-10)

### Écran 2 — Tableau de bord de l'app
- [x] App visible dans Play Console, tableau de bord affiché avec le parcours en 3 blocs :
      Tests internes / Terminer la configuration / Tests fermés
- [ ] **PROCHAINE ACTION** : cliquer "Afficher les tâches" sous "Terminer la configuration
      de votre appli" → c'est le bloc obligatoire avant tout envoi de build (fiche Play
      Store + formulaires de conformité, cf. liste détaillée ci-dessous)

### Écrans suivants (à venir, pas encore atteints)
- [ ] Fiche Play Store (Store Listing) : description courte/complète, icône 512×512,
      feature graphic 1024×500, **captures d'écran (min. 2, obligatoire)**, catégorie
- [ ] ⚠️ Langue par défaut du compte = Anglais (en-US), choisie à la création (2026-09-10).
      Décidé : garder en-US par défaut MAIS **ajouter le français comme langue
      supplémentaire de la fiche Play Store** (Présence sur le Store → Fiche principale →
      sélecteur de langue → Ajouter le français) et le remplir en PRIORITÉ/plus complet
      que l'anglais — cohérent avec le marché cible (Afrique francophone + diaspora).
- [ ] Coordonnées de contact (email public — décider : email perso actuel ou attendre
      l'email `@toabide.online` à créer)
- [ ] URL politique de confidentialité → `https://toabide.online/privacy.html` (déjà prêt)
- [ ] Data Safety Form (déclaration des données collectées)
- [ ] Classification du contenu (questionnaire IARC)
- [ ] Public cible & contenu (âge, présence de pubs → cocher oui, AdMob)
- [x] Signature d'application Play (Play App Signing — Google gère la clé finale, recommandé)
- [x] Clé d'upload générée le 2026-09-10 : `keystore/abide-upload-key.keystore`, alias
      `abide-upload`. SHA-1 upload : `AE:B0:08:D1:23:1F:D1:12:08:D0:F4:0A:51:68:12:71:64:37:14:E9`
      (⚠️ PAS le SHA-1 à enregistrer pour OAuth — voir plus bas)
- [x] Build AAB signé release réussi (`./gradlew bundleRelease`), uploadé sur Play Console
      en Test interne le 2026-09-10 ("Abide - 1 (1.0)")
- [x] Testeur ajouté (toi-même) dans "Test Interne liste", app installée avec succès depuis
      le vrai Play Store après un délai de propagation du scan Google (~qq heures)
- [x] **Google Sign-In cassé puis RÉSOLU (2026-09-11)** : le SHA-1 réellement utilisé par
      Google pour signer l'APK distribué (Play App Signing re-signe avec SA PROPRE clé,
      différente de la clé d'upload) a été extrait directement de l'APK installé via
      `apksigner verify --print-certs` → `CA:BE:68:D5:BD:F2:83:AA:46:F4:F3:B5:F1:0A:2E:C9:91:2A:2F:72`
      (les SHA-1 copiés depuis le dashboard Play Console — colonnes "classique" et
      "post-quantique" — ne correspondaient à AUCUNE clé réelle, piège documenté en détail
      dans `tasks/lessons.md` 2026-09-11). 3e Client OAuth Android créé avec ce SHA-1
      (`34894391883-fr1hf8mtvqd90np7l65920uncc48buac.apps.googleusercontent.com`), ajouté
      dans Supabase Authorized Client IDs → **connexion testée et fonctionnelle depuis le
      Play Store**.
- [x] Liste finale des 3 Client IDs dans Supabase (Web + Android debug + Android release) :
      `34894391883-sn5akdqig9b66jun8t3bgb0h36hdlpmq.apps.googleusercontent.com,`
      `34894391883-bemreedn3dq8htpuuv7viqeqp4o2d0v2.apps.googleusercontent.com,`
      `34894391883-fr1hf8mtvqd90np7l65920uncc48buac.apps.googleusercontent.com`

### ⚠️ CONTRAINTE CRITIQUE DE PLANNING — exigence Google de test fermé (2026-09-10)
> Source : https://support.google.com/googleplay/android-developer/answer/14151465
> (lien donné par Google Play Console lui-même dans le parcours de publication).
>
> Pour un NOUVEAU compte développeur, la production publique (accessible à tout le monde)
> n'est PAS accessible directement. Étapes obligatoires dans l'ordre :
> 1. Test interne (optionnel, rapide — quelques minutes, petit groupe de confiance)
> 2. **Test fermé OBLIGATOIRE : 12 testeurs minimum, inscrits en continu pendant AU MOINS
>    14 JOURS CONSÉCUTIFS** avant de pouvoir candidater à la production
> 3. Formulaire de candidature à l'accès production (3 parties : engagement des testeurs,
>    description de l'app, préparation au lancement)
> 4. Review Google : jusqu'à 7 jours (parfois plus)
>
> **Donc compter ~3 SEMAINES MINIMUM** entre "build prêt à soumettre" et "publié en
> production publique". À anticiper dès maintenant :
> - [ ] Recruter 12 testeurs réels (amis, famille, communauté) qui acceptent de garder
>       l'app installée et active pendant 14 jours (un testeur qui désinstalle ou n'active
>       jamais son compte de test ne compte pas dans les 12)
> - [ ] Une fois en test fermé (fiche Play Store publiée, même non publique) : vérifier si
>       AdMob réel et AppsFlyer OneLink deviennent utilisables à ce stade (probable mais
>       à confirmer) — pourrait débloquer ces deux chantiers sans attendre la production

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
3. **Mini-site — DÉPLOYÉ ET DNS PROPAGÉ (2026-07-27)** sur Vercel via toabide.online
   (résolu : le blocage était un cache DNS local sur la machine de l'utilisateur, pas
   une mauvaise config — nameservers Vercel corrects et validés dès le départ).
   4 pages : index, faq, privacy, terms. Bug Vercel "SPA fallback" corrigé
   (`landing/vercel.json`, cf. lessons.md). Email de contact : ldejoas@gmail.com
   (mis à jour partout : landing + app).
   - [x] Câblé dans `SettingsView.vue` (FAQ/CGU/Confidentialité) via `@capacitor/browser`
         (installé en @6.0.6, compatible Capacitor 6 — dernière stable de la branche 6.x)
   - [ ] ⚠️ À TESTER SUR APPAREIL : Réglages → FAQ/CGU/Confidentialité → ouvre le
         navigateur in-app sur la bonne page (pas d'écran blanc, pas de 404)
   - [ ] ⚠️ Vérifier que https://toabide.online/ répond (DNS propagé) AVANT la
         soumission Google Play — sinon re-câbler temporairement sur l'URL Vercel
   - [ ] Donner l'URL de confidentialité finale à la fiche Google Play Console

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

### 🔴 BLOQUANT MISE EN LIGNE — Survie des notifications au kill du processus

Android efface TOUTES les alarmes d'une app quand son processus est tué :
balayage depuis les applis récentes, force-stop, nettoyeur de RAM (systématique
sur ROM Transsion/Infinix, Xiaomi, Huawei, Oppo). Mesuré le 2026-09-08 :
**57 alarmes avant `am force-stop`, 0 après.**

- [x] Replanification forcée au démarrage à froid du processus (`freshProcess`),
      sans consulter `getPending()` qui renvoie un cache mensonger — bridée à
      1×/heure pour ne pas réalimenter le filtre anti-spam Android. (2026-09-08)
- [ ] **Receiver `BOOT_COMPLETED`** : replanifier au redémarrage du téléphone.
      La permission est déjà dans le manifest, le receiver n'existe pas.
- [ ] **WorkManager périodique** (~6h) : replanifier même sans ouverture de l'app.
      SEULE façon de couvrir quelqu'un qui balaie l'app et ne la rouvre pas —
      sinon il ne reçoit plus AUCUN rappel, indéfiniment.
- [ ] Tester le cycle complet : balayer l'app → attendre un créneau → vérifier
      `dumpsys notification | grep post_frequency` (count doit incrémenter).

> ⚠️ Sans ces deux points, un utilisateur qui ferme l'app depuis les récents
> cesse définitivement de recevoir ses rappels. C'est le scénario le plus
> courant sur Android d'entrée de gamme.


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
- [x] Compte AdMob **approuvé** (vérifié 2026-09-10) + profil de paiement **complet**
      (compte AdSense Bénin lié) + bloc d'annonces configuré
- [x] ✅ RÉSOLU (2026-09-12) : app AdMob passée en **« Prêt » / « Diffusion d'annonces
      activée »**. Le blocage « Examen requis / diffusion limitée » venait de deux
      manques, corrigés le 2026-09-11 : (1) l'app AdMob n'était liée à aucune plate-forme
      de téléchargement → bouton **"Ajouter un magasin d'applications"** dans AdMob, une
      fois l'app existante sur Play Console (le Test interne suffit, pas besoin de
      production) ; (2) fichier `app-ads.txt` absent du site développeur → créé dans
      `landing/app-ads.txt` (ligne `google.com, pub-4844051778459996, DIRECT,
      f08c47fec0942fa0`) et déployé sur `https://toabide.online/app-ads.txt` via Vercel.
      Le crawler AdMob l'a validé en ~24 h.
- [ ] ⚠️ ACTIVATION DES VRAIES PUBS — **à faire UNIQUEMENT juste avant la Production
      publique**, PAS pendant le test fermé : décommenter `VITE_ADMOB_INTERSTITIAL_ID`
      dans `.env.local`, puis rebuild + resync + nouvel AAB. Raison de ne pas le faire
      maintenant : pendant les 14 jours de test fermé, 12 testeurs utilisent l'app
      intensivement — un seul clic (même accidentel) sur une vraie pub peut déclencher
      une suspension du compte AdMob pour trafic invalide, pour zéro revenu réel.
      Rester sur les IDs de TEST jusque-là. **NE JAMAIS cliquer ses propres vraies pubs.**
- [ ] ⚠️ Le téléphone de test principal utilise un DNS bloqueur de pubs (AdGuard) — les
      requêtes AdMob n'arrivent jamais, donc AUCUNE pub ne s'affiche tant qu'il est actif
      (comportement confirmé par l'utilisateur, pas un bug de l'app). Il avait été
      désactivé pour le test du 2026-07-25 (résultats fiables). **Refaire ce même geste
      (désactiver AdGuard) avant toute vérification finale du comportement publicitaire
      précédant la Production**, sinon les tests donneraient l'illusion que les pubs ne
      s'affichent jamais alors que c'est juste le DNS qui les bloque sur cet appareil précis.
- [ ] iOS : ajouter GADApplicationIdentifier dans Info.plist + App ID iOS (build Mac)
- [x] À TESTER SUR APPAREIL : pub à l'ouverture IA, au quiz, à la navigation (cooldown), jamais si premium ✅ validé appareil 2026-07-25 (AdGuard désactivé pour ce test)

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

### Synchronisation complète des données utilisateur 🚧 (planifié 2026-09-07)
> Promesse produit énoncée dès le départ, JAMAIS tenue : seules 3 tables sur 11
> remontent au cloud. Révélé brutalement par une perte de données locale.
> Plan détaillé : docs/sync-plan.md

- [x] Migrations `sync_user_data_tables` : 7 tables créées (highlights, bookmarks,
      notes, quiz_results, prayer_moments, fasting, activity_days) — RLS active +
      4 policies chacune, UNIQUE(user_id, local_id), CASCADE sur profiles
- [x] Migration `reading_plans_sync_columns` : + scope, title, template_id, source,
      local_id, updated_at. Index UNIQUE PARTIEL (WHERE local_id IS NOT NULL) car
      les 1069 lignes héritées ont local_id NULL
- [x] ⚠️ BUG CORRIGÉ : reading_plans passait par `insert` → 1069 lignes pour
      2 utilisateurs. Désormais `upsert` sur (user_id, local_id)
- [x] ⚠️ BUG CORRIGÉ : reading_progress est maintenant alimentée (upsert sur
      user_id,version,book_id,chapter)
- [x] pushUserData() étendu aux 11 tables, par lots de 200
- [x] pullUserData() créé + branché sur SIGNED_IN (stores/auth.js)
- [x] Streak au pull : on garde le MAX local/cloud (ne jamais écraser une série)
- [x] Vérif automatique : les 11 tables validées champ par champ contre le schéma réel
- [ ] ⚠️ À TESTER SUR APPAREIL : lire un chapitre → ligne dans Supabase ;
      effacer les données → se reconnecter → tout revient ; sync 2× → 0 doublon
- [ ] Purger les 740 doublons de reading_plans (APRÈS validation du non-doublonnage)
