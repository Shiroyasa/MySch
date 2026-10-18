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
  const { currentRole, activeNav, setActiveNav, attendanceCorrections, setShowLogoutModal, visualSettings } = useApp();
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number; active: boolean }>({
    x: 120,
    y: 220,
    active: false,
  });

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
      groupTitle: 'ADMINISTRASI PKL',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah', 'siswa'],
      items: [
        {
          id: 'pkl',
          label: 'Administrasi PKL',
          icon: Building2,
          roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah', 'siswa'],
        },
      ],
    },

    // GROUP 3: DATA POKOK & MASTER
    {
      groupTitle: 'DATA POKOK & MASTER',
      roles: ['super_admin', 'admin'],
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
      ],
    },

    // GROUP 4: LAYANAN & PENGATURAN
    {
      groupTitle: 'LAYANAN & PENGATURAN',
      roles: ['super_admin', 'admin', 'guru', 'wali_kelas', 'kepala_sekolah'],
      items: [
        {
          id: 'audit-logs',
          label: 'Audit Log & Akses',
          icon: ShieldCheck,
          roles: ['super_admin', 'admin', 'kepala_sekolah'],
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

  const handleSidebarMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
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

      {/* Royal Midnight Navy Sidebar Container with Magical Interactive Aura */}
      <aside
        onMouseMove={handleSidebarMouseMove}
        onMouseEnter={() => setMousePos(prev => ({ ...prev, active: true }))}
        onMouseLeave={() => setMousePos(prev => ({ ...prev, active: false }))}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-r border-[#182644] bg-[#0B162C]/95 backdrop-blur-xl text-slate-300 transition-all duration-300 lg:static ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Magical Interactive Cursor Spotlight & Celestial Stardust Layer */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-500"
          style={{ opacity: mousePos.active ? 1 : 0.35 }}
          aria-hidden="true"
        >
          {/* Primary Golden-Sapphire Magical Cursor Orb */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75 ease-out"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: '260px',
              height: '260px',
              background:
                'radial-gradient(circle, rgba(250,204,21,0.16) 0%, rgba(59,130,246,0.14) 38%, rgba(14,165,233,0.05) 65%, transparent 80%)',
              filter: 'blur(8px)',
            }}
          />
          {/* Trailing Stardust Sparkle Nodes following Mouse */}
          <span
            className="absolute text-[10px] text-[#FDE047] transition-all duration-200 ease-out select-none"
            style={{
              left: `${mousePos.x - 26}px`,
              top: `${mousePos.y - 18}px`,
              opacity: mousePos.active ? 0.85 : 0,
              textShadow: '0 0 8px rgba(250,204,21,0.9)',
            }}
          >
            ✦
          </span>
          <span
            className="absolute text-[8px] text-sky-300 transition-all duration-300 ease-out select-none"
            style={{
              left: `${mousePos.x + 28}px`,
              top: `${mousePos.y + 14}px`,
              opacity: mousePos.active ? 0.75 : 0,
              textShadow: '0 0 8px rgba(56,189,248,0.9)',
            }}
          >
            ✧
          </span>
          <span
            className="absolute text-[7px] text-amber-200 transition-all duration-500 ease-out select-none"
            style={{
              left: `${mousePos.x + 12}px`,
              top: `${mousePos.y - 28}px`,
              opacity: mousePos.active ? 0.65 : 0,
            }}
          >
            ⋆
          </span>
        </div>

        {/* Top Brand Emblem Header (Supports Proportional Custom App Logo) */}
        <div className="relative z-10 flex h-20 items-center justify-between border-b border-[#182644] px-4">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="group/logo relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#C8A44B]/75 bg-gradient-to-b from-[#15284E] to-[#0D1A36] p-1.5 shadow-[0_0_15px_rgba(200,164,75,0.22),inset_0_0_8px_rgba(250,204,21,0.12)]">
                {visualSettings?.appLogoUrl ? (
                  <img
                    src={visualSettings.appLogoUrl}
                    alt="Logo Aplikasi"
                    className="max-h-full max-w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover/logo:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[7px] leading-none text-[#EAB308] mb-0.5">✦</span>
                    <BookOpen className="h-4.5 w-4.5 text-[#EAB308]" strokeWidth={1.8} />
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p
                  className="truncate text-sm font-bold tracking-[0.12em] text-white uppercase leading-tight"
                  style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                >
                  ORBITA
                </p>
                <p className="truncate text-[11px] font-medium text-[#8DA2C0] mt-0.5">
                  Sistem Informasi Akademik
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#C8A44B]/75 bg-gradient-to-b from-[#15284E] to-[#0D1A36] p-1.5 shadow-[0_0_14px_rgba(200,164,75,0.2)]">
              {visualSettings?.appLogoUrl ? (
                <img
                  src={visualSettings.appLogoUrl}
                  alt="Logo Aplikasi"
                  className="max-h-full max-w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[7px] leading-none text-[#EAB308] mb-0.5">✦</span>
                  <BookOpen className="h-4.5 w-4.5 text-[#EAB308]" strokeWidth={1.8} />
                </div>
              )}
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
        <div className="relative z-10 flex-1 overflow-y-auto px-3 py-4 space-y-4">
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
                        className={`group relative flex w-full items-center overflow-hidden rounded-xl transition-all duration-300 cursor-pointer ${
                          collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3.5 py-2.5'
                        } ${
                          isActive
                            ? 'bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#1E40AF] text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.55),inset_0_0_12px_rgba(250,204,21,0.28)] border border-[#FACC15]/45'
                            : 'text-[#CBD5E1] hover:bg-[#132342]/90 hover:text-white hover:shadow-[0_0_14px_rgba(200,164,75,0.18)] border border-transparent hover:border-[#C8A44B]/30 font-medium'
                        }`}
                        title={collapsed ? item.label : undefined}
                      >
                        {/* Magical Hover & Active Shimmer Aura */}
                        <span
                          className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
                            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          style={{
                            background: isActive
                              ? 'radial-gradient(circle at 18% 50%, rgba(250,204,21,0.25), transparent 65%)'
                              : 'radial-gradient(circle at 20% 50%, rgba(250,204,21,0.12), rgba(56,189,248,0.08) 50%, transparent 75%)',
                          }}
                          aria-hidden="true"
                        />

                        {/* Golden Vertical Accent Bar + Magical Sparkles on Active Item */}
                        {isActive && (
                          <>
                            <span
                              className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-[#FEF08A] via-[#F59E0B] to-[#FDE047] shadow-[0_0_10px_#FACC15]"
                              aria-hidden="true"
                            />
                            <span
                              className="pointer-events-none absolute right-2 top-1 text-[9px] text-[#FDE047] animate-pulse"
                              aria-hidden="true"
                            >
                              ✦
                            </span>
                            <span
                              className="pointer-events-none absolute right-6 bottom-1 text-[7px] text-sky-200 animate-ping"
                              style={{ animationDuration: '2.6s' }}
                              aria-hidden="true"
                            >
                              ⋆
                            </span>
                          </>
                        )}

                        {/* Hover Sparkle when not active */}
                        {!isActive && (
                          <span
                            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-[#FACC15] opacity-0 group-hover:opacity-90 transition-all duration-300 group-hover:rotate-45"
                            aria-hidden="true"
                          >
                            ✦
                          </span>
                        )}

                        <div className={`relative z-10 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                          <Icon
                            className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                              isActive
                                ? 'text-[#FDE047] drop-shadow-[0_0_6px_rgba(250,204,21,0.8)] scale-110'
                                : 'text-[#8DA2C0] group-hover:text-[#FDE047] group-hover:scale-110'
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
                            className={`relative z-10 ml-2 shrink-0 rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
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

        {/* Bottom Logout Trigger (My Academy logo & text removed as requested) */}
        <div className="relative z-10 border-t border-[#182644] p-3">
          {!collapsed ? (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/35 px-3.5 py-2.5 text-xs font-bold text-rose-300 hover:border-rose-500/60 hover:bg-rose-950/70 hover:text-white transition-all cursor-pointer"
              title="Keluar Akun (Log Out)"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Keluar Sesi Akun</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-rose-500/40 bg-rose-950/40 text-rose-300 hover:border-rose-500/70 hover:text-white transition-colors cursor-pointer"
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
