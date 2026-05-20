import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, TrendingUp, Shield, Zap, ChevronRight } from 'lucide-react';

interface OracleAdvisorProps {
  homeTeam: string;
  awayTeam: string;
  homeCode: string;
  awayCode: string;
  group: string;
  onClose: () => void;
}

// Datos estáticos de análisis por equipo (sin API externa)
const TEAM_STATS: Record<string, { attack: number; defense: number; form: string; trend: 'up' | 'down' | 'stable' }> = {
  ARG: { attack: 92, defense: 85, form: 'VVVEV', trend: 'up' },
  BRA: { attack: 90, defense: 88, form: 'VVVVE', trend: 'stable' },
  FRA: { attack: 91, defense: 87, form: 'VEVVV', trend: 'up' },
  ESP: { attack: 88, defense: 86, form: 'VVVVV', trend: 'up' },
  GER: { attack: 85, defense: 83, form: 'VVEVV', trend: 'stable' },
  ENG: { attack: 84, defense: 82, form: 'VVVEV', trend: 'up' },
  POR: { attack: 87, defense: 80, form: 'VVVVE', trend: 'stable' },
  ITA: { attack: 80, defense: 88, form: 'EVVVV', trend: 'up' },
  MEX: { attack: 75, defense: 72, form: 'VEVVD', trend: 'stable' },
  USA: { attack: 76, defense: 74, form: 'VVEVD', trend: 'up' },
  CAN: { attack: 72, defense: 70, form: 'VVDVE', trend: 'up' },
  URU: { attack: 78, defense: 80, form: 'VVVDE', trend: 'stable' },
  COL: { attack: 77, defense: 73, form: 'VVEVV', trend: 'up' },
  MAR: { attack: 74, defense: 82, form: 'VVVEV', trend: 'up' },
  JPN: { attack: 73, defense: 75, form: 'VEVVD', trend: 'stable' },
  KOR: { attack: 71, defense: 70, form: 'VVDVE', trend: 'stable' },
  SEN: { attack: 76, defense: 74, form: 'VVVDE', trend: 'up' },
  NED: { attack: 83, defense: 81, form: 'VVVEV', trend: 'stable' },
  BEL: { attack: 82, defense: 79, form: 'VVEVV', trend: 'down' },
  DEFAULT: { attack: 68, defense: 66, form: 'VDVEV', trend: 'stable' },
};

const getStats = (code: string) => TEAM_STATS[code] || TEAM_STATS.DEFAULT;

const formColor = (c: string) => {
  if (c === 'V') return 'bg-emerald-500';
  if (c === 'E') return 'bg-amber-500';
  return 'bg-red-500';
};

const trendIcon = (t: 'up' | 'down' | 'stable') => {
  if (t === 'up') return '📈';
  if (t === 'down') return '📉';
  return '➡️';
};

// Genera predicción del Oráculo basada en stats
const generateOraclePrediction = (homeCode: string, awayCode: string) => {
  const home = getStats(homeCode);
  const away = getStats(awayCode);

  const homeScore = (home.attack * 0.6 + home.defense * 0.4) / 10;
  const awayScore = (away.attack * 0.6 + away.defense * 0.4) / 10;
  const diff = homeScore - awayScore;

  if (diff > 1.5) return { result: 'Victoria Local', confidence: 72 + Math.floor(diff * 3), emoji: '🏠' };
  if (diff < -1.5) return { result: 'Victoria Visitante', confidence: 68 + Math.floor(Math.abs(diff) * 3), emoji: '✈️' };
  return { result: 'Empate posible', confidence: 45 + Math.floor(Math.abs(diff) * 5), emoji: '⚖️' };
};

export const OracleAdvisor: React.FC<OracleAdvisorProps> = ({
  homeTeam, awayTeam, homeCode, awayCode, group, onClose
}) => {
  const [tab, setTab] = useState<'oracle' | 'stats' | 'form'>('oracle');
  const homeStats = getStats(homeCode);
  const awayStats = getStats(awayCode);
  const prediction = generateOraclePrediction(homeCode, awayCode);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0f2e 0%, #1a1a3e 50%, #0f0f2e 100%)', border: '1px solid rgba(168,85,247,0.3)' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm">ORÁCULO ESTELAR</p>
              <p className="text-purple-400 text-xs">Análisis IA · Grupo {group}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={14} className="text-gray-400" />
          </button>
        </div>

        {/* Match title */}
        <div className="px-5 py-3 text-center">
          <p className="text-white font-black text-lg">
            {homeTeam} <span className="text-purple-400">vs</span> {awayTeam}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex px-5 gap-2 mb-4">
          {(['oracle', 'stats', 'form'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                backgroundColor: tab === t ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)',
                color: tab === t ? '#c084fc' : '#9ca3af',
                border: tab === t ? '1px solid rgba(168,85,247,0.5)' : '1px solid transparent'
              }}>
              {t === 'oracle' ? '🔮 Predicción' : t === 'stats' ? '📊 Stats' : '📋 Forma'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 pb-5">
          <AnimatePresence mode="wait">
            {tab === 'oracle' && (
              <motion.div key="oracle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Oracle prediction card */}
                <div className="rounded-xl p-4 mb-3 text-center"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1))', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <p className="text-4xl mb-2">{prediction.emoji}</p>
                  <p className="text-white font-black text-lg">{prediction.result}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="h-1.5 rounded-full overflow-hidden flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: `${prediction.confidence}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }} />
                    </div>
                    <span className="text-purple-400 text-xs font-bold">{prediction.confidence}%</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Confianza del Oráculo</p>
                </div>

                {/* Key factors */}
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Factores Clave</p>
                <div className="space-y-2">
                  {[
                    { icon: '⚔️', label: 'Ataque', home: homeStats.attack, away: awayStats.attack },
                    { icon: '🛡️', label: 'Defensa', home: homeStats.defense, away: awayStats.defense },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2">
                      <span className="text-sm w-5">{f.icon}</span>
                      <span className="text-gray-400 text-xs w-14">{f.label}</span>
                      <div className="flex-1 flex items-center gap-1">
                        <span className="text-white text-xs font-bold w-6 text-right">{f.home}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${f.home}%`, background: f.home > f.away ? '#10b981' : '#6b7280' }} />
                        </div>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full ml-auto"
                            style={{ width: `${f.away}%`, background: f.away > f.home ? '#10b981' : '#6b7280' }} />
                        </div>
                        <span className="text-white text-xs font-bold w-6">{f.away}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { team: homeTeam, code: homeCode, stats: homeStats },
                    { team: awayTeam, code: awayCode, stats: awayStats },
                  ].map(t => (
                    <div key={t.code} className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <p className="text-white font-black text-sm mb-3 truncate">{t.team}</p>
                      {[
                        { label: 'Ataque', value: t.stats.attack, icon: <Zap size={12} /> },
                        { label: 'Defensa', value: t.stats.defense, icon: <Shield size={12} /> },
                        { label: 'Tendencia', value: null, icon: <TrendingUp size={12} /> },
                      ].map(s => (
                        <div key={s.label} className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400 text-xs flex items-center gap-1">{s.icon}{s.label}</span>
                            {s.value !== null
                              ? <span className="text-white text-xs font-bold">{s.value}</span>
                              : <span className="text-xs">{trendIcon(t.stats.trend)}</span>
                            }
                          </div>
                          {s.value !== null && (
                            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                              <div className="h-full rounded-full"
                                style={{ width: `${s.value}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {[
                  { team: homeTeam, stats: homeStats },
                  { team: awayTeam, stats: awayStats },
                ].map(t => (
                  <div key={t.team} className="mb-4">
                    <p className="text-white font-bold text-sm mb-2">{t.team}</p>
                    <div className="flex gap-1.5">
                      {t.stats.form.split('').map((c, i) => (
                        <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black ${formColor(c)}`}>
                          {c}
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Últimos 5 partidos (más reciente →)</p>
                  </div>
                ))}
                <div className="flex gap-3 mt-2">
                  {[['V', 'Victoria', 'bg-emerald-500'], ['E', 'Empate', 'bg-amber-500'], ['D', 'Derrota', 'bg-red-500']].map(([k, l, c]) => (
                    <div key={k} className="flex items-center gap-1">
                      <div className={`w-4 h-4 rounded ${c} flex items-center justify-center text-white text-xs font-black`}>{k}</div>
                      <span className="text-gray-400 text-xs">{l}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-5">
          <button onClick={onClose}
            className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            Hacer mi Pronóstico <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OracleAdvisor;
