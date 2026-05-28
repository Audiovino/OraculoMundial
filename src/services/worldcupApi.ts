/**
 * World Cup 2026 API Integration
 * Free API: 100 requests/day, no key required
 * Docs: https://wc2026api.com
 */

const WC_API_BASE = 'https://wc2026api.com/api';
import { mundialSupabase } from './mundialSupabaseClient';

// Logger condicional - desactivado en producción
const logger = {
  log: (msg: string, ...args: any[]) => {
    if (import.meta.env.DEV) console.log(msg, ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    if (import.meta.env.DEV) console.warn(msg, ...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.error(msg, ...args); // Errores siempre se loguean
  }
};

/**
 * Obtiene las estadísticas reales de la comunidad para un partido
 * Calcula porcentajes basados en la tabla mundial_predictions
 */
export const getMatchCommunityStats = async (matchId: string) => {
  try {
    const { data, error } = await mundialSupabase
      .from('mundial_predictions')
      .select('prediction')
      .eq('match_id', matchId);

    if (error) throw error;

    const total = data?.length || 0;
    if (total === 0) return { home: 33, draw: 34, away: 33 }; // Balanceado si no hay votos

    const home = data.filter((p: any) => p.prediction === 'home_win').length;
    const draw = data.filter((p: any) => p.prediction === 'draw').length;
    const away = data.filter((p: any) => p.prediction === 'away_win').length;

    return {
      home: Math.round((home / total) * 100),
      draw: Math.round((draw / total) * 100),
      away: Math.round((away / total) * 100),
      total
    };
  } catch (error) {
    logger.error('[API] Error al obtener estadísticas de la comunidad:', error);
    return { home: 0, draw: 0, away: 0, total: 0 };
  }
};

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamCode: string;
  awayTeamCode: string;
  date: string;
  status: 'scheduled' | 'live' | 'completed';
  homeGoals?: number;
  awayGoals?: number;
  venue?: string;
  group?: string;
}

export interface Team {
  code: string;
  name: string;
  group?: string;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  points?: number;
}

export interface StandingsData {
  group: string;
  teams: Team[];
}

export interface MatchStats {
  totalMatches: number;
  completedMatches: number;
  liveMatches: number;
  upcomingMatches: number;
  totalGoals: number;
  averageGoalsPerMatch: number;
}

/**
 * Obtener todos los partidos del torneo
 */
export const getAllMatches = async (): Promise<Match[]> => {
  try {
    logger.log('[API] Fetching all matches from WC2026 API...');
    const response = await fetch(`${WC_API_BASE}/matches`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      logger.warn(`[API] WC2026 API returned status ${response.status}`);
      return getDemoMatches();
    }
    
    const data = await response.json();
    logger.log('[API] Matches fetched successfully:', data.matches?.length || 0);
    return data.matches || getDemoMatches();
  } catch (error) {
    logger.error('[API] Error fetching matches:', error);
    return getDemoMatches();
  }
};

/**
 * Datos de demostración si la API no responde
 */
const getDemoMatches = (): Match[] => {
  logger.log('[API] Using demo matches (API unavailable)');
  return [
    {
      id: 'demo_a1',
      homeTeam: 'México',
      awayTeam: 'Canadá',
      homeTeamCode: 'MEX',
      awayTeamCode: 'CAN',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      venue: 'Estadio Azteca',
      group: 'A'
    },
    {
      id: 'demo_b1',
      homeTeam: 'Estados Unidos',
      awayTeam: 'Panamá',
      homeTeamCode: 'USA',
      awayTeamCode: 'PAN',
      date: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      venue: 'SoFi Stadium',
      group: 'B'
    },
    {
      id: 'demo_1',
      homeTeam: 'Argentina',
      awayTeam: 'Arabia Saudita',
      homeTeamCode: 'ARG',
      awayTeamCode: 'KSA',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      venue: 'Lusail Stadium',
      group: 'C'
    },
    {
      id: 'demo_2',
      homeTeam: 'Brasil',
      awayTeam: 'Serbia',
      homeTeamCode: 'BRA',
      awayTeamCode: 'SRB',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      venue: 'SoFi Stadium',
      group: 'D'
    },
    {
      id: 'demo_e1',
      homeTeam: 'España',
      awayTeam: 'Costa Rica',
      homeTeamCode: 'ESP',
      awayTeamCode: 'CRC',
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      venue: 'Al Thumama Stadium',
      group: 'E'
    },
    {
      id: 'demo_f1',
      homeTeam: 'Bélgica',
      awayTeam: 'Marruecos',
      homeTeamCode: 'BEL',
      awayTeamCode: 'MAR',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      venue: 'Ahmad bin Ali Stadium',
      group: 'F'
    }
  ];
};

/**
 * Obtener partidos por Grupo (A, B, C...)
 * Implementación optimizada para el Agente Hermes
 */
export const getMatchesByGroup = async (groupLetter: string): Promise<Match[]> => {
  try {
    const allMatches = await getAllMatches();
    return allMatches.filter(m => 
      m.group?.toUpperCase() === groupLetter.toUpperCase()
    );
  } catch (error) {
    logger.error(`[API] Error al buscar grupo ${groupLetter}:`, error);
    return [];
  }
};

/**
 * Obtener partidos por Fecha específica
 */
export const getMatchesByDate = async (dateString: string): Promise<Match[]> => {
  try {
    const allMatches = await getAllMatches();
    const targetDate = new Date(dateString).toDateString();
    return allMatches.filter(m => 
      new Date(m.date).toDateString() === targetDate
    );
  } catch (error) {
    logger.error(`[API] Error al buscar fecha ${dateString}:`, error);
    return [];
  }
};

/**
 * Obtener partidos por estado
 */
export const getMatchesByStatus = async (status: 'scheduled' | 'live' | 'completed'): Promise<Match[]> => {
  try {
    const allMatches = await getAllMatches();
    return allMatches.filter(m => m.status === status);
  } catch (error) {
    logger.error('[API] Error filtering matches:', error);
    return [];
  }
};

/**
 * Obtener partidos próximos (próximos 7 días)
 */
export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const allMatches = await getAllMatches();
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return allMatches.filter(m => {
      const matchDate = new Date(m.date);
      return matchDate >= now && matchDate <= sevenDaysLater && m.status === 'scheduled';
    });
  } catch (error) {
    logger.error('[API] Error fetching upcoming matches:', error);
    return [];
  }
};

