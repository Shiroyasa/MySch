import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Crown,
  Swords,
  Scroll,
  Gem,
  Hourglass,
  Sparkles,
  Flame,
  Trophy,
  Target,
  ShieldCheck,
  Castle,
  Wand2,
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  Download,
  PlusCircle,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { StudentModule } from '../modules/StudentModule';

export const DashboardRouter: React.FC = () => {
  const { currentRole, currentUser, students, teachers, classes, attendanceSessions, assessments, assessmentScores, auditLogs, setActiveNav, attendanceCorrections } = useApp();

  // Super Admin Dashboard
  if (currentRole === 'super_admin') {
    return (
      <div className="space-y-6">
        {/* Banner with JRPG Grandmaster Theme */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-500/20 backdrop-blur-xl">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/30 via-purple-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 shadow-xs">
              <Crown className="h-4 w-4 text-amber-300" />
              <span>Pusat Kendali Sistem &amp; Manajemen</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Selamat Datang, {currentUser.displayName}
            </h1>
            <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
              Arsitektur Sistem &amp; Pusat Komando Sekolah. Mengawasi integritas data akademik, kehadiran siswa, aturan keamanan multi-peran, dan jejak audit sistem secara real-time.
            </p>
          </div>
        </div>

        {/* JRPG Concept Metric Cards with RPG Stat Bars */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Siswa / Guild Cadets */}
          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Gem className="h-3.5 w-3.5 text-blue-500" /> Total Siswa (Cadets)
              </span>
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 text-white shadow-md shadow-blue-500/25">
                <Gem className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{students.length}</p>
            {/* HP Style Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>Roster Vitality</span>
                <span>100% Aktif</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-full" />
              </div>
            </div>
          </div>

          {/* Tenaga Pendidik / High Scholars */}
          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 text-emerald-500" /> Guru &amp; Tenaga Pendidik
              </span>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2 text-white shadow-md shadow-emerald-500/25">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{teachers.length}</p>
            {/* MP Style Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                <span>Scholar Mastery</span>
                <span>5 Jurusan</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-cyan-500 w-[92%]" />
              </div>
            </div>
          </div>

          {/* Rombongan Belajar / Academy Guild Classes */}
          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Castle className="h-3.5 w-3.5 text-purple-500" /> Rombel &amp; Guild Classes
              </span>
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-2 text-white shadow-md shadow-purple-500/25">
                <Castle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{classes.length}</p>
            {/* EXP Style Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-purple-600 dark:text-purple-400">
                <span>Tier X, XI, XII</span>
                <span>Aktif</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 w-[88%]" />
              </div>
            </div>
          </div>

          {/* Aktivitas Audit Log / Aegis Security */}
          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Keamanan &amp; Audit Log
              </span>
              <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2 text-white shadow-md shadow-amber-500/25">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{auditLogs.length}</p>
            {/* Security Status */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <span>Encrypted &amp; Live</span>
                <span>Active Shield</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links & Realtime Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <h2 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                  Aktivitas Sistem &amp; Audit Trail Real-Time
                </h2>
              </div>
              <button
                onClick={() => setActiveNav('audit-logs')}
                className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua ({auditLogs.length})</span>
                <span>&rarr;</span>
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start gap-3 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="mt-0.5 rounded-lg bg-indigo-100 p-1.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {log.action} — <span className="font-medium text-slate-500 dark:text-slate-400">{log.module}</span>
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{log.details}</p>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 inline-flex items-center gap-1">
                      <span>✦ Oleh:</span> {log.userName} ({log.userRole})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h2 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                  Aksi Cepat Sistem
                </h2>
              </div>
              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveNav('master-data')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-indigo-50/70 hover:border-indigo-300 dark:border-slate-700 dark:hover:bg-slate-800 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 group-hover:scale-110 transition-transform">
                      <Gem className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Grand Codex (Master Data)</span>
                  </div>
                  <span className="text-xs text-indigo-500 font-bold">&rarr;</span>
                </button>

                <button
                  onClick={() => setActiveNav('user-management')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-purple-50/70 hover:border-purple-300 dark:border-slate-700 dark:hover:bg-slate-800 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 group-hover:scale-110 transition-transform">
                      <Crown className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Party Roster (Akun &amp; RBAC)</span>
                  </div>
                  <span className="text-xs text-purple-500 font-bold">&rarr;</span>
                </button>

                <button
                  onClick={() => setActiveNav('reports')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-emerald-50/70 hover:border-emerald-300 dark:border-slate-700 dark:hover:bg-slate-800 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                      <Scroll className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Royal Scroll (Cetak Rapor)</span>
                  </div>
                  <span className="text-xs text-emerald-500 font-bold">&rarr;</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Basis Data Firestore: Online &amp; Terlindungi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin / Tata Usaha Dashboard
  if (currentRole === 'admin') {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-500/20 backdrop-blur-xl">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/30 via-cyan-500/10 to-transparent pointer-events-none" />
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-400/30 shadow-xs">
              <Scroll className="h-4 w-4 text-cyan-300" />
              <span>Arsip &amp; Rombel Tata Usaha</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Halo, {currentUser.displayName}
            </h1>
            <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
              Pusat pengelolaan arsip master kesiswaan, kepegawaian instruktur guru, rombongan belajar vokasi, dan administrasi sekolah.
            </p>
          </div>
        </div>

        {/* JRPG Stats with RPG Gauge Bars */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Gem className="h-3.5 w-3.5 text-blue-500" /> Siswa Aktif (Cadets)
              </span>
              <div className="p-2 rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/25">
                <Gem className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{students.length}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
                <span>Terdaftar Lengkap</span>
                <span>100%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 w-full" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 text-emerald-500" /> Guru &amp; Pegawai
              </span>
              <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{teachers.length}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>NIP &amp; SK Valid</span>
                <span>Tercatat</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-full" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Castle className="h-3.5 w-3.5 text-purple-500" /> Rombel (Guilds)
              </span>
              <div className="p-2 rounded-xl bg-purple-500 text-white shadow-md shadow-purple-500/25">
                <Castle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{classes.length}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-purple-600 dark:text-purple-400">
                <span>Wali Kelas Terisi</span>
                <span>Lengkap</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 w-full" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-amber-500" /> Kapasitas Rombel
              </span>
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">88%</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <span>Rata-rata 32 Siswa</span>
                <span>Optimal</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 w-[88%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operations with JRPG Theme */}
        <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Aksi Tata Usaha &amp; Pengelolaan Guild
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveNav('master-data')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/80 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-blue-950/40 transition-all text-left cursor-pointer group"
            >
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl mb-3 shadow-md group-hover:scale-110 transition-transform">
                <Gem className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">Kelola Siswa (Cadets)</span>
              <span className="text-[11px] text-slate-500 mt-1">Input, ubah, arsipkan, atau mutasi data siswa</span>
            </button>

            <button
              onClick={() => setActiveNav('master-data')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-emerald-50/80 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-emerald-950/40 transition-all text-left cursor-pointer group"
            >
              <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl mb-3 shadow-md group-hover:scale-110 transition-transform">
                <Crown className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">Kelola Tenaga Pendidik</span>
              <span className="text-[11px] text-slate-500 mt-1">Daftar guru, penugasan mata pelajaran &amp; wali kelas</span>
            </button>

            <button
              onClick={() => setActiveNav('reports')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-purple-50/80 hover:border-purple-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-purple-950/40 transition-all text-left cursor-pointer group"
            >
              <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl mb-3 shadow-md group-hover:scale-110 transition-transform">
                <Scroll className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">Royal Scroll (Laporan)</span>
              <span className="text-[11px] text-slate-500 mt-1">Unduh Buku Induk &amp; Data Kesiswaan Excel/PDF</span>
            </button>

            <button
              onClick={() => setActiveNav('attendance')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-amber-50/80 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-amber-950/40 transition-all text-left cursor-pointer group"
            >
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl mb-3 shadow-md group-hover:scale-110 transition-transform">
                <Hourglass className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">Presensi Siswa</span>
              <span className="text-[11px] text-slate-500 mt-1">Pantau keterisian presensi seluruh kelas hari ini</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guru Mata Pelajaran Dashboard
  if (currentRole === 'guru') {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-500/20 backdrop-blur-xl">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/30 via-teal-500/10 to-transparent pointer-events-none" />
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30 shadow-xs">
              <Wand2 className="h-4 w-4 text-emerald-300" />
              <span>Portal Pembelajaran Guru Mata Pelajaran</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Selamat Mengajar, {currentUser.displayName}
            </h1>
            <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
              Mata Pelajaran: <strong>Pemrograman Web &amp; Perangkat Bergerak</strong> dan <strong>Basis Data</strong>.
              Pantau kehadiran jam pelajaran dan kelola penilaian kompetensi siswa secara akurat.
            </p>
          </div>
        </div>

        {/* Quick action buttons with JRPG Theme */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => setActiveNav('attendance')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/25 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Hourglass className="h-5 w-5 shrink-0 text-cyan-200" />
            <div className="text-left">
              <div className="font-extrabold">Input Presensi</div>
              <div className="text-[10px] font-normal opacity-80">Chrono Sesi Mapel</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('grading')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/25 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Swords className="h-5 w-5 shrink-0 text-emerald-200" />
            <div className="text-left">
              <div className="font-extrabold">Input Nilai</div>
              <div className="text-[10px] font-normal opacity-80">Battle Trials &amp; STS</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('grading')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/25 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Scroll className="h-5 w-5 shrink-0 text-purple-200" />
            <div className="text-left">
              <div className="font-extrabold">Rekap &amp; Leger</div>
              <div className="text-[10px] font-normal opacity-80">Kalkulasi Nilai Akhir</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('ai-studio')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Sparkles className="h-5 w-5 shrink-0 text-amber-300" />
            <div className="text-left">
              <div className="font-extrabold">Analisis AI Cerdas</div>
              <div className="text-[10px] font-normal opacity-80">Enchantment Pedagogik</div>
            </div>
          </button>
        </div>

        {/* Class assignments & Active Assessments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <div className="flex items-center gap-2 mb-3">
              <Castle className="h-4 w-4 text-emerald-600" />
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Kelas Yang Diampu Semester Ini
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">X RPL 1</span>
                  <p className="text-[11px] text-slate-500">Pemrograman Web &amp; Perangkat Bergerak (32 Siswa)</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Jadwal: Senin, 07.30 - 10.00 WIB</p>
                </div>
                <button
                  onClick={() => setActiveNav('attendance')}
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Presensi
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">X RPL 2</span>
                  <p className="text-[11px] text-slate-500">Pemrograman Web &amp; Perangkat Bergerak (30 Siswa)</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Jadwal: Selasa, 10.15 - 12.30 WIB</p>
                </div>
                <button
                  onClick={() => setActiveNav('attendance')}
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Presensi
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-indigo-600" />
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Komponen Penilaian &amp; Trials Terbaru
                </h2>
              </div>
              <button onClick={() => setActiveNav('grading')} className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
                Kelola Semua &rarr;
              </button>
            </div>
            <div className="space-y-2.5">
              {assessments.slice(0, 4).map(asm => (
                <div key={asm.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800">
                  <div className="truncate mr-2">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{asm.title}</p>
                    <p className="text-[10px] text-slate-500">{asm.className} &bull; Bobot: {asm.weight}% &bull; KKM: {asm.kkm}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    asm.status === 'dipublikasikan'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40'
                  }`}>
                    {asm.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wali Kelas Dashboard
  if (currentRole === 'wali_kelas') {
    const homeroomStudents = students.filter(s => s.className === 'X RPL 1');
    const pendingCorrections = attendanceCorrections.filter(c => c.status === 'pending');

    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-amber-800 via-orange-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-500/20 backdrop-blur-xl">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/30 via-orange-500/10 to-transparent pointer-events-none" />
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/25 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              <span>Manajemen Pembinaan Kelas X RPL 1</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Selamat Pagi, {currentUser.displayName}
            </h1>
            <p className="mt-2 text-sm text-amber-100/90 leading-relaxed">
              Memantau perkembangan akademis, karakter siswa, ketidakhadiran, dan verifikasi permohonan koreksi absensi siswa kelas binaan <strong>X RPL 1</strong>.
            </p>
          </div>
        </div>

        {/* Stats with JRPG HP Gauges */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Gem className="h-3.5 w-3.5 text-blue-500" /> Siswa Binaan
            </span>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{homeroomStudents.length}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
                <span>Rombel X RPL 1</span>
                <span>Active</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 w-full" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Hourglass className="h-3.5 w-3.5 text-emerald-500" /> HP Kehadiran Kelas
            </span>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">91.7%</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>10 Hadir, 1 Sakit, 1 Izin</span>
                <span>Tier A</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-[91.7%]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" /> Koreksi Presensi
            </span>
            <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCorrections.length}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <span>Menunggu Verifikasi</span>
                <span>Pending</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 w-full" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Swords className="h-3.5 w-3.5 text-rose-500" /> Perhatian Khusus
            </span>
            <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">1</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-rose-600 dark:text-rose-400">
                <span>Bagus Dwi S. (Remedial)</span>
                <span>Tutor Sebaya</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-rose-500 w-[60%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Attention list & Pending correction requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2 dark:border-slate-800">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" /> Siswa Memerlukan Perhatian Khusus
              </h2>
              <span className="text-[11px] text-slate-400">Semester Ganjil</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-900/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Bagus Dwi Saputra (NISN: 0072389103)</span>
                  <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    Remedial CSS (74/75)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  Catatan: Nilai Praktik 1 masih di bawah KKM dan sempat sakit 1 hari. Disarankan pendampingan tutor sebaya dengan Anisa Nur Rahmah.
                </p>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                  <span>Kontak Ortu: 081233221102 (Dwi Saputro)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2 dark:border-slate-800">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" /> Permohonan Koreksi Presensi
              </h2>
              <button onClick={() => setActiveNav('attendance')} className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                Periksa &rarr;
              </button>
            </div>
            <div className="space-y-3">
              {pendingCorrections.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Tidak ada permohonan koreksi yang pending.</p>
              ) : (
                pendingCorrections.map(c => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{c.studentName}</span>
                      <span className="font-semibold text-amber-600">Status: {c.currentStatus} &rarr; {c.requestedStatus}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Alasan: {c.reason}</p>
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setActiveNav('attendance')}
                        className="rounded-xl bg-blue-600 px-3.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                      >
                        Buka &amp; Verifikasi
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kepala Sekolah Dashboard
  if (currentRole === 'kepala_sekolah') {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-rose-500/20 backdrop-blur-xl">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500/30 via-amber-500/10 to-transparent pointer-events-none" />
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-400/30 shadow-xs">
              <Trophy className="h-4 w-4 text-amber-300" />
              <span>Pusat Pengawasan Manajerial &amp; Mutu</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Selamat Datang, {currentUser.displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-200/90 leading-relaxed">
              Ringkasan komprehensif tingkat kehadiran sekolah, rata-rata kompetensi per jurusan, kelengkapan administrasi guru, dan statistik pembelajaran vokasi.
            </p>
          </div>
        </div>

        {/* Executive Metrics with JRPG Stat Bars */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Hourglass className="h-3.5 w-3.5 text-emerald-500" /> Kehadiran Sekolah
            </span>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">94.8%</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>+1.4% Bulan Lalu</span>
                <span>Target Terpenuhi</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-[94.8%]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Swords className="h-3.5 w-3.5 text-blue-500" /> MP Akademik Sekolah
            </span>
            <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">86.2</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
                <span>Predikat: B+ (Sangat Baik)</span>
                <span>86.2 MP</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 w-[86.2%]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Scroll className="h-3.5 w-3.5 text-purple-500" /> Penilaian Guru
            </span>
            <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">92%</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-purple-600 dark:text-purple-400">
                <span>Tuntas Mid Semester</span>
                <span>92%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 w-[92%]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-500" /> Siswa Bebas Alpa
            </span>
            <p className="mt-2 text-2xl font-black text-amber-500">97.5%</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <span>Kedisiplinan Tertinggi</span>
                <span>97.5%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 w-[97.5%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Major comparisons & Download Executive Report */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-indigo-600" />
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Capaian Rata-Rata Kompetensi Per Jurusan Vokasi
              </h2>
            </div>
            <div className="space-y-4">
              {[
                { code: 'RPL', name: 'Rekayasa Perangkat Lunak', avg: 88.5, attendance: 96.2, color: 'bg-blue-600' },
                { code: 'TKJ', name: 'Teknik Komputer & Jaringan', avg: 85.8, attendance: 94.5, color: 'bg-emerald-600' },
                { code: 'AKL', name: 'Akuntansi & Keuangan Lembaga', avg: 87.1, attendance: 95.8, color: 'bg-purple-600' },
                { code: 'OTKP', name: 'Otomatisasi & Tata Kelola Perkantoran', avg: 84.9, attendance: 93.9, color: 'bg-amber-600' },
                { code: 'BDP', name: 'Bisnis Daring & Pemasaran', avg: 84.2, attendance: 93.5, color: 'bg-cyan-600' },
              ].map(item => (
                <div key={item.code} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{item.name} ({item.code})</span>
                    <span>Nilai: {item.avg} &bull; Kehadiran: {item.attendance}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.avg}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Scroll className="h-5 w-5 text-indigo-600" />
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Laporan Manajerial Eksekutif
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Unduh rekapitulasi data akademik &amp; kehadiran resmi untuk pelaporan Yayasan dan Cabang Dinas Pendidikan.
              </p>
              
              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveNav('reports')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50/80 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-extrabold text-xs hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200/60 dark:border-blue-800"
                >
                  <span className="flex items-center gap-2">
                    <Scroll className="h-4 w-4" /> Laporan Eksekutif PDF
                  </span>
                  <span>&darr;</span>
                </button>

                <button
                  onClick={() => setActiveNav('reports')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-xs hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Rekap Sekolah Excel (XLSX)
                  </span>
                  <span>&darr;</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400">SMK Mardi Yuana Cikembar - Terakreditasi A (Unggul)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Siswa Dashboard - Hanya Profil Siswa & Nilai Siswa
  return <StudentModule initialTab="profile" />;
};
