import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  Briefcase,
  Database,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Eye,
  LogOut,
  Award,
  UserCheck,
  School,
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

interface NavGroup {
  groupTitle: string;
  roles: UserRole[];
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { currentRole, activeNav, setActiveNav, attendanceCorrections, setShowLogoutModal } = useApp();

  const pendingCorrectionsCount = attendanceCorrections.filter(c => c.status === 'pending').length;

  // Grouped Navigation to clearly separate Class & Grading Management from PKL and Master Data
  const navGroups: NavGroup[] = [
    // GROUP 1: MANAJEMEN KELAS & NILAI
    {
      groupTitle: currentRole === 'siswa' ? 'Akademik Siswa' : 'Manajemen Kelas & Nilai',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah', 'siswa'],
      items: [
        {
          id: 'student-profile',
          label: 'Profil Siswa',
          icon: UserCheck,
          roles: ['siswa'],
        },
        {
          id: 'student-grades',
          label: 'Nilai Siswa',
          icon: Award,
          roles: ['siswa'],
        },
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
        },
        {
          id: 'attendance',
          label:
            currentRole === 'admin'
              ? 'Presensi Sekolah'
              : currentRole === 'wali_kelas'
              ? 'Presensi Kelas'
              : 'Presensi & Absensi',
          icon: CalendarCheck,
          roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
          badge:
            pendingCorrectionsCount > 0 && ['wali_kelas', 'guru', 'super_admin'].includes(currentRole)
              ? `${pendingCorrectionsCount}`
              : undefined,
          badgeColor: 'bg-amber-500 text-white shadow-xs',
        },
        {
          id: 'grading',
          label:
            currentRole === 'wali_kelas'
              ? 'Leger & Draf Rapor'
              : currentRole === 'kepala_sekolah'
              ? 'Analisis Capaian Nilai'
              : 'Penilaian Akademik',
          icon: GraduationCap,
          roles: ['super_admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
        },
        {
          id: 'reports',
          label:
            currentRole === 'kepala_sekolah'
              ? 'Laporan Manajerial'
              : currentRole === 'wali_kelas'
              ? 'Cetak Rapor Kelas'
              : 'Laporan & Ekspor',
          icon: FileSpreadsheet,
          roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
        },
      ],
    },

    // GROUP 2: ADMINISTRASI PKL & DUDI (Kelompok tersendiri terpisah dari nilai & presensi)
    {
      groupTitle: 'Administrasi PKL & DUDI',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah', 'siswa'],
      items: [
        {
          id: 'pkl',
          label: 'Administrasi PKL',
          icon: Briefcase,
          roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah', 'siswa'],
          badge: 'DUDI',
          badgeColor: 'bg-indigo-600 text-white shadow-xs',
        },
      ],
    },

    // GROUP 3: DATA POKOK & MASTER
    {
      groupTitle: 'Data Pokok & Master',
      roles: ['super_admin', 'admin', 'kepala_sekolah'],
      items: [
        {
          id: 'master-data',
          label: 'Master Data',
          icon: Database,
          roles: ['super_admin', 'admin'],
        },
        {
          id: 'user-management',
          label: 'Manajemen Akun',
          icon: Users,
          roles: ['super_admin', 'admin'],
        },
        {
          id: 'student-chat-monitor',
          label: 'Pantauan Chat',
          icon: Eye,
          roles: ['super_admin', 'admin'],
          badge: 'Live',
          badgeColor: 'bg-emerald-600 text-white shadow-xs',
        },
        {
          id: 'audit-logs',
          label: 'Audit Log & Akses',
          icon: ShieldCheck,
          roles: ['super_admin', 'kepala_sekolah'],
        },
      ],
    },

    // GROUP 4: LAYANAN & PENGATURAN
    {
      groupTitle: 'Layanan & Pengaturan',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah', 'siswa'],
      items: [
        {
          id: 'student-chat',
          label: 'Obrolan Siswa',
          icon: MessageSquareText,
          roles: ['siswa', 'guru', 'wali_kelas', 'kepala_sekolah'],
          badge: 'DM',
          badgeColor: 'bg-cyan-600 text-white shadow-xs',
        },
        {
          id: 'settings',
          label: 'Pengaturan Sistem',
          icon: Settings,
          roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
        },
      ],
    },
  ];

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
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container with Clean Glass Backdrop */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/95 lg:static ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* School Crest / Header in Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800/80">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-sm">
                <School className="h-5 w-5 text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  MY ACADEMY
                </p>
                <p className="truncate text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Sistem Informasi Akademik
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-sm">
              <School className="h-5 w-5 text-white" />
            </div>
          )}

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            title={collapsed ? 'Perluas Menu' : 'Ciutkan Menu'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Role Bar */}
        <div className="px-3.5 py-2 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800/60">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Hak Akses
              </span>
              <span className="rounded-md bg-blue-100 dark:bg-blue-950/70 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-blue-800 dark:text-blue-300">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
          ) : (
            <div className="text-center text-[9px] font-extrabold uppercase text-blue-600">
              {currentRole.slice(0, 3)}
            </div>
          )}
        </div>

        {/* Navigation Menu Items with Grouped Structure */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {navGroups
            .filter(group => group.roles.includes(currentRole))
            .map((group, groupIdx) => {
              const visibleGroupItems = group.items.filter(item => item.roles.includes(currentRole));
              if (visibleGroupItems.length === 0) return null;

              return (
                <div key={groupIdx} className="space-y-1">
                  {/* Category Header */}
                  {!collapsed ? (
                    <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {group.groupTitle}
                    </div>
                  ) : (
                    groupIdx > 0 && <div className="my-1.5 border-t border-slate-200/60 dark:border-slate-800/60" />
                  )}

                  {visibleGroupItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectNav(item.id)}
                        className={`group flex w-full items-center rounded-xl transition-all duration-150 cursor-pointer ${
                          collapsed ? 'justify-center px-2 py-2' : 'justify-between px-3 py-2'
                        } ${
                          isActive
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100/90 dark:text-slate-300 dark:hover:bg-slate-800/60 font-semibold'
                        }`}
                        title={collapsed ? item.label : undefined}
                      >
                        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-blue-600'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          {!collapsed && (
                            <span className="truncate text-xs tracking-tight text-left">
                              {item.label}
                            </span>
                          )}
                        </div>

                        {!collapsed && item.badge && (
                          <span
                            className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
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
              );
            })}
        </div>

        {/* The SINGLE Official Keluar Sistem (Log Out) Button */}
        <div className="px-3 py-2.5 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50/80 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            title="Keluar dari Sistem (Log Out)"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
              <LogOut className="h-4 w-4" />
            </div>
            {!collapsed && <span className="truncate">Keluar Akun</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
