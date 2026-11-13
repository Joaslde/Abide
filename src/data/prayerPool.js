/**
 * Pool de prières curées, Sanctuaire.
 *
 * Contenu local (offline, zéro coût) : prières du matin, du soir, et
 * encouragements de jeûne (utilisés aussi par les notifications locales).
 * Ton pastoral, tutoiement (charte de marque).
 *
 * Le tirage est DÉTERMINISTE PAR DATE : même prière toute la journée
 * (cohérent si on rouvre l'app), variation d'un jour à l'autre.
 */

const POOL = {
  fr: {
    morning: [
      "Père, merci pour ce jour qui se lève. Avant le bruit du monde, je veux entendre ta voix. Que ta Parole éclaire chacun de mes pas aujourd'hui. Amen.",
      "Seigneur, je te remets cette journée : mes projets, mes rencontres, mes inquiétudes. Conduis-moi par ton Esprit et garde mon cœur en paix. Amen.",
      "Dieu de bonté, tes compassions se renouvellent chaque matin. Renouvelle aussi ma force et ma joie, que je te serve de tout mon cœur aujourd'hui. Amen.",
      "Père céleste, apprends-moi à marcher humblement avec toi aujourd'hui. Que mes paroles encouragent, que mes gestes bénissent. Amen.",
      "Seigneur Jésus, sois le premier dans mes pensées ce matin. Ce que je ne peux pas porter, je te le confie. Ce que tu me confies, aide-moi à le faire avec amour. Amen.",
      "Père, ouvre mes yeux sur les merveilles de ta Parole, et mon cœur sur les personnes que tu placeras sur ma route aujourd'hui. Amen.",
      "Dieu fidèle, je ne sais pas ce que cette journée réserve, mais je sais qu'elle est dans ta main. Que ta volonté soit faite en moi et autour de moi. Amen.",
      "Seigneur, garde-moi aujourd'hui de la précipitation et du découragement. Enseigne-moi à demeurer en toi, comme le sarment demeure sur le cep. Amen."
    ],
    evening: [
      "Père, merci pour cette journée, pour ses joies et même pour ses difficultés. Je dépose tout à tes pieds. Donne-moi une nuit paisible sous ton regard. Amen.",
      "Seigneur, pardonne ce que j'ai mal fait aujourd'hui, et merci pour ta grâce qui me relève. Je m'endors en paix, car toi seul me donnes la sécurité. Amen.",
      "Dieu de paix, apaise mes pensées ce soir. Ce qui reste inachevé, je te le confie ; ce qui m'inquiète pour demain, tu t'en charges déjà. Amen.",
      "Père, merci pour les personnes que tu as mises sur ma route aujourd'hui. Bénis-les, veille sur ceux que j'aime, et garde-nous dans ta main cette nuit. Amen.",
      "Seigneur, avant de fermer les yeux, je veux te dire merci. Pour ta fidélité, pour ton pardon, pour ta présence discrète dans ma journée. Amen.",
      "Dieu très bon, si j'ai blessé quelqu'un aujourd'hui, montre-le-moi et donne-moi l'humilité de réparer. Que je me lève demain avec un cœur neuf. Amen.",
      "Père, la nuit tombe et je me souviens : tu ne dors ni ne sommeilles. Je peux me reposer, car tu veilles. Merci. Amen.",
      "Seigneur Jésus, merci d'avoir été avec moi aujourd'hui, même quand je t'ai oublié. Demeure avec moi cette nuit, et réveille-moi avec le désir de te chercher. Amen."
    ],
    fasting: [
      { verse: 'MAT 4.4', text: "L'homme ne vivra pas de pain seulement, mais de toute parole qui sort de la bouche de Dieu.", note: "Ta faim te rappelle que Dieu est ta vraie nourriture. Tiens bon, il te fortifie." },
      { verse: 'PSA 42.2', text: "Mon âme a soif de Dieu, du Dieu vivant.", note: "Chaque creux dans ton corps peut devenir un élan vers lui. Il est proche." },
      { verse: 'ISA 40.31', text: "Ceux qui se confient en l'Éternel renouvellent leur force.", note: "Tu n'avances pas par ta seule volonté : appuie-toi sur lui, maintenant." },
      { verse: 'MAT 6.17', text: "Quand tu jeûnes, parfume ta tête et lave ton visage.", note: "Ton jeûne est un secret entre toi et le Père. Il voit, et il honore." },
      { verse: 'PSA 34.9', text: "Sentez et voyez combien l'Éternel est bon !", note: "Ce que tu mets de côté aujourd'hui laisse de la place à sa douceur." },
      { verse: 'JOL 2.12', text: "Revenez à moi de tout votre cœur, avec des jeûnes, avec des pleurs.", note: "Ce jeûne est un chemin de retour. Chaque heure t'approche de son cœur." },
      { verse: 'PHP 4.13', text: "Je puis tout par celui qui me fortifie.", note: "La tentation d'abandonner est normale. Sa force, elle, ne faiblit pas." },
      { verse: 'PSA 63.2', text: "Mon âme est attachée à toi, ta droite me soutient.", note: "Quand le corps réclame, laisse ton âme s'accrocher plus fort à lui." },
      { verse: 'MAT 5.6', text: "Heureux ceux qui ont faim et soif de la justice, car ils seront rassasiés !", note: "Ta faim d'aujourd'hui prépare un rassasiement que rien n'égale." },
      { verse: '2CO 12.9', text: "Ma grâce te suffit, car ma puissance s'accomplit dans la faiblesse.", note: "Te sentir faible n'est pas un échec : c'est là que sa puissance agit." }
    ]
  },
  en: {
    morning: [
      "Father, thank you for this new day. Before the noise of the world, I want to hear your voice. May your Word light every step I take today. Amen.",
      "Lord, I hand you this day: my plans, my meetings, my worries. Lead me by your Spirit and keep my heart at peace. Amen.",
      "God of goodness, your mercies are new every morning. Renew my strength and my joy, that I may serve you wholeheartedly today. Amen.",
      "Heavenly Father, teach me to walk humbly with you today. May my words encourage and my actions bless. Amen.",
      "Lord Jesus, be first in my thoughts this morning. What I cannot carry, I give to you. What you entrust to me, help me do with love. Amen.",
      "Father, open my eyes to the wonders of your Word, and my heart to the people you place on my path today. Amen.",
      "Faithful God, I don't know what this day holds, but I know it is in your hands. May your will be done in me and around me. Amen.",
      "Lord, keep me today from haste and discouragement. Teach me to abide in you, as the branch abides in the vine. Amen."
    ],
    evening: [
      "Father, thank you for this day, for its joys and even its struggles. I lay everything at your feet. Give me a peaceful night under your watch. Amen.",
      "Lord, forgive what I did wrong today, and thank you for the grace that lifts me up. I fall asleep in peace, for you alone keep me safe. Amen.",
      "God of peace, quiet my thoughts tonight. What remains unfinished, I entrust to you; what worries me about tomorrow, you already carry. Amen.",
      "Father, thank you for the people you placed on my path today. Bless them, watch over those I love, and keep us in your hand tonight. Amen.",
      "Lord, before I close my eyes, I want to say thank you. For your faithfulness, your forgiveness, your quiet presence in my day. Amen.",
      "Good God, if I hurt anyone today, show me and give me the humility to make it right. Let me rise tomorrow with a new heart. Amen.",
      "Father, night falls and I remember: you neither slumber nor sleep. I can rest, because you keep watch. Thank you. Amen.",
      "Lord Jesus, thank you for being with me today, even when I forgot you. Stay with me tonight, and wake me with a desire to seek you. Amen."
    ],
    fasting: [
      { verse: 'MAT 4.4', text: "Man shall not live by bread alone, but by every word that comes from the mouth of God.", note: "Your hunger reminds you that God is your true food. Hold on: he strengthens you." },
      { verse: 'PSA 42.2', text: "My soul thirsts for God, for the living God.", note: "Every ache in your body can become a reach toward him. He is near." },
      { verse: 'ISA 40.31', text: "Those who hope in the Lord will renew their strength.", note: "You're not moving forward on willpower alone: lean on him, right now." },
      { verse: 'MAT 6.17', text: "When you fast, anoint your head and wash your face.", note: "Your fast is a secret between you and the Father. He sees, and he honors it." },
      { verse: 'PSA 34.9', text: "Taste and see that the Lord is good!", note: "What you set aside today makes room for his sweetness." },
      { verse: 'JOL 2.12', text: "Return to me with all your heart, with fasting and weeping.", note: "This fast is a road home. Every hour brings you closer to his heart." },
      { verse: 'PHP 4.13', text: "I can do all things through him who strengthens me.", note: "The urge to give up is normal. His strength never weakens." },
      { verse: 'PSA 63.2', text: "My soul clings to you; your right hand upholds me.", note: "When your body cries out, let your soul cling harder to him." },
      { verse: 'MAT 5.6', text: "Blessed are those who hunger and thirst for righteousness, for they shall be filled!", note: "Today's hunger prepares a fullness nothing else can match." },
      { verse: '2CO 12.9', text: "My grace is sufficient for you, for my power is made perfect in weakness.", note: "Feeling weak is not failure: that is where his power works." }
    ]
  },
  es: {
    morning: [
      "Padre, gracias por este día que comienza. Antes del ruido del mundo, quiero escuchar tu voz. Que tu Palabra ilumine cada uno de mis pasos hoy. Amén.",
      "Señor, te entrego este día: mis proyectos, mis encuentros, mis preocupaciones. Guíame por tu Espíritu y guarda mi corazón en paz. Amén.",
      "Dios de bondad, tus misericordias son nuevas cada mañana. Renueva también mi fuerza y mi alegría, para servirte de todo corazón hoy. Amén.",
      "Padre celestial, enséñame a caminar humildemente contigo hoy. Que mis palabras animen y que mis gestos bendigan. Amén.",
      "Señor Jesús, sé el primero en mis pensamientos esta mañana. Lo que no puedo cargar, te lo confío. Lo que tú me confías, ayúdame a hacerlo con amor. Amén.",
      "Padre, abre mis ojos a las maravillas de tu Palabra, y mi corazón a las personas que pondrás en mi camino hoy. Amén.",
      "Dios fiel, no sé lo que este día trae, pero sé que está en tu mano. Que tu voluntad se haga en mí y a mi alrededor. Amén.",
      "Señor, guárdame hoy de la prisa y del desánimo. Enséñame a permanecer en ti, como el pámpano permanece en la vid. Amén."
    ],
    evening: [
      "Padre, gracias por este día, por sus alegrías y hasta por sus dificultades. Pongo todo a tus pies. Dame una noche tranquila bajo tu mirada. Amén.",
      "Señor, perdona lo que hice mal hoy, y gracias por tu gracia que me levanta. Me duermo en paz, porque solo tú me das seguridad. Amén.",
      "Dios de paz, calma mis pensamientos esta noche. Lo que queda sin terminar, te lo confío; lo que me preocupa de mañana, tú ya lo llevas. Amén.",
      "Padre, gracias por las personas que pusiste en mi camino hoy. Bendícelas, cuida de los que amo, y guárdanos en tu mano esta noche. Amén.",
      "Señor, antes de cerrar los ojos, quiero darte las gracias. Por tu fidelidad, por tu perdón, por tu presencia discreta en mi día. Amén.",
      "Dios tan bueno, si herí a alguien hoy, muéstramelo y dame la humildad de reparar. Que mañana me levante con un corazón nuevo. Amén.",
      "Padre, cae la noche y recuerdo: tú no te adormeces ni duermes. Puedo descansar, porque tú velas. Gracias. Amén.",
      "Señor Jesús, gracias por haber estado conmigo hoy, incluso cuando te olvidé. Quédate conmigo esta noche, y despiértame con el deseo de buscarte. Amén."
    ],
    fasting: [
      { verse: 'MAT 4.4', text: "No sólo de pan vivirá el hombre, sino de toda palabra que sale de la boca de Dios.", note: "Tu hambre te recuerda que Dios es tu verdadero alimento. Mantente firme: él te fortalece." },
      { verse: 'PSA 42.2', text: "Mi alma tiene sed de Dios, del Dios vivo.", note: "Cada vacío en tu cuerpo puede convertirse en un impulso hacia él. Está cerca." },
      { verse: 'ISA 40.31', text: "Los que esperan en el Señor tendrán nuevas fuerzas.", note: "No avanzas solo por tu fuerza de voluntad: apóyate en él, ahora." },
      { verse: 'MAT 6.17', text: "Cuando ayunes, unge tu cabeza y lava tu rostro.", note: "Tu ayuno es un secreto entre tú y el Padre. Él ve, y él honra." },
      { verse: 'PSA 34.9', text: "Gustad, y ved que es bueno el Señor.", note: "Lo que dejas de lado hoy abre espacio a su dulzura." },
      { verse: 'JOL 2.12', text: "Convertíos a mí con todo vuestro corazón, con ayuno y lloro.", note: "Este ayuno es un camino de regreso. Cada hora te acerca a su corazón." },
      { verse: 'PHP 4.13', text: "Todo lo puedo en Cristo que me fortalece.", note: "La tentación de abandonar es normal. Su fuerza, en cambio, no se debilita." },
      { verse: 'PSA 63.2', text: "Mi alma está apegada a ti; tu diestra me ha sostenido.", note: "Cuando el cuerpo reclama, deja que tu alma se aferre más a él." },
      { verse: 'MAT 5.6', text: "Bienaventurados los que tienen hambre y sed de justicia, porque ellos serán saciados.", note: "Tu hambre de hoy prepara una saciedad que nada iguala." },
      { verse: '2CO 12.9', text: "Bástate mi gracia, porque mi poder se perfecciona en la debilidad.", note: "Sentirte débil no es un fracaso: es ahí donde actúa su poder." }
    ]
  }
}

