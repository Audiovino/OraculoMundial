import React, { useEffect, useRef, useState } from 'react';
import { mundialSupabase } from './mundialSupabaseClient';
import { runAllAgents, HermesFullReport, sendTelegramAlert, sendTelegramFile } from './hermesAgents';
import { Shield, Activity, Smartphone, Lock, AlertTriangle, CheckCircle, RefreshCw, MapPin, Users, MessageSquare, X, Send, Clock, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeadsHeatmap } from './LeadsHeatmap';

export const HermesMonitorPanel: React.FC = () => {
  const [latestReport, setLatestReport] = useState<HermesFullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // Estados para el CRM de Leads
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [leadNotes, setLeadNotes] = useState<any[]>([]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchUsersLeads = async () => {
    if (!isMounted.current) return;
    const { data } = await mundialSupabase
      .from('mundial_users')
      .select('user_id, email, team_alias, detected_building, created_at')
      .order('created_at', { ascending: false });
    
    if (data && isMounted.current) {
      setUsersList(data);
    }
  };

  const fetchLatestReport = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const { data, error } = await mundialSupabase
        .from('hermes_logs')
        .select('created_at, status, health_data, security_data, ui_data, qa_data')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data && isMounted.current) {
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
      if (isMounted.current) setLoading(false);
    }
  };

  const handleManualScan = async () => {
    if (!isMounted.current) return;
    setIsScanning(true);
    const report = await runAllAgents();
    if (isMounted.current) {
      setLatestReport(report);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchLatestReport();
    fetchUsersLeads();
    return () => { isMounted.current = false; }; // ✅ Limpieza crítica para móvil
  }, []);

  const fetchLeadNotes = async (userId: string) => {
    const { data } = await mundialSupabase
      .from('lead_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setLeadNotes(data);
  };

  const handleSaveNote = async () => {
    if (!selectedLead || !noteText.trim()) return;
    setSavingNote(true);
    try {
      const { error } = await mundialSupabase
        .from('lead_notes')
        .insert([{
          user_id: selectedLead.user_id,
          note: noteText,
          priority: 'normal'
        }]);
      
      if (!error) {
        setNoteText('');
        fetchLeadNotes(selectedLead.user_id);
      }
    } finally {
      setSavingNote(false);
    }
  };

  const exportLeadsCSV = async () => {
    try {
      // 1. Obtener datos frescos de Supabase
      const { data: users } = await mundialSupabase
        .from('mundial_users')
        .select('user_id, email, team_alias, detected_building, created_at');
      
      const { data: notes } = await mundialSupabase
        .from('lead_notes')
        .select('user_id, note, created_at');

      if (!users) return;

      // 2. Construir contenido CSV
      const headers = ['ID', 'Email', 'Alias', 'Edificio/Zona', 'Fecha Registro', 'Notas CRM'].join(',');
      const rows = users.map((user: any) => {
        const userNotes = notes?.filter((n: any) => n.user_id === user.user_id)
          .map((n: any) => n.note.replace(/[,\n\r]/g, ' ')) // Sanitizar para CSV
          .join(' | ') || 'Sin notas';
        
        return [
          user.user_id,
          user.email,
          user.team_alias || 'Anon',
          user.detected_building || 'Pendiente',
          new Date(user.created_at).toLocaleDateString(),
          `"${userNotes}"`
        ].join(',');
      });

      const csvContent = [headers, ...rows].join('\n');
      const fileName = `leads_real_estate_${new Date().toISOString().split('T')[0]}.csv`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();

      // 3. Enviar archivo directamente a Telegram como documento
      await sendTelegramFile(csvContent, fileName);
    } catch (err) { console.error('Error export:', err); }
  };

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

      {/* Sección de Inteligencia Geográfica (Panel Secreto) */}
      <div className="space-y-6 pt-8 border-t border-white/10">
        <div className="flex items-center gap-2 text-purple-400">
          <MapPin className="w-6 h-6" />
          <h3 className="text-xl font-bold uppercase tracking-widest">Mapa de Calor de Leads</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <LeadsHeatmap />
          </div>

          {/* Listado de CRM Rápido */}
          <div className="bg-white/5 rounded-3xl border border-white/10 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="font-bold flex items-center gap-2"><Users className="w-4 h-4 text-purple-400"/> Leads Recientes</h4>
                <button 
                  onClick={exportLeadsCSV}
                  className="p-1 hover:bg-white/10 rounded text-emerald-400 transition-all"
                  title="Exportar CSV a navegador"
                ><Download size={14}/></button>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{usersList.length} total</span>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {usersList.map((user) => (
                <div 
                  key={user.user_id} 
                  onClick={() => { setSelectedLead(user); fetchLeadNotes(user.user_id); }}
                  className="p-3 bg-black/20 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium truncate">{user.team_alias || 'Anon'}</p>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageSquare className="w-3 h-3 text-purple-400" />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">{user.detected_building || 'Zona Pendiente'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de CRM (Notas del Lead) */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#0f0f2e] border border-purple-500/30 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <div>
                  <h4 className="font-black text-white uppercase tracking-tighter italic">Ficha del Lead</h4>
                  <p className="text-[10px] text-purple-400 font-bold uppercase">{selectedLead.team_alias || 'Sin Alias'}</p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/10 rounded-full text-white/50"><X size={20}/></button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info del usuario */}
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-white/40 uppercase mb-1">Email Privado</p>
                    <p className="text-white font-medium truncate">{selectedLead.email}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-white/40 uppercase mb-1">Ubicación</p>
                    <p className="text-emerald-400 font-bold">{selectedLead.detected_building || 'Zona Residencial'}</p>
                  </div>
                </div>

                {/* Nueva Nota */}
                <div className="space-y-3">
                  <textarea 
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Escribe una nota privada sobre este contacto (ej: Interesado en vender en Diciembre)..."
                    className="w-full h-24 bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-purple-500 outline-none resize-none"
                  />
                  <button 
                    onClick={handleSaveNote}
                    disabled={savingNote || !noteText.trim()}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {savingNote ? <RefreshCw className="animate-spin w-4 h-4"/> : <Send size={16}/>}
                    Guardar Nota CRM
                  </button>
                </div>

                {/* Historial de Notas */}
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Historial de Seguimiento</p>
                  {leadNotes.map(note => (
                    <div key={note.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-xs text-white/80">{note.note}</p>
                      <p className="text-[9px] text-white/30 mt-2 flex items-center gap-1"><Clock size={10}/> {new Date(note.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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