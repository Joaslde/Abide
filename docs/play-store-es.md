# Fiche Play Store en espagnol (brouillon du 2026-11-12)

À coller dans Play Console : Présence sur le Play Store > Fiche principale >
Gérer les traductions > Espagnol (es-419, Amérique latine, et/ou es-ES, Espagne).

Rédigée à partir des fonctions réelles de la v1.5, sans reprendre la description
française (elle n'est que dans Play Console). À comparer avec elle avant publication.

## Nom de l'application (30 caractères max)

```
Abide: Biblia y Guía IA
```
(23 caractères)

## Description courte (80 caractères max)

```
Tu Biblia cada día, con un guía espiritual con IA que responde tus preguntas.
```
(77 caractères)

## Description longue (4 000 caractères max)

```
Abide te acompaña cada día en la lectura de la Palabra de Dios: lee, escucha, pregunta y ora, a tu ritmo.

📖 LA BIBLIA, INCLUSO SIN CONEXIÓN
• Más de 20 versiones libres en español, francés e inglés: Reina-Valera 1909, Biblia en Español Sencillo, Biblia Libre para el Mundo y muchas más.
• Descárgalas una vez y léelas en cualquier lugar, sin internet.
• Biblia en audio narrada por voces humanas (por ahora en francés e inglés).
• Resalta versículos, toma notas, guarda marcadores y comparte un versículo como imagen.
• Elige tu tipo de letra, el tamaño del texto y el modo claro u oscuro.

🕊️ UN GUÍA ESPIRITUAL CON IA
• Haz tus preguntas sobre un pasaje, una dificultad o un tema bíblico y recibe una respuesta cálida, basada en la Escritura.
• Las referencias citadas se verifican y se abren con un toque en tu Biblia.
• Varios modos: enseñanza, predicación, meditación, teología y estudio guiado.
• «Meditar este versículo»: abre el guía directamente sobre el texto que estás leyendo.

✨ AVANZA CADA DÍA
• Versículo del día y planes de lectura para cada etapa de la vida.
• Racha de lectura: tu llama crece día tras día.
• Al terminar un capítulo, se marca como leído automáticamente.
• Cuestionario por capítulo para comprobar lo que has retenido.

🙏 EL SANTUARIO
• Oración de la mañana y de la noche, con recordatorios a la hora que tú elijas.
• Diario de oración: confía tus peticiones a Dios y marca las oraciones respondidas.
• Calendario de los ayunos cristianos y acompañamiento día a día.

🎁 INVITA A TUS SERES QUERIDOS
Comparte tu enlace: cada persona que se registra te regala días de premium, con un uso ampliado del guía.

Abide existe para ayudarte a permanecer en Cristo, cada día. «Estad en mí, y yo en vosotros.» (Juan 15:4)
```

## Points à vérifier avant publication

- Nombre de versions : « Más de 20 » correspond aux 22 versions du manifeste R2
  (FR 4 + LSG intégrée, EN 13, ES 5) au 2026-11-12.
- Audio : AUDIO_MAP (biblebrain.js) ne contient que LSG1910, KJV, WEB et BSB, donc
  pas d'audio en espagnol pour l'instant. Mettre la phrase à jour si une version
  espagnole reçoit un audio.
- Premium : pas de « ilimitado » (le Guide premium est plafonné à 50 messages par jour).
- Citation finale : texte exact de la Reina-Valera 1909 (domaine public), vérifié
  dans rv1909SQLite.db. Ne pas la remplacer par « Permaneced en mí… », qui est la
  formulation de la RV1960, sous droits.
- Captures d'écran : en refaire avec l'app en espagnol (Réglages > Idioma > Español).
