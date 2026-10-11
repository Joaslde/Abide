# Checklist — Publication Google Play & activation AdMob

> Établie le 2026-07-26. **Statut : en attente du paiement du compte développeur (25 $).**
> Rien ici n'est irréversible sauf le paiement lui-même. La fiche app, les builds
> et la piste de test interne se modifient / se remplacent autant que nécessaire.

---

## Pourquoi cette checklist existe

AdMob ne sert **que des publicités de test** tant que l'app n'est pas associée à un
magasin d'applications. C'est la seule case manquante du compte AdMob (paiement ✓,
bloc d'annonces ✓, compte approuvé ✓). Pour cocher « Associer à un magasin
d'applications », il faut une fiche Google Play — même non publiée.

**La piste « Test interne » suffit** : elle ne passe pas par la revue publique de Google.

---

## Ce qui NE bloque PAS (à ne pas confondre)

- **SMTP (Resend)** — sans rapport avec la publication ou AdMob. Ne sert qu'au mail de
  réinitialisation de mot de passe. Peut être branché **après** publication, sans rien casser.
- **Clé de signature** — gérée automatiquement par *Play App Signing*. Aucun risque de
  situation irréversible avec le flux standard.

---

## Étapes, dans l'ordre où Play Console les demande

- [ ] **1. Payer le compte développeur** (25 $, une seule fois) — [play.google.com/console/signup](https://play.google.com/console/signup)
- [ ] **2. Vérification d'identité** — pièce d'identité + parfois vérification vidéo.
      ⏳ Seule étape avec un délai subi (quelques heures à 2-3 jours).
- [ ] **3. Créer l'application** — nom « Abide », langue par défaut, App, Gratuite. Réversible.
      > Le nom interne à la création ("Abide") diffère du nom PUBLIC de la fiche (étape 4) —
      > Google permet de le changer sans limite avant publication.
- [ ] **4. Fiche magasin (Store Listing)** — décidé le 2026-09-10 :
      - [ ] **Nom de l'app (30 car.)** : `Abide — Bible & Guide IA`
      - [ ] **Description courte (80 car.)** : `Ta Bible au quotidien, éclairée par un guide spirituel IA`
      - [ ] Description longue (4000 car.) — à rédiger, reprendre les 3 piliers (lecture,
            prière, Guide IA) + preuve sociale une fois dispo
      - [ ] Icône 512×512 — **voir docs/icon-concepts.md**, en attente de génération/validation
      - [ ] Image de couverture 1024×500
      - [ ] ≥ 2 captures d'écran téléphone
      > L'utilisateur a choisi de garder splash/screenshots définitifs pour plus tard :
      > des placeholders propres suffisent à débloquer Play Console. L'ICÔNE en revanche
      > doit être la version finale (voir docs/icon-concepts.md) — la remplacer plus tard
      > change l'identité visuelle vue par les utilisateurs déjà installés.
- [ ] **5. Content rating** — questionnaire (violence, langage…) → classification auto. ~10 min.
- [ ] **6. Target audience & Content** — tranche d'âge. L'app NE cible PAS les enfants.
- [ ] **7. Data Safety** — le formulaire le plus long. Déclarer ce qui est collecté et pourquoi.
      > Claude peut le préremplir : il connaît les collecteurs réels (Supabase, OpenRouter,
      > AdMob, AppsFlyer).
- [ ] **8. Politique de confidentialité (URL)** — ✅ déjà rédigée, juste à coller.
- [ ] **9. App content → Ads declaration** — cocher « contient des publicités » (AdMob).
- [ ] **10. App access** — fournir des identifiants de test à Google (une partie de l'app
      exige un compte). → créer un compte de test dédié en base.
- [ ] **11. Générer l'AAB signé** (build de production Android) — *étape technique, côté Claude*.
- [ ] **12. Créer la piste « Test interne »** + ajouter les testeurs → publier.
      ✅ Pas de revue Google sur cette piste : effet immédiat.

---

## Une fois la piste test interne active

- [ ] AdMob → **« Associer à un magasin d'applications »** → sélectionner Abide
- [ ] L'examen AdMob démarre (indépendant de la revue Play Store publique)
- [ ] Une fois approuvé : **décommenter `VITE_ADMOB_INTERSTITIAL_ID`** dans `.env.local`
      → les vraies publicités remplacent les pubs de test

> ⚠️ **Ne JAMAIS cliquer ses propres vraies publicités** : détecté par Google,
> bannissement définitif du compte AdMob possible. Les IDs de test existent pour ça.
