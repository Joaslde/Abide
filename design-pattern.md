# design-pattern.md — Abide | Design System & Charte Graphique

> À lire avant tout travail sur l'interface (nouveau composant, nouvel écran, animation).
> L'objectif est qu'un utilisateur ne puisse jamais sentir de rupture visuelle
> entre deux écrans développés à des semaines d'intervalle.
>
> L'atmosphère : sacrée et chaleureuse. Chaque écran rappelle à l'utilisateur
> qu'il entre dans un espace différent de ses autres apps. Pas un outil. Un sanctuaire.

---

## 1. Philosophie Visuelle

### L'inspiration
Abide est ancré dans Jean 15:4 — le cep et le sarment.
L'imagerie : nuit profonde et intime, la lumière d'une bougie qui perce l'obscurité,
l'or intérieur d'une église ancienne, le ciel de Cotonou à 3h du matin avec les étoiles.

L'app vit principalement dans le **mode nuit** — c'est quand les chrétiens africains
lisent leur Bible, prient, cherchent Dieu. Le fond sombre n'est pas un "dark mode"
ajouté après coup. C'est l'atmosphère native de l'application.

### Les 5 principes
1. **Nuit & lumière** — fond sombre profond, l'or éclaire comme une flamme
2. **Respiration** — l'espace vide est intentionnel. La Parole a besoin d'air
3. **Noblesse sobre** — élégant sans être ostentatoire, spirituel sans être kitsch
4. **Cohérence** — chaque composant parle le même langage visuel, du premier au dernier écran
5. **Culturellement ancré** — les codes africains : chaleur, profondeur, or, nuit étoilée

### Ce qu'Abide n'est PAS visuellement
- Pas une app de fitness (pas de bleu électrique, pas de vert néon)
- Pas une app corporative (pas de gris froid, pas de blanc clinique)
- Pas une app religieuse kitsch (pas de croix pixélisées, pas de violet criard)
- Pas une app tech générique (pas de Material Design non personnalisé)

---

## 2. Palette de Couleurs

> Ces valeurs proviennent directement de la charte graphique officielle du projet.
> Ne jamais les remplacer par d'autres valeurs sans validation explicite.

### Couleurs de base (CSS variables — à déclarer dans variables.css)

```css
:root {
  /* === FONDS === */
  --navy:     #0B1624;   /* Fond principal — nuit profonde */
  --navy2:    #111E31;   /* Fond sections alternées */
  --navy3:    #162340;   /* Fond intermédiaire */
  --card-bg:  #14213A;   /* Fond des cards et surfaces élevées */
  --navy-deep:#0F1A2E;   /* Fond le plus sombre (éléments secondaires) */

  /* === OR (couleur de marque) === */
  --gold:     #C9A84C;   /* Or principal — couleur de marque */
  --gold2:    #E8C96B;   /* Or clair — hover, états actifs */
  --gold-dim: rgba(201, 168, 76, 0.22);   /* Or atténué — numéros, décoratifs */
  --gold-glow:rgba(201, 168, 76, 0.08);   /* Halo doré — arrière-plans subtils */
  --gold-border:rgba(201, 168, 76, 0.15); /* Bordures dorées subtiles */
  --gold-border-md:rgba(201, 168, 76, 0.28); /* Bordures dorées moyennes */

  /* === TEXTES === */
  --cream:    #F5F0E6;   /* Texte principal sur fond sombre */
  --muted:    #8A9BB5;   /* Texte secondaire — bleu-gris */
  --white:    #FFFFFF;   /* Blanc pur — titres hero, emphases */
  --cream-70: rgba(245, 240, 230, 0.70); /* Texte corps atténué */
  --cream-50: rgba(245, 240, 230, 0.50); /* Texte très discret */

  /* === STATUTS === */
  --color-success: #3A8B5C;   /* Vert forêt — exaucements, validations */
  --color-error:   #C04040;   /* Rouge terre — erreurs */
  --color-warning: #D4840A;   /* Ambre vif — avertissements */
  --color-streak:  #E85C20;   /* Orange ardent — feu du streak */
  --color-premium: var(--gold); /* Premium = couleur de marque */
}
```

