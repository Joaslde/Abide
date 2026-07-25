/**
 * Textes variés pour les notifications de streak (Duolingo-like).
 * Plusieurs formulations par situation pour ne jamais répéter la même phrase
 * deux jours de suite — tirage déterministe (même mécanique que prayerPool.js).
 */

const POOL = {
  fr: {
    soft: [
      { title: 'N’oublie pas ta lecture aujourd’hui', body: 'Ta série de {streak} jours t’attend. Quelques minutes suffisent pour la garder allumée.' },
      { title: 'Un moment pour la Parole ?', body: 'Ta flamme de {streak} jours brûle encore. Ne la laisse pas s’éteindre ce soir.' },
      { title: 'Ta série pense à toi', body: '{streak} jours de suite, c’est précieux. Un chapitre suffit pour continuer.' },
      { title: 'Petit rappel du soir', body: 'Tu n’as pas encore ouvert la Bible aujourd’hui. Ta série de {streak} jours compte sur toi.' }
    ],
    urgent: [
      { title: 'Ta série de {streak} jours va s’éteindre 🔥', body: 'Il reste 2h avant minuit. Ne laisse pas ta flamme s’éteindre ce soir.' },
      { title: 'Dernière ligne droite ⏳', body: '{streak} jours de série, à deux doigts de s’arrêter. Un chapitre, et c’est sauvé.' },
      { title: 'Ne laisse pas tomber maintenant', body: 'Bientôt minuit — ta série de {streak} jours ne tient plus qu’à un fil.' },
      { title: 'Il est encore temps 🔥', body: 'Quelques minutes suffisent pour garder tes {streak} jours de série.' }
    ],
    // J+1, J+2, J+3… (indexé par nb de jours écoulés depuis la casse − 1)
    lost: [
      { title: 'Ta série s’est arrêtée', body: 'Tu nous manques ! Ta série de {streak} jours attend que tu reviennes.' },
      { title: 'Ta série s’est arrêtée', body: '{streak} jours de suite, c’était beau. Reprends aujourd’hui et recommence à zéro.' },
      { title: 'Reviens quand tu veux', body: 'Ta flamme de {streak} jours s’est éteinte, mais une nouvelle peut commencer maintenant.' },
      { title: 'La Parole t’attend', body: 'Ça fait un moment. Un seul chapitre suffit pour repartir.' }
    ]
  },
  en: {
    soft: [
      { title: 'Don’t forget today’s reading', body: 'Your {streak}-day streak is waiting. A few minutes is all it takes to keep it alive.' },
      { title: 'A moment for the Word?', body: 'Your {streak}-day flame is still burning. Don’t let it go out tonight.' },
      { title: 'Your streak is thinking of you', body: '{streak} days in a row is precious. One chapter keeps it going.' },
      { title: 'A gentle evening reminder', body: 'You haven’t opened the Bible today. Your {streak}-day streak is counting on you.' }
    ],
    urgent: [
      { title: 'Your {streak}-day streak is about to end 🔥', body: '2 hours left before midnight. Don’t let your flame go out tonight.' },
      { title: 'Final stretch ⏳', body: '{streak} days strong, about to stop. One chapter and it’s saved.' },
      { title: 'Don’t give up now', body: 'Midnight is close — your {streak}-day streak is hanging by a thread.' },
      { title: 'There’s still time 🔥', body: 'A few minutes is all it takes to keep your {streak}-day streak.' }
    ],
    lost: [
      { title: 'Your streak has ended', body: 'We miss you! Your {streak}-day streak is waiting for you to come back.' },
      { title: 'Your streak has ended', body: '{streak} days in a row — that was beautiful. Come back today and start again.' },
      { title: 'Come back anytime', body: 'Your {streak}-day flame went out, but a new one can start right now.' },
      { title: 'The Word is waiting', body: 'It’s been a while. Just one chapter to get going again.' }
    ]
  }
}

function fill(msg, params) {
  return {
    title: msg.title.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? ''),
    body: msg.body.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '')
  }
}

/** Indice déterministe par date + salt (varie chaque jour, sans état à stocker). */
function dailyIndex(len, date, salt) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  return (dayOfYear + salt) % len
}

/**
 * Message de streak varié pour la situation donnée.
 * @param {'soft'|'urgent'|'lost'} kind
 * @param {string} locale
 * @param {object} params  ex: { streak: 5 }
 * @param {Date} date       sert de graine (aujourd'hui par défaut)
 * @param {number} salt     décale l'indice (ex: J+1 vs J+2 pour 'lost')
 */
export function streakMessage(kind, locale = 'fr', params = {}, date = new Date(), salt = 0) {
  const pool = (POOL[locale] ?? POOL.fr)[kind]
  const msg = pool[dailyIndex(pool.length, date, salt)]
  return fill(msg, params)
}
