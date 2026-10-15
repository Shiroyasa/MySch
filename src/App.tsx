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
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { LogoutModal } from './components/common/LogoutModal';
import { ChevronRight } from 'lucide-react';

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

  const getBreadcrumbTitle = () => {
    switch (activeNav) {
      case 'dashboard':
        return currentRole === 'siswa' ? 'Profil Siswa' : 'Dashboard Utama';
      case 'student-profile':
        return 'Profil Siswa';
      case 'student-grades':
        return 'Nilai Siswa (Per Profile & Keseluruhan)';
      case 'attendance':
        return 'Presensi & Absensi Siswa';
      case 'grading':
        return 'Penilaian Akademik & Nilai';
      case 'master-data':
        return 'Master Data Sekolah';
      case 'reports':
        return 'Pusat Laporan & Ekspor';
      case 'ai-studio':
        return 'Studio AI & Asisten Pedagogik';
      case 'user-management':
        return 'Manajemen Akun & Hak Akses';
      case 'audit-logs':
        return 'Audit Log Keamanan';
      case 'settings':
        return 'Profil & Pengaturan';
      default:
        return 'Dashboard';
    }
  };

  const handleHomeClick = () => {
    if (currentRole === 'siswa') {
      setActiveNav('student-profile');
    } else {
      setActiveNav('dashboard');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Breadcrumb sub-header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white/60 px-4 py-2.5 backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/60 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={handleHomeClick}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              MySchool
            </button>
            <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {getBreadcrumbTitle()}
            </span>
          </nav>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>SMK Mardi Yuana Cikembar</span>
            <span>&bull;</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Sistem Aktif</span>
          </div>
        </div>

        {/* Scrollable Page View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Student Specific Views */}
            {activeNav === 'student-profile' && <StudentModule initialTab="profile" />}
            {activeNav === 'student-grades' && <StudentModule initialTab="grades" />}

            {/* General Modules */}
            {activeNav === 'dashboard' && <DashboardRouter />}
            {activeNav === 'attendance' && <AttendanceModule />}
            {activeNav === 'grading' && <GradingModule />}
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

  if (pageView === 'landing') {
    return <LandingPage />;
  }

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