### Mode Clair (optionnel, accessible dans Settings)

```css
.theme-light {
  --navy:    #FBF7EE;   /* Ivoire chaud */
  --navy2:   #F5EFE0;   /* Crème */
  --navy3:   #EDE4D0;   /* Beige sable */
  --card-bg: #FFFFFF;
  --cream:   #1C1208;   /* Texte sombre sur fond clair */
  --muted:   #7A6A50;
}
```

> Note : le mode clair est secondaire. Toujours designer et tester en mode sombre d'abord.

### Gradients

```css
/* Gradient de marque (hero, headers importants) */
background: linear-gradient(135deg, #C9A84C 0%, #E8C96B 50%, #C9A84C 100%);

/* Halo doré (arrière-plan meditation, prière, section hero) */
background: radial-gradient(
  ellipse 70% 60% at 50% 40%,
  rgba(201, 168, 76, 0.08) 0%,
  transparent 70%
);

/* Halo doré centré (modal de prière, méditation) */
background: radial-gradient(
  ellipse 60% 70% at 50% 50%,
  rgba(201, 168, 76, 0.06) 0%,
  transparent 70%
);

/* Fond section alternée */
background-color: var(--navy2);

/* Card verset biblique */
background-color: var(--card-bg);
border-left: 3px solid var(--gold);
```

---

## 3. Typographie

### Familles de polices

L'app utilise 4 rôles typographiques distincts.
Le site utilise Cormorant Garamond + Nunito.
L'app va plus loin avec une typographie plus riche et adaptée à la lecture longue.

```
Font 1 — BRAND (logo, nom de l'app)
  Famille : Cormorant Garamond
  Source  : Google Fonts
  Usage   : Logo Abide, citations bibliques hero, versets mis en exergue
  Caractère : Même font que le site web — cohérence de marque totale
  Poids   : 300 (light), 400 (regular), 600 (semibold) + italic

Font 2 — DISPLAY (titres de sections, headers)
  Famille : Playfair Display
  Source  : Google Fonts
  Usage   : Titres de pages, noms des piliers, headers principaux
  Caractère : Éditorial, élégant, différent du site mais dans le même univers

Font 3 — BODY/BIBLE (lecture continue)
  Famille : Lora
  Source  : Google Fonts
  Usage   : Versets bibliques, corps de texte long, réponses du guide IA
  Caractère : Serif chaleureux, optimisé pour la lecture sur écran sombre

Font 4 — UI (interface, labels, données)
  Famille : DM Sans
  Source  : Google Fonts
  Usage   : Boutons, labels, navigation, notifications, chiffres
  Caractère : Propre, lisible, neutre — ne concurrence pas les serifs
```

### Chargement Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?
  family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&
  family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&
  family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&
  family=DM+Sans:wght@300;400;500;600;700&
  display=swap" rel="stylesheet">
```

### Échelle typographique

```css
/* BRAND — Cormorant Garamond */
--text-brand-hero:   font-size: clamp(2.8rem, 8vw, 5.5rem); font-weight: 300; line-height: 1.05;
--text-brand-title:  font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 300; line-height: 1.2;
--text-brand-quote:  font-size: clamp(1.2rem, 3vw, 1.8rem); font-weight: 300; font-style: italic;
--text-brand-verse:  font-size: 1.3rem; font-weight: 400; font-style: italic; line-height: 1.9;

/* DISPLAY — Playfair Display */
--text-display-xl:   font-size: 28px; font-weight: 700; line-height: 1.2;
--text-display-lg:   font-size: 24px; font-weight: 600; line-height: 1.25;
--text-display-md:   font-size: 20px; font-weight: 600; line-height: 1.3;
--text-display-sm:   font-size: 17px; font-weight: 600; line-height: 1.35;

