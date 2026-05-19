import { useState, useEffect, useCallback } from 'react';
import { mundialSupabase } from '../services/mundialSupabaseClient';
import {
  getAllMatches,
  getUpcomingMatches,
  getLiveMatches,
  getCompletedMatches,
  getStandings,
  getTournamentStats,
  calculatePredictionScore,
  Match,
  StandingsData,
  MatchStats
} from '../services/worldcupApi';

export interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  completedPredictions: number;
  pendingPredictions: number;
  averageScore: number;
  topPlayer: any;
  recentActivity: any[];
}

export interface MatchResult {
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  status: 'scheduled' | 'live' | 'completed';
}

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingsData[]>([]);
  const [tournamentStats, setTournamentStats] = useState<MatchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas del dashboard
  const loadDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener usuarios
      const { data: users, error: usersError } = await mundialSupabase
        .from('mundial_users')
        .select('*');

      if (usersError) throw usersError;

      // Obtener predicciones
      const { data: predictions, error: predictionsError } = await mundialSupabase
        .from('mundial_predictions')
        .select('*');

      if (predictionsError) throw predictionsError;

      // Obtener actividad reciente
      const { data: activity, error: activityError } = await mundialSupabase
        .from('mundial_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityError) throw activityError;

      // Calcular estadísticas
      const completedPreds = predictions?.filter(p => p.homeScore !== null && p.awayScore !== null) || [];
      const pendingPreds = predictions?.filter(p => p.homeScore === null || p.awayScore === null) || [];
      const avgScore = completedPreds.length > 0
        ? completedPreds.reduce((sum, p) => sum + (p.score || 0), 0) / completedPreds.length
        : 0;

      // Top player
      const topPlayer = predictions?.reduce((max, p) => (p.score || 0) > (max.score || 0) ? p : max, {});

      setStats({
        totalUsers: users?.length || 0,
        totalPredictions: predictions?.length || 0,
        completedPredictions: completedPreds.length,
        pendingPredictions: pendingPreds.length,
        averageScore: avgScore,
        topPlayer,
        recentActivity: activity || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar partidos
  const loadMatches = useCallback(async () => {
    try {
      const [all, upcoming, live, completed] = await Promise.all([
        getAllMatches(),
        getUpcomingMatches(),
        getLiveMatches(),
        getCompletedMatches()
      ]);

      setMatches(all);
      setUpcomingMatches(upcoming);
      setLiveMatches(live);
      setCompletedMatches(completed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading matches');
    }
  }, []);

  // Cargar standings
  const loadStandings = useCallback(async () => {
    try {
      const data = await getStandings();
      setStandings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading standings');
    }
  }, []);

  // Cargar estadísticas del torneo
  const loadTournamentStats = useCallback(async () => {
    try {
      const data = await getTournamentStats();
      setTournamentStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading tournament stats');
    }
  }, []);

  // Cargar todo al montar
  useEffect(() => {
    loadDashboardStats();
    loadMatches();
    loadStandings();
    loadTournamentStats();

    // Recargar cada 5 minutos
    const interval = setInterval(() => {
      loadDashboardStats();
      loadMatches();
      loadTournamentStats();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadDashboardStats, loadMatches, loadStandings, loadTournamentStats]);

  // Actualizar resultado de un partido
  const updateMatchResult = useCallback(async (matchId: string, homeGoals: number, awayGoals: number) => {
    try {
      // Actualizar en Supabase
      const { error } = await mundialSupabase
        .from('mundial_matches')
        .update({
          homeGoals,
          awayGoals,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) throw error;

      // Recalcular puntajes de predicciones
      const { data: predictions, error: predictionsError } = await mundialSupabase
        .from('mundial_predictions')
        .select('*')
        .eq('matchId', matchId);

      if (predictionsError) throw predictionsError;

      // Actualizar cada predicción con el nuevo puntaje
      for (const prediction of predictions || []) {
        const score = calculatePredictionScore(
          prediction.homeScore,
          prediction.awayScore,
          homeGoals,
          awayGoals
        );

        await mundialSupabase
          .from('mundial_predictions')
          .update({ score })
          .eq('id', prediction.id);
      }

      // Recargar datos
      await loadDashboardStats();
      await loadMatches();

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating match result';
      setError(message);
      return { success: false, error: message };
    }
  }, [loadDashboardStats, loadMatches]);

  // Obtener ranking de usuarios
  const getUserRanking = useCallback(async () => {
    try {
      const { data, error } = await mundialSupabase
        .from('mundial_predictions')
        .select('userId, score')
        .order('score', { ascending: false });

      if (error) throw error;

      // Agrupar por usuario y sumar puntos
      const ranking = data?.reduce((acc: any, pred: any) => {
        const existing = acc.find((r: any) => r.userId === pred.userId);
        if (existing) {
          existing.totalScore += pred.score || 0;
          existing.predictions += 1;
        } else {
          acc.push({
            userId: pred.userId,
            totalScore: pred.score || 0,
            predictions: 1
          });
        }
        return acc;
      }, []) || [];

      return ranking.sort((a: any, b: any) => b.totalScore - a.totalScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching ranking');
      return [];
    }
  }, []);

  // Enviar notificación a todos los usuarios
  const sendNotification = useCallback(async (title: string, message: string) => {
    try {
      const { data: users, error: usersError } = await mundialSupabase
        .from('mundial_users')
        .select('id');

      if (usersError) throw usersError;

      // Crear notificaciones para cada usuario
      const notifications = users?.map(user => ({
        userId: user.id,
        title,
        message,
        read: false,
        created_at: new Date().toISOString()
      })) || [];

      const { error } = await mundialSupabase
        .from('mundial_notifications')
        .insert(notifications);

      if (error) throw error;

      return { success: true, notificationsSent: notifications.length };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error sending notification';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  // Exportar ranking a JSON
  const exportRankingJSON = useCallback(async () => {
    try {
      const ranking = await getUserRanking();
      const json = JSON.stringify(ranking, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ranking-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error exporting ranking';
      setError(message);
      return { success: false, error: message };
    }
  }, [getUserRanking]);

  // Generar mensaje de WhatsApp con ranking
  const generateWhatsAppMessage = useCallback(async () => {
    try {
      const ranking = await getUserRanking();
      let message = '🏆 *Ranking Oráculo Mundial 2026* 🏆\n\n';
      
      ranking.slice(0, 10).forEach((player: any, index: number) => {
        message += `${index + 1}. ${player.userId}: ${player.totalScore} pts\n`;
      });

      message += `\n📊 Total predicciones: ${ranking.reduce((sum: number, p: any) => sum + p.predictions, 0)}\n`;
      message += `🎮 Juega en: https://oraculo-mundial.vercel.app`;

      return message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating message');
      return '';
    }
  }, [getUserRanking]);

  return {
    // State
    stats,
    matches,
    upcomingMatches,
    liveMatches,
    completedMatches,
    standings,
    tournamentStats,
    loading,
    error,

    // Methods
    loadDashboardStats,
    loadMatches,
    loadStandings,
    loadTournamentStats,
    updateMatchResult,
    getUserRanking,
    sendNotification,
    exportRankingJSON,
    generateWhatsAppMessage
  };
};
