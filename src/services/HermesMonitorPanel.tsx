import React, { useEffect, useState } from 'react';
import { mundialSupabase } from './mundialSupabaseClient';
import { runAllAgents, HermesFullReport } from './hermesAgents';
import { Shield, Activity, Smartphone, Lock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const HermesMonitorPanel: React.FC = () => {
  const [latestReport, setLatestReport] = useState<HermesFullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const fetchLatestReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await mundialSupabase
        .from('hermes_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setLatestReport({
          timestamp: data.created_at,
          overallStatus: data.status,
          health: data.health_data,
          secrets: data.security_data,
          responsiveness: data.ui_data,
          qaTest: data.qa_data
        } as HermesFullReport);
      }
    } catch (err) {
      console.error('Error fetching Hermes logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = async () => {
    setIsScanning(true);
    const report = await runAllAgents();
    setLatestReport(report);
    setIsScanning(false);
  };

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (loading) return <div className="p-8 text-center text-white/50">Cargando monitor Hermes...</div>;

  return (
    <div className="space-y-6 text-white p-4">
      {/* Header con Estado Global */}
      <div className="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${latestReport ? getStatusColor(latestReport.overallStatus) : ''}`}>
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Estado del Sistema Hermes</h2>
            <p className="text-white/50 text-sm">
              Último escaneo: {latestReport ? new Date(latestReport.timestamp).toLocaleString() : 'Nunca'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleManualScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Escaneando...' : 'Escaneo Manual'}
        </button>
      </div>

      {/* Grid de Agentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Agente de Salud */}
        <AgentCard 
          title="Salud y Performance"
          icon={<Activity />}
          data={latestReport?.health}
          color="blue"
        />
        {/* Agente de Seguridad */}
        <AgentCard 
          title="Seguridad de Código"
          icon={<Lock />}
          data={latestReport?.secrets}
          color="red"
        />
        {/* Agente de Responsividad */}
        <AgentCard 
          title="UX & Responsividad"
          icon={<Smartphone />}
          data={latestReport?.responsiveness}
          color="emerald"
        />
        {/* Agente de QA */}
        <AgentCard 
          title="Pruebas de QA Logic"
          icon={<CheckCircle />}
          data={latestReport?.qaTest}
          color="purple"
        />
      </div>
    </div>
  );
};

interface AgentCardProps {
  title: string;
  icon: React.ReactNode;
  data?: any;
  color: 'blue' | 'red' | 'emerald' | 'purple';
}

const AgentCard: React.FC<AgentCardProps> = ({ title, icon, data, color }) => {
  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 p-6 rounded-2xl overflow-hidden relative"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400`}>
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-sm">Validación:</span>
          {data.valid ? (
            <span className="flex items-center gap-1 text-green-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle className="w-3 h-3" /> Pasa
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3 h-3" /> Falla
            </span>
          )}
        </div>
        
        <div className="text-sm border-t border-white/5 pt-3">
          <p className="text-white/70 font-medium mb-1">Hallazgos:</p>
          <ul className="list-disc list-inside text-white/50 text-xs space-y-1">
            {data.issues.length > 0 ? data.issues.map((issue: string, i: number) => (
              <li key={i}>{issue}</li>
            )) : <li>Sin problemas detectados</li>}
          </ul>
        </div>

        {data.recommendation && (
          <div className="bg-white/5 p-3 rounded-lg text-xs italic text-white/40 mt-4 border border-white/5">
            💡 {data.recommendation}
          </div>
        )}
      </div>
    </motion.div>
  );
};