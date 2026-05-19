/**
 * World Cup 2026 API Integration
 * Free API: 100 requests/day, no key required
 * Docs: https://wc2026api.com
 */

const WC_API_BASE = 'https://wc2026api.com/api';

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
    const response = await fetch(`${WC_API_BASE}/matches`);
    if (!response.ok) throw new Error('Failed to fetch matches');
    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Error fetching matches:', error);
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
    console.error('Error filtering matches:', error);
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
    console.error('Error fetching upcoming matches:', error);
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
    console.error('Error fetching live matches:', error);
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
    console.error('Error fetching completed matches:', error);
    return [];
  }
};

/**
 * Obtener standings (clasificaciones por grupo)
 */
export const getStandings = async (): Promise<StandingsData[]> => {
  try {
    const response = await fetch(`${WC_API_BASE}/standings`);
    if (!response.ok) throw new Error('Failed to fetch standings');
    const data = await response.json();
    return data.standings || [];
  } catch (error) {
    console.error('Error fetching standings:', error);
    return [];
  }
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
    console.error('Error calculating tournament stats:', error);
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
    console.error('Error fetching match:', error);
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
    console.error('Error fetching team matches:', error);
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
    console.error('Error fetching top scorers:', error);
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
    console.error('Error fetching team logo:', error);
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
    console.error('Error calculating prediction stats:', error);
    return null;
  }
};
