import React, { useState } from 'react';
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
  Sparkles,
  Search,
  BookOpen,
  Trash2,
  RotateCcw,
  Check,
} from 'lucide-react';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
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
    const exportRows = legerData.map(row => {
      const item: any = {
        No: row.no,
        NISN: row.nisn,
        NIS: row.nis,
        'Nama Siswa': row.fullName,
      };

      currentAssessments.forEach(asm => {
        item[`${asm.title} (${asm.weight}%)`] = row.scores[asm.id] || 0;
      });

      item['Nilai Akhir'] = row.finalScore;
      item['Predikat'] = row.predicate;
      item['Status KKM'] = row.isPassed ? 'TUNTAS' : 'REMEDIAL';

      return item;
    });

    exportToExcel(exportRows, `Leger_Nilai_${currentClass.name}_${currentSubject.code}`);
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

  // Student report card selection
  const [selectedStudentId, setSelectedStudentId] = useState<string>(classStudents[0]?.id || 'std-001');
  const reportStudent = students.find(s => s.id === selectedStudentId) || classStudents[0] || students[0];

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
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Manajemen Penilaian Akademik &amp; Nilai
            </h1>
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

          {/* Rapid scores entry table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
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
                    <th className="py-3 px-4 min-w-[240px]">Catatan / Umpan Balik Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classStudents.map((std, idx) => {
                    const currentEntry = scoresInputMap[std.id] || { score: 80, feedback: '' };
                    const kkm = activeAssessment?.kkm || 75;
                    const isPass = currentEntry.score >= kkm;
                    const predicate = currentEntry.score >= 90 ? 'A' : currentEntry.score >= 80 ? 'B' : currentEntry.score >= 75 ? 'C' : 'D';

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">{std.nisn}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{std.fullName}</td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentEntry.score}
                            onChange={e => handleScoreChange(std.id, e.target.value)}
                            className="w-20 text-center font-extrabold text-sm rounded-lg border border-slate-200 bg-slate-50/50 py-1 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                            predicate === 'A' ? 'bg-emerald-100 text-emerald-800' : predicate === 'B' ? 'bg-blue-100 text-blue-800' : predicate === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {predicate}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPass ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isPass ? 'Tuntas' : 'Remedial'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Umpan balik perbaikan / pujian..."
                            value={currentEntry.feedback}
                            onChange={e => handleFeedbackChange(std.id, e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1 px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
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
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Siswa:</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.nisn})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" /> Cetak Rapor Lembaran
            </button>
          </div>

          {/* Printable Report Card Sheet */}
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
              <p className="text-xs text-slate-500">Tahun Ajaran {activeAcademicYear.name} - Semester {activeAcademicYear.activeSemester.toUpperCase()}</p>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <p><span className="text-slate-500 font-medium">Nama Siswa:</span> <strong className="text-slate-900 dark:text-white">{reportStudent.fullName}</strong></p>
                <p className="mt-1"><span className="text-slate-500 font-medium">NISN / NIS:</span> {reportStudent.nisn} / {reportStudent.nis}</p>
              </div>
              <div>
                <p><span className="text-slate-500 font-medium">Kelas / Jurusan:</span> <strong>{reportStudent.className}</strong> ({reportStudent.majorCode})</p>
                <p className="mt-1"><span className="text-slate-500 font-medium">Wali Kelas:</span> Siti Rahmawati, S.Pd</p>
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
                {subjects.slice(0, 5).map((subj, index) => {
                  const score = index === 0 ? 89 : index === 1 ? 85 : index === 2 ? 88 : index === 3 ? 92 : 84;
                  const pred = score >= 90 ? 'A' : score >= 80 ? 'B' : 'C';

                  return (
                    <tr key={subj.id}>
                      <td className="p-2 text-center border-r border-slate-200 dark:border-slate-700">{index + 1}</td>
                      <td className="p-2 font-bold border-r border-slate-200 dark:border-slate-700">{subj.name}</td>
                      <td className="p-2 text-center border-r border-slate-200 dark:border-slate-700">{subj.kkm}</td>
                      <td className="p-2 text-center font-bold text-blue-600 border-r border-slate-200 dark:border-slate-700">{score}</td>
                      <td className="p-2 text-center font-bold border-r border-slate-200 dark:border-slate-700">{pred}</td>
                      <td className="p-2 text-[11px] text-slate-600 dark:text-slate-300">
                        Menunjukkan pemahaman yang sangat baik dalam penguasaan materi kejuruan dasar dan aktif dalam praktikum.
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Attendance & signatures */}
            <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="border border-slate-200 p-3 rounded-lg dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Ketidakhadiran Semester Ini:</span>
                <p>Sakit (S): 0 hari</p>
                <p>Izin (I): 1 hari</p>
                <p>Tanpa Keterangan (A): 0 hari</p>
              </div>

              <div className="text-right flex flex-col justify-between">
                <div>
                  <p>Cikembar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1">Wali Kelas,</p>
                </div>
                <div className="mt-12 font-bold">
                  <p>Siti Rahmawati, S.Pd</p>
                  <p className="font-normal text-slate-500">NIP. 198709232011012012</p>
                </div>
              </div>
            </div>
          </div>
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
