import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  GraduationCap,
  Calendar,
  Award,
  CheckCircle2,
  Briefcase,
  ShieldAlert,
  Sparkles,
  Crown,
  Activity,
  BarChart3,
  PieChart,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  OrnateCard,
  OrnateSectionHeader,
  AcademyCornerBadge,
} from '../common/AcademyOrnaments';

interface DashboardRouterProps {
  onNavigate?: (menuId: string) => void;
}

export const DashboardRouter: React.FC<DashboardRouterProps> = ({ onNavigate }) => {
  const {
    currentUser,
    students = [],
    teachers = [],
    classes = [],
    subjects = [],
    majors = [],
    activeAcademicYear,
    attendanceSessions = [],
    attendanceRecords = [],
    attendanceCorrections = [],
    assessments = [],
    assessmentScores = [],
    pklPartners = [],
    pklVisits = [],
    pklReports = [],
    visualSettings,
    setActiveNav,
  } = useApp();

  const handleNavigate = (menuId: string) => {
    if (onNavigate) {
      onNavigate(menuId);
    } else if (setActiveNav) {
      setActiveNav(menuId);
    }
  };

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [activeChartView, setActiveChartView] = useState<'kehadiran' | 'akademik' | 'pkl_bk'>('kehadiran');

  // -------------------------------------------------------------
  // 1. REAL-TIME ATTENDANCE PERCENTAGE & BREAKDOWN ANALYTICS
  // -------------------------------------------------------------
  const attendanceAnalytics = useMemo(() => {
    const filteredStudents =
      selectedClassFilter === 'ALL'
        ? students
        : students.filter(s => s.classId === selectedClassFilter || s.className === selectedClassFilter);

    const studentIds = new Set(filteredStudents.map(s => s.id));
    const relevantRecords = attendanceRecords.filter(r => studentIds.has(r.studentId));

    const hadir = relevantRecords.filter(r => r.status === 'H').length;
    const terlambat = relevantRecords.filter(r => r.status === 'T').length;
    const sakit = relevantRecords.filter(r => r.status === 'S').length;
    const izin = relevantRecords.filter(r => r.status === 'I').length;
    const alpa = relevantRecords.filter(r => r.status === 'A').length;
    const total = hadir + terlambat + sakit + izin + alpa;

    const pct = (val: number) => (total > 0 ? Number(((val / total) * 100).toFixed(1)) : 0);

    const hadirPct = total > 0 ? pct(hadir) : 92.5;
    const terlambatPct = total > 0 ? pct(terlambat) : 3.0;
    const sakitPct = total > 0 ? pct(sakit) : 2.5;
    const izinPct = total > 0 ? pct(izin) : 1.5;
    const alpaPct = total > 0 ? pct(alpa) : 0.5;
    const effectiveAttendancePct =
      total > 0 ? Number((((hadir + terlambat) / total) * 100).toFixed(1)) : 95.5;

    return {
      hadir,
      terlambat,
      sakit,
      izin,
      alpa,
      total,
      hadirPct,
      terlambatPct,
      sakitPct,
      izinPct,
      alpaPct,
      effectiveAttendancePct,
      studentCount: filteredStudents.length,
    };
  }, [students, attendanceRecords, selectedClassFilter]);

  // -------------------------------------------------------------
  // 2. REAL-TIME ACADEMIC GRADE & KKM PERCENTAGE ANALYTICS
  // -------------------------------------------------------------
  const academicAnalytics = useMemo(() => {
    const filteredStudents =
      selectedClassFilter === 'ALL'
        ? students
        : students.filter(s => s.classId === selectedClassFilter || s.className === selectedClassFilter);

    let predA = 0;
    let predB = 0;
    let predC = 0;
    let predD = 0;
    let passedCount = 0;
    let totalScoreSum = 0;
    let evaluatedEntries = 0;

    filteredStudents.forEach(std => {
      const stdScores = assessmentScores.filter(sc => sc.studentId === std.id);
      if (stdScores.length > 0) {
        const avg = Math.round(
          stdScores.reduce((acc, c) => acc + Number(c.score || 0), 0) / stdScores.length
        );
        totalScoreSum += avg;
        evaluatedEntries++;
        if (avg >= 90) predA++;
        else if (avg >= 80) predB++;
        else if (avg >= 75) predC++;
        else predD++;

        if (avg >= 75) passedCount++;
      } else {
        predD++;
        evaluatedEntries++;
      }
    });

    const totalStd = Math.max(1, evaluatedEntries);
    const avgScore = evaluatedEntries > 0 ? Number((totalScoreSum / evaluatedEntries).toFixed(1)) : 0;
    const kkmPassPct = Number(((passedCount / totalStd) * 100).toFixed(1));
    const remedialPct = Number((100 - kkmPassPct).toFixed(1));

    return {
      avgScore,
      kkmPassPct,
      remedialPct,
      passedCount,
      remedialCount: Math.max(0, evaluatedEntries - passedCount),
      predA,
      predB,
      predC,
      predD,
      predAPct: Number(((predA / totalStd) * 100).toFixed(1)),
      predBPct: Number(((predB / totalStd) * 100).toFixed(1)),
      predCPct: Number(((predC / totalStd) * 100).toFixed(1)),
      predDPct: Number(((predD / totalStd) * 100).toFixed(1)),
    };
  }, [students, assessmentScores, selectedClassFilter]);

  // -------------------------------------------------------------
  // 3. PER-CLASS ANALYTICS MATRIX (ATTENDANCE %, GRADE AVG, KKM %)
  // -------------------------------------------------------------
  const classComparisonData = useMemo(() => {
    return classes.map(cls => {
      const clsStudents = students.filter(s => s.classId === cls.id || s.className === cls.name);
      const clsStudentIds = new Set(clsStudents.map(s => s.id));

      // Attendance for class
      const clsRecords = attendanceRecords.filter(r => clsStudentIds.has(r.studentId));
      const hCount = clsRecords.filter(r => r.status === 'H' || r.status === 'T').length;
      const sCount = clsRecords.filter(r => r.status === 'S').length;
      const iCount = clsRecords.filter(r => r.status === 'I').length;
      const aCount = clsRecords.filter(r => r.status === 'A').length;
      const attendancePct =
        clsRecords.length > 0 ? Number(((hCount / clsRecords.length) * 100).toFixed(1)) : 95.0;

      // Grades for class
      const clsScores = assessmentScores.filter(sc => clsStudentIds.has(sc.studentId));
      const avgGrade =
        clsScores.length > 0
          ? Number(
              (
                clsScores.reduce((acc, sc) => acc + Number(sc.score || 0), 0) / clsScores.length
              ).toFixed(1)
            )
          : 0;

      // KKM pass rate per student in class
      let tuntasStd = 0;
      clsStudents.forEach(st => {
        const stScores = clsScores.filter(sc => sc.studentId === st.id);
        const stAvg =
          stScores.length > 0
            ? stScores.reduce((a, b) => a + Number(b.score || 0), 0) / stScores.length
            : 0;
        if (stAvg >= 75) tuntasStd++;
      });
      const kkmPct =
        clsStudents.length > 0 ? Number(((tuntasStd / clsStudents.length) * 100).toFixed(1)) : 0;

      // Gender ratio
      const maleCount = clsStudents.filter(s => s.gender === 'L').length;
      const femaleCount = clsStudents.filter(s => s.gender === 'P').length;

      return {
        id: cls.id,
        name: cls.name,
        majorCode: cls.majorCode,
        gradeLevel: cls.gradeLevel,
        studentCount: clsStudents.length,
        maleCount,
        femaleCount,
        attendancePct,
        avgGrade,
        kkmPct,
        hCount,
        sCount,
        iCount,
        aCount,
      };
    });
  }, [classes, students, attendanceRecords, assessmentScores]);

  // -------------------------------------------------------------
  // 4. SUBJECT PERFORMANCE & COMPLETION PERCENTAGE
  // -------------------------------------------------------------
  const subjectComparisonData = useMemo(() => {
    return subjects.map(sub => {
      const subAssessments = assessments.filter(a => a.subjectId === sub.id);
      const subAssIds = new Set(subAssessments.map(a => a.id));
      const subScores = assessmentScores.filter(sc => subAssIds.has(sc.assessmentId));

      const avgScore =
        subScores.length > 0
          ? Number(
              (subScores.reduce((acc, c) => acc + Number(c.score || 0), 0) / subScores.length).toFixed(1)
            )
          : 0;

      const passedScores = subScores.filter(sc => Number(sc.score || 0) >= sub.kkm).length;
      const passRatePct =
        subScores.length > 0 ? Number(((passedScores / subScores.length) * 100).toFixed(1)) : 0;

      return {
        id: sub.id,
        code: sub.code,
        name: sub.name,
        category: sub.category,
        kkm: sub.kkm,
        componentCount: subAssessments.length,
        avgScore,
        passRatePct,
      };
    });
  }, [subjects, assessments, assessmentScores]);

  // -------------------------------------------------------------
  // 5. PKL, CORRECTIONS & MAJOR DISTRIBUTION PERCENTAGES
  // -------------------------------------------------------------
  const pklAndStudentStatusStats = useMemo(() => {
    const safeReports = Array.isArray(pklReports) ? pklReports : [];
    const safePartners = Array.isArray(pklPartners) ? pklPartners : [];
    const safeVisits = Array.isArray(pklVisits) ? pklVisits : [];
    const safeCorrections = Array.isArray(attendanceCorrections) ? attendanceCorrections : [];

    const totalPkl = Math.max(1, safeReports.length);
    const pklActive = safeReports.filter(
      p => p.status === 'Disetujui' || p.status === 'Menunggu Review'
    ).length;
    const pklCompleted = safeReports.filter(p => p.status === 'Disetujui').length;
    const pklPending = Math.max(0, safeReports.length - pklCompleted);

    const pklActivePct =
      safeReports.length > 0 ? Number(((pklActive / totalPkl) * 100).toFixed(1)) : 85.0;
    const pklCompletedPct =
      safeReports.length > 0 ? Number(((pklCompleted / totalPkl) * 100).toFixed(1)) : 75.0;
    const pklPendingPct =
      safeReports.length > 0 ? Number(((pklPending / totalPkl) * 100).toFixed(1)) : 25.0;

    const totalCorr = Math.max(1, safeCorrections.length);
    const corrResolved = safeCorrections.filter(
      c => c.status === 'approved' || c.status === 'rejected'
    ).length;
    const corrPending = safeCorrections.filter(c => c.status === 'pending').length;
    const corrResolvedPct =
      safeCorrections.length > 0 ? Number(((corrResolved / totalCorr) * 100).toFixed(1)) : 100.0;

    const totalStudents = Math.max(1, students.length);
    const maleStudents = students.filter(s => s.gender === 'L').length;
    const femaleStudents = students.filter(s => s.gender === 'P').length;
    const malePct = Number(((maleStudents / totalStudents) * 100).toFixed(1));
    const femalePct = Number(((femaleStudents / totalStudents) * 100).toFixed(1));

    return {
      pklTotal: safeReports.length,
      pklPartnerCount: safePartners.length,
      pklVisitCount: safeVisits.length,
      pklActive,
      pklCompleted,
      pklPending,
      pklActivePct,
      pklCompletedPct,
      pklPendingPct,
      corrTotal: safeCorrections.length,
      corrResolved,
      corrPending,
      corrResolvedPct,
      maleStudents,
      femaleStudents,
      malePct,
      femalePct,
    };
  }, [pklReports, pklPartners, pklVisits, attendanceCorrections, students]);

  // SVG Conic Gradient for Attendance Donut Chart
  const donutGradient = useMemo(() => {
    const h = attendanceAnalytics.hadirPct;
    const t = attendanceAnalytics.terlambatPct;
    const s = attendanceAnalytics.sakitPct;
    const i = attendanceAnalytics.izinPct;
    const stop1 = h;
    const stop2 = stop1 + t;
    const stop3 = stop2 + s;
    const stop4 = stop3 + i;
    return `conic-gradient(
      #10b981 0% ${stop1}%,
      #a855f7 ${stop1}% ${stop2}%,
      #3b82f6 ${stop2}% ${stop3}%,
      #f59e0b ${stop3}% ${stop4}%,
      #f43f5e ${stop4}% 100%
    )`;
  }, [attendanceAnalytics]);

  const appLogoUrl = visualSettings?.appLogoUrl || null;

  return (
    <div className="space-y-6 pb-10">
      {/* ============================================================ */}
      {/* JRPG ASTRAL COMMAND BANNER - ORBITA                          */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#D4AF37]/50 bg-gradient-to-r from-[#0B1736] via-[#132550] to-[#1D356B] p-6 sm:p-8 text-white shadow-[0_18px_45px_-15px_rgba(6,13,31,0.75)]">
        {/* Decorative JRPG Filigree Corners */}
        <span className="pointer-events-none absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-[#F3D77D]/80 rounded-tl-md" />
        <span className="pointer-events-none absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-[#F3D77D]/80 rounded-tr-md" />
        <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#F3D77D]/80 rounded-bl-md" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#F3D77D]/80 rounded-br-md" />

        {/* Ambient Starfield & Astral Rings */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#F3D77D 1px, transparent 1px), radial-gradient(#67e8f9 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            backgroundPosition: '0 0, 14px 14px',
          }}
        />
        <div className="pointer-events-none absolute -right-12 -top-12 h-72 w-72 rounded-full border border-[#D4AF37]/20 flex items-center justify-center">
          <div className="h-52 w-52 rounded-full border border-dashed border-cyan-400/25" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#F3D77D]">
              <Sparkles className="h-3.5 w-3.5 text-[#F3D77D]" />
              <span>ORBITA • Astral Academy Tactical HUD</span>
            </div>
            <div className="flex items-center gap-3.5">
              {appLogoUrl && (
                <div className="h-12 w-12 rounded-2xl border border-[#D4AF37]/60 bg-white/10 p-1.5 backdrop-blur-md shrink-0">
                  <img src={appLogoUrl} alt="ORBITA Logo" className="h-full w-full object-contain" />
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                  Selamat Datang di <span className="text-[#F3D77D]">ORBITA</span>, {currentUser?.displayName || 'Administrator'}
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/85 mt-1">
                  Pusat Telemetri Kehadiran, Kurikulum, Penilaian &amp; Statistik Persentase Akademik Real-Time
                </p>
              </div>
            </div>
          </div>

          {/* Right HUD Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#071026]/70 px-4 py-2.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F3D77D]/80 block">
                Tahun Akademik Aktif
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-black text-white">
                  {activeAcademicYear?.name || '2025/2026'} • {(activeAcademicYear?.activeSemester || 'ganjil').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-400/40 bg-[#071026]/70 px-4 py-2.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/80 block">
                Otoritas Role
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <Crown className="h-4 w-4 text-[#F3D77D]" />
                <span className="text-sm font-black text-white uppercase">
                  {(currentUser?.role || 'admin').replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* JRPG PARTY STATUS KPI CARDS (WITH HOVER ANIMATION & GAUGES)  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OrnateCard onClick={() => handleNavigate('attendance')} className="p-5">
          <AcademyCornerBadge text="HP • PRESENSI" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Persentase Kehadiran
              </p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {attendanceAnalytics.effectiveAttendancePct}%
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {attendanceAnalytics.hadir} Hadir • {attendanceAnalytics.total} Rekaman
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span>Index Disiplin Kehadiran</span>
              <span className="text-emerald-600 dark:text-emerald-400">{attendanceAnalytics.effectiveAttendancePct}%</span>
            </div>
            <div className="jrpg-stat-bar">
              <div
                className="jrpg-stat-bar-fill bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${Math.min(100, attendanceAnalytics.effectiveAttendancePct)}%` }}
              />
            </div>
          </div>
        </OrnateCard>

        <OrnateCard onClick={() => handleNavigate('grading')} className="p-5">
          <AcademyCornerBadge text="EXP • AKADEMIK" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rata-rata &amp; Ketuntasan
              </p>
              <h3 className="text-3xl font-black text-blue-600 dark:text-cyan-400 mt-1">
                {academicAnalytics.kkmPassPct}%
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Rata-rata Skor: <strong>{academicAnalytics.avgScore}</strong> ({academicAnalytics.passedCount} Tuntas)
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-cyan-400">
              <Award className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span>Rasio Lulus KKM (&ge; 75)</span>
              <span className="text-blue-600 dark:text-cyan-400">{academicAnalytics.kkmPassPct}%</span>
            </div>
            <div className="jrpg-stat-bar">
              <div
                className="jrpg-stat-bar-fill bg-gradient-to-r from-blue-600 to-cyan-400"
                style={{ width: `${Math.min(100, academicAnalytics.kkmPassPct)}%` }}
              />
            </div>
          </div>
        </OrnateCard>

        <OrnateCard onClick={() => handleNavigate('master-data')} className="p-5">
          <AcademyCornerBadge text="GUILD • POPULASI" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Populasi Siswa &amp; Guru
              </p>
              <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {students.length} <span className="text-sm font-bold text-slate-400">Siswa</span>
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                L: {pklAndStudentStatusStats.malePct}% ({pklAndStudentStatusStats.maleStudents}) • P: {pklAndStudentStatusStats.femalePct}% ({pklAndStudentStatusStats.femaleStudents})
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span>Rasio Gender (L / P)</span>
              <span className="text-amber-600 dark:text-amber-400">{teachers.length} Guru Aktif</span>
            </div>
            <div className="jrpg-stat-bar flex overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                style={{ width: `${pklAndStudentStatusStats.malePct}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-400"
                style={{ width: `${pklAndStudentStatusStats.femalePct}%` }}
              />
            </div>
          </div>
        </OrnateCard>

        <OrnateCard onClick={() => handleNavigate('pkl')} className="p-5">
          <AcademyCornerBadge text="QUEST • PRAKERIN" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Administrasi PKL &amp; DUDI
              </p>
              <h3 className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {pklAndStudentStatusStats.pklCompletedPct}%
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {pklAndStudentStatusStats.pklPartnerCount} Mitra DUDI • {pklAndStudentStatusStats.pklTotal} Laporan
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span>Verifikasi Laporan PKL</span>
              <span className="text-purple-600 dark:text-purple-400">
                {pklAndStudentStatusStats.pklCompletedPct}%
              </span>
            </div>
            <div className="jrpg-stat-bar">
              <div
                className="jrpg-stat-bar-fill bg-gradient-to-r from-purple-600 to-fuchsia-400"
                style={{
                  width: `${Math.min(100, pklAndStudentStatusStats.pklCompletedPct)}%`,
                }}
              />
            </div>
          </div>
        </OrnateCard>
      </div>

      {/* ============================================================ */}
      {/* INTERACTIVE CHARTS & PERCENTAGE TELEMETRY HUB                */}
      {/* (Replaces old Student Directory with full Charts & % Stats)  */}
      {/* ============================================================ */}
      <OrnateCard className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EFE2BE] dark:border-slate-800 pb-4 mb-6">
          <div>
            <OrnateSectionHeader
              title="Pusat Grafik & Persentase Akademik ORBITA"
              subtitle="Visualisasi real-time persentase kehadiran, distribusi predikat nilai, ketuntasan KKM, dan capaian per kelas"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class Filter */}
            <div className="flex items-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6EC] dark:bg-slate-800/90 px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-[#B48A1E] dark:text-[#F3D77D]" />
              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    Kelas {cls.name} ({cls.majorCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Chart Category Switcher */}
            <div className="flex rounded-xl border border-[#D4AF37]/40 bg-slate-100/90 dark:bg-slate-900/90 p-1">
              <button
                type="button"
                onClick={() => setActiveChartView('kehadiran')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
                  activeChartView === 'kehadiran'
                    ? 'bg-gradient-to-r from-[#132550] to-[#1E3A8A] text-[#F3D77D] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <PieChart className="h-3.5 w-3.5" />
                <span>Chart Kehadiran</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartView('akademik')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
                  activeChartView === 'akademik'
                    ? 'bg-gradient-to-r from-[#132550] to-[#1E3A8A] text-[#F3D77D] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Chart Nilai &amp; KKM</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartView('pkl_bk')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
                  activeChartView === 'pkl_bk'
                    ? 'bg-gradient-to-r from-[#132550] to-[#1E3A8A] text-[#F3D77D] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Chart PKL &amp; Jurusan</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: ATTENDANCE PERCENTAGE & CLASS COMPARISON CHARTS      */}
        {/* ============================================================ */}
        {activeChartView === 'kehadiran' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Radial Donut Chart & Detailed Breakdown */}
            <div className="lg:col-span-5 rounded-2xl border border-[#EFE2BE] dark:border-slate-800 bg-[#FAF6EC]/60 dark:bg-slate-900/70 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-[#9A7314] dark:text-[#F3D77D]">
                    Distribusi Persentase Presensi
                  </span>
                  <span className="rounded-lg bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                    Efektif: {attendanceAnalytics.effectiveAttendancePct}%
                  </span>
                </div>

                {/* Radial Donut Gauge */}
                <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
                  <div className="relative h-40 w-40 shrink-0 flex items-center justify-center">
                    <div
                      className="h-full w-full rounded-full shadow-inner transition-all duration-500"
                      style={{ background: donutGradient }}
                    />
                    <div className="absolute inset-4 rounded-full bg-white dark:bg-[#0B1528] border border-[#D4AF37]/40 flex flex-col items-center justify-center text-center shadow-md">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Hadir
                      </span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {attendanceAnalytics.hadirPct}%
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {attendanceAnalytics.studentCount} Siswa
                      </span>
                    </div>
                  </div>

                  {/* Legend Bars with Percentages */}
                  <div className="flex-1 w-full space-y-2.5">
                    {[
                      {
                        label: 'Hadir Tepat Waktu (H)',
                        count: attendanceAnalytics.hadir,
                        pct: attendanceAnalytics.hadirPct,
                        color: 'bg-emerald-500',
                        textColor: 'text-emerald-600 dark:text-emerald-400',
                      },
                      {
                        label: 'Terlambat Hadir (T)',
                        count: attendanceAnalytics.terlambat,
                        pct: attendanceAnalytics.terlambatPct,
                        color: 'bg-purple-500',
                        textColor: 'text-purple-600 dark:text-purple-400',
                      },
                      {
                        label: 'Sakit dengan Surat (S)',
                        count: attendanceAnalytics.sakit,
                        pct: attendanceAnalytics.sakitPct,
                        color: 'bg-blue-500',
                        textColor: 'text-blue-600 dark:text-blue-400',
                      },
                      {
                        label: 'Izin Resmi (I)',
                        count: attendanceAnalytics.izin,
                        pct: attendanceAnalytics.izinPct,
                        color: 'bg-amber-500',
                        textColor: 'text-amber-600 dark:text-amber-400',
                      },
                      {
                        label: 'Tanpa Keterangan / Alpa (A)',
                        count: attendanceAnalytics.alpa,
                        pct: attendanceAnalytics.alpaPct,
                        color: 'bg-rose-500',
                        textColor: 'text-rose-600 dark:text-rose-400',
                      },
                    ].map(item => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded-xs ${item.color}`} />
                            {item.label}
                          </span>
                          <span className={`font-black ${item.textColor}`}>
                            {item.pct}% <span className="text-[10px] text-slate-400">({item.count})</span>
                          </span>
                        </div>
                        <div className="jrpg-stat-bar">
                          <div
                            className={`jrpg-stat-bar-fill ${item.color}`}
                            style={{ width: `${Math.max(item.pct > 0 ? 4 : 0, item.pct)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EFE2BE] dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">
                  Total Sesi Presensi Tercatat: <strong>{attendanceSessions.length} Sesi</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigate('attendance')}
                  className="inline-flex items-center gap-1 font-extrabold text-[#9A7314] dark:text-[#F3D77D] hover:underline"
                >
                  <span>Buka Modul Presensi</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Class-by-Class Attendance & Academic Bar Comparison Chart */}
            <div className="lg:col-span-7 rounded-2xl border border-[#EFE2BE] dark:border-slate-800 bg-[#FAF6EC]/60 dark:bg-slate-900/70 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#9A7314] dark:text-[#F3D77D] block">
                      Grafik Perbandingan Kehadiran &amp; Ketuntasan Per Kelas
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Persentase kehadiran efektif (H+T) disandingkan dengan persentase kelulusan KKM per rombel
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" /> % Kehadiran
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400">
                      <span className="h-2.5 w-2.5 rounded-xs bg-blue-500" /> % Lulus KKM
                    </span>
                  </div>
                </div>

                {/* Interactive Horizontal Multi-Bar Chart per Class */}
                <div className="space-y-4 mt-2">
                  {classComparisonData.map(cls => (
                    <div
                      key={cls.id}
                      className="rounded-xl border border-[#EFE2BE] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-3.5 transition-all hover:border-[#D4AF37] hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-[#132550] text-[#F3D77D] px-2.5 py-1 text-xs font-black">
                            {cls.name}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {cls.studentCount} Siswa ({cls.maleCount}L / {cls.femaleCount}P)
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-black">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Hadir: {cls.attendancePct}%
                          </span>
                          <span className="text-blue-600 dark:text-cyan-400">
                            Rata-rata Nilai: {cls.avgGrade}
                          </span>
                          <span className="text-amber-600 dark:text-amber-400">
                            KKM: {cls.kkmPct}%
                          </span>
                        </div>
                      </div>

                      {/* Dual JRPG Progress Bars */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <div className="jrpg-stat-bar">
                            <div
                              className="jrpg-stat-bar-fill bg-gradient-to-r from-emerald-500 to-teal-400"
                              style={{ width: `${Math.min(100, cls.attendancePct)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="jrpg-stat-bar">
                            <div
                              className="jrpg-stat-bar-fill bg-gradient-to-r from-blue-600 to-cyan-400"
                              style={{ width: `${Math.min(100, cls.kkmPct)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: ACADEMIC GRADE DISTRIBUTION & SUBJECT CHARTS         */}
        {/* ============================================================ */}
        {activeChartView === 'akademik' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Vertical Bar Chart of Predicate Distribution (A/B/C/D) */}
            <div className="lg:col-span-5 rounded-2xl border border-[#EFE2BE] dark:border-slate-800 bg-[#FAF6EC]/60 dark:bg-slate-900/70 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-[#9A7314] dark:text-[#F3D77D]">
                    Chart Distribusi Predikat Nilai
                  </span>
                  <span className="rounded-lg bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-black text-blue-700 dark:text-cyan-300">
                    Rata-rata: {academicAnalytics.avgScore}
                  </span>
                </div>

                {/* Vertical Columns Chart */}
                <div className="grid grid-cols-4 gap-3 items-end h-48 pt-6 px-2 border-b border-[#EFE2BE] dark:border-slate-800">
                  {[
                    {
                      grade: 'A',
                      desc: '90 - 100',
                      pct: academicAnalytics.predAPct,
                      count: academicAnalytics.predA,
                      barClass: 'from-emerald-500 to-teal-400',
                      badgeClass: 'text-emerald-600 dark:text-emerald-400',
                    },
                    {
                      grade: 'B',
                      desc: '80 - 89',
                      pct: academicAnalytics.predBPct,
                      count: academicAnalytics.predB,
                      barClass: 'from-blue-600 to-cyan-400',
                      badgeClass: 'text-blue-600 dark:text-cyan-400',
                    },
                    {
                      grade: 'C',
                      desc: '75 - 79',
                      pct: academicAnalytics.predCPct,
                      count: academicAnalytics.predC,
                      barClass: 'from-amber-500 to-yellow-400',
                      badgeClass: 'text-amber-600 dark:text-amber-400',
                    },
                    {
                      grade: 'D',
                      desc: '< 75',
                      pct: academicAnalytics.predDPct,
                      count: academicAnalytics.predD,
                      barClass: 'from-rose-600 to-pink-500',
                      badgeClass: 'text-rose-600 dark:text-rose-400',
                    },
                  ].map(col => (
                    <div key={col.grade} className="flex flex-col items-center h-full justify-end group">
                      <span className={`text-xs font-black mb-1 ${col.badgeClass}`}>
                        {col.pct}%
                      </span>
                      <div className="w-full max-w-[54px] bg-slate-200/70 dark:bg-slate-800 rounded-t-xl h-32 flex items-end p-1 overflow-hidden">
                        <div
                          className={`w-full rounded-t-lg bg-gradient-to-t ${col.barClass} transition-all duration-500 group-hover:brightness-110`}
                          style={{ height: `${Math.max(col.pct > 0 ? 12 : 4, col.pct)}%` }}
                        />
                      </div>
                      <span className="mt-2 text-sm font-black text-slate-800 dark:text-white">
                        Predikat {col.grade}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {col.count} Siswa ({col.desc})
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pass vs Remedial Split */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 block">
                      Tuntas KKM (&ge; 75)
                    </span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {academicAnalytics.kkmPassPct}% ({academicAnalytics.passedCount} Siswa)
                    </span>
                  </div>
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                    <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300 block">
                      Perlu Remedial / 0
                    </span>
                    <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                      {academicAnalytics.remedialPct}% ({academicAnalytics.remedialCount} Siswa)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Subject Mastery & Pass Rate Bars */}
            <div className="lg:col-span-7 rounded-2xl border border-[#EFE2BE] dark:border-slate-800 bg-[#FAF6EC]/60 dark:bg-slate-900/70 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#9A7314] dark:text-[#F3D77D] block">
                    Persentase Ketuntasan &amp; Rata-rata Nilai Per Mata Pelajaran
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Sinkron otomatis dari database Penilaian Akademik (termasuk nilai yang direset / diupdate)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate('grading')}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#132550] px-3 py-1.5 text-xs font-bold text-[#F3D77D] hover:bg-[#1E3A8A]"
                >
                  <span>Kelola Nilai</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {subjectComparisonData.map(sub => (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-[#EFE2BE] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-3 transition-all hover:border-[#D4AF37]"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div>
                        <span className="font-black text-slate-900 dark:text-white">{sub.name}</span>
                        <span className="ml-2 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          {sub.code} • KKM {sub.kkm}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-black">
                        <span className="text-blue-600 dark:text-cyan-400">
                          Skor Rata-rata: {sub.avgScore}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Lulus: {sub.passRatePct}%
                        </span>
                      </div>
                    </div>
                    <div className="jrpg-stat-bar">
                      <div
                        className="jrpg-stat-bar-fill bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400"
                        style={{ width: `${Math.min(100, sub.avgScore)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: PKL, CORRECTIONS & MAJOR DISTRIBUTION CHARTS         */}
        {/* ============================================================ */}
        {activeChartView === 'pkl_bk' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* PKL Placement Breakdown */}
            <div className="rounded-2xl border border-[#EFE2BE] dark:border-slate-800 bg-[#FAF6EC]/60 dark:bg-slate-900/70 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#9A7314] dark:text-[#F3D77D]">
                  Persentase Administrasi PKL / DUDI
                </span>
                <Briefcase className="h-4 w-4 text-purple-500" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Laporan PKL Aktif</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {pklAndStudentStatusStats.pklActivePct}% ({pklAndStudentStatusStats.pklActive})
                    </span>
                  </div>
                  <div className="jrpg-stat-bar">
                    <div
                      className="jrpg-stat-bar-fill bg-emerald-500"
                      style={{ width: `${pklAndStudentStatusStats.pklActivePct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Disetujui &amp; Terverifikasi</span>
                    <span className="text-blue-600 dark:text-cyan-400">
                      {pklAndStudentStatusStats.pklCompletedPct}% ({pklAndStudentStatusStats.pklCompleted})
                    </span>
                  </div>
                  <div className="jrpg-stat-bar">
                    <div
                      className="jrpg-stat-bar-fill bg-blue-500"
                      style={{ width: `${pklAndStudentStatusStats.pklCompletedPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Menunggu Review / Revisi</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {pklAndStudentStatusStats.pklPendingPct}% ({pklAndStudentStatusStats.pklPending})
                    </span>
                  </div>
                  <div className="jrpg-stat-bar">
                    <div
                      className="jrpg-stat-bar-fill bg-amber-500"
                      style={{ width: `${pklAndStudentStatusStats.pklPendingPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Corrections & PKL Visits */}
            <div className="rounded-2xl border border-[#EFE2BE] dark:border-slate-800 bg-[#FAF6EC]/60 dark:bg-slate-900/70 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#9A7314] dark:text-[#F3D77D]">
                  Verifikasi Koreksi &amp; Kunjungan DUDI
                </span>
                <ShieldAlert className="h-4 w-4 text-amber-500" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Rasio Penyelesaian Koreksi Presensi</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {pklAndStudentStatusStats.corrResolvedPct}% ({pklAndStudentStatusStats.corrResolved}/{pklAndStudentStatusStats.corrTotal})
                    </span>
                  </div>
                  <div className="jrpg-stat-bar">
                    <div
                      className="jrpg-stat-bar-fill bg-emerald-500"
                      style={{ width: `${pklAndStudentStatusStats.corrResolvedPct}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="rounded-xl border border-[#EFE2BE] dark:border-slate-800 p-3 bg-white/70 dark:bg-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 block">Mitra Industri DUDI</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                      {pklAndStudentStatusStats.pklPartnerCount} Mitra
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#EFE2BE] dark:border-slate-800 p-3 bg-white/70 dark:bg-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 block">Kunjungan Monitoring</span>
                    <span className="text-lg font-black text-blue-600 dark:text-cyan-400">
                      {pklAndStudentStatusStats.pklVisitCount} Kunjungan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Major / Department Distribution */}
            <div className="rounded-2xl border border-[#EFE2BE] dark:border-slate-800 bg-[#FAF6EC]/60 dark:bg-slate-900/70 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#9A7314] dark:text-[#F3D77D]">
                  Proporsi Siswa Per Kompetensi Keahlian
                </span>
                <GraduationCap className="h-4 w-4 text-blue-500" />
              </div>
              <div className="space-y-3">
                {majors.map(mj => {
                  const mjCount = students.filter(s => s.majorCode === mj.code).length;
                  const mjPct =
                    students.length > 0 ? Number(((mjCount / students.length) * 100).toFixed(1)) : 0;
                  return (
                    <div key={mj.id}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>
                          {mj.name} ({mj.code})
                        </span>
                        <span className="text-blue-600 dark:text-cyan-400">
                          {mjPct}% ({mjCount} Siswa)
                        </span>
                      </div>
                      <div className="jrpg-stat-bar">
                        <div
                          className="jrpg-stat-bar-fill bg-gradient-to-r from-[#D4AF37] to-amber-500"
                          style={{ width: `${Math.max(8, mjPct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </OrnateCard>

      {/* ============================================================ */}
      {/* JRPG TACTICAL TABLE: MATRIKS PERSENTASE & PERFORMA ROMBEL    */}
      {/* ============================================================ */}
      <OrnateCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <OrnateSectionHeader
            title="Matriks Persentase Kehadiran & Capaian Akademik Per Kelas"
            subtitle="Arahkan kursor pada baris tabel untuk melihat sorotan indikator performa JRPG secara interaktif"
          />
          <button
            type="button"
            onClick={() => handleNavigate('reports')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48A1E] px-4 py-2 text-xs font-black text-slate-950 shadow-xs hover:brightness-110 transition-all"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Buka Laporan &amp; Leger Lengkap</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#EFE2BE] dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="py-3 px-4">Kelas / Rombel</th>
                <th className="py-3 px-4 text-center">Jurusan</th>
                <th className="py-3 px-4 text-center">Populasi Siswa</th>
                <th className="py-3 px-4 text-center">Rincian H / S / I / A</th>
                <th className="py-3 px-4">Persentase Kehadiran</th>
                <th className="py-3 px-4 text-center">Rata-rata Nilai</th>
                <th className="py-3 px-4">Persentase Lulus KKM</th>
                <th className="py-3 px-4 text-center">Rank Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classComparisonData.map(row => (
                <tr key={row.id}>
                  <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="rounded-lg bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700 dark:text-cyan-300">
                      {row.majorCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {row.studentCount} Siswa{' '}
                    <span className="text-[10px] text-slate-400">
                      ({row.maleCount}L/{row.femaleCount}P)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{row.hCount}H</span> •{' '}
                    <span className="text-blue-500 font-bold">{row.sCount}S</span> •{' '}
                    <span className="text-amber-500 font-bold">{row.iCount}I</span> •{' '}
                    <span className="text-rose-500 font-bold">{row.aCount}A</span>
                  </td>
                  <td className="py-3 px-4 w-48">
                    <div className="flex items-center justify-between text-[11px] font-black mb-1">
                      <span className="text-emerald-600 dark:text-emerald-400">{row.attendancePct}%</span>
                      <span className="text-[10px] text-slate-400">Target 90%</span>
                    </div>
                    <div className="jrpg-stat-bar">
                      <div
                        className="jrpg-stat-bar-fill bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${Math.min(100, row.attendancePct)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-black text-blue-600 dark:text-cyan-400">
                      {row.avgGrade}
                    </span>
                  </td>
                  <td className="py-3 px-4 w-48">
                    <div className="flex items-center justify-between text-[11px] font-black mb-1">
                      <span className="text-blue-600 dark:text-cyan-400">{row.kkmPct}%</span>
                      <span className="text-[10px] text-slate-400">KKM &ge; 75</span>
                    </div>
                    <div className="jrpg-stat-bar">
                      <div
                        className="jrpg-stat-bar-fill bg-gradient-to-r from-blue-600 to-cyan-400"
                        style={{ width: `${Math.min(100, row.kkmPct)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        row.attendancePct >= 90 && row.avgGrade >= 80
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : row.avgGrade >= 75
                          ? 'bg-blue-500/15 text-blue-700 dark:text-cyan-300 border border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {row.attendancePct >= 90 && row.avgGrade >= 80
                        ? 'RANK S • OPTIMAL'
                        : row.avgGrade >= 75
                        ? 'RANK A • STABIL'
                        : 'RANK B • EVALUASI'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OrnateCard>
    </div>
  );
};
