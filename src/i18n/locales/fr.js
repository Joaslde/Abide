/* Traductions françaises — Abide */
export default {
  common: {
    appName: 'Abide',
    continue: 'Continuer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    back: 'Retour',
    skip: 'Passer',
    loading: 'Chargement…',
    or: 'ou',
    close: 'Fermer'
  },
  ai: {
    title: 'Guide',
    newConversation: 'Nouvelle discussion',
    emptyState: 'Aucune discussion pour l’instant. Commences-en une nouvelle.',
    emptyChatHint: 'Pose ta question sur un passage, une difficulté, un thème biblique…',
    chooseMode: 'Choisis une manière d’échanger :',
    placeholder: 'Écris ton message…',
    send: 'Envoyer',
    offlineNotice: 'Le Guide nécessite une connexion internet.',
    disclaimer: 'Le Guide est une aide à la réflexion, il ne remplace pas ton pasteur ou un accompagnateur.',
    sources: 'Sources',
    copy: 'Copier le message',
    edit: 'Modifier le message',
    selectText: 'Sélectionner du texte',
    exportToNote: 'Exporter en note',
    regenerate: 'Régénérer la réponse',
    messageActions: 'Actions du message',
    changeMode: 'Changer de mode',
    resend: 'Renvoyer',
    renameTitle: 'Renommer la discussion',
    renamePlaceholder: 'Titre de la discussion',
    history: 'Mes discussions',
    morning: 'Bonjour',
    afternoon: 'Bon après-midi',
    evening: 'Bonsoir',
    deleteConfirm: 'Supprimer cette discussion ? Cette action est définitive.',
    error: 'Une erreur est survenue. Réessaie.',
    modes: {
      enseignement: 'Enseignement',
      etude: 'Étude',
      predication: 'Prédication',
      meditation: 'Méditation',
      theologie: 'Théologie'
    }
  },
  quiz: {
    button: 'Quiz',
    title: 'Quiz du chapitre',
    intro: 'Cinq questions sur {book} {chapter} pour vérifier ce que tu retiens.',
    generating: 'Préparation de ton quiz…',
    offline: 'Le quiz nécessite une connexion internet.',
    error: 'Impossible de générer le quiz. Réessaie.',
    question: 'Question {current} / {total}',
    next: 'Suivant',
    seeResults: 'Voir mon résultat',
    correct: 'Bonne réponse !',
    incorrect: 'Ce n’est pas ça.',
    scoreLine: '{score} / {total} bonnes réponses',
    passTitle: 'Chapitre assimilé !',
    perfectTitle: 'Chapitre maîtrisé !',
    failTitle: 'Presque !',
    failHint: 'Il te faut au moins 3 bonnes réponses. Relis le chapitre et retente ta chance.',
    newBest: 'Nouveau record sur ce chapitre !',
    retry: 'Refaire le quiz',
    close: 'Fermer',
    star: 'étoile | étoile | étoiles'
  },
  sanctuaire: {
    title: 'Sanctuaire',
    moment: {
      morningTitle: 'Prière du matin',
      eveningTitle: 'Prière du soir',
      morningGreeting: 'Bonjour',
      eveningGreeting: 'Bonsoir',
      morningHint: 'Commence ta journée avec Dieu.',
      eveningHint: 'Dépose ta journée entre ses mains.',
      doneHint: 'Fait pour aujourd’hui. Merci d’être venu.',
      morningPrayer: 'Prière du matin',
      eveningPrayer: 'Prière du soir',
      subjects: 'Mes sujets de prière',
      aiPrayer: 'Prière personnalisée',
      aiPrefill: 'Aide-moi à prier à partir de ce verset : {reference} — « {verse} »',
      amen: 'Amen',
      doneToday: 'Prière faite aujourd’hui',
      amenToast: 'Que la paix de Dieu t’accompagne. 🙏'
    },
    journal: {
      title: 'Journal de prière',
      placeholder: 'Un sujet de prière…',
      add: 'Ajouter',
      empty: 'Aucun sujet pour l’instant. Confie à Dieu ce qui pèse sur ton cœur.',
      emptyHint: 'Confie tes sujets de prière.',
      swipeHint: 'Glisse un sujet pour le marquer exaucé ✓ ou le supprimer.',
      answeredTitle: 'Prières exaucées',
      answeredToast: 'Gloire à Dieu ! Une prière exaucée de plus. 🙌'
    },
    fasting: {
      title: 'Jeûne',
      activeLabel: 'Jeûne en cours',
      todayLabel: 'Jeûne aujourd’hui',
      nextLabel: 'Prochain jeûne',
      dayOf: 'Jour {day} sur {total}',
      ongoingToday: '{fast} est en cours aujourd’hui.',
      nextIn: '{fast} dans {days} jours',
      startsIn: 'Commence dans {days} jours',
      join: 'Je participe',
      joinedToast: 'Que Dieu te fortifie durant ce jeûne. 🕊️',
      leave: 'Quitter le jeûne',
      leaveTitle: 'Quitter le jeûne ?',
      leaveConfirm: 'Tu pourras le reprendre à tout moment. Les rappels seront désactivés.',
      personalTitle: 'Jeûne personnel',
      personalDesc: 'Commence ton propre jeûne quand tu le souhaites.',
      nDays: '{n} jours',
      startPersonal: 'Commencer mon jeûne',
      historyTitle: 'Historique',
      todayIs: 'Aujourd’hui'
    },
    fasts: {
      january: { title: 'Jeûne de janvier', desc: '21 jours à part pour chercher Dieu en début d’année (jeûne de Daniel).' },
      lent: { title: 'Carême', desc: '40 jours de préparation vers Pâques.' },
      goodfriday: { title: 'Vendredi Saint', desc: 'Jour de recueillement, mémoire de la croix.' },
      advent: { title: 'Avent', desc: 'Temps de préparation vers Noël.' },
      personal: { title: 'Jeûne personnel', desc: 'Ton jeûne, à ton rythme.' }
    },
    notif: {
      morningTitle: 'Un temps avec Dieu 🌅',
      morningBody: 'Commence ta journée par la prière et le verset du jour.',
      eveningTitle: 'Avant la nuit 🌙',
      eveningBody: 'Prends un instant pour déposer ta journée devant Dieu.',
      fastSoonTitle: '{fast} approche',
      fastSoonBody: 'Prépare ton cœur : le jeûne commence dans 3 jours.',
      fastTomorrowTitle: '{fast} commence demain',
      fastTomorrowBody: 'Prépare-toi à chercher Dieu de tout ton cœur.',
      fastStartTitle: '{fast} commence aujourd’hui',
      fastStartBody: 'Participes-tu ? Ouvre le Sanctuaire pour te joindre au jeûne.',
      fastOngoingTitle: '{fast} en cours',
      fastOngoingBody: 'Il est encore temps de te joindre au jeûne.',
      encourageTitle: 'Jeûne — jour {day}/{total}',
      nearEndTitle: 'La fin approche — jour {day}/{total}',
      completedTitle: 'Jeûne accompli ! 🎉',
      completedBody: 'Tu es allé jusqu’au bout. Que Dieu honore ta persévérance.'
      // Les textes de streak (doux / urgent / série perdue) vivent dans
      // src/data/streakMessages.js — plusieurs variantes tirées par jour,
      // pas de clé i18n fixe ici (pour ne jamais répéter la même phrase).
    }
  },
  welcome: {
    slogan: 'Demeurez en moi, et je demeurerai en vous.',
    reference: 'Jean 15.4',
    continueGoogle: 'Continuer avec Google',
    continueEmail: 'Continuer avec un e-mail'
  },
  auth: {
    login: 'Connexion',
    register: 'Créer un compte',
    welcomeBack: 'Bon retour',
    loginSubtitle: 'Connectons-toi à Abide',
    registerTitle: 'Bienvenue',
    registerSubtitle: 'Crée ton compte pour commencer',
    googleSignIn: 'Se connecter avec Google',
    googleSignUp: 'S’inscrire avec Google',
    noAccountQuestion: 'Je n’ai pas de compte',
    haveAccountQuestion: 'J’ai déjà un compte',
    forgotTitle: 'Mot de passe oublié ?',
    email: 'Adresse e-mail',
    emailPlaceholder: "toi{'@'}exemple.com",
    password: 'Mot de passe',
    passwordPlaceholder: '••••••••',
    firstName: 'Prénom',
    firstNamePlaceholder: 'Ton prénom',
    signIn: 'Se connecter',
    signingIn: 'Connexion…',
    signUp: 'S’inscrire',
    signingUp: 'Création…',
    magicLink: 'Recevoir un lien magique',
    forgotLink: 'Mot de passe oublié ?',
    noAccount: 'Pas encore de compte ?',
    haveAccount: 'Déjà un compte ?',
    createAccount: 'Créer un compte',
    backToLogin: 'Retour à la connexion',
    minChars: 'Au moins 8 caractères',
    forgotIntro: 'Saisis ton adresse e-mail. Si un compte y est associé, tu recevras un code de réinitialisation.',
    sendCode: 'Envoyer le code',
    sending: 'Envoi…',
    verifyTitle: 'Vérifie ton e-mail',
    verifyIntro: 'Saisis le code à 8 chiffres envoyé à {email}.',
    verify: 'Vérifier',
    verifying: 'Vérification…',
    resendCode: 'Renvoyer le code',
    resendIn: 'Renvoyer dans {s}s',
    newPasswordTitle: 'Nouveau mot de passe',
    newPasswordIntro: 'Ton nouveau mot de passe doit être différent de l’ancien.',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    passwordsMatch: 'Les mots de passe correspondent.',
    errors: {
      invalidCredentials: 'Identifiants incorrects.',
      emailNotConfirmed: 'Ton adresse e-mail n’est pas encore confirmée. Vérifie ta boîte mail.',
      emailInUse: 'Cette adresse e-mail est déjà utilisée.',
      passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères.',
      passwordMismatch: 'Les mots de passe ne correspondent pas.',
      passwordSameAsOld: 'Ton nouveau mot de passe doit être différent de l’ancien.',
      invalidOtp: 'Code incorrect ou expiré. Réessaie.'
    },
    strength: {
      tooShort: 'Trop court',
      weak: 'Faible',
      ok: 'Correct',
      good: 'Bon',
      excellent: 'Excellent'
    }
  },
  onboarding: {
    greeting: 'Bonjour {name},',
    greetingNoName: 'Bonjour,',
    welcomeBody: 'bienvenue sur Abide. Nous sommes vraiment heureux de t’accueillir parmi nous. Afin de personnaliser au mieux ton expérience, nous aimerions te poser quelques questions sur toi et ton cheminement spirituel. Cela ne prendra qu’un instant.',
    startQuiz: 'Oui, avec plaisir',
    laterButton: 'Je le ferai plus tard',
    skipQuiz: 'Non merci, je n’ai pas besoin d’une expérience faite pour moi',
    quiz: {
      next: 'Continuer',
      finish: 'Terminer',
      skipQuestion: 'Passer cette question',
      ageLabel: 'Âge : {age} ans',
      q1: {
        title: '{name}, quelle est ta date de naissance ?',
        hint: 'Cela nous aide à mieux t’accompagner.'
      },
      q2: {
        title: 'Tu es…',
        options: { homme: 'Un homme', femme: 'Une femme' }
      },
      q3: {
        title: 'D’où nous écris-tu ?',
        countryLabel: 'Pays',
        cityLabel: 'Ville',
        cityPlaceholder: 'Ta ville'
      },
      q4: {
        title: 'Fais-tu partie d’une église ?',
        hint: 'Cette question est facultative.',
        nameLabel: 'Nom de ton église',
        namePlaceholder: 'Ex : Église Vie Nouvelle',
        denomLabel: 'Dénomination',
        options: {
          catholique: 'Catholique',
          protestant: 'Protestant',
          evangelique: 'Évangélique',
          pentecotiste: 'Pentecôtiste',
          autre: 'Autre'
        }
      },
      q5: {
        title: 'Depuis quand marches-tu avec Christ ?',
        options: {
          new: 'Je viens de commencer (moins d’1 an)',
          few_years: 'Depuis quelques années (1 à 5 ans)',
          long: 'Depuis longtemps (5 à 15 ans)',
          very_long: 'Depuis très longtemps (15 ans et plus)',
          undecided: 'Je ne suis pas encore décidé'
        }
      },
      q6: {
        title: '{name}, où en es-tu avec Jésus aujourd’hui ?',
        options: {
          growing: 'Je suis chrétien et je veux grandir',
          new_convert: 'Je viens de donner ma vie à Christ',
          seeker: 'Je cherche, je découvre la foi',
          returning: 'Je reviens après une pause'
        }
      },
      q7: {
        title: 'Quand tu ouvres la Bible, tu te sens…',
        options: {
          lost: 'Un peu perdu, je ne sais pas par où commencer',
          struggling: 'Je lis mais j’ai du mal à comprendre',
          comfortable: 'Je comprends bien quand je lis',
          can_teach: 'Je peux expliquer et enseigner aux autres'
        }
      },
      q8: {
        title: 'Lesquels de ces livres saurais-tu retrouver facilement ?',
        hint: 'Plusieurs réponses possibles.',
        options: {
          gospels: 'Les Évangiles (Matthieu, Marc, Luc, Jean)',
          psalms: 'Les Psaumes',
          epistles: 'Les épîtres de Paul (Romains, Corinthiens…)',
          prophets: 'Les prophètes (Ésaïe, Jérémie…)',
          revelation: 'L’Apocalypse',
          lost: 'Honnêtement, j’ai du mal à m’y retrouver'
        }
      },
      q9: {
        title: 'En ce moment, à quelle fréquence lis-tu la Bible ?',
        options: {
          never: 'Presque jamais',
          sometimes: 'De temps en temps',
          weekly: 'Quelques fois par semaine',
          daily: 'Tous les jours'
        }
      },
      q10: {
        title: 'Qu’est-ce qui t’intéresse le plus ?',
        options: {
          basics: 'Apprendre les bases, les histoires de la Bible',
          application: 'Appliquer la Parole à ma vie quotidienne',
          meaning: 'Comprendre le sens profond, le contexte',
          theology: 'Étudier la doctrine et la théologie'
        }
      },
      q11: {
        title: '{name}, qu’est-ce qui t’empêche le plus de grandir spirituellement ?',
        options: {
          regularity: 'Le manque de régularité',
          understanding: 'La compréhension de ce que je lis',
          motivation: 'La motivation qui retombe',
          hardship: 'Une période difficile que je traverse',
          evangelism: 'Évangéliser autour de moi'
        }
      },
      q12: {
        title: 'Quand préfères-tu avoir ton temps avec Dieu ?',
        options: {
          morning: 'Le matin (avant ma journée)',
          noon: 'La pause de midi',
          evening: 'Le soir (après ma journée)',
          night: 'La nuit (quand tout est calme)'
        }
      },
      q13: {
        title: 'Combien de temps peux-tu donner à Dieu chaque jour ?',
        options: {
          5: '5 minutes (c’est déjà ça)',
          15: '10 à 15 minutes',
          25: '20 à 30 minutes',
          30: 'Plus de 30 minutes'
        }
      }
    },
    levels: {
      decouverte: 'Découverte',
      croissance: 'Croissance',
      affermi: 'Affermi',
      profond: 'Profond'
    },
    pillars: {
      immersion: 'Immersion',
      sanctuaire: 'Le Sanctuaire',
      ancre: 'L’Ancre',
      phare: 'Le Phare'
    },
    profiles: {
      source: {
        name: 'La Source',
        description: 'Tu es à la source. Quelque chose de neuf commence en toi, et c’est précieux. Abide va t’accompagner pas à pas pour découvrir la Parole, sans pression, à ton rythme. Chaque jour, une goutte. Et bientôt, une rivière.'
      },
      marcheur: {
        name: 'Le Marcheur',
        description: 'Tu marches avec Christ depuis un moment, et tu veux avancer avec constance. Abide va t’aider à transformer ta foi en habitude quotidienne — pas par obligation, mais par désir. Un pas après l’autre, chaque jour compte.'
      },
      explorateur: {
        name: 'L’Explorateur',
        description: 'Tu ne te contentes pas de lire — tu veux comprendre. Le contexte, le sens, la profondeur. Abide met à ta disposition un guide pour creuser la Parole, explorer les passages et découvrir des trésors que tu n’avais pas vus.'
      },
      veilleur: {
        name: 'Le Veilleur',
        description: 'Tu traverses une saison difficile, et tu cherches Sa présence dans la nuit. Abide veille avec toi. Des prières, des passages qui consolent, un espace pour déposer ce qui pèse. Tu n’es pas seul. La lumière brille dans les ténèbres.'
      },
      porteur: {
        name: 'Le Porteur',
        description: 'Tu portes une lumière, et tu veux la partager. Abide te donne les outils pour évangéliser avec assurance et amour : des ressources, des paroles, des parcours pour guider ceux qui cherchent. Va, et porte la Bonne Nouvelle.'
      }
    },
    reveal: {
      youAre: '{name}, tu es',
      yourLevel: 'Ton niveau',
      yourPillar: 'Ton point de départ',
      consent: 'J’accepte que mes réponses servent, de façon anonymisée et agrégée, à améliorer Abide et ses statistiques. Voir la politique de confidentialité.',
      start: 'Commencer mon parcours'
    }
  },
  bible: {
    title: 'La Bible',
    oldTestament: 'Ancien Testament',
    newTestament: 'Nouveau Testament',
    chapters: 'chapitres',
    chapter: 'chapitre',
    chapterLabel: 'Chapitre {n}',
    versions: 'Versions',
    downloadedVersions: 'Versions téléchargées',
    addVersion: 'Ajouter une version',
    storeComingSoon: 'Le store des versions arrive bientôt.',
    loading: 'Ouverture de la Bible…',
    empty: 'Aucun verset trouvé.',
    textSettings: 'Affichage du texte',
    readerSettings: 'Réglages de lecture',
    fontSize: 'Taille du texte',
    font: 'Police',
    theme: 'Thème',
    themeSystem: 'Système',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    previousChapter: 'Chapitre précédent',
    nextChapter: 'Chapitre suivant',
    bookmark: 'Signet',
    bookmarked: 'Enregistré',
    markRead: 'Marquer comme lu',
    readDone: 'Lu',
    bookmarkChapter: 'Ajouter ce chapitre aux signets',
    search: {
      title: 'Rechercher un livre',
      placeholder: 'Nom d’un livre…',
      noResults: 'Aucun livre ne correspond à « {query} ».'
    },
    actions: {
      copy: 'Copier',
      highlight: 'Surligner',
      save: 'Sauvegarder',
      ai: 'Guide IA',
      share: 'Partager',
      copied: 'Copié dans le presse-papier',
      saved: 'Verset surligné',
      copyError: 'Impossible de copier',
      clearHighlight: 'Retirer le surlignage',
      comingSoon: 'Bientôt disponible'
    },
    audio: {
      listen: 'Écouter ce chapitre',
      play: 'Lecture',
      pause: 'Pause',
      speed: 'Vitesse de lecture',
      back15: 'Reculer de 15 secondes',
      fwd15: 'Avancer de 15 secondes',
      loading: 'Chargement de l’audio…',
      unavailable: 'Audio indisponible pour cette version.',
      noTimestamps: 'Audio disponible, mais sans surlignage des versets pour ce passage.',
      error: 'Lecture impossible. Vérifie ta connexion.',
      progress: 'Progression de la lecture',
      expand: 'Agrandir le lecteur',
      collapse: 'Réduire le lecteur',
      download: 'Télécharger ce livre',
      downloading: 'Téléchargement en cours…',
      downloaded: 'Téléchargé — lisible hors ligne',
      deleteDownload: 'Supprimer le téléchargement',
      deleteConfirm: 'Supprimer l’audio téléchargé de ce livre ? Tu pourras le retélécharger à tout moment.',
      deleted: 'Téléchargement supprimé',
      downloadError: 'Téléchargement impossible. Vérifie ta connexion et réessaie.',
      myDownloads: 'Mes téléchargements',
      bgMusic: 'Musique de fond',
      on: 'ON',
      off: 'OFF',
      totalUsed: '{count} livre(s) — {size}',
      noDownloads: 'Aucun livre audio téléchargé. Le cercle ⬇ dans le lecteur permet d’écouter hors ligne.',
      webOnly: 'Le téléchargement est disponible sur l’application mobile.'
    },
    store: {
      title: 'Versions de la Bible',
      intro: 'Télécharge des versions pour les lire hors ligne. Une fois téléchargée, une version reste disponible sans connexion.',
      bundled: 'Incluse',
      active: 'Active',
      select: 'Choisir',
      download: 'Télécharger',
      downloading: 'Téléchargement en cours…',
      downloaded: 'Version téléchargée',
      downloadError: 'Échec du téléchargement',
      switched: 'Version activée',
      switchError: 'Impossible de changer de version',
      offline: 'Catalogue indisponible (hors ligne).'
    }
  },
  home: {
    tab: 'Accueil',
    greeting: 'Bonjour {name}',
    greetingNoName: 'Bonjour',
    verseOfDay: 'Verset du jour',
    meditateWithGuide: 'Méditer avec le Guide'
  },
  streak: {
    days: '{n} jour | {n} jour | {n} jours',
    msg: {
      start: 'C’est un début. Reviens demain pour entretenir la flamme.',
      keep: 'Belle régularité, continue comme ça !',
      week: 'Une semaine entière — ta persévérance porte du fruit.',
      month: 'Un mois de fidélité. Quelle constance, bravo !'
    }
  },
  plan: {
    title: 'Plan de lecture',
    setupTitle: 'Nouveau plan',
    noPlan: 'Aucun plan en cours. Commence un parcours de lecture.',
    start: 'Commencer un plan',
    startNew: 'Commencer un nouveau plan',
    completed: 'Plan terminé, félicitations !',
    dayOf: 'Jour {day} / {total}',
    change: 'Changer',
    markRead: 'Marquer comme lu',
    dayDone: 'Jour validé — à demain !',
    duration: 'Durée',
    days: '{n} jour | {n} jour | {n} jours',
    scope: 'Contenu',
    scopes: {
      full: 'Toute la Bible',
      ot: 'Ancien Testament',
      nt: 'Nouveau Testament',
      psalms: 'Les Psaumes',
      book: 'Un livre précis'
    },
    create: 'Créer mon plan',
    replace: 'Remplacer le plan',
    replaceWarn: 'Ton plan actuel sera remplacé. Ta progression de lecture est conservée.',
    choose: {
      title: 'Choisir un plan',
      current: 'Plan en cours : {title}',
      forYou: 'Pour toi',
      profileCard: 'Plan selon ton profil',
      profileDesc: 'Abide te propose une lecture adaptée à ton cheminement.',
      journeys: 'Parcours',
      own: 'Créer le mien',
      customCard: 'Plan sur mesure',
      customDesc: 'Choisis le contenu et la durée.'
    },
    profileTitles: {
      source: 'À la source — l’Évangile de Jean',
      marcheur: 'Le Marcheur — tout le Nouveau Testament',
      explorateur: 'L’Explorateur — l’épître aux Romains',
      veilleur: 'Le Veilleur — les Psaumes',
      porteur: 'Le Porteur — les Actes des Apôtres'
    },
    presets: {
      knowJesus: {
        title: 'Connaître Jésus',
        desc: 'Sa vie, de la crèche à la résurrection.'
      }
    },
    custom: {
      title: 'Plan sur mesure',
      pickBook: 'Choisir un livre',
      customDays: 'Durée personnalisée'
    }
  },
  plus: {
    tab: 'Plus',
    title: 'Plus',
    myNotes: 'Mes notes',
    notes: 'Remarques',
    bookmarks: 'Signets',
    highlights: 'Surlignés',
    emptyBookmarks: 'Aucun chapitre enregistré pour l’instant.',
    emptyHighlights: 'Aucun verset surligné pour l’instant.'
  },
  notes: {
    title: 'Note',
    empty: 'Aucune note pour l’instant. Touche + pour en créer une.',
    new: 'Nouvelle note',
    untitled: 'Sans titre',
    titlePlaceholder: 'Titre',
    bodyPlaceholder: "Écris ta note… tape {'@'} pour citer un passage.",
    tagHint: "Astuce : tape {'@'} pour taguer un verset ou un passage.",
    toggleVerses: 'Afficher / masquer le texte des versets',
    readMode: 'Lecture / édition',
    defaultAiTitle: 'Note du Guide',
    aiBadge: 'Guide',
    exportedFromAi: 'Note créée depuis le Guide',
    picker: {
      chooseBook: 'Choisir un livre',
      verseHint: 'Choisis le verset de départ (et de fin, optionnel).',
      from: 'Du verset',
      to: 'Au verset',
      insert: 'Insérer'
    }
  },
  settings: {
    title: 'Paramètres',
    appearance: 'Apparence',
    theme: 'Thème',
    themeDark: 'Sombre',
    themeLight: 'Clair',
    themeSystem: 'Système',
    language: 'Langue',
    french: 'Français',
    english: 'Anglais',
    bibleReading: 'Lecture de la Bible',
    bibleFont: 'Police',
    bibleFontSize: 'Taille du texte',
    account: 'Compte',
    signedInAs: 'Connecté en tant que',
    changePassword: 'Modifier le mot de passe',
    logout: 'Se déconnecter',
    logoutConfirm: 'Veux-tu vraiment te déconnecter ?',
    manageAccount: 'Gestion du compte',
    guestMode: 'Mode invité',
    guestHint: 'Connecte-toi pour sauvegarder et synchroniser tes données.',
    signIn: 'Se connecter',
    about: 'À propos',
    faq: 'Questions fréquentes',
    terms: 'Conditions d’utilisation',
    privacy: 'Politique de confidentialité',
    version: 'Version',
    cancel: 'Annuler',
    darkMode: 'Mode sombre',
    // Vue Profil
    profileTitle: 'Profil',
    myInfo: 'Mes informations',
    guestProfileHint: 'Tu explores Abide en invité. Connecte-toi pour retrouver ton profil sur tous tes appareils.',
    fieldName: 'Nom',
    fieldEmail: 'E-mail',
    fieldProfile: 'Profil spirituel',
    fieldLevel: 'Niveau biblique',
    fieldChurch: 'Église',
    fieldDenomination: 'Confession',
    fieldLocation: 'Lieu',
    fieldFaithStage: 'Cheminement',
    memberSince: 'Membre depuis {date}',
    // Gestion du compte / suppression (parcours volontairement exigeant)
    manageTitle: 'Gestion du compte',
    dangerZone: 'Zone sensible',
    deleteAccount: 'Supprimer mon compte',
    deleteTitle: 'Supprimer définitivement le compte',
    deleteWarning: 'Cette action est irréversible. Seront définitivement supprimés :',
    deleteItem1: 'Ton profil et tes informations personnelles',
    deleteItem2: 'Ta progression de lecture, tes séries et tes plans',
    deleteItem3: 'Tes prières, notes, surlignages et signets',
    deleteItem4: 'Tout ton historique avec le guide IA',
    deleteConfirmHint: 'Pour confirmer, écris {word} ci-dessous.',
    deleteConfirmWord: 'SUPPRIMER',
    deletePlaceholder: 'Écris {word}',
    deleteButton: 'Supprimer définitivement',
    deleting: 'Suppression en cours…',
    deleteError: 'La suppression a échoué. Vérifie ta connexion et réessaie.',
    deleteSuccess: 'Ton compte a été supprimé. À bientôt, peut-être.'
  }
}