/* BODY/BIBLE — Lora */
--text-bible-lg:     font-size: 20px; font-weight: 400; line-height: 1.85;
--text-bible-md:     font-size: 18px; font-weight: 400; line-height: 1.8;
--text-bible-sm:     font-size: 16px; font-weight: 400; line-height: 1.75;

/* UI — DM Sans */
--text-ui-lg:        font-size: 16px; font-weight: 500; line-height: 1.4;
--text-ui-md:        font-size: 14px; font-weight: 500; line-height: 1.4;
--text-ui-sm:        font-size: 12px; font-weight: 500; line-height: 1.35;
--text-ui-label:     font-size: 10px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase;
```

### Règles typographiques
- Les versets bibliques utilisent TOUJOURS Lora (lisibilité longue durée sur fond sombre)
- Le logo "Abide" et les citations héro utilisent Cormorant Garamond
- Les titres de sections/pages utilisent Playfair Display
- Les boutons, labels, données utilisent DM Sans
- Taille minimale affichée : 12px (jamais en dessous)
- Line-height minimum pour la lecture Bible : 1.75
- L'utilisateur peut régler la taille de police dans le lecteur Bible (16px → 24px, paliers de 2px)
- Les labels et tags utilisent letter-spacing: 0.08em à 0.2em (comme sur le site)

---

## 4. Iconographie

### Style
- Ligne fine (stroke uniquement, pas fill)
- Stroke width : 1.5px
- Coins arrondis (strokeLinecap: round, strokeLinejoin: round)
- Taille standard : 24x24px

### Bibliothèque
- **Lucide Icons** — cohérent, propre, licence MIT
- Éviter Material Icons (trop "Google")

### Icônes des 4 Piliers (à créer en SVG custom)
Ces icônes doivent être reconnaissables et cohérentes avec l'univers visuel :
```
Immersion  → Livre ouvert avec une lueur dorée
Sanctuaire → Flamme de bougie fine
L'Ancre    → Ancre stylisée avec une étoile
Le Phare   → Phare ou rayon de lumière
```

### Couleurs des icônes
- Navigation active : var(--gold) #C9A84C
- Navigation inactive : var(--muted) #8A9BB5
- Icônes de status : couleur sémantique correspondante
- Icônes sur fond sombre : var(--gold) ou var(--cream)

### Tailles
```
--icon-xs:  16px  (inline labels)
--icon-sm:  20px  (badges, accessoires)
--icon-md:  24px  (navigation, actions standard)
--icon-lg:  32px  (features, cards)
--icon-xl:  48px  (empty states, onboarding)
```

---

## 5. Espacements & Layout

### Grille (base 4px)
```css
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
```

### Bordures arrondies
Le site utilise border-radius: 2px (presque carré) pour un style éditorial.
Pour l'app mobile, on adoucit légèrement tout en gardant l'esprit sobre :

```css
--radius-sharp: 2px    /* Tags, badges — fidèle au style du site */
--radius-sm:    8px    /* Chips, inputs */
--radius-md:    12px   /* Cards moyennes */
--radius-lg:    20px   /* Cards grandes, bottom sheets */
--radius-xl:    28px   /* Modales, composants hero */
--radius-full:  9999px /* Boutons pill, avatars */
```

### Layout général
- Padding horizontal des pages : 20px
- Gap entre sections : 40px (--space-10)
- Gap entre éléments d'une section : 16px (--space-4)
- Toujours respecter les safe areas iOS (notch, home indicator)

---

## 6. Composants Clés

### Boutons

```css
/* Bouton Primaire (fidèle au site) */
.btn-primary {
  background-color: var(--gold);       /* #C9A84C */
  color: var(--navy);                  /* #0B1624 — texte sombre sur or */
  padding: 14px 28px;
  border-radius: var(--radius-sharp);  /* 2px — style éditorial */
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 0 4px 20px rgba(201, 168, 76, 0.30);
  transition: background 0.3s, transform 0.2s;
}
.btn-primary:hover {
  background-color: var(--gold2);      /* #E8C96B */
  transform: translateY(-2px);
}
.btn-primary:active { transform: scale(0.97); }

