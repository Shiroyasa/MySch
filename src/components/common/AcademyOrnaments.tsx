import React from 'react';
import {
  ImagePlus,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const POPOUT_CHARACTERS = [
  '/assets/aistudio/ororon_hero_popout.png',
  '/assets/aistudio/ororon_chibi_1.png',
  '/assets/aistudio/ororon_chibi_2.png',
  '/assets/aistudio/ororon_spirit_1.png',
  '/assets/aistudio/ororon_bust_popout.png',
];

export const ARTBOARD_BACKGROUNDS = [
  '/assets/aistudio/ororon_art_1.png',
  '/assets/aistudio/ororon_art_2.png',
  '/assets/aistudio/ororon_art_3.png',
];

export const WEAPON_ICONS = [
  '/assets/aistudio/ororon_weapon_1.png',
  '/assets/aistudio/ororon_weapon_2.png',
  '/assets/aistudio/ororon_weapon_3.png',
];

export type GenshinElementType =
  | 'electro'
  | 'hydro'
  | 'anemo'
  | 'pyro'
  | 'cryo'
  | 'dendro'
  | 'geo';

export const GENSHIN_ELEMENTS_LIST: GenshinElementType[] = [
  'electro',
  'hydro',
  'anemo',
  'dendro',
  'cryo',
  'geo',
  'pyro',
];

/**
 * Compresses an uploaded image file into a lightweight JPEG DataURL
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

/**
 * Clean Architectural Concentric Orbital Node (Replaces generic 4-point AI sparkle)
 */
export const PrimogemIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`inline-block shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5.5"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="currentColor"
        fillOpacity="0.22"
      />
      <circle cx="12" cy="12" r="1.6" fill="#FF7597" />
    </svg>
  );
};

export const IntertwinedFateIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => {
  return <PrimogemIcon className={className} />;
};

/**
 * Clean Architectural Duotone & Geometric Vector Icons for Navigation, Headers & Cards
 * Designed specifically for an academic management portal without AI-slop sparkles
 */
export type OrbitaIconVariant =
  | 'dashboard'
  | 'attendance'
  | 'grading'
  | 'reports'
  | 'pkl'
  | 'master-data'
  | 'user-management'
  | 'audit-logs'
  | 'settings'
  | 'student-profile'
  | 'student-grades'
  | 'logout'
  | 'brand'
  | 'location'
  | 'search'
  | 'broadcast'
  | 'bell';

export const OrbitaMenuIcon: React.FC<{
  variant: OrbitaIconVariant | string;
  className?: string;
}> = ({ variant, className = 'h-5 w-5' }) => {
  switch (variant) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <rect x="3" y="3" width="8" height="8" rx="2.6" fill="currentColor" fillOpacity="0.24" stroke="currentColor" strokeWidth="1.85" />
          <rect x="13" y="3" width="8" height="5" rx="2.2" stroke="currentColor" strokeWidth="1.85" />
          <rect x="13" y="10" width="8" height="11" rx="2.6" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.85" />
          <rect x="3" y="13" width="8" height="8" rx="2.6" stroke="currentColor" strokeWidth="1.85" />
        </svg>
      );
    case 'attendance':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <rect x="3.5" y="4.5" width="17" height="16" rx="4" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.85" />
          <path d="M8 2.8V6M16 2.8V6" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
          <path d="M3.5 9.2H20.5" stroke="currentColor" strokeWidth="1.65" />
          <path d="M8.8 14.3L11.1 16.6L15.6 12.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'grading':
    case 'student-grades':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <rect x="4" y="3.5" width="16" height="17" rx="3.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.85" />
          <path d="M8 8.5H16M8 12.2H13.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
          <path d="M8 16.2L10.2 14.5L12.5 16L16 12.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'reports':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.85" />
          <path d="M7.5 15.5L10.5 11.8L13.5 13.8L16.8 8.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16.8" cy="8.8" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'pkl':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <rect x="3" y="6.5" width="18" height="13.5" rx="3.6" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.85" />
          <path d="M8.5 6.5V5C8.5 3.9 9.4 3 10.5 3H13.5C14.6 3 15.5 3.9 15.5 5V6.5" stroke="currentColor" strokeWidth="1.85" />
          <path d="M3.5 12.2H20.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <rect x="10.2" y="10.5" width="3.6" height="3.4" rx="1" fill="currentColor" />
        </svg>
      );
    case 'master-data':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <path d="M12 3.2L20.2 7.5L12 11.8L3.8 7.5L12 3.2Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.85" strokeLinejoin="round" />
          <path d="M3.8 12.2L12 16.5L20.2 12.2" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.8 16.5L12 20.8L20.2 16.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'user-management':
    case 'student-profile':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <circle cx="10" cy="8" r="3.5" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.85" />
          <path d="M4 19.5C4 16.2 6.7 13.8 10 13.8C13.3 13.8 16 16.2 16 19.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
          <path d="M17.2 9.5H21M19.1 7.6V11.4" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
        </svg>
      );
    case 'audit-logs':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <path
            d="M12 3L19.5 6V11.8C19.5 16.3 16.3 19.8 12 21C7.7 19.8 4.5 16.3 4.5 11.8V6L12 3Z"
            fill="currentColor"
            fillOpacity="0.18"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinejoin="round"
          />
          <path d="M9.3 12L11.2 13.9L15 10.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <rect x="3.5" y="5" width="17" height="14" rx="3.5" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.85" />
          <path d="M7.5 9.5H16.5M7.5 14.5H16.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
          <circle cx="10.2" cy="9.5" r="2" fill="currentColor" />
          <circle cx="13.8" cy="14.5" r="2" fill="currentColor" />
        </svg>
      );
    case 'location':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <path
            d="M12 21C16.2 16.6 19 13.1 19 9.5C19 5.6 15.9 2.5 12 2.5C8.1 2.5 5 5.6 5 9.5C5 13.1 7.8 16.6 12 21Z"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.5" r="2.5" fill="currentColor" />
        </svg>
      );
    case 'logout':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <path d="M10 4H6.8C5.3 4 4 5.3 4 6.8V17.2C4 18.7 5.3 20 6.8 20H10" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
          <path d="M15 8L19.5 12L15 16" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 12H19" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
        </svg>
      );
    case 'brand':
    case 'bell':
    default:
      // Clean Orbital Ring & Academic Compass Emblem
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
          <circle cx="12" cy="12" r="8.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.85" />
          <ellipse cx="12" cy="12" rx="8.5" ry="3.8" transform="rotate(-28 12 12)" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        </svg>
      );
  }
};

/**
 * Clean Architectural Duotone Academic & Telemetry Glyphs for Floating Squircle Badges
 * Replaces fantasy/AI-slop icons with clean, high-craft geometric vector emblems
 */
export const GenshinElementIcon: React.FC<{
  element?: GenshinElementType;
  className?: string;
  withFrame?: boolean;
}> = ({ element = 'electro', className = 'h-5 w-5', withFrame = false }) => {
  const renderGlyph = () => {
    switch (element) {
      case 'electro':
        // Academic Performance & Trend Line Glyph
        return (
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
            <rect x="3.5" y="4" width="17" height="16" rx="4.2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.85" />
            <path
              d="M7.5 14.8L10.6 11.2L13.4 13.2L16.6 8.8"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16.6" cy="8.8" r="1.6" fill="currentColor" />
          </svg>
        );
      case 'hydro':
        // Verified Attendance Schedule Glyph
        return (
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
            <rect x="3.5" y="4.5" width="17" height="16" rx="4.2" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.85" />
            <path d="M8 2.8V5.8M16 2.8V5.8" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
            <path d="M8.5 13.2L11 15.7L15.8 10.8" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'anemo':
        // Industry Partnership & Portfolio Glyph
        return (
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
            <rect x="3.5" y="6.5" width="17" height="13" rx="3.8" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.85" />
            <path d="M8.5 6.5V5C8.5 4 9.3 3.2 10.3 3.2H13.7C14.7 3.2 15.5 4 15.5 5V6.5" stroke="currentColor" strokeWidth="1.85" />
            <path d="M3.5 12H20.5" stroke="currentColor" strokeWidth="1.75" />
            <circle cx="12" cy="12" r="1.8" fill="currentColor" />
          </svg>
        );
      case 'dendro':
        // Bar Analytics & Class Distribution Glyph
        return (
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
            <rect x="3.5" y="3.5" width="17" height="17" rx="4.2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.85" />
            <path d="M8 16V11.5M12 16V8M16 16V10" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          </svg>
        );
      case 'pyro':
        // Real-Time Activity & Pulse Metric Glyph
        return (
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
            <rect x="3.5" y="4" width="17" height="16" rx="4.2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.85" />
            <path d="M6.5 12H9.3L11.2 8.2L13.4 15.8L15.1 12H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'cryo':
        // Official Ledger & Transcript Document Glyph
        return (
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
            <rect x="5" y="3.5" width="14" height="17" rx="3.5" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.85" />
            <path d="M8.5 9H15.5M8.5 13H15.5M8.5 17H12.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
          </svg>
        );
      case 'geo':
      default:
        // Academic Accreditation & Mastery Seal Glyph
        return (
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
            <circle cx="12" cy="9.5" r="5.2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.85" />
            <path d="M8.5 14L7 20.5L12 18L17 20.5L15.5 14" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  if (withFrame) {
    return (
      <div
        className={`orbita-squircle-badge relative inline-flex shrink-0 items-center justify-center rounded-[16px] text-white p-2.5 ${className}`}
      >
        {renderGlyph()}
      </div>
    );
  }

  return <div className={`inline-flex shrink-0 items-center justify-center ${className}`}>{renderGlyph()}</div>;
};

export const GenshinWeaponIcon: React.FC<{
  variant?: number;
  className?: string;
}> = ({ variant = 0, className = 'h-7 w-7' }) => {
  const el = GENSHIN_ELEMENTS_LIST[Math.abs(variant) % GENSHIN_ELEMENTS_LIST.length];
  return <GenshinElementIcon element={el} className={className} />;
};

export const GenshinFiligreeCorner: React.FC<{
  position: 'tl' | 'tr' | 'bl' | 'br';
  className?: string;
}> = () => null;

export const ElectroSwirlCrest: React.FC<{ className?: string }> = ({
  className = 'h-10 w-10',
}) => <GenshinElementIcon element="electro" withFrame className={className} />;

export const ComicRansomTitle: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = 'text-2xl sm:text-3xl' }) => {
  return (
    <span className={`font-extrabold tracking-tight text-[#3E385B] dark:text-[#EAE8F5] ${className}`}>
      {text}
    </span>
  );
};

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
        className={`no-ornament inline-flex items-center gap-1 rounded-full border border-[#E4E3F0] bg-white hover:bg-[#F4F3FA] text-[#6C60B8] dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 font-bold tracking-wide shadow-sm transition-all cursor-pointer ${
          compact ? 'px-2.5 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]'
        }`}
      >
        <ImagePlus className={compact ? 'h-2.5 w-2.5 text-[#6C60B8] dark:text-indigo-300' : 'h-3 w-3 text-[#6C60B8] dark:text-indigo-300'} />
        <span>BG</span>
      </button>
      {currentBg && (
        <button
          type="button"
          onClick={handleReset}
          title="Reset Background Kotak"
          className={`no-ornament inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:border-rose-900 dark:bg-rose-950/70 dark:text-rose-300 dark:hover:bg-rose-900/60 font-bold shadow-sm transition-all cursor-pointer ${
            compact ? 'p-1 text-[9px]' : 'px-2 py-1 text-[10px]'
          }`}
        >
          <RotateCcw className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
};

/**
 * Clean Card Corner Accent — NO duplicate floating squircle icon on container cards
 */
export const LoginStyleOrnateCorners: React.FC<{
  sizeClass?: string;
  showTopCrest?: boolean;
  stampText?: string;
  characterIndex?: number;
  showPlusBadge?: boolean;
}> = ({
  showTopCrest = false,
  stampText = 'Aktif',
}) => {
  return (
    <>
      {/* Top-Right Subtle Vertical 3-Dots Icon (Matching Reference Image White Cards) */}
      <div
        className="pointer-events-none select-none absolute top-4 right-4 z-[10] text-[#C6C4D6] dark:text-slate-600"
        aria-hidden="true"
      >
        <MoreVertical className="h-4 w-4" />
      </div>

      {showTopCrest && (
        <div
          className="pointer-events-none select-none absolute -top-3 left-6 z-[15] inline-flex items-center gap-1.5 rounded-full bg-[#FFE4EC] border border-[#FFCCD9] px-3 py-0.5 text-[10px] font-bold text-[#F25781] dark:bg-rose-950/80 dark:border-rose-900 dark:text-rose-300 shadow-xs"
          aria-hidden="true"
        >
          <span>{stampText}</span>
        </div>
      )}
    </>
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
  showTopCrest?: boolean;
  popoutCharacterIndex?: number;
  surface?: 'white' | 'tinted';
}

export const OrnateCard: React.FC<OrnateCardProps> = ({
  children,
  className = '',
  onClick,
  boxId,
  hideBgControl = false,
  flipBack,
  minFlipHeight = 'min-h-[196px]',
  showTopCrest = false,
  popoutCharacterIndex,
  surface = 'white',
}) => {
  const { visualSettings, activeNav } = useApp();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [autoBoxKey, setAutoBoxKey] = React.useState<string>('');
  const [cardIndex, setCardIndex] = React.useState<number>(0);
  const [isTouchFlipped, setIsTouchFlipped] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = cardRef.current;
    const allCards = el ? Array.from(document.querySelectorAll('.academy-ornate-card, .jrpg-flip-card')) : [];
    const idx = el ? Math.max(0, allCards.indexOf(el)) : 0;
    setCardIndex(idx);

    if (boxId) {
      setAutoBoxKey(boxId);
      return;
    }
    if (!el) return;
    const headingEl = el.querySelector('h1, h2, h3, h4, [data-box-title]');
    const rawTitle = (headingEl?.textContent || el.textContent || '')
      .trim()
      .slice(0, 36)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const derived = `${activeNav || 'app'}_box_${rawTitle || idx >= 0 ? `${rawTitle}_${idx}` : 'card'}`;
    setAutoBoxKey(derived);
  }, [boxId, activeNav]);

  const resolvedKey = boxId || autoBoxKey || `${activeNav || 'app'}_ornate_card`;
  const customBoxBg = visualSettings?.boxBgs?.[resolvedKey] || null;
  const charIdx = popoutCharacterIndex !== undefined ? popoutCharacterIndex : cardIndex;

  // Soft diffused shadow (surface background controlled via Tailwind classes for light/dark/tinted parity)
  const cardShadowStyle: React.CSSProperties = {
    boxShadow: '0 14px 34px -6px rgba(108, 96, 184, 0.09)',
  };

  const surfaceClasses =
    surface === 'tinted'
      ? 'bg-[#F3F1FC] border-[#DFDCF2] text-[#3E385B] dark:bg-slate-900/95 dark:border-slate-800 dark:text-slate-100'
      : 'bg-white border-[#E8E6F4] text-[#3E385B] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100';

  if (flipBack) {
    return (
      <div
        ref={cardRef}
        data-ornate-card="true"
        onClick={onClick}
        className={`jrpg-flip-card no-ornament group/jrpg relative w-full h-full mt-5 ${
          isTouchFlipped ? 'is-flipped' : ''
        } ${onClick ? 'cursor-pointer' : ''} ${minFlipHeight}`}
      >
        <div className={`jrpg-flip-inner no-ornament w-full h-full ${minFlipHeight}`}>
          {/* FRONT FACE: Crisp Soft Card with Top Centered Floating Purple Squircle Badge */}
          <div
            style={cardShadowStyle}
            className={`jrpg-flip-front no-ornament ${minFlipHeight} rounded-[24px] sm:rounded-[26px] border ${surfaceClasses} flex flex-col justify-between !overflow-visible pt-8 px-4 sm:px-5 pb-4 sm:pb-5 ${className}`}
          >
            {customBoxBg && (
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[24px] sm:rounded-[26px]">
                <img
                  src={customBoxBg}
                  alt=""
                  className="h-full w-full object-cover object-center opacity-15"
                />
              </div>
            )}

            {/* Single Top-Center Floating Purple Squircle Icon Badge */}
            <div
              className="orbita-squircle-badge pointer-events-none select-none absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-[18px] text-white"
              aria-hidden="true"
            >
              <GenshinElementIcon
                element={GENSHIN_ELEMENTS_LIST[Math.abs(charIdx) % GENSHIN_ELEMENTS_LIST.length]}
                className="h-5.5 w-5.5"
              />
            </div>

            {/* Touch-friendly Flip Button (visible & handy on touch devices tablet/mobile) */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setIsTouchFlipped(prev => !prev);
              }}
              aria-label="Balik kartu detail"
              title="Tap untuk balik rincian"
              className="no-ornament xl:pointer-events-none absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F3FA] text-[#6C60B8] hover:bg-[#EAE7F8] dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 xl:bg-transparent xl:dark:bg-transparent xl:text-[#C6C4D6] xl:dark:text-slate-600 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 xl:hidden" />
              <MoreVertical className="hidden xl:block h-4 w-4" />
            </button>

            <div className="relative z-10 flex-1 flex flex-col justify-between w-full h-full">
              {children}
            </div>
          </div>

          {/* BACK FACE: Reference Image Purple Gradient Detail Card */}
          <div
            className={`jrpg-flip-back orbita-card-indigo no-ornament ${minFlipHeight} rounded-[24px] sm:rounded-[26px] border border-white/25 dark:border-[#9E92FF]/25 text-white flex flex-col justify-between !overflow-visible p-4 sm:p-5`}
          >
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setIsTouchFlipped(false);
              }}
              aria-label="Kembali ke depan"
              className="no-ornament xl:hidden absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {!hideBgControl && resolvedKey && (
              <div className="absolute bottom-2.5 right-3 z-30 opacity-0 group-hover/jrpg:opacity-100 transition-opacity">
                <BoxBgControl boxKey={resolvedKey} compact />
              </div>
            )}
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
      style={cardShadowStyle}
      className={`group/jrpg academy-ornate-card relative !overflow-visible rounded-[26px] border ${surfaceClasses} transition-all duration-200 mt-3 ${className}`}
    >
      {customBoxBg && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[26px]">
          <img
            src={customBoxBg}
            alt=""
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover/jrpg:scale-105 opacity-15"
          />
        </div>
      )}

      {/* Subtle 3-Dots Indicator Only (No Double Floating Icon on Container Cards) */}
      <LoginStyleOrnateCorners
        characterIndex={charIdx}
        showTopCrest={showTopCrest}
        stampText="Aktif"
      />

      {!hideBgControl && resolvedKey && (
        <div className="absolute bottom-2.5 right-3.5 z-30 opacity-0 group-hover/jrpg:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
          <BoxBgControl boxKey={resolvedKey} compact />
        </div>
      )}

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

