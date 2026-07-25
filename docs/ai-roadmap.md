# Roadmap IA — Le Copilote d'étude biblique d'Abide

> **Principe directeur.** Ne pas faire un « ChatGPT biblique » : les modèles généralistes
> savent déjà discuter de la Bible et nous ne gagnerons pas ce terrain.
>
> Notre avantage unique : **une IA profondément intégrée à une Bible structurée.**
> Aucune IA généraliste ne peut ouvrir un chapitre dans l'app d'un clic, suivre la
> progression de lecture de l'utilisateur, ou construire un plan de lecture qu'il
> suivra vraiment. C'est là qu'est la différenciation.

*Document vivant — on coche au fur et à mesure. Dernière mise à jour : 2026-07-10.*
*→ Directions A & B (accompagnateur personnel) planifiées en §6.*
*→ Suivi façon todo-list en §0 (ci-dessous) : ce qui est FAIT vs À FAIRE, classé par faisabilité.*

---

## 0. SUIVI RAPIDE — Fait / À faire, classé par faisabilité (2026-07-10)

> Vue d'ensemble type todo-list. Le détail de chaque idée est en §2 et §4bis.
> `[x]` = fait · `[ ]` = à faire. Faisabilité : 🟢 maintenant · 🟡 un peu de travail · 🔴 corpus à construire.

### 🏷️ Vocabulaire des fonctionnalités (à utiliser par leur NOM, pas leur numéro)
- **La Note IA** — exporter un message du Guide dans une remarque (versets → tags @, badge « Guide » dans la liste). *L'IA agit, 2e endroit.*
- **Le Parcours généré** — décrire un besoin en langage naturel → « Générer un parcours » → vrai plan de lecture suivable. *L'IA agit, 1er endroit.*
- **Le Badge de confiance** — pastille ✅/⚠️ DISCRÈTE : n'apparaît QUE s'il y a nuance / débat / contradiction possible. Sinon bulle normale.
- **La Mémoire de progression** — l'IA qui sait ce que tu as lu/surligné. ❌ **ÉCARTÉE DU MVP** (décision 2026-07-13).

### ✅ DÉJÀ FAIT
- [x] **La Note IA** — export d'un message du Guide en remarque (versets → tags @, Markdown nettoyé, badge « Guide ») *(2026-07-13)*
- [x] **(3) Prédication complète** — mode dédié, 8 sections, interactif *(2026-07-08)*
- [x] **(4) Méditation quotidienne** — mode dédié + bouton sur le verset du jour *(2026-07-08)*
- [x] **(9) Assistant d'étude socratique** — mode Étude, rebondit sur les réponses *(2026-07-08)*
- [x] **(13) Quiz de fin de chapitre** — QCM 5 questions sur le vrai texte, étoiles, variété *(2026-07-10)*
- [x] Socle : RAG toute la Bible · références vérifiées + cliquables · mémoire de conversation · prénom · Markdown

### 🎯 L'IA qui agit — les 3 endroits (décision 2026-07-13)
1. [ ] **Le Parcours généré** (langage naturel → vrai plan) — **prochaine étape**
2. [x] **La Note IA** (message du Guide → remarque) — *fait le 2026-07-13*
3. ~~3e endroit~~ — abandonné (jugé peu pertinent).

