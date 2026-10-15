import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  School,
  ArrowLeft,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  AlertCircle,
  Users,
} from 'lucide-react';
import { loginWithGoogle } from '../../lib/firebase';

const demoAccounts: {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  badgeColor: string;
}[] = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    name: 'Dr. Ir. Hendra Gunawan',
    email: 'admin.utama@smkmy-cikembar.sch.id',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  },
  {
    role: 'admin',
    label: 'Admin TU',
    name: 'Siti Rahmawati, S.AP',
    email: 'tatausaha@smkmy-cikembar.sch.id',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  },
  {
    role: 'guru',
    label: 'Guru Mapel',
    name: 'Ahmad Fauzi, S.Kom',
    email: 'ahmad.fauzi@smkmy-cikembar.sch.id',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  {
    role: 'wali_kelas',
    label: 'Wali Kelas',
    name: 'Dewi Lestari, S.Pd',
    email: 'dewi.lestari@smkmy-cikembar.sch.id',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    role: 'kepala_sekolah',
    label: 'Kepala Sekolah',
    name: 'Drs. Budi Santoso, M.M',
    email: 'kepsek@smkmy-cikembar.sch.id',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  },
  {
    role: 'siswa',
    label: 'Siswa',
    name: 'Aditya Pratama',
    email: 'aditya.pratama@siswa.smkmy.sch.id',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  },
];

export const LoginPage: React.FC = () => {
  const { setPageView, loginWithRole, loginWithEmail, darkMode, toggleDarkMode } = useApp();

  const [email, setEmail] = useState('admin.utama@smkmy-cikembar.sch.id');
  const [password, setPassword] = useState('smkmardiyuana2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Harap masukkan kata sandi.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      loginWithEmail(email);
      setIsSubmitting(false);
    }, 400);
  };

  const handleQuickRole = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword('smkmardiyuana2026');
    loginWithRole(acc.role);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await loginWithGoogle();
      setPageView('app');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Simple Bar */}
      <div className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 dark:border-slate-800/80 dark:bg-slate-900/90 flex items-center justify-between">
        <button
          onClick={() => setPageView('landing')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Login Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header Card */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
              <School className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white pt-2">
              Masuk ke Portal MySchool
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Sistem Informasi Absensi &amp; Penilaian Akademik SMK Mardi Yuana Cikembar
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Akun Sekolah
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@smkmy-cikembar.sch.id"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Kata Sandi
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Default: smkmardiyuana2026
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 text-xs">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ingat sesi masuk saya</span>
                </label>

                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  Bantuan Akun
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Memverifikasi Kredensial...' : 'Masuk ke Sistem'}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white px-2 text-slate-400 dark:bg-slate-900 font-semibold">
                  Atau masuk dengan akun Google
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Login dengan Google Workspace</span>
            </button>

            {/* Quick Demo Role Selector */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Pilih Cepat Akun Demo (1-Klik Masuk Langsung):</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickRole(acc)}
                    className="flex flex-col items-start p-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-blue-950/40 text-left transition-all"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {acc.label}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate w-full">
                      {acc.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Security & System Info Note */}
          <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
            <p>Dilindungi Enkripsi TLS 1.3 &bull; Autentikasi Firebase Terverifikasi</p>
            <p>SMK Mardi Yuana Cikembar &bull; Sukabumi, Jawa Barat</p>
          </div>
        </div>
      </div>
    </div>
  );
};
