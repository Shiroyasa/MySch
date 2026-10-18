import React from 'react';
import { useApp } from '../../context/AppContext';
import { LiveWallpaperPresetLayer, SkyborneCastleBackground, isVideoUrl } from './SkyborneCastleBackground';

export const AnimeBackground: React.FC = () => {
  const { darkMode, visualSettings } = useApp();
  const [mediaError, setMediaError] = React.useState(false);

  const menuBgType = visualSettings?.menuBgType || 'default';
  const menuBgUrl = visualSettings?.menuBgUrl || null;
  const menuLivePreset = visualSettings?.menuLivePreset || 'starlight_castle';
  const ambientDark = visualSettings?.ambientDarkMode !== false;
  const rawOpacity = typeof visualSettings?.menuBgOpacity === 'number' ? visualSettings.menuBgOpacity : 45;

  const hasCustomMenuMedia = Boolean(
    menuBgType !== 'default' &&
      menuBgType !== 'live_preset' &&
      menuBgUrl &&
      typeof menuBgUrl === 'string' &&
      menuBgUrl.trim().length > 0 &&
      !mediaError
  );

  React.useEffect(() => {
    setMediaError(false);
  }, [menuBgUrl, menuBgType, menuLivePreset]);

  const effectivePreset = menuLivePreset || 'starlight_castle';

  // Ambient palette adaptation based on active preset or wallpaper
  const ambientTint =
    effectivePreset === 'celestial_aurora'
      ? 'from-[#041824]/92 via-[#062c28]/86 to-[#071526]/94'
      : effectivePreset === 'golden_sanctuary'
      ? 'from-[#181006]/92 via-[#291707]/86 to-[#11152c]/94'
      : effectivePreset === 'cyber_emerald'
      ? 'from-[#020c1b]/92 via-[#052925]/86 to-[#041226]/94'
      : 'from-[#060d21]/92 via-[#0c1938]/85 to-[#091226]/94';

  const normalizedOpacity = Math.max(0.18, Math.min(0.92, rawOpacity / 100));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* 1. Base Surface (Warm Royal Ivory in Light Mode / Deep Ambient Obsidian in Dark Mode) */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          darkMode ? `bg-gradient-to-br ${ambientTint}` : 'bg-[#FAF8F3]'
        }`}
      />

      {/* 2A. Menu Live Wallpaper Preset Layer */}
      {(menuBgType === 'live_preset' || (hasCustomMenuMedia && mediaError)) && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: darkMode
              ? Math.min(0.9, normalizedOpacity + 0.2)
              : Math.min(0.75, normalizedOpacity + 0.15),
          }}
        >
          <LiveWallpaperPresetLayer preset={effectivePreset} />
        </div>
      )}

      {/* 2B. Custom Image or Video Live Wallpaper for Menu */}
      {hasCustomMenuMedia && menuBgUrl && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: darkMode
              ? Math.min(0.85, normalizedOpacity + 0.15)
              : Math.min(0.8, normalizedOpacity + 0.1),
          }}
        >
          {menuBgType === 'video' || isVideoUrl(menuBgUrl) ? (
            <video
              key={menuBgUrl}
              src={menuBgUrl}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setMediaError(true)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <img
              key={menuBgUrl}
              src={menuBgUrl}
              alt="ORBITA Menu Background"
              referrerPolicy="no-referrer"
              onError={() => setMediaError(true)}
              className="h-full w-full object-cover object-center"
            />
          )}
          {/* Ambient color-bleed blur layer for rich depth in Dark Mode */}
          {darkMode && ambientDark && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#060d21]/78 via-[#0b1528]/42 to-[#060d21]/68 backdrop-blur-[1.5px]" />
          )}
        </div>
      )}

      {/* 2C. Default Scenic / Ambient Layer when menuBgType is 'default' (Never blank!) */}
      {menuBgType === 'default' && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: darkMode
              ? ambientDark
                ? Math.min(0.42, normalizedOpacity * 0.65)
                : 0.18
              : Math.min(0.22, normalizedOpacity * 0.38),
          }}
        >
          {darkMode && ambientDark ? (
            <LiveWallpaperPresetLayer preset={effectivePreset} />
          ) : (
            <SkyborneCastleBackground mode="banner" bgType="default" />
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

