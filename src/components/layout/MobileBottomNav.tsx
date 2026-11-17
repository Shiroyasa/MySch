import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { OrbitaMenuIcon } from '../common/AcademyOrnaments';

interface MobileBottomNavProps {
  isHidden: boolean;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  onOpenAgendaDrawer: () => void;
  onCloseAgendaDrawer: () => void;
  rightDrawerOpen: boolean;
}

interface ToastNavItem {
  id: string;
  label: string;
  subLabel: string;
  roles: UserRole[];
  badge?: string;
}

const ROLE_DISPLAY_MAP: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin Akademik',
  guru: 'Guru Mata Pelajaran',
  wali_kelas: 'Wali Kelas',
  kepala_sekolah: 'Kepala Sekolah',
  siswa: 'Siswa Terdaftar',
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isHidden,
  onCloseSidebar,
  onOpenAgendaDrawer,
  onCloseAgendaDrawer,
  rightDrawerOpen,
}) => {
  const {
    currentUser,
    currentRole,
    activeNav,
    setActiveNav,
    attendanceCorrections,
    setShowLogoutModal,
    visualSettings,
    schoolSettings,
  } = useApp();

  const [toastOpen, setToastOpen] = useState(false);

  const pendingCorrectionsCount = attendanceCorrections.filter(c => c.status === 'pending').length;
  const activeLogo = visualSettings?.appLogoUrl || schoolSettings?.logoUrl || null;

  const navItems: ToastNavItem[] = [
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
      subLabel: 'Ringkasan Utama',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
    {
      id: 'attendance',
      label: 'Presensi',
      subLabel: 'Rekapitulasi Harian',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
      badge:
        pendingCorrectionsCount > 0 && ['wali_kelas', 'guru', 'super_admin'].includes(currentRole)
          ? `${pendingCorrectionsCount}`
          : undefined,
    },
    {
      id: 'grading',
      label: 'Penilaian',
      subLabel: 'Evaluasi & KKM',
      roles: ['super_admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
    {
      id: 'reports',
      label: 'Laporan',
      subLabel: 'Analitik & Ekspor',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
    {
      id: 'pkl',
      label: 'Admin PKL',
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
      label: 'Galeri Foto',
      subLabel: 'Kegiatan & Carousel',
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'user-management',
      label: 'Akun & Role',
      subLabel: 'Otorisasi Pengguna',
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

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));
  const activeItem =
    visibleItems.find(item => item.id === activeNav) || visibleItems[0] || {
      id: 'dashboard',
      label: 'Menu',
      subLabel: 'Navigasi',
    };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toastOpen) {
        setToastOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toastOpen]);

  const handleSelectMenu = (id: string) => {
    onCloseSidebar();
    onCloseAgendaDrawer();
    setActiveNav(id);
    setToastOpen(false);
  };

  const handleOpenAgenda = () => {
    setToastOpen(false);
    onCloseSidebar();
    onOpenAgendaDrawer();
  };

  const handleLogout = () => {
    setToastOpen(false);
    onCloseSidebar();
    setShowLogoutModal(true);
  };

  return (
    <>
      {/* Backdrop when Bottom Toast Menu is expanded */}
      {toastOpen && !isHidden && (
        <div
          onClick={() => setToastOpen(false)}
          aria-hidden="true"
          className="no-print lg:hidden fixed inset-0 z-30 bg-[#14102E]/42 backdrop-blur-[3px] animate-fade-in"
        />
      )}

      {/* Floating Bottom Toast Menu Sheet (Clean Light/Dark Tactile Popover) */}
      {toastOpen && !isHidden && (
        <div
          role="dialog"
          aria-label="Toast Menu Navigasi"
          className="no-print lg:hidden fixed bottom-[76px] sm:bottom-[86px] inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[430px] z-40 animate-wobble-in"
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="relative overflow-hidden rounded-[26px] border border-[#DDD8F6] dark:border-[#8D81E3]/28 bg-white/96 dark:bg-[#191538]/96 p-4 text-[#3E385B] dark:text-[#EDEBF9] shadow-[0_24px_60px_-12px_rgba(32,24,78,0.34)] dark:shadow-[0_24px_60px_-10px_rgba(4,3,14,0.78)] backdrop-blur-2xl">
            {/* Tactile Grabber Handle */}
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[#D9D4EE] dark:bg-[#4B4188]" aria-hidden="true" />

            {/* Toast Header: School Emblem / Brand Mark + User Context + Close */}
            <div className="flex items-center justify-between gap-3 pb-3 mb-2.5 border-b border-[#ECEAF6] dark:border-[#8D81E3]/18">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#F1EEFB] text-[#5D51B2] dark:bg-[#2A235C] dark:text-[#BDB5FF]">
                  {activeLogo ? (
                    <img src={activeLogo} alt="ORBITA" className="h-5.5 w-5.5 rounded-full object-contain" />
                  ) : (
                    <OrbitaMenuIcon variant="brand" className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-[#3E385B] dark:text-white truncate leading-snug">
                    {currentUser.displayName}
                  </p>
                  <p className="text-[11px] font-medium text-[#757094] dark:text-indigo-300/80 truncate leading-tight">
                    {ROLE_DISPLAY_MAP[currentRole] || 'Pengguna'} &middot; Navigasi Cepat
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setToastOpen(false)}
                aria-label="Tutup Toast Menu"
                className="no-ornament flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#757094] hover:bg-[#F3F1FC] hover:text-[#3E385B] dark:text-slate-300 dark:hover:bg-[#282158] dark:hover:text-white transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
                  <path d="M7 7L17 17M17 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Clean Architectural 2-Column Route List (No Card-Inside-Card Clutter) */}
            <div className="grid grid-cols-2 gap-1.5 max-h-[50dvh] overflow-y-auto scrollbar-none pr-0.5">
              {visibleItems.map(item => {
                const isActive = activeNav === item.id && !rightDrawerOpen;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMenu(item.id)}
                    className={`no-ornament relative flex min-h-[48px] items-center gap-2.5 rounded-[14px] px-3 py-2 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#5D51B2] text-white shadow-[0_8px_18px_-6px_rgba(93,81,178,0.5)] dark:bg-[#7468C4]'
                        : 'text-[#3E385B] hover:bg-[#F4F2FC] dark:text-[#E6E4F5] dark:hover:bg-[#251F52]'
                    }`}
                  >
                    <OrbitaMenuIcon
                      variant={item.id}
                      className={`h-[18px] w-[18px] shrink-0 ${
                        isActive ? 'text-white' : 'text-[#6C60B8] dark:text-[#A89DFF]'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold leading-snug">
                        {item.label}
                      </span>
                      <span
                        className={`block truncate text-[10px] leading-tight ${
                          isActive ? 'text-white/80' : 'text-[#7A7598] dark:text-slate-400'
                        }`}
                      >
                        {item.subLabel}
                      </span>
                    </div>

                    {item.badge && (
                      <span
                        className={`flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-md px-1 text-[10px] font-extrabold tabular-nums ${
                          isActive
                            ? 'bg-white/22 text-white'
                            : 'bg-[#FFE4EC] text-[#DF3E6B] dark:bg-rose-950/80 dark:text-rose-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Toast Action Strip: Agenda KBM + Keluar */}
            <div className="mt-3 pt-2.5 border-t border-[#ECEAF6] dark:border-[#8D81E3]/18 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleOpenAgenda}
                className={`no-ornament flex flex-1 min-h-[42px] items-center justify-center gap-2 rounded-[14px] px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  rightDrawerOpen
                    ? 'bg-[#FFE4EC] text-[#D93866] dark:bg-rose-950/75 dark:text-rose-300'
                    : 'bg-[#F4F2FC] text-[#4C4298] hover:bg-[#EAE6FA] dark:bg-[#251F52] dark:text-indigo-200 dark:hover:bg-[#2F2866]'
                }`}
              >
                <OrbitaMenuIcon variant="agenda" className="h-4 w-4 shrink-0" />
                <span>Agenda KBM</span>
                {pendingCorrectionsCount > 0 && (
                  <span className="font-extrabold tabular-nums text-[#E54574] dark:text-rose-300">
                    ({pendingCorrectionsCount})
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="no-ornament inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-[14px] bg-[#FFF1F5] hover:bg-[#FFE2EB] text-[#D93866] dark:bg-rose-950/55 dark:hover:bg-rose-900/65 dark:text-rose-300 px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <OrbitaMenuIcon variant="logout" className="h-4 w-4 shrink-0" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Centered Floating Toast Dock Launcher */}
      <div
        className="no-print lg:hidden fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          type="button"
          tabIndex={isHidden ? -1 : 0}
          onClick={() => setToastOpen(prev => !prev)}
          aria-expanded={toastOpen}
          aria-label="Buka Toast Menu Navigasi"
          className={`no-ornament pointer-events-auto relative flex h-12 items-center gap-2.5 rounded-[18px] border border-[#D8D3F0] dark:border-[#8D81E3]/35 bg-white/94 dark:bg-[#1E1944]/94 pl-2 pr-3.5 text-[#3E385B] dark:text-white shadow-[0_14px_34px_-8px_rgba(38,29,94,0.26)] dark:shadow-[0_16px_38px_-8px_rgba(4,3,16,0.75)] backdrop-blur-2xl transition-all duration-300 cursor-pointer whitespace-nowrap ${
            isHidden
              ? 'translate-y-24 scale-90 opacity-0 pointer-events-none'
              : 'translate-y-0 scale-100 opacity-100 hover:border-[#6C60B8]/55 active:scale-[0.97]'
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-[#5D51B2] text-white shadow-xs">
            <OrbitaMenuIcon
              variant={rightDrawerOpen ? 'agenda' : activeItem.id}
              className="h-4.5 w-4.5 text-white"
            />
          </span>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-extrabold tracking-tight text-[#3E385B] dark:text-white">
              {rightDrawerOpen ? 'Agenda KBM' : activeItem.label}
            </span>
            <span aria-hidden="true" className="text-[#B6B1D4] dark:text-indigo-300/60">
              &middot;
            </span>
            <span className="font-semibold text-[#757094] dark:text-indigo-200/80">
              Menu
            </span>
          </div>

          {pendingCorrectionsCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-[#FFE4EC] dark:bg-rose-950/85 px-1.5 text-[10px] font-extrabold text-[#D93866] dark:text-rose-300 tabular-nums">
              {pendingCorrectionsCount}
            </span>
          )}

          <span className="ml-0.5 flex items-center border-l border-[#E7E4F4] dark:border-white/15 pl-2.5 text-[#5D51B2] dark:text-indigo-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={`h-4 w-4 transition-transform duration-300 ${toastOpen ? 'rotate-180' : ''}`}
            >
              <path
                d="M7 14L12 9L17 14"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </>
  );
};