### 🟢 À FAIRE — faisable MAINTENANT (aucune donnée nouvelle)
- [ ] **(2) Badge niveau de confiance** ✅/⚠️ — le prompt le dit déjà, manque le rendu visuel. **← le plus rapide**
- [ ] **(1) Bloc « Pour aller plus loin »** distinct — le parcours de passages existe en texte, manque la carte visuelle
- [ ] **(11) Détection de thèmes d'un chapitre** — bouton dans le lecteur → 4-6 thèmes cliquables
- [ ] **(8) Chaîne de références** — détecter « tous les passages sur X » → RAG élargi (k=20-30) groupé par livre
- [ ] **(15) Recherche naturelle** dans la barre Bible — brancher le RAG sémantique (aujourd'hui : noms de livres only)
- [ ] **(16) Détection de citation** — « Dieu est mon berger » → « Psaume 23:1 » dans le champ de recherche
- [ ] **(5) Passages parallèles** — « Aussi raconté dans… » via embeddings (similarité entre évangiles)
- [ ] **(12) Réseau biblique** — « liens » d'un chapitre = top-k embeddings hors du livre courant

### 🟡 À FAIRE — demande un peu de travail (données locales à faire circuler, ou contenu à figer)
- [ ] **Le Parcours généré (18)** → **vrai plan de lecture** créé dans l'app *(= B1, la plus différenciante)*. **← PROCHAINE ÉTAPE**
- [ ] **(17) Contexte historique** — 66 fiches figées (auteur, date, destinataires) en en-tête de livre
- ❌ **(14) Mémoire de progression** — **écartée du MVP** (décision 2026-07-13). À reconsidérer post-MVP (= Direction A).
- [ ] **🏆 Dossier d'étude** — le livrable phare, synthèse structurée multi-sections (Vague 3)

### 🔴 À FAIRE — corpus à construire (lourd, seulement si la valeur le justifie)
- [ ] **(10) Mots originaux** — lexique Strong's (libre de droits) + appui long sur un mot
- [ ] **(13b) Quiz adaptatif** — adapter au niveau + mémoriser les erreurs *(la base quiz est faite, reste l'adaptation)*
- [ ] **(6) Chronologie** — corpus d'événements datés
- [ ] **(7) Carte des personnages** — corpus de personnages + relations

### 🔴 BLOQUANT avant déploiement public (reporté volontairement — phase de test)
- [ ] **Vague 0** — compteur de sessions + rate limiting + plafond tokens *(cf. §3)*. **Prérequis absolu** à A & B et au Dossier d'étude.

---

## 1. Ce dont on dispose RÉELLEMENT aujourd'hui (vérifié le 2026-07-08)

Ces capacités conditionnent ce qui est faisable et à quel coût. À relire avant de planifier.

### ✅ Acquis (socle solide)

| Capacité | Détail | Où |
|---|---|---|
| **Bible complète offline** | 31 170 versets, 66 livres, LSG 1910 | SQLite bundlé (`lsg1910SQLite.db`) |
| **7 versions Bible** | LSG, Darby, Martin (FR) · KJV, WEB, ASV, YLT (EN) | R2 + téléchargement |
| **Embeddings complets** | 31 074 versets vectorisés, 66 livres, `vector(768)` | Supabase `bible_embeddings` |
| **Recherche sémantique** | `match_bible_embeddings(query_embedding, match_count)` | Fonction SQL pgvector |
| **Recherche plein texte** | `search_bible(...)` | Fonction SQL |
| **Chat IA** | OpenRouter (GPT-4o-mini), Edge Function `ai-chat` | Serveur, clé jamais côté client |
| **Sources vérifiées** | Le LLM cite → on extrait (regex + 66 livres) → on vérifie contre la vraie Bible → hallucinations écartées + loggées | `ai-chat/index.ts` |
| **Références cliquables** | Un clic ouvre le chapitre + surbrillance du verset (2,5 s) | `?v=N` |
| **Mémoire de conversation** | Résumé compressé au-delà d'un seuil + N derniers messages | `ai_conversations.summary` |
| **Conversations persistées** | Multi-discussions, renommage, RLS par utilisateur | `ai_conversations` / `ai_messages` |
| **4 modes** | Enseignement · Prédication · Méditation · Théologie | ⚠️ *simples nuances de ton, pas de vraies capacités distinctes* |
| **Prénom de l'utilisateur** | Le Guide l'appelle par son prénom | Depuis `profiles.display_name` |
| **Contexte depuis la Bible** | Bouton « Guide IA » sur une sélection de versets → discussion préremplie | `useVerseActions` |
| **Données utilisateur locales** | Surlignages, signets, notes (avec tags `@verset`), progression, streak | SQLite `abide_user` |
| **Plans de lecture** | Profil / custom / préétablis, un seul actif | Local-first |

### ❌ Ce qui manque (les vrais verrous)

| Manque | Conséquence | Coût pour l'obtenir |
|---|---|---|
| **Pas de compteur de sessions actif** | 🔴 **Faille** : usage IA illimité, facture non plafonnée | Faible — table `ai_sessions` existe déjà |
| **Pas de rate limiting** | 🔴 Spam possible | Faible |
| **Aucune donnée structurée sur les personnages** | Pas de carte relationnelle (idée 7) | Élevé — corpus à construire |
| **Aucune donnée de chronologie** | Pas de frise (idée 6) | Élevé — corpus à construire |
| **Pas de texte original (grec/hébreu)** | Pas d'étude des mots (idée 10) | Moyen — Strong's est libre de droits |
| **Pas de passages parallèles annotés** | Comparaison auto imparfaite (idée 5) | Moyen — dérivable par embeddings |
| **Pas de contexte historique par livre** | Auteur/date/destinataires (idée 17) | Faible — 66 fiches à écrire |
| **Pas de découpage par péricope** | Le RAG travaille verset par verset (contexte parfois trop court) | Moyen |

---

## 2. Les 18 idées : faisabilité, valeur, et où les implémenter

**Légende faisabilité :** 🟢 faisable maintenant avec l'acquis · 🟡 demande un peu de données/travail · 🔴 demande un corpus à construire.

| # | Idée | Faisab. | Valeur | Où l'implémenter |
|---|------|:---:|:---:|---|
| 1 | **Navigation intelligente** (réponse → parcours de passages cliquables) | 🟢 | ⭐⭐⭐ | **Chatbot** (l'Ancre) |
| 15 | **Recherche ultra naturelle** (« le verset où Paul parle de courir ») | 🟢 | ⭐⭐⭐ | **Chatbot** + barre de recherche Bible |
| 16 | **Détection de citation** (« Dieu est mon berger » → Ps 23:1) | 🟢 | ⭐⭐ | **Chatbot** + champ de recherche |
| 3 | **Prédication complète** (texte, contexte, 3 points, illustrations, prière) | 🟢 | ⭐⭐⭐ | **Chatbot** (mode dédié) |
| 4 | **Méditation quotidienne** | 🟢 | ⭐⭐ | **Chatbot** + **Accueil** (verset du jour) |
| 9 | **Assistant d'étude socratique** (il pose les questions) | 🟢 | ⭐⭐⭐ | **Chatbot** (mode dédié) |
| 2 | **Niveau de confiance** (✅ clair / ⚠️ débattu + traditions) | 🟢 | ⭐⭐⭐ | **Chatbot** (structure de réponse) |
| 8 | **Chaîne de références** (« tous les passages sur le pardon ») | 🟢 | ⭐⭐⭐ | **Chatbot** (RAG élargi, k=20-30) |
| 11 | **Détection de thèmes** d'un chapitre | 🟢 | ⭐⭐ | **Lecteur Bible** (panneau contextuel) |
| 18 | **Génération de parcours** (« je suis anxieux » → 7 jours) | 🟡 | ⭐⭐⭐ | **Plans de lecture** ← *lien fort avec l'existant* |
| 14 | **Mémoire de progression** (sait ce que tu as lu/étudié) | 🟡 | ⭐⭐⭐ | **Chatbot** ← *on a déjà `reading_progress`, notes, surlignages* |
| 5 | **Passages parallèles** (baptême de Jésus dans les 4 évangiles) | 🟡 | ⭐⭐ | **Lecteur Bible** + Chatbot |
| 12 | **Réseau biblique** (graphe de liens entre passages) | 🟡 | ⭐⭐ | **Lecteur Bible** (panneau « liens ») |
| 13 | **Quiz intelligent adaptatif** | 🟡 | ⭐⭐ | Nouvel écran (onglet Plus ?) |
| 17 | **Contexte historique** (auteur, date, destinataires, coutumes) | 🟡 | ⭐⭐ | **Lecteur Bible** (en-tête de livre) |
| 10 | **Mots originaux** (agapè : grec, sens, occurrences) | 🔴 | ⭐⭐ | **Lecteur Bible** (appui long sur un mot) |
| 6 | **Chronologie** (frise de la vie de David) | 🔴 | ⭐⭐ | Nouvel écran |
| 7 | **Carte des personnages** (arbre relationnel) | 🔴 | ⭐⭐ | Nouvel écran |

### 🏆 La fonctionnalité phare : le « Dossier d'étude »

> *« Pourquoi Jésus est-il appelé l'Agneau de Dieu ? »* → un dossier complet :
> résumé en une phrase · références de la Genèse à l'Apocalypse · prophéties AT + accomplissements NT ·
> personnages · contexte historique · mots grecs/hébreux · interprétations · méditation · plan de prédication · quiz.

C'est la **synthèse des idées 1, 2, 3, 8, 9, 10, 13, 17**. C'est *le* livrable qui distingue Abide
d'un chatbot. Techniquement, c'est une **réponse structurée** (JSON) rendue dans une vue dédiée,
pas une bulle de chat — chaque section étant une brique déjà listée ci-dessus.

---

## 3. Plan d'implémentation par vagues

### ⚠️ Vague 0 — Limites & coûts (VOLONTAIREMENT REPORTÉE)

> 🟡 **Décision utilisateur (2026-07-08) : on reste en mode ILLIMITÉ pendant la phase de test.**
> L'objectif est d'abord d'explorer et valider les capacités de l'IA sans être bridé.
> **À brancher OBLIGATOIREMENT avant tout déploiement public** (SECURITY.md §4) — le risque
> financier est réel dès qu'il y a de vrais utilisateurs.

- [ ] **Compteur de sessions** dans `ai-chat` : vérifier `sessions_used < sessions_limit` AVANT
      tout appel à OpenRouter → 403 sinon. Table `ai_sessions` existe déjà.
- [ ] **Rate limiting** (5 req/min par utilisateur).
- [ ] **Plafond de tokens** par type de requête (chat court vs dossier long).
- [ ] Monitoring des coûts + alerte de seuil.

### Vague 1 — Le chatbot devient un vrai copilote (🟢, aucune donnée nouvelle)

Tout est faisable avec les embeddings + la Bible qu'on a déjà.

- [ ] **(1) Navigation intelligente** : la réponse se termine par un *parcours* de 4-8 passages
      cliquables, ordonnés pédagogiquement. → sortie structurée du LLM + `verifyRefs()` existant.
- [ ] **(2) Niveau de confiance** : le LLM marque ✅ (clairement enseigné) ou ⚠️ (débattu),
      et dans ce cas expose les positions (catholique / protestante / orthodoxe / évangélique)
      sans en imposer une. → règle de prompt + rendu visuel du badge.
- [ ] **(8) Chaîne de références** : détecter l'intention « tous les passages sur X » →
      RAG élargi (k=20-30, seuil bas) → liste groupée par livre, cliquable.
- [ ] **(15) Recherche naturelle** + **(16) Détection de citation** : une requête qui « sonne comme
      un verset » → recherche sémantique directe, on affiche le passage trouvé.
      *Bonus : brancher aussi sur la barre de recherche Bible (pas seulement le chat).*
- [ ] **(3) Prédication complète** : le mode « Prédication » doit VRAIMENT produire
      texte principal · contexte · intro · 3 points · illustrations · applications · conclusion · prière.
      Aujourd'hui c'est une simple nuance de ton → il refuse quand on lui demande.
      → prompt spécifique + `max_tokens` relevé + rendu en sections.
- [ ] **(4) Méditation quotidienne** : mode « Méditation » → verset · explication · application ·
      question · prière. Réutilisable sur l'**Accueil** (à partir du verset du jour).
- [ ] **(9) Assistant socratique** : nouveau mode « Étude » — il pose les questions
      (Que remarques-tu ? Qui parle ? Pourquoi ? Quel contexte ?) au lieu de tout donner.

> **Note technique commune à la vague 1 :** ces sorties sont *structurées*. Plutôt qu'un bloc de
> texte, demander au LLM un JSON (`{ answer, confidence, sections[], path[] }`) et le rendre
> proprement côté client. Les références passent toujours par `verifyRefs()`.

### Vague 2 — L'IA connaît l'utilisateur et le lecteur (🟡)

On branche l'IA sur les données qu'on possède déjà localement.

- [ ] **(14) Mémoire de progression** : passer au prompt un résumé de ce que l'utilisateur a lu
      (`reading_progress`), surligné, noté, et son plan actif. → « Tu as terminé Jean, veux-tu… ».
      ⚠️ Ces données sont **locales** (SQLite) → les envoyer en contexte à l'Edge Function.
- [ ] **(18) Génération de parcours** : « je suis anxieux » → l'IA génère un plan de 7 jours
      (lecture · méditation · prière · question) → **créé comme un vrai plan** dans `reading_plans`.
      ← *l'intégration la plus forte : l'IA ne conseille pas, elle agit dans l'app.*
- [ ] **(11) Détection de thèmes** : dans le lecteur, un bouton « Thèmes de ce chapitre » →
      l'IA liste 4-6 thèmes, chacun ouvrant une chaîne de références (idée 8).
- [ ] **(5) Passages parallèles** : détecter qu'un passage a des parallèles (via embeddings :
      forte similarité entre évangiles) → panneau « Aussi raconté dans… » + tableau des différences.
- [ ] **(12) Réseau biblique** : « liens » d'un chapitre = top-k embeddings d'autres livres,
      filtrés (exclure le même livre) → navigation de lien en lien.
- [ ] **(17) Contexte historique** : 66 fiches (auteur, date, destinataires, contexte, géographie).
      Rédigées une fois (LLM + relecture), stockées en base → affichées en en-tête de livre.
      *Pas de génération à la volée : c'est du contenu stable, on le fige.*

### Vague 3 — Le Dossier d'étude (🏆 la différenciation)

- [ ] **Écran « Dossier d'étude »** : une question → un document structuré multi-sections.
- [ ] Orchestration : plusieurs appels LLM (ou un seul très structuré) + RAG élargi.
- [ ] Sections : résumé · références AT→NT · prophéties/accomplissements · personnages ·
      contexte · mots originaux · interprétations · méditation · plan de prédication · quiz.
- [ ] Sauvegarde du dossier (consultable hors ligne une fois généré) + partage.
- [ ] ⚠️ Coûteux en tokens → réservé au **premium** (et compteur strict).

### Vague 4 — Contenus à construire (🔴, corpus)

Nécessitent des données qu'on n'a pas. À faire seulement si la valeur le justifie.

- [ ] **(10) Mots originaux** : intégrer un lexique Strong's (libre de droits) + concordance.
      → appui long sur un mot dans le lecteur.
- [ ] **(13) Quiz adaptatif** : générer des questions selon le niveau + mémoriser les erreurs.
      (Table `quiz_attempts` à créer.)
- [ ] **(6) Chronologie** : corpus d'événements datés + rattachement aux chapitres.
- [ ] **(7) Carte des personnages** : corpus de personnages + relations (arbre).

---

## 4. Décisions d'architecture à retenir

1. **Les références sont toujours vérifiées.** Toute référence produite par le LLM passe par
   `extractRefs()` + `verifyRefs()` (contre `bible_embeddings`). Une référence inventée est
   écartée et loggée. → *En contexte biblique, la véracité prime sur la pertinence.*

2. **Le RAG reste invisible.** Les versets remontés par similarité servent de contexte au modèle,
   jamais de « sources » affichées. Les sources = ce que le LLM a réellement cité.

3. **Sorties structurées.** Pour tout ce qui dépasse la conversation (prédication, dossier,
   parcours), demander du **JSON** au LLM et le rendre côté client. Plus fiable qu'un parsing
   de texte libre, et permet des UI riches.

4. **L'IA doit AGIR dans l'app, pas seulement parler.** Générer un plan de lecture réel,
   ouvrir un chapitre, créer une note, marquer une progression. C'est ça, l'intégration profonde.

5. **Le contenu stable est figé, pas régénéré.** Contexte historique, thèmes d'un chapitre,
   passages parallèles : on les génère une fois, on les stocke. Moins cher, plus rapide, offline.

6. **Coût maîtrisé avant richesse.** Aucune fonctionnalité coûteuse n'est déployée avant le
   compteur de sessions + rate limiting (Vague 0).

---

## 4bis. BILAN DE COUVERTURE (mis à jour le 2026-07-08, après le lot « modes »)

État réel de chacune des 18 idées. ✅ fait · 🟨 partiel · ⬜ pas commencé.

| # | Idée | État | Ce qui est fait / ce qui manque |
|---|------|:---:|---|
| 1 | Navigation intelligente | 🟨 | Le prompt demande un « Pour aller plus loin » (3-6 passages ordonnés, chacun expliqué). Les références sont cliquables. **Manque :** rendu visuel distinct du parcours (aujourd'hui c'est du texte + chips en bas). |
| 2 | Niveau de confiance | 🟨 | Le prompt impose de dire quand un point est **clairement enseigné** vs **débattu**, et d'exposer les traditions (catholique/orthodoxe/protestante). **Manque :** badge visuel ✅/⚠️ dans la bulle. |
| 3 | Prédication complète | ✅ | Mode Prédication réécrit : 8 sections obligatoires (texte, contexte, intro, 3 points, illustrations, applications, conclusion, prière), développées pour de vrai. **Interactive** : il propose de retravailler chaque partie. `max_tokens` porté à 2200 (700 avant → il refusait). |
| 4 | Méditation quotidienne | ✅ | Mode Méditation réécrit : verset · ce que Dieu y dit · application · une question · prière. **+ bouton « Méditer avec le Guide » sur le verset du jour** (Accueil) → ouvre l'IA en mode méditation, verset prérempli. |
| 5 | Passages parallèles | ⬜ | Faisable via embeddings (forte similarité entre évangiles). Vague 2. |
| 6 | Chronologie | ⬜ | 🔴 Corpus d'événements datés à construire. |
| 7 | Carte des personnages | ⬜ | 🔴 Corpus de personnages + relations à construire. |
| 8 | Chaîne de références | 🟨 | Le RAG remonte les passages proches ; le LLM peut lister « tous les passages sur X ». **Manque :** détection d'intention → RAG élargi (k=20-30) + rendu groupé par livre. |
| 9 | Assistant d'étude | ✅ | **Nouveau mode « Étude »** (migration 011). Ce n'est PAS un interrogateur : il enseigne, pose UNE question au bon moment, **rebondit sur la réponse** (valide, enrichit, corrige avec douceur), et fait progresser petit à petit. |
| 10 | Mots originaux | 🟨 | Le mode Théologie explique un terme grec/hébreu **quand il en est certain** (agapè, hesed…). **Manque :** lexique Strong's + appui long sur un mot dans le lecteur. |
| 11 | Détection de thèmes | ⬜ | Vague 2 (bouton « Thèmes de ce chapitre » dans le lecteur). |
| 12 | Réseau biblique | ⬜ | Vague 2 (top-k embeddings hors du livre courant). |
| 13 | Quiz intelligent | 🟨 | **Quiz de fin de chapitre livré (2026-07-10)** : bouton en bas de chaque chapitre → Edge Function `quiz-chapter` génère un QCM de 5 questions sur le VRAI texte du chapitre (JSON validé strictement) → modal plein écran → étoiles (3=★ · 4=★★ · 5=★★★, meilleur score gardé) stockées en local (`quiz_results`) et affichées sur la grille de chapitres. **Manque :** adaptation au NIVEAU de la personne + mémorisation des erreurs (Vague 4). Connexion requise (génération serveur). |
| 14 | Mémoire de progression | 🟨 | La conversation a une mémoire (résumé compressé). **Manque :** passer au prompt ce que l'utilisateur a lu / surligné / son plan actif (données locales → à envoyer en contexte). |
| 15 | Recherche ultra naturelle | 🟨 | Le RAG sémantique le permet déjà côté IA. **Manque :** brancher aussi la barre de recherche Bible (aujourd'hui elle ne cherche que des noms de livres). |
| 16 | Détection de citation | 🟨 | Le RAG retrouve le verset. **Manque :** réponse dédiée type « Psaume 23:1 » dans le champ de recherche. |
| 17 | Contexte historique | 🟨 | Les modes Prédication et Théologie donnent auteur/destinataires/contexte. **Manque :** 66 fiches figées, affichées en en-tête de livre. |
| 18 | Génération de parcours | ⬜ | Vague 2 — **la plus forte** : « je suis anxieux » → créer un VRAI plan de lecture dans l'app. |

### Ce que le lot « UX + conversation » (2026-07-08) a apporté

- **Rendu Markdown** des réponses IA (titres, gras, listes, citations) — `markdown-it` + **DOMPurify**
  (contenu LLM = hostile, SECURITY.md §6 : `html:false`, whitelist de tags stricte).
- **Références cliquables INLINE** dans le corps du message : on parcourt les nœuds texte du DOM
  déjà assaini et on y injecte de vrais `<button>` (jamais de HTML généré → aucune injection).
  Les chips « Sources » restent en bas.
- **Sélecteur de mode dans le champ de saisie** : drop-up avec icône + nom + coche, changeable
  en cours de conversation.
- **Scroll du champ de saisie corrigé** : `ion-textarea` n'a **pas** de `part="native"` (→ `::part`
  sans effet) et `auto-grow` posait une hauteur inline empêchant tout scroll. Remplacé par
  `rows` calculé (1→5 lignes) + `max-height` + `overflow-y:auto` sur `:deep(.native-textarea)`.
- **L'IA suscite la conversation** : elle ne répond plus pour s'arrêter, elle **ouvre**. Relance
  ancrée dans ce qui vient d'être dit (jamais « as-tu d'autres questions ? »), une seule à la fois,
  d'intensité **modulée par mode** : très forte en Étude · forte en Enseignement · modérée en
  Théologie (nuance, objection) et Prédication (retravailler le message) · **discrète en Méditation**
  (le recueillement prime). Exception : une salutation reste légère.

### Ce que le lot « modes » (2026-07-08) a apporté

- **5 modes réels** au lieu de 4 nuances de ton : Enseignement · **Étude** (nouveau) · Méditation · Prédication · Théologie.
- Chaque mode a désormais un **objectif explicite, une méthode et une structure** détaillés dans le prompt système.
- **Budget de tokens par mode** (`MODE_MAX_TOKENS`) : la prédication passe de 700 à 2200 tokens — c'est ce qui l'empêchait de produire une prédication complète.
- **Références INLINE** obligatoires : citées au fil du texte, à l'endroit où elles éclairent, pas seulement regroupées en bas.
- **Honnêteté théologique** : distinguer ce qui est clairement enseigné de ce qui est débattu.
- **Navigation** : proposer un parcours de passages cliquables quand la question mérite une étude.
- **Validation du mode** côté serveur (whitelist) — un mode arbitraire choisirait un budget de tokens non prévu (SECURITY.md §6).

### Prochaines étapes recommandées

1. **Tester les 5 modes** (surtout Prédication et Étude) et ajuster les prompts au ressenti.
2. **Rendu visuel** : badge ✅/⚠️ (idée 2) + bloc « Pour aller plus loin » distinct (idée 1).
3. **Idée 18** (parcours généré → vrai plan de lecture) : la plus différenciante.
4. **Idée 14** (mémoire de progression) : l'IA sait ce que tu as lu.

---

## 5. Ce qui est déjà vrai aujourd'hui (à ne pas réimplémenter)

- Les références du chatbot sont **déjà cliquables** et ouvrent le chapitre avec le verset surligné.
- Les hallucinations de références sont **déjà bloquées** et loggées.
- Le RAG couvre **déjà toute la Bible** (31 074 versets, 66 livres).
- Le chatbot a **déjà** une mémoire de conversation (résumé compressé).
- Le chatbot **connaît déjà le prénom** de l'utilisateur.
- On peut **déjà** discuter d'un passage sélectionné dans la Bible (bouton « Guide IA »).
- ~~Les 4 modes existent, mais ne sont que des nuances de ton~~ → **✅ corrigé le 2026-07-08** :
  5 modes réels avec objectif, méthode et structure détaillés + budget de tokens par mode.
- Le mode **Prédication** produit désormais une prédication complète et interactive.
- Le mode **Étude** (nouveau) accompagne la découverte sans jouer les interrogateurs.
- Les références sont citées **inline** dans le texte, puis vérifiées et affichées en sources.
- Le **verset du jour** a un bouton « Méditer avec le Guide » (→ IA en mode méditation, prérempli).

---

## 6. 🎯 DIRECTIONS A & B — L'accompagnateur spirituel personnel (planifié le 2026-07-09)

> **Décision utilisateur (2026-07-09) :** les deux directions **A (l'IA qui te connaît)** et
> **B (l'IA qui agit)** sont **la trajectoire retenue** pour faire d'Abide autre chose qu'un
> ChatGPT biblique. **PAS à développer tout de suite** — cette section est la PLANIFICATION.
>
> A + B se renforcent : une IA qui te connaît *et* qui peut agir = un vrai accompagnateur, pas
> un simple répondeur. Ensemble, ils créent une boucle : l'IA observe (A) → propose → agit (B)
> → observe le résultat (A) → réajuste.

### Le verrou architectural à connaître AVANT tout

**Toutes les données personnelles sont LOCALES (SQLite `abide_user` sur le device), PAS sur
Supabase :** `highlights`, `bookmarks`, `notes`, `reading_plans`, `reading_progress`, `streak`.
Or l'Edge Function `ai-chat` tourne **côté serveur** et n'y a **aucun accès**.

→ Conséquence : pour que l'IA « connaisse » l'utilisateur (A) ou « agisse » (B), il faut faire
**circuler** ces données entre le device et le serveur. C'est LE choix de conception central.
Ce qui EST déjà sur Supabase et donc accessible au serveur : `profiles` (dont `user_profile`,
`display_name` — déjà utilisé pour le prénom), `ai_conversations`, `ai_messages`.

---

### DIRECTION A — L'IA qui te connaît

**Objectif.** L'IA personnalise à partir de : profil onboarding, ce que l'utilisateur a lu,
surligné, noté, son plan actif, son streak. Ex : *« Tu as surligné Jean 15.4 la semaine dernière —
veux-tu qu'on creuse ce que "demeurer" veut dire concrètement pour toi ? »*

**Décision de conception : envoyer un "contexte utilisateur" compact avec chaque message.**
Plutôt que de synchroniser toute la base locale vers Supabase (lourd, sensible RGPD), le CLIENT
construit un **petit résumé** de contexte (JSON léger) et le joint à l'appel `ai-chat`. Le serveur
l'injecte dans le prompt système, puis **ne le stocke pas** (ou seulement le minimum). Bénéfices :
offline-first préservé (les données restent maîtresses en local), surface RGPD réduite, simple.

Le contexte utilisateur envoyé (exemple, à borner en taille) :
```json
{
  "profil": "explorateur",              // depuis onboarding (déjà en base aussi)
  "streak": 12,
  "planActif": { "titre": "Connaître Jésus", "jour": 4, "sur": 21 },
  "lectureRecente": ["JHN 15", "JHN 14"],       // derniers chapitres lus
  "surlignagesRecents": [                          // 3-5 max, avec le texte
    { "ref": "JHN 15.4", "texte": "Demeurez en moi…" }
  ],
  "themesRecurrents": ["demeurer", "amour"]        // dérivé (optionnel, plus tard)
}
```

**Étapes A :**
- [ ] **A1 — Exposer le contexte local** : une fonction client `buildUserContext()` (dans un
      nouveau `src/lib/ai-context.js`) qui lit `user-db` (progression, surlignages récents, plan,
      streak) + `auth.profile` et produit le JSON compact ci-dessus. Bornée en taille (tokens).
- [ ] **A2 — Passer le contexte à l'Edge Function** : `ai.sendMessage` joint `userContext` au body ;
      `ai-chat` le reçoit, le **valide/borne** (tout input client est hostile — SECURITY.md §6),
      et l'injecte dans le prompt système (« Ce que tu sais de la personne : … »).
- [ ] **A3 — Régler le prompt** : l'IA utilise ce contexte avec TACT (jamais intrusif, ne récite
      pas les données ; s'en sert pour personnaliser une relance, un exemple, un encouragement).
- [ ] **A4 — Consentement + réglage** : un toggle Settings « Le Guide peut utiliser mon activité
      pour personnaliser » (RGPD). OFF → on n'envoie pas le contexte. Par défaut : à décider.
- [ ] **A5 (plus tard) — Thèmes récurrents** : dériver les thèmes des surlignages/notes (petit
      calcul local ou embeddings) pour un contexte plus riche.

**Sécurité A (à respecter) :** le contexte transite chiffré (HTTPS, déjà le cas). Le serveur ne
le persiste pas au-delà du message. On envoie le MINIMUM utile (pas toute la base). Le toggle de
consentement est non négociable (données spirituelles = sensibles).

---

### DIRECTION B — L'IA qui agit (elle crée dans l'app, ne fait pas que parler)

**Objectif.** Une conversation débouche sur une **action réelle** dans l'app. Ex : *« je traverse
un deuil »* → l'IA propose puis **crée un vrai plan de lecture de 7 jours** (consolation), visible
sur l'Accueil et suivi comme n'importe quel plan.

**Décision de conception : les "actions IA" sont des propositions que l'UTILISATEUR confirme.**
L'IA ne modifie jamais les données de l'utilisateur en douce. Elle **propose** une action
structurée ; le client affiche une carte « ✨ Créer ce plan / Ajouter cette note » ; l'action
n'a lieu qu'au tap. Cohérent avec l'app (local-first : c'est le client qui écrit dans `user-db`).

**Mécanisme : sorties structurées (function-calling léger, sans dépendance).**
En plus de sa réponse texte, l'IA peut émettre un bloc d'action que le serveur **valide** puis
transmet au client :
```json
{
  "answer": "…texte de la réponse…",
  "action": {
    "type": "create_plan",              // ou create_note | add_bookmark | start_meditation
    "label": "Un parcours de 7 jours pour traverser le deuil",
    "payload": { "source": "custom", "days": 7, "chapters": ["PSA 34", "PSA 23", …] }
  }
}
```
Le client rend une **carte d'action** sous la réponse. Au tap → il appelle la fonction existante
(`plan.createPlan`, `userData.saveNote`, `userData.toggleBookmark`…). **Rien de nouveau côté
écriture** : on réutilise tout le socle local-first déjà en place.

**Actions candidates (par ordre de valeur) :**
- [ ] **B1 — `create_plan`** : générer un plan thématique sur mesure (liste de chapitres) →
      `plan.createPlan({ source:'custom', … })`. ⭐ l'action la plus forte (l'IA agit + le plan
      apparaît sur l'Accueil). Réutilise `buildScheduleFromChapters` existant.
- [ ] **B2 — `create_note`** : transformer un échange en note structurée (avec tags `@verset`
      déjà supportés) → `userData.saveNote`.
- [ ] **B3 — `add_bookmark`** : poser un signet sur un chapitre discuté.
- [ ] **B4 — `start_meditation`** : lancer une méditation guidée sur un verset (→ mode méditation
      prérempli, déjà branché depuis le verset du jour).
- [ ] **B5 (plus tard) — `open_passage`** : déjà couvert par les références cliquables, mais on
      pourrait proposer un "parcours" de passages en carte.

**Architecture B :**
- [ ] Le prompt apprend à l'IA QUAND proposer une action (pas à chaque message : seulement quand
      c'est vraiment utile) et à produire le bloc `action` au bon format.
- [ ] `ai-chat` **valide strictement** le bloc action (type dans une whitelist, payload borné) —
      ne jamais faire confiance au LLM sur un payload qui déclenchera une écriture.
- [ ] Nouveau composant `AiActionCard.vue` sous la bulle IA (bouton de confirmation).
- [ ] `ai_messages.action` (colonne JSONB) pour re-afficher l'action dans l'historique.

---

### Ordre de mise en œuvre recommandé (quand on lancera A & B)

> ⚠️ **PRÉREQUIS ABSOLU : la Vague 0** (compteur de sessions + rate limiting). A & B multiplient
> les appels et les tokens (contexte plus long, actions). À faire AVANT — cf. §3 Vague 0.

1. **Vague 0** (sécuriser les coûts) — bloquant.
2. **B1 seul** (`create_plan`) — le "wow" le plus rapide, réutilise le socle plan existant,
   ne nécessite PAS encore le contexte utilisateur. Bon premier jalon visible.
3. **A1→A3** (contexte utilisateur) — l'IA commence à personnaliser.
4. **A4** (consentement) — avant tout déploiement public.
5. **B2, B3, B4** (autres actions) — une fois le mécanisme d'action rôdé.
6. **A5** (thèmes récurrents) — raffinement.

**Estimation de complexité :** B1 = moyen (1 lot). A1→A4 = moyen-élevé (1-2 lots, surtout le
cadrage sécurité/RGPD). Le reste = incrémental.

---

## Annexe A — Message source (proposition initiale, ChatGPT)

> *Conservé tel quel pour référence. C'est de ce texte que sont tirées les 18 idées analysées
> ci-dessus. Le principe directeur du document en est également issu.*

---

je pense qu'il y a un point clé : ne cherche pas à faire un ChatGPT biblique. Tu perdras, parce que les modèles généralistes savent déjà discuter de la Bible.

En revanche, tu peux faire quelque chose que les IA généralistes ne peuvent pas faire aussi bien : une IA profondément intégrée à une Bible structurée. C'est là que tu peux créer une vraie différence.

Voici les idées que je trouve les plus fortes.

**1. Navigation intelligente dans la Bible (gros point fort)**

Au lieu de répondre simplement, l'IA construit un parcours.

Exemple :

"Pourquoi Dieu permet-il la souffrance ?"

L'IA répond puis propose :

Job 1-2
Psaume 73
Jean 9
Romains 8
Jacques 1
Apocalypse 21

Chaque référence est cliquable et ouvre directement le passage.

Ce n'est plus une réponse, c'est une étude.

**2. Réponse avec un niveau de confiance**

L'IA peut dire :

✅ Ce point est clairement enseigné.

ou

⚠️ Les chrétiens ne sont pas tous d'accord.

Puis expliquer :

catholique
protestant
orthodoxe
évangélique

Ça évite de présenter une interprétation comme une vérité absolue.

**3. Construire une prédication entière**

Pas seulement un plan.

L'utilisateur écrit :

"Prédication sur la foi."

L'IA produit :

texte principal
contexte
introduction
3 grands points
illustrations
applications pratiques
conclusion
prière finale

Pour un pasteur, c'est un gain de temps énorme.

**4. Construire une méditation quotidienne**

En quelques secondes :

verset
explication
application personnelle
question de réflexion
prière

**5. Comparaison automatique des passages parallèles**

Par exemple :

Le baptême de Jésus

L'IA affiche :

Matthieu
Marc
Luc
Jean

Puis montre les différences.

**6. Chronologie automatique**

L'utilisateur demande :

"Raconte la vie de David."

L'IA affiche une frise :

naissance
Goliath
fuite devant Saül
roi de Juda
roi d'Israël
Bath-Shéba
Absalom
mort

Avec les chapitres correspondants.

**7. Carte des personnages**

Clique sur Moïse.

L'IA montre :

parents
frère
sœur
épouse
enfants
ennemis
alliés

Comme un arbre relationnel.

**8. Chaîne de références**

Exemple :

"Montre-moi tous les passages où Jésus parle du pardon."

L'IA retrouve tous les versets.

Ou :

"Toutes les prophéties sur le Messie."

**9. Assistant d'étude biblique**

Il pose lui-même des questions.

Que remarques-tu ?

Qui parle ?

Pourquoi ?

Quel est le contexte ?

Il pousse l'utilisateur à réfléchir plutôt que de donner directement la réponse.

**10. Explication des mots originaux**

Exemple :

Agapè

Il explique :

grec
sens
occurrences
nuances

Même chose pour les mots hébreux.

**11. Détection des thèmes**

Tu lis Jean 3.

L'IA détecte automatiquement :

salut
foi
royaume de Dieu
nouvelle naissance
Esprit Saint

Puis permet d'explorer chaque thème.

**12. Réseau biblique**

Imagine un graphe.

Tu lis Romains 5.

L'IA montre immédiatement les liens avec :

Genèse 3
Psaume 51
Jean 3
Hébreux
Apocalypse

Tu navigues de lien en lien.

**13. Quiz intelligent**

Pas un quiz fixe.

L'IA crée des questions adaptées au niveau de l'utilisateur.

Elle mémorise aussi ses erreurs.

**14. Mémoire de progression**

Elle sait que :

tu étudies Romains
tu t'intéresses au pardon
tu as terminé Jean

Elle adapte ensuite les prochaines études.

**15. Recherche ultra naturelle**

Par exemple :

"Le verset où Paul parle de courir la course."

Ou :

"Le passage où Pierre marche sur l'eau."

Même sans connaître les références.

**16. Détection des citations**

Tu écris :

Dieu est mon berger.

L'IA répond immédiatement :

Psaume 23:1

**17. Explication historique**

Pour chaque passage :

auteur
destinataires
date
contexte politique
coutumes
géographie

**18. Génération de parcours**

Exemple :

Je suis anxieux.

L'IA crée un parcours de 7 jours avec :

lecture
méditation
prière
questions

**La fonctionnalité qui, à mon avis, ferait vraiment la différence**

J'imaginerais quelque chose comme un copilote d'étude biblique.

Au lieu de répondre à une question, il construit automatiquement un dossier complet.

Tu demandes :

« Pourquoi Jésus est-il appelé l'Agneau de Dieu ? »

Et il génère :

un résumé en une phrase ;
toutes les références liées, de la Genèse à l'Apocalypse ;
les prophéties de l'Ancien Testament ;
les passages du Nouveau Testament qui les accomplissent ;
les personnages concernés ;
le contexte historique ;
les mots grecs ou hébreux importants ;
les différentes interprétations chrétiennes lorsqu'elles existent ;
une méditation personnelle ;
un plan de prédication ;
un quiz pour vérifier la compréhension.
