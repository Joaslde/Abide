# tasks/lessons.md — Abide | Apprentissages Cumulés

> Ce fichier est la mémoire du projet.
>
> ⚠️ RÈGLE : Après chaque correction de bug, chaque blocage résolu ou
> chaque décision technique importante, Claude ajoute une entrée ici.
> Ce fichier est lu EN PREMIER à chaque démarrage de session.
> Il grandit avec le projet et ne se réinitialise jamais.

---

## Format d'une entrée

```
[YYYY-MM-DD] | Catégorie | Ce qui s'est passé | Règle à retenir
```

**Catégories disponibles :**
- `BUG` — correction d'un bug rencontré
- `ARCH` — décision d'architecture adoptée
- `API` — comportement inattendu d'une API externe
- `PERF` — problème ou amélioration de performance
- `SECU` — faille ou règle de sécurité découverte
- `UX` — comportement utilisateur ou rendu inattendu
- `CAPACITOR` — spécificité native iOS/Android
- `SUPABASE` — comportement Supabase à retenir
- `PAYMENT` — comportement du flux de paiement

---

## Décisions Techniques Initiales (Juin 2026)

*(Ces entrées documentent les choix fondamentaux du projet — à ne jamais remettre en question sans discussion explicite)*

```
[2026-06-01] | ARCH | ElevenLabs retiré du projet | Utiliser OpenAI TTS uniquement pour vocaliser les réponses du guide IA. L'audio Bible vient exclusivement de BibleBrain/FCBH.

[2026-06-01] | ARCH | TypeScript rejeté | Le projet utilise JavaScript (Vue 3 Composition API). Pas de TypeScript, même partiel.

[2026-06-01] | ARCH | Compteur IA côté serveur | Le compteur de sessions IA est toujours vérifié dans l'Edge Function Supabase avant d'appeler OpenRouter. Jamais côté client.

[2026-06-01] | ARCH | Audio Bible = BibleBrain uniquement | Ne jamais générer l'audio des textes bibliques avec du TTS. Utiliser les enregistrements humains FCBH.

[2026-06-01] | ARCH | Paiement = double flux | Android : KKiaPay + FedaPay SDK. iOS : RevenueCat + Apple IAP. Supabase est la source de vérité unique du statut premium.

[2026-06-01] | ARCH | AdMob = navigation uniquement | Les publicités ne s'affichent jamais pendant la lecture Bible, l'audio, la prière ou une session IA.

[2026-06-01] | ARCH | PWA rejetée | PWA non retenue à cause des limitations audio background et notifications sur iOS. App native via Capacitor.
```

---

## Apprentissages en Cours

```
[2026-06-12] | ARCH | ionic start ne fonctionne pas sur dossier non vide | Initialiser le projet manuellement (package.json + npm install + fichiers de config) quand le dossier contient déjà des fichiers .md ou .env.

[2026-06-12] | ARCH | capacitor.config.json préféré à capacitor.config.js | Avec "type":"module" dans package.json, le fichier .js Capacitor génère une erreur ESM. Utiliser capacitor.config.json qui est universel et toujours supporté.

[2026-06-12] | BUG | "type":"module" casse module.exports dans capacitor.config.js | Remplacer module.exports par export default OU mieux : utiliser capacitor.config.json (format JSON, aucun problème ESM/CJS).

[2026-06-12] | API | eBible.org — URLs de téléchargement cassées | Les URLs https://ebible.org/Scriptures/fra_lsg*.zip retournent 404. Utiliser getbible.net API à la place : GET https://api.getbible.net/v2/ls1910/{bookNr}.json — retourne tout un livre (tous chapitres + versets) en une requête. ID de la LSG 1910 = "ls1910".

[2026-06-12] | API | getbible.net structure de réponse | La réponse retourne chapters[] (tableau), chaque chapitre contient verses[] avec {chapter, verse, text}. Pas un objet mais un tableau. Ne pas utiliser chapters.'1' mais chapters[0].

[2026-06-12] | CAPACITOR | Plateformes Capacitor 6 — @capacitor/cli doit être local | npx cap add android échoue si @capacitor/cli n'est pas dans devDependencies du projet. L'installer avec npm install --save-dev @capacitor/cli avant d'ajouter les plateformes.

[2026-06-12] | ARCH | iOS build impossible sur Windows | npx cap add ios échoue sur Windows. Les builds iOS nécessitent un Mac + Xcode. À faire sur Mac uniquement (Phase 1.9 — build stores).

[2026-06-12] | SECU | OPENROUTER_KEY ne doit pas avoir le préfixe VITE_ | La clé est dans .env.local sans VITE_ car elle est réservée aux Edge Functions Supabase. Ne jamais l'exposer côté client.
```

---

*Ce fichier sera enrichi automatiquement — ne pas modifier manuellement les entrées existantes.*
