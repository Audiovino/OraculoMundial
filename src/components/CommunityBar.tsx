import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { mundialSupabase } from '../services/mundialSupabaseClient';

interface CommunityBarProps {
  matchId: string;
  userPrediction?: { homeScore: string; awayScore: string };
}

interface Distribution {
  local: number;
  empate: number;
  visitante: number;
  total: number;
}

const getResult = (h: number, a: number) => h > a ? 'local' : h < a ? 'visitante' : 'empate';

export const CommunityBar: React.FC<CommunityBarProps> = ({ matchId, userPrediction }) => {
  const [dist, setDist] = useState<Distribution | null>(null);
  const [loading, setLoading] = useState(false);

  // Solo mostrar si el usuario ya guardó su pronóstico
  const hasPrediction = userPrediction &&
    userPrediction.homeScore !== '' &&
    userPrediction.awayScore !== '';

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hasPrediction) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await mundialSupabase
          .from('mundial_predictions')
          .select('prediction')
          .eq('match_id', matchId);

        if (error || !data || data.length === 0) {
          if (isMounted.current) setDist(null);
          return;
        }

        let local = 0, empate = 0, visitante = 0;
        data.forEach((row: any) => {
          const value = row.prediction ?? row.resultado ?? row.score ?? row.result;
          if (typeof value !== 'string' || !value.includes('-')) return;
          const [h, a] = value.split('-').map(Number);
          if (Number.isNaN(h) || Number.isNaN(a)) return;
          const r = getResult(h, a);
          if (r === 'local') local++;
          else if (r === 'empate') empate++;
          else visitante++;
        });

        const total = local + empate + visitante;
        if (total === 0) {
          setDist(null);
          return;
        }

        setDist({
          local: Math.round((local / total) * 100),
          empate: Math.round((empate / total) * 100),
          visitante: Math.round((visitante / total) * 100),
          total,
        });
      } catch (err) {
        console.warn('[CommunityBar] load error:', err);
        setDist(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [matchId, hasPrediction]);

  if (!hasPrediction || !dist) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.4 }}
      className="mt-3 pt-3"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Users size={11} className="text-gray-500" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          La comunidad opina
          {dist.total > 0 && <span className="ml-1 text-gray-600">· {dist.total} pronósticos</span>}
        </span>
      </div>

      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-2 gap-px">
        {[
          { value: dist.local, color: '#10b981', label: 'Local' },
          { value: dist.empate, color: '#f59e0b', label: 'Empate' },
          { value: dist.visitante, color: '#3b82f6', label: 'Visitante' },
        ].map(seg => (
          <motion.div
            key={seg.label}
            initial={{ width: 0 }}
            animate={{ width: `${seg.value}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ backgroundColor: seg.color, minWidth: seg.value > 0 ? '4px' : 0 }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1.5">
        {[
          { value: dist.local, color: '#10b981', label: 'Local' },
          { value: dist.empate, color: '#f59e0b', label: 'Empate' },
          { value: dist.visitante, color: '#3b82f6', label: 'Visit.' },
        ].map(seg => (
          <div key={seg.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] font-bold" style={{ color: seg.color }}>
              {seg.value}%
            </span>
            <span className="text-[9px] text-gray-600">{seg.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CommunityBar;
