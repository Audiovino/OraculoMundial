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
    loadSyncConfig();
    
    // Iniciar sincronización automática
    if (syncConfig.autoSyncEnabled) {
      startAutoSync();
    }

    return () => {
      isMounted.current = false;
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

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
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

    const performSync = async () => {
      console.log('[AutoSync] Ejecutando sincronización automática...');
      await syncFromAPI(true);
    };

    // Ejecutar inmediatamente
    performSync();

    // Luego cada X minutos
    syncIntervalRef.current = setInterval(performSync, syncConfig.syncIntervalMinutes * 60 * 1000);
  };

  const stopAutoSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  };

  const syncFromAPI = async (isAutoSync: boolean = false) => {
    if (!isAutoSync) setSyncing(true);
    
    try {
      console.log('[Sync] Intentando sincronizar desde API-Football...');
      
      // Intentar Edge Function primero
      let success = false;
      let matchesCount = 0;

      try {
        const { data, error } = await mundialSupabase.functions.invoke('sync-matches');
        if (error) throw error;
        
        success = true;
        matchesCount = data?.matchesCount || 0;
        showMessage('success', `✅ Sincronización exitosa: ${matchesCount} partidos desde API-Football`);
        console.log('[Sync] Edge Function exitosa');
      } catch (edgeError: any) {
        console.warn('[Sync] Edge Function falló, intentando fallback con GLM-4...', edgeError);
        
        // Fallback a GLM-4 Flash
        try {
          const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_ZHIPU_API_KEY || ''}`
            },
            body: JSON.stringify({
              model: 'glm-4-flash',
              messages: [{
                role: 'user',
                content: `Actúa como un scraper web. Busca los resultados más recientes del Mundial 2026 en sitios confiables como FIFA.com, ESPN, o Google Sports. 
              
Devuelve SOLO un JSON válido con este formato:
{
  "matches": [
    {
      "home_team": "Argentina",
      "away_team": "Brasil",
      "home_goals": 2,
      "away_goals": 1,
      "status": "FINISHED",
      "date": "2026-06-15T20:00:00Z"
    }
  ]
}

NO incluyas explicaciones, solo el JSON.`
              }]
            })
          });

          if (!response.ok) {
            throw new Error(`GLM-4 API error: ${response.statusText}`);
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          const scrapedData = JSON.parse(content);

          if (scrapedData.matches && scrapedData.matches.length > 0) {
            const { error: upsertError } = await mundialSupabase
              .from('mundial_matches')
              .upsert(scrapedData.matches.map((m: any) => ({
                id: `${m.home_team.toLowerCase()}-${m.away_team.toLowerCase()}-${new Date(m.date).getTime()}`,
                home_team: m.home_team,
                away_team: m.away_team,
                home_goals: m.home_goals,
                away_goals: m.away_goals,
                status: m.status,
                date: m.date,
                stage: 'GROUP',
                updated_at: new Date().toISOString()
              })), { onConflict: 'id' });

            if (upsertError) throw upsertError;

            success = true;
            matchesCount = scrapedData.matches.length;
            showMessage('success', `✅ Sincronización con GLM-4: ${matchesCount} partidos scrapeados`);
            console.log('[Sync] GLM-4 fallback exitoso');
          } else {
            throw new Error('No se encontraron partidos en el scraping');
          }
        } catch (glmError: any) {
          console.error('[Sync] GLM-4 fallback también falló:', glmError);
          showMessage('error', `❌ Error en sincronización: ${glmError.message || 'Ambas fuentes no disponibles'}`);
        }
      }

      if (success) {
        // Actualizar config de sincronización
        const newConfig = {
          ...syncConfig,
          lastSyncTime: new Date().toISOString(),
          nextSyncTime: new Date(Date.now() + syncConfig.syncIntervalMinutes * 60 * 1000).toISOString()
        };
        saveSyncConfig(newConfig);
        await loadMatches();
      }
    } catch (err: any) {
      console.error('[Sync] Error general:', err);
      if (!isAutoSync) {
        showMessage('error', `Error en sincronización: ${err.message}`);
      }
    } finally {
      if (!isAutoSync) setSyncing(false);
    }
  };

  const scrapeWithHermes = async () => {
    setScraping(true);
    try {
      console.log('[Scrape] Iniciando scraping con GLM-4 Flash...');
      
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_ZHIPU_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [{
            role: 'user',
            content: `Actúa como un scraper web. Busca los resultados más recientes del Mundial 2026 en sitios confiables como FIFA.com, ESPN, o Google Sports. 
          
Devuelve SOLO un JSON válido con este formato:
{
  "matches": [
    {
      "home_team": "Argentina",
      "away_team": "Brasil",
      "home_goals": 2,
      "away_goals": 1,
      "status": "FINISHED",
      "date": "2026-06-15T20:00:00Z"
    }
  ]
}

NO incluyas explicaciones, solo el JSON.`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const scrapedData = JSON.parse(content);

      // Insertar los partidos scrapeados
      if (scrapedData.matches && scrapedData.matches.length > 0) {
        const { error } = await mundialSupabase
          .from('mundial_matches')
          .upsert(scrapedData.matches.map((m: any) => ({
            id: `${m.home_team.toLowerCase()}-${m.away_team.toLowerCase()}-${new Date(m.date).getTime()}`,
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

        showMessage('success', `✅ ${scrapedData.matches.length} partidos scrapeados con GLM-4`);
        console.log('[Scrape] Scraping exitoso:', scrapedData.matches.length, 'partidos');
        await loadMatches();
      } else {
        showMessage('error', 'No se encontraron partidos en el scraping');
      }
    } catch (err: any) {
      console.error('[Scrape] Error:', err);
      showMessage('error', `Error en scraping: ${err.message}`);
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
      showMessage('error', `Error actualizando: ${err.message}`);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="p-6 bg-[#0B0F19] min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Administrador de Partidos
          </h1>
          <p className="text-slate-400">Sincroniza, scrapea o edita manualmente los resultados</p>
        </div>

        {/* Sync Status */}
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <Clock className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-blue-400 text-sm">Estado de Sincronización</p>
            <div className="text-xs text-blue-300/70 mt-2 space-y-1">
              <p>🔄 Sincronización automática: <span className={syncConfig.autoSyncEnabled ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{syncConfig.autoSyncEnabled ? 'ACTIVADA' : 'DESACTIVADA'}</span></p>
              {syncConfig.lastSyncTime && <p>⏱️ Última sincronización: {new Date(syncConfig.lastSyncTime).toLocaleString()}</p>}
              {syncConfig.nextSyncTime && <p>⏭️ Próxima sincronización: {new Date(syncConfig.nextSyncTime).toLocaleString()}</p>}
              <p>📊 Partidos cargados: <span className="font-bold text-blue-300">{matches.length}</span></p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => syncFromAPI(false)}
            disabled={syncing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 rounded-xl font-semibold transition-all shadow-lg"
          >
            {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Sincronizar Ahora
          </button>

          <button
            onClick={scrapeWithHermes}
            disabled={scraping}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 rounded-xl font-semibold transition-all shadow-lg"
          >
            {scraping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
            Scraping con GLM-4
          </button>

          <button
            onClick={loadMatches}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl font-semibold transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Recargar
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all"
          >
            <Settings className="w-5 h-5" />
            Configuración
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Configuración de Sincronización Automática
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncConfig.autoSyncEnabled}
                      onChange={(e) => {
                        const newConfig = { ...syncConfig, autoSyncEnabled: e.target.checked };
                        saveSyncConfig(newConfig);
                        if (e.target.checked) {
                          startAutoSync();
                        } else {
                          stopAutoSync();
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="font-semibold">Habilitar sincronización automática</span>
                  </label>
                </div>

                {syncConfig.autoSyncEnabled && (
                  <div className="flex items-center gap-4">
                    <label className="font-semibold">Intervalo (minutos):</label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={syncConfig.syncIntervalMinutes}
                      onChange={(e) => {
                        const newConfig = { ...syncConfig, syncIntervalMinutes: parseInt(e.target.value) || 15 };
                        saveSyncConfig(newConfig);
                        startAutoSync(); // Reiniciar con nuevo intervalo
                      }}
                      className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded text-center"
                    />
                    <span className="text-sm text-slate-400">(mínimo 5, máximo 120)</span>
                  </div>
                )}

                <div className="text-xs text-slate-400 mt-4 p-3 rounded bg-white/5">
                  <p className="font-semibold mb-2">ℹ️ Cómo funciona:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>La sincronización automática descarga resultados cada X minutos</li>
                    <li>Primero intenta API-Football, si falla usa GLM-4 Flash como fallback</li>
                    <li>Los resultados se guardan automáticamente en la base de datos</li>
                    <li>Los puntos de los usuarios se calculan automáticamente</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <p className={message.type === 'success' ? 'text-emerald-300' : 'text-red-300'}>
                {message.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Matches Table */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
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
                    <td className="px-4 py-4 text-sm text-slate-300">
                      {new Date(match.date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{match.home_team}</span>
                        <span className="text-slate-500">vs</span>
                        <span className="font-medium">{match.away_team}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {editingMatch === match.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editForm.home_goals ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, home_goals: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-center"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            min="0"
                            value={editForm.away_goals ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, away_goals: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-center"
                          />
                        </div>
                      ) : (
                        <span className="text-lg font-bold">
                          {match.home_goals ?? '-'} - {match.away_goals ?? '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {editingMatch === match.id ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                          className="px-3 py-1 bg-white/10 border border-white/20 rounded"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="LIVE">En Vivo</option>
                          <option value="FINISHED">Finalizado</option>
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            match.status === 'FINISHED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : match.status === 'LIVE'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {match.status === 'FINISHED' ? 'Finalizado' : match.status === 'LIVE' ? 'En Vivo' : 'Pendiente'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {editingMatch === match.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={saveEdit}
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(match)}
                          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {matches.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400">
            <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay partidos cargados. Usa los botones de arriba para sincronizar.</p>
          </div>
        )}
      </div>
    </div>
  );
};
