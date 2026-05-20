import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { StreakData } from '../hooks/useStreak';

interface StreakBadgeProps {
  streak: StreakData;
}

const MILESTONES = [3, 7, 10, 16];

const getMilestoneLabel = (n: number) => {
  if (n >= 16) return { label: 'LEYENDA', color: '#f59e0b', glow: 'rgba(245,158,11,0.5)' };
  if (n >= 10) return { label: 'MAESTRO', color: '#a855f7', glow: 'rgba(168,85,247,0.5)' };
  if (n >= 7)  return { label: 'EXPERTO', color: '#3b82f6', glow: 'rgba(59,130,246,0.5)' };
  if (n >= 3)  return { label: 'EN RACHA', color: '#10b981', glow: 'rgba(16,185,129,0.5)' };
  return { label: 'RACHA', color: '#6b7280', glow: 'rgba(107,114,128,0.3)' };
};

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
  const { current, max } = streak;
  const { label, color, glow } = getMilestoneLabel(current);
  const nextMilestone = MILESTONES.find(m => m > current) || 16;
  const progress = current > 0 ? Math.min((current / nextMilestone) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}08)`,
        border: `1px solid ${color}40`,
        boxShadow: current >= 3 ? `0 0 20px ${glow}` : 'none'
      }}
    >
      {/* Flame icon */}
      <motion.div
        animate={current >= 3 ? { scale: [1, 1.15, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <Flame
          size={20}
          style={{ color, filter: current >= 3 ? `drop-shadow(0 0 6px ${color})` : 'none' }}
        />
      </motion.div>

      {/* Numbers */}
      <div>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={current}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xl font-black"
            style={{ color }}
          >
            {current}
          </motion.span>
          <span className="text-xs font-bold" style={{ color: `${color}80` }}>
            {label}
          </span>
        </div>

        {/* Progress bar to next milestone */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-20 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
            />
          </div>
          <span className="text-[9px] font-bold" style={{ color: `${color}60` }}>
            →{nextMilestone}
          </span>
        </div>
      </div>

      {/* Max record */}
      {max > 0 && (
        <div className="text-right ml-1">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Récord</p>
          <p className="text-xs font-black text-gray-400">{max}</p>
        </div>
      )}
    </motion.div>
  );
};

export default StreakBadge;
