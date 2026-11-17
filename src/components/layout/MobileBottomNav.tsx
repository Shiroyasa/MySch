import React from 'react';
import { useApp } from '../../context/AppContext';
import { Menu } from 'lucide-react';
import { OrbitaMenuIcon } from '../common/AcademyOrnaments';

interface MobileBottomNavProps {
  isHidden: boolean;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  onOpenAgendaDrawer: () => void;
  onCloseAgendaDrawer: () => void;
  rightDrawerOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isHidden,
  onOpenSidebar,
  onCloseSidebar,
  onOpenAgendaDrawer,
  onCloseAgendaDrawer,
  rightDrawerOpen,
}) => {
  const { currentRole, activeNav, setActiveNav, attendanceCorrections } = useApp();

  const pendingCorrectionsCount = attendanceCorrections.filter(c => c.status === 'pending').length;

  const quickTabs = React.useMemo(
    () =>
      currentRole === 'siswa'
        ? [
            { id: 'student-profile', label: 'Profil', icon: 'student-profile' },
            { id: 'student-grades', label: 'Nilai', icon: 'student-grades' },
            { id: 'pkl', label: 'PKL', icon: 'pkl' },
          ]
        : currentRole === 'admin' || currentRole === 'super_admin'
        ? [
            { id: 'dashboard', label: 'Beranda', icon: 'dashboard' },
            { id: 'attendance', label: 'Presensi', icon: 'attendance' },
            { id: 'master-data', label: 'Data', icon: 'master-data' },
          ]
        : [
            { id: 'dashboard', label: 'Beranda', icon: 'dashboard' },
            { id: 'attendance', label: 'Presensi', icon: 'attendance' },
            { id: 'grading', label: 'Nilai', icon: 'grading' },
          ],
    [currentRole]
  );

  const activeDockId = rightDrawerOpen ? 'agenda' : activeNav;
  const dockIdsOrder = React.useMemo(
    () => [...quickTabs.map(t => t.id), 'agenda', 'menu'],
    [quickTabs]
  );

  const navRef = React.useRef<HTMLElement | null>(null);
  const btnRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const prevDockRef = React.useRef<string>(activeDockId);
  const timerRef = React.useRef<number | null>(null);

  const [indicatorRect, setIndicatorRect] = React.useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const [bulgeEffect, setBulgeEffect] = React.useState<{
    key: number;
    direction: 'left' | 'right';
    active: boolean;
  }>({
    key: 0,
    direction: 'right',
    active: false,
  });

  const [seesawClass, setSeesawClass] = React.useState<string>('');

  const measureActiveButton = React.useCallback(() => {
    const btnEl = btnRefs.current[activeDockId];
    if (!btnEl) {
      setIndicatorRect(null);
      return;
    }
    const nextRect = {
      top: btnEl.offsetTop,
      left: btnEl.offsetLeft,
      width: btnEl.offsetWidth,
      height: btnEl.offsetHeight,
    };
    setIndicatorRect(prev => {
      if (
        prev &&
        prev.top === nextRect.top &&
        prev.left === nextRect.left &&
        prev.width === nextRect.width &&
        prev.height === nextRect.height
      ) {
        return prev;
      }
      return nextRect;
    });
  }, [activeDockId]);

  const triggerSeesawAndBulge = React.useCallback(
    (targetId: string) => {
      const prevIdx = dockIdsOrder.indexOf(prevDockRef.current);
      const nextIdx = dockIdsOrder.indexOf(targetId);
      const direction: 'left' | 'right' =
        prevIdx !== -1 && nextIdx !== -1 && nextIdx < prevIdx ? 'left' : 'right';

      setBulgeEffect(prev => ({
        key: prev.key + 1,
        direction,
        active: true,
      }));

      setSeesawClass('');
      const targetSeesaw =
        nextIdx === 0 || direction === 'left'
          ? 'animate-seesaw-left'
          : nextIdx >= 3 || direction === 'right'
          ? 'animate-seesaw-right'
          : 'animate-seesaw-center';

      window.requestAnimationFrame(() => {
        setSeesawClass(targetSeesaw);
      });

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setBulgeEffect(prev => ({ ...prev, active: false }));
        setSeesawClass('');
      }, 560);
    },
    [dockIdsOrder]
  );

  React.useEffect(() => {
    if (prevDockRef.current !== activeDockId) {
      triggerSeesawAndBulge(activeDockId);
      prevDockRef.current = activeDockId;
    }
  }, [activeDockId, triggerSeesawAndBulge]);

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

    const navEl = navRef.current;
    const activeBtn = btnRefs.current[activeDockId];
    let ro: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined' && navEl) {
      ro = new ResizeObserver(() => {
        measureActiveButton();
      });
      ro.observe(navEl);
      if (activeBtn) ro.observe(activeBtn);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      ro?.disconnect();
    };
  }, [activeDockId, quickTabs.length, isHidden, measureActiveButton]);

  const handleBottomTabClick = (tabId: string) => {
    onCloseSidebar();
    onCloseAgendaDrawer();
    triggerSeesawAndBulge(tabId);
    setActiveNav(tabId);
  };

  const handleAgendaClick = () => {
    onCloseSidebar();
    triggerSeesawAndBulge('agenda');
    onOpenAgendaDrawer();
  };

  const handleMenuClick = () => {
    triggerSeesawAndBulge('menu');
    onOpenSidebar();
  };

  return (
    <div
      className="no-print lg:hidden fixed bottom-2.5 sm:bottom-4 inset-x-2.5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[460px] sm:max-w-[calc(100vw-32px)] z-30 pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav
        ref={navRef}
        aria-label="Navigasi Cepat Mobile dan Tablet"
        aria-hidden={isHidden}
        style={{
          background:
            'linear-gradient(135deg, rgba(116, 104, 196, 0.84) 0%, rgba(101, 88, 181, 0.80) 100%)',
          boxShadow:
            '0 18px 38px -6px rgba(74, 62, 152, 0.44), inset 0 1px 0 rgba(255, 255, 255, 0.34)',
        }}
        className={`relative flex h-14 sm:h-[60px] items-center justify-around gap-1 rounded-[22px] sm:rounded-[26px] border border-white/30 px-1.5 sm:px-2 backdrop-blur-2xl backdrop-saturate-150 transition-[transform,opacity,filter] duration-400 will-change-transform ${
          isHidden
            ? 'translate-y-28 scale-90 opacity-0 blur-[2px] pointer-events-none ease-[cubic-bezier(0.22,1,0.36,1)]'
            : 'translate-y-0 scale-100 opacity-100 blur-0 pointer-events-auto ease-[cubic-bezier(0.34,1.35,0.64,1)]'
        } ${seesawClass}`}
      >
        {/* Sliding Frosted Liquid Bulge Capsule across Bottom Dock */}
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
            {bulgeEffect.active && (
              <div
                key={`trail-${bulgeEffect.key}`}
                className={`absolute inset-0.5 rounded-[16px] sm:rounded-[18px] bg-gradient-to-r from-[#A79CFF]/40 to-[#FF7597]/28 blur-[2px] ${
                  bulgeEffect.direction === 'left'
                    ? 'animate-liquid-trail-left'
                    : 'animate-liquid-trail-right'
                }`}
              />
            )}

            <div
              key={`aura-${bulgeEffect.key}`}
              className={`absolute inset-0 rounded-[16px] sm:rounded-[18px] ${
                rightDrawerOpen ? 'bg-[#FF7597]/38' : 'bg-[#A79CFF]/28'
              } blur-[5px] ${bulgeEffect.active ? 'animate-liquid-aura' : 'opacity-45'}`}
            />

            <div
              key={`bulge-${bulgeEffect.key}`}
              style={{
                background: rightDrawerOpen
                  ? 'linear-gradient(155deg, rgba(255, 132, 168, 0.78) 0%, rgba(242, 87, 129, 0.72) 100%)'
                  : 'linear-gradient(160deg, rgba(255, 255, 255, 0.34) 0%, rgba(192, 182, 255, 0.20) 52%, rgba(86, 70, 174, 0.34) 100%)',
              }}
              className={`relative h-full w-full overflow-hidden rounded-[16px] sm:rounded-[18px] border border-white/45 backdrop-blur-md shadow-[0_8px_20px_-4px_rgba(48,36,120,0.36),inset_0_1px_1px_rgba(255,255,255,0.5)] ${
                bulgeEffect.active
                  ? bulgeEffect.direction === 'left'
                    ? 'animate-liquid-bulge-left'
                    : 'animate-liquid-bulge-right'
                  : ''
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10" />
              {bulgeEffect.active && (
                <div className="animate-liquid-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              )}
            </div>

            <span
              className={`pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-gradient-to-r from-[#FF8FAD] via-[#FF7597] to-[#FF5F8D] shadow-[0_0_10px_rgba(255,117,151,0.85)] transition-all duration-300 ${
                bulgeEffect.active ? 'w-7' : 'w-4.5'
              }`}
            />
          </div>
        )}

        {quickTabs.map(tab => {
          const isActive = activeNav === tab.id && !rightDrawerOpen;
          return (
            <button
              key={tab.id}
              ref={el => {
                btnRefs.current[tab.id] = el;
              }}
              type="button"
              tabIndex={isHidden ? -1 : 0}
              onClick={() => handleBottomTabClick(tab.id)}
              className={`no-ornament relative z-10 flex min-h-[44px] sm:min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[16px] sm:rounded-[18px] px-1 transition-colors duration-200 cursor-pointer ${
                isActive
                  ? indicatorRect
                    ? 'bg-transparent text-white -translate-y-0.5'
                    : 'bg-white/24 border border-white/38 text-white shadow-[0_8px_18px_rgba(48,36,120,0.30)] -translate-y-0.5'
                  : 'text-white/85 hover:bg-white/15 hover:text-white'
              }`}
            >
              <span
                key={isActive && bulgeEffect.active ? `icon-${bulgeEffect.key}` : 'icon-rest'}
                className={`flex items-center justify-center ${
                  isActive
                    ? bulgeEffect.active
                      ? 'animate-liquid-icon-jelly'
                      : 'animate-dock-pop'
                    : ''
                }`}
              >
                <OrbitaMenuIcon variant={tab.icon} className="h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold leading-none tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Quick Toggle for Agenda KBM & Live GPS Map Drawer */}
        <button
          ref={el => {
            btnRefs.current['agenda'] = el;
          }}
          type="button"
          tabIndex={isHidden ? -1 : 0}
          onClick={handleAgendaClick}
          className={`no-ornament relative z-10 flex min-h-[44px] sm:min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[16px] sm:rounded-[18px] px-1 transition-colors duration-200 cursor-pointer ${
            rightDrawerOpen
              ? indicatorRect
                ? 'bg-transparent text-white -translate-y-0.5'
                : 'bg-[#FF7597]/85 border border-white/38 text-white shadow-[0_8px_20px_rgba(255,117,151,0.38)] -translate-y-0.5'
              : 'text-white/85 hover:bg-white/15 hover:text-white'
          }`}
        >
          <div
            className={`relative ${
              rightDrawerOpen
                ? bulgeEffect.active
                  ? 'animate-liquid-icon-jelly'
                  : 'animate-dock-pop'
                : ''
            }`}
          >
            <OrbitaMenuIcon variant="location" className="h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0" />
            {pendingCorrectionsCount > 0 && !rightDrawerOpen && (
              <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#FF6E96] px-1 text-[8px] font-black text-white shadow-xs">
                {pendingCorrectionsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-extrabold leading-none tracking-tight whitespace-nowrap">
            Agenda
          </span>
        </button>

        {/* Full Menu Drawer Trigger — Opens Sidebar and triggers Seesaw Tilt */}
        <button
          type="button"
          tabIndex={isHidden ? -1 : 0}
          onClick={handleMenuClick}
          className="no-ornament relative z-10 flex min-h-[44px] sm:min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[16px] sm:rounded-[18px] px-1 text-white/85 hover:bg-white/15 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-extrabold leading-none tracking-tight whitespace-nowrap">
            Menu
          </span>
        </button>
      </nav>
    </div>
  );
};
