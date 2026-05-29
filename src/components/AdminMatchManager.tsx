import React, { useEffect, useRef, useState } from 'react';
import { mundialSupabase } from '../services/mundialSupabaseClient';
import { RefreshCw, Database, Edit, Save, X, AlertCircle, CheckCircle, Loader2, Clock, Zap, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Match {
  id: string;
  date: string;
  home_team: string;
  away_team: string;
  home_logo?: string;
  away_logo?: string;
  stage: string;
  group_name?: string;
  home_goals?: number;
  away_goals?: number;
  status: 'PENDING' | 'LIVE' | 'FINISHED';
}

interface SyncConfig {
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  lastSyncTime: string | null;
  nextSyncTime: string | null;
}

export const AdminMatchManager: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Match>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    autoSyncEnabled: true,
    syncIntervalMinutes: 15,
    lastSyncTime: null,
    nextSyncTime: null
  });
  const [showSettings, setShowSettings] = useState(false);
  const isMounted = useRef(true);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    isMounted.current = true;
    loadMatches();
    
    return () => {
      isMounted.current = false;
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    loadSyncConfig();
  }, []);

  useEffect(() => {
    if (syncConfig.autoSyncEnabled) {
      startAutoSync();
    } else {
      stopAutoSync();
    }
    
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [syncConfig.autoSyncEnabled, syncConfig.syncIntervalMinutes]);

  const loadMatches = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const { data, error } = await mundialSupabase
        .from('mundial_matches')
        .select('id, date, home_team, away_team, home_logo, away_logo, stage, group_name, home_goals, away_goals, status')
        .order('date', { ascending: true });

      if (error) throw error;
      if (isMounted.current) setMatches(data || []);
    } catch (err: any) {
      if (isMounted.current) showMessage('error', `Error cargando partidos: ${err.message}`);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const loadSyncConfig = () => {
    const saved = localStorage.getItem('syncConfig');
    if (saved) {
      try {
        setSyncConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading sync config:', e);
      }
    }
  };

  const saveSyncConfig = (config: SyncConfig) => {
    localStorage.setItem('syncConfig', JSON.stringify(config));
    setSyncConfig(config);
  };

  const startAutoSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    const performSync = async () => {
      await syncFromAPI(true);
    };
    syncIntervalRef.current = setInterval(performSync, syncConfig.syncIntervalMinutes * 60 * 1000);
  };

  const stopAutoSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  };

  /**
   * FUNCIÓN MAESTRA DE SCRAPING HÍBRIDO (Ollama local / Edge Function en producción)
   */
  const performAIScraping = async () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const prompt = `Actúa como un scraper web deportivo. Busca resultados del Mundial 2026 en FIFA o ESPN.
    Devuelve SOLO un JSON válido con este formato:
    {"matches": [{"home_team": "Nombre", "away_team": "Nombre", "home_goals": 0, "away_goals": 0, "status": "FINISHED", "date": "ISO_DATE"}]}
    No incluyas texto adicional ni explicaciones.`;

    let rawResponse = '';

    if (isLocal) {
      // En local: usar Ollama directamente
      console.log('[Hermes AI] Entorno Local detectado. Llamando a Ollama...');
      let ollamaRes: Response;
      try {
        ollamaRes = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'hermes3', prompt, stream: false })
        });
      } catch {
        throw new Error('Ollama no está corriendo en localhost:11434. Iniciá Ollama primero.');
      }
      if (!ollamaRes.ok) throw new Error(`Ollama respondió con status ${ollamaRes.status}`);
      const data = await ollamaRes.json();
      rawResponse = data.response;
    } else {
      // En producción: usar la Edge Function hermes-scraper como proxy
      console.log('[Hermes AI] Entorno Cloud detectado. Llamando a Edge Function hermes-scraper...');
      const { data, error } = await mundialSupabase.functions.invoke('hermes-scraper', {
        body: { prompt }
      });
      if (error) {
        throw new Error(`Edge Function hermes-scraper no disponible: ${error.message}. Configurá GROQ_API_KEY en Supabase Dashboard > Edge Functions > Secrets.`);
      }
      rawResponse = data?.response || '';
    }

    // Sanitización resiliente de JSON para evitar errores de caracteres de control
    const cleanJsonString = rawResponse
      .replace(/[\x00-\x1F\x7F]/g, ' ') // Elimina caracteres no imprimibles
      .match(/\{[\s\S]*\}/)?.[0];        // Extrae solo lo que está entre llaves

    if (!cleanJsonString) throw new Error('La IA no devolvió un JSON válido. Intentá de nuevo.');
    
    const parsed = JSON.parse(cleanJsonString);

    if (parsed.matches && parsed.matches.length > 0) {
      const { error } = await mundialSupabase
        .from('mundial_matches')
        .upsert(parsed.matches.map((m: any) => ({
          id: `${m.home_team.toLowerCase().replace(/\s+/g, '-')}-${m.away_team.toLowerCase().replace(/\s+/g, '-')}-${new Date(m.date).getTime()}`,
          home_team: m.home_team,
          away_team: m.away_team,
          home_goals: m.home_goals,
          away_goals: m.away_goals,
          status: m.status,
          date: m.date,
          stage: 'GROUP',
          updated_at: new Date().toISOString()
        })), { onConflict: 'id' });

      if (error) throw error;
      return parsed.matches.length;
    }
    return 0;
  };

  const syncFromAPI = async (isAutoSync: boolean = false) => {
    if (!isAutoSync) setSyncing(true);
    try {
      let success = false;
      let matchesCount = 0;

      try {
        const { data, error } = await mundialSupabase.functions.invoke('sync-matches');
        if (error) throw error;
        success = true;
        matchesCount = data?.matchesCount || 0;
        showMessage('success', `✅ Sincronización oficial: ${matchesCount} partidos.`);
      } catch (edgeError) {
        console.warn('[Sync] API Oficial no disponible, usando Scraper Hermes...');
        matchesCount = await performAIScraping();
        if (matchesCount > 0) {
          success = true;
          showMessage('success', `✅ Fallback exitoso: ${matchesCount} partidos con IA.`);
        }
      }

      if (success) {
        const newConfig = {
          ...syncConfig,
          lastSyncTime: new Date().toISOString(),
          nextSyncTime: new Date(Date.now() + syncConfig.syncIntervalMinutes * 60 * 1000).toISOString()
        };
        saveSyncConfig(newConfig);
        await loadMatches();
      }
    } catch (err: any) {
      console.error('[Sync] Error:', err);
      if (!isAutoSync) showMessage('error', `Error: ${err.message}`);
    } finally {
      if (!isAutoSync) setSyncing(false);
    }
  };

  const scrapeWithHermes = async () => {
    setScraping(true);
    try {
      const count = await performAIScraping();
      if (count > 0) {
        showMessage('success', `✅ ${count} partidos scrapeados con éxito.`);
        await loadMatches();
      } else {
        showMessage('error', 'No se encontraron partidos nuevos.');
      }
    } catch (err: any) {
      showMessage('error', `Error en IA: ${err.message}`);
    } finally {
      setScraping(false);
    }
  };

  const startEdit = (match: Match) => {
    setEditingMatch(match.id);
    setEditForm(match);
  };

  const cancelEdit = () => {
    setEditingMatch(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingMatch) return;
    try {
      const { error } = await mundialSupabase
        .from('mundial_matches')
        .update({
          home_goals: editForm.home_goals,
          away_goals: editForm.away_goals,
          status: editForm.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMatch);
      if (error) throw error;
      showMessage('success', 'Partido actualizado correctamente');
      await loadMatches();
      cancelEdit();
    } catch (err: any) {
      showMessage('error', `Error: ${err.message}`);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="p-6 bg-[#0B0F19] min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Administrador de Partidos
          </h1>
          <p className="text-slate-400">Sincroniza con API-Football en la nube u Ollama en local</p>
        </div>

        <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <Clock className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-blue-400 text-sm">Estado de Sincronización</p>
            <div className="text-xs text-blue-300/70 mt-2 space-y-1">
              <p>🔄 Auto-Sync: <span className={syncConfig.autoSyncEnabled ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{syncConfig.autoSyncEnabled ? 'ACTIVADA' : 'DESACTIVADA'}</span></p>
              {syncConfig.lastSyncTime && <p>⏱️ Última: {new Date(syncConfig.lastSyncTime).toLocaleString()}</p>}
              <p>📊 Total Partidos: <span className="font-bold text-blue-300">{matches.length}</span></p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button onClick={() => syncFromAPI(false)} disabled={syncing} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 rounded-xl font-semibold transition-all shadow-lg">
            {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Sincronizar Ahora
          </button>
          <button onClick={scrapeWithHermes} disabled={scraping} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 rounded-xl font-semibold transition-all shadow-lg">
            {scraping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            Scraping con IA (Híbrido)
          </button>
          <button onClick={loadMatches} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Recargar Tabla
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all">
            <Settings className="w-5 h-5" />
            Configuración
          </button>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6 p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-amber-400" /> Configuración</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={syncConfig.autoSyncEnabled} onChange={(e) => {
                    const newConfig = { ...syncConfig, autoSyncEnabled: e.target.checked };
                    saveSyncConfig(newConfig);
                  }} className="w-4 h-4 rounded" />
                  <span className="font-semibold">Habilitar sincronización automática</span>
                </label>
                {syncConfig.autoSyncEnabled && (
                  <div className="flex items-center gap-4">
                    <label className="font-semibold">Intervalo (minutos):</label>
                    <input type="number" min="5" max="120" value={syncConfig.syncIntervalMinutes} onChange={(e) => {
                      const newConfig = { ...syncConfig, syncIntervalMinutes: parseInt(e.target.value) || 15 };
                      saveSyncConfig(newConfig);
                    }} className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded text-center" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
              <p className={message.type === 'success' ? 'text-emerald-300' : 'text-red-300'}>{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Partido</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Resultado</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matches.map((match) => (
                <tr key={match.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 text-sm text-slate-300">{new Date(match.date).toLocaleDateString()}</td>
                  <td className="px-4 py-4"><span className="font-medium">{match.home_team} vs {match.away_team}</span></td>
                  <td className="px-4 py-4 text-center">
                    {editingMatch === match.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <input type="number" value={editForm.home_goals ?? ''} onChange={(e) => setEditForm({ ...editForm, home_goals: parseInt(e.target.value) || 0 })} className="w-12 bg-white/10 rounded text-center" />
                        <span>-</span>
                        <input type="number" value={editForm.away_goals ?? ''} onChange={(e) => setEditForm({ ...editForm, away_goals: parseInt(e.target.value) || 0 })} className="w-12 bg-white/10 rounded text-center" />
                      </div>
                    ) : (
                      <span className="text-lg font-bold">{match.home_goals ?? '-'} - {match.away_goals ?? '-'}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${match.status === 'FINISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {match.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {editingMatch === match.id ? (
                      <div className="flex gap-2 justify-center">
                        <button onClick={saveEdit} className="p-2 bg-emerald-600 rounded-lg"><Save size={16} /></button>
                        <button onClick={cancelEdit} className="p-2 bg-red-600 rounded-lg"><X size={16} /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(match)} className="p-2 bg-blue-600 rounded-lg"><Edit size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
