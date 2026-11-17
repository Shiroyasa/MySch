import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ThemeFlipToggleProps {
  className?: string;
  showLabel?: boolean;
  hideLabelOnMobile?: boolean;
  size?: 'sm' | 'md';
}

export const ThemeFlipToggle: React.FC<ThemeFlipToggleProps> = ({
  className = '',
  showLabel = false,
  hideLabelOnMobile = false,
  size = 'md',
}) => {
  const { darkMode, toggleDarkMode } = useApp();

  const handleToggle = () => {
    const root = document.documentElement;
    root.classList.add('theme-flip-active');
    toggleDarkMode();
    window.setTimeout(() => {
      root.classList.remove('theme-flip-active');
    }, 480);
  };

  const coinSize = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={darkMode ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
      title={darkMode ? 'Mode Gelap Aktif (Klik Theme Flip ke Terang)' : 'Mode Terang Aktif (Klik Theme Flip ke Gelap)'}
      className={`no-ornament orbita-theme-flip-stage group inline-flex items-center gap-2 rounded-full border border-[#DDD8F6] bg-white/85 px-2 py-1 text-xs font-bold text-[#3E385B] shadow-sm transition-all hover:border-[#6C60B8]/50 hover:shadow-md dark:border-[#6C60B8]/40 dark:bg-[#241F4A]/90 dark:text-slate-100 cursor-pointer shrink-0 ${className}`}
    >
      <span
        className={`orbita-theme-flip-coin block ${coinSize} rounded-full ${
          darkMode ? 'is-dark' : ''
        }`}
      >
        <span className="orbita-theme-flip-face rounded-full bg-gradient-to-br from-[#FFE89D] via-[#FFC458] to-[#FF8BA7] text-[#3E385B] shadow-inner">
          <Sun className={`${iconSize} text-white drop-shadow-[0_1px_2px_rgba(62,56,91,0.35)]`} />
        </span>
        <span className="orbita-theme-flip-face orbita-theme-flip-face-back rounded-full bg-gradient-to-br from-[#6C60B8] via-[#4F439D] to-[#29205E] text-[#FDE68A] shadow-inner">
          <Moon className={`${iconSize} text-[#FDE68A]`} />
        </span>
      </span>

      {showLabel && (
        <span
          className={`pr-1 text-[11px] font-extrabold whitespace-nowrap ${
            hideLabelOnMobile ? 'hidden sm:inline' : ''
          }`}
        >
          {darkMode ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
