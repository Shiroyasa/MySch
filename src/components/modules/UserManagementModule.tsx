import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, User } from '../../types';
import { Users, ShieldCheck, Plus, Check, X, Trash2, UserPlus, ShieldAlert, AlertCircle } from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const UserManagementModule: React.FC = () => {
  const { users, currentUser, currentRole, deleteUser, addUser } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('guru');
  const [newNipOrNis, setNewNipOrNis] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleDeleteUserClick = (targetUser: User) => {
    // Guards
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
      isActive: true,
    });

    setShowAddModal(false);
    setNewEmail('');
    setNewName('');
    setNewRole('guru');
    setNewNipOrNis('');
    showToast(`Pengguna baru ${newName} berhasil dibuat.`);
  };

  const permissionMatrix = [
    { module: 'Master Data Siswa & Guru', super_admin: true, admin: true, guru: false, wali_kelas: false, kepala_sekolah: false, siswa: false },
    { module: 'Input Presensi Harian', super_admin: true, admin: true, guru: false, wali_kelas: true, kepala_sekolah: false, siswa: false },
    { module: 'Input Presensi Mapel', super_admin: true, admin: false, guru: true, wali_kelas: false, kepala_sekolah: false, siswa: false },
    { module: 'Input & Edit Nilai Akademik', super_admin: true, admin: false, guru: true, wali_kelas: false, kepala_sekolah: false, siswa: false },
    { module: 'Finalisasi & Publikasi Nilai', super_admin: true, admin: false, guru: true, wali_kelas: false, kepala_sekolah: false, siswa: false },
    { module: 'Lihat Leger & Rapor Siswa', super_admin: true, admin: true, guru: true, wali_kelas: true, kepala_sekolah: true, siswa: true },
    { module: 'Verifikasi Koreksi Presensi', super_admin: true, admin: true, guru: true, wali_kelas: true, kepala_sekolah: false, siswa: false },
    { module: 'Pengajuan Koreksi Presensi', super_admin: false, admin: false, guru: false, wali_kelas: false, kepala_sekolah: false, siswa: true },
    { module: 'Audit Log & Keamanan Sistem', super_admin: true, admin: false, guru: false, wali_kelas: false, kepala_sekolah: true, siswa: false },
    { module: 'Manajemen Akun & Role RBAC', super_admin: true, admin: false, guru: false, wali_kelas: false, kepala_sekolah: false, siswa: false },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl dark:bg-blue-600 animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-purple-100 p-2 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Manajemen Pengguna &amp; Matriks RBAC
            </h1>
            <p className="text-xs text-slate-500">6 Peran Hierarkis dengan Validasi Keamanan Berlapis &bull; SMK Mardi Yuana</p>
          </div>
        </div>

        {currentRole === 'super_admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        )}
      </div>

      {/* Users table with Delete Action */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Daftar Akun Pengguna Terdaftar ({users.length})
          </h2>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Autentikasi: Firebase Auth &amp; RBAC Terenkripsi
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
                <th className="py-3 px-4">Identitas NIP / NIS</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u, idx) => {
                const isSelf = u.id === currentUser.id;
                const isRootSuperAdmin = u.email === 'kkaito447@gmail.com';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {u.displayName}
                      {isSelf && (
                        <span className="ml-1.5 rounded-md bg-blue-100 px-1.5 py-0.2 text-[9px] font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          (Anda)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300 capitalize">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{u.nipOrNis || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Aktif
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isSelf ? (
                        <span className="text-[10px] font-semibold text-slate-400 italic">Akun Anda</span>
                      ) : isRootSuperAdmin ? (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Dilindungi
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUserClick(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 transition-colors cursor-pointer"
                          title="Hapus Akun Pengguna"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permission Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
          Matriks Izin Akses (RBAC Permission Matrix)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Hak akses diperiksa di frontend dan backend Firestore rules secara ketat.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold">
                <th className="py-3 px-3">Modul &amp; Kewenangan</th>
                <th className="py-3 px-3 text-center">Super Admin</th>
                <th className="py-3 px-3 text-center">Tata Usaha</th>
                <th className="py-3 px-3 text-center">Guru Mapel</th>
                <th className="py-3 px-3 text-center">Wali Kelas</th>
                <th className="py-3 px-3 text-center">Kepala Sekolah</th>
                <th className="py-3 px-3 text-center">Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissionMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{item.module}</td>
                  <td className="py-2.5 px-3 text-center">
                    {item.super_admin ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.admin ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.guru ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.wali_kelas ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.kepala_sekolah ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.siswa ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              Tambah Akun Pengguna Baru
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Pilih peran RBAC yang sesuai untuk mengatur hak akses ke sistem.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso, S.Pd"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Sekolah / Google Login</label>
                <input
                  type="email"
                  placeholder="user@smkmy-cikembar.sch.id"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Peran Akun (RBAC)</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="guru">Guru Mata Pelajaran</option>
                  <option value="wali_kelas">Wali Kelas</option>
                  <option value="admin">Admin / Tata Usaha</option>
                  <option value="kepala_sekolah">Kepala Sekolah</option>
                  <option value="siswa">Siswa</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NIP / NIS (Opsional)</label>
                <input
                  type="text"
                  placeholder="Nomor identitas resmi"
                  value={newNipOrNis}
                  onChange={e => setNewNipOrNis(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
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
