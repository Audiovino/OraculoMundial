import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AnimatedStatsShield() {
    return (
        <div className="w-full max-w-[120px] aspect-[3/4] relative flex flex-col items-center justify-between p-3 bg-gradient-to-br from-indigo-900/60 via-slate-950 to-[#0A0D1A] rounded-[24px] border-2 border-indigo-500/40 overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.7)] shrink-0 transition-transform duration-500 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            {/* Holographic glowing swipe */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite] pointer-events-none" />
            
            {/* Neon glowing aura behind */}
            <div className="absolute w-20 h-20 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-full blur-[15px] opacity-35 group-hover:opacity-60 transition-opacity duration-700 top-2 pointer-events-none" />

            {/* FUT Card Header */}
            <div className="relative z-10 w-full flex justify-between items-center">
                <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">PRED CARD</span>
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
            </div>

            {/* FUT Card Center Avatar Silhouette & Soccer Ball */}
            <div className="relative z-10 w-full flex-1 flex items-center justify-center my-1.5">
                <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-[0_0_12px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform duration-500">
                    <defs>
                        <linearGradient id="cardPlayerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                    </defs>
                    {/* Glowing outer ring */}
                    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#cardPlayerGrad)" strokeWidth="1" strokeDasharray="3 3" className="animate-[spin_20s_linear_infinite]" />
                    {/* Soccer jersey silhouette */}
                    <path d="M30,85 C30,70 36,65 50,65 C64,65 70,70 70,85 Z" fill="url(#cardPlayerGrad)" opacity="0.9" />
                    {/* Player Head */}
                    <circle cx="50" cy="46" r="13" fill="url(#cardPlayerGrad)" />
                    {/* Soccer ball inside head/mind glowing */}
                    <path d="M50,42 L53,48 L47,48 Z" fill="#ffffff" opacity="0.8" />
                </svg>
                {/* Pulsing ball in corner */}
                <div className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border border-white">
                    <span className="text-[7px] font-black text-slate-950">82</span>
                </div>
            </div>

            {/* FUT Card Stats Footer */}
            <div className="relative z-10 w-full space-y-1 text-center bg-black/40 p-2 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-[7px] font-black text-slate-400 uppercase tracking-wider">
                    <span>PRECISIÓN</span>
                    <span className="text-emerald-400 font-mono text-[8px]">82%</span>
                </div>
                {/* Sleek dynamic bar fill */}
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full w-[82%]" />
                </div>
                <div className="flex justify-between items-center text-[6px] font-black text-slate-500 uppercase tracking-widest pt-0.5">
                    <span>ESTABLE</span>
                    <span>12 PRON</span>
                </div>
            </div>
        </div>
    );
}
