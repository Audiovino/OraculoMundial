import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCw, 
  MapPin, 
  Users, 
  Cloud, 
  Clock, 
  Globe, 
  Sparkles, 
  X, 
  Info,
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { WORLD_CUP_2026_STADIUMS, Stadium } from '../data/StadiumsData';
import { useVisibleElement } from '../hooks/useVisibleElement';

const RealisticStadium3D = React.lazy(() => import('./scene/RealisticStadium3D'));

interface StadiumCardProps {
  stadium: Stadium;
}

const getWeatherForStadium = (stadium: Stadium): 'clear' | 'cloudy' | 'rainy' | 'stormy' => {
  const random = Math.random();
  if (random > 0.8) return 'stormy';
  if (random > 0.6) return 'rainy';
  if (random > 0.4) return 'cloudy';
  return 'clear';
};

const getLocalTime = (timezone: string): Date => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(new Date());
    const date = new Date();

    parts.forEach(part => {
      if (part.type === 'hour') date.setHours(parseInt(part.value));
      if (part.type === 'minute') date.setMinutes(parseInt(part.value));
      if (part.type === 'second') date.setSeconds(parseInt(part.value));
    });

    return date;
  } catch (e) {
    return new Date();
  }
};

const getTimeOfDayLabel = (hour: number): string => {
  if (hour >= 0 && hour < 6) return 'Madrugada';
  if (hour >= 6 && hour < 9) return 'Mañana';
  if (hour >= 9 && hour < 12) return 'Mañana';
  if (hour >= 12 && hour < 15) return 'Mediodía';
  if (hour >= 15 && hour < 18) return 'Tarde';
  if (hour >= 18 && hour < 21) return 'Atardecer';
  return 'Noche';
};

const getStadiumFact = (id: string): string => {
  const facts: { [key: string]: string } = {
    azteca: "Sede del Partido Inaugural el 11 de junio. Primer estadio en albergar 3 Mundiales.",
    guadalajara: "Estadio Akron. Albergará 4 partidos de la fase de grupos del Mundial.",
    monterrey: "Estadio BBVA. Conocido como 'El Gigante de Acero' por su espectacular silueta.",
    kansas_city: "Arrowhead Stadium. Famoso por su récord mundial de ruido en estadios abiertos.",
    atlanta: "Mercedes-Benz Stadium. Cuenta con techo retráctil de 8 pétalos y pantalla circular gigante.",
    dallas: "AT&T Stadium. Albergará 9 partidos en total, incluyendo una de las semifinales.",
    houston: "NRG Stadium. Estadio climatizado con techo retráctil y césped desmontable.",
    miami: "Hard Rock Stadium. Albergará 7 partidos, incluido el partido por el tercer puesto.",
    san_francisco: "Levi's Stadium. Sede tecnológica y ecológica en el corazón de Silicon Valley.",
    los_angeles: "SoFi Stadium. El estadio más costoso del mundo. Albergará el debut de EE.UU.",
    seattle: "Lumen Field. Famoso por su acústica de doble herradura que amplifica la afición.",
    denver: "Empower Field. Ubicado a 1,600 metros de altura sobre el nivel del mar.",
    toronto: "BMO Field. Sede del histórico primer partido del Mundial disputado en Canadá.",
    vancouver: "BC Place. Cuenta con una icónica cubierta suspendida por cables de acero.",
    metlife: "Sede de la Gran Final el 19 de julio. El estadio con mayor capacidad del torneo.",
    rose_bowl: "Estadio histórico. Sede de la gran final del Mundial de EE.UU. 1994.",
    gillette: "Estadio de los Patriots. Albergará partidos clave de cuartos de final.",
    lincoln: "Lincoln Financial Field. Sede en Filadelfia, cuna de la independencia americana."
  };
  return facts[id] || "Albergará partidos oficiales de la Copa Mundial de la FIFA 2026.";
};

const getCountryEmoji = (code: string): string => {
  if (code === 'MX') return '🇲🇽';
  if (code === 'US') return '🇺🇸';
  if (code === 'CA') return '🇨🇦';
  return '🏳️';
};

