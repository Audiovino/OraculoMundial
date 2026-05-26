import React, { useState } from 'react';
import { mundialSupabase } from '../services/mundialSupabaseClient';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await mundialSupabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setMessage({ type: 'success', text: '¡Contraseña actualizada! Ya puedes cerrar esta pestaña y volver a la app.' });
            setNewPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error al actualizar la contraseña' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f0f1e] text-white p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-2xl bg-purple-500/20 text-purple-400 mb-4">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Nueva Contraseña</h2>
                    <p className="text-white/50 text-sm">Ingresa tu nueva clave de acceso para Oráculo Mundial.</p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-4">Contraseña</label>
                        <input 
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:border-purple-500 outline-none transition-all"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading || newPassword.length < 6}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 rounded-2xl font-black uppercase italic transition-all shadow-lg shadow-purple-500/20"
                    >
                        {loading ? 'Actualizando...' : 'Guardar Nueva Clave'}
                    </button>
                </form>

                {message && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mt-6 p-4 rounded-2xl flex items-center gap-3 border ${
                            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                    >
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        <p className="text-xs font-medium">{message.text}</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};