import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, LogIn, Copy, Check, Trophy, X, Crown, PlayCircle } from 'lucide-react';
import { mundialSupabase } from '../services/mundialSupabaseClient';
import { useMundialAuth } from '../contexts/MundialAuthContext';

interface League {
  id: string;
  nombre: string;
  codigo_invitacion: string;
  creador_id: string;
  memberCount?: number;
}

interface LeagueMember {
  username: string;
  total_points: number;
  position: number;
}

const generateCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export const PrivateLeague: React.FC = () => {
  const { user } = useMundialAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [mode, setMode] = useState<'list' | 'create' | 'join'>('list');
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);

  // Cargar ligas del usuario
  useEffect(() => {
    if (!user?.id) return;
    loadLeagues();
  }, [user?.id]);

  const loadLeagues = async () => {
    if (!user?.id) return;
    try {
      // Intentar cargar desde Supabase
      const { data, error } = await mundialSupabase
        .from('private_leagues')
        .select('*')
        .eq('creador_id', user.id);

      if (!error && data) {
        setLeagues(data);
      } else {
        console.warn('[PrivateLeague] loadLeagues Supabase error:', error);
        const local = localStorage.getItem(`leagues_${user.id}`);
        if (local) setLeagues(JSON.parse(local));
      }
    } catch (supabaseError) {
      console.warn('[PrivateLeague] loadLeagues caught error:', supabaseError);
      const local = localStorage.getItem(`leagues_${user.id}`);
      if (local) setLeagues(JSON.parse(local));
    }
  };

  const createLeague = async () => {
    if (!newName.trim()) {
      setError('El nombre de la liga no puede estar vacío.');
      return;
    }
    if (!user?.id) {
      setError('Debés iniciar sesión para crear una liga.');
      return;
    }

    setLoading(true);
    setError('');

    const code = generateCode();
    const leagueId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `league_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;

    const newLeague: League = {
      id: leagueId,
      nombre: newName.trim(),
      codigo_invitacion: code,
      creador_id: user.id,
    };

    try {
      const { error } = await mundialSupabase
        .from('private_leagues')
        .insert([newLeague]);

      if (error) throw error;
    } catch (supabaseError: any) {
      console.warn('[PrivateLeague] Supabase createLeague error:', supabaseError);
      setError('No se pudo crear la liga en Supabase; se guardará localmente.');
    }

    const updated = [...leagues, newLeague];
    setLeagues(updated);
    localStorage.setItem(`leagues_${user.id}`, JSON.stringify(updated));
    setNewName('');
    setMode('list');
    setLoading(false);
  };

  const joinLeague = async () => {
    if (!joinCode.trim()) {
      setError('El código de invitación no puede estar vacío.');
      return;
    }
    if (!user?.id) {
      setError('Debés iniciar sesión para unirte a una liga.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await mundialSupabase
        .from('private_leagues')
        .select('*')
        .eq('codigo_invitacion', joinCode.toUpperCase())
        .single();

      if (error || !data) {
        console.warn('[PrivateLeague] joinLeague Supabase lookup error:', error);
        setError('Código inválido. Verificá que esté bien escrito.');
        setLoading(false);
        return;
      }

      const { error: joinError } = await mundialSupabase
        .from('league_members')
        .upsert([{ liga_id: data.id, user_id: user.id }]);

      if (joinError) {
        console.warn('[PrivateLeague] joinLeague upsert error:', joinError);
        setError('No se pudo unir a la liga. Intentá de nuevo.');
        setLoading(false);
        return;
      }

      const updated = [...leagues, data];
      setLeagues(updated);
      localStorage.setItem(`leagues_${user.id}`, JSON.stringify(updated));
      setJoinCode('');
      setMode('list');
    } catch (supabaseError) {
      console.warn('[PrivateLeague] joinLeague caught error:', supabaseError);
      setError('Error al unirse. Intentá de nuevo.');
    }
    setLoading(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadLeagueRanking = async (league: League) => {
    setSelectedLeague(league);
    // Ranking simulado mientras se implementa el backend completo
    setMembers([
      { username: user?.username || 'Vos', total_points: 45, position: 1 },
      { username: 'Amigo 1', total_points: 38, position: 2 },
      { username: 'Amigo 2', total_points: 31, position: 3 },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-purple-400" />
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Mini-Ligas</h3>
            <button
              onClick={() => setShowTutorial(prev => !prev)}
              className="flex items-center gap-1.5 px-2 py-1 ml-2 rounded-lg text-[10px] font-bold transition-all"
              style={{
                backgroundColor: 'rgba(234,179,8,0.15)',
                color: '#facc15',
                border: '1px solid rgba(234,179,8,0.3)'
              }}
            >
              <PlayCircle size={12} /> Video tutorial
            </button>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(mode === 'create' ? 'list' : 'create')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                backgroundColor: mode === 'create' ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.1)',
                color: '#c084fc',
                border: '1px solid rgba(168,85,247,0.3)'
              }}
            >
              <Plus size={12} /> Crear
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(mode === 'join' ? 'list' : 'join')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                backgroundColor: mode === 'join' ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.1)',
                color: '#60a5fa',
                border: '1px solid rgba(59,130,246,0.3)'
              }}
            >
              <LogIn size={12} /> Unirse
            </motion.button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">Qué hace</p>
          <p className="mt-2 text-sm leading-6 text-gray-200">
            Mini-Ligas es una competencia privada para tus pronósticos del Mundial. Crear una liga permite invitar a amigos con un código y comparar solo sus resultados entre ustedes. No cambia los partidos: usa los mismos pronósticos que ya ingresás en la app.
          </p>
        </div>
      </div>

      {/* Tutorial video embed */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              boxShadow: [
                '0 0 20px rgba(139, 92, 246, 0.1), 0 10px 30px rgba(0,0,0,0.5)',
                '0 0 35px rgba(139, 92, 246, 0.3), 0 10px 35px rgba(0,0,0,0.5)',
                '0 0 20px rgba(139, 92, 246, 0.1), 0 10px 30px rgba(0,0,0,0.5)'
              ]
            }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            whileHover={{ 
              scale: 1.015,
              borderColor: 'rgba(139, 92, 246, 0.4)',
              transition: { duration: 0.3 }
            }}
            transition={{
              boxShadow: {
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut'
              },
              default: {
                type: 'spring',
                damping: 25,
                stiffness: 120
              }
            }}
            className="rounded-3xl overflow-hidden border border-white/10 bg-[#0A0D18] relative"
          >
            <div className="flex items-center justify-between gap-3 p-3 bg-[#0d111d] border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Video tutorial</p>
                <h4 className="text-sm font-black text-white font-sans">Mini-Ligas</h4>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-slate-400 text-xs font-semibold hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cerrar
              </button>
            </div>
            <div className="aspect-video bg-[#0A0D18] relative w-full overflow-hidden">
              <iframe
                title="Tutorial Mini-Ligas"
                src="https://hyperframes-mini-video.vercel.app/"
                className="absolute top-0 left-0 w-full h-full border-0"
                style={{ border: 'none', background: '#0A0D18', width: '100%', height: '100%' }}
                loading="lazy"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <AnimatePresence>
        {mode === 'create' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            <p className="text-purple-400 text-xs font-bold uppercase tracking-wider">Nueva Liga</p>
            <input
              type="text"
              placeholder="Nombre de la liga (ej: Trabajo 2026)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              maxLength={40}
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onKeyDown={e => e.key === 'Enter' && createLeague()}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              onClick={createLeague}
              disabled={!newName.trim() || loading}
              className="w-full py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              {loading ? 'Creando...' : 'Crear Liga'}
            </button>
          </motion.div>
        )}

        {mode === 'join' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">Unirse con Código</p>
            <input
              type="text"
              placeholder="Código de invitación (ej: ABC123)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none font-mono tracking-widest"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onKeyDown={e => e.key === 'Enter' && joinLeague()}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              onClick={joinLeague}
              disabled={!joinCode.trim() || loading}
              className="w-full py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
            >
              {loading ? 'Buscando...' : 'Unirse'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* League list */}
      {leagues.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No tenés ligas todavía.</p>
          <p className="text-gray-600 text-xs mt-1">
            Las ligas agrupan a tus pronósticos del Mundial con un grupo de amigos. Creá una liga para competir solo entre ustedes.
          </p>
          <p className="text-gray-600 text-xs mt-1">Usá el botón Crear o Unirse para empezar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leagues.map(league => (
            <motion.div
              key={league.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => loadLeagueRanking(league)}
              className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(168,85,247,0.2)' }}>
                  <Trophy size={14} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{league.nombre}</p>
                  <p className="text-gray-500 text-xs font-mono">{league.codigo_invitacion}</p>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); copyCode(league.codigo_invitacion); }}
                className="p-1.5 rounded-lg transition-all hover:bg-white/10"
                title="Copiar código"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-400" />}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* League ranking modal */}
      <AnimatePresence>
        {selectedLeague && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedLeague(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{ background: '#0f0f2e', border: '1px solid rgba(168,85,247,0.3)' }}
            >
              <div className="px-5 pt-5 pb-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <p className="text-white font-black">{selectedLeague.nombre}</p>
                  <p className="text-purple-400 text-xs font-mono">{selectedLeague.codigo_invitacion}</p>
                </div>
                <button onClick={() => setSelectedLeague(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10">
                  <X size={14} className="text-gray-400" />
                </button>
              </div>

              <div className="p-5 space-y-2">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: i === 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)', border: i === 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-lg font-black w-6 text-center"
                      style={{ color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : '#cd7c2f' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-bold flex items-center gap-1">
                        {m.username}
                        {i === 0 && <Crown size={12} className="text-amber-400" />}
                      </p>
                    </div>
                    <span className="text-emerald-400 font-black text-sm">{m.total_points} pts</span>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5">
                <button
                  onClick={() => copyCode(selectedLeague.codigo_invitacion)}
                  className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copiado!' : 'Copiar código de invitación'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrivateLeague;
