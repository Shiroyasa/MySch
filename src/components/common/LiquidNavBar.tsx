import React from 'react';

export interface LiquidNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  dot?: boolean;
  title?: string;
}

export interface LiquidNavBarProps {
  items: LiquidNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  wrap?: boolean;
  pill?: boolean;
  embedded?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const LiquidNavBar: React.FC<LiquidNavBarProps> = ({
  items,
  activeId,
  onSelect,
  orientation = 'horizontal',
  size = 'md',
  fullWidth = false,
  wrap = false,
  pill = false,
  embedded = false,
  className = '',
  ariaLabel = 'Navigasi Tab',
}) => {
  const navRef = React.useRef<HTMLElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const btnRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const prevIdRef = React.useRef<string>(activeId);
  const timerRef = React.useRef<number | null>(null);

  const [indicatorRect, setIndicatorRect] = React.useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const [bulgeEffect, setBulgeEffect] = React.useState<{
    key: number;
    direction: 'left' | 'right' | 'up' | 'down';
    active: boolean;
  }>({
    key: 0,
    direction: orientation === 'vertical' ? 'down' : 'right',
    active: false,
  });

  const [seesawClass, setSeesawClass] = React.useState<string>('');

  const measureActiveButton = React.useCallback(() => {
    const btnEl = btnRefs.current[activeId];
    if (!btnEl) return;

    const top = btnEl.offsetTop;
    const left = btnEl.offsetLeft;
    const width = btnEl.offsetWidth;
    const height = btnEl.offsetHeight;

    setIndicatorRect(prev => {
      if (
        prev &&
        prev.top === top &&
        prev.left === left &&
        prev.width === width &&
        prev.height === height
      ) {
        return prev;
      }
      return { top, left, width, height };
    });
  }, [activeId]);

  React.useEffect(() => {
    if (prevIdRef.current !== activeId) {
      const prevIdx = items.findIndex(i => i.id === prevIdRef.current);
      const nextIdx = items.findIndex(i => i.id === activeId);
      prevIdRef.current = activeId;

      const direction: 'left' | 'right' | 'up' | 'down' =
        orientation === 'vertical'
          ? prevIdx !== -1 && nextIdx !== -1 && nextIdx < prevIdx
            ? 'up'
            : 'down'
          : prevIdx !== -1 && nextIdx !== -1 && nextIdx < prevIdx
          ? 'left'
          : 'right';

      setBulgeEffect(prev => ({
        key: prev.key + 1,
        direction,
        active: true,
      }));

      // Retrigger Seesaw Tilt reliably on Mobile & Tablet even for rapid clicks
      setSeesawClass('');
      const targetSeesaw =
        nextIdx !== -1 && items.length > 1
          ? nextIdx <= (items.length - 1) / 2 && direction === 'left'
            ? 'animate-seesaw-left'
            : nextIdx >= (items.length - 1) / 2 && direction === 'right'
            ? 'animate-seesaw-right'
            : direction === 'left'
            ? 'animate-seesaw-left'
            : direction === 'right'
            ? 'animate-seesaw-right'
            : 'animate-seesaw-center'
          : 'animate-seesaw-center';

      const rafSeesaw = window.requestAnimationFrame(() => {
        setSeesawClass(targetSeesaw);
      });

      // Keep active tab centered inside horizontal overflow container without page scroll jump
      const navEl = navRef.current;
      const btnEl = btnRefs.current[activeId];
      if (orientation === 'horizontal' && navEl && btnEl && navEl.scrollWidth > navEl.clientWidth) {
        const targetScrollLeft = Math.max(
          0,
          btnEl.offsetLeft - navEl.clientWidth / 2 + btnEl.offsetWidth / 2
        );
        navEl.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      }

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setBulgeEffect(prev => ({ ...prev, active: false }));
        setSeesawClass('');
      }, 560);

      return () => {
        window.cancelAnimationFrame(rafSeesaw);
      };
    }
  }, [activeId, items, orientation]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  React.useLayoutEffect(() => {
    measureActiveButton();
    const rafId = window.requestAnimationFrame(measureActiveButton);

    const stageEl = stageRef.current;
    const activeBtn = btnRefs.current[activeId];
    let ro: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined' && stageEl) {
      ro = new ResizeObserver(() => {
        measureActiveButton();
      });
      ro.observe(stageEl);
      if (activeBtn) ro.observe(activeBtn);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      ro?.disconnect();
    };
  }, [activeId, items.length, orientation, fullWidth, wrap, size, measureActiveButton]);

  const containerRadius = pill ? 'rounded-full' : 'rounded-[18px] sm:rounded-[20px]';
  const capsuleRadius = pill ? 'rounded-full' : 'rounded-[13px]';

  const bulgeAnimClass =
    bulgeEffect.active
      ? bulgeEffect.direction === 'up'
        ? 'animate-liquid-bulge-up'
        : bulgeEffect.direction === 'down'
        ? 'animate-liquid-bulge-down'
        : bulgeEffect.direction === 'left'
        ? 'animate-liquid-bulge-left'
        : 'animate-liquid-bulge-right'
      : '';

  const trailAnimClass =
    bulgeEffect.direction === 'up'
      ? 'animate-liquid-trail-up'
      : bulgeEffect.direction === 'down'
      ? 'animate-liquid-trail-down'
      : bulgeEffect.direction === 'left'
      ? 'animate-liquid-trail-left'
      : 'animate-liquid-trail-right';

  const buttonSizing =
    orientation === 'vertical'
      ? 'h-12 w-12 justify-center rounded-[16px]'
      : size === 'sm'
      ? `min-h-[34px] h-8.5 px-3 text-[11px] ${capsuleRadius}`
      : `min-h-[38px] h-9.5 px-3.5 text-xs ${capsuleRadius}`;

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      style={
        embedded
          ? undefined
          : {
              background:
                'linear-gradient(135deg, rgba(116, 104, 196, 0.86) 0%, rgba(101, 88, 181, 0.82) 100%)',
              boxShadow:
                '0 14px 32px -6px rgba(74, 62, 152, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.36)',
            }
      }
      className={`relative max-w-full text-white ${
        embedded
          ? 'bg-transparent border-0 p-0 shadow-none'
          : `border border-white/30 p-1.5 backdrop-blur-2xl backdrop-saturate-150 ${containerRadius}`
      } ${
        orientation === 'horizontal'
          ? wrap
            ? 'overflow-visible'
            : 'overflow-x-auto overflow-y-hidden scrollbar-none'
          : 'overflow-visible'
      } ${seesawClass} ${className}`}
    >
      <div
        ref={stageRef}
        className={`relative flex ${
          orientation === 'vertical'
            ? 'flex-col items-center gap-2'
            : fullWidth
            ? 'w-full items-center gap-1'
            : wrap
            ? 'flex-wrap items-center gap-1.5'
            : 'w-max min-w-full items-center gap-1.5'
        }`}
      >
        {/* Sliding Frosted Liquid Bulge Capsule */}
        {indicatorRect && (
          <div
            aria-hidden="true"
            style={{
              top: `${indicatorRect.top}px`,
              left: `${indicatorRect.left}px`,
              width: `${indicatorRect.width}px`,
              height: `${indicatorRect.height}px`,
            }}
            className="pointer-events-none absolute z-0 transition-[top,left,width,height] duration-400 ease-[cubic-bezier(0.32,1.28,0.56,1)] motion-reduce:transition-none will-change-[top,left,width,height]"
          >
            {/* Viscous Directional Trail Droplet */}
            {bulgeEffect.active && (
              <div
                key={`trail-${bulgeEffect.key}`}
                className={`absolute inset-0.5 ${capsuleRadius} bg-gradient-to-r from-[#A79CFF]/38 to-[#FF7597]/24 blur-[2px] ${trailAnimClass}`}
              />
            )}

            {/* Ambient Fluid Aura */}
            <div
              key={`aura-${bulgeEffect.key}`}
              className={`absolute inset-0 ${capsuleRadius} bg-[#A79CFF]/28 blur-[5px] ${
                bulgeEffect.active ? 'animate-liquid-aura' : 'opacity-45'
              }`}
            />

            {/* Main Frosted Glass Liquid Capsule */}
            <div
              key={`bulge-${bulgeEffect.key}`}
              style={{
                background:
                  'linear-gradient(160deg, rgba(255, 255, 255, 0.34) 0%, rgba(192, 182, 255, 0.20) 52%, rgba(86, 70, 174, 0.34) 100%)',
              }}
              className={`relative h-full w-full overflow-hidden ${capsuleRadius} border border-white/45 backdrop-blur-md shadow-[0_8px_20px_-4px_rgba(48,36,120,0.36),inset_0_1px_1px_rgba(255,255,255,0.52)] ${bulgeAnimClass}`}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10" />
              {bulgeEffect.active && (
                <div className="animate-liquid-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent via-white/38 to-transparent" />
              )}
            </div>

            {/* Coral Meniscus Indicator */}
            {orientation === 'vertical' ? (
              <span
                className={`pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 w-[3.5px] rounded-full bg-gradient-to-b from-[#FF8FAD] to-[#FF5F8D] shadow-[0_0_10px_rgba(255,117,151,0.85)] transition-all duration-300 ${
                  bulgeEffect.active ? 'h-6' : 'h-4.5'
                }`}
              />
            ) : (
              <span
                className={`pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-gradient-to-r from-[#FF8FAD] via-[#FF7597] to-[#FF5F8D] shadow-[0_0_10px_rgba(255,117,151,0.85)] transition-all duration-300 ${
                  bulgeEffect.active ? 'w-8' : 'w-5'
                }`}
              />
            )}
          </div>
        )}

        {items.map(item => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              ref={el => {
                btnRefs.current[item.id] = el;
              }}
              type="button"
              onClick={() => onSelect(item.id)}
              title={item.title || item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`no-ornament group relative z-10 inline-flex items-center justify-center gap-1.5 font-extrabold whitespace-nowrap cursor-pointer transition-colors duration-200 leading-none ${buttonSizing} ${
                fullWidth && orientation === 'horizontal' ? 'flex-1 min-w-0' : 'shrink-0'
              } ${
                isActive
                  ? indicatorRect
                    ? 'bg-transparent text-white drop-shadow-[0_1px_2px_rgba(48,36,120,0.45)]'
                    : 'bg-white/25 text-white border border-white/40 shadow-sm'
                  : 'text-white/85 hover:bg-white/15 hover:text-white'
              }`}
            >
              {item.icon && (
                <span
                  key={isActive && bulgeEffect.active ? `icon-${bulgeEffect.key}` : 'icon-rest'}
                  className={`flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isActive
                      ? bulgeEffect.active
                        ? 'animate-liquid-icon-jelly'
                        : 'scale-105'
                      : 'group-hover:scale-110 group-hover:-rotate-3'
                  }`}
                >
                  {item.icon}
                </span>
              )}

              {orientation !== 'vertical' && (
                <span className={fullWidth ? 'truncate' : ''}>{item.label}</span>
              )}

              {item.badge !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-black tabular-nums leading-none shrink-0 ${
                    isActive
                      ? 'bg-[#FF6E96] text-white shadow-xs'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {item.dot && (
                <span className="h-2 w-2 rounded-full bg-[#FF6E96] animate-pulse shrink-0 shadow-[0_0_6px_rgba(255,110,150,0.9)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
