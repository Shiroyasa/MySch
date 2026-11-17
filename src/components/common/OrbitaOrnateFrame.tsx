import React from 'react';
import { MoreVertical } from 'lucide-react';
import {
  GenshinElementIcon,
  GENSHIN_ELEMENTS_LIST,
} from './AcademyOrnaments';

interface OrbitaOrnateFrameProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  showTopCrest?: boolean;
  stampText?: string;
  characterIndex?: number;
}

/**
 * Renders the Reference Image's Crisp Soft White Card (#FFFFFF) with
 * Top-Center Floating Purple Squircle Icon Badge (#6C60B8), Top-Right 3-Dots Icon,
 * and Soft Lavender Diffused Shadow.
 */
export const OrbitaOrnateFrame: React.FC<OrbitaOrnateFrameProps> = ({
  children,
  className = '',
  contentClassName = '',
  showTopCrest = true,
  stampText = 'Aktif',
  characterIndex = 0,
}) => {
  const elementType = GENSHIN_ELEMENTS_LIST[Math.abs(characterIndex) % GENSHIN_ELEMENTS_LIST.length];

  return (
    <div
      style={{
        boxShadow: '0 20px 44px -8px rgba(108, 96, 184, 0.14)',
      }}
      className={`group/frame relative w-full rounded-[28px] border border-[#F0F0F7] bg-white text-[#3E385B] dark:border-[#8D81E3]/25 dark:bg-[#1E1A3E] dark:text-slate-100 transition-all duration-300 overflow-visible ${className}`}
    >
      {/* Top-Center Floating Purple Squircle Icon Badge (Exact Reference Image Detail) */}
      <div
        className="pointer-events-none select-none absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex h-13 w-13 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#7568C6] to-[#6356B5] text-white shadow-[0_10px_22px_rgba(108,96,184,0.36)] transition-transform duration-300 group-hover/frame:-translate-y-0.5"
        aria-hidden="true"
      >
        <GenshinElementIcon element={elementType} className="h-6 w-6" />
      </div>

      {/* Top-Right Subtle 3-Dots Icon */}
      <div
        className="pointer-events-none select-none absolute top-5 right-5 z-10 text-[#C6C4D6] dark:text-slate-500"
        aria-hidden="true"
      >
        <MoreVertical className="h-4.5 w-4.5" />
      </div>

      {/* Top-Left Soft Pink Status Pill */}
      {showTopCrest && (
        <div
          className="pointer-events-none select-none absolute top-4 left-5 z-10 inline-flex items-center rounded-full bg-[#FFE4EC] text-[#F25781] dark:bg-rose-950/70 dark:text-rose-300 px-3 py-0.5 text-[10px] font-bold"
          aria-hidden="true"
        >
          <span>{stampText}</span>
        </div>
      )}

      {/* Live Interactive Content Container */}
      <div className={`relative z-10 h-full w-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};
