import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Users,
  Award,
  Filter,
  Eye,
  FileCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Table,
  Palette,
  Upload,
  Image as ImageIcon,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  Search,
  Sliders,
  PenTool,
  Scroll,
  Crown,
  Swords,
  Gem,
  Hourglass,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  exportToExcel,
  exportToPdf,
  exportToCsv,
  exportLegerExcelWithFormulas,
  exportAttendanceExcelWithFormulas,
  ReportCustomConfig,
} from '../../utils/exportUtils';
import { exportToGoogleSheets } from '../../utils/googleSheetsUtils';
import { AcademyHeroBanner } from '../common/AcademyOrnaments';
import { SortByControl, SortOption, sortDataItems } from '../common/SortByControl';
import { LiquidNavBar } from '../common/LiquidNavBar';

export const ReportsModule: React.FC = () => {
  const {
    students,
    classes,
    subjects,
    activeAcademicYear,
    attendanceSessions,
    attendanceRecords,
    assessments,
    assessmentScores,
    saveAssessmentScores,
    createAssessment,
    resetClassSubjectAllScores,
    reportTemplate,
    saveReportTemplate,
    customStudentReports,
  } = useApp();

  const [activeMainTab, setActiveMainTab] = useState<'export' | 'spreadsheet' | 'designer'>('export');

  // Report Filter State
  const [reportType, setReportType] = useState<
    'attendance_class' | 'grade_class' | 'grade_subject' | 'student_transcript'
  >('attendance_class');

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('az');

  // Google Sheets state
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [sheetSuccessUrl, setSheetSuccessUrl] = useState<string | null>(null);
  const [sheetErrorMsg, setSheetErrorMsg] = useState<string | null>(null);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const classStudents = useMemo(() => {
    return sortDataItems(
      students.filter(s => s.className === currentClass?.name),
      sortBy,
      {
        getName: s => s.fullName || s.name,
        getNis: s => s.nis,
        getDate: s => s.enrollmentDate || '2025-07-14',
      }
    );
  }, [students, currentClass, sortBy]);

  // Keep selected student synced with class students
  useEffect(() => {
    if (classStudents.length > 0) {
      if (!classStudents.some(s => s.id === selectedStudentId)) {
        setSelectedStudentId(classStudents[0].id);
      }
    } else {
      setSelectedStudentId('');
    }
  }, [classStudents, selectedStudentId]);

  const activeStudent = useMemo(() => {
    return classStudents.find(s => s.id === selectedStudentId) || classStudents[0] || students[0];
  }, [classStudents, selectedStudentId, students]);

  // Filtered assessments for current class & subject
  const currentAssessments = useMemo(() => {
    return assessments.filter(
      a => a.classId === currentClass?.id && a.subjectId === currentSubject?.id
    );
  }, [assessments, currentClass, currentSubject]);

  // --- PDF Designer State ---
  const [designerConfig, setDesignerConfig] = useState<ReportCustomConfig>(reportTemplate);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewShowAllRows, setPreviewShowAllRows] = useState<boolean>(false);
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false);
  const rowsPerPage = 10;

  const pdfDocumentCatalog: Array<{
    type: 'attendance_class' | 'grade_class' | 'grade_subject' | 'student_transcript';
    number: number;
    shortLabel: string;
    fullTitle: string;
    orientation: 'Portrait A4' | 'Landscape A4';
    desc: string;
  }> = [
    {
      type: 'attendance_class',
      number: 1,
      shortLabel: '1. Rekap Presensi',
      fullTitle: 'REKAPITULASI PRESENSI KEHADIRAN SISWA',
      orientation: 'Landscape A4',
      desc: 'Dokumen kehadiran harian & persentase ketertiban siswa per kelas',
    },
    {
      type: 'grade_class',
      number: 2,
      shortLabel: '2. Leger Nilai Kelas',
      fullTitle: 'LEGER NILAI AKADEMIK RESMI KELAS',
      orientation: 'Landscape A4',
      desc: 'Dokumen leger nilai seluruh mata pelajaran, rata-rata & peringkat kelas',
    },
    {
      type: 'grade_subject',
      number: 3,
      shortLabel: '3. Nilai per Mapel',
      fullTitle: `REKAPITULASI NILAI MATA PELAJARAN: ${currentSubject?.name || ''}`,
      orientation: 'Portrait A4',
      desc: 'Dokumen rincian nilai Tugas (20%), Praktik (30%), Formatif (20%) & Sumatif (30%)',
    },
    {
      type: 'student_transcript',
      number: 4,
      shortLabel: '4. Rapor Siswa',
      fullTitle: 'LAPORAN HASIL CAPAIAN PEMBELAJARAN SISWA (RAPOR)',
      orientation: 'Portrait A4',
      desc: 'Dokumen transkrip rapor individu siswa satu per satu beserta catatan wali kelas',
    },
  ];

  const activeDocIndex = Math.max(
    0,
    pdfDocumentCatalog.findIndex(d => d.type === reportType)
  );
  const activeDocMeta = pdfDocumentCatalog[activeDocIndex] || pdfDocumentCatalog[0];

  const stepDocument = (dir: -1 | 1) => {
    const nextIdx = (activeDocIndex + dir + pdfDocumentCatalog.length) % pdfDocumentCatalog.length;
    setReportType(pdfDocumentCatalog[nextIdx].type);
    setPreviewPage(1);
  };

  const activeClassIndex = Math.max(0, classes.findIndex(c => c.id === currentClass?.id));
  const stepClass = (dir: -1 | 1) => {
    if (classes.length === 0) return;
    const nextIdx = (activeClassIndex + dir + classes.length) % classes.length;
    setSelectedClassId(classes[nextIdx].id);
    setPreviewPage(1);
  };

  const activeSubjectIndex = Math.max(0, subjects.findIndex(s => s.id === currentSubject?.id));
  const stepSubject = (dir: -1 | 1) => {
    if (subjects.length === 0) return;
    const nextIdx = (activeSubjectIndex + dir + subjects.length) % subjects.length;
    setSelectedSubjectId(subjects[nextIdx].id);
    setPreviewPage(1);
  };

  const activeStudentIndex = Math.max(0, classStudents.findIndex(s => s.id === activeStudent?.id));
  const stepStudent = (dir: -1 | 1) => {
    if (classStudents.length === 0) return;
    const nextIdx = (activeStudentIndex + dir + classStudents.length) % classStudents.length;
    setSelectedStudentId(classStudents[nextIdx].id);
  };

  const totalPreviewPages = useMemo(() => {
    if (reportType === 'student_transcript' || previewShowAllRows) return 1;
    return Math.max(1, Math.ceil(classStudents.length / rowsPerPage));
  }, [reportType, previewShowAllRows, classStudents.length]);

  useEffect(() => {
    if (previewPage > totalPreviewPages) {
      setPreviewPage(1);
    }
  }, [previewPage, totalPreviewPages]);

  // Sync if reportTemplate updates from cloud
  useEffect(() => {
    setDesignerConfig(reportTemplate);
  }, [reportTemplate]);

  // Handle Logo Upload (converts image to base64 Data URL)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file logo maksimal 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      setDesignerConfig(prev => ({
        ...prev,
        logoDataUrl: dataUrl,
      }));
      showToast('Logo instansi berhasil diunggah dengan penskalaan proporsional.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Left Signer Signature Image Upload (TTD perorangan)
  const handleLeftSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      setDesignerConfig(prev => ({
        ...prev,
        leftSignerSignatureUrl: dataUrl,
      }));
      showToast('Gambar TTD Guru / Wali Kelas berhasil diunggah.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Right Signer Signature Image Upload (TTD Kepala Sekolah)
  const handleRightSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      setDesignerConfig(prev => ({
        ...prev,
        rightSignerSignatureUrl: dataUrl,
      }));
      showToast('Gambar TTD Kepala Sekolah berhasil diunggah.');
    };
    reader.readAsDataURL(file);
  };

  // Save Designer Configuration to Cloud Firestore
  const handleSaveDesignerToCloud = () => {
    saveReportTemplate(designerConfig);
    showToast('Tata letak PDF, logo proporsional, NIP guru, dan tanda tangan tersimpan ke cloud!');
  };

  // --- Interactive Spreadsheet State ---
  const [sheetType, setSheetType] = useState<'penilaian' | 'absensi'>('penilaian');
  // Editable spreadsheet data map synced with live assessmentScores
  const [editableScores, setEditableScores] = useState<Record<string, Record<string, number>>>(() => {
    const map: Record<string, Record<string, number>> = {};
    students.forEach(std => {
      map[std.id] = {
        tugas: 0,
        praktik: 0,
        formatif: 0,
        sumatif: 0,
      };
    });
    return map;
  });

  useEffect(() => {
    setEditableScores(prev => {
      const next = { ...prev };
      classStudents.forEach(std => {
        const stdScores = assessmentScores.filter(sc => sc.studentId === std.id);
        const getScoreByType = (type: string) => {
          const typeAss = currentAssessments.filter(a => a.type === type);
          if (typeAss.length === 0) return 0;
          const matching = stdScores.filter(s => typeAss.some(a => a.id === s.assessmentId));
          if (matching.length === 0) return 0;
          const sum = matching.reduce((acc, curr) => acc + Number(curr.score || 0), 0);
          return Math.round(sum / matching.length);
        };
        next[std.id] = {
          tugas: getScoreByType('tugas'),
          praktik: getScoreByType('praktik'),
          formatif: getScoreByType('formatif'),
          sumatif: getScoreByType('sumatif'),
        };
      });
      return next;
    });
  }, [classStudents, assessmentScores, currentAssessments]);

  const handleScoreCellEdit = (studentId: string, col: string, val: string) => {
    const num = Math.min(100, Math.max(0, parseInt(val) || 0));
    setEditableScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [col]: num,
      },
    }));
  };

  // -------------------------------------------------------------
  // COMPUTED REAL DATA FOR EACH REPORT TYPE
  // -------------------------------------------------------------

  // 1. Attendance Data per Student for current class (100% synced with Presensi Database)
  const classAttendanceData = useMemo(() => {
    return classStudents.map((std, idx) => {
      const stdRecords = attendanceRecords.filter(r => r.studentId === std.id);
      const h = stdRecords.filter(r => r.status === 'H').length;
      const s = stdRecords.filter(r => r.status === 'S').length;
      const i = stdRecords.filter(r => r.status === 'I').length;
      const a = stdRecords.filter(r => r.status === 'A').length;
      const t = stdRecords.filter(r => r.status === 'T').length;
      const total = h + s + i + a + t;
      const rateNum = total > 0 ? ((h + t) / total) * 100 : 100;
      const rate = rateNum.toFixed(1) + '%';
      const statusLabel =
        total === 0
          ? 'Belum Ada Sesi'
          : rateNum >= 90
          ? 'Sangat Baik'
          : rateNum >= 80
          ? 'Baik'
          : rateNum >= 75
          ? 'Cukup'
          : 'Perlu Pembinaan';

      return {
        no: idx + 1,
        studentId: std.id,
        nisn: std.nisn,
        nis: std.nis,
        fullName: std.fullName,
        className: std.className,
        h,
        s,
        i,
        a,
        t,
        total,
        rateNum,
        rate,
        statusLabel,
      };
    });
  }, [classStudents, attendanceRecords]);

  // 2. Class Leger Data (All subjects for each student in current class)
  const classLegerData = useMemo(() => {
    const list = classStudents.map((std, idx) => {
      const subjectScores: Record<string, number> = {};
      let totalScore = 0;
      const savedCustomReport = customStudentReports?.[std.id];

      subjects.forEach(sub => {
        const subAssessments = assessments.filter(
          a => a.classId === currentClass?.id && a.subjectId === sub.id
        );
        const matchingScores = assessmentScores.filter(
          sc => sc.studentId === std.id && subAssessments.some(a => a.id === sc.assessmentId)
        );
        let score = 0;
        const customOverride = savedCustomReport?.subjects?.[sub.id];
        if (customOverride && typeof customOverride.score === 'number') {
          score = customOverride.score;
        } else if (matchingScores.length > 0) {
          let wSum = 0;
          let wTot = 0;
          subAssessments.forEach(a => {
            const found = matchingScores.find(m => m.assessmentId === a.id);
            const val = found !== undefined ? Number(found.score) : 0;
            const w = a.weight > 0 ? a.weight : 25;
            wSum += val * w;
            wTot += w;
          });
          score = wTot > 0 ? Math.round(wSum / wTot) : 0;
        } else if (sub.id === currentSubject?.id && editableScores[std.id]) {
          const sc = editableScores[std.id];
          score = Math.round((sc.tugas * 0.2) + (sc.praktik * 0.3) + (sc.formatif * 0.2) + (sc.sumatif * 0.3));
        }
        subjectScores[sub.id] = score;
        totalScore += score;
      });

      const avg = subjects.length > 0 ? Math.round(totalScore / subjects.length) : 0;
      const predicate = avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 75 ? 'C' : 'D';
      const isPassed = avg >= 75;

      return {
        no: idx + 1,
        studentId: std.id,
        nisn: std.nisn,
        nis: std.nis,
        fullName: std.fullName,
        subjectScores,
        average: avg,
        predicate,
        isPassed,
      };
    });

    // Sort by average descending for class rank
    const sorted = [...list].sort((a, b) => b.average - a.average);
    const rankMap = new Map<string, number>();
    sorted.forEach((item, index) => {
      rankMap.set(item.studentId, index + 1);
    });

    return list.map(item => ({
      ...item,
      rank: rankMap.get(item.studentId) || 1,
    }));
  }, [classStudents, subjects, assessmentScores, assessments, editableScores, currentClass, currentSubject, customStudentReports]);

  // 3. Subject-Specific Grading Data for current class & subject
  const subjectGradingData = useMemo(() => {
    return classStudents.map((std, idx) => {
      const sc = editableScores[std.id] || { tugas: 0, praktik: 0, formatif: 0, sumatif: 0 };
      const finalScore = Math.round((sc.tugas * 0.2) + (sc.praktik * 0.3) + (sc.formatif * 0.2) + (sc.sumatif * 0.3));
      const predicate = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 75 ? 'C' : 'D';
      const isPassed = finalScore >= (currentSubject?.kkm || 75);
      const competencyFeedback =
        finalScore >= 90
          ? 'Sangat menguasai seluruh capaian pembelajaran dan kompetensi inti'
          : finalScore >= 80
          ? 'Menguasai capaian pembelajaran dengan baik dan mandiri'
          : finalScore >= 75
          ? 'Mencapai kriteria ketuntasan minimal, perlu penguatan praktik'
          : finalScore > 0
          ? 'Belum mencapai KKM, direkomendasikan bimbingan remedial'
          : 'Nilai belum diinput / telah direset';

      return {
        no: idx + 1,
        studentId: std.id,
        nisn: std.nisn,
        nis: std.nis,
        fullName: std.fullName,
        tugas: sc.tugas,
        praktik: sc.praktik,
        formatif: sc.formatif,
        sumatif: sc.sumatif,
        finalScore,
        predicate,
        isPassed,
        feedback: competencyFeedback,
      };
    });
  }, [classStudents, editableScores, currentSubject]);

  // 4. Student Transcript (Individual Report Card Data)
  const studentTranscriptData = useMemo(() => {
    if (!activeStudent) return null;
    const savedCustomReport = customStudentReports?.[activeStudent.id];

    const subjectsList = subjects.map((sub, index) => {
      const subAssessments = assessments.filter(
        a => a.classId === activeStudent.classId && a.subjectId === sub.id
      );
      const matchingScores = assessmentScores.filter(
        sc => sc.studentId === activeStudent.id && subAssessments.some(a => a.id === sc.assessmentId)
      );
      let score = 0;
      const customOverride = savedCustomReport?.subjects?.[sub.id];
      if (customOverride && typeof customOverride.score === 'number') {
        score = customOverride.score;
      } else if (matchingScores.length > 0) {
        let wSum = 0;
        let wTot = 0;
        subAssessments.forEach(a => {
          const found = matchingScores.find(m => m.assessmentId === a.id);
          const val = found !== undefined ? Number(found.score) : 0;
          const w = a.weight > 0 ? a.weight : 25;
          wSum += val * w;
          wTot += w;
        });
        score = wTot > 0 ? Math.round(wSum / wTot) : 0;
      } else if (sub.id === currentSubject?.id && editableScores[activeStudent.id]) {
        const sc = editableScores[activeStudent.id];
        score = Math.round((sc.tugas * 0.2) + (sc.praktik * 0.3) + (sc.formatif * 0.2) + (sc.sumatif * 0.3));
      }
      const predicate =
        customOverride?.predicate ||
        (score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 75 ? 'C' : 'D');
      const isPassed = score >= sub.kkm;
      const feedback =
        customOverride?.description ||
        (score >= 90
          ? 'Menunjukkan penguasaan sangat baik dalam teori dan praktik kejuruan.'
          : score >= 80
          ? 'Menunjukkan penguasaan baik dan aktif dalam pengerjaan proyek.'
          : score >= sub.kkm
          ? 'Tuntas mencapai standar minimum, terus tingkatkan ketelitian.'
          : score > 0
          ? 'Perlu bimbingan remedial pada indikator kompetensi dasar.'
          : 'Nilai belum diinput / telah direset.');

      return {
        no: index + 1,
        subjectId: sub.id,
        code: sub.code,
        name: sub.name,
        kkm: sub.kkm,
        score,
        predicate,
        isPassed,
        feedback,
      };
    });

    const totalScore = subjectsList.reduce((acc, curr) => acc + curr.score, 0);
    const averageScore = subjectsList.length > 0 ? Math.round(totalScore / subjectsList.length) : 0;

    // Student attendance stats
    const attInfo = classAttendanceData.find(a => a.studentId === activeStudent.id) || {
      h: 0,
      s: 0,
      i: 0,
      a: 0,
      t: 0,
      rate: '100.0%',
    };

    return {
      student: activeStudent,
      subjectsList,
      totalScore,
      averageScore,
      attendance: attInfo,
    };
  }, [activeStudent, subjects, assessmentScores, assessments, editableScores, classAttendanceData, currentSubject, customStudentReports]);

  // -------------------------------------------------------------
  // EXPORT HANDLERS SYNCHRONIZED BY REPORT TYPE
  // -------------------------------------------------------------

  // PDF Export
  const handleDownloadPdf = () => {
    if (reportType === 'attendance_class') {
      const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Telat', 'Persentase %', 'Status'];
      const rows = classAttendanceData.map(r => [
        r.no,
        r.nisn,
        r.fullName,
        r.className,
        r.h,
        r.s,
        r.i,
        r.a,
        r.t,
        r.rate,
        r.statusLabel,
      ]);

      exportToPdf(
        headers,
        rows,
        {
          title: `REKAPITULASI PRESENSI KEHADIRAN SISWA`,
          className: currentClass.name,
          academicYear: `${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
        },
        `Rekap_Presensi_${currentClass.name}`,
        'landscape',
        designerConfig
      );
      showToast('Dokumen PDF rekap presensi kelas berhasil dicetak.');
    } else if (reportType === 'grade_class') {
      const headers = ['No', 'NISN', 'Nama Siswa', ...subjects.map(s => s.code), 'Rata-rata', 'Predikat', 'Rank', 'Status'];
      const rows = classLegerData.map(r => [
        r.no,
        r.nisn,
        r.fullName,
        ...subjects.map(s => r.subjectScores[s.id] || 0),
        r.average,
        r.predicate,
        `#${r.rank}`,
        r.isPassed ? 'TUNTAS' : 'REMEDIAL',
      ]);

      exportToPdf(
        headers,
        rows,
        {
          title: `LEGER NILAI AKADEMIK RESMI KELAS`,
          className: currentClass.name,
          academicYear: `${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
        },
        `Leger_Nilai_${currentClass.name}`,
        'landscape',
        designerConfig
      );
      showToast('Dokumen PDF leger nilai kelas berhasil dicetak.');
    } else if (reportType === 'grade_subject') {
      const headers = ['No', 'NISN', 'Nama Siswa', 'Tugas (20%)', 'Praktik (30%)', 'Formatif (20%)', 'Sumatif (30%)', 'Nilai Akhir', 'Predikat', 'Status KKM'];
      const rows = subjectGradingData.map(r => [
        r.no,
        r.nisn,
        r.fullName,
        r.tugas,
        r.praktik,
        r.formatif,
        r.sumatif,
        r.finalScore,
        r.predicate,
        r.isPassed ? 'TUNTAS' : 'REMEDIAL',
      ]);

      exportToPdf(
        headers,
        rows,
        {
          title: `REKAP NILAI MATA PELAJARAN: ${currentSubject.name}`,
          className: currentClass.name,
          subjectName: `${currentSubject.name} (KKM: ${currentSubject.kkm})`,
          academicYear: `${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
        },
        `Rekap_Nilai_${currentClass.name}_${currentSubject.code}`,
        'portrait',
        designerConfig
      );
      showToast('Dokumen PDF rekap nilai mata pelajaran berhasil dicetak.');
    } else {
      // student_transcript
      if (!studentTranscriptData) return;
      const headers = ['No', 'Kode', 'Mata Pelajaran', 'KKM', 'Nilai Angka', 'Predikat', 'Capaian Kompetensi'];
      const rows = studentTranscriptData.subjectsList.map(s => [
        s.no,
        s.code,
        s.name,
        s.kkm,
        s.score,
        s.predicate,
        s.feedback,
      ]);

      exportToPdf(
        headers,
        rows,
        {
          title: `TRANSKRIP RAPOR CAPAIAN HASIL BELAJAR SISWA`,
          studentName: `${studentTranscriptData.student.fullName} (NISN: ${studentTranscriptData.student.nisn})`,
          className: `${studentTranscriptData.student.className} (${studentTranscriptData.student.majorCode})`,
          academicYear: `${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
        },
        `Rapor_${studentTranscriptData.student.fullName.replace(/\s+/g, '_')}`,
        'portrait',
        designerConfig
      );
      showToast(`Rapor resmi untuk ${studentTranscriptData.student.fullName} berhasil dicetak.`);
    }
  };

  // Excel Export
  const handleDownloadExcel = () => {
    if (reportType === 'attendance_class') {
      const data = classAttendanceData.map(r => ({
        'No': r.no,
        'NISN': r.nisn,
        'Nama Siswa': r.fullName,
        'Kelas': r.className,
        'Hadir (H)': r.h,
        'Sakit (S)': r.s,
        'Izin (I)': r.i,
        'Alpa (A)': r.a,
        'Terlambat (T)': r.t,
        'Total Pertemuan': r.total,
        'Persentase Kehadiran': r.rate,
        'Status Kehadiran': r.statusLabel,
      }));
      exportToExcel(data, `Rekap_Presensi_${currentClass.name}`, 'Presensi');
      showToast('File Excel rekap presensi kelas berhasil diunduh.');
    } else if (reportType === 'grade_class') {
      const data = classLegerData.map(r => {
        const row: Record<string, any> = {
          'No': r.no,
          'NISN': r.nisn,
          'Nama Siswa': r.fullName,
        };
        subjects.forEach(sub => {
          row[sub.name] = r.subjectScores[sub.id] || 0;
        });
        row['Rata-rata Nilai'] = r.average;
        row['Predikat'] = r.predicate;
        row['Peringkat'] = r.rank;
        row['Status KKM'] = r.isPassed ? 'TUNTAS' : 'REMEDIAL';
        return row;
      });
      exportToExcel(data, `Leger_Nilai_${currentClass.name}`, 'Leger Kelas');
      showToast('File Excel leger nilai kelas berhasil diunduh.');
    } else if (reportType === 'grade_subject') {
      const data = subjectGradingData.map(r => ({
        'No': r.no,
        'NISN': r.nisn,
        'Nama Siswa': r.fullName,
        'Tugas (20%)': r.tugas,
        'Praktik (30%)': r.praktik,
        'Formatif (20%)': r.formatif,
        'Sumatif (30%)': r.sumatif,
        'Nilai Akhir': r.finalScore,
        'Predikat': r.predicate,
        'Status KKM': r.isPassed ? 'TUNTAS' : 'REMEDIAL',
        'Capaian Kompetensi': r.feedback,
      }));
      exportToExcel(data, `Rekap_Nilai_${currentClass.name}_${currentSubject.code}`, currentSubject.code);
      showToast('File Excel rekap nilai mata pelajaran berhasil diunduh.');
    } else {
      if (!studentTranscriptData) return;
      const data = studentTranscriptData.subjectsList.map(s => ({
        'No': s.no,
        'Kode': s.code,
        'Mata Pelajaran': s.name,
        'KKM': s.kkm,
        'Nilai Angka': s.score,
        'Predikat': s.predicate,
        'Ketercapaian': s.isPassed ? 'TUNTAS' : 'REMEDIAL',
        'Deskripsi Capaian Kompetensi': s.feedback,
      }));
      exportToExcel(data, `Rapor_${studentTranscriptData.student.fullName.replace(/\s+/g, '_')}`, 'Transkrip Rapor');
      showToast('File Excel transkrip nilai siswa berhasil diunduh.');
    }
  };

  // Google Sheets Export
  const handleExportGoogleSheets = async () => {
    setIsExportingSheets(true);
    setSheetSuccessUrl(null);
    setSheetErrorMsg(null);

    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let title = '';

    if (reportType === 'attendance_class') {
      title = `Rekap Presensi ${currentClass.name}`;
      headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Telat', 'Persentase', 'Status'];
      rows = classAttendanceData.map(r => [
        r.no,
        r.nisn,
        r.fullName,
        r.className,
        r.h,
        r.s,
        r.i,
        r.a,
        r.t,
        r.rate,
        r.statusLabel,
      ]);
    } else if (reportType === 'grade_class') {
      title = `Leger Nilai ${currentClass.name}`;
      headers = ['No', 'NISN', 'Nama Siswa', ...subjects.map(s => s.code), 'Rata-rata', 'Predikat', 'Rank', 'Status'];
      rows = classLegerData.map(r => [
        r.no,
        r.nisn,
        r.fullName,
        ...subjects.map(s => r.subjectScores[s.id] || 0),
        r.average,
        r.predicate,
        r.rank,
        r.isPassed ? 'TUNTAS' : 'REMEDIAL',
      ]);
    } else if (reportType === 'grade_subject') {
      title = `Nilai ${currentClass.name} - ${currentSubject.name}`;
      headers = ['No', 'NISN', 'Nama Siswa', 'Tugas', 'Praktik', 'Formatif', 'Sumatif', 'Nilai Akhir', 'Predikat', 'Status KKM'];
      rows = subjectGradingData.map(r => [
        r.no,
        r.nisn,
        r.fullName,
        r.tugas,
        r.praktik,
        r.formatif,
        r.sumatif,
        r.finalScore,
        r.predicate,
        r.isPassed ? 'TUNTAS' : 'REMEDIAL',
      ]);
    } else {
      if (!studentTranscriptData) return;
      title = `Transkrip ${studentTranscriptData.student.fullName}`;
      headers = ['No', 'Kode', 'Mata Pelajaran', 'KKM', 'Nilai', 'Predikat', 'Capaian'];
      rows = studentTranscriptData.subjectsList.map(s => [
        s.no,
        s.code,
        s.name,
        s.kkm,
        s.score,
        s.predicate,
        s.feedback,
      ]);
    }

    const res = await exportToGoogleSheets({
      title,
      sheetName: currentClass.name,
      headers,
      rows,
    });

    setIsExportingSheets(false);
    if (res.success && res.spreadsheetUrl) {
      setSheetSuccessUrl(res.spreadsheetUrl);
    } else {
      setSheetErrorMsg(res.error || 'Gagal mengekspor ke Google Sheets.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-[#7265C2]/30 bg-[#6C60B8] px-4 py-3 text-xs font-bold text-white shadow-2xl animate-slide-down">
          <Check className="h-4 w-4 text-[#FFE680]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Royal Academy Banner & Tab Navigation */}
      <AcademyHeroBanner
        moduleKey="reports"
        kicker="PUSAT DOKUMEN & ARSIP LAPORAN SEKOLAH"
        title="PUSAT PELAPORAN & DOKUMEN RESMI"
        subtitle="Ekspor dokumen resmi PDF & Excel berumus dinamis, kustomisasi kop surat & tanda tangan digital, serta sinkronisasi Google Sheets."
        icon={Scroll}
        rightContent={
          <LiquidNavBar
            ariaLabel="Navigasi Modul Pelaporan"
            activeId={activeMainTab}
            onSelect={id => setActiveMainTab(id as 'export' | 'spreadsheet' | 'designer')}
            items={[
              {
                id: 'export',
                label: 'Ekspor Dokumen',
                icon: <Download className="h-3.5 w-3.5" />,
              },
              {
                id: 'spreadsheet',
                label: 'Excel Interaktif',
                icon: <Table className="h-3.5 w-3.5" />,
              },
              {
                id: 'designer',
                label: 'Desain & Tata Letak PDF',
                icon: <Palette className="h-3.5 w-3.5" />,
              },
            ]}
          />
        }
      />

      {/* Google Sheets Notification Banner */}
      {sheetSuccessUrl && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Spreadsheet Berhasil Dibuat di Google Drive!</strong> Laporan telah tersinkronisasi ke Google Sheets akun Anda.
            </span>
          </div>
          <a
            href={sheetSuccessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 font-bold text-white hover:bg-emerald-700 transition-colors shrink-0 shadow-xs"
          >
            <span>Buka Google Sheet</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {sheetErrorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{sheetErrorMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: EKSPOR LAPORAN (WITH TAILORED REAL PREVIEWS)      */}
      {/* ======================================================== */}
      {activeMainTab === 'export' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter / Generator Control Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="min-w-0">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Jenis Laporan
                </label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value as any)}
                  className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="attendance_class">1. Rekap Presensi per Kelas</option>
                  <option value="grade_class">2. Leger Nilai Akademik Kelas</option>
                  <option value="grade_subject">3. Rekap Nilai per Mata Pelajaran</option>
                  <option value="student_transcript">4. Rapor &amp; Transkrip Nilai Siswa</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Kelas / Rombel
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.majorCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Show Subject selector if grade_subject */}
              {reportType === 'grade_subject' && (
                <div className="min-w-0">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Mata Pelajaran
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={e => setSelectedSubjectId(e.target.value)}
                    className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (KKM: {s.kkm})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Show Student selector if student_transcript */}
              {reportType === 'student_transcript' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Pilih Siswa (Cetak Rapor)
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {classStudents.map(std => (
                      <option key={std.id} value={std.id}>
                        {std.fullName} ({std.nisn})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tahun Ajaran info if not showing 3rd select */}
              {reportType !== 'grade_subject' && reportType !== 'student_transcript' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1.5">Tahun Ajaran</label>
                  <div className="h-[38px] flex items-center px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    T.A. {activeAcademicYear.name} ({activeAcademicYear.activeSemester.toUpperCase()})
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Full-Width Export & Sort Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <SortByControl value={sortBy} onChange={setSortBy} />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('designer');
                  }}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
                  title="Pratinjau Lembar Dokumen Satu per Satu"
                >
                  <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Pratinjau Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
                  title="Ekspor file Excel (.xlsx)"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Ekspor Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  title="Cetak PDF Resmi Sesuai Format"
                >
                  <Printer className="h-3.5 w-3.5 shrink-0" />
                  <span>Cetak PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportGoogleSheets}
                  disabled={isExportingSheets}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 whitespace-nowrap shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Table className="h-3.5 w-3.5 shrink-0" />
                  <span>{isExportingSheets ? 'Menyimpan...' : 'Google Sheets'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TAILORED REVIEW VIEW 1: REKAP PRESENSI KELAS             */}
          {/* ======================================================== */}
          {reportType === 'attendance_class' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Total Siswa Terdata</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{classAttendanceData.length}</p>
                  <span className="text-[10px] text-blue-600 font-bold">Kelas {currentClass.name}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Rata-rata Kehadiran</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {classAttendanceData.length > 0
                      ? (
                          classAttendanceData.reduce((acc, c) => acc + c.rateNum, 0) /
                          classAttendanceData.length
                        ).toFixed(1) + '%'
                      : '0%'}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">Target &ge; 90%</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Kehadiran Sangat Baik</span>
                  <p className="text-2xl font-black text-blue-600 mt-1">
                    {classAttendanceData.filter(c => c.rateNum >= 90).length}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold">&ge; 90% Tingkat Hadir</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Perlu Pembinaan</span>
                  <p className="text-2xl font-black text-rose-600 mt-1">
                    {classAttendanceData.filter(c => c.rateNum < 75).length}
                  </p>
                  <span className="text-[10px] text-rose-500 font-bold">&lt; 75% Tingkat Hadir</span>
                </div>
              </div>

              {/* Attendance Review Table */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Hourglass className="h-4 w-4 text-blue-600" />
                      Pratinjau Rekapitulasi Presensi: {currentClass.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Sinkron otomatis dengan input sesi absensi harian &amp; mapel &bull; T.A. {activeAcademicYear.name}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {classAttendanceData.length} Siswa Terdaftar
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-bold">
                        <th className="py-2.5 px-3 text-center w-10">No</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3 text-center text-emerald-700 dark:text-emerald-400">Hadir (H)</th>
                        <th className="py-2.5 px-3 text-center text-blue-700 dark:text-blue-400">Sakit (S)</th>
                        <th className="py-2.5 px-3 text-center text-amber-700 dark:text-amber-400">Izin (I)</th>
                        <th className="py-2.5 px-3 text-center text-rose-700 dark:text-rose-400">Alpa (A)</th>
                        <th className="py-2.5 px-3 text-center text-purple-700 dark:text-purple-400">Telat (T)</th>
                        <th className="py-2.5 px-3 text-center">Total Sesi</th>
                        <th className="py-2.5 px-3 text-center font-extrabold">Persentase</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {classAttendanceData.map(r => (
                        <tr key={r.studentId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2 px-3 text-center text-slate-400">{r.no}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{r.nisn}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{r.fullName}</td>
                          <td className="py-2 px-3 text-center font-bold text-emerald-600 bg-emerald-50/20">{r.h}</td>
                          <td className="py-2 px-3 text-center text-blue-600">{r.s}</td>
                          <td className="py-2 px-3 text-center text-amber-600">{r.i}</td>
                          <td className="py-2 px-3 text-center font-bold text-rose-600">{r.a}</td>
                          <td className="py-2 px-3 text-center text-purple-600">{r.t}</td>
                          <td className="py-2 px-3 text-center text-slate-500 font-medium">{r.total}</td>
                          <td className="py-2 px-3 text-center font-black text-blue-600 dark:text-cyan-400">
                            {r.rate}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                r.rateNum >= 90
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : r.rateNum >= 80
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : r.rateNum >= 75
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {r.statusLabel}
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

          {/* ======================================================== */}
          {/* TAILORED REVIEW VIEW 2: LEGER NILAI KELAS                */}
          {/* ======================================================== */}
          {reportType === 'grade_class' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Rata-rata Leger Kelas</span>
                  <p className="text-2xl font-black text-blue-600 mt-1">
                    {classLegerData.length > 0
                      ? Math.round(classLegerData.reduce((acc, c) => acc + c.average, 0) / classLegerData.length)
                      : 0}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold">{subjects.length} Mata Pelajaran</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Nilai Tertinggi Kelas</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {classLegerData.length > 0 ? Math.max(...classLegerData.map(c => c.average)) : 0}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">Peringkat 1</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Tuntas KKM</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {classLegerData.filter(c => c.isPassed).length}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {classLegerData.length > 0
                      ? Math.round((classLegerData.filter(c => c.isPassed).length / classLegerData.length) * 100) + '%'
                      : '0%'} Kelulusan
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Perlu Remedial</span>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {classLegerData.filter(c => !c.isPassed).length}
                  </p>
                  <span className="text-[10px] text-amber-600 font-bold">Bimbingan Khusus</span>
                </div>
              </div>

              {/* Leger Table */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Table className="h-4 w-4 text-indigo-600" />
                      Pratinjau Leger Nilai Lengkap: {currentClass.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rangkuman nilai akhir semua mata pelajaran beserta rata-rata dan peringkat kelas
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {subjects.length} Mapel Kurikulum
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-bold">
                        <th className="py-2.5 px-3 text-center w-10">No</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        {subjects.map(s => (
                          <th key={s.id} className="py-2.5 px-3 text-center" title={`${s.name} (KKM: ${s.kkm})`}>
                            {s.code}
                          </th>
                        ))}
                        <th className="py-2.5 px-3 text-center font-extrabold bg-blue-50/50 dark:bg-blue-950/30">Rata-rata</th>
                        <th className="py-2.5 px-3 text-center">Predikat</th>
                        <th className="py-2.5 px-3 text-center font-extrabold">Rank</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {classLegerData.map(r => (
                        <tr key={r.studentId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2 px-3 text-center text-slate-400">{r.no}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{r.nisn}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{r.fullName}</td>
                          {subjects.map(s => (
                            <td key={s.id} className="py-2 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                              {r.subjectScores[s.id] || 0}
                            </td>
                          ))}
                          <td className="py-2 px-3 text-center font-black text-sm text-blue-600 dark:text-cyan-400 bg-blue-50/40 dark:bg-blue-950/20">
                            {r.average}
                          </td>
                          <td className="py-2 px-3 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                              r.predicate === 'A'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : r.predicate === 'B'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {r.predicate}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-extrabold text-slate-800 dark:text-slate-200">
                            #{r.rank}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.isPassed
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}>
                              {r.isPassed ? 'TUNTAS' : 'REMEDIAL'}
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

          {/* ======================================================== */}
          {/* TAILORED REVIEW VIEW 3: REKAP NILAI MATA PELAJARAN       */}
          {/* ======================================================== */}
          {reportType === 'grade_subject' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Mata Pelajaran Terpilih</span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-1 truncate">
                    {currentSubject.name}
                  </p>
                  <span className="text-[10px] text-blue-600 font-bold">KKM: {currentSubject.kkm}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Rata-rata Nilai Akhir</span>
                  <p className="text-2xl font-black text-blue-600 mt-1">
                    {subjectGradingData.length > 0
                      ? Math.round(subjectGradingData.reduce((acc, c) => acc + c.finalScore, 0) / subjectGradingData.length)
                      : 0}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">Terbobot Kurikulum</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Siswa Tuntas (&ge; KKM)</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {subjectGradingData.filter(c => c.isPassed).length}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {subjectGradingData.length > 0
                      ? Math.round((subjectGradingData.filter(c => c.isPassed).length / subjectGradingData.length) * 100) + '%'
                      : '0%'} Lulus
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-xs text-slate-500 font-semibold">Perlu Perbaikan / Remedial</span>
                  <p className="text-2xl font-black text-rose-600 mt-1">
                    {subjectGradingData.filter(c => !c.isPassed).length}
                  </p>
                  <span className="text-[10px] text-rose-500 font-bold">&lt; {currentSubject.kkm}</span>
                </div>
              </div>

              {/* Table Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-600" />
                      Pratinjau Nilai: {currentSubject.name} &bull; {currentClass.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rincian bobot Tugas (20%), Praktik (30%), Formatif (20%), dan Sumatif (30%)
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Standar KKM: {currentSubject.kkm}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-bold">
                        <th className="py-2.5 px-3 text-center w-10">No</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3 text-center">Tugas (20%)</th>
                        <th className="py-2.5 px-3 text-center">Praktik (30%)</th>
                        <th className="py-2.5 px-3 text-center">Formatif (20%)</th>
                        <th className="py-2.5 px-3 text-center">Sumatif (30%)</th>
                        <th className="py-2.5 px-3 text-center font-extrabold bg-blue-50/50 dark:bg-blue-950/30">Nilai Akhir</th>
                        <th className="py-2.5 px-3 text-center">Predikat</th>
                        <th className="py-2.5 px-3">Capaian Kompetensi</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subjectGradingData.map(r => (
                        <tr key={r.studentId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2 px-3 text-center text-slate-400">{r.no}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{r.nisn}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{r.fullName}</td>
                          <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-300">{r.tugas}</td>
                          <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-300">{r.praktik}</td>
                          <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-300">{r.formatif}</td>
                          <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-300">{r.sumatif}</td>
                          <td className="py-2 px-3 text-center font-black text-sm text-blue-600 dark:text-cyan-400 bg-blue-50/40 dark:bg-blue-950/20">
                            {r.finalScore}
                          </td>
                          <td className="py-2 px-3 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                              r.predicate === 'A'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : r.predicate === 'B'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {r.predicate}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                            {r.feedback}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.isPassed
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}>
                              {r.isPassed ? 'TUNTAS' : 'REMEDIAL'}
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

          {/* ======================================================== */}
          {/* TAILORED REVIEW VIEW 4: RAPOR & TRANSKRIP SISWA          */}
          {/* ======================================================== */}
          {reportType === 'student_transcript' && studentTranscriptData && (
            <div className="space-y-6">
              {/* Report Card Paper Preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md dark:border-slate-800 dark:bg-slate-900 max-w-4xl mx-auto">
                {/* School Letterhead with Proportional Logo */}
                <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-3 dark:border-slate-700">
                  {designerConfig.logoDataUrl ? (
                    <div className="flex items-center justify-center shrink-0 max-h-16 max-w-24">
                      <img
                        src={designerConfig.logoDataUrl}
                        alt="Logo Sekolah"
                        className="h-14 w-auto max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg">
                      MY
                    </div>
                  )}
                  <div className="flex-1 text-center">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                      {designerConfig.institutionFoundation}
                    </h4>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase mt-0.5">
                      {designerConfig.institutionName}
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      {designerConfig.institutionTagline}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {designerConfig.institutionAddress} | {designerConfig.institutionContact}
                    </p>
                  </div>
                </div>

                {/* Report Card Title */}
                <div className="text-center my-4">
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider underline">
                    Laporan Hasil Capaian Pembelajaran Siswa (Rapor)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Tahun Ajaran {activeAcademicYear.name} &bull; Semester {activeAcademicYear.activeSemester.toUpperCase()}
                  </p>
                </div>

                {/* Student Identity Information Card */}
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/50 mb-5">
                  <div className="space-y-1.5">
                    <p>
                      <span className="text-slate-500 font-medium">Nama Siswa:</span>{' '}
                      <strong className="text-slate-900 dark:text-white text-sm">{studentTranscriptData.student.fullName}</strong>
                    </p>
                    <p>
                      <span className="text-slate-500 font-medium">NISN / NIS:</span>{' '}
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {studentTranscriptData.student.nisn} / {studentTranscriptData.student.nis}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500 font-medium">Status Rapor:</span>{' '}
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle className="h-3.5 w-3.5" /> Terverifikasi Wali Kelas
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p>
                      <span className="text-slate-500 font-medium">Kelas / Rombel:</span>{' '}
                      <strong>{studentTranscriptData.student.className}</strong>
                    </p>
                    <p>
                      <span className="text-slate-500 font-medium">Program Keahlian:</span>{' '}
                      <span>{studentTranscriptData.student.majorCode}</span>
                    </p>
                    <p>
                      <span className="text-slate-500 font-medium">Wali Kelas:</span>{' '}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{designerConfig.leftSignerName}</span>
                    </p>
                  </div>
                </div>

                {/* Subjects & Grades Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                        <th className="p-2 text-center w-8">No</th>
                        <th className="p-2">Mata Pelajaran</th>
                        <th className="p-2 text-center w-14">KKM</th>
                        <th className="p-2 text-center w-16">Nilai</th>
                        <th className="p-2 text-center w-14">Predikat</th>
                        <th className="p-2">Capaian Kompetensi Pembelajaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentTranscriptData.subjectsList.map(sub => (
                        <tr key={sub.subjectId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="p-2 text-center text-slate-400">{sub.no}</td>
                          <td className="p-2 font-bold text-slate-900 dark:text-white">
                            {sub.name}
                            <span className="block text-[10px] text-slate-400 font-normal">Kode: {sub.code}</span>
                          </td>
                          <td className="p-2 text-center font-medium text-slate-500">{sub.kkm}</td>
                          <td className="p-2 text-center font-black text-sm text-blue-600 dark:text-cyan-400 bg-blue-50/20">
                            {sub.score}
                          </td>
                          <td className="p-2 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                              sub.predicate === 'A'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : sub.predicate === 'B'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {sub.predicate}
                            </span>
                          </td>
                          <td className="p-2 text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                            {sub.feedback}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold text-slate-900 dark:bg-slate-800/80 dark:text-white border-t border-slate-200 dark:border-slate-700">
                        <td colSpan={3} className="p-2 text-right">Rata-rata Nilai Akademik:</td>
                        <td className="p-2 text-center text-sm font-black text-blue-600 dark:text-cyan-400">
                          {studentTranscriptData.averageScore}
                        </td>
                        <td className="p-2 text-center">
                          {studentTranscriptData.averageScore >= 80 ? 'B' : 'C'}
                        </td>
                        <td className="p-2 text-[11px] text-emerald-600 font-bold">
                          Status Kelulusan: TUNTAS SELURUH KOMPETENSI
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Attendance Summary & Remarks Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-xs">
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                      Rekap Kehadiran Siswa Semester Ini:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-1.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-semibold">Hadir</span>
                        <strong className="text-emerald-800 dark:text-emerald-200 text-sm">{studentTranscriptData.attendance.h}</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-blue-100/60 dark:bg-blue-950/40">
                        <span className="text-[10px] text-blue-700 dark:text-blue-300 block font-semibold">Sakit</span>
                        <strong className="text-blue-800 dark:text-blue-200 text-sm">{studentTranscriptData.attendance.s}</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-amber-100/60 dark:bg-amber-950/40">
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 block font-semibold">Izin</span>
                        <strong className="text-amber-800 dark:text-amber-200 text-sm">{studentTranscriptData.attendance.i}</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-rose-100/60 dark:bg-rose-950/40">
                        <span className="text-[10px] text-rose-700 dark:text-rose-300 block font-semibold">Alpa</span>
                        <strong className="text-rose-800 dark:text-rose-200 text-sm">{studentTranscriptData.attendance.a}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Catatan &amp; Motivasi Wali Kelas:
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed">
                      "Ananda {studentTranscriptData.student.fullName} memiliki etos belajar yang tinggi dan disiplin praktikum yang sangat baik. Terus tingkatkan kemampuan kolaborasi tim dan eksplorasi teknologi baru."
                    </p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-8 pt-4 flex justify-between text-[11px] border-t border-slate-200 dark:border-slate-800">
                  <div className="w-48 text-left">
                    <p>Mengetahui,</p>
                    <p className="font-semibold">{designerConfig.leftSignerTitle}</p>
                    <div className="h-14 my-1 flex items-center">
                      {designerConfig.leftSignerSignatureUrl ? (
                        <img src={designerConfig.leftSignerSignatureUrl} alt="TTD Guru" className="h-12 object-contain" />
                      ) : (
                        <div className="h-10 w-28 border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 italic">
                          (Tanda Tangan)
                        </div>
                      )}
                    </div>
                    <p className="font-bold underline text-slate-900 dark:text-white">{designerConfig.leftSignerName}</p>
                    <p className="text-slate-500">NIP. {designerConfig.leftSignerNip}</p>
                  </div>

                  <div className="w-48 text-right">
                    <p>{designerConfig.rightSignerCity}, {designerConfig.rightSignerDate}</p>
                    <p className="font-semibold">{designerConfig.rightSignerTitle}</p>
                    <div className="h-14 my-1 flex items-center justify-end">
                      {designerConfig.rightSignerSignatureUrl ? (
                        <img src={designerConfig.rightSignerSignatureUrl} alt="TTD Kepsek" className="h-12 object-contain" />
                      ) : (
                        <div className="h-10 w-28 border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 italic">
                          (Tanda Tangan)
                        </div>
                      )}
                    </div>
                    <p className="font-bold underline text-slate-900 dark:text-white">{designerConfig.rightSignerName}</p>
                    <p className="text-slate-500">NIP. {designerConfig.rightSignerNip}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: EXCEL INTERAKTIF (BERUMUS DINAMIS)                */}
      {/* ======================================================== */}
      {activeMainTab === 'spreadsheet' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Lembar Excel Interaktif: {currentClass.name}
              </h2>
              <p className="text-xs text-slate-500">
                Nilai akhir terhitung otomatis secara real-time berdasarkan bobot Tugas (20%), Praktik (30%), Formatif (20%), Sumatif (30%)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (currentClass && currentSubject) {
                    resetClassSubjectAllScores(currentClass.id, currentSubject.id);
                    const next: Record<string, Record<string, number>> = { ...editableScores };
                    classStudents.forEach(std => {
                      next[std.id] = { tugas: 0, praktik: 0, formatif: 0, sumatif: 0 };
                    });
                    setEditableScores(next);
                    showToast(`Seluruh nilai ${currentSubject.name} kelas ${currentClass.name} berhasil direset menjadi 0 di database.`);
                  }
                }}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300 shadow-2xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                <span>Reset Nilai (0)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!currentClass || !currentSubject) return;
                  const types: Array<{ key: 'tugas' | 'praktik' | 'formatif' | 'sumatif'; title: string; weight: number }> = [
                    { key: 'tugas', title: `Tugas Mandiri ${currentSubject.name}`, weight: 20 },
                    { key: 'praktik', title: `Praktikum ${currentSubject.name}`, weight: 30 },
                    { key: 'formatif', title: `Ujian Formatif ${currentSubject.name}`, weight: 20 },
                    { key: 'sumatif', title: `Asesmen Sumatif ${currentSubject.name}`, weight: 30 },
                  ];
                  types.forEach(t => {
                    const targetAss = currentAssessments.find(a => a.type === t.key);
                    let assId = targetAss?.id;
                    if (!assId) {
                      assId = createAssessment({
                        title: t.title,
                        subjectId: currentSubject.id,
                        subjectName: currentSubject.name,
                        classId: currentClass.id,
                        className: currentClass.name,
                        teacherId: 'tch-001',
                        teacherName: 'Guru Pengampu',
                        type: t.key,
                        weight: t.weight,
                        maxScore: 100,
                        kkm: currentSubject.kkm || 75,
                        date: new Date().toISOString().split('T')[0],
                        semester: activeAcademicYear.activeSemester,
                        academicYearId: activeAcademicYear.id,
                      });
                    }
                    const scoresPayload = classStudents.map(std => {
                      const val = Number(editableScores[std.id]?.[t.key] ?? 0);
                      return {
                        studentId: std.id,
                        score: val,
                        feedback: val >= (currentSubject.kkm || 75) ? 'Tuntas KKM' : val > 0 ? 'Perlu Penguatan' : 'Nilai direset (0)',
                      };
                    });
                    saveAssessmentScores(assId, scoresPayload);
                  });
                  showToast(`Nilai lembar interaktif ${currentSubject.name} (${currentClass.name}) berhasil disimpan ke database & tersinkron ke semua menu.`);
                }}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                <Save className="h-3.5 w-3.5 shrink-0" />
                <span>Simpan Nilai</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Unduh File Excel</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="h-4 w-4 shrink-0" />
                <span>Cetak Lembar PDF</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-bold">
                    <th className="py-2.5 px-3 text-center w-10">No</th>
                    <th className="py-2.5 px-3">NISN</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3 text-center">Tugas (20%)</th>
                    <th className="py-2.5 px-3 text-center">Praktik (30%)</th>
                    <th className="py-2.5 px-3 text-center">Formatif (20%)</th>
                    <th className="py-2.5 px-3 text-center">Sumatif (30%)</th>
                    <th className="py-2.5 px-3 text-center font-extrabold bg-blue-50/50 dark:bg-blue-950/30">Nilai Akhir</th>
                    <th className="py-2.5 px-3 text-center">Predikat</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classStudents.map((std, idx) => {
                    const sc = editableScores[std.id] || { tugas: 85, praktik: 80, formatif: 82, sumatif: 88 };
                    const finalScore = Math.round((sc.tugas * 0.2) + (sc.praktik * 0.3) + (sc.formatif * 0.2) + (sc.sumatif * 0.3));
                    const pred = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 75 ? 'C' : 'D';
                    const isPassed = finalScore >= (currentSubject?.kkm || 75);

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{std.nisn}</td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{std.fullName}</td>
                        <td className="py-1 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sc.tugas}
                            onChange={e => handleScoreCellEdit(std.id, 'tugas', e.target.value)}
                            className="w-16 rounded border border-slate-200 bg-white py-1 text-center font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="py-1 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sc.praktik}
                            onChange={e => handleScoreCellEdit(std.id, 'praktik', e.target.value)}
                            className="w-16 rounded border border-slate-200 bg-white py-1 text-center font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="py-1 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sc.formatif}
                            onChange={e => handleScoreCellEdit(std.id, 'formatif', e.target.value)}
                            className="w-16 rounded border border-slate-200 bg-white py-1 text-center font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="py-1 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sc.sumatif}
                            onChange={e => handleScoreCellEdit(std.id, 'sumatif', e.target.value)}
                            className="w-16 rounded border border-slate-200 bg-white py-1 text-center font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-center font-black text-sm text-blue-600 bg-blue-50/40 dark:bg-blue-950/20">
                          {finalScore}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-black text-xs ${
                            pred === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {pred}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isPassed ? 'TUNTAS' : 'REMEDIAL'}
                          </span>
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

      {/* ======================================================== */}
      {/* TAB 3: DESAIN & TATA LETAK PDF (NIP GURU & LOGO PROPORSIONAL) */}
      {/* ======================================================== */}
      {activeMainTab === 'designer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white whitespace-nowrap shrink-0">
                Editor Desain &amp; Kop PDF
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDesignerToCloud}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5 shrink-0" />
                  <span>Simpan ke Cloud</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 shrink-0" />
                  <span>Cetak PDF</span>
                </button>
              </div>
            </div>

            {/* Section 1: Logo Instansi Proporsional */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Logo Instansi Sekolah</h3>
                </div>
                {designerConfig.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setDesignerConfig(prev => ({ ...prev, logoDataUrl: undefined }))}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Hapus Logo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden dark:border-slate-700 dark:bg-slate-800">
                  {designerConfig.logoDataUrl ? (
                    <img
                      src={designerConfig.logoDataUrl}
                      alt="Logo Preview"
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <label className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Unggah Logo (PNG/JPG)</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Otomatis diskalakan proporsional menjaga rasio aspek gambar.
                  </p>
                </div>
              </div>

              {/* Logo Sizing Control */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Proporsi Ukuran Logo pada Dokumen
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={designerConfig.logoWidth || 20}
                    onChange={e => setDesignerConfig(prev => ({ ...prev, logoWidth: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value={16}>Kompak (Lebar 16 mm - Proporsional)</option>
                    <option value={20}>Standar Dokumen (Lebar 20 mm - Proporsional)</option>
                    <option value={24}>Besar Lembar (Lebar 24 mm - Proporsional)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Header Kop Surat & Warna Tabel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Informasi Kop Surat &amp; Tema Tabel</h3>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={designerConfig.showKopSurat !== false}
                    onChange={e => setDesignerConfig(prev => ({ ...prev, showKopSurat: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Tampilkan Kop</span>
                </label>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block">Nama Yayasan / Badan Penyelenggara</label>
                  <input
                    type="text"
                    value={designerConfig.institutionFoundation}
                    onChange={e => setDesignerConfig(prev => ({ ...prev, institutionFoundation: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block">Nama Sekolah / Lembaga</label>
                  <input
                    type="text"
                    value={designerConfig.institutionName}
                    onChange={e => setDesignerConfig(prev => ({ ...prev, institutionName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-bold text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block">Kompetensi Keahlian / Tagline</label>
                  <input
                    type="text"
                    value={designerConfig.institutionTagline}
                    onChange={e => setDesignerConfig(prev => ({ ...prev, institutionTagline: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={designerConfig.institutionAddress}
                    onChange={e => setDesignerConfig(prev => ({ ...prev, institutionAddress: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Kontak / Email / Web</label>
                    <input
                      type="text"
                      value={designerConfig.institutionContact}
                      onChange={e => setDesignerConfig(prev => ({ ...prev, institutionContact: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Warna Header Tabel PDF</label>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {(
                        [
                          { label: 'Navy', rgb: [15, 23, 42] as [number, number, number], hex: '#0f172a' },
                          { label: 'Royal Blue', rgb: [30, 64, 175] as [number, number, number], hex: '#1e40af' },
                          { label: 'Emerald', rgb: [6, 95, 70] as [number, number, number], hex: '#065f46' },
                          { label: 'Crimson', rgb: [136, 19, 55] as [number, number, number], hex: '#881337' },
                        ]
                      ).map(preset => {
                        const cur = designerConfig.accentColor || [15, 23, 42];
                        const isSelected =
                          cur[0] === preset.rgb[0] && cur[1] === preset.rgb[1] && cur[2] === preset.rgb[2];
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setDesignerConfig(prev => ({ ...prev, accentColor: preset.rgb }))}
                            style={{ backgroundColor: preset.hex }}
                            className={`h-6 w-6 rounded-md border transition-transform cursor-pointer ${
                              isSelected
                                ? 'scale-110 ring-2 ring-blue-500 border-white'
                                : 'border-slate-300 opacity-80 hover:opacity-100'
                            }`}
                            title={preset.label}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Tanda Tangan & Kolom NIP Guru / Wali Kelas */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                  Tanda Tangan &amp; Pengaturan NIP Penandatangan
                </h3>
              </div>

              {/* TTD 1: Guru / Wali Kelas dengan Kolom NIP */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    1. TTD Guru Pengampu / Wali Kelas
                  </span>
                  {designerConfig.leftSignerSignatureUrl && (
                    <button
                      type="button"
                      onClick={() => setDesignerConfig(prev => ({ ...prev, leftSignerSignatureUrl: undefined }))}
                      className="text-[10px] text-rose-500 hover:underline"
                    >
                      Hapus TTD
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Jabatan</label>
                    <input
                      type="text"
                      value={designerConfig.leftSignerTitle}
                      onChange={e => setDesignerConfig(prev => ({ ...prev, leftSignerTitle: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Nama Penandatangan</label>
                    <input
                      type="text"
                      value={designerConfig.leftSignerName}
                      onChange={e => setDesignerConfig(prev => ({ ...prev, leftSignerName: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Kolom Pengisian NIP Guru / Wali Kelas */}
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    NIP Guru / Wali Kelas:
                  </label>
                  <input
                    type="text"
                    value={designerConfig.leftSignerNip}
                    onChange={e => setDesignerConfig(prev => ({ ...prev, leftSignerNip: e.target.value }))}
                    placeholder="Contoh: 197905142005011004"
                    className="w-full rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-[9px] text-slate-400">Dicetak di bawah nama guru pada bagian tanda tangan dokumen.</span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded border border-dashed border-slate-300 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-900">
                    {designerConfig.leftSignerSignatureUrl ? (
                      <img src={designerConfig.leftSignerSignatureUrl} alt="TTD Guru" className="h-full w-full object-contain p-0.5" />
                    ) : (
                      <span className="text-[9px] text-slate-400 italic">Belum ada TTD</span>
                    )}
                  </div>
                  <label className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 px-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Upload className="h-3 w-3" />
                    <span>Unggah Gambar TTD</span>
                    <input type="file" accept="image/*" onChange={handleLeftSignatureUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* TTD 2: Kepala Sekolah dengan Kolom NIP */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    2. TTD Kepala Sekolah
                  </span>
                  {designerConfig.rightSignerSignatureUrl && (
                    <button
                      type="button"
                      onClick={() => setDesignerConfig(prev => ({ ...prev, rightSignerSignatureUrl: undefined }))}
                      className="text-[10px] text-rose-500 hover:underline"
                    >
                      Hapus TTD
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Kota</label>
                    <input
                      type="text"
                      value={designerConfig.rightSignerCity}
                      onChange={e => setDesignerConfig(prev => ({ ...prev, rightSignerCity: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Tanggal Cetak</label>
                    <input
                      type="text"
                      value={designerConfig.rightSignerDate}
                      onChange={e => setDesignerConfig(prev => ({ ...prev, rightSignerDate: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Jabatan Kepala Sekolah</label>
                    <input
                      type="text"
                      value={designerConfig.rightSignerTitle}
                      onChange={e => setDesignerConfig(prev => ({ ...prev, rightSignerTitle: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Nama Kepala Sekolah</label>
                    <input
                      type="text"
                      value={designerConfig.rightSignerName}
                      onChange={e => setDesignerConfig(prev => ({ ...prev, rightSignerName: e.target.value }))}
                      className="w-full rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Kolom Pengisian NIP Kepala Sekolah */}
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    NIP Kepala Sekolah:
                  </label>
                  <input
                    type="text"
                    value={designerConfig.rightSignerNip}
                    onChange={e => setDesignerConfig(prev => ({ ...prev, rightSignerNip: e.target.value }))}
                    placeholder="Contoh: 196803151992031002"
                    className="w-full rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded border border-dashed border-slate-300 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-900">
                    {designerConfig.rightSignerSignatureUrl ? (
                      <img src={designerConfig.rightSignerSignatureUrl} alt="TTD Kepsek" className="h-full w-full object-contain p-0.5" />
                    ) : (
                      <span className="text-[9px] text-slate-400 italic">Belum ada TTD</span>
                    )}
                  </div>
                  <label className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 px-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Upload className="h-3 w-3" />
                    <span>Unggah Gambar TTD</span>
                    <input type="file" accept="image/*" onChange={handleRightSignatureUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Live A4 Preview Canvas (Right - Interactive One-by-One Document & Page Navigator) */}
          <div className="lg:col-span-7">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-slate-200/70 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-950 space-y-3">
              {/* Top Bar: Document Switcher Tabs (1 to 4) + Prev/Next Document Stepper */}
              <div className="rounded-xl border border-slate-300/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs">
                      {activeDocMeta.number}/4
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Pratinjau Dokumen PDF Satu per Satu</span>
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                          • {activeDocMeta.orientation}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {activeDocMeta.desc}
                      </p>
                    </div>
                  </div>

                  {/* Stepper: Previous / Next Document Type */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepDocument(-1)}
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
                      title="Lihat jenis dokumen sebelumnya"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
                      <span>Dok. Sebelumnya</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => stepDocument(1)}
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-blue-600 px-2.5 text-[11px] font-bold text-white hover:bg-blue-700 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
                      title="Lihat jenis dokumen berikutnya"
                    >
                      <span>Dok. Berikutnya</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* 4 Document Type Selector Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {pdfDocumentCatalog.map(docItem => {
                    const isActive = reportType === docItem.type;
                    return (
                      <button
                        key={docItem.type}
                        type="button"
                        onClick={() => {
                          setReportType(docItem.type);
                          setPreviewPage(1);
                        }}
                        className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-xs dark:bg-blue-600'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate">{docItem.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Second Row: One-by-One Entity Stepper (Per Kelas / Per Mapel / Per Siswa) & Page Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  {/* 1. Class Stepper (Always available) */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500 mr-0.5">Kelas:</span>
                    <button
                      type="button"
                      onClick={() => stepClass(-1)}
                      className="p-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                      title="Kelas Sebelumnya"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <select
                      value={selectedClassId}
                      onChange={e => {
                        setSelectedClassId(e.target.value);
                        setPreviewPage(1);
                      }}
                      className="rounded border border-slate-200 bg-slate-50 py-1 px-2 text-[11px] font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {classes.map((c, idx) => (
                        <option key={c.id} value={c.id}>
                          {idx + 1}/{classes.length} • {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => stepClass(1)}
                      className="p-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                      title="Kelas Berikutnya"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* 2. Subject Stepper (Visible when viewing Document 3: Rekap Nilai Mapel) */}
                  {reportType === 'grade_subject' && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-500 mr-0.5">Mapel:</span>
                      <button
                        type="button"
                        onClick={() => stepSubject(-1)}
                        className="p-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                        title="Mata Pelajaran Sebelumnya"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <select
                        value={selectedSubjectId}
                        onChange={e => {
                          setSelectedSubjectId(e.target.value);
                          setPreviewPage(1);
                        }}
                        className="max-w-[180px] rounded border border-slate-200 bg-slate-50 py-1 px-2 text-[11px] font-bold text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300"
                      >
                        {subjects.map((s, idx) => (
                          <option key={s.id} value={s.id}>
                            {idx + 1}/{subjects.length} • {s.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => stepSubject(1)}
                        className="p-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                        title="Mata Pelajaran Berikutnya"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* 3. Individual Student Stepper (Visible when viewing Document 4: Rapor Siswa Satu per Satu) */}
                  {reportType === 'student_transcript' && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mr-0.5">
                        Siswa:
                      </span>
                      <button
                        type="button"
                        onClick={() => stepStudent(-1)}
                        className="flex items-center gap-0.5 px-1.5 py-1 rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold cursor-pointer"
                        title="Siswa Sebelumnya"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Prev</span>
                      </button>
                      <select
                        value={activeStudent?.id || ''}
                        onChange={e => setSelectedStudentId(e.target.value)}
                        className="max-w-[195px] rounded border border-emerald-300 bg-emerald-50/70 py-1 px-2 text-[11px] font-bold text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                      >
                        {classStudents.map((std, idx) => (
                          <option key={std.id} value={std.id}>
                            Siswa {idx + 1}/{classStudents.length}: {std.fullName}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => stepStudent(1)}
                        className="flex items-center gap-0.5 px-1.5 py-1 rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold cursor-pointer"
                        title="Siswa Berikutnya"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* 4. Multi-page Sheet Stepper for Class Tables (Docs 1, 2, 3) */}
                  {reportType !== 'student_transcript' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewShowAllRows(prev => !prev)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                          previewShowAllRows
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {previewShowAllRows ? 'Semua Baris Aktif' : 'Mode Per Lembar'}
                      </button>
                      {!previewShowAllRows && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={previewPage <= 1}
                            onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                            className="p-1 rounded border border-slate-200 bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                            title="Halaman Sebelumnya"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 px-1">
                            Hal {previewPage}/{totalPreviewPages}
                          </span>
                          <button
                            type="button"
                            disabled={previewPage >= totalPreviewPages}
                            onClick={() => setPreviewPage(p => Math.min(totalPreviewPages, p + 1))}
                            className="p-1 rounded border border-slate-200 bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                            title="Halaman Berikutnya"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Third Row: Zoom & Fullscreen & Quick Print */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-semibold whitespace-nowrap">Skala Kertas:</span>
                    {[85, 100, 110].map(z => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setPreviewZoom(z)}
                        className={`inline-flex h-7 items-center justify-center px-2.5 rounded-lg font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                          previewZoom === z
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {z}%
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsFullscreenPreview(true)}
                      className="inline-flex h-8 items-center justify-center gap-1 px-3 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Maximize2 className="h-3 w-3 text-blue-600 shrink-0" />
                      <span>Layar Penuh</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="inline-flex h-8 items-center justify-center gap-1 px-3 rounded-lg bg-emerald-600 font-bold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Printer className="h-3 w-3 shrink-0" />
                      <span>Cetak Dokumen Ini</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Realistic Paper Container (Dynamically Renders Document 1, 2, 3, or 4) */}
              <div className="overflow-x-auto pb-2">
                <div
                  style={{
                    transform: `scale(${previewZoom / 100})`,
                    transformOrigin: 'top center',
                  }}
                  className="bg-white text-slate-900 rounded-lg shadow-2xl p-6 sm:p-8 border border-slate-300 text-xs font-sans min-h-[660px] flex flex-col justify-between transition-all duration-200 mx-auto"
                >
                  {/* TOP SECTION: Kop Surat + Document Header + Document Body */}
                  <div>
                    {/* Kop Surat with Proportional Sizing */}
                    {designerConfig.showKopSurat !== false && (
                      <div className="flex items-center gap-4 border-b-[3px] border-double border-slate-900 pb-3">
                        {designerConfig.logoDataUrl ? (
                          <div className="flex items-center justify-center shrink-0">
                            <img
                              src={designerConfig.logoDataUrl}
                              alt="Logo Instansi"
                              style={{
                                width: `${(designerConfig.logoWidth || 20) * 3.2}px`,
                                maxHeight: '72px',
                              }}
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-14 w-14 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 shrink-0 text-center font-bold">
                            LOGO
                          </div>
                        )}
                        <div className="flex-1 text-center">
                          <h4 className="font-extrabold text-[11px] tracking-wider uppercase text-slate-800">
                            {designerConfig.institutionFoundation}
                          </h4>
                          <h2 className="font-black text-sm sm:text-base tracking-tight uppercase text-blue-950 mt-0.5">
                            {designerConfig.institutionName}
                          </h2>
                          <p className="text-[8.5px] text-slate-600 mt-0.5 leading-tight">
                            {designerConfig.institutionTagline}
                          </p>
                          <p className="text-[8px] text-slate-500 leading-tight mt-0.5">
                            {designerConfig.institutionAddress} | {designerConfig.institutionContact}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Document Specific Title & Metadata */}
                    <div className="text-center my-3.5">
                      <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 underline">
                        {activeDocMeta.fullTitle}
                      </h3>
                      <p className="text-[9px] text-slate-600 mt-0.5">
                        Tahun Pelajaran: <strong>{activeAcademicYear.name}</strong> • Semester:{' '}
                        <strong className="uppercase">{activeAcademicYear.activeSemester}</strong>
                      </p>

                      {reportType !== 'student_transcript' && (
                        <div className="flex flex-wrap justify-between items-center text-[9px] text-slate-700 mt-2.5 px-2 py-1.5 rounded bg-slate-50 border border-slate-200">
                          <span>
                            Kelas / Rombel: <strong>{currentClass?.name} ({currentClass?.majorCode})</strong>
                          </span>
                          {reportType === 'grade_subject' ? (
                            <span>
                              Mata Pelajaran: <strong>{currentSubject?.name} (KKM: {currentSubject?.kkm})</strong>
                            </span>
                          ) : (
                            <span>
                              Jumlah Siswa: <strong>{classStudents.length} Siswa</strong>
                            </span>
                          )}
                          <span>
                            Lembar:{' '}
                            <strong>
                              {previewShowAllRows ? 'Lengkap (1/1)' : `Halaman ${previewPage} dari ${totalPreviewPages}`}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ==================================================== */}
                    {/* DOCUMENT 1 BODY: REKAP PRESENSI KEHADIRAN KELAS       */}
                    {/* ==================================================== */}
                    {reportType === 'attendance_class' && (
                      <div className="space-y-2.5">
                        <table className="w-full text-left text-[8.5px] border-collapse border border-slate-400">
                          <thead>
                            <tr
                              style={{
                                backgroundColor: designerConfig.accentColor
                                  ? `rgb(${designerConfig.accentColor.join(',')})`
                                  : '#0f172a',
                              }}
                              className="text-white"
                            >
                              <th className="border border-slate-400 p-1 text-center w-6">No</th>
                              <th className="border border-slate-400 p-1">NISN</th>
                              <th className="border border-slate-400 p-1">Nama Lengkap Siswa</th>
                              <th className="border border-slate-400 p-1 text-center">Hadir (H)</th>
                              <th className="border border-slate-400 p-1 text-center">Sakit (S)</th>
                              <th className="border border-slate-400 p-1 text-center">Izin (I)</th>
                              <th className="border border-slate-400 p-1 text-center">Alpa (A)</th>
                              <th className="border border-slate-400 p-1 text-center">Telat (T)</th>
                              <th className="border border-slate-400 p-1 text-center">Total</th>
                              <th className="border border-slate-400 p-1 text-center">% Hadir</th>
                              <th className="border border-slate-400 p-1 text-center">Keterangan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(previewShowAllRows
                              ? classAttendanceData
                              : classAttendanceData.slice(
                                  (previewPage - 1) * rowsPerPage,
                                  previewPage * rowsPerPage
                                )
                            ).map(r => (
                              <tr key={r.studentId} className="even:bg-slate-50">
                                <td className="border border-slate-300 p-1 text-center">{r.no}</td>
                                <td className="border border-slate-300 p-1 font-mono">{r.nisn}</td>
                                <td className="border border-slate-300 p-1 font-bold">{r.fullName}</td>
                                <td className="border border-slate-300 p-1 text-center font-bold text-emerald-700">{r.h}</td>
                                <td className="border border-slate-300 p-1 text-center">{r.s}</td>
                                <td className="border border-slate-300 p-1 text-center">{r.i}</td>
                                <td className="border border-slate-300 p-1 text-center font-bold text-rose-700">{r.a}</td>
                                <td className="border border-slate-300 p-1 text-center">{r.t}</td>
                                <td className="border border-slate-300 p-1 text-center">{r.total}</td>
                                <td className="border border-slate-300 p-1 text-center font-bold text-blue-800">{r.rate}</td>
                                <td className="border border-slate-300 p-1 text-center font-semibold">{r.statusLabel}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ==================================================== */}
                    {/* DOCUMENT 2 BODY: LEGER NILAI AKADEMIK KELAS           */}
                    {/* ==================================================== */}
                    {reportType === 'grade_class' && (
                      <div className="space-y-2.5">
                        <table className="w-full text-left text-[8px] border-collapse border border-slate-400">
                          <thead>
                            <tr
                              style={{
                                backgroundColor: designerConfig.accentColor
                                  ? `rgb(${designerConfig.accentColor.join(',')})`
                                  : '#0f172a',
                              }}
                              className="text-white"
                            >
                              <th className="border border-slate-400 p-1 text-center w-6">No</th>
                              <th className="border border-slate-400 p-1">NISN</th>
                              <th className="border border-slate-400 p-1">Nama Siswa</th>
                              {subjects.map(s => (
                                <th key={s.id} className="border border-slate-400 p-1 text-center" title={s.name}>
                                  {s.code}
                                </th>
                              ))}
                              <th className="border border-slate-400 p-1 text-center bg-blue-950">Rata2</th>
                              <th className="border border-slate-400 p-1 text-center">Pred</th>
                              <th className="border border-slate-400 p-1 text-center">Rank</th>
                              <th className="border border-slate-400 p-1 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(previewShowAllRows
                              ? classLegerData
                              : classLegerData.slice(
                                  (previewPage - 1) * rowsPerPage,
                                  previewPage * rowsPerPage
                                )
                            ).map(r => (
                              <tr key={r.studentId} className="even:bg-slate-50">
                                <td className="border border-slate-300 p-1 text-center">{r.no}</td>
                                <td className="border border-slate-300 p-1 font-mono">{r.nisn}</td>
                                <td className="border border-slate-300 p-1 font-bold">{r.fullName}</td>
                                {subjects.map(s => (
                                  <td key={s.id} className="border border-slate-300 p-1 text-center">
                                    {r.subjectScores[s.id] || 0}
                                  </td>
                                ))}
                                <td className="border border-slate-300 p-1 text-center font-black text-blue-900 bg-blue-50/50">
                                  {r.average}
                                </td>
                                <td className="border border-slate-300 p-1 text-center font-bold">{r.predicate}</td>
                                <td className="border border-slate-300 p-1 text-center font-bold">#{r.rank}</td>
                                <td className="border border-slate-300 p-1 text-center font-bold">
                                  {r.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ==================================================== */}
                    {/* DOCUMENT 3 BODY: REKAP NILAI MATA PELAJARAN           */}
                    {/* ==================================================== */}
                    {reportType === 'grade_subject' && (
                      <div className="space-y-2.5">
                        <table className="w-full text-left text-[8.5px] border-collapse border border-slate-400">
                          <thead>
                            <tr
                              style={{
                                backgroundColor: designerConfig.accentColor
                                  ? `rgb(${designerConfig.accentColor.join(',')})`
                                  : '#0f172a',
                              }}
                              className="text-white"
                            >
                              <th className="border border-slate-400 p-1 text-center w-6">No</th>
                              <th className="border border-slate-400 p-1">NISN</th>
                              <th className="border border-slate-400 p-1">Nama Siswa</th>
                              <th className="border border-slate-400 p-1 text-center">Tugas (20%)</th>
                              <th className="border border-slate-400 p-1 text-center">Praktik (30%)</th>
                              <th className="border border-slate-400 p-1 text-center">Formatif (20%)</th>
                              <th className="border border-slate-400 p-1 text-center">Sumatif (30%)</th>
                              <th className="border border-slate-400 p-1 text-center bg-blue-950">Nilai Akhir</th>
                              <th className="border border-slate-400 p-1 text-center">Predikat</th>
                              <th className="border border-slate-400 p-1 text-center">Ketuntasan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(previewShowAllRows
                              ? subjectGradingData
                              : subjectGradingData.slice(
                                  (previewPage - 1) * rowsPerPage,
                                  previewPage * rowsPerPage
                                )
                            ).map(r => (
                              <tr key={r.studentId} className="even:bg-slate-50">
                                <td className="border border-slate-300 p-1 text-center">{r.no}</td>
                                <td className="border border-slate-300 p-1 font-mono">{r.nisn}</td>
                                <td className="border border-slate-300 p-1 font-bold">{r.fullName}</td>
                                <td className="border border-slate-300 p-1 text-center">{r.tugas}</td>
                                <td className="border border-slate-300 p-1 text-center">{r.praktik}</td>
                                <td className="border border-slate-300 p-1 text-center">{r.formatif}</td>
                                <td className="border border-slate-300 p-1 text-center">{r.sumatif}</td>
                                <td className="border border-slate-300 p-1 text-center font-black text-blue-900 bg-blue-50/50">
                                  {r.finalScore}
                                </td>
                                <td className="border border-slate-300 p-1 text-center font-bold">{r.predicate}</td>
                                <td className="border border-slate-300 p-1 text-center font-bold">
                                  {r.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ==================================================== */}
                    {/* DOCUMENT 4 BODY: RAPOR & TRANSKRIP INDIVIDU SISWA     */}
                    {/* ==================================================== */}
                    {reportType === 'student_transcript' && studentTranscriptData && (
                      <div className="space-y-3">
                        {/* Student Identity Box on Rapor Paper */}
                        <div className="grid grid-cols-2 gap-3 rounded border border-slate-300 bg-slate-50 p-2.5 text-[9px]">
                          <div className="space-y-1">
                            <p>
                              <span className="text-slate-500">Nama Peserta Didik:</span>{' '}
                              <strong className="text-slate-900 uppercase">
                                {studentTranscriptData.student.fullName}
                              </strong>
                            </p>
                            <p>
                              <span className="text-slate-500">NISN / NIS:</span>{' '}
                              <strong className="font-mono">
                                {studentTranscriptData.student.nisn} / {studentTranscriptData.student.nis}
                              </strong>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p>
                              <span className="text-slate-500">Kelas / Rombel:</span>{' '}
                              <strong>
                                {studentTranscriptData.student.className} ({studentTranscriptData.student.majorCode})
                              </strong>
                            </p>
                            <p>
                              <span className="text-slate-500">Siswa Urutan:</span>{' '}
                              <strong>
                                {activeStudentIndex + 1} dari {classStudents.length} Siswa
                              </strong>
                            </p>
                          </div>
                        </div>

                        {/* Grades Table */}
                        <table className="w-full text-left text-[8.5px] border-collapse border border-slate-400">
                          <thead>
                            <tr
                              style={{
                                backgroundColor: designerConfig.accentColor
                                  ? `rgb(${designerConfig.accentColor.join(',')})`
                                  : '#0f172a',
                              }}
                              className="text-white"
                            >
                              <th className="border border-slate-400 p-1 text-center w-6">No</th>
                              <th className="border border-slate-400 p-1">Mata Pelajaran</th>
                              <th className="border border-slate-400 p-1 text-center w-10">KKM</th>
                              <th className="border border-slate-400 p-1 text-center w-12">Nilai</th>
                              <th className="border border-slate-400 p-1 text-center w-12">Predikat</th>
                              <th className="border border-slate-400 p-1">Capaian Kompetensi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentTranscriptData.subjectsList.map(sub => (
                              <tr key={sub.subjectId} className="even:bg-slate-50">
                                <td className="border border-slate-300 p-1 text-center">{sub.no}</td>
                                <td className="border border-slate-300 p-1 font-bold">
                                  {sub.name}{' '}
                                  <span className="font-normal text-slate-500">({sub.code})</span>
                                </td>
                                <td className="border border-slate-300 p-1 text-center">{sub.kkm}</td>
                                <td className="border border-slate-300 p-1 text-center font-black text-blue-900">
                                  {sub.score}
                                </td>
                                <td className="border border-slate-300 p-1 text-center font-bold">
                                  {sub.predicate}
                                </td>
                                <td className="border border-slate-300 p-1 text-[8px] text-slate-700">
                                  {sub.feedback}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-slate-100 font-bold">
                              <td colSpan={3} className="border border-slate-400 p-1 text-right">
                                Rata-rata Nilai Akademik:
                              </td>
                              <td className="border border-slate-400 p-1 text-center font-black text-blue-900">
                                {studentTranscriptData.averageScore}
                              </td>
                              <td className="border border-slate-400 p-1 text-center">
                                {studentTranscriptData.averageScore >= 90
                                  ? 'A'
                                  : studentTranscriptData.averageScore >= 80
                                  ? 'B'
                                  : 'C'}
                              </td>
                              <td className="border border-slate-400 p-1 text-emerald-800">
                                Ketuntasan: TUNTAS
                              </td>
                            </tr>
                          </tfoot>
                        </table>

                        {/* Attendance Summary on Rapor Paper */}
                        <div className="grid grid-cols-2 gap-3 text-[8.5px]">
                          <div className="rounded border border-slate-300 p-2">
                            <p className="font-bold text-slate-800 mb-1">Rekapitulasi Kehadiran:</p>
                            <div className="flex items-center justify-between text-slate-700">
                              <span>Hadir: <strong>{studentTranscriptData.attendance.h}</strong></span>
                              <span>Sakit: <strong>{studentTranscriptData.attendance.s}</strong></span>
                              <span>Izin: <strong>{studentTranscriptData.attendance.i}</strong></span>
                              <span>Alpa: <strong>{studentTranscriptData.attendance.a}</strong></span>
                            </div>
                          </div>
                          <div className="rounded border border-slate-300 p-2">
                            <p className="font-bold text-slate-800 mb-0.5">Catatan Wali Kelas:</p>
                            <p className="italic text-slate-600 leading-snug">
                              "Pertahankan prestasi akademik dan kedisiplinan belajar."
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM SECTION: Signatures & NIP on Paper */}
                  <div className="mt-8 pt-4 flex justify-between text-[9px] border-t border-slate-200">
                    {/* Left Signer */}
                    <div className="w-48 text-left">
                      <p>Mengetahui,</p>
                      <p className="font-semibold">{designerConfig.leftSignerTitle}</p>
                      <div className="h-14 my-1 flex items-center">
                        {designerConfig.leftSignerSignatureUrl ? (
                          <img
                            src={designerConfig.leftSignerSignatureUrl}
                            alt="TTD Guru"
                            className="h-12 object-contain"
                          />
                        ) : (
                          <div className="h-10 w-28 border border-dashed border-slate-300 flex items-center justify-center text-[8px] text-slate-400 italic">
                            (Tanda Tangan)
                          </div>
                        )}
                      </div>
                      <p className="font-bold underline text-slate-900">{designerConfig.leftSignerName}</p>
                      <p className="text-slate-600 font-mono">NIP. {designerConfig.leftSignerNip}</p>
                    </div>

                    {/* Right Signer */}
                    <div className="w-48 text-right">
                      <p>
                        {designerConfig.rightSignerCity}, {designerConfig.rightSignerDate}
                      </p>
                      <p className="font-semibold">{designerConfig.rightSignerTitle}</p>
                      <div className="h-14 my-1 flex items-center justify-end">
                        {designerConfig.rightSignerSignatureUrl ? (
                          <img
                            src={designerConfig.rightSignerSignatureUrl}
                            alt="TTD Kepsek"
                            className="h-12 object-contain"
                          />
                        ) : (
                          <div className="h-10 w-28 border border-dashed border-slate-300 flex items-center justify-center text-[8px] text-slate-400 italic">
                            (Tanda Tangan)
                          </div>
                        )}
                      </div>
                      <p className="font-bold underline text-slate-900">{designerConfig.rightSignerName}</p>
                      <p className="text-slate-600 font-mono">NIP. {designerConfig.rightSignerNip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fullscreen Modal Preview (Allows inspecting each document one by one at large scale) */}
          {isFullscreenPreview && (
            <div className="fixed inset-0 z-50 flex flex-col bg-[#3E385B]/45 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-fade-in">
              <div className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6E8F2] bg-white p-3.5 text-[#3E385B] mb-4 shadow-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#685BC7] text-white text-xs font-black">
                    Dokumen {activeDocMeta.number}/4
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#3E385B]">{activeDocMeta.fullTitle}</h3>
                    <p className="text-[10px] text-[#8C88A4]">
                      Kelas {currentClass?.name} •{' '}
                      {reportType === 'student_transcript'
                        ? `Siswa ${activeStudentIndex + 1}/${classStudents.length}: ${activeStudent?.fullName}`
                        : reportType === 'grade_subject'
                        ? `Mapel ${activeSubjectIndex + 1}/${subjects.length}: ${currentSubject?.name}`
                        : `${classStudents.length} Siswa`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepDocument(-1)}
                    className="no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-full border border-[#E6E8F2] bg-[#F5F6FA] hover:bg-[#ECEEF7] px-3 text-xs font-bold text-[#3E385B] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4 shrink-0" />
                    <span>Dokumen Sebelumnya</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => stepDocument(1)}
                    className="no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-full bg-[#685BC7] hover:bg-[#584AB8] px-3 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Dokumen Berikutnya</span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </button>
                  {reportType === 'student_transcript' && (
                    <>
                      <button
                        type="button"
                        onClick={() => stepStudent(-1)}
                        className="no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 px-2.5 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
                        <span>Siswa Prev</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => stepStudent(1)}
                        className="no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 px-2.5 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Siswa Next</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 px-3 text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 shrink-0" />
                    <span>Cetak PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullscreenPreview(false)}
                    className="no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-rose-600 hover:bg-rose-500 px-3 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Minimize2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Tutup</span>
                  </button>
                </div>
              </div>

              {/* Large A4 Sheet inside Modal */}
              <div className="max-w-4xl w-full mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-10 border border-slate-300 text-xs flex-1 flex flex-col justify-between">
                <div>
                  {designerConfig.showKopSurat !== false && (
                    <div className="flex items-center gap-5 border-b-[3px] border-double border-slate-900 pb-4">
                      {designerConfig.logoDataUrl ? (
                        <img
                          src={designerConfig.logoDataUrl}
                          alt="Logo"
                          style={{
                            width: `${(designerConfig.logoWidth || 20) * 3.6}px`,
                            maxHeight: '84px',
                          }}
                          className="object-contain shrink-0"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 shrink-0 font-bold">
                          LOGO
                        </div>
                      )}
                      <div className="flex-1 text-center">
                        <h4 className="font-extrabold text-xs tracking-wider uppercase text-slate-800">
                          {designerConfig.institutionFoundation}
                        </h4>
                        <h2 className="font-black text-lg tracking-tight uppercase text-blue-950 mt-0.5">
                          {designerConfig.institutionName}
                        </h2>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          {designerConfig.institutionTagline}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">
                          {designerConfig.institutionAddress} | {designerConfig.institutionContact}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-center my-4">
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 underline">
                      {activeDocMeta.fullTitle}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Kelas: <strong>{currentClass?.name}</strong> • Tahun Pelajaran:{' '}
                      <strong>{activeAcademicYear.name}</strong> ({activeAcademicYear.activeSemester.toUpperCase()})
                    </p>
                  </div>

                  {/* Render full rows in fullscreen modal */}
                  {reportType === 'attendance_class' && (
                    <table className="w-full text-left text-[10px] border-collapse border border-slate-400">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="border border-slate-400 p-1.5 text-center">No</th>
                          <th className="border border-slate-400 p-1.5">NISN</th>
                          <th className="border border-slate-400 p-1.5">Nama Siswa</th>
                          <th className="border border-slate-400 p-1.5 text-center">H</th>
                          <th className="border border-slate-400 p-1.5 text-center">S</th>
                          <th className="border border-slate-400 p-1.5 text-center">I</th>
                          <th className="border border-slate-400 p-1.5 text-center">A</th>
                          <th className="border border-slate-400 p-1.5 text-center">T</th>
                          <th className="border border-slate-400 p-1.5 text-center">% Hadir</th>
                          <th className="border border-slate-400 p-1.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classAttendanceData.map(r => (
                          <tr key={r.studentId} className="even:bg-slate-50">
                            <td className="border border-slate-300 p-1.5 text-center">{r.no}</td>
                            <td className="border border-slate-300 p-1.5 font-mono">{r.nisn}</td>
                            <td className="border border-slate-300 p-1.5 font-bold">{r.fullName}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold text-emerald-700">{r.h}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{r.s}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{r.i}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold text-rose-700">{r.a}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{r.t}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold">{r.rate}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{r.statusLabel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {reportType === 'grade_class' && (
                    <table className="w-full text-left text-[9.5px] border-collapse border border-slate-400">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="border border-slate-400 p-1 text-center">No</th>
                          <th className="border border-slate-400 p-1">NISN</th>
                          <th className="border border-slate-400 p-1">Nama Siswa</th>
                          {subjects.map(s => (
                            <th key={s.id} className="border border-slate-400 p-1 text-center">
                              {s.code}
                            </th>
                          ))}
                          <th className="border border-slate-400 p-1 text-center">Rata2</th>
                          <th className="border border-slate-400 p-1 text-center">Pred</th>
                          <th className="border border-slate-400 p-1 text-center">Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classLegerData.map(r => (
                          <tr key={r.studentId} className="even:bg-slate-50">
                            <td className="border border-slate-300 p-1 text-center">{r.no}</td>
                            <td className="border border-slate-300 p-1 font-mono">{r.nisn}</td>
                            <td className="border border-slate-300 p-1 font-bold">{r.fullName}</td>
                            {subjects.map(s => (
                              <td key={s.id} className="border border-slate-300 p-1 text-center">
                                {r.subjectScores[s.id] || 0}
                              </td>
                            ))}
                            <td className="border border-slate-300 p-1 text-center font-black">{r.average}</td>
                            <td className="border border-slate-300 p-1 text-center font-bold">{r.predicate}</td>
                            <td className="border border-slate-300 p-1 text-center font-bold">#{r.rank}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {reportType === 'grade_subject' && (
                    <table className="w-full text-left text-[10px] border-collapse border border-slate-400">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="border border-slate-400 p-1.5 text-center">No</th>
                          <th className="border border-slate-400 p-1.5">NISN</th>
                          <th className="border border-slate-400 p-1.5">Nama Siswa</th>
                          <th className="border border-slate-400 p-1.5 text-center">Tugas</th>
                          <th className="border border-slate-400 p-1.5 text-center">Praktik</th>
                          <th className="border border-slate-400 p-1.5 text-center">Formatif</th>
                          <th className="border border-slate-400 p-1.5 text-center">Sumatif</th>
                          <th className="border border-slate-400 p-1.5 text-center">Nilai Akhir</th>
                          <th className="border border-slate-400 p-1.5 text-center">Predikat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectGradingData.map(r => (
                          <tr key={r.studentId} className="even:bg-slate-50">
                            <td className="border border-slate-300 p-1.5 text-center">{r.no}</td>
                            <td className="border border-slate-300 p-1.5 font-mono">{r.nisn}</td>
                            <td className="border border-slate-300 p-1.5 font-bold">{r.fullName}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{r.tugas}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{r.praktik}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{r.formatif}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{r.sumatif}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-black">{r.finalScore}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold">{r.predicate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {reportType === 'student_transcript' && studentTranscriptData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 rounded border border-slate-300 bg-slate-50 p-3 text-[11px]">
                        <div>
                          <p>Nama Siswa: <strong>{studentTranscriptData.student.fullName}</strong></p>
                          <p>NISN / NIS: <strong>{studentTranscriptData.student.nisn} / {studentTranscriptData.student.nis}</strong></p>
                        </div>
                        <div>
                          <p>Kelas: <strong>{studentTranscriptData.student.className}</strong></p>
                          <p>Urutan Siswa: <strong>{activeStudentIndex + 1} dari {classStudents.length}</strong></p>
                        </div>
                      </div>
                      <table className="w-full text-left text-[10px] border-collapse border border-slate-400">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="border border-slate-400 p-1.5 text-center">No</th>
                            <th className="border border-slate-400 p-1.5">Mata Pelajaran</th>
                            <th className="border border-slate-400 p-1.5 text-center">KKM</th>
                            <th className="border border-slate-400 p-1.5 text-center">Nilai</th>
                            <th className="border border-slate-400 p-1.5 text-center">Predikat</th>
                            <th className="border border-slate-400 p-1.5">Capaian Kompetensi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentTranscriptData.subjectsList.map(sub => (
                            <tr key={sub.subjectId} className="even:bg-slate-50">
                              <td className="border border-slate-300 p-1.5 text-center">{sub.no}</td>
                              <td className="border border-slate-300 p-1.5 font-bold">{sub.name}</td>
                              <td className="border border-slate-300 p-1.5 text-center">{sub.kkm}</td>
                              <td className="border border-slate-300 p-1.5 text-center font-black">{sub.score}</td>
                              <td className="border border-slate-300 p-1.5 text-center font-bold">{sub.predicate}</td>
                              <td className="border border-slate-300 p-1.5">{sub.feedback}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Signatures in Fullscreen */}
                <div className="mt-8 pt-4 flex justify-between text-[11px] border-t border-slate-200">
                  <div className="w-56 text-left">
                    <p>Mengetahui,</p>
                    <p className="font-semibold">{designerConfig.leftSignerTitle}</p>
                    <div className="h-16 my-1 flex items-center">
                      {designerConfig.leftSignerSignatureUrl ? (
                        <img src={designerConfig.leftSignerSignatureUrl} alt="TTD Guru" className="h-14 object-contain" />
                      ) : (
                        <div className="h-12 w-32 border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 italic">
                          (Tanda Tangan)
                        </div>
                      )}
                    </div>
                    <p className="font-bold underline">{designerConfig.leftSignerName}</p>
                    <p className="font-mono text-slate-600">NIP. {designerConfig.leftSignerNip}</p>
                  </div>

                  <div className="w-56 text-right">
                    <p>{designerConfig.rightSignerCity}, {designerConfig.rightSignerDate}</p>
                    <p className="font-semibold">{designerConfig.rightSignerTitle}</p>
                    <div className="h-16 my-1 flex items-center justify-end">
                      {designerConfig.rightSignerSignatureUrl ? (
                        <img src={designerConfig.rightSignerSignatureUrl} alt="TTD Kepsek" className="h-14 object-contain" />
                      ) : (
                        <div className="h-12 w-32 border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 italic">
                          (Tanda Tangan)
                        </div>
                      )}
                    </div>
                    <p className="font-bold underline">{designerConfig.rightSignerName}</p>
                    <p className="font-mono text-slate-600">NIP. {designerConfig.rightSignerNip}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
