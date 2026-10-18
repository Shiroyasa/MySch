import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Assessment, AssessmentType } from '../../types';
import {
  GraduationCap,
  Award,
  PlusCircle,
  Download,
  Printer,
  CheckCircle2,
  Search,
  Trash2,
  RotateCcw,
  Check,
  TrendingUp,
  Sliders,
  Keyboard,
  CheckCheck,
  Edit3,
  Save,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { exportToExcel, exportToPdf, exportLegerExcelWithFormulas } from '../../utils/exportUtils';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { AcademyHeroBanner, OrnateCard } from '../common/AcademyOrnaments';
import { SortByControl, SortOption, sortDataItems } from '../common/SortByControl';

export const GradingModule: React.FC = () => {
  const {
    currentUser,
    classes,
    subjects,
    students,
    assessments,
    assessmentScores,
    attendanceRecords,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    resetAssessmentScores,
    resetClassSubjectAllScores,
    saveAssessmentScores,
    publishAssessment,
    customStudentReports,
    saveCustomStudentReport,
    resetCustomStudentReport,
    activeAcademicYear,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'input' | 'leger' | 'reportCard'>('input');

  // Confirmation modal state
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

  // Filters & Sort
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-xrpl1');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'sub-pwpb');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('az');

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const classStudents = useMemo(() => {
    return sortDataItems(
      students.filter(s => s.classId === currentClass?.id || s.className === currentClass?.name),
      sortBy,
      {
        getName: s => s.fullName || (s as any).name || '',
        getNis: s => s.nis,
        getDate: s => s.createdAt || '2025-07-14',
      }
    );
  }, [students, currentClass?.id, currentClass?.name, sortBy]);

  // Filtered assessments strictly for current class and subject
  const currentAssessments = useMemo(() => {
    return assessments.filter(
      a =>
        (a.classId === currentClass?.id || a.className === currentClass?.name) &&
        a.subjectId === currentSubject?.id
    );
  }, [assessments, currentClass?.id, currentClass?.name, currentSubject?.id]);

  // Active assessment strictly within currentAssessments (never leaking another class's assessment)
  const activeAssessment = useMemo(() => {
    return (
      currentAssessments.find(a => a.id === selectedAssessmentId) ||
      currentAssessments[0] ||
      null
    );
  }, [currentAssessments, selectedAssessmentId]);

  // Keep selectedAssessmentId synced when class/subject changes
  useEffect(() => {
    if (currentAssessments.length > 0) {
      const exists = currentAssessments.some(a => a.id === selectedAssessmentId);
      if (!exists) {
        setSelectedAssessmentId(currentAssessments[0].id);
      }
    } else {
      setSelectedAssessmentId('');
    }
  }, [currentAssessments, selectedAssessmentId]);

  // Scores input map for activeAssessment — automatically synced with assessmentScores from database
  const [scoresInputMap, setScoresInputMap] = useState<Record<string, { score: number; feedback: string }>>({});

  useEffect(() => {
    const syncedMap: Record<string, { score: number; feedback: string }> = {};
    classStudents.forEach(std => {
      if (activeAssessment) {
        const existing = assessmentScores.find(
          sc => sc.assessmentId === activeAssessment.id && sc.studentId === std.id
        );
        syncedMap[std.id] = {
          score: existing !== undefined ? Number(existing.score) : 0,
          feedback: existing?.feedback || '',
        };
      } else {
        syncedMap[std.id] = {
          score: 0,
          feedback: '',
        };
      }
    });
    setScoresInputMap(syncedMap);
  }, [activeAssessment?.id, classStudents, assessmentScores]);

  // Helper to ensure an assessment component exists if teacher inputs scores on a class+subject without one
  const ensureActiveAssessment = (): string => {
    if (activeAssessment) return activeAssessment.id;
    const createdId = createAssessment({
      title: `Penilaian Harian 1: ${currentSubject.name}`,
      classId: currentClass.id,
      className: currentClass.name,
      subjectId: currentSubject.id,
      subjectName: currentSubject.name,
      teacherId: currentUser.id,
      teacherName: currentUser.displayName,
      academicYearId: activeAcademicYear.id,
      semester: activeAcademicYear.activeSemester,
      type: 'formatif',
      weight: 100,
      maxScore: 100,
      kkm: currentSubject.kkm || 75,
      date: new Date().toISOString().split('T')[0],
    });
    setSelectedAssessmentId(createdId);
    return createdId;
  };

  const handleSelectAssessment = (asmId: string) => {
    setSelectedAssessmentId(asmId);
  };

  const handleScoreChange = (studentId: string, val: string) => {
    const parsed = val === '' ? 0 : parseInt(val, 10);
    const num = Math.min(100, Math.max(0, isNaN(parsed) ? 0 : parsed));
    setScoresInputMap(prev => ({
      ...prev,
      [studentId]: {
        score: num,
        feedback: prev[studentId]?.feedback || '',
      },
    }));
  };

  const handleFeedbackChange = (studentId: string, text: string) => {
    setScoresInputMap(prev => ({
      ...prev,
      [studentId]: {
        score: prev[studentId]?.score ?? 0,
        feedback: text,
      },
    }));
  };

  const handleSaveScores = () => {
    const targetAsmId = ensureActiveAssessment();
    const scoresPayload = classStudents.map(std => ({
      studentId: std.id,
      score: Number(scoresInputMap[std.id]?.score ?? 0),
      feedback: scoresInputMap[std.id]?.feedback || '',
    }));

    saveAssessmentScores(targetAsmId, scoresPayload);
    showToast(`Nilai berhasil disimpan ke database & disinkronkan ke Leger, Rapor, dan Dashboard!`);
  };

  const handlePublish = () => {
    const targetAsmId = ensureActiveAssessment();
    const scoresPayload = classStudents.map(std => ({
      studentId: std.id,
      score: Number(scoresInputMap[std.id]?.score ?? 0),
      feedback: scoresInputMap[std.id]?.feedback || '',
    }));
    saveAssessmentScores(targetAsmId, scoresPayload);
    publishAssessment(targetAsmId);
    showToast(`Nilai berhasil disimpan & dipublikasikan ke seluruh menu!`);
  };

  // Quick Entry & Live Analytics States
  const [inputSearchQuery, setInputSearchQuery] = useState('');
  const [inputStatusFilter, setInputStatusFilter] = useState<'all' | 'tuntas' | 'remedial'>('all');

  // Bulk Fill immediately updates state AND saves to database so all tabs stay in sync
  const handleBulkFill = (presetScore: number) => {
    const targetAsmId = ensureActiveAssessment();
    const kkm = activeAssessment?.kkm || currentSubject.kkm || 75;
    const nextMap: Record<string, { score: number; feedback: string }> = {};
    const payload: { studentId: string; score: number; feedback: string }[] = [];

    classStudents.forEach(std => {
      const fb =
        presetScore === 0
          ? ''
          : scoresInputMap[std.id]?.feedback ||
            (presetScore >= kkm ? 'Tuntas sesuai capaian pembelajaran' : 'Perlu bimbingan & remedial');
      nextMap[std.id] = { score: presetScore, feedback: fb };
      payload.push({ studentId: std.id, score: presetScore, feedback: fb });
    });

    setScoresInputMap(nextMap);

    if (presetScore === 0) {
      resetAssessmentScores(targetAsmId);
      showToast(`Seluruh nilai siswa berhasil dikosongkan (0) dan disinkronkan ke database.`);
    } else {
      saveAssessmentScores(targetAsmId, payload);
      showToast(`Nilai ${presetScore} diterapkan untuk seluruh siswa & tersimpan ke database.`);
    }
  };

  const handleApplyQuickFeedback = (stdId: string, fbText: string) => {
    const nextMap = {
      ...scoresInputMap,
      [stdId]: {
        score: scoresInputMap[stdId]?.score ?? 0,
        feedback: fbText,
      },
    };
    setScoresInputMap(nextMap);
    if (activeAssessment) {
      const payload = classStudents.map(std => ({
        studentId: std.id,
        score: Number(nextMap[std.id]?.score ?? 0),
        feedback: nextMap[std.id]?.feedback || '',
      }));
      saveAssessmentScores(activeAssessment.id, payload);
    }
  };

  // Compute live statistics for current input session
  const kkmVal = activeAssessment?.kkm || currentSubject?.kkm || 75;
  const currentScoresList = classStudents.map(std => Number(scoresInputMap[std.id]?.score ?? 0));
  const totalScored = currentScoresList.length;
  const avgScore =
    totalScored > 0
      ? (currentScoresList.reduce((a, b) => a + b, 0) / totalScored).toFixed(1)
      : '0.0';
  const maxScore = totalScored > 0 ? Math.max(...currentScoresList) : 0;
  const minScore = totalScored > 0 ? Math.min(...currentScoresList) : 0;
  const passedStudentsCount = currentScoresList.filter(s => s >= kkmVal).length;
  const remedialStudentsCount = totalScored - passedStudentsCount;
  const passedRate = totalScored > 0 ? ((passedStudentsCount / totalScored) * 100).toFixed(1) : '0.0';

  // Filter students for input table
  const filteredInputStudents = classStudents.filter(std => {
    const q = inputSearchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      std.fullName.toLowerCase().includes(q) ||
      std.nisn.includes(q) ||
      std.nis.includes(q);
    if (!matchQuery) return false;
    const score = Number(scoresInputMap[std.id]?.score ?? 0);
    if (inputStatusFilter === 'tuntas') return score >= kkmVal;
    if (inputStatusFilter === 'remedial') return score < kkmVal;
    return true;
  });

  // Create / Edit assessment modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AssessmentType>('tugas');
  const [newWeight, setNewWeight] = useState(20);
  const [newKkm, setNewKkm] = useState(75);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const openCreateAssessmentModal = () => {
    setEditingAssessmentId(null);
    setNewTitle('');
    setNewType('tugas');
    setNewWeight(25);
    setNewKkm(currentSubject?.kkm || 75);
    setNewDate(new Date().toISOString().split('T')[0]);
    setShowCreateModal(true);
  };

  const openEditAssessmentModal = (asm: Assessment) => {
    setEditingAssessmentId(asm.id);
    setNewTitle(asm.title);
    setNewType(asm.type);
    setNewWeight(asm.weight);
    setNewKkm(asm.kkm);
    setNewDate(asm.date);
    setShowCreateModal(true);
  };

  const handleSaveAssessmentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (editingAssessmentId) {
      updateAssessment(editingAssessmentId, {
        title: newTitle.trim(),
        type: newType,
        weight: newWeight,
        kkm: newKkm,
        date: newDate,
      });
      setShowCreateModal(false);
      showToast(`Komponen penilaian '${newTitle}' berhasil diperbarui di database.`);
      return;
    }

    const newId = createAssessment({
      title: newTitle.trim(),
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
    showToast(`Komponen penilaian '${newTitle}' berhasil dibuat & disimpan ke database.`);
  };

  // Leger calculations: calculate weighted final grade per student
  const legerData = useMemo(() => {
    return classStudents.map((std, idx) => {
      let weightedSum = 0;
      let totalWeight = 0;
      const studentScores: Record<string, number> = {};

      currentAssessments.forEach(asm => {
        const isCurrentActive = activeAssessment?.id === asm.id;
        const sc = assessmentScores.find(
          s => s.assessmentId === asm.id && s.studentId === std.id
        );
        const val =
          sc !== undefined
            ? Number(sc.score)
            : isCurrentActive && scoresInputMap[std.id] !== undefined
            ? Number(scoresInputMap[std.id].score)
            : 0;
        studentScores[asm.id] = val;
        weightedSum += val * (asm.weight / 100);
        totalWeight += asm.weight;
      });

      const finalScore =
        totalWeight > 0 ? Math.round(weightedSum / (totalWeight / 100)) : 0;
      const predicate =
        finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 75 ? 'C' : 'D';
      const isPassed = finalScore >= (currentSubject?.kkm || 75);

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
  }, [classStudents, currentAssessments, assessmentScores, activeAssessment?.id, scoresInputMap, currentSubject?.kkm]);

  const handleExportLegerExcel = () => {
    const scoresByStudent: Record<string, Record<string, number>> = {};
    classStudents.forEach(s => {
      scoresByStudent[s.id] = {};
      currentAssessments.forEach(asm => {
        const sc = assessmentScores.find(
          x => x.assessmentId === asm.id && x.studentId === s.id
        );
        scoresByStudent[s.id][asm.id] = sc !== undefined ? Number(sc.score) : 0;
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
      `Leger_Nilai_ORBITA_${currentClass.name}_${currentSubject.code}`
    );
    showToast('File Excel Leger Nilai berumus dinamis berhasil diekspor!');
  };

  const handleExportLegerPdf = () => {
    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      ...currentAssessments.map(a => a.type.toUpperCase()),
      'Nilai Akhir',
      'Predikat',
      'Status',
    ];
    const rows = legerData.map(r => [
      r.no,
      r.nisn,
      r.fullName,
      ...currentAssessments.map(a => r.scores[a.id] ?? 0),
      r.finalScore,
      r.predicate,
      r.isPassed ? 'TUNTAS' : 'REMEDIAL',
    ]);

    exportToPdf(
      headers,
      rows,
      {
        title: `LEGER NILAI AKADEMIK ORBITA — KURIKULUM MERDEKA`,
        className: currentClass.name,
        subjectName: currentSubject.name,
        academicYear: `${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
      },
      `Leger_Nilai_ORBITA_${currentClass.name}_${currentSubject.code}`,
      'landscape'
    );
    showToast('Dokumen PDF Leger Nilai berhasil dicetak!');
  };

  const handleDeleteAssessmentClick = (asm: Assessment) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Komponen Penilaian',
      itemName: `${asm.title} (${asm.subjectName} - ${asm.className})`,
      description: `Apakah Anda yakin ingin menghapus komponen penilaian '${asm.title}'? Seluruh nilai siswa untuk komponen ini akan dihapus permanen dari database.`,
      confirmLabel: 'Hapus Komponen',
      onConfirm: () => {
        const remaining = currentAssessments.filter(a => a.id !== asm.id);
        deleteAssessment(asm.id);
        closeDeleteModal();
        if (remaining.length > 0) {
          setSelectedAssessmentId(remaining[0].id);
        } else {
          setSelectedAssessmentId('');
        }
        showToast(`Komponen penilaian '${asm.title}' berhasil dihapus dari database.`);
      },
    });
  };

  const handleResetScoresClick = () => {
    if (!activeAssessment) {
      const zeroMap: Record<string, { score: number; feedback: string }> = {};
      classStudents.forEach(std => {
        zeroMap[std.id] = { score: 0, feedback: '' };
      });
      setScoresInputMap(zeroMap);
      showToast('Seluruh nilai pada tabel berhasil direset ke 0.');
      return;
    }

    setDeleteModalConfig({
      isOpen: true,
      title: 'Reset Nilai Komponen ke 0',
      itemName: `${activeAssessment.title} (${currentClass.name})`,
      description: `Apakah Anda yakin ingin mereset seluruh nilai siswa untuk komponen '${activeAssessment.title}' menjadi 0? Perubahan ini langsung disimpan ke database Cloud Firestore dan disinkronkan ke Leger, Rapor, serta Dashboard.`,
      confirmLabel: 'Reset Nilai ke 0',
      onConfirm: () => {
        const newMap: Record<string, { score: number; feedback: string }> = {};
        classStudents.forEach(std => {
          newMap[std.id] = { score: 0, feedback: '' };
        });
        setScoresInputMap(newMap);
        resetAssessmentScores(activeAssessment.id);
        closeDeleteModal();
        showToast(`Nilai komponen '${activeAssessment.title}' berhasil direset ke 0 & tersinkron ke database!`);
      },
    });
  };

  const handleResetAllSubjectScoresClick = () => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Reset Seluruh Nilai Mata Pelajaran Kelas Ini',
      itemName: `${currentSubject.name} — Kelas ${currentClass.name}`,
      description: `Apakah Anda yakin ingin mereset SEMUA komponen nilai mata pelajaran '${currentSubject.name}' pada kelas ${currentClass.name} menjadi 0 di database? Leger, Rapor, dan Dashboard akan langsung diperbarui.`,
      confirmLabel: 'Reset Semua ke 0',
      onConfirm: () => {
        const newMap: Record<string, { score: number; feedback: string }> = {};
        classStudents.forEach(std => {
          newMap[std.id] = { score: 0, feedback: '' };
        });
        setScoresInputMap(newMap);
        resetClassSubjectAllScores(currentClass.id, currentSubject.id);
        closeDeleteModal();
        showToast(`Seluruh nilai ${currentSubject.name} (${currentClass.name}) berhasil direset ke 0 di database!`);
      },
    });
  };

  // =======================================================================
  // TAB 3: DRAF RAPOR SISWA (100% SYNCED WITH DATABASE & CLOUD FIRESTORE)
  // =======================================================================
  const [reportClassId, setReportClassId] = useState<string>(classes[0]?.id || 'cls-xrpl1');
  const reportCurrentClass = classes.find(c => c.id === reportClassId) || classes[0];
  const reportClassStudents = useMemo(() => {
    return sortDataItems(
      students.filter(
        s => s.classId === reportCurrentClass?.id || s.className === reportCurrentClass?.name
      ),
      sortBy,
      {
        getName: s => s.fullName || (s as any).name || '',
        getNis: s => s.nis,
        getDate: s => s.createdAt || '2025-07-14',
      }
    );
  }, [students, reportCurrentClass?.id, reportCurrentClass?.name, sortBy]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    reportClassStudents[0]?.id || 'std-001'
  );

  useEffect(() => {
    if (
      reportClassStudents.length > 0 &&
      !reportClassStudents.some(s => s.id === selectedStudentId)
    ) {
      setSelectedStudentId(reportClassStudents[0].id);
    }
  }, [reportClassStudents, selectedStudentId]);

  const reportStudent =
    students.find(s => s.id === selectedStudentId) ||
    reportClassStudents[0] ||
    students[0];

  const [isEditingReport, setIsEditingReport] = useState<boolean>(false);

  // Dynamically compute student report card from real database assessmentScores & attendanceRecords,
  // merged with any custom overrides saved in Cloud Firestore (customStudentReports)
  const currentStudentReport = useMemo(() => {
    const existingCustom = customStudentReports[reportStudent?.id];

    // Compute live scores per subject from assessmentScores
    const liveScores: Record<string, { score: number; predicate: string; feedback: string }> = {};
    subjects.forEach(sub => {
      const subAssessments = assessments.filter(
        a =>
          (a.classId === reportCurrentClass?.id || a.className === reportCurrentClass?.name) &&
          a.subjectId === sub.id
      );

      let weightedSum = 0;
      let totalWeight = 0;
      let latestFeedback = '';

      subAssessments.forEach(asm => {
        const sc = assessmentScores.find(
          s => s.assessmentId === asm.id && s.studentId === reportStudent?.id
        );
        if (sc !== undefined) {
          weightedSum += Number(sc.score) * (asm.weight / 100);
          totalWeight += asm.weight;
          if (sc.feedback) latestFeedback = sc.feedback;
        }
      });

      const computedScore =
        totalWeight > 0 ? Math.round(weightedSum / (totalWeight / 100)) : 0;
      const customSubj = existingCustom?.scores?.[sub.id];
      const finalVal =
        customSubj !== undefined ? Number(customSubj.score) : computedScore;
      const pred =
        customSubj?.predicate ||
        (finalVal >= 90 ? 'A' : finalVal >= 80 ? 'B' : finalVal >= 75 ? 'C' : 'D');

      liveScores[sub.id] = {
        score: finalVal,
        predicate: pred,
        feedback:
          customSubj?.feedback ||
          latestFeedback ||
          (finalVal >= sub.kkm
            ? 'Menunjukkan penguasaan kompetensi yang sangat baik sesuai capaian pembelajaran.'
            : finalVal > 0
            ? 'Perlu pendampingan dan pengayaan remedial pada beberapa tujuan pembelajaran.'
            : 'Belum ada nilai yang diinput untuk mata pelajaran ini.'),
      };
    });

    // Compute live attendance from attendanceRecords for this student
    const stdAttRecords = attendanceRecords.filter(r => r.studentId === reportStudent?.id);
    const liveSakit = stdAttRecords.filter(r => r.status === 'S').length;
    const liveIzin = stdAttRecords.filter(r => r.status === 'I').length;
    const liveAlpa = stdAttRecords.filter(r => r.status === 'A').length;

    return {
      scores: liveScores,
      sakit: existingCustom?.sakit !== undefined ? Number(existingCustom.sakit) : liveSakit,
      izin: existingCustom?.izin !== undefined ? Number(existingCustom.izin) : liveIzin,
      alpa: existingCustom?.alpa !== undefined ? Number(existingCustom.alpa) : liveAlpa,
      homeroomNotes:
        existingCustom?.homeroomNotes ??
        `Ananda ${reportStudent?.fullName || 'Siswa'} menunjukkan semangat belajar dan kedisiplinan praktikum yang baik. Terus tingkatkan kompetensi kejuruan dan kolaborasi tim.`,
      statusKenaikan:
        existingCustom?.statusKenaikan ??
        'TUNTAS SELURUH CAPAIAN PEMBELAJARAN (NAIK KELAS)',
      reportDate:
        existingCustom?.reportDate ??
        new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      teacherName:
        existingCustom?.teacherName ??
        (reportCurrentClass?.homeroomTeacherName || 'Siti Rahmawati, S.Pd'),
      teacherNip: existingCustom?.teacherNip ?? '198709232011012012',
      principalName: existingCustom?.principalName ?? 'Drs. H. Suryana, M.M.Pd.',
      principalNip: existingCustom?.principalNip ?? '196803151992031002',
    };
  }, [
    customStudentReports,
    reportStudent,
    reportCurrentClass,
    subjects,
    assessments,
    assessmentScores,
    attendanceRecords,
  ]);

  const [editFormData, setEditFormData] = useState<any>(currentStudentReport);

  useEffect(() => {
    if (!isEditingReport) {
      setEditFormData(currentStudentReport);
    }
  }, [currentStudentReport, isEditingReport]);

  const startEditingCurrentStudent = () => {
    setEditFormData(JSON.parse(JSON.stringify(currentStudentReport)));
    setIsEditingReport(true);
  };

  const handleSaveReport = () => {
    if (!reportStudent) return;
    saveCustomStudentReport(reportStudent.id, editFormData);

    // Also sync edited subject scores back to assessmentScores so Leger & Dashboard stay in sync
    subjects.forEach(sub => {
      const editedSubScore = editFormData?.scores?.[sub.id];
      if (editedSubScore !== undefined) {
        const subAssessments = assessments.filter(
          a =>
            (a.classId === reportCurrentClass?.id || a.className === reportCurrentClass?.name) &&
            a.subjectId === sub.id
        );
        subAssessments.forEach(asm => {
          const otherStudentsScores = reportClassStudents
            .filter(s => s.id !== reportStudent.id)
            .map(s => {
              const ex = assessmentScores.find(
                sc => sc.assessmentId === asm.id && sc.studentId === s.id
              );
              return {
                studentId: s.id,
                score: ex !== undefined ? Number(ex.score) : 0,
                feedback: ex?.feedback || '',
              };
            });
          saveAssessmentScores(asm.id, [
            ...otherStudentsScores,
            {
              studentId: reportStudent.id,
              score: Number(editedSubScore.score) || 0,
              feedback: editedSubScore.feedback || '',
            },
          ]);
        });
      }
    });

    setIsEditingReport(false);
    showToast(
      `Data rapor ${reportStudent.fullName} berhasil disimpan ke Cloud Firestore & disinkronkan ke seluruh menu!`
    );
  };

  const handleResetStudentReportClick = () => {
    if (!reportStudent) return;
    setDeleteModalConfig({
      isOpen: true,
      title: 'Reset Rapor Siswa ke Nilai 0',
      itemName: `Rapor ${reportStudent.fullName} (${reportStudent.className})`,
      description: `Apakah Anda yakin ingin mereset seluruh nilai mata pelajaran pada rapor ${reportStudent.fullName} menjadi 0 dan menyimpannya ke database?`,
      confirmLabel: 'Reset Rapor ke 0',
      onConfirm: () => {
        const zeroReportScores: Record<string, { score: number; predicate: string; feedback: string }> = {};
        subjects.forEach(sub => {
          zeroReportScores[sub.id] = {
            score: 0,
            predicate: 'D',
            feedback: 'Nilai telah direset ke 0.',
          };
        });
        const resetData = {
          ...currentStudentReport,
          scores: zeroReportScores,
          sakit: 0,
          izin: 0,
          alpa: 0,
        };
        saveCustomStudentReport(reportStudent.id, resetData);
        setEditFormData(resetData);
        closeDeleteModal();
        showToast(`Rapor ${reportStudent.fullName} berhasil direset ke 0 & disimpan ke database!`);
      },
    });
  };

  const handleSyncReportFromAcademicClick = () => {
    if (!reportStudent) return;
    resetCustomStudentReport(reportStudent.id);
    setIsEditingReport(false);
    showToast(
      `Rapor ${reportStudent.fullName} disinkronkan ulang dengan Leger Nilai & Presensi terbaru!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-[#D4AF37] bg-[#0B162C] px-4 py-3 text-xs font-bold text-amber-100 shadow-2xl animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Royal Academy Banner & Tabs */}
      <AcademyHeroBanner
        kicker="STANDAR PENILAIAN KOMPETENSI VOKASI — ORBITA"
        title="PENILAIAN AKADEMIK & NILAI SISWA"
        subtitle="Pengelolaan bobot penilaian dinamis, kalkulasi leger nilai akhir otomatis, dan penyusunan transkrip rapor siswa yang tersinkron ke Cloud Firestore."
        icon={GraduationCap}
        rightContent={
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#C8A44B]/50 bg-[#0F1E3A]/90 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab('input')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'input'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Input Nilai
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leger')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'leger'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Rekap &amp; Leger Kelas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reportCard')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reportCard'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Draf Rapor Siswa
            </button>
          </div>
        }
      />

      {/* TAB 1: INPUT NILAI */}
      {activeTab === 'input' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <OrnateCard className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Rombel / Kelas
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full rounded-xl border border-[#DEC896] bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full rounded-xl border border-[#DEC896] bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  className="w-full rounded-xl border border-[#DEC896] bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {currentAssessments.length === 0 ? (
                    <option value="">-- Belum Ada Komponen (Otomatis Dibuat Saat Simpan) --</option>
                  ) : (
                    currentAssessments.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.type.toUpperCase()}] {a.title} ({a.weight}%)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={openCreateAssessmentModal}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 px-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Tambah Komponen</span>
                </button>
                {activeAssessment && (
                  <button
                    type="button"
                    onClick={() => openEditAssessmentModal(activeAssessment)}
                    className="flex items-center justify-center gap-1 rounded-xl border border-[#D4AF37]/60 bg-amber-50 py-2 px-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 cursor-pointer"
                    title="Edit Komponen Penilaian"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </OrnateCard>

          {/* Assessment Header Info & Action Buttons */}
          <OrnateCard className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <h2
                    className="text-sm font-extrabold text-slate-900 dark:text-white"
                    style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', serif" }}
                  >
                    {activeAssessment
                      ? activeAssessment.title
                      : `Penilaian ${currentSubject.name} — ${currentClass.name}`}
                  </h2>
                  {activeAssessment && (
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        activeAssessment.status === 'dipublikasikan'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      }`}
                    >
                      {activeAssessment.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tipe:{' '}
                  <span className="font-semibold capitalize text-slate-700 dark:text-slate-200">
                    {activeAssessment?.type || 'formatif'}
                  </span>{' '}
                  &bull; Bobot:{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {activeAssessment?.weight || 100}%
                  </span>{' '}
                  &bull; KKM:{' '}
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {kkmVal}
                  </span>{' '}
                  &bull; Tanggal: {activeAssessment?.date || new Date().toISOString().split('T')[0]}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <SortByControl value={sortBy} onChange={setSortBy} />

                <button
                  type="button"
                  onClick={handleResetScoresClick}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-700/70 dark:bg-amber-950/60 dark:text-amber-300 transition-colors cursor-pointer"
                  title="Reset seluruh nilai komponen ini ke 0 dan simpan ke database"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Nilai</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAllSubjectScoresClick}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-300 transition-colors cursor-pointer"
                  title="Reset semua komponen nilai mata pelajaran ini ke 0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Reset Semua Mapel</span>
                </button>

                {activeAssessment && (
                  <button
                    type="button"
                    onClick={() => handleDeleteAssessmentClick(activeAssessment)}
                    className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 transition-colors cursor-pointer"
                    title="Hapus Komponen Penilaian ini"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveScores}
                  className="flex items-center gap-1.5 rounded-xl border border-[#D4AF37] bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-50 dark:bg-slate-800 dark:text-white cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5 text-amber-600" />
                  <span>Simpan Nilai</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Publikasikan Nilai</span>
                </button>
              </div>
            </div>
          </OrnateCard>

          {/* Live Session Analytics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <OrnateCard className="p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Rata-rata Nilai</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{avgScore}</p>
              </div>
            </OrnateCard>

            <OrnateCard className="p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <CheckCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Ketuntasan (≥{kkmVal})</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {passedStudentsCount}/{totalScored}
                  </p>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">({passedRate}%)</span>
                </div>
              </div>
            </OrnateCard>

            <OrnateCard className="p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tertinggi / Terendah</p>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {maxScore} <span className="text-xs font-normal text-slate-400">/</span> {minScore}
                </p>
              </div>
            </OrnateCard>

            <OrnateCard className="p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Siswa Remedial</p>
                <p className="text-lg font-black text-rose-600 dark:text-rose-400">
                  {remedialStudentsCount} <span className="text-xs font-medium text-slate-400">siswa</span>
                </p>
              </div>
            </OrnateCard>
          </div>

          {/* Quick-Fill & Search Toolbar */}
          <OrnateCard className="p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 mr-1">
                  <Sliders className="h-3.5 w-3.5 text-amber-500" />
                  <span>Isi Cepat &amp; Sinkron DB:</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleBulkFill(kkmVal)}
                  className="rounded-lg border border-[#DEC896] bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  title={`Set semua siswa ke nilai KKM (${kkmVal}) dan simpan ke database`}
                >
                  Set KKM ({kkmVal})
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkFill(80)}
                  className="rounded-lg border border-[#DEC896] bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  Set 80
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkFill(85)}
                  className="rounded-lg border border-[#DEC896] bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  Set 85
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkFill(90)}
                  className="rounded-lg border border-[#DEC896] bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  Set 90
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkFill(0)}
                  className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 transition-colors cursor-pointer"
                >
                  Kosongkan (Set 0)
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Keyboard className="h-3 w-3 text-amber-500" />
                  <span>
                    Tekan <kbd className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-mono font-bold">Enter</kbd> ke siswa berikutnya
                  </span>
                </div>

                {/* Status Filter */}
                <div className="flex items-center rounded-lg border border-[#DEC896] bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setInputStatusFilter('all')}
                    className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
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
                    className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
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
                    className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
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
                    className="rounded-lg border border-[#DEC896] bg-white py-1 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </OrnateCard>

          {/* Rapid scores entry JRPG table */}
          <OrnateCard className="overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">NISN / NIS</th>
                    <th className="py-3.5 px-4">Nama Siswa (Cadet)</th>
                    <th className="py-3.5 px-4 text-center w-28">Nilai (0-100)</th>
                    <th className="py-3.5 px-4 text-center w-24">Rank / Predikat</th>
                    <th className="py-3.5 px-4 text-center w-28">Status KKM</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Catatan / Umpan Balik Guru</th>
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
                      const currentEntry = scoresInputMap[std.id] || { score: 0, feedback: '' };
                      const scoreVal = Number(currentEntry.score ?? 0);
                      const isPass = scoreVal >= kkmVal;
                      const predicate =
                        scoreVal >= 90
                          ? 'A'
                          : scoreVal >= 80
                          ? 'B'
                          : scoreVal >= 75
                          ? 'C'
                          : 'D';

                      return (
                        <tr key={std.id} className="transition-all">
                          <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            {std.nisn}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {std.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400">NIS: {std.nis}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              id={`score-input-${idx}`}
                              type="number"
                              min="0"
                              max="100"
                              value={scoreVal}
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
                              className={`w-20 text-center font-black text-sm rounded-xl border py-1.5 focus:outline-none transition-all shadow-2xs ${
                                isPass
                                  ? 'border-[#D4AF37]/60 bg-slate-50/70 text-slate-900 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                                  : 'border-rose-300 bg-rose-50/60 text-rose-700 focus:border-rose-500 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                              }`}
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs ${
                                predicate === 'A'
                                  ? 'jrpg-rank-s'
                                  : predicate === 'B'
                                  ? 'jrpg-rank-a'
                                  : predicate === 'C'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                              }`}
                            >
                              {predicate}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                                isPass
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isPass ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
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
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                              />
                              <div className="flex flex-wrap gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleApplyQuickFeedback(std.id, 'Sangat baik, aktif dan menguasai TP')
                                  }
                                  className="text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded px-1.5 py-0.5 transition-colors cursor-pointer"
                                >
                                  ✦ Sangat Baik
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleApplyQuickFeedback(std.id, 'Tuntas sesuai kriteria capaian')
                                  }
                                  className="text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded px-1.5 py-0.5 transition-colors cursor-pointer"
                                >
                                  ✓ Tuntas CP
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleApplyQuickFeedback(std.id, 'Perlu bimbingan dan remedial')
                                  }
                                  className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 rounded px-1.5 py-0.5 transition-colors cursor-pointer"
                                >
                                  ! Remedial
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
          </OrnateCard>
        </div>
      )}

      {/* TAB 2: LEGER & REKAP NILAI KELAS */}
      {activeTab === 'leger' && (
        <div className="space-y-4 animate-fade-in">
          <OrnateCard className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', serif" }}
                >
                  Leger Nilai: {currentClass.name} &bull; {currentSubject.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kalkulasi otomatis nilai akhir terbobot dan predikat kelulusan KKM ({currentSubject.kkm})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <SortByControl value={sortBy} onChange={setSortBy} compact />
                <button
                  type="button"
                  onClick={handleResetAllSubjectScoresClick}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-700/70 dark:bg-amber-950/60 dark:text-amber-300 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Leger (0)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportLegerExcel}
                  className="flex items-center gap-1.5 rounded-xl border border-[#D4AF37] bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-amber-50 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-emerald-600" /> Unduh Leger Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportLegerPdf}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Cetak PDF Resmi
                </button>
              </div>
            </div>
          </OrnateCard>

          <OrnateCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th className="py-3.5 px-3 text-center">No</th>
                    <th className="py-3.5 px-3">NISN</th>
                    <th className="py-3.5 px-3">Nama Siswa</th>
                    {currentAssessments.map(asm => (
                      <th key={asm.id} className="py-3.5 px-3 text-center">
                        <div>{asm.title.split(':')[0]}</div>
                        <div className="text-[10px] font-normal text-amber-200/80">({asm.weight}%)</div>
                      </th>
                    ))}
                    <th className="py-3.5 px-3 text-center font-extrabold">Nilai Akhir</th>
                    <th className="py-3.5 px-3 text-center font-bold">Predikat</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {legerData.map(r => (
                    <tr key={r.studentId}>
                      <td className="py-2.5 px-3 text-center text-slate-400">{r.no}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {r.nisn}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {r.fullName}
                      </td>
                      {currentAssessments.map(asm => (
                        <td
                          key={asm.id}
                          className="py-2.5 px-3 text-center font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {r.scores[asm.id] ?? 0}
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-center font-black text-sm text-blue-600 dark:text-amber-300 bg-blue-50/30 dark:bg-blue-950/30">
                        {r.finalScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">{r.predicate}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            r.isPassed
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          }`}
                        >
                          {r.isPassed ? 'Tuntas' : 'Remedial'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </OrnateCard>
        </div>
      )}

      {/* TAB 3: DRAF RAPOR SISWA */}
      {activeTab === 'reportCard' && (
        <div className="space-y-4 animate-fade-in">
          {/* Top Bar: Per-Class Selector, Student Selector, Edit Mode, Reset, and Print */}
          <OrnateCard className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pilih Kelas:
                  </label>
                  <select
                    value={reportClassId}
                    onChange={e => {
                      const newClassId = e.target.value;
                      setReportClassId(newClassId);
                      const targetClass = classes.find(c => c.id === newClassId);
                      const classStds = students.filter(
                        s => s.classId === newClassId || s.className === targetClass?.name
                      );
                      if (classStds.length > 0) {
                        setSelectedStudentId(classStds[0].id);
                      }
                    }}
                    className="rounded-xl border border-[#DEC896] bg-slate-50 py-1.5 px-3 text-xs font-bold text-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.majorCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Siswa:
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="rounded-xl border border-[#DEC896] bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                      const currentIndex = reportClassStudents.findIndex(
                        s => s.id === selectedStudentId
                      );
                      if (currentIndex > 0) {
                        setSelectedStudentId(reportClassStudents[currentIndex - 1].id);
                      }
                    }}
                    disabled={
                      reportClassStudents.findIndex(s => s.id === selectedStudentId) <= 0
                    }
                    className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                    title="Siswa Sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = reportClassStudents.findIndex(
                        s => s.id === selectedStudentId
                      );
                      if (
                        currentIndex >= 0 &&
                        currentIndex < reportClassStudents.length - 1
                      ) {
                        setSelectedStudentId(reportClassStudents[currentIndex + 1].id);
                      }
                    }}
                    disabled={
                      reportClassStudents.findIndex(s => s.id === selectedStudentId) >=
                      reportClassStudents.length - 1
                    }
                    className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                    title="Siswa Berikutnya"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions: Edit Mode Toggle, Reset, Sync, Print, Export PDF */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSyncReportFromAcademicClick}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 py-2 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer"
                  title="Sinkronkan ulang nilai & presensi rapor dari data Leger & Absensi terbaru"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Sinkronkan Data</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetStudentReportClick}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 py-2 px-3 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 cursor-pointer"
                  title="Reset seluruh nilai pada rapor siswa ini menjadi 0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Nilai Rapor</span>
                </button>

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
                    const headers = [
                      'No',
                      'Mata Pelajaran',
                      'KKM',
                      'Nilai Akhir',
                      'Predikat',
                      'Capaian Kompetensi',
                    ];
                    const rows = subjects.map((subj, index) => {
                      const item = currentStudentReport.scores[subj.id] || {
                        score: 0,
                        predicate: 'D',
                        feedback: '-',
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
                        title: 'TRANSKRIP DRAF RAPOR HASIL BELAJAR SISWA — ORBITA',
                        studentName: `${reportStudent.fullName} (NISN: ${reportStudent.nisn})`,
                        className: `${reportCurrentClass.name} (${reportCurrentClass.majorCode})`,
                        academicYear: `T.A. ${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
                      },
                      `Draf_Rapor_ORBITA_${reportStudent.fullName.replace(/\s+/g, '_')}`,
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
                    showToast(
                      `Dokumen PDF draf rapor untuk ${reportStudent.fullName} berhasil dicetak.`
                    );
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak PDF Resmi</span>
                </button>
              </div>
            </div>
          </OrnateCard>

          {/* PANEL MODE EDIT RAPOR SISWA */}
          {isEditingReport ? (
            <OrnateCard className="p-6 space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DEC896]/60 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-amber-500" />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Form Edit Rapor: {reportStudent.fullName} ({reportStudent.nisn})
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ubah nilai akhir, capaian kompetensi, kehadiran, catatan wali kelas, dan NIP penandatangan (Tersimpan ke Database)
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
                <div className="overflow-x-auto rounded-xl border border-[#DEC896] bg-white dark:border-slate-700 dark:bg-slate-800/80">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr>
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
                        const currentScore = editFormData.scores?.[sub.id]?.score ?? 0;
                        const currentPred = editFormData.scores?.[sub.id]?.predicate ?? 'D';
                        const currentFeedback = editFormData.scores?.[sub.id]?.feedback ?? '';

                        return (
                          <tr key={sub.id}>
                            <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900 dark:text-white">
                              {sub.name}
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {sub.code}
                              </span>
                            </td>
                            <td className="p-2 text-center font-medium">{sub.kkm}</td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={currentScore}
                                onChange={e => {
                                  const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                  const autoPred =
                                    val >= 90 ? 'A' : val >= 80 ? 'B' : val >= 75 ? 'C' : 'D';
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
                                className="w-16 rounded border border-slate-200 bg-slate-50 py-1 text-center font-bold text-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:text-amber-300 focus:outline-none"
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
                <div className="rounded-xl border border-[#DEC896] bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-2">
                    2. Ketidakhadiran Semester Ini
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Sakit (Hari)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.sakit}
                        onChange={e =>
                          setEditFormData((prev: any) => ({
                            ...prev,
                            sakit: Math.max(0, Number(e.target.value) || 0),
                          }))
                        }
                        className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-bold text-blue-600 text-center dark:border-slate-600 dark:bg-slate-700 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Izin (Hari)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.izin}
                        onChange={e =>
                          setEditFormData((prev: any) => ({
                            ...prev,
                            izin: Math.max(0, Number(e.target.value) || 0),
                          }))
                        }
                        className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-bold text-amber-600 text-center dark:border-slate-600 dark:bg-slate-700 dark:text-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Alpa (Hari)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.alpa}
                        onChange={e =>
                          setEditFormData((prev: any) => ({
                            ...prev,
                            alpa: Math.max(0, Number(e.target.value) || 0),
                          }))
                        }
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
                      onChange={e =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          statusKenaikan: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 text-xs font-bold text-emerald-600 dark:border-slate-600 dark:bg-slate-700 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#DEC896] bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1">
                    3. Catatan &amp; Motivasi Wali Kelas
                  </span>
                  <textarea
                    rows={4}
                    value={editFormData.homeroomNotes}
                    onChange={e =>
                      setEditFormData((prev: any) => ({
                        ...prev,
                        homeroomNotes: e.target.value,
                      }))
                    }
                    placeholder="Tuliskan catatan perkembangan kepribadian, kedisiplinan dan motivasi belajar siswa..."
                    className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs italic dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Titimangsa & Tanda Tangan Penandatangan */}
              <div className="rounded-xl border border-[#DEC896] bg-white p-4 dark:border-slate-700 dark:bg-slate-800 space-y-3">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                  4. Pengaturan Penandatangan Dokumen Rapor (NIP Guru &amp; Kepala Sekolah)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      Tanggal Pembagian Rapor
                    </label>
                    <input
                      type="text"
                      value={editFormData.reportDate}
                      onChange={e =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          reportDate: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-semibold dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      Nama Wali Kelas
                    </label>
                    <input
                      type="text"
                      value={editFormData.teacherName}
                      onChange={e =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          teacherName: e.target.value,
                        }))
                      }
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
                      onChange={e =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          teacherNip: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-mono font-bold text-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={editFormData.principalNip}
                      onChange={e =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          principalNip: e.target.value,
                        }))
                      }
                      className="w-full rounded border border-slate-200 bg-slate-50 p-1.5 font-mono dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Save Action */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#DEC896]/60 dark:border-slate-800">
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
            </OrnateCard>
          ) : (
            /* PANEL PRATINJAU RAPOR RESMI LEMBARAN */
            <OrnateCard className="p-8 max-w-4xl mx-auto printable-card">
              {/* Kop Yayasan */}
              <div className="text-center border-b-2 border-slate-900 pb-4 dark:border-amber-500/40">
                <h3 className="text-sm font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                  Yayasan Mardi Yuana
                </h3>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase mt-0.5">
                  SMK Mardi Yuana Cikembar — ORBITA
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Jl. Pelabuhan II KM. 19 Cikembar, Kabupaten Sukabumi, Jawa Barat 43359 | NPSN: 20253654
                </p>
              </div>

              <div className="text-center my-4">
                <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white underline tracking-wide">
                  Laporan Hasil Belajar Tengah Semester
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tahun Ajaran {activeAcademicYear.name} - Semester{' '}
                  {activeAcademicYear.activeSemester.toUpperCase()}
                </p>
              </div>

              {/* Student Info Box */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl dark:bg-slate-800/60 border border-[#DEC896]/60 dark:border-slate-700">
                <div>
                  <p>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Nama Siswa:</span>{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {reportStudent.fullName}
                    </strong>
                  </p>
                  <p className="mt-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">NISN / NIS:</span>{' '}
                    {reportStudent.nisn} / {reportStudent.nis}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Kelas / Jurusan:
                    </span>{' '}
                    <strong>{reportStudent.className}</strong> ({reportStudent.majorCode})
                  </p>
                  <p className="mt-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Wali Kelas:</span>{' '}
                    {currentStudentReport.teacherName}
                  </p>
                </div>
              </div>

              {/* Subject scores table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700">
                  <thead>
                    <tr>
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5">Mata Pelajaran</th>
                      <th className="p-2.5 text-center w-16">KKM</th>
                      <th className="p-2.5 text-center w-20">Nilai Akhir</th>
                      <th className="p-2.5 text-center w-16">Predikat</th>
                      <th className="p-2.5">Capaian Kompetensi &amp; Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {subjects.map((subj, index) => {
                      const item = currentStudentReport.scores[subj.id] || {
                        score: 0,
                        predicate: 'D',
                        feedback: '-',
                      };

                      return (
                        <tr key={subj.id}>
                          <td className="p-2 text-center">{index + 1}</td>
                          <td className="p-2 font-bold text-slate-900 dark:text-white">
                            {subj.name}
                          </td>
                          <td className="p-2 text-center">{subj.kkm}</td>
                          <td className="p-2 text-center font-black text-blue-600 dark:text-amber-300">
                            {item.score}
                          </td>
                          <td className="p-2 text-center font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.predicate === 'A'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : item.predicate === 'B'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : item.predicate === 'C'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
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
              </div>

              {/* Attendance & Catatan Wali Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs mb-6">
                <div className="border border-[#DEC896] p-3.5 rounded-xl dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Ketidakhadiran Semester Ini:
                  </span>
                  <p>
                    Sakit (S): <strong>{currentStudentReport.sakit}</strong> hari
                  </p>
                  <p>
                    Izin (I): <strong>{currentStudentReport.izin}</strong> hari
                  </p>
                  <p>
                    Tanpa Keterangan (A): <strong>{currentStudentReport.alpa}</strong> hari
                  </p>
                  <p className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Status: {currentStudentReport.statusKenaikan}
                  </p>
                </div>

                <div className="border border-[#DEC896] p-3.5 rounded-xl dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Catatan &amp; Motivasi Wali Kelas:
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    "{currentStudentReport.homeroomNotes}"
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Orang Tua / Wali Siswa</p>
                  <div className="h-14 flex items-end">
                    <p className="font-bold underline text-slate-400 italic">
                      (....................................)
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-between">
                  <div>
                    <p>Cikembar, {currentStudentReport.reportDate}</p>
                    <p className="mt-1 font-semibold">Wali Kelas,</p>
                  </div>
                  <div className="mt-8 font-bold">
                    <p className="underline text-slate-900 dark:text-white">
                      {currentStudentReport.teacherName}
                    </p>
                    <p className="font-mono font-medium text-slate-600 dark:text-slate-400">
                      NIP. {currentStudentReport.teacherNip}
                    </p>
                  </div>
                </div>
              </div>
            </OrnateCard>
          )}
        </div>
      )}

      {/* CREATE / EDIT ASSESSMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border-2 border-[#D4AF37] bg-white p-6 shadow-2xl dark:bg-[#0B162C]">
            <h2
              className="text-base font-extrabold text-slate-900 dark:text-white mb-1"
              style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', serif" }}
            >
              {editingAssessmentId ? 'Edit Komponen Penilaian' : 'Buat Komponen Penilaian Baru'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Kelas: {currentClass.name} &bull; Mapel: {currentSubject.name}
            </p>

            <form onSubmit={handleSaveAssessmentForm} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Judul / Materi Penilaian
                </label>
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
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Jenis Penilaian
                  </label>
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
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bobot Nilai (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newWeight}
                    onChange={e => setNewWeight(parseInt(e.target.value, 10) || 20)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    KKM Minimum
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newKkm}
                    onChange={e => setNewKkm(parseInt(e.target.value, 10) || 75)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tanggal Pelaksanaan
                  </label>
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
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {editingAssessmentId ? 'Simpan Perubahan' : 'Buat Penilaian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Delete / Reset Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title={deleteModalConfig.title}
        itemName={deleteModalConfig.itemName}
        description={deleteModalConfig.description}
        confirmLabel={deleteModalConfig.confirmLabel}
        onConfirm={deleteModalConfig.onConfirm}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};
