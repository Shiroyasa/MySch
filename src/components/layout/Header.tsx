import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  Sun,
  Moon,
  GraduationCap,
  Calendar,
  Trash2,
  Megaphone,
  User,
  Users,
  CheckCircle2,
  Camera,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { BroadcastAnnouncementModal } from '../common/BroadcastAnnouncementModal';
import { ProfileModal } from '../common/ProfileModal';

const roleLabels: Record<UserRole, { label: string; badgeColor: string; title: string }> = {
  super_admin: { label: 'Super Admin', title: 'Administrator', badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-purple-200' },
  admin: { label: 'Admin TU', title: 'Tata Usaha', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-200' },
  guru: { label: 'Guru Mapel', title: 'Tenaga Pendidik', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-200' },
  wali_kelas: { label: 'Wali Kelas', title: 'Pembimbing Kelas', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-200' },
  kepala_sekolah: { label: 'Kepala Sekolah', title: 'Pimpinan Lembaga', badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-200' },
  siswa: { label: 'Siswa', title: 'Peserta Didik', badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200 border-cyan-200' },
};

export const Header: React.FC<{ onToggleMobileSidebar: () => void }> = ({ onToggleMobileSidebar }) => {
  const {
    currentUser,
    currentRole,
    darkMode,
    toggleDarkMode,
    activeAcademicYear,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    setShowLogoutModal,
    isFirestoreConnected,
    isSyncing,
    lastSyncTime,
    forceCloudResync,
    visualSettings,
    schoolSettings,
    setActiveNav,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotifTab, setAdminNotifTab] = useState<'all' | 'mine' | 'broadcast'>('all');

  const isAdmin = currentRole === 'admin' || currentRole === 'super_admin';
  const activeLogoUrl = visualSettings?.appLogoUrl || schoolSettings?.logoUrl || null;
  const logoFitClass = visualSettings?.appLogoFit === 'cover' ? 'object-cover' : 'object-contain p-0.5';

  // Per-profile notification filtering:
  // Admin can view ALL notifications ("dia bisa melihat keseluruhan").
  // Non-admin can ONLY view notifications relevant to their profile or broadcast to them!
  const visibleNotifs = notifications.filter(n => {
    if (isAdmin) {
      if (adminNotifTab === 'mine') {
        return n.recipientId === currentUser.id;
      }
      if (adminNotifTab === 'broadcast') {
        return n.isBroadcast || n.targetRole === 'all';
      }
      return true; // Admin views all
    }
    // Specific profile only
    return (
      n.recipientId === currentUser.id ||
      n.targetRole === currentRole ||
      n.targetRole === 'all' ||
      n.isBroadcast
    );
  });

  const unreadNotifs = visibleNotifs.filter(n => !n.isRead);

  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
        {/* Left side: Hamburger button + School title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            title="Buka Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div
              onClick={() => {
                if (isAdmin) setActiveNav('settings');
              }}
              title={isAdmin ? 'Klik untuk mengatur Logo Aplikasi & Favicon di Pengaturan Sistem' : schoolSettings?.schoolName || 'ORBITA'}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4AF37]/60 bg-gradient-to-br from-[#132852] to-[#1E3A8A] text-white shadow-sm overflow-hidden shrink-0 ${
                isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-amber-400/60 transition-all' : ''
              }`}
            >
              {activeLogoUrl ? (
                <img
                  src={activeLogoUrl}
                  alt="Logo Aplikasi"
                  className={`h-full w-full ${logoFitClass}`}
                />
              ) : (
                <GraduationCap className="h-4.5 w-4.5 text-[#FDE047]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">
                  ORBITA
                </span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  T.A. {activeAcademicYear.name} ({activeAcademicYear.activeSemester.toUpperCase()})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions, Broadcast Button, Notifications, Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Firestore Sync Status Badge */}
          <div
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
            title={
              lastSyncTime
                ? `Basis Data Cloud Terhubung. Terakhir sinkron: ${lastSyncTime.toLocaleTimeString()}`
                : 'Basis Data Cloud Terhubung'
            }
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Cloud className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden xl:inline">Cloud Firestore</span>
            <button
              onClick={() => forceCloudResync()}
              disabled={isSyncing}
              title="Sinkronkan basis data cloud sekarang"
              className="ml-0.5 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-white disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Kirim Pemberitahuan Massal Button (Allowed for authorized roles, NOT siswa) */}
          {currentRole !== 'siswa' && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70 transition-colors shadow-2xs"
              title="Beri Pemberitahuan ke Semua Role"
            >
              <Megaphone className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Beri Pengumuman</span>
            </button>
          )}

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
              title={isAdmin ? 'Pemberitahuan (Pantauan Admin)' : 'Pemberitahuan Akun Anda'}
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Click-outside backdrop: klik sembarang langsung menutup dan mengecilkan jendela notifikasi */}
            {showNotifMenu && (
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowNotifMenu(false)}
                aria-hidden="true"
              />
            )}

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-scale-up origin-top-right transition-all">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Pemberitahuan
                    </span>
                    {isAdmin && (
                      <span className="rounded-md bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        Admin: Semua Profil
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 hover:underline dark:text-blue-400 font-medium"
                      >
                        Tandai dibaca
                      </button>
                    )}
                    {visibleNotifs.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-rose-500 hover:underline dark:text-rose-400 font-medium"
                        title="Hapus notifikasi"
                      >
                        Hapus Semua
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs for Admin */}
                {isAdmin && (
                  <div className="flex items-center gap-1 pt-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-[10px]">
                    <button
                      onClick={() => setAdminNotifTab('all')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                        adminNotifTab === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Semua ({notifications.length})
                    </button>
                    <button
                      onClick={() => setAdminNotifTab('mine')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                        adminNotifTab === 'mine'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Profil Admin ({notifications.filter(n => n.recipientId === currentUser.id).length})
                    </button>
                    <button
                      onClick={() => setAdminNotifTab('broadcast')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                        adminNotifTab === 'broadcast'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Pengumuman ({notifications.filter(n => n.isBroadcast || n.targetRole === 'all').length})
                    </button>
                  </div>
                )}

                {/* Notifications List */}
                <div className="mt-2 max-h-80 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-50 dark:divide-slate-800/60">
                  {visibleNotifs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                      <p>Tidak ada pemberitahuan pada profil ini.</p>
                      <p className="text-[10px]">Notifikasi otomatis diperbarui setiap kali terjadi perubahan data.</p>
                    </div>
                  ) : (
                    visibleNotifs.map(n => (
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
                          <div
                            className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                              n.isRead ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-600'
                            }`}
                          />
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {n.title}
                              </span>
                              {n.isBroadcast && (
                                <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  Pengumuman Massal
                                </span>
                              )}
                              {isAdmin && n.recipientName && (
                                <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[9px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  Untuk: {n.recipientName}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-slate-400 block">
                              {new Date(n.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              WIB
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

          {/* User Profile Pill - Clickable to edit photo & account data anywhere */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="group flex items-center gap-2.5 pl-2.5 py-1 pr-2 rounded-2xl border-l border-slate-200 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            title="Klik untuk ganti foto profil & perbarui data akun Anda"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 font-extrabold text-white text-xs shadow-sm ring-1 ring-blue-500/20 group-hover:ring-blue-500 transition-all">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName} className="h-full w-full object-cover" />
              ) : (
                <span>{currentUser.displayName.charAt(0)}</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Camera className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[140px] truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {currentUser.displayName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium max-w-[140px] truncate">
                {currentUser.email}
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* Profile & Photo Edit Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Broadcast Announcement Modal */}
      <BroadcastAnnouncementModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
      />
    </>
  );
};