const MODULE_ORDER = [
  'dashboard',
  'attendance',
  'grading',
  'pkl',
  'master-data',
  'reports',
  'user-management',
  'audit-logs',
  'settings',
];

/**
 * Helper to generate a smooth SVG cubic bezier path through (x, y) points
 */
export function buildSmoothWavePath(points: { x: number; y: number }[], closeBottomY?: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  if (closeBottomY !== undefined) {
    const last = points[points.length - 1];
    const first = points[0];
    d += ` L ${last.x} ${closeBottomY} L ${first.x} ${closeBottomY} Z`;
  }
  return d;
}

/**
 * Replicates the Reference Image Top Bento Grid on Every Page with a Real Interactive Data Wave Chart
 * and a Clean Full-Width Module Action/Tab Bar Below When `rightContent` Is Provided.
 */
export const AcademyHeroBanner: React.FC<AcademyHeroBannerProps> = ({
  kicker,
  title,
  subtitle,
  rightContent,
  moduleKey,
}) => {
  const {
    visualSettings,
    activeNav,
    setActiveNav,
    currentRole,
    students = [],
    teachers = [],
    classes = [],
    attendanceSessions = [],
    attendanceRecords = [],
    assessments = [],
    assessmentScores = [],
    pklReports = [],
    pklVisits = [],
    activeAcademicYear,
    academicYears = [],
  } = useApp();

  const targetKey = moduleKey || activeNav || 'default';
  const bannerBoxKey = `banner_${targetKey}`;
  const perModuleBg =
    visualSettings?.boxBgs?.[bannerBoxKey] ||
    visualSettings?.moduleBannerBgs?.[targetKey] ||
    visualSettings?.perModuleBannerBgs?.[targetKey];

  // Default metric mode matches the active module automatically
  const defaultModeForModule = React.useMemo(() => {
    if (targetKey === 'grading' || targetKey === 'student-grades') return 'akademik';
    if (targetKey === 'pkl') return 'pkl';
    if (targetKey === 'master-data' || targetKey === 'user-management') return 'siswa';
    return 'kehadiran';
  }, [targetKey]);

  const [metricMode, setMetricMode] = React.useState<'kehadiran' | 'akademik' | 'pkl' | 'siswa'>(
    defaultModeForModule
  );
  const [selectedClassId, setSelectedClassId] = React.useState<string>('ALL');
  const [selectedYear, setSelectedYear] = React.useState<string>('ALL');
  const [activeMonthIdx, setActiveMonthIdx] = React.useState<number>(() => {
    // Default to the latest month that has attendance sessions, or current month
    if (attendanceSessions.length > 0) {
      const latestSession = attendanceSessions[attendanceSessions.length - 1];
      if (latestSession?.date) {
        const d = new Date(latestSession.date);
        if (!isNaN(d.getTime())) return d.getMonth();
      }
    }
    return new Date().getMonth();
  });

  React.useEffect(() => {
    setMetricMode(defaultModeForModule);
  }, [defaultModeForModule]);

  const handleCycleModule = () => {
    if (currentRole === 'siswa') {
      const studentMods = ['student-profile', 'student-grades', 'pkl'];
      const curIdx = Math.max(0, studentMods.indexOf(activeNav));
      const nextIdx = (curIdx + 1) % studentMods.length;
      setActiveNav(studentMods[nextIdx]);
      return;
    }
    const curIdx = Math.max(0, MODULE_ORDER.indexOf(activeNav));
    const nextIdx = (curIdx + 1) % MODULE_ORDER.length;
    setActiveNav(MODULE_ORDER[nextIdx]);
  };

  // Extract available years from real database dates + academicYears
  const availableYears = React.useMemo(() => {
    const yearsSet = new Set<string>();
    attendanceSessions.forEach(s => {
      if (s.date && s.date.length >= 4) yearsSet.add(s.date.slice(0, 4));
    });
    assessments.forEach(a => {
      if (a.date && a.date.length >= 4) yearsSet.add(a.date.slice(0, 4));
    });
    pklVisits.forEach(v => {
      if (v.visitDate && v.visitDate.length >= 4) yearsSet.add(v.visitDate.slice(0, 4));
    });
    academicYears.forEach(ay => {
      const parts = (ay.name || '').split('/');
      parts.forEach(p => {
        if (/^\d{4}$/.test(p.trim())) yearsSet.add(p.trim());
      });
    });
    if (yearsSet.size === 0) {
      yearsSet.add(String(new Date().getFullYear()));
    }
    return Array.from(yearsSet).sort();
  }, [attendanceSessions, assessments, pklVisits, academicYears]);

  // Filter students by selected class (Keseluruhan vs Per Kelas)
  const filteredStudents = React.useMemo(() => {
    if (selectedClassId === 'ALL') return students;
    const clsObj = classes.find(c => c.id === selectedClassId || c.name === selectedClassId);
    return students.filter(
      s =>
        s.classId === selectedClassId ||
        s.className === selectedClassId ||
        (clsObj && (s.classId === clsObj.id || s.className === clsObj.name))
    );
  }, [students, classes, selectedClassId]);

  const filteredStudentIds = React.useMemo(
    () => new Set(filteredStudents.map(s => s.id)),
    [filteredStudents]
  );

  // Filter sessions & assessments by selected class + year
  const filteredSessions = React.useMemo(() => {
    return attendanceSessions.filter(s => {
      const matchClass = selectedClassId === 'ALL' || s.classId === selectedClassId;
      const matchYear =
        selectedYear === 'ALL' || (s.date && s.date.startsWith(selectedYear));
      return matchClass && matchYear;
    });
  }, [attendanceSessions, selectedClassId, selectedYear]);

  const filteredSessionIds = React.useMemo(
    () => new Set(filteredSessions.map(s => s.id)),
    [filteredSessions]
  );

  const filteredRecords = React.useMemo(() => {
    return attendanceRecords.filter(
      r => filteredStudentIds.has(r.studentId) && filteredSessionIds.has(r.sessionId)
    );
  }, [attendanceRecords, filteredStudentIds, filteredSessionIds]);

  const filteredAssessments = React.useMemo(() => {
    return assessments.filter(a => {
      const matchClass = selectedClassId === 'ALL' || a.classId === selectedClassId;
      const matchYear =
        selectedYear === 'ALL' || (a.date && a.date.startsWith(selectedYear));
      return matchClass && matchYear;
    });
  }, [assessments, selectedClassId, selectedYear]);

  const filteredAssessmentIds = React.useMemo(
    () => new Set(filteredAssessments.map(a => a.id)),
    [filteredAssessments]
  );

  const filteredScores = React.useMemo(() => {
    return assessmentScores.filter(
      sc => filteredStudentIds.has(sc.studentId) && filteredAssessmentIds.has(sc.assessmentId)
    );
  }, [assessmentScores, filteredStudentIds, filteredAssessmentIds]);

  const filteredPklReports = React.useMemo(() => {
    const clsObj = classes.find(c => c.id === selectedClassId || c.name === selectedClassId);
    return pklReports.filter(r => {
      if (selectedClassId === 'ALL') return true;
      return (
        r.studentId &&
        (filteredStudentIds.has(r.studentId) ||
          r.className === selectedClassId ||
          (clsObj && r.className === clsObj.name))
      );
    });
  }, [pklReports, selectedClassId, classes, filteredStudentIds]);

  const hadirCount = filteredRecords.filter(r => r.status === 'H' || r.status === 'T').length;
  const attendancePct =
    filteredRecords.length > 0
      ? Number(((hadirCount / filteredRecords.length) * 100).toFixed(1))
      : 0;

  const avgScore =
    filteredScores.length > 0
      ? Number(
          (
            filteredScores.reduce((acc, s) => acc + Number(s.score || 0), 0) /
            filteredScores.length
          ).toFixed(1)
        )
      : 0;

  const kkmPassCount = filteredScores.filter(s => Number(s.score || 0) >= 75).length;
  const kkmPassPct =
    filteredScores.length > 0
      ? Number(((kkmPassCount / filteredScores.length) * 100).toFixed(1))
      : 0;

  const pklVerifiedCount = filteredPklReports.filter(
    r => r.submissionStatus === 'sudah_dikumpulkan'
  ).length;
  const pklVerifiedPct =
    filteredPklReports.length > 0
      ? Number(((pklVerifiedCount / filteredPklReports.length) * 100).toFixed(1))
      : 0;

  const selectedClassNameLabel = React.useMemo(() => {
    if (selectedClassId === 'ALL') return 'Semua Kelas';
    const found = classes.find(c => c.id === selectedClassId || c.name === selectedClassId);
    return found ? `Kelas ${found.name}` : selectedClassId;
  }, [selectedClassId, classes]);

  // Real 12-Month Series Strictly Synced from Database Records (No fake random/sine offsets)
  const monthLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];

  const monthlySeries = React.useMemo(() => {
    return monthLabels.map((mLabel, idx) => {
      const monthNumber = idx + 1;

      // 1. Real Attendance sessions & records for this month
      const mSessions = filteredSessions.filter(s => {
        if (!s.date) return false;
        const d = new Date(s.date);
        return !isNaN(d.getTime()) && d.getMonth() + 1 === monthNumber;
      });
      const mSessionIds = new Set(mSessions.map(s => s.id));
      const mRecords = filteredRecords.filter(r => mSessionIds.has(r.sessionId));
      const mHadir = mRecords.filter(r => r.status === 'H' || r.status === 'T').length;
      const attVal =
        mRecords.length > 0
          ? Number(((mHadir / mRecords.length) * 100).toFixed(1))
          : attendancePct;

      // 2. Real Assessments & Scores for this month
      const mAssessments = filteredAssessments.filter(a => {
        if (!a.date) return false;
        const d = new Date(a.date);
        return !isNaN(d.getTime()) && d.getMonth() + 1 === monthNumber;
      });
      const mAssIds = new Set(mAssessments.map(a => a.id));
      const mScores = filteredScores.filter(sc => mAssIds.has(sc.assessmentId));
      const scoreVal =
        mScores.length > 0
          ? Number(
              (
                mScores.reduce((acc, s) => acc + Number(s.score || 0), 0) / mScores.length
              ).toFixed(1)
            )
          : avgScore;

      // 3. Real PKL reports & visits for this month
      const mPklReports = filteredPklReports.filter(r => {
        if (!r.submittedAt) return false;
        const d = new Date(r.submittedAt);
        return !isNaN(d.getTime()) && d.getMonth() + 1 === monthNumber;
      });
      const pklVal =
        mPklReports.length > 0
          ? Number(
              (
                (mPklReports.filter(r => r.submissionStatus === 'sudah_dikumpulkan').length /
                  mPklReports.length) *
                100
              ).toFixed(1)
            )
          : pklVerifiedPct;

      // 4. Student active ratio for selected class vs school
      const studentRatioVal =
        students.length > 0
          ? Number(((filteredStudents.length / students.length) * 100).toFixed(1))
          : 100;

      const activeVal =
        metricMode === 'kehadiran'
          ? attVal
          : metricMode === 'akademik'
          ? scoreVal
          : metricMode === 'pkl'
          ? pklVal
          : studentRatioVal;

      return {
        month: mLabel,
        value: activeVal,
        attVal,
        scoreVal,
        pklVal,
        studentCount: filteredStudents.length,
        sessionCount: mSessions.length,
        recordCount: mRecords.length,
        assessmentCount: mAssessments.length,
        classLabel: selectedClassNameLabel,
      };
    });
  }, [
    filteredSessions,
    filteredRecords,
    filteredAssessments,
    filteredScores,
    filteredPklReports,
    filteredStudents.length,
    students.length,
    attendancePct,
    avgScore,
    pklVerifiedPct,
    metricMode,
    selectedClassNameLabel,
  ]);

  const svgPoints = React.useMemo(() => {
    const vals = monthlySeries.map(d => d.value);
    const minV = Math.min(...vals, 50);
    const maxV = Math.max(...vals, 100);
    const span = Math.max(10, maxV - minV);
    return monthlySeries.map((d, i) => {
      const x = Number(((i / (monthlySeries.length - 1)) * 490 + 15).toFixed(1));
      const norm = (d.value - minV) / span;
      const y = Number((82 - norm * 54).toFixed(1));
      return { x, y, ...d };
    });
  }, [monthlySeries]);

  const activePoint = svgPoints[activeMonthIdx] || svgPoints[0];
  const waveLinePath = React.useMemo(() => buildSmoothWavePath(svgPoints), [svgPoints]);
  const waveAreaPath = React.useMemo(() => buildSmoothWavePath(svgPoints, 108), [svgPoints]);
  const activeLeftPct = Number(((activePoint.x / 520) * 100).toFixed(1));

  const metricLabelMap: Record<'kehadiran' | 'akademik' | 'pkl' | 'siswa', string> = {
    kehadiran: 'Presensi (%)',
    akademik: 'Nilai & KKM',
    pkl: 'Progres PKL (%)',
    siswa: 'Proporsi Siswa (%)',
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT 7 COLS: INTERACTIVE PURPLE OVERVIEW WAVE CARD SYNCED WITH DATABASE */}
        <div
          className="group/banner orbita-hero-violet lg:col-span-7 relative rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 text-white flex flex-col justify-between overflow-hidden"
        >
          {perModuleBg && (
            <img
              src={perModuleBg}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            />
          )}

          {/* Top Header Block: Full-Width Highlighted Title Row + Clean Filter Strip Below */}
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="no-ornament min-w-0 flex-1 flex items-stretch gap-2.5 rounded-2xl bg-white/14 border border-white/25 px-3.5 py-2 backdrop-blur-xs">
                <span
                  aria-hidden="true"
                  className="w-1.5 rounded-full bg-gradient-to-b from-[#FF85A6] to-[#FFD2E0] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/85 block leading-snug">
                    {kicker}
                  </span>
                  <h1 className="text-sm sm:text-lg font-black text-white tracking-tight leading-snug mt-0.5 break-words">
                    {title}
                  </h1>
                </div>
              </div>

              <div className="shrink-0 opacity-85 sm:opacity-0 sm:group-hover/banner:opacity-100 focus-within:opacity-100 transition-opacity pt-0.5">
                <BoxBgControl boxKey={bannerBoxKey} isBanner moduleKey={targetKey} compact />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              {/* Filter Kelas: Keseluruhan vs Per Kelas */}
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                title="Filter Data Keseluruhan atau Per Kelas"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  color: '#FFFFFF',
                  WebkitTextFillColor: '#FFFFFF',
                  borderColor: 'rgba(255,255,255,0.28)',
                }}
                className="no-ornament h-8.5 min-w-0 w-full truncate rounded-full border px-3 text-[11px] font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="text-[#3E385B] bg-white dark:bg-[#171434] dark:text-slate-100">
                  Semua Kelas ({students.length})
                </option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id} className="text-[#3E385B] bg-white dark:bg-[#171434] dark:text-slate-100">
                    Kelas {cls.name}
                  </option>
                ))}
              </select>

              {/* Filter Tahun */}
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                title="Filter Tahun Data Database"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  color: '#FFFFFF',
                  WebkitTextFillColor: '#FFFFFF',
                  borderColor: 'rgba(255,255,255,0.28)',
                }}
                className="no-ornament h-8.5 min-w-0 w-full truncate rounded-full border px-3 text-[11px] font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="text-[#3E385B] bg-white dark:bg-[#171434] dark:text-slate-100">
                  Semua Tahun
                </option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr} className="text-[#3E385B] bg-white dark:bg-[#171434] dark:text-slate-100">
                    Tahun {yr}
                  </option>
                ))}
              </select>

              {/* Filter Kategori Data */}
              <select
                value={metricMode}
                onChange={e => setMetricMode(e.target.value as any)}
                title="Pilih Kategori Data Grafik"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  WebkitTextFillColor: '#FFFFFF',
                  borderColor: 'rgba(255,255,255,0.34)',
                }}
                className="no-ornament h-8.5 min-w-0 w-full truncate rounded-full border px-3 text-[11px] font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="kehadiran" className="text-[#3E385B] bg-white dark:bg-[#171434] dark:text-slate-100">
                  {metricLabelMap.kehadiran}
                </option>
                <option value="akademik" className="text-[#3E385B] bg-white dark:bg-[#171434] dark:text-slate-100">
                  {metricLabelMap.akademik}
                </option>
                <option value="pkl" className="text-[#3E385B] bg-white dark:bg-[#171434] dark:text-slate-100">
                  {metricLabelMap.pkl}
                </option>
                <option value="siswa" className="text-[#3E385B] bg-white dark:bg-[#171434] dark:text-slate-100">
                  {metricLabelMap.siswa}
                </option>
              </select>
            </div>
          </div>

          {/* Middle Interactive Coral-Pink Wave Chart + Dynamic Highlight Column + Tooltip Callout */}
          <div className="relative z-10 my-2 pt-5 pb-1">
            <div
              className="pointer-events-none absolute top-1 bottom-7 w-10 -translate-x-1/2 rounded-t-full transition-all duration-300"
              style={{
                left: `${activeLeftPct}%`,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.03) 100%)',
              }}
              aria-hidden="true"
            />

            {/* Dynamic Floating Tooltip Box */}
            <div
              style={{
                left: `${Math.min(82, Math.max(14, activeLeftPct))}%`,
              }}
              className="pointer-events-none absolute top-0 z-20 flex items-center gap-2 -translate-x-1/2 transition-all duration-300"
              aria-hidden="true"
            >
              <div className="rounded-[13px] bg-[#443C68]/95 border border-white/20 px-3 py-1.5 text-white shadow-[0_8px_18px_rgba(28,22,56,0.42)]">
                <span className="block text-xs font-extrabold leading-none tabular-nums">
                  {activePoint.value}
                  {metricMode === 'akademik' ? ' Poin' : '%'}
                </span>
                <span className="block text-[9.5px] text-white/80 leading-tight mt-0.5">
                  {activePoint.month} {selectedYear === 'ALL' ? '' : selectedYear} &middot;{' '}
                  {activePoint.classLabel} ({activePoint.studentCount} Siswa)
                </span>
              </div>
            </div>

            {/* Interactive SVG Wave Curve & Clickable Nodes */}
            <svg
              viewBox="0 0 520 110"
              fill="none"
              className="w-full h-24 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`waveFill-${targetKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF7597" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#5D51B2" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={waveAreaPath}
                fill={`url(#waveFill-${targetKey})`}
                className="transition-all duration-300"
              />
              <path
                d={waveLinePath}
                stroke="#FF7597"
                strokeWidth="3.2"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {svgPoints.map((pt, idx) => {
                const isSelected = idx === activeMonthIdx;
                return (
                  <g
                    key={pt.month}
                    onClick={() => setActiveMonthIdx(idx)}
                    onMouseEnter={() => setActiveMonthIdx(idx)}
                    className="cursor-pointer"
                  >
                    <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 6.5 : 3.5}
                      fill={isSelected ? '#FF6E96' : '#FFFFFF'}
                      fillOpacity={isSelected ? 1 : 0.7}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2.5 : 1.2}
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive 12-Month Strip (Jan - Des) — Snap-scrollable on narrow phones */}
            <div className="mt-1.5 flex items-center sm:justify-between gap-1 text-[10.5px] text-white/75 px-0.5 overflow-x-auto snap-x snap-mandatory scrollbar-none">
              {monthlySeries.map((m, idx) => {
                const isAct = idx === activeMonthIdx;
                return (
                  <button
                    key={m.month}
                    type="button"
                    onClick={() => setActiveMonthIdx(idx)}
                    className={`no-ornament snap-center inline-flex min-h-[28px] min-w-[36px] sm:min-w-0 items-center justify-center px-2 py-0.5 rounded-full text-[10.5px] whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isAct
                        ? 'bg-white text-[#4E42A1] font-extrabold shadow-xs'
                        : 'text-white/70 hover:text-white font-medium'
                    }`}
                  >
                    {m.month}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom 3-Column Metric Bar with Center Elevated Pedestal */}
          <div className="relative z-10 grid grid-cols-3 items-center gap-1.5 sm:gap-2 pt-2 border-t border-white/12 text-center">
            <div
              onClick={() => setMetricMode('kehadiran')}
              className="cursor-pointer rounded-xl py-1 px-1 hover:bg-white/8 transition-colors min-w-0"
            >
              <span className="text-[9.5px] sm:text-[10px] text-white/75 block truncate">{selectedClassNameLabel}</span>
              <span className="text-sm sm:text-lg font-extrabold text-white tabular-nums block leading-tight">
                {filteredStudents.length} Siswa
              </span>
              <span className="text-[9.5px] sm:text-[10px] text-white/75 block truncate">
                {filteredSessions.length} Sesi
              </span>
            </div>

            <div
              onClick={() =>
                setMetricMode(prev =>
                  prev === 'kehadiran'
                    ? 'akademik'
                    : prev === 'akademik'
                      ? 'pkl'
                      : prev === 'pkl'
                        ? 'siswa'
                        : 'kehadiran'
                )
              }
              className="cursor-pointer rounded-[18px] sm:rounded-[20px] bg-white/15 border border-white/25 px-2 sm:px-3 py-2 sm:py-2.5 shadow-inner hover:bg-white/20 transition-colors min-w-0"
            >
              <span className="text-[9.5px] sm:text-[10px] text-white/85 block truncate">
                {metricLabelMap[metricMode]} ({activePoint.month})
              </span>
              <span className="text-base sm:text-xl font-black text-white tabular-nums block leading-tight">
                {activePoint.value}
                {metricMode === 'akademik' ? ' Poin' : '%'}
              </span>
              <span className="text-[9.5px] sm:text-[10px] text-white/80 block truncate">
                {selectedYear === 'ALL'
                  ? `T.A. ${activeAcademicYear?.name || '2025/2026'}`
                  : `Tahun ${selectedYear}`}
              </span>
            </div>

            <div
              onClick={() => setMetricMode('akademik')}
              className="cursor-pointer rounded-xl py-1 px-1 hover:bg-white/8 transition-colors min-w-0"
            >
              <span className="text-[9.5px] sm:text-[10px] text-white/75 block truncate">Rata-rata Nilai</span>
              <span className="text-sm sm:text-lg font-extrabold text-white tabular-nums block leading-tight">
                {avgScore} Poin
              </span>
              <span className="text-[9.5px] sm:text-[10px] text-white/75 block truncate">Lulus {kkmPassPct}%</span>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: STACKED PURPLE CARD + PINK-CORAL SUMMARY CARD */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          {/* Top Purple Card (Single clean geometric emblem) */}
          <div
            className="orbita-card-indigo rounded-[26px] p-5 text-white flex items-center gap-4"
          >
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] bg-white/20 border border-white/30 shadow-inner">
              <OrbitaMenuIcon variant={targetKey} className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                {title}
              </h2>
              <p className="text-[11px] text-white/85 line-clamp-2 leading-snug mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Bottom Pink-Coral Wave Card */}
          <div
            className="orbita-card-coral relative flex-1 rounded-[28px] p-5 text-white flex flex-col justify-between overflow-hidden min-h-[164px]"
          >
            <svg
              viewBox="0 0 400 120"
              fill="none"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full"
            >
              <path
                d="M0 45 C 120 90, 240 5, 400 50 L 400 120 L 0 120 Z"
                fill="rgba(229, 72, 118, 0.42)"
              />
            </svg>

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/85 block">
                  {selectedClassNameLabel} &bull; Real-Time Database
                </span>
                <h3 className="text-base font-extrabold text-white truncate mt-0.5">
                  Rekapitulasi Data Terfilter
                </h3>
              </div>
              <span className="rounded-full bg-white/22 border border-white/35 px-3 py-1 text-[10.5px] font-extrabold text-white shrink-0">
                Sem. {(activeAcademicYear?.activeSemester || 'ganjil').toUpperCase()}
              </span>
            </div>

            <div className="relative z-10 mt-4 flex items-end justify-between gap-3 pt-2">
              <div className="grid grid-cols-3 gap-3 flex-1">
                <div>
                  <span className="text-[10px] text-white/85 block">Presensi</span>
                  <span className="text-base sm:text-lg font-black text-white tabular-nums leading-tight block">
                    {attendancePct}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/85 block">Lulus KKM</span>
                  <span className="text-base sm:text-lg font-black text-white tabular-nums leading-tight block">
                    {kkmPassPct}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-white/85 block">PKL Selesai</span>
                  <span className="text-base sm:text-lg font-black text-white tabular-nums leading-tight block">
                    {pklVerifiedPct}%
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCycleModule}
                className="no-ornament flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/85 text-white hover:bg-white hover:text-[#F8658E] transition-colors cursor-pointer"
                title="Beralih ke Modul Berikutnya"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CLEAN FULL-WIDTH MODULE NAVIGATION / ACTION TOOLBAR */}
      {rightContent && (
        <div
          style={{
            boxShadow: '0 10px 26px -6px rgba(108, 96, 184, 0.08)',
          }}
          className="rounded-[22px] border border-[#ECEBF5] bg-white dark:bg-slate-900 dark:border-slate-800 px-4 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#6C60B8] dark:text-indigo-300 whitespace-nowrap shrink-0">
            <OrbitaMenuIcon variant="brand" className="h-4 w-4 shrink-0" />
            <span>Navigasi &amp; Aksi Modul</span>
          </div>
          <div className="min-w-0 max-w-full flex flex-wrap items-center gap-2 xl:justify-end">{rightContent}</div>
        </div>
      )}
    </div>
  );
};