/* Bouton Secondaire (outline) */
.btn-secondary {
  border: 1px solid rgba(201, 168, 76, 0.5);
  color: var(--gold);
  background: transparent;
  padding: 14px 28px;
  border-radius: var(--radius-sharp);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: border-color 0.3s;
}
.btn-secondary:hover { border-color: var(--gold); }

/* Bouton pleine largeur (paywall, CTA) */
.btn-full { display: block; text-align: center; }

/* Bouton Destructif */
.btn-danger {
  background-color: var(--color-error);
  color: white;
  border-radius: var(--radius-sharp);
}
```

### Cards

```css
/* Card standard (fond card-bg) */
.card {
  background-color: var(--card-bg);        /* #14213A */
  border: 1px solid var(--gold-border);    /* or subtil */
  padding: 24px;
  transition: transform 0.3s;
}
.card:hover { transform: translateY(-4px); }

/* Card avec accent doré en haut (comme les problem-cards du site) */
.card-accent {
  border-top: 3px solid var(--gold);
  background-color: var(--card-bg);
  border-left: 1px solid var(--gold-border);
  border-right: 1px solid var(--gold-border);
  border-bottom: 1px solid var(--gold-border);
}

/* Card verset biblique */
.card-verse {
  background-color: var(--card-bg);
  border-left: 3px solid var(--gold);
  padding: 20px 24px;
  font-family: 'Lora', serif;
  color: var(--cream);
}

/* Card pilier (comme les piliers du site) */
.card-pillar {
  background-color: var(--card-bg);
  border-left: 3px solid transparent;
  transition: border-color 0.3s;
}
.card-pillar:hover { border-left-color: var(--gold); }

/* Card premium (features bloquées) */
.card-premium {
  border: 1px solid var(--gold);
  background-color: var(--card-bg);
  position: relative;
}
.card-premium::before {
  content: 'Abide Plus';
  position: absolute; top: -1px; right: 16px;
  background-color: var(--gold);
  color: var(--navy);
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 3px 10px;
}
```

### Inputs & Formulaires

```css
.input {
  background-color: var(--navy2);
  border: 1px solid var(--gold-border);
  color: var(--cream);
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  transition: border-color 0.3s;
}
.input::placeholder { color: var(--muted); }
.input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
}
/* Supprimer le border bleu par défaut d'Ionic */
ion-input, ion-textarea {
  --highlight-color-focused: var(--gold) !important;
  --border-color: var(--gold-border) !important;
}
```

### Navigation (Tabs)

```css
/* Tab Bar */
ion-tab-bar {
  --background: var(--navy2);      /* #111E31 */
  --border: 1px solid var(--gold-border);
  height: 60px; /* + safe area bottom */
}

/* Tab Actif */
ion-tab-button.tab-selected {
  --color-selected: var(--gold);   /* #C9A84C */
}

/* Tab Inactif */
ion-tab-button {
  --color: var(--muted);           /* #8A9BB5 */
}

