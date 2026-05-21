import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHermesMonitoring, useResponsivenessMonitor, useHealthMonitor } from '../hooks/useHermesMonitoring';

/**
 * Componente que muestra el estado de los agentes Hermes
 * Se muestra en la esquina inferior derecha
 */
export const HermesSecurityIndicator: React.FC = () => {
  const { health, lastCheck } = useHealthMonitor(30000); // Cada 30 segundos
  const { issues, device } = useResponsivenessMonitor();
  const [show, setShow] = useState(false);

  const hasIssues = (health && (!health.supabase.ok || !health.ollama.ok)) || issues.length > 0;

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setShow(!show)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          hasIssues
            ? 'bg-gradient-to-r from-red-600 to-orange-600 animate-pulse'
            : 'bg-gradient-to-r from-emerald-600 to-green-600'
        }`}
        title="Hermes Security Monitor"
      >
        <Shield className="w-6 h-6 text-white" />
        {hasIssues && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping" />
        )}
      </motion.button>

      {/* Panel de estado */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-white font-bold text-sm">Hermes Security</h3>
                  <p className="text-blue-100 text-xs">Monitoreo en tiempo real</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Health Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Estado de Servicios</span>
                </div>
                <div className="space-y-2">
                  <StatusItem
                    label="Supabase"
                    ok={health?.supabase.ok}
                    time={health?.supabase.time}
                  />
                  <StatusItem
                    label="Ollama (Hermes)"
                    ok={health?.ollama.ok}
                    time={health?.ollama.time}
                  />
                </div>
              </div>

              {/* Responsiveness */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Responsividad</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <span className="text-sm text-slate-300">Dispositivo</span>
                  <span className="text-sm font-bold text-purple-400 capitalize">{device}</span>
                </div>
                {issues.length > 0 && (
                  <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-xs text-orange-300 font-medium">⚠️ {issues.length} problema(s) detectado(s)</p>
                  </div>
                )}
              </div>

              {/* Last Check */}
              {lastCheck && (
                <div className="text-xs text-slate-500 text-center">
                  Última verificación: {lastCheck.toLocaleTimeString()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const StatusItem: React.FC<{ label: string; ok?: boolean; time?: number }> = ({ label, ok, time }) => (
  <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircle className="w-4 h-4 text-emerald-400" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-red-400" />
      )}
      <span className="text-sm text-slate-300">{label}</span>
    </div>
    {time !== undefined && (
      <span className={`text-xs font-mono ${time < 500 ? 'text-emerald-400' : time < 1000 ? 'text-yellow-400' : 'text-red-400'}`}>
        {time.toFixed(0)}ms
      </span>
    )}
  </div>
);

/**
 * Wrapper que agrega validación de Hermes a cualquier componente
 */
export const HermesSecurityWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <HermesSecurityIndicator />
    </>
  );
};
