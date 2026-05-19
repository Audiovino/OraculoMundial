import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, User, Users, Save, ChevronDown, Calendar, Flag, Share2, Download, X, Sparkles, Clock, Search, ChevronLeft, ChevronRight, MapPin, Play, LogOut, BarChart3, Check, Loader2 } from 'lucide-react';
import { ASTRO_PREDICTIONS } from '../data/AstroData';
import { WORLD_CUP_SCHEDULES, TIMEZONE_INFO } from '../data/WorldCupSchedules';
import { useMundialAuth } from '../contexts/MundialAuthContext';
import { mundialSupabase, MundialRanking, MundialPrediction } from '../services/mundialSupabaseClient';
import { MundialScene } from './scene/MundialScene';
import { Interactive3DSoccer } from './Interactive3DSoccer';
import * as THREE from 'three';

// ---------------------------------------------------------
// REVISIÓN VISUAL: BALÓN DE FÚTBOL 3D REAL EN EL ENCABEZADO
// ---------------------------------------------------------
function HeaderSoccerBall3D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 2.8;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(96, 96);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Iluminación para resaltar la 3D del balón
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);

        const light1 = new THREE.DirectionalLight(0x38bdf8, 1.6);
        light1.position.set(5, 5, 2);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xc084fc, 0.9);
        light2.position.set(-5, -5, -2);
        scene.add(light2);

        // Shader del Balón Procedural Clásico e Hiper-realista
        const soccerBallMaterial = new THREE.ShaderMaterial({
            uniforms: {
                light1Pos: { value: new THREE.Vector3(5, 5, 2).normalize() },
                light1Color: { value: new THREE.Color(0x38bdf8) },
                light2Pos: { value: new THREE.Vector3(-5, -5, -2).normalize() },
                light2Color: { value: new THREE.Color(0xc084fc) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                uniform vec3 light1Pos;
                uniform vec3 light1Color;
                uniform vec3 light2Pos;
                uniform vec3 light2Color;
                
                vec3 icos[12];
                
                void main() {
                    float phi = 1.61803398875;
                    icos[0] = normalize(vec3(-1.0, phi, 0.0));
                    icos[1] = normalize(vec3(1.0, phi, 0.0));
                    icos[2] = normalize(vec3(-1.0, -phi, 0.0));
                    icos[3] = normalize(vec3(1.0, -phi, 0.0));
                    
                    icos[4] = normalize(vec3(0.0, -1.0, phi));
                    icos[5] = normalize(vec3(0.0, 1.0, phi));
                    icos[6] = normalize(vec3(0.0, -1.0, -phi));
                    icos[7] = normalize(vec3(0.0, 1.0, -phi));
                    
                    icos[8] = normalize(vec3(phi, 0.0, -1.0));
                    icos[9] = normalize(vec3(phi, 0.0, 1.0));
                    icos[10] = normalize(vec3(-phi, 0.0, -1.0));
                    icos[11] = normalize(vec3(-phi, 0.0, 1.0));
                    
                    vec3 p = normalize(vPosition);
                    
                    float firstMax = -1.0;
                    float secondMax = -1.0;
                    for (int i = 0; i < 12; i++) {
                        float d = dot(p, icos[i]);
                        if (d > firstMax) {
                            secondMax = firstMax;
                            firstMax = d;
                        } else if (d > secondMax) {
                            secondMax = d;
                        }
                    }
                    
                    vec3 baseColor = vec3(0.96, 0.96, 0.98);
                    if (firstMax > 0.89) {
                        baseColor = vec3(0.08, 0.08, 0.10);
                    }
                    
                    float seam1 = abs(firstMax - 0.89);
                    if (seam1 < 0.018) {
                        baseColor = vec3(0.0, 0.0, 0.0);
                    }
                    
                    float edgeVal = firstMax - secondMax;
                    if (edgeVal < 0.048 && firstMax <= 0.89) {
                        baseColor = vec3(0.0, 0.0, 0.0);
                    }
                    
                    vec3 n = normalize(vNormal);
                    float diff1 = max(dot(n, light1Pos), 0.0);
                    vec3 r1 = reflect(-light1Pos, n);
                    float spec1 = pow(max(dot(r1, vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
                    
                    float diff2 = max(dot(n, light2Pos), 0.0);
                    vec3 r2 = reflect(-light2Pos, n);
                    float spec2 = pow(max(dot(r2, vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
                    
                    vec3 ambient = vec3(0.25) * baseColor;
                    vec3 diffuse = (diff1 * light1Color + diff2 * light2Color) * baseColor * 0.95;
                    vec3 specular = (spec1 * light1Color * 0.5) + (spec2 * light2Color * 0.4);
                    
                    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
                }
            `
        });

        const ballGeo = new THREE.SphereGeometry(1.0, 32, 32);
        const ball = new THREE.Mesh(ballGeo, soccerBallMaterial);
        scene.add(ball);

        let animationFrameId: number;
        let clock = new THREE.Clock();

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            ball.rotation.y = elapsedTime * 0.9;
            ball.rotation.x = elapsedTime * 0.45;
            
            // Efecto sutil de bote físico interactivo
            ball.position.y = Math.sin(elapsedTime * 4.5) * 0.08;

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            ballGeo.dispose();
            soccerBallMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className="w-24 h-24 relative flex items-center justify-center">
            <canvas ref={canvasRef} className="w-24 h-24 block drop-shadow-[0_10px_20px_rgba(56,189,248,0.4)]" />
        </div>
    );
}

// ---------------------------------------------------------
// 5 ICONOS ILUSTRADOS Y ANIMADOS EN SVG PARA LAS SECCIONES
// ---------------------------------------------------------
function AnimatedBicycleKick() {
    return (
        <div className="w-full max-w-[150px] h-[150px] relative flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-3xl border border-white/5 overflow-hidden group shadow-2xl shrink-0">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] animate-[pulse_3s_infinite]" />
            <svg viewBox="0 0 200 200" className="w-32 h-32 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <circle cx="100" cy="100" r="85" fill="none" stroke="url(#blueGrad)" strokeWidth="1.5" strokeDasharray="30 150" className="animate-[spin_4s_linear_infinite]" />
                <circle cx="100" cy="100" r="85" fill="none" stroke="url(#emeraldGrad)" strokeWidth="1" strokeDasharray="60 120" className="animate-[spin_6s_linear_infinite_reverse]" />
                <g className="animate-[bounce_3s_ease-in-out_infinite]" style={{ transformOrigin: '100px 100px' }}>
                    <path
                        d="M 60,110 C 70,80 90,70 120,60 C 130,55 145,50 150,60 C 152,65 140,75 130,85 C 115,100 100,120 90,140 C 85,150 75,160 65,155 C 55,150 50,135 60,110 Z"
                        fill="url(#blueGrad)"
                        opacity="0.85"
                    />
                    <circle cx="152" cy="50" r="10" fill="#38bdf8" />
                    <g className="animate-[pulse_1s_infinite]">
                        <circle cx="50" cy="80" r="12" fill="#fff" />
                        <circle cx="50" cy="80" r="12" fill="none" stroke="#10b981" strokeWidth="2.5" />
                        <path d="M 45,75 L 55,85 M 55,75 L 45,85" stroke="#000" strokeWidth="1.5" />
                    </g>
                </g>
                <defs>
                    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

function AnimatedTrophyCelebration() {
    return (
        <div className="w-full max-w-[150px] h-[150px] relative flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-3xl border border-white/5 overflow-hidden group shadow-2xl shrink-0">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:20px_20px] animate-[pulse_2s_infinite]" />
            <svg viewBox="0 0 200 200" className="w-32 h-32 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                <circle cx="100" cy="100" r="75" fill="none" stroke="url(#goldGrad)" strokeWidth="2" className="animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <g className="animate-[bounce_2.5s_ease-in-out_infinite]" style={{ transformOrigin: '100px 100px' }}>
                    <rect x="75" y="145" width="50" height="15" rx="5" fill="#d97706" />
                    <rect x="80" y="130" width="40" height="15" rx="3" fill="#f59e0b" />
                    <path d="M 90,130 C 90,110 80,95 90,75 C 95,65 105,65 110,75 C 120,95 110,110 110,130 Z" fill="#fbbf24" />
                    <circle cx="100" cy="55" r="22" fill="#fbbf24" />
                    <circle cx="100" cy="55" r="18" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="10 5" className="animate-[spin_12s_linear_infinite]" />
                    <path d="M 50,40 L 53,46 L 60,47 L 55,52 L 56,59 L 50,55 L 44,59 L 45,52 L 40,47 L 47,46 Z" fill="#fbbf24" className="animate-[pulse_1s_infinite]" />
                    <path d="M 150,40 L 153,46 L 160,47 L 155,52 L 156,59 L 150,55 L 144,59 L 145,52 L 140,47 L 147,46 Z" fill="#fbbf24" className="animate-[pulse_1s_infinite_reverse] [animation-delay:0.5s]" />
                </g>
                <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

function AnimatedStatsShield() {
    return (
        <div className="w-full max-w-[150px] h-[150px] relative flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-3xl border border-white/5 overflow-hidden group shadow-2xl shrink-0">
            <svg viewBox="0 0 200 200" className="w-32 h-32 drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]">
                <polygon points="100,25 165,62.5 165,137.5 100,175 35,137.5 35,62.5" fill="none" stroke="rgba(129, 140, 248, 0.2)" strokeWidth="1" />
                <path d="M 100,20 C 130,20 170,25 170,75 C 170,125 125,165 100,180 C 75,165 30,125 30,75 C 30,25 70,20 100,20 Z" fill="none" stroke="url(#shieldGrad)" strokeWidth="3" className="animate-[pulse_2.5s_infinite]" />
                <g className="animate-[bounce_4s_ease-in-out_infinite]" style={{ transformOrigin: '100px 100px' }}>
                    <circle cx="100" cy="90" r="30" fill="url(#shieldGrad)" opacity="0.15" />
                    <circle cx="100" cy="90" r="24" fill="none" stroke="#818cf8" strokeWidth="2.5" />
                    <polygon points="100,74 116,85 110,103 90,103 84,85" fill="none" stroke="#818cf8" strokeWidth="1.5" />
                </g>
                <path d="M 45,145 Q 75,120 100,140 T 155,130" fill="none" stroke="#a78bfa" strokeWidth="3" className="animate-[pulse_1.5s_infinite]" strokeLinecap="round" />
                <circle cx="100" cy="140" r="3" fill="#a78bfa" />
                <defs>
                    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

function AnimatedCosmicBall() {
    return (
        <div className="w-full max-w-[150px] h-[150px] relative flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-3xl border border-white/5 overflow-hidden group shadow-2xl shrink-0">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:24px_24px] animate-[pulse_4s_infinite]" />
            <svg viewBox="0 0 200 200" className="w-32 h-32 drop-shadow-[0_0_20px_rgba(192,132,252,0.4)]">
                <ellipse cx="100" cy="100" rx="80" ry="25" fill="none" stroke="url(#cosmicGrad)" strokeWidth="1.5" className="animate-[spin_8s_linear_infinite]" style={{ transformOrigin: '100px 100px', transform: 'rotate(30deg)' }} />
                <g className="animate-[bounce_3.5s_ease-in-out_infinite]" style={{ transformOrigin: '100px 100px' }}>
                    <circle cx="100" cy="100" r="32" fill="url(#cosmicGrad)" opacity="0.85" />
                    <circle cx="100" cy="100" r="35" fill="none" stroke="#f472b6" strokeWidth="1.5" className="animate-ping" />
                </g>
                <defs>
                    <linearGradient id="cosmicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

function AnimatedClockStadium() {
    return (
        <div className="w-full max-w-[150px] h-[150px] relative flex items-center justify-center bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl border border-white/5 overflow-hidden group shadow-2xl shrink-0">
            <svg viewBox="0 0 200 200" className="w-32 h-32 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="6" />
                <circle cx="100" cy="100" r="82" fill="none" stroke="#34d399" strokeWidth="2.5" strokeDasharray="10 40" className="animate-[spin_20s_linear_infinite]" />
                <g className="animate-[bounce_3s_ease-in-out_infinite]" style={{ transformOrigin: '100px 100px' }}>
                    <path
                        d="M 120,80 C 130,90 140,95 155,100 M 110,65 L 120,80 L 105,100 L 115,120 M 120,80 L 95,90 L 80,115"
                        stroke="url(#emeraldClockGrad)"
                        strokeWidth="3.5"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <circle cx="110" cy="55" r="7" fill="#34d399" />
                </g>
                <line x1="100" y1="100" x2="100" y2="42" stroke="#fff" strokeWidth="2" className="animate-[spin_10s_linear_infinite]" style={{ transformOrigin: '100px 100px' }} strokeLinecap="round" />
                <line x1="100" y1="100" x2="135" y2="100" stroke="#10b981" strokeWidth="3" className="animate-[spin_120s_linear_infinite]" style={{ transformOrigin: '100px 100px' }} strokeLinecap="round" />
                <circle cx="100" cy="100" r="6" fill="#fff" />
                <defs>
                    <linearGradient id="emeraldClockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

// ---------------------------------------------------------
// TEMPORIZADOR DE KICKOFF DINÁMICO EN TIEMPO REAL
// ---------------------------------------------------------
const getMatchKickoff = (matchId: string, matchDateStr: string): Date => {
    const now = new Date();
    
    // Partidos especiales para testing inmediato en vivo con cuenta regresiva activa hoy!
    if (matchId === 'm3') {
        return new Date(now.getTime() + (1 * 60 * 60 * 1000) + (32 * 60 * 1000));
    }
    if (matchId === 'm4') {
        return new Date(now.getTime() + (2 * 60 * 60 * 1000) + (15 * 60 * 1000));
    }
    if (matchId === 'm7') {
        return new Date(now.getTime() + (2 * 60 * 60 * 1000) + (50 * 60 * 1000));
    }
    
    // Para otros partidos, parsear la fecha de Junio 2026 (por default > 3 horas)
    const day = parseInt(matchDateStr) || 15;
    const kickoff = new Date(2026, 5, day, 18, 0, 0);
    
    const numId = parseInt(matchId.replace(/\D/g, '')) || 1;
    if (numId % 3 === 0) {
        kickoff.setHours(15, 0, 0);
    } else if (numId % 3 === 1) {
        kickoff.setHours(21, 0, 0);
    } else {
        kickoff.setHours(18, 0, 0);
    }
    
    return kickoff;
};

interface MatchCountdownProps {
    kickoff: Date;
}

function MatchCountdown({ kickoff }: MatchCountdownProps) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const diff = kickoff.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeLeft('¡EN JUEGO!');
                return;
            }
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            
            const pad = (n: number) => n.toString().padStart(2, '0');
            setTimeLeft(`${pad(h)}:${pad(m)}:${pad(s)}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [kickoff]);

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-red-500/40 rounded-xl animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[9px] font-black text-red-400 tracking-widest uppercase">KICKOFF:</span>
            <span className="text-[11px] font-black text-white font-mono tracking-wider">{timeLeft}</span>
        </div>
    );
}

interface Match {
    id: string;
    home: { name: string; code: string; flag: string };
    away: { name: string; code: string; flag: string };
    date: string;
    venue: string;
    group: string;
    result?: { home: number; away: number };
    status?: 'scheduled' | 'live' | 'finished';
}

interface Prediction {
    matchId: string;
    homeScore: string;
    awayScore: string;
}

// Helper para banderas
const getFlag = (code: string) => `https://flagcdn.com/w80/${code.toLowerCase()}.png`;

const WC_MATCHES: Match[] = [
    // GRUPO A
    { id: 'm1', home: { name: 'México', code: 'MEX', flag: getFlag('MX') }, away: { name: 'Sudáfrica', code: 'RSA', flag: getFlag('ZA') }, date: '11 Jun', venue: 'Estadio Ciudad de México', group: 'A', status: 'finished', result: { home: 2, away: 1 } },
    { id: 'm2', home: { name: 'Corea del Sur', code: 'KOR', flag: getFlag('KR') }, away: { name: 'Ucrania', code: 'UKR', flag: getFlag('UA') }, date: '11 Jun', venue: 'Estadio Guadalajara', group: 'A', status: 'live', result: { home: 1, away: 1 } },
    { id: 'm3', home: { name: 'Ucrania', code: 'UKR', flag: getFlag('UA') }, away: { name: 'Sudáfrica', code: 'RSA', flag: getFlag('ZA') }, date: '18 Jun', venue: 'Atlanta Stadium', group: 'A' },
    { id: 'm4', home: { name: 'México', code: 'MEX', flag: getFlag('MX') }, away: { name: 'Corea del Sur', code: 'KOR', flag: getFlag('KR') }, date: '18 Jun', venue: 'Estadio Guadalajara', group: 'A' },
    { id: 'm5', home: { name: 'Ucrania', code: 'UKR', flag: getFlag('UA') }, away: { name: 'México', code: 'MEX', flag: getFlag('MX') }, date: '24 Jun', venue: 'Estadio Ciudad de México', group: 'A' },
    { id: 'm6', home: { name: 'Sudáfrica', code: 'RSA', flag: getFlag('ZA') }, away: { name: 'Corea del Sur', code: 'KOR', flag: getFlag('KR') }, date: '24 Jun', venue: 'Estadio Monterrey', group: 'A' },

    // GRUPO B
    { id: 'm7', home: { name: 'Canadá', code: 'CAN', flag: getFlag('CA') }, away: { name: 'Polonia', code: 'POL', flag: getFlag('PL') }, date: '12 Jun', venue: 'Toronto Stadium', group: 'B' },
    { id: 'm8', home: { name: 'Qatar', code: 'QAT', flag: getFlag('QA') }, away: { name: 'Suiza', code: 'SUI', flag: getFlag('CH') }, date: '13 Jun', venue: 'San Francisco Bay Area', group: 'B' },
    { id: 'm9', home: { name: 'Suiza', code: 'SUI', flag: getFlag('CH') }, away: { name: 'Polonia', code: 'POL', flag: getFlag('PL') }, date: '18 Jun', venue: 'Los Angeles Stadium', group: 'B' },
    { id: 'm10', home: { name: 'Canadá', code: 'CAN', flag: getFlag('CA') }, away: { name: 'Qatar', code: 'QAT', flag: getFlag('QA') }, date: '18 Jun', venue: 'BC Place Vancouver', group: 'B' },
    { id: 'm11', home: { name: 'Suiza', code: 'SUI', flag: getFlag('CH') }, away: { name: 'Canadá', code: 'CAN', flag: getFlag('CA') }, date: '24 Jun', venue: 'BC Place Vancouver', group: 'B' },
    { id: 'm12', home: { name: 'Polonia', code: 'POL', flag: getFlag('PL') }, away: { name: 'Qatar', code: 'QAT', flag: getFlag('QA') }, date: '24 Jun', venue: 'Seattle Stadium', group: 'B' },

    // GRUPO C
    { id: 'm13', home: { name: 'Brasil', code: 'BRA', flag: getFlag('BR') }, away: { name: 'Marruecos', code: 'MAR', flag: getFlag('MA') }, date: '13 Jun', venue: 'Boston Stadium', group: 'C' },
    { id: 'm14', home: { name: 'Haití', code: 'HAI', flag: getFlag('HT') }, away: { name: 'Escocia', code: 'SCO', flag: 'https://flagcdn.com/w80/gb-sct.png' }, date: '13 Jun', venue: 'NY/NJ Stadium', group: 'C' },
    { id: 'm15', home: { name: 'Brasil', code: 'BRA', flag: getFlag('BR') }, away: { name: 'Haití', code: 'HAI', flag: getFlag('HT') }, date: '19 Jun', venue: 'Philadelphia Stadium', group: 'C' },
    { id: 'm16', home: { name: 'Escocia', code: 'SCO', flag: 'https://flagcdn.com/w80/gb-sct.png' }, away: { name: 'Marruecos', code: 'MAR', flag: getFlag('MA') }, date: '19 Jun', venue: 'Boston Stadium', group: 'C' },
    { id: 'm17', home: { name: 'Escocia', code: 'SCO', flag: 'https://flagcdn.com/w80/gb-sct.png' }, away: { name: 'Brasil', code: 'BRA', flag: getFlag('BR') }, date: '24 Jun', venue: 'Miami Stadium', group: 'C' },
    { id: 'm18', home: { name: 'Marruecos', code: 'MAR', flag: getFlag('MA') }, away: { name: 'Haití', code: 'HAI', flag: getFlag('HT') }, date: '24 Jun', venue: 'Atlanta Stadium', group: 'C' },

    // GRUPO D
    { id: 'm19', home: { name: 'USA', code: 'USA', flag: getFlag('US') }, away: { name: 'Italia', code: 'ITA', flag: getFlag('IT') }, date: '12 Jun', venue: 'Los Angeles Stadium', group: 'D' },
    { id: 'm20', home: { name: 'Australia', code: 'AUS', flag: getFlag('AU') }, away: { name: 'Paraguay', code: 'PAR', flag: getFlag('PY') }, date: '13 Jun', venue: 'BC Place Vancouver', group: 'D' },
    { id: 'm21', home: { name: 'Italia', code: 'ITA', flag: getFlag('IT') }, away: { name: 'Paraguay', code: 'PAR', flag: getFlag('PY') }, date: '19 Jun', venue: 'San Francisco Bay Area', group: 'D' },
    { id: 'm22', home: { name: 'USA', code: 'USA', flag: getFlag('US') }, away: { name: 'Australia', code: 'AUS', flag: getFlag('AU') }, date: '19 Jun', venue: 'Seattle Stadium', group: 'D' },
    { id: 'm23', home: { name: 'Italia', code: 'ITA', flag: getFlag('IT') }, away: { name: 'USA', code: 'USA', flag: getFlag('US') }, date: '25 Jun', venue: 'Los Angeles Stadium', group: 'D' },
    { id: 'm24', home: { name: 'Paraguay', code: 'PAR', flag: getFlag('PY') }, away: { name: 'Australia', code: 'AUS', flag: getFlag('AU') }, date: '25 Jun', venue: 'San Francisco Bay Area', group: 'D' },

    // GRUPO E
    { id: 'm25', home: { name: 'Alemania', code: 'GER', flag: getFlag('DE') }, away: { name: 'Curazao', code: 'CUW', flag: getFlag('CW') }, date: '14 Jun', venue: 'Philadelphia Stadium', group: 'E' },
    { id: 'm26', home: { name: 'Costa de Marfil', code: 'CIV', flag: getFlag('CI') }, away: { name: 'Ecuador', code: 'ECU', flag: getFlag('EC') }, date: '14 Jun', venue: 'Houston Stadium', group: 'E' },
    { id: 'm27', home: { name: 'Alemania', code: 'GER', flag: getFlag('DE') }, away: { name: 'Costa de Marfil', code: 'CIV', flag: getFlag('CI') }, date: '20 Jun', venue: 'Toronto Stadium', group: 'E' },
    { id: 'm28', home: { name: 'Curazao', code: 'CUW', flag: getFlag('CW') }, away: { name: 'Ecuador', code: 'ECU', flag: getFlag('EC') }, date: '20 Jun', venue: 'Kansas City Stadium', group: 'E' },
    { id: 'm29', home: { name: 'Ecuador', code: 'ECU', flag: getFlag('EC') }, away: { name: 'Alemania', code: 'GER', flag: getFlag('DE') }, date: '25 Jun', venue: 'Philadelphia Stadium', group: 'E' },
    { id: 'm30', home: { name: 'Curazao', code: 'CUW', flag: getFlag('CW') }, away: { name: 'Costa de Marfil', code: 'CIV', flag: getFlag('CI') }, date: '25 Jun', venue: 'NY/NJ Stadium', group: 'E' },

    // GRUPO F
    { id: 'm31', home: { name: 'Países Bajos', code: 'NED', flag: getFlag('NL') }, away: { name: 'Japón', code: 'JPN', flag: getFlag('JP') }, date: '14 Jun', venue: 'Dallas Stadium', group: 'F' },
    { id: 'm32', home: { name: 'Suecia', code: 'SWE', flag: getFlag('SE') }, away: { name: 'Túnez', code: 'TUN', flag: getFlag('TN') }, date: '14 Jun', venue: 'Estadio Monterrey', group: 'F' },
    { id: 'm33', home: { name: 'Países Bajos', code: 'NED', flag: getFlag('NL') }, away: { name: 'Suecia', code: 'SWE', flag: getFlag('SE') }, date: '20 Jun', venue: 'Houston Stadium', group: 'F' },
    { id: 'm34', home: { name: 'Japón', code: 'JPN', flag: getFlag('JP') }, away: { name: 'Túnez', code: 'TUN', flag: getFlag('TN') }, date: '20 Jun', venue: 'Estadio Monterrey', group: 'F' },
    { id: 'm35', home: { name: 'Túnez', code: 'TUN', flag: getFlag('TN') }, away: { name: 'Países Bajos', code: 'NED', flag: getFlag('NL') }, date: '25 Jun', venue: 'Dallas Stadium', group: 'F' },
    { id: 'm36', home: { name: 'Japón', code: 'JPN', flag: getFlag('JP') }, away: { name: 'Suecia', code: 'SWE', flag: getFlag('SE') }, date: '25 Jun', venue: 'Kansas City Stadium', group: 'F' },

    // GRUPO G
    { id: 'm37', home: { name: 'Bélgica', code: 'BEL', flag: getFlag('BE') }, away: { name: 'Egipto', code: 'EGY', flag: getFlag('EG') }, date: '15 Jun', venue: 'Los Angeles Stadium', group: 'G' },
    { id: 'm38', home: { name: 'Irán', code: 'IRN', flag: getFlag('IR') }, away: { name: 'Nueva Zelanda', code: 'NZL', flag: getFlag('NZ') }, date: '15 Jun', venue: 'Seattle Stadium', group: 'G' },
    { id: 'm39', home: { name: 'Bélgica', code: 'BEL', flag: getFlag('BE') }, away: { name: 'Irán', code: 'IRN', flag: getFlag('IR') }, date: '21 Jun', venue: 'Los Angeles Stadium', group: 'G' },
    { id: 'm40', home: { name: 'Egipto', code: 'EGY', flag: getFlag('EG') }, away: { name: 'Nueva Zelanda', code: 'NZL', flag: getFlag('NZ') }, date: '21 Jun', venue: 'BC Place Vancouver', group: 'G' },
    { id: 'm41', home: { name: 'Nueva Zelanda', code: 'NZL', flag: getFlag('NZ') }, away: { name: 'Bélgica', code: 'BEL', flag: getFlag('BE') }, date: '26 Jun', venue: 'Seattle Stadium', group: 'G' },
    { id: 'm42', home: { name: 'Egipto', code: 'EGY', flag: getFlag('EG') }, away: { name: 'Irán', code: 'IRN', flag: getFlag('IR') }, date: '26 Jun', venue: 'BC Place Vancouver', group: 'G' },

    // GRUPO H
    { id: 'm43', home: { name: 'España', code: 'ESP', flag: getFlag('ES') }, away: { name: 'Cabo Verde', code: 'CPV', flag: getFlag('CV') }, date: '15 Jun', venue: 'Miami Stadium', group: 'H' },
    { id: 'm44', home: { name: 'Arabia Saudita', code: 'KSA', flag: getFlag('SA') }, away: { name: 'Uruguay', code: 'URU', flag: getFlag('UY') }, date: '15 Jun', venue: 'Atlanta Stadium', group: 'H' },
    { id: 'm45', home: { name: 'España', code: 'ESP', flag: getFlag('ES') }, away: { name: 'Arabia Saudita', code: 'KSA', flag: getFlag('SA') }, date: '21 Jun', venue: 'Miami Stadium', group: 'H' },
    { id: 'm46', home: { name: 'Cabo Verde', code: 'CPV', flag: getFlag('CV') }, away: { name: 'Uruguay', code: 'URU', flag: getFlag('UY') }, date: '21 Jun', venue: 'Atlanta Stadium', group: 'H' },
    { id: 'm47', home: { name: 'Uruguay', code: 'URU', flag: getFlag('UY') }, away: { name: 'España', code: 'ESP', flag: getFlag('ES') }, date: '26 Jun', venue: 'Houston Stadium', group: 'H' },
    { id: 'm48', home: { name: 'Cabo Verde', code: 'CPV', flag: getFlag('CV') }, away: { name: 'Arabia Saudita', code: 'KSA', flag: getFlag('SA') }, date: '26 Jun', venue: 'Estadio Guadalajara', group: 'H' },

    // GRUPO I
    { id: 'm49', home: { name: 'Francia', code: 'FRA', flag: getFlag('FR') }, away: { name: 'Senegal', code: 'SEN', flag: getFlag('SN') }, date: '16 Jun', venue: 'NY/NJ Stadium', group: 'I' },
    { id: 'm50', home: { name: 'Perú', code: 'PER', flag: getFlag('PE') }, away: { name: 'Noruega', code: 'NOR', flag: getFlag('NO') }, date: '16 Jun', venue: 'Boston Stadium', group: 'I' },
    { id: 'm51', home: { name: 'Francia', code: 'FRA', flag: getFlag('FR') }, away: { name: 'Perú', code: 'PER', flag: getFlag('PE') }, date: '22 Jun', venue: 'NY/NJ Stadium', group: 'I' },
    { id: 'm52', home: { name: 'Noruega', code: 'NOR', flag: getFlag('NO') }, away: { name: 'Senegal', code: 'SEN', flag: getFlag('SN') }, date: '22 Jun', venue: 'Philadelphia Stadium', group: 'I' },
    { id: 'm53', home: { name: 'Noruega', code: 'NOR', flag: getFlag('NO') }, away: { name: 'Francia', code: 'FRA', flag: getFlag('FR') }, date: '26 Jun', venue: 'Boston Stadium', group: 'I' },
    { id: 'm54', home: { name: 'Senegal', code: 'SEN', flag: getFlag('SN') }, away: { name: 'Perú', code: 'PER', flag: getFlag('PE') }, date: '26 Jun', venue: 'Toronto Stadium', group: 'I' },

    // GRUPO J
    { id: 'm55', home: { name: 'Argentina', code: 'ARG', flag: getFlag('AR') }, away: { name: 'Argelia', code: 'ALG', flag: getFlag('DZ') }, date: '16 Jun', venue: 'Kansas City Stadium', group: 'J' },
    { id: 'm56', home: { name: 'Austria', code: 'AUT', flag: getFlag('AT') }, away: { name: 'Jordania', code: 'JOR', flag: getFlag('JO') }, date: '16 Jun', venue: 'San Francisco Bay Area', group: 'J' },
    { id: 'm57', home: { name: 'Argentina', code: 'ARG', flag: getFlag('AR') }, away: { name: 'Austria', code: 'AUT', flag: getFlag('AT') }, date: '22 Jun', venue: 'Dallas Stadium', group: 'J' },
    { id: 'm58', home: { name: 'Jordania', code: 'JOR', flag: getFlag('JO') }, away: { name: 'Argelia', code: 'ALG', flag: getFlag('DZ') }, date: '22 Jun', venue: 'San Francisco Bay Area', group: 'J' },
    { id: 'm59', home: { name: 'Jordania', code: 'JOR', flag: getFlag('JO') }, away: { name: 'Argentina', code: 'ARG', flag: getFlag('AR') }, date: '27 Jun', venue: 'Kansas City Stadium', group: 'J' },
    { id: 'm60', home: { name: 'Argelia', code: 'ALG', flag: getFlag('DZ') }, away: { name: 'Austria', code: 'AUT', flag: getFlag('AT') }, date: '27 Jun', venue: 'Dallas Stadium', group: 'J' },

    // GRUPO K
    { id: 'm61', home: { name: 'Portugal', code: 'POR', flag: getFlag('PT') }, away: { name: 'Costa Rica', code: 'CRC', flag: getFlag('CR') }, date: '17 Jun', venue: 'Houston Stadium', group: 'K' },
    { id: 'm62', home: { name: 'Uzbekistán', code: 'UZB', flag: getFlag('UZ') }, away: { name: 'Colombia', code: 'COL', flag: getFlag('CO') }, date: '17 Jun', venue: 'Estadio Ciudad de México', group: 'K' },
    { id: 'm63', home: { name: 'Portugal', code: 'POR', flag: getFlag('PT') }, away: { name: 'Uzbekistán', code: 'UZB', flag: getFlag('UZ') }, date: '23 Jun', venue: 'Houston Stadium', group: 'K' },
    { id: 'm64', home: { name: 'Costa Rica', code: 'CRC', flag: getFlag('CR') }, away: { name: 'Colombia', code: 'COL', flag: getFlag('CO') }, date: '23 Jun', venue: 'Estadio Guadalajara', group: 'K' },
    { id: 'm65', home: { name: 'Colombia', code: 'COL', flag: getFlag('CO') }, away: { name: 'Portugal', code: 'POR', flag: getFlag('PT') }, date: '27 Jun', venue: 'Miami Stadium', group: 'K' },
    { id: 'm66', home: { name: 'Costa Rica', code: 'CRC', flag: getFlag('CR') }, away: { name: 'Uzbekistán', code: 'UZB', flag: getFlag('UZ') }, date: '27 Jun', venue: 'Atlanta Stadium', group: 'K' },

    // GRUPO L
    { id: 'm67', home: { name: 'Inglaterra', code: 'ENG', flag: 'https://flagcdn.com/w80/gb-eng.png' }, away: { name: 'Croacia', code: 'CRO', flag: getFlag('HR') }, date: '17 Jun', venue: 'Toronto Stadium', group: 'L' },
    { id: 'm68', home: { name: 'Ghana', code: 'GHA', flag: getFlag('GH') }, away: { name: 'Panamá', code: 'PAN', flag: getFlag('PA') }, date: '17 Jun', venue: 'Dallas Stadium', group: 'L' },
    { id: 'm69', home: { name: 'Inglaterra', code: 'ENG', flag: 'https://flagcdn.com/w80/gb-eng.png' }, away: { name: 'Ghana', code: 'GHA', flag: getFlag('GH') }, date: '23 Jun', venue: 'Boston Stadium', group: 'L' },
    { id: 'm70', home: { name: 'Croacia', code: 'CRO', flag: getFlag('HR') }, away: { name: 'Panamá', code: 'PAN', flag: getFlag('PA') }, date: '23 Jun', venue: 'Toronto Stadium', group: 'L' },
    { id: 'm71', home: { name: 'Panamá', code: 'PAN', flag: getFlag('PA') }, away: { name: 'Inglaterra', code: 'ENG', flag: 'https://flagcdn.com/w80/gb-eng.png' }, date: '27 Jun', venue: 'NY/NJ Stadium', group: 'L' },
    { id: 'm72', home: { name: 'Croacia', code: 'CRO', flag: getFlag('HR') }, away: { name: 'Ghana', code: 'GHA', flag: getFlag('GH') }, date: '27 Jun', venue: 'Philadelphia Stadium', group: 'L' },
];

export const MundialGame: React.FC = () => {
    const { user, signOut } = useMundialAuth();
    
    // Auth guard and general setup
    const [role, setRole] = useState<'asesor' | 'encargado'>('asesor');
    const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
    const [totalPoints, setTotalPoints] = useState(0);
    const [ranking, setRanking] = useState<MundialRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
    const [savedMatchIds, setSavedMatchIds] = useState<Record<string, boolean>>({});

    const [activeTab, setActiveTab] = useState<'matches' | 'ranking' | 'history' | 'astro' | 'schedules'>('matches');
    const [selectedCountry, setSelectedCountry] = useState('arg');
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTeam, setSelectedTeam] = useState<string>('');

    const uniqueDates = Array.from(new Set(WC_MATCHES.map(m => m.date)));
    const uniqueTeams = Array.from(new Set(WC_MATCHES.flatMap(m => [m.home.name, m.away.name]))).sort();

    const filteredMatches = WC_MATCHES.filter(match => {
        const matchesDate = !selectedDate || match.date === selectedDate;
        const matchesTeam = !selectedTeam || match.home.name === selectedTeam || match.away.name === selectedTeam;
        return matchesDate && matchesTeam;
    });

    useEffect(() => {
        if (!user) return;

        const loadPredictions = async () => {
            try {
                const { data, error } = await mundialSupabase
                    .from('mundial_predictions')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) throw error;

                const predMap: Record<string, Prediction> = {};
                let points = 0;

                data?.forEach((pred: MundialPrediction) => {
                    if (pred.prediction.includes('-')) {
                        const [homeScore, awayScore] = pred.prediction.split('-');
                        predMap[pred.match_id] = {
                            matchId: pred.match_id,
                            homeScore,
                            awayScore
                        };
                    } else {
                        // Fallback in case old 'home_win'/'draw' predictions exist
                        // we won't show anything specific or we map it to dummy values, but since this is fresh we just support exact scores
                    }
                    points += pred.points || 0;
                });

                setPredictions(predMap);
                setTotalPoints(points);
            } catch (err) {
                console.error('Error loading predictions:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPredictions();
    }, [user]);

    useEffect(() => {
        const loadRanking = async () => {
            try {
                const { data, error } = await mundialSupabase
                    .from('mundial_rankings')
                    .select('*')
                    .order('position', { ascending: true })
                    .limit(10);

                if (error) throw error;
                setRanking(data || []);
            } catch (err) {
                console.error('Error loading ranking:', err);
            }
        };

        loadRanking();
    }, []);

    const handleScoreChange = (matchId: string, type: 'home' | 'away', value: string) => {
        setPredictions(prev => ({
            ...prev,
            [matchId]: {
                matchId,
                homeScore: type === 'home' ? value : prev[matchId]?.homeScore || '',
                awayScore: type === 'away' ? value : prev[matchId]?.awayScore || ''
            }
        }));
    };

    const handleSaveStatus = async (matchId: string) => {
        if (!user) {
            alert('¡Atención! Debes iniciar sesión o registrarte para poder guardar tus pronósticos.');
            return;
        }

        const prediction = predictions[matchId];
        if (!prediction || !prediction.homeScore || !prediction.awayScore) {
            alert('Por favor, ingresa los resultados para ambos equipos antes de guardar.');
            return;
        }

        const predictionStr = `${prediction.homeScore}-${prediction.awayScore}`;
        setSavingMatchId(matchId);

        try {
            const { error } = await mundialSupabase
                .from('mundial_predictions')
                .upsert([{
                    user_id: user.id,
                    match_id: matchId,
                    prediction: predictionStr,
                    points: 0
                }], { onConflict: 'user_id,match_id' });

            if (error) throw error;
            
            // Mark as saved!
            setSavedMatchIds(prev => ({ ...prev, [matchId]: true }));
            
            // Clear the "saved" checkmark after 3 seconds
            setTimeout(() => {
                setSavedMatchIds(prev => ({ ...prev, [matchId]: false }));
            }, 3000);
        } catch (err) {
            console.error('Error saving prediction:', err);
            alert('Error al guardar el pronóstico. Intenta nuevamente.');
        } finally {
            setSavingMatchId(null);
        }
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] text-white">
                <div className="flex flex-col items-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-16 h-16 border-4 border-white/10 border-t-blue-500 rounded-full mb-6"
                    />
                    <motion.p 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-blue-400 font-medium tracking-widest uppercase text-sm"
                    >
                        Cargando Oráculo...
                    </motion.p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#0B0F19] text-slate-200">
            {/* LogOut Button / Profile Header */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Analista</p>
                    <p className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/5">{user?.username || 'Usuario'}</p>
                </div>
                <button
                    onClick={signOut}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300"
                    title="Cerrar sesión"
                >
                    <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                </button>
            </div>

            {/* 3D Interactive Background (Classic Soccer Ball & Stardust) */}
            <MundialScene />
            
            <div className="max-w-4xl mx-auto space-y-6 relative z-10 py-6 px-4">
                {/* Header & Role Selector */}
                <div className="relative overflow-hidden glass-panel p-8 staggered-item bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500 opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                            <div className="shrink-0 scale-75 md:scale-100 hover-lift">
                                <HeaderSoccerBall3D />
                            </div>
                            <div className="text-center md:text-left flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-white mb-2 italic break-words">
                                    ORÁCULO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">MUNDIAL 2026</span>
                                </h1>
                                <p className="text-gray-400 font-medium tracking-wide">
                                    CONVIÉRTETE EN EL REY DE LOS PRONÓSTICOS
                                </p>
                                <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
                                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-black text-blue-400 uppercase tracking-widest">🏆 PREMIOS SEMANALES</span>
                                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-black text-emerald-400 uppercase tracking-widest">⚡ IA POWERED</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={() => {
                                    const modal = document.createElement('div');
                                    modal.className = 'fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 p-4';
                                    modal.innerHTML = `
                                    <div class="relative max-w-4xl w-full bg-gray-900 rounded-2xl p-2 border border-white/10 shadow-2xl">
                                        <button class="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full" onclick="this.parentElement.parentElement.remove()">
                                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                        <div class="aspect-video bg-black rounded-xl overflow-hidden">
                                            <video src="/videos/futbolm.mp4" controls autoplay class="w-full h-full object-contain"></video>
                                        </div>
                                    </div>
                                `;
                                    document.body.appendChild(modal);
                                }}
                                className="w-full sm:w-auto px-6 py-4 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 transition-all group hover:bg-indigo-600 hover:text-white"
                            >
                                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Ver Video Demo
                            </button>
                            <button
                                onClick={handleShare}
                                className="w-full sm:w-auto px-6 py-4 bg-white text-slate-950 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 transition-all shadow-xl group hover:bg-amber-400 hover:text-white"
                            >
                                <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                Compartir
                            </button>
                        </div>
                    </div>
                </div>

                {/* Role Selector */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 staggered-item" style={{ animationDelay: '0.1s' }}>
                    <button
                        onClick={() => setRole('asesor')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all active:scale-95 ${role === 'asesor' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        Asesores
                    </button>
                    <button
                        onClick={() => setRole('encargado')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all active:scale-95 ${role === 'encargado' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        Encargados
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar gap-4 px-2">
                    <button
                        onClick={() => setActiveTab('matches')}
                        className={`pb-3 px-4 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'matches' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Partidos
                        {activeTab === 'matches' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t-full shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('ranking')}
                        className={`pb-3 px-4 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'ranking' ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Ranking
                        {activeTab === 'ranking' && <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-500 rounded-t-full shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 px-4 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'history' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Mi Historial
                        {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-t-full shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('astro')}
                        className={`pb-3 px-4 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'astro' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]' : 'text-gray-500 hover:text-purple-300'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            Oráculo
                        </span>
                        {activeTab === 'astro' && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 rounded-t-full shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('schedules')}
                        className={`pb-3 px-4 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'schedules' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-gray-500 hover:text-emerald-300'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Horarios
                        </span>
                        {activeTab === 'schedules' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                </div>

                {/* Tab content */}
                {activeTab === 'matches' && (
                    <div className="space-y-5">
                        {/* BANNER ANIMADO PREMIUM */}
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2 flex items-center justify-center md:justify-start gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-400" /> PRONÓSTICOS ACTIVOS
                                </h3>
                                <p className="text-gray-400 text-sm max-w-lg">
                                    Predice el resultado de los partidos del Mundial 2026. ¡Recuerda que puedes guardar o modificar tus marcadores en cualquier momento antes del pitazo inicial!
                                </p>
                            </div>
                            <AnimatedBicycleKick />
                        </div>

                        {/* LABORATORIO INTERACTIVO 3D CON FÍSICA Y PARTICULAS */}
                        <Interactive3DSoccer />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white appearance-none focus:border-blue-500 focus:outline-none cursor-pointer"
                                >
                                    <option value="">Todas las fechas</option>
                                    {uniqueDates.map(date => (
                                        <option key={date} value={date} className="bg-gray-900 text-white">{date}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedTeam}
                                    onChange={(e) => setSelectedTeam(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white appearance-none focus:border-blue-500 focus:outline-none cursor-pointer"
                                >
                                    <option value="">Todos los equipos</option>
                                    {uniqueTeams.map(team => (
                                        <option key={team} value={team} className="bg-gray-900 text-white">{team}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 gap-6"
                        >
                            {filteredMatches.map((match, index) => {
                                const kickoff = getMatchKickoff(match.id, match.date);
                                const now = new Date();
                                const diffHours = (kickoff.getTime() - now.getTime()) / (1000 * 60 * 60);
                                const isShowCountdown = diffHours > 0 && diffHours <= 3;

                                return (
                                    <motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.6 }}
                                        whileHover={{ scale: 1.01, translateY: -4 }}
                                        className="relative p-8 hover:border-amber-500/50 group overflow-hidden bg-black/40 backdrop-blur-md rounded-2xl border border-white/10"
                                    >
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-colors duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

                                        <div className="relative z-10 flex justify-between items-center mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full">
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">GRUPO {match.group}</span>
                                                </div>
                                                {match.status === 'live' && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
                                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">EN VIVO</span>
                                                    </div>
                                                )}
                                                {isShowCountdown && <MatchCountdown kickoff={kickoff} />}
                                            </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-2 text-white/40 mb-1">
                                                <Calendar className="w-3 h-3" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">{match.date}</p>
                                            </div>
                                            <div className="flex items-center justify-end gap-2 text-gray-500">
                                                <MapPin className="w-3 h-3" />
                                                <p className="text-[10px] font-medium uppercase truncate max-w-[150px]">{match.venue}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-9 gap-4 md:gap-8 items-center">
                                        {/* Home Team */}
                                        <div className="md:col-span-3 flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left transition-all group-hover:translate-x-1 duration-500 min-w-0">
                                            <div className="relative">
                                                <img src={match.home.flag} alt="" className="w-24 h-16 md:w-32 md:h-20 rounded-2xl object-cover shadow-2xl border-4 border-white/10 ring-4 ring-black/20 animate-flag-wave-left" />
                                                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tighter mb-1 uppercase drop-shadow-lg truncate" title={match.home.name}>{match.home.name}</h3>
                                                <div className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">
                                                    <span className="text-xs font-black text-blue-400/80 uppercase tracking-[0.2em]">{match.home.code}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inputs */}
                                        <div className="md:col-span-3 flex flex-col items-center gap-6 py-2 scale-100">
                                            <div className="flex items-center gap-4">
                                                <div className="relative group/input">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={predictions[match.id]?.homeScore || ''}
                                                        onChange={(e) => handleScoreChange(match.id, 'home', e.target.value.replace(/\D/g, ''))}
                                                        placeholder="0"
                                                        className="w-20 h-24 bg-slate-950/80 border-2 border-white/10 rounded-3xl text-center text-5xl font-black text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all hover:border-white/20 placeholder:opacity-10 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)]"
                                                    />
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <span className="text-2xl font-black text-slate-700 italic tracking-tighter">VS</span>
                                                </div>

                                                <div className="relative group/input">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={predictions[match.id]?.awayScore || ''}
                                                        onChange={(e) => handleScoreChange(match.id, 'away', e.target.value.replace(/\D/g, ''))}
                                                        placeholder="0"
                                                        className="w-20 h-24 bg-slate-950/80 border-2 border-white/10 rounded-3xl text-center text-5xl font-black text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all hover:border-white/20 placeholder:opacity-10 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)]"
                                                    />
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-full opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleSaveStatus(match.id)}
                                                disabled={savingMatchId === match.id}
                                                className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl overflow-hidden relative border ${
                                                    savedMatchIds[match.id]
                                                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20'
                                                        : savingMatchId === match.id
                                                        ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20 cursor-wait'
                                                        : 'bg-white text-slate-950 border-white hover:bg-amber-500 hover:text-white group/save shadow-black/40'
                                                }`}
                                            >
                                                {!savedMatchIds[match.id] && savingMatchId !== match.id && (
                                                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover/save:translate-y-0 transition-transform duration-500" />
                                                )}
                                                {savedMatchIds[match.id] ? (
                                                    <Check className="w-5 h-5 relative z-10 animate-bounce" />
                                                ) : savingMatchId === match.id ? (
                                                    <Loader2 className="w-5 h-5 relative z-10 animate-spin" />
                                                ) : (
                                                    <Save className="w-5 h-5 relative z-10 transition-transform group-hover/save:rotate-12" />
                                                )}
                                                <span className="relative z-10 text-[10px] md:text-xs">
                                                    {savedMatchIds[match.id]
                                                        ? '¡PRONÓSTICO GUARDADO!'
                                                        : savingMatchId === match.id
                                                        ? 'GUARDANDO PRONÓSTICO...'
                                                        : 'GUARDAR PRONÓSTICO'}
                                                </span>
                                            </motion.button>
                                        </div>

                                        {/* Away Team */}
                                        <div className="md:col-span-3 flex flex-col-reverse md:flex-row items-center gap-4 md:gap-6 text-center md:text-right transition-all group-hover:-translate-x-1 duration-500 min-w-0">
                                            <div className="flex-1">
                                                <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tighter mb-1 uppercase drop-shadow-lg truncate" title={match.away.name}>{match.away.name}</h3>
                                                <div className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">
                                                    <span className="text-xs font-black text-emerald-400/80 uppercase tracking-[0.2em]">{match.away.code}</span>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <img src={match.away.flag} alt="" className="w-24 h-16 md:w-32 md:h-20 rounded-2xl object-cover shadow-2xl border-4 border-white/10 ring-4 ring-black/20 animate-flag-wave-right" />
                                                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            })}
                        </motion.div>
                    </div>
                )}

                {activeTab === 'ranking' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/5 bg-white/2 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center justify-center md:justify-start gap-4">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                                        <Trophy className="w-7 h-7 text-amber-500" />
                                    </div>
                                    Líderes de la Red
                                </h3>
                                <p className="text-gray-400 text-sm mt-3 max-w-lg">
                                    Sigue el ranking de asesores y encargados de Propgear AI. Predice con exactitud, suma puntos y reclama tu lugar en la cima de la red.
                                </p>
                            </div>
                            <AnimatedTrophyCelebration />
                        </div>
                        <div className="divide-y divide-white/5">
                            {ranking.length > 0 ? (
                                ranking.map((entry, idx) => {
                                    const pos = idx + 1;
                                    return (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-center justify-between p-8 hover:bg-white/5 transition-all group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl font-black text-2xl transition-all ${pos === 1
                                                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-110'
                                                    : pos === 2
                                                        ? 'bg-slate-300 text-slate-950 shadow-[0_0_20px_rgba(203,213,225,0.4)]'
                                                        : pos === 3
                                                            ? 'bg-orange-700 text-white shadow-[0_0_20px_rgba(194,65,12,0.4)]'
                                                            : 'bg-slate-800 text-slate-500'
                                                    }`}>
                                                    {pos}
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:scale-110 transition-transform shadow-xl overflow-hidden">
                                                            <div className="absolute inset-0 bg-black/20" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <User className="w-8 h-8 text-white/50" />
                                                            </div>
                                                        </div>
                                                        {pos === 1 && (
                                                            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 animate-bounce">
                                                                <Sparkles className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-black uppercase text-lg tracking-tighter group-hover:text-amber-400 transition-colors">
                                                            {entry.username} {entry.user_id === user?.id && <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full ml-2">TÚ</span>}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Posición: {entry.position}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-3xl font-black text-white font-mono italic tracking-tighter group-hover:scale-110 transition-transform">
                                                {entry.total_points}<span className="text-amber-500 ml-1">PTS</span>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                [1, 2, 3, 4, 5].map((pos, idx) => (
                                    <motion.div
                                        key={pos}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center justify-between p-8 hover:bg-white/5 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 flex items-center justify-center rounded-2xl font-black text-2xl transition-all ${pos === 1
                                                ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-110'
                                                : pos === 2
                                                    ? 'bg-slate-300 text-slate-950 shadow-[0_0_20px_rgba(203,213,225,0.4)]'
                                                    : pos === 3
                                                        ? 'bg-orange-700 text-white shadow-[0_0_20px_rgba(194,65,12,0.4)]'
                                                        : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                {pos}
                                            </div>
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:scale-110 transition-transform shadow-xl overflow-hidden">
                                                        <div className="absolute inset-0 bg-black/20" />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <User className="w-8 h-8 text-white/50" />
                                                        </div>
                                                    </div>
                                                    {pos === 1 && (
                                                        <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 animate-bounce">
                                                            <Sparkles className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-black uppercase text-lg tracking-tighter group-hover:text-amber-400 transition-colors">
                                                        {role === 'asesor' ? `Asesor ${pos}` : `Encargado ${pos}`}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Puntaje: {100 - (pos * 5)}%</span>
                                                        <div className="w-1 h-4 bg-white/5 rounded-full" />
                                                        <span className="text-[10px] text-blue-400/60 font-black uppercase tracking-[0.2em]">Predicciones: 12</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-black text-white font-mono italic tracking-tighter group-hover:scale-110 transition-transform">
                                            {(100 - (pos * 5)) * 10}<span className="text-amber-500 ml-1">PTS</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-6 staggered-item">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">
                                    Mi Historial
                                </h3>
                                <p className="text-gray-400 text-sm max-w-lg mb-4">
                                    Revisa el historial completo de tus predicciones guardadas, el desglose de puntos obtenidos y tu precisión analítica general.
                                </p>
                                <div className="flex justify-center md:justify-start gap-12 mt-4">
                                    <div>
                                        <p className="text-4xl font-black text-emerald-400">{totalPoints}</p>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Puntos Totales</p>
                                    </div>
                                    <div>
                                        <p className="text-4xl font-black text-blue-400">82%</p>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Precisión (Simulada)</p>
                                    </div>
                                </div>
                            </div>
                            <AnimatedStatsShield />
                        </div>
                        {Object.values(predictions).map((pred) => {
                            const match = WC_MATCHES.find(m => m.id === pred.matchId);
                            if (!match) return null;
                            return (
                                <div key={pred.matchId} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/20 hover:-translate-y-1 transition-all cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center w-12 shrink-0">
                                            <p className="text-[10px] font-black text-gray-500 uppercase">{match.date}</p>
                                            <p className="text-xs font-black text-blue-400">+3 PTS</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <img src={match.home.flag} alt="" className="w-10 h-7 rounded shadow-lg" />
                                            <div className="bg-slate-950 px-4 py-1.5 rounded-xl border border-white/10">
                                                <span className="text-xl font-black text-white">{pred.homeScore} - {pred.awayScore}</span>
                                            </div>
                                            <img src={match.away.flag} alt="" className="w-10 h-7 rounded shadow-lg" />
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase">Guardado</span>
                                </div>
                            );
                        })}
                        {Object.keys(predictions).length === 0 && (
                            <div className="text-center py-20">
                                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest">No hay pronósticos guardados</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'astro' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 uppercase tracking-tighter italic">
                                    ORÁCULO ESTELAR 2026
                                </h2>
                                <p className="text-purple-400 font-black tracking-[0.2em] uppercase mt-2 text-[10px]">
                                    ALINEACIÓN PLANETARIA Y PREDICCIÓN IA
                                </p>
                                <p className="text-gray-400 text-sm mt-3 max-w-lg">
                                    Nuestra supercomputadora cuántica predice el campeón basándose en la alineación del Cosmos y el rendimiento de goles históricos del Mundial.
                                </p>
                            </div>
                            <AnimatedCosmicBall />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {ASTRO_PREDICTIONS.map((section) => (
                                <div key={section.id} className={`bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden staggered-item ${section.type === 'highlight' ? 'col-span-1 md:col-span-2 bg-gradient-to-br from-amber-500/10 via-purple-900/40 to-indigo-900/40 border-amber-500/30' : 'hover:border-purple-500/30'}`}>
                                    <div className="p-4 border-b border-white/5 bg-white/5">
                                        <h3 className="font-black uppercase tracking-wider text-purple-200 text-sm flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> {section.title}
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        {section.type === 'summary' && section.content && (
                                            <div className="overflow-x-auto custom-scrollbar">
                                                <table className="w-full min-w-[500px]">
                                                    <thead>
                                                        <tr className="border-b border-white/10">
                                                            {section.content[0].map((h, i) => (
                                                                <th key={i} className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {section.content.slice(1).map((row, i) => (
                                                            <tr key={i} className="hover:bg-white/5">
                                                                {row.map((cell, j) => (
                                                                    <td key={j} className={`p-3 text-sm ${j === 0 ? 'font-black text-yellow-500' : 'text-slate-300'}`}>{cell}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        {section.type === 'highlight' && (
                                            <div className="text-center py-6">
                                                <h4 className="text-3xl font-black text-white italic mb-4">{section.match}</h4>
                                                <div className="inline-block px-10 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl shadow-2xl animate-pulse">
                                                    <span className="text-black font-black text-2xl uppercase tracking-widest">{section.result}</span>
                                                </div>
                                                {section.notes && (
                                                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {section.notes.map((note, idx) => (
                                                            <div key={idx} className="bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-slate-300 italic">
                                                                {note}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {(section.type === 'group' || section.type === 'knockout') && section.matches && (
                                            <div className="space-y-3">
                                                {section.matches.map((m, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-black/20 hover:bg-white/5 transition-all group">
                                                        <span className="text-xs font-black text-white flex-1">{m.match}</span>
                                                        <span className="text-xs font-black text-purple-400 group-hover:text-purple-300">{m.result}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'schedules' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative overflow-hidden bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
                                    HORARIOS MUNDIAL 2026
                                </h2>
                                <p className="text-gray-400 text-sm max-w-lg mb-4">
                                    Configura tu zona horaria para adaptar los horarios exactos del Mundial 2026 de acuerdo a tu país de residencia actual.
                                </p>
                                <div className="relative z-20 max-w-xs mx-auto md:mx-0">
                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                        className="w-full bg-slate-900 border border-emerald-500/30 text-white py-4 px-6 rounded-2xl font-black uppercase text-xs tracking-widest appearance-none focus:outline-none focus:ring-4 focus:ring-emerald-500/20 cursor-pointer"
                                    >
                                        {TIMEZONE_INFO.map(info => (
                                            <option key={info.id} value={info.id}>{info.country} ({info.gmt})</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-emerald-400">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            <AnimatedClockStadium />
                        </div>

                        <div className="space-y-6">
                            {WORLD_CUP_SCHEDULES.map((group) => (
                                <div key={group.id} className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden staggered-item">
                                    <div className="p-4 bg-emerald-500/10 border-b border-white/5">
                                        <h3 className="font-black uppercase tracking-widest text-white text-sm">⚽ {group.name}</h3>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {group.matches.map((match) => {
                                            const localTime = (match.times as any)[selectedCountry];
                                            return (
                                                <div key={match.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                                                    <div className="flex-1">
                                                        <h4 className="font-black text-white text-lg tracking-tight mb-1 uppercase group-hover:text-amber-500 transition-colors">{match.title}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                            <span>📅 {match.date}</span>
                                                            <span>📍 {match.venue}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-black text-white font-mono group-hover:scale-110 transition-transform">{localTime}</p>
                                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Hora Local</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showShareModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="w-full max-w-sm bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar">
                            <div className="relative p-8 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-center">
                                <button onClick={() => setShowShareModal(false)} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all">
                                    <X size={20} />
                                </button>
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 scale-110">
                                    <Trophy className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">¡DESAFÍO ACEPTADO!</h3>
                                <p className="text-blue-100/70 text-xs font-medium mb-8">Invita a tu equipo a competir en el Oráculo Mundial 2026</p>
                                <div className="bg-white p-4 rounded-3xl shadow-2xl mb-8 transform hover:scale-105 transition-transform">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.href)}`}
                                        alt="QR"
                                        className="w-40 h-40 mx-auto"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <button className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all">Compartir WhatsApp</button>
                                    <button className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all">Copiar Enlace</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

