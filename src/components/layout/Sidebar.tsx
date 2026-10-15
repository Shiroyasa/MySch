import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  Database,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  School,
  Sparkles,
  User,
  Award,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { currentRole, activeNav, setActiveNav, attendanceCorrections, setShowLogoutModal } = useApp();

  const pendingCorrectionsCount = attendanceCorrections.filter(c => c.status === 'pending').length;

  // Navigation tailored specifically to each role's responsibilities
  const navItems: NavItem[] = [
    // --- SISWA ONLY (Hanya Profil Siswa & Nilai Siswa) ---
    {
      id: 'student-profile',
      label: 'Profil Siswa',
      icon: User,
      roles: ['siswa'],
    },
    {
      id: 'student-grades',
      label: 'Nilai Siswa',
      icon: Award,
      roles: ['siswa'],
    },

    // --- OTHER ROLES (Disesuaikan dengan fungsi dan jabatan masing-masing) ---
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
    {
      id: 'master-data',
      label: 'Master Data Sekolah',
      icon: Database,
      roles: ['super_admin', 'admin'],
    },
    {
      id: 'user-management',
      label: 'Manajemen Akun & RBAC',
      icon: Users,
      roles: ['super_admin'],
    },
    {
      id: 'attendance',
      label: currentRole === 'admin' ? 'Rekap Absensi Sekolah' : currentRole === 'wali_kelas' ? 'Presensi Kelas Binaan' : 'Presensi & Absensi',
      icon: CalendarCheck,
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
      badge: pendingCorrectionsCount > 0 && ['wali_kelas', 'guru', 'super_admin'].includes(currentRole) ? `${pendingCorrectionsCount} Koreksi` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'grading',
      label: currentRole === 'wali_kelas' ? 'Leger Nilai Kelas' : currentRole === 'kepala_sekolah' ? 'Analisis Capaian Nilai' : 'Penilaian Akademik',
      icon: GraduationCap,
      roles: ['super_admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
    {
      id: 'reports',
      label: currentRole === 'kepala_sekolah' ? 'Laporan Manajerial' : currentRole === 'wali_kelas' ? 'Cetak Rapor Kelas' : 'Laporan & Ekspor',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
    {
      id: 'audit-logs',
      label: 'Audit Log & Keamanan',
      icon: ShieldAlert,
      roles: ['super_admin', 'kepala_sekolah'],
    },
    {
      id: 'settings',
      label: 'Profil & Pengaturan',
      icon: Settings,
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
    },
  ];

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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 lg:static ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* School Crest / Header in Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <School className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  SMK Mardi Yuana
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  Cikembar - Sukabumi
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <School className="h-5 w-5" />
            </div>
          )}

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title={collapsed ? 'Perluas Menu' : 'Ciutkan Menu'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Role Indicator within Sidebar */}
        <div className="px-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/70">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Portal {currentRole === 'siswa' ? 'Kesiswaan' : 'Staf & Guru'}
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 capitalize">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectNav(item.id)}
                className={`group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                } ${collapsed ? 'justify-center' : 'justify-between'}`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold shadow-xs ${
                      item.badgeColor || 'bg-blue-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Keluar Sistem (Log Out) Button with Pop Up confirmation */}
        <div className="px-3 pt-2 pb-1 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            title="Keluar dari Sistem (Log Out)"
          >
            <LogOut className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            {!collapsed && <span className="truncate">Keluar Sistem</span>}
          </button>
        </div>

        {/* Bottom Vocational Badge */}
        {!collapsed ? (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 m-2 rounded-2xl bg-gradient-to-br from-blue-50/80 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/40 border">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">SMK Pusat Keunggulan</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Kurikulum Merdeka Vokasi & Penjaminan Mutu Terakreditasi A
            </p>
          </div>
        ) : (
          <div className="p-2 border-t border-slate-200 dark:border-slate-800 text-center">
            <Sparkles className="h-4 w-4 text-amber-500 mx-auto" />
          </div>
        )}
      </aside>
    </>
  );
};
