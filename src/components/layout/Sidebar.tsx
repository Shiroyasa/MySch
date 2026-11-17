import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Camera, ChevronLeft, X } from 'lucide-react';
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
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const wrapperRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const btnRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const prevNavRef = React.useRef<string>(activeNav);
  const bulgeTimeoutRef = React.useRef<number | null>(null);

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));
  const activeItemHasBadge = visibleItems.some(i => i.id === activeNav && Boolean(i.badge));

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

  // Hide collapsed tooltip whenever sidebar expands or unmounts
  React.useEffect(() => {
    if (showExpanded) {
      setHoveredTooltip(null);
    }
  }, [showExpanded]);

  // Detect active menu change -> trigger directional Liquid Bulge animation
  React.useEffect(() => {
    if (prevNavRef.current !== activeNav) {
      const prevIdx = visibleItems.findIndex(i => i.id === prevNavRef.current);
      const nextIdx = visibleItems.findIndex(i => i.id === activeNav);
      const direction: 'up' | 'down' = prevIdx !== -1 && nextIdx !== -1 && nextIdx < prevIdx ? 'up' : 'down';
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
      }, 560);
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

  const showFloatingTooltip = (item: NavItem, el: HTMLButtonElement) => {
    if (showExpanded) return;
    const rect = el.getBoundingClientRect();
    setHoveredTooltip({
      id: item.id,
      label: item.label,
      subLabel: item.subLabel,
      top: rect.top + rect.height / 2,
      left: rect.right,
    });
  };

  return (
    <>
      {/* Mobile / Tablet Drawer Backdrop */}
      <div
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-40 bg-[#42368E]/40 backdrop-blur-md transition-opacity duration-300 ease-out lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Left Floating Vertical Frosted Violet Glass Sidebar (#7468C4 -> #6558B5) */}
      <aside
        onTransitionEnd={e => {
          if (e.propertyName === 'width' || e.propertyName === 'transform') {
            measureActiveButton();
          }
        }}
        style={{
          background: 'linear-gradient(180deg, rgba(116, 104, 196, 0.80) 0%, rgba(101, 88, 181, 0.76) 100%)',
          boxShadow: '0 20px 44px -8px rgba(84, 70, 172, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.36)',
        }}
        className={`fixed top-2.5 bottom-2.5 left-2.5 z-50 flex flex-col items-center justify-between rounded-[28px] border border-white/28 backdrop-blur-2xl backdrop-saturate-150 py-4 sm:py-5 text-white transition-[transform,opacity,width] duration-300 will-change-transform lg:static lg:my-4 lg:ml-4 ${
          showExpanded ? 'w-[268px] max-w-[84vw] lg:w-60' : 'w-[74px]'
        } ${
          mobileOpen
            ? 'translate-x-0 scale-100 opacity-100 pointer-events-auto ease-[cubic-bezier(0.34,1.25,0.64,1)]'
            : '-translate-x-[118%] scale-[0.94] opacity-0 pointer-events-none ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 lg:scale-100 lg:opacity-100 lg:pointer-events-auto'
        }`}
      >
        {isAdmin && (
          <input
            ref={quickLogoInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/webp,image/jpeg,image/x-icon"
            onChange={handleQuickLogoUpload}
            className="hidden"
          />
        )}

        {/* Top Brand Ring Button + Mobile/Tablet Close Button */}
        <div className={`flex w-full items-center justify-between gap-2 ${showExpanded ? 'px-3.5' : 'px-2.5'}`}>
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
                ? 'Klik untuk perluas label menu (Klik 2x ganti logo)'
                : 'Klik untuk ringkaskan sidebar (Klik 2x ganti logo)'
            }
            className={`no-ornament group relative flex items-center justify-center border border-white/25 bg-white/12 hover:bg-white/20 active:scale-95 text-white transition-all duration-300 cursor-pointer ${
              !showExpanded
                ? 'h-11 w-11 mx-auto rounded-full'
                : 'flex-1 min-w-0 gap-2.5 rounded-[18px] px-2.5 py-2 justify-start'
            }`}
          >
            <div className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-6">
              {activeLogoUrl ? (
                <img
                  src={activeLogoUrl}
                  alt="ORBITA"
                  className="h-7 w-7 rounded-full object-contain"
                />
              ) : (
                <OrbitaMenuIcon variant="brand" className="h-5.5 w-5.5 text-white" />
              )}
              {isAdmin && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-3 w-3 text-white" />
                </span>
              )}
            </div>

            {showExpanded && (
              <>
                <div className="min-w-0 flex-1 text-left animate-fade-in">
                  <p className="truncate text-sm font-extrabold tracking-tight text-white leading-none">
                    ORBITA
                  </p>
                  <p className="truncate text-[10px] font-medium text-white/75 mt-0.5">
                    Academic Portal
                  </p>
                </div>
                <span className="hidden lg:flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/75 group-hover:bg-white/20 group-hover:text-white transition-colors">
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
            className="no-ornament lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white active:scale-95 transition-all cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Center Navigation Stack with Safe Scroll Centering & Fluid Liquid Bulge Capsule */}
        <nav
          aria-label="Menu Utama"
          onScroll={() => setHoveredTooltip(null)}
          className="relative my-2.5 flex w-full flex-1 flex-col overflow-y-auto overflow-x-hidden scrollbar-none"
        >
          <div
            ref={stageRef}
            className={`relative my-auto flex w-full flex-col items-center gap-1.5 sm:gap-2 py-1.5 ${
              showExpanded ? 'px-3.5' : 'px-2.5'
            }`}
          >
            {/* Floating Cohesive Liquid Bulge Capsule Layer */}
            {indicatorRect && (
              <div
                aria-hidden="true"
                style={{
                  top: `${indicatorRect.top}px`,
                  left: `${indicatorRect.left}px`,
                  width: `${indicatorRect.width}px`,
                  height: `${indicatorRect.height}px`,
                }}
                className={`pointer-events-none absolute z-0 transition-[top,left,width,height,opacity,transform] duration-400 ease-[cubic-bezier(0.32,1.28,0.56,1)] motion-reduce:transition-none will-change-[top,left,width,height] ${
                  mobileOpen
                    ? 'max-lg:opacity-100 max-lg:translate-x-0'
                    : 'max-lg:opacity-0 max-lg:-translate-x-4'
                }`}
              >
                {/* Viscous Directional Trail Droplet */}
                {bulgeEffect.active && (
                  <div
                    key={`trail-${bulgeEffect.key}`}
                    className={`absolute inset-0.5 rounded-[16px] bg-gradient-to-b from-[#A79CFF]/35 to-[#FF7597]/20 blur-[2px] ${
                      bulgeEffect.direction === 'up'
                        ? 'animate-liquid-trail-up'
                        : 'animate-liquid-trail-down'
                    }`}
                  />
                )}

                {/* Soft Ambient Fluid Aura */}
                <div
                  key={`aura-${bulgeEffect.key}`}
                  className={`absolute inset-0 rounded-[16px] bg-[#A79CFF]/25 blur-[5px] ${
                    bulgeEffect.active ? 'animate-liquid-aura' : 'opacity-45'
                  }`}
                />

                {/* Main Morphing Frosted Glass Liquid Capsule (Sidebar Color-Matched) */}
                <div
                  key={`bulge-${bulgeEffect.key}`}
                  style={{
                    background:
                      'linear-gradient(160deg, rgba(255, 255, 255, 0.30) 0%, rgba(192, 182, 255, 0.18) 52%, rgba(86, 70, 174, 0.34) 100%)',
                  }}
                  className={`relative h-full w-full overflow-hidden rounded-[16px] border border-white/40 backdrop-blur-md shadow-[0_10px_24px_-4px_rgba(48,36,120,0.34),inset_0_1px_1px_rgba(255,255,255,0.48)] ${
                    bulgeEffect.active
                      ? bulgeEffect.direction === 'up'
                        ? 'animate-liquid-bulge-up'
                        : 'animate-liquid-bulge-down'
                      : ''
                  }`}
                >
                  {/* Top Meniscus Glass Highlight */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/18 via-transparent to-black/10" />

                  {/* Glossy Diagonal Liquid Sheen Wave */}
                  {bulgeEffect.active && (
                    <div className="animate-liquid-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-2/3 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                  )}
                </div>

                {/* Inset Left Meniscus Coral Indicator (Contained safely within capsule edge) */}
                <span
                  className={`pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 w-[3.5px] rounded-full bg-gradient-to-b from-[#FF8FAD] to-[#FF5F8D] shadow-[0_0_10px_rgba(255,117,151,0.8)] transition-all duration-300 ${
                    bulgeEffect.active ? 'h-6' : 'h-4.5'
                  }`}
                />

                {/* Subtle Right Meniscus Bead in Expanded Mode */}
                {showExpanded && !activeItemHasBadge && (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white/35" />
                )}
              </div>
            )}

            {visibleItems.map((item, idx) => {
              const isActive = activeNav === item.id;

              return (
                <div
                  key={item.id}
                  ref={el => {
                    wrapperRefs.current[item.id] = el;
                  }}
                  style={{
                    transitionDelay: mobileOpen ? `${Math.min(idx * 24, 180)}ms` : '0ms',
                  }}
                  className={`relative z-10 w-full flex justify-center max-lg:transition-[transform,opacity] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
                    onMouseEnter={e => showFloatingTooltip(item, e.currentTarget)}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    onFocus={e => showFloatingTooltip(item, e.currentTarget)}
                    onBlur={() => setHoveredTooltip(null)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`no-ornament group relative flex min-h-[44px] items-center transition-colors duration-250 ease-out cursor-pointer ${
                      !showExpanded
                        ? 'h-12 w-12 justify-center rounded-[16px]'
                        : 'w-full gap-3 rounded-[16px] pl-4 pr-3.5 py-2.5 justify-start'
                    } ${
                      isActive
                        ? indicatorRect
                          ? 'bg-transparent text-white'
                          : 'bg-white/24 text-white border border-white/38 backdrop-blur-md shadow-[0_10px_22px_-4px_rgba(48,36,120,0.32)]'
                        : 'text-white/85 hover:bg-white/15 hover:text-white active:scale-95'
                    }`}
                  >
                    <span
                      key={isActive && bulgeEffect.active ? `icon-${bulgeEffect.key}` : 'icon-rest'}
                      className={`flex items-center justify-center transition-transform duration-300 ${
                        isActive
                          ? bulgeEffect.active
                            ? 'animate-liquid-icon-jelly'
                            : 'scale-105'
                          : 'group-hover:scale-110 group-hover:-rotate-3'
                      }`}
                    >
                      <OrbitaMenuIcon variant={item.id} className="h-5.5 w-5.5 shrink-0" />
                    </span>

                    {showExpanded && (
                      <div className="min-w-0 flex-1 text-left transition-transform duration-200 group-hover:translate-x-0.5">
                        <span className="block truncate text-xs font-bold leading-tight">
                          {item.label}
                        </span>
                        <span className="block truncate text-[10px] text-white/75 leading-tight mt-0.5">
                          {item.subLabel}
                        </span>
                      </div>
                    )}

                    {item.badge && (
                      <span
                        className={`${
                          !showExpanded ? 'absolute -top-1 -right-1' : 'shrink-0'
                        } flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6E96] px-1.5 text-[9.5px] font-extrabold text-white shadow-sm`}
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

        {/* Bottom Logout Icon Button */}
        <div className={`flex w-full items-center justify-center pt-1 ${showExpanded ? 'px-3.5' : 'px-2.5'}`}>
          <button
            type="button"
            onClick={() => {
              setHoveredTooltip(null);
              onCloseMobile();
              setShowLogoutModal(true);
            }}
            title="Keluar Sesi Akun (Log Out)"
            className={`no-ornament group flex min-h-[44px] items-center justify-center rounded-[16px] text-white/85 hover:bg-[#FF6E96]/25 hover:text-white active:scale-95 transition-all duration-300 cursor-pointer ${
              !showExpanded ? 'h-11 w-11' : 'w-full gap-2.5 px-4 py-2.5 justify-start'
            }`}
          >
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              <OrbitaMenuIcon variant="logout" className="h-5.5 w-5.5 shrink-0" />
            </span>
            {showExpanded && <span className="text-xs font-bold whitespace-nowrap">Keluar Sesi</span>}
          </button>
        </div>
      </aside>

      {/* Portal-rendered Floating Desktop Tooltip Pill (Never clipped by sidebar transform or scroll overflow) */}
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
            <div className="h-2.5 w-2.5 -mr-1.5 rotate-45 rounded-[2px] border-l border-b border-white/30 bg-[#6A5DB9]/90 backdrop-blur-xl" />
            <div
              style={{
                background:
                  'linear-gradient(145deg, rgba(116, 104, 196, 0.88) 0%, rgba(92, 80, 170, 0.90) 100%)',
              }}
              className="flex flex-col rounded-[14px] border border-white/30 px-3.5 py-2 text-white shadow-[0_14px_30px_rgba(52,40,126,0.36),inset_0_1px_0_rgba(255,255,255,0.32)] backdrop-blur-xl"
            >
              <span className="text-xs font-extrabold whitespace-nowrap leading-tight">
                {hoveredTooltip.label}
              </span>
              <span className="text-[10px] font-medium text-white/80 whitespace-nowrap leading-tight mt-0.5">
                {hoveredTooltip.subLabel}
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
