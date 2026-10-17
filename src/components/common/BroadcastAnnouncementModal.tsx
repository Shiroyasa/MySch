import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Megaphone,
  X,
  Send,
  AlertTriangle,
  Bell,
  Sparkles,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface BroadcastAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastAnnouncementModal: React.FC<BroadcastAnnouncementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, currentRole, sendBroadcastNotification } = useApp();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'penting' | 'mendesak'>('penting');
  const [category, setCategory] = useState<'akademik' | 'presensi' | 'pengumuman' | 'keamanan' | 'profil' | 'umum'>('pengumuman');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Siswa is explicitly excluded from sending broadcast announcements
  if (currentRole === 'siswa') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Akses Pengumuman Terbatas
          </h2>
          <p className="text-xs text-slate-500">
            Peran Siswa hanya dapat menerima dan membaca pengumuman resmi sekolah. Hak siar pengumuman massal dikhususkan bagi dewan guru dan staf pimpinan.
          </p>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-blue-600"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      sendBroadcastNotification(title.trim(), message.trim(), urgency, category);
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setTitle('');
        setMessage('');
        setUrgency('penting');
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Beri Pemberitahuan ke Semua Role
              </h2>
              <p className="text-xs text-slate-500">
                Kirim pengumuman resmi dari {currentUser.displayName} ({currentRole.replace('_', ' ').toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Confirmation */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Pemberitahuan Berhasil Disiarkan!
            </h3>
            <p className="text-xs text-slate-500">
              Notifikasi telah dikirimkan ke seluruh pengguna (Guru, Wali Kelas, Siswa, Kepala Sekolah, dan Staf TU).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Target Audience Pill */}
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-[11px] text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
              <Users className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <strong>Sasaran Penerima:</strong> Seluruh Role (Siswa, Guru Mapel, Wali Kelas, Kepala Sekolah, Admin TU, Super Admin)
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Judul Pemberitahuan / Pengumuman <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Jadwal Penilaian Akhir Semester (PAS) & Remedial"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="pengumuman">Pengumuman Umum</option>
                  <option value="akademik">Akademik &amp; Ujian</option>
                  <option value="presensi">Presensi &amp; Kehadiran</option>
                  <option value="keamanan">Ketertiban &amp; Keamanan</option>
                  <option value="umum">Kegiatan Sekolah</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tingkat Urgensi
                </label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="normal">Normal (Biasa)</option>
                  <option value="penting">Penting (Wajib Baca)</option>
                  <option value="mendesak">Mendesak (Darurat / Hari Ini)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Isi Pesan / Instruksi Pemberitahuan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan isi pengumuman, tanggal pelaksanaan, dan arahan bagi para siswa atau dewan guru..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Menyiarkan...' : 'Siarkan ke Semua Role'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
