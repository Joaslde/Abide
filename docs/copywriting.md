# Guide de rédaction d'Abide

Comment Abide parle, dans les trois langues. Il décrit le ton tel qu'il existe déjà
dans l'app : à relire avant d'écrire ou de traduire un texte (écran, notification,
fiche Play Store, prompt du Guide IA).

Les textes eux-mêmes vivent dans `src/i18n/locales/fr.js`, `en.js` et `es.js`, rangés
par écran. Ce guide ne les recopie pas : il dit comment les écrire.

## 1. La voix

- **Pastorale et chaleureuse.** On accompagne, on ne vend pas et on ne sermonne pas.
- **Tutoiement** dans les trois langues (« tu », « you », « tú »).
- **Jamais culpabilisant.** Une série perdue, un quota atteint ou une prière oubliée
  s'annoncent avec douceur et une porte ouverte (« Reviens demain », « une nouvelle
  peut commencer maintenant »).
- **Le prénom souvent**, aux moments qui comptent : salutations, questions de
  l'onboarding, félicitations, quota atteint, notifications. Toujours prévoir la
  variante sans prénom (clés `xxxNamed` / `xxx`) : jamais « Bonjour , ».
  Source unique : `firstName` du store auth.
- **Simple.** Phrases courtes, mots du quotidien. Pas de jargon technique
  (« synchronisation », « erreur 403 ») dans un texte visible.

## 2. Vocabulaire

### Noms officiels (ne pas reformuler)

| Français | Anglais | Espagnol |
|---|---|---|
| Abide Plus | Abide Plus | Abide Plus |
| Immersion (la Bible) | Immersion | Inmersión |
| L’Ancre (le Guide IA) | The Anchor | El Ancla |
| Le Sanctuaire | The Sanctuary | El Santuario |
| Le Phare | The Lighthouse | El Faro |
| le Guide | the Guide | el Guía |
| série (de lecture) | streak | racha |
| jours de premium | days of premium | días de premium |

### À éviter

- **« illimité »** pour le Guide IA : il est plafonné (50 messages par jour en
  premium). « Sans limite » n'est permis que là où le serveur n'impose réellement
  aucune limite (les quiz premium). Vérifier côté serveur avant toute promesse.
- Ton de vente agressif : « Offre exceptionnelle », « Ne rate pas », compte à rebours.
- Toute formulation laissant croire que la Bible, son audio ou la prière sont payants :
  ils restent gratuits pour tous (règle BibleBrain : audio jamais derrière un paywall).
- Citer une traduction biblique sous droits. Dans les textes et la fiche Play Store,
  citer uniquement des versions du domaine public (Louis Segond 1910, Reina-Valera
  1909, KJV, WEB…), avec la formulation exacte de la version citée.

## 3. Typographie

- **Aucun tiret cadratin ni demi-cadratin.** Remplacer par deux-points, virgule,
  parenthèses ou point. Le tiret simple sert seulement aux mots composés et aux listes.
- Français : guillemets « … » avec espaces, apostrophe typographique ’, espace avant
  « : », « ? », « ! ».
- Anglais : guillemets “…”, pas d'espace avant la ponctuation.
- Espagnol : ¿…? et ¡…!, guillemets «…».
- Références bibliques compactes : « Jean 3.16 », « John 3:16 », « Juan 3:16 ».
- Citation partagée : « verset » puis la référence à la ligne, sans tiret.

## 4. Gabarits par type de texte

- **Titre d'écran** : 1 à 3 mots.
- **Bouton** : un verbe d'action, 1 à 3 mots (« Rejoindre Abide Plus », « Reprendre »).
- **Notification** : titre court (moins de 40 caractères, un emoji au plus), corps
  d'une phrase ; le texte long va dans `largeBody`.
- **Toast** : une phrase, le résultat (« Rappels mis à jour »).
- **Erreur** : rassurer d'abord, expliquer ensuite, proposer une action
  (« Pas de connexion pour l'instant. Ta lecture reste disponible hors ligne. »).
- **État vide** : une invitation, pas un constat (« Confie à Dieu ce qui pèse sur ton
  cœur. » plutôt que « Aucune prière. »).
- **Quota atteint** : reconnaître l'échange, proposer « revenir demain » ET une option
  (Abide Plus ou parrainage), jamais une impasse.
- **Fiche Play Store** : nom 30 caractères maximum, description courte 80, longue
  4 000 (voir `docs/play-store-es.md`).

## 5. Traduire

- Les trois fichiers de langue gardent exactement les mêmes clés (vérifier la parité
  après chaque ajout).
- Traduire le sens et le ton, pas mot à mot : un texte anglais doit sonner aussi
  chaleureux que le français.
- Un nouveau texte s'écrit dans les trois langues dans le même changement, jamais
  « on traduira plus tard ».
