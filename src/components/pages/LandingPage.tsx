import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  School,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Award,
  Users,
  BookOpen,
  Sparkles,
  BarChart3,
  Lock,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Network,
  Palette,
  Briefcase,
  FileText,
  Clock,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setPageView, loginWithRole, darkMode, toggleDarkMode } = useApp();

  const handleRoleQuickStart = (role: UserRole) => {
    loginWithRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
      {/* 1. TOP BAR CONTRACT (Strict 3-zone contract) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single Brand element wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <School className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                MySchool
              </span>
              <span className="text-[11px] text-slate-500 block dark:text-slate-400 font-medium">
                SMK Mardi Yuana Cikembar
              </span>
            </div>
          </div>

          {/* Zone 2: 4-5 single-line clean navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#keunggulan" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
              Keunggulan
            </a>
            <a href="#modul" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
              Modul Sistem
            </a>
            <a href="#jurusan" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
              Program Vokasi
            </a>
            <a href="#peran" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
              Matriks 6 Peran
            </a>
            <a href="#profil" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
              Profil Sekolah
            </a>
          </nav>

          {/* Zone 3: Actions (Theme switch + 1 Primary CTA) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setPageView('login')}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Masuk Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.12),rgba(0,0,0,0))] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Context kicker text */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
              <span>Sistem Manajemen Sekolah &bull; Kurikulum Merdeka &amp; K13</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Sistem Terpadu Presensi &amp; Penilaian Akademik SMK Mardi Yuana
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              Platform tata kelola pendidikan modern untuk efisiensi absensi harian dan per-mata pelajaran, pembobotan nilai Kurikulum Merdeka otomatis, serta integrasi 6 peran hierarkis sekolah.
            </p>

            {/* Primary CTA Decision Group */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPageView('login')}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
              >
                <span>Buka Portal Akademik</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleRoleQuickStart('guru')}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Coba Akses Sebagai Guru</span>
              </button>
            </div>

            {/* Regional / School trust banner below CTA */}
            <p className="text-xs text-slate-400 dark:text-slate-500 pt-2">
              NPSN: 20253654 &bull; Terakreditasi A (Unggul) &bull; Sukabumi, Jawa Barat
            </p>
          </div>

          {/* KPI Strip (Full-width row below hero split with tabular numerals) */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-center p-3 border-r border-slate-100 last:border-0 dark:border-slate-800">
              <div className="font-extrabold text-2xl sm:text-3xl font-mono tabular-nums text-blue-600 dark:text-blue-400">
                850+
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                Siswa Aktif Terdaftar
              </div>
            </div>

            <div className="text-center p-3 border-r border-slate-100 last:border-0 dark:border-slate-800">
              <div className="font-extrabold text-2xl sm:text-3xl font-mono tabular-nums text-slate-900 dark:text-white">
                48
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                Tenaga Pendidik &amp; Kependidikan
              </div>
            </div>

            <div className="text-center p-3 border-r border-slate-100 last:border-0 dark:border-slate-800">
              <div className="font-extrabold text-2xl sm:text-3xl font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                Terakreditasi A (Unggul) BAN-S/M
              </div>
            </div>

            <div className="text-center p-3">
              <div className="font-extrabold text-2xl sm:text-3xl font-mono tabular-nums text-purple-600 dark:text-purple-400">
                99.8%
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                Akurasi Presensi Realtime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE CAPABILITIES (BENTO GRID) */}
      <section id="keunggulan" className="py-16 lg:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
              Kapabilitas Unggulan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Solusi Digital Lengkap untuk SMK Masa Kini
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Dirancang khusus menjawab kebutuhan SMK dengan pembelajaran kejuruan, praktikum industri, dan pembagian hak akses dewan guru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Presensi Multimoda (col-span-2) */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  01. Presensi Multimoda &amp; Pengajuan Koreksi
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Pencatatan absensi harian kelas oleh Wali Kelas dan presensi per-jam tatap muka oleh Guru Mapel. Dilengkapi fitur verifikasi mandiri, pengajuan izin/sakit dengan bukti surat dokter, serta rekapitulasi persentase kehadiran realtime.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Presensi Harian</span>
                  <span className="text-slate-400 text-[11px]">Wali kelas &amp; Admin</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Presensi Mapel</span>
                  <span className="text-slate-400 text-[11px]">Setiap jam belajar</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Audit Koreksi</span>
                  <span className="text-slate-400 text-[11px]">Verifikasi terpusat</span>
                </div>
              </div>
            </div>

            {/* Card 2: Leger & Rapor Otomatis */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-4">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  02. Leger Nilai &amp; Rapor Kurikulum Merdeka
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Kalkulasi nilai akhir terbobot otomatis berdasarkan tugas (formatif), penilaian praktik kejuruan, dan ujian sumatif.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span>&bull; Ekspor Leger XLSX &amp; Cetak PDF Rapor Siswa</span>
              </div>
            </div>

            {/* Card 3: RBAC 6 Roles */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  03. Matriks 6 Peran Hierarkis (RBAC)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Isolasi wewenang ketat: Super Admin, Admin TU, Guru Mapel, Wali Kelas, Kepala Sekolah, dan Siswa sesuai tupoksi institusi.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span>&bull; Keamanan data terverifikasi Firebase Auth</span>
              </div>
            </div>

            {/* Card 4: Asisten AI Pedagogik (col-span-2) */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  04. Studio AI Pedagogik &amp; Generator Modul Ajar
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Asisten cerdas berbasis Gemini AI untuk penyusunan modul ajar Kurikulum Merdeka, perumusan rubrik asesmen kompetensi keahlian kejuruan, dan rekomendasi remedial personal siswa.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Terintegrasi langsung ke alur kerja guru</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Siap Pakai</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROGRAM KEAHLIAN / JURUSAN VOKASI */}
      <section id="jurusan" className="py-16 lg:py-24 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
              Konsentrasi Kejuruan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Program Vokasi Unggulan SMK Mardi Yuana
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Mempersiapkan lulusan berkarakter unggul, siap kerja, dan kompeten di industri teknologi maupun bisnis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4 font-black text-sm">
                RPL
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Rekayasa Perangkat Lunak</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Pengembangan web modern, aplikasi mobile Android/iOS, basis data relasional, dan arsitektur cloud.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                Kaprog: Ahmad Fauzi, S.Kom
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4 font-black text-sm">
                TKJ
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Teknik Komputer &amp; Jaringan</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Administrasi server Linux, konfigurasi routing MikroTik/Cisco, instalasi fiber optic, dan cyber security.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Kaprog: Rian Hidayat, S.T.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 mb-4 font-black text-sm">
                DKV
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Desain Komunikasi Visual</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Desain grafis digital, ilustrasi vektor, branding identitas visual, videografi, serta animasi multimedia.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                Kaprog: Maya Anggraeni, S.Ds
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mb-4 font-black text-sm">
                MPLB
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Manajemen Perkantoran</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Otomatisasi tata kelola perkantoran modern, kearsipan digital, korespondensi bisnis, dan komunikasi publik.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Kaprog: Dra. Siti Nurjanah
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE 6-ROLE PERSONA SELECTOR */}
      <section id="peran" className="py-16 lg:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
              Uji Coba Langsung
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Jelajahi Portal Sesuai Peran Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Klik salah satu peran di bawah untuk langsung mencoba tampilan dan hak akses sistem secara nyata tanpa perlu mendaftar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                role: 'super_admin' as UserRole,
                title: 'Super Admin',
                desc: 'Akses penuh ke konfigurasi institusi, audit log forensik, manajemen akun dan hak akses pengguna.',
                badge: 'Wewenang Penuh',
                color: 'purple',
              },
              {
                role: 'admin' as UserRole,
                title: 'Admin Tata Usaha',
                desc: 'Pengelolaan master data siswa, guru, kelas rombel, cetak transkrip, dan rekapitulasi sekolah.',
                badge: 'Operasional TU',
                color: 'blue',
              },
              {
                role: 'guru' as UserRole,
                title: 'Guru Mata Pelajaran',
                desc: 'Input presensi per-jam mapel, penyusunan komponen penilaian tugas/praktik, dan cetak leger nilai.',
                badge: 'Akademik & Nilai',
                color: 'emerald',
              },
              {
                role: 'wali_kelas' as UserRole,
                title: 'Wali Kelas',
                desc: 'Presensi harian pagi, pemantauan ketidakhadiran, verifikasi koreksi izin sakit, dan penerbitan rapor.',
                badge: 'Bina Kelas',
                color: 'amber',
              },
              {
                role: 'kepala_sekolah' as UserRole,
                title: 'Kepala Sekolah',
                desc: 'Monitoring statistik agregat kehadiran, grafik kelulusan KKM mata pelajaran, dan analisis data.',
                badge: 'Eksekutif & Evaluasi',
                color: 'rose',
              },
              {
                role: 'siswa' as UserRole,
                title: 'Siswa / Peserta Didik',
                desc: 'Melihat rekap kehadiran personal, transparansi nilai ujian/tugas, dan pengajuan koreksi presensi resmi.',
                badge: 'Portal Siswa',
                color: 'cyan',
              },
            ].map(p => (
              <div
                key={p.role}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {p.title}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleRoleQuickStart(p.role)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-800 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-blue-600 dark:hover:text-white transition-colors"
                  >
                    <span>Masuk Sebagai {p.title}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROFIL SEKOLAH & LEGALITAS */}
      <section id="profil" className="py-16 border-b border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Institusi Pendidikan Formal Terakreditasi Unggul</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                SMK Mardi Yuana Cikembar
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Mencetak generasi vokasi yang unggul dalam ilmu pengetahuan dan teknologi (IPTEK), berakhlak mulia, berjiwa wirausaha mandiri, dan berdaya saing global di industri nasional.
              </p>
              <div className="pt-2 text-xs text-slate-500 space-y-1">
                <p>&bull; <strong>NPSN:</strong> 20253654 &bull; <strong>Akreditasi:</strong> A (Unggul)</p>
                <p>&bull; <strong>Alamat:</strong> Jl. Pelabuhan II Km. 18, Cikembar, Kab. Sukabumi, Jawa Barat</p>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setPageView('login')}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. QUIET FOOTER */}
      <footer className="mt-auto py-10 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">
              M
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              MySchool &bull; SMK Mardi Yuana Cikembar
            </span>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400">
            <p>&copy; {new Date().getFullYear()} SMK Mardi Yuana Cikembar. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="mt-0.5">Sistem Informasi Absensi &amp; Penilaian Akademik Vokasi Berbasis Cloud.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
