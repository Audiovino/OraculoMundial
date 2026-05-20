import React from 'react';

export default function AnimatedBicycleKick() {
    return (
        <div className="w-full max-w-[150px] aspect-square relative flex items-center justify-center bg-gradient-to-br from-blue-900/40 via-indigo-950/20 to-transparent rounded-[32px] border border-white/10 overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] shrink-0 transition-all duration-500 hover:border-blue-500/40">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
            
            {/* Circular Glowing Lines */}
            <div className="absolute w-32 h-32 rounded-full border border-blue-500/20 animate-[spin_20s_linear_infinite] pointer-events-none" />
            <div className="absolute w-24 h-24 rounded-full border border-dashed border-indigo-500/30 animate-[spin_10s_linear_infinite_reverse] pointer-events-none" />
            
            {/* Radial Blur Glow */}
            <div className="absolute w-16 h-16 bg-blue-500/30 rounded-full blur-[20px] group-hover:bg-blue-400/40 transition-colors duration-500 pointer-events-none" />
            
            {/* Real Visual SVG: Soccer Ball */}
            <svg viewBox="0 0 24 24" className="w-20 h-20 z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 animate-[bounce_3s_ease-in-out_infinite]">
                <defs>
                    <linearGradient id="ballGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#93c5fd" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                </defs>
                
                {/* Main Ball Body */}
                <circle cx="12" cy="12" r="10" fill="url(#ballGradient)" stroke="#bfdbfe" strokeWidth="0.8" />
                
                {/* Central Pentagon */}
                <path d="M 12 15.5 L 15 12.5 L 13.8 8.5 L 10.2 8.5 L 9 12.5 Z" fill="#0f172a" stroke="#bfdbfe" strokeWidth="0.8" strokeLinejoin="round" />
                
                {/* Lines radiating from vertices to form the classic pattern */}
                <path d="M 12 15.5 L 12 22" stroke="#bfdbfe" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M 15 12.5 L 21 14" stroke="#bfdbfe" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M 9 12.5 L 3 14" stroke="#bfdbfe" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M 13.8 8.5 L 16.5 3.5" stroke="#bfdbfe" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M 10.2 8.5 L 7.5 3.5" stroke="#bfdbfe" strokeWidth="0.8" strokeLinecap="round" />
                
                {/* Motion Lines */}
                <path d="M 2 20 Q 8 24 12 22" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.4" strokeDasharray="2 2" />
                <path d="M -2 16 Q 4 22 8 20" fill="none" stroke="#3b82f6" strokeWidth="0.6" opacity="0.3" strokeDasharray="1 2" />
            </svg>
            
            {/* Sparkles particle effects */}
            <div className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping top-8 left-12 pointer-events-none" />
            <div className="absolute w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping bottom-10 right-12 [animation-delay:0.7s] pointer-events-none" />
        </div>
    );
}
