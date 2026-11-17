import React, { useEffect, useState } from 'react';

interface LiquidDigitalClockProps {
  size?: 'sm' | 'md';
  className?: string;
}

const SHORT_DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const SHORT_MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function getTimezoneLabel(date: Date): string {
  const offsetHours = -date.getTimezoneOffset() / 60;
  if (Math.abs(offsetHours - 7) < 0.1) return 'WIB';
  if (Math.abs(offsetHours - 8) < 0.1) return 'WITA';
  if (Math.abs(offsetHours - 9) < 0.1) return 'WIT';
  return 'Lokal';
}

export const LiquidDigitalClock: React.FC<LiquidDigitalClockProps> = ({
  size = 'md',
  className = '',
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [showDateMeta, setShowDateMeta] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  useEffect(() => {
    let intervalId: number | undefined;
    // Align first tick tightly to the second boundary so digits never drift
    const msUntilNextSecond = Math.max(50, 1000 - new Date().getMilliseconds());
    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
      intervalId = window.setInterval(() => {
        setNow(new Date());
      }, 1000);
    }, msUntilNextSecond);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const dayName = SHORT_DAYS_ID[now.getDay()];
  const dayNum = String(now.getDate()).padStart(2, '0');
  const monthName = SHORT_MONTHS_ID[now.getMonth()];
  const fullDateLabel = `${dayName}, ${dayNum} ${monthName} ${now.getFullYear()}`;
  const compactDateLabel = `${dayName}, ${dayNum} ${monthName}`;
  const tzLabel = getTimezoneLabel(now);

  // Match ThemeFlipToggle proportions seamlessly: sm -> h-6 w-6 orb, md -> responsive h-6 w-6 sm:h-7 sm:w-7 orb
  const orbSize = size === 'sm' ? 'h-6 w-6' : 'h-6 w-6 sm:h-7 sm:w-7';
  const timeTextSize =
    size === 'sm' ? 'text-[11.5px] sm:text-xs' : 'text-[11.5px] sm:text-[13px]';
  const metaTextSize = size === 'sm' ? 'text-[9.5px]' : 'text-[10px]';
  const containerGapPad = size === 'sm' ? 'gap-1.5 px-2 py-1' : 'gap-1.5 sm:gap-2 px-1.5 py-0.5 sm:px-2 sm:py-1';

  // Fluid fill percentage responds subtly to seconds (38% -> 68% smooth cycle)
  const secondRatio = now.getSeconds() / 59;
  const liquidTopOffset = Math.round(52 - secondRatio * 18);

  const handleToggleMeta = () => {
    setShowDateMeta(prev => !prev);
    setRippleKey(k => k + 1);
  };

  return (
    <button
      type="button"
      onClick={handleToggleMeta}
      title={`${fullDateLabel} • ${hours}:${minutes}:${seconds} ${tzLabel} (Klik untuk lihat ${
        showDateMeta ? 'zona waktu' : 'tanggal'
      })`}
      aria-label={`Jam Digital ${hours} lewat ${minutes} menit ${seconds} detik ${tzLabel}, ${fullDateLabel}`}
      className={`no-ornament orbita-liquid-clock group relative inline-flex items-center ${containerGapPad} overflow-hidden rounded-full border border-[#DDD8F6] bg-white/88 text-[#3E385B] shadow-sm backdrop-blur-xl transition-all hover:border-[#6C60B8]/50 hover:shadow-md dark:border-[#6C60B8]/40 dark:bg-[#241F4A]/90 dark:text-[#EDEBF9] cursor-pointer whitespace-nowrap shrink-0 select-none ${className}`}
    >
      {/* Subtle Ambient Liquid Wave Layer Across Capsule Bottom */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] overflow-hidden rounded-b-full opacity-75"
      >
        <svg
          viewBox="0 0 200 40"
          preserveAspectRatio="none"
          className="orbita-liquid-clock-wave-back h-full w-[200%]"
        >
          <path
            d="M0,18 Q25,6 50,18 T100,18 T150,18 T200,18 L200,40 L0,40 Z"
            className="fill-[#7468C4]/14 dark:fill-[#8D81E3]/20"
          />
        </svg>
        <svg
          viewBox="0 0 200 40"
          preserveAspectRatio="none"
          className="orbita-liquid-clock-wave-front absolute inset-0 h-full w-[200%]"
        >
          <path
            d="M0,22 Q25,32 50,22 T100,22 T150,22 T200,22 L200,40 L0,40 Z"
            className="fill-[#FF7597]/12 dark:fill-[#F47298]/16"
          />
        </svg>
      </span>

      {/* Interactive Liquid Sheen Burst on Click */}
      {rippleKey > 0 && (
        <span
          key={`clk-ripple-${rippleKey}`}
          aria-hidden="true"
          className="orbita-liquid-clock-ripple pointer-events-none absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent via-white/45 dark:via-[#A79CFF]/30 to-transparent"
        />
      )}

      {/* Left Mini Liquid Glass Orb (Matched to ThemeFlipToggle Coin Diameter) */}
      <span
        aria-hidden="true"
        className={`relative flex ${orbSize} shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#C7BFEA]/80 dark:border-[#9E92FF]/40 bg-gradient-to-br from-[#EFEBFB] to-[#DFD9F8] dark:from-[#302869] dark:to-[#1C1642] shadow-inner`}
      >
        {/* Dynamic Rising & Sloshing Liquid Body Inside Mini Orb */}
        <span
          style={{ transform: `translateY(${liquidTopOffset}%)` }}
          className="absolute inset-0 transition-transform duration-700 ease-out"
        >
          <svg
            viewBox="0 0 120 60"
            preserveAspectRatio="none"
            className="orbita-liquid-clock-wave-back h-full w-[200%]"
          >
            <path
              d="M0,12 Q15,2 30,12 T60,12 T90,12 T120,12 L120,60 L0,60 Z"
              className="fill-[#7468C4]/75 dark:fill-[#7D71CB]/85"
            />
          </svg>
          <svg
            viewBox="0 0 120 60"
            preserveAspectRatio="none"
            className="orbita-liquid-clock-wave-front absolute inset-0 h-full w-[200%]"
          >
            <path
              d="M0,15 Q15,24 30,15 T60,15 T90,15 T120,15 L120,60 L0,60 Z"
              className="fill-[#FF7597]/65 dark:fill-[#D96B90]/75"
            />
          </svg>
        </span>

        {/* Crisp Specular Glass Highlight & Center Pivot */}
        <span className="pointer-events-none absolute top-0.5 left-1 h-1.5 w-2.5 rounded-full bg-white/70 blur-[0.3px]" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10 h-3 w-3 text-[#4B3FA0] dark:text-[#F0EEF9] drop-shadow-[0_1px_1px_rgba(255,255,255,0.45)] dark:drop-shadow-[0_1px_2px_rgba(12,10,28,0.75)]"
        >
          <path d="M12 6.5v5.5l3.2 2" />
        </svg>
      </span>

      {/* Tabular Liquid Morphing Digits */}
      <span
        className={`relative z-10 inline-flex items-center font-mono ${timeTextSize} font-extrabold tracking-tight tabular-nums leading-none`}
      >
        <span key={`h-${hours}`} className="orbita-liquid-digit inline-block">
          {hours}
        </span>
        <span className="orbita-liquid-colon mx-[1px] text-[#7468C4] dark:text-[#B5ACEB]">
          :
        </span>
        <span key={`m-${minutes}`} className="orbita-liquid-digit inline-block">
          {minutes}
        </span>
        <span className="orbita-liquid-colon mx-[1px] text-[#7468C4] dark:text-[#B5ACEB]">
          :
        </span>
        <span
          key={`s-${seconds}`}
          className="orbita-liquid-digit inline-block text-[#5D51B2] dark:text-[#FF9AB6]"
        >
          {seconds}
        </span>
      </span>

      {/* Proportional Meta Pill (Timezone WIB / Compact Date on sm+) */}
      <span
        className={`relative z-10 hidden sm:inline-flex items-center rounded-full bg-[#EFEBFB]/90 dark:bg-[#352C75]/85 px-2 py-0.5 ${metaTextSize} font-extrabold text-[#5D51B2] dark:text-[#D5CEFA] border border-[#DDD8F6]/70 dark:border-[#8D81E3]/25 leading-none transition-colors`}
      >
        {showDateMeta ? compactDateLabel : tzLabel}
      </span>
    </button>
  );
};
