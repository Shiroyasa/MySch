import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Camera, ChevronLeft, RefreshCw, X } from 'lucide-react';
import { OrbitaMenuIcon } from '../common/AcademyOrnaments';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  subLabel: string;
  roles: UserRole[];
  badge?: string;
}

interface FloatingTooltipState {
  id: string;
  label: string;
  subLabel: string;
  top: number;
  left: number;
  orbitDeg: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const {
    currentRole,
    activeNav,
    setActiveNav,
    attendanceCorrections,
    setShowLogoutModal,
    visualSettings,
    schoolSettings,
    updateVisualSettings,
    addToast,
    isSyncing,
    isFirestoreConnected,
    forceCloudResync,
  } = useApp();

  const quickLogoInputRef = React.useRef<HTMLInputElement | null>(null);
  const isAdmin = currentRole === 'admin' || currentRole === 'super_admin';
  const activeLogoUrl = visualSettings?.appLogoUrl || schoolSettings?.logoUrl || null;

  // Always show labels inside the mobile/tablet slide-over drawer even if desktop sidebar is collapsed
  const showExpanded = !collapsed || mobileOpen;

  const handleQuickLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const res = ev.target?.result as string;
      if (res) {
        updateVisualSettings({ appLogoUrl: res });
        addToast('Logo aplikasi berhasil diperbarui!', 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const pendingCorrectionsCount = attendanceCorrections.filter(c => c.status === 'pending').length;

  const navItems: NavItem[] = [
    {
      id: 'student-profile',
      label: 'Profil Siswa',
      subLabel: 'Biodata & Kehadiran',
      roles: ['siswa'],
    },
    {
      id: 'student-grades',
      label: 'Nilai Akademik',
      subLabel: 'Transkrip & KKM',
      roles: ['siswa'],
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      subLabel: 'Overview Utama',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
    {
      id: 'attendance',
      label: 'Presensi & Absensi',
      subLabel: 'Rekapitulasi Harian',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
      badge:
        pendingCorrectionsCount > 0 && ['wali_kelas', 'guru', 'super_admin'].includes(currentRole)
          ? `${pendingCorrectionsCount}`
          : undefined,
    },
    {
      id: 'grading',
      label: 'Penilaian Akademik',
      subLabel: 'Evaluasi & KKM',
      roles: ['super_admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
    {
      id: 'reports',
      label: 'Laporan & Ekspor',
      subLabel: 'Analitik & Cetak',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
    {
      id: 'pkl',
      label: 'Administrasi PKL',
      subLabel: 'Monitoring Prakerin',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah', 'siswa'],
    },
    {
      id: 'master-data',
      label: 'Master Data',
      subLabel: 'Siswa, Guru & Kelas',
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'gallery',
      label: 'Galeri Kegiatan',
      subLabel: 'Foto & View Carousel',
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'user-management',
      label: 'Manajemen Akun',
      subLabel: 'Otorisasi Role',
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'audit-logs',
      label: 'Audit Log',
      subLabel: 'Jejak Keamanan',
      roles: ['super_admin', 'admin', 'kepala_sekolah'],
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      subLabel: 'Konfigurasi Sistem',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
  ];

  const [hoveredTooltip, setHoveredTooltip] = React.useState<FloatingTooltipState | null>(null);
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const wrapperRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const btnRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const prevNavRef = React.useRef<string>(activeNav);
  const bulgeTimeoutRef = React.useRef<number | null>(null);

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));
  const activeIdx = Math.max(
    0,
    visibleItems.findIndex(i => i.id === activeNav)
  );
  const activeItemHasBadge = visibleItems.some(i => i.id === activeNav && Boolean(i.badge));

  // Compute radial orbit angle (-55deg to +55deg) for each navigation satellite node
  const getOrbitAngle = (index: number, total: number): number => {
    if (total <= 1) return 0;
    const normalized = index / (total - 1); // 0 to 1
    return Math.round((normalized - 0.5) * 110);
  };

  // Compute subtle radial arc horizontal offset (in px) so items follow an orbital curve
  const getRadialArcOffset = (index: number, total: number, expanded: boolean): number => {
    if (total <= 2) return 0;
    const progress = index / (total - 1); // 0 .. 1
    const sine = Math.sin(progress * Math.PI); // peaks at center (1.0)
    return expanded ? Math.round(sine * 7) : Math.round(sine * 4);
  };

  const [indicatorRect, setIndicatorRect] = React.useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const [bulgeEffect, setBulgeEffect] = React.useState<{
    key: number;
    direction: 'up' | 'down';
    active: boolean;
  }>({
    key: 0,
    direction: 'down',
    active: false,
  });

  const measureActiveButton = React.useCallback(() => {
    const wrapperEl = wrapperRefs.current[activeNav];
    const btnEl = btnRefs.current[activeNav];
    if (!wrapperEl || !btnEl) return;

    const top = wrapperEl.offsetTop + btnEl.offsetTop;
    const left = wrapperEl.offsetLeft + btnEl.offsetLeft;
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
  }, [activeNav]);

  React.useEffect(() => {
    if (showExpanded) {
      setHoveredTooltip(null);
    }
  }, [showExpanded]);

  // Detect active menu change -> trigger directional Radial Liquid Bulge animation
  React.useEffect(() => {
    if (prevNavRef.current !== activeNav) {
      const prevIdx = visibleItems.findIndex(i => i.id === prevNavRef.current);
      const nextIdx = visibleItems.findIndex(i => i.id === activeNav);
      const direction: 'up' | 'down' =
        prevIdx !== -1 && nextIdx !== -1 && nextIdx < prevIdx ? 'up' : 'down';
      prevNavRef.current = activeNav;

      setBulgeEffect(prev => ({
        key: prev.key + 1,
        direction,
        active: true,
      }));

      if (bulgeTimeoutRef.current) {
        window.clearTimeout(bulgeTimeoutRef.current);
      }
      bulgeTimeoutRef.current = window.setTimeout(() => {
        setBulgeEffect(prev => ({ ...prev, active: false }));
      }, 620);
    }
  }, [activeNav, visibleItems]);

  React.useEffect(() => {
    return () => {
      if (bulgeTimeoutRef.current) {
        window.clearTimeout(bulgeTimeoutRef.current);
      }
    };
  }, []);

  // Measure immediately on layout changes & watch width collapse/expand via ResizeObserver
  React.useLayoutEffect(() => {
    measureActiveButton();
    const rafId = window.requestAnimationFrame(measureActiveButton);

    const stageEl = stageRef.current;
    const activeBtn = btnRefs.current[activeNav];
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
  }, [activeNav, showExpanded, mobileOpen, visibleItems.length, measureActiveButton]);

  const handleSelectNav = (id: string) => {
    setHoveredTooltip(null);
    setActiveNav(id);
    onCloseMobile();
  };

  const showFloatingTooltip = (item: NavItem, index: number, el: HTMLButtonElement) => {
    setHoveredItemId(item.id);
    if (showExpanded) return;
    const rect = el.getBoundingClientRect();
    setHoveredTooltip({
      id: item.id,
      label: item.label,
      subLabel: item.subLabel,
      top: rect.top + rect.height / 2,
      left: rect.right,
      orbitDeg: getOrbitAngle(index, visibleItems.length),
    });
  };

  const activeOrbitDeg = getOrbitAngle(activeIdx, visibleItems.length);

  return (
    <>
      {/* Mobile / Tablet Drawer Backdrop */}
      <div
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-40 bg-[#231B54]/35 dark:bg-[#080616]/60 backdrop-blur-md transition-opacity duration-300 ease-out lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Radial Orbit + Liquid Bulge Adaptive Transparent Glass Sidebar */}
      <aside
        onTransitionEnd={e => {
          if (e.propertyName === 'width' || e.propertyName === 'transform') {
            measureActiveButton();
          }
        }}
        className={`fixed top-2.5 bottom-2.5 left-2.5 z-50 flex flex-col items-center justify-between overflow-hidden rounded-[32px] border border-white/60 dark:border-[#9E92FF]/24 bg-white/58 dark:bg-[#130F2E]/56 backdrop-blur-2xl backdrop-saturate-180 py-4 sm:py-5 text-[#2E265E] dark:text-white shadow-[0_24px_60px_-12px_rgba(88,72,184,0.22),inset_0_1px_2px_rgba(255,255,255,0.88)] dark:shadow-[0_26px_68px_-12px_rgba(4,3,14,0.72),inset_0_1px_1px_rgba(255,255,255,0.16)] transition-[transform,opacity,width,background-color] duration-300 will-change-transform lg:static lg:my-4 lg:ml-4 ${
          showExpanded ? 'w-[274px] max-w-[85vw] lg:w-[248px]' : 'w-[82px]'
        } ${
          mobileOpen
            ? 'translate-x-0 scale-100 opacity-100 pointer-events-auto ease-[cubic-bezier(0.34,1.25,0.64,1)]'
            : '-translate-x-[118%] scale-[0.94] opacity-0 pointer-events-none ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 lg:scale-100 lg:opacity-100 lg:pointer-events-auto'
        }`}
      >
        {/* Ambient Radial Orbit Background Rings & Adaptive Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]"
        >
          {/* Adaptive radial light/dark aura that follows active item */}
          <div
            style={{
              top: indicatorRect ? `${indicatorRect.top - 40}px` : '35%',
            }}
            className="absolute -left-10 h-36 w-36 rounded-full bg-gradient-to-br from-[#7468C4]/30 via-[#9E92FF]/22 to-[#FF6E96]/25 dark:from-[#8D81E3]/35 dark:via-[#6558B5]/25 dark:to-[#FF6E96]/25 blur-2xl transition-[top] duration-500 ease-out"
          />

          {/* SVG Radial Orbit Trajectory Curve */}
          <svg
            className="absolute inset-y-0 left-0 h-full w-full opacity-55 dark:opacity-45"
            viewBox="0 0 260 800"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="orbitaSidebarOrbitLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8D81E3" stopOpacity="0.05" />
                <stop offset="25%" stopColor="#7468C4" stopOpacity="0.42" />
                <stop offset="50%" stopColor="#FF6E96" stopOpacity="0.55" />
                <stop offset="75%" stopColor="#7468C4" stopOpacity="0.42" />
                <stop offset="100%" stopColor="#8D81E3" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Outer Radial Orbit Arc */}
            <path
              d={
                showExpanded
                  ? 'M 14 70 Q 42 400 14 730'
                  : 'M 22 70 Q 54 400 22 730'
              }
              stroke="url(#orbitaSidebarOrbitLine)"
              strokeWidth="1.5"
              strokeDasharray="4 5"
            />
            {/* Secondary Harmonic Orbit Arc */}
            <path
              d={
                showExpanded
                  ? 'M 6 110 Q 28 400 6 690'
                  : 'M 12 110 Q 38 400 12 690'
              }
              stroke="url(#orbitaSidebarOrbitLine)"
              strokeWidth="0.9"
              strokeOpacity="0.5"
            />
          </svg>
        </div>

        {isAdmin && (
          <input
            ref={quickLogoInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/webp,image/jpeg,image/x-icon"
            onChange={handleQuickLogoUpload}
            className="hidden"
          />
        )}

        {/* Top Planetary Core Hub + Mobile/Tablet Close Button */}
        <div
          className={`relative z-10 flex w-full items-center justify-between gap-2 ${
            showExpanded ? 'px-3.5' : 'px-2.5'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              if (!mobileOpen) onToggleCollapse();
              else if (isAdmin) quickLogoInputRef.current?.click();
            }}
            onDoubleClick={() => {
              if (isAdmin) quickLogoInputRef.current?.click();
            }}
            title={
              !showExpanded
                ? 'Klik untuk membuka Orbit Menu (Klik 2x ganti logo)'
                : 'Klik untuk mode Radial Orbit Ringkas (Klik 2x ganti logo)'
            }
            className={`no-ornament group relative flex items-center justify-center border border-white/65 dark:border-[#9E92FF]/28 bg-white/55 dark:bg-white/8 hover:bg-white/80 dark:hover:bg-white/14 active:scale-95 text-[#2E265E] dark:text-white shadow-[0_8px_24px_-6px_rgba(92,78,178,0.18),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_10px_26px_-6px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 cursor-pointer ${
              !showExpanded
                ? 'h-12 w-12 mx-auto rounded-full'
                : 'flex-1 min-w-0 gap-2.5 rounded-[22px] px-2.5 py-2 justify-start'
            }`}
          >
            {/* Radial Planetary Ring around Core Logo */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <span
                style={{ transform: `rotate(${activeOrbitDeg}deg)` }}
                className="pointer-events-none absolute inset-0 rounded-full border border-dashed border-[#7468C4]/55 dark:border-[#A79CFF]/55 transition-transform duration-500 ease-out group-hover:rotate-45"
              />
              <span
                style={{ transform: `rotate(${activeOrbitDeg * 1.4}deg)` }}
                className="pointer-events-none absolute inset-0 flex items-start justify-center transition-transform duration-500 ease-out"
              >
                <span className="-mt-0.5 h-1.5 w-1.5 rounded-full bg-[#FF6E96] shadow-[0_0_8px_#FF6E96]" />
              </span>

              <div className="relative flex h-7.5 w-7.5 items-center justify-center rounded-full bg-gradient-to-br from-[#7468C4] to-[#5648A8] text-white shadow-inner">
                {activeLogoUrl ? (
                  <img
                    src={activeLogoUrl}
                    alt="ORBITA"
                    className="h-6.5 w-6.5 rounded-full object-contain"
                  />
                ) : (
                  <OrbitaMenuIcon variant="brand" className="h-4.5 w-4.5 text-white" />
                )}
                {isAdmin && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-3 w-3 text-white" />
                  </span>
                )}
              </div>
            </div>

            {showExpanded && (
              <>
                <div className="min-w-0 flex-1 text-left animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-extrabold tracking-tight text-[#2E265E] dark:text-white leading-none">
                      ORBITA
                    </p>
                    <span className="rounded-md bg-[#7468C4]/15 dark:bg-[#9E92FF]/20 px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-[#5B4EB0] dark:text-[#C8C0FF]">
                      {activeOrbitDeg >= 0 ? `+${activeOrbitDeg}°` : `${activeOrbitDeg}°`}
                    </span>
                  </div>
                  <p className="truncate text-[10px] font-semibold text-[#6E6696] dark:text-white/70 mt-0.5">
                    Radial Orbit Portal
                  </p>
                </div>
                <span className="hidden lg:flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7468C4]/12 dark:bg-white/10 text-[#5B4EB0] dark:text-white/75 group-hover:bg-[#7468C4]/22 dark:group-hover:bg-white/20 transition-colors">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </span>
              </>
            )}
          </button>

          {/* Explicit Touch Close Button for Mobile/Tablet Drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup Menu"
            className="no-ornament lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/60 dark:border-white/20 bg-white/65 dark:bg-white/12 text-[#2E265E] dark:text-white active:scale-95 transition-all cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Center Radial Orbit Navigation Stage with Morphing Liquid Bulge Glass Capsule */}
        <nav
          aria-label="Menu Utama Radial Orbit"
          onScroll={() => setHoveredTooltip(null)}
          className="relative z-10 my-2 flex w-full flex-1 flex-col overflow-y-auto overflow-x-hidden scrollbar-none"
        >
          <div
            ref={stageRef}
            className={`relative my-auto flex w-full flex-col items-center gap-1.5 py-1.5 ${
              showExpanded ? 'px-3' : 'px-2'
            }`}
          >
            {/* Floating Cohesive Liquid Bulge Glassy Capsule Layer */}
            {indicatorRect && (
              <div
                aria-hidden="true"
                style={{
                  top: `${indicatorRect.top}px`,
                  left: `${indicatorRect.left}px`,
                  width: `${indicatorRect.width}px`,
                  height: `${indicatorRect.height}px`,
                }}
                className={`pointer-events-none absolute z-0 transition-[top,left,width,height,opacity,transform] duration-450 ease-[cubic-bezier(0.28,1.35,0.52,1)] motion-reduce:transition-none will-change-[top,left,width,height] ${
                  mobileOpen
                    ? 'max-lg:opacity-100 max-lg:translate-x-0'
                    : 'max-lg:opacity-0 max-lg:-translate-x-4'
                }`}
              >
                {/* Viscous Directional Liquid Bulge Trail Droplet */}
                {bulgeEffect.active && (
                  <div
                    key={`trail-${bulgeEffect.key}`}
                    className={`absolute -inset-1 rounded-[22px] bg-gradient-to-b from-[#7468C4]/40 via-[#9E92FF]/30 to-[#FF6E96]/35 blur-[4px] ${
                      bulgeEffect.direction === 'up'
                        ? 'animate-liquid-trail-up'
                        : 'animate-liquid-trail-down'
                    }`}
                  />
                )}

                {/* Radial Orbit Halo Aura */}
                <div
                  key={`aura-${bulgeEffect.key}`}
                  className={`absolute -inset-0.5 rounded-[22px] bg-gradient-to-r from-[#7468C4]/30 via-[#9E92FF]/25 to-[#FF6E96]/25 blur-[6px] ${
                    bulgeEffect.active ? 'animate-liquid-aura' : 'opacity-65'
                  }`}
                />

                {/* Main Morphing Transparent Glassy Liquid Bulge Capsule */}
                <div
                  key={`bulge-${bulgeEffect.key}`}
                  className={`relative h-full w-full overflow-hidden rounded-[20px] border border-white/80 dark:border-[#B5ABFF]/45 bg-gradient-to-r from-[#7468C4]/22 via-[#8D81E3]/18 to-[#FF6E96]/16 dark:from-[#8D81E3]/36 dark:via-[#6558B5]/28 dark:to-[#FF6E96]/22 backdrop-blur-xl shadow-[0_12px_28px_-6px_rgba(92,78,178,0.28),inset_0_1px_2px_rgba(255,255,255,0.92)] dark:shadow-[0_12px_28px_-6px_rgba(12,8,36,0.65),inset_0_1px_1.5px_rgba(255,255,255,0.35)] ${
                    bulgeEffect.active
                      ? bulgeEffect.direction === 'up'
                        ? 'animate-liquid-bulge-up'
                        : 'animate-liquid-bulge-down'
                      : ''
                  }`}
                >
                  {/* Top Specular Liquid Meniscus Highlight */}
                  <div className="pointer-events-none absolute inset-x-2 top-0 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-white/90 dark:via-white/60 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 dark:from-white/14 via-transparent to-transparent" />

                  {/* Glossy Diagonal Liquid Sheen Wave */}
                  {bulgeEffect.active && (
                    <div className="animate-liquid-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent via-white/50 dark:via-white/30 to-transparent" />
                  )}
                </div>

                {/* Left Radial Orbit Satellite Node Indicator */}
                <span
                  className={`pointer-events-none absolute -left-1 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 ${
                    bulgeEffect.active ? 'scale-125' : 'scale-100'
                  }`}
                >
                  <span className="h-3 w-3 rounded-full border-2 border-white dark:border-[#1E1945] bg-gradient-to-br from-[#FF8FAD] to-[#FF5C86] shadow-[0_0_12px_rgba(255,110,150,0.9)]" />
                </span>

                {/* Right Orbital Degree Micro-Bead in Expanded Mode */}
                {showExpanded && !activeItemHasBadge && (
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7468C4] dark:bg-[#B5ABFF] shadow-[0_0_6px_rgba(141,129,227,0.8)]" />
                  </span>
                )}
              </div>
            )}

            {visibleItems.map((item, idx) => {
              const isActive = activeNav === item.id;
              const isHovered = hoveredItemId === item.id;
              const arcOffset = getRadialArcOffset(idx, visibleItems.length, showExpanded);
              const orbitDeg = getOrbitAngle(idx, visibleItems.length);

              return (
                <div
                  key={item.id}
                  ref={el => {
                    wrapperRefs.current[item.id] = el;
                  }}
                  style={{
                    transform: `translateX(${arcOffset}px)`,
                    transitionDelay: mobileOpen ? `${Math.min(idx * 22, 160)}ms` : '0ms',
                  }}
                  className={`relative z-10 w-full flex justify-center transition-transform duration-300 ease-out ${
                    mobileOpen
                      ? 'max-lg:translate-x-0 max-lg:opacity-100'
                      : 'max-lg:-translate-x-4 max-lg:opacity-0'
                  }`}
                >
                  <button
                    ref={el => {
                      btnRefs.current[item.id] = el;
                    }}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    onMouseEnter={e => showFloatingTooltip(item, idx, e.currentTarget)}
                    onMouseLeave={() => {
                      setHoveredItemId(null);
                      setHoveredTooltip(null);
                    }}
                    onFocus={e => showFloatingTooltip(item, idx, e.currentTarget)}
                    onBlur={() => {
                      setHoveredItemId(null);
                      setHoveredTooltip(null);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`no-ornament group relative flex min-h-[44px] items-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${
                      !showExpanded
                        ? 'h-12 w-12 justify-center rounded-[20px]'
                        : 'w-full gap-3 rounded-[20px] pl-3.5 pr-3 py-2 justify-start'
                    } ${
                      isActive
                        ? indicatorRect
                          ? 'bg-transparent text-[#241C52] dark:text-white'
                          : 'bg-[#7468C4]/20 dark:bg-white/20 text-[#241C52] dark:text-white border border-white/60 dark:border-white/30 backdrop-blur-md'
                        : 'text-[#4A417A] dark:text-white/80 hover:bg-white/45 dark:hover:bg-white/10 hover:text-[#241C52] dark:hover:text-white hover:scale-[1.03] active:scale-95'
                    }`}
                  >
                    {/* Radial Orbit Icon Node with Rotating Ring */}
                    <span
                      key={isActive && bulgeEffect.active ? `icon-${bulgeEffect.key}` : 'icon-rest'}
                      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-br from-[#7468C4] to-[#5B4EB0] text-white shadow-[0_6px_16px_-2px_rgba(101,88,181,0.55)] ${
                              bulgeEffect.active ? 'animate-liquid-icon-jelly' : 'scale-105'
                            }`
                          : isHovered
                          ? 'bg-white/75 dark:bg-white/15 text-[#5B4EB0] dark:text-white scale-110 -rotate-3 shadow-sm'
                          : 'bg-white/45 dark:bg-white/8 text-[#524888] dark:text-white/85'
                      }`}
                    >
                      {/* Subtle Orbital Ring on Active or Hovered Icon */}
                      {(isActive || isHovered) && (
                        <span
                          className={`pointer-events-none absolute -inset-1 rounded-full border ${
                            isActive
                              ? 'border-[#FF6E96]/55 dark:border-[#FF8FAD]/50'
                              : 'border-[#7468C4]/35 dark:border-white/25'
                          } transition-transform duration-500`}
                          style={{ transform: `rotate(${orbitDeg}deg)` }}
                        />
                      )}
                      <OrbitaMenuIcon variant={item.id} className="h-4.5 w-4.5 shrink-0" />
                    </span>

                    {showExpanded && (
                      <div className="min-w-0 flex-1 text-left transition-transform duration-200 group-hover:translate-x-0.5">
                        <span
                          className={`block truncate text-xs font-extrabold leading-tight ${
                            isActive
                              ? 'text-[#21194D] dark:text-white'
                              : 'text-[#3E356E] dark:text-white/90'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`block truncate text-[10px] leading-tight mt-0.5 ${
                            isActive
                              ? 'font-semibold text-[#5B4EB0] dark:text-[#C8C0FF]'
                              : 'text-[#6E659B] dark:text-white/65'
                          }`}
                        >
                          {item.subLabel}
                        </span>
                      </div>
                    )}

                    {item.badge && (
                      <span
                        className={`${
                          !showExpanded ? 'absolute -top-1 -right-1' : 'shrink-0'
                        } flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-[#FF5C86] to-[#FF7597] px-1.5 text-[9.5px] font-extrabold text-white shadow-[0_4px_10px_rgba(255,92,134,0.45)]`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Bottom Cross-Device Sync Satellite + Logout Actions */}
        <div
          className={`relative z-10 flex w-full flex-col items-center gap-1.5 pt-1 ${
            showExpanded ? 'px-3.5' : 'px-2.5'
          }`}
        >
          {/* Cross-Device Real-Time Sync Button */}
          <button
            type="button"
            onClick={() => {
              forceCloudResync();
            }}
            disabled={isSyncing}
            title="Sinkronkan seluruh data yang telah diinput agar terbaca di semua perangkat"
            className={`no-ornament group flex min-h-[40px] items-center justify-center rounded-[18px] border border-white/60 dark:border-[#9E92FF]/22 bg-white/50 dark:bg-white/8 hover:bg-white/80 dark:hover:bg-white/15 text-[#3E356E] dark:text-white/90 active:scale-95 transition-all duration-300 cursor-pointer ${
              !showExpanded ? 'h-11 w-11' : 'w-full gap-2.5 px-3 py-2 justify-start'
            }`}
          >
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7468C4]/15 dark:bg-[#9E92FF]/20 text-[#5B4EB0] dark:text-[#C8C0FF]">
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-90 transition-transform duration-300'}`} />
              <span
                className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-white dark:border-[#151130] ${
                  isFirestoreConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            </span>
            {showExpanded && (
              <div className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[11px] font-extrabold leading-tight">
                  {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Device'}
                </span>
                <span className="block truncate text-[9.5px] font-medium text-[#6E659B] dark:text-white/65 leading-tight">
                  {isFirestoreConnected ? 'Live Cloud & Multi-Device' : 'Mode Sinkron Lokal'}
                </span>
              </div>
            )}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => {
              setHoveredTooltip(null);
              onCloseMobile();
              setShowLogoutModal(true);
            }}
            title="Keluar Sesi Akun (Log Out)"
            className={`no-ornament group flex min-h-[42px] items-center justify-center rounded-[18px] text-[#5B4E8C] dark:text-white/80 hover:bg-[#FF6E96]/20 hover:text-[#D92B60] dark:hover:text-white active:scale-95 transition-all duration-300 cursor-pointer ${
              !showExpanded ? 'h-11 w-11' : 'w-full gap-2.5 px-3.5 py-2 justify-start'
            }`}
          >
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              <OrbitaMenuIcon variant="logout" className="h-5 w-5 shrink-0" />
            </span>
            {showExpanded && <span className="text-xs font-extrabold whitespace-nowrap">Keluar Sesi</span>}
          </button>
        </div>
      </aside>

      {/* Portal-rendered Floating Desktop Radial Orbit Tooltip Pill */}
      {!showExpanded &&
        hoveredTooltip &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            style={{
              top: `${hoveredTooltip.top}px`,
              left: `${hoveredTooltip.left + 14}px`,
            }}
            className="pointer-events-none fixed z-[70] hidden lg:flex -translate-y-1/2 items-center animate-fade-in"
          >
            <div className="h-2.5 w-2.5 -mr-1.5 rotate-45 rounded-[2px] border-l border-b border-white/70 dark:border-[#9E92FF]/35 bg-white/85 dark:bg-[#1E1945]/90 backdrop-blur-xl" />
            <div className="flex flex-col rounded-[16px] border border-white/75 dark:border-[#9E92FF]/35 bg-white/82 dark:bg-[#1E1945]/88 px-3.5 py-2 text-[#241C52] dark:text-white shadow-[0_14px_34px_rgba(68,56,146,0.22)] backdrop-blur-2xl">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold whitespace-nowrap leading-tight">
                  {hoveredTooltip.label}
                </span>
                <span className="rounded bg-[#7468C4]/15 dark:bg-white/15 px-1 py-0.2 text-[8.5px] font-bold text-[#5B4EB0] dark:text-[#C8C0FF]">
                  {hoveredTooltip.orbitDeg >= 0
                    ? `+${hoveredTooltip.orbitDeg}°`
                    : `${hoveredTooltip.orbitDeg}°`}
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#655C91] dark:text-white/75 whitespace-nowrap leading-tight mt-0.5">
                {hoveredTooltip.subLabel}
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
