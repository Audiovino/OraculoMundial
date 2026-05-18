import React, { useState } from 'react';
import { useMundialAuth } from '../contexts/MundialAuthContext';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { validateFormData, sanitizeInput, detectInjectionAttempt } from '../services/securityValidator';
import { ValidationAlert } from './SecurityAlert';

type AuthMode = 'signin' | 'signup';

export const MundialAuth: React.FC = () => {
    const { signIn, signUp, error } = useMundialAuth();
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLocalError(null);
        setValidationErrors({});

        try {
            // 1. Validar inputs
            const formData = mode === 'signin' 
                ? { email, password }
                : { email, password, username };

            const validation = validateFormData(formData);
            if (!validation.valid) {
                setValidationErrors(validation.errors);
                setLoading(false);
                return;
            }

            // 2. Detectar inyecciones
            if (detectInjectionAttempt(email) || (mode === 'signup' && detectInjectionAttempt(username))) {
                setLocalError('⚠️ Entrada sospechosa detectada. Por favor, revisa tu entrada.');
                setLoading(false);
                return;
            }

            // 3. Sanitizar inputs
            const sanitized = {
                email: sanitizeInput(email),
                username: mode === 'signup' ? sanitizeInput(username) : '',
                password: password // NO sanitizar password
            };

            // 4. Proceder con autenticación
            if (mode === 'signin') {
                await signIn(sanitized.email, sanitized.password);
            } else {
                if (!sanitized.username.trim()) {
                    setValidationErrors({ username: 'El nombre de usuario es requerido' });
                    setLoading(false);
                    return;
                }
                await signUp(sanitized.email, sanitized.password, sanitized.username);
            }
        } catch (err: any) {
            setLocalError(err.message || 'Error en autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">⚽</div>
                    <h1 className="text-4xl font-black text-white mb-2">MUNDIAL 2026</h1>
                    <p className="text-gray-400">Juego de Predicciones</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-8">
                        <button
                            onClick={() => setMode('signin')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                                mode === 'signin'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                            }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                                mode === 'signup'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                            }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* Errores de validación */}
                    <ValidationAlert errors={validationErrors} />

                    {/* Errores generales */}
                    {(error || localError) && (
                        <div className="mb-6 p-4 bg-red-600/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-300">{error || localError}</p>
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Username (solo en signup) */}
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Nombre de Usuario</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="tu_usuario"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {mode === 'signin' ? 'Iniciar Sesión' : 'Registrarse'}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-gray-300">
                            <span className="font-bold text-blue-400">💡 Tip:</span> Usa un email válido para confirmar tu cuenta.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-8">
                    Al registrarte, aceptas nuestros{' '}
                    <a href="/terms" className="text-blue-400 hover:underline">
                        Términos de Uso
                    </a>
                </p>
            </div>
        </div>
    );
};
