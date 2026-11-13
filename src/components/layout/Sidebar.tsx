import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Camera, X } from 'lucide-react';
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

  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));

  const handleSelectNav = (id: string) => {
    setActiveNav(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile / Tablet Drawer Backdrop — Always mounted on <lg so open & auto-hide fade smoothly */}
      <div
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-40 bg-[#3E385B]/45 backdrop-blur-xs transition-opacity duration-300 ease-out lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Left Floating Vertical Purple Pill Sidebar (#6C60B8) — Animated Slide-Over Drawer on <lg, Floating Rail on lg+ */}
      <aside
        style={{
          background: 'linear-gradient(180deg, #7468C4 0%, #6558B5 100%)',
          boxShadow: '0 18px 38px -8px rgba(101, 88, 181, 0.42)',
        }}
        className={`fixed top-2.5 bottom-2.5 left-2.5 z-50 flex flex-col items-center justify-between rounded-[28px] py-4 sm:py-5 text-white transition-[transform,opacity,width] duration-350 will-change-transform lg:static lg:my-4 lg:ml-4 ${
          showExpanded ? 'w-[268px] max-w-[84vw] lg:w-60 px-3.5' : 'w-[74px] px-2.5'
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
        <div className="flex w-full items-center justify-between gap-2">
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
                : 'ORBITA Academic Portal'
            }
            className={`no-ornament group relative flex items-center justify-center rounded-full border border-white/30 bg-white/10 hover:bg-white/22 active:scale-95 text-white transition-all duration-300 cursor-pointer ${
              !showExpanded
                ? 'h-11 w-11 mx-auto'
                : 'flex-1 min-w-0 gap-3 rounded-[20px] px-3 py-2 justify-start'
            }`}
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-6">
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
              <div className="min-w-0 text-left animate-fade-in">
                <p className="truncate text-sm font-extrabold tracking-tight text-white leading-none">
                  ORBITA
                </p>
                <p className="truncate text-[10px] font-medium text-white/75 mt-0.5">
                  Academic Portal
                </p>
              </div>
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

        {/* Center Navigation Icons Stack (Active = Dark Slate Squircle #4B436B) */}
        <nav className="my-3 flex w-full flex-1 flex-col items-center justify-start lg:justify-center gap-1.5 sm:gap-2 overflow-y-auto overflow-x-visible scrollbar-none py-1">
          {visibleItems.map((item, idx) => {
            const isActive = activeNav === item.id;
            const isHovered = hoveredItemId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  transitionDelay: mobileOpen ? `${Math.min(idx * 26, 200)}ms` : '0ms',
                }}
                className={`relative w-full flex justify-center max-lg:transition-[transform,opacity] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  mobileOpen
                    ? 'max-lg:translate-x-0 max-lg:opacity-100'
                    : 'max-lg:-translate-x-4 max-lg:opacity-0'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelectNav(item.id)}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  title={`${item.label} • ${item.subLabel}`}
                  className={`no-ornament group relative flex min-h-[44px] items-center transition-all duration-300 ease-out cursor-pointer ${
                    !showExpanded
                      ? 'h-12 w-12 justify-center rounded-[16px]'
                      : 'w-full gap-3 rounded-[16px] px-3.5 py-2.5 justify-start'
                  } ${
                    isActive
                      ? 'bg-[#4B436B] text-white shadow-[0_10px_22px_rgba(45,38,76,0.38)] scale-[1.02]'
                      : 'text-white/85 hover:bg-white/16 hover:text-white active:scale-95'
                  }`}
                >
                  {/* Active Left Glow Pill Indicator */}
                  {isActive && (
                    <span
                      className="pointer-events-none absolute -left-1.5 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-[#FF7597] shadow-[0_0_10px_#FF7597] transition-all duration-300"
                      aria-hidden="true"
                    />
                  )}

                  <span
                    className={`flex items-center justify-center transition-transform duration-300 ${
                      isActive
                        ? 'scale-110'
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
                        !showExpanded
                          ? 'absolute -top-1 -right-1'
                          : 'shrink-0'
                      } flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6E96] px-1.5 text-[9.5px] font-extrabold text-white shadow-sm animate-pulse`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Interactive Floating Tooltip Pill when Collapsed on Desktop */}
                {!showExpanded && isHovered && (
                  <div
                    className="pointer-events-none fixed left-[96px] z-50 hidden lg:flex flex-col rounded-[14px] border border-white/25 bg-[#3E385B]/95 px-3 py-1.5 text-white shadow-[0_12px_28px_rgba(45,38,76,0.35)] backdrop-blur-md animate-fade-in"
                    style={{ transform: 'translateY(2px)' }}
                  >
                    <span className="text-xs font-extrabold whitespace-nowrap leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-white/75 whitespace-nowrap leading-tight">
                      {item.subLabel}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Logout Icon Button (Bespoke Duotone Logout Vector) */}
        <div className="flex w-full items-center justify-center pt-1">
          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              setShowLogoutModal(true);
            }}
            title="Keluar Sesi Akun (Log Out)"
            className={`no-ornament group flex min-h-[44px] items-center justify-center rounded-[16px] text-white/85 hover:bg-[#FF6E96]/25 hover:text-white active:scale-95 transition-all duration-300 cursor-pointer ${
              !showExpanded ? 'h-11 w-11' : 'w-full gap-2.5 px-3.5 py-2.5 justify-start'
            }`}
          >
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              <OrbitaMenuIcon variant="logout" className="h-5.5 w-5.5 shrink-0" />
            </span>
            {showExpanded && <span className="text-xs font-bold whitespace-nowrap">Keluar Sesi</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
