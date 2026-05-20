import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, LogOut, Settings } from 'lucide-react';
import { useMundialAuth } from '../contexts/MundialAuthContext';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface NavigationProps {
  currentView: 'game' | 'stadiums' | 'admin';
  onViewChange: (view: 'game' | 'stadiums' | 'admin') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, signOut } = useMundialAuth();
  const { isAdmin } = useAdminAuth();
  const [isHovering, setIsHovering] = useState<string | null>(null);

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
        height: '70px',
        backgroundColor: 'rgba(15, 15, 30, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '24px',
        paddingRight: '24px',
        zIndex: 1000
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
          }}
        >
          ⚽ Oráculo Mundial
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* Game Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('game')}
          onMouseEnter={() => setIsHovering('game')}
          onMouseLeave={() => setIsHovering(null)}
          style={{
            display: 'flex',
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
            transition: 'all 0.3s ease'
          }}
        >
          <Home size={16} />
          Juego
        </motion.button>

        {/* Stadiums Button */}
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
            transition: 'all 0.3s ease'
          }}
        >
          <MapPin size={16} />
          Estadios
        </motion.button>

        {/* Admin Button - Visible para admins (o siempre para debugging) */}
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
            border: isAdmin ? 'none' : '1px solid rgba(168, 85, 247, 0.5)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            opacity: isAdmin ? 1 : 0.6
          }}
          title={isAdmin ? 'Admin Panel' : 'Admin Panel (Verificando permisos...)'}
        >
          <Settings size={16} />
          Admin
        </motion.button>

        {/* User Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '16px',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ fontSize: '12px', color: '#aaaaaa' }}>
            {user?.email?.split('@')[0] || 'Usuario'}
          </div>

          {/* Logout Button */}
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
              transition: 'all 0.3s ease'
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
