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

  const quickTabs =
    currentRole === 'siswa'
      ? [
          { id: 'student-profile', label: 'Profil', icon: 'student-profile' },
          { id: 'student-grades', label: 'Nilai', icon: 'student-grades' },
          { id: 'pkl', label: 'PKL', icon: 'pkl' },
        ]
      : currentRole === 'admin'
      ? [
          { id: 'dashboard', label: 'Beranda', icon: 'dashboard' },
          { id: 'attendance', label: 'Presensi', icon: 'attendance' },
          { id: 'master-data', label: 'Data', icon: 'master-data' },
        ]
      : [
          { id: 'dashboard', label: 'Beranda', icon: 'dashboard' },
          { id: 'attendance', label: 'Presensi', icon: 'attendance' },
          { id: 'grading', label: 'Nilai', icon: 'grading' },
        ];

  const handleBottomTabClick = (tabId: string) => {
    onCloseSidebar();
    onCloseAgendaDrawer();
    setActiveNav(tabId);
  };

  const handleAgendaClick = () => {
    onCloseSidebar();
    onOpenAgendaDrawer();
  };

  return (
    <div
      className="no-print lg:hidden fixed bottom-2.5 sm:bottom-4 inset-x-2.5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[460px] sm:max-w-[calc(100vw-32px)] z-30 pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav
        aria-label="Navigasi Cepat Mobile dan Tablet"
        aria-hidden={isHidden}
        className={`flex h-14 sm:h-[60px] items-center justify-around gap-1 rounded-[22px] sm:rounded-[26px] border border-white/80 bg-white/95 px-1.5 sm:px-2 shadow-[0_16px_38px_-6px_rgba(62,56,91,0.24)] backdrop-blur-xl transition-[transform,opacity,filter] duration-400 will-change-transform ${
          isHidden
            ? 'translate-y-28 scale-90 opacity-0 blur-[2px] pointer-events-none ease-[cubic-bezier(0.22,1,0.36,1)]'
            : 'translate-y-0 scale-100 opacity-100 blur-0 pointer-events-auto ease-[cubic-bezier(0.34,1.35,0.64,1)]'
        }`}
      >
        {quickTabs.map(tab => {
          const isActive = activeNav === tab.id && !rightDrawerOpen;
          return (
            <button
              key={tab.id}
              type="button"
              tabIndex={isHidden ? -1 : 0}
              onClick={() => handleBottomTabClick(tab.id)}
              className={`no-ornament relative flex min-h-[44px] sm:min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[16px] sm:rounded-[18px] px-1 transition-all duration-250 ease-[cubic-bezier(0.34,1.35,0.64,1)] active:scale-92 cursor-pointer ${
                isActive
                  ? 'bg-[#6C60B8] text-white shadow-[0_8px_20px_rgba(108,96,184,0.38)] -translate-y-0.5'
                  : 'text-[#6E6A86] hover:bg-[#F2F0FC] hover:text-[#3E385B]'
              }`}
            >
              <span className={isActive ? 'animate-dock-pop flex items-center justify-center' : 'flex items-center justify-center'}>
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
          type="button"
          tabIndex={isHidden ? -1 : 0}
          onClick={handleAgendaClick}
          className={`no-ornament relative flex min-h-[44px] sm:min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[16px] sm:rounded-[18px] px-1 transition-all duration-250 ease-[cubic-bezier(0.34,1.35,0.64,1)] active:scale-92 cursor-pointer ${
            rightDrawerOpen
              ? 'bg-[#FF7597] text-white shadow-[0_8px_20px_rgba(255,117,151,0.38)] -translate-y-0.5'
              : 'text-[#6E6A86] hover:bg-[#FFF0F4] hover:text-[#3E385B]'
          }`}
        >
          <div className={`relative ${rightDrawerOpen ? 'animate-dock-pop' : ''}`}>
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

        {/* Full Menu Drawer Trigger — Opens Sidebar and auto-hides this Bottom Dock */}
        <button
          type="button"
          tabIndex={isHidden ? -1 : 0}
          onClick={onOpenSidebar}
          className="no-ornament flex min-h-[44px] sm:min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[16px] sm:rounded-[18px] px-1 text-[#6E6A86] hover:bg-[#F2F0FC] hover:text-[#6C60B8] transition-all duration-250 active:scale-92 cursor-pointer"
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
