# onboarding-quiz.md — Abide | Parcours d'Onboarding & Profilage

> Document de référence pour le développement du quiz d'onboarding.
> À lire avant d'implémenter le parcours d'entrée de l'application.

---

## 1. Intention & Objectifs

Le quiz d'onboarding d'Abide remplit trois fonctions distinctes, à ne pas confondre :

### Objectif 1 — Personnaliser l'expérience
Recueillir ce qu'il faut pour adapter l'application à chaque utilisateur :
plan de lecture, heure des notifications, profondeur du contenu IA, premier
écran affiché, ton du guide spirituel. L'app doit s'adapter à la personne,
pas l'inverse.

### Objectif 2 — Mesurer le niveau de connaissance biblique
C'est un point central. Les utilisateurs vont du débutant total (ne sait pas
retrouver un livre dans la Bible, ne connaît aucun verset) au niveau théologien
confirmé. Proposer le même contenu aux deux serait une erreur. Le quiz doit
répartir finement les utilisateurs sur une échelle de connaissance, sans leur
demander frontalement "quel est ton niveau ?" (personne ne sait s'auto-évaluer
correctement). On mesure donc indirectement, par des questions concrètes.

### Objectif 3 — Constituer des données valorisables (cadre légal strict)
Recueillir des informations sur la personne en tant que chrétien et en tant que
citoyen (âge, genre, localisation, église, dénomination). Ces données, une fois
**agrégées et anonymisées**, peuvent avoir de la valeur pour des partenariats
(églises, institutions, recensements).

> IMPORTANT — Cadre légal : la vente de données individuelles nominatives sans
> consentement explicite est interdite (RGPD + lois africaines de protection des
> données). Seules les données AGRÉGÉES et ANONYMISÉES peuvent être valorisées.
> Exemple autorisé : "67% des membres de cette dénomination ont moins de 35 ans."
> Exemple interdit : vendre la liste nominative des utilisateurs.
> La politique de confidentialité doit mentionner cet usage agrégé dès le départ,
> et le consentement doit être recueilli à l'inscription.

---

## 2. Structure du Quiz — 4 Blocs

Le quiz est organisé en 4 blocs thématiques. L'expérience doit rester légère et
chaleureuse : l'utilisateur ne doit jamais se sentir interrogé ou fiché. Ton
pastoral, bienveillant, jamais administratif.

---

### BLOC 1 — Identité (qui est la personne)

