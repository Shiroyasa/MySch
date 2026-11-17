import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { RightActivityPanel } from './components/layout/RightActivityPanel';
import { DashboardRouter } from './components/dashboard/DashboardRouter';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { GradingModule } from './components/modules/GradingModule';
import { MasterDataModule } from './components/modules/MasterDataModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { AiStudioModule } from './components/modules/AiStudioModule';
import { UserManagementModule } from './components/modules/UserManagementModule';
import { AuditLogModule } from './components/modules/AuditLogModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { StudentModule } from './components/modules/StudentModule';
import { PklModule } from './components/modules/PklModule';
import { GalleryModule } from './components/modules/GalleryModule';
import { LoginPage } from './components/pages/LoginPage';
import { LogoutModal } from './components/common/LogoutModal';
import { AnimeBackground } from './components/common/AnimeBackground';

import { MobileBottomNav } from './components/layout/MobileBottomNav';

const MainContent: React.FC = () => {
  const { activeNav, showLogoutModal, setShowLogoutModal, logout } = useApp();
  // Default to collapsed = true to match the exact vertical purple icon pill in the reference image
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  const handleOpenSidebar = () => {
    setRightDrawerOpen(false);
    setMobileSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const handleToggleRightDrawer = () => {
    setMobileSidebarOpen(false);
    setRightDrawerOpen(prev => !prev);
  };

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden p-0 sm:p-3 md:p-4 lg:p-6 font-sans text-[#3E385B] dark:text-slate-100">
      {/* Outer Soft Lavender-Slate Backdrop */}
      <AnimeBackground />

      {/* Outer Frosted Violet-Glass Tablet/Desktop Bezel Frame */}
      <div className="relative z-10 flex h-full w-full max-w-[1560px] overflow-hidden rounded-none sm:rounded-[34px] lg:rounded-[40px] border-0 sm:border sm:border-white/60 sm:dark:border-[#8D81E3]/25 bg-transparent sm:bg-[#EAE7F9]/38 sm:dark:bg-[#191536]/48 p-0 sm:p-2 lg:p-2.5 sm:shadow-[0_32px_80px_-12px_rgba(79,67,156,0.28)] sm:backdrop-blur-xl">
        {/* Inner Translucent Lavender-Glass Application Canvas */}
        <div className="relative flex h-full w-full overflow-hidden rounded-none sm:rounded-[28px] lg:rounded-[32px] bg-[#F5F4FB]/88 dark:bg-[#121026]/88 backdrop-blur-md">
          {/* Left Floating Vertical Frosted Violet Pill Sidebar */}
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={handleCloseSidebar}
          />

          {/* Center Main Content Area */}
          <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
            {/* Top Header */}
            <Header
              onToggleMobileSidebar={handleOpenSidebar}
              onToggleRightDrawer={handleToggleRightDrawer}
            />

            {/* Scrollable Page Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 pb-24 lg:pb-8 pt-1.5 sm:px-6 lg:px-7">
              <div className="mx-auto max-w-6xl min-w-0">
                {/* Student Specific Views */}
                {activeNav === 'student-profile' && <StudentModule initialTab="profile" />}
                {activeNav === 'student-grades' && <StudentModule initialTab="grades" />}

                {/* General Modules */}
                {activeNav === 'dashboard' && <DashboardRouter />}
                {activeNav === 'attendance' && <AttendanceModule />}
                {activeNav === 'grading' && <GradingModule />}
                {activeNav === 'pkl' && <PklModule />}
                {activeNav === 'master-data' && <MasterDataModule />}
                {activeNav === 'gallery' && <GalleryModule />}
                {activeNav === 'reports' && <ReportsModule />}
                {activeNav === 'ai-studio' && <AiStudioModule />}
                {activeNav === 'user-management' && <UserManagementModule />}
                {activeNav === 'audit-logs' && <AuditLogModule />}
                {activeNav === 'settings' && <SettingsModule />}

                {/* Clean Quiet Footer */}
                <footer className="mt-10 border-t border-[#ECEBF5] dark:border-slate-800 pt-5 pb-3 text-center text-xs text-[#9694A8] dark:text-slate-400">
                  <p className="font-bold text-[#3E385B] dark:text-slate-200">
                    ORBITA AKADEMI &middot; Sistem Informasi Akademik &amp; Presensi Terpadu
                  </p>
                  <p className="mt-1 text-[11px] text-[#A2A0B4] dark:text-slate-500">
                    Sukabumi, Jawa Barat
                  </p>
                </footer>
              </div>
            </main>
          </div>

          {/* Right Activity & Live Map Panel (Static on xl+, Interactive Slide-Over Drawer on Mobile & Tablet) */}
          <RightActivityPanel
            isOpenMobile={rightDrawerOpen}
            onCloseMobile={() => setRightDrawerOpen(false)}
          />
        </div>
      </div>

      {/* Mobile & Tablet Bottom Thumb-Zone Navigation Dock (<1024px) — Auto-hides smoothly when Sidebar opens */}
      <MobileBottomNav
        isHidden={mobileSidebarOpen}
        onOpenSidebar={handleOpenSidebar}
        onCloseSidebar={handleCloseSidebar}
        onOpenAgendaDrawer={handleToggleRightDrawer}
        onCloseAgendaDrawer={() => setRightDrawerOpen(false)}
        rightDrawerOpen={rightDrawerOpen}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { pageView } = useApp();

  if (pageView !== 'app') {
    return <LoginPage />;
  }

  return <MainContent />;
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
