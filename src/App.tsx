import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
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
  const {
    activeNav,
    setActiveNav,
    currentRole,
    showLogoutModal,
    setShowLogoutModal,
    logout,
  } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-full overflow-hidden font-sans text-slate-900 transition-colors dark:text-slate-100">
      {/* Clean Anime Scenery & Sakura Background */}
      <AnimeBackground />

      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main View Area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Scrollable Page View with Clean Glass Backdrop */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
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

            {/* Footer */}
            <footer className="mt-12 border-t border-slate-200 pt-6 pb-4 text-center text-xs text-slate-400 dark:border-slate-800">
              <p className="font-semibold text-slate-600 dark:text-slate-400">
                MySchool &bull; Sistem Absensi &amp; Penilaian Siswa SMK Mardi Yuana Cikembar
              </p>
              <p className="mt-1 text-[11px]">
                NPSN: 20253654 &bull; Terakreditasi A (Unggul) &bull; Sukabumi, Jawa Barat
              </p>
            </footer>
          </div>
        </main>
      </div>

      {/* Pop up Confirmation Modal for Logging Out */}
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
