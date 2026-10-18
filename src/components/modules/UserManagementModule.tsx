import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, User } from '../../types';
import {
  Users,
  ShieldCheck,
  Check,
  X,
  Trash2,
  UserPlus,
  Key,
  Lock,
  Eye,
  EyeOff,
  Info,
  Crown,
  Edit3,
  Search,
  Save,
  Sparkles,
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { AcademyHeroBanner, OrnateCard, AcademyCornerBadge } from '../common/AcademyOrnaments';
import { SortByControl, SortOption, sortDataItems } from '../common/SortByControl';

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
    description:
      'Akses penuh tanpa batas ke seluruh modul sistem, konfigurasi server, database, dan pemulihan bencana.',
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
    description:
      'Pengelolaan administrasi data pokok sekolah, inventaris kelas, master data siswa/guru, dan pemantauan obrolan.',
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
    description:
      'Pencatatan presensi per mata pelajaran di kelas yang diampu, perumusan rubrik, dan input nilai sumatif/formatif.',
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
    description:
      'Pembinaan kelas bimbingan, monitoring rekapitulasi kehadiran harian siswa, verifikasi koreksi, dan pengesahan rapor.',
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
    description:
      'Pengawasan eksekutif, monitoring mutu pembelajaran, tinjauan statistik kelulusan, dan audit aktivitas sekolah.',
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
    description:
      'Akses mandiri ke data profil peserta didik, tinjauan capaian nilai akademik, dan forum obrolan kolaborasi belajar.',
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
  const {
    users = [],
    classes = [],
    currentUser,
    currentRole,
    deleteUser,
    addUser,
    updateUser,
    addToast,
  } = useApp();

  // Add / Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('guru');
  const [formClassId, setFormClassId] = useState('');
  const [formNipOrNis, setFormNipOrNis] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('password123');
  const [formIsActive, setFormIsActive] = useState(true);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    rolePresets.guru.defaultPermissions
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Role Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Selected user detail for viewing/editing permissions quickly
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewingPermissions, setViewingPermissions] = useState<string[]>([]);

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

  const showToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(msg);
    if (addToast) addToast(msg, type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormError(null);
    setFormEmail('');
    setFormName('');
    setFormRole('guru');
    setFormClassId(classes[0]?.id || '');
    setFormNipOrNis('');
    setFormPhone('');
    setFormPassword('password123');
    setFormIsActive(true);
    setSelectedPermissions(rolePresets.guru.defaultPermissions);
    setShowAddModal(true);
  };

  const openEditModal = (u: User) => {
    const safeRole: UserRole = rolePresets[u.role] ? u.role : 'guru';
    setEditingUser(u);
    setFormError(null);
    setFormEmail(u.email || '');
    setFormName(u.displayName || '');
    setFormRole(safeRole);
    setFormClassId(u.classId || classes[0]?.id || '');
    setFormNipOrNis(u.nipOrNis || '');
    setFormPhone(u.phone || '');
    setFormPassword(u.password || 'password123');
    setFormIsActive(u.isActive !== false);
    setSelectedPermissions(
      Array.isArray(u.permissions) && u.permissions.length > 0
        ? u.permissions
        : rolePresets[safeRole].defaultPermissions
    );
    setShowAddModal(true);
  };

  const openPermissionsModal = (u: User) => {
    const safeRole: UserRole = rolePresets[u.role] ? u.role : 'guru';
    setViewingUser(u);
    setViewingPermissions(
      Array.isArray(u.permissions) && u.permissions.length > 0
        ? u.permissions
        : rolePresets[safeRole].defaultPermissions
    );
  };

  // When role changes in the modal, update tailored permissions automatically
  const handleRoleChange = (role: UserRole) => {
    setFormRole(role);
    setSelectedPermissions(rolePresets[role].defaultPermissions);
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const toggleViewingPermission = (perm: string) => {
    setViewingPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveViewingPermissions = () => {
    if (!viewingUser) return;
    updateUser(viewingUser.id, { permissions: viewingPermissions });
    showToast(`Hak akses untuk ${viewingUser.displayName} berhasil disimpan ke Database!`, 'success');
    setViewingUser(null);
  };

  const handleToggleUserActive = (u: User) => {
    if (u.id === currentUser?.id) {
      showToast('Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif.', 'warning');
      return;
    }
    const nextActive = u.isActive === false ? true : false;
    updateUser(u.id, { isActive: nextActive });
    showToast(
      `Status akun ${u.displayName} diubah menjadi ${nextActive ? 'AKTIF' : 'NONAKTIF'}.`,
      'info'
    );
  };

  const handleDeleteUserClick = (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk!', 'warning');
      return;
    }
    if ((targetUser.email || '').toLowerCase() === 'kkaito447@gmail.com') {
      showToast(
        'Akun Administrator Pengembang Utama (kkaito447@gmail.com) dilindungi dan tidak dapat dihapus!',
        'warning'
      );
      return;
    }

    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Akun Pengguna',
      itemName: `${targetUser.displayName} (${targetUser.email})`,
      description: `Apakah Anda yakin ingin menghapus akun pengguna ini secara permanen dari Database?`,
      onConfirm: () => {
        const result = deleteUser(targetUser.id);
        closeDeleteModal();
        if (result.success) {
          showToast(`Akun ${targetUser.displayName} berhasil dihapus dari Database.`, 'info');
        } else {
          showToast(result.message, 'error');
        }
      },
    });
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim();
    if (!trimmedName || !trimmedEmail) {
      setFormError('Nama lengkap dan Email akun wajib diisi!');
      return;
    }

    // Check duplicate email when creating or changing email
    const duplicate = users.find(
      u =>
        (u.email || '').toLowerCase() === trimmedEmail.toLowerCase() &&
        (!editingUser || u.id !== editingUser.id)
    );
    if (duplicate) {
      setFormError(`Email "${trimmedEmail}" sudah terdaftar untuk akun ${duplicate.displayName}!`);
      return;
    }

    const needsClass = formRole === 'wali_kelas' || formRole === 'siswa';

    if (editingUser) {
      updateUser(editingUser.id, {
        displayName: trimmedName,
        email: trimmedEmail,
        role: formRole,
        classId: needsClass ? formClassId || undefined : undefined,
        nipOrNis: formNipOrNis.trim() || undefined,
        phone: formPhone.trim() || undefined,
        password: formPassword.trim() || 'password123',
        permissions: selectedPermissions,
        isActive: formIsActive,
      });
      setShowAddModal(false);
      setEditingUser(null);
      showToast(`Perubahan akun ${trimmedName} berhasil disimpan ke Database!`, 'success');
    } else {
      addUser({
        email: trimmedEmail,
        displayName: trimmedName,
        role: formRole,
        classId: needsClass ? formClassId || undefined : undefined,
        nipOrNis: formNipOrNis.trim() || undefined,
        phone: formPhone.trim() || undefined,
        password: formPassword.trim() || 'password123',
        permissions: selectedPermissions,
        isActive: formIsActive,
      });
      setShowAddModal(false);
      showToast(
        `Pengguna baru ${trimmedName} berhasil ditambahkan dan disimpan ke Database!`,
        'success'
      );
    }
  };

  const canManageUsers = currentRole === 'super_admin' || currentRole === 'admin';

  const [sortBy, setSortBy] = useState<SortOption>('az');

  const filteredAndSortedUsers = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];
    const filtered = safeUsers.filter(u => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = searchTerm.trim().toLowerCase();
      if (!q) return matchRole;
      const matchText =
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.nipOrNis || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q);
      return matchRole && matchText;
    });

    return sortDataItems(filtered, sortBy, {
      getName: u => u.displayName || u.email || '',
      getNis: u => u.nipOrNis || u.id || '',
      getDate: u => u.lastLogin || '2025-01-01',
    });
  }, [users, roleFilter, searchTerm, sortBy]);

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
        moduleKey="user-management"
        kicker="OTORISASI SISTEM & KONTROL AKUN PENGGUNA"
        title="MANAJEMEN AKUN & HAK AKSES"
        subtitle="Kelola kredensial login, tambah atau edit data pengguna, atur kata sandi, dan konfigurasi hak akses fitur yang tersinkron langsung ke Database Cloud."
        icon={Crown}
        rightContent={
          canManageUsers ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-xl border border-[#C8A44B]/80 bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <UserPlus className="h-4 w-4 text-[#FDE68A]" />
              <span>Tambah Data Pengguna &amp; Hak Akses</span>
            </button>
          ) : undefined
        }
      />

      {/* 3D Flipcard Role Presentation Boxes (Stationary In-Place Flip + Per-Box Custom BG) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {(Object.keys(rolePresets) as UserRole[]).map(r => {
          const preset = rolePresets[r];
          const count = users.filter(u => u && u.role === r).length;

          return (
            <OrnateCard
              key={r}
              boxId={`role_card_${r}`}
              minFlipHeight="min-h-[172px]"
              onClick={() => setRoleFilter(prev => (prev === r ? 'ALL' : r))}
              className="p-4"
              flipBack={
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="pr-16">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#F3D77D] block truncate">
                        ✦ Hak Akses • {preset.title}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap content-start gap-1 max-h-[80px] overflow-hidden">
                      {preset.defaultPermissions.slice(0, 5).map(perm => (
                        <span
                          key={perm}
                          className="no-ornament rounded-md bg-white/10 border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-slate-200 leading-tight"
                        >
                          {perm}
                        </span>
                      ))}
                      {preset.defaultPermissions.length > 5 && (
                        <span className="no-ornament rounded-md bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-2 py-0.5 text-[10px] font-bold text-[#F3D77D] leading-tight">
                          +{preset.defaultPermissions.length - 5} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] font-extrabold text-cyan-300">
                    <span>Klik untuk Filter ({count} Akun)</span>
                    <Sparkles className="h-3.5 w-3.5 text-[#F3D77D] shrink-0" />
                  </div>
                </div>
              }
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <AcademyCornerBadge
                      text={`GUILD • ${preset.role.replace('_', ' ').toUpperCase()}`}
                      className="mb-0"
                    />
                    <span className="no-ornament rounded-full bg-[#132550] px-2.5 py-0.5 text-[10px] font-black text-[#F3D77D] shrink-0">
                      {count} Akun
                    </span>
                  </div>
                  <div className="flex items-start gap-3 mt-2.5">
                    <div className="no-ornament rounded-xl bg-blue-500/15 border border-blue-500/30 p-2.5 text-blue-600 dark:text-cyan-400 shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {preset.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#EFE2BE]/70 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-600 dark:text-cyan-400">
                    {preset.defaultPermissions.length} Modul Terotorisasi
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-[#F3D77D]">
                    Detail Akses ✦
                  </span>
                </div>
              </div>
            </OrnateCard>
          );
        })}
      </div>

      {/* Users Table inside OrnateCard */}
      <OrnateCard boxId="user_mgmt_table_box" className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#EFE2BE] dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 pr-16">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Daftar Akun Pengguna Terdaftar ({filteredAndSortedUsers.length})
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Klik tombol Edit pada baris pengguna untuk mengubah nama, email, kata sandi, kelas, atau hak akses
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari nama / email / NIP..."
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">Semua Peran ({users.length})</option>
              {(Object.keys(rolePresets) as UserRole[]).map(r => (
                <option key={r} value={r}>
                  {rolePresets[r].title}
                </option>
              ))}
            </select>

            <SortByControl value={sortBy} onChange={setSortBy} compact />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Email Login</th>
                <th className="py-3 px-4">NIP / NIS</th>
                <th className="py-3 px-4 text-center">Hak Akses Modul</th>
                <th className="py-3 px-4 text-center">Status Akun</th>
                <th className="py-3 px-4 text-center w-36">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAndSortedUsers.map((u, idx) => {
                const isSelf = u.id === currentUser?.id;
                const isRootSuperAdmin = (u.email || '').toLowerCase() === 'kkaito447@gmail.com';
                const safeRole: UserRole = rolePresets[u.role] ? u.role : 'guru';
                const userPreset = rolePresets[safeRole];
                const permissionsList =
                  Array.isArray(u.permissions) && u.permissions.length > 0
                    ? u.permissions
                    : userPreset.defaultPermissions;
                const assignedClass = u.classId
                  ? classes.find(c => c.id === u.classId)?.name || u.classId
                  : null;
                const isActive = u.isActive !== false;

                return (
                  <tr key={u.id}>
                    <td className="py-3 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                        <span>{u.displayName || 'Tanpa Nama'}</span>
                        {isSelf && (
                          <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            (Sesi Anda)
                          </span>
                        )}
                        {assignedClass && (
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Kelas {assignedClass}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {userPreset.title}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">
                      {u.nipOrNis || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => openPermissionsModal(u)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        <Info className="h-3 w-3 text-blue-500" />
                        <span>{permissionsList.length} Akses</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => canManageUsers && handleToggleUserActive(u)}
                        title={canManageUsers ? 'Klik untuk ubah status Aktif / Nonaktif' : undefined}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                          }`}
                        />
                        <span>{isActive ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {canManageUsers ? (
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300 transition-colors cursor-pointer"
                            title="Edit Data Akun, Password & Hak Akses"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          {!isSelf && !isRootSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUserClick(u)}
                              className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-400 transition-colors cursor-pointer"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Terkunci</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </OrnateCard>

      {/* MODAL: TAMBAH / EDIT DATA PENGGUNA & HAK AKSES */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#D4AF37]/50 bg-white p-6 shadow-2xl dark:bg-[#0B1528] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {editingUser ? <Edit3 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingUser
                      ? `Edit Akun Pengguna: ${editingUser.displayName}`
                      : 'Tambah Pengguna & Konfigurasi Hak Akses'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Perubahan akun dan hak akses langsung disimpan ke Database Cloud secara real-time
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveUserForm} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Lengkap Pengguna <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rahmat Hidayat, S.Kom"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
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
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
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
                    value={formNipOrNis}
                    onChange={e => setFormNipOrNis(e.target.value)}
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
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* PASSWORD & STATUS FIELD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Password Akun Login <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      placeholder="Masukkan kata sandi akun..."
                      value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status Akses Akun
                  </label>
                  <select
                    value={formIsActive ? 'active' : 'inactive'}
                    onChange={e => setFormIsActive(e.target.value === 'active')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="active">Aktif (Dapat Login ke Sistem)</option>
                    <option value="inactive">Nonaktif (Akses Ditangguhkan)</option>
                  </select>
                </div>
              </div>

              {/* ROLE SELECTION */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Pilih Peran Akun
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(rolePresets) as UserRole[]).map(r => {
                    const preset = rolePresets[r];
                    const isSelected = formRole === r;

                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
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

              {/* CLASS SELECTOR FOR WALI KELAS OR SISWA */}
              {(formRole === 'wali_kelas' || formRole === 'siswa') && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {formRole === 'wali_kelas'
                      ? 'Pilih Kelas Binaan (Wali Kelas)'
                      : 'Pilih Kelas / Rombel Siswa'}
                  </label>
                  <select
                    value={formClassId}
                    onChange={e => setFormClassId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        Kelas {cls.name} ({cls.majorCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* DYNAMIC HAK AKSES & FITUR CHECKBOXES */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-900/50 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Konfigurasi Hak Akses &amp; Fitur ({rolePresets[formRole].title}):</span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    {selectedPermissions.length} Fitur Terpilih
                  </span>
                </div>

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
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {editingUser ? 'Simpan Perubahan Akun' : 'Simpan Pengguna & Hak Akses'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW & EDIT PERMISSIONS DETAIL */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#D4AF37]/50 bg-white p-5 shadow-2xl dark:bg-[#0B1528] animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Rincian &amp; Pengaturan Hak Akses
                </h3>
                <p className="text-xs text-slate-500">{viewingUser.displayName}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 block">
                {canManageUsers
                  ? 'Centang atau hapus centang fitur untuk menyesuaikan hak akses pengguna ini:'
                  : 'Modul & Fitur yang Dapat Diakses:'}
              </span>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {allAvailableSystemPermissions.map(p => {
                  const checked = viewingPermissions.includes(p);
                  return (
                    <label
                      key={p}
                      className={`flex items-center justify-between gap-2 rounded-lg border p-2 text-xs font-semibold transition-colors ${
                        canManageUsers ? 'cursor-pointer' : ''
                      } ${
                        checked
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {canManageUsers ? (
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleViewingPermission(p)}
                            className="h-3.5 w-3.5 rounded accent-emerald-600"
                          />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        )}
                        <span>{p}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Tutup
              </button>
              {canManageUsers && (
                <button
                  type="button"
                  onClick={handleSaveViewingPermissions}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Hak Akses</span>
                </button>
              )}
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
        onClose={closeDeleteModal}
      />
    </div>
  );
};

