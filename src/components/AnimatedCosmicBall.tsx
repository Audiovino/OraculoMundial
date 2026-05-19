import React from 'react';

export default function AnimatedCosmicBall() {
    return (
        <div className="w-full max-w-[150px] aspect-square relative flex items-center justify-center bg-gradient-to-br from-purple-950/40 via-indigo-950/20 to-transparent rounded-[32px] border border-white/10 overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] shrink-0 transition-all duration-500 hover:border-purple-500/40">
            {/* Stars background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ec4899_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-20 pointer-events-none" />
            
            {/* Glowing Purple/Pink Nebulae */}
            <div className="absolute w-20 h-20 bg-gradient-to-tr from-purple-500/30 to-pink-500/20 rounded-full blur-[15px] animate-pulse pointer-events-none" />
            
            {/* Orbit paths */}
            <div className="absolute w-36 h-14 rounded-full border border-purple-500/20 border-t-purple-500/60 rotate-[-15deg] animate-[spin_10s_linear_infinite] pointer-events-none" />
            <div className="absolute w-32 h-24 rounded-full border border-dashed border-indigo-500/20 border-b-pink-500/40 rotate-[35deg] animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />
            
            {/* Cosmic Soccer Ball Oracle SVG */}
            <svg viewBox="0 0 100 100" className="w-20 h-20 z-10 drop-shadow-[0_0_15px_rgba(236,72,153,0.7)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <defs>
                    <linearGradient id="cosmicBallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#312e81" />
                    </linearGradient>
                    <radialGradient id="nebulaGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </radialGradient>
                </defs>
                
                {/* Glowing Core */}
                <circle cx="50" cy="50" r="38" fill="url(#cosmicBallGrad)" />
                <circle cx="50" cy="50" r="38" fill="url(#nebulaGlow)" opacity="0.3" />
                
                {/* Constellation Star Lines on Soccer Ball */}
                <g stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.8">
                    {/* Central Star Pentagon */}
                    <polygon points="50,30 65,41 59,58 41,58 35,41" strokeWidth="1.5" className="animate-pulse" />
                    {/* Glowing Vertices (Constellation stars) */}
                    <circle cx="50" cy="30" r="1.5" fill="#ffffff" />
                    <circle cx="65" cy="41" r="1.5" fill="#ffffff" />
                    <circle cx="59" cy="58" r="1.5" fill="#ffffff" />
                    <circle cx="41" cy="58" r="1.5" fill="#ffffff" />
                    <circle cx="35" cy="41" r="1.5" fill="#ffffff" />
                    
                    {/* Extension lines to the boundary */}
                    <line x1="50" y1="30" x2="50" y2="12" strokeWidth="1" />
                    <line x1="65" y1="41" x2="84" y2="35" strokeWidth="1" />
                    <line x1="59" y1="58" x2="72" y2="80" strokeWidth="1" />
                    <line x1="41" y1="58" x2="28" y2="80" strokeWidth="1" />
                    <line x1="35" y1="41" x2="16" y2="35" strokeWidth="1" />
                </g>
            </svg>
            
            {/* Dynamic floating sparkles */}
            <div className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-[ping_2s_infinite] top-6 left-10 pointer-events-none" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-[ping_3s_infinite_reverse] bottom-8 right-8 pointer-events-none" />
        </div>
    );
}
