import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Crown,
  Swords,
  Scroll,
  Gem,
  Hourglass,
  Sparkles,
  Trophy,
  Target,
  ShieldCheck,
  Castle,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Download,
  FileCheck,
  BookOpen,
  CalendarCheck,
  GraduationCap,
} from 'lucide-react';
import { StudentModule } from '../modules/StudentModule';
import {
  OrnateCard,
  AcademyHeroBanner,
  CharacterMedallion,
  GoldCompassRose,
} from '../common/AcademyOrnaments';
import { SortByControl, SortOption, sortDataItems } from '../common/SortByControl';

export const DashboardRouter: React.FC = () => {
  const {
    currentRole,
    currentUser,
    students,
    teachers,
    classes,
    assessments,
    auditLogs,
    setActiveNav,
    attendanceCorrections,
    attendanceRecords,
    lessonSchedules,
  } = useApp();

  const [sortBy, setSortBy] = React.useState<SortOption>('az');

  const sortedDashboardStudents = React.useMemo(() => {
    return sortDataItems(students, sortBy, {
      getName: s => s.name,
      getNis: s => s.nis,
      getDate: s => s.enrollmentDate || '2025-07-14',
    });
  }, [students, sortBy]);

  // Super Admin Dashboard (Matches Reference Image 1:1)
  if (currentRole === 'super_admin') {
    return (
      <div className="space-y-6">
        {/* Royal Academy Scenic Castle Banner */}
        <AcademyHeroBanner
          kicker="PUSAT KENDALI SISTEM & MANAJEMEN"
          title={`SELAMAT DATANG, ${currentUser.displayName.toUpperCase()}`}
          subtitle="Arsitektur Sistem & Pusat Komando Sekolah. Mengawasi integritas data akademik, kehadiran siswa, aturan keamanan multi-peran, dan jejak audit sistem secara real-time."
          icon={BookOpen}
        />

        {/* 4 Ornate KPI Cards with Character Medallions & Stat Bars */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Siswa (Cadets) */}
          <OrnateCard className="p-5 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <Gem className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span>Total Siswa (Cadets)</span>
                </span>
                <p
                  className="mt-2.5 text-3xl font-black text-slate-900 dark:text-white leading-none"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  {students.length}
                </p>
              </div>
              <CharacterMedallion variant="cadet" />
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>Roster Vitality</span>
                <span>100% Aktif</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-full" />
              </div>
            </div>
          </OrnateCard>

          {/* Card 2: Guru & Tenaga Pendidik */}
          <OrnateCard className="p-5 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <Crown className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Guru &amp; Tenaga Pendidik</span>
                </span>
                <p
                  className="mt-2.5 text-3xl font-black text-slate-900 dark:text-white leading-none"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  {teachers.length}
                </p>
              </div>
              <CharacterMedallion variant="scholar" />
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-teal-600 dark:text-teal-400">
                <span>Scholar Mastery</span>
                <span>5 Jurusan</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-teal-500 w-[92%]" />
              </div>
            </div>
          </OrnateCard>

          {/* Card 3: Rombel & Guild Classes */}
          <OrnateCard className="p-5 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <Castle className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  <span>Rombel &amp; Guild Classes</span>
                </span>
                <p
                  className="mt-2.5 text-3xl font-black text-slate-900 dark:text-white leading-none"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  {classes.length}
                </p>
              </div>
              <CharacterMedallion variant="guild" />
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
                <span>Tier X, XI, XII</span>
                <span>Aktif</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 w-[88%]" />
              </div>
            </div>
          </OrnateCard>

          {/* Card 4: Keamanan & Audit Log */}
          <OrnateCard className="p-5 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Keamanan &amp; Audit Log</span>
                </span>
                <p
                  className="mt-2.5 text-3xl font-black text-slate-900 dark:text-white leading-none"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  {auditLogs.length}
                </p>
              </div>
              <CharacterMedallion variant="aegis" />
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <span>Encrypted &amp; Live</span>
                <span>Active Shield</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 w-full" />
              </div>
            </div>
          </OrnateCard>
        </div>

        {/* Rearranged Symmetrical 2-Column Section (Akses Cepat Removed as Requested) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Direktori Siswa & Status Presensi Terkini (Sortable A-Z, Z-A, Tanggal, NIS) */}
          <OrnateCard className="lg:col-span-7 p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#EFE2BE]/70 pb-3.5 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h2
                      className="font-bold text-slate-900 dark:text-white text-sm sm:text-base"
                      style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                    >
                      Direktori Siswa &amp; Sinkronisasi Presensi Real-Time
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Data siswa terhubung langsung dengan rekap presensi database
                    </p>
                  </div>
                </div>
                <SortByControl value={sortBy} onChange={setSortBy} compact />
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#EFE2BE] text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                      <th className="py-2 pr-2">Nama Siswa</th>
                      <th className="py-2 px-2">NIS</th>
                      <th className="py-2 px-2">Kelas</th>
                      <th className="py-2 px-2 text-center">H / S / I / A</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {sortedDashboardStudents.slice(0, 6).map(std => {
                      const recs = attendanceRecords.filter(r => r.studentId === std.id);
                      const h = recs.filter(r => r.status === 'H').length;
                      const s = recs.filter(r => r.status === 'S').length;
                      const i = recs.filter(r => r.status === 'I').length;
                      const a = recs.filter(r => r.status === 'A').length;
                      return (
                        <tr key={std.id} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 pr-2 font-bold text-slate-900 dark:text-white">{std.name}</td>
                          <td className="py-2.5 px-2 font-mono text-[11px] text-slate-500">{std.nis}</td>
                          <td className="py-2.5 px-2">
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                              {std.className}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px]">
                            <span className="font-bold text-emerald-600">{h}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span className="font-bold text-blue-600">{s}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span className="font-bold text-amber-600">{i}</span>
                            <span className="mx-1 text-slate-300">/</span>
                            <span className="font-bold text-rose-600">{a}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Tersinkronisasi dengan Cloud Firestore ({students.length} Siswa)</span>
              </div>
              <GoldCompassRose className="h-8 w-8 opacity-90" />
            </div>
          </OrnateCard>

          {/* Right 5 Columns: Aktivitas Sistem & Audit Trail Real-Time */}
          <OrnateCard className="lg:col-span-5 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#EFE2BE]/70 pb-3.5 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2
                    className="font-bold text-slate-900 dark:text-white text-sm sm:text-base"
                    style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                  >
                    Aktivitas Sistem &amp; Audit Trail
                  </h2>
                </div>
                <button
                  onClick={() => setActiveNav('audit-logs')}
                  className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                >
                  <span>Semua Log</span>
                  <span>&rarr;</span>
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {auditLogs.slice(0, 4).map(log => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-[#EFE2BE] bg-[#FCFBF7] p-3 dark:border-slate-800 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {log.action}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {log.userName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 pl-5 line-clamp-1">
                      {log.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </OrnateCard>
        </div>
      </div>
    );
  }

  // Admin / Tata Usaha Dashboard
  if (currentRole === 'admin') {
    return (
      <div className="space-y-6">
        <AcademyHeroBanner
          kicker="ARSIP & ROMBEL TATA USAHA"
          title={`SELAMAT DATANG, ${currentUser.displayName.toUpperCase()}`}
          subtitle="Pusat pengelolaan arsip master kesiswaan, kepegawaian instruktur guru, rombongan belajar vokasi, dan administrasi sekolah."
          icon={Scroll}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Gem className="h-3.5 w-3.5 text-blue-500" /> Siswa Aktif (Cadets)
                </span>
                <p
                  className="mt-2.5 text-3xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  {students.length}
                </p>
              </div>
              <CharacterMedallion variant="cadet" />
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
                <span>Terdaftar Lengkap</span>
                <span>100%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 w-full" />
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-emerald-500" /> Guru &amp; Pegawai
                </span>
                <p
                  className="mt-2.5 text-3xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  {teachers.length}
                </p>
              </div>
              <CharacterMedallion variant="scholar" />
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>NIP &amp; SK Valid</span>
                <span>Tercatat</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-full" />
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Castle className="h-3.5 w-3.5 text-purple-500" /> Rombel (Guilds)
                </span>
                <p
                  className="mt-2.5 text-3xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  {classes.length}
                </p>
              </div>
              <CharacterMedallion variant="guild" />
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
                <span>Wali Kelas Terisi</span>
                <span>Lengkap</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 w-full" />
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-amber-500" /> Kapasitas Rombel
                </span>
                <p
                  className="mt-2.5 text-3xl font-black text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  88%
                </p>
              </div>
              <CharacterMedallion variant="aegis" />
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <span>Rata-rata 32 Siswa</span>
                <span>Optimal</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 w-[88%]" />
              </div>
            </div>
          </OrnateCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrnateCard className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-[#EFE2BE]/70 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[#EAB308]">✦</span>
                <h2
                  className="text-base font-bold text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  Data Pokok Siswa Terdaftar
                </h2>
              </div>
              <SortByControl value={sortBy} onChange={setSortBy} compact />
            </div>
            <div className="space-y-2">
              {sortedDashboardStudents.slice(0, 5).map(std => (
                <div
                  key={std.id}
                  className="flex items-center justify-between rounded-xl border border-[#EFE2BE] bg-[#FCFBF7] px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{std.name}</p>
                    <p className="text-[11px] text-slate-500">NIS: {std.nis} &bull; {std.major}</p>
                  </div>
                  <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[10px] font-extrabold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {std.className}
                  </span>
                </div>
              ))}
            </div>
          </OrnateCard>

          <OrnateCard className="p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[#EFE2BE]/70 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-emerald-600" />
                <h2
                  className="text-base font-bold text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  Jadwal Pelajaran Aktif (Data Pokok)
                </h2>
              </div>
              <GoldCompassRose className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              {lessonSchedules.slice(0, 5).map(sch => (
                <div
                  key={sch.id}
                  className="flex items-center justify-between rounded-xl border border-[#EFE2BE] bg-[#FCFBF7] px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{sch.subjectName}</p>
                    <p className="text-[11px] text-slate-500">
                      {sch.day}, {sch.startTime} - {sch.endTime} &bull; {sch.teacherName}
                    </p>
                  </div>
                  <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {sch.className}
                  </span>
                </div>
              ))}
            </div>
          </OrnateCard>
        </div>
      </div>
    );
  }

  // Guru Mata Pelajaran Dashboard (Akses Cepat Removed, Layout Rearranged)
  if (currentRole === 'guru') {
    return (
      <div className="space-y-6">
        <AcademyHeroBanner
          kicker="PORTAL PEMBELAJARAN GURU MATA PELAJARAN"
          title={`SELAMAT MENGAJAR, ${currentUser.displayName.toUpperCase()}`}
          subtitle="Mata Pelajaran: Pemrograman Web & Perangkat Bergerak dan Basis Data. Pantau kehadiran jam pelajaran dan kelola penilaian kompetensi siswa secara akurat."
          icon={GraduationCap}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrnateCard className="p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-[#EFE2BE]/70 pb-3 dark:border-slate-800">
              <Castle className="h-4 w-4 text-emerald-600" />
              <h2
                className="font-bold text-sm text-slate-900 dark:text-white"
                style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
              >
                Kelas Yang Diampu Semester Ini
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#EFE2BE] bg-[#FCFBF7] dark:border-slate-800 dark:bg-slate-800/50">
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">X RPL 1</span>
                  <p className="text-[11px] text-slate-500">Pemrograman Web &amp; Perangkat Bergerak (32 Siswa)</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Jadwal: Senin, 07.30 - 10.00 WIB</p>
                </div>
                <button
                  onClick={() => setActiveNav('attendance')}
                  className="rounded-xl bg-[#2563EB] px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Presensi
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#EFE2BE] bg-[#FCFBF7] dark:border-slate-800 dark:bg-slate-800/50">
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">X RPL 2</span>
                  <p className="text-[11px] text-slate-500">Pemrograman Web &amp; Perangkat Bergerak (30 Siswa)</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Jadwal: Selasa, 10.15 - 12.30 WIB</p>
                </div>
                <button
                  onClick={() => setActiveNav('attendance')}
                  className="rounded-xl bg-[#2563EB] px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Presensi
                </button>
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[#EFE2BE]/70 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <h2
                  className="font-bold text-sm text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
                >
                  Komponen Penilaian Terbaru
                </h2>
              </div>
              <button onClick={() => setActiveNav('grading')} className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                Kelola Semua &rarr;
              </button>
            </div>
            <div className="space-y-2.5">
              {assessments.slice(0, 4).map(asm => (
                <div key={asm.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FCFBF7] dark:bg-slate-800/50 text-xs border border-[#EFE2BE] dark:border-slate-800">
                  <div className="truncate mr-2">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{asm.title}</p>
                    <p className="text-[10px] text-slate-500">{asm.className} &bull; Bobot: {asm.weight}% &bull; KKM: {asm.kkm}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    asm.status === 'dipublikasikan'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {asm.status}
                  </span>
                </div>
              ))}
            </div>
          </OrnateCard>
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
        <AcademyHeroBanner
          kicker="MANAJEMEN PEMBINAAN KELAS X RPL 1"
          title={`SELAMAT PAGI, ${currentUser.displayName.toUpperCase()}`}
          subtitle="Memantau perkembangan akademis, karakter siswa, ketidakhadiran, dan verifikasi permohonan koreksi absensi siswa kelas binaan X RPL 1."
          icon={ShieldCheck}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Gem className="h-3.5 w-3.5 text-blue-500" /> Siswa Binaan
                </span>
                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {homeroomStudents.length}
                </p>
              </div>
              <CharacterMedallion variant="cadet" />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
                <span>Rombel X RPL 1</span>
                <span>Active</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 w-full" />
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Hourglass className="h-3.5 w-3.5 text-emerald-500" /> Kehadiran Kelas
                </span>
                <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  91.7%
                </p>
              </div>
              <CharacterMedallion variant="scholar" />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>10 Hadir, 1 Sakit, 1 Izin</span>
                <span>Tier A</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-[91.7%]" />
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-500" /> Koreksi Presensi
                </span>
                <p className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {pendingCorrections.length}
                </p>
              </div>
              <CharacterMedallion variant="guild" />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <span>Menunggu Verifikasi</span>
                <span>Pending</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 w-full" />
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> Perhatian Khusus
                </span>
                <p className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  1
                </p>
              </div>
              <CharacterMedallion variant="aegis" />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-rose-600 dark:text-rose-400">
                <span>Bagus Dwi S. (Remedial)</span>
                <span>Tutor Sebaya</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-rose-500 w-[60%]" />
              </div>
            </div>
          </OrnateCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrnateCard className="p-6">
            <div className="flex items-center justify-between mb-3 border-b border-[#EFE2BE]/70 pb-3 dark:border-slate-800">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                <AlertCircle className="h-4 w-4 text-amber-500" /> Siswa Memerlukan Perhatian Khusus
              </h2>
              <span className="text-[11px] text-slate-400">Semester Ganjil</span>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-[#EFE2BE] dark:bg-amber-950/30 dark:border-amber-900/40">
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
          </OrnateCard>

          <OrnateCard className="p-6">
            <div className="flex items-center justify-between mb-3 border-b border-[#EFE2BE]/70 pb-3 dark:border-slate-800">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
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
                  <div key={c.id} className="p-3.5 rounded-xl bg-[#FCFBF7] border border-[#EFE2BE] dark:bg-slate-800/60 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{c.studentName}</span>
                      <span className="font-semibold text-amber-600">Status: {c.currentStatus} &rarr; {c.requestedStatus}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Alasan: {c.reason}</p>
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setActiveNav('attendance')}
                        className="rounded-xl bg-[#2563EB] px-3.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                      >
                        Buka &amp; Verifikasi
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </OrnateCard>
        </div>
      </div>
    );
  }

  // Kepala Sekolah Dashboard
  if (currentRole === 'kepala_sekolah') {
    return (
      <div className="space-y-6">
        <AcademyHeroBanner
          kicker="PUSAT PENGAWASAN MANAJERIAL & MUTU"
          title={`SELAMAT DATANG, ${currentUser.displayName.toUpperCase()}`}
          subtitle="Ringkasan komprehensif tingkat kehadiran sekolah, rata-rata kompetensi per jurusan, kelengkapan administrasi guru, dan statistik pembelajaran vokasi."
          icon={Trophy}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Hourglass className="h-3.5 w-3.5 text-emerald-500" /> Kehadiran Sekolah
                </span>
                <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  94.8%
                </p>
              </div>
              <CharacterMedallion variant="cadet" />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span>+1.4% Bulan Lalu</span>
                <span>Target Terpenuhi</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-[94.8%]" />
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Swords className="h-3.5 w-3.5 text-blue-500" /> Rata-Rata Akademik
                </span>
                <p className="mt-2 text-3xl font-black text-blue-600 dark:text-blue-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  86.2
                </p>
              </div>
              <CharacterMedallion variant="scholar" />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
                <span>Predikat: B+ (Sangat Baik)</span>
                <span>86.2 Poin</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 w-[86.2%]" />
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Scroll className="h-3.5 w-3.5 text-purple-500" /> Penilaian Guru
                </span>
                <p className="mt-2 text-3xl font-black text-purple-600 dark:text-purple-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  92%
                </p>
              </div>
              <CharacterMedallion variant="guild" />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-purple-600 dark:text-purple-400">
                <span>Tuntas Mid Semester</span>
                <span>92%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 w-[92%]" />
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" /> Siswa Bebas Alpa
                </span>
                <p className="mt-2 text-3xl font-black text-amber-500" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  97.5%
                </p>
              </div>
              <CharacterMedallion variant="aegis" />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <span>Kedisiplinan Tertinggi</span>
                <span>97.5%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 w-[97.5%]" />
              </div>
            </div>
          </OrnateCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <OrnateCard className="lg:col-span-2 p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-[#EFE2BE]/70 pb-3 dark:border-slate-800">
              <Target className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
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
          </OrnateCard>

          <OrnateCard className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 border-b border-[#EFE2BE]/70 pb-3 dark:border-slate-800">
                <span className="text-[#EAB308]">✦</span>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Laporan Manajerial Eksekutif
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4 mt-3 leading-relaxed">
                Unduh rekapitulasi data akademik &amp; kehadiran resmi untuk pelaporan Yayasan dan Cabang Dinas Pendidikan.
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveNav('reports')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FCFBF7] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-extrabold text-xs hover:bg-blue-50 transition-colors cursor-pointer border border-[#EFE2BE] dark:border-blue-800"
                >
                  <span className="flex items-center gap-2">
                    <Scroll className="h-4 w-4" /> Laporan Eksekutif PDF
                  </span>
                  <span>&darr;</span>
                </button>

                <button
                  onClick={() => setActiveNav('reports')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#FCFBF7] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-xs hover:bg-emerald-50 transition-colors cursor-pointer border border-[#EFE2BE] dark:border-emerald-800"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Rekap Sekolah Excel (XLSX)
                  </span>
                  <span>&darr;</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EFE2BE]/70 dark:border-slate-800 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-400">MyAcademy &bull; Terakreditasi A</p>
              <GoldCompassRose className="h-9 w-9" />
            </div>
          </OrnateCard>
        </div>
      </div>
    );
  }

  // Siswa Dashboard - Hanya Profil Siswa & Nilai Siswa
  return <StudentModule initialTab="profile" />;
};
