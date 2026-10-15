import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Download,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { StudentModule } from '../modules/StudentModule';

export const DashboardRouter: React.FC = () => {
  const { currentRole, currentUser, students, teachers, classes, attendanceSessions, assessments, assessmentScores, auditLogs, setActiveNav, attendanceCorrections } = useApp();

  // Super Admin Dashboard
  if (currentRole === 'super_admin') {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <ShieldCheck className="h-3.5 w-3.5" /> Portal Super Admin & Arsitektur Sistem
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {currentUser.displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Pusat kendali operasional SMK Mardi Yuana Cikembar. Mengawasi integritas data akademik, kehadiran siswa, aturan keamanan multi-peran, dan jejak audit sistem.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Siswa Terdaftar</span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{students.length}</p>
            <span className="text-[11px] text-emerald-600 font-medium dark:text-emerald-400">100% Aktif Semester Ganjil</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tenaga Pendidik & TU</span>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{teachers.length}</p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Tersebar di 5 Jurusan Vokasi</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rombongan Belajar (Kelas)</span>
              <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <CalendarCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{classes.length}</p>
            <span className="text-[11px] text-purple-600 font-medium dark:text-purple-400">Tingkat X, XI, dan XII</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Aktivitas Audit Log</span>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{auditLogs.length}</p>
            <span className="text-[11px] text-amber-600 font-medium dark:text-amber-400">Terekam & Terenkripsi</span>
          </div>
        </div>

        {/* Quick Links & Realtime Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Aktivitas Sistem & Audit Trail Terbaru</h2>
              <button
                onClick={() => setActiveNav('audit-logs')}
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Lihat Semua ({auditLogs.length})
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="mt-0.5 rounded-lg bg-blue-100 p-1.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {log.action} — <span className="font-normal text-slate-500 dark:text-slate-400">{log.module}</span>
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{log.details}</p>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1 inline-block">
                      Oleh: {log.userName} ({log.userRole})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-3">Aksi Cepat Super Admin</h2>
              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveNav('master-data')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Kelola Data Master Sekolah</span>
                  </div>
                  <span className="text-[11px] text-slate-400">&rarr;</span>
                </button>

                <button
                  onClick={() => setActiveNav('user-management')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Manajemen Hak Akses RBAC</span>
                  </div>
                  <span className="text-[11px] text-slate-400">&rarr;</span>
                </button>

                <button
                  onClick={() => setActiveNav('reports')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Pusat Cetak Laporan Resmi</span>
                  </div>
                  <span className="text-[11px] text-slate-400">&rarr;</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
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
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-900 p-6 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              <FileCheck className="h-3.5 w-3.5" /> Portal Administrasi Tata Usaha
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {currentUser.displayName}
            </h1>
            <p className="mt-2 text-sm text-blue-100 leading-relaxed">
              Kelola data master kesiswaan, kepegawaian guru, rombongan belajar, dan penempatan kelas siswa SMK Mardi Yuana Cikembar.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Siswa Aktif</span>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{students.length}</p>
            <span className="text-[11px] text-blue-600">Terdaftar Lengkap</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Guru &amp; Pegawai</span>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{teachers.length}</p>
            <span className="text-[11px] text-emerald-600">Memiliki NIP Valid</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Total Kelas</span>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{classes.length}</p>
            <span className="text-[11px] text-purple-600">Semua Terisi Wali Kelas</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Kapasitas Kelas</span>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">88%</p>
            <span className="text-[11px] text-amber-600">Rata-rata 32 siswa/kelas</span>
          </div>
        </div>

        {/* Quick Operations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Aksi Tata Usaha &amp; Administrasi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveNav('master-data')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-blue-950/40 transition-all text-left"
            >
              <div className="p-2 bg-blue-600 text-white rounded-lg mb-3">
                <PlusCircle className="h-5 w-5" />
              </div>
              <span className="font-bold text-xs text-slate-900 dark:text-white">Kelola Siswa</span>
              <span className="text-[11px] text-slate-500 mt-1">Input, ubah, arsipkan, atau mutasi data siswa</span>
            </button>

            <button
              onClick={() => setActiveNav('master-data')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/60 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-emerald-950/40 transition-all text-left"
            >
              <div className="p-2 bg-emerald-600 text-white rounded-lg mb-3">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-xs text-slate-900 dark:text-white">Kelola Tenaga Pendidik</span>
              <span className="text-[11px] text-slate-500 mt-1">Daftar guru, penugasan mata pelajaran &amp; wali kelas</span>
            </button>

            <button
              onClick={() => setActiveNav('reports')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50/60 hover:border-purple-300 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-purple-950/40 transition-all text-left"
            >
              <div className="p-2 bg-purple-600 text-white rounded-lg mb-3">
                <Download className="h-5 w-5" />
              </div>
              <span className="font-bold text-xs text-slate-900 dark:text-white">Ekspor Laporan Administrasi</span>
              <span className="text-[11px] text-slate-500 mt-1">Unduh Buku Induk &amp; Data Kesiswaan Excel/PDF</span>
            </button>

            <button
              onClick={() => setActiveNav('attendance')}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50/60 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-amber-950/40 transition-all text-left"
            >
              <div className="p-2 bg-amber-600 text-white rounded-lg mb-3">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <span className="font-bold text-xs text-slate-900 dark:text-white">Rekap Absensi Sekolah</span>
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
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/50 px-3 py-1 text-xs font-semibold text-emerald-100">
              <GraduationCap className="h-3.5 w-3.5" /> Portal Guru Mata Pelajaran
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Mengajar, {currentUser.displayName}
            </h1>
            <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
              Mata Pelajaran: <strong>Pemrograman Web &amp; Perangkat Bergerak</strong> dan <strong>Basis Data</strong>.
              Pantau kehadiran jam pelajaran dan kelola penilaian kompetensi siswa secara akurat.
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => setActiveNav('attendance')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
          >
            <CalendarCheck className="h-5 w-5 shrink-0" />
            <div className="text-left">
              <div>Input Presensi</div>
              <div className="text-[10px] font-normal opacity-80">Sesi Mapel Hari Ini</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('grading')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-colors"
          >
            <Award className="h-5 w-5 shrink-0" />
            <div className="text-left">
              <div>Input Nilai</div>
              <div className="text-[10px] font-normal opacity-80">Tugas / Praktik / STS</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('grading')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-colors"
          >
            <FileSpreadsheet className="h-5 w-5 shrink-0" />
            <div className="text-left">
              <div>Rekap &amp; Leger</div>
              <div className="text-[10px] font-normal opacity-80">Kalkulasi Nilai Akhir</div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('ai-studio')}
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-5 w-5 shrink-0 text-amber-300" />
            <div className="text-left">
              <div>Analisis AI Cerdas</div>
              <div className="text-[10px] font-normal opacity-80">Diagnostik Pedagogik</div>
            </div>
          </button>
        </div>

        {/* Class assignments & Active Assessments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Kelas Yang Diampu Semester Ini</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">X RPL 1</span>
                  <p className="text-[11px] text-slate-500">Pemrograman Web &amp; Perangkat Bergerak (32 Siswa)</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Jadwal: Senin, 07.30 - 10.00 WIB</p>
                </div>
                <button
                  onClick={() => setActiveNav('attendance')}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700"
                >
                  Presensi
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">X RPL 2</span>
                  <p className="text-[11px] text-slate-500">Pemrograman Web &amp; Perangkat Bergerak (30 Siswa)</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Jadwal: Selasa, 10.15 - 12.30 WIB</p>
                </div>
                <button
                  onClick={() => setActiveNav('attendance')}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700"
                >
                  Presensi
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Komponen Penilaian Terbaru</h2>
              <button onClick={() => setActiveNav('grading')} className="text-xs text-blue-600 font-semibold hover:underline">
                Kelola Semua
              </button>
            </div>
            <div className="space-y-2.5">
              {assessments.slice(0, 4).map(asm => (
                <div key={asm.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <div className="truncate mr-2">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{asm.title}</p>
                    <p className="text-[10px] text-slate-500">{asm.className} &bull; Bobot: {asm.weight}% &bull; KKM: {asm.kkm}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    asm.status === 'dipublikasikan'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
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
        <div className="rounded-3xl bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 p-6 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-100 border border-amber-400/30">
              <ShieldCheck className="h-3.5 w-3.5" /> Portal Wali Kelas — X RPL 1
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Pagi, {currentUser.displayName}
            </h1>
            <p className="mt-2 text-sm text-amber-100 leading-relaxed">
              Memantau perkembangan akademis, catatan kepribadian, ketidakhadiran, dan permohonan koreksi absensi siswa kelas binaan <strong>X RPL 1</strong>.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Siswa Binaan</span>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{homeroomStudents.length}</p>
            <span className="text-[11px] text-blue-600 font-medium">Kelas X RPL 1</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Kehadiran Hari Ini</span>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">91.7%</p>
            <span className="text-[11px] text-slate-500">10 Hadir, 1 Sakit, 1 Izin</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Permohonan Koreksi</span>
            <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCorrections.length}</p>
            <span className="text-[11px] text-amber-600 font-medium">Menunggu Verifikasi</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Perhatian Khusus</span>
            <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">1</p>
            <span className="text-[11px] text-rose-600 font-medium">Bagus Dwi S. (Butuh Remedial)</span>
          </div>
        </div>

        {/* Attention list & Pending correction requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2 dark:border-slate-800">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2 dark:border-slate-800">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" /> Permohonan Koreksi Presensi
              </h2>
              <button onClick={() => setActiveNav('attendance')} className="text-xs text-blue-600 font-semibold hover:underline">
                Periksa
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
                        className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700"
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
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-400/30">
              <Award className="h-3.5 w-3.5" /> Dashboard Eksekutif Kepala Sekolah
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {currentUser.displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Ringkasan komprehensif tingkat kehadiran sekolah, rata-rata kompetensi per jurusan, kelengkapan administrasi guru, dan statistik pembelajaran vokasi SMK Mardi Yuana Cikembar.
            </p>
          </div>
        </div>

        {/* Executive Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Rata-rata Kehadiran Sekolah</span>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">94.8%</p>
            <span className="text-[11px] text-emerald-600 font-medium">+1.4% dari bulan lalu</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Rata-rata Nilai Akademik</span>
            <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">86.2</p>
            <span className="text-[11px] text-blue-600 font-medium">Predikat: B+ (Sangat Baik)</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Kelengkapan Penilaian Guru</span>
            <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">92%</p>
            <span className="text-[11px] text-slate-500">Tuntas Mid Semester</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Siswa Bebas Alpa</span>
            <p className="mt-2 text-2xl font-black text-cyan-600 dark:text-cyan-400">97.5%</p>
            <span className="text-[11px] text-slate-500">Tingkat Kedisiplinan Tinggi</span>
          </div>
        </div>

        {/* Major comparisons & Download Executive Report */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Capaian Rata-Rata Kompetensi Per Jurusan</h2>
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

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Laporan Manajerial Eksekutif</h2>
              <p className="text-xs text-slate-500 mb-4">Unduh rekapitulasi data akademik &amp; kehadiran resmi untuk pelaporan Yayasan dan Cabang Dinas Pendidikan.</p>
              
              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveNav('reports')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" /> Laporan Eksekutif PDF
                  </span>
                  <span>&darr;</span>
                </button>

                <button
                  onClick={() => setActiveNav('reports')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Rekap Sekolah Excel (XLSX)
                  </span>
                  <span>&darr;</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-400">SMK Mardi Yuana Cikembar - Terakreditasi A (Unggul)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Siswa Dashboard - Hanya Profil Siswa & Nilai Siswa
  return <StudentModule initialTab="profile" />;
};
