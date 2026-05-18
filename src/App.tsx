import React from 'react';
import { MundialAuthProvider, useMundialAuth } from './contexts/MundialAuthContext';
import { MundialAuth } from './components/MundialAuth';
import { MundialGame } from './components/MundialGame';
import './App.css';

const AppContent: React.FC = () => {
    const { user, loading } = useMundialAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⚽</div>
                    <p className="text-white text-lg">Cargando...</p>
                </div>
            </div>
        );
    }

    return user ? <MundialGame /> : <MundialAuth />;
};

function App() {
    return (
        <MundialAuthProvider>
            <AppContent />
        </MundialAuthProvider>
    );
}

export default App;
