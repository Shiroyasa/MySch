import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  Sun,
  Moon,
  Search,
  LogOut,
  ShieldCheck,
  School,
  Calendar,
  Trash2,
} from 'lucide-react';

const roleLabels: Record<UserRole, { label: string; badgeColor: string }> = {
  super_admin: { label: 'Super Admin', badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-purple-200' },
  admin: { label: 'Admin TU', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-200' },
  guru: { label: 'Guru Mapel', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-200' },
  wali_kelas: { label: 'Wali Kelas', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-200' },
  kepala_sekolah: { label: 'Kepala Sekolah', badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-200' },
  siswa: { label: 'Siswa', badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200 border-cyan-200' },
};

export const Header: React.FC<{ onToggleMobileSidebar: () => void }> = ({ onToggleMobileSidebar }) => {
  const {
    currentUser,
    currentRole,
    switchRole,
    darkMode,
    toggleDarkMode,
    activeAcademicYear,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    setActiveNav,
    setPageView,
    logout,
    setShowLogoutModal,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left side: Hamburger button + School title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          title="Buka Menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base sm:text-lg">
                MySchool
              </span>
              <span className="hidden sm:inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                SMK Mardi Yuana Cikembar
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="h-3 w-3 text-blue-500" />
              <span>T.A. {activeAcademicYear.name} ({activeAcademicYear.activeSemester.toUpperCase()})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Quick Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa, guru, kelas, atau modul..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, Theme, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark mode button */}
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          title={darkMode ? 'Beralih ke Terang' : 'Beralih ke Gelap'}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            title="Notifikasi"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1 dark:border-slate-800">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">Pemberitahuan</span>
                <div className="flex items-center gap-2">
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-blue-600 hover:underline dark:text-blue-400 font-medium"
                    >
                      Tandai dibaca
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-rose-500 hover:underline dark:text-rose-400 font-medium"
                      title="Hapus semua notifikasi"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2 max-h-80 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-50 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">Tidak ada notifikasi saat ini.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`group flex items-start justify-between gap-2 rounded-xl p-2.5 transition-colors ${
                        n.isRead ? 'bg-transparent opacity-75' : 'bg-blue-50/60 dark:bg-blue-950/40'
                      } hover:bg-slate-100 dark:hover:bg-slate-800`}
                    >
                      <div
                        onClick={() => markNotificationRead(n.id)}
                        className="flex items-start gap-2 flex-1 cursor-pointer"
                      >
                        <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.isRead ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-600'}`} />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Hapus notifikasi ini"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Role User Aktif (Sesuai role masing-masing) */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200 shadow-xs">
          <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="text-left hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Status Peran</span>
            <span className="font-bold text-slate-900 dark:text-white leading-none">{roleLabels[currentRole]?.label}</span>
          </div>
        </div>

        {/* User Avatar & Logout Button */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs shadow-inner">
            {currentUser.displayName.charAt(0)}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight max-w-[140px] truncate">
              {currentUser.displayName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
              {currentUser.role.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
            title="Keluar dari Sistem (Log Out)"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
