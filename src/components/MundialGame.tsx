import React, { useState, useEffect } from 'react';
import { Trophy, LogOut, BarChart3, Users, Calendar, Clock, ChevronDown } from 'lucide-react';
import { useMundialAuth } from '../contexts/MundialAuthContext';
import { mundialSupabase, MundialRanking } from '../services/mundialSupabaseClient';
import { SAMPLE_MATCHES, TEAMS, SCORING, TOURNAMENT_PHASES } from '../data/mundialGameData';

interface UserPredictions {
    [matchId: string]: 'home_win' | 'draw' | 'away_win' | null;
}

type TabType = 'PARTIDOS' | 'RANKING' | 'MI_HISTORIAL' | 'ORACULO' | 'HORARIOS';

export const MundialGame: React.FC = () => {
    const { user, signOut } = useMundialAuth();
    const [predictions, setPredictions] = useState<UserPredictions>({});
    const [totalPoints, setTotalPoints] = useState(0);
    const [ranking, setRanking] = useState<MundialRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('PARTIDOS');
    const [selectedDate, setSelectedDate] = useState<string>('Todas las fechas');
    const [selectedTeam, setSelectedTeam] = useState<string>('Todos los equipos');

    // Cargar predicciones del usuario
    useEffect(() => {
        if (!user) return;

        const loadPredictions = async () => {
            try {
                const { data, error } = await mundialSupabase
                    .from('mundial_predictions')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) throw error;

                const predMap: UserPredictions = {};
                let points = 0;

                data?.forEach(pred => {
                    predMap[pred.match_id] = pred.prediction;
                    points += pred.points || 0;
                });

                setPredictions(predMap);
                setTotalPoints(points);
            } catch (err) {
                console.error('Error loading predictions:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPredictions();
    }, [user]);

    // Cargar ranking global
    useEffect(() => {
        const loadRanking = async () => {
            try {
                const { data, error } = await mundialSupabase
                    .from('mundial_rankings')
                    .select('*')
                    .order('position', { ascending: true })
                    .limit(10);

                if (error) throw error;
                setRanking(data || []);
            } catch (err) {
                console.error('Error loading ranking:', err);
            }
        };

        loadRanking();
    }, []);

    const handlePrediction = async (matchId: string, prediction: 'home_win' | 'draw' | 'away_win') => {
        if (!user) return;

        try {
            // Actualizar o insertar predicción
            const { error } = await mundialSupabase
                .from('mundial_predictions')
                .upsert([{
                    user_id: user.id,
                    match_id: matchId,
                    prediction,
                    points: 0 // Se calcula cuando termina el partido
                }], { onConflict: 'user_id,match_id' });

            if (error) throw error;

            setPredictions(prev => ({
                ...prev,
                [matchId]: prediction
            }));
        } catch (err) {
            console.error('Error saving prediction:', err);
        }
    };

    const getTeamName = (code: string) => {
        const team = TEAMS[code as keyof typeof TEAMS];
        return team ? `${team.flag} ${team.name}` : code;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <div className="animate-spin mb-4">⚽</div>
                    <p className="text-white text-lg">Cargando Mundial...</p>
                </div>
            </div>
        );
    }

    // Obtener fechas únicas de los partidos
    const uniqueDates = Array.from(new Set(SAMPLE_MATCHES.map(m => m.date))).sort();
    const uniqueTeams = Array.from(new Set(
        SAMPLE_MATCHES.flatMap(m => [m.homeTeam, m.awayTeam])
    )).sort();

    // Filtrar partidos según selección
    const filteredMatches = SAMPLE_MATCHES.filter(match => {
        const dateMatch = selectedDate === 'Todas las fechas' || match.date === selectedDate;
        const teamMatch = selectedTeam === 'Todos los equipos' || 
                         match.homeTeam === selectedTeam || 
                         match.awayTeam === selectedTeam;
        return dateMatch && teamMatch;
    });

    // Obtener historial de predicciones del usuario
    const userPredictionHistory = SAMPLE_MATCHES.map(match => ({
        ...match,
        userPrediction: predictions[match.id],
        points: predictions[match.id] ? SCORING.CORRECT_OUTCOME : 0
    })).filter(m => m.userPrediction !== null);

    // Renderizar contenido según tab activo
    const renderTabContent = () => {
        switch (activeTab) {
            case 'PARTIDOS':
                return (
                    <div className="space-y-4">
                        {filteredMatches.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400">No hay partidos con los filtros seleccionados</p>
                            </div>
                        ) : (
                            filteredMatches.map(match => (
                                <div
                                    key={match.id}
                                    className="bg-slate-700/50 border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs text-gray-400 font-bold uppercase">
                                            {new Date(match.date).toLocaleDateString('es-ES')}
                                        </p>
                                        <p className="text-xs text-amber-400 font-bold">Grupo {match.group}</p>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-center flex-1">
                                            <p className="text-2xl">{match.homeFlag}</p>
                                            <p className="text-xs text-gray-300 mt-1">{getTeamName(match.homeTeam)}</p>
                                        </div>

                                        <div className="px-4 text-center">
                                            <p className="text-xs text-gray-400 mb-2">vs</p>
                                        </div>

                                        <div className="text-center flex-1">
                                            <p className="text-2xl">{match.awayFlag}</p>
                                            <p className="text-xs text-gray-300 mt-1">{getTeamName(match.awayTeam)}</p>
                                        </div>
                                    </div>

                                    {/* Botones de predicción */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handlePrediction(match.id, 'home_win')}
                                            className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                                                predictions[match.id] === 'home_win'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-600/50 text-gray-300 hover:bg-slate-600'
                                            }`}
                                        >
                                            Victoria Local
                                        </button>
                                        <button
                                            onClick={() => handlePrediction(match.id, 'draw')}
                                            className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                                                predictions[match.id] === 'draw'
                                                    ? 'bg-amber-600 text-white'
                                                    : 'bg-slate-600/50 text-gray-300 hover:bg-slate-600'
                                            }`}
                                        >
                                            Empate
                                        </button>
                                        <button
                                            onClick={() => handlePrediction(match.id, 'away_win')}
                                            className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                                                predictions[match.id] === 'away_win'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-slate-600/50 text-gray-300 hover:bg-slate-600'
                                            }`}
                                        >
                                            Victoria Visitante
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );

            case 'RANKING':
                return (
                    <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-400" />
                            Ranking Global
                        </h3>
                        <div className="space-y-2">
                            {ranking.map((entry, idx) => (
                                <div
                                    key={entry.id}
                                    className={`flex items-center justify-between p-4 rounded-lg ${
                                        entry.user_id === user?.id
                                            ? 'bg-blue-600/20 border border-blue-500/30'
                                            : 'bg-slate-700/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-black text-amber-400 w-8">#{idx + 1}</span>
                                        <span className="text-sm font-bold text-white truncate">
                                            {entry.username}
                                        </span>
                                    </div>
                                    <span className="text-lg font-black text-amber-400">
                                        {entry.total_points}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'MI_HISTORIAL':
                return (
                    <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-green-400" />
                            Mi Historial de Predicciones
                        </h3>
                        {userPredictionHistory.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400">Aún no has hecho predicciones</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {userPredictionHistory.map(match => (
                                    <div
                                        key={match.id}
                                        className="bg-slate-700/50 border border-white/5 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400 mb-2">
                                                    {new Date(match.date).toLocaleDateString('es-ES')}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{match.homeFlag}</span>
                                                    <span className="text-xs text-gray-300">vs</span>
                                                    <span className="text-lg">{match.awayFlag}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 mb-1">Tu predicción:</p>
                                                <p className="text-sm font-bold text-white">
                                                    {match.userPrediction === 'home_win' && 'Victoria Local'}
                                                    {match.userPrediction === 'draw' && 'Empate'}
                                                    {match.userPrediction === 'away_win' && 'Victoria Visitante'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'ORACULO':
                return (
                    <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-purple-400" />
                            Oráculo del Mundial
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
                                <p className="text-sm text-gray-300 mb-3">
                                    Análisis y predicciones basadas en el desempeño de los equipos y tendencias del torneo.
                                </p>
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-400">📊 Equipos favoritos:</p>
                                    <p className="text-sm text-white font-bold">🇦🇷 Argentina • 🇧🇷 Brasil • 🇫🇷 Francia</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-2">🎯 Predicción de la Final:</p>
                                <p className="text-sm text-white font-bold">Argentina vs Brasil</p>
                            </div>
                        </div>
                    </div>
                );

            case 'HORARIOS':
                return (
                    <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-orange-400" />
                            Horarios de Partidos
                        </h3>
                        <div className="space-y-4">
                            {TOURNAMENT_PHASES.map(phase => (
                                <div key={phase.id} className="bg-slate-700/50 border border-white/5 rounded-lg p-4">
                                    <p className="text-sm font-bold text-white mb-2">{phase.name}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(phase.startDate).toLocaleDateString('es-ES')} - {new Date(phase.endDate).toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">⚽</div>
                            <div>
                                <h1 className="text-2xl font-black text-white">MUNDIAL 2026</h1>
                                <p className="text-xs text-gray-400">Juego de Predicciones</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Bienvenido</p>
                                <p className="text-lg font-bold text-white">{user?.username}</p>
                            </div>
                            <button
                                onClick={signOut}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-400 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Salir
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {(['PARTIDOS', 'RANKING', 'MI_HISTORIAL', 'ORACULO', 'HORARIOS'] as TabType[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                                    activeTab === tab
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                {tab === 'MI_HISTORIAL' ? 'MI HISTORIAL' : tab === 'ORACULO' ? 'ORÁCULO' : tab}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Filtros - Solo mostrar en tab PARTIDOS */}
                {activeTab === 'PARTIDOS' && (
                    <div className="mb-6 flex gap-4 flex-wrap">
                        {/* Filtro de Fechas */}
                        <div className="relative">
                            <select
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="appearance-none px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white text-sm font-bold cursor-pointer hover:border-white/20 transition-all pr-8"
                            >
                                <option>Todas las fechas</option>
                                {uniqueDates.map(date => (
                                    <option key={date} value={date}>
                                        {new Date(date).toLocaleDateString('es-ES')}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Filtro de Equipos */}
                        <div className="relative">
                            <select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="appearance-none px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white text-sm font-bold cursor-pointer hover:border-white/20 transition-all pr-8"
                            >
                                <option>Todos los equipos</option>
                                {uniqueTeams.map(team => (
                                    <option key={team} value={team}>
                                        {getTeamName(team)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contenido Principal */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6">
                            {renderTabContent()}
                        </div>
                    </div>

                    {/* Sidebar: Puntuación y Ranking */}
                    <div className="space-y-6">
                        {/* Mi Puntuación */}
                        <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-amber-400" />
                                <h3 className="text-lg font-black text-white">Mi Puntuación</h3>
                            </div>
                            <p className="text-4xl font-black text-amber-400">{totalPoints}</p>
                            <p className="text-xs text-gray-300 mt-2">Puntos acumulados</p>
                        </div>

                        {/* Ranking Global - Siempre visible en sidebar */}
                        <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-blue-400" />
                                <h3 className="text-lg font-black text-white">Top 10</h3>
                            </div>

                            <div className="space-y-2">
                                {ranking.map((entry, idx) => (
                                    <div
                                        key={entry.id}
                                        className={`flex items-center justify-between p-3 rounded-lg ${
                                            entry.user_id === user?.id
                                                ? 'bg-blue-600/20 border border-blue-500/30'
                                                : 'bg-slate-700/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-gray-400 w-6">#{idx + 1}</span>
                                            <span className="text-sm font-bold text-white truncate">
                                                {entry.username}
                                            </span>
                                        </div>
                                        <span className="text-sm font-black text-amber-400">
                                            {entry.total_points}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
