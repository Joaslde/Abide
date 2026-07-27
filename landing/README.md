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

## Déployé (2026-07-27)

Hébergé sur Vercel, connecté au dépôt du projet (dossier `landing/` sélectionné
comme racine de déploiement).

- URL finale : `https://toabide.online/` — DNS en cours de propagation
- URL provisoire (déjà fonctionnelle) : `https://abide-ivory-three.vercel.app/`

| Page | URL finale | URL provisoire |
|---|---|---|
| Accueil | `https://toabide.online/` | `https://abide-ivory-three.vercel.app/` |
| FAQ | `https://toabide.online/faq.html` | `https://abide-ivory-three.vercel.app/faq.html` |
| Confidentialité | `https://toabide.online/privacy.html` | `https://abide-ivory-three.vercel.app/privacy.html` |
| Conditions | `https://toabide.online/terms.html` | `https://abide-ivory-three.vercel.app/terms.html` |

`vercel.json` (`cleanUrls: false`) est nécessaire : sans lui, Vercel redirige toutes
les pages secondaires vers `/` (comportement SPA par défaut) — bug rencontré et
corrigé le 2026-07-27, cf. tasks/lessons.md.

Ces URLs sont câblées dans `src/views/settings/SettingsView.vue` (FAQ/CGU/confidentialité,
via `@capacitor/browser`) avec l'URL **finale** (`toabide.online`) — à vérifier une fois
le DNS propagé.

## À faire avant publication définitive

- [ ] Vérifier que `https://toabide.online/` répond bien (DNS propagé) avant la
      soumission Google Play — sinon utiliser temporairement l'URL Vercel provisoire
      dans la fiche Play Console et dans l'app
- [ ] Mettre à jour le lien Google Play dans `index.html` une fois l'app publiée
      (actuellement pointe vers `com.abide.app`, correct si l'app est publiée sous cet id)
- [ ] Donner l'URL de confidentialité finale à la fiche Google Play Console
      (champ "Politique de confidentialité")
