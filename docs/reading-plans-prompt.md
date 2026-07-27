# Prompt — Génération de plans de lecture thématiques (Abide)

*Copier-coller le prompt ci-dessous dans une IA (ChatGPT, Claude, etc.). Le résultat
attendu est un JSON directement exploitable par le code existant (`src/data/presetPlans.js`).*

---

## Contexte à donner à l'IA

```
Tu es un concepteur de parcours de lecture biblique pour une application mobile
chrétienne appelée Abide. Les utilisateurs suivent un "plan de lecture" : chaque
jour, ils lisent un ou plusieurs CHAPITRES ENTIERS de la Bible (jamais une plage
de versets à l'intérieur d'un chapitre), dans un ordre pensé pédagogiquement.

Je veux que tu me génères 12 plans de lecture thématiques, répartis ainsi :
- 4 plans sur des THÈMES DE VIE COURANTS (anxiété/paix, deuil/épreuve, pardon,
  identité en Christ, relations/mariage, doute, finances — choisis parmi ceux-ci
  ou propose d'autres sujets aussi pertinents et fréquemment recherchés)
- 4 plans PARCOURS BIBLIQUES THÉMATIQUES (ex : la vie de David, les femmes de la
  Bible, les paraboles de Jésus, les Psaumes de louange, de la Création à
  l'Alliance dans la Genèse — choisis parmi ceux-ci ou propose d'autres parcours
  bibliques structurants)
- 4 plans DISCIPLINES SPIRITUELLES (apprendre à prier, cultiver la gratitude,
  étudier la Bible par soi-même, écouter la voix de Dieu, marcher dans la foi au
  quotidien — choisis parmi ceux-ci ou propose d'autres disciplines pertinentes)

CONTRAINTES STRICTES DE FORMAT :
1. Chaque plan dure entre 5 et 30 jours (varie les durées : certains courts type
   "démarrage rapide" en 5-7 jours, d'autres plus longs en 21-30 jours).
2. Chaque jour contient 1 à 3 CHAPITRES ENTIERS (jamais une portion de chapitre).
3. Utilise les CODES DE LIVRES CANONIQUES suivants (pas de nom en toutes lettres) :
   GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO
   ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL
   MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB
   JAS 1PE 2PE 1JN 2JN 3JN JUD REV
4. Vérifie que chaque référence existe VRAIMENT (nombre de chapitres réel du
   livre) — n'invente jamais un chapitre qui n'existe pas.
5. L'ordre des chapitres à l'intérieur d'un plan doit avoir une progression
   pédagogique claire (pas un ordre aléatoire) : introduction du thème → cœur du
   sujet → application/conclusion.
6. Le ton des descriptions est chaleureux et pastoral, jamais froid ni clinique.
   Tutoiement. Public : chrétiens francophones de tous niveaux.

FORMAT DE SORTIE — un tableau JSON STRICT, un objet par plan, structure EXACTE :

[
  {
    "id": "slug-court-en-anglais-kebab-case",
    "title": "Titre du plan en français, court et engageant",
    "desc": "Description en 1-2 phrases : ce que la personne va vivre/découvrir",
    "category": "vie" | "biblique" | "discipline",
    "days": 14,
    "chapters": [
      { "book_id": "JHN", "chapter": 1 },
      { "book_id": "JHN", "chapter": 3 }
    ]
  }
]

Le tableau "chapters" contient TOUS les chapitres du plan dans l'ordre de lecture
(le nombre de chapitres peut être supérieur au nombre de jours si plusieurs
chapitres sont lus le même jour — la répartition exacte par jour sera faite par
notre application, tu n'as pas besoin de la faire, juste fournir la liste
ordonnée complète).

Génère les 12 plans maintenant, uniquement le JSON, sans texte avant ou après.
```

---

## Ce que je ferai une fois le JSON reçu

1. Vérifier chaque référence (livre/chapitre) contre le canon réel (script de
   validation, pas de confiance aveugle dans la sortie IA).
2. Ajouter les 12 entrées à `src/data/presetPlans.js` (même format que le plan
   "Connaître Jésus" existant) + les clés i18n `plan.presets.<id>.title/desc`
   en français ET anglais dans `src/i18n/locales/{fr,en}.js`.
3. Vérifier l'affichage dans l'app (liste des plans, création, suivi).

## Étape suivante (après ce lot) — plans par profil

Une fois ces 12 plans généraux en place, on retravaillera `PROFILE_RECIPES`
(`src/data/planGenerator.js`) pour associer 1-2 plans thématiques (parmi ceux
créés ici, ou des nouveaux dédiés) à chacun des 5 profils d'onboarding :

| Profil | Sens | Pistes de plans adaptés |
|---|---|---|
| `source` | Foi récente / chercheur | Un plan doux d'introduction (ex. Évangile de Jean déjà en recette) |
| `marcheur` | Veut la constance | Plan par défaut, progressif |
| `explorateur` | Attiré par le sens profond / théologie | Un parcours plus dense (Romains, disciplines) |
| `veilleur` | Traverse une période difficile | Plan réconfort (anxiété/paix, Psaumes) |
| `porteur` | Veut évangéliser | Plan actes/évangélisation |

Actuellement `PROFILE_RECIPES` pointe vers des portées génériques (tout un livre
ou toute une catégorie) — pas des vrais plans thématiques conçus. C'est le
prochain chantier, une fois qu'on aura le contenu de ce lot-ci.
