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
} from 'lucide-react';
import { BroadcastAnnouncementModal } from '../common/BroadcastAnnouncementModal';
import { ProfileModal } from '../common/ProfileModal';

export const Header: React.FC<{ onToggleMobileSidebar: () => void }> = ({
  onToggleMobileSidebar,
}) => {
  const {
    currentUser,
    currentRole,
    activeAcademicYear,
    notifications,
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
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isAdmin = currentRole === 'admin' || currentRole === 'super_admin';

  const navMetaMap: Record<string, { kicker: string; title: string }> = {
    dashboard: { kicker: 'Primary', title: 'Dashboard' },
    attendance: { kicker: 'Primary • Kehadiran', title: 'Presensi & Absensi' },
    grading: { kicker: 'Primary • Akademik', title: 'Penilaian & KKM' },
    pkl: { kicker: 'Primary • Industri', title: 'Administrasi PKL' },
    'master-data': { kicker: 'Primary • Basis Data', title: 'Master Data' },
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
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between bg-[#F8F9FD]/95 backdrop-blur-md px-5 sm:px-8 pt-2">
        {/* Left: Mobile Menu Button + "Primary / Dashboard" Exact Typography from Reference Image */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="no-ornament flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#6C60B8] text-white shadow-sm hover:bg-[#5B4FA8] lg:hidden cursor-pointer"
            title="Buka Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <span className="block text-xs font-medium text-[#A2A0B4] leading-tight truncate">
              {currentMeta.kicker}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E385B] tracking-tight leading-tight truncate">
              {currentMeta.title}
            </h2>
          </div>
        </div>

        {/* Right: Soft Gray Pill Search Bar ("Search") + Quick Actions + Circular User Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Exact Reference Image Soft Gray Pill Search Input */}
          <div className="relative">
            <div className="flex items-center gap-2.5 rounded-full bg-[#EFEFF6] px-4 py-2 text-[#3E385B] w-40 sm:w-60 transition-all focus-within:ring-2 focus-within:ring-[#6C60B8]/30">
              <Search className="h-4 w-4 text-[#4A4368] shrink-0 stroke-[2.4]" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 180)}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                placeholder="Search"
                className="w-full bg-transparent text-xs font-medium text-[#3E385B] placeholder:text-[#A2A0B4] focus:outline-none"
              />
            </div>

            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 mt-2 w-72 rounded-[20px] border border-[#ECEBF5] bg-white p-2 text-[#3E385B] shadow-[0_18px_40px_rgba(108,96,184,0.16)] z-50">
                {filteredMenus.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-[#9694A8]">Menu tidak ditemukan.</p>
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
                      className="no-ornament flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-xs font-bold text-[#3E385B] hover:bg-[#F3F2FA] hover:text-[#6C60B8] transition-colors cursor-pointer"
                    >
                      <span>{item.label}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cloud Sync Pill */}
          <div
            className="hidden xl:flex items-center gap-1.5 rounded-full bg-[#EFEFF6] px-3 py-1.5 text-[11px] font-bold text-[#3E385B]"
            title={
              lastSyncTime
                ? `Basis Data Cloud Terhubung • T.A. ${activeAcademicYear.name} (${lastSyncTime.toLocaleTimeString()})`
                : 'Basis Data Cloud Terhubung'
            }
          >
            <Cloud className="h-3.5 w-3.5 text-[#1CC865] shrink-0" />
            <span>T.A. {activeAcademicYear.name}</span>
            <button
              onClick={() => forceCloudResync()}
              disabled={isSyncing}
              title="Sinkronkan basis data cloud sekarang"
              className="no-ornament ml-0.5 text-[#6C60B8] hover:text-[#4E42A1] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Broadcast Button */}
          {currentRole !== 'siswa' && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="no-ornament hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-[#EFEFF6] text-[#6C60B8] hover:bg-[#E4E2F5] transition-colors cursor-pointer"
              title="Kirim Pengumuman ke Semua Pengguna"
            >
              <Megaphone className="h-4 w-4" />
            </button>
          )}

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="no-ornament relative flex h-9 w-9 items-center justify-center rounded-full bg-[#EFEFF6] text-[#3E385B] hover:bg-[#E4E2F5] transition-colors cursor-pointer"
              title="Pemberitahuan"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6E96] text-[9px] font-extrabold text-white shadow">
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
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[24px] border border-[#ECEBF5] bg-white p-4 text-[#3E385B] shadow-[0_22px_50px_rgba(62,56,91,0.18)] z-50 animate-scale-up origin-top-right">
                <div className="flex items-center justify-between border-b border-[#F0F1F6] pb-2.5 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-[#3E385B]">Pemberitahuan</span>
                    {isAdmin && (
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-[#F0EEFA] text-[#6C60B8]">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="no-ornament text-xs text-[#6C60B8] hover:underline font-semibold cursor-pointer"
                      >
                        Baca Semua
                      </button>
                    )}
                    {visibleNotifs.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="no-ornament text-xs text-[#F25781] hover:underline font-semibold cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1.5 pt-2.5 pb-1.5 border-b border-[#F0F1F6] text-[10px]">
                    <button
                      onClick={() => setAdminNotifTab('all')}
                      className={`no-ornament px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                        adminNotifTab === 'all'
                          ? 'bg-[#6C60B8] text-white'
                          : 'bg-[#F0F1F6] text-[#9694A8]'
                      }`}
                    >
                      Semua ({notifications.length})
                    </button>
                    <button
                      onClick={() => setAdminNotifTab('mine')}
                      className={`no-ornament px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                        adminNotifTab === 'mine'
                          ? 'bg-[#6C60B8] text-white'
                          : 'bg-[#F0F1F6] text-[#9694A8]'
                      }`}
                    >
                      Profil ({notifications.filter(n => n.recipientId === currentUser.id).length})
                    </button>
                    <button
                      onClick={() => setAdminNotifTab('broadcast')}
                      className={`no-ornament px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                        adminNotifTab === 'broadcast'
                          ? 'bg-[#6C60B8] text-white'
                          : 'bg-[#F0F1F6] text-[#9694A8]'
                      }`}
                    >
                      Broadcast ({notifications.filter(n => n.isBroadcast || n.targetRole === 'all').length})
                    </button>
                  </div>
                )}

                <div className="mt-2 max-h-80 overflow-y-auto space-y-2 pr-1">
                  {visibleNotifs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#9694A8]">
                      <p>Tidak ada pemberitahuan pada profil ini.</p>
                    </div>
                  ) : (
                    visibleNotifs.map(n => (
                      <div
                        key={n.id}
                        className={`group flex items-start justify-between gap-2 rounded-[16px] border p-3 transition-colors ${
                          n.isRead
                            ? 'border-[#F0F1F6] bg-[#FAF9FE] opacity-80'
                            : 'border-[#E2DFF5] bg-[#F5F4FC]'
                        }`}
                      >
                        <div
                          onClick={() => markNotificationRead(n.id)}
                          className="flex items-start gap-2.5 flex-1 cursor-pointer"
                        >
                          <div
                            className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                              n.isRead ? 'bg-[#C2C0D1]' : 'bg-[#6C60B8]'
                            }`}
                          />
                          <div className="space-y-1 flex-1">
                            <span className="text-xs font-bold text-[#3E385B] block">{n.title}</span>
                            <p className="text-xs text-[#7E7898] leading-snug">{n.message}</p>
                            <span className="text-[10px] text-[#A2A0B4] block">
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
                          className="no-ornament p-1 text-[#A2A0B4] hover:text-[#F25781] cursor-pointer"
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
            className="no-ornament group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E6E4F4] ring-2 ring-white shadow-[0_6px_16px_rgba(62,56,91,0.14)] cursor-pointer"
            title={`${currentUser.displayName} • Klik untuk buka profil`}
          >
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-extrabold text-[#6C60B8]">
                {(currentUser.displayName || 'OR').slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Camera className="h-3.5 w-3.5" />
            </div>
          </button>
        </div>
      </header>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <BroadcastAnnouncementModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
      />
    </>
  );
};
