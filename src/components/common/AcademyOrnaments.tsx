import React from 'react';
import { BookOpen, ImagePlus, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SkyborneCastleBackground } from './SkyborneCastleBackground';

/**
 * Compresses an uploaded image file into a lightweight JPEG DataURL
 * so that multiple per-box backgrounds and wallpapers never exceed
 * localStorage quota (5MB) or Firestore document size limit (1MB).
 */
export async function compressImageForBox(
  file: File,
  maxWidth = 960,
  quality = 0.76
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const resultStr = typeof reader.result === 'string' ? reader.result : '';
      if (!resultStr) {
        reject(new Error('File gambar kosong'));
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(resultStr);
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(resultStr);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(resultStr);
        }
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  });
}

export const BoxBgControl: React.FC<{
  boxKey: string;
  isBanner?: boolean;
  moduleKey?: string;
  className?: string;
  compact?: boolean;
}> = ({ boxKey, isBanner = false, moduleKey, className = '', compact = false }) => {
  const { visualSettings, updateVisualSettings, addToast } = useApp();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const currentBg = isBanner && moduleKey
    ? visualSettings?.boxBgs?.[boxKey] ||
      visualSettings?.moduleBannerBgs?.[moduleKey] ||
      visualSettings?.perModuleBannerBgs?.[moduleKey] ||
      null
    : visualSettings?.boxBgs?.[boxKey] || null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Pilih file gambar (JPG, PNG, WEBP) untuk background kotak.', 'warning');
      e.target.value = '';
      return;
    }
    try {
      const compressedDataUrl = await compressImageForBox(file, isBanner ? 1100 : 850, 0.76);
      const nextBoxBgs = { ...(visualSettings?.boxBgs || {}), [boxKey]: compressedDataUrl };
      if (isBanner && moduleKey) {
        const nextModuleBgs = {
          ...(visualSettings?.moduleBannerBgs || {}),
          ...(visualSettings?.perModuleBannerBgs || {}),
          [moduleKey]: compressedDataUrl,
        };
        updateVisualSettings({
          boxBgs: nextBoxBgs,
          moduleBannerBgs: nextModuleBgs,
          perModuleBannerBgs: nextModuleBgs,
        });
      } else {
        updateVisualSettings({
          boxBgs: nextBoxBgs,
        });
      }
      addToast('Background kotak berhasil diperbarui dan disimpan.', 'success');
    } catch {
      addToast('Gagal memproses gambar background kotak.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextBoxBgs = { ...(visualSettings?.boxBgs || {}) };
    delete nextBoxBgs[boxKey];
    if (isBanner && moduleKey) {
      const nextModuleBgs = {
        ...(visualSettings?.moduleBannerBgs || {}),
        ...(visualSettings?.perModuleBannerBgs || {}),
      };
      delete nextModuleBgs[moduleKey];
      updateVisualSettings({
        boxBgs: nextBoxBgs,
        moduleBannerBgs: nextModuleBgs,
        perModuleBannerBgs: nextModuleBgs,
      });
    } else {
      updateVisualSettings({
        boxBgs: nextBoxBgs,
      });
    }
    addToast('Background kotak dikembalikan ke default.', 'info');
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className={`inline-flex items-center gap-1 z-30 ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
        title="Ganti Background Gambar Kotak Ini"
        className={`inline-flex items-center gap-1 rounded-lg border border-[#D4AF37]/60 bg-[#0B1528]/85 hover:bg-[#162749] text-[#FDE68A] font-bold shadow-md backdrop-blur-md transition-all cursor-pointer ${
          compact ? 'px-1.5 py-1 text-[9px]' : 'px-2 py-1 text-[10px]'
        }`}
      >
        <ImagePlus className={compact ? 'h-2.5 w-2.5 text-[#EAB308]' : 'h-3 w-3 text-[#EAB308]'} />
        <span>Ganti BG</span>
      </button>
      {currentBg && (
        <button
          type="button"
          onClick={handleReset}
          title="Reset Background Kotak"
          className={`inline-flex items-center justify-center rounded-lg border border-rose-400/50 bg-rose-950/85 hover:bg-rose-900 text-rose-200 font-bold shadow-md backdrop-blur-md transition-all cursor-pointer ${
            compact ? 'p-1 text-[9px]' : 'px-1.5 py-1 text-[10px]'
          }`}
        >
          <RotateCcw className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
};

interface OrnateCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  boxId?: string;
  hideBgControl?: boolean;
  flipBack?: React.ReactNode;
  minFlipHeight?: string;
}

export const OrnateCard: React.FC<OrnateCardProps> = ({
  children,
  className = '',
  onClick,
  boxId,
  hideBgControl = false,
  flipBack,
  minFlipHeight = 'min-h-[165px]',
}) => {
  const { visualSettings, activeNav } = useApp();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [autoBoxKey, setAutoBoxKey] = React.useState<string>('');
  const [hoverState, setHoverState] = React.useState<{ x: number; y: number; active: boolean }>({
    x: 160,
    y: 90,
    active: false,
  });

  React.useLayoutEffect(() => {
    if (boxId) {
      setAutoBoxKey(boxId);
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    // Derive a deterministic key from the card's heading or position within the module
    const headingEl = el.querySelector('h1, h2, h3, h4, [data-box-title]');
    const rawTitle = (headingEl?.textContent || el.textContent || '')
      .trim()
      .slice(0, 36)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const allCards = Array.from(document.querySelectorAll('.academy-ornate-card'));
    const idx = allCards.indexOf(el);
    const derived = `${activeNav || 'app'}_box_${rawTitle || idx >= 0 ? `${rawTitle}_${idx}` : 'card'}`;
    setAutoBoxKey(derived);
  }, [boxId, activeNav]);

  const resolvedKey = boxId || autoBoxKey || `${activeNav || 'app'}_ornate_card`;
  const customBoxBg = visualSettings?.boxBgs?.[resolvedKey] || null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverState({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  if (flipBack) {
    return (
      <div
        ref={cardRef}
        data-ornate-card="true"
        onClick={onClick}
        className={`jrpg-flip-card no-ornament group/jrpg relative w-full h-full ${
          onClick ? 'cursor-pointer' : ''
        } ${minFlipHeight}`}
      >
        <div className={`jrpg-flip-inner no-ornament w-full h-full ${minFlipHeight}`}>
          {/* FRONT FACE */}
          <div
            className={`jrpg-flip-front no-ornament ${minFlipHeight} rounded-2xl border-[1.5px] border-[#DEC896] bg-gradient-to-b from-[#FFFFFF] via-[#FDFBF6] to-[#F8F3E6] shadow-[0_6px_20px_rgba(15,23,42,0.06),inset_0_0_0_1px_rgba(212,175,55,0.18)] dark:border-[#D4AF37]/45 dark:from-[#0D1A34] dark:via-[#0A1428] dark:to-[#070E1E] dark:text-slate-100 dark:shadow-[0_10px_28px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(250,204,21,0.14)] flex flex-col justify-between ${className || 'p-4'}`}
          >
            {customBoxBg && (
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
                <img
                  src={customBoxBg}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/78 to-white/90 dark:from-[#0B1528]/86 dark:via-[#0A1428]/80 dark:to-[#070E1E]/90" />
              </div>
            )}
            <div
              className="pointer-events-none absolute inset-[3px] rounded-[13px] border border-[#D4AF37]/25 z-[1]"
              aria-hidden="true"
            />
            <span className="pointer-events-none absolute top-1.5 left-2 text-[9px] leading-none text-[#D4AF37] select-none z-[2]">
              ❖
            </span>
            <span className="pointer-events-none absolute top-1.5 right-2 text-[8px] leading-none text-[#D4AF37]/70 select-none z-[2]">
              ✦
            </span>
            <span className="pointer-events-none absolute bottom-1.5 left-2 text-[8px] leading-none text-[#D4AF37]/70 select-none z-[2]">
              ✦
            </span>
            <span className="pointer-events-none absolute bottom-1.5 right-2 text-[9px] leading-none text-[#D4AF37] select-none z-[2]">
              ❖
            </span>
            <div className="relative z-10 flex-1 flex flex-col justify-between w-full h-full">
              {children}
            </div>
          </div>

          {/* BACK FACE (Stationary 3D Flip on Mouse Hover) */}
          <div
            className={`jrpg-flip-back no-ornament ${minFlipHeight} rounded-2xl border-[1.5px] border-[#D4AF37] bg-gradient-to-br from-[#0F1E3D] via-[#0B1528] to-[#070E1E] text-white shadow-[0_10px_28px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(250,204,21,0.28)] flex flex-col justify-between ${className || 'p-4'}`}
          >
            {customBoxBg && (
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
                <img
                  src={customBoxBg}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B1528]/88 via-[#0A1428]/84 to-[#070E1E]/92" />
              </div>
            )}
            <div
              className="pointer-events-none absolute inset-[3px] rounded-[13px] border border-[#F3D77D]/40 z-[1]"
              aria-hidden="true"
            />
            {!hideBgControl && resolvedKey && (
              <div className="absolute top-3 right-3 z-30">
                <BoxBgControl boxKey={resolvedKey} compact />
              </div>
            )}
            <span className="pointer-events-none absolute top-1.5 left-2 text-[9px] leading-none text-[#F3D77D] select-none z-[2]">
              ✦
            </span>
            <span className="pointer-events-none absolute bottom-1.5 left-2 text-[8px] leading-none text-[#F3D77D]/70 select-none z-[2]">
              ❖
            </span>
            <span className="pointer-events-none absolute bottom-1.5 right-2 text-[9px] leading-none text-[#F3D77D] select-none z-[2]">
              ✦
            </span>
            <div className="relative z-10 flex-1 flex flex-col justify-between w-full h-full">
              {flipBack}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHoverState(prev => ({ ...prev, active: true }))}
      onMouseLeave={() => setHoverState(prev => ({ ...prev, active: false }))}
      className={`group/jrpg academy-ornate-card relative overflow-hidden rounded-2xl border-[1.5px] border-[#DEC896] bg-gradient-to-b from-white/97 via-[#FDFBF6]/96 to-[#F9F5EB]/96 backdrop-blur-md shadow-[0_6px_22px_rgba(15,23,42,0.05),inset_0_0_0_1px_rgba(212,175,55,0.18)] dark:border-[#D4AF37]/45 dark:from-[#0D1A34]/94 dark:via-[#0A1428]/95 dark:to-[#070E1E]/96 dark:text-slate-100 dark:shadow-[0_10px_32px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(250,204,21,0.12)] transition-all duration-300 ${className}`}
    >
      {/* Optional Per-Box Custom Image Background */}
      {customBoxBg && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src={customBoxBg}
            alt=""
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover/jrpg:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/82 via-white/75 to-white/86 dark:from-[#0B1528]/84 dark:via-[#0A1428]/78 dark:to-[#070E1E]/88 backdrop-blur-[1.5px]" />
        </div>
      )}

      {/* Interactive Mouse-Tracking JRPG Arcane Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: hoverState.active ? 1 : 0,
          background: `radial-gradient(320px circle at ${hoverState.x}px ${hoverState.y}px, rgba(250, 204, 21, 0.14), rgba(59, 130, 246, 0.08) 45%, transparent 80%)`,
        }}
        aria-hidden="true"
      />

      {/* Inner Filigree Bevel Frame */}
      <div
        className="pointer-events-none absolute inset-[3px] rounded-[13px] border border-[#D4AF37]/25 group-hover/jrpg:border-[#D4AF37]/55 transition-colors duration-300 z-[1]"
        aria-hidden="true"
      />

      {/* Per-Box Background Replacer Control (Visible on Hover) */}
      {!hideBgControl && resolvedKey && (
        <div className="absolute top-2.5 right-3 z-30 opacity-90 sm:opacity-0 sm:group-hover/jrpg:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
          <BoxBgControl boxKey={resolvedKey} compact />
        </div>
      )}

      {/* 4 JRPG Corner Filigree Brackets & Star Runes */}
      <span
        className="pointer-events-none absolute top-1.5 left-2 text-[9px] leading-none text-[#D4AF37] group-hover/jrpg:text-[#F59E0B] group-hover/jrpg:scale-125 transition-all duration-300 select-none z-[2]"
        aria-hidden="true"
      >
        ❖
      </span>
      <span
        className="pointer-events-none absolute top-1.5 right-2 text-[8px] leading-none text-[#D4AF37]/70 group-hover/jrpg:text-[#F59E0B] transition-all duration-300 select-none z-[2]"
        aria-hidden="true"
      >
        ✦
      </span>
      <span
        className="pointer-events-none absolute bottom-1.5 left-2 text-[8px] leading-none text-[#D4AF37]/70 group-hover/jrpg:text-[#F59E0B] transition-all duration-300 select-none z-[2]"
        aria-hidden="true"
      >
        ✦
      </span>
      <span
        className="pointer-events-none absolute bottom-1.5 right-2 text-[9px] leading-none text-[#D4AF37] group-hover/jrpg:text-[#F59E0B] group-hover/jrpg:scale-125 transition-all duration-300 select-none z-[2]"
        aria-hidden="true"
      >
        ❖
      </span>

      {/* Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

interface AcademyHeroBannerProps {
  kicker: string;
  title: string;
  subtitle: string;
  icon?: React.ElementType;
  rightContent?: React.ReactNode;
  moduleKey?: string;
}

export const AcademyHeroBanner: React.FC<AcademyHeroBannerProps> = ({
  kicker,
  title,
  subtitle,
  icon: Icon = BookOpen,
  rightContent,
  moduleKey,
}) => {
  const { visualSettings, activeNav } = useApp();

  const targetKey = moduleKey || activeNav || 'default';
  const bannerBoxKey = `banner_${targetKey}`;
  const perModuleBg =
    visualSettings?.boxBgs?.[bannerBoxKey] ||
    visualSettings?.moduleBannerBgs?.[targetKey] ||
    visualSettings?.perModuleBannerBgs?.[targetKey];
  const resolvedBgUrl =
    perModuleBg ||
    visualSettings?.globalBannerBgUrl ||
    visualSettings?.loginBgUrl ||
    null;

  const overlayOpacity =
    typeof visualSettings?.bannerOverlayOpacity === 'number'
      ? Math.min(90, Math.max(15, visualSettings.bannerOverlayOpacity))
      : 55;

  return (
    <div className="group/banner relative overflow-hidden rounded-2xl border border-[#C8A44B]/65 bg-[#0B1528] px-6 py-7 sm:px-8 sm:py-8 text-white shadow-lg">
      {/* Scenic Background: Either Custom Uploaded Image or Skyborne Academy Castle Courtyard */}
      <SkyborneCastleBackground
        mode="banner"
        customBgUrl={resolvedBgUrl}
        bgType={perModuleBg ? 'image' : visualSettings?.loginBgType}
        livePreset={visualSettings?.loginLivePreset}
      />

      {/* Smooth Dark Navy Gradient Overlay for Crisp Text Readability */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `linear-gradient(90deg, rgba(11, 21, 40, ${Math.min(0.95, (overlayOpacity + 28) / 100)}) 0%, rgba(11, 21, 40, ${overlayOpacity / 100}) 52%, rgba(11, 21, 40, ${Math.max(0.18, (overlayOpacity - 22) / 100)}) 100%)`,
        }}
      />

      {/* Per-Banner Background Replacer Button */}
      <div className="absolute top-3 right-3 z-30 opacity-90 sm:opacity-0 sm:group-hover/banner:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
        <BoxBgControl boxKey={bannerBoxKey} isBanner moduleKey={targetKey} />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4 sm:gap-6">
          {/* Ornate Gold-Bordered Squircle Emblem with Top & Bottom 4-Point Stars */}
          <div className="flex h-16 w-16 sm:h-[74px] sm:w-[74px] shrink-0 flex-col items-center justify-between rounded-2xl border-2 border-[#C8A44B]/85 bg-[#1B2A47]/90 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xs">
            <span className="text-[8px] leading-none text-[#EAB308]">✦</span>
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-[#EAB308]" strokeWidth={1.8} />
            <span className="text-[8px] leading-none text-[#EAB308]">✦</span>
          </div>

          <div className="space-y-1.5">
            {/* Golden Kicker */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#EAB308] drop-shadow-xs">
              <span>✦</span>
              <span>{kicker}</span>
            </div>

            {/* Regal Cinzel Serif Uppercase Title */}
            <h1
              className="text-xl sm:text-[28px] font-bold uppercase tracking-[0.04em] text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-[13px] text-slate-100/95 leading-relaxed max-w-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]">
              {subtitle}
            </p>
          </div>
        </div>

        {rightContent && <div className="relative z-10 shrink-0">{rightContent}</div>}
      </div>
    </div>
  );
};

export const CharacterMedallion: React.FC<{
  variant: 'cadet' | 'scholar' | 'guild' | 'aegis';
}> = ({ variant }) => {
  return (
    <div className="relative h-12 w-12 shrink-0 rounded-full p-[2px] bg-gradient-to-br from-[#FDE68A] via-[#D4AF37] to-[#B48327] shadow-[0_3px_10px_rgba(212,175,55,0.28)]">
      <div className="h-full w-full rounded-full overflow-hidden bg-gradient-to-b from-[#DBEAFE] via-[#EFF6FF] to-[#FEF3C7] flex items-center justify-center relative">
        {variant === 'cadet' && (
          <svg viewBox="0 0 64 64" className="h-full w-full">
            <circle cx="32" cy="32" r="30" fill="#E0F2FE" />
            {/* Academy Spire Backdrop */}
            <polygon points="16,60 24,22 32,60" fill="#BAE6FD" />
            {/* Cadet Shoulders & Royal Uniform */}
            <path d="M 12 64 C 14 46 50 46 52 64 Z" fill="#1E3A8A" />
            <path d="M 24 48 L 32 58 L 40 48" fill="#FFFFFF" />
            <path d="M 29 50 L 32 60 L 35 50 Z" fill="#DC2626" />
            {/* Face & Hair */}
            <circle cx="32" cy="31" r="11" fill="#FDE6D8" />
            <path d="M 19 28 C 19 15 45 15 45 28 C 43 22 36 20 32 22 C 26 20 21 23 19 28 Z" fill="#5C3A21" />
            {/* Eyes */}
            <circle cx="28" cy="32" r="1.6" fill="#1E293B" />
            <circle cx="36" cy="32" r="1.6" fill="#1E293B" />
            {/* Gold Epaulettes */}
            <circle cx="18" cy="52" r="3" fill="#FBBF24" />
            <circle cx="46" cy="52" r="3" fill="#FBBF24" />
          </svg>
        )}

        {variant === 'scholar' && (
          <svg viewBox="0 0 64 64" className="h-full w-full">
            <circle cx="32" cy="32" r="30" fill="#FEF3C7" />
            {/* Library Warm Glow */}
            <circle cx="32" cy="28" r="22" fill="#FDE68A" opacity="0.5" />
            {/* Scholar Robe */}
            <path d="M 12 64 C 14 46 50 46 52 64 Z" fill="#312E81" />
            <path d="M 22 48 L 32 62 L 42 48" fill="#FDE047" />
            {/* Face & Hair */}
            <circle cx="32" cy="31" r="11" fill="#FDE6D8" />
            <path d="M 18 32 C 18 14 46 14 46 32 C 44 23 37 20 32 21 C 25 20 20 24 18 32 Z" fill="#3B2314" />
            {/* Scholar Glasses & Eyes */}
            <circle cx="28" cy="32" r="1.6" fill="#1E293B" />
            <circle cx="36" cy="32" r="1.6" fill="#1E293B" />
            {/* Crown/Tiara Pin */}
            <polygon points="32,12 28,18 36,18" fill="#F59E0B" />
          </svg>
        )}

        {variant === 'guild' && (
          <svg viewBox="0 0 64 64" className="h-full w-full">
            <circle cx="32" cy="32" r="30" fill="#F3E8FF" />
            {/* Royal Cape & Uniform */}
            <path d="M 10 64 C 14 45 50 45 54 64 Z" fill="#1E40AF" />
            <path d="M 22 47 L 32 60 L 42 47" fill="#F8FAFC" />
            {/* Face & Dark Blue Hair */}
            <circle cx="32" cy="31" r="11" fill="#FDE6D8" />
            <path d="M 19 29 C 19 14 45 14 45 29 C 42 21 35 19 30 22 C 25 19 21 23 19 29 Z" fill="#1E293B" />
            <circle cx="28" cy="32" r="1.6" fill="#2563EB" />
            <circle cx="36" cy="32" r="1.6" fill="#2563EB" />
            {/* Gold Collar Trim */}
            <path d="M 20 50 L 32 57 L 44 50" stroke="#FBBF24" strokeWidth="2.5" fill="none" />
          </svg>
        )}

        {variant === 'aegis' && (
          <svg viewBox="0 0 64 64" className="h-full w-full">
            <circle cx="32" cy="32" r="30" fill="#FFFBEB" />
            {/* Silver-Gold Paladin Armor */}
            <path d="M 10 64 C 13 45 51 45 54 64 Z" fill="#334155" />
            <path d="M 20 47 L 32 62 L 44 47" fill="#FDE047" />
            {/* Face & Silver-White Hair */}
            <circle cx="32" cy="31" r="11" fill="#FDE6D8" />
            <path d="M 18 30 C 18 14 46 14 46 30 C 43 21 36 19 32 22 C 26 19 21 22 18 30 Z" fill="#CBD5E1" />
            <circle cx="28" cy="32" r="1.6" fill="#D97706" />
            <circle cx="36" cy="32" r="1.6" fill="#D97706" />
            {/* Golden Aegis Crest */}
            <circle cx="32" cy="54" r="3.5" fill="#F59E0B" />
          </svg>
        )}
      </div>
    </div>
  );
};

export const GoldCompassRose: React.FC<{ className?: string }> = ({ className = 'h-11 w-11' }) => {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="22" stroke="#E5C158" strokeWidth="2" opacity="0.75" />
      <circle cx="32" cy="32" r="16" stroke="#E5C158" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      {/* 4-Point Compass Star */}
      <path
        d="M 32 4 L 36.5 27.5 L 60 32 L 36.5 36.5 L 32 60 L 27.5 36.5 L 4 32 L 27.5 27.5 Z"
        fill="#E5C158"
        opacity="0.85"
      />
      {/* Diagonal Rays */}
      <path
        d="M 16 16 L 29 29 M 48 16 L 35 29 M 16 48 L 29 35 M 48 48 L 35 35"
        stroke="#D4AF37"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="3.5" fill="#FFFBEB" stroke="#D4AF37" strokeWidth="1.5" />
    </svg>
  );
};

export const OrnateSectionHeader: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#D4AF37]">❖</span>
        <h2
          className="text-base sm:text-lg font-extrabold tracking-wide text-slate-900 dark:text-white uppercase"
          style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
};

export const AcademyCornerBadge: React.FC<{ text: string; className?: string }> = ({
  text,
  className = 'mb-1.5',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md border border-[#D4AF37]/40 bg-[#FAF6EC] dark:bg-slate-800/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#9A7314] dark:text-[#F3D77D] ${className}`}
    >
      <span>✦</span>
      <span>{text}</span>
    </div>
  );
};

export const OrnateDivider: React.FC = () => {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
      <span className="text-xs text-[#D4AF37]">✦</span>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
    </div>
  );
};

export const MagicRuneIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => {
  return (
    <span className={`inline-flex items-center justify-center text-[#D4AF37] ${className}`}>
      ✦
    </span>
  );
};

