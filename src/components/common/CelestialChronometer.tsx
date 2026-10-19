import React, { useState, useEffect, useMemo } from 'react';
import { Compass, Sparkles, Sun, Moon, Clock, Calendar } from 'lucide-react';

export interface CelestialChronometerProps {
  className?: string;
  compact?: boolean;
}

export const CelestialChronometer: React.FC<CelestialChronometerProps> = ({
  className = '',
  compact = false,
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const currentSeconds = time.getSeconds();
  const currentMinutes = time.getHours() * 60 + time.getMinutes();
  const currentMillis = time.getMilliseconds();

  // Orbital angles for planetary beads & comets
  // Smooth second angle
  const secondAngle = (currentSeconds / 60) * 360;
  // Fractional minute orbit angle (0 to 360)
  const minuteAngle = ((currentMinutes % 60) / 60) * 360;
  // Solar/Lunar diurnal orbit angle (24-hour cycle)
  const diurnalAngle = ((time.getHours() * 3600 + time.getMinutes() * 60 + currentSeconds) / 86400) * 360;

  // Indonesian Date Formatting
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const dayName = days[time.getDay()];
  const dateFormatted = `${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`;

  // Academic Session Status calculation
  const sessionInfo = useMemo(() => {
    if (currentMinutes >= 420 && currentMinutes < 570) {
      return {
        label: 'KBM Sesi Pagi (07.00 - 09.30)',
        tag: 'KBM AKTIF',
        icon: Sun,
        color: 'text-amber-300 border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 shadow-[0_0_16px_rgba(251,191,36,0.4)]',
      };
    } else if (currentMinutes >= 570 && currentMinutes < 600) {
      return {
        label: 'Istirahat Pagi (09.30 - 10.00)',
        tag: 'ISTIRAHAT',
        icon: Sparkles,
        color: 'text-emerald-300 border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-600/20 shadow-[0_0_16px_rgba(52,211,153,0.4)]',
      };
    } else if (currentMinutes >= 600 && currentMinutes < 720) {
      return {
        label: 'KBM Sesi Siang (10.00 - 12.00)',
        tag: 'KBM AKTIF',
        icon: Sun,
        color: 'text-cyan-300 border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-blue-600/20 shadow-[0_0_16px_rgba(34,211,238,0.4)]',
      };
    } else if (currentMinutes >= 720 && currentMinutes < 780) {
      return {
        label: 'Istirahat & Ishoma (12.00 - 13.00)',
        tag: 'ISHOMA',
        icon: Moon,
        color: 'text-emerald-300 border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-600/20 shadow-[0_0_16px_rgba(52,211,153,0.4)]',
      };
    } else if (currentMinutes >= 780 && currentMinutes < 930) {
      return {
        label: 'KBM Sesi Sore (13.00 - 15.30)',
        tag: 'KBM AKTIF',
        icon: Sun,
        color: 'text-indigo-300 border-indigo-400/50 bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-indigo-600/20 shadow-[0_0_16px_rgba(129,140,248,0.4)]',
      };
    }
    return {
      label: 'Di Luar Jam Efektif KBM',
      tag: 'STANDBY',
      icon: Moon,
      color: 'text-slate-300 border-slate-600/50 bg-slate-900/40 shadow-none',
    };
  }, [currentMinutes]);

  const SessionIcon = sessionInfo.icon;

  // COMPACT MOBILE VIEW (Unboxed floating ethereal celestial ring & pill with mana aura)
  if (compact) {
    return (
      <div
        className={`relative flex items-center justify-between gap-3 px-4 py-2 rounded-full border border-[#D4AF37]/70 bg-gradient-to-r from-[#0F1E3A]/90 via-[#0B1528]/95 to-[#0F1E3A]/90 backdrop-blur-md shadow-[0_0_24px_rgba(212,175,55,0.35)] animate-astral-float ${className}`}
      >
        {/* Shimmer glint across the unboxed pill */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent animate-glint-sweep" />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-amber-400/25 animate-ping opacity-60" />
            <span className="absolute -inset-1 rounded-full border border-dashed border-amber-300/40 animate-celestial-spin" />
            <Compass className="h-4 w-4 text-amber-400 animate-celestial-spin" />
          </div>
          <span
            className="font-mono text-sm font-black tracking-wider text-amber-300 animate-mana-flicker"
            style={{ fontFamily: "'Cinzel', 'JetBrains Mono', monospace" }}
          >
            {hours}:{minutes}
            <span className="text-amber-400/70">:{seconds}</span>
            <span className="ml-1 text-[10px] text-amber-400 font-bold">WIB</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
          <Calendar className="h-3 w-3 text-cyan-400 animate-pulse" />
          <span className="truncate">{dayName}, {dateFormatted}</span>
        </div>
      </div>
    );
  }

  // DESKTOP & STANDARD VIEW:
  // UNBOXED CELESTIAL ASTROLABE (NO SQUARE BOX, FREE-FLOATING, MESMERIZING ANIMATION EFFECTS)
  return (
    <div
      className={`relative flex flex-col items-center justify-center py-2 select-none ${className}`}
      aria-label="Celestial Chronometer Waktu Resmi Akademi"
    >
      {/* Dynamic Ambient Mana Nebula Pulsing Behind Astrolabe */}
      <div className="pointer-events-none absolute h-80 w-80 rounded-full bg-gradient-to-tr from-amber-500/20 via-sky-600/20 to-purple-600/20 blur-3xl animate-magical-glow" />
      <div className="pointer-events-none absolute h-60 w-60 rounded-full bg-amber-400/10 blur-2xl animate-celestial-orb" />

      {/* Floating Astrolabe Spherical System (Zero box, completely circular & ethereal) */}
      <div className="relative flex h-[290px] w-[290px] sm:h-[320px] sm:w-[320px] items-center justify-center animate-astral-float">
        
        {/* Layer 0: Concentric Expanding Mana Ripple Rings radiating outward */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div className="absolute h-48 w-48 rounded-full border border-amber-400/30 animate-mana-ripple" />
          <div
            className="absolute h-48 w-48 rounded-full border border-cyan-400/25 animate-mana-ripple"
            style={{ animationDelay: '1.5s' }}
          />
        </div>

        {/* Layer 1: Outermost Rotating Astrolabe & Zodiac Constellation Ring (Clockwise) */}
        <div className="pointer-events-none absolute inset-0 animate-celestial-spin-slow">
          <svg viewBox="0 0 320 320" className="h-full w-full drop-shadow-[0_0_14px_rgba(212,175,55,0.45)]">
            <defs>
              <linearGradient id="astroGoldGleam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="35%" stopColor="#FDE047" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#FEF08A" />
              </linearGradient>
            </defs>

            {/* Outermost Perimeter Ring */}
            <circle
              cx="160"
              cy="160"
              r="154"
              fill="none"
              stroke="url(#astroGoldGleam)"
              strokeWidth="1.4"
              strokeDasharray="6 4"
              opacity="0.9"
            />
            <circle
              cx="160"
              cy="160"
              r="146"
              fill="none"
              stroke="url(#astroGoldGleam)"
              strokeWidth="0.8"
              opacity="0.5"
            />

            {/* 60 Minute/Second Radial Dial Ticks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i * 6 * Math.PI) / 180;
              const isMajor = i % 5 === 0;
              const r1 = isMajor ? 140 : 147;
              const r2 = 154;
              const x1 = 160 + r1 * Math.cos(angle);
              const y1 = 160 + r1 * Math.sin(angle);
              const x2 = 160 + r2 * Math.cos(angle);
              const y2 = 160 + r2 * Math.sin(angle);

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#astroGoldGleam)"
                  strokeWidth={isMajor ? 1.8 : 0.8}
                  opacity={isMajor ? 1 : 0.45}
                />
              );
            })}

            {/* 12 Zodiac / Cardinal Constellation Star Nodes */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const r = 133;
              const cx = 160 + r * Math.cos(angle);
              const cy = 160 + r * Math.sin(angle);

              return (
                <g key={`star-${i}`} transform={`translate(${cx}, ${cy})`}>
                  <circle cx="0" cy="0" r="1.8" fill="#FFFBEB" />
                  <circle
                    cx="0"
                    cy="0"
                    r="3.5"
                    fill="none"
                    stroke="url(#astroGoldGleam)"
                    strokeWidth="0.7"
                    opacity="0.8"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Layer 2: Counter-Rotating Arcane Magic Glyph Ring (Counter-Clockwise) */}
        <div className="pointer-events-none absolute inset-3 sm:inset-4 animate-celestial-spin-reverse">
          <svg viewBox="0 0 290 290" className="h-full w-full">
            <circle
              cx="145"
              cy="145"
              r="124"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="1"
              strokeDasharray="4 6"
              opacity="0.65"
            />
            <circle
              cx="145"
              cy="145"
              r="112"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.3"
              opacity="0.75"
            />

            {/* 8 Arcane Magical Sigils & Celestial Runes along the Ring */}
            {['✦', '᚛', '☼', '☽', '✧', '⚝', '✵', '᚜'].map((rune, idx) => {
              const angle = (idx * 45 * Math.PI) / 180;
              const r = 118;
              const x = 145 + r * Math.cos(angle);
              const y = 145 + r * Math.sin(angle);
              return (
                <text
                  key={idx}
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                  fill="#FDE047"
                  fontSize="11"
                  fontFamily="serif"
                  fontWeight="bold"
                  opacity="0.9"
                  className="drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]"
                >
                  {rune}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Layer 3: Secondary Orbital Diurnal Sun/Moon Indicator */}
        <div
          className="pointer-events-none absolute inset-0 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${diurnalAngle}deg)` }}
        >
          <div className="absolute top-[16px] left-1/2 -translate-x-1/2 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#38bdf8] animate-ping" />
          </div>
        </div>

        {/* Layer 4: Orbital Seconds Comet with Radiant Starlight Tail */}
        <div
          className="pointer-events-none absolute inset-0 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${secondAngle}deg)` }}
        >
          {/* Orbital glowing star bead that sweeps 360 deg */}
          <div className="absolute top-[2px] sm:top-[3px] left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Comet Starlight Head with Intense Glow */}
            <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-r from-white via-amber-200 to-amber-400 shadow-[0_0_16px_rgba(253,224,71,1),0_0_28px_rgba(251,191,36,0.9)] animate-comet-pulse" />
            <div className="-mt-3.5 h-2 w-2 rounded-full bg-white shadow-[0_0_10px_#fff]" />
          </div>
        </div>

        {/* Layer 5: Deep Astral Mirror Core (Zero box, pure circular celestial lens) */}
        <div className="relative flex h-[200px] w-[200px] sm:h-[225px] sm:w-[225px] flex-col items-center justify-center rounded-full border-2 border-[#D4AF37] bg-gradient-to-b from-[#0C1B3E]/95 via-[#071126]/98 to-[#040916]/95 p-4 text-center shadow-[0_0_45px_rgba(11,23,54,0.95),inset_0_0_25px_rgba(212,175,55,0.3)] backdrop-blur-xl">
          
          {/* Subtle Inner Concentric Filigree Rings with Micro Rotation */}
          <div className="pointer-events-none absolute inset-1.5 rounded-full border border-[#FDE68A]/35" />
          <div className="pointer-events-none absolute inset-3 rounded-full border border-dashed border-[#FDE68A]/20 animate-celestial-spin-slow" />

          {/* Top Compass Star Marker with Animated Twinkle */}
          <div className="relative mb-0.5 flex items-center justify-center gap-1.5 text-[#FDE047]">
            <span className="text-[11px] animate-rune-twinkle">✦</span>
            <span
              className="text-[9px] font-black tracking-[0.22em] uppercase text-amber-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              CHRONOMETER AKADEMI
            </span>
            <span className="text-[11px] animate-rune-twinkle" style={{ animationDelay: '1.2s' }}>
              ✦
            </span>
          </div>

          {/* Glowing Digital Time Display with Iridescent Mana Glow */}
          <div className="relative flex items-center justify-center my-0.5">
            <span
              className="font-black text-2xl sm:text-[34px] tracking-tight text-white animate-mana-flicker"
              style={{
                fontFamily: "'Orbitron', 'Cinzel', 'JetBrains Mono', monospace",
              }}
            >
              {hours}
              <span className="animate-pulse text-[#FDE047] mx-0.5">:</span>
              {minutes}
              <span className="animate-pulse text-[#FDE047] mx-0.5">:</span>
              <span className="text-amber-300">{seconds}</span>
            </span>
          </div>

          {/* Timezone Status Indicator with Pulsing Emerald Gem */}
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-ping" />
            <span className="font-mono text-[9px] font-bold text-amber-200 tracking-wider">
              WIB &bull; GMT+7
            </span>
          </div>

          {/* Date in Indonesian with Classical Serif */}
          <div className="mt-1 flex flex-col items-center">
            <span
              className="text-xs font-bold text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', sans-serif" }}
            >
              {dayName}
            </span>
            <span className="text-[10px] text-amber-200/80 font-medium tracking-tight">
              {dateFormatted}
            </span>
          </div>

          {/* Bottom Astrolabe Star Ornament */}
          <div className="mt-1 flex items-center gap-1 text-[#FDE047] opacity-80">
            <span className="h-[1px] w-4 bg-gradient-to-r from-transparent to-[#FDE047]" />
            <span className="text-[8px] animate-pulse">✦</span>
            <span className="h-[1px] w-4 bg-gradient-to-l from-transparent to-[#FDE047]" />
          </div>
        </div>
      </div>

      {/* Layer 6: Unboxed Floating Academic Period Status Pill */}
      <div
        className={`mt-3 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-300 border ${sessionInfo.color} animate-astral-float`}
        style={{ animationDelay: '0.8s' }}
      >
        <SessionIcon className="h-3.5 w-3.5 animate-spin-slow shrink-0" />
        <span className="text-[11px] tracking-wide font-medium">
          {sessionInfo.label}
        </span>
      </div>
    </div>
  );
};
