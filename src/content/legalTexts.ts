/** Versión actual de términos — incrementar al cambiar textos legales */
export const LEGAL_TERMS_VERSION = '2026-05-29';

export const LEGAL_OPERATOR_NAME = 'Oráculo Mundial';
export const LEGAL_CONTACT_EMAIL = 'contacto@oraculo-mundial.com';

export type LegalDocType = 'terms' | 'privacy' | 'rules';

export const LEGAL_DOC_TITLES: Record<LegalDocType, string> = {
  terms: 'Términos y Condiciones de Uso',
  privacy: 'Política de Privacidad',
  rules: 'Reglas del Juego y Descargo de Responsabilidad',
};

/** Resumen visible en registro (checkbox) */
export const LEGAL_SIGNUP_SUMMARY = [
  'Es un juego gratuito de entretenimiento sobre pronósticos del Mundial.',
  'No hay dinero en juego, apuestas, sorteos ni premios en efectivo o especies.',
  'No vendemos ni cedemos tus datos a terceros con fines comerciales.',
  'Podés dejar de participar y solicitar la baja cuando quieras.',
];

export const LEGAL_SECTIONS: Record<LegalDocType, { title: string; body: string }[]> = {
  terms: [
    {
      title: '1. Naturaleza del servicio',
      body:
        'Oráculo Mundial es una aplicación web gratuita de entretenimiento que permite registrar pronósticos deportivos, participar en ligas privadas entre conocidos y comparar puntajes. No constituye un servicio de apuestas, casino, sorteo, concurso con premio ni asesoramiento de ningún tipo.',
    },
    {
      title: '2. Elegibilidad',
      body:
        'Debés ser mayor de 18 años y tener capacidad legal para aceptar estos términos. Al registrarte declarás que la información proporcionada es veraz y que participás de forma voluntaria.',
    },
    {
      title: '3. Sin premios ni dinero',
      body:
        'No se otorgan premios en dinero, bienes, servicios ni beneficios económicos de ninguna índole. Los puntajes y rankings tienen únicamente carácter lúdico y no son canjeables.',
    },
    {
      title: '4. Uso permitido',
      body:
        'Te comprometés a usar la plataforma de buena fe, sin acoso, spam, contenido ilegal, suplantación de identidad ni intentos de vulnerar la seguridad. El chat de ligas es solo para comunicación relacionada con el juego.',
    },
    {
      title: '5. Propiedad intelectual',
      body:
        'El diseño, marca y código de Oráculo Mundial están protegidos. No podés copiar, revender ni explotar comercialmente la plataforma sin autorización escrita.',
    },
    {
      title: '6. Limitación de responsabilidad',
      body:
        'El servicio se ofrece "tal cual". No garantizamos disponibilidad ininterrumpida ni exactitud de datos deportivos de terceros. En la máxima medida permitida por la ley, no seremos responsables por daños indirectos derivados del uso del juego.',
    },
    {
      title: '7. Modificaciones y baja',
      body:
        'Podemos actualizar estos términos publicando una nueva versión. El uso continuado implica aceptación. Podés dejar de usar el servicio y solicitar eliminación de tu cuenta en cualquier momento.',
    },
    {
      title: '8. Ley aplicable',
      body:
        'Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia se someterá a los tribunales ordinarios competentes del domicilio del operador, salvo normas de orden público que indiquen otro fuero.',
    },
  ],
  privacy: [
    {
      title: '1. Responsable del tratamiento',
      body:
        `El responsable del tratamiento de datos personales es el operador de ${LEGAL_OPERATOR_NAME}. Contacto: ${LEGAL_CONTACT_EMAIL}.`,
    },
    {
      title: '2. Datos que recopilamos',
      body:
        'Email, nombre de usuario, pronósticos, puntajes, participación en ligas, mensajes en chats de liga (si los usás), edificio o zona declarada voluntariamente para agrupar ligas, rol declarado (intendente, encargado, vecino u otro) y, si lo autorizás, datos aproximados de ubicación para mejorar la experiencia del juego.',
    },
    {
      title: '3. Finalidad — solo el juego',
      body:
        'Usamos tus datos exclusivamente para operar el juego: autenticación, guardar pronósticos, mostrar rankings, ligas privadas y chat entre miembros de una liga. No utilizamos tus datos para publicidad dirigida ni los vendemos, alquilamos ni cedemos a terceros con fines comerciales o de marketing.',
    },
    {
      title: '4. Base legal',
      body:
        'El tratamiento se basa en tu consentimiento al registrarte y aceptar esta política, y en el interés legítimo de mantener la seguridad y el funcionamiento técnico del servicio.',
    },
    {
      title: '5. Conservación',
      body:
        'Conservamos los datos mientras mantengas tu cuenta activa y el tiempo necesario para cumplir obligaciones legales o resolver disputas. Podés solicitar eliminación contactándonos.',
    },
    {
      title: '6. Destinatarios y encargados',
      body:
        'Podemos apoyarnos en proveedores de infraestructura (hosting, base de datos, autenticación) que actúan como encargados del tratamiento bajo contrato y solo según nuestras instrucciones. No autorizamos uso comercial de tus datos por parte de esos proveedores.',
    },
    {
      title: '7. Tus derechos',
      body:
        'Podés acceder, rectificar, actualizar o suprimir tus datos, y revocar el consentimiento, escribiendo al email de contacto. También podés presentar un reclamo ante la Agencia de Acceso a la Información Pública (AAIP) de Argentina.',
    },
    {
      title: '8. Menores',
      body:
        'El servicio no está dirigido a menores de 18 años. Si detectamos un registro de menor, procederemos a eliminar la cuenta.',
    },
    {
      title: '9. Seguridad',
      body:
        'Aplicamos medidas técnicas y organizativas razonables (cifrado en tránsito, controles de acceso, políticas RLS en base de datos). Ningún sistema es 100% infalible; te recomendamos usar una contraseña robusta.',
    },
  ],
  rules: [
    {
      title: '1. ¿De qué se trata?',
      body:
        'Oráculo Mundial es un juego social de pronósticos del Copa Mundial. Competís por puntos virtuales con amigos, vecinos o compañeros de tu edificio. Es gratis y sin premios.',
    },
    {
      title: '2. Pronósticos y puntos',
      body:
        'Los puntos se calculan según las reglas publicadas en la app. Los resultados oficiales de los partidos son la única referencia. Ante discrepancias técnicas, prevalece el registro del sistema al cierre del partido.',
    },
    {
      title: '3. Ligas privadas',
      body:
        'Podés crear o unirte a ligas con un código de invitación. Solo los miembros de la liga ven el chat y la tabla de esa liga. El administrador de la liga (quien la crea) puede invitar a otros.',
    },
    {
      title: '4. Copa de edificios',
      body:
        'Si indicás un edificio o zona, tu puntaje puede sumarse al ranking agregado de ese edificio frente a otros. Es una función lúdica; no implica obligaciones ni beneficios reales para el edificio o sus residentes.',
    },
    {
      title: '5. Chat de liga',
      body:
        'Los mensajes deben ser respetuosos y relacionados con el juego. Está prohibido publicar datos personales de terceros, publicidad, contenido ofensivo o ilegal. Nos reservamos el derecho de moderar o eliminar contenido y suspender cuentas.',
    },
    {
      title: '6. No es apuesta ni sorteo',
      body:
        'Participar no requiere pago. No hay pozo de premios, probabilidades de ganancia dinero ni mecanismos de juego de azar regulados. Si en tu jurisdicción se considerara ilegal este tipo de entretenimiento, no debés participar.',
    },
    {
      title: '7. Datos de terceros',
      body:
        'No compartas en el chat información de propietarios, inquilinos ni datos sensibles de otras personas. El juego no debe usarse para recopilar datos con fines ajenos al entretenimiento.',
    },
    {
      title: '8. Descargo general',
      body:
        'Al jugar aceptás que lo hacés por diversión, bajo tu propia responsabilidad, sin expectativa de ganancia económica ni de uso comercial de la información que cargues en la plataforma.',
    },
  ],
};
