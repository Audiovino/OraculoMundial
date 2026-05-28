import React, { useState, useEffect } from 'react';
import { useMundialAuth } from '../contexts/MundialAuthContext';
import { Mail, Lock, User, AlertCircle, Loader2, Building2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PUERTO_MADERO_BUILDINGS, USER_ROLES, type UserRole } from '../constants/buildings';
import { LEGAL_SIGNUP_SUMMARY, LEGAL_TERMS_VERSION } from '../content/legalTexts';
import { LegalFooter } from './LegalFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { validateFormData, sanitizeInput, detectInjectionAttempt } from '../services/securityValidator';
import { ValidationAlert } from './SecurityAlert';

type AuthMode = 'signin' | 'signup' | 'forgot_password' | 'update_password';

export const MundialAuth: React.FC<{ isRecovery?: boolean }> = ({ isRecovery }) => {
    const { signIn, signUp, resetPassword, updatePassword, error } = useMundialAuth();
    const [mode, setMode] = useState<AuthMode>(isRecovery ? 'update_password' : 'signin');

    useEffect(() => {
        setMode(isRecovery ? 'update_password' : 'signin');
    }, [isRecovery]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [resetSent, setResetSent] = useState(false);
    const [buildingName, setBuildingName] = useState<string>(PUERTO_MADERO_BUILDINGS[0]);
    const [userRole, setUserRole] = useState<UserRole>('vecino');
    const [legalAccepted, setLegalAccepted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLocalError(null);
        setValidationErrors({});

        try {
            // 1. Validar inputs
            let formData: any = {};
            if (mode === 'signin') formData = { email, password };
            else if (mode === 'signup') formData = { email, password, username };
            else if (mode === 'forgot_password') formData = { email };
            else if (mode === 'update_password') formData = { password };

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
            if (mode === 'forgot_password') {
                await resetPassword(sanitized.email);
                setResetSent(true);
            } else if (mode === 'update_password') {
                await updatePassword(sanitized.password);
            } else if (mode === 'signin') {
                await signIn(sanitized.email, sanitized.password);
            } else {
                if (!sanitized.username.trim()) {
                    setValidationErrors({ username: 'El nombre de usuario es requerido' });
                    setLoading(false);
                    return;
                }
                if (!legalAccepted) {
                    setLocalError('Debés aceptar los términos legales para crear tu cuenta.');
                    setLoading(false);
                    return;
                }
                await signUp(sanitized.email, sanitized.password, {
                    username: sanitized.username,
                    buildingName,
                    userRole,
                    legalAccepted: true,
                    termsVersion: LEGAL_TERMS_VERSION,
                });
            }
        } catch (err: any) {
            setLocalError(err.message || 'Error en autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-blue-500/30 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[100px] rounded-full mix-blend-screen" />
                <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                        className="relative inline-block"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-40" />
                        <div className="text-6xl mb-4 relative drop-shadow-2xl">🏆</div>
                    </motion.div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight mb-2">
                        ORÁCULO MUNDIAL
                    </h1>
                    <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Predicciones 2026</p>
                </div>

                {/* Card */}
                <div className="bg-[#0B0F19]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {/* Tabs */}
                    {mode !== 'forgot_password' && mode !== 'update_password' ? (
                        <div className="flex gap-2 mb-8 p-1 bg-white/[0.03] rounded-2xl border border-white/5">
                            <button
                                onClick={() => setMode('signin')}
                                className={`relative flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                                    mode === 'signin'
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {mode === 'signin' && (
                                    <motion.div layoutId="authTab" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)]" />
                                )}
                                <span className="relative z-10">Iniciar Sesión</span>
                            </button>
                            <button
                                onClick={() => setMode('signup')}
                                className={`relative flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                                    mode === 'signup'
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {mode === 'signup' && (
                                    <motion.div layoutId="authTab" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)]" />
                                )}
                                <span className="relative z-10">Registrarse</span>
                            </button>
                        </div>
                    ) : (
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {mode === 'update_password' ? 'Nueva Contraseña' : 'Recuperar Contraseña'}
                            </h2>
                            <p className="text-slate-400 text-sm">
                                {mode === 'update_password' ? 'Ingresa tu nueva contraseña para acceder.' : 'Ingresa tu email para recibir un enlace de recuperación.'}
                            </p>
                        </div>
                    )}

                    {/* Errores de validación */}
                    <ValidationAlert errors={validationErrors} />

                    {/* Errores generales */}
                    <AnimatePresence>
                        {(error || localError) && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-200">{error || localError}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="popLayout">
                            {/* Email */}
                            {mode !== 'update_password' && (
                                <motion.div
                                    key="email"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all focus:bg-white/10"
                                            required
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Username (solo en signup) */}
                            {mode === 'signup' && (
                                <motion.div
                                    key="username"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className="pt-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre de Usuario</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="tu_usuario"
                                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all focus:bg-white/10"
                                                required
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {mode === 'signup' && (
                                <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Edificio o zona (para la Copa)
                                    </label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <select
                                            value={buildingName}
                                            onChange={(e) => setBuildingName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                                            required
                                        >
                                            {PUERTO_MADERO_BUILDINGS.map((b) => (
                                                <option key={b} value={b} className="bg-[#0B0F19]">
                                                    {b}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">
                                        Tu rol en el edificio
                                    </label>
                                    <select
                                        value={userRole}
                                        onChange={(e) => setUserRole(e.target.value as UserRole)}
                                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                                        required
                                    >
                                        {USER_ROLES.map((r) => (
                                            <option key={r.value} value={r.value} className="bg-[#0B0F19]">
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </motion.div>
                            )}

                            {mode === 'signup' && (
                                <motion.div key="legal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                    <div className="p-3 rounded-xl bg-slate-800/50 border border-white/10">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 flex items-center gap-1">
                                            <Shield size={12} /> Aviso legal del juego
                                        </p>
                                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                                            {LEGAL_SIGNUP_SUMMARY.map((line) => (
                                                <li key={line}>{line}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={legalAccepted}
                                            onChange={(e) => setLegalAccepted(e.target.checked)}
                                            className="mt-1"
                                        />
                                        <span className="text-xs text-slate-300 leading-relaxed">
                                            Acepto los{' '}
                                            <Link to="/terminos" target="_blank" className="text-blue-400 underline">
                                                Términos
                                            </Link>
                                            , la{' '}
                                            <Link to="/privacidad" target="_blank" className="text-blue-400 underline">
                                                Privacidad
                                            </Link>{' '}
                                            y las{' '}
                                            <Link to="/reglas" target="_blank" className="text-blue-400 underline">
                                                Reglas
                                            </Link>
                                            . Entiendo que es solo entretenimiento sin premios.
                                        </span>
                                    </label>
                                </motion.div>
                            )}

                            {/* Password */}
                            {mode !== 'forgot_password' && (
                                <motion.div
                                    key="password"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contraseña</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all focus:bg-white/10"
                                            required
                                        />
                                    </div>
                                    {mode === 'signin' && (
                                        <div className="mt-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setMode('forgot_password')}
                                                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.div className="pt-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-white/10"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    mode === 'signin' ? 'Iniciar Sesión' : mode === 'signup' ? 'Crear Cuenta' : mode === 'update_password' ? 'Actualizar Contraseña' : 'Enviar Enlace'
                                )}
                            </button>
                        </motion.div>

                        {/* Go back to login */}
                        {mode === 'forgot_password' && (
                            <button
                                type="button"
                                onClick={() => setMode('signin')}
                                className="w-full py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                Volver al inicio de sesión
                            </button>
                        )}
                    </form>

                    {/* Info */}
                    <AnimatePresence>
                        {mode === 'forgot_password' && resetSent && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                            >
                                <p className="text-sm text-emerald-400 font-medium text-center">
                                    ¡Revisa tu bandeja de entrada! Te hemos enviado un enlace para restablecer tu contraseña.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <LegalFooter />
            </motion.div>
        </div>
    );
};