/* Label des tabs */
/* DM Sans 500, 10px, letter-spacing 0.05em */
```

### Feature Tags (comme sur le site)

```css
.feature-tag {
  font-size: 12px;
  color: var(--gold);
  border: 1px solid var(--gold-border-md);
  padding: 4px 12px;
  border-radius: var(--radius-sharp);  /* 2px */
  letter-spacing: 0.05em;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
}
```

### Numéros décoratifs (comme le site)

```css
.decorative-number {
  font-family: 'Cormorant Garamond', serif;
  font-size: 3rem;
  font-weight: 300;
  color: var(--gold-dim);            /* rgba(201,168,76,0.22) */
  line-height: 1;
}
```

### Label de section (comme le site)

```css
.section-label {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  display: block;
  margin-bottom: 12px;
}
```

### Player Audio

```css
/* Mini Player */
.mini-player {
  background-color: var(--navy2);
  border-top: 1px solid var(--gold-border);
  padding: 12px 20px;
}
.mini-player .progress-bar {
  height: 2px;
  background-color: var(--navy3);
}
.mini-player .progress-fill {
  height: 2px;
  background-color: var(--gold);
}
.mini-player .play-btn {
  width: 40px; height: 40px;
  background-color: var(--gold);
  color: var(--navy);
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(201, 168, 76, 0.4);
}

/* Full Player */
.full-player {
  background-color: var(--navy);
  background-image: radial-gradient(
    ellipse 60% 50% at 50% 30%,
    rgba(201, 168, 76, 0.06) 0%,
    transparent 70%
  );
}
.full-player .active-verse {
  color: var(--gold);
  font-family: 'Lora', serif;
  font-size: 18px;
  line-height: 1.8;
}
```

### Modales & Bottom Sheets

```css
/* Bottom Sheet */
ion-modal {
  --background: var(--navy2);
  --border-radius: 24px 24px 0 0;
}
.sheet-handle {
  width: 36px; height: 4px;
  background-color: var(--gold-border-md);
  border-radius: var(--radius-full);
  margin: 12px auto 0;
}

/* Overlay */
.backdrop {
  background: rgba(11, 22, 36, 0.8);
  backdrop-filter: blur(4px);
}
```

---

## 7. Animations & Transitions

### Principes
- Lent et organique (une app spirituelle ne se précipite pas)
- Ease-out — les éléments arrivent doucement, s'installent
- Animations inspirées du site (fadeUp avec translateY)

### Durées
```css
--duration-fast:   150ms   /* Micro-interactions */
--duration-normal: 300ms   /* Transitions standard */
--duration-slow:   500ms   /* Entrées de pages */
--duration-breath: 4s      /* Animation spirituelle fond */
```

### Animations clés

```css
/* Entrée de page (comme le site) */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Utilisation : animation: fadeUp 0.8s ease-out forwards */
/* Décalage progressif : delay 0.2s, 0.4s, 0.6s pour les éléments séquentiels */

/* Reveal au scroll (comme le site) */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal.visible { opacity: 1; transform: translateY(0); }

/* Halo de prière pulsant */
@keyframes breathe {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.06); }
}

/* Ligne de scroll (comme le site) */
@keyframes scrollPulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

/* Bouton pressé */
.btn:active { transform: scale(0.97); transition: transform 80ms; }

