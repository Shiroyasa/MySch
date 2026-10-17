import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Crown,
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  ShieldCheck,
  Swords,
  User,
  GraduationCap,
  Users,
} from 'lucide-react';
import { loginWithGoogle } from '../../lib/firebase';
import { AnimeBackground } from '../common/AnimeBackground';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, loginWithRole, darkMode, toggleDarkMode } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email atau NIP/NIS akun sekolah.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Harap masukkan kata sandi.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ok = loginWithEmail(email.trim(), password.trim());
      setIsSubmitting(false);
      if (!ok) {
        setErrorMessage('Email/NIP/NIS atau kata sandi tidak cocok. Silakan periksa kembali kredensial Anda.');
      }
    }, 350);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 transition-colors dark:text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Clean Anime Scenery Background */}
      <AnimeBackground />

      {/* Top Bar with Academy Brand & Theme Toggle */}
      <div className="relative z-10 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-4 py-3 sm:px-6 dark:border-slate-800/60 dark:bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Crown className="h-4 w-4 text-amber-300" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wide text-slate-900 dark:text-white">
              MY ACADEMY PORTAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
          </button>
        </div>
      </div>

      {/* Main Login Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header Card */}
          <div className="text-center space-y-2">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 ring-4 ring-white/80 dark:ring-slate-800/80">
              <Crown className="h-8 w-8 text-amber-300" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-spin" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white pt-2">
              Gerbang Masuk Akademi
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
              Sistem Absensi &amp; Evaluasi Prestasi Akademik Terpadu
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border border-white/80 bg-white/85 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Akun atau NIP/NIS
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@smkmy-cikembar.sch.id atau NIP/NIS"
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
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 hover:from-blue-500 hover:to-purple-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <Swords className="h-4 w-4" />
                <span>{isSubmitting ? 'Memverifikasi Segel Masuk...' : 'Masuk Gerbang Akademi'}</span>
              </button>
            </form>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white/80 px-2 text-slate-400 dark:bg-slate-900 font-bold backdrop-blur-xs">
                  Atau masuk dengan akun Google
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer"
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
          </div>

          {/* Security & System Info Note */}
          <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Dilindungi Enkripsi TLS 1.3 &bull; Autentikasi Firebase Terverifikasi</span>
            </p>
            <p>Portal Akademik &amp; Manajemen Presensi Terpadu</p>
          </div>
        </div>
      </div>
    </div>
  );
};
