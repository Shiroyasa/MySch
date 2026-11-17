import React from 'react';
import { useApp } from '../../context/AppContext';

/**
 * Renders the Reference Image's Soft Cool Lavender-Slate Outer Backdrop (#C8D0E0 -> #D4DCED)
 */
export const AnimeBackground: React.FC = () => {
  const { visualSettings } = useApp();
  const customBgUrl = visualSettings?.globalBannerBgUrl || null;

  return (
    <div
      className="pointer-events-none select-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#C5CEE0] via-[#CFD7E6] to-[#C2CBE0] dark:from-[#0C0A1D] dark:via-[#14102E] dark:to-[#0E0B24] transition-colors duration-300"
      aria-hidden="true"
    >
      {customBgUrl && (
        <img
          src={customBgUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-20 mix-blend-overlay"
        />
      )}

      {/* Subtle Soft Ambient Lavender & Rose Highlights */}
      <div
        className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full opacity-50"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(108,96,184,0.12) 55%, transparent 75%)',
        }}
      />
      <div
        className="absolute -bottom-32 -right-32 h-[560px] w-[560px] rounded-full opacity-45"
        style={{
          background:
            'radial-gradient(circle, rgba(255,133,166,0.18) 0%, rgba(108,96,184,0.12) 55%, transparent 75%)',
        }}
      />
    </div>
  );
};
