import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, LogOut, Settings } from 'lucide-react';
import { useMundialAuth } from '../contexts/MundialAuthContext';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useHermesStatus } from '../hooks/useHermesStatus';

interface NavigationProps {
  currentView: 'game' | 'stadiums' | 'admin';
  onViewChange: (view: 'game' | 'stadiums' | 'admin') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, signOut } = useMundialAuth();
  const { isAdmin } = useAdminAuth();
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const hermesStatus = useHermesStatus();

  // Optimización: Prefetch de HyperFrames para carga instantánea al abrir el modal
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'https://hyperframes-mini-video.vercel.app/';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(15, 15, 30, 0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 1000,
      }}
    >
      {/* ─── ROW 1: Logo + User info + Exit (always visible) ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '16px',
          paddingRight: '16px',
          height: '52px',
        }}
      >
        {/* Logo — shorter on mobile */}
        <div
          style={{
            fontSize: 'clamp(13px, 4vw, 22px)',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '0 0 18px rgba(255,255,255,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          ⚽ Oráculo Mundial
        </div>

        {/* Right side: username + logout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#9ca3af', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email?.split('@')[0] || 'Usuario'}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={signOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239, 68, 68, 0.28)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            }}
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">Salir</span>
          </motion.button>
        </div>
      </div>

      {/* ─── ROW 2 (mobile): Nav buttons ─── */}
      {/* Hidden on md+ (desktop uses a single-row layout) */}
      <div
        className="md:hidden"
        style={{
          display: 'flex',
          gap: '6px',
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingBottom: '8px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '8px',
          overflowX: 'auto',
        }}
      >
        {/* Juego */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('game')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '16px 10px',
            backgroundColor:
              currentView === 'game'
                ? 'rgba(59, 130, 246, 0.85)'
                : 'rgba(255, 255, 255, 0.07)',
            color: '#ffffff',
            border: currentView === 'game' ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          <Home size={13} />
          Juego
        </motion.button>

        {/* Estadios */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('stadiums')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '16px 10px',
            backgroundColor:
              currentView === 'stadiums'
                ? 'rgba(239, 68, 68, 0.85)'
                : 'rgba(255, 255, 255, 0.07)',
            color: '#ffffff',
            border: currentView === 'stadiums' ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          <MapPin size={13} />
          Estadios
        </motion.button>

        {/* Admin */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('admin')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '16px 10px',
            backgroundColor:
              currentView === 'admin'
                ? 'rgba(168, 85, 247, 0.85)'
                : 'rgba(255, 255, 255, 0.07)',
            color: '#ffffff',
            border: currentView === 'admin' ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            minWidth: 0,
            position: 'relative',
          }}
          title="Admin Panel"
        >
          <Settings size={13} />
          Admin
          {/* Hermes badge */}
          {hermesStatus === 'critical' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[#0f0f1e] z-10"
              style={{ boxShadow: '0 0 8px rgba(239,68,68,0.8)' }}
            >
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            </motion.span>
          )}
          {hermesStatus === 'warning' && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-[#0f0f1e] z-10" />
          )}
        </motion.button>
      </div>

      {/* ─── DESKTOP: Single row nav buttons (md+) ─── */}
      <div
        className="hidden md:flex"
        style={{
          position: 'absolute',
          top: 0,
          right: '24px',
          height: '70px',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Game */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('game')}
          onMouseEnter={() => setIsHovering('game')}
          onMouseLeave={() => setIsHovering(null)}
          style={{
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor:
              currentView === 'game'
                ? 'rgba(59, 130, 246, 0.8)'
                : isHovering === 'game'
                ? 'rgba(59, 130, 246, 0.3)'
                : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
          }}
        >
          <Home size={16} />
          Juego
        </motion.button>

        {/* Stadiums */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('stadiums')}
          onMouseEnter={() => setIsHovering('stadiums')}
          onMouseLeave={() => setIsHovering(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor:
              currentView === 'stadiums'
                ? 'rgba(239, 68, 68, 0.8)'
                : isHovering === 'stadiums'
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
          }}
        >
          <MapPin size={16} />
          Estadios
        </motion.button>

        {/* Admin */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('admin')}
          onMouseEnter={() => setIsHovering('admin')}
          onMouseLeave={() => setIsHovering(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor:
              currentView === 'admin'
                ? 'rgba(168, 85, 247, 0.8)'
                : isHovering === 'admin'
                ? 'rgba(168, 85, 247, 0.3)'
                : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
          title="Admin Panel"
        >
          <Settings size={16} />
          Admin
          {hermesStatus === 'critical' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0f0f1e] z-10"
              style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)' }}
            >
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            </motion.span>
          )}
          {hermesStatus === 'warning' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#0f0f1e] z-10" />
          )}
        </motion.button>

        {/* User Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '16px',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#aaaaaa' }}>
            {user?.email?.split('@')[0] || 'Usuario'}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={signOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#ff6b6b',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            <LogOut size={14} />
            Salir
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Navigation;
