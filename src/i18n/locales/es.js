/* Traducciones al español, Abide */
export default {
  // Firma estampada al pie de las imágenes compartidas (versículo del día Y
  // versículo elegido). El nombre debe ser IDÉNTICO al de la ficha de Play Store
  // para que una búsqueda desde la imagen encuentre la aplicación.
  imageSignature: {
    appName: 'Abide : Biblia y Guía IA',
    store: 'En Google Play'
  },
  common: {
    appName: 'Abide',
    continue: 'Continuar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    back: 'Volver',
    skip: 'Omitir',
    loading: 'Cargando…',
    or: 'o',
    close: 'Cerrar'
  },
  ai: {
    title: 'Guía',
    newConversation: 'Nueva conversación',
    emptyState: 'Aún no hay conversaciones. Empieza una nueva.',
    emptyChatHint: 'Haz tu pregunta sobre un pasaje, una dificultad, un tema bíblico…',
    chooseMode: 'Elige una forma de conversar:',
    placeholder: 'Escribe tu mensaje…',
    send: 'Enviar',
    offlineNotice: 'El Guía necesita conexión a internet.',
    disclaimer: 'El Guía es una ayuda para reflexionar, no reemplaza a tu pastor ni a un acompañante.',
    sources: 'Fuentes',
    copy: 'Copiar el mensaje',
    edit: 'Editar el mensaje',
    selectText: 'Seleccionar texto',
    exportToNote: 'Exportar como nota',
    regenerate: 'Regenerar la respuesta',
    messageActions: 'Acciones del mensaje',
    changeMode: 'Cambiar de modo',
    resend: 'Reenviar',
    renameTitle: 'Renombrar la conversación',
    renamePlaceholder: 'Título de la conversación',
    history: 'Mis conversaciones',
    morning: 'Buenos días',
    afternoon: 'Buenas tardes',
    evening: 'Buenas noches',
    deleteConfirm: '¿Eliminar esta conversación? Esta acción es definitiva.',
    error: 'Ocurrió un error. Inténtalo de nuevo.',
    // Cuota diaria alcanzada: no es un error, es una invitación.
    quotaReached: 'Hoy hemos conversado mucho. Vuelve mañana, o únete a Abide Plus para seguir conversando con el Guía.',
    quotaReachedNamed: '{name}, hoy hemos conversado mucho. Vuelve mañana, o únete a Abide Plus para seguir conversando con el Guía.',
    quotaReachedPremium: 'Alcanzaste el límite de 50 mensajes por hoy. Vuelve mañana, el Guía estará aquí.',
    quotaCta: 'Abide Plus',
    // Invitado que intenta escribir al Guía: invitación clara, sin error técnico.
    authRequiredTitle: 'Se necesita una cuenta',
    authRequiredMsg: 'El Guía necesita saber con quién habla para acompañarte y mantener el hilo de sus conversaciones. Crea tu cuenta en unos segundos: tu pregunta se queda aquí, solo tendrás que enviarla.',
    authRequiredCta: 'Crear mi cuenta',
    modes: {
      enseignement: 'Enseñanza',
      etude: 'Estudio',
      predication: 'Predicación',
      meditation: 'Meditación',
      theologie: 'Teología'
    }
  },
  quiz: {
    button: 'Quiz IA',
    title: 'Quiz del capítulo',
    // Mención explícita: las preguntas son generadas, no escritas de antemano.
    aiBadge: 'IA',
    aiHint: 'Preguntas generadas por la IA a partir del texto de este capítulo.',
    intro: 'Cinco preguntas sobre {book} {chapter} para comprobar lo que recuerdas.',
    generating: 'Preparando tu quiz…',
    offline: 'El quiz necesita conexión a internet.',
    error: 'No se pudo generar el quiz. Inténtalo de nuevo.',
    // Cuota diaria alcanzada: no es una falla, es una invitación.
    quotaReached: 'Ya hiciste tus quiz de hoy. Vuelve mañana, o únete a Abide Plus para quiz sin límite.',
    quotaCta: 'Abide Plus',
    question: 'Pregunta {current} / {total}',
    next: 'Siguiente',
    seeResults: 'Ver mi resultado',
    correct: '¡Respuesta correcta!',
    incorrect: 'No es eso.',
    scoreLine: '{score} / {total} respuestas correctas',
    passTitle: '¡Capítulo asimilado!',
    perfectTitle: '¡Capítulo dominado!',
    failTitle: '¡Casi!',
    failHint: 'Necesitas al menos 3 respuestas correctas. Vuelve a leer el capítulo e inténtalo otra vez.',
    newBest: '¡Nuevo récord en este capítulo!',
    retry: 'Repetir el quiz',
    close: 'Cerrar',
    star: 'estrella | estrella | estrellas'
  },
  referral: {
    title: 'Invitaciones',
    heading: 'Invita a tus seres queridos a Abide',
    description: 'Comparte tu enlace. Cuando tus seres queridos instalen la app y creen una cuenta, desbloqueas premium, sin pagar nada.',
    share: 'Compartir mi enlace',
    shareMessage: 'Únete a mí en Abide, una app para leer la Biblia y orar cada día 🙏 {link}',
    linkCopied: 'Enlace copiado al portapapeles',
    referralCount: '{count} invitado | {count} invitado | {count} invitados',
    daysShort: '{days} d',
    nextTierHint: 'Falta {remaining} invitado para {days} días de premium | Faltan {remaining} invitados para {days} días de premium',
    allTiersReached: '¡Alcanzaste todos los niveles!',
    premiumActiveUntil: 'Premium activo hasta el {date} (invitaciones)'
  },
  premium: {
    title: 'Abide Plus',
    heading: 'Profundiza tu caminar con Abide Plus',
    headingNamed: '{name}, profundiza tu caminar con Abide Plus',
    subtitle: 'Un tiempo con Dios sin interrupciones, y un Guía más disponible para tus preguntas.',
    featuresLabel: 'Lo que recibes',
    featureNoAds: 'Sin publicidad, en ninguna parte de la app',
    featureAi: 'El Guía hasta {premium} mensajes al día (en lugar de {free})',
    featureQuiz: 'Quiz bíblicos sin límite',
    featureSupport: 'Apoyas la misión de Abide',
    freeNote: 'La Biblia, su audio y la oración siguen siendo gratis para todos, siempre.',
    perMonth: '{price} / mes',
    subscribe: 'Unirme a Abide Plus',
    processing: 'Un momento…',
    restore: 'Restaurar compras',
    legal: 'Suscripción mensual renovada automáticamente por Google Play. Puedes cancelarla en cualquier momento desde Google Play, el acceso sigue activo hasta el final del período pagado.',
    terms: 'Condiciones de uso',
    privacy: 'Privacidad',
    loginRequired: 'Inicia sesión para unirte a Abide Plus: tu suscripción quedará vinculada a tu cuenta.',
    login: 'Iniciar sesión',
    loadingOffer: 'Cargando la oferta…',
    unavailable: 'La suscripción no está disponible por ahora. Revisa tu conexión e inténtalo de nuevo.',
    retry: 'Reintentar',
    activeTitle: 'Formas parte de Abide Plus',
    activeTitleNamed: '{name}, formas parte de Abide Plus',
    activeUntil: 'Acceso activo hasta el {date}',
    activeReferral: 'Regalado gracias a tus invitaciones, hasta el {date}. Puedes suscribirte para continuar después.',
    manage: 'Gestionar mi suscripción',
    thanks: '¡Gracias! Bienvenido a Abide Plus.',
    thanksNamed: '¡Gracias {name}! Bienvenido a Abide Plus.',
    pending: 'Pago recibido. La activación puede tardar unos minutos, no tienes que hacer nada más.',
    restored: 'Tu suscripción ha sido restaurada.',
    nothingToRestore: 'No se encontró ninguna suscripción activa para esta cuenta.',
    error: 'El pago no se completó. Revisa tu conexión e inténtalo de nuevo.',
    restoreError: 'La restauración falló. Revisa tu conexión e inténtalo de nuevo.',
    discover: 'Descubrir Abide Plus',
    activeBanner: 'Abide Plus está activo',
    badgeLabel: 'Suscriptor de Abide Plus, ver mi suscripción'
  },
  sanctuaire: {
    title: 'Santuario',
    moment: {
      morningTitle: 'Oración de la mañana',
      eveningTitle: 'Oración de la noche',
      morningGreeting: 'Buenos días',
      eveningGreeting: 'Buenas noches',
      morningHint: 'Empieza tu día con Dios.',
      eveningHint: 'Pon tu día en sus manos.',
      doneHint: 'Hecho por hoy. Gracias por venir.',
      morningPrayer: 'Oración de la mañana',
      eveningPrayer: 'Oración de la noche',
      subjects: 'Mis motivos de oración',
      aiPrayer: 'Oración personalizada',
      aiPrefill: 'Ayúdame a orar a partir de este versículo: {reference}, « {verse} »',
      amen: 'Amén',
      doneToday: 'Oración hecha hoy',
      amenToast: 'Que la paz de Dios te acompañe. 🙏'
    },
    journal: {
      title: 'Diario de oración',
      placeholder: 'Un motivo de oración…',
      add: 'Añadir',
      empty: 'Aún no hay motivos. Confía a Dios lo que pesa en tu corazón.',
      emptyHint: 'Confía tus motivos de oración.',
      swipeHint: 'Desliza un motivo para marcarlo como respondido ✓ o eliminarlo.',
      answeredTitle: 'Oraciones respondidas',
      answeredToast: '¡Gloria a Dios! Una oración respondida más. 🙌'
    },
    fasting: {
      title: 'Ayuno',
      activeLabel: 'Ayuno en curso',
      todayLabel: 'Ayuno hoy',
      nextLabel: 'Próximo ayuno',
      dayOf: 'Día {day} de {total}',
      ongoingToday: '{fast} está en curso hoy.',
      nextIn: '{fast} en {days} días',
      startsIn: 'Empieza en {days} días',
      join: 'Participo',
      joinedToast: 'Que Dios te fortalezca durante este ayuno. 🕊️',
      leave: 'Dejar el ayuno',
      leaveTitle: '¿Dejar el ayuno?',
      leaveConfirm: 'Podrás retomarlo en cualquier momento. Los recordatorios se desactivarán.',
      personalTitle: 'Ayuno personal',
      personalDesc: 'Empieza tu propio ayuno cuando quieras.',
      nDays: '{n} días',
      startPersonal: 'Empezar mi ayuno',
      historyTitle: 'Historial',
      todayIs: 'Hoy'
    },
    fasts: {
      january: { title: 'Ayuno de enero', desc: '21 días apartados para buscar a Dios al comienzo del año (ayuno de Daniel).' },
      lent: { title: 'Cuaresma', desc: '40 días de preparación hacia la Pascua.' },
      goodfriday: { title: 'Viernes Santo', desc: 'Día de recogimiento, memoria de la cruz.' },
      advent: { title: 'Adviento', desc: 'Tiempo de preparación hacia la Navidad.' },
      personal: { title: 'Ayuno personal', desc: 'Tu ayuno, a tu ritmo.' }
    },
    notif: {
      morningTitle: 'Un tiempo con Dios 🌅',
      morningBody: 'Empieza tu día con la oración y el versículo del día.',
      eveningTitle: 'Antes de la noche 🌙',
      eveningBody: 'Tómate un momento para poner tu día delante de Dios.',
      fastSoonTitle: '{fast} se acerca',
      fastSoonBody: 'Prepara tu corazón: el ayuno empieza en 3 días.',
      fastTomorrowTitle: '{fast} empieza mañana',
      fastTomorrowBody: 'Prepárate para buscar a Dios con todo tu corazón.',
      fastStartTitle: '{fast} empieza hoy',
      fastStartBody: '¿Participas? Abre el Santuario para unirte al ayuno.',
      fastOngoingTitle: '{fast} en curso',
      fastOngoingBody: 'Todavía estás a tiempo de unirte al ayuno.',
      encourageTitle: 'Ayuno, día {day}/{total}',
      nearEndTitle: 'El final se acerca, día {day}/{total}',
      completedTitle: '¡Ayuno cumplido! 🎉',
      completedBody: 'Llegaste hasta el final. Que Dios honre tu perseverancia.'
      // Los textos de racha (suave / urgente / racha perdida) viven en
      // src/data/streakMessages.js.
    }
  },
  welcome: {
    slogan: 'Permaneced en mí, y yo en vosotros.',
    reference: 'Juan 15.4',
    continueGoogle: 'Continuar con Google',
    continueEmail: 'Continuar con un correo'
  },
  auth: {
    login: 'Iniciar sesión',
    register: 'Crear una cuenta',
    welcomeBack: 'Bienvenido de nuevo',
    loginSubtitle: 'Conéctate a Abide',
    registerTitle: 'Bienvenido',
    registerSubtitle: 'Crea tu cuenta para empezar',
    googleSignIn: 'Iniciar sesión con Google',
    googleSigningIn: 'Conectando…',
    googleSignUp: 'Registrarse con Google',
    noAccountQuestion: 'No tengo cuenta',
    haveAccountQuestion: 'Ya tengo una cuenta',
    forgotTitle: '¿Olvidaste tu contraseña?',
    email: 'Correo electrónico',
    emailPlaceholder: "tu{'@'}ejemplo.com",
    password: 'Contraseña',
    passwordPlaceholder: '••••••••',
    firstName: 'Nombre',
    firstNamePlaceholder: 'Tu nombre',
    signIn: 'Iniciar sesión',
    signingIn: 'Conectando…',
    signUp: 'Registrarse',
    signingUp: 'Creando…',
    magicLink: 'Recibir un enlace mágico',
    forgotLink: '¿Olvidaste tu contraseña?',
    noAccount: '¿Aún no tienes cuenta?',
    haveAccount: '¿Ya tienes una cuenta?',
    createAccount: 'Crear una cuenta',
    backToLogin: 'Volver al inicio de sesión',
    minChars: 'Al menos 8 caracteres',
    forgotIntro: 'Escribe tu correo electrónico. Si hay una cuenta asociada, recibirás un código para restablecer tu contraseña.',
    sendCode: 'Enviar el código',
    sending: 'Enviando…',
    verifyTitle: 'Revisa tu correo',
    verifyIntro: 'Escribe el código de 8 cifras enviado a {email}.',
    verify: 'Verificar',
    verifying: 'Verificando…',
    resendCode: 'Reenviar el código',
    resendIn: 'Reenviar en {s}s',
    newPasswordTitle: 'Nueva contraseña',
    newPasswordIntro: 'Tu nueva contraseña debe ser diferente de la anterior.',
    newPassword: 'Nueva contraseña',
    confirmPassword: 'Confirmar la contraseña',
    passwordsMatch: 'Las contraseñas coinciden.',
    errors: {
      invalidCredentials: 'Credenciales incorrectas.',
      emailNotConfirmed: 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.',
      emailInUse: 'Este correo ya está en uso.',
      passwordTooShort: 'La contraseña debe tener al menos 8 caracteres.',
      passwordMismatch: 'Las contraseñas no coinciden.',
      passwordSameAsOld: 'Tu nueva contraseña debe ser diferente de la anterior.',
      invalidOtp: 'Código incorrecto o vencido. Inténtalo de nuevo.'
    },
    strength: {
      tooShort: 'Demasiado corta',
      weak: 'Débil',
      ok: 'Aceptable',
      good: 'Buena',
      excellent: 'Excelente'
    }
  },
  onboarding: {
    greeting: 'Hola {name},',
    greetingNoName: 'Hola,',
    welcomeBody: 'bienvenido a Abide. Estamos muy felices de recibirte. Para personalizar al máximo tu experiencia, nos gustaría hacerte algunas preguntas sobre ti y tu camino espiritual. Solo tomará un momento.',
    startQuiz: 'Sí, con gusto',
    laterButton: 'Lo haré más tarde',
    skipQuiz: 'No, gracias, no necesito una experiencia hecha para mí',
    referral: {
      title: '¿Te invitó un amigo?',
      body: 'Si alguien te compartió Abide, puedes escribir su código aquí. Si no, simplemente omite este paso.',
      yes: 'Sí',
      no: 'No, continuar',
      placeholder: 'Código de invitación',
      confirm: 'Validar',
      offline: 'Se necesita conexión a internet para validar este código.',
      notFound: 'Este código no corresponde a ninguna invitación. Verifica que esté bien escrito.',
      error: 'Ocurrió un error. Puedes intentarlo de nuevo u omitir este paso.'
    },
    quiz: {
      next: 'Continuar',
      finish: 'Terminar',
      skipQuestion: 'Omitir esta pregunta',
      ageLabel: 'Edad: {age} años',
      q1: {
        title: '{name}, ¿cuál es tu fecha de nacimiento?',
        hint: 'Esto nos ayuda a acompañarte mejor.'
      },
      q2: {
        title: 'Eres…',
        options: { homme: 'Un hombre', femme: 'Una mujer' }
      },
      q3: {
        title: '¿Desde dónde nos escribes?',
        countryLabel: 'País',
        cityLabel: 'Ciudad',
        cityPlaceholder: 'Tu ciudad'
      },
      q4: {
        title: '¿Formas parte de una iglesia?',
        hint: 'Esta pregunta es opcional.',
        nameLabel: 'Nombre de tu iglesia',
        namePlaceholder: 'Ej.: Iglesia Vida Nueva',
        denomLabel: 'Denominación',
        options: {
          catholique: 'Católica',
          protestant: 'Protestante',
          evangelique: 'Evangélica',
          pentecotiste: 'Pentecostal',
          autre: 'Otra'
        }
      },
      q5: {
        title: '¿Desde cuándo caminas con Cristo?',
        options: {
          new: 'Acabo de empezar (menos de 1 año)',
          few_years: 'Desde hace algunos años (1 a 5 años)',
          long: 'Desde hace mucho (5 a 15 años)',
          very_long: 'Desde hace muchísimo (15 años o más)',
          undecided: 'Todavía no me he decidido'
        }
      },
      q6: {
        title: '{name}, ¿cómo estás hoy con Jesús?',
        options: {
          growing: 'Soy cristiano y quiero crecer',
          new_convert: 'Acabo de entregar mi vida a Cristo',
          seeker: 'Estoy buscando, descubro la fe',
          returning: 'Vuelvo después de una pausa'
        }
      },
      q7: {
        title: 'Cuando abres la Biblia, te sientes…',
        options: {
          lost: 'Un poco perdido, no sé por dónde empezar',
          struggling: 'Leo, pero me cuesta entender',
          comfortable: 'Entiendo bien cuando leo',
          can_teach: 'Puedo explicar y enseñar a otros'
        }
      },
      q8: {
        title: '¿Cuáles de estos libros sabrías encontrar fácilmente?',
        hint: 'Puedes elegir varias respuestas.',
        options: {
          gospels: 'Los Evangelios (Mateo, Marcos, Lucas, Juan)',
          psalms: 'Los Salmos',
          epistles: 'Las cartas de Pablo (Romanos, Corintios…)',
          prophets: 'Los profetas (Isaías, Jeremías…)',
          revelation: 'El Apocalipsis',
          lost: 'Sinceramente, me cuesta orientarme'
        }
      },
      q9: {
        title: 'En este momento, ¿con qué frecuencia lees la Biblia?',
        options: {
          never: 'Casi nunca',
          sometimes: 'De vez en cuando',
          weekly: 'Algunas veces por semana',
          daily: 'Todos los días'
        }
      },
      q10: {
        title: '¿Qué es lo que más te interesa?',
        options: {
          basics: 'Aprender lo básico, las historias de la Biblia',
          application: 'Aplicar la Palabra a mi vida diaria',
          meaning: 'Comprender el sentido profundo, el contexto',
          theology: 'Estudiar la doctrina y la teología'
        }
      },
      q11: {
        title: '{name}, ¿qué es lo que más te impide crecer espiritualmente?',
        options: {
          regularity: 'La falta de constancia',
          understanding: 'Entender lo que leo',
          motivation: 'La motivación que decae',
          hardship: 'Un momento difícil que estoy atravesando',
          evangelism: 'Evangelizar a mi alrededor'
        }
      },
      q12: {
        title: '¿Cuándo prefieres tener tu tiempo con Dios?',
        options: {
          morning: 'Por la mañana (antes de mi día)',
          noon: 'En la pausa del mediodía',
          evening: 'Por la tarde (después de mi día)',
          night: 'De noche (cuando todo está en calma)'
        }
      },
      q13: {
        title: '¿Cuánto tiempo puedes dar a Dios cada día?',
        options: {
          5: '5 minutos (ya es algo)',
          15: '10 a 15 minutos',
          25: '20 a 30 minutos',
          30: 'Más de 30 minutos'
        }
      }
    },
    levels: {
      decouverte: 'Descubrimiento',
      croissance: 'Crecimiento',
      affermi: 'Afianzado',
      profond: 'Profundo'
    },
    pillars: {
      immersion: 'Inmersión',
      sanctuaire: 'El Santuario',
      ancre: 'El Ancla',
      phare: 'El Faro'
    },
    profiles: {
      source: {
        name: 'La Fuente',
        description: 'Estás en la fuente. Algo nuevo está empezando en ti, y es precioso. Abide te acompañará paso a paso para descubrir la Palabra, sin presión, a tu ritmo. Cada día, una gota. Y pronto, un río.'
      },
      marcheur: {
        name: 'El Caminante',
        description: 'Caminas con Cristo desde hace un tiempo y quieres avanzar con constancia. Abide te ayudará a convertir tu fe en un hábito diario, no por obligación, sino por deseo. Un paso tras otro, cada día cuenta.'
      },
      explorateur: {
        name: 'El Explorador',
        description: 'No te conformas con leer: quieres comprender. El contexto, el sentido, la profundidad. Abide pone a tu disposición un guía para profundizar en la Palabra, explorar los pasajes y descubrir tesoros que no habías visto.'
      },
      veilleur: {
        name: 'El Centinela',
        description: 'Atraviesas una temporada difícil y buscas Su presencia en la noche. Abide vela contigo. Oraciones, pasajes que consuelan, un espacio para dejar lo que pesa. No estás solo. La luz brilla en las tinieblas.'
      },
      porteur: {
        name: 'El Portador',
        description: 'Llevas una luz y quieres compartirla. Abide te da las herramientas para evangelizar con confianza y amor: recursos, palabras, recorridos para guiar a quienes buscan. Ve y lleva la Buena Noticia.'
      }
    },
    reveal: {
      youAre: '{name}, eres',
      yourLevel: 'Tu nivel',
      yourPillar: 'Tu punto de partida',
      consent: 'Acepto que mis respuestas sirvan, de forma anónima y agregada, para mejorar Abide y sus estadísticas. Ver la política de privacidad.',
      start: 'Empezar mi recorrido'
    }
  },
  bible: {
    title: 'La Biblia',
    // Etiqueta CORTA reservada a la barra de pestañas.
    tab: 'Biblia',
    oldTestament: 'Antiguo Testamento',
    newTestament: 'Nuevo Testamento',
    chapters: 'capítulos',
    chapter: 'capítulo',
    chapterLabel: 'Capítulo {n}',
    versions: 'Versiones',
    downloadedVersions: 'Versiones descargadas',
    addVersion: 'Añadir una versión',
    storeComingSoon: 'La tienda de versiones llegará pronto.',
    loading: 'Abriendo la Biblia…',
    empty: 'No se encontró ningún versículo.',
    textSettings: 'Visualización del texto',
    readerSettings: 'Ajustes de lectura',
    fontSize: 'Tamaño del texto',
    font: 'Fuente',
    fontDefault: 'Predeterminada',
    theme: 'Tema',
    themeSystem: 'Sistema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    previousChapter: 'Capítulo anterior',
    nextChapter: 'Capítulo siguiente',
    bookmark: 'Marcador',
    bookmarked: 'Guardado',
    markRead: 'Marcar como leído',
    readDone: 'Leído',
    bookmarkChapter: 'Añadir este capítulo a los marcadores',
    search: {
      title: 'Buscar un libro',
      placeholder: 'Nombre de un libro…',
      noResults: 'Ningún libro coincide con « {query} ».'
    },
    actions: {
      copy: 'Copiar',
      highlight: 'Resaltar',
      save: 'Guardar',
      ai: 'Guía IA',
      share: 'Compartir',
      copied: 'Copiado al portapapeles',
      saved: 'Versículo resaltado',
      copyError: 'No se pudo copiar',
      clearHighlight: 'Quitar el resaltado',
      comingSoon: 'Disponible pronto'
    },
    // Compartir el versículo como IMAGEN (elección de un paisaje incluido).
    shareImage: {
      title: 'Compartir como imagen',
      chooseBackground: 'Elegir un fondo',
      background: 'Fondo',
      share: 'Compartir',
      download: 'Guardar',
      downloaded: 'Imagen guardada en tu galería.',
      tooManyVerses: 'Una imagen solo puede llevar {max} versículos. Tu selección se comparte como texto.',
      tooLong: 'Este pasaje es demasiado largo para caber en una imagen. Se comparte como texto.',
      unavailable: 'Compartir no está disponible aquí.',
      error: 'No se pudo preparar la imagen. Inténtalo de nuevo.'
    },
    audio: {
      listen: 'Escuchar este capítulo',
      play: 'Reproducir',
      pause: 'Pausa',
      speed: 'Velocidad de lectura',
      back15: 'Retroceder 15 segundos',
      fwd15: 'Avanzar 15 segundos',
      loading: 'Cargando el audio…',
      unavailable: 'Audio no disponible para esta versión.',
      noTimestamps: 'Audio disponible, pero sin resaltado de versículos para este pasaje.',
      error: 'No se puede reproducir. Verifica tu conexión.',
      progress: 'Progreso de la lectura',
      expand: 'Ampliar el reproductor',
      collapse: 'Reducir el reproductor',
      download: 'Descargar este libro',
      downloading: 'Descargando…',
      downloaded: 'Descargado, disponible sin conexión',
      deleteDownload: 'Eliminar la descarga',
      deleteConfirm: '¿Eliminar el audio descargado de este libro? Podrás volver a descargarlo cuando quieras.',
      deleted: 'Descarga eliminada',
      downloadError: 'No se pudo descargar. Verifica tu conexión e inténtalo de nuevo.',
      myDownloads: 'Mis descargas',
      bgMusic: 'Música de fondo',
      on: 'ON',
      off: 'OFF',
      totalUsed: '{count} libro(s), {size}',
      noDownloads: 'Ningún libro de audio descargado. El círculo ⬇ del reproductor permite escuchar sin conexión.',
      webOnly: 'La descarga está disponible en la aplicación móvil.'
    },
    store: {
      title: 'Versiones de la Biblia',
      intro: 'Descarga versiones para leerlas sin conexión. Una vez descargada, una versión sigue disponible sin conexión.',
      bundled: 'Incluida',
      active: 'Activa',
      select: 'Elegir',
      download: 'Descargar',
      downloading: 'Descargando…',
      downloaded: 'Versión descargada',
      downloadError: 'Error en la descarga',
      switched: 'Versión activada',
      switchError: 'No se pudo cambiar de versión',
      audioHint: 'Las versiones marcadas con auriculares también tienen audio.',
      versionCount: '{n} versión | {n} versiones',
      offline: 'Catálogo no disponible (sin conexión).'
    }
  },
  home: {
    tab: 'Inicio',
    greeting: 'Hola {name}',
    greetingNoName: 'Hola',
    verseOfDay: 'Versículo del día',
    meditateWithGuide: 'Meditar con el Guía',
    share: {
      action: 'Compartir este versículo',
      title: 'Compartir el versículo',
      building: 'Creando la imagen…',
      shareTo: 'Compartir',
      download: 'Guardar',
      downloaded: 'Imagen guardada en tu galería.',
      hint: 'Elige WhatsApp, Instagram, Facebook u otra aplicación en la lista que se abre.',
      unavailable: 'Compartir no está disponible aquí.',
      error: 'No se pudo preparar la imagen. Inténtalo de nuevo.'
    }
  },
  streak: {
    days: '{n} día | {n} día | {n} días',
    msg: {
      start: 'Es un comienzo. Vuelve mañana para mantener viva la llama.',
      keep: '¡Buena constancia, sigue así!',
      week: 'Una semana entera: tu perseverancia da fruto.',
      blaze: 'Tu llama arde con fuerza: tu fidelidad da fruto, día tras día.',
      month: 'Un mes de fidelidad. ¡Qué constancia, felicidades!'
    }
  },
  plan: {
    title: 'Plan de lectura',
    setupTitle: 'Nuevo plan',
    noPlan: 'No hay ningún plan en curso. Empieza un recorrido de lectura.',
    start: 'Empezar un plan',
    startNew: 'Empezar un nuevo plan',
    completed: '¡Plan terminado, felicidades!',
    dayOf: 'Día {day} / {total}',
    change: 'Cambiar',
    markRead: 'Marcar como leído',
    dayDone: 'Día completado, ¡hasta mañana!',
    duration: 'Duración',
    days: '{n} día | {n} día | {n} días',
    scope: 'Contenido',
    scopes: {
      full: 'Toda la Biblia',
      ot: 'Antiguo Testamento',
      nt: 'Nuevo Testamento',
      psalms: 'Los Salmos',
      book: 'Un libro en particular'
    },
    create: 'Crear mi plan',
    replace: 'Reemplazar el plan',
    replaceWarn: 'Tu plan actual será reemplazado. Tu progreso de lectura se conserva.',
    choose: {
      title: 'Elegir un plan',
      current: 'Plan en curso: {title}',
      forYou: 'Para ti',
      profileCard: 'Plan según tu perfil',
      profileDesc: 'Abide te propone una lectura adaptada a tu camino.',
      noProfileTitle: 'Tu perfil aún no está establecido',
      noProfileMsg: 'Para proponerte una lectura realmente adaptada, Abide necesita conocerte mejor. Bastan unas pocas preguntas.',
      noProfileCta: 'Hacer el cuestionario',
      journeys: 'Recorridos',
      own: 'Crear el mío',
      customCard: 'Plan a medida',
      customDesc: 'Elige el contenido y la duración.'
    },
    preview: {
      title: 'Vista previa del recorrido',
      start: 'Empezar este recorrido',
      replace: 'Reemplazar el plan en curso',
      notFound: 'No se encontró este recorrido.'
    },
    journey: {
      title: 'Mi recorrido',
      see: 'Ver todo el recorrido',
      day: 'Día {n}',
      dayProgress: 'día {day} de {total}'
    },
    profileTitles: {
      source: 'En la fuente: el Evangelio de Juan',
      marcheur: 'El Caminante: todo el Nuevo Testamento',
      explorateur: 'El Explorador: la carta a los Romanos',
      veilleur: 'El Centinela: los Salmos',
      porteur: 'El Portador: los Hechos de los Apóstoles'
    },
    categories: {
      vie: 'Para tu vida',
      biblique: 'Recorridos bíblicos',
      discipline: 'Crecer espiritualmente'
    },
    presets: {
      knowJesus: {
        title: 'Conocer a Jesús',
        desc: 'Su vida, del pesebre a la resurrección.'
      },
      peaceOverAnxiety: {
        title: 'La paz más fuerte que la ansiedad',
        desc: 'Siete días para dejar tus preocupaciones delante de Dios y aprender a respirar de otra manera.'
      },
      griefAndComfort: {
        title: 'Atravesar el duelo sin estar solo',
        desc: 'Diez días para caminar por el valle con textos que no le temen a tu dolor.'
      },
      pathOfForgiveness: {
        title: 'El camino del perdón',
        desc: 'Recibir primero el perdón de Dios y luego dejarlo fluir hacia los demás.'
      },
      identityInChrist: {
        title: 'Quién soy en Cristo',
        desc: 'Reemplazar las etiquetas que llevas por lo que Dios realmente dice de ti.'
      },
      lifeOfDavid: {
        title: 'David, un corazón conforme a Dios',
        desc: 'El pastor que llegó a ser rey: las victorias, las huidas, la caída, el levantamiento.'
      },
      parablesOfJesus: {
        title: 'Las parábolas de Jesús',
        desc: 'Las historias que Jesús contaba para transformar los corazones.'
      },
      womenOfTheBible: {
        title: 'Las mujeres de la Biblia',
        desc: 'Aquellas a quienes Dios vio, llamó y honró, de Eva a Lidia.'
      },
      creationToCovenant: {
        title: 'De la Creación a la Alianza',
        desc: 'Recorrer el Génesis y ver a Dios cumplir su promesa a pesar de todo.'
      },
      learnToPray: {
        title: 'Aprender a orar',
        desc: 'Salir de las fórmulas y hablar con Dios con sencillez.'
      },
      cultivatingGratitude: {
        title: 'Cultivar la gratitud',
        desc: 'Cinco días para volver a abrir los ojos a lo que ya has recibido.'
      },
      studyTheBible: {
        title: 'Estudiar la Biblia por ti mismo',
        desc: 'Ganar autonomía: por qué importa la Palabra y cómo abordarla.'
      },
      hearingGodsVoice: {
        title: 'Escuchar la voz de Dios',
        desc: 'Reconocer la voz del Pastor en medio del ruido y atreverse a responder.'
      },
      sharingYourFaith: {
        title: 'Compartir tu fe',
        desc: 'De los primeros testigos hasta ti: aprender a hablar de Jesús con confianza y dulzura.'
      }
    },
    custom: {
      title: 'Plan a medida',
      pickBook: 'Elegir un libro',
      customDays: 'Duración personalizada'
    }
  },
  plus: {
    tab: 'Más',
    title: 'Más',
    myReading: 'Mi lectura',
    myNotes: 'Mis notas',
    notes: 'Notas',
    bookmarks: 'Marcadores',
    highlights: 'Resaltados',
    emptyBookmarks: 'Aún no hay capítulos guardados.',
    emptyHighlights: 'Aún no hay versículos resaltados.'
  },
  notes: {
    title: 'Nota',
    empty: 'Aún no hay notas. Toca + para crear una.',
    new: 'Nueva nota',
    untitled: 'Sin título',
    titlePlaceholder: 'Título',
    bodyPlaceholder: "Escribe tu nota… escribe {'@'} para citar un pasaje.",
    tagHint: "Consejo: escribe {'@'} para etiquetar un versículo o un pasaje.",
    toggleVerses: 'Mostrar / ocultar el texto de los versículos',
    readMode: 'Lectura / edición',
    defaultAiTitle: 'Nota del Guía',
    aiBadge: 'Guía',
    exportedFromAi: 'Nota creada desde el Guía',
    picker: {
      chooseBook: 'Elegir un libro',
      verseHint: 'Elige el versículo de inicio (y de fin, opcional).',
      from: 'Del versículo',
      to: 'Al versículo',
      insert: 'Insertar'
    }
  },
  settings: {
    title: 'Ajustes',
    appearance: 'Apariencia',
    theme: 'Tema',
    themeDark: 'Oscuro',
    themeLight: 'Claro',
    themeSystem: 'Sistema',
    language: 'Idioma',
    french: 'Francés',
    english: 'Inglés',
    noBibleInLanguage: {
      title: 'Biblia no disponible en este idioma',
      message: 'El idioma de la interfaz cambió, pero no hay ninguna Biblia descargada en este idioma, así que la lectura sigue en el idioma anterior. ¿Quieres descargar una?',
      download: 'Descargar'
    },
    bibleReading: 'Lectura de la Biblia',
    notifications: 'Notificaciones',
    reminders: {
      title: 'Notificaciones',
      intro: 'Elige a qué hora Abide te escribe. Cada recordatorio se puede ajustar o desactivar.',
      introNamed: '{name}, elige a qué hora Abide te escribe. Cada recordatorio se puede ajustar o desactivar.',
      groups: {
        morning: 'Oración de la mañana',
        evening: 'Oración de la noche',
        streak: 'Racha de lectura'
      },
      hints: {
        morning: 'Los recordatorios se detienen por hoy en cuanto haces tu oración de la mañana.',
        evening: 'Los recordatorios se detienen por hoy en cuanto haces tu oración de la noche.',
        streak: 'Solo si tienes una racha en curso y todavía no has leído hoy.'
      },
      slots: {
        morning: { s0: 'Primer recordatorio', s1: 'Segundo aviso' },
        evening: { s0: 'Primer recordatorio', s1: 'Segundo aviso', s2: 'Último recordatorio' },
        streak: { s0: 'Recordatorio de la tarde', s1: 'Último aviso' }
      },
      timeLabel: 'Hora: {slot}',
      reset: 'Restablecer las horas por defecto',
      saved: 'Recordatorios actualizados',
      denied: 'Las notificaciones están desactivadas para Abide en este teléfono. Actívalas en los ajustes de Android para recibir tus recordatorios.',
      openSystem: 'Abrir ajustes',
      webOnly: 'Los recordatorios funcionan en la aplicación móvil.'
    },
    referral: 'Invitaciones',
    bibleFont: 'Fuente',
    bibleFontSize: 'Tamaño del texto',
    account: 'Cuenta',
    signedInAs: 'Conectado como',
    changePassword: 'Cambiar la contraseña',
    logout: 'Cerrar sesión',
    logoutConfirm: '¿De verdad quieres cerrar sesión?',
    manageAccount: 'Gestión de la cuenta',
    guestMode: 'Modo invitado',
    guestHint: 'Inicia sesión para guardar y sincronizar tus datos.',
    signIn: 'Iniciar sesión',
    about: 'Acerca de',
    faq: 'Preguntas frecuentes',
    terms: 'Condiciones de uso',
    privacy: 'Política de privacidad',
    // Exención de batería: sin ella, algunos teléfonos bloquean los recordatorios.
    batteryTitle: 'Para recibir tus recordatorios',
    batteryMsg: 'Tu teléfono pone Abide en reposo cuando la app está cerrada, lo que impide que lleguen los recordatorios de oración y de lectura. Permite que Abide siga activa en segundo plano para recibirlos a tiempo.',
    batteryAllow: 'Permitir',
    batteryLater: 'Más tarde',
    reportBug: 'Informar de un problema',
    reportBugIntro: '¿Algo no funciona como debería? Describe lo que hiciste y lo que pasó: cuanto más preciso, más rápido podremos corregirlo.',
    reportBugPlaceholder: 'Lo que intentaba hacer, y lo que pasó…',
    reportBugGuestHint: 'No has iniciado sesión: tu mensaje nos llegará, pero no podremos responderte directamente.',
    reportBugSend: 'Enviar',
    reportBugSent: '¡Gracias! Recibimos tu reporte.',
    reportBugError: 'El envío falló. Verifica tu conexión e inténtalo de nuevo.',
    version: 'Versión',
    cancel: 'Cancelar',
    darkMode: 'Modo oscuro',
    // Vista Perfil
    profileTitle: 'Perfil',
    myInfo: 'Mi información',
    guestProfileHint: 'Estás explorando Abide como invitado. Inicia sesión para encontrar tu perfil en todos tus dispositivos.',
    fieldName: 'Nombre',
    fieldEmail: 'Correo',
    fieldProfile: 'Perfil espiritual',
    discoverProfile: 'Descubrir mi perfil',
    fieldLevel: 'Nivel bíblico',
    fieldChurch: 'Iglesia',
    fieldDenomination: 'Confesión',
    fieldLocation: 'Lugar',
    fieldFaithStage: 'Camino de fe',
    memberSince: 'Miembro desde {date}',
    // Gestión de la cuenta / eliminación (recorrido deliberadamente exigente)
    manageTitle: 'Gestión de la cuenta',
    dangerZone: 'Zona sensible',
    deleteAccount: 'Eliminar mi cuenta',
    deleteTitle: 'Eliminar la cuenta definitivamente',
    deleteWarning: 'Esta acción es irreversible. Se eliminará definitivamente:',
    deleteItem1: 'Tu perfil y tu información personal',
    deleteItem2: 'Tu progreso de lectura, tus rachas y tus planes',
    deleteItem3: 'Tus oraciones, notas, resaltados y marcadores',
    deleteItem4: 'Todo tu historial con el guía IA',
    deleteConfirmHint: 'Para confirmar, escribe {word} abajo.',
    deleteConfirmWord: 'ELIMINAR',
    deletePlaceholder: 'Escribe {word}',
    deleteButton: 'Eliminar definitivamente',
    deleting: 'Eliminando…',
    deleteError: 'La eliminación falló. Verifica tu conexión e inténtalo de nuevo.',
    deleteSuccess: 'Tu cuenta ha sido eliminada. Hasta pronto, tal vez.'
  }
}
