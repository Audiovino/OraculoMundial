import React, { useState } from 'react';
import { MundialAuthProvider, useMundialAuth } from './contexts/MundialAuthContext';
import { MundialAuth } from './components/MundialAuth';
import { MundialGame } from './components/MundialGame';
import StadiumsGrid from './components/StadiumsGrid';
import Navigation from './components/Navigation';
import AdminDashboard from './components/AdminDashboard';
import { motion } from 'framer-motion';
import './App.css';

const AppContent: React.FC = () => {
    const { user, loading, isRecoveryMode } = useMundialAuth();
    const [currentView, setCurrentView] = useState<'game' | 'stadiums' | 'admin'>('game');

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
        <div style={{ backgroundColor: '#0f0f1e', minHeight: '100vh' }}>
            <Navigation currentView={currentView} onViewChange={setCurrentView} />
            <div style={{ paddingTop: '70px' }}>
                {currentView === 'game' && <MundialGame />}
                {currentView === 'stadiums' && <StadiumsGrid filter="all" />}
                {currentView === 'admin' && <AdminDashboard />}
            </div>
        </div>
    );
};

function App() {
    return (
        <MundialAuthProvider>
            <AppContent />
        </MundialAuthProvider>
    );
}

export default App;