**Q1 — Date de naissance**
- Type : sélecteur de date (date picker)
- Comportement : l'âge se calcule et s'affiche automatiquement à côté
- Affichage : `Date de naissance : [12/05/1998] → Âge : 27 ans`
- Stockage : on enregistre la date de naissance (`birth_date`), jamais l'âge en dur
  (l'âge se recalcule toujours à partir de la date pour rester exact)

**Q2 — Genre**
- Options : Homme / Femme
- Usage : segmentation, recensements

**Q3 — Pays et ville**
- Pays : liste déroulante (Bénin par défaut)
- Ville : champ texte libre

**Q4 — Église d'appartenance** (optionnel)
- Nom de l'église : texte libre
- Dénomination : Catholique / Protestant / Évangélique / Pentecôtiste / Autre

---

### BLOC 2 — Parcours de foi (l'identité chrétienne)

**Q5 — Depuis quand marches-tu avec Christ ?**
> "Depuis quand marches-tu avec Christ ?"
- Je viens de commencer (moins d'1 an)
- Depuis quelques années (1-5 ans)
- Depuis longtemps (5-15 ans)
- Depuis très longtemps (15 ans et plus)
- Je ne suis pas encore décidé

**Q6 — Rapport actuel à la foi**
> "Où en es-tu avec Jésus aujourd'hui ?"
- Je suis chrétien et je veux grandir
- Je viens de donner ma vie à Christ
- Je cherche, je découvre la foi
- Je reviens après une pause

---

### BLOC 3 — Niveau de connaissance biblique (le cœur du profilage)

Ce bloc mesure le niveau réel de l'utilisateur sans le lui demander frontalement.
On combine une auto-évaluation douce, une mesure concrète déguisée, et la pratique.

**Q7 — Familiarité ressentie avec la Bible**
> "Quand tu ouvres la Bible, tu te sens..."
- Un peu perdu, je ne sais pas par où commencer
- Je lis mais j'ai du mal à comprendre
- Je comprends bien quand je lis
- Je peux expliquer et enseigner aux autres

**Q8 — Test de repères concret** (mesure réelle, présentée comme une préférence)
> "Lesquels de ces livres saurais-tu retrouver facilement dans ta Bible ?"
> (choix multiple — plusieurs réponses possibles)
- Les Évangiles (Matthieu, Marc, Luc, Jean)
- Les Psaumes
- Les épîtres de Paul (Romains, Corinthiens...)
- Les prophètes (Ésaïe, Jérémie...)
- L'Apocalypse
- Honnêtement, j'ai du mal à m'y retrouver
- Note technique : le NOMBRE de cases cochées sert d'indicateur de familiarité
  réelle. "J'ai du mal à m'y retrouver" force le score au minimum.

**Q9 — Fréquence de lecture actuelle**
> "En ce moment, à quelle fréquence lis-tu la Bible ?"
- Presque jamais
- De temps en temps
- Quelques fois par semaine
- Tous les jours

**Q10 — Profondeur recherchée**
> "Qu'est-ce qui t'intéresse le plus ?"
- Apprendre les bases, les histoires de la Bible
- Appliquer la Parole à ma vie quotidienne
- Comprendre le sens profond, le contexte
- Étudier la doctrine et la théologie

---

### BLOC 4 — Vie spirituelle & disponibilité

**Q11 — Plus grand défi spirituel**
> "Qu'est-ce qui t'empêche le plus de grandir spirituellement ?"
- Le manque de régularité
- La compréhension de ce que je lis
- La motivation qui retombe
- Une période difficile que je traverse
- Évangéliser autour de moi

**Q12 — Moment idéal de la journée**
> "Quand préfères-tu avoir ton temps avec Dieu ?"
- Le matin (avant ma journée)
- La pause de midi
- Le soir (après ma journée)
- La nuit (quand tout est calme)

**Q13 — Temps disponible par jour**
> "Combien de temps peux-tu donner à Dieu chaque jour ?"
- 5 minutes (c'est déjà ça)
- 10-15 minutes
- 20-30 minutes
- Plus de 30 minutes

---

## 3. Calcul du Niveau Biblique

À partir des réponses Q7, Q8, Q9 et Q10, on attribue un niveau biblique sur 4 paliers.
Ce niveau pilote la difficulté du contenu, le vocabulaire employé, et la profondeur
des explications du guide IA.

| Niveau | Détermination (combinaison des réponses) |
|--------|------------------------------------------|
| **Découverte** | Se sent perdu (Q7) + peu/pas de repères (Q8) + lit rarement (Q9) + veut les bases (Q10) |
| **Croissance** | Comprend en lisant (Q7) + quelques repères (Q8) + lecture occasionnelle à régulière (Q9) |
| **Affermi** | Comprend bien (Q7) + bons repères (Q8) + lecture fréquente (Q9) + cherche le sens profond (Q10) |
| **Profond** | Peut enseigner (Q7) + tous les repères (Q8) + lecture quotidienne (Q9) + cherche la théologie (Q10) |

### Logique de scoring suggérée
On peut attribuer des points à chaque réponse et faire la somme :
- Q7 : perdu=0, du mal=1, comprends bien=2, peux enseigner=3
- Q8 : nombre de cases cochées (0 à 5) — "j'ai du mal" = 0 forcé
- Q9 : jamais=0, de temps en temps=1, quelques fois=2, tous les jours=3
- Q10 : bases=0, application=1, sens profond=2, théologie=3

Score total → niveau :
- 0-3 → Découverte
- 4-7 → Croissance
- 8-10 → Affermi
- 11-14 → Profond

> Ce barème est un point de départ, à ajuster après les premiers tests utilisateurs.

---

## 4. Les 5 Profils Utilisateurs

Le profil est attribué à partir du défi principal (Q11), du parcours de foi (Q5/Q6),
et de l'intérêt de profondeur (Q10). Les noms sont symboliques, chaleureux, jamais
péjoratifs. Chaque profil a une description affichable à l'utilisateur.

---

### La Source
**Symbole :** une goutte d'eau, l'eau qui jaillit
**Pour qui :** le nouveau converti, celui qui découvre, qui commence son chemin
**Déclencheurs :** foi récente (Q5 "moins d'1 an") ou chercheur (Q6), niveau Découverte
**Pilier par défaut :** Immersion (les bases)

**Description affichable :**
> "Tu es à la source. Quelque chose de neuf commence en toi, et c'est précieux.
> Abide va t'accompagner pas à pas pour découvrir la Parole, sans pression,
> à ton rythme. Chaque jour, une goutte. Et bientôt, une rivière."

---

### Le Marcheur
**Symbole :** un chemin, des pas
**Pour qui :** le chrétien établi qui veut retrouver ou maintenir la régularité
**Déclencheurs :** foi installée (Q5) + défi de régularité ou motivation (Q11)
**Pilier par défaut :** Sanctuaire (discipline, habitudes)

**Description affichable :**
> "Tu marches avec Christ depuis un moment, et tu veux avancer avec constance.
> Abide va t'aider à transformer ta foi en habitude quotidienne — pas par
> obligation, mais par désir. Un pas après l'autre, chaque jour compte."

---

### L'Explorateur
**Symbole :** une boussole
**Pour qui :** celui qui veut comprendre en profondeur, pas seulement lire
**Déclencheurs :** intérêt pour le sens profond ou la théologie (Q10) + défi de compréhension (Q11)
**Pilier par défaut :** L'Ancre (guide IA)

**Description affichable :**
> "Tu ne te contentes pas de lire — tu veux comprendre. Le contexte, le sens,
> la profondeur. Abide met à ta disposition un guide pour creuser la Parole,
> explorer les passages et découvrir des trésors que tu n'avais pas vus."

---

### Le Veilleur
**Symbole :** une flamme dans la nuit, une étoile
**Pour qui :** celui qui traverse une épreuve, une période difficile
**Déclencheurs :** défi "période difficile" (Q11)
**Pilier par défaut :** Sanctuaire (prière, jeûne, soutien)

**Description affichable :**
> "Tu traverses une saison difficile, et tu cherches Sa présence dans la nuit.
> Abide veille avec toi. Des prières, des passages qui consolent, un espace pour
> déposer ce qui pèse. Tu n'es pas seul. La lumière brille dans les ténèbres."

---

### Le Porteur
**Symbole :** un phare, une lumière qu'on porte
**Pour qui :** celui qui veut évangéliser, partager sa foi
**Déclencheurs :** défi "évangéliser" (Q11)
**Pilier par défaut :** Le Phare (évangélisation)

**Description affichable :**
> "Tu portes une lumière, et tu veux la partager. Abide te donne les outils pour
> évangéliser avec assurance et amour : des ressources, des paroles, des parcours
> pour guider ceux qui cherchent. Va, et porte la Bonne Nouvelle."

---

## 5. Personnalisation pilotée par le Profil et le Niveau

Une fois le profil et le niveau attribués, voici ce que l'application adapte :

| Élément | Adaptation |
|---------|-----------|
| Plan de lecture | Thème adapté au profil (bases pour La Source, approfondissement pour L'Explorateur) |
| Durée des sessions | Basée sur Q13 (5 min → chapitres courts, 30 min → plans intensifs) |
| Heure des notifications | Basée sur Q12 (moment idéal) |
| Premier écran affiché | Pilier par défaut du profil |
| Ton du guide IA | Pédagogique pour niveau Découverte, profond pour niveau Profond |
| Vocabulaire de l'IA | Simple pour Découverte, technique/théologique pour Profond |
| Flash-Verset | Thème adapté au défi principal (Q11) |
| Contenu prioritaire | Selon le pilier du profil |

---

## 6. Données Collectées et Stockées (Supabase)

```sql
-- Champs ajoutés à la table profiles
ALTER TABLE profiles ADD COLUMN birth_date DATE;
ALTER TABLE profiles ADD COLUMN gender TEXT;              -- 'homme'|'femme'
ALTER TABLE profiles ADD COLUMN country TEXT;
ALTER TABLE profiles ADD COLUMN city TEXT;
ALTER TABLE profiles ADD COLUMN church_name TEXT;
ALTER TABLE profiles ADD COLUMN church_denomination TEXT;

-- Parcours de foi
ALTER TABLE profiles ADD COLUMN faith_duration TEXT;      -- 'new'|'few_years'|'long'|'very_long'|'undecided'
ALTER TABLE profiles ADD COLUMN faith_stage TEXT;         -- 'growing'|'new_convert'|'seeker'|'returning'

-- Niveau biblique
ALTER TABLE profiles ADD COLUMN bible_familiarity TEXT;   -- réponse Q7
ALTER TABLE profiles ADD COLUMN bible_landmarks INT;      -- nb cochés Q8 (0-5)
ALTER TABLE profiles ADD COLUMN reading_frequency TEXT;   -- Q9
ALTER TABLE profiles ADD COLUMN depth_interest TEXT;      -- Q10
ALTER TABLE profiles ADD COLUMN bible_level TEXT;         -- calculé: 'decouverte'|'croissance'|'affermi'|'profond'

-- Vie spirituelle & disponibilité
ALTER TABLE profiles ADD COLUMN main_challenge TEXT;      -- Q11
ALTER TABLE profiles ADD COLUMN preferred_time_slot TEXT; -- Q12: 'morning'|'noon'|'evening'|'night'
ALTER TABLE profiles ADD COLUMN daily_minutes INT;        -- Q13: 5|15|25|30

-- Profil final attribué
ALTER TABLE profiles ADD COLUMN user_profile TEXT;        -- 'source'|'marcheur'|'explorateur'|'veilleur'|'porteur'

-- Consentement données (RGPD)
ALTER TABLE profiles ADD COLUMN data_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN consent_date TIMESTAMPTZ;
```

> Le champ `data_consent` enregistre le consentement explicite de l'utilisateur
> pour l'usage agrégé/anonymisé de ses données. À recueillir à l'inscription,
> avec lien vers la politique de confidentialité.

---

## 7. Règles d'Expérience (UX)

- Le quiz doit rester court en perception : grouper les questions par bloc,
  barre de progression visible (4 blocs).
- Ton chaleureux et pastoral à chaque question (voir design-pattern.md, voix de marque).
- Toutes les questions sensibles (église, dénomination) sont OPTIONNELLES et indiquées comme telles.
- Possibilité de passer (skip) le quiz, avec un profil par défaut "La Source" + niveau "Croissance".
- À la fin : écran de révélation du profil avec son symbole, son nom, sa description,
  et un bouton "Commencer mon parcours".
- Le profil et le niveau restent modifiables plus tard dans les paramètres
  (l'utilisateur peut refaire le quiz).

---

## 8. Écran de Révélation du Profil

À la fin du quiz, présenter le profil de façon valorisante :

```
[ Symbole animé du profil ]

         Tu es

      L'Explorateur

[ Description complète du profil ]

Ton niveau : Affermi
Ton pilier de départ : L'Ancre

   [ Commencer mon parcours ]
```

L'utilisateur doit ressentir que l'app l'a compris, pas qu'elle l'a classé.

---

*Document de référence onboarding — à faire évoluer après les premiers tests utilisateurs.*
*Dernière mise à jour : Juin 2026*
