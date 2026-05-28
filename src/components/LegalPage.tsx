import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  LEGAL_DOC_TITLES,
  LEGAL_SECTIONS,
  LEGAL_TERMS_VERSION,
  LEGAL_OPERATOR_NAME,
  type LegalDocType,
} from '../content/legalTexts';

interface LegalPageProps {
  type: LegalDocType;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const sections = LEGAL_SECTIONS[type];
  const title = LEGAL_DOC_TITLES[type];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft size={16} /> Volver al juego
        </Link>

        <header className="mb-8 border-b border-white/10 pb-6">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">{LEGAL_OPERATOR_NAME}</p>
          <h1 className="text-3xl font-black text-white">{title}</h1>
          <p className="text-sm text-slate-400 mt-2">Versión {LEGAL_TERMS_VERSION} · Última actualización: mayo 2026</p>
          <p className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm leading-relaxed">
            Aviso importante: este documento tiene fines informativos para usuarios del juego. No constituye asesoramiento
            legal. Para consultas específicas, contactá a un abogado en tu jurisdicción.
          </p>
        </header>

        <div className="space-y-6">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-white mb-2">{s.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-xs text-slate-500">
          <Link to="/terminos" className="hover:text-blue-400">Términos</Link>
          <Link to="/privacidad" className="hover:text-blue-400">Privacidad</Link>
          <Link to="/reglas" className="hover:text-blue-400">Reglas del juego</Link>
        </footer>
      </div>
    </div>
  );
};

export default LegalPage;
