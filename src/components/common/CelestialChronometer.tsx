import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Compass, Sparkles, Sun, Moon, Calendar } from 'lucide-react';

export interface CelestialChronometerProps {
  className?: string;
  compact?: boolean;
}

const ROMAN_NUMERALS = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
const ARCANE_SIGILS = ['☼', '✦', '♈', '✧', '♉', '⚝', '♊', '✵', '♋', '✧', '♌', '✦'];
const LUNAR_SIGILS = ['☽', '✦', '♓', '✧', '♒', '⚝', '♑', '⋆', '♐', '✧', '♏', '✦'];

export const CelestialChronometer: React.FC<CelestialChronometerProps> = ({
  className = '',
  compact = false,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [isHovered, setIsHovered] = useState(false);
  const [novaBurstKey, setNovaBurstKey] = useState(0);
  const [celestialOverride, setCelestialOverride] = useState<'auto' | 'sun' | 'moon'>('auto');

  const [tilt, setTilt] = useState<{
    rx: number;
    ry: number;
    dx: number;
    dy: number;
    gx: number;
    gy: number;
  }>({
    rx: 0,
    ry: 0,
    dx: 0,
    dy: 0,
    gx: 50,
    gy: 50,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const dx = Math.max(-1, Math.min(1, (x - cx) / cx));
    const dy = Math.max(-1, Math.min(1, (y - cy) / cy));

    setTilt({
      rx: -dy * 14,
      ry: dx * 14,
      dx,
      dy,
      gx: Math.round((x / rect.width) * 100),
      gy: Math.round((y / rect.height) * 100),
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setNovaBurstKey(prev => prev + 1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0, dx: 0, dy: 0, gx: 50, gy: 50 });
  };

  const handleClockClick = () => {
    setNovaBurstKey(prev => prev + 1);
  };

  const hoursNum = time.getHours();
  const minutesNum = time.getMinutes();
  const currentSeconds = time.getSeconds();
  const currentMinutes = hoursNum * 60 + minutesNum;

  const hours = hoursNum.toString().padStart(2, '0');
  const minutes = minutesNum.toString().padStart(2, '0');
  const seconds = currentSeconds.toString().padStart(2, '0');

  // Automatic Day vs Night detection:
  // Morning/Daytime (Pagi - Sore): 05:30 (330 mins) to 17:59 (1079 mins) -> SUN (Matahari)
  // Nighttime (Malam - Subuh): 18:00 (1080 mins) to 05:29 (329 mins) -> MOON (Bulan)
  const isNaturalNight = currentMinutes >= 1080 || currentMinutes < 330;
  const isNightMoon =
    celestialOverride === 'auto' ? isNaturalNight : celestialOverride === 'moon';

  // Precision Horological Angles
  const secondAngle = (currentSeconds / 60) * 360;
  const minuteHandAngle = ((minutesNum + currentSeconds / 60) / 60) * 360;
  const hourHandAngle = (((hoursNum % 12) + minutesNum / 60) / 12) * 360;

  // Smooth SVG Progress Arc for Seconds (r = 92, circumference = 2 * PI * 92 = 578.05)
  const progressCircumference = 2 * Math.PI * 92;
  const progressOffset =
    progressCircumference - (currentSeconds / 60) * progressCircumference;

  // Indonesian Date Formatting
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const dayName = days[time.getDay()];
  const dateFormatted = `${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`;

  // Academic Session Status calculation
  const sessionInfo = useMemo(() => {
    if (currentMinutes >= 420 && currentMinutes < 570) {
      return {
        label: 'KBM Sesi Pagi (07.00 - 09.30)',
        icon: Sun,
        color:
          'text-amber-100 border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-600/20 shadow-[0_4px_20px_rgba(249,115,22,0.35)]',
      };
    } else if (currentMinutes >= 570 && currentMinutes < 600) {
      return {
        label: 'Istirahat Pagi (09.30 - 10.00)',
        icon: Sparkles,
        color:
          'text-emerald-100 border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-600/20 shadow-[0_4px_20px_rgba(52,211,153,0.35)]',
      };
    } else if (currentMinutes >= 600 && currentMinutes < 720) {
      return {
        label: 'KBM Sesi Siang (10.00 - 12.00)',
        icon: Sun,
        color:
          'text-cyan-100 border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-blue-600/20 shadow-[0_4px_20px_rgba(34,211,238,0.35)]',
      };
    } else if (currentMinutes >= 720 && currentMinutes < 780) {
      return {
        label: 'Istirahat & Ishoma (12.00 - 13.00)',
        icon: Moon,
        color:
          'text-emerald-100 border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-600/20 shadow-[0_4px_20px_rgba(52,211,153,0.35)]',
      };
    } else if (currentMinutes >= 780 && currentMinutes < 930) {
      return {
        label: 'KBM Sesi Sore (13.00 - 15.30)',
        icon: Sun,
        color:
          'text-indigo-100 border-indigo-400/50 bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-indigo-600/20 shadow-[0_4px_20px_rgba(129,140,248,0.35)]',
      };
    }
    return {
      label: isNightMoon ? 'Waktu Malam Akademi (18.00 - 05.30)' : 'Jam Persiapan Akademi',
      icon: isNightMoon ? Moon : Sun,
      color: isNightMoon
        ? 'text-cyan-100 border-cyan-400/45 bg-[#091328]/85 shadow-[0_4px_20px_rgba(56,189,248,0.28)]'
        : 'text-amber-100 border-amber-400/45 bg-[#0B1528]/85 shadow-[0_4px_20px_rgba(245,158,11,0.28)]',
    };
  }, [currentMinutes, isNightMoon]);

  const SessionIcon = sessionInfo.icon;

  // COMPACT VIEW
  if (compact) {
    return (
      <div
        className={`relative flex items-center justify-between gap-3 px-4 py-2 rounded-full border backdrop-blur-md animate-astral-float ${
          isNightMoon
            ? 'border-cyan-400/70 bg-gradient-to-r from-[#09152B]/90 via-[#111C38]/95 to-[#09152B]/90 shadow-[0_0_24px_rgba(56,189,248,0.4)]'
            : 'border-[#D4AF37]/70 bg-gradient-to-r from-[#0F1E3A]/90 via-[#0B1528]/95 to-[#0F1E3A]/90 shadow-[0_0_24px_rgba(249,115,22,0.4)]'
        } ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <span
              className={`absolute inset-0 rounded-full animate-ping opacity-70 ${
                isNightMoon ? 'bg-cyan-400/30' : 'bg-orange-500/30'
              }`}
            />
            {isNightMoon ? (
              <Moon className="h-4 w-4 text-cyan-300" />
            ) : (
              <Compass className="h-4 w-4 text-amber-400 animate-celestial-spin" />
            )}
          </div>
          <span
            className={`font-mono text-sm font-black tracking-wider animate-mana-flicker ${
              isNightMoon ? 'text-cyan-200' : 'text-amber-300'
            }`}
            style={{ fontFamily: "'Cinzel', 'JetBrains Mono', monospace" }}
          >
            {hours}:{minutes}
            <span className="opacity-75">:{seconds}</span>
            <span className="ml-1 text-[10px] font-bold">WIB</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
          <Calendar className="h-3 w-3 text-cyan-400 animate-pulse" />
          <span className="truncate">
            {dayName}, {dateFormatted}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      aria-label="Royal Celestial Astrolabe Chronometer"
    >
      {/* ==================================================================== */}
      {/* SOFT ETHEREAL CELESTIAL HALO BACKGLOW                                */}
      {/* ==================================================================== */}
      <div
        className={`pointer-events-none absolute rounded-full blur-3xl transition-all duration-700 ${
          isNightMoon
            ? isHovered
              ? 'h-84 w-84 bg-gradient-to-tr from-sky-400/45 via-indigo-500/40 to-purple-500/40 scale-110'
              : 'h-72 w-72 bg-gradient-to-tr from-cyan-500/25 via-indigo-600/20 to-purple-600/20 scale-100'
            : isHovered
            ? 'h-84 w-84 bg-gradient-to-tr from-amber-400/50 via-orange-500/45 to-yellow-300/40 scale-110'
            : 'h-72 w-72 bg-gradient-to-tr from-amber-500/28 via-orange-500/22 to-yellow-500/18 scale-100'
        }`}
      />

      {/* ==================================================================== */}
      {/* HAUTE HORLOGERIE 3D CELESTIAL ASTROLABE CONTAINER                    */}
      {/* ==================================================================== */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClockClick}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.045)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered
            ? 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="group relative flex h-[296px] w-[296px] sm:h-[316px] sm:w-[316px] items-center justify-center cursor-pointer"
        title={
          isNightMoon
            ? 'Astrolabe Rembulan Malam — Sorot atau klik untuk efek resonansi kristal bulan'
            : 'Astrolabe Surya Pagi/Siang — Sorot atau klik untuk efek resonansi mahkota matahari'
        }
      >
        {/* Interactive Silk Shockwave Ring on Hover / Click */}
        {novaBurstKey > 0 && (
          <div key={novaBurstKey} className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={`absolute inset-5 rounded-full border-[1.5px] animate-solar-nova ${
                isNightMoon
                  ? 'border-cyan-200/90 shadow-[0_0_30px_#38bdf8,inset_0_0_20px_#c084fc]'
                  : 'border-amber-200/90 shadow-[0_0_30px_#f59e0b,inset_0_0_20px_#fde047]'
              }`}
            />
          </div>
        )}

        {/* Delicate Floating Stardust / Solar Pearls on Outer Orbit */}
        <div
          className="pointer-events-none absolute -inset-3 flex items-center justify-center"
          style={{
            transform: isHovered ? `translate(${tilt.dx * -7}px, ${tilt.dy * -7}px)` : undefined,
            transition: 'transform 0.2s ease-out',
          }}
          aria-hidden="true"
        >
          {Array.from({ length: 12 }).map((_, idx) => {
            const angle = (idx * 30 * Math.PI) / 180;
            const radius = isHovered ? 154 : 148;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <div
                key={`pearl-${idx}`}
                style={{ transform: `translate(${x}px, ${y}px)` }}
                className="absolute"
              >
                <span
                  style={{ animationDelay: `${(idx * 0.25) % 2.4}s` }}
                  className={`block rounded-full animate-ember-spark ${
                    isNightMoon
                      ? idx % 2 === 0
                        ? 'h-1.5 w-1.5 bg-cyan-100 shadow-[0_0_8px_#38bdf8,0_0_14px_#fff]'
                        : 'h-1 w-1 bg-purple-200 shadow-[0_0_8px_#c084fc]'
                      : idx % 2 === 0
                      ? 'h-1.5 w-1.5 bg-yellow-100 shadow-[0_0_8px_#fde047,0_0_14px_#f97316]'
                      : 'h-1 w-1 bg-amber-300 shadow-[0_0_8px_#f59e0b]'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* ================================================================== */}
        {/* LAYER 1: SCULPTED CELESTIAL CROWN                                  */}
        {/* - DAY (SUN): Art-Nouveau Calligraphic Solar Flames & Golden Rays   */}
        {/* - NIGHT (MOON): Royal Filigree Crescent Moon & Starlight Crown     */}
        {/* ================================================================== */}
        {!isNightMoon ? (
          <>
            {/* DAY MODE 1A: CALLIGRAPHIC SOLAR CORONA & 24K GOLD SUNBURST RAYS */}
            <div
              className={`pointer-events-none absolute -inset-3 sm:-inset-4 transition-transform duration-500 ${
                isHovered ? 'animate-solar-roil-fast' : 'animate-solar-roil'
              }`}
              style={{
                transform: isHovered ? `translate(${tilt.dx * -5}px, ${tilt.dy * -5}px) scale(1.04)` : undefined,
              }}
            >
              <svg viewBox="0 0 360 360" className="h-full w-full overflow-visible">
                <defs>
                  {/* 24K Luxury Metallic Gold & Solar Fire Gradient */}
                  <linearGradient id="luxurySolarGold" x1="50%" y1="100%" x2="50%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="25%" stopColor="#FEF08A" />
                    <stop offset="60%" stopColor="#F59E0B" />
                    <stop offset="90%" stopColor="#EA580C" />
                    <stop offset="100%" stopColor="#9A3412" stopOpacity="0.8" />
                  </linearGradient>

                  {/* Soft Rose-Gold & Amber Ribbon Flame Gradient */}
                  <linearGradient id="silkFlameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
                    <stop offset="0%" stopColor="#FFFBEB" />
                    <stop offset="35%" stopColor="#FDE047" />
                    <stop offset="75%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity="0.65" />
                  </linearGradient>

                  <filter id="aestheticSunGlow" x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation={isHovered ? '3.2' : '1.8'} result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* 72 Ultra-Fine Hairline Golden Sunbeams (Haute Horlogerie Sunburst Halo) */}
                {Array.from({ length: 72 }).map((_, i) => {
                  const angle = (i * 5 * Math.PI) / 180;
                  const r1 = 132;
                  const r2 = i % 6 === 0 ? (isHovered ? 168 : 162) : i % 2 === 0 ? 152 : 144;
                  return (
                    <line
                      key={`beam-${i}`}
                      x1={180 + r1 * Math.cos(angle)}
                      y1={180 + r1 * Math.sin(angle)}
                      x2={180 + r2 * Math.cos(angle)}
                      y2={180 + r2 * Math.sin(angle)}
                      stroke="url(#luxurySolarGold)"
                      strokeWidth={i % 6 === 0 ? '1.3' : '0.65'}
                      opacity={i % 6 === 0 ? '0.9' : '0.45'}
                    />
                  );
                })}

                {/* 24 Graceful S-Curved Calligraphic Solar Flame Ribbons */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const deg = i * 15;
                  const isMajor = i % 2 === 0;
                  const h = isMajor ? (isHovered ? 38 : 31) : isHovered ? 27 : 21;
                  const w = isMajor ? 9.5 : 6.8;

                  return (
                    <g key={`silk-flame-${i}`} transform={`rotate(${deg} 180 180)`}>
                      {/* Outer Silk Flame Curve */}
                      <path
                        d={`M ${180 - w} 48
                            C ${180 - w * 1.15} ${48 - h * 0.42},
                              ${180 + w * 0.85} ${48 - h * 0.72},
                              180 ${48 - h}
                            C ${180 + w * 1.15} ${48 - h * 0.52},
                              ${180 + w * 0.35} ${48 - h * 0.22},
                              ${180 + w} 48 Z`}
                        fill={isMajor ? 'url(#luxurySolarGold)' : 'url(#silkFlameGrad)'}
                        filter="url(#aestheticSunGlow)"
                        opacity={isMajor ? 0.95 : 0.8}
                      />
                      {/* Inner White-Gold Filigree Spine */}
                      {isMajor && (
                        <path
                          d={`M ${180 - 3.5} 49
                              Q ${180 - 2} ${49 - h * 0.5} 180 ${49 - h * 0.72}
                              Q ${180 + 2.5} ${49 - h * 0.42} ${180 + 3.5} 49 Z`}
                          fill="#FFFFFF"
                          opacity="0.92"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Counter-Wave Corona Lace Ring */}
                <circle
                  cx="180"
                  cy="180"
                  r="134"
                  fill="none"
                  stroke="url(#luxurySolarGold)"
                  strokeWidth={isHovered ? '3.5' : '2.5'}
                  filter="url(#aestheticSunGlow)"
                />
              </svg>
            </div>

            {/* DAY MODE 1B: COUNTER-ROTATING GOLDEN CORONA PETALS */}
            <div
              className="pointer-events-none absolute -inset-2 sm:-inset-3 animate-celestial-spin-reverse"
              style={{ animationDuration: isHovered ? '18s' : '45s' }}
            >
              <svg viewBox="0 0 350 350" className="h-full w-full overflow-visible">
                {Array.from({ length: 36 }).map((_, i) => {
                  const deg = i * 10 + 5;
                  const h = i % 2 === 0 ? (isHovered ? 22 : 16) : 11;
                  return (
                    <g key={`petal-${i}`} transform={`rotate(${deg} 175 175)`}>
                      <path
                        d={`M 170 43 Q 173 ${43 - h * 0.65} 175 ${43 - h} Q 179 ${43 - h * 0.5} 180 43 Z`}
                        fill="url(#luxurySolarGold)"
                        opacity={isHovered ? 0.85 : 0.65}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </>
        ) : (
          <>
            {/* ============================================================== */}
            {/* NIGHT MODE 1A: SCULPTED BAROQUE CRESCENT MOON & AURORA HALO    */}
            {/* ============================================================== */}
            <div
              className={`pointer-events-none absolute -inset-3 sm:-inset-4 transition-transform duration-500 ${
                isHovered ? 'animate-lunar-roil-fast' : 'animate-lunar-roil'
              }`}
              style={{
                transform: isHovered ? `translate(${tilt.dx * -5}px, ${tilt.dy * -5}px) scale(1.04)` : undefined,
              }}
            >
              <svg viewBox="0 0 360 360" className="h-full w-full overflow-visible">
                <defs>
                  {/* Pearl-Silver, Ice-Cyan & Champagne Crescent Gradient */}
                  <linearGradient id="aestheticLunarCrescent" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="28%" stopColor="#E0F2FE" />
                    <stop offset="62%" stopColor="#7DD3FC" />
                    <stop offset="88%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#C084FC" />
                  </linearGradient>

                  {/* Champagne-Gold & Silver Filigree Trim */}
                  <linearGradient id="champagneGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFBEB" />
                    <stop offset="50%" stopColor="#FDE68A" />
                    <stop offset="100%" stopColor="#7DD3FC" />
                  </linearGradient>

                  {/* Gossamer Aurora Wisp Gradient */}
                  <linearGradient id="auroraSilkGrad" x1="50%" y1="100%" x2="50%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor="#7DD3FC" />
                    <stop offset="75%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#C084FC" stopOpacity="0.6" />
                  </linearGradient>

                  <filter id="aestheticMoonGlow" x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation={isHovered ? '3.2' : '1.8'} result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Elegant Crescent Moon Mask */}
                  <mask id="baroqueCrescentMask">
                    <rect x="0" y="0" width="360" height="360" fill="black" />
                    <circle cx="168" cy="180" r="154" fill="white" />
                    <circle cx="204" cy="166" r="135" fill="black" />
                  </mask>
                </defs>

                {/* 48 Fine Silver Starlight Rays */}
                {Array.from({ length: 48 }).map((_, i) => {
                  const angle = (i * 7.5 * Math.PI) / 180;
                  const r1 = 132;
                  const r2 = i % 4 === 0 ? 154 : 142;
                  return (
                    <line
                      key={`lunar-ray-${i}`}
                      x1={180 + r1 * Math.cos(angle)}
                      y1={180 + r1 * Math.sin(angle)}
                      x2={180 + r2 * Math.cos(angle)}
                      y2={180 + r2 * Math.sin(angle)}
                      stroke="url(#aestheticLunarCrescent)"
                      strokeWidth={i % 4 === 0 ? '1' : '0.5'}
                      opacity={i % 4 === 0 ? '0.7' : '0.35'}
                    />
                  );
                })}

                {/* 24 Gossamer Aurora Moonfire Ribbons */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const deg = i * 15;
                  const isMajor = i % 2 === 0;
                  const h = isMajor ? (isHovered ? 32 : 24) : isHovered ? 22 : 16;
                  const w = isMajor ? 8.5 : 6;

                  return (
                    <g key={`aurora-ribbon-${i}`} transform={`rotate(${deg} 180 180)`}>
                      <path
                        d={`M ${180 - w} 48
                            C ${180 - w * 0.9} ${48 - h * 0.45},
                              ${180 + w * 0.75} ${48 - h * 0.75},
                              180 ${48 - h}
                            C ${180 + w} ${48 - h * 0.5},
                              ${180 + w * 0.4} ${48 - h * 0.22},
                              ${180 + w} 48 Z`}
                        fill="url(#auroraSilkGrad)"
                        filter="url(#aestheticMoonGlow)"
                        opacity={isMajor ? 0.85 : 0.6}
                      />
                    </g>
                  );
                })}

                {/* Sculpted Baroque Crescent Moon Body */}
                <g mask="url(#baroqueCrescentMask)" filter="url(#aestheticMoonGlow)">
                  <circle
                    cx="168"
                    cy="180"
                    r="154"
                    fill="url(#aestheticLunarCrescent)"
                    opacity={isHovered ? '0.96' : '0.88'}
                  />
                  {/* Delicate Filigree Lace Arc inside Crescent */}
                  <circle
                    cx="168"
                    cy="180"
                    r="146"
                    fill="none"
                    stroke="url(#champagneGoldTrim)"
                    strokeWidth="1.2"
                    strokeDasharray="5 3"
                    opacity="0.85"
                  />
                  <circle
                    cx="168"
                    cy="180"
                    r="152.5"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </g>

                {/* Dangling Starlight Jewel from Upper Crescent Horn */}
                <g transform="translate(108, 32)" filter="url(#aestheticMoonGlow)">
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="16"
                    stroke="#FDE68A"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <path
                    d="M 0 10 L 2.5 18 L 10 20.5 L 2.5 23 L 0 31 L -2.5 23 L -10 20.5 L -2.5 18 Z"
                    fill="url(#champagneGoldTrim)"
                  />
                  <circle cx="0" cy="20.5" r="2" fill="#FFFFFF" />
                </g>
              </svg>
            </div>
          </>
        )}

        {/* ================================================================== */}
        {/* LAYER 2: SACRED ASTROLABE & ZODIAC FILIGREE RING                   */}
        {/* ================================================================== */}
        <div
          className="pointer-events-none absolute inset-3 sm:inset-3.5 animate-celestial-spin"
          style={{
            animationDuration: isHovered ? '16s' : '45s',
            transform: isHovered ? `translate(${tilt.dx * 3}px, ${tilt.dy * 3}px)` : undefined,
          }}
        >
          <svg viewBox="0 0 300 300" className="h-full w-full">
            <defs>
              <linearGradient id="horologyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="35%" stopColor="#FDE047" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#FEF08A" />
              </linearGradient>
              <linearGradient id="horologySilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#BAE6FD" />
                <stop offset="75%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#F8FAFC" />
              </linearGradient>
            </defs>

            {/* Outer Double Bezel Ring */}
            <circle
              cx="150"
              cy="150"
              r="143"
              fill="none"
              stroke={isNightMoon ? 'url(#horologySilver)' : 'url(#horologyGold)'}
              strokeWidth="1.8"
            />
            <circle
              cx="150"
              cy="150"
              r="137"
              fill="none"
              stroke={isNightMoon ? '#7DD3FC' : '#FDE047'}
              strokeWidth="0.8"
              strokeDasharray="4 3"
              opacity="0.8"
            />

            {/* FineSacred Octagram Filigree Lines */}
            <rect
              x="54"
              y="54"
              width="192"
              height="192"
              fill="none"
              stroke={isNightMoon ? 'url(#horologySilver)' : 'url(#horologyGold)'}
              strokeWidth="0.85"
              opacity={isHovered ? '0.75' : '0.42'}
            />
            <rect
              x="54"
              y="54"
              width="192"
              height="192"
              transform="rotate(45 150 150)"
              fill="none"
              stroke={isNightMoon ? 'url(#horologySilver)' : 'url(#horologyGold)'}
              strokeWidth="0.85"
              opacity={isHovered ? '0.75' : '0.42'}
            />

            {/* 4 Cardinal Royal Compass Finials (12, 3, 6, 9 o'clock) */}
            {[0, 90, 180, 270].map((deg, idx) => (
              <g key={`cardinal-${idx}`} transform={`rotate(${deg} 150 150)`}>
                <polygon
                  points="150,2 145,12 150,9 155,12"
                  fill={isNightMoon ? 'url(#horologySilver)' : 'url(#horologyGold)'}
                />
                <circle
                  cx="150"
                  cy="7"
                  r="2.2"
                  fill={isNightMoon ? '#38BDF8' : '#F97316'}
                  stroke="#FFFFFF"
                  strokeWidth="0.7"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* ================================================================== */}
        {/* LAYER 3: COUNTER-ROTATING ZODIAC RUNE BAND                         */}
        {/* ================================================================== */}
        <div
          className="pointer-events-none absolute inset-6 sm:inset-7 animate-celestial-spin-reverse"
          style={{ animationDuration: isHovered ? '12s' : '32s' }}
        >
          <svg viewBox="0 0 260 260" className="h-full w-full">
            <circle
              cx="130"
              cy="130"
              r="122"
              fill="none"
              stroke={isNightMoon ? '#BAE6FD' : '#FDE68A'}
              strokeWidth="0.9"
              opacity="0.75"
            />
            <circle
              cx="130"
              cy="130"
              r="109"
              fill="none"
              stroke={isNightMoon ? '#38BDF8' : '#D97706'}
              strokeWidth="1.2"
              opacity="0.85"
            />

            {/* 12 Zodiac & Celestial Sigils */}
            {(isNightMoon ? LUNAR_SIGILS : ARCANE_SIGILS).map((sigil, idx) => {
              const angle = (idx * 30 * Math.PI) / 180;
              const r = 115.5;
              const x = 130 + r * Math.cos(angle);
              const y = 130 + r * Math.sin(angle);
              return (
                <text
                  key={idx}
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                  fill={isHovered ? '#FFFFFF' : isNightMoon ? '#E0F2FE' : '#FDE047'}
                  fontSize="9.5"
                  fontFamily="Cinzel, serif"
                  fontWeight="bold"
                  opacity="0.9"
                >
                  {sigil}
                </text>
              );
            })}
          </svg>
        </div>

        {/* ================================================================== */}
        {/* LAYER 4: HAUTE HORLOGERIE SAPPHIRE DIAL FACE                       */}
        {/* (Guilloché Rosette + 12 Roman Numerals + Smooth Seconds Arc)       */}
        {/* ================================================================== */}
        <div
          style={{
            transform: isHovered ? `translate(${tilt.dx * 6}px, ${tilt.dy * 6}px)` : undefined,
            transition: 'transform 0.15s ease-out',
            background: isNightMoon
              ? isHovered
                ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(56,189,248,0.34) 0%, rgba(12,21,46,0.97) 52%, rgba(4,8,20,0.99) 100%)`
                : 'radial-gradient(circle at 50% 30%, rgba(56,189,248,0.22) 0%, rgba(10,18,40,0.97) 58%, rgba(3,7,18,0.99) 100%)'
              : isHovered
              ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(245,158,11,0.32) 0%, rgba(14,25,52,0.97) 52%, rgba(4,9,22,0.99) 100%)`
              : 'radial-gradient(circle at 50% 30%, rgba(217,119,6,0.20) 0%, rgba(11,21,46,0.97) 58%, rgba(3,8,20,0.99) 100%)',
          }}
          className={`relative flex h-[202px] w-[202px] sm:h-[218px] sm:w-[218px] flex-col items-center justify-center rounded-full border-[2px] p-4 text-center backdrop-blur-xl transition-all duration-300 overflow-hidden ${
            isNightMoon
              ? isHovered
                ? 'border-cyan-100 shadow-[0_0_50px_rgba(56,189,248,0.8),inset_0_0_30px_rgba(56,189,248,0.35)]'
                : 'border-cyan-300/85 shadow-[0_0_36px_rgba(56,189,248,0.45),inset_0_0_24px_rgba(56,189,248,0.2)]'
              : isHovered
              ? 'border-[#FFFBEB] shadow-[0_0_50px_rgba(249,115,22,0.8),inset_0_0_30px_rgba(253,224,71,0.38)]'
              : 'border-[#D4AF37] shadow-[0_0_36px_rgba(234,88,12,0.45),inset_0_0_24px_rgba(212,175,55,0.22)]'
          }`}
        >
          {/* Specular Sapphire Crystal Glint Reflection */}
          <div
            style={{
              transform: `translate(${(tilt.gx - 50) * 0.5}%, ${(tilt.gy - 50) * 0.5}%) rotate(-35deg)`,
            }}
            className="pointer-events-none absolute -top-1/2 -left-1/4 h-[180%] w-1/2 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-transform duration-150"
            aria-hidden="true"
          />

          {/* Intricate SVG Horological Dial: Guilloché + Roman Chapter Ring + Seconds Arc + Hands */}
          <svg
            viewBox="0 0 210 210"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="dialProgressSun" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="50%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
              <linearGradient id="dialProgressMoon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>

            {/* Guilloché Spirograph Rosette Etching in Dial Center */}
            <g opacity={isHovered ? '0.24' : '0.14'}>
              {[0, 30, 60, 90, 120, 150].map(deg => (
                <ellipse
                  key={`guilloche-${deg}`}
                  cx="105"
                  cy="105"
                  rx="62"
                  ry="26"
                  transform={`rotate(${deg} 105 105)`}
                  fill="none"
                  stroke={isNightMoon ? '#7DD3FC' : '#FDE047'}
                  strokeWidth="0.7"
                />
              ))}
            </g>

            {/* Track Circle for Seconds Progress */}
            <circle
              cx="105"
              cy="105"
              r="96"
              fill="none"
              stroke={isNightMoon ? 'rgba(125,211,252,0.18)' : 'rgba(253,224,71,0.18)'}
              strokeWidth="1.5"
            />

            {/* Smooth Luminous Seconds Progress Arc (0 to 60s) */}
            <circle
              cx="105"
              cy="105"
              r="92"
              fill="none"
              stroke={isNightMoon ? 'url(#dialProgressMoon)' : 'url(#dialProgressSun)'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray={progressCircumference}
              strokeDashoffset={progressOffset}
              transform="rotate(-90 105 105)"
              className="transition-all duration-700 ease-out"
            />

            {/* 60 Diamond-Cut Minute Pearls */}
            {Array.from({ length: 60 }).map((_, i) => {
              const rad = ((i * 6 - 90) * Math.PI) / 180;
              const isHour = i % 5 === 0;
              const r = 98;
              return (
                <circle
                  key={`min-dot-${i}`}
                  cx={105 + r * Math.cos(rad)}
                  cy={105 + r * Math.sin(rad)}
                  r={isHour ? '1.5' : '0.65'}
                  fill={
                    isHour
                      ? isNightMoon
                        ? '#E0F2FE'
                        : '#FFFBEB'
                      : isNightMoon
                      ? '#38BDF8'
                      : '#F59E0B'
                  }
                  opacity={isHour ? '0.95' : '0.45'}
                />
              );
            })}

            {/* Full 12 Roman Numeral Chapter Ring (XII, I, II ... XI) */}
            {ROMAN_NUMERALS.map((numeral, idx) => {
              const deg = idx * 30;
              const rad = ((deg - 90) * Math.PI) / 180;
              const r = 80;
              const x = 105 + r * Math.cos(rad);
              const y = 105 + r * Math.sin(rad);
              const isCardinal = idx % 3 === 0;
              return (
                <text
                  key={numeral}
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fill={
                    isCardinal
                      ? '#FFFFFF'
                      : isNightMoon
                      ? '#BAE6FD'
                      : '#FDE68A'
                  }
                  fontSize={isCardinal ? '9.5' : '7.5'}
                  fontFamily="'Cinzel', Georgia, serif"
                  fontWeight={isCardinal ? '900' : '700'}
                  opacity={isCardinal ? '0.9' : '0.6'}
                >
                  {numeral}
                </text>
              );
            })}

            {/* Breguet-Style Luminous Analog Hour Hand */}
            <g transform={`rotate(${hourHandAngle} 105 105)`} opacity={isHovered ? '0.7' : '0.45'}>
              <path
                d="M 105 46 L 101.5 105 L 105 116 L 108.5 105 Z"
                fill={isNightMoon ? 'url(#dialProgressMoon)' : 'url(#dialProgressSun)'}
              />
              <circle
                cx="105"
                cy="60"
                r="3.2"
                fill="#071024"
                stroke={isNightMoon ? '#7DD3FC' : '#FDE047'}
                strokeWidth="1.2"
              />
            </g>

            {/* Cathedral-Style Luminous Analog Minute Hand */}
            <g transform={`rotate(${minuteHandAngle} 105 105)`} opacity={isHovered ? '0.8' : '0.52'}>
              <path
                d="M 105 26 L 102.5 105 L 105 118 L 107.5 105 Z"
                fill="#FFFFFF"
              />
            </g>

            {/* Sweeping Needle Second Hand with Orbital Star Tip */}
            <g
              transform={`rotate(${secondAngle} 105 105)`}
              className="transition-transform duration-700 ease-out"
              opacity={isHovered ? '0.95' : '0.75'}
            >
              <line
                x1="105"
                y1="124"
                x2="105"
                y2="14"
                stroke={isNightMoon ? '#38BDF8' : '#FDE047'}
                strokeWidth="1.1"
              />
              <circle
                cx="105"
                cy="13"
                r="3"
                fill="#FFFFFF"
                stroke={isNightMoon ? '#38BDF8' : '#F97316'}
                strokeWidth="1.5"
              />
            </g>
          </svg>

          {/* ================================================================ */}
          {/* CENTER FLOATING HOROLOGICAL CARTOUCHE (Crystal-Clear Readout)    */}
          {/* ================================================================ */}
          <div className="relative z-10 flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl bg-[#050C1D]/75 border border-white/10 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.65)]">
            {/* Top Celestial Crown Kicker */}
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <span
                className={`h-[1px] w-3 bg-gradient-to-r from-transparent ${
                  isNightMoon ? 'to-cyan-300' : 'to-amber-300'
                }`}
              />
              <span
                className={`text-[7.5px] font-black tracking-[0.24em] uppercase ${
                  isNightMoon ? 'text-cyan-200' : 'text-amber-200'
                }`}
                style={{ fontFamily: "'Cinzel', Georgia, serif" }}
              >
                {isNightMoon ? 'LUNA CELESTIA' : 'SOL AURELIA'}
              </span>
              <span
                className={`h-[1px] w-3 bg-gradient-to-l from-transparent ${
                  isNightMoon ? 'to-cyan-300' : 'to-amber-300'
                }`}
              />
            </div>

            {/* Primary Luxury Time Numerals */}
            <div
              className={`flex items-baseline justify-center transition-transform duration-300 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
            >
              <span
                className="font-black text-2xl sm:text-[29px] tracking-wider text-white leading-none"
                style={{
                  fontFamily: "'Cinzel', 'JetBrains Mono', monospace",
                  textShadow: isNightMoon
                    ? '0 0 16px rgba(56,189,248,0.85), 0 2px 4px rgba(0,0,0,0.9)'
                    : '0 0 16px rgba(251,191,36,0.85), 0 2px 4px rgba(0,0,0,0.9)',
                }}
              >
                {hours}
                <span
                  className={`mx-0.5 animate-pulse ${
                    isNightMoon ? 'text-cyan-300' : 'text-[#FDE047]'
                  }`}
                >
                  :
                </span>
                {minutes}
              </span>
              <span
                className={`ml-1 font-mono text-xs sm:text-sm font-extrabold ${
                  isNightMoon ? 'text-cyan-300' : 'text-amber-300'
                }`}
              >
                {seconds}
              </span>
            </div>

            {/* Day & Date Subtitle */}
            <div className="mt-1 flex items-center gap-1.5 text-[9.5px] font-semibold tracking-wide text-slate-200">
              <span
                className="font-bold text-white"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {dayName},
              </span>
              <span className={isNightMoon ? 'text-cyan-100/90' : 'text-amber-100/90'}>
                {dateFormatted}
              </span>
            </div>
          </div>

          {/* ================================================================ */}
          {/* EXPOSED CELESTIAL TOURBILLON CAGE AT 6 O'CLOCK                   */}
          {/* ================================================================ */}
          <div className="relative z-10 mt-1.5 flex flex-col items-center">
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-[#030816]/90 shadow-inner">
              <svg
                viewBox="0 0 24 24"
                className={`h-4.5 w-4.5 animate-celestial-spin ${
                  isNightMoon ? 'text-cyan-300' : 'text-[#FDE047]'
                }`}
                style={{ animationDuration: isHovered ? '4s' : '12s' }}
                fill="currentColor"
              >
                <path d="M12 1L13.8 8.2L21 6.5L15.8 12L21 17.5L13.8 15.8L12 23L10.2 15.8L3 17.5L8.2 12L3 6.5L10.2 8.2L12 1Z" />
              </svg>
              <span className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* FLOATING STATUS PILL & DIURNAL MODE SWITCHER                         */}
      {/* ==================================================================== */}
      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
        <div
          className={`flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold backdrop-blur-md transition-all duration-300 border ${
            isHovered
              ? isNightMoon
                ? 'border-cyan-300 bg-gradient-to-r from-cyan-500/30 via-indigo-500/25 to-purple-500/30 text-cyan-100 shadow-[0_0_24px_rgba(56,189,248,0.5)] scale-105'
                : 'border-amber-300 bg-gradient-to-r from-orange-500/30 via-amber-500/25 to-orange-500/30 text-amber-100 shadow-[0_0_24px_rgba(249,115,22,0.5)] scale-105'
              : sessionInfo.color
          }`}
        >
          <SessionIcon className="h-3.5 w-3.5 animate-spin-slow shrink-0" />
          <span className="text-[11px] tracking-wide font-medium">{sessionInfo.label}</span>
        </div>

        {/* Diurnal Cycle Switcher: Auto (Default) / Sun (Pagi) / Moon (Malam) */}
        <button
          type="button"
          onClick={() => {
            setCelestialOverride(prev =>
              prev === 'auto' ? (isNaturalNight ? 'sun' : 'moon') : prev === 'moon' ? 'sun' : 'auto'
            );
            setNovaBurstKey(prev => prev + 1);
          }}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-md border transition-all cursor-pointer ${
            isNightMoon
              ? 'border-cyan-400/50 bg-slate-900/80 text-cyan-200 hover:bg-cyan-950/80 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
              : 'border-amber-400/50 bg-slate-900/80 text-amber-200 hover:bg-amber-950/80 shadow-[0_0_12px_rgba(249,115,22,0.25)]'
          }`}
          title="Otomatis mengikuti waktu Pagi (Matahari) & Malam (Bulan). Klik untuk melihat pratinjau pergantian wujud."
        >
          {isNightMoon ? (
            <>
              <Moon className="h-3 w-3 text-cyan-300" />
              <span>{celestialOverride === 'auto' ? 'Malam (Otomatis)' : 'Wujud Bulan'}</span>
            </>
          ) : (
            <>
              <Sun className="h-3 w-3 text-amber-300" />
              <span>{celestialOverride === 'auto' ? 'Pagi/Siang (Otomatis)' : 'Wujud Matahari'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
