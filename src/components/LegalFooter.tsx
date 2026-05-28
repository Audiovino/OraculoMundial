import React from 'react';
import { Link } from 'react-router-dom';

export const LegalFooter: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <footer
    className={`text-center text-slate-500 ${compact ? 'text-[10px] mt-4 space-y-1' : 'text-xs mt-8 space-y-2'}`}
  >
    <p className="text-slate-400 font-medium">
      Juego gratuito · Sin apuestas · Sin premios en dinero o especies
    </p>
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
      <Link to="/terminos" className="hover:text-blue-400 transition-colors">
        Términos
      </Link>
      <span className="text-slate-700">·</span>
      <Link to="/privacidad" className="hover:text-blue-400 transition-colors">
        Privacidad
      </Link>
      <span className="text-slate-700">·</span>
      <Link to="/reglas" className="hover:text-blue-400 transition-colors">
        Reglas
      </Link>
    </div>
  </footer>
);

export default LegalFooter;
