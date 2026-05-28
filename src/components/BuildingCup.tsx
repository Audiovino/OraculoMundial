import React, { useState, useEffect } from 'react';
import { Building2, Trophy, Loader2 } from 'lucide-react';
import { mundialSupabase } from '../services/mundialSupabaseClient';
import { useMundialAuth } from '../contexts/MundialAuthContext';

interface BuildingScore {
  building_name: string;
  total_points: number;
  players: number;
}

export const BuildingCup: React.FC = () => {
  const { user } = useMundialAuth();
  const [rows, setRows] = useState<BuildingScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: predictions } = await mundialSupabase
          .from('mundial_predictions')
          .select('user_id, points');

        const { data: users } = await mundialSupabase
          .from('mundial_users')
          .select('id, building_name')
          .not('building_name', 'is', null);

        if (!predictions?.length || !users?.length) {
          setRows([]);
          setLoading(false);
          return;
        }

        const buildingByUser = new Map<string, string>(
          users.map((u: { id: string; building_name: string }) => [u.id, u.building_name] as [string, string])
        );
        const agg = new Map<string, { points: number; players: Set<string> }>();

        for (const p of predictions as { user_id: string; points: number }[]) {
          const building = buildingByUser.get(p.user_id);
          if (!building) continue;
          const cur = agg.get(building) || { points: 0, players: new Set<string>() };
          cur.points += Number(p.points) || 0;
          cur.players.add(p.user_id);
          agg.set(building, cur);
        }

        const sorted = [...agg.entries()]
          .map(([building_name, v]) => ({
            building_name,
            total_points: v.points,
            players: v.players.size,
          }))
          .sort((a, b) => b.total_points - a.total_points);

        setRows(sorted);
      } catch {
        setRows([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} className="text-amber-400" />
        <h4 className="text-white font-black text-sm uppercase tracking-wider">Copa de edificios</h4>
      </div>
      <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
        Ranking lúdico por zona declarada al registrarse. Solo puntos del juego — sin premios ni beneficios reales.
      </p>

      {user?.building_name && (
        <p className="text-xs text-amber-300/90 mb-3 flex items-center gap-1.5">
          <Building2 size={14} /> Tu edificio: <strong>{user.building_name}</strong>
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-slate-500" size={22} />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-slate-500 text-xs text-center py-4">
          Aún no hay puntos agrupados por edificio. ¡Hacé pronósticos para sumar!
        </p>
      ) : (
        <div className="space-y-2">
          {rows.slice(0, 10).map((r, i) => (
            <div
              key={r.building_name}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/8"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg w-6 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                <span className="text-white text-sm font-bold truncate">{r.building_name}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-emerald-400 font-black text-sm">{r.total_points} pts</p>
                <p className="text-[10px] text-slate-500">{r.players} jugadores</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuildingCup;
