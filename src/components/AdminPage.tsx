import React from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useMundialAuth } from '../contexts/MundialAuthContext';
import AdminDashboard from './AdminDashboard';
import { motion } from 'framer-motion';

/**
 * Página de administración
 * Protegida: solo usuarios con admin válido pueden ver el dashboard.
 */
export const AdminPage: React.FC = () => {
    const { user } = useMundialAuth();
    const { isAdmin, loading } = useAdminAuth();

    // Mientras se verifica el estado de admin
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] text-white">
                <div className="flex flex-col items-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-16 h-16 border-4 border-white/10 border-t-blue-500 rounded-full mb-6"
                    />
                    <motion.p 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-blue-400 font-medium tracking-widest uppercase text-sm"
                    >
                        Cargando Panel...
                    </motion.p>
                </div>
            </div>
        );
    }

    // Usuario no autenticado o no es admin autorizado
    if (!user || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] text-white">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1>
                    <p className="text-gray-400 mb-6">No tienes permisos para acceder al panel de administración.</p>
                    <a href="/" className="text-blue-400 hover:text-blue-300 underline">
                        Volver al inicio
                    </a>
                </div>
            </div>
        );
    }

    // Usuario autenticado - mostrar dashboard
    return (
        <div style={{ backgroundColor: '#0f0f1e', minHeight: '100vh' }}>
            <div className="bg-green-500/10 border-b border-green-500/30 px-6 py-2 text-green-400 text-sm">
                ✅ Sesión administrativa activa: {user.email}
            </div>
            <AdminDashboard />
        </div>
    );
};

export default AdminPage;
