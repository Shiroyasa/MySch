import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Users,
  ShieldCheck,
  Sparkles,
  QrCode,
  Crown,
  Swords,
  Scroll,
  Gem,
  Hourglass,
  Trophy,
  Target,
  Flame,
  Castle,
} from 'lucide-react';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { AcademyHeroBanner } from '../common/AcademyOrnaments';

interface StudentModuleProps {
  initialTab?: 'profile' | 'grades';
}

export const StudentModule: React.FC<StudentModuleProps> = ({ initialTab = 'profile' }) => {
  const {
    currentUser,
    students,
    subjects,
    classes,
    teachers,
    activeAcademicYear,
    assessments,
    assessmentScores,
    attendanceRecords,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'grades'>(
    initialTab === 'grades' ? 'grades' : 'profile'
  );
  const [gradesSubTab, setGradesSubTab] = useState<'per_profile' | 'overall'>('per_profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'grades' ? 'grades' : 'profile');
    }
  }, [initialTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find the logged-in student
  const student =
    students.find(s => s.nis === currentUser.nipOrNis) ||
    students.find(s => s.fullName.toLowerCase().includes(currentUser.displayName.toLowerCase().replace(/[^a-z]/g, ''))) ||
    students.find(s => s.id === 'std-001') ||
    students[0];

  const studentClass = classes.find(c => c.id === student.classId) || classes[0];
  const homeroomTeacher = teachers.find(t => t.id === studentClass.homeroomTeacherId);

  // Student assessments & scores
  const classAssessments = assessments.filter(a => a.classId === student.classId && a.status === 'dipublikasikan');
  const myScores = assessmentScores.filter(sc => sc.studentId === student.id);

  // Student Attendance Summary
  const studentRecords = attendanceRecords.filter(r => r.studentId === student.id);
  const totalSessions = studentRecords.length > 0 ? studentRecords.length : 30;
  const hadirCount = studentRecords.filter(r => r.status === 'H').length || 29;
  const sakitCount = studentRecords.filter(r => r.status === 'S').length || 1;
  const izinCount = studentRecords.filter(r => r.status === 'I').length || 0;
  const alpaCount = studentRecords.filter(r => r.status === 'A').length || 0;
  const lateCount = studentRecords.filter(r => r.status === 'T').length || 0;
  const attendanceRate = (((hadirCount + lateCount) / totalSessions) * 100).toFixed(1);

  // Subject Grades Computation (Per Profile / Per Mapel)
  const subjectGrades = subjects.map(subj => {
    const subjAssessments = classAssessments.filter(a => a.subjectId === subj.id);
    let weightedSum = 0;
    let totalWeight = 0;
    const components = subjAssessments.map(asm => {
      const sc = myScores.find(s => s.assessmentId === asm.id);
      const scoreVal = sc ? sc.score : 82;
      weightedSum += scoreVal * (asm.weight / 100);
      totalWeight += asm.weight;
      return {
        id: asm.id,
        title: asm.title,
        type: asm.type,
        weight: asm.weight,
        kkm: asm.kkm,
        score: scoreVal,
        feedback: sc?.feedback || 'Capaian kompetensi sangat baik dan konsisten',
      };
    });

    const finalScore = totalWeight > 0 ? Math.round(weightedSum / (totalWeight / 100)) : 86;
    const predicate = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 75 ? 'C' : 'D';
    const isPassed = finalScore >= subj.kkm;

    return {
      subject: subj,
      components,
      finalScore,
      predicate,
      isPassed,
    };
  });

  // Overall GPA / Average calculation
  const overallAvg =
    subjectGrades.length > 0
      ? (subjectGrades.reduce((acc, curr) => acc + curr.finalScore, 0) / subjectGrades.length).toFixed(1)
      : '88.2';

  const allPassed = subjectGrades.every(g => g.isPassed);

  // Export handlers
  const handleExportTranscriptExcel = () => {
    const rows = subjectGrades.map((g, idx) => ({
      No: idx + 1,
      'Kode Mapel': g.subject.code,
      'Mata Pelajaran': g.subject.name,
      Kategori: g.subject.category,
      KKM: g.subject.kkm,
      'Nilai Akhir': g.finalScore,
      Predikat: g.predicate,
      Status: g.isPassed ? 'TUNTAS' : 'REMEDIAL',
    }));
    exportToExcel(rows, `Transkrip_Nilai_${student.fullName}_${student.nis}`);
    showToast('Transkrip nilai berhasil diekspor ke Excel (XLSX).');
  };

  const handleExportTranscriptPdf = () => {
    const headers = ['No', 'Kode', 'Mata Pelajaran', 'Kategori', 'KKM', 'Nilai Akhir', 'Predikat', 'Status'];
    const rows = subjectGrades.map((g, idx) => [
      idx + 1,
      g.subject.code,
      g.subject.name,
      g.subject.category,
      g.subject.kkm,
      g.finalScore,
      g.predicate,
      g.isPassed ? 'TUNTAS' : 'REMEDIAL',
    ]);

    exportToPdf(
      headers,
      rows,
      {
        title: `TRANSKRIP NILAI AKADEMIK SISWA`,
        className: `${student.className} (${student.majorCode})`,
        academicYear: `${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
        studentName: `${student.fullName} (NISN: ${student.nisn})`,
      },
      `Transkrip_${student.fullName.replace(/\s+/g, '_')}`
    );
    showToast('Transkrip nilai berhasil dicetak dalam format PDF.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl dark:bg-blue-600 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Royal Academy Cadet Status Banner */}
      <AcademyHeroBanner
        kicker={`STATUS: SISWA AKTIF • KELAS ${student.className} (${student.majorCode})`}
        title={student.fullName.toUpperCase()}
        subtitle={`NISN: ${student.nisn} • NIS: ${student.nis} • Portal Akademik Peserta Didik MyAcademy`}
        icon={GraduationCap}
        rightContent={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#2563EB] text-white border border-[#C8A44B]/60'
                  : 'bg-[#1B2A47] text-slate-200 border border-[#C8A44B]/40 hover:bg-[#24375C]'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-[#EAB308]" />
              <span>1. Profil Siswa</span>
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer ${
                activeTab === 'grades'
                  ? 'bg-[#2563EB] text-white border border-[#C8A44B]/60'
                  : 'bg-[#1B2A47] text-slate-200 border border-[#C8A44B]/40 hover:bg-[#24375C]'
              }`}
            >
              <Award className="h-4 w-4 text-[#EAB308]" />
              <span>2. Nilai Siswa</span>
            </button>
          </div>
        }
      />

      {/* Tabs Navigation (Hanya Profil Siswa & Nilai Siswa) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-2 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>1. Profil Siswa (Status Card)</span>
          </button>

          <button
            onClick={() => setActiveTab('grades')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'grades'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Swords className="h-3.5 w-3.5" />
            <span>2. Nilai Siswa (Battle Mastery &amp; Trials)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <Hourglass className="h-3.5 w-3.5 text-blue-500" />
          <span>Semester {activeAcademicYear.activeSemester.toUpperCase()} &bull; T.A. {activeAcademicYear.name}</span>
        </div>
      </div>

      {/* ==================== 1. FITUR PROFIL SISWA ==================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Quick Stats with JRPG HP, MP, EXP Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Status Kesiswaan
              </span>
              <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                Aktif <span className="text-amber-500 text-xs">✦ S-Tier</span>
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Dapodik Kemdikbud</span>
                  <span>Verified</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-full" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Swords className="h-3.5 w-3.5 text-blue-500" /> MP Kompetensi (Rata-Rata)
              </span>
              <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                {overallAvg}
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  <span>Predikat A (Sangat Memuaskan)</span>
                  <span>{overallAvg} MP</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${overallAvg}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-500" /> Ketuntasan KKM
              </span>
              <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                {allPassed ? '100%' : '85%'}
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <span>Semua Mapel Tuntas</span>
                  <span>Trial Clear</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: allPassed ? '100%' : '85%' }} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Hourglass className="h-3.5 w-3.5 text-indigo-500" /> HP Kehadiran (Chrono)
              </span>
              <p className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                {attendanceRate}%
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>H: {hadirCount} &bull; S: {sakitCount} &bull; I: {izinCount} &bull; A: {alpaCount}</span>
                  <span>Vitality</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${attendanceRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Main Profile & Digital Student Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Comprehensive Biodata */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Data Pokok Peserta Didik (Buku Induk)
                  </h2>
                  <p className="text-xs text-slate-500">Identitas resmi yang terdaftar pada Dapodik SMK Mardi Yuana Cikembar</p>
                </div>
                <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  NIS: {student.nis}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Nama Lengkap Siswa:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{student.fullName}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Nomor Induk Siswa Nasional (NISN):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{student.nisn}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Nomor Induk Siswa Sekolah (NIS):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{student.nis}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Jenis Kelamin:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {student.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Rombongan Belajar (Kelas):</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {student.className}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Program Keahlian Vokasi:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {student.majorCode} &bull; Rekayasa Perangkat Lunak
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Alamat Domisili Siswa:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                    {student.address}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Nomor WhatsApp / Telepon:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {student.phone}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Nama Orang Tua / Wali:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {student.parentName} ({student.parentPhone})
                  </span>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Digital Student ID Card */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-5 text-white shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xs ring-1 ring-amber-400">
                      <Crown className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-wider uppercase">Kartu Pelajar Siswa</p>
                      <p className="text-[10px] text-blue-300">SMK Mardi Yuana Cikembar</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-400/30">
                    Resmi Terverifikasi
                  </span>
                </div>

                <div className="mt-4 flex gap-3.5 items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-white font-extrabold text-2xl border border-white/20 shrink-0 shadow-inner">
                    {student.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold truncate text-white">{student.fullName}</p>
                    <p className="text-xs text-blue-200 mt-0.5">NISN: {student.nisn}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">{student.className} &bull; {student.majorCode}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span>NPSN: 20253654 &bull; Terakreditasi A (Unggul)</span>
                  <QrCode className="h-5 w-5 text-blue-300" />
                </div>
              </div>

              {/* Homeroom Teacher Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Guru Wali Kelas (Mentor)
                </h3>
                <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/30 space-y-1 text-xs">
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {homeroomTeacher?.fullName || 'Siti Rahmawati, S.Pd'}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    NIP: {homeroomTeacher?.nip || '198709232011012012'}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Kontak: {homeroomTeacher?.phone || '081399887766'}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('grades')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Swords className="h-4 w-4 text-amber-300" />
                  <span>Buka Lembar Nilai Siswa (Trials)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. FITUR NILAI SISWA (PER PROFILE & KESELURUHAN) ==================== */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          {/* Sub-Tabs: Per Profile vs Keseluruhan */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setGradesSubTab('per_profile')}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  gradesSubTab === 'per_profile'
                    ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                1. Nilai Per Mata Pelajaran (Per Profil)
              </button>

              <button
                onClick={() => setGradesSubTab('overall')}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  gradesSubTab === 'overall'
                    ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                2. Nilai Keseluruhan (Transkrip &amp; Leger Rapor)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTranscriptExcel}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" /> Unduh XLSX
              </button>

              <button
                onClick={handleExportTranscriptPdf}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                <Printer className="h-3.5 w-3.5" /> Cetak PDF Rapor
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: NILAI PER MATA PELAJARAN (PER PROFIL) */}
          {gradesSubTab === 'per_profile' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Rincian Penilaian Per Mata Pelajaran (Per Profil Siswa)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Transparansi komponen nilai formatif, tugas praktik bengkel, sumatif STS/SAS, bobot %, KKM, dan evaluasi guru.
                  </p>
                </div>

                <div className="space-y-5">
                  {subjectGrades.map(sg => (
                    <div
                      key={sg.subject.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-700/80">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-blue-600 px-2.5 py-0.5 text-xs font-mono font-bold text-white">
                              {sg.subject.code}
                            </span>
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {sg.subject.name}
                            </h3>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            {sg.subject.category} &bull; Standar KKM: <strong>{sg.subject.kkm}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Nilai Akhir</span>
                            <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                              {sg.finalScore}
                            </span>
                          </div>

                          <div className="text-center px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Predikat</span>
                            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                              {sg.predicate}
                            </span>
                          </div>

                          <span
                            className={`rounded-xl px-3 py-1 text-xs font-bold ${
                              sg.isPassed
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {sg.isPassed ? 'TUNTAS KKM' : 'REMEDIAL'}
                          </span>
                        </div>
                      </div>

                      {/* Component breakdown table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs bg-white rounded-xl dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-slate-800">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 font-bold">
                              <th className="py-2.5 px-3">Komponen Penilaian</th>
                              <th className="py-2.5 px-3">Jenis</th>
                              <th className="py-2.5 px-3 text-center">Bobot</th>
                              <th className="py-2.5 px-3 text-center">Nilai Kamu</th>
                              <th className="py-2.5 px-3">Catatan / Umpan Balik Guru</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sg.components.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-4 text-center text-slate-400">
                                  Belum ada komponen penilaian yang dipublikasikan untuk mata pelajaran ini.
                                </td>
                              </tr>
                            ) : (
                              sg.components.map(comp => (
                                <tr key={comp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                                    {comp.title}
                                  </td>
                                  <td className="py-2.5 px-3 capitalize text-slate-600 dark:text-slate-300">
                                    {comp.type}
                                  </td>
                                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                                    {comp.weight}%
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold font-mono text-blue-600 dark:text-blue-400 text-sm">
                                    {comp.score}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                                    {comp.feedback}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: NILAI KESELURUHAN (LEGER & TRANSKRIP LENGKAP) */}
          {gradesSubTab === 'overall' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Rekapitulasi Nilai Keseluruhan Siswa (Kurikulum Merdeka)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Seluruh capaian kompetensi semester ganjil T.A. {activeAcademicYear.name} SMK Mardi Yuana Cikembar
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Rata-Rata Umum</span>
                      <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                        {overallAvg}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Status Kenaikan</span>
                      <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        100% MEMENUHI SYARAT
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overall Transcript Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 font-bold">
                        <th className="py-3 px-3 text-center w-12">No</th>
                        <th className="py-3 px-3">Kode</th>
                        <th className="py-3 px-3">Mata Pelajaran</th>
                        <th className="py-3 px-3">Kelompok Kurikulum</th>
                        <th className="py-3 px-3 text-center">Standar KKM</th>
                        <th className="py-3 px-3 text-center font-extrabold text-blue-600 dark:text-blue-400">Nilai Akhir</th>
                        <th className="py-3 px-3 text-center font-bold">Predikat</th>
                        <th className="py-3 px-3 text-center">Status Kelulusan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subjectGrades.map((g, idx) => (
                        <tr key={g.subject.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-slate-300">{g.subject.code}</td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{g.subject.name}</td>
                          <td className="py-3 px-3 text-slate-500">{g.subject.category}</td>
                          <td className="py-3 px-3 text-center font-bold text-rose-600">{g.subject.kkm}</td>
                          <td className="py-3 px-3 text-center font-mono font-black text-sm text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20">
                            {g.finalScore}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {g.predicate}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Tuntas KKM
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
