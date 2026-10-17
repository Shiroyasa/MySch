import React from 'react';
import { useApp } from '../../context/AppContext';

export const AnimeBackground: React.FC = () => {
  const { darkMode } = useApp();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* 1. Refined Academic Studio Gradient Base */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          darkMode
            ? 'bg-gradient-to-br from-slate-950 via-[#0b1329] to-[#0f172a]'
            : 'bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100'
        }`}
      />

      {/* 2. Soft, Elegant Ambient Glowing Orbs with Smooth Subtle Drift */}
      <div
        className={`absolute -top-32 -left-20 h-[500px] w-[500px] rounded-full blur-[120px] transition-all duration-1000 animate-pulse ${
          darkMode ? 'bg-blue-600/10' : 'bg-blue-400/15'
        }`}
        style={{ animationDuration: '12s' }}
      />
      <div
        className={`absolute top-1/3 -right-32 h-[450px] w-[450px] rounded-full blur-[130px] transition-all duration-1000 ${
          darkMode ? 'bg-indigo-600/10' : 'bg-indigo-300/15'
        }`}
      />
      <div
        className={`absolute -bottom-28 left-1/3 h-[420px] w-[420px] rounded-full blur-[120px] transition-all duration-1000 ${
          darkMode ? 'bg-sky-600/8' : 'bg-sky-300/20'
        }`}
      />

      {/* 3. Subtle Modern Architectural Micro-Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.22] dark:opacity-[0.14]"
        style={{
          backgroundImage: darkMode
            ? 'radial-gradient(rgba(148, 163, 184, 0.45) 1px, transparent 1px)'
            : 'radial-gradient(rgba(71, 85, 105, 0.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* 4. Sleek Minimalist Geometric Light Streaks */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={darkMode ? '#38bdf8' : '#2563eb'} stopOpacity="0.15" />
              <stop offset="50%" stopColor={darkMode ? '#818cf8' : '#6366f1'} stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="15%" x2="100%" y2="45%" stroke="url(#grid-grad)" strokeWidth="1" strokeDasharray="6 8" />
          <line x1="10%" y1="0" x2="90%" y2="100%" stroke="url(#grid-grad)" strokeWidth="1" strokeDasharray="4 12" />
        </svg>
      </div>
    </div>
  );
};
