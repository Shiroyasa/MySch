import React from 'react';
import { LiveWallpaperPreset } from '../../types';

interface SkyborneCastleBackgroundProps {
  customBgUrl?: string | null;
  bgType?: 'default' | 'image' | 'video' | 'live_preset';
  livePreset?: LiveWallpaperPreset;
  mode?: 'fullscreen' | 'banner';
}

export const isVideoUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.startsWith('data:video/') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.ogg') ||
    lower.includes('.mp4?') ||
    lower.includes('.webm?')
  );
};

export const LiveWallpaperPresetLayer: React.FC<{
  preset: LiveWallpaperPreset;
  className?: string;
}> = ({ preset, className = 'absolute inset-0' }) => {
  const rawUid = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const glowId = `glow-${preset}-${rawUid}`;

  const themes: Record<
    LiveWallpaperPreset,
    {
      baseGrad: string;
      orb1: string;
      orb2: string;
      orb3: string;
      accentHex: string;
    }
  > = {
    starlight_castle: {
      baseGrad: 'linear-gradient(135deg, #060D24 0%, #102554 45%, #1E3A8A 80%, #172554 100%)',
      orb1: 'rgba(56, 189, 248, 0.32)',
      orb2: 'rgba(250, 204, 21, 0.24)',
      orb3: 'rgba(99, 102, 241, 0.35)',
      accentHex: '#FDE047',
    },
    celestial_aurora: {
      baseGrad: 'linear-gradient(135deg, #041B2D 0%, #064E3B 48%, #0F766E 78%, #0F172A 100%)',
      orb1: 'rgba(52, 211, 153, 0.36)',
      orb2: 'rgba(34, 211, 238, 0.3)',
      orb3: 'rgba(167, 243, 208, 0.22)',
      accentHex: '#6EE7B7',
    },
    golden_sanctuary: {
      baseGrad: 'linear-gradient(135deg, #1C1208 0%, #451A03 45%, #78350F 78%, #1E1B4B 100%)',
      orb1: 'rgba(251, 191, 36, 0.35)',
      orb2: 'rgba(245, 158, 11, 0.28)',
      orb3: 'rgba(253, 230, 138, 0.22)',
      accentHex: '#FDE68A',
    },
    cyber_emerald: {
      baseGrad: 'linear-gradient(135deg, #020617 0%, #091E3A 45%, #065F46 82%, #022C22 100%)',
      orb1: 'rgba(16, 185, 129, 0.35)',
      orb2: 'rgba(59, 130, 246, 0.32)',
      orb3: 'rgba(234, 179, 8, 0.2)',
      accentHex: '#34D399',
    },
  };

  const t = themes[preset] || themes.starlight_castle;

  return (
    <div className={`${className} overflow-hidden`} style={{ background: t.baseGrad }}>
      {/* Animated Aurora / Nebula Waves */}
      <div
        className="absolute -top-24 -left-24 h-[480px] w-[480px] rounded-full blur-[100px] animate-pulse"
        style={{ background: t.orb1, animationDuration: '5s' }}
      />
      <div
        className="absolute top-1/4 -right-20 h-[440px] w-[440px] rounded-full blur-[110px] animate-pulse"
        style={{ background: t.orb2, animationDuration: '7s' }}
      />
      <div
        className="absolute -bottom-24 left-1/3 h-[500px] w-[500px] rounded-full blur-[120px] animate-pulse"
        style={{ background: t.orb3, animationDuration: '6s' }}
      />

      {/* Animated Magical Starfield & Floating Runes SVG */}
      <svg
        className="absolute inset-0 h-full w-full object-cover opacity-85"
        viewBox="0 0 1920 1080"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={t.accentHex} stopOpacity="0.9" />
            <stop offset="100%" stopColor={t.accentHex} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Celestial Astrolabe Rings */}
        <g opacity="0.22" stroke={t.accentHex}>
          <circle cx="960" cy="540" r="360" strokeWidth="1" strokeDasharray="8 12">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 960 540"
              to="360 960 540"
              dur="90s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="960" cy="540" r="490" strokeWidth="1.2" strokeDasharray="4 16">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 960 540"
              to="0 960 540"
              dur="120s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Floating Magical Particles & Twinkling Stars */}
        {[
          { cx: 220, cy: 180, r: 3.5, dur: '4s', dy: -35 },
          { cx: 480, cy: 320, r: 2.5, dur: '5.5s', dy: -45 },
          { cx: 760, cy: 150, r: 4, dur: '3.8s', dy: -30 },
          { cx: 1180, cy: 210, r: 3, dur: '4.6s', dy: -40 },
          { cx: 1490, cy: 290, r: 4.5, dur: '5.2s', dy: -50 },
          { cx: 1710, cy: 170, r: 3, dur: '4.1s', dy: -35 },
          { cx: 340, cy: 680, r: 3.5, dur: '6s', dy: -55 },
          { cx: 840, cy: 790, r: 2.8, dur: '4.9s', dy: -40 },
          { cx: 1340, cy: 740, r: 3.8, dur: '5.4s', dy: -45 },
          { cx: 1620, cy: 640, r: 3.2, dur: '4.3s', dy: -35 },
        ].map((p, idx) => (
          <g key={idx}>
            <circle cx={p.cx} cy={p.cy} r={p.r * 4} fill={`url(#${glowId})`}>
              <animate
                attributeName="cy"
                values={`${p.cy};${p.cy + p.dy};${p.cy}`}
                dur={p.dur}
                repeatCount="indefinite"
              />
              <animate attributeName="opacity" values="0.3;0.95;0.3" dur={p.dur} repeatCount="indefinite" />
            </circle>
            <circle cx={p.cx} cy={p.cy} r={p.r} fill="#FFFFFF">
              <animate
                attributeName="cy"
                values={`${p.cy};${p.cy + p.dy};${p.cy}`}
                dur={p.dur}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Shooting Star Streaks */}
        <g stroke={t.accentHex} strokeWidth="2" strokeLinecap="round" opacity="0.65">
          <line x1="250" y1="120" x2="390" y2="210">
            <animate attributeName="opacity" values="0;0.85;0" dur="6s" repeatCount="indefinite" />
          </line>
          <line x1="1420" y1="90" x2="1280" y2="195">
            <animate attributeName="opacity" values="0;0.75;0" dur="8s" begin="2.5s" repeatCount="indefinite" />
          </line>
        </g>
      </svg>
    </div>
  );
};

export const SkyborneCastleBackground: React.FC<SkyborneCastleBackgroundProps> = ({
  customBgUrl,
  bgType = 'default',
  livePreset = 'starlight_castle',
  mode = 'fullscreen',
}) => {
  const [mediaError, setMediaError] = React.useState(false);
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');

  React.useEffect(() => {
    setMediaError(false);
  }, [customBgUrl, bgType, livePreset]);

  const containerClass =
    mode === 'banner'
      ? 'pointer-events-none absolute inset-0 z-0 overflow-hidden select-none bg-[#0B1528]'
      : 'pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#0B1528]';

  // 1. Live Wallpaper Preset Mode (Prioritize whenever bgType is 'live_preset', never stuck on old customBgUrl)
  if (bgType === 'live_preset') {
    return (
      <div className={containerClass} aria-hidden="true">
        <LiveWallpaperPresetLayer preset={livePreset} />
      </div>
    );
  }

  // 2. Custom Video Live Wallpaper or Custom Image (with automatic fallback if media fails or is blank)
  const hasCustomMedia = Boolean(
    customBgUrl &&
      typeof customBgUrl === 'string' &&
      customBgUrl.trim().length > 0 &&
      !mediaError &&
      (bgType !== 'default' || mode === 'banner')
  );

  if (hasCustomMedia && customBgUrl) {
    const isVideo = bgType === 'video' || isVideoUrl(customBgUrl);
    return (
      <div className={containerClass} aria-hidden="true">
        {/* Non-blank fallback gradient while media loads */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #060D24 0%, #102554 50%, #1E3A8A 100%)',
          }}
        />
        {isVideo ? (
          <video
            key={customBgUrl}
            src={customBgUrl}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setMediaError(true)}
            className="relative z-[1] h-full w-full object-cover object-center scale-[1.01]"
          />
        ) : (
          <img
            key={customBgUrl}
            src={customBgUrl}
            alt="ORBITA Background"
            referrerPolicy="no-referrer"
            onError={() => setMediaError(true)}
            className="relative z-[1] h-full w-full object-cover object-center scale-[1.01] transition-transform duration-700"
          />
        )}
        {/* Subtle atmospheric vignette for legibility */}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background:
              mode === 'banner'
                ? 'linear-gradient(90deg, rgba(11, 21, 40, 0.84) 0%, rgba(11, 21, 40, 0.56) 55%, rgba(11, 21, 40, 0.36) 100%)'
                : 'radial-gradient(circle at 50% 50%, rgba(12, 24, 56, 0.12) 0%, rgba(10, 18, 42, 0.38) 100%)',
          }}
        />
      </div>
    );
  }

  const g = (name: string) => `${name}-${uid}`;

  return (
    <div className={containerClass} aria-hidden="true">
      {/* ==================================================================== */}
      {/* SKYBORNE ACADEMY CASTLE COURTYARD — HIGH-DETAIL SCENIC ILLUSTRATION  */}
      {/* ==================================================================== */}
      <svg
        className="h-full w-full object-cover"
        viewBox="0 0 1920 1080"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky & Atmosphere Gradients */}
          <linearGradient id={g('skyDayGrad')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A56AC" />
            <stop offset="30%" stopColor="#2E77D0" />
            <stop offset="62%" stopColor="#6BACEB" />
            <stop offset="88%" stopColor="#B6DCFA" />
            <stop offset="100%" stopColor="#E1F1FD" />
          </linearGradient>

          <radialGradient id={g('sunHaze')} cx="65%" cy="38%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="45%" stopColor="#BAE6FD" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>

          {/* Cloud Gradients */}
          <linearGradient id={g('cloudPure')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
            <stop offset="70%" stopColor="#F0F7FF" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.88" />
          </linearGradient>
          <linearGradient id={g('cloudShade')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.75" />
          </linearGradient>

          {/* Snow Mountains */}
          <linearGradient id={g('mountainLit')} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="55%" stopColor="#BFDBFE" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id={g('mountainShadow')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* Castle Architecture */}
          <linearGradient id={g('castleMarble')} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id={g('castleShadowWall')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <linearGradient id={g('spireBlue')} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Royal Banner Fabric & Gold Crest */}
          <linearGradient id={g('royalBanner')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F2557" />
            <stop offset="50%" stopColor="#173578" />
            <stop offset="100%" stopColor="#0A193B" />
          </linearGradient>
          <linearGradient id={g('bannerGold')} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>

          {/* Courtyard Stone & Terrace */}
          <linearGradient id={g('courtyardFloor')} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="55%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id={g('balustradeStone')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="40%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <radialGradient id={g('cyanMagicGlow')} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="1" />
            <stop offset="45%" stopColor="#38BDF8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. SKY BASE & ATMOSPHERIC SUNLIGHT */}
        <rect width="1920" height="1080" fill={`url(#${g('skyDayGrad')})`} />
        <rect width="1920" height="1080" fill={`url(#${g('sunHaze')})`} />

        {/* High Altitude Contrails / Wind Streaks */}
        <path d="M 1400 220 L 1850 60" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="2.5" />
        <path d="M 1480 260 L 1900 120" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1.5" />

        {/* 2. VOLUMETRIC CUMULUS CLOUDS IN UPPER & MID SKY */}
        <g>
          {/* Left Sky Giant Cumulus */}
          <circle cx="420" cy="240" r="145" fill={`url(#${g('cloudShade')})`} />
          <circle cx="550" cy="210" r="165" fill={`url(#${g('cloudPure')})`} />
          <circle cx="380" cy="190" r="130" fill={`url(#${g('cloudPure')})`} />
          <circle cx="690" cy="280" r="135" fill={`url(#${g('cloudPure')})`} />
          <circle cx="810" cy="340" r="120" fill={`url(#${g('cloudPure')})`} />
          <circle cx="940" cy="390" r="110" fill={`url(#${g('cloudPure')})`} />

          {/* Right Sky Clouds */}
          <circle cx="1620" cy="340" r="130" fill={`url(#${g('cloudShade')})`} />
          <circle cx="1560" cy="310" r="115" fill={`url(#${g('cloudPure')})`} />
          <circle cx="1740" cy="360" r="125" fill={`url(#${g('cloudPure')})`} />
        </g>

        {/* 3. FLOATING SKY ISLANDS (LEFT & RIGHT) */}
        {/* Left Floating Citadel Island */}
        <g transform="translate(650, 175)">
          <polygon points="20,90 190,90 160,140 115,195 95,155 55,140" fill="#64748B" />
          <polygon points="20,90 110,90 115,195 95,155 55,140" fill="#94A3B8" />
          <path d="M 15 90 Q 105 78 195 90 Q 170 98 105 97 Q 40 98 15 90 Z" fill="#22C55E" />
          <rect x="75" y="45" width="55" height="45" fill="#E2E8F0" />
          <polygon points="90,10 78,45 102,45" fill="#1E40AF" />
          <polygon points="118,22 108,45 128,45" fill="#1E40AF" />
          <polygon points="62,32 54,58 70,58" fill="#1E40AF" />
        </g>

        {/* Right Floating Citadel Island */}
        <g transform="translate(1610, 120)">
          <polygon points="15,85 165,85 140,130 95,180 75,140 40,125" fill="#64748B" />
          <polygon points="15,85 95,85 95,180 75,140 40,125" fill="#94A3B8" />
          <path d="M 10 85 Q 90 75 170 85 Q 150 93 90 92 Q 30 93 10 85 Z" fill="#16A34A" />
          <rect x="65" y="42" width="45" height="43" fill="#E2E8F0" />
          <polygon points="88,8 75,42 101,42" fill="#1E40AF" />
          <polygon points="112,25 103,45 121,45" fill="#1E40AF" />
        </g>

        {/* 4. DISTANT SNOW-CAPPED ALPINE MOUNTAINS (LEFT HORIZON) */}
        <g>
          <polygon points="280,580 590,260 890,580" fill={`url(#${g('mountainShadow')})`} />
          <polygon points="280,580 590,260 640,580" fill={`url(#${g('mountainLit')})`} />
          <polygon points="540,580 780,330 1040,580" fill={`url(#${g('mountainShadow')})`} />
          <polygon points="540,580 780,330 810,580" fill={`url(#${g('mountainLit')})`} />
          <polygon points="160,580 410,320 620,580" fill={`url(#${g('mountainLit')})`} opacity="0.85" />
        </g>

        {/* 5. LEFT MIDGROUND ACADEMY TOWN & ARCHED STONE VIADUCT BRIDGES + WATERFALL */}
        <g transform="translate(260, 340)">
          {/* Left Town Buildings & Gothic Roofs */}
          <rect x="30" y="130" width="190" height="140" fill={`url(#${g('castleMarble')})`} />
          <polygon points="30,130 125,45 220,130" fill={`url(#${g('spireBlue')})`} />
          <polygon points="85,130 125,55 165,130" fill="#F8FAFC" />
          {/* Spires along the left ridge */}
          <rect x="240" y="110" width="42" height="160" fill={`url(#${g('castleMarble')})`} />
          <polygon points="261,35 235,112 287,112" fill={`url(#${g('spireBlue')})`} />
          <rect x="365" y="95" width="38" height="175" fill={`url(#${g('castleMarble')})`} />
          <polygon points="384,25 360,97 408,97" fill={`url(#${g('spireBlue')})`} />

          {/* Upper Stone Viaduct Bridge */}
          <rect x="220" y="195" width="520" height="22" fill="#E2E8F0" />
          {[260, 340, 420, 500, 580, 660].map((x, idx) => (
            <path
              key={idx}
              d={`M ${x} 217 L ${x} 265 A 28 28 0 0 1 ${x + 56} 265 L ${x + 56} 217 Z`}
              fill="#94A3B8"
            />
          ))}

          {/* Waterfall Gorge & Lower Grand Bridge */}
          <rect x="295" y="295" width="65" height="145" fill="#E0F2FE" opacity="0.85" />
          <rect x="310" y="295" width="25" height="145" fill="#FFFFFF" opacity="0.9" />
          <rect x="190" y="275" width="540" height="95" fill={`url(#${g('castleShadowWall')})`} />
          {[230, 350, 470, 590].map((x, idx) => (
            <path
              key={idx}
              d={`M ${x} 370 L ${x} 325 A 42 42 0 0 1 ${x + 84} 325 L ${x + 84} 370 Z`}
              fill="#38BDF8"
              opacity="0.45"
            />
          ))}
        </g>

        {/* 6. COLOSSAL MAIN SKYBORNE ACADEMY CATHEDRAL CASTLE (RIGHT-CENTER) */}
        <g transform="translate(960, 15)">
          {/* Central Soaring Grand Spire */}
          <rect x="285" y="55" width="120" height="480" fill={`url(#${g('castleMarble')})`} />
          <polygon points="345,-35 275,60 415,60" fill={`url(#${g('spireBlue')})`} />
          {/* Secondary Flanking Towers */}
          <rect x="195" y="160" width="95" height="390" fill={`url(#${g('castleMarble')})`} />
          <polygon points="242,40 190,162 295,162" fill={`url(#${g('spireBlue')})`} />

          <rect x="400" y="145" width="100" height="405" fill={`url(#${g('castleMarble')})`} />
          <polygon points="450,25 395,147 505,147" fill={`url(#${g('spireBlue')})`} />

          {/* Outer Wing Towers */}
          <rect x="115" y="250" width="85" height="310" fill={`url(#${g('castleMarble')})`} />
          <polygon points="157,140 110,252 204,252" fill={`url(#${g('spireBlue')})`} />

          <rect x="495" y="230" width="90" height="330" fill={`url(#${g('castleMarble')})`} />
          <polygon points="540,115 490,232 590,232" fill={`url(#${g('spireBlue')})`} />

          {/* Far Right Wing & Turrets */}
          <rect x="580" y="340" width="210" height="230" fill={`url(#${g('castleMarble')})`} />
          <polygon points="580,340 685,260 790,340" fill={`url(#${g('spireBlue')})`} />
          <rect x="630" y="210" width="46" height="350" fill={`url(#${g('castleMarble')})`} />
          <polygon points="653,105 625,212 681,212" fill={`url(#${g('spireBlue')})`} />

          {/* Main Cathedral Facade & Grand Rose/Lancet Arch */}
          <rect x="160" y="310" width="370" height="260" fill={`url(#${g('castleMarble')})`} />
          <polygon points="345,175 245,315 445,315" fill={`url(#${g('spireBlue')})`} />
          <polygon points="345,195 260,315 430,315" fill="#E2E8F0" />

          {/* Gothic Arched Windows */}
          {[215, 255, 425, 465].map((x, i) => (
            <rect key={i} x={x} y="355" width="20" height="75" rx="10" fill="#1E3A8A" />
          ))}
          {/* Grand Portal Entrance Arch */}
          <path d="M 315 570 L 315 505 A 30 30 0 0 1 375 505 L 375 570 Z" fill="#1E293B" />

          {/* Royal Blue Vertical Banners on Castle Facade */}
          <polygon
            points="315,285 375,285 375,455 345,485 315,455"
            fill={`url(#${g('royalBanner')})`}
            stroke={`url(#${g('bannerGold')})`}
            strokeWidth="2.5"
          />
          {/* Golden Wing Emblem on Castle Banner */}
          <path
            d="M 345 335 L 355 365 L 370 350 L 360 385 L 345 400 L 330 385 L 320 350 L 335 365 Z"
            fill={`url(#${g('bannerGold')})`}
          />

          {/* Side Castle Banners */}
          <polygon
            points="155,410 180,410 180,510 167,525 155,510"
            fill={`url(#${g('royalBanner')})`}
            stroke={`url(#${g('bannerGold')})`}
            strokeWidth="1.5"
          />
          <polygon
            points="510,410 535,410 535,510 522,525 510,510"
            fill={`url(#${g('royalBanner')})`}
            stroke={`url(#${g('bannerGold')})`}
            strokeWidth="1.5"
          />

          {/* Glowing Cyan Celestial Astrolabe Sigil Floating on Main Spire */}
          <circle cx="345" cy="235" r="58" fill={`url(#${g('cyanMagicGlow')})`} />
          <circle cx="345" cy="235" r="34" stroke="#E0F2FE" strokeWidth="2.5" />
          <circle cx="345" cy="235" r="22" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 345 185 L 352 228 L 395 235 L 352 242 L 345 285 L 338 242 L 295 235 L 338 228 Z" fill="#E0F2FE" />
        </g>

        {/* 7. MIDGROUND COURTYARD PLAZA, GRAND MARBLE STEPS & MAGICAL FOUNTAIN */}
        <g transform="translate(880, 565)">
          {/* Wide Plaza Floor */}
          <ellipse cx="390" cy="215" rx="420" ry="115" fill={`url(#${g('courtyardFloor')})`} />
          {/* Grand Staircase to Castle */}
          <polygon points="270,95 520,95 575,15 235,15" fill="#F8FAFC" />
          <polygon points="180,175 560,175 520,95 270,95" fill="#E2E8F0" />

          {/* Circular Cyan Magical Fountain */}
          <ellipse cx="365" cy="205" rx="145" ry="42" fill="#0284C7" stroke="#E2E8F0" strokeWidth="6" />
          <ellipse cx="365" cy="205" rx="115" ry="32" fill="#38BDF8" />
          <circle cx="365" cy="165" r="45" fill={`url(#${g('cyanMagicGlow')})`} />
          {/* Fountain Astrolabe Sculpture */}
          <circle cx="365" cy="162" r="24" stroke="#E0F2FE" strokeWidth="3" />
          <ellipse cx="365" cy="162" rx="12" ry="26" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M 365 125 L 372 198 M 340 162 L 390 162" stroke="#FFFFFF" strokeWidth="2.5" />
        </g>

        {/* Lush Courtyard Trees & Greenery */}
        <g>
          {[
            { x: 380, y: 650, r: 55, c: '#15803D' },
            { x: 450, y: 675, r: 65, c: '#166534' },
            { x: 540, y: 710, r: 50, c: '#15803D' },
            { x: 860, y: 715, r: 42, c: '#16A34A' },
            { x: 930, y: 740, r: 48, c: '#15803D' },
            { x: 1010, y: 775, r: 45, c: '#166534' },
            { x: 1520, y: 700, r: 55, c: '#15803D' },
            { x: 1610, y: 745, r: 65, c: '#166534' },
            { x: 1720, y: 780, r: 70, c: '#14532D' },
          ].map((tr, idx) => (
            <circle key={idx} cx={tr.x} cy={tr.y} r={tr.r} fill={tr.c} />
          ))}
        </g>

        {/* 8. FOREGROUND DIAGONAL STONE BALUSTRADE TERRACE & WROUGHT-IRON LANTERNS */}
        <g>
          {/* Sunlit Terrace Flagstone Floor (Bottom-Left to Bottom-Center) */}
          <polygon points="0,750 480,715 1780,985 1780,1080 0,1080" fill={`url(#${g('courtyardFloor')})`} />
          {/* Architectural Sun & Balustrade Shadows on Terrace Floor */}
          <polygon points="340,735 980,865 760,1080 180,1080" fill="#64748B" opacity="0.28" />
          <polygon points="620,795 1120,895 950,1080 480,1080" fill="#64748B" opacity="0.22" />

          {/* Diagonal Gothic Stone Balustrade Wall */}
          <polygon points="445,675 1920,965 1920,1080 445,765" fill={`url(#${g('balustradeStone')})`} />
          {/* Top Railing Ledge */}
          <polygon points="435,665 1920,955 1920,975 435,685" fill="#F8FAFC" />

          {/* Gothic Arched Cutouts along the Balustrade */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
            const bx = 530 + i * 105;
            const by = 710 + i * 20.5;
            return (
              <path
                key={i}
                d={`M ${bx} ${by + 55} L ${bx} ${by + 15} Q ${bx + 28} ${by - 5} ${bx + 56} ${by + 15} L ${bx + 56} ${by + 66} Z`}
                fill="#1E293B"
                opacity="0.55"
              />
            );
          })}

          {/* Stone Balustrade Piers & Wrought-Iron Courtyard Lanterns */}
          {[
            { x: 465, y: 635, scale: 0.9 },
            { x: 965, y: 725, scale: 1.05 },
            { x: 1680, y: 845, scale: 1.25 },
          ].map((pier, idx) => (
            <g key={idx} transform={`translate(${pier.x}, ${pier.y}) scale(${pier.scale})`}>
              {/* Stone Pier */}
              <rect x="-28" y="25" width="56" height="95" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
              <rect x="-34" y="18" width="68" height="12" fill="#F8FAFC" />
              {/* Black Wrought-Iron Lamp Post */}
              <rect x="-6" y="-22" width="12" height="40" fill="#1E293B" />
              <polygon points="-18,-22 18,-22 24,-62 -24,-62" fill="#FEF08A" stroke="#1E293B" strokeWidth="4" />
              <polygon points="-28,-62 28,-62 0,-82" fill="#0F172A" />
            </g>
          ))}
        </g>

        {/* 9. FOREGROUND RIGHT HANGING ROYAL BLUE BANNER & LAMP POST */}
        <g transform="translate(1745, 195)">
          {/* Tall Iron Pole */}
          <rect x="110" y="80" width="12" height="650" fill="#1E293B" />
          {/* Horizontal Banner Crossbar */}
          <rect x="-15" y="125" width="185" height="10" rx="4" fill="#451A03" stroke="#D97706" strokeWidth="2" />
          {/* Lantern on Top */}
          <polygon points="95,80 135,80 142,25 88,25" fill="#FEF08A" stroke="#1E293B" strokeWidth="4" />
          <polygon points="82,25 148,25 115,0" fill="#0F172A" />
          {/* Hanging Royal Blue & Gold Banner */}
          <polygon
            points="10,135 155,135 155,485 82,555 10,485"
            fill={`url(#${g('royalBanner')})`}
            stroke={`url(#${g('bannerGold')})`}
            strokeWidth="4"
          />
          {/* Golden Winged Sword Crest */}
          <path
            d="M 82 230 L 94 285 L 135 255 L 115 325 L 82 355 L 49 325 L 29 255 L 70 285 Z"
            fill={`url(#${g('bannerGold')})`}
          />
        </g>

        {/* 10. FOREGROUND LEFT GRAND STONE PILLAR, ROYAL BANNER, DESK & BOOKS */}
        <g>
          {/* Grand Left Stone Column */}
          <rect x="0" y="0" width="315" height="860" fill="#CBD5E1" />
          <rect x="255" y="0" width="60" height="860" fill="#E2E8F0" />
          <rect x="0" y="750" width="335" height="110" fill="#94A3B8" />

          {/* Left Royal Blue & Gold Hanging Banner */}
          <polygon
            points="45,0 235,0 215,515 130,610 45,515"
            fill={`url(#${g('royalBanner')})`}
            stroke={`url(#${g('bannerGold')})`}
            strokeWidth="5"
          />
          {/* Golden Winged Heraldic Crest on Left Banner */}
          <path
            d="M 135 165 L 152 245 L 200 205 L 175 305 L 135 348 L 95 305 L 70 205 L 118 245 Z"
            fill={`url(#${g('bannerGold')})`}
          />

          {/* Wooden Scholar Desk & Stack of Two Hardcover Books (Bottom-Left) */}
          <g transform="translate(0, 770)">
            {/* Desk Top & Carved Side */}
            <polygon points="0,70 365,45 485,85 110,135" fill="#78350F" />
            <polygon points="110,135 485,85 465,310 110,310" fill="#451A03" />
            {/* Stack of Two Academy Books on the Desk */}
            {/* Bottom Book */}
            <polygon points="150,35 295,20 345,42 200,58" fill="#1E3A8A" stroke="#D97706" strokeWidth="2" />
            <polygon points="200,58 345,42 345,62 200,78" fill="#FDE68A" />
            {/* Top Book */}
            <polygon points="160,12 290,-2 335,18 205,34" fill="#172554" stroke="#FBBF24" strokeWidth="2" />
            <polygon points="205,34 335,18 335,36 205,52" fill="#FEF3C7" />
          </g>

          {/* Bottom-Left Lush Green Ivy & White/Yellow Garden Flowers */}
          <g transform="translate(0, 560)">
            <circle cx="40" cy="180" r="65" fill="#14532D" />
            <circle cx="95" cy="240" r="60" fill="#166534" />
            <circle cx="55" cy="440" r="95" fill="#14532D" />
            <circle cx="165" cy="480" r="85" fill="#15803D" />
            {[
              { cx: 55, cy: 175, r: 9 },
              { cx: 88, cy: 205, r: 10 },
              { cx: 118, cy: 235, r: 8 },
              { cx: 75, cy: 425, r: 12 },
              { cx: 135, cy: 455, r: 14 },
              { cx: 195, cy: 475, r: 11 },
            ].map((fl, i) => (
              <g key={i}>
                <circle cx={fl.cx} cy={fl.cy} r={fl.r} fill="#FFFFFF" />
                <circle cx={fl.cx} cy={fl.cy} r={fl.r * 0.4} fill="#FACC15" />
              </g>
            ))}
          </g>
        </g>
      </svg>

      {/* Subtle atmospheric overlay so the centered Login Portal pops crisply */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(15, 30, 65, 0.18) 0%, rgba(10, 20, 48, 0.42) 100%)',
        }}
      />
    </div>
  );
};
