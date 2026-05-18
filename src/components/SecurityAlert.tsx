/**
 * SecurityAlert Component
 * Componente React para mostrar alertas de seguridad y estado de Supabase
 */

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, X, BarChart3, RefreshCw } from 'lucide-react';
import { SupabaseMetrics, SUPABASE_LIMITS } from '../services/supabaseMonitor';

interface SecurityAlertProps {
  metrics: SupabaseMetrics | null;
  alerts: string[];
  status: 'ok' | 'warning' | 'critical';
  onDismiss: () => void;
  onRefresh?: () => void;
  isMonitoring?: boolean;
}

/**
 * Componente de alerta de seguridad
 */
export const SecurityAlert: React.FC<SecurityAlertProps> = ({
  metrics,
  alerts,
  status,
  onDismiss,
  onRefresh,
  isMonitoring = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!metrics && alerts.length === 0) {
    return null;
  }

  // Determinar colores y iconos según estado
  const getStatusConfig = () => {
    switch (status) {
      case 'critical':
        return {
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-300',
          icon: AlertTriangle,
          title: '🔴 ALERTA CRÍTICA',
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-300',
          icon: AlertCircle,
          title: '⚠️ ADVERTENCIA',
        };
      default:
        return {
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-300',
          icon: CheckCircle,
          title: '✅ TODO OK',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Calcular porcentajes
  const getMetricPercent = (used: number, limit: number): number => {
    return Math.min((used / limit) * 100, 100);
  };

  const storagePercent = metrics ? getMetricPercent(metrics.storageUsed, SUPABASE_LIMITS.STORAGE_MB) : 0;
  const bandwidthPercent = metrics ? getMetricPercent(metrics.bandwidthUsed, SUPABASE_LIMITS.BANDWIDTH_GB) : 0;

  // Obtener color de barra de progreso
  const getProgressColor = (percent: number): string => {
    if (percent > 95) return 'bg-red-500';
    if (percent > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`w-5 h-5 ${config.textColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <h3 className={`font-bold ${config.textColor}`}>{config.title}</h3>
            {alerts.length > 0 && (
              <p className={`text-sm ${config.textColor} opacity-90 mt-1`}>
                {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} detectada{alerts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isMonitoring}
              className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
              title="Actualizar métricas"
            >
              <RefreshCw className={`w-4 h-4 ${isMonitoring ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`text-sm ${config.textColor} flex items-start gap-2`}>
              <span className="flex-shrink-0">•</span>
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Métricas */}
      {metrics && (
        <div className="space-y-3">
          {/* Storage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-300">💾 Almacenamiento</span>
              <span className="text-xs text-gray-400">
                {metrics.storageUsed}MB / {SUPABASE_LIMITS.STORAGE_MB}MB
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(storagePercent)} transition-all`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              {storagePercent.toFixed(1)}% utilizado
            </span>
          </div>

          {/* Bandwidth */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-300">📡 Ancho de Banda</span>
              <span className="text-xs text-gray-400">
                {metrics.bandwidthUsed.toFixed(2)}GB / {SUPABASE_LIMITS.BANDWIDTH_GB}GB
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getProgressColor(bandwidthPercent)} transition-all`}
                style={{ width: `${bandwidthPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              {bandwidthPercent.toFixed(1)}% utilizado
            </span>
          </div>

          {/* Filas por tabla */}
          {Object.keys(metrics.rowsUsed).length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-300">📋 Filas por Tabla</span>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showDetails ? 'Ocultar' : 'Ver detalles'}
                </button>
              </div>

              {showDetails && (
                <div className="space-y-2 bg-slate-700/30 rounded p-2">
                  {Object.entries(metrics.rowsUsed).map(([table, rows]) => {
                    const rowPercent = getMetricPercent(rows, SUPABASE_LIMITS.ROWS_PER_TABLE);
                    return (
                      <div key={table}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-300">{table}</span>
                          <span className="text-xs text-gray-400">
                            {rows} / {SUPABASE_LIMITS.ROWS_PER_TABLE}
                          </span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(rowPercent)} transition-all`}
                            style={{ width: `${rowPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {metrics ? `Actualizado: ${new Date(metrics.timestamp).toLocaleTimeString()}` : 'Sin datos'}
        </span>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          <BarChart3 className="w-3 h-3" />
          {showDetails ? 'Ocultar' : 'Ver'} reporte
        </button>
      </div>
    </div>
  );
};

/**
 * Componente de alerta de validación
 */
interface ValidationAlertProps {
  errors: Record<string, string>;
  onDismiss?: () => void;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({ errors, onDismiss }) => {
  if (Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.1)]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-300">Errores de Validación</h3>
            <p className="text-sm text-red-300 opacity-90 mt-1">
              Por favor, corrige los siguientes errores:
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-1 ml-8">
        {Object.entries(errors).map(([field, error]) => (
          <div key={field} className="text-sm text-red-300">
            <span className="font-semibold">{field}:</span> {error}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Componente de indicador de estado de seguridad
 */
interface SecurityStatusIndicatorProps {
  status: 'secure' | 'warning' | 'critical';
  hasValidationErrors: boolean;
  hasSupabaseAlerts: boolean;
}

export const SecurityStatusIndicator: React.FC<SecurityStatusIndicatorProps> = ({
  status,
  hasValidationErrors,
  hasSupabaseAlerts,
}) => {
  const getConfig = () => {
    switch (status) {
      case 'critical':
        return { color: 'bg-red-500', text: 'CRÍTICO', icon: '🔴' };
      case 'warning':
        return { color: 'bg-yellow-500', text: 'ADVERTENCIA', icon: '⚠️' };
      default:
        return { color: 'bg-green-500', text: 'SEGURO', icon: '✅' };
    }
  };

  const config = getConfig();

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color} animate-pulse`} />
      <span className="text-sm font-semibold text-gray-300">
        {config.icon} {config.text}
      </span>
      {hasValidationErrors && (
        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
          Errores de validación
        </span>
      )}
      {hasSupabaseAlerts && (
        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
          Alertas de Supabase
        </span>
      )}
    </div>
  );
};
