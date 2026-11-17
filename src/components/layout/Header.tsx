import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Trash2,
  Megaphone,
  Camera,
  Cloud,
  RefreshCw,
  Search,
  Menu,
  MapPin,
  X,
} from 'lucide-react';
import { BroadcastAnnouncementModal } from '../common/BroadcastAnnouncementModal';
import { ProfileModal } from '../common/ProfileModal';
import { LiquidNavBar } from '../common/LiquidNavBar';
import { ThemeFlipToggle } from '../common/ThemeFlipToggle';

export const Header: React.FC<{
  onToggleMobileSidebar: () => void;
  onToggleRightDrawer?: () => void;
}> = ({ onToggleMobileSidebar, onToggleRightDrawer }) => {
  const {
    currentUser,
    currentRole,
    activeAcademicYear,
    notifications,
    attendanceCorrections,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    isSyncing,
    lastSyncTime,
    forceCloudResync,
    activeNav,
    setActiveNav,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [adminNotifTab, setAdminNotifTab] = useState<'all' | 'mine' | 'broadcast'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [deletingNotifIds, setDeletingNotifIds] = useState<string[]>([]);

  const handleGenieDeleteNotif = (id: string) => {
    setDeletingNotifIds(prev => (prev.includes(id) ? prev : [...prev, id]));
    window.setTimeout(() => {
      deleteNotification(id);
      setDeletingNotifIds(prev => prev.filter(item => item !== id));
    }, 420);
  };

  const isAdmin = currentRole === 'admin' || currentRole === 'super_admin';
  const pendingCorrCount = attendanceCorrections.filter(c => c.status === 'pending').length;

  const navMetaMap: Record<string, { kicker: string; title: string }> = {
    dashboard: { kicker: 'Primary', title: 'Dashboard' },
    attendance: { kicker: 'Primary • Kehadiran', title: 'Presensi & Absensi' },
    grading: { kicker: 'Primary • Akademik', title: 'Penilaian & KKM' },
    pkl: { kicker: 'Primary • Industri', title: 'Administrasi PKL' },
    'master-data': { kicker: 'Primary • Basis Data', title: 'Master Data' },
    gallery: { kicker: 'Primary • Publikasi', title: 'Galeri Kegiatan' },
    reports: { kicker: 'Primary • Dokumen', title: 'Laporan & Ekspor' },
    'user-management': { kicker: 'Primary • Otorisasi', title: 'Manajemen Akun' },
    'audit-logs': { kicker: 'Primary • Keamanan', title: 'Audit Log Sistem' },
    settings: { kicker: 'Primary • Sistem', title: 'Pengaturan ORBITA' },
    'student-profile': { kicker: 'Primary • Siswa', title: 'Profil & Kehadiran' },
    'student-grades': { kicker: 'Primary • Siswa', title: 'Transkrip Nilai' },
  };

  const currentMeta = navMetaMap[activeNav] || { kicker: 'Primary', title: 'Dashboard' };

  const allSearchableMenus =
    currentRole === 'siswa'
      ? [
          { id: 'student-profile', label: 'Profil & Biodata Siswa' },
          { id: 'student-grades', label: 'Transkrip Nilai & KKM Siswa' },
          { id: 'pkl', label: 'Administrasi Prakerin / PKL' },
        ]
      : [
          { id: 'dashboard', label: 'Dashboard Utama ORBITA' },
          { id: 'attendance', label: 'Presensi & Absensi Harian Siswa' },
          { id: 'grading', label: 'Penilaian Akademik & Ketuntasan KKM' },
          { id: 'pkl', label: 'Administrasi Prakerin / PKL' },
          { id: 'reports', label: 'Laporan & Ekspor Dokumen' },
          ...(isAdmin
            ? [
                { id: 'master-data', label: 'Master Data Pokok Sekolah' },
                { id: 'gallery', label: 'Galeri Foto Dokumentasi & View Carousel' },
                { id: 'user-management', label: 'Manajemen Akun & Role' },
              ]
            : []),
          ...(isAdmin || currentRole === 'kepala_sekolah'
            ? [{ id: 'audit-logs', label: 'Audit Log & Keamanan Akses' }]
            : []),
          { id: 'settings', label: 'Pengaturan Sistem ORBITA' },
        ];

  const filteredMenus = allSearchableMenus.filter(m =>
    m.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const visibleNotifs = notifications.filter(n => {
    if (isAdmin) {
      if (adminNotifTab === 'mine') {
        return n.recipientId === currentUser.id;
      }
      if (adminNotifTab === 'broadcast') {
        return n.isBroadcast || n.targetRole === 'all';
      }
      return true;
    }
    return (
      n.recipientId === currentUser.id ||
      n.targetRole === currentRole ||
      n.targetRole === 'all' ||
      n.isBroadcast
    );
  });

  const unreadNotifs = visibleNotifs.filter(n => !n.isRead);

  return (
    <>
      <header className="relative md:sticky top-0 z-30 w-full bg-[#F4F3FC]/74 dark:bg-[#191636]/76 backdrop-blur-xl px-3.5 sm:px-6 lg:px-8 pt-1.5 pb-1 sm:pt-2 sm:pb-1.5 border-b border-[#7468C4]/14 dark:border-[#8D81E3]/18">
        <div className="flex h-14 sm:h-[70px] w-full items-center justify-between gap-2.5">
          {/* Left: Mobile/Tablet Menu Button + Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="no-ornament flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-[#6C60B8]/86 backdrop-blur-md text-white shadow-[0_8px_18px_rgba(101,88,181,0.34)] hover:bg-[#5B4FA8]/92 active:scale-95 lg:hidden cursor-pointer"
              title="Buka Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <span className="block text-[10.5px] sm:text-xs font-medium text-[#A2A0B4] dark:text-slate-400 leading-tight truncate">
                {currentMeta.kicker}
              </span>
              <h2 className="text-base sm:text-xl lg:text-2xl font-extrabold text-[#3E385B] dark:text-white tracking-tight leading-tight truncate">
                {currentMeta.title}
              </h2>
            </div>
          </div>

          {/* Right: Tablet/Desktop Search + Mobile Search Trigger + Agenda Drawer + Bell + Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Tablet & Desktop Search Pill (hidden on <640px so title has breathing room) */}
            <div className="relative hidden sm:block">
              <div className="orbita-searchbar orbita-field-underline flex items-center gap-2 rounded-full bg-[#EFEFF6] dark:bg-slate-800/90 px-3.5 py-2 text-[#3E385B] dark:text-slate-100 w-44 md:w-56 lg:w-60 transition-all focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-[#6C60B8]/25">
                <Search className="h-4 w-4 text-[#4A4368] dark:text-indigo-300 shrink-0 stroke-[2.4]" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 180)}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  placeholder="Cari menu..."
                  className="w-full bg-transparent text-xs font-medium text-[#3E385B] dark:text-slate-100 placeholder:text-[#A2A0B4] dark:placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {showSearchDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute right-0 mt-2 w-72 rounded-[20px] border border-[#ECEBF5] bg-white dark:border-slate-800 dark:bg-slate-900 p-2 text-[#3E385B] dark:text-slate-100 shadow-[0_18px_40px_rgba(108,96,184,0.16)] z-50">
                  {filteredMenus.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-[#9694A8] dark:text-slate-400">Menu tidak ditemukan.</p>
                  ) : (
                    filteredMenus.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={() => {
                          setActiveNav(item.id);
                          setSearchQuery('');
                          setShowSearchDropdown(false);
                        }}
                        className="no-ornament flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-xs font-bold text-[#3E385B] dark:text-slate-200 hover:bg-[#F3F2FA] dark:hover:bg-slate-800 hover:text-[#6C60B8] dark:hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        <span>{item.label}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Toggle Icon (<sm) */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(prev => !prev)}
              className={`orbita-searchbar no-ornament sm:hidden flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer ${
                mobileSearchOpen
                  ? 'bg-[#6C60B8] text-white'
                  : 'bg-[#EFEFF6] text-[#3E385B] hover:bg-[#E4E2F5] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Cari Menu"
            >
              {mobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>

            {/* Tablet & Mobile Agenda KBM + Live Map Drawer Trigger (hidden on xl+) */}
            {onToggleRightDrawer && (
              <button
                type="button"
                onClick={onToggleRightDrawer}
                className="no-ornament relative xl:hidden inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#EFEFF6] hover:bg-[#E4E2F5] dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 sm:px-3.5 text-xs font-extrabold text-[#6C60B8] dark:text-indigo-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Buka Agenda KBM & Live Map GPS"
              >
                <MapPin className="h-4 w-4 text-[#F25781] shrink-0" />
                <span className="hidden md:inline">Agenda &amp; GPS</span>
                {pendingCorrCount > 0 && (
                  <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#FF6E96] px-1 text-[9px] font-black text-white">
                    {pendingCorrCount}
                  </span>
                )}
              </button>
            )}

            {/* Cloud Sync Pill (xl+ desktop) */}
            <div
              className="hidden xl:flex items-center gap-1.5 rounded-full bg-[#EFEFF6] dark:bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-[#3E385B] dark:text-slate-200"
              title={
                lastSyncTime
                  ? `Basis Data Cloud Terhubung • T.A. ${activeAcademicYear.name} (${lastSyncTime.toLocaleTimeString()})`
                  : 'Basis Data Cloud Terhubung'
              }
            >
              <Cloud className="h-3.5 w-3.5 text-[#1CC865] shrink-0" />
              <span>T.A. {activeAcademicYear.name}</span>
              <button
                type="button"
                onClick={() => forceCloudResync()}
                disabled={isSyncing}
                title="Sinkronkan basis data cloud sekarang"
                className="no-ornament ml-0.5 text-[#6C60B8] hover:text-[#4E42A1] dark:text-indigo-300 dark:hover:text-indigo-200 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Broadcast Button (md+ tablet/desktop) */}
            {currentRole !== 'siswa' && (
              <button
                type="button"
                onClick={() => setShowBroadcastModal(true)}
                className="no-ornament hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-[#EFEFF6] text-[#6C60B8] hover:bg-[#E4E2F5] dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Kirim Pengumuman ke Semua Pengguna"
              >
                <Megaphone className="h-4 w-4" />
              </button>
            )}

            {/* Theme Flip Light / Dark Mode Toggle */}
            <ThemeFlipToggle size="sm" />

            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="no-ornament relative flex h-10 w-10 items-center justify-center rounded-full bg-[#EFEFF6] text-[#3E385B] hover:bg-[#E4E2F5] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Pemberitahuan"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#FF6E96] text-[9px] font-extrabold text-white shadow">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowNotifMenu(false)}
                  aria-hidden="true"
                />
              )}

              {showNotifMenu && (
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-96 rounded-[24px] border border-[#7468C4]/25 bg-white/88 dark:border-[#9E92FF]/25 dark:bg-[#1E1A3E]/88 backdrop-blur-2xl p-4 text-[#3E385B] dark:text-slate-100 shadow-[0_24px_56px_rgba(68,56,146,0.26)] z-50 animate-wobble-in origin-top-right">
                  <div className="flex items-center justify-between border-b border-[#F0F1F6] dark:border-slate-800 pb-2.5 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-[#3E385B] dark:text-white">Pemberitahuan</span>
                      {isAdmin && (
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-[#F0EEFA] text-[#6C60B8] dark:bg-indigo-950 dark:text-indigo-300">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                    {unreadNotifs.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="no-ornament inline-flex items-center text-xs text-[#6C60B8] dark:text-indigo-300 hover:underline font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Baca Semua
                      </button>
                    )}
                    {visibleNotifs.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        className="no-ornament inline-flex items-center text-xs text-[#F25781] hover:underline font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-2.5 pb-2 border-b border-[#F0F1F6] dark:border-slate-800">
                    <LiquidNavBar
                      size="sm"
                      pill
                      fullWidth
                      ariaLabel="Filter Pemberitahuan"
                      activeId={adminNotifTab}
                      onSelect={id => setAdminNotifTab(id as 'all' | 'mine' | 'broadcast')}
                      items={[
                        { id: 'all', label: `Semua (${notifications.length})` },
                        {
                          id: 'mine',
                          label: `Profil (${notifications.filter(n => n.recipientId === currentUser.id).length})`,
                        },
                        {
                          id: 'broadcast',
                          label: `Broadcast (${
                            notifications.filter(n => n.isBroadcast || n.targetRole === 'all').length
                          })`,
                        },
                      ]}
                    />
                  </div>
                )}

                <div className="mt-2 max-h-80 overflow-y-auto space-y-2 pr-1">
                  {visibleNotifs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#9694A8] dark:text-slate-400">
                      <p>Tidak ada pemberitahuan pada profil ini.</p>
                    </div>
                  ) : (
                    visibleNotifs.map(n => (
                      <div
                        key={n.id}
                        className={`group flex items-start justify-between gap-2 rounded-[16px] border p-3 transition-colors ${
                          deletingNotifIds.includes(n.id) ? 'animate-genie-bin-exit' : ''
                        } ${
                          n.isRead
                            ? 'border-[#F0F1F6] bg-[#FAF9FE] dark:border-slate-800 dark:bg-slate-800/40 opacity-80'
                            : 'border-[#E2DFF5] bg-[#F5F4FC] dark:border-indigo-900/60 dark:bg-indigo-950/35'
                        }`}
                      >
                        <div
                          onClick={() => markNotificationRead(n.id)}
                          className="flex items-start gap-2.5 flex-1 cursor-pointer"
                        >
                          <div
                            className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                              n.isRead ? 'bg-[#C2C0D1] dark:bg-slate-600' : 'bg-[#6C60B8]'
                            }`}
                          />
                          <div className="space-y-1 flex-1">
                            <span className="text-xs font-bold text-[#3E385B] dark:text-white block">{n.title}</span>
                            <p className="text-xs text-[#7E7898] dark:text-slate-300 leading-snug">{n.message}</p>
                            <span className="text-[10px] text-[#A2A0B4] dark:text-slate-400 block">
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
                            handleGenieDeleteNotif(n.id);
                          }}
                          className="no-ornament p-1 text-[#A2A0B4] hover:text-[#F25781] cursor-pointer"
                          title="Buang ke Genie Bin"
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

          {/* Circular User Profile Avatar (Exact Top-Right Avatar from Reference Image) */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="no-ornament group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E6E4F4] dark:bg-slate-800 ring-2 ring-white dark:ring-slate-700 shadow-[0_6px_16px_rgba(62,56,91,0.14)] cursor-pointer"
            title={`${currentUser.displayName} • Klik untuk buka profil`}
          >
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-extrabold text-[#6C60B8] dark:text-indigo-300">
                {(currentUser.displayName || 'OR').slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Camera className="h-3.5 w-3.5" />
            </div>
          </button>
        </div>
        </div>

        {/* Expandable Full-Width Mobile Search Panel (<sm) */}
        {mobileSearchOpen && (
          <div className="sm:hidden pb-3 pt-1 animate-slide-down">
            <div className="relative">
              <div className="orbita-searchbar orbita-field-underline flex items-center gap-2 rounded-2xl border border-[#E4E3F0] bg-white dark:border-slate-700 dark:bg-slate-800 px-3.5 py-2.5 text-[#3E385B] dark:text-slate-100 shadow-sm focus-within:border-[#6C60B8]">
                <Search className="h-4 w-4 text-[#6C60B8] dark:text-indigo-300 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari menu akademik, presensi, nilai..."
                  className="w-full bg-transparent text-xs font-semibold text-[#3E385B] dark:text-slate-100 placeholder:text-[#A2A0B4] dark:placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="no-ornament p-1 text-[#9694A8]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {searchQuery.trim().length > 0 && (
                <div className="mt-1.5 rounded-[18px] border border-[#ECEBF5] bg-white dark:border-slate-800 dark:bg-slate-900 p-1.5 shadow-lg">
                  {filteredMenus.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-[#9694A8] dark:text-slate-400">Menu tidak ditemukan.</p>
                  ) : (
                    filteredMenus.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveNav(item.id);
                          setSearchQuery('');
                          setMobileSearchOpen(false);
                        }}
                        className="no-ornament flex min-h-[40px] w-full items-center rounded-xl px-3 py-2 text-left text-xs font-bold text-[#3E385B] dark:text-slate-200 active:bg-[#F3F2FA] dark:active:bg-slate-800"
                      >
                        {item.label}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <BroadcastAnnouncementModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
      />
    </>
  );
};
