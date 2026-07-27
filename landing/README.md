# Landing Abide

Mini-site statique (HTML/CSS pur, aucune dépendance) : page d'accueil + pages légales
requises par Google Play (politique de confidentialité, conditions d'utilisation).

## Fichiers

- `index.html` — page d'accueil
- `privacy.html` — politique de confidentialité (basée sur `docs/privacy-policy-draft.md`)
- `terms.html` — conditions d'utilisation
- `styles.css` — style partagé (palette identique à l'app : or/navy)

## Déployer

Ce dossier est 100 % statique : aucun build, aucune dépendance. Déployable tel quel sur :

- **Vercel** : `vercel deploy landing/` (ou glisser-déposer le dossier sur vercel.com)
- **Netlify** : glisser-déposer le dossier sur app.netlify.com/drop
- **GitHub Pages** : pousser ce dossier sur une branche `gh-pages` ou activer Pages sur `main`

Une fois en ligne, tu obtiens 3 URLs stables, par exemple :
- `https://abide.app/` (accueil)
- `https://abide.app/privacy.html` (politique de confidentialité)
- `https://abide.app/terms.html` (conditions d'utilisation)

## À faire avant publication définitive

- [ ] Remplacer l'email de contact si `createurdecontenus@gmail.com` n'est pas définitif
- [ ] Mettre à jour le lien Google Play dans `index.html` une fois l'app publiée
      (actuellement pointe vers `com.abide.app`, correct si l'app est publiée sous cet id)
- [ ] Donner les URLs finales (privacy + terms) pour :
  1. la fiche Google Play Console (champ "Politique de confidentialité")
  2. `src/views/settings/SettingsView.vue` dans l'app (liens CGU/confidentialité, actuellement `// TODO(legal)`)
