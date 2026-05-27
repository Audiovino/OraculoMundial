import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, User, Users, Save, ChevronDown, Calendar, Flag, Share2, Download, X, Sparkles, Clock, Search, ChevronLeft, ChevronRight, MapPin, Play, LogOut, BarChart3, Check, Loader2, Zap } from 'lucide-react';
import { ASTRO_PREDICTIONS } from '../data/AstroData';
import { WORLD_CUP_SCHEDULES, TIMEZONE_INFO } from '../data/WorldCupSchedules';
import { useMundialAuth } from '../contexts/MundialAuthContext';
import { mundialSupabase, MundialRanking, MundialPrediction } from '../services/mundialSupabaseClient';
import { captureUserLocation } from '../services/locationService.ts';
import MundialScene from './scene/MundialScene';
import { getStadiumByVenue } from '../data/StadiumsData';
import RealisticStadium3D from './scene/RealisticStadium3D';
import * as THREE from 'three';
import OracleAdvisor from './OracleAdvisor';
import WinCelebration from './WinCelebration';
import StreakBadge from './StreakBadge';
import CommunityBar from './CommunityBar';
import PrivateLeague from './PrivateLeague';
import { useStreak } from '../hooks/useStreak';
import { useSecurityMonitor } from '../hooks/useSecurityMonitor';
import { useVisibleElement } from '../hooks/useVisibleElement';

// Lazy load MiniStadium3D para optimización en móvil
const MiniStadium3D = React.lazy(() => import('./scene/MiniStadium3D'));

// Importar componentes animados directamente (sin lazy loading para mejor performance)
import AnimatedBicycleKick from './AnimatedBicycleKick';
import AnimatedTrophyCelebration from './AnimatedTrophyCelebration';
import AnimatedStatsShield from './AnimatedStatsShield';
import AnimatedCosmicBall from './AnimatedCosmicBall';
import AnimatedClockStadium from './AnimatedClockStadium';

