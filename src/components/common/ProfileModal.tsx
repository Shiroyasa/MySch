import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Camera,
  Upload,
  UserCheck,
  Shield,
  Phone,
  Mail,
  KeyRound,
  IdCard,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  {
    label: 'Ororon • Chibi Night-Wind (5★)',
    url: '/assets/aistudio/ororon_chibi_1.png',
  },
  {
    label: 'Ororon • Chibi Bat-Ears (5★)',
    url: '/assets/aistudio/ororon_chibi_2.png',
  },
  {
    label: 'Ororon • Spirit Companion (5★)',
    url: '/assets/aistudio/ororon_spirit_1.png',
  },
  {
    label: 'Ororon • Electro Portrait (5★)',
    url: '/assets/aistudio/ororon_art_1.png',
  },
  {
    label: 'Ororon • Autumn Artboard (5★)',
    url: '/assets/aistudio/ororon_art_2.png',
  },
  {
    label: 'Ororon • Forest Sanctuary (5★)',
    url: '/assets/aistudio/ororon_art_3.png',
  },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentRole, updateCurrentUserProfile } = useApp();

  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [nipOrNis, setNipOrNis] = useState(currentUser.nipOrNis || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [photoURL, setPhotoURL] = useState(currentUser.photoURL || '');
  const [password, setPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentUser.displayName || '');
      setNipOrNis(currentUser.nipOrNis || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setPhotoURL(currentUser.photoURL || '');
      setPassword('');
      setIsSaved(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoURL(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoURL('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    const updates: any = {
      displayName,
      nipOrNis,
      phone,
      email,
      photoURL: photoURL || undefined,
    };

    if (password.trim()) {
      updates.password = password.trim();
    }

    updateCurrentUserProfile(updates);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const roleBadgeMap: Record<string, { label: string; color: string }> = {
    super_admin: { label: 'Super Administrator TU', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    admin: { label: 'Admin Tata Usaha', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    guru: { label: 'Guru Mata Pelajaran', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    wali_kelas: { label: 'Wali Kelas & Pembimbing', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
    kepala_sekolah: { label: 'Kepala Sekolah', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
    siswa: { label: 'Siswa / Siswi', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#42368E]/42 backdrop-blur-md animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-[28px] border border-[#7468C4]/30 bg-white/90 p-6 shadow-2xl dark:border-[#9E92FF]/28 dark:bg-[#1E1A3E]/90 backdrop-blur-2xl max-h-[90vh] overflow-y-auto animate-wobble-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Pengaturan Profil &amp; Ganti Foto
              </h3>
              <p className="text-[11px] text-slate-400">
                Data profil tersinkron ke semua halaman dan laporan sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert */}
        {isSaved && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Profil dan foto Anda berhasil diperbarui!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Photo Profile Section */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
              Foto Profil Pengguna
            </span>

            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-md ring-2 ring-blue-500/30 dark:border-slate-800 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span>{displayName.charAt(0) || 'U'}</span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="flex items-center gap-1.5 rounded-xl bg-blue-600 py-1.5 px-3 text-[11px] font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Unggah Foto Baru</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  {photoURL && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-1 rounded-xl border border-rose-200 py-1.5 px-2.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  Format PNG, JPG, atau WebP. Foto akan otomatis ditampilkan di header dan profil akun.
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 block mb-2">
                Atau pilih avatar sekolah siap pakai:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoURL(av.url)}
                    className="flex-shrink-0 h-10 w-10 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:scale-105 transition-all cursor-pointer"
                    title={av.label}
                  >
                    <img src={av.url} alt={av.label} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Data Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Data Identitas Pengguna
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  roleBadgeMap[currentRole]?.color || 'bg-slate-100 text-slate-800'
                }`}
              >
                {roleBadgeMap[currentRole]?.label || currentRole}
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Lengkap &amp; Gelar *
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  NIP / NIS / NUPTK
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={nipOrNis}
                    onChange={e => setNipOrNis(e.target.value)}
                    placeholder="Contoh: 198205142008011004"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  No. Telepon / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Alamat Email Akun
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kata Sandi Baru (Opsional)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak diganti"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Simpan Perubahan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