/**
 * Obtener partidos en vivo
 */
export const getLiveMatches = async (): Promise<Match[]> => {
  try {
    return await getMatchesByStatus('live');
  } catch (error) {
    logger.error('[API] Error fetching live matches:', error);
    return [];
  }
};

/**
 * Obtener partidos finalizados
 */
export const getCompletedMatches = async (): Promise<Match[]> => {
  try {
    return await getMatchesByStatus('completed');
  } catch (error) {
    logger.error('[API] Error fetching completed matches:', error);
    return [];
  }
};

/**
 * Obtener standings (clasificaciones por grupo)
 */
export const getStandings = async (): Promise<StandingsData[]> => {
  try {
    logger.log('[API] Fetching standings from WC2026 API...');
    const response = await fetch(`${WC_API_BASE}/standings`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      logger.warn(`[API] WC2026 API standings returned status ${response.status}`);
      return getDemoStandings();
    }
    
    const data = await response.json();
    logger.log('[API] Standings fetched successfully:', data.standings?.length || 0);
    return data.standings || getDemoStandings();
  } catch (error) {
    logger.error('[API] Error fetching standings:', error);
    return getDemoStandings();
  }
};

/**
 * Datos de demostración para standings
 */
const getDemoStandings = (): StandingsData[] => {
  logger.log('[API] Using demo standings (API unavailable)');
  return [
    {
      group: 'A',
      teams: [
        { code: 'MEX', name: 'México', played: 2, points: 4, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2 },
        { code: 'CAN', name: 'Canadá', played: 2, points: 3, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 2, goalDifference: 0 },
        { code: 'USA', name: 'Estados Unidos', played: 2, points: 1, won: 0, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 2, goalDifference: -1 }
      ]
    },
    {
      group: 'B',
      teams: [
        { code: 'ARG', name: 'Argentina', played: 2, points: 6, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4 },
        { code: 'PAR', name: 'Paraguay', played: 2, points: 3, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 2, goalDifference: 0 },
        { code: 'BOL', name: 'Bolivia', played: 2, points: 0, won: 0, drawn: 0, lost: 2, goalsFor: 0, goalsAgainst: 4, goalDifference: -4 }
      ]
    }
  ];
};

