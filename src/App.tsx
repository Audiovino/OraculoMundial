import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MundialAuthProvider, useMundialAuth } from './contexts/MundialAuthContext';
import { MundialAuth } from './components/MundialAuth';
import { MundialGame } from './components/MundialGame';
import StadiumsGrid from './components/StadiumsGrid';
import Navigation from './components/Navigation';
import AdminPage from './components/AdminPage';
import { HermesSecurityWrapper } from './components/HermesSecurityWrapper';
import { ResetPassword } from './components/ResetPassword';
import { LegalPage } from './components/LegalPage';
import { LegalAcceptanceGate } from './components/LegalAcceptanceGate';
import { LegalFooter } from './components/LegalFooter';
import { motion } from 'framer-motion';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VideoDemo } from './components/VideoDemo';
import './App.css';
import { useAdminAuth } from './hooks/useAdminAuth';

const AppContent: React.FC = () => {
    const { user, loading: authLoading, isRecoveryMode } = useMundialAuth();
    const { isAdmin, loading: adminLoading, error: adminError } = useAdminAuth();
    // Show loading spinner while admin status is being determined
    // State and effect moved here to satisfy Rules of Hooks
    const [currentView, setCurrentView] = useState<'game' | 'stadiums' | 'admin'>('game');

    // Seguridad Hermes: Redirección INMEDIATA si intenta acceder a admin sin permisos
    useEffect(() => {
        if (!adminLoading && currentView === 'admin' && !isAdmin) {
            console.warn('[HERMES SECURITY] Non-admin user attempted admin access. Redirecting...');
            setCurrentView('game');
        }
    }, [currentView, isAdmin, adminLoading]);


    // If the user is not an admin, still show the main application (game, stadiums, etc.)
    // The admin dashboard will be inaccessible, but the rest of the site works.
    // This restores the previous behavior where the app is visible to all users.
    // Continue to render the normal UI below.
    // (No early return here, fall through to the rest of the component.)



    // Seguridad adicional: nunca renderizar AdminPage si no es admin
    const canAccessAdmin = !adminLoading && isAdmin && user?.id;
    if (!canAccessAdmin && currentView === 'admin') {
        console.error('[HERMES SECURITY] Critical: attempted render of AdminPage without proper authorization');
        // Force redirect
        if (currentView === 'admin') {
            setTimeout(() => setCurrentView('game'), 0);
        }
    }

    const loading = authLoading || adminLoading;

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
                        Iniciando Sistema...
                    </motion.p>
                </div>
            </div>
        );
    }

    if (isRecoveryMode) {
        return <MundialAuth isRecovery={true} />;
    }

    if (!user) {
        return <MundialAuth />;
    }

    return (
        <LegalAcceptanceGate>
        <HermesSecurityWrapper>
                <div style={{ backgroundColor: '#0f0f1e', minHeight: '100vh' }}>
                        <Navigation currentView={currentView} onViewChange={setCurrentView} />
                        <div className="pt-[110px] md:pt-[70px]">
                            {currentView === 'game' && (
  <>
    <MundialGame />
    <VideoDemo />
  </>
)}
                            {currentView === 'stadiums' && (
                                <ErrorBoundary>
                                    <StadiumsGrid filter="all" />
                                </ErrorBoundary>
                            )}
                            {/* Protección: Solo renderizar AdminPage si el usuario es admin autorizado */}
                            {currentView === 'admin' && isAdmin && !adminLoading && <AdminPage />}
                            {currentView === 'admin' && (!isAdmin || adminLoading) && (
                                <div className="flex items-center justify-center min-h-screen text-red-500">
                                    Acceso no autorizado.
                                </div>
                            )}
                        </div>
                    <LegalFooter compact />
                </div>
        </HermesSecurityWrapper>
        </LegalAcceptanceGate>
    );
};

const AppRoutes: React.FC = () => (
    <Routes>
        <Route path="/terminos" element={<LegalPage type="terms" />} />
        <Route path="/privacidad" element={<LegalPage type="privacy" />} />
        <Route path="/reglas" element={<LegalPage type="rules" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<AppContent />} />
    </Routes>
);

function App() {
    return (
        <MundialAuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </MundialAuthProvider>
    );
}

export default App;
