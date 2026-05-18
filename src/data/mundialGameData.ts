// Datos del Mundial 2026

export interface Match {
    id: string;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    stage: 'GROUP' | 'ROUND16' | 'QUARTER' | 'SEMI' | 'FINAL';
    group?: string;
    venue: string;
    city: string;
    result?: {
        homeGoals: number;
        awayGoals: number;
    };
}

export interface Prediction {
    matchId: string;
    homeGoals: number;
    awayGoals: number;
    points: number;
    savedAt: string;
}

// Equipos del Mundial 2026
export const TEAMS: Record<string, { name: string; code: string; group: string; flag: string }> = {
    // CONMEBOL
    AR: { name: 'Argentina',      code: 'ar',     group: 'A', flag: '🇦🇷' },
    BR: { name: 'Brasil',         code: 'br',     group: 'B', flag: '🇧🇷' },
    UY: { name: 'Uruguay',        code: 'uy',     group: 'C', flag: '🇺🇾' },
    CO: { name: 'Colombia',       code: 'co',     group: 'D', flag: '🇨🇴' },
    EC: { name: 'Ecuador',        code: 'ec',     group: 'E', flag: '🇪🇨' },
    PE: { name: 'Perú',           code: 'pe',     group: 'F', flag: '🇵🇪' },
    // CONCACAF
    MX: { name: 'México',         code: 'mx',     group: 'A', flag: '🇲🇽' },
    US: { name: 'Estados Unidos', code: 'us',     group: 'B', flag: '🇺🇸' },
    CA: { name: 'Canadá',         code: 'ca',     group: 'C', flag: '🇨🇦' },
    // UEFA
    ES: { name: 'España',         code: 'es',     group: 'E', flag: '🇪🇸' },
    FR: { name: 'Francia',        code: 'fr',     group: 'F', flag: '🇫🇷' },
    DE: { name: 'Alemania',       code: 'de',     group: 'G', flag: '🇩🇪' },
    IT: { name: 'Italia',         code: 'it',     group: 'H', flag: '🇮🇹' },
    EN: { name: 'Inglaterra',     code: 'gb-eng', group: 'A', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    PT: { name: 'Portugal',       code: 'pt',     group: 'B', flag: '🇵🇹' },
    NL: { name: 'Países Bajos',   code: 'nl',     group: 'C', flag: '🇳🇱' },
    BE: { name: 'Bélgica',        code: 'be',     group: 'D', flag: '🇧🇪' },
    // AFC
    JP: { name: 'Japón',          code: 'jp',     group: 'G', flag: '🇯🇵' },
    KR: { name: 'Corea del Sur',  code: 'kr',     group: 'H', flag: '🇰🇷' },
    // CAF
    EG: { name: 'Egipto',         code: 'eg',     group: 'A', flag: '🇪🇬' },
    MA: { name: 'Marruecos',      code: 'ma',     group: 'B', flag: '🇲🇦' },
    SN: { name: 'Senegal',        code: 'sn',     group: 'C', flag: '🇸🇳' },
    CM: { name: 'Camerún',        code: 'cm',     group: 'D', flag: '🇨🇲' },
    ZA: { name: 'Sudáfrica',      code: 'za',     group: 'E', flag: '🇿🇦' },
};

// Partidos de Fase de Grupos - Mundial 2026
export const SAMPLE_MATCHES: Match[] = [
    // ──── GRUPO A ────
    { id: 'g1-1', date: '2026-06-11', time: '18:00', homeTeam: 'MX', awayTeam: 'ZA',  stage: 'GROUP', group: 'A', venue: 'Estadio Azteca',         city: 'Ciudad de México' },
    { id: 'g1-2', date: '2026-06-11', time: '21:00', homeTeam: 'AR', awayTeam: 'EG',  stage: 'GROUP', group: 'A', venue: 'AT&T Stadium',            city: 'Dallas' },
    { id: 'g1-3', date: '2026-06-16', time: '18:00', homeTeam: 'AR', awayTeam: 'MX',  stage: 'GROUP', group: 'A', venue: 'MetLife Stadium',          city: 'Nueva York' },
    { id: 'g1-4', date: '2026-06-16', time: '21:00', homeTeam: 'ZA', awayTeam: 'EG',  stage: 'GROUP', group: 'A', venue: 'Rose Bowl',                city: 'Los Ángeles' },
    { id: 'g1-5', date: '2026-06-21', time: '18:00', homeTeam: 'EG', awayTeam: 'MX',  stage: 'GROUP', group: 'A', venue: 'Estadio Azteca',           city: 'Ciudad de México' },
    { id: 'g1-6', date: '2026-06-21', time: '21:00', homeTeam: 'ZA', awayTeam: 'AR',  stage: 'GROUP', group: 'A', venue: 'AT&T Stadium',             city: 'Dallas' },

    // ──── GRUPO B ────
    { id: 'g2-1', date: '2026-06-12', time: '18:00', homeTeam: 'BR', awayTeam: 'PT',  stage: 'GROUP', group: 'B', venue: 'SoFi Stadium',             city: 'Los Ángeles' },
    { id: 'g2-2', date: '2026-06-12', time: '21:00', homeTeam: 'US', awayTeam: 'MA',  stage: 'GROUP', group: 'B', venue: 'Estadio Olímpico',         city: 'Ciudad de México' },
    { id: 'g2-3', date: '2026-06-17', time: '18:00', homeTeam: 'BR', awayTeam: 'US',  stage: 'GROUP', group: 'B', venue: 'MetLife Stadium',          city: 'Nueva York' },
    { id: 'g2-4', date: '2026-06-17', time: '21:00', homeTeam: 'PT', awayTeam: 'MA',  stage: 'GROUP', group: 'B', venue: 'Levi\'s Stadium',          city: 'San Francisco' },
    { id: 'g2-5', date: '2026-06-22', time: '18:00', homeTeam: 'PT', awayTeam: 'US',  stage: 'GROUP', group: 'B', venue: 'Hard Rock Stadium',        city: 'Miami' },
    { id: 'g2-6', date: '2026-06-22', time: '21:00', homeTeam: 'MA', awayTeam: 'BR',  stage: 'GROUP', group: 'B', venue: 'Rose Bowl',                city: 'Los Ángeles' },

    // ──── GRUPO C ────
    { id: 'g3-1', date: '2026-06-13', time: '18:00', homeTeam: 'UY', awayTeam: 'SN',  stage: 'GROUP', group: 'C', venue: 'BMO Field',                city: 'Toronto' },
    { id: 'g3-2', date: '2026-06-13', time: '21:00', homeTeam: 'NL', awayTeam: 'CA',  stage: 'GROUP', group: 'C', venue: 'BC Place',                 city: 'Vancouver' },
    { id: 'g3-3', date: '2026-06-18', time: '18:00', homeTeam: 'UY', awayTeam: 'NL',  stage: 'GROUP', group: 'C', venue: 'Gillette Stadium',         city: 'Boston' },
    { id: 'g3-4', date: '2026-06-18', time: '21:00', homeTeam: 'CA', awayTeam: 'SN',  stage: 'GROUP', group: 'C', venue: 'BMO Field',                city: 'Toronto' },
    { id: 'g3-5', date: '2026-06-23', time: '18:00', homeTeam: 'SN', awayTeam: 'NL',  stage: 'GROUP', group: 'C', venue: 'Lincoln Financial',        city: 'Filadelfia' },
    { id: 'g3-6', date: '2026-06-23', time: '21:00', homeTeam: 'CA', awayTeam: 'UY',  stage: 'GROUP', group: 'C', venue: 'BC Place',                 city: 'Vancouver' },

    // ──── GRUPO D ────
    { id: 'g4-1', date: '2026-06-14', time: '18:00', homeTeam: 'BE', awayTeam: 'CM',  stage: 'GROUP', group: 'D', venue: 'Arrowhead Stadium',        city: 'Kansas City' },
    { id: 'g4-2', date: '2026-06-14', time: '21:00', homeTeam: 'CO', awayTeam: 'CR',  stage: 'GROUP', group: 'D', venue: 'NRG Stadium',              city: 'Houston' },
    { id: 'g4-3', date: '2026-06-19', time: '18:00', homeTeam: 'BE', awayTeam: 'CO',  stage: 'GROUP', group: 'D', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },
    { id: 'g4-4', date: '2026-06-19', time: '21:00', homeTeam: 'CM', awayTeam: 'CR',  stage: 'GROUP', group: 'D', venue: 'Arrowhead Stadium',        city: 'Kansas City' },

    // ──── GRUPO E ────
    { id: 'g5-1', date: '2026-06-15', time: '18:00', homeTeam: 'ES', awayTeam: 'EC',  stage: 'GROUP', group: 'E', venue: 'Estadio Olímpico',         city: 'Ciudad de México' },
    { id: 'g5-2', date: '2026-06-15', time: '21:00', homeTeam: 'JP', awayTeam: 'ZA',  stage: 'GROUP', group: 'E', venue: 'SoFi Stadium',             city: 'Los Ángeles' },
    { id: 'g5-3', date: '2026-06-20', time: '18:00', homeTeam: 'ES', awayTeam: 'JP',  stage: 'GROUP', group: 'E', venue: 'MetLife Stadium',          city: 'Nueva York' },
    { id: 'g5-4', date: '2026-06-20', time: '21:00', homeTeam: 'EC', awayTeam: 'ZA',  stage: 'GROUP', group: 'E', venue: 'Rose Bowl',                city: 'Los Ángeles' },

    // ──── GRUPO F ────
    { id: 'g6-1', date: '2026-06-13', time: '15:00', homeTeam: 'FR', awayTeam: 'PE',  stage: 'GROUP', group: 'F', venue: 'Levi\'s Stadium',          city: 'San Francisco' },
    { id: 'g6-2', date: '2026-06-18', time: '21:00', homeTeam: 'FR', awayTeam: 'ES',  stage: 'GROUP', group: 'F', venue: 'Hard Rock Stadium',        city: 'Miami' },

    // ──── GRUPO G ────
    { id: 'g7-1', date: '2026-06-14', time: '15:00', homeTeam: 'DE', awayTeam: 'JP',  stage: 'GROUP', group: 'G', venue: 'Gillette Stadium',         city: 'Boston' },
    { id: 'g7-2', date: '2026-06-19', time: '15:00', homeTeam: 'DE', awayTeam: 'AU',  stage: 'GROUP', group: 'G', venue: 'Lincoln Financial',        city: 'Filadelfia' },

    // ──── GRUPO H ────
    { id: 'g8-1', date: '2026-06-16', time: '15:00', homeTeam: 'IT', awayTeam: 'KR',  stage: 'GROUP', group: 'H', venue: 'NRG Stadium',              city: 'Houston' },
    { id: 'g8-2', date: '2026-06-21', time: '15:00', homeTeam: 'IT', awayTeam: 'IR',  stage: 'GROUP', group: 'H', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },
];

// Puntuación
export const SCORING = {
    CORRECT_RESULT:  10,  // Marcador exacto
    CORRECT_OUTCOME:  5,  // Solo el resultado (V/E/D)
    WRONG:            0,
};

// Fases del torneo
export const TOURNAMENT_PHASES = [
    { id: 'GROUP',   name: 'Fase de Grupos',   startDate: '2026-06-11', endDate: '2026-06-25' },
    { id: 'ROUND16', name: 'Octavos de Final', startDate: '2026-06-28', endDate: '2026-07-05' },
    { id: 'QUARTER', name: 'Cuartos de Final', startDate: '2026-07-08', endDate: '2026-07-09' },
    { id: 'SEMI',    name: 'Semifinales',       startDate: '2026-07-13', endDate: '2026-07-14' },
    { id: 'FINAL',   name: 'Gran Final',        startDate: '2026-07-19', endDate: '2026-07-19' },
];