/** Indice déterministe par date (même contenu toute la journée, varie chaque jour). */
function dailyIndex(len, date = new Date(), salt = 0) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86400000
  )
  return (dayOfYear + salt) % len
}

/** Prière du moment (morning|evening) pour la date donnée. */
export function prayerOfDay(type, locale = 'fr', date = new Date()) {
  const pool = (POOL[locale] ?? POOL.fr)[type] ?? POOL.fr[type]
  return pool[dailyIndex(pool.length, date, type === 'evening' ? 3 : 0)]
}

/** Encouragement de jeûne { verse, text, note } pour la date + slot (0=12h, 1=16h). */
export function fastingEncouragement(locale = 'fr', date = new Date(), slot = 0) {
  const pool = (POOL[locale] ?? POOL.fr).fasting
  return pool[dailyIndex(pool.length, date, slot * 5)]
}

/* ─────────────── Rappels de prière (plusieurs créneaux par moment) ─────────────── */

/**
 * Messages des rappels, indexés par créneau : le ton monte doucement d'un
 * créneau à l'autre (invitation → relance → dernière chance), sans culpabiliser.
 * `body` = version courte (notification repliée) ; `largeBody` = texte complet
 * (déplié via le style « grand texte » Android).
 */
const REMINDERS = {
  fr: {
    // 1 tableau par CRÉNEAU (le ton suit l'heure), plusieurs variantes par créneau
    // (la date choisit laquelle → pas la même phrase tous les jours).
    morning: [
      [ // créneau 1 (7h par défaut), invitation douce
        { title: 'Un temps avec Dieu 🌅', body: 'Commence ta journée par la prière.', largeBody: 'Commence ta journée par la prière et le verset du jour. Quelques minutes suffisent pour poser ton cœur devant lui.' },
        { title: 'Ce matin lui appartient', body: 'Un verset, une prière, et la journée change.', largeBody: 'Un verset, une prière, et la journée prend une autre couleur. Il t’attend, sans reproche.' }
      ],
      [ // créneau 2 (12h par défaut), relance
        { title: 'Ta prière du matin t’attend', body: 'Il n’est pas trop tard pour ce moment.', largeBody: 'La matinée est passée, mais il n’est jamais trop tard. Prends un instant : le verset du jour et une prière courte, c’est tout ce qu’il faut.' },
        { title: 'Un instant avant l’après-midi', body: 'La journée file. Pose-toi un moment.', largeBody: 'La journée file. Avant qu’elle ne t’emporte, viens déposer ce que tu portes : il t’écoute maintenant.' }
      ]
    ],
    evening: [
      [ // créneau 1 (18h par défaut), invitation douce
        { title: 'Avant la nuit 🌙', body: 'Dépose ta journée devant Dieu.', largeBody: 'Prends un instant pour déposer ta journée devant Dieu : ce qui a été beau, ce qui a été lourd. Il accueille tout.' },
        { title: 'La journée se termine', body: 'Un moment pour lui avant le soir.', largeBody: 'La journée se termine. Avant que le soir ne t’occupe, viens lui raconter ce qu’elle a contenu.' }
      ],
      [ // créneau 2 (20h par défaut), relance
        { title: 'Ta prière du soir t’attend', body: 'Un moment de paix avant de dormir.', largeBody: 'La soirée avance. Quelques minutes de prière suffisent pour finir ce jour en paix, sous son regard.' },
        { title: 'Il reste du temps ce soir', body: 'Quelques minutes suffisent.', largeBody: 'Il reste du temps ce soir pour un moment avec lui. Quelques minutes suffisent, il ne demande pas plus.' }
      ],
      [ // créneau 3 (22h par défaut), dernière invitation, ton nocturne
        { title: 'Avant de fermer les yeux', body: 'Ne termine pas ce jour sans lui.', largeBody: 'La nuit est là. Ne termine pas ce jour sans lui parler. Même quelques mots suffisent. Il ne dort ni ne sommeille.' },
        { title: 'Une dernière pensée pour lui', body: 'Le jour s’achève, il veille encore.', largeBody: 'Le jour s’achève et il veille encore. Une prière, même courte, et tu t’endors en paix.' }
      ]
    ]
  },
  en: {
    morning: [
      [
        { title: 'Time with God 🌅', body: 'Begin your day with prayer.', largeBody: 'Begin your day with prayer and today’s verse. A few minutes are enough to set your heart before him.' },
        { title: 'This morning belongs to him', body: 'A verse, a prayer, and the day changes.', largeBody: 'A verse, a prayer, and the day takes on another colour. He is waiting, without reproach.' }
      ],
      [
        { title: 'Your morning prayer is waiting', body: 'It’s not too late for this moment.', largeBody: 'The morning has passed, but it’s never too late. Take a moment: today’s verse and a short prayer is all it takes.' },
        { title: 'A moment before the afternoon', body: 'The day is flying by. Pause a little.', largeBody: 'The day is flying by. Before it carries you away, come and lay down what you’re holding: he is listening now.' }
      ]
    ],
    evening: [
      [
        { title: 'Before the night 🌙', body: 'Lay your day before God.', largeBody: 'Take a moment to lay your day before God: what was beautiful, what was heavy. He welcomes it all.' },
        { title: 'The day is ending', body: 'A moment for him before evening.', largeBody: 'The day is ending. Before the evening takes over, come and tell him what it held.' }
      ],
      [
        { title: 'Your evening prayer is waiting', body: 'A moment of peace before sleep.', largeBody: 'The evening is moving on. A few minutes of prayer are enough to end this day in peace, under his gaze.' },
        { title: 'There’s still time tonight', body: 'A few minutes are enough.', largeBody: 'There’s still time tonight for a moment with him. A few minutes are enough, he asks no more.' }
      ],
      [
        { title: 'Before you close your eyes', body: 'Don’t end this day without him.', largeBody: 'Night has come. Don’t end this day without speaking to him. Even a few words are enough. He neither slumbers nor sleeps.' },
        { title: 'One last thought for him', body: 'The day is done, he still watches.', largeBody: 'The day is done and he still watches. A prayer, however short, and you fall asleep in peace.' }
      ]
    ]
  },
  es: {
    morning: [
      [
        { title: 'Un tiempo con Dios 🌅', body: 'Empieza tu día con la oración.', largeBody: 'Empieza tu día con la oración y el versículo del día. Bastan unos minutos para poner tu corazón delante de él.' },
        { title: 'Esta mañana le pertenece', body: 'Un versículo, una oración, y el día cambia.', largeBody: 'Un versículo, una oración, y el día toma otro color. Él te espera, sin reproches.' }
      ],
      [
        { title: 'Tu oración de la mañana te espera', body: 'No es demasiado tarde para este momento.', largeBody: 'La mañana pasó, pero nunca es demasiado tarde. Tómate un instante: el versículo del día y una oración corta, es todo lo que hace falta.' },
        { title: 'Un instante antes de la tarde', body: 'El día pasa rápido, detente un momento.', largeBody: 'El día pasa rápido. Antes de que te arrastre, ven a dejar lo que llevas: él te escucha ahora.' }
      ]
    ],
    evening: [
      [
        { title: 'Antes de la noche 🌙', body: 'Pon tu día delante de Dios.', largeBody: 'Tómate un instante para poner tu día delante de Dios: lo que fue hermoso, lo que fue pesado. Él lo recibe todo.' },
        { title: 'El día termina', body: 'Un momento para él antes de la noche.', largeBody: 'El día termina. Antes de que la noche te ocupe, ven a contarle lo que contuvo.' }
      ],
      [
        { title: 'Tu oración de la noche te espera', body: 'Un momento de paz antes de dormir.', largeBody: 'La noche avanza. Unos minutos de oración bastan para terminar este día en paz, bajo su mirada.' },
        { title: 'Todavía hay tiempo esta noche', body: 'Bastan unos minutos.', largeBody: 'Todavía hay tiempo esta noche para un momento con él. Bastan unos minutos: él no pide más.' }
      ],
      [
        { title: 'Antes de cerrar los ojos', body: 'No termines este día sin él.', largeBody: 'Ya es de noche. No termines este día sin hablarle: incluso unas pocas palabras bastan. Él no se adormece ni duerme.' },
        { title: 'Un último pensamiento para él', body: 'El día termina, él sigue velando.', largeBody: 'El día termina y él sigue velando. Una oración, aunque sea corta, y te duermes en paz.' }
      ]
    ]
  }
}

/**
 * Message de rappel de prière pour un moment + un créneau donné.
 * Le CRÉNEAU fixe le ton (adapté à l'heure : douce le matin, nocturne à 22h) ;
 * la DATE choisit la variante (pas la même phrase tous les jours).
 * @param {'morning'|'evening'} type
 * @param {number} slot   index du créneau (0 = 1er rappel du moment)
 * @param {string} locale
 * @param {Date} date     graine de variation (jour)
 */
export function prayerReminder(type, slot = 0, locale = 'fr', date = new Date()) {
  const slots = (REMINDERS[locale] ?? REMINDERS.fr)[type] ?? REMINDERS.fr[type]
  const variants = slots[Math.min(slot, slots.length - 1)]
  return variants[dailyIndex(variants.length, date, slot)]
}
