import React from 'react';
import { BookOpen } from 'lucide-react';

interface OrnateCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const OrnateCard: React.FC<OrnateCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`academy-ornate-card relative rounded-2xl border border-[#EFE2BE] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.03)] dark:border-amber-500/25 dark:bg-slate-900 ${className}`}
    >
      {/* Top-Left 4-Point Golden Star Ornament */}
      <span
        className="pointer-events-none absolute top-2 left-2.5 text-[9px] leading-none text-[#DFB858] select-none"
        aria-hidden="true"
      >
        ✦
      </span>
      {/* Bottom-Right 4-Point Golden Star Ornament */}
      <span
        className="pointer-events-none absolute bottom-2 right-2.5 text-[9px] leading-none text-[#DFB858] select-none"
        aria-hidden="true"
      >
        ✦
      </span>
      {children}
    </div>
  );
};

interface AcademyHeroBannerProps {
  kicker: string;
  title: string;
  subtitle: string;
  icon?: React.ElementType;
  rightContent?: React.ReactNode;
}

export const AcademyHeroBanner: React.FC<AcademyHeroBannerProps> = ({
  kicker,
  title,
  subtitle,
  icon: Icon = BookOpen,
  rightContent,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1E2E4F] bg-[#0B1528] px-6 py-7 sm:px-8 sm:py-8 text-white shadow-lg">
      {/* Right-Side Fantasy Castle Architectural Scenic Illustration (Matches image.png) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <svg
          className="absolute right-0 top-0 h-full w-full sm:w-[72%] object-cover"
          viewBox="0 0 900 280"
          fill="none"
          preserveAspectRatio="xMaxYMid slice"
        >
          <defs>
            <linearGradient id="bannerSky" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B1528" stopOpacity="1" />
              <stop offset="35%" stopColor="#162B52" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#3B69A8" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#6CA0DC" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="castleStoneLit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#94A3B8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="castleRoofDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="fadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B1528" stopOpacity="1" />
              <stop offset="38%" stopColor="#0B1528" stopOpacity="0.88" />
              <stop offset="72%" stopColor="#0B1528" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#0B1528" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Sky Backdrop */}
          <rect width="900" height="280" fill="url(#bannerSky)" />

          {/* Sunlit Cumulus Clouds on Far Right */}
          <circle cx="820" cy="110" r="85" fill="#F8FAFC" opacity="0.45" />
          <circle cx="730" cy="145" r="70" fill="#E0F2FE" opacity="0.35" />
          <circle cx="875" cy="165" r="75" fill="#FFFBEB" opacity="0.5" />
          <circle cx="620" cy="175" r="65" fill="#BAE6FD" opacity="0.25" />

          {/* Distant Floating Citadel on Top Right */}
          <g transform="translate(805, 22)" opacity="0.65">
            <polygon points="10,28 52,28 42,45 30,58 18,42" fill="#475569" />
            <rect x="22" y="14" width="16" height="14" fill="#CBD5E1" />
            <polygon points="30,2 20,14 40,14" fill="#1E3A8A" />
          </g>

          {/* Grand European Fantasy Academy Castle Complex (Matches Banner Artwork) */}
          <g transform="translate(380, 0)">
            {/* Left Bridge & Viaduct Arches */}
            <rect x="20" y="185" width="160" height="65" fill="#334155" opacity="0.55" />
            {[35, 75, 115].map((x, idx) => (
              <path
                key={idx}
                d={`M ${x} 250 L ${x} 210 A 14 14 0 0 1 ${x + 28} 210 L ${x + 28} 250 Z`}
                fill="#0F172A"
                opacity="0.65"
              />
            ))}

            {/* Castle Main Keep, Rotunda & Soaring Spires */}
            <rect x="175" y="105" width="220" height="165" fill="url(#castleStoneLit)" />
            {/* Central Rotunda Dome & Towers */}
            <rect x="235" y="65" width="95" height="195" fill="url(#castleStoneLit)" />
            <path d="M 235 65 Q 282 28 330 65 Z" fill="url(#castleRoofDark)" />

            {/* Left Tall Spire */}
            <rect x="165" y="48" width="34" height="210" fill="url(#castleStoneLit)" />
            <polygon points="182,-5 160,50 204,50" fill="url(#castleRoofDark)" />

            {/* Center-Left Spire */}
            <rect x="210" y="35" width="30" height="220" fill="url(#castleStoneLit)" />
            <polygon points="225,-12 205,37 245,37" fill="url(#castleRoofDark)" />

            {/* Center-Right Tallest Spire */}
            <rect x="325" y="28" width="38" height="230" fill="url(#castleStoneLit)" />
            <polygon points="344,-18 320,30 368,30" fill="url(#castleRoofDark)" />

            {/* Right Outer Turrets */}
            <rect x="385" y="75" width="36" height="185" fill="url(#castleStoneLit)" />
            <polygon points="403,18 380,77 426,77" fill="url(#castleRoofDark)" />

            <rect x="430" y="110" width="32" height="150" fill="url(#castleStoneLit)" />
            <polygon points="446,60 426,112 466,112" fill="url(#castleRoofDark)" />

            {/* Gothic Arched Windows */}
            {[250, 272, 294, 312].map((x, i) => (
              <rect key={i} x={x} y="90" width="8" height="28" rx="4" fill="#1E293B" opacity="0.75" />
            ))}
            {[177, 220, 339, 398].map((x, i) => (
              <rect key={i} x={x} y="75" width="7" height="24" rx="3.5" fill="#FEF08A" opacity="0.55" />
            ))}

            {/* Lush Green Forest Base */}
            <ellipse cx="220" cy="270" rx="180" ry="32" fill="#14532D" opacity="0.65" />
            <ellipse cx="390" cy="275" rx="140" ry="28" fill="#166534" opacity="0.65" />
          </g>

          {/* Smooth Dark Navy Left Gradient Overlay for Crisp Text Readability */}
          <rect width="900" height="280" fill="url(#fadeLeft)" />
        </svg>
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
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#EAB308]">
              <span>✦</span>
              <span>{kicker}</span>
            </div>

            {/* Regal Cinzel Serif Uppercase Title */}
            <h1
              className="text-xl sm:text-[28px] font-bold uppercase tracking-[0.04em] text-white leading-tight drop-shadow-xs"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-[13px] text-slate-200/90 leading-relaxed max-w-2xl">
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
