import React, { useState, useEffect } from 'react';
import { mundialSupabase } from '../services/mundialSupabaseClient';
import { RefreshCw, Database, Edit, Save, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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

export const AdminMatchManager: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Match>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await mundialSupabase
        .from('mundial_matches')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (err: any) {
      showMessage('error', `Error cargando partidos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const syncFromAPI = async () => {
    setSyncing(true);
    try {
      // Llamar a la Edge Function de Supabase
      const { data, error } = await mundialSupabase.functions.invoke('sync-matches');

      if (error) throw error;
      
      showMessage('success', data.message || 'Sincronización exitosa desde API-Football');
      await loadMatches();
    } catch (err: any) {
      showMessage('error', `Error en sincronización: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const scrapeWithHermes = async () => {
    setScraping(true);
    try {
      // Llamar a Ollama local (hermes3) para scraping
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'hermes3',
          prompt: `Actúa como un scraper web. Busca los resultados más recientes del Mundial 2026 en sitios confiables como FIFA.com, ESPN, o Google Sports. 
          
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

NO incluyas explicaciones, solo el JSON.`,
          stream: false
        })
      });

      const data = await response.json();
      const scrapedData = JSON.parse(data.response);

      // Insertar los partidos scrapeados
      if (scrapedData.matches && scrapedData.matches.length > 0) {
        const { error } = await mundialSupabase
          .from('mundial_matches')
          .upsert(scrapedData.matches.map((m: any) => ({
            id: `scraped-${Date.now()}-${Math.random()}`,
            ...m,
            stage: 'GROUP',
            updated_at: new Date().toISOString()
          })));

        if (error) throw error;

        showMessage('success', `${scrapedData.matches.length} partidos scrapeados con Hermes`);
        await loadMatches();
      } else {
        showMessage('error', 'No se encontraron partidos en el scraping');
      }
    } catch (err: any) {
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

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={syncFromAPI}
            disabled={syncing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 rounded-xl font-semibold transition-all shadow-lg"
          >
            {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Sincronizar desde API-Football
          </button>

          <button
            onClick={scrapeWithHermes}
            disabled={scraping}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 rounded-xl font-semibold transition-all shadow-lg"
          >
            {scraping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
            Scraping con Hermes (Ollama)
          </button>

          <button
            onClick={loadMatches}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl font-semibold transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Recargar
          </button>
        </div>

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
