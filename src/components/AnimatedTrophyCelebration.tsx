import React from 'react';
import { Sparkles } from 'lucide-react';

const AnimatedTrophyCelebration = React.memo(function AnimatedTrophyCelebration() {
    return (
        <div className="w-full max-w-[150px] aspect-square relative flex items-center justify-center bg-gradient-to-br from-amber-900/20 to-transparent rounded-[32px] border border-white/10 overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] shrink-0 transition-transform duration-500 hover:border-amber-500/40">
            {/* Sparkle background stars - Simplified */}
            <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            
            {/* Glowing spotlight base */}
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-amber-500/15 to-transparent blur-[10px] pointer-events-none" />
            
            {/* Rotating 3D Golden Rings - Slower */}
            <div className="absolute w-32 h-32 rounded-full border-2 border-amber-500/15 border-t-amber-500 animate-[spin_30s_linear_infinite] pointer-events-none" />
            <div className="absolute w-24 h-24 rounded-full border border-dashed border-yellow-500/20 animate-[spin_20s_linear_infinite_reverse] pointer-events-none" />
            
            {/* Radial Gold Glow */}
            <div className="absolute w-16 h-16 bg-amber-500/20 rounded-full blur-[10px] group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
            
            {/* Realistic Golden Cup SVG - Optimized */}
            <svg viewBox="0 0 100 100" className="w-20 h-20 z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.7)] group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500" style={{ willChange: 'transform' }}>
                <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffe066" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                </defs>
                
                {/* Laurel Leaves around Trophy */}
                <path d="M25,65 C15,50 20,30 30,22 M75,65 C85,50 80,30 70,22" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" strokeDasharray="2 3" />
                
                {/* Crown Stars */}
                <polygon points="50,6 52,11 57,11 53,14 55,19 50,16 45,19 47,14 43,11 48,11" fill="#fbbf24" className="animate-pulse" />
                
                {/* The Golden Trophy Body */}
                <g fill="url(#goldGrad)">
                    {/* Rim & Bowl */}
                    <path d="M32,25 C32,25 32,55 50,55 C68,55 68,25 68,25 Z" />
                    <ellipse cx="50" cy="25" rx="18" ry="4" fill="#fef08a" />
                    
                    {/* Handles Left & Right */}
                    <path d="M32,28 C22,28 22,44 32,44 C26,44 26,32 32,32" />
                    <path d="M68,28 C78,28 78,44 68,44 C74,44 74,32 68,32" />
                    
                    {/* Stem / Neck */}
                    <path d="M46,55 L54,55 L52,68 L48,68 Z" />
                    
                    {/* Base */}
                    <path d="M38,68 L62,68 L65,76 L35,76 Z" />
                    <rect x="33" y="76" width="34" height="6" rx="2" fill="#78350f" />
                </g>
                
                {/* Sparkle stars */}
                <path d="M25,18 L26,21 L29,22 L26,23 L25,26 L24,23 L21,22 L24,21 Z" fill="#fef08a" className="animate-[ping_1.5s_infinite]" />
                <path d="M72,15 L73,18 L76,19 L73,20 L72,23 L71,20 L68,19 L71,18 Z" fill="#fef08a" className="animate-[ping_2s_infinite_reverse]" />
            </svg>
            
            {/* Floaters - Reduced */}
            <div className="absolute w-2 h-2 rounded-full bg-yellow-400 animate-ping top-8 left-8 pointer-events-none opacity-60" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping bottom-10 right-10 [animation-delay:0.5s] pointer-events-none opacity-60" />
        </div>
    );
});

export default AnimatedTrophyCelebration;