/* Card hover (comme le site) */
.card:hover { transform: translateY(-4px); transition: transform 0.3s; }
```

---

## 8. Structure des Écrans Clés

### Lecteur Bible (BibleChapterView)
- Fond : var(--navy) #0B1624
- Texte verset : Lora, taille réglable 16-24px, var(--cream), line-height 1.8
- Numéro verset : DM Sans 10px, var(--muted), letter-spacing 0.15em
- Verset actif (sync audio) : bordure gauche 3px gold + fond très subtil
- Verset surligné : fond rgba(201,168,76,0.12)
- Padding latéral : 24px
- Jamais de publicité sur cet écran

### Chat Guide IA (AIChatView)
- Fond : var(--navy) avec halo doré radial très discret
- Bulle utilisateur : fond var(--gold), texte var(--navy), radius asymétrique
- Bulle IA : fond var(--card-bg), texte var(--cream), radius asymétrique
- Texte IA : Lora (réponse = Parole contextualisée)
- Versets cités : card-verse inline avec bordure gold
- Sélecteur de mode : feature-tags pill, actif = fond gold

### Onboarding
- Fond : var(--navy) avec halo radial doré au centre
- Barre de progression : 4 segments, remplis en var(--gold)
- Questions : Cormorant Garamond 300, var(--white), large
- Descriptions : DM Sans, var(--muted)
- Bouton Suivant : btn-primary pleine largeur

### Paywall (PaywallView)
- Fond : var(--navy)
- Card free : card-accent standard
- Card premium : card avec border var(--gold), badge "Abide Plus" en haut
- Bouton premium : btn-primary pleine largeur avec ombre dorée
- Prix : Cormorant Garamond 300 grand format, var(--white)
- Liste features : items avec "—" doré (comme le site)

### Session Prière / Méditation (mode immersif)
- Fond : var(--navy) + halo radial doré animé (breathe 4s)
- Tabs masquées (mode plein écran)
- Texte de prière : Lora 18px, var(--cream), centré
- Séparateurs : ligne fine 1px, var(--gold-border)
- Fermeture : swipe bas ou bouton discret

---

## 9. Règles d'Implémentation Ionic/Vue 3

### Variables Ionic à surcharger (dans variables.css)
```css
:root {
  --ion-background-color: var(--navy);
  --ion-text-color: var(--cream);
  --ion-color-primary: var(--gold);
  --ion-color-primary-contrast: var(--navy);
  --ion-toolbar-background: var(--navy2);
  --ion-item-background: var(--card-bg);
  --ion-border-color: var(--gold-border);
  --ion-tab-bar-background: var(--navy2);
  --ion-tab-bar-color: var(--muted);
  --ion-tab-bar-color-selected: var(--gold);
}
```

### Règles de développement
1. Toujours utiliser les variables CSS — jamais de valeur hexadécimale hardcodée
2. Vérifier le rendu sur fond sombre d'abord
3. Tester en mode clair après (optionnel mais important)
4. Vérifier sur petit écran 375px ET grand 430px
5. Taille tactile minimum : 44x44px sur tous les éléments cliquables
6. Jamais de bordure ou couleur bleue Ionic par défaut non surchargée
7. Les publicités AdMob : jamais pendant la lecture Bible, l'audio, la prière, l'IA

---

## 10. Ce qu'il Faut Toujours Éviter

### Couleurs
- Fond blanc pur #FFFFFF comme background principal
- Fond gris #F5F5F5 ou similaire (froid, générique)
- Bleu Ionic #3880FF non surchargé
- Violet ou rouge comme couleur principale
- Or trop saturé ou trop jaune (garder dans la gamme #C9A84C - #E8C96B)

### Typographie
- Roboto ou System UI sans surcharge des fonts de marque
- Nunito (font du site web) dans l'app — réservée au site uniquement
- Texte tout en majuscules pour les versets bibliques
- Texte sous 12px

### Composants
- Cards avec fond blanc sur fond sombre
- Boutons avec des coins très arrondis (pill) pour les CTAs principaux — garder radius: 2px
- Animations rapides/nerveux (durée < 150ms sur des transitions visuelles)
- Publicités pendant les moments spirituels

### Général
- Ressembler à une app de productivité ou de fitness
- Casser la cohérence navy/gold en introduisant une 3e couleur non validée
- Surcharger l'écran : l'espace vide est intentionnel

---

## 11. Accessibilité

- Contraste minimum WCAG AA : 4.5:1 texte normal, 3:1 grand texte
- var(--gold) #C9A84C sur var(--navy) #0B1624 → contraste ~5.2:1 ✅
- var(--cream) #F5F0E6 sur var(--navy) #0B1624 → contraste ~12.4:1 ✅
- var(--muted) #8A9BB5 sur var(--navy) #0B1624 → contraste ~4.6:1 ✅ (vérifier)
- Taille tactile minimum : 44x44px
- Ne jamais véhiculer une information uniquement par la couleur
- Labels d'accessibilité sur toutes les icônes seules

---

*Document vivant — toute évolution de la charte doit être documentée ici.*
*Dernière mise à jour : Juin 2026 — palette extraite de la charte officielle du projet.*