// ---------------------------------------------------------
// VIDEO MODAL BUTTON COMPONENT
// ---------------------------------------------------------
function VideoModalButton() {
    const [showModal, setShowModal] = useState(false);
    const videoUrl = '/videos/futbolm.mp4';

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto px-6 py-4 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 transition-all group hover:bg-indigo-600 hover:text-white"
            >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Ver Video Demo
            </button>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                            style={{ background: 'linear-gradient(135deg, rgba(15,15,30,0.95), rgba(20,20,40,0.95))' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Video Demo</p>
                                    <h3 className="text-sm font-black text-white">Oráculo Mundial 2026</h3>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Video Container */}
                            <div className="aspect-video bg-black relative overflow-hidden">
                                <video
                                    key={videoUrl}
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-contain"
                                    style={{ background: '#000' }}
                                    onError={(e) => {
                                        console.error('Video error:', e);
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ---------------------------------------------------------
// REVISIÓN VISUAL: BALÓN DE FÚTBOL 3D REAL EN EL ENCABEZADO
// ---------------------------------------------------------
function HeaderSoccerBall3D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { ref: containerRef, isVisible } = useVisibleElement({ threshold: 0.1 });

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    useEffect(() => {
        if (!canvasRef.current || !isVisible) return; // Pausar motor si no es visible
        const canvas = canvasRef.current;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 2.8;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false // Desactivado totalmente en móvil para máximo rendimiento en Chrome
        });
        renderer.setSize(96, 96);
        renderer.setPixelRatio(isMobile ? 0.8 : Math.min(window.devicePixelRatio, 2)); // Resolución reducida en móvil para fluidez

        // Iluminación para resaltar la 3D del balón
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);

        const light1 = new THREE.DirectionalLight(0xffffff, 1.4);
        light1.position.set(5, 5, 2);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xfff6d8, 0.7);
        light2.position.set(-5, -5, -2);
        scene.add(light2);

        // Shader del Balón Procedural Clásico e Hiper-realista
        const soccerBallMaterial = new THREE.ShaderMaterial({
            uniforms: {
                light1Pos: { value: new THREE.Vector3(5, 5, 2).normalize() },
                light1Color: { value: new THREE.Color(0xffffff) },
                light2Pos: { value: new THREE.Vector3(-5, -5, -2).normalize() },
                light2Color: { value: new THREE.Color(0xfff6d8) }
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

                    vec3 baseColor = vec3(0.97, 0.97, 0.99);
                    if (firstMax > 0.89) {
                        baseColor = vec3(0.05, 0.05, 0.06);
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

                    vec3 ambient = vec3(0.2) * baseColor;
                    vec3 diffuse = (diff1 * light1Color + diff2 * light2Color) * baseColor * 0.95;
                    vec3 specular = (spec1 * light1Color * 0.35) + (spec2 * light2Color * 0.25);

                    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
                }
            `
        });

        const ballGeo = new THREE.SphereGeometry(1.0, isMobile ? 8 : 32, isMobile ? 8 : 32); // Geometría mínima para móvil
        const ball = new THREE.Mesh(ballGeo, soccerBallMaterial);
        scene.add(ball);

        let animationFrameId: number;
        let clock = new THREE.Clock();
        let lastFrameTime = 0;

        const animate = (time: number) => {
            // En móviles limitamos a 30 FPS para reducir el consumo de batería un 50%
            if (isMobile && time - lastFrameTime < 33) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }
            lastFrameTime = time;

            const elapsedTime = clock.getElapsedTime();
            ball.rotation.y = elapsedTime * 0.9;
            ball.rotation.x = elapsedTime * 0.45;
            
            ball.position.y = Math.sin(elapsedTime * 4.5) * 0.08;

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            ballGeo.dispose();
            soccerBallMaterial.dispose();
            scene.clear();
        };
    }, [isMobile, isVisible]);

    return (
        <div ref={containerRef} className="w-24 h-24 relative flex items-center justify-center">
            <canvas ref={canvasRef} className="w-24 h-24 block drop-shadow-[0_10px_20px_rgba(56,189,248,0.4)]" />
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
    { id: 'm1', home: { name: 'México', code: 'MEX', flag: getFlag('MX') }, away: { name: 'Sudáfrica', code: 'RSA', flag: getFlag('ZA') }, date: '11 Jun', venue: 'Estadio Ciudad de México', group: 'A' },
    { id: 'm2', home: { name: 'Corea del Sur', code: 'KOR', flag: getFlag('KR') }, away: { name: 'Ucrania', code: 'UKR', flag: getFlag('UA') }, date: '11 Jun', venue: 'Estadio Guadalajara', group: 'A' },
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

const getTeamGlow = (code: string): string => {
    switch (code) {
        case 'ARG': return 'from-sky-400/20 to-transparent';
        case 'MEX': return 'from-emerald-500/20 to-transparent';
        case 'BRA': return 'from-amber-400/20 to-transparent';
        case 'GER': return 'from-red-500/10 via-amber-500/10 to-transparent';
        case 'UKR': return 'from-yellow-400/20 to-transparent';
        case 'USA': return 'from-blue-600/20 to-transparent';
        case 'ITA': return 'from-sky-600/20 to-transparent';
        case 'FRA': return 'from-blue-700/20 to-transparent';
        case 'ESP': return 'from-red-600/20 to-transparent';
        default: return 'from-blue-500/15 to-transparent';
    }
};

// ----------------------------------------------------------------
// CIELO DINÁMICO: gradiente cinematográfico según hora del partido
// ----------------------------------------------------------------
function getSkyTheme(kickoff: Date): { gradient: string; weather: string; weatherLabel: string; bgImage?: string } {
    const h = kickoff.getHours();
    if (h >= 5 && h < 8) {
        return {
            gradient: 'from-amber-900/80 via-orange-900/40 to-black/90',
            weather: '🌅',
            weatherLabel: 'Amanecer'
        };
    } else if (h >= 8 && h < 13) {
        return {
            gradient: 'from-blue-900/80 via-sky-900/50 to-black/90',
            weather: '☀️',
            weatherLabel: 'Mañana'
        };
    } else if (h >= 13 && h < 17) {
        return {
            gradient: 'from-cyan-900/80 via-blue-900/50 to-black/90',
            weather: '🌤️',
            weatherLabel: 'Tarde'
        };
    } else if (h >= 17 && h < 20) {
        return {
            gradient: 'from-orange-900/90 via-red-950/60 to-black/95',
            weather: '🌇',
            weatherLabel: 'Atardecer'
        };
    } else if (h >= 20 && h < 24) {
        return {
            gradient: 'from-indigo-950/90 via-slate-900/80 to-black/95',
            weather: '🌙',
            weatherLabel: 'Noche'
        };
    } else {
        return {
            gradient: 'from-slate-950/95 via-gray-900/90 to-black/95',
            weather: '🌌',
            weatherLabel: 'Madrugada'
        };
    }
}

// ----------------------------------------------------------------
// SHARE BUTTONS — WhatsApp + Copiar enlace con estado React
// ----------------------------------------------------------------
interface ShareButtonsProps {
    user: { username?: string; email?: string } | null;
    totalPoints: number;
}

function ShareButtons({ user, totalPoints }: ShareButtonsProps) {
    const [copied, setCopied] = React.useState(false);

    const handleWhatsApp = React.useCallback(() => {
        const username = user?.username || user?.email?.split('@')[0] || 'alguien';
        const shareUrl = window.location.origin;
        const shareText = `⚽ *Oráculo Mundial 2026*\n\n🔮 ${username} te desafía a predecir el Mundial!\n🏆 Mi puntaje actual: *${totalPoints} pts*\n\n¿Podés superarme? Jugá acá:\n${shareUrl}`;
        
        // Detectar si es mobile o desktop
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Mobile: wa.me funciona perfecto
        // Desktop: web.whatsapp.com es más confiable
        const whatsappUrl = isMobile
            ? `https://wa.me/?text=${encodeURIComponent(shareText)}`
            : `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, [user, totalPoints]);

    const handleCopy = React.useCallback(async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = url;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }, []);

    return (
        <div className="space-y-4">
            <button
                onClick={handleWhatsApp}
                className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Compartir por WhatsApp
            </button>
            <button
                onClick={handleCopy}
                className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    copied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
            >
                {copied ? (
                    <>✅ Enlace Copiado!</>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                        </svg>
                        Copiar Enlace
                    </>
                )}
            </button>
        </div>
    );
}

export const MundialGame: React.FC = () => {
    const { user, signOut } = useMundialAuth();
    
    // Monitor de seguridad Hermes para protección de datos
    const { validateField, getSecurityStatus } = useSecurityMonitor();

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const [showVideoModal, setShowVideoModal] = useState(false);
    // Auth guard and general setup
    const role = 'encargado';
    const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
    const [totalPoints, setTotalPoints] = useState(0);
    const [ranking, setRanking] = useState<MundialRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingMatchId, setSavingMatchId] = useState<string | null>(null);
    const [savedMatchIds, setSavedMatchIds] = useState<Record<string, boolean>>({});

    const [activeTab, setActiveTab] = useState<'matches' | 'ranking' | 'ligas' | 'history' | 'astro' | 'schedules'>('matches');
    const [selectedCountry, setSelectedCountry] = useState('arg');
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [selectedScheduleGroup, setSelectedScheduleGroup] = useState<string>('');
    const [selectedAstroGroup, setSelectedAstroGroup] = useState<string>('');

    // Sincronizar todos los dropdowns de grupos
    const handleGroupChange = (value: string) => {
        setSelectedGroup(value);
        setSelectedAstroGroup(value);
        setSelectedScheduleGroup(value);
    };

    // Verificación inicial de seguridad al montar el componente
    useEffect(() => {
        const status = getSecurityStatus();
        if (status.isSecure) {
            console.log('🛡️ Hermes: Escudo de seguridad activo y monitoreando integridad de datos.');
        }
    }, [getSecurityStatus]);

    // Nuevos features: Oráculo, Celebración, Streak
    const [oracleMatch, setOracleMatch] = useState<Match | null>(null);
    const [celebration, setCelebration] = useState<{ type: 'exact' | 'winner' | null; home: string; away: string }>({ type: null, home: '', away: '' });
    const { streak } = useStreak(user?.id);

    const uniqueDates = Array.from(new Set(WC_MATCHES.map(m => m.date)));
    const uniqueTeams = Array.from(new Set(WC_MATCHES.flatMap(m => [m.home.name, m.away.name]))).sort();
    const uniqueGroups = Array.from(new Set(WC_MATCHES.map(m => m.group))).sort();

    const filteredMatches = useMemo(() => {
        return WC_MATCHES.filter(match => {
            const matchesDate = !selectedDate || match.date === selectedDate;
            const matchesTeam = !selectedTeam || match.home.name === selectedTeam || match.away.name === selectedTeam;
            const matchesGroup = !selectedGroup || match.group === selectedGroup;
            return matchesDate && matchesTeam && matchesGroup;
        });
    }, [selectedDate, selectedTeam, selectedGroup]);

    useEffect(() => {
        const loadPredictions = async () => {
            try {
                // First load from localStorage to be instantaneous
                const localPreds = localStorage.getItem('mundial_predictions');
                if (localPreds) {
                    setPredictions(JSON.parse(localPreds));
                }

                if (user) {
                    const { data, error } = await mundialSupabase
                        .from('mundial_predictions')
                        .select('*')
                        .eq('user_id', user.id);

                    if (!error && data) {
                        const predMap: Record<string, Prediction> = {};
                        let points = 0;

                        data.forEach((pred: any) => {
                            const predictionValue = pred.prediction ?? pred.resultado ?? pred.score ?? pred.result;
                            const pointValue = Number(pred.points ?? pred.score_points ?? 0);

                            if (typeof predictionValue === 'string' && predictionValue.includes('-')) {
                                const [homeScore, awayScore] = predictionValue.split('-').map(s => s.trim());
                                predMap[pred.match_id] = {
                                    matchId: pred.match_id,
                                    homeScore,
                                    awayScore,
                                };
                            }

                            points += Number.isNaN(pointValue) ? 0 : pointValue;
                        });
                        
                        // Merge Supabase predictions with local ones
                        setPredictions(prev => {
                            const newPreds = { ...prev, ...predMap };
                            localStorage.setItem('mundial_predictions', JSON.stringify(newPreds));
                            return newPreds;
                        });
                        setTotalPoints(points);
                    }
                }
            } catch (err) {
                console.warn('[MundialGame] Error loading predictions:', err);
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

                if (error) {
                    console.warn('[MundialGame] Ranking not available:', error.message || error);
                    setRanking([]);
                    return;
                }
                setRanking(data || []);
            } catch (err) {
                console.warn('[MundialGame] Error loading ranking:', err);
                setRanking([]);
            }
        };

        loadRanking();
    }, []);

    const handleScoreChange = (matchId: string, type: 'home' | 'away', value: string) => {
        // Sanitización Hermes: Solo números, máximo 2 dígitos, limpieza de ceros a la izquierda
        let sanitized = value.replace(/\D/g, '').slice(0, 2);
        
        if (sanitized.length > 1 && sanitized.startsWith('0')) {
            sanitized = sanitized.replace(/^0+/, '');
            if (sanitized === '') sanitized = '0';
        }

        setPredictions(prev => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                matchId,
                homeScore: type === 'home' ? sanitized : prev[matchId]?.homeScore || '',
                awayScore: type === 'away' ? sanitized : prev[matchId]?.awayScore || ''
            }
        }));
    };

    const handleSaveStatus = async (matchId: string) => {
        const prediction = predictions[matchId];
        // 1. Verificación de campos completos
        
        // Validación de inyección vía Hermes
        if (!validateField('homeScore', prediction?.homeScore || '') || !validateField('awayScore', prediction?.awayScore || '')) {
            alert('⚠️ Hermes: Se detectó un patrón de entrada sospechoso. La predicción no fue guardada por seguridad.');
            return;
        }

        if (!prediction || prediction.homeScore === '' || prediction.awayScore === '' || prediction.homeScore === undefined || prediction.awayScore === undefined) {
            alert('⚠️ Hermes: Por favor, ingresa los resultados para ambos equipos antes de guardar.');
            return;
        }

        // 2. Validación de tipos y rangos lógicos
        const homeNum = parseInt(prediction.homeScore, 10);
        const awayNum = parseInt(prediction.awayScore, 10);

        if (isNaN(homeNum) || isNaN(awayNum) || homeNum < 0 || awayNum < 0 || homeNum > 99 || awayNum > 99) {
            alert('⚠️ Hermes: Formato inválido. Los goles deben ser números entre 0 y 99.');
            return;
        }

        const predictionStr = `${homeNum}-${awayNum}`;
        
        // Save to localStorage immediately for instant feedback
        const updatedPredictions = {
            ...predictions,
            [matchId]: prediction
        };
        setPredictions(updatedPredictions);
        localStorage.setItem('mundial_predictions', JSON.stringify(updatedPredictions));

        // Visual confirmation checkmark
        setSavedMatchIds(prev => ({ ...prev, [matchId]: true }));
        
        // Clear the checkmark after 3 seconds
        setTimeout(() => {
            setSavedMatchIds(prev => ({ ...prev, [matchId]: false }));
        }, 3000);

        // Async upsert to Supabase
        if (user) {
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

                if (error) {
                    console.warn('[MundialGame] Supabase save failed; continuing with local cache:', error.message || error);
                }
            } catch (err) {
                console.warn('[MundialGame] Supabase save exception; continuing con local cache:', err);
            } finally {
                setSavingMatchId(null);
                captureUserLocation(user.id, false).catch((err: unknown) => {
                    console.warn('[Ubicación] No se pudo actualizar la ubicación después de jugar:', err);
                });
            }
        } else {
            console.log('Saved prediction locally.');
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
        <Suspense fallback={
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
                        Cargando animaciones...
                    </motion.p>
                </div>
            </div>
        }>
            <div className="relative min-h-screen bg-slate-900 text-slate-200 overflow-x-hidden font-sans">
            {/* Animated Nebula Background Spheres */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[140px] rounded-full animate-float-slow" />
                <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[130px] rounded-full animate-float-slower" />
                <div className="absolute top-[40%] left-[-15%] w-[450px] h-[450px] bg-emerald-500/5 blur-[120px] rounded-full animate-float-medium" />
            </div>

            {/* LogOut Button / Profile Header */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Analista</p>
                    <p className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/5">{user?.username || 'Usuario'}</p>
                </div>
                <button
                    onClick={signOut}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
                    title="Cerrar sesión"
                >
                    <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                </button>
            </div>

            {/* 3D Interactive Background (Classic Soccer Ball & Stardust) */}
            <MundialScene isMobile={isMobile} />
            
            <div className="max-w-4xl mx-auto space-y-6 relative z-10 py-6 px-4">
                {/* Header Card */}
                <div className="relative overflow-hidden glass-premium card-shine p-5 sm:p-8 staggered-item rounded-[32px]">
                    {/* Top gradient glowing bar */}
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-20" />
                    
                    <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500 opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                            <div className="shrink-0 scale-75 md:scale-100 hover-lift">
                                <HeaderSoccerBall3D />
                            </div>
                            <div className="text-center md:text-left flex-1 min-w-0">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2 italic break-words">
                                    ORÁCULO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 drop-shadow-[0_2px_10px_rgba(56,189,248,0.2)]">MUNDIAL 2026</span>
                                </h1>
                                <p className="text-gray-300 font-bold tracking-widest text-xs uppercase">
                                    CONVIÉRTETE EN EL REY DE LOS PRONÓSTICOS
                                </p>
                                <div className="flex items-center gap-2 mt-4 justify-center md:justify-start flex-wrap">
                                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest shadow-[0_2px_10px_rgba(52,211,153,0.1)]">⚡ IA POWERED</span>
                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">🌍 MUNDIAL 2026</span>
                                    {streak.current > 0 && (
                                        <StreakBadge streak={streak} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <VideoModalButton />
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

                {/* Navigation Tabs */}
                <div className="flex flex-wrap justify-center sm:justify-start border-b border-white/10 gap-x-1 sm:gap-x-4 gap-y-2 px-1 sm:px-2 pt-2">
                    <button
                        onClick={() => setActiveTab('matches')}
                        className={`pb-2 sm:pb-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'matches' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]' : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Partidos
                        {activeTab === 'matches' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-full shadow-[0_0_20px_rgba(56,189,248,0.8)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('ranking')}
                        className={`pb-2 sm:pb-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'ranking' ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]' : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Ranking
                        {activeTab === 'ranking' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-yellow-400 to-amber-500 rounded-t-full shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-2 sm:pb-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'history' ? 'text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]' : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Mi Historial
                        {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-400 to-purple-500 rounded-t-full shadow-[0_0_20px_rgba(129,140,248,0.8)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('astro')}
                        className={`pb-2 sm:pb-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'astro' ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]' : 'text-gray-400 hover:text-purple-300'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            Oráculo
                        </span>
                        {activeTab === 'astro' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-t-full shadow-[0_0_20px_rgba(168,85,247,0.9)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('schedules')}
                        className={`pb-2 sm:pb-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'schedules' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]' : 'text-gray-400 hover:text-emerald-300'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Horarios
                        </span>
                        {activeTab === 'schedules' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-full shadow-[0_0_20px_rgba(52,211,153,0.9)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('ligas')}
                        className={`pb-2 sm:pb-3 px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'ligas' ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]' : 'text-gray-400 hover:text-purple-300'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Users className="w-3 h-3" />
                            Ligas
                        </span>
                        {activeTab === 'ligas' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-t-full shadow-[0_0_20px_rgba(168,85,247,0.9)] animate-in slide-in-from-left-2 duration-300" />}
                    </button>
                </div>

                {/* Tab content */}
                {activeTab === 'matches' && (
                    <div className="space-y-5">
                        {/* BANNER ANIMADO PREMIUM */}
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-4 mb-2"
                        >
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">Guía Rápida</h4>
                                <p className="text-gray-400 text-[10px] leading-relaxed">
                                    1. Ingresa los goles. 2. Presiona <b>"Guardar Pronóstico"</b> (Protegido por Hermes). 3. Usa el <b>Oráculo</b> para consejos astrales. 4. ¡Suma puntos y sube en el Ranking!
                                </p>
                            </div>
                        </motion.div>

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


                        {/* FILTERS - 3 dropdowns */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedDate}
                                    onChange={(e) => { setSelectedDate(e.target.value); }}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm font-bold appearance-none focus:border-blue-500 focus:outline-none cursor-pointer"
                                >
                                    <option value="">📅 Todas las fechas</option>
                                    {uniqueDates.map(date => (
                                        <option key={date} value={date} className="bg-gray-900 text-white">{date}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedTeam}
                                    onChange={(e) => setSelectedTeam(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm font-bold appearance-none focus:border-blue-500 focus:outline-none cursor-pointer"
                                >
                                    <option value="">🏳️ Todos los equipos</option>
                                    {uniqueTeams.map(team => (
                                        <option key={team} value={team} className="bg-gray-900 text-white">{team}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => handleGroupChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm font-bold appearance-none focus:border-blue-500 focus:outline-none cursor-pointer"
                                >
                                    <option value="">🔤 Todos los grupos</option>
                                    {uniqueGroups.map(g => (
                                        <option key={g} value={g} className="bg-gray-900 text-white">GRUPO {g}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Si hay fecha seleccionada: panel derecho con lista rápida */}
                        {selectedDate && (
                            <motion.div
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl"
                            >
                                <p className="text-blue-400 font-black uppercase tracking-widest text-xs mb-3">
                                    ⚽ {filteredMatches.length} PARTIDO{filteredMatches.length !== 1 ? 'S' : ''} · {selectedDate}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {filteredMatches.map(m => (
                                        <div key={m.id} className="flex items-center gap-2 bg-black/30 rounded-xl p-2.5 border border-white/5">
                                            <img src={m.home.flag} className="w-7 h-5 rounded object-cover shrink-0" alt="" />
                                            <span className="text-white text-xs font-bold truncate">{m.home.name}</span>
                                            <span className="text-slate-500 text-xs font-black shrink-0">vs</span>
                                            <span className="text-white text-xs font-bold truncate">{m.away.name}</span>
                                            <img src={m.away.flag} className="w-7 h-5 rounded object-cover shrink-0" alt="" />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

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
                                const sky = getSkyTheme(kickoff);
                                const stadium = getStadiumByVenue(match.venue);

                                return (
                                    <motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.6 }}
                                        whileHover={{ scale: 1.02, translateY: -6 }}
                                        className="relative p-3 sm:p-10 hover:border-blue-500/50 group lg:overflow-hidden backdrop-blur-lg rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700"
                                        style={{ background: 'rgba(10,13,24,0.7)' }}
                                    >
                                        {/* Base Background matching Web aesthetic */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-950/95 pointer-events-none transition-all duration-1000" />
                                        {/* Ambient Dynamic Color Glows */}
                                        <div className={`absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r ${getTeamGlow(match.home.code)} opacity-[0.15] group-hover:opacity-30 transition-opacity duration-700 pointer-events-none`} />
                                        <div className={`absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l ${getTeamGlow(match.away.code)} opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none`} />
                                        
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

                                        {/* Unified header: 2 rows, consistent across all matches */}
                                        <div className="relative z-10 mb-3">
                                            {/* Row 1: Group + Weather + Live */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-full flex-shrink-0">
                                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest italic text-center leading-tight">GRUPO<br/>{match.group}</span>
                                                </div>
                                                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full">
                                                    <span className="text-sm leading-none">{sky.weather}</span>
                                                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest hidden sm:inline">{sky.weatherLabel}</span>
                                                </div>
                                                {match.status === 'live' && (
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                        <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">EN VIVO</span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Row 2: Countdown | Date | Venue — always visible */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {isShowCountdown && (
                                                    <div className="flex-shrink-0">
                                                        <MatchCountdown kickoff={kickoff} />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 text-white/50">
                                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{match.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-500 min-w-0">
                                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                                    <span className="text-[9px] font-medium uppercase truncate max-w-[140px]">{match.venue}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex flex-col gap-6">
                                            {/* Mobile Layout: Both Teams Visible - Improved Proportions */}
                                            <div className="lg:hidden flex flex-col gap-4 w-full px-3">


                                                {/* Main Scoreboard Row - Better Proportions */}
                                                <div className="flex items-center gap-4 w-full">
                                                    {/* Home Team - Larger Flags & Full Names */}
                                                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                                                        <img src={match.home.flag} alt={match.home.name} className="w-20 h-14 rounded-lg object-cover shadow-lg border border-white/30" />
                                                        <span className="text-[13px] font-bold text-white text-center leading-tight w-full break-words px-1">{match.home.name}</span>
                                                    </div>

                                                    {/* Score Inputs - Larger & More Accessible */}
                                                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/10 flex-shrink-0">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            maxLength={2}
                                                            value={predictions[match.id]?.homeScore ?? ''}
                                                            onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                                            placeholder="0"
                                                            className="w-14 h-14 bg-slate-950/90 border border-white/20 rounded-lg text-center text-xl font-black text-white focus:border-blue-500 focus:outline-none placeholder:opacity-5"
                                                        /> 
                                                        <span className="text-xl font-black text-slate-400 px-1">:</span>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            maxLength={2}
                                                            value={predictions[match.id]?.awayScore ?? ''}
                                                            onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                                            placeholder="0"
                                                            className="w-14 h-14 bg-slate-950/90 border border-white/20 rounded-lg text-center text-xl font-black text-white focus:border-emerald-500 focus:outline-none placeholder:opacity-5"
                                                        /> 
                                                    </div>

                                                    {/* Away Team - Larger Flags & Full Names */}
                                                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                                                        <img src={match.away.flag} alt={match.away.name} className="w-20 h-14 rounded-lg object-cover shadow-lg border border-white/30" />
                                                        <span className="text-[13px] font-bold text-white text-center leading-tight w-full break-words px-1">{match.away.name}</span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons - INSIDE mobile container */}
                                                <div className="flex flex-col gap-3 mt-2">
                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleSaveStatus(match.id)}
                                                        disabled={savingMatchId === match.id}
                                                        className={`w-full min-h-[52px] py-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                                                            savedMatchIds[match.id]
                                                                ? 'bg-emerald-500 text-white'
                                                                : savingMatchId === match.id
                                                                ? 'bg-blue-600 text-white cursor-wait'
                                                                : 'bg-white text-slate-950 hover:bg-amber-500 hover:text-white'
                                                        }`}
                                                    >
                                                        {savedMatchIds[match.id] ? (
                                                            <><Check className="w-4 h-4" /> GUARDADO</>
                                                        ) : savingMatchId === match.id ? (
                                                            <><Loader2 className="w-4 h-4 animate-spin" /> GUARDANDO...</>
                                                        ) : (
                                                            <><Save className="w-4 h-4" /> GUARDAR PRONÓSTICO</>
                                                        )}
                                                    </motion.button>

                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setOracleMatch(match)}
                                                        className="w-full min-h-[52px] py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-purple-500/15 border border-purple-500/30 text-purple-400"
                                                    >
                                                        <Sparkles className="w-4 h-4" />
                                                        Consultar Oráculo
                                                    </motion.button>

                                                    <CommunityBar
                                                        matchId={match.id}
                                                        userPrediction={predictions[match.id]}
                                                    />
                                                </div>
                                            </div>

                                            {/* Desktop Layout: Original two-column layout */}
                                            <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-start">
                                            {/* Left Column: Teams and Score */}
                                            <div className="flex flex-col gap-8">
                                                {/* Home Team */}
                                                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left transition-all group-hover:translate-x-1 duration-500">
                                                    <div className="relative shrink-0">
                                                        <img src={match.home.flag} alt="" className="w-32 h-20 md:w-40 md:h-28 rounded-2xl object-cover shadow-[0_15px_30px_rgba(0,0,0,0.6)] border-4 border-white/15 ring-4 ring-black/40 animate-flag-wave-left" />
                                                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter mb-2 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] break-words">{match.home.name}</h3>
                                                        <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-md">
                                                            <span className="text-xs font-black text-blue-400/90 uppercase tracking-[0.2em]">{match.home.code}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Score Inputs */}
                                                <div className="flex flex-col items-center gap-6 py-4 bg-white/5 rounded-2xl p-6">
                                                    <div className="flex items-center gap-6">
                                                        <div className="relative group/input">
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                maxLength={2}
                                                                value={predictions[match.id]?.homeScore ?? ''}
                                                                onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                                                placeholder="0"
                                                                className="w-28 h-32 bg-slate-950/90 border-2 border-white/20 rounded-[28px] text-center text-6xl font-black text-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/20 focus:outline-none transition-all hover:border-white/30 placeholder:opacity-5 shadow-[inset_0_4px_25px_rgba(0,0,0,0.9)]"
                                                            />
                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-blue-500 rounded-full opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                                        </div>

                                                        <div className="flex flex-col items-center">
                                                            <span className="text-4xl font-black text-slate-600 italic tracking-tighter">VS</span>
                                                        </div>

                                                        <div className="relative group/input">
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                maxLength={2}
                                                                value={predictions[match.id]?.awayScore ?? ''}
                                                                onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                                                placeholder="0"
                                                                className="w-28 h-32 bg-slate-950/90 border-2 border-white/20 rounded-[28px] text-center text-6xl font-black text-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/20 focus:outline-none transition-all hover:border-white/30 placeholder:opacity-5 shadow-[inset_0_4px_25px_rgba(0,0,0,0.9)]"
                                                            />
                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-emerald-500 rounded-full opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                    
                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleSaveStatus(match.id)}
                                                        disabled={savingMatchId === match.id}
                                                        className={`w-full py-4.5 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl overflow-hidden relative border ${
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

                                                    {/* Botón Consultar Oráculo */}
                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setOracleMatch(match)}
                                                        className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.1))',
                                                            border: '1px solid rgba(168,85,247,0.3)',
                                                            color: '#c084fc'
                                                        }}
                                                    >
                                                        <Sparkles className="w-4 h-4" />
                                                        Consultar Oráculo
                                                    </motion.button>

                                                    {/* CommunityBar — solo visible después de guardar */}
                                                    <CommunityBar
                                                        matchId={match.id}
                                                        userPrediction={predictions[match.id]}
                                                    />                                                </div>

                                                {/* Away Team */}
                                                <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 md:gap-6 text-center md:text-right transition-all group-hover:-translate-x-1 duration-500 w-full ml-auto">
                                                    <div className="flex-1 min-w-0 md:flex-none md:text-right">
                                                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter mb-2 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] break-words">{match.away.name}</h3>
                                                        <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-md">
                                                            <span className="text-xs font-black text-emerald-400/90 uppercase tracking-[0.2em]">{match.away.code}</span>
                                                        </div>
                                                    </div>
                                                    <div className="relative shrink-0">
                                                        <img src={match.away.flag} alt="" className="w-32 h-20 md:w-40 md:h-28 rounded-2xl object-cover shadow-[0_15px_30px_rgba(0,0,0,0.6)] border-4 border-white/15 ring-4 ring-black/40 animate-flag-wave-right" />
                                                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>

                                                {/* Social Sentiment & Insider Data */}
                                                <div className="flex flex-col gap-3 mt-2">
                                                    <div className="bg-black/30 border border-white/10 rounded-xl p-3">
                                                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-1">
                                                            <span>Tendencia Global</span>
                                                            <span>80% vs 20%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                                                            <div className={`h-full ${getTeamGlow(match.home.code).split(' ')[0].replace('from-', 'bg-').replace('/20', '')} bg-blue-500`} style={{ width: '80%' }} />
                                                            <div className={`h-full ${getTeamGlow(match.away.code).split(' ')[0].replace('from-', 'bg-').replace('/20', '')} bg-emerald-500`} style={{ width: '20%' }} />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
                                                        <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Insider Data</p>
                                                            <p className="text-xs text-gray-300">Factor local: La humedad en {stadium?.city || match.venue} afecta históricamente a los equipos europeos. Predicción algorítmica: Empate con pocos goles.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: Stadium Image */}
                                            {stadium && (
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <div className="w-full flex-1 min-h-[400px] rounded-[24px] overflow-hidden border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.4)] bg-slate-950 relative group/stadium">
                                                        <img 
                                                            src={stadium.imageUrl} 
                                                            alt={stadium.name} 
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/stadium:scale-105" 
                                                            loading="lazy"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent pointer-events-none" />
                                                        
                                                        {/* Info Overlay */}
                                                        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg backdrop-blur-md">
                                                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Sede Oficial</span>
                                                                </div>
                                                            </div>
                                                            <h4 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{stadium.name}</h4>
                                                            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                                                <MapPin className="w-4 h-4" />
                                                                {stadium.city}, {stadium.country}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        </div>

                                        <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Final Result Section - if match is finished */}
                                        {match.result && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="relative z-10 mt-6 pt-6 border-t border-white/10"
                                            >
                                                <div className="text-center">
                                                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Resultado Final</p>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <div className="text-center">
                                                            <p className="text-2xl font-black text-white">{(match.result as any).home || (match.result as any).homeGoals}</p>
                                                            <p className="text-xs text-white/60 mt-1">{match.home.name}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs font-bold text-white/40 uppercase">Final</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-2xl font-black text-white">{(match.result as any).away || (match.result as any).awayGoals}</p>
                                                            <p className="text-xs text-white/60 mt-1">{match.away.name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
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
                                    Sigue el ranking de encargados de Propgear AI. Predice con exactitud, suma puntos y reclama tu lugar en la cima de la red.
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
                                                        {`Encargado ${pos}`}
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
                                <div key={pred.matchId} className="flex items-center justify-between p-6 rounded-3xl glass-premium card-shine cursor-pointer border border-white/10 hover:border-blue-500/30">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center w-14 shrink-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{match.date}</p>
                                            <p className="text-xs font-black text-amber-400 tracking-wide mt-0.5">+3 PTS</p>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <img src={match.home.flag} alt="" className="w-14 h-9 rounded-lg object-cover shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-white/20 animate-flag-wave-left" />
                                            <div className="bg-slate-950 px-5 py-2 rounded-2xl border-2 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center">
                                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-wider">{pred.homeScore} - {pred.awayScore}</span>
                                            </div>
                                            <img src={match.away.flag} alt="" className="w-14 h-9 rounded-lg object-cover shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-white/20 animate-flag-wave-right" />
                                        </div>
                                    </div>
                                    <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/40 uppercase tracking-widest shadow-[0_4px_12px_rgba(16,185,129,0.15)] flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 animate-pulse" /> Guardado
                                    </span>
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

                        {/* Dropdown por Grupos para Oráculo Estelar */}
                        <div className="relative z-20 max-w-xs mx-auto md:mx-0">
                            <select
                                value={selectedAstroGroup}
                                onChange={(e) => handleGroupChange(e.target.value)}
                                className="w-full bg-slate-900 border border-purple-500/30 text-white py-3 px-5 rounded-2xl font-black uppercase text-xs tracking-widest appearance-none focus:outline-none focus:ring-4 focus:ring-purple-500/20 cursor-pointer"
                            >
                                <option value="">🌌 Todos los Grupos</option>
                                <option value="A">GRUPO A</option>
                                <option value="B">GRUPO B</option>
                                <option value="C">GRUPO C</option>
                                <option value="D">GRUPO D</option>
                                <option value="E">GRUPO E</option>
                                <option value="F">GRUPO F</option>
                                <option value="G">GRUPO G</option>
                                <option value="H">GRUPO H</option>
                                <option value="I">GRUPO I</option>
                                <option value="J">GRUPO J</option>
                                <option value="K">GRUPO K</option>
                                <option value="L">GRUPO L</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-purple-400">
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {ASTRO_PREDICTIONS
                                .filter(section => !selectedAstroGroup || section.title.includes(`GRUPO ${selectedAstroGroup}`) || section.type === 'highlight' || section.type === 'knockout')
                                .map((section) => (
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
                                                    <div key={idx} className="relative flex justify-between items-center p-4 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/50 hover:bg-purple-900/20 transition-all group overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                                        <span className="relative z-10 text-xs font-black text-white flex-1 drop-shadow-md group-hover:translate-x-1 transition-transform">{m.match}</span>
                                                        <span className="relative z-10 text-[10px] md:text-xs font-black px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] group-hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] group-hover:scale-105 transition-all border border-purple-400/30">
                                                            {m.result}
                                                        </span>
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
                                {/* Group filter for schedules */}
                                <div className="relative z-20 max-w-xs mx-auto md:mx-0 mt-3">
                                    <select
                                        value={selectedScheduleGroup}
                                        onChange={(e) => handleGroupChange(e.target.value)}
                                        className="w-full bg-slate-900 border border-blue-500/30 text-white py-3 px-5 rounded-2xl font-black uppercase text-xs tracking-widest appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
                                    >
                                        <option value="">🔤 Todos los grupos</option>
                                        {uniqueGroups.map(g => (
                                            <option key={g} value={g}>GRUPO {g}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-blue-400">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            <AnimatedClockStadium />
                        </div>

                        <div className="space-y-6">
                            {WORLD_CUP_SCHEDULES
                                .filter(g => !selectedScheduleGroup || g.id === `group_${selectedScheduleGroup.toLowerCase()}` || g.name.includes(`GRUPO ${selectedScheduleGroup}`))
                                .map((group) => (
                                <div key={group.id} className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden staggered-item">
                                    <div className="p-4 bg-emerald-500/10 border-b border-white/5">
                                        <h3 className="font-black uppercase tracking-widest text-white text-base">⚽ {group.name}</h3>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {group.matches.map((match) => {
                                            const localTime = (match.times as any)[selectedCountry];
                                            return (
                                                <div key={match.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                                                    <div className="flex-1">
                                                        <h4 className="font-black text-white text-xl tracking-tight mb-1 uppercase group-hover:text-amber-500 transition-colors">{match.title}</h4>
                                                        <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                            <span>📅 {match.date}</span>
                                                            <span>📍 {match.venue}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl sm:text-4xl font-black text-white font-mono group-hover:scale-110 transition-transform">{localTime}</p>
                                                        <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">Hora Local</p>
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

                {activeTab === 'ligas' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <PrivateLeague />
                    </motion.div>
                )}

                {showVideoModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300">
                        <div className="relative max-w-4xl w-full bg-[#0A0D18] rounded-2xl p-0.5 sm:p-2 border border-white/10 shadow-2xl overflow-hidden">
                            <div className="absolute top-3 right-3 z-20">
                                <button 
                                    className="text-white/70 hover:text-white p-2 bg-black/40 rounded-full transition-all touch-manipulation" 
                                    onClick={() => setShowVideoModal(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="aspect-video bg-[#0A0D18] rounded-xl overflow-hidden relative w-full">
                                <iframe
                                    title="Tutorial Oráculo"
                                    src={`https://hyperframes-mini-video.vercel.app/?user=${encodeURIComponent(user?.username || 'Invitado')}&pts=${String(totalPoints)}`}
                                    className="absolute top-0 left-0 w-full h-full border-0"
                                    style={{ border: 'none', background: '#0A0D18', width: '100%', height: '100%', position: 'absolute' }}
                                    loading="lazy"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                                />
                            </div>
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
                                <ShareButtons user={user} totalPoints={totalPoints} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* OracleAdvisor Modal */}
        {oracleMatch && (
            <OracleAdvisor
                homeTeam={oracleMatch.home.name}
                awayTeam={oracleMatch.away.name}
                homeCode={oracleMatch.home.code}
                awayCode={oracleMatch.away.code}
                group={oracleMatch.group}
                onClose={() => setOracleMatch(null)}
            />
        )}

        {/* WinCelebration */}
        <WinCelebration
            type={celebration.type}
            homeTeam={celebration.home}
            awayTeam={celebration.away}
            onDone={() => setCelebration({ type: null, home: '', away: '' })}
        />
        </Suspense>
    );
};
