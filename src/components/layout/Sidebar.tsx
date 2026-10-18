import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Home,
  CalendarCheck,
  GraduationCap,
  Building2,
  Database,
  FileBarChart2,
  Users,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  LogOut,
  Award,
  UserCheck,
  BookOpen,
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
  badgeStyle?: string;
}

interface NavGroup {
  groupTitle?: string;
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

  const navGroups: NavGroup[] = [
    // GROUP 1: PRIMARY ACADEMIC NAVIGATION (No top header above Dashboard, matching image.png)
    {
      groupTitle: currentRole === 'siswa' ? 'AKADEMIK SISWA' : undefined,
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
          icon: Home,
          roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
        },
        {
          id: 'attendance',
          label: 'Presensi & Absensi',
          icon: CalendarCheck,
          roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
          badge:
            pendingCorrectionsCount > 0 && ['wali_kelas', 'guru', 'super_admin'].includes(currentRole)
              ? `${pendingCorrectionsCount}`
              : undefined,
          badgeStyle: 'border border-amber-500/60 bg-amber-950/80 text-amber-300',
        },
        {
          id: 'grading',
          label: 'Penilaian Akademik',
          icon: GraduationCap,
          roles: ['super_admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
        },
        {
          id: 'reports',
          label: 'Laporan & Ekspor',
          icon: FileBarChart2,
          roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
        },
      ],
    },

    // GROUP 2: ADMINISTRASI PKL & DUDI
    {
      groupTitle: 'ADMINISTRASI PKL & DUDI',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah', 'siswa'],
      items: [
        {
          id: 'pkl',
          label: 'Administrasi PKL',
          icon: Building2,
          roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah', 'siswa'],
          badge: 'DUDI',
          badgeStyle: 'border border-[#C8A44B]/60 bg-[#2C2416] text-[#FBBF24]',
        },
      ],
    },

    // GROUP 3: DATA POKOK & MASTER
    {
      groupTitle: 'DATA POKOK & MASTER',
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
          icon: MessageCircle,
          roles: ['super_admin', 'admin'],
          badge: 'LIVE',
          badgeStyle: 'border border-emerald-500/50 bg-[#0A2E26] text-emerald-400',
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
      groupTitle: 'LAYANAN & PENGATURAN',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah', 'siswa'],
      items: [
        {
          id: 'student-chat',
          label: 'Obrolan Siswa',
          icon: MessageCircle,
          roles: ['siswa', 'guru', 'wali_kelas', 'kepala_sekolah'],
          badge: 'DM',
          badgeStyle: 'border border-cyan-500/50 bg-cyan-950/80 text-cyan-300',
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

      {/* Royal Midnight Navy Sidebar Container (Matches image.png) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[#182644] bg-[#0B162C] text-slate-300 transition-all duration-300 lg:static ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Brand Emblem Header */}
        <div className="flex h-20 items-center justify-between border-b border-[#182644] px-4">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-[#C8A44B]/65 bg-[#122244] shadow-inner">
                <span className="text-[7px] leading-none text-[#EAB308] mb-0.5">✦</span>
                <BookOpen className="h-4.5 w-4.5 text-[#EAB308]" strokeWidth={1.8} />
              </div>
              <div className="overflow-hidden">
                <p
                  className="truncate text-sm font-bold tracking-[0.12em] text-white uppercase leading-tight"
                  style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                >
                  MY ACADEMY
                </p>
                <p className="truncate text-[11px] font-medium text-[#8DA2C0] mt-0.5">
                  Sistem Informasi Akademik
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-xl border border-[#C8A44B]/65 bg-[#122244]">
              <span className="text-[7px] leading-none text-[#EAB308] mb-0.5">✦</span>
              <BookOpen className="h-4.5 w-4.5 text-[#EAB308]" strokeWidth={1.8} />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#152648] hover:text-white cursor-pointer transition-colors"
            title={collapsed ? 'Perluas Menu' : 'Ciutkan Menu'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navGroups
            .filter(group => group.roles.includes(currentRole))
            .map((group, groupIdx) => {
              const visibleGroupItems = group.items.filter(item => item.roles.includes(currentRole));
              if (visibleGroupItems.length === 0) return null;

              return (
                <div key={groupIdx} className="space-y-1">
                  {group.groupTitle && !collapsed && (
                    <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.11em] text-[#7A8FA8]">
                      {group.groupTitle}
                    </div>
                  )}
                  {group.groupTitle && collapsed && groupIdx > 0 && (
                    <div className="my-2 border-t border-[#182644]" />
                  )}

                  {visibleGroupItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectNav(item.id)}
                        className={`group relative flex w-full items-center rounded-xl transition-all duration-150 cursor-pointer ${
                          collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3.5 py-2.5'
                        } ${
                          isActive
                            ? 'bg-[#2563EB] text-white font-bold shadow-[0_4px_14px_rgba(37,99,235,0.35)]'
                            : 'text-[#CBD5E1] hover:bg-[#132342] hover:text-white font-medium'
                        }`}
                        title={collapsed ? item.label : undefined}
                      >
                        {/* Golden Vertical Accent Bar on Active Item Left Edge (Matches image.png) */}
                        {isActive && (
                          <span
                            className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#F59E0B]"
                            aria-hidden="true"
                          />
                        )}

                        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                          <Icon
                            className={`h-4 w-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : 'text-[#8DA2C0] group-hover:text-white'
                            }`}
                            strokeWidth={isActive ? 2.2 : 1.8}
                          />
                          {!collapsed && (
                            <span className="truncate text-xs tracking-wide text-left">
                              {item.label}
                            </span>
                          )}
                        </div>

                        {!collapsed && item.badge && (
                          <span
                            className={`ml-2 shrink-0 rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                              item.badgeStyle || 'bg-blue-600 text-white'
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

        {/* Bottom Academy Crest Footer & Logout Trigger (Matches image.png) */}
        <div className="border-t border-[#182644] p-4">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C8A44B]/60 bg-[#122244]">
                  <BookOpen className="h-4 w-4 text-[#EAB308]" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white">My Academy</p>
                  <p className="line-clamp-2 text-[10px] leading-tight text-[#8DA2C0] mt-0.5">
                    Bersama Membangun Pendidikan yang Lebih Baik
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8DA2C0] hover:bg-rose-950/60 hover:text-rose-400 transition-colors cursor-pointer"
                title="Keluar Akun (Log Out)"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#C8A44B]/60 bg-[#122244] text-[#EAB308] hover:border-rose-500/60 hover:text-rose-400 transition-colors cursor-pointer"
              title="Keluar Akun (Log Out)"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
