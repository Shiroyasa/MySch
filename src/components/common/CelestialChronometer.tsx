import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles, Compass } from 'lucide-react';

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
  const secondProgress = (time.getSeconds() / 60) * 100;

  // Indonesian Date Formatting
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[time.getDay()];
  const dateFormatted = `${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`;

  // Academic Session Status calculation
  const currentMinutes = time.getHours() * 60 + time.getMinutes();
  let sessionLabel = 'Di Luar Jam Efektif KBM';
  let sessionColor = 'text-slate-300 border-slate-600/50 bg-slate-800/60';

  if (currentMinutes >= 420 && currentMinutes < 570) {
    sessionLabel = 'KBM Sesi Pagi 🌅 (07.00 - 09.30)';
    sessionColor = 'text-amber-300 border-amber-500/40 bg-amber-500/10';
  } else if (currentMinutes >= 570 && currentMinutes < 600) {
    sessionLabel = 'Istirahat Pagi ☕ (09.30 - 10.00)';
    sessionColor = 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
  } else if (currentMinutes >= 600 && currentMinutes < 720) {
    sessionLabel = 'KBM Sesi Siang ☀️ (10.00 - 12.00)';
    sessionColor = 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10';
  } else if (currentMinutes >= 720 && currentMinutes < 780) {
    sessionLabel = 'Istirahat & Ishoma 🕌 (12.00 - 13.00)';
    sessionColor = 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
  } else if (currentMinutes >= 780 && currentMinutes < 930) {
    sessionLabel = 'KBM Sesi Sore 📚 (13.00 - 15.30)';
    sessionColor = 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10';
  }

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-amber-500/40 bg-[#0F1E3A]/90 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.5)] ${className}`}
      >
        <div className="flex items-center gap-2 text-amber-300">
          <Clock className="w-4 h-4 animate-pulse text-amber-400" />
          <span className="font-mono text-sm font-bold tracking-wider">
            {hours}:{minutes}:{seconds} <span className="text-[10px] text-amber-400/80">WIB</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5 truncate">
          <Calendar className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="truncate">{dayName}, {dateFormatted}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-b from-[#0F1E3A]/95 via-[#0A1428]/95 to-[#080E1E]/95 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl ${className}`}
    >
      {/* Background celestial ornament */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

      {/* Header with Title and Compass */}
      <div className="relative flex items-center justify-between pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '30s' }} />
          </div>
          <div>
            <h3
              className="text-xs font-black tracking-widest uppercase text-amber-300"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              Waktu Resmi Akademi
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Waktu Indonesia Barat (UTC+7)</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold text-amber-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Real-time</span>
        </div>
      </div>

      {/* Main Digital Clock Display */}
      <div className="relative my-4 flex flex-col items-center justify-center">
        <div className="flex items-baseline justify-center gap-1.5">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <span
              className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              style={{ fontFamily: "'JetBrains Mono', 'Orbitron', monospace" }}
            >
              {hours}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">Jam</span>
          </div>

          {/* Pulsing Colon */}
          <span className="font-mono text-3xl sm:text-4xl font-bold text-amber-400 animate-pulse pb-4">
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span
              className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              style={{ fontFamily: "'JetBrains Mono', 'Orbitron', monospace" }}
            >
              {minutes}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">Menit</span>
          </div>

          {/* Pulsing Colon */}
          <span className="font-mono text-3xl sm:text-4xl font-bold text-amber-400 animate-pulse pb-4">
            :
          </span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span
              className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]"
              style={{ fontFamily: "'JetBrains Mono', 'Orbitron', monospace" }}
            >
              {seconds}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-amber-400/80 mt-0.5">Detik</span>
          </div>
        </div>

        {/* Second Progress Bar */}
        <div className="w-full mt-3 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            style={{ width: `${secondProgress}%` }}
          />
        </div>
      </div>

      {/* Date & Academic Session Indicator */}
      <div className="relative pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{dayName}, {dateFormatted}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${sessionColor}`}>
          {sessionLabel}
        </div>
      </div>
    </div>
  );
};
