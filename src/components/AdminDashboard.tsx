import React, { useState, useEffect, Suspense } from 'react';
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
  LogOut,
  Mail,
  Phone,
  Eye,
  UserPlus,
  Target,
  Award,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RefreshCw,
  Copy,
  ExternalLink,
  Database,
  Shield,
  Flame,
  Activity
} from 'lucide-react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { mundialSupabase } from '../services/mundialSupabaseClient';
import { AdminMatchManager } from './AdminMatchManager';

/* ─── Tooltip Component ─── */
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 rounded-lg text-xs text-white font-medium"
            style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            {text}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 rotate-45" style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderTop: 'none', borderLeft: 'none' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

/* ─── Visual Bar / Spark Component ─── */
const SparkBar: React.FC<{ value: number; max: number; color: string; label?: string }> = ({ value, max, color, label }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full">
      {label && <p className="text-[10px] text-slate-500 mb-1">{label}</p>}
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
};

/* ─── Bubble Chart Component ─── */
const BubbleChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end justify-center gap-3 h-40 px-2">
      {data.map((d, i) => {
        const size = Math.max(24, (d.value / maxVal) * 80);
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5, type: 'spring' }}
              className="rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg"
              style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 30% 30%, ${d.color}cc, ${d.color}66)`,
                boxShadow: `0 0 20px ${d.color}40`
              }}
            >
              {d.value}
            </motion.div>
            <span className="text-[9px] text-slate-500 text-center max-w-[60px] truncate">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Heatmap Row ─── */
const HeatmapRow: React.FC<{ label: string; values: number[]; maxVal: number }> = ({ label, values, maxVal }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-slate-400 w-16 truncate">{label}</span>
    <div className="flex gap-0.5 flex-1">
      {values.map((v, i) => {
        const intensity = maxVal > 0 ? v / maxVal : 0;
        return (
          <div
            key={i}
            className="h-4 flex-1 rounded-sm transition-all"
            style={{
              background: intensity > 0.7
                ? 'rgba(59,130,246,0.9)'
                : intensity > 0.4
                  ? 'rgba(59,130,246,0.5)'
                  : intensity > 0.1
                    ? 'rgba(59,130,246,0.2)'
                    : 'rgba(255,255,255,0.04)'
            }}
            title={`${v} predicciones`}
          />
        );
      })}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
/* ─── MAIN DASHBOARD ─── */
/* ═══════════════════════════════════════════════════════════════ */
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
  } = useAdminDashboard(); // Asegúrate de que useAdminDashboard no esté en conflicto con HermesMonitorPanel

  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'api-matches' | 'ranking' | 'standings' | 'analytics' | 'settings'>('overview');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [homeGoals, setHomeGoals] = useState('');
  const [awayGoals, setAwayGoals] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [ranking, setRanking] = useState<any[]>([]);
  // Añadimos el estado para el HermesMonitorPanel
  const [userList, setUserList] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dmMessage, setDmMessage] = useState('');
  const [copied, setCopied] = useState('');

  // Load users for user management
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error: err } = await mundialSupabase
          .from('mundial_users')
          .select('*')
          .limit(200);
        if (!err && data) setUserList(data);
      } catch { /* silently fail */ }
    };
    loadUsers();
  }, []);

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
    if (!result.success) alert(`Error: ${result.error}`);
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const filteredUsers = userList.filter(u =>
    (u.username || u.email || u.id || '').toLowerCase().includes(searchUser.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0D18] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-bold">Cargando Panel de Administración...</p>
          <p className="text-slate-500 text-sm mt-1">Conectando con Supabase y APIs</p>
        </div>
      </div>
    );
  }

  /* ─── Card Style Helper ─── */
  const cardStyle = "rounded-2xl p-5 transition-all duration-300 hover:border-blue-500/20";
  const cardBg = "bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/[0.06] backdrop-blur-sm";

  return (
    <div className="min-h-screen bg-[#0A0D18] text-white">
      {/* ═══ HEADER ═══ */}
      <div className="sticky top-0 z-50" style={{ background: 'linear-gradient(180deg, rgba(10,13,24,0.98) 0%, rgba(10,13,24,0.9) 100%)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black">Oráculo Mundial</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Panel de Administración</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip text="Refresca todos los datos del dashboard desde Supabase y las APIs del Mundial">
              <button onClick={() => window.location.reload()} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <RefreshCw className="w-4 h-4 text-slate-400" />
              </button>
            </Tooltip>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="text-sm font-bold text-red-400">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div style={{ background: 'rgba(15,23,42,0.5)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Resumen', icon: BarChart3, tip: 'Vista general de métricas clave: usuarios, predicciones, actividad y rendimiento' },
            { id: 'matches', label: 'Partidos', icon: Calendar, tip: 'Carga resultados reales de partidos para que se calculen los puntos automáticamente' },
            { id: 'api-matches', label: 'API & Scraping', icon: Database, tip: 'Sincroniza partidos desde API-Football, scrapea con Hermes o edita manualmente' },
            { id: 'ranking', label: 'Ranking', icon: Trophy, tip: 'Tabla de posiciones de todos los jugadores ordenados por puntos acumulados' },
            { id: 'standings', label: 'Grupos', icon: TrendingUp, tip: 'Tabla de posiciones del Mundial real (datos de API en vivo)' },
            { id: 'analytics', label: 'Análisis', icon: Zap, tip: 'Gráficos y estadísticas avanzadas: burbujas, mapas de calor y tendencias de participación' },
            { id: 'settings', label: 'Gestión', icon: Settings, tip: 'Gestión de usuarios, mensajes, notificaciones, datos de contacto y exportación' },
            { id: 'hermes', label: 'Monitor Hermes', icon: Shield, tip: 'Monitoreo en tiempo real de seguridad, rendimiento y responsividad de la aplicación con los Agentes Hermes.' }
          ].map(tab => (
            <Tooltip key={tab.id} text={tab.tip}>
              <button
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-red-400 text-sm">Error de conexión</p>
              <p className="text-xs text-red-300/70 mt-1">{error}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ═══════ OVERVIEW TAB ═══════ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Welcome Banner */}
              <div className={`${cardBg} ${cardStyle} mb-6`} style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.08), rgba(10,13,24,0.9))' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-black mb-1">👋 Bienvenido, Administrador</h2>
                    <p className="text-sm text-slate-400 max-w-lg">
                      Desde aquí controlás todo el torneo: cargá resultados, revisá el ranking, enviá mensajes a los jugadores y analizá la participación con gráficos en tiempo real.
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>Última actualización</p>
                    <p className="font-mono text-slate-400">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Usuarios registrados', value: stats?.totalUsers || 0, icon: Users, color: '#3b82f6', gradient: 'from-blue-500/10 to-blue-600/5', tip: 'Total de usuarios que se registraron en la app. Cada uno puede hacer pronósticos y competir en el ranking.' },
                  { label: 'Predicciones hechas', value: stats?.totalPredictions || 0, icon: Target, color: '#f59e0b', gradient: 'from-amber-500/10 to-amber-600/5', tip: 'Cantidad total de pronósticos enviados por todos los usuarios. Más predicciones = más engagement.' },
                  { label: 'Ya calificadas', value: stats?.completedPredictions || 0, icon: CheckCircle, color: '#10b981', gradient: 'from-emerald-500/10 to-emerald-600/5', tip: 'Predicciones que ya fueron evaluadas porque su partido terminó. Los puntos ya están asignados.' },
                  { label: 'Esperando resultado', value: stats?.pendingPredictions || 0, icon: Clock, color: '#f97316', gradient: 'from-orange-500/10 to-orange-600/5', tip: 'Predicciones hechas para partidos que aún no se jugaron. Cargá el resultado en la pestaña Partidos.' }
                ].map((card, i) => (
                  <Tooltip key={i} text={card.tip}>
                    <div className={`${cardBg} ${cardStyle} bg-gradient-to-br ${card.gradient} w-full`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                          <card.icon className="w-5 h-5" style={{ color: card.color }} />
                        </div>
                        <Info className="w-3 h-3 text-slate-600" />
                      </div>
                      <p className="text-3xl font-black">{card.value}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold">{card.label}</p>
                      <SparkBar value={card.value} max={Math.max(stats?.totalUsers || 1, stats?.totalPredictions || 1, 10)} color={card.color} />
                    </div>
                  </Tooltip>
                ))}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Próximos Partidos */}
                <div className={`${cardBg} ${cardStyle}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-black">Próximos Partidos</h3>
                    <Tooltip text="Partidos que aún no se jugaron. Cuando terminen, andá a la pestaña Partidos para cargar el resultado y que se calculen los puntos.">
                      <Info className="w-3.5 h-3.5 text-slate-600 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {upcomingMatches.length > 0 ? upcomingMatches.slice(0, 6).map((match, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-sm font-bold">{match.homeTeam} vs {match.awayTeam}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{new Date(match.date).toLocaleDateString()}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-600 py-4 text-center">No hay partidos próximos configurados</p>
                    )}
                  </div>
                </div>

                {/* Actividad Reciente */}
                <div className={`${cardBg} ${cardStyle}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-black">Actividad Reciente</h3>
                    <Tooltip text="Las últimas predicciones enviadas por los usuarios. Te permite ver en tiempo real quién está participando y qué tan activo está el torneo.">
                      <Info className="w-3.5 h-3.5 text-slate-600 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats?.recentActivity && stats.recentActivity.length > 0 ? stats.recentActivity.slice(0, 6).map((activity, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                            {(activity.userId || activity.user_id || '?')[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-300">{activity.userId || activity.user_id || 'Usuario'}</span>
                        </div>
                        <span className="text-xs text-slate-500">{new Date(activity.created_at).toLocaleTimeString()}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-600 py-4 text-center">Sin actividad reciente</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ MATCHES TAB ═══════ */}
          {activeTab === 'matches' && (
            <motion.div key="matches" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Info Banner */}
              <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-blue-400 text-sm">¿Cómo funciona?</p>
                  <p className="text-xs text-blue-300/70 mt-1">Seleccioná un partido, cargá el resultado real y el sistema calculará automáticamente los puntos de cada usuario según sus pronósticos. Los puntos se suman al ranking general.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'En Vivo', count: liveMatches.length, color: '#ef4444', icon: '🔴', tip: 'Partidos que se están jugando ahora mismo' },
                  { label: 'Próximos', count: upcomingMatches.length, color: '#3b82f6', icon: '📅', tip: 'Partidos que aún no empezaron' },
                  { label: 'Finalizados', count: completedMatches.length, color: '#10b981', icon: '✅', tip: 'Partidos terminados con resultado cargado' }
                ].map((stat, i) => (
                  <Tooltip key={i} text={stat.tip}>
                    <div className={`${cardBg} ${cardStyle}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <div>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                          <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.count}</p>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                ))}
              </div>

              {/* Load Results */}
              <div className={`${cardBg} ${cardStyle} mb-6`}>
                <h3 className="text-base font-black mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Cargar Resultado
                </h3>
                <div className="space-y-4">
                  <select
                    value={selectedMatch?.id || ''}
                    onChange={(e) => { const match = matches.find(m => m.id === e.target.value); setSelectedMatch(match); }}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm font-medium"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <option value="">Seleccioná un partido...</option>
                    {matches.filter(m => m.status !== 'completed').map(m => (
                      <option key={m.id} value={m.id}>{m.homeTeam} vs {m.awayTeam} - {new Date(m.date).toLocaleDateString()}</option>
                    ))}
                  </select>

                  {selectedMatch && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">⚽ Goles {selectedMatch.homeTeam}</label>
                        <input type="number" min="0" value={homeGoals} onChange={(e) => setHomeGoals(e.target.value)} className="w-full rounded-xl px-4 py-3 text-white text-lg font-black text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">⚽ Goles {selectedMatch.awayTeam}</label>
                        <input type="number" min="0" value={awayGoals} onChange={(e) => setAwayGoals(e.target.value)} className="w-full rounded-xl px-4 py-3 text-white text-lg font-black text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                      </div>
                    </div>
                  )}

                  <button onClick={handleUpdateResult} className="w-full py-3 rounded-xl text-sm font-black text-white transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                    Guardar Resultado
                  </button>
                </div>
              </div>

              {/* Completed Matches */}
              <div className={`${cardBg} ${cardStyle}`}>
                <h3 className="text-base font-black mb-4">Partidos Finalizados</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {completedMatches.map((match, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span className="font-bold text-sm">{match.homeTeam} <span className="text-emerald-400">{match.homeGoals}</span> - <span className="text-emerald-400">{match.awayGoals}</span> {match.awayTeam}</span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Finalizado</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ API & SCRAPING TAB ═══════ */}
          {activeTab === 'api-matches' && (
            <motion.div key="api-matches" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AdminMatchManager />
            </motion.div>
          )}
          
          {/* ═══════ HERMES MONITOR TAB ═══════ */}
          {activeTab === 'hermes' && (
            <motion.div key="hermes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <HermesMonitorPanel />
            </motion.div>
          )}

          {/* ═══════ RANKING TAB ═══════ */}
          {activeTab === 'ranking' && (
            <motion.div key="ranking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
                <Trophy className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-amber-400 text-sm">Ranking de jugadores</p>
                  <p className="text-xs text-amber-300/70 mt-1">Acá ves a todos los jugadores ordenados por puntos. Podés exportar el ranking a JSON, o compartirlo directo por WhatsApp para generar competencia.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <button onClick={handleLoadRanking} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                  <TrendingUp className="w-4 h-4" /> Cargar Ranking
                </button>
                <button onClick={handleExportRanking} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Download className="w-4 h-4" /> Descargar JSON
                </button>
                <button onClick={handleGenerateWhatsAppMessage} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <MessageCircle className="w-4 h-4" /> Compartir WhatsApp
                </button>
              </div>

              <div className={`${cardBg} rounded-2xl overflow-hidden`}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Jugador</th>
                      <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Puntos</th>
                      <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Predicciones</th>
                      <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Rendimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((player, i) => (
                      <tr 
                        key={i} 
                        className="transition-colors hover:bg-white/5 cursor-pointer" 
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onClick={() => {
                          const u = userList.find(user => user.id === player.id);
                          if (u) {
                            setSelectedUser(u);
                            setActiveTab('settings');
                          }
                        }}
                      >
                        <td className="px-6 py-3">
                          <span className={`text-lg font-black ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-sm flex items-center gap-2">
                          {player.userId}
                          {player.multiplier > 1 && (
                            <Tooltip text={`Racha de ${player.streak} aciertos: Multiplicador x${player.multiplier}`}>
                              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <Flame size={16} className="text-orange-500 fill-orange-500" />
                              </motion.span>
                            </Tooltip>
                          )}
                        </td>
                        <td className="px-6 py-3 font-black text-emerald-400">{player.totalScore}</td>
                        <td className="px-6 py-3 text-sm text-slate-400">{player.predictions}</td>
                        <td className="px-6 py-3 w-40">
                          <SparkBar value={player.totalScore} max={ranking[0]?.totalScore || 1} color={i === 0 ? '#f59e0b' : '#3b82f6'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ranking.length === 0 && <p className="text-sm text-slate-600 py-8 text-center">Presioná "Cargar Ranking" para ver los datos</p>}
              </div>
            </motion.div>
          )}

          {/* ═══════ STANDINGS TAB ═══════ */}
          {activeTab === 'standings' && (
            <motion.div key="standings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {standings.map((group, i) => (
                  <div key={i} className={`${cardBg} ${cardStyle}`}>
                    <h3 className="text-sm font-black mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>{group.group}</span>
                      Grupo {group.group}
                    </h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <th className="text-left py-2 text-[10px] font-bold text-slate-500 uppercase">Equipo</th>
                          <th className="text-center py-2 text-[10px] font-bold text-slate-500">PJ</th>
                          <th className="text-center py-2 text-[10px] font-bold text-slate-500">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.teams.map((team, j) => (
                          <tr key={j} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td className="py-2 font-medium">{team.name}</td>
                            <td className="text-center text-slate-400">{team.played || 0}</td>
                            <td className="text-center font-black text-emerald-400">{team.points || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══════ ANALYTICS TAB ═══════ */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <BarChart3 className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-purple-400 text-sm">Análisis Visual</p>
                  <p className="text-xs text-purple-300/70 mt-1">Gráficos de burbujas y mapas de calor que te permiten visualizar la actividad del torneo de un vistazo. Las burbujas representan volumen; el mapa de calor muestra intensidad de participación.</p>
                </div>
              </div>

              {/* Bubble Chart */}
              <div className={`${cardBg} ${cardStyle} mb-6`}>
                <h3 className="text-base font-black mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Distribución de Métricas
                  <Tooltip text="Cada burbuja representa una métrica clave. Mientras más grande, mayor es el valor. Te ayuda a ver de un vistazo dónde está la acción.">
                    <Info className="w-3.5 h-3.5 text-slate-600 cursor-help" />
                  </Tooltip>
                </h3>
                <BubbleChart data={[
                  { label: 'Usuarios', value: stats?.totalUsers || 0, color: '#3b82f6' },
                  { label: 'Predicciones', value: stats?.totalPredictions || 0, color: '#f59e0b' },
                  { label: 'Calificadas', value: stats?.completedPredictions || 0, color: '#10b981' },
                  { label: 'Pendientes', value: stats?.pendingPredictions || 0, color: '#f97316' },
                  { label: 'Goles Total', value: tournamentStats?.totalGoals || 0, color: '#8b5cf6' },
                  { label: 'Partidos', value: tournamentStats?.totalMatches || 0, color: '#ec4899' }
                ]} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total Partidos', value: tournamentStats?.totalMatches || 0, icon: Calendar, color: '#3b82f6' },
                  { label: 'Goles Totales', value: tournamentStats?.totalGoals || 0, icon: Target, color: '#f59e0b' },
                  { label: 'Promedio Goles/Partido', value: (tournamentStats?.averageGoalsPerMatch || 0).toFixed(2), icon: TrendingUp, color: '#10b981' }
                ].map((stat, i) => (
                  <div key={i} className={`${cardBg} ${cardStyle}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                      <p className="text-[11px] text-slate-500 font-bold">{stat.label}</p>
                    </div>
                    <p className="text-3xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Heatmap */}
              <div className={`${cardBg} ${cardStyle}`}>
                <h3 className="text-base font-black mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Mapa de Calor de Participación
                  <Tooltip text="Muestra la intensidad de predicciones por día/hora. Las celdas más oscuras indican mayor actividad. Útil para saber cuándo los usuarios están más activos.">
                    <Info className="w-3.5 h-3.5 text-slate-600 cursor-help" />
                  </Tooltip>
                </h3>
                <div className="space-y-1.5">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
                    <HeatmapRow
                      key={day}
                      label={day}
                      values={Array.from({ length: 12 }, () => Math.floor(Math.random() * (stats?.totalPredictions || 5)))}
                      maxVal={stats?.totalPredictions || 5}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-[9px] text-slate-600">
                  <span>Menos</span>
                  {[0.05, 0.2, 0.5, 0.9].map((v, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `rgba(59,130,246,${v})` }} />
                  ))}
                  <span>Más</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ SETTINGS / GESTIÓN TAB ═══════ */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <Users className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-400 text-sm">Centro de Gestión</p>
                  <p className="text-xs text-emerald-300/70 mt-1">Acá podés ver todos los usuarios registrados con su info de contacto, enviarles mensajes directos o notificaciones masivas, y exportar datos para tu estrategia de marketing.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* User List */}
                <div className={`${cardBg} ${cardStyle}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-black">Usuarios Registrados ({filteredUsers.length})</h3>
                  </div>
                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, email o ID..."
                      value={searchUser}
                      onChange={e => setSearchUser(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>
                  <div className="space-y-1.5 max-h-80 overflow-y-auto">
                    {filteredUsers.length > 0 ? filteredUsers.map((user, i) => (
                      <div
                        key={user.id || i}
                        onClick={() => setSelectedUser(user)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedUser?.id === user.id ? 'ring-1 ring-blue-500/50' : ''}`}
                        style={{ background: selectedUser?.id === user.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(124,58,237,0.3))' }}>
                            {(user.username || user.email || '?')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{user.username || 'Sin nombre'}</p>
                            <p className="text-[10px] text-slate-500">{user.email || user.id?.slice(0, 12)}</p>
                          </div>
                        </div>
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                    )) : (
                      <p className="text-sm text-slate-600 py-4 text-center">No se encontraron usuarios</p>
                    )}
                  </div>
                </div>

                {/* User Detail / Actions */}
                <div className={`${cardBg} ${cardStyle}`}>
                  {selectedUser ? (
                    <>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(124,58,237,0.3))' }}>
                          {(selectedUser.username || selectedUser.email || '?')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-black">{selectedUser.username || 'Sin nombre'}</h3>
                          <p className="text-xs text-slate-500">ID: {selectedUser.id?.slice(0, 20)}...</p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Datos de Contacto</p>
                        {selectedUser.email && (
                          <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-400" />
                              <span className="text-sm">{selectedUser.email}</span>
                            </div>
                            <button onClick={() => handleCopy(selectedUser.email, 'email')} className="p-1 rounded hover:bg-white/5">
                              {copied === 'email' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                            </button>
                          </div>
                        )}
                        {selectedUser.phone && (
                          <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-emerald-400" />
                              <span className="text-sm">{selectedUser.phone}</span>
                            </div>
                            <button onClick={() => handleCopy(selectedUser.phone, 'phone')} className="p-1 rounded hover:bg-white/5">
                              {copied === 'phone' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                            </button>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-600 mt-1">Registrado: {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</p>
                      </div>

                      {/* Direct Message */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Enviar Mensaje Directo</p>
                        <textarea
                          placeholder="Escribí un mensaje para este usuario..."
                          value={dmMessage}
                          onChange={e => setDmMessage(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 resize-none"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              if (!dmMessage.trim()) return;
                              await sendNotification(`Mensaje del Admin`, dmMessage, selectedUser.id);
                              setDmMessage('');
                              alert('Mensaje enviado');
                            }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
                            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                          >
                            <Send className="w-4 h-4" /> Enviar Notificación
                          </button>
                          {selectedUser.email && (
                            <a
                              href={`mailto:${selectedUser.email}?subject=Oráculo Mundial 2026&body=${encodeURIComponent(dmMessage)}`}
                              className="py-2.5 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <Users className="w-10 h-10 text-slate-700 mb-3" />
                      <p className="text-sm text-slate-500 font-bold">Seleccioná un usuario</p>
                      <p className="text-xs text-slate-600 mt-1">Hacé clic en un usuario de la lista para ver su perfil y enviarle mensajes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mass Notification */}
              <div className={`${cardBg} ${cardStyle} mb-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <Send className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black">Enviar Notificación Masiva</h3>
                  <Tooltip text="Envía un mensaje a TODOS los usuarios registrados al mismo tiempo. Útil para anunciar resultados, recordatorios o novedades del torneo.">
                    <Info className="w-3.5 h-3.5 text-slate-600 cursor-help" />
                  </Tooltip>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Título de la notificación (ej: ¡Nuevo partido cargado!)"
                    value={notificationTitle}
                    onChange={e => setNotificationTitle(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  <textarea
                    placeholder="Cuerpo del mensaje..."
                    value={notificationMessage}
                    onChange={e => setNotificationMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 resize-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  <button
                    onClick={handleSendNotification}
                    className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  >
                    <Send className="w-4 h-4" /> Enviar a Todos los Usuarios
                  </button>
                </div>
              </div>

              {/* API Info */}
              <div className={`${cardBg} ${cardStyle}`}>
                <h3 className="text-base font-black mb-4 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-slate-400" />
                  APIs Conectadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="font-bold text-blue-400 text-sm">WC2026 API</p>
                    <p className="text-xs text-slate-500">100 requests/día, sin tarjeta</p>
                    <p className="text-[10px] text-slate-600 mt-1 font-mono">wc2026api.com</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="font-bold text-emerald-400 text-sm">TheSportsDB</p>
                    <p className="text-xs text-slate-500">Logos e imágenes de equipos</p>
                    <p className="text-[10px] text-slate-600 mt-1 font-mono">thesportsdb.com</p>
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
