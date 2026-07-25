/* English translations — Abide */
export default {
  common: {
    appName: 'Abide',
    continue: 'Continue',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    back: 'Back',
    skip: 'Skip',
    loading: 'Loading…',
    or: 'or',
    close: 'Close'
  },
  ai: {
    title: 'Guide',
    newConversation: 'New conversation',
    emptyState: 'No conversations yet. Start a new one.',
    emptyChatHint: 'Ask about a passage, a struggle, a biblical theme…',
    chooseMode: 'Choose how you’d like to talk:',
    placeholder: 'Type your message…',
    send: 'Send',
    offlineNotice: 'The Guide requires an internet connection.',
    disclaimer: 'The Guide is a reflection aid; it does not replace your pastor or a mentor.',
    sources: 'Sources',
    copy: 'Copy message',
    edit: 'Edit message',
    selectText: 'Select text',
    exportToNote: 'Export to note',
    regenerate: 'Regenerate answer',
    messageActions: 'Message actions',
    changeMode: 'Change mode',
    resend: 'Resend',
    renameTitle: 'Rename conversation',
    renamePlaceholder: 'Conversation title',
    history: 'My conversations',
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    deleteConfirm: 'Delete this conversation? This cannot be undone.',
    error: 'Something went wrong. Please try again.',
    modes: {
      enseignement: 'Teaching',
      etude: 'Study',
      predication: 'Preaching',
      meditation: 'Meditation',
      theologie: 'Theology'
    }
  },
  quiz: {
    button: 'Quiz',
    title: 'Chapter quiz',
    intro: 'Five questions on {book} {chapter} to check what you remember.',
    generating: 'Preparing your quiz…',
    offline: 'The quiz requires an internet connection.',
    error: 'Could not generate the quiz. Please try again.',
    question: 'Question {current} / {total}',
    next: 'Next',
    seeResults: 'See my result',
    correct: 'Correct!',
    incorrect: 'Not quite.',
    scoreLine: '{score} / {total} correct',
    passTitle: 'Chapter learned!',
    perfectTitle: 'Chapter mastered!',
    failTitle: 'Almost there!',
    failHint: 'You need at least 3 correct answers. Re-read the chapter and try again.',
    newBest: 'New best on this chapter!',
    retry: 'Retry quiz',
    close: 'Close',
    star: 'star | star | stars'
  },
  sanctuaire: {
    title: 'Sanctuary',
    moment: {
      morningTitle: 'Morning prayer',
      eveningTitle: 'Evening prayer',
      morningGreeting: 'Good morning',
      eveningGreeting: 'Good evening',
      morningHint: 'Start your day with God.',
      eveningHint: 'Lay your day in his hands.',
      doneHint: 'Done for today. Thank you for coming.',
      morningPrayer: 'Morning prayer',
      eveningPrayer: 'Evening prayer',
      subjects: 'My prayer requests',
      aiPrayer: 'Personalized prayer',
      aiPrefill: 'Help me pray from this verse: {reference} — “{verse}”',
      amen: 'Amen',
      doneToday: 'Prayed today',
      amenToast: 'May God’s peace go with you. 🙏'
    },
    journal: {
      title: 'Prayer journal',
      placeholder: 'A prayer request…',
      add: 'Add',
      empty: 'No requests yet. Bring to God what weighs on your heart.',
      emptyHint: 'Add your prayer requests.',
      swipeHint: 'Swipe a request to mark it answered ✓ or delete it.',
      answeredTitle: 'Answered prayers',
      answeredToast: 'Glory to God! Another answered prayer. 🙌'
    },
    fasting: {
      title: 'Fasting',
      activeLabel: 'Active fast',
      todayLabel: 'Fasting today',
      nextLabel: 'Next fast',
      dayOf: 'Day {day} of {total}',
      ongoingToday: '{fast} is happening today.',
      nextIn: '{fast} in {days} days',
      startsIn: 'Starts in {days} days',
      join: 'I’m joining',
      joinedToast: 'May God strengthen you through this fast. 🕊️',
      leave: 'Leave the fast',
      leaveTitle: 'Leave the fast?',
      leaveConfirm: 'You can rejoin anytime. Reminders will be turned off.',
      personalTitle: 'Personal fast',
      personalDesc: 'Start your own fast whenever you wish.',
      nDays: '{n} days',
      startPersonal: 'Start my fast',
      historyTitle: 'History',
      todayIs: 'Today'
    },
    fasts: {
      january: { title: 'January fast', desc: '21 days set apart to seek God at the start of the year (Daniel fast).' },
      lent: { title: 'Lent', desc: '40 days of preparation toward Easter.' },
      goodfriday: { title: 'Good Friday', desc: 'A day of reflection, remembering the cross.' },
      advent: { title: 'Advent', desc: 'A season of preparation toward Christmas.' },
      personal: { title: 'Personal fast', desc: 'Your fast, at your own pace.' }
    },
    notif: {
      morningTitle: 'A moment with God 🌅',
      morningBody: 'Start your day with prayer and the verse of the day.',
      eveningTitle: 'Before the night 🌙',
      eveningBody: 'Take a moment to lay your day before God.',
      fastSoonTitle: '{fast} is coming',
      fastSoonBody: 'Prepare your heart: the fast begins in 3 days.',
      fastTomorrowTitle: '{fast} starts tomorrow',
      fastTomorrowBody: 'Get ready to seek God with all your heart.',
      fastStartTitle: '{fast} starts today',
      fastStartBody: 'Are you joining? Open the Sanctuary to take part.',
      fastOngoingTitle: '{fast} in progress',
      fastOngoingBody: 'There’s still time to join the fast.',
      encourageTitle: 'Fast — day {day}/{total}',
      nearEndTitle: 'The end is near — day {day}/{total}',
      completedTitle: 'Fast completed! 🎉',
      completedBody: 'You made it to the end. May God honor your perseverance.'
      // Streak texts (soft / urgent / lost) live in src/data/streakMessages.js —
      // several variants picked per day, no fixed i18n key here (never repeats).
    }
  },
  welcome: {
    slogan: 'Abide in me, and I in you.',
    reference: 'John 15:4',
    continueGoogle: 'Continue with Google',
    continueEmail: 'Continue with email'
  },
  auth: {
    login: 'Sign in',
    register: 'Create account',
    welcomeBack: 'Welcome back',
    loginSubtitle: 'Let’s get you in to Abide',
    registerTitle: 'Welcome',
    registerSubtitle: 'Create your account to begin',
    googleSignIn: 'Sign in with Google',
    googleSignUp: 'Sign up with Google',
    noAccountQuestion: 'Don’t have an account?',
    haveAccountQuestion: 'Already have an account?',
    forgotTitle: 'Forgot password?',
    email: 'Email address',
    emailPlaceholder: "you{'@'}example.com",
    password: 'Password',
    passwordPlaceholder: '••••••••',
    firstName: 'First name',
    firstNamePlaceholder: 'Your first name',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    signUp: 'Sign up',
    signingUp: 'Creating…',
    magicLink: 'Get a magic link',
    forgotLink: 'Forgot password?',
    noAccount: 'No account yet?',
    haveAccount: 'Already have an account?',
    createAccount: 'Create an account',
    backToLogin: 'Back to sign in',
    minChars: 'At least 8 characters',
    forgotIntro: 'Enter your email address. If an account exists, you will receive a reset code.',
    sendCode: 'Send code',
    sending: 'Sending…',
    verifyTitle: 'Verify your email',
    verifyIntro: 'Enter the 8-digit code sent to {email}.',
    verify: 'Verify',
    verifying: 'Verifying…',
    resendCode: 'Resend code',
    resendIn: 'Resend in {s}s',
    newPasswordTitle: 'New password',
    newPasswordIntro: 'Your new password must be different from previously used passwords.',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    passwordsMatch: 'Passwords match.',
    errors: {
      invalidCredentials: 'Invalid credentials.',
      emailNotConfirmed: 'Your email is not confirmed yet. Check your inbox.',
      emailInUse: 'This email address is already in use.',
      passwordTooShort: 'Password must be at least 8 characters.',
      passwordMismatch: 'Passwords do not match.',
      passwordSameAsOld: 'Your new password must be different from the old one.',
      invalidOtp: 'Invalid or expired code. Try again.'
    },
    strength: {
      tooShort: 'Too short',
      weak: 'Weak',
      ok: 'Okay',
      good: 'Good',
      excellent: 'Excellent'
    }
  },
  onboarding: {
    greeting: 'Hello {name},',
    greetingNoName: 'Hello,',
    welcomeBody: 'welcome to Abide. We’re truly glad to have you here. To personalize your experience as much as possible, we’d like to ask you a few questions about you and your spiritual journey. It will only take a moment.',
    startQuiz: 'Yes, I’d love to',
    laterButton: 'I’ll do it later',
    skipQuiz: 'No thanks, I don’t need an experience made for me',
    quiz: {
      next: 'Continue',
      finish: 'Finish',
      skipQuestion: 'Skip this question',
      ageLabel: 'Age: {age}',
      q1: {
        title: '{name}, what’s your date of birth?',
        hint: 'This helps us support you better.'
      },
      q2: {
        title: 'You are…',
        options: { homme: 'A man', femme: 'A woman' }
      },
      q3: {
        title: 'Where are you writing from?',
        countryLabel: 'Country',
        cityLabel: 'City',
        cityPlaceholder: 'Your city'
      },
      q4: {
        title: 'Do you belong to a church?',
        hint: 'This question is optional.',
        nameLabel: 'Your church name',
        namePlaceholder: 'E.g. New Life Church',
        denomLabel: 'Denomination',
        options: {
          catholique: 'Catholic',
          protestant: 'Protestant',
          evangelique: 'Evangelical',
          pentecotiste: 'Pentecostal',
          autre: 'Other'
        }
      },
      q5: {
        title: 'How long have you been walking with Christ?',
        options: {
          new: 'I just started (less than 1 year)',
          few_years: 'For a few years (1 to 5 years)',
          long: 'For a long time (5 to 15 years)',
          very_long: 'For a very long time (15+ years)',
          undecided: 'I haven’t decided yet'
        }
      },
      q6: {
        title: '{name}, where are you with Jesus today?',
        options: {
          growing: 'I’m a Christian and I want to grow',
          new_convert: 'I just gave my life to Christ',
          seeker: 'I’m searching, discovering faith',
          returning: 'I’m coming back after a break'
        }
      },
      q7: {
        title: 'When you open the Bible, you feel…',
        options: {
          lost: 'A bit lost, I don’t know where to start',
          struggling: 'I read but struggle to understand',
          comfortable: 'I understand well when I read',
          can_teach: 'I can explain and teach others'
        }
      },
      q8: {
        title: 'Which of these books could you find easily?',
        hint: 'Select all that apply.',
        options: {
          gospels: 'The Gospels (Matthew, Mark, Luke, John)',
          psalms: 'The Psalms',
          epistles: 'Paul’s epistles (Romans, Corinthians…)',
          prophets: 'The prophets (Isaiah, Jeremiah…)',
          revelation: 'Revelation',
          lost: 'Honestly, I struggle to find my way around'
        }
      },
      q9: {
        title: 'How often do you read the Bible these days?',
        options: {
          never: 'Almost never',
          sometimes: 'From time to time',
          weekly: 'A few times a week',
          daily: 'Every day'
        }
      },
      q10: {
        title: 'What interests you most?',
        options: {
          basics: 'Learning the basics, the Bible stories',
          application: 'Applying the Word to my daily life',
          meaning: 'Understanding the deeper meaning and context',
          theology: 'Studying doctrine and theology'
        }
      },
      q11: {
        title: '{name}, what holds you back the most spiritually?',
        options: {
          regularity: 'Lack of consistency',
          understanding: 'Understanding what I read',
          motivation: 'Motivation that fades',
          hardship: 'A difficult season I’m going through',
          evangelism: 'Sharing my faith with others'
        }
      },
      q12: {
        title: 'When do you prefer your time with God?',
        options: {
          morning: 'In the morning (before my day)',
          noon: 'At the midday break',
          evening: 'In the evening (after my day)',
          night: 'At night (when all is quiet)'
        }
      },
      q13: {
        title: 'How much time can you give to God each day?',
        options: {
          5: '5 minutes (it’s already something)',
          15: '10 to 15 minutes',
          25: '20 to 30 minutes',
          30: 'More than 30 minutes'
        }
      }
    },
    levels: {
      decouverte: 'Discovery',
      croissance: 'Growth',
      affermi: 'Established',
      profond: 'Deep'
    },
    pillars: {
      immersion: 'Immersion',
      sanctuaire: 'The Sanctuary',
      ancre: 'The Anchor',
      phare: 'The Lighthouse'
    },
    profiles: {
      source: {
        name: 'The Spring',
        description: 'You are at the spring. Something new is beginning in you, and it’s precious. Abide will walk with you step by step to discover the Word, without pressure, at your own pace. Each day, a drop. And soon, a river.'
      },
      marcheur: {
        name: 'The Walker',
        description: 'You’ve been walking with Christ for a while, and you want to move forward steadily. Abide will help you turn your faith into a daily habit — not out of obligation, but out of desire. One step at a time, every day counts.'
      },
      explorateur: {
        name: 'The Explorer',
        description: 'You don’t just read — you want to understand. The context, the meaning, the depth. Abide gives you a guide to dig into the Word, explore passages and discover treasures you hadn’t seen.'
      },
      veilleur: {
        name: 'The Watchman',
        description: 'You’re going through a hard season, and you seek His presence in the night. Abide watches with you. Prayers, comforting passages, a space to lay down what weighs on you. You are not alone. The light shines in the darkness.'
      },
      porteur: {
        name: 'The Bearer',
        description: 'You carry a light, and you want to share it. Abide gives you the tools to evangelize with confidence and love: resources, words, journeys to guide those who are searching. Go, and carry the Good News.'
      }
    },
    reveal: {
      youAre: '{name}, you are',
      yourLevel: 'Your level',
      yourPillar: 'Your starting point',
      consent: 'I agree that my answers may be used, anonymized and aggregated, to improve Abide and its statistics. See the privacy policy.',
      start: 'Start my journey'
    }
  },
  bible: {
    title: 'The Bible',
    oldTestament: 'Old Testament',
    newTestament: 'New Testament',
    chapters: 'chapters',
    chapter: 'chapter',
    chapterLabel: 'Chapter {n}',
    versions: 'Versions',
    downloadedVersions: 'Downloaded versions',
    addVersion: 'Add a version',
    storeComingSoon: 'The version store is coming soon.',
    loading: 'Opening the Bible…',
    empty: 'No verses found.',
    textSettings: 'Text display',
    readerSettings: 'Reading settings',
    fontSize: 'Text size',
    font: 'Font',
    theme: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    previousChapter: 'Previous chapter',
    nextChapter: 'Next chapter',
    bookmark: 'Bookmark',
    bookmarked: 'Saved',
    markRead: 'Mark as read',
    readDone: 'Read',
    bookmarkChapter: 'Bookmark this chapter',
    search: {
      title: 'Search for a book',
      placeholder: 'Book name…',
      noResults: 'No book matches “{query}”.'
    },
    actions: {
      copy: 'Copy',
      highlight: 'Highlight',
      save: 'Save',
      ai: 'AI Guide',
      share: 'Share',
      copied: 'Copied to clipboard',
      saved: 'Verse highlighted',
      copyError: 'Could not copy',
      clearHighlight: 'Remove highlight',
      comingSoon: 'Coming soon'
    },
    audio: {
      listen: 'Listen to this chapter',
      play: 'Play',
      pause: 'Pause',
      speed: 'Playback speed',
      back15: 'Back 15 seconds',
      fwd15: 'Forward 15 seconds',
      loading: 'Loading audio…',
      unavailable: 'Audio not available for this version.',
      noTimestamps: 'Audio available, but no verse highlighting for this passage.',
      error: 'Playback failed. Check your connection.',
      progress: 'Playback progress',
      expand: 'Expand player',
      collapse: 'Collapse player',
      download: 'Download this book',
      downloading: 'Downloading…',
      downloaded: 'Downloaded — available offline',
      deleteDownload: 'Delete download',
      deleteConfirm: 'Delete the downloaded audio for this book? You can download it again anytime.',
      deleted: 'Download deleted',
      downloadError: 'Download failed. Check your connection and try again.',
      myDownloads: 'My downloads',
      bgMusic: 'Background music',
      on: 'ON',
      off: 'OFF',
      totalUsed: '{count} book(s) — {size}',
      noDownloads: 'No audio books downloaded. The ⬇ circle in the player lets you listen offline.',
      webOnly: 'Downloads are available in the mobile app.'
    },
    store: {
      title: 'Bible versions',
      intro: 'Download versions to read them offline. Once downloaded, a version stays available without a connection.',
      bundled: 'Included',
      active: 'Active',
      select: 'Select',
      download: 'Download',
      downloading: 'Downloading…',
      downloaded: 'Version downloaded',
      downloadError: 'Download failed',
      switched: 'Version activated',
      switchError: 'Could not switch version',
      offline: 'Catalog unavailable (offline).'
    }
  },
  home: {
    tab: 'Home',
    greeting: 'Hello {name}',
    greetingNoName: 'Hello',
    verseOfDay: 'Verse of the day',
    meditateWithGuide: 'Meditate with the Guide'
  },
  streak: {
    days: '{n} days | {n} day | {n} days',
    msg: {
      start: 'It’s a start. Come back tomorrow to keep the flame alive.',
      keep: 'Great consistency, keep it up!',
      week: 'A whole week — your perseverance bears fruit.',
      month: 'A month of faithfulness. What consistency, well done!'
    }
  },
  plan: {
    title: 'Reading plan',
    setupTitle: 'New plan',
    noPlan: 'No active plan. Start a reading journey.',
    start: 'Start a plan',
    startNew: 'Start a new plan',
    completed: 'Plan completed, congratulations!',
    dayOf: 'Day {day} / {total}',
    change: 'Change',
    markRead: 'Mark as read',
    dayDone: 'Day done — see you tomorrow!',
    duration: 'Duration',
    days: '{n} day | {n} day | {n} days',
    scope: 'Content',
    scopes: {
      full: 'The whole Bible',
      ot: 'Old Testament',
      nt: 'New Testament',
      psalms: 'The Psalms',
      book: 'A specific book'
    },
    create: 'Create my plan',
    replace: 'Replace plan',
    replaceWarn: 'Your current plan will be replaced. Your reading progress is kept.',
    choose: {
      title: 'Choose a plan',
      current: 'Active plan: {title}',
      forYou: 'For you',
      profileCard: 'Plan for your profile',
      profileDesc: 'Abide suggests a reading tailored to your journey.',
      journeys: 'Journeys',
      own: 'Create your own',
      customCard: 'Custom plan',
      customDesc: 'Choose the content and duration.'
    },
    profileTitles: {
      source: 'At the spring — the Gospel of John',
      marcheur: 'The Walker — the whole New Testament',
      explorateur: 'The Explorer — the letter to the Romans',
      veilleur: 'The Watchman — the Psalms',
      porteur: 'The Bearer — the Acts of the Apostles'
    },
    presets: {
      knowJesus: {
        title: 'Getting to know Jesus',
        desc: 'His life, from the manger to the resurrection.'
      }
    },
    custom: {
      title: 'Custom plan',
      pickBook: 'Choose a book',
      customDays: 'Custom duration'
    }
  },
  plus: {
    tab: 'More',
    title: 'More',
    myNotes: 'My notes',
    notes: 'Notes',
    bookmarks: 'Bookmarks',
    highlights: 'Highlights',
    emptyBookmarks: 'No saved chapters yet.',
    emptyHighlights: 'No highlighted verses yet.'
  },
  notes: {
    title: 'Note',
    empty: 'No notes yet. Tap + to create one.',
    new: 'New note',
    untitled: 'Untitled',
    titlePlaceholder: 'Title',
    bodyPlaceholder: "Write your note… type {'@'} to cite a passage.",
    tagHint: "Tip: type {'@'} to tag a verse or passage.",
    toggleVerses: 'Show / hide verse text',
    readMode: 'Read / edit',
    defaultAiTitle: 'Guide note',
    aiBadge: 'Guide',
    exportedFromAi: 'Note created from the Guide',
    picker: {
      chooseBook: 'Choose a book',
      verseHint: 'Pick the starting verse (and end, optional).',
      from: 'From verse',
      to: 'To verse',
      insert: 'Insert'
    }
  },
  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeSystem: 'System',
    language: 'Language',
    french: 'French',
    english: 'English',
    bibleReading: 'Bible reading',
    bibleFont: 'Font',
    bibleFontSize: 'Text size',
    account: 'Account',
    signedInAs: 'Signed in as',
    changePassword: 'Change password',
    logout: 'Sign out',
    logoutConfirm: 'Do you really want to sign out?',
    manageAccount: 'Manage account',
    guestMode: 'Guest mode',
    guestHint: 'Sign in to save and sync your data.',
    signIn: 'Sign in',
    about: 'About',
    faq: 'FAQ',
    terms: 'Terms of use',
    privacy: 'Privacy policy',
    version: 'Version',
    cancel: 'Cancel',
    darkMode: 'Dark mode',
    // Profile view
    profileTitle: 'Profile',
    myInfo: 'My information',
    guestProfileHint: 'You’re exploring Abide as a guest. Sign in to keep your profile across all your devices.',
    fieldName: 'Name',
    fieldEmail: 'Email',
    fieldProfile: 'Spiritual profile',
    fieldLevel: 'Bible level',
    fieldChurch: 'Church',
    fieldDenomination: 'Denomination',
    fieldLocation: 'Location',
    fieldFaithStage: 'Faith journey',
    memberSince: 'Member since {date}',
    manageTitle: 'Manage account',
    dangerZone: 'Danger zone',
    deleteAccount: 'Delete my account',
    deleteTitle: 'Permanently delete account',
    deleteWarning: 'This action cannot be undone. The following will be permanently deleted:',
    deleteItem1: 'Your profile and personal information',
    deleteItem2: 'Your reading progress, streaks and plans',
    deleteItem3: 'Your prayers, notes, highlights and bookmarks',
    deleteItem4: 'Your entire history with the AI guide',
    deleteConfirmHint: 'To confirm, type {word} below.',
    deleteConfirmWord: 'DELETE',
    deletePlaceholder: 'Type {word}',
    deleteButton: 'Delete permanently',
    deleting: 'Deleting…',
    deleteError: 'Deletion failed. Check your connection and try again.',
    deleteSuccess: 'Your account has been deleted. Perhaps see you again.'
  }
}
