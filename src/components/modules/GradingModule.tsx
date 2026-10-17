import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Assessment, AssessmentType, AssessmentScore } from '../../types';
import {
  GraduationCap,
  Award,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Search,
  BookOpen,
  Trash2,
  RotateCcw,
  Check,
  TrendingUp,
  Sliders,
  Keyboard,
  CheckCheck,
  Filter,
  ShieldCheck,
  Edit3,
  Save,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { exportToExcel, exportToPdf, exportLegerExcelWithFormulas } from '../../utils/exportUtils';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const GradingModule: React.FC = () => {
  const {
    currentUser,
    currentRole,
    classes,
    subjects,
    students,
    assessments,
    assessmentScores,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    resetAssessmentScores,
    saveAssessmentScores,
    publishAssessment,
    activeAcademicYear,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'input' | 'leger' | 'reportCard'>('input');

  // Delete modal state
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    confirmLabel: 'Hapus Sekarang',
    onConfirm: () => {},
  });

  const closeDeleteModal = () => {
    setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(assessments[0]?.id || '');

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const classStudents = students.filter(s => s.className === currentClass?.name);

  // Filtered assessments for current class and subject
  const currentAssessments = assessments.filter(
    a => a.classId === currentClass.id && a.subjectId === currentSubject.id
  );

  const activeAssessment =
    currentAssessments.find(a => a.id === selectedAssessmentId) || currentAssessments[0] || assessments[0];

  // Scores input map for activeAssessment
  const [scoresInputMap, setScoresInputMap] = useState<Record<string, { score: number; feedback: string }>>(() => {
    const initial: Record<string, { score: number; feedback: string }> = {};
    classStudents.forEach(std => {
      const existing = assessmentScores.find(
        sc => sc.assessmentId === activeAssessment?.id && sc.studentId === std.id
      );
      initial[std.id] = {
        score: existing ? existing.score : 80,
        feedback: existing?.feedback || '',
      };
    });
    return initial;
  });

  // Re-sync when active assessment or class changes
  const handleSelectAssessment = (asmId: string) => {
    setSelectedAssessmentId(asmId);
    const newMap: Record<string, { score: number; feedback: string }> = {};
    classStudents.forEach(std => {
      const existing = assessmentScores.find(
        sc => sc.assessmentId === asmId && sc.studentId === std.id
      );
      newMap[std.id] = {
        score: existing ? existing.score : 80,
        feedback: existing?.feedback || '',
      };
    });
    setScoresInputMap(newMap);
  };

  const handleScoreChange = (studentId: string, val: string) => {
    const num = Math.min(100, Math.max(0, parseInt(val) || 0));
    setScoresInputMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: num,
      },
    }));
  };

  const handleFeedbackChange = (studentId: string, text: string) => {
    setScoresInputMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        feedback: text,
      },
    }));
  };

  const handleSaveScores = () => {
    if (!activeAssessment) return;
    const scoresPayload = classStudents.map(std => ({
      studentId: std.id,
      score: scoresInputMap[std.id]?.score || 0,
      feedback: scoresInputMap[std.id]?.feedback || '',
    }));

    saveAssessmentScores(activeAssessment.id, scoresPayload);
    showToast(`Nilai untuk '${activeAssessment.title}' berhasil disimpan!`);
  };

  const handlePublish = () => {
    if (!activeAssessment) return;
    handleSaveScores();
    publishAssessment(activeAssessment.id);
    showToast(`Nilai '${activeAssessment.title}' berhasil dipublikasikan.`);
  };

  // Quick Entry & Live Analytics States
  const [inputSearchQuery, setInputSearchQuery] = useState('');
  const [inputStatusFilter, setInputStatusFilter] = useState<'all' | 'tuntas' | 'remedial'>('all');

  const handleBulkFill = (presetScore: number) => {
    const kkm = activeAssessment?.kkm || 75;
    setScoresInputMap(prev => {
      const updated = { ...prev };
      classStudents.forEach(std => {
        updated[std.id] = {
          score: presetScore,
          feedback: updated[std.id]?.feedback || (presetScore >= kkm ? 'Tuntas sesuai capaian pembelajaran' : 'Perlu bimbingan & remedial'),
        };
      });
      return updated;
    });
    showToast(`Berhasil menerapkan nilai ${presetScore} untuk seluruh siswa.`);
  };

  const handleApplyQuickFeedback = (stdId: string, fbText: string) => {
    handleFeedbackChange(stdId, fbText);
  };

  // Compute live statistics for current input session
  const kkmVal = activeAssessment?.kkm || 75;
  const currentScoresList = classStudents.map(std => scoresInputMap[std.id]?.score ?? 80);
  const totalScored = currentScoresList.length;
  const avgScore = totalScored > 0 ? (currentScoresList.reduce((a, b) => a + b, 0) / totalScored).toFixed(1) : '0';
  const maxScore = totalScored > 0 ? Math.max(...currentScoresList) : 0;
  const minScore = totalScored > 0 ? Math.min(...currentScoresList) : 0;
  const passedStudentsCount = currentScoresList.filter(s => s >= kkmVal).length;
  const remedialStudentsCount = totalScored - passedStudentsCount;
  const passedRate = totalScored > 0 ? ((passedStudentsCount / totalScored) * 100).toFixed(1) : '0';

  // Filter students for input table
  const filteredInputStudents = classStudents.filter(std => {
    const q = inputSearchQuery.toLowerCase().trim();
    const matchQuery = !q || std.fullName.toLowerCase().includes(q) || std.nisn.includes(q) || std.nis.includes(q);
    if (!matchQuery) return false;
    const score = scoresInputMap[std.id]?.score ?? 80;
    if (inputStatusFilter === 'tuntas') return score >= kkmVal;
    if (inputStatusFilter === 'remedial') return score < kkmVal;
    return true;
  });

  // Create assessment modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AssessmentType>('tugas');
  const [newWeight, setNewWeight] = useState(20);
  const [newKkm, setNewKkm] = useState(75);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreateNewAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newId = createAssessment({
      title: newTitle,
      classId: currentClass.id,
      className: currentClass.name,
      subjectId: currentSubject.id,
      subjectName: currentSubject.name,
      teacherId: currentUser.id,
      teacherName: currentUser.displayName,
      academicYearId: activeAcademicYear.id,
      semester: activeAcademicYear.activeSemester,
      type: newType,
      weight: newWeight,
      maxScore: 100,
      kkm: newKkm,
      date: newDate,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setSelectedAssessmentId(newId);
    showToast(`Komponen penilaian '${newTitle}' berhasil dibuat.`);
  };

  // Leger calculations: calculate weighted final grade per student
  const legerData = classStudents.map((std, idx) => {
    let weightedSum = 0;
    let totalWeight = 0;
    const studentScores: Record<string, number> = {};

    currentAssessments.forEach(asm => {
      const sc = assessmentScores.find(s => s.assessmentId === asm.id && s.studentId === std.id);
      const val = sc ? sc.score : 0;
      studentScores[asm.id] = val;
      weightedSum += val * (asm.weight / 100);
      totalWeight += asm.weight;
    });

    const finalScore = totalWeight > 0 ? Math.round(weightedSum / (totalWeight / 100)) : 0;
    const predicate = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 75 ? 'C' : 'D';
    const isPassed = finalScore >= currentSubject.kkm;

    return {
      no: idx + 1,
      studentId: std.id,
      nisn: std.nisn,
      nis: std.nis,
      fullName: std.fullName,
      scores: studentScores,
      finalScore,
      predicate,
      isPassed,
    };
  });

  const handleExportLegerExcel = () => {
    const scoresByStudent: Record<string, Record<string, number>> = {};
    classStudents.forEach(s => {
      scoresByStudent[s.id] = {};
      currentAssessments.forEach(asm => {
        const sc = assessmentScores.find(x => x.assessmentId === asm.id && x.studentId === s.id);
        scoresByStudent[s.id][asm.id] = sc ? sc.score : 80;
      });
    });

    exportLegerExcelWithFormulas(
      classStudents,
      currentAssessments,
      scoresByStudent,
      currentSubject.kkm,
      currentClass.name,
      currentSubject.name,
      `${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
      `Leger_Nilai_Berumus_${currentClass.name}_${currentSubject.code}`
    );
    showToast('File Excel berumus dinamis (AVERAGE, IF, COUNTIF) berhasil diekspor!');
  };

  const handleExportLegerPdf = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', ...currentAssessments.map(a => a.type.toUpperCase()), 'Nilai Akhir', 'Predikat', 'Status'];
    const rows = legerData.map(r => [
      r.no,
      r.nisn,
      r.fullName,
      ...currentAssessments.map(a => r.scores[a.id] || 0),
      r.finalScore,
      r.predicate,
      r.isPassed ? 'TUNTAS' : 'REMEDIAL',
    ]);

    exportToPdf(
      headers,
      rows,
      {
        title: `LEGER NILAI AKADEMIK KURIKULUM MERDEKA`,
        className: currentClass.name,
        subjectName: currentSubject.name,
        academicYear: `${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
      },
      `Leger_Nilai_${currentClass.name}_${currentSubject.code}`,
      'landscape'
    );
  };

  const handleDeleteAssessmentClick = (asm: Assessment) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Komponen Penilaian',
      itemName: `${asm.title} (${asm.subjectName} - ${asm.className})`,
      description: `Apakah Anda yakin ingin menghapus komponen penilaian '${asm.title}'? Seluruh nilai yang telah diinput untuk komponen ini (${classStudents.length} siswa) akan dihapus secara permanen dari sistem.`,
      onConfirm: () => {
        deleteAssessment(asm.id);
        closeDeleteModal();
        showToast(`Komponen penilaian '${asm.title}' berhasil dihapus.`);
        const remaining = currentAssessments.filter(a => a.id !== asm.id);
        if (remaining.length > 0) {
          handleSelectAssessment(remaining[0].id);
        } else {
          setSelectedAssessmentId('');
        }
      },
    });
  };

  const handleResetScoresClick = () => {
    if (!activeAssessment) return;
    setDeleteModalConfig({
      isOpen: true,
      title: 'Kosongkan Seluruh Nilai Komponen',
      itemName: `${activeAssessment.title} (${currentClass.name})`,
      description: `Apakah Anda yakin ingin mengosongkan / mereset seluruh nilai siswa untuk penilaian '${activeAssessment.title}' kembali ke nilai 0?`,
      confirmLabel: 'Kosongkan Nilai',
      onConfirm: () => {
        resetAssessmentScores(activeAssessment.id);
        closeDeleteModal();
        const newMap: Record<string, { score: number; feedback: string }> = {};
        classStudents.forEach(std => {
          newMap[std.id] = { score: 0, feedback: '' };
        });
        setScoresInputMap(newMap);
        showToast(`Nilai komponen '${activeAssessment.title}' berhasil dikosongkan.`);
      },
    });
  };

  // Student report card selection & per-class selector
  const [reportClassId, setReportClassId] = useState<string>(classes[0]?.id || 'cls-xrpl1');
  const reportCurrentClass = classes.find(c => c.id === reportClassId) || classes[0];
  const reportClassStudents = students.filter(s => s.className === reportCurrentClass?.name);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(reportClassStudents[0]?.id || 'std-001');
  const reportStudent = students.find(s => s.id === selectedStudentId) || reportClassStudents[0] || students[0];

  // Report Card Edit Mode state
  const [isEditingReport, setIsEditingReport] = useState<boolean>(false);
  const [reportCardsState, setReportCardsState] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('myschool_student_reports_custom');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Current student custom report data
  const currentStudentReport = useMemo(() => {
    const existing = reportCardsState[reportStudent?.id];
    if (existing) return existing;

    const initialScores: Record<string, { score: number; predicate: string; feedback: string }> = {};
    subjects.forEach((sub, index) => {
      const score = index === 0 ? 89 : index === 1 ? 85 : index === 2 ? 88 : index === 3 ? 92 : 84;
      const pred = score >= 90 ? 'A' : score >= 80 ? 'B' : 'C';
      initialScores[sub.id] = {
        score,
        predicate: pred,
        feedback: 'Menunjukkan pemahaman yang sangat baik dalam penguasaan materi kejuruan dan aktif dalam praktikum.',
      };
    });

    return {
      scores: initialScores,
      sakit: 0,
      izin: 1,
      alpa: 0,
      homeroomNotes: `Ananda ${reportStudent?.fullName || 'Siswa'} memiliki etos belajar yang tinggi dan disiplin praktikum yang sangat baik. Terus tingkatkan kemampuan kolaborasi tim dan eksplorasi teknologi baru.`,
      statusKenaikan: 'TUNTAS SELURUH CAPAIAN PEMBELAJARAN (NAIK KELAS)',
      reportDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      teacherName: reportCurrentClass?.homeroomTeacherName || 'Siti Rahmawati, S.Pd',
      teacherNip: '198709232011012012',
      principalName: 'Drs. H. Suryana, M.M.Pd.',
      principalNip: '196803151992031002',
    };
  }, [reportCardsState, reportStudent, reportCurrentClass, subjects]);

  // Editable form state for current student
  const [editFormData, setEditFormData] = useState<any>(currentStudentReport);

  const startEditingCurrentStudent = () => {
    setEditFormData(JSON.parse(JSON.stringify(currentStudentReport)));
    setIsEditingReport(true);
  };

  const handleSaveReport = () => {
    const next = {
      ...reportCardsState,
      [reportStudent.id]: editFormData,
    };
    setReportCardsState(next);
    localStorage.setItem('myschool_student_reports_custom', JSON.stringify(next));
    setIsEditingReport(false);
    showToast(`Data rapor untuk ${reportStudent.fullName} berhasil disimpan dan disinkronkan.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl dark:bg-blue-600 animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Module Title & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Penilaian Akademik &amp; Nilai Siswa
              </h1>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[9px] font-black text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Standar Penilaian Vokasi
              </span>
            </div>
            <p className="text-xs text-slate-500">Bobot Dinamis, Leger Nilai, Transkrip Rapor &bull; SMK Mardi Yuana</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-800/60">
          <button
            onClick={() => setActiveTab('input')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'input'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Input Nilai
          </button>
          <button
            onClick={() => setActiveTab('leger')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'leger'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Rekap &amp; Leger Kelas
          </button>
          <button
            onClick={() => setActiveTab('reportCard')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'reportCard'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Draf Rapor Siswa
          </button>
        </div>
      </div>

      {/* TAB 1: INPUT NILAI */}
      {activeTab === 'input' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Rombel / Kelas
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => {
                    setSelectedClassId(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.majorCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Mata Pelajaran
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={e => {
                    setSelectedSubjectId(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (KKM: {s.kkm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Komponen Penilaian
                </label>
                <select
                  value={activeAssessment?.id || ''}
                  onChange={e => handleSelectAssessment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {currentAssessments.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.type.toUpperCase()}] {a.title} ({a.weight}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 px-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Tambah Komponen</span>
                </button>
              </div>
            </div>
          </div>

          {/* Assessment Header Info */}
          {activeAssessment && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-indigo-50/70 p-4 border border-indigo-100 dark:bg-slate-800/80 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{activeAssessment.title}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    activeAssessment.status === 'dipublikasikan' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeAssessment.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Tipe: <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">{activeAssessment.type}</span> &bull; Bobot: <span className="font-semibold text-blue-600">{activeAssessment.weight}%</span> &bull; KKM: <span className="font-semibold text-rose-600">{activeAssessment.kkm}</span> &bull; Tanggal: {activeAssessment.date}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetScoresClick}
                  className="flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 transition-colors"
                  title="Kosongkan seluruh nilai siswa pada komponen ini"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset Nilai</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAssessmentClick(activeAssessment)}
                  className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 transition-colors"
                  title="Hapus Komponen Penilaian ini"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </button>
                <button
                  onClick={handleSaveScores}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  Simpan Draf Nilai
                </button>
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Publikasikan Nilai</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Session Analytics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Rata-rata Nilai</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{avgScore}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <CheckCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Ketuntasan (≥{kkmVal})</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{passedStudentsCount}/{totalScored}</p>
                  <span className="text-[11px] font-bold text-slate-500">({passedRate}%)</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Tertinggi / Terendah</p>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{maxScore} <span className="text-xs font-normal text-slate-400">/</span> {minScore}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Siswa Remedial</p>
                <p className="text-lg font-black text-rose-600 dark:text-rose-400">{remedialStudentsCount} <span className="text-xs font-medium text-slate-400">siswa</span></p>
              </div>
            </div>
          </div>

          {/* Quick-Fill & Search Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">
                <Sliders className="h-3.5 w-3.5 text-blue-600" />
                <span>Isi Cepat:</span>
              </span>
              <button
                type="button"
                onClick={() => handleBulkFill(kkmVal)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                title={`Set semua siswa ke nilai KKM (${kkmVal})`}
              >
                Set KKM ({kkmVal})
              </button>
              <button
                type="button"
                onClick={() => handleBulkFill(80)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                Set 80
              </button>
              <button
                type="button"
                onClick={() => handleBulkFill(85)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                Set 85
              </button>
              <button
                type="button"
                onClick={() => handleBulkFill(90)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                Set 90
              </button>
              <button
                type="button"
                onClick={() => handleBulkFill(0)}
                className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
              >
                Kosongkan
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Keyboard navigation helper */}
              <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <Keyboard className="h-3 w-3 text-slate-400" />
                <span>Tekan <kbd className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-mono font-bold">Enter</kbd> atau <kbd className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-mono font-bold">↓</kbd> ke siswa berikutnya</span>
              </div>

              {/* Status Filter */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setInputStatusFilter('all')}
                  className={`px-2 py-1 rounded-md font-bold transition-all ${
                    inputStatusFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Semua ({classStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInputStatusFilter('tuntas')}
                  className={`px-2 py-1 rounded-md font-bold transition-all ${
                    inputStatusFilter === 'tuntas'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Tuntas ({passedStudentsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setInputStatusFilter('remedial')}
                  className={`px-2 py-1 rounded-md font-bold transition-all ${
                    inputStatusFilter === 'remedial'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Remedial ({remedialStudentsCount})
                </button>
              </div>

              {/* Search box */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari siswa..."
                  value={inputSearchQuery}
                  onChange={e => setInputSearchQuery(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white py-1 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Rapid scores entry table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900 animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">NISN / NIS</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4 text-center w-28">Nilai (0-100)</th>
                    <th className="py-3 px-4 text-center w-24">Predikat</th>
                    <th className="py-3 px-4 text-center w-28">Status KKM</th>
                    <th className="py-3 px-4 min-w-[280px]">Catatan / Umpan Balik Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInputStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada siswa yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredInputStudents.map((std, idx) => {
                      const currentEntry = scoresInputMap[std.id] || { score: 80, feedback: '' };
                      const kkm = activeAssessment?.kkm || 75;
                      const isPass = currentEntry.score >= kkm;
                      const predicate = currentEntry.score >= 90 ? 'A' : currentEntry.score >= 80 ? 'B' : currentEntry.score >= 75 ? 'C' : 'D';

                      return (
                        <tr
                          key={std.id}
                          className={`transition-colors ${
                            !isPass ? 'bg-rose-50/30 dark:bg-rose-950/10' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">{std.nisn}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">{std.fullName}</span>
                            <span className="text-[10px] text-slate-400">NIS: {std.nis}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              id={`score-input-${idx}`}
                              type="number"
                              min="0"
                              max="100"
                              value={currentEntry.score}
                              onChange={e => handleScoreChange(std.id, e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  const next = document.getElementById(`score-input-${idx + 1}`);
                                  if (next) (next as HTMLInputElement).focus();
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  const prev = document.getElementById(`score-input-${idx - 1}`);
                                  if (prev) (prev as HTMLInputElement).focus();
                                }
                              }}
                              className={`w-20 text-center font-black text-sm rounded-xl border py-1.5 focus:bg-white focus:outline-none dark:bg-slate-800 dark:text-white transition-all shadow-2xs ${
                                isPass
                                  ? 'border-slate-200 bg-slate-50/70 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700'
                                  : 'border-rose-300 bg-rose-50/60 text-rose-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-800 dark:text-rose-300'
                              }`}
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs ${
                              predicate === 'A' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' : predicate === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200' : predicate === 'C' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                            }`}>
                              {predicate}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isPass
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {isPass ? 'Tuntas' : 'Remedial'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="Umpan balik perbaikan / apresiasi capaian..."
                                value={currentEntry.feedback}
                                onChange={e => handleFeedbackChange(std.id, e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                              />
                              <div className="flex flex-wrap gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleApplyQuickFeedback(std.id, 'Sangat baik, aktif dan menguasai TP')}
                                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded px-1.5 py-0.5 transition-colors"
                                >
                                  ✨ Sangat Baik
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyQuickFeedback(std.id, 'Tuntas sesuai kriteria capaian')}
                                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded px-1.5 py-0.5 transition-colors"
                                >
                                  ✅ Tuntas CP
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyQuickFeedback(std.id, 'Perlu bimbingan dan remedial')}
                                  className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 rounded px-1.5 py-0.5 transition-colors"
                                >
                                  ⚠️ Remedial
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEGER & REKAP NILAI KELAS */}
      {activeTab === 'leger' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Leger Nilai: {currentClass.name} &bull; {currentSubject.name}
              </h2>
              <p className="text-xs text-slate-500">
                Kalkulasi otomatis nilai akhir terbobot dan predikat kelulusan KKM ({currentSubject.kkm})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportLegerExcel}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="h-4 w-4" /> Unduh Leger Excel
              </button>
              <button
                onClick={handleExportLegerPdf}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                <Printer className="h-4 w-4" /> Cetak PDF Resmi
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold">
                    <th className="py-3 px-3 text-center">No</th>
                    <th className="py-3 px-3">NISN</th>
                    <th className="py-3 px-3">Nama Siswa</th>
                    {currentAssessments.map(asm => (
                      <th key={asm.id} className="py-3 px-3 text-center">
                        <div>{asm.title.split(':')[0]}</div>
                        <div className="text-[10px] font-normal text-slate-400">({asm.weight}%)</div>
                      </th>
                    ))}
                    <th className="py-3 px-3 text-center font-extrabold bg-blue-50/50 dark:bg-blue-950/30">Nilai Akhir</th>
                    <th className="py-3 px-3 text-center font-bold">Predikat</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {legerData.map(r => (
                    <tr key={r.studentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-center text-slate-400">{r.no}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{r.nisn}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{r.fullName}</td>
                      {currentAssessments.map(asm => (
                        <td key={asm.id} className="py-2.5 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                          {r.scores[asm.id] || 0}
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-center font-black text-sm text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20">
                        {r.finalScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">{r.predicate}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.isPassed ? 'Tuntas' : 'Remedial'}
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

      {/* TAB 3: DRAF RAPOR SISWA */}
      {activeTab === 'reportCard' && (
        <div className="space-y-4 animate-fade-in">
          {/* Top Bar: Per-Class Selector, Student Selector, Edit Mode, and Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {/* Filter Per-Kelas & Pilih Siswa */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Kelas:</label>
                <select
                  value={reportClassId}
                  onChange={e => {
                    const newClassId = e.target.value;
                    setReportClassId(newClassId);
                    const targetClass = classes.find(c => c.id === newClassId);
                    const classStds = students.filter(s => s.className === targetClass?.name);
                    if (classStds.length > 0) {
                      setSelectedStudentId(classStds[0].id);
                    }
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-bold text-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.majorCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Siswa:</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {reportClassStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev / Next Student Quick Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = reportClassStudents.findIndex(s => s.id === selectedStudentId);
                    if (currentIndex > 0) {
                      setSelectedStudentId(reportClassStudents[currentIndex - 1].id);
                    }
                  }}
                  disabled={reportClassStudents.findIndex(s => s.id === selectedStudentId) <= 0}
                  className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                  title="Siswa Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = reportClassStudents.findIndex(s => s.id === selectedStudentId);
                    if (currentIndex >= 0 && currentIndex < reportClassStudents.length - 1) {
                      setSelectedStudentId(reportClassStudents[currentIndex + 1].id);
                    }
                  }}
                  disabled={reportClassStudents.findIndex(s => s.id === selectedStudentId) >= reportClassStudents.length - 1}
                  className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                  title="Siswa Berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions: Edit Mode Toggle, Print, Export PDF */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (isEditingReport) {
                    setIsEditingReport(false);
                  } else {
                    startEditingCurrentStudent();
                  }
                }}
                className={`flex items-center gap-1.5 rounded-xl py-2 px-3.5 text-xs font-bold transition-all cursor-pointer ${
                  isEditingReport
                    ? 'bg-amber-600 text-white shadow-xs hover:bg-amber-700'
                    : 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{isEditingReport ? 'Kembali ke Pratinjau' : 'Edit Rapor Siswa'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const headers = ['No', 'Mata Pelajaran', 'KKM', 'Nilai Akhir', 'Predikat', 'Capaian Kompetensi'];
                  const rows = subjects.map((subj, index) => {
                    const item = currentStudentReport.scores[subj.id] || {
                      score: index === 0 ? 89 : index === 1 ? 85 : 80,
                      predicate: 'B',
                      feedback: 'Menunjukkan pemahaman yang sangat baik dalam materi kejuruan.',
                    };
                    return [
                      index + 1,
                      subj.name,
                      subj.kkm,
                      item.score,
                      item.predicate,
                      item.feedback,
                    ];
                  });

                  rows.push([
                    '',
                    `Rekap Kehadiran: Sakit: ${currentStudentReport.sakit} hari | Izin: ${currentStudentReport.izin} hari | Alpa: ${currentStudentReport.alpa} hari`,
                    '',
                    '',
                    '',
                    `Catatan Wali Kelas: "${currentStudentReport.homeroomNotes}"`,
                  ]);

                  exportToPdf(
                    headers,
                    rows,
                    {
                      title: 'TRANSKRIP DRAF RAPOR HASIL BELAJAR SISWA',
                      studentName: `${reportStudent.fullName} (NISN: ${reportStudent.nisn})`,
                      className: `${reportCurrentClass.name} (${reportCurrentClass.majorCode})`,
                      academicYear: `T.A. ${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
                    },
                    `Draf_Rapor_${reportStudent.fullName.replace(/\s+/g, '_')}`,
                    'portrait',
                    {
                      leftSignerTitle: 'Wali Kelas,',
                      leftSignerName: currentStudentReport.teacherName,
                      leftSignerNip: currentStudentReport.teacherNip,
                      rightSignerCity: 'Cikembar',
                      rightSignerDate: currentStudentReport.reportDate,
                      rightSignerTitle: 'Kepala Sekolah,',
                      rightSignerName: currentStudentReport.principalName,
                      rightSignerNip: currentStudentReport.principalNip,
                    }
                  );
                  showToast(`Dokumen PDF draf rapor untuk ${reportStudent.fullName} berhasil dicetak.`);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak PDF Resmi</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Lembaran</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PANEL MODE EDIT RAPOR SISWA                              */}
          {/* ======================================================== */}
          {isEditingReport ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6 shadow-md dark:border-amber-900/60 dark:bg-slate-900 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 dark:border-amber-900/40">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-amber-600" />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Form Edit Rapor: {reportStudent.fullName} ({reportStudent.nisn})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Ubah nilai akhir, capaian kompetensi, kehadiran, catatan wali kelas, dan NIP guru penandatangan
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingReport(false)}
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveReport}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Simpan Perubahan Rapor</span>
                  </button>
                </div>
              </div>

              {/* Subject Scores & Feedback Inputs */}
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                  1. Nilai Akhir &amp; Deskripsi Capaian Kompetensi per Mata Pelajaran
                </span>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 font-bold">
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5">Mata Pelajaran</th>
                        <th className="p-2.5 text-center w-16">KKM</th>
                        <th className="p-2.5 text-center w-24">Nilai (0-100)</th>
                        <th className="p-2.5 text-center w-20">Predikat</th>
                        <th className="p-2.5">Deskripsi Capaian Kompetensi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {subjects.map((sub, idx) => {
                        const currentScore = editFormData.scores?.[sub.id]?.score ?? 80;
                        const currentPred = editFormData.scores?.[sub.id]?.predicate ?? 'B';
                        const currentFeedback = editFormData.scores?.[sub.id]?.feedback ?? '';

                        return (
                          <tr key={sub.id}>
                            <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900 dark:text-white">
                              {sub.name}
                              <span className="block text-[10px] text-slate-400 font-normal">{sub.code}</span>
                            </td>
                            <td className="p-2 text-center font-medium">{sub.kkm}</td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={currentScore}
                                onChange={e => {
                                  const val = Number(e.target.value);
                                  const autoPred = val >= 90 ? 'A' : val >= 80 ? 'B' : val >= 70 ? 'C' : 'D';
                                  setEditFormData((prev: any) => ({
                                    ...prev,
                                    scores: {
                                      ...prev.scores,
                                      [sub.id]: {
                                        ...prev.scores?.[sub.id],
                                        score: val,
                                        predicate: autoPred,
                                      },
                                    },
                                  }));
                                }}
                                className="w-16 rounded border border-slate-200 bg-slate-50 py-1 text-center font-bold text-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:text-blue-400 focus:outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <select
                                value={currentPred}
                                onChange={e => {
                                  const pred = e.target.value;
                                  setEditFormData((prev: any) => ({
                                    ...prev,
                                    scores: {
                                      ...prev.scores,
                                      [sub.id]: {
                                        ...prev.scores?.[sub.id],
                                        predicate: pred,
                                      },
                                    },
                                  }));
                                }}
                                className="rounded border border-slate-200 bg-slate-50 py-1 px-1.5 font-bold text-center dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                              >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <textarea
                                rows={2}
                                value={currentFeedback}
                                onChange={e => {
                                  const fb = e.target.value;
                                  setEditFormData((prev: any) => ({
                                    ...prev,
                                    scores: {
                                      ...prev.scores,
                                      [sub.id]: {
                                        ...prev.scores?.[sub.id],
                                        feedback: fb,
                                      },
                                    },
                                  }));
                                }}
                                placeholder="Deskripsi capaian kompetensi materi..."
                                className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 text-xs dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-2">
                    2. Ketidakhadiran Semester Ini
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Sakit (Hari)</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.sakit}
                        onChange={e => setEditFormData((prev: any) => ({ ...prev, sakit: Number(e.target.value) }))}
                        className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-bold text-blue-600 text-center dark:border-slate-600 dark:bg-slate-700 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Izin (Hari)</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.izin}
                        onChange={e => setEditFormData((prev: any) => ({ ...prev, izin: Number(e.target.value) }))}
                        className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-bold text-amber-600 text-center dark:border-slate-600 dark:bg-slate-700 dark:text-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Alpa (Hari)</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.alpa}
                        onChange={e => setEditFormData((prev: any) => ({ ...prev, alpa: Number(e.target.value) }))}
                        className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-bold text-rose-600 text-center dark:border-slate-600 dark:bg-slate-700 dark:text-rose-400"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      Status Capaian &amp; Kenaikan Kelas:
                    </label>
                    <input
                      type="text"
                      value={editFormData.statusKenaikan}
                      onChange={e => setEditFormData((prev: any) => ({ ...prev, statusKenaikan: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 text-xs font-bold text-emerald-600 dark:border-slate-600 dark:bg-slate-700 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1">
                    3. Catatan &amp; Motivasi Wali Kelas
                  </span>
                  <textarea
                    rows={4}
                    value={editFormData.homeroomNotes}
                    onChange={e => setEditFormData((prev: any) => ({ ...prev, homeroomNotes: e.target.value }))}
                    placeholder="Tuliskan catatan perkembangan kepribadian, kedisiplinan dan motivasi belajar siswa..."
                    className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs italic dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Titimangsa & Tanda Tangan Penandatangan */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 space-y-3">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                  4. Pengaturan Penandatangan Dokumen Rapor (NIP Guru &amp; Kepala Sekolah)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tanggal Pembagian Rapor</label>
                    <input
                      type="text"
                      value={editFormData.reportDate}
                      onChange={e => setEditFormData((prev: any) => ({ ...prev, reportDate: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-semibold dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nama Wali Kelas</label>
                    <input
                      type="text"
                      value={editFormData.teacherName}
                      onChange={e => setEditFormData((prev: any) => ({ ...prev, teacherName: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-bold dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                      NIP Guru / Wali Kelas *
                    </label>
                    <input
                      type="text"
                      value={editFormData.teacherNip}
                      onChange={e => setEditFormData((prev: any) => ({ ...prev, teacherNip: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-mono font-bold text-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">NIP Kepala Sekolah</label>
                    <input
                      type="text"
                      value={editFormData.principalNip}
                      onChange={e => setEditFormData((prev: any) => ({ ...prev, principalNip: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-mono dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Save Action */}
              <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setIsEditingReport(false)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveReport}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan Rapor</span>
                </button>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* PANEL PRATINJAU RAPOR RESMI LEMBARAN                    */
            /* ======================================================== */
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-900 max-w-4xl mx-auto printable-card">
              {/* Kop Yayasan */}
              <div className="text-center border-b-2 border-slate-900 pb-4 dark:border-slate-700">
                <h3 className="text-sm font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                  Yayasan Mardi Yuana
                </h3>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase mt-0.5">
                  SMK Mardi Yuana Cikembar
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Jl. Pelabuhan II KM. 19 Cikembar, Kabupaten Sukabumi, Jawa Barat 43359 | NPSN: 20253654
                </p>
              </div>

              <div className="text-center my-4">
                <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white underline tracking-wide">
                  Laporan Hasil Belajar Tengah Semester
                </h2>
                <p className="text-xs text-slate-500">
                  Tahun Ajaran {activeAcademicYear.name} - Semester {activeAcademicYear.activeSemester.toUpperCase()}
                </p>
              </div>

              {/* Student Info Box */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <p>
                    <span className="text-slate-500 font-medium">Nama Siswa:</span>{' '}
                    <strong className="text-slate-900 dark:text-white">{reportStudent.fullName}</strong>
                  </p>
                  <p className="mt-1">
                    <span className="text-slate-500 font-medium">NISN / NIS:</span> {reportStudent.nisn} / {reportStudent.nis}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="text-slate-500 font-medium">Kelas / Jurusan:</span>{' '}
                    <strong>{reportStudent.className}</strong> ({reportStudent.majorCode})
                  </p>
                  <p className="mt-1">
                    <span className="text-slate-500 font-medium">Wali Kelas:</span> {currentStudentReport.teacherName}
                  </p>
                </div>
              </div>

              {/* Subject scores table */}
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700 mb-6">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2 border-r border-slate-200 dark:border-slate-700 w-10 text-center">No</th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-700">Mata Pelajaran</th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-700 text-center w-16">KKM</th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-700 text-center w-20">Nilai Akhir</th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-700 text-center w-16">Predikat</th>
                    <th className="p-2">Capaian Kompetensi &amp; Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {subjects.map((subj, index) => {
                    const item = currentStudentReport.scores[subj.id] || {
                      score: index === 0 ? 89 : index === 1 ? 85 : 80,
                      predicate: 'B',
                      feedback: 'Menunjukkan pemahaman yang sangat baik dalam penguasaan materi kejuruan dasar dan aktif dalam praktikum.',
                    };

                    return (
                      <tr key={subj.id}>
                        <td className="p-2 text-center border-r border-slate-200 dark:border-slate-700">{index + 1}</td>
                        <td className="p-2 font-bold border-r border-slate-200 dark:border-slate-700">{subj.name}</td>
                        <td className="p-2 text-center border-r border-slate-200 dark:border-slate-700">{subj.kkm}</td>
                        <td className="p-2 text-center font-bold text-blue-600 border-r border-slate-200 dark:border-slate-700">
                          {item.score}
                        </td>
                        <td className="p-2 text-center font-bold border-r border-slate-200 dark:border-slate-700">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.predicate === 'A'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {item.predicate}
                          </span>
                        </td>
                        <td className="p-2 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                          {item.feedback}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Attendance & Catatan Wali Kelas */}
              <div className="grid grid-cols-2 gap-6 text-xs mb-6">
                <div className="border border-slate-200 p-3 rounded-lg dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Ketidakhadiran Semester Ini:
                  </span>
                  <p>Sakit (S): <strong>{currentStudentReport.sakit}</strong> hari</p>
                  <p>Izin (I): <strong>{currentStudentReport.izin}</strong> hari</p>
                  <p>Tanpa Keterangan (A): <strong>{currentStudentReport.alpa}</strong> hari</p>
                  <p className="mt-2 text-[11px] font-bold text-emerald-600">
                    Status: {currentStudentReport.statusKenaikan}
                  </p>
                </div>

                <div className="border border-slate-200 p-3 rounded-lg dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Catatan &amp; Motivasi Wali Kelas:
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed">
                    "{currentStudentReport.homeroomNotes}"
                  </p>
                </div>
              </div>

              {/* Signatures with Editable NIP Guru & Kepsek */}
              <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Orang Tua / Wali Siswa</p>
                  <div className="h-14 flex items-end">
                    <p className="font-bold underline text-slate-400 italic">(....................................)</p>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-between">
                  <div>
                    <p>Cikembar, {currentStudentReport.reportDate}</p>
                    <p className="mt-1 font-semibold">Wali Kelas,</p>
                  </div>
                  <div className="mt-8 font-bold">
                    <p className="underline text-slate-900 dark:text-white">{currentStudentReport.teacherName}</p>
                    <p className="font-mono font-medium text-slate-600 dark:text-slate-400">
                      NIP. {currentStudentReport.teacherNip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE ASSESSMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              Buat Komponen Penilaian Baru
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Kelas: {currentClass.name} &bull; Mapel: {currentSubject.name}
            </p>

            <form onSubmit={handleCreateNewAssessment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Judul / Materi Penilaian</label>
                <input
                  type="text"
                  placeholder="Contoh: Praktik 2: Integrasi REST API & Form"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jenis Penilaian</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as AssessmentType)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="tugas">Tugas</option>
                    <option value="praktik">Praktik</option>
                    <option value="proyek">Proyek</option>
                    <option value="formatif">Formatif</option>
                    <option value="sumatif">Sumatif (UTS/UAS)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Bobot Nilai (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newWeight}
                    onChange={e => setNewWeight(parseInt(e.target.value) || 20)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">KKM Minimum</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newKkm}
                    onChange={e => setNewKkm(parseInt(e.target.value) || 75)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  Buat Penilaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title={deleteModalConfig.title}
        itemName={deleteModalConfig.itemName}
        description={deleteModalConfig.description}
        onConfirm={deleteModalConfig.onConfirm}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};
