// Datos del Mundial 2026

export interface Match {
    id: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeFlag: string;
    awayFlag: string;
    stage: 'GROUP' | 'ROUND16' | 'QUARTER' | 'SEMI' | 'FINAL';
    group?: string;
    result?: {
        homeGoals: number;
        awayGoals: number;
    };
}

export interface Prediction {
    matchId: string;
    prediction: 'home_win' | 'draw' | 'away_win';
    points: number;
}

// Equipos del Mundial 2026
export const TEAMS = {
    // CONMEBOL (Sudamérica)
    AR: { name: 'Argentina', flag: '🇦🇷', group: 'A' },
    BR: { name: 'Brasil', flag: '🇧🇷', group: 'B' },
    UY: { name: 'Uruguay', flag: '🇺🇾', group: 'C' },
    CO: { name: 'Colombia', flag: '🇨🇴', group: 'D' },
    CL: { name: 'Chile', flag: '🇨🇱', group: 'E' },
    PE: { name: 'Perú', flag: '🇵🇪', group: 'F' },
    EC: { name: 'Ecuador', flag: '🇪🇨', group: 'G' },
    PA: { name: 'Panamá', flag: '🇵🇦', group: 'H' },
    
    // CONCACAF (Norteamérica/Centroamérica)
    MX: { name: 'México', flag: '🇲🇽', group: 'A' },
    US: { name: 'Estados Unidos', flag: '🇺🇸', group: 'B' },
    CA: { name: 'Canadá', flag: '🇨🇦', group: 'C' },
    CR: { name: 'Costa Rica', flag: '🇨🇷', group: 'D' },
    
    // UEFA (Europa)
    ES: { name: 'España', flag: '🇪🇸', group: 'E' },
    FR: { name: 'Francia', flag: '🇫🇷', group: 'F' },
    DE: { name: 'Alemania', flag: '🇩🇪', group: 'G' },
    IT: { name: 'Italia', flag: '🇮🇹', group: 'H' },
    EN: { name: 'Inglaterra', flag: '🇬🇧', group: 'A' },
    PT: { name: 'Portugal', flag: '🇵🇹', group: 'B' },
    NL: { name: 'Países Bajos', flag: '🇳🇱', group: 'C' },
    BE: { name: 'Bélgica', flag: '🇧🇪', group: 'D' },
    
    // AFC (Asia)
    JP: { name: 'Japón', flag: '🇯🇵', group: 'E' },
    KR: { name: 'Corea del Sur', flag: '🇰🇷', group: 'F' },
    AU: { name: 'Australia', flag: '🇦🇺', group: 'G' },
    IR: { name: 'Irán', flag: '🇮🇷', group: 'H' },
    
    // CAF (África)
    EG: { name: 'Egipto', flag: '🇪🇬', group: 'A' },
    MA: { name: 'Marruecos', flag: '🇲🇦', group: 'B' },
    SN: { name: 'Senegal', flag: '🇸🇳', group: 'C' },
    CM: { name: 'Camerún', flag: '🇨🇲', group: 'D' },
};

// Partidos de ejemplo (Fase de Grupos)
export const SAMPLE_MATCHES: Match[] = [
    // Grupo A
    { id: 'g1-1', date: '2026-06-12', homeTeam: 'AR', awayTeam: 'EN', homeFlag: '🇦🇷', awayFlag: '🇬🇧', stage: 'GROUP', group: 'A' },
    { id: 'g1-2', date: '2026-06-12', homeTeam: 'MX', awayTeam: 'EG', homeFlag: '🇲🇽', awayFlag: '🇪🇬', stage: 'GROUP', group: 'A' },
    { id: 'g1-3', date: '2026-06-17', homeTeam: 'AR', awayTeam: 'MX', homeFlag: '🇦🇷', awayFlag: '🇲🇽', stage: 'GROUP', group: 'A' },
    { id: 'g1-4', date: '2026-06-17', homeTeam: 'EN', awayTeam: 'EG', homeFlag: '🇬🇧', awayFlag: '🇪🇬', stage: 'GROUP', group: 'A' },
    { id: 'g1-5', date: '2026-06-22', homeTeam: 'EN', awayTeam: 'MX', homeFlag: '🇬🇧', awayFlag: '🇲🇽', stage: 'GROUP', group: 'A' },
    { id: 'g1-6', date: '2026-06-22', homeTeam: 'EG', awayTeam: 'AR', homeFlag: '🇪🇬', awayFlag: '🇦🇷', stage: 'GROUP', group: 'A' },
    
    // Grupo B
    { id: 'g2-1', date: '2026-06-13', homeTeam: 'BR', awayTeam: 'PT', homeFlag: '🇧🇷', awayFlag: '🇵🇹', stage: 'GROUP', group: 'B' },
    { id: 'g2-2', date: '2026-06-13', homeTeam: 'US', awayTeam: 'MA', homeFlag: '🇺🇸', awayFlag: '🇲🇦', stage: 'GROUP', group: 'B' },
    { id: 'g2-3', date: '2026-06-18', homeTeam: 'BR', awayTeam: 'US', homeFlag: '🇧🇷', awayFlag: '🇺🇸', stage: 'GROUP', group: 'B' },
    { id: 'g2-4', date: '2026-06-18', homeTeam: 'PT', awayTeam: 'MA', homeFlag: '🇵🇹', awayFlag: '🇲🇦', stage: 'GROUP', group: 'B' },
    { id: 'g2-5', date: '2026-06-23', homeTeam: 'PT', awayTeam: 'US', homeFlag: '🇵🇹', awayFlag: '🇺🇸', stage: 'GROUP', group: 'B' },
    { id: 'g2-6', date: '2026-06-23', homeTeam: 'MA', awayTeam: 'BR', homeFlag: '🇲🇦', awayFlag: '🇧🇷', stage: 'GROUP', group: 'B' },
];

// Puntuación
export const SCORING = {
    CORRECT_RESULT: 10, // Acierto exacto (1-0, 2-1, etc.)
    CORRECT_OUTCOME: 5,  // Acierto de resultado (victoria/empate/derrota)
    WRONG: 0
};

// Fases del torneo
export const TOURNAMENT_PHASES = [
    { id: 'GROUP', name: 'Fase de Grupos', startDate: '2026-06-12', endDate: '2026-06-23' },
    { id: 'ROUND16', name: 'Octavos de Final', startDate: '2026-06-29', endDate: '2026-07-06' },
    { id: 'QUARTER', name: 'Cuartos de Final', startDate: '2026-07-09', endDate: '2026-07-10' },
    { id: 'SEMI', name: 'Semifinales', startDate: '2026-07-13', endDate: '2026-07-14' },
    { id: 'FINAL', name: 'Final', startDate: '2026-07-19', endDate: '2026-07-19' },
];
