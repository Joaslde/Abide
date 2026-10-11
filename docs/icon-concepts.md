# Concepts d'icône — Abide

> Décidé le 2026-09-10. Direction retenue : **symbole chrétien épuré**, dans la
> continuité du motif de vigne/flamme déjà esquissé dans `assets/icon-foreground.svg`.
> Palette imposée (voir `design-pattern.md`) : fond navy `#0B1624` → `#162340`,
> motif or `#C9A84C` / `#E8C96B`.

---

## Comment utiliser ces prompts

1. Générer avec un outil IA (Midjourney, Ideogram, DALL-E) en testant les 4 variantes.
2. Choisir l'image qui reste lisible réduite à **48×48 px** (taille réelle sur un
   écran d'accueil) — c'est le seul vrai critère de sélection, pas le rendu en grand.
3. Une fois choisie : redessiner le motif retenu en **SVG vectoriel propre**
   (Claude peut le faire à partir de la direction validée) pour remplacer
   `assets/icon-foreground.svg` — une image IA brute ne doit jamais devenir
   l'icône finale telle quelle (artefacts, pixels, pas de vraie transparence).

---

## Contraintes techniques (à rappeler à l'outil IA si besoin)

- Fond **carré**, sujet centré dans les 66 % centraux (Android adaptive-icon
  rogne les bords selon la forme du launcher — cercle, squircle, goutte…)
- Symbole **simple** : une icône d'app se regarde 1 seconde, jamais en détail.
  Trois éléments maximum reconnaissables au premier coup d'œil.
- Contraste fort entre le motif (or) et le fond (navy profond) — pas de dégradés
  fins qui disparaîtraient en petit format.
- Pas de texte, pas de mot "Abide" dans l'image (illisible en 48px, et Google
  Play préfère les icônes sans texte).

---

## Variante A — Croix + flamme (fusion)

Reprend le motif déjà présent (la "vigne/flamme" du SVG actuel) mais en fait
émerger une croix simple, comme si la flamme dessinait une croix dans son
mouvement montant. Symbolise la présence (*abide*) qui brûle et éclaire.

```
Minimalist app icon design, a simple golden cross where the vertical beam
transforms into a rising flame at the top, flowing candlelight style, thin
elegant linework, deep navy blue gradient background (#0B1624 to #162340),
warm gold color (#C9A84C, #E8C96B), centered composition, flat vector
illustration, no text, no realistic rendering, spiritual and warm mood,
square format, high contrast, app icon for a Bible/prayer application,
clean and legible at small sizes
```

**Variante négative (fond sombre profond, plus contemplatif) :**
```
Same concept, darker richer navy background, flame more subtle and small,
cross more prominent and geometric, fewer details, emphasize simplicity
over decoration, icon must read clearly at 48x48 pixels
```

---

## Variante B — Rameau d'olivier + croix

Un rameau d'olivier stylisé encercle ou soutient une petite croix — évoque la
paix, l'alliance, l'enracinement (*abide* = demeurer, rester enraciné).

```
Minimalist app icon, a small golden cross at the center surrounded by a
delicate olive branch curving around it like an embrace, thin elegant gold
linework (#C9A84C, #E8C96B), deep navy blue radial gradient background
(#0B1624, #162340), flat vector style, no text, no photorealism, peaceful
and rooted spiritual symbolism, square composition, centered, high contrast
for small-size legibility, app icon for a Christian Bible application
```

---

## Variante C — Livre ouvert stylisé en lumière

Un livre ouvert vu de dessus, dont les pages se transforment en rayons de
lumière montante — associe directement "Bible" (le livre) à la présence
divine (la lumière), sans croix explicite (utile si on veut un symbole moins
confessionnel/plus large pour l'App Store international).

```
Minimalist app icon, an open book seen from above where the pages dissolve
into upward rays of golden light, thin elegant linework, deep navy blue
background (#0B1624 to #162340), warm gold gradient (#C9A84C to #E8C96B),
flat vector illustration, no text, no realism, centered symmetrical
composition, spiritual warmth, square format, app icon style, clean shapes
legible at 48x48 pixels, Bible reading app icon
```

---

## Variante D — Ancre (lien avec le nom de l'onglet "L'Ancre")

Cohérence interne : l'app a déjà un onglet nommé "L'Ancre" (référence à
Hébreux 6:19, l'espérance comme ancre de l'âme). Une ancre stylisée avec une
petite croix à son sommet reprend ce fil sans redite avec la Bible/croix seule.

```
Minimalist app icon, an elegant anchor shape where the top loop is replaced
by a small cross, thin golden linework (#C9A84C, #E8C96B), deep navy blue
background gradient (#0B1624 to #162340), flat vector style, no text, no
photorealism, symbol of hope and steadfastness, centered square composition,
high contrast, legible at small app icon sizes, spiritual and calm mood
```

---

## Recommandation de départage

Générer les 4, mais si une seule doit être testée en premier : **Variante A**
(croix + flamme) — elle prolonge directement le motif déjà dessiné dans le SVG
actuel (`icon-foreground.svg` a déjà une forme de flamme/vigne montante), donc
le changement d'icône ne rompt pas l'identité déjà construite ailleurs dans
l'app (splash screen, notification icon `ic_stat_abide`).

## Ce qui NE change PAS

- `assets/icon-background.svg` (le fond dégradé navy) reste valable quel que
  soit le motif choisi — seul `icon-foreground.svg` est à refaire.
- La palette est non-négociable (`design-pattern.md`) : rester strictement sur
  `#0B1624` / `#162340` / `#C9A84C` / `#E8C96B`.
