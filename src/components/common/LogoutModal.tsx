import React from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, AlertTriangle, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#42368E]/42 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-[28px] border border-[#7468C4]/30 bg-white/90 p-6 text-[#3E385B] shadow-[0_28px_68px_rgba(64,52,142,0.34)] backdrop-blur-2xl animate-wobble-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E6E8F2] pb-4">
          <div className="flex items-center gap-3">
            <div
              style={{
                background: 'linear-gradient(145deg, #7468C4 0%, #5D51B2 100%)',
              }}
              className="flex h-11 w-11 items-center justify-center rounded-[16px] text-white shadow-sm"
            >
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h3 id="logout-title" className="text-base font-extrabold text-[#3E385B]">
                Keluar Sistem ORBITA
              </h3>
              <p className="text-[11px] font-semibold text-[#8C88A4]">
                Portal Akademik &bull; Konfirmasi Sesi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="no-ornament rounded-full border border-[#E6E8F2] bg-[#F5F6FA] p-1.5 text-[#6A6584] hover:bg-[#ECEEF7] hover:text-[#3E385B] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-3.5">
          <div className="flex items-start gap-3 rounded-[18px] border border-[#FFE0E9] bg-[#FFF5F8] p-3.5 text-xs">
            <AlertTriangle className="h-5 w-5 text-[#FF6E96] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#3E385B]">
                Apakah Anda yakin ingin keluar dari sistem?
              </p>
              <p className="mt-1 text-[#6A6584]">
                Sesi akun aktif Anda akan diakhiri. Pastikan pekerjaan atau input data Anda sudah tersimpan dengan baik.
              </p>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#E6E8F2] bg-[#F8F9FD] p-3.5 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#8C88A4] font-medium">Pengguna:</span>
              <span className="font-extrabold text-[#3E385B]">{currentUser.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8C88A4] font-medium">Peran / Jabatan:</span>
              <span className="font-bold text-[#685BC7]">{roleNameMap[currentRole] || currentRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8C88A4] font-medium">Tujuan Setelah Keluar:</span>
              <span className="text-[#3E385B] font-semibold">Halaman Login ORBITA</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#E6E8F2]">
          <button
            type="button"
            onClick={onClose}
            className="no-ornament inline-flex h-9 items-center justify-center rounded-full border border-[#E6E8F2] bg-[#F5F6FA] px-4 text-xs font-bold text-[#6A6584] hover:bg-[#ECEEF7] hover:text-[#3E385B] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: 'linear-gradient(135deg, #FF7597 0%, #FF5C86 100%)',
            }}
            className="no-ornament inline-flex h-9 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold text-white shadow-md hover:brightness-105 whitespace-nowrap shrink-0 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

