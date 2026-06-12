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

*(Claude remplit cette section au fil du développement)*

---

*Ce fichier sera enrichi automatiquement — ne pas modifier manuellement les entrées existantes.*
