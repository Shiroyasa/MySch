import React from 'react';
import { useApp } from '../../context/AppContext';

export const AnimeBackground: React.FC = () => {
  const { darkMode } = useApp();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* 1. Royal Academy Warm Ivory-Parchment Base (Matches Reference Image #FAF8F3) */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          darkMode
            ? 'bg-gradient-to-br from-slate-950 via-[#0b1329] to-[#0f172a]'
            : 'bg-[#FAF8F3]'
        }`}
      />

      {/* 2. Soft Warm Golden & Sky Ambient Glows */}
      <div
        className={`absolute -top-32 -left-20 h-[500px] w-[500px] rounded-full blur-[130px] transition-all duration-1000 ${
          darkMode ? 'bg-blue-600/10' : 'bg-amber-200/25'
        }`}
      />
      <div
        className={`absolute top-1/3 -right-32 h-[450px] w-[450px] rounded-full blur-[130px] transition-all duration-1000 ${
          darkMode ? 'bg-indigo-600/10' : 'bg-blue-200/20'
        }`}
      />
      <div
        className={`absolute -bottom-28 left-1/3 h-[420px] w-[420px] rounded-full blur-[120px] transition-all duration-1000 ${
          darkMode ? 'bg-sky-600/8' : 'bg-amber-100/30'
        }`}
      />

      {/* 3. Subtle Architectural Micro-Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.12]"
        style={{
          backgroundImage: darkMode
            ? 'radial-gradient(rgba(148, 163, 184, 0.45) 1px, transparent 1px)'
            : 'radial-gradient(rgba(180, 148, 75, 0.28) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
};