/**
 * Obtener estadísticas del torneo
 */
export const getTournamentStats = async (): Promise<MatchStats> => {
  try {
    const matches = await getAllMatches();
    
    const completed = matches.filter(m => m.status === 'completed');
    const live = matches.filter(m => m.status === 'live');
    const upcoming = matches.filter(m => m.status === 'scheduled');
    
    const totalGoals = completed.reduce((sum, m) => sum + (m.homeGoals || 0) + (m.awayGoals || 0), 0);
    
    return {
      totalMatches: matches.length,
      completedMatches: completed.length,
      liveMatches: live.length,
      upcomingMatches: upcoming.length,
      totalGoals,
      averageGoalsPerMatch: completed.length > 0 ? totalGoals / completed.length : 0
    };
  } catch (error) {
    logger.error('[API] Error calculating tournament stats:', error); // ✅ Usa el logger condicional
    return {
      totalMatches: 0,
      completedMatches: 0,
      liveMatches: 0,
      upcomingMatches: 0,
      totalGoals: 0,
      averageGoalsPerMatch: 0
    };
  }
};

/**
 * Obtener partido por ID
 */
export const getMatchById = async (matchId: string): Promise<Match | null> => {
  try {
    const matches = await getAllMatches();
    return matches.find(m => m.id === matchId) || null;
  } catch (error) {
    logger.error('[API] Error fetching match:', error);
    return null;
  }
};

/**
 * Obtener partidos de un equipo específico
 */
export const getTeamMatches = async (teamCode: string): Promise<Match[]> => {
  try {
    const matches = await getAllMatches();
    return matches.filter(m => m.homeTeamCode === teamCode || m.awayTeamCode === teamCode);
  } catch (error) {
    logger.error('[API] Error fetching team matches:', error);
    return [];
  }
};

/**
 * Obtener goleadores del torneo (simulado - la API gratuita no lo proporciona)
 */
export const getTopScorers = async (): Promise<any[]> => {
  // Nota: WC2026 API gratuita no proporciona goleadores
  // Usar TheSportsDB como fallback
  try {
    const response = await fetch('https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=133602');
    if (!response.ok) throw new Error('Failed to fetch scorers');
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    logger.error('[API] Error fetching top scorers:', error);
    return [];
  }
};

/**
 * Obtener logos de equipos (TheSportsDB)
 */
export const getTeamLogo = async (teamName: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=133602`);
    if (!response.ok) throw new Error('Failed to fetch team logo');
    const data = await response.json();
    // Buscar el equipo en los resultados
    const team = data.results?.find((r: any) => r.strTeam === teamName);
    return team?.strTeamBadge || null;
  } catch (error) {
    logger.error('[API] Error fetching team logo:', error);
    return null;
  }
};

/**
 * Calcular puntaje de una predicción
 */
export const calculatePredictionScore = (
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number => {
  // Puntuación:
  // - Resultado exacto: 10 puntos
  // - Ganador correcto: 5 puntos
  // - Empate correcto: 5 puntos
  // - Incorrecto: 0 puntos

  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 10; // Resultado exacto
  }

  const predictedWinner = predictedHome > predictedAway ? 'home' : predictedHome < predictedAway ? 'away' : 'draw';
  const actualWinner = actualHome > actualAway ? 'home' : actualHome < actualAway ? 'away' : 'draw';

  if (predictedWinner === actualWinner) {
    return 5; // Ganador correcto
  }

  return 0; // Incorrecto
};

/**
 * Obtener estadísticas de predicciones (simulado)
 */
export const getPredictionStats = async (predictions: any[]): Promise<any> => {
  try {
    const stats = {
      totalPredictions: predictions.length,
      correctResults: predictions.filter(p => p.score === 10).length,
      correctWinners: predictions.filter(p => p.score === 5).length,
      incorrect: predictions.filter(p => p.score === 0).length,
      averageScore: predictions.length > 0 ? predictions.reduce((sum, p) => sum + p.score, 0) / predictions.length : 0
    };
    return stats;
  } catch (error) {
    logger.error('[API] Error calculating prediction stats:', error);
    return null;
  }
};
