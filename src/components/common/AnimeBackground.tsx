import React from 'react';
import { useApp } from '../../context/AppContext';
import { LiveWallpaperPresetLayer, isVideoUrl } from './SkyborneCastleBackground';

export const AnimeBackground: React.FC = () => {
  const { darkMode, visualSettings } = useApp();

  const menuBgType = visualSettings?.menuBgType || 'default';
  const menuBgUrl = visualSettings?.menuBgUrl || null;
  const menuLivePreset = visualSettings?.menuLivePreset || 'starlight_castle';
  const ambientDark = visualSettings?.ambientDarkMode !== false;
  const rawOpacity = typeof visualSettings?.menuBgOpacity === 'number' ? visualSettings.menuBgOpacity : 45;

  // Ambient source: if menu has its own bg/live wallpaper, use it; in Ambient Dark Mode, can also reflect loginBgUrl ambience
  const effectiveMediaUrl = menuBgUrl || (darkMode && ambientDark ? visualSettings?.loginBgUrl : null);
  const effectiveIsLivePreset =
    menuBgType === 'live_preset' ||
    (darkMode && ambientDark && menuBgType === 'default' && visualSettings?.loginBgType === 'live_preset');
  const effectivePreset =
    menuBgType === 'live_preset'
      ? menuLivePreset
      : visualSettings?.loginLivePreset || 'starlight_castle';

  // Ambient palette adaptation based on active preset or wallpaper
  const ambientTint =
    effectivePreset === 'celestial_aurora'
      ? 'from-[#041824]/90 via-[#062c28]/82 to-[#071526]/92'
      : effectivePreset === 'golden_sanctuary'
      ? 'from-[#181006]/90 via-[#291707]/82 to-[#11152c]/92'
      : effectivePreset === 'cyber_emerald'
      ? 'from-[#020c1b]/90 via-[#052925]/82 to-[#041226]/92'
      : 'from-[#060d21]/88 via-[#0c1938]/80 to-[#091226]/90';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* 1. Base Surface (Warm Royal Ivory in Light Mode / Deep Ambient Obsidian in Dark Mode) */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          darkMode ? `bg-gradient-to-br ${ambientTint}` : 'bg-[#FAF8F3]'
        }`}
      />

      {/* 2. Menu Live Wallpaper / Custom Menu Background Layer */}
      {effectiveIsLivePreset && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: darkMode ? Math.min(0.85, (rawOpacity + 25) / 100) : Math.min(0.45, rawOpacity / 100),
          }}
        >
          <LiveWallpaperPresetLayer preset={effectivePreset} />
        </div>
      )}

      {effectiveMediaUrl && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: darkMode ? Math.min(0.75, (rawOpacity + 15) / 100) : Math.min(0.55, rawOpacity / 100),
          }}
        >
          {menuBgType === 'video' || isVideoUrl(effectiveMediaUrl) ? (
            <video
              src={effectiveMediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className={`h-full w-full object-cover object-center ${
                darkMode && ambientDark && !menuBgUrl ? 'blur-xl scale-110' : ''
              }`}
            />
          ) : (
            <img
              src={effectiveMediaUrl}
              alt="Menu Ambient Background"
              referrerPolicy="no-referrer"
              className={`h-full w-full object-cover object-center ${
                darkMode && ambientDark && !menuBgUrl ? 'blur-xl scale-110' : ''
              }`}
            />
          )}
          {/* Ambient color-bleed blur layer for rich depth in Dark Mode */}
          {darkMode && ambientDark && (
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#060d21]/80 via-[#0b1528]/45 to-[#060d21]/70 backdrop-blur-[2px]"
            />
          )}
        </div>
      )}

      {/* 3. Dynamic Ambient Glow Orbs that follow Dark/Light & Preset Ambience */}
      <div
        className={`absolute -top-32 -left-20 h-[520px] w-[520px] rounded-full blur-[130px] transition-all duration-1000 ${
          darkMode
            ? effectivePreset === 'celestial_aurora'
              ? 'bg-emerald-500/20'
              : effectivePreset === 'golden_sanctuary'
              ? 'bg-amber-500/20'
              : 'bg-blue-500/20'
            : 'bg-amber-200/25'
        }`}
      />
      <div
        className={`absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full blur-[130px] transition-all duration-1000 ${
          darkMode
            ? effectivePreset === 'celestial_aurora'
              ? 'bg-cyan-500/20'
              : effectivePreset === 'golden_sanctuary'
              ? 'bg-yellow-500/15'
              : 'bg-indigo-500/20'
            : 'bg-blue-200/20'
        }`}
      />
      <div
        className={`absolute -bottom-28 left-1/3 h-[440px] w-[440px] rounded-full blur-[120px] transition-all duration-1000 ${
          darkMode ? 'bg-amber-400/12' : 'bg-amber-100/30'
        }`}
      />

      {/* 4. Subtle Architectural Micro-Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.14]"
        style={{
          backgroundImage: darkMode
            ? 'radial-gradient(rgba(226, 232, 240, 0.35) 1px, transparent 1px)'
            : 'radial-gradient(rgba(180, 148, 75, 0.28) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
};
