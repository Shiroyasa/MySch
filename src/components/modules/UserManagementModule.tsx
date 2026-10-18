import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, User } from '../../types';
import {
  Users,
  ShieldCheck,
  Plus,
  Check,
  X,
  Trash2,
  UserPlus,
  ShieldAlert,
  AlertCircle,
  Key,
  Lock,
  Eye,
  EyeOff,
  Layers,
  CheckSquare,
  Square,
  Info,
  Crown,
  Swords,
  Gem,
  Sparkles,
  Scroll,
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { AcademyHeroBanner } from '../common/AcademyOrnaments';

// Role definitions with default tailored permissions
interface RolePreset {
  role: UserRole;
  title: string;
  description: string;
  badgeColor: string;
  defaultPermissions: string[];
}

const rolePresets: Record<UserRole, RolePreset> = {
  super_admin: {
    role: 'super_admin',
    title: 'Super Admin',
    description: 'Akses penuh tanpa batas ke seluruh modul sistem, konfigurasi server, database, dan pemulihan bencana.',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    defaultPermissions: [
      'Master Data Siswa & Guru',
      'Input & Validasi Presensi',
      'Input & Publikasi Nilai',
      'Leger & Cetak Rapor',
      'Pusat Laporan & Ekspor',
      'Manajemen Hak Akses & Akun',
      'Audit Log Keamanan',
      'Pengaturan & Backup Data',
      'Kirim Pengumuman Massal',
      'Pantauan & Moderasi Chat Siswa',
    ],
  },
  admin: {
    role: 'admin',
    title: 'Admin TU (Tata Usaha)',
    description: 'Pengelolaan administrasi data pokok sekolah, inventaris kelas, master data siswa/guru, dan pemantauan obrolan.',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    defaultPermissions: [
      'Master Data Siswa & Guru',
      'Input Presensi Harian',
      'Leger & Cetak Rapor',
      'Pusat Laporan & Ekspor',
      'Manajemen Hak Akses & Akun',
      'Pengaturan Sekolah',
      'Kirim Pengumuman Massal',
      'Pantauan & Moderasi Chat Siswa',
    ],
  },
  guru: {
    role: 'guru',
    title: 'Guru Mata Pelajaran',
    description: 'Pencatatan presensi per mata pelajaran di kelas yang diampu, perumusan rubrik, dan input nilai sumatif/formatif.',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    defaultPermissions: [
      'Input Presensi Mapel',
      'Input & Edit Nilai Akademik',
      'Finalisasi & Publikasi Nilai',
      'Lihat Leger Nilai Mapel',
      'Kirim Pengumuman Massal',
    ],
  },
  wali_kelas: {
    role: 'wali_kelas',
    title: 'Wali Kelas',
    description: 'Pembinaan kelas bimbingan, monitoring rekapitulasi kehadiran harian siswa, verifikasi koreksi, dan pengesahan rapor.',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    defaultPermissions: [
      'Input Presensi Harian Kelas',
      'Rekap Kehadiran Siswa',
      'Verifikasi Koreksi Presensi',
      'Lihat Leger & Rapor Kelas',
      'Cetak Buku Rapor Digital',
      'Kirim Pengumuman Massal',
    ],
  },
  kepala_sekolah: {
    role: 'kepala_sekolah',
    title: 'Kepala Sekolah',
    description: 'Pengawasan eksekutif, monitoring mutu pembelajaran, tinjauan statistik kelulusan, dan audit aktivitas sekolah.',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    defaultPermissions: [
      'Dashboard Eksekutif Sekolah',
      'Monitoring Statistik Presensi',
      'Analisis Capaian Akademik',
      'Laporan Manajerial & Kinerja',
      'Audit Log Keamanan',
      'Kirim Pengumuman Massal',
    ],
  },
  siswa: {
    role: 'siswa',
    title: 'Siswa',
    description: 'Akses mandiri ke data profil peserta didik, tinjauan capaian nilai akademik, dan forum obrolan kolaborasi belajar.',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
    defaultPermissions: [
      'Akses Profil Siswa Mandiri',
      'Tinjau Nilai Per Mapel & Keseluruhan',
      'Ruang Obrolan & Forum Diskusi Siswa',
    ],
  },
};

const allAvailableSystemPermissions = [
  'Master Data Siswa & Guru',
  'Input Presensi Harian',
  'Input Presensi Mapel',
  'Input & Edit Nilai Akademik',
  'Finalisasi & Publikasi Nilai',
  'Leger & Cetak Rapor',
  'Verifikasi Koreksi Presensi',
  'Pusat Laporan & Ekspor',
  'Manajemen Hak Akses & Akun',
  'Audit Log Keamanan',
  'Pengaturan & Backup Data',
  'Kirim Pengumuman Massal',
  'Ruang Obrolan & Forum Diskusi Siswa',
  'Pantauan & Moderasi Chat Siswa',
];

export const UserManagementModule: React.FC = () => {
  const { users, currentUser, currentRole, deleteUser, addUser } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('guru');
  const [newNipOrNis, setNewNipOrNis] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    rolePresets.guru.defaultPermissions
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected user detail for viewing permissions
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Delete modal state
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    onConfirm: () => {},
  });

  const closeDeleteModal = () => {
    setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // When role changes in the modal, update tailored permissions automatically
  const handleRoleChange = (role: UserRole) => {
    setNewRole(role);
    setSelectedPermissions(rolePresets[role].defaultPermissions);
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleDeleteUserClick = (targetUser: User) => {
    if (targetUser.id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk!');
      return;
    }
    if (targetUser.email === 'kkaito447@gmail.com') {
      alert('Akun Administrator Pengembang Utama (kkaito447@gmail.com) dilindungi dan tidak dapat dihapus!');
      return;
    }

    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Akun Pengguna',
      itemName: `${targetUser.displayName} (${targetUser.email})`,
      description: `Apakah Anda yakin ingin menghapus akun pengguna ini? Pengguna dengan peran '${targetUser.role.toUpperCase()}' ini tidak akan dapat login lagi ke sistem sekolah.`,
      onConfirm: () => {
        const result = deleteUser(targetUser.id);
        closeDeleteModal();
        if (result.success) {
          showToast(`Akun ${targetUser.displayName} berhasil dihapus.`);
        } else {
          alert(result.message);
        }
      },
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    addUser({
      email: newEmail.trim(),
      displayName: newName.trim(),
      role: newRole,
      nipOrNis: newNipOrNis.trim() || undefined,
      phone: newPhone.trim() || undefined,
      password: newPassword.trim() || 'password123',
      permissions: selectedPermissions,
      isActive: true,
    });

    setShowAddModal(false);
    setNewEmail('');
    setNewName('');
    setNewRole('guru');
    setNewNipOrNis('');
    setNewPhone('');
    setNewPassword('password123');
    setSelectedPermissions(rolePresets.guru.defaultPermissions);
    showToast(`Pengguna baru ${newName} berhasil dibuat dengan hak akses ${newRole.toUpperCase()}.`);
  };

  const canManageUsers = currentRole === 'super_admin' || currentRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl dark:bg-blue-600 animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Royal Academy Header */}
      <AcademyHeroBanner
        kicker="OTORISASI SISTEM & KONTROL PERAN (RBAC)"
        title="MANAJEMEN PENGGUNA & HAK AKSES"
        subtitle="Konfigurasi 6 peran pengguna dengan hak akses terstruktur untuk Super Admin, Admin TU, Kepala Sekolah, Wali Kelas, Guru Mapel, dan Siswa."
        icon={Crown}
        rightContent={
          canManageUsers ? (
            <button
              onClick={() => {
                setNewRole('guru');
                setSelectedPermissions(rolePresets.guru.defaultPermissions);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-[#C8A44B]/80 bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <UserPlus className="h-4 w-4 text-[#FDE68A]" />
              <span>Tambah Data Pengguna &amp; Hak Akses</span>
            </button>
          ) : undefined
        }
      />

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(Object.keys(rolePresets) as UserRole[]).map(r => {
          const preset = rolePresets[r];
          const count = users.filter(u => u.role === r).length;

          return (
            <div
              key={r}
              className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-start gap-3"
            >
              <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {preset.title}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {count} Akun
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {preset.description}
                </p>
                <div className="mt-2 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  {preset.defaultPermissions.length} Fitur Terkunci Sesuai Tugas
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Daftar Akun Pengguna Terdaftar ({users.length})
          </h2>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Autentikasi Terverifikasi &bull; RBAC Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Email Login</th>
                <th className="py-3 px-4 text-center">Peran (Role)</th>
                <th className="py-3 px-4">NIP / NIS</th>
                <th className="py-3 px-4 text-center">Hak Akses Modul</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u, idx) => {
                const isSelf = u.id === currentUser.id;
                const isRootSuperAdmin = u.email === 'kkaito447@gmail.com';
                const userPreset = rolePresets[u.role] || rolePresets.guru;
                const permissionsList = u.permissions || userPreset.defaultPermissions;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {u.displayName}
                      {isSelf && (
                        <span className="ml-1.5 rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          (Anda)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${userPreset.badgeColor}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.nipOrNis || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setViewingUser(u)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 transition-colors"
                      >
                        <Info className="h-3 w-3" />
                        <span>{permissionsList.length} Akses</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Aktif
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {canManageUsers && !isSelf && !isRootSuperAdmin ? (
                        <button
                          onClick={() => handleDeleteUserClick(u)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                          title="Hapus Akun Pengguna"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          {isSelf ? 'Sesi Anda' : 'Terkunci'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH DATA PENGGUNA & HAK AKSES */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Tambah Pengguna &amp; Konfigurasi Hak Akses
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pilih peran dan sesuaikan modul &amp; fitur yang dapat diakses oleh pengguna
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Lengkap Pengguna <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rahmat Hidayat, S.Kom"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Akun / Login <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="nama@smkmy-cikembar.sch.id"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    NIP / NIS (Nomor Induk)
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor identitas sekolah"
                    value={newNipOrNis}
                    onChange={e => setNewNipOrNis(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nomor Kontak / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password Akun Login <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi akun..."
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Kata sandi yang digunakan pengguna saat masuk melalui halaman login.</p>
              </div>

              {/* ROLE SELECTION */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Pilih Peran Akun (Role Hierarki)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(rolePresets) as UserRole[]).map(r => {
                    const preset = rolePresets[r];
                    const isSelected = newRole === r;

                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/80 dark:border-blue-500 dark:bg-blue-950/40 ring-1 ring-blue-500'
                            : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60'
                        }`}
                      >
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {preset.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC HAK AKSES & FITUR CHECKBOXES */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-900/50 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Konfigurasi Hak Akses &amp; Fitur ({newRole.replace('_', ' ').toUpperCase()}):</span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    {selectedPermissions.length} Fitur Terpilih
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Secara otomatis disesuaikan berdasarkan peran <strong>{rolePresets[newRole].title}</strong>. Anda dapat mencentang atau menghapus centang untuk menyesuaikan hak akses spesifik bagi pengguna ini.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {allAvailableSystemPermissions.map(perm => {
                    const isChecked = selectedPermissions.includes(perm);

                    return (
                      <label
                        key={perm}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-blue-300 bg-white dark:border-blue-800 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                            : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                >
                  Simpan Pengguna &amp; Hak Akses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW PERMISSIONS DETAIL */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Rincian Hak Akses Pengguna
                </h3>
                <p className="text-xs text-slate-500">{viewingUser.displayName} ({viewingUser.role})</p>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 block">Modul &amp; Fitur yang Dapat Diakses:</span>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {(viewingUser.permissions || rolePresets[viewingUser.role]?.defaultPermissions || []).map(p => (
                  <div
                    key={p}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setViewingUser(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title={deleteModalConfig.title}
        itemName={deleteModalConfig.itemName}
        description={deleteModalConfig.description}
        onConfirm={deleteModalConfig.onConfirm}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};
