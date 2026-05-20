import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WinCelebrationProps {
  type: 'exact' | 'winner' | null; // exact = 10pts, winner = 5pts
  homeTeam: string;
  awayTeam: string;
  onDone: () => void;
}

// Partícula de confetti
function Particle({ color, x, delay }: { color: string; x: number; delay: number }) {
  const shapes = ['●', '■', '▲', '★', '♦'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, scale: 1, rotate: 0 }}
      animate={{ y: 600, opacity: 0, scale: 0.3, rotate: 720 }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
      style={{ position: 'absolute', top: 0, color, fontSize: '14px', pointerEvents: 'none' }}
    >
      {shape}
    </motion.div>
  );
}

const CONFETTI_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ef4444', '#ec4899', '#ffffff'];

export const WinCelebration: React.FC<WinCelebrationProps> = ({ type, homeTeam, awayTeam, onDone }) => {
  const particles = Array.from({ length: type === 'exact' ? 60 : 30 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: Math.random() * 400 - 200,
    delay: Math.random() * 0.8,
  }));

  useEffect(() => {
    if (!type) return;
    const timer = setTimeout(onDone, 3500);
    return () => clearTimeout(timer);
  }, [type, onDone]);

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDone}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            overflow: 'hidden', cursor: 'pointer'
          }}
        >
          {/* Confetti */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center' }}>
            {particles.map(p => (
              <Particle key={p.id} color={p.color} x={p.x} delay={p.delay} />
            ))}
          </div>

          {/* Main card */}
          <motion.div
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              background: type === 'exact'
                ? 'linear-gradient(135deg, #78350f, #d97706, #fbbf24)'
                : 'linear-gradient(135deg, #1e3a5f, #2563eb, #60a5fa)',
              borderRadius: '24px',
              padding: '32px 40px',
              textAlign: 'center',
              maxWidth: '320px',
              width: '90%',
              boxShadow: type === 'exact'
                ? '0 0 60px rgba(251,191,36,0.5)'
                : '0 0 40px rgba(96,165,250,0.4)',
              position: 'relative',
              zIndex: 1
            }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: type === 'exact' ? '64px' : '56px', marginBottom: '8px' }}
            >
              {type === 'exact' ? '🏆' : '⚽'}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ color: 'white', fontWeight: 900, fontSize: '22px', marginBottom: '4px' }}
            >
              {type === 'exact' ? '¡RESULTADO EXACTO!' : '¡GANADOR CORRECTO!'}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', marginBottom: '16px' }}
            >
              {homeTeam} vs {awayTeam}
            </motion.p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '8px 20px',
                color: 'white',
                fontWeight: 900,
                fontSize: '28px'
              }}
            >
              +{type === 'exact' ? '10' : '5'} pts
            </motion.div>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '12px' }}>
              Toca para continuar
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WinCelebration;
