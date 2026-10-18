import React from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, AlertTriangle, X, ShieldCheck } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { currentUser, currentRole } = useApp();

  if (!isOpen) return null;

  const roleNameMap: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin Tata Usaha',
    guru: 'Guru Mata Pelajaran',
    wali_kelas: 'Wali Kelas',
    kepala_sekolah: 'Kepala Sekolah',
    siswa: 'Siswa',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h3 id="logout-title" className="text-base font-bold text-slate-900 dark:text-white">
                Konfirmasi Keluar Sistem
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ORBITA &bull; SMK Mardi Yuana Cikembar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-3.5">
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3.5 border border-amber-200/70 dark:bg-amber-950/30 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Apakah Anda yakin ingin keluar dari sistem?</p>
              <p className="mt-1 text-amber-800 dark:text-amber-300">
                Sesi akun aktif Anda akan diakhiri. Pastikan pekerjaan atau input data Anda sudah tersimpan dengan baik.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Pengguna:</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentUser.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Peran / Jabatan:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{roleNameMap[currentRole] || currentRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Tujuan Setelah Keluar:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Halaman Login Sistem</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Batal (Tetap di Aplikasi)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Ya, Boleh Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
