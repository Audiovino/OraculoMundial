import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  Trophy,
  TrendingUp,
  Calendar,
  Send,
  Download,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  LogOut
} from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

const AdminDashboard: React.FC = () => {
  const {
    stats,
    matches,
    upcomingMatches,
    liveMatches,
    completedMatches,
    standings,
    tournamentStats,
    loading,
    error,
    updateMatchResult,
    getUserRanking,
    sendNotification,
    exportRankingJSON,
    generateWhatsAppMessage
  } = useAdminDashboard();

  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'ranking' | 'standings' | 'analytics' | 'settings'>('overview');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [homeGoals, setHomeGoals] = useState('');
  const [awayGoals, setAwayGoals] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [ranking, setRanking] = useState<any[]>([]);

  const handleUpdateResult = async () => {
    if (!selectedMatch || homeGoals === '' || awayGoals === '') {
      alert('Por favor completa todos los campos');
      return;
    }

    const result = await updateMatchResult(selectedMatch.id, parseInt(homeGoals), parseInt(awayGoals));
    if (result.success) {
      alert('Resultado actualizado correctamente');
      setSelectedMatch(null);
      setHomeGoals('');
      setAwayGoals('');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      alert('Por favor completa título y mensaje');
      return;
    }

    const result = await sendNotification(notificationTitle, notificationMessage);
    if (result.success) {
      alert(`Notificación enviada a ${result.notificationsSent} usuarios`);
      setNotificationTitle('');
      setNotificationMessage('');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleExportRanking = async () => {
    const result = await exportRankingJSON();
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
  };

  const handleGenerateWhatsAppMessage = async () => {
    const message = await generateWhatsAppMessage();
    if (message) {
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const handleLoadRanking = async () => {
    const data = await getUserRanking();
    setRanking(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0D18] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D18] text-white">
      {/* Header */}
      <div className="bg-slate-950/50 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-black">Oráculo Mundial - Admin</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-bold">Salir</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-950/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Resumen', icon: BarChart3 },
            { id: 'matches', label: '⚽ Partidos', icon: Calendar },
            { id: 'ranking', label: '🏆 Ranking', icon: Trophy },
            { id: 'standings', label: '📈 Grupos', icon: TrendingUp },
            { id: 'analytics', label: '📉 Análisis', icon: Zap },
            { id: 'settings', label: '⚙️ Configuración', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-red-400">Error</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Usuarios', value: stats?.totalUsers || 0, icon: Users, color: 'blue' },
                  { label: 'Predicciones', value: stats?.totalPredictions || 0, icon: Trophy, color: 'amber' },
                  { label: 'Completadas', value: stats?.completedPredictions || 0, icon: CheckCircle, color: 'emerald' },
                  { label: 'Pendientes', value: stats?.pendingPredictions || 0, icon: Clock, color: 'orange' }
                ].map((card, i) => (
                  <div key={i} className="bg-slate-900/50 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-bold">{card.label}</p>
                        <p className="text-3xl font-black mt-2">{card.value}</p>
                      </div>
                      <card.icon className={`w-8 h-8 text-${card.color}-500`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Próximos Partidos */}
                <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Próximos Partidos
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {upcomingMatches.slice(0, 5).map((match, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <span className="text-sm font-bold">{match.homeTeam} vs {match.awayTeam}</span>
                        <span className="text-xs text-slate-400">{new Date(match.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actividad Reciente */}
                <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Actividad Reciente
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats?.recentActivity?.slice(0, 5).map((activity, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded text-sm">
                        <span className="text-slate-300">{activity.userId}</span>
                        <span className="text-xs text-slate-500">{new Date(activity.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MATCHES TAB */}
          {activeTab === 'matches' && (
            <motion.div key="matches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'En Vivo', count: liveMatches.length, color: 'red' },
                  { label: 'Próximos', count: upcomingMatches.length, color: 'blue' },
                  { label: 'Finalizados', count: completedMatches.length, color: 'emerald' }
                ].map((stat, i) => (
                  <div key={i} className={`bg-${stat.color}-500/10 border border-${stat.color}-500/30 rounded-lg p-4`}>
                    <p className={`text-${stat.color}-400 text-sm font-bold`}>{stat.label}</p>
                    <p className="text-3xl font-black mt-2">{stat.count}</p>
                  </div>
                ))}
              </div>

              {/* Cargar Resultados */}
              <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-black mb-4">Cargar Resultado</h3>
                <div className="space-y-4">
                  <select
                    value={selectedMatch?.id || ''}
                    onChange={(e) => {
                      const match = matches.find(m => m.id === e.target.value);
                      setSelectedMatch(match);
                    }}
                    className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white"
                  >
                    <option value="">Selecciona un partido...</option>
                    {matches.filter(m => m.status !== 'completed').map(m => (
                      <option key={m.id} value={m.id}>
                        {m.homeTeam} vs {m.awayTeam} - {new Date(m.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>

                  {selectedMatch && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-400">Goles {selectedMatch.homeTeam}</label>
                        <input
                          type="number"
                          min="0"
                          value={homeGoals}
                          onChange={(e) => setHomeGoals(e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-400">Goles {selectedMatch.awayTeam}</label>
                        <input
                          type="number"
                          min="0"
                          value={awayGoals}
                          onChange={(e) => setAwayGoals(e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleUpdateResult}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors"
                  >
                    Guardar Resultado
                  </button>
                </div>
              </div>

              {/* Partidos Finalizados */}
              <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-black mb-4">Partidos Finalizados</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {completedMatches.map((match, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                      <span className="font-bold">{match.homeTeam} {match.homeGoals} - {match.awayGoals} {match.awayTeam}</span>
                      <span className="text-xs text-emerald-400">✓ Finalizado</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* RANKING TAB */}
          {activeTab === 'ranking' && (
            <motion.div key="ranking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleLoadRanking}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Cargar Ranking
                </button>
                <button
                  onClick={handleExportRanking}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar JSON
                </button>
                <button
                  onClick={handleGenerateWhatsAppMessage}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Compartir WhatsApp
                </button>
              </div>

              <div className="bg-slate-900/50 border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-black">Posición</th>
                      <th className="px-6 py-3 text-left text-sm font-black">Usuario</th>
                      <th className="px-6 py-3 text-left text-sm font-black">Puntos</th>
                      <th className="px-6 py-3 text-left text-sm font-black">Predicciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((player, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-3 font-black text-lg">#{i + 1}</td>
                        <td className="px-6 py-3">{player.userId}</td>
                        <td className="px-6 py-3 font-black text-emerald-400">{player.totalScore}</td>
                        <td className="px-6 py-3 text-slate-400">{player.predictions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* STANDINGS TAB */}
          {activeTab === 'standings' && (
            <motion.div key="standings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {standings.map((group, i) => (
                  <div key={i} className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-black mb-4">Grupo {group.group}</h3>
                    <table className="w-full text-sm">
                      <thead className="border-b border-white/10">
                        <tr>
                          <th className="text-left py-2 font-bold">Equipo</th>
                          <th className="text-center py-2 font-bold">PJ</th>
                          <th className="text-center py-2 font-bold">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.teams.map((team, j) => (
                          <tr key={j} className="border-b border-white/5">
                            <td className="py-2">{team.name}</td>
                            <td className="text-center">{team.played || 0}</td>
                            <td className="text-center font-bold text-emerald-400">{team.points || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Total Partidos', value: tournamentStats?.totalMatches || 0 },
                  { label: 'Goles Totales', value: tournamentStats?.totalGoals || 0 },
                  { label: 'Promedio Goles/Partido', value: (tournamentStats?.averageGoalsPerMatch || 0).toFixed(2) }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                    <p className="text-slate-400 text-sm font-bold">{stat.label}</p>
                    <p className="text-3xl font-black mt-2">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-black mb-4">Estadísticas del Torneo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Partidos Completados</span>
                    <span className="font-bold">{tournamentStats?.completedMatches || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Partidos en Vivo</span>
                    <span className="font-bold text-red-400">{tournamentStats?.liveMatches || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Partidos Próximos</span>
                    <span className="font-bold text-blue-400">{tournamentStats?.upcomingMatches || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-black mb-4">Enviar Notificación</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Título de la notificación"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white placeholder-slate-500"
                  />
                  <textarea
                    placeholder="Mensaje"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white placeholder-slate-500"
                  />
                  <button
                    onClick={handleSendNotification}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar a Todos
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-black mb-4">Información de la API</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-bold text-blue-400">WC2026 API</p>
                    <p className="text-slate-400">100 requests/día, sin tarjeta</p>
                    <p className="text-xs text-slate-500">https://wc2026api.com</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-400">TheSportsDB</p>
                    <p className="text-slate-400">Logos e imágenes de equipos</p>
                    <p className="text-xs text-slate-500">https://www.thesportsdb.com</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
