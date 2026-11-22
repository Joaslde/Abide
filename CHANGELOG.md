# Historique des versions d'Abide

Une section par version envoyée sur Google Play, la plus récente en haut.
Chaque section donne : nom de version, code de version (versionCode), date d'import
dans Play Console, piste, puis ce qui a été **Ajouté**, **Modifié** et **Corrigé**,
en langage simple (c'est la base des notes de version du Play Store).

**Règle de mise à jour** (voir CLAUDE.md) : toute fonctionnalité ou correction
visible par l'utilisateur s'ajoute dans « En cours » au moment où elle est faite.
Au moment d'envoyer une version sur Play Console, « En cours » devient la nouvelle
version (nom, code, date) et le commit correspondant reçoit l'étiquette git `vX.Y`.

Chaque app bundle importé reste téléchargeable dans Play Console > Explorateur d'app
bundles (bundle d'origine ou APK universel signé par Google) : c'est le moyen de
réinstaller une ancienne version pour comparer.

---

## En cours (prochaine version : 1.6, versionCode 8)

Branche `feat/capacitor-8-paiement`, non publiée.

### Ajouté
- Abide Plus : abonnement mensuel via Google Play (RevenueCat), écran de présentation,
  restauration des achats. Contenu : aucune publicité, Guide jusqu'à 50 messages par
  jour, quiz sans limite. La Bible, son audio et la prière restent gratuits.
- Badge doré « Abide Plus » pour les abonnés, sur l'Accueil et dans le Guide ; l'onglet
  Plus affiche « Abide Plus est actif ». Un appui ouvre l'écran de l'abonnement.
- Écran « Supprimer mon compte » : rappel que la suppression n'annule pas l'abonnement
  Google Play, avec un bouton « Gérer mon abonnement ».

### Modifié
- Passage de Capacitor 6 à Capacitor 8 (prérequis de Google Play Billing).
- Le premium du parrainage et celui de l'abonnement sont gérés séparément côté serveur.

### Corrigé
- Navigation figée plusieurs secondes à l'ouverture quand le téléphone est connecté
  mais sans accès à Internet (la session ne bloque plus les onglets).
- Plus de tentative de chargement de publicité hors ligne.
- Un premium arrivé à échéance (parrainage terminé, abonnement résilié ou remboursé)
  coupe maintenant les avantages sans redémarrer l'app ; avant, les publicités ne
  revenaient jamais.

---

## 1.5 (versionCode 7), importée le 17 novembre 2026, test interne (non publiée en production)

### Ajouté
- **Application entièrement en espagnol** : interface, Guide IA, quiz, prières,
  notifications, messages de série.
- **Catalogue de Bibles élargi** : 22 versions libres de droits en français (5 avec la
  Louis Segond intégrée), anglais (13) et espagnol (5), toutes lisibles hors ligne.
  Écran des versions groupé par langue, icône casque sur les versions avec audio.
  Audio de la Berean Standard Bible (anglais).
- **Réglages > Notifications** : les 7 rappels du jour (matin, soir, série), heure et
  activation réglables un par un. Premier rappel du matin avancé de 10 h à 7 h.
- **Fin de chapitre** : le chapitre se marque comme lu automatiquement, avec une
  courte animation dorée.
- **7 polices de lecture** embarquées (Literata, Merriweather, Lora, EB Garamond,
  Crimson Pro, Source Serif, Atkinson Hyperlegible).
- **Flamme embrasée** à partir de 10 jours de série (accueil et écran de célébration).
- Guide IA premium plafonné à 50 messages par jour, avec un message dédié.

### Modifié
- **Onboarding** réduit de 13 à 8 questions ; la question du moment préféré règle le
  premier rappel du jour.
- Textes « accès illimité » remplacés par « jours de premium ».
- Plus aucun tiret cadratin dans les textes, y compris dans les réponses du Guide.

### Corrigé
- Titre de la vue Bible et onglets Ancien / Nouveau Testament coupés par « … ».
- Réglages > Parrainage ramenait parfois sur la page Plus.
- Publicités qui pouvaient apparaître pendant l'onboarding ou par-dessus la lecture.
- Quiz toujours générés en français, même pour les anglophones.
- Noms de certaines Bibles mal encodés (« FranÃ§ais »).

---

## 1.4 (versionCode 6), importée le 12 octobre 2026, production

Première version publiée en production (12 octobre 2026).

### Corrigé
- Publicités jamais affichées en production : le bloc d'annonces AdMob était de type
  « Enchères partenaires » au lieu de « Standard ».
- Conformité Google Play sur les pages mémoire de 16 Ko (alignement des bibliothèques).

## 1.3 (versionCode 5), importée le 12 octobre 2026

Version de transition vers la production (corrections AdMob et 16 Ko, détail fusionné
dans la 1.4).

## 1.2 (versionCode 4), importée le 6 octobre 2026

Détail non retrouvé dans l'historique (commits groupés le 11 octobre : « Add features
and fixes »). Contient les corrections de septembre listées ci-dessous en 1.1.

## 1.1 (versionCodes 2 et 3), importées le 11 septembre 2026, test fermé

### Corrigé
- Retrait de la permission « alarmes exactes » (USE_EXACT_ALARM), refusée par Google
  Play pour une app qui n'est pas un réveil.
- Notifications de rappel fiables : Android ne coupe plus les rappels (filtre
  anti-spam), ils sont reposés même app fermée, son personnalisé.
- Titres de chapitre longs tronqués (« Cantique des Cantiques »).
- Partage d'un verset en image : enregistrement dans la galerie, signature de l'app.
- Changement de nom de package : `com.toabide.app` (l'ancien était déjà pris).

## 1.0 (versionCode 1), importée le 10 septembre 2026, test interne

Première version : Bible Louis Segond 1910 hors ligne, audio de la Bible, Guide IA
(L'Ancre), Sanctuaire (prière du matin et du soir, journal, jeûnes), plans de lecture,
verset du jour, série de lecture, surlignages, notes, signets, partage de versets,
parrainage, publicités interstitielles.