const StadiumCard: React.FC<StadiumCardProps> = ({ stadium }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [localTime, setLocalTime] = useState<Date>(getLocalTime(stadium.timezone));
  const [weather, setWeather] = useState<'clear' | 'cloudy' | 'rainy' | 'stormy'>(getWeatherForStadium(stadium));
  const [showPhoto, setShowPhoto] = useState(true);
  
  // Intersection Observer para lazy load del modelo 3D
  const { ref: containerRef, isVisible } = useVisibleElement({ threshold: 0.1, rootMargin: '100px' });

  useEffect(() => {
    if (!isVisible) return; // Ahorro de CPU: No actualizar el reloj si la tarjeta no se ve

    const interval = setInterval(() => {
      setLocalTime(getLocalTime(stadium.timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [stadium.timezone, isVisible]);

  const hour = localTime.getHours();
  const timeLabel = getTimeOfDayLabel(hour);
  const timeString = localTime.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const countryFlag = getCountryEmoji(stadium.countryCode);
  const stadiumFact = getStadiumFact(stadium.id);

  // Weather rendering helpers
  const renderWeatherIcon = () => {
    switch (weather) {
      case 'clear': return <Sun size={14} className="text-amber-400" />;
      case 'cloudy': return <CloudSun size={14} className="text-slate-300" />;
      case 'rainy': return <CloudRain size={14} className="text-sky-400" />;
      case 'stormy': return <CloudLightning size={14} className="text-purple-400" />;
      default: return <Sun size={14} className="text-amber-400" />;
    }
  };

  const getWeatherText = () => {
    switch (weather) {
      case 'clear': return 'Despejado';
      case 'cloudy': return 'Nublado';
      case 'rainy': return 'Lluvia';
      case 'stormy': return 'Tormenta';
      default: return 'Despejado';
    }
  };

  return (
    <div ref={containerRef} className="w-full aspect-[16/11] sm:aspect-[16/10.5] relative group" style={{ perspective: '1200px' }}>
      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .preserve-3d {
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }
      `}</style>

      <motion.div
        className="w-full h-full preserve-3d relative cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* FRONT FACE (3D Model / Real Photo + Header info) */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden bg-slate-950 rounded-2xl border flex flex-col overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
          style={{ 
            borderColor: stadium.color + '40',
            boxShadow: `0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 16px -2px ${stadium.color}15`,
            visibility: isFlipped ? 'hidden' : 'visible',
            pointerEvents: isFlipped ? 'none' : 'auto'
          }}
        >
          {/* Main Visual Render Area */}
          <div className="flex-1 w-full relative bg-slate-950/80 overflow-hidden">
            {/* Ambient shadow gradient */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />
            
            {showPhoto ? (
              <div className="w-full h-full relative">
                <img 
                  src={stadium.imageUrl} 
                  alt={stadium.name} 
                  className="w-full h-full object-cover select-none" 
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            ) : isVisible ? (
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-xs text-slate-500">Cargando modelo 3D...</span>
                  </div>
                </div>
              }>
                <RealisticStadium3D stadium={stadium} currentTime={localTime} interactive={true} />
              </Suspense>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-2">Modelo 3D</div>
                  <div className="text-[10px] text-slate-600">Desplázate para cargar</div>
                </div>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-slate-300 flex items-center gap-1.5 border border-white/5 pointer-events-none z-10">
              {showPhoto ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Foto Real Oficial</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>3D Interactivo (Arrastra)</span>
                </>
              )}
            </div>

            {/* Photo/3D Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPhoto(!showPhoto);
              }}
              className="absolute top-3 right-3 bg-black/75 hover:bg-black/90 active:scale-95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white flex items-center gap-1.5 border border-white/10 z-20 transition-all duration-200"
              title={showPhoto ? "Ver maqueta interactiva 3D" : "Ver fotografía real de la sede"}
            >
              {showPhoto ? (
                <>
                  <Globe size={11} className="text-blue-400" />
                  <span className="font-bold">Ver 3D</span>
                </>
              ) : (
                <>
                  <Camera size={11} className="text-emerald-400" />
                  <span className="font-bold">Ver Foto</span>
                </>
              )}
            </button>
          </div>

          {/* Bottom Card Label Panel (Clicking here flips the card) */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(true);
            }}
            className="h-[80px] sm:h-[76px] bg-slate-900/90 hover:bg-slate-800/90 border-t border-white/5 px-4 py-3 flex items-center justify-between transition-colors duration-200"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[11px] sm:text-[10px] tracking-wider uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <span>{countryFlag}</span>
                <span className="truncate">{stadium.city}, {stadium.country}</span>
              </div>
              <h3 className="text-lg sm:text-base font-bold text-white truncate tracking-tight mt-0.5" style={{ color: '#ffffff' }}>
                {stadium.name}
              </h3>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              title="Ver Ficha Técnica"
            >
              <RotateCw size={14} />
            </motion.div>
          </div>
        </div>

        {/* BACK FACE (Stadium Details & Facts - Trading card styled with real cover photo) */}
        <div 
          onClick={() => setIsFlipped(false)}
          className="absolute inset-0 w-full h-full backface-hidden bg-slate-900 rounded-2xl border-2 flex flex-col justify-between overflow-hidden shadow-2xl"
          style={{ 
            transform: 'rotateY(180deg)',
            borderColor: stadium.color,
            boxShadow: `0 8px 32px -4px rgba(0, 0, 0, 0.7), 0 0 24px -2px ${stadium.color}25`,
            visibility: isFlipped ? 'visible' : 'hidden',
            pointerEvents: isFlipped ? 'auto' : 'none'
          }}
        >
          {/* Cover image header */}
          <div className="w-full h-[40%] relative bg-slate-950">
            <img 
              src={stadium.imageUrl} 
              alt={stadium.name} 
              className="w-full h-full object-cover" 
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-black/40" />
            
            {/* Title overlay */}
            <div className="absolute bottom-2.5 left-4 right-4 flex items-end justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-black">
                    Sede Oficial
                  </span>
                  <span className="text-[10px] text-slate-200 font-bold truncate">{countryFlag} {stadium.city}</span>
                </div>
                <h4 className="text-sm font-black tracking-tight text-white mt-0.5 truncate" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {stadium.name}
                </h4>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="w-6 h-6 shrink-0 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors border border-white/10"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Content details bottom area */}
          <div className="flex-1 p-3 flex flex-col justify-between bg-slate-900">
            {/* Grid Information */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/40 border border-white/5 rounded-lg px-2 py-1 flex items-center gap-2">
                <Users size={14} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Capacidad</div>
                  <div className="text-xs font-black text-white">{stadium.capacity.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-white/5 rounded-lg px-2 py-1 flex items-center gap-2">
                <Clock size={14} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Hora Local ({timeLabel})</div>
                  <div className="text-xs font-black text-white">{timeString}</div>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-white/5 rounded-lg px-2 py-1 flex items-center gap-2">
                {renderWeatherIcon()}
                <div className="min-w-0">
                  <div className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Clima Sim.</div>
                  <div className="text-xs font-black text-white">{getWeatherText()}</div>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-white/5 rounded-lg px-2 py-1 flex items-center gap-2">
                <Globe size={14} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Zona Horaria</div>
                  <div className="text-xs font-bold text-slate-300 truncate" title={stadium.timezone}>
                    {stadium.timezone.split('/').pop()?.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Highlight Fact Box */}
            <div className="bg-slate-950/50 border border-white/5 rounded-lg p-2.5 flex items-start gap-2 mt-1.5">
              <Sparkles size={13} className="text-amber-400 mt-0.5 shrink-0 animate-pulse" />
              <p className="text-[10px] text-slate-300 leading-normal font-medium">
                {stadiumFact}
              </p>
            </div>

            <div className="text-center text-[9px] text-slate-500 font-bold hover:text-white transition-colors mt-1.5">
              ⬅️ Clic para volver a la vista frontal
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface StadiumsGridProps {
  filter?: 'all' | 'mexico' | 'usa' | 'canada';
}

const StadiumsGrid: React.FC<StadiumsGridProps> = ({ filter = 'all' }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'mexico' | 'usa' | 'canada'>(filter);

  const filteredStadiums = WORLD_CUP_2026_STADIUMS.filter(stadium => {
    if (activeFilter === 'mexico') return stadium.countryCode === 'MX';
    if (activeFilter === 'usa') return stadium.countryCode === 'US';
    if (activeFilter === 'canada') return stadium.countryCode === 'CA';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0D18] text-white py-6 px-3 sm:py-12 sm:px-6 overflow-x-hidden relative">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[600px] h-[600px] bg-red-500/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-4"
          >
            <Sparkles size={12} className="text-amber-400" />
            <span>Sedes Oficiales del Mundial 2026</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400"
          >
            Estadios del Mundial 2026
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto mt-3 text-sm md:text-base leading-relaxed"
          >
            Explora las maquetas arquitectónicas 3D de los estadios sede y descubre sus datos históricos, zona horaria y simulación climática en tiempo real.
          </motion.p>
        </div>

        {/* Filter Navigation */}
        <div className="flex justify-center gap-2 mb-6 sm:mb-10 flex-wrap">
          {[
            { label: 'Todos los Estadios', value: 'all', emoji: '🏟️' },
            { label: 'México', value: 'mexico', emoji: '🇲🇽' },
            { label: 'Estados Unidos', value: 'usa', emoji: '🇺🇸' },
            { label: 'Canadá', value: 'canada', emoji: '🇨🇦' }
          ].map((btn, idx) => (
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 + 0.15 }}
              key={btn.value}
              onClick={() => setActiveFilter(btn.value as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border transition-all duration-300 ${
                activeFilter === btn.value
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 border-rose-500 text-white shadow-lg shadow-rose-900/20'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span>{btn.emoji}</span>
              <span>{btn.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Grid Container */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredStadiums.map(stadium => (
              <motion.div
                layout
                key={stadium.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <StadiumCard stadium={stadium} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Informative Stats Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 border-t border-white/5 pt-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2"
        >
          <p>
            Mostrando <strong className="text-white">{filteredStadiums.length}</strong> de <strong className="text-white">{WORLD_CUP_2026_STADIUMS.length}</strong> estadios totales.
          </p>
          <p className="max-w-md text-slate-600 text-[11px] leading-relaxed">
            💡 Haz clic en el panel inferior o en el ícono de giro de cualquier tarjeta para ver la información técnica de la sede. Usa el mouse/gestos táctiles sobre el modelo para rotar y orbitar de forma independiente.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default StadiumsGrid;