export const CharacterMedallion: React.FC<{
  variant: 'cadet' | 'scholar' | 'guild' | 'aegis';
}> = ({ variant }) => {
  const elMap: Record<'cadet' | 'scholar' | 'guild' | 'aegis', GenshinElementType> = {
    cadet: 'electro',
    scholar: 'hydro',
    guild: 'anemo',
    aegis: 'dendro',
  };
  return (
    <div className="orbita-squircle-badge relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-white">
      <GenshinElementIcon element={elMap[variant]} className="h-6 w-6" />
    </div>
  );
};

export const GoldCompassRose: React.FC<{ className?: string }> = ({ className = 'h-11 w-11' }) => {
  return <ElectroSwirlCrest className={className} />;
};

export const HighlightedChartHeader: React.FC<{
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  accent?: 'purple' | 'emerald' | 'coral' | 'amber';
  compact?: boolean;
  className?: string;
}> = ({ title, subtitle, rightSlot, accent = 'purple', compact = false, className = 'mb-4' }) => {
  const accentClasses = {
    purple: {
      wrap: 'border-[#E6E2F8] bg-gradient-to-r from-[#F3F0FC] via-[#F9F8FE] to-white/70 dark:border-indigo-900/60 dark:from-indigo-950/50 dark:via-slate-900/40 dark:to-transparent',
      bar: 'from-[#6C60B8] to-[#9B8CE8]',
      title: 'text-[#241F3F] dark:text-white',
    },
    emerald: {
      wrap: 'border-[#CBEFE0] bg-gradient-to-r from-[#ECFBF3] via-[#F5FCF8] to-white/70 dark:border-emerald-900/60 dark:from-emerald-950/50 dark:via-slate-900/40 dark:to-transparent',
      bar: 'from-[#1CC865] to-[#0EA56B]',
      title: 'text-[#163829] dark:text-white',
    },
    coral: {
      wrap: 'border-[#FAD8E2] bg-gradient-to-r from-[#FFF0F4] via-[#FFF7F9] to-white/70 dark:border-rose-900/60 dark:from-rose-950/50 dark:via-slate-900/40 dark:to-transparent',
      bar: 'from-[#F25781] to-[#FF85A6]',
      title: 'text-[#3F1E2D] dark:text-white',
    },
    amber: {
      wrap: 'border-[#F7E3BE] bg-gradient-to-r from-[#FFF8EB] via-[#FFFDF7] to-white/70 dark:border-amber-900/60 dark:from-amber-950/50 dark:via-slate-900/40 dark:to-transparent',
      bar: 'from-[#F59E0B] to-[#FBBF24]',
      title: 'text-[#3B2A14] dark:text-white',
    },
  }[accent];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border ${accentClasses.wrap} ${
        compact ? 'px-3 py-2 pr-8' : 'px-3.5 py-2.5 pr-9'
      } ${className}`}
    >
      <div className="flex items-stretch gap-2.5 min-w-0 flex-1">
        <span
          aria-hidden="true"
          className={`w-1.5 rounded-full bg-gradient-to-b ${accentClasses.bar} shrink-0`}
        />
        <div className="min-w-0">
          <h3
            className={`${
              compact ? 'text-[13px]' : 'text-sm sm:text-[15px]'
            } font-black tracking-tight leading-snug ${accentClasses.title}`}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] font-medium text-[#6B6686] dark:text-slate-400 leading-snug mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightSlot && <div className="shrink-0 flex items-center gap-2 flex-wrap">{rightSlot}</div>}
    </div>
  );
};

export const OrnateSectionHeader: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => {
  return (
    <div className="flex items-stretch gap-3 rounded-2xl border border-[#DDD8F4] bg-gradient-to-r from-[#EDE9FB] via-[#F7F5FE] to-white px-3.5 py-2.5 pr-8 dark:border-indigo-900/60 dark:from-indigo-950/60 dark:via-slate-900/60 dark:to-slate-900">
      <span
        aria-hidden="true"
        className="w-1.5 rounded-full bg-gradient-to-b from-[#6C60B8] via-[#8E7FE0] to-[#FF7597] shrink-0"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#6C60B8] text-white shadow-2xs">
            <PrimogemIcon className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm sm:text-lg font-black tracking-tight text-[#241F3F] dark:text-white leading-snug">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-[11.5px] font-medium text-[#6B6686] dark:text-slate-400 leading-relaxed mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export const AcademyCornerBadge: React.FC<{ text: string; className?: string }> = ({
  text,
  className = 'mb-1.5',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#FFE4EC] px-3 py-0.5 text-[10px] font-bold text-[#F25781] dark:bg-rose-950/60 dark:text-rose-300 ${className}`}
    >
      <span>{text}</span>
    </div>
  );
};

export const OrnateDivider: React.FC = () => {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-[1px] flex-1 bg-[#ECEBF5] dark:bg-slate-800" />
      <span className="h-2 w-2 rounded-full bg-[#6C60B8]/40 dark:bg-indigo-400/50" />
      <div className="h-[1px] flex-1 bg-[#ECEBF5] dark:bg-slate-800" />
    </div>
  );
};

export const MagicRuneIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => {
  return <PrimogemIcon className={className} />;
};
