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
import { LoginPage } from './components/pages/LoginPage';
import { LogoutModal } from './components/common/LogoutModal';
import { AnimeBackground } from './components/common/AnimeBackground';

const MainContent: React.FC = () => {
  const { activeNav, showLogoutModal, setShowLogoutModal, logout } = useApp();
  // Default to collapsed = true to match the exact vertical purple icon pill in the reference image
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden p-2 sm:p-4 lg:p-6 font-sans text-[#3E385B]">
      {/* Outer Soft Lavender-Slate Backdrop */}
      <AnimeBackground />

      {/* Outer Frosted Tablet/Desktop Bezel Frame Matching the Reference Image */}
      <div className="relative z-10 flex h-full w-full max-w-[1560px] overflow-hidden rounded-[32px] sm:rounded-[40px] border border-white/65 bg-white/40 p-1.5 sm:p-2.5 shadow-[0_32px_80px_-12px_rgba(62,56,91,0.22)] backdrop-blur-md">
        {/* Inner Crisp Snow-White Application Canvas */}
        <div className="relative flex h-full w-full overflow-hidden rounded-[26px] sm:rounded-[32px] bg-[#F8F9FD]">
          {/* Left Floating Vertical Purple Pill Sidebar */}
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          {/* Center Main Content Area */}
          <div className="relative z-10 flex flex-1 flex-col overflow-hidden bg-[#F8F9FD]">
            {/* Top Header ("Primary / Dashboard" + Search Pill + Avatar) */}
            <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

            {/* Scrollable Page Content with Menu Transition Animation */}
            <main className="flex-1 overflow-y-auto px-4 pb-8 pt-2 sm:px-7">
              <div
                key={activeNav}
                className="page-transition-stage animate-page-enter mx-auto max-w-6xl"
              >
                {/* Student Specific Views */}
                {activeNav === 'student-profile' && <StudentModule initialTab="profile" />}
                {activeNav === 'student-grades' && <StudentModule initialTab="grades" />}

                {/* General Modules */}
                {activeNav === 'dashboard' && <DashboardRouter />}
                {activeNav === 'attendance' && <AttendanceModule />}
                {activeNav === 'grading' && <GradingModule />}
                {activeNav === 'pkl' && <PklModule />}
                {activeNav === 'master-data' && <MasterDataModule />}
                {activeNav === 'reports' && <ReportsModule />}
                {activeNav === 'ai-studio' && <AiStudioModule />}
                {activeNav === 'user-management' && <UserManagementModule />}
                {activeNav === 'audit-logs' && <AuditLogModule />}
                {activeNav === 'settings' && <SettingsModule />}

                {/* Clean Quiet Footer */}
                <footer className="mt-10 border-t border-[#ECEBF5] pt-5 pb-3 text-center text-xs text-[#9694A8]">
                  <p className="font-bold text-[#3E385B]">
                    ORBITA AKADEMI &middot; Sistem Informasi Akademik &amp; Presensi Terpadu
                  </p>
                  <p className="mt-1 text-[11px] text-[#A2A0B4]">
                    NPSN: 20253654 &middot; Terakreditasi A (Unggul) &middot; Sukabumi, Jawa Barat
                  </p>
                </footer>
              </div>
            </main>
          </div>

          {/* Right Activity & Live Map Panel (Matching "Friends" & "Live map" in Reference Image) */}
          <RightActivityPanel />
        </div>
      </div>

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

  if (pageView === 'login') {
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
