import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { useMundialAuth } from '../contexts/MundialAuthContext';
import { LEGAL_SIGNUP_SUMMARY, LEGAL_TERMS_VERSION } from '../content/legalTexts';

/** Bloquea el juego hasta que usuarios existentes acepten la versión legal vigente */
export const LegalAcceptanceGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, acceptLegalTerms, loading } = useMundialAuth();
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading || !user) return <>{children}</>;

  const needsAcceptance =
    !user.legal_accepted_at || user.legal_terms_version !== LEGAL_TERMS_VERSION;

  if (!needsAcceptance) return <>{children}</>;

  const handleAccept = async () => {
    if (!checked) {
      setError('Debés marcar la casilla para continuar.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await acceptLegalTerms();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la aceptación.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f2e] p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Shield className="text-blue-400" size={22} />
          </div>
          <div>
            <h2 className="text-white font-black text-lg">Actualización legal</h2>
            <p className="text-slate-400 text-xs">Versión {LEGAL_TERMS_VERSION}</p>
          </div>
        </div>

        <ul className="text-sm text-slate-300 space-y-2 mb-4 list-disc pl-5">
          {LEGAL_SIGNUP_SUMMARY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <label className="flex items-start gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 rounded border-white/20"
          />
          <span className="text-xs text-slate-300 leading-relaxed">
            Leí y acepto los{' '}
            <Link to="/terminos" target="_blank" className="text-blue-400 underline">
              Términos
            </Link>
            , la{' '}
            <Link to="/privacidad" target="_blank" className="text-blue-400 underline">
              Privacidad
            </Link>{' '}
            y las{' '}
            <Link to="/reglas" target="_blank" className="text-blue-400 underline">
              Reglas del juego
            </Link>
            .
          </span>
        </label>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <button
          type="button"
          onClick={handleAccept}
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Continuar al juego'}
        </button>
      </div>
    </div>
  );
};

export default LegalAcceptanceGate;
