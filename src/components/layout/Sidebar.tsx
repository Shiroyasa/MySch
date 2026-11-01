import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Camera } from 'lucide-react';
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
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#3E385B]/45 backdrop-blur-xs lg:hidden animate-fade-in"
        />
      )}

      {/* Exact Reference Image Left Floating Vertical Purple Pill Sidebar (#6C60B8) with Interactive Animations */}
      <aside
        style={{
          background: 'linear-gradient(180deg, #7468C4 0%, #6558B5 100%)',
          boxShadow: '0 18px 38px -8px rgba(101, 88, 181, 0.42)',
        }}
        className={`fixed top-3 bottom-3 left-3 z-50 flex flex-col items-center justify-between rounded-[28px] py-5 text-white transition-all duration-300 ease-out lg:static lg:my-4 lg:ml-4 ${
          collapsed ? 'w-[74px] px-2.5' : 'w-60 px-3.5'
        } ${mobileOpen ? 'translate-x-0 w-60 px-3.5' : '-translate-x-[120%] lg:translate-x-0'}`}
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

        {/* Top Circular Ring Button (Architectural Emblem / Custom Logo) */}
        <div className="flex w-full items-center justify-center">
          <button
            type="button"
            onClick={onToggleCollapse}
            onDoubleClick={() => {
              if (isAdmin) quickLogoInputRef.current?.click();
            }}
            title={
              collapsed
                ? 'Klik untuk perluas label menu (Klik 2x ganti logo)'
                : 'Klik untuk mode ikon ringkas'
            }
            className={`no-ornament group relative flex items-center justify-center rounded-full border border-white/30 bg-white/10 hover:bg-white/22 hover:scale-[1.04] active:scale-95 text-white transition-all duration-300 cursor-pointer ${
              collapsed ? 'h-11 w-11' : 'w-full gap-3 rounded-[20px] px-3.5 py-2.5 justify-start'
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

            {!collapsed && (
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
        </div>

        {/* Center Navigation Icons Stack (Active = Dark Slate Squircle #4B436B with Spring Hover) */}
        <nav className="my-3 flex w-full flex-1 flex-col items-center justify-center gap-2 overflow-y-auto overflow-x-visible scrollbar-none py-1">
          {visibleItems.map(item => {
            const isActive = activeNav === item.id;
            const isHovered = hoveredItemId === item.id;

            return (
              <div key={item.id} className="relative w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => handleSelectNav(item.id)}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  title={`${item.label} • ${item.subLabel}`}
                  className={`no-ornament group relative flex items-center transition-all duration-300 ease-out cursor-pointer ${
                    collapsed
                      ? 'h-12 w-12 justify-center rounded-[16px]'
                      : 'w-full gap-3 rounded-[16px] px-3.5 py-2.5 justify-start'
                  } ${
                    isActive
                      ? 'bg-[#4B436B] text-white shadow-[0_10px_22px_rgba(45,38,76,0.38)] scale-[1.03]'
                      : 'text-white/80 hover:bg-white/16 hover:text-white hover:-translate-y-0.5 active:scale-95'
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

                  {!collapsed && (
                    <div className="min-w-0 flex-1 text-left transition-transform duration-200 group-hover:translate-x-0.5">
                      <span className="block truncate text-xs font-bold leading-tight">
                        {item.label}
                      </span>
                      <span className="block truncate text-[10px] text-white/70 leading-tight mt-0.5">
                        {item.subLabel}
                      </span>
                    </div>
                  )}

                  {item.badge && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#FF6E96] px-1 text-[9px] font-extrabold text-white shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Interactive Floating Tooltip Pill when Collapsed */}
                {collapsed && isHovered && (
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
            onClick={() => setShowLogoutModal(true)}
            title="Keluar Sesi Akun (Log Out)"
            className={`no-ornament group flex items-center justify-center rounded-[16px] text-white/85 hover:bg-[#FF6E96]/25 hover:text-white active:scale-95 transition-all duration-300 cursor-pointer ${
              collapsed ? 'h-11 w-11' : 'w-full gap-2.5 px-3.5 py-2.5 justify-start'
            }`}
          >
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              <OrbitaMenuIcon variant="logout" className="h-5.5 w-5.5 shrink-0" />
            </span>
            {!collapsed && <span className="text-xs font-bold">Keluar Sesi</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
