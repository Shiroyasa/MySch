import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  CalendarCheck,
  CheckCheck,
  Download,
  Printer,
  History,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter,
  PlusCircle,
  AlertCircle,
  Trash2,
  ShieldCheck,
  Edit3,
  Save,
  RotateCcw,
  FileSpreadsheet,
  Search,
  Database,
  RefreshCw,
} from 'lucide-react';
import { exportToExcel, exportToPdf, exportToCsv, defaultReportConfig } from '../../utils/exportUtils';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { AcademyHeroBanner } from '../common/AcademyOrnaments';
import { SortByControl, SortOption, sortDataItems } from '../common/SortByControl';

interface EditableAttendanceRow {
  studentId: string;
  nisn: string;
  nis: string;
  studentName: string;
  className: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  terlambat: number;
  teacherNote: string;
  followUpAction: string;
}

export const AttendanceModule: React.FC = () => {
  const {
    currentUser,
    currentRole,
    classes,
    subjects,
    students,
    activeAcademicYear,
    attendanceSessions,
    attendanceRecords,
    attendanceCorrections,
    saveAttendanceSessionAndRecords,
    syncClassAttendanceRecapToDatabase,
    resetClassAttendanceToZero,
    deleteAttendanceSession,
    clearAttendanceForClassAndDate,
    submitAttendanceCorrection,
    reviewAttendanceCorrection,
    deleteAttendanceCorrection,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'input' | 'history' | 'correction' | 'editable_report'>('input');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inputSearch, setInputSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('az');
  const [reportPeriodLabel, setReportPeriodLabel] = useState('Rekapitulasi Semester Berjalan');
  const [signerWaliName, setSignerWaliName] = useState(defaultReportConfig.leftSignerName);
  const [signerWaliNip, setSignerWaliNip] = useState(defaultReportConfig.leftSignerNip);
  const [signerKepsekName, setSignerKepsekName] = useState(defaultReportConfig.rightSignerName);
  const [signerKepsekNip, setSignerKepsekNip] = useState(defaultReportConfig.rightSignerNip);

  // Editable Attendance Report local draft overrides (before or after syncing to DB)
  const [editableReportMap, setEditableReportMap] = useState<Record<string, EditableAttendanceRow>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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

  // Input form state
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceType, setAttendanceType] = useState<'harian' | 'mapel'>('harian');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  // Ensure selectedClassId is valid when classes load from Firestore
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = useMemo(
    () =>
      students.filter(
        s => s.classId === currentClass?.id || s.className === currentClass?.name
      ),
    [students, currentClass]
  );

  // Find existing session in database for the currently selected Class + Date + Type (+ Subject)
  const existingSession = useMemo(() => {
    if (!currentClass) return undefined;
    return attendanceSessions.find(
      s =>
        (s.classId === currentClass.id || s.className === currentClass.name) &&
        s.date === selectedDate &&
        s.type === attendanceType &&
        (attendanceType === 'harian' || s.subjectId === selectedSubjectId)
    );
  }, [attendanceSessions, currentClass, selectedDate, attendanceType, selectedSubjectId]);

  // Map student ID to their attendance status and note
  const [recordsMap, setRecordsMap] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});

  // Automatically load saved records from database whenever Class, Date, Type, Subject, or DB Records change
  useEffect(() => {
    const nextMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    if (existingSession) {
      const sessionRecords = attendanceRecords.filter(r => r.sessionId === existingSession.id);
      classStudents.forEach(std => {
        const found = sessionRecords.find(r => r.studentId === std.id);
        nextMap[std.id] = {
          status: found ? found.status : 'H',
          note: found?.note || '',
        };
      });
    } else {
      classStudents.forEach(std => {
        nextMap[std.id] = { status: 'H', note: '' };
      });
    }
    setRecordsMap(nextMap);
  }, [existingSession, attendanceRecords, classStudents]);

  // Re-sync students when class selection changes
  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecordsMap(prev => ({
      ...prev,
      [studentId]: {
        status,
        note: prev[studentId]?.note || '',
      },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setRecordsMap(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'H',
        note,
      },
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach(std => {
      next[std.id] = { status, note: recordsMap[std.id]?.note || '' };
    });
    setRecordsMap(next);
    showToast(`Semua siswa kelas ${currentClass?.name || ''} ditandai ${status}. Klik Simpan untuk menyimpan ke database.`);
  };

  // Live counters
  const counts = { H: 0, S: 0, I: 0, A: 0, T: 0 };
  classStudents.forEach(std => {
    const st = recordsMap[std.id]?.status || 'H';
    counts[st]++;
  });

  const total = classStudents.length;
  const attendanceRate = total > 0 ? (((counts.H + counts.T) / total) * 100).toFixed(1) : '100.0';

  const handleSave = (isFinal: boolean) => {
    if (!currentClass) return;
    const recordsPayload = classStudents.map(std => ({
      studentId: std.id,
      status: recordsMap[std.id]?.status || 'H',
      note: recordsMap[std.id]?.note || '',
    }));

    const subjectObj = subjects.find(s => s.id === selectedSubjectId);

    saveAttendanceSessionAndRecords(
      {
        date: selectedDate,
        classId: currentClass.id,
        className: currentClass.name,
        type: attendanceType,
        subjectId: attendanceType === 'mapel' ? subjectObj?.id : undefined,
        subjectName: attendanceType === 'mapel' ? subjectObj?.name : undefined,
        teacherId: currentUser.id,
        teacherName: currentUser.displayName,
        academicYearId: activeAcademicYear.id,
        semester: activeAcademicYear.activeSemester,
        status: isFinal ? 'final' : 'draft',
      },
      recordsPayload,
      isFinal
    );

    // Clear any stale local override for these students so Editable Report reflects live database counts
    setEditableReportMap(prev => {
      const next = { ...prev };
      classStudents.forEach(std => {
        delete next[std.id];
      });
      return next;
    });

    showToast(
      `Presensi ${currentClass.name} (${selectedDate}) berhasil disimpan ke Database Cloud & tersinkron ke seluruh laporan!`
    );
  };

  // Export handlers
  const handleExportExcel = () => {
    if (!currentClass) return;
    const exportData = classStudents.map((std, idx) => ({
      No: idx + 1,
      NISN: std.nisn,
      NIS: std.nis,
      'Nama Siswa': std.fullName,
      Kelas: std.className,
      Status:
        recordsMap[std.id]?.status === 'H'
          ? 'Hadir'
          : recordsMap[std.id]?.status === 'S'
          ? 'Sakit'
          : recordsMap[std.id]?.status === 'I'
          ? 'Izin'
          : recordsMap[std.id]?.status === 'T'
          ? 'Terlambat'
          : 'Alpa',
      Keterangan: recordsMap[std.id]?.note || '-',
    }));

    exportToExcel(exportData, `Presensi_SMK_MY_${currentClass.name}_${selectedDate}`);
    showToast('Data presensi berhasil diekspor ke Excel (.xlsx).');
  };

  const handleExportPdf = () => {
    if (!currentClass) return;
    const headers = ['No', 'NISN', 'Nama Siswa', 'Status', 'Keterangan'];
    const rows = classStudents.map((std, idx) => [
      idx + 1,
      std.nisn,
      std.fullName,
      recordsMap[std.id]?.status === 'H'
        ? 'Hadir (H)'
        : recordsMap[std.id]?.status === 'S'
        ? 'Sakit (S)'
        : recordsMap[std.id]?.status === 'I'
        ? 'Izin (I)'
        : recordsMap[std.id]?.status === 'T'
        ? 'Terlambat (T)'
        : 'Alpa (A)',
      recordsMap[std.id]?.note || '-',
    ]);

    exportToPdf(
      headers,
      rows,
      {
        title: `DAFTAR HADIR SISWA - ${attendanceType === 'harian' ? 'HARIAN' : 'MATA PELAJARAN'}`,
        className: currentClass.name,
        academicYear: `${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
        subjectName: attendanceType === 'mapel' ? subjects.find(s => s.id === selectedSubjectId)?.name : undefined,
        dateRange: selectedDate,
      },
      `Presensi_${currentClass.name}_${selectedDate}`
    );
    showToast('Dokumen PDF daftar hadir berhasil diunduh.');
  };

  // Correction form state for students
  const [corStudentId, setCorStudentId] = useState<string>(students[0]?.id || '');
  const [corDate, setCorDate] = useState<string>(selectedDate);
  const [corCurStatus, setCorCurStatus] = useState<AttendanceStatus>('A');
  const [corReqStatus, setCorReqStatus] = useState<AttendanceStatus>('I');
  const [corReason, setCorReason] = useState<string>('');

  useEffect(() => {
    if (!corStudentId && students.length > 0) {
      setCorStudentId(students[0].id);
    }
  }, [students, corStudentId]);

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corReason.trim()) {
      showToast('Harap isi alasan permohonan koreksi secara jelas.');
      return;
    }

    const myStd =
      students.find(s => s.id === corStudentId) ||
      students.find(s => s.fullName.toLowerCase() === currentUser.displayName.toLowerCase()) ||
      students[0];

    if (!myStd) return;

    submitAttendanceCorrection({
      studentId: myStd.id,
      studentName: myStd.fullName,
      nisn: myStd.nisn,
      classId: myStd.classId,
      className: myStd.className,
      date: corDate,
      currentStatus: corCurStatus,
      requestedStatus: corReqStatus,
      reason: corReason,
      requestedBy: currentUser.displayName,
    });

    setCorReason('');
    showToast(`Permohonan koreksi presensi ${myStd.fullName} berhasil diajukan & tersimpan di database.`);
  };

  // Compute all rows for current class (unfiltered) so Save/Reset always covers every student in the class
  const allClassEditableRows: EditableAttendanceRow[] = useMemo(() => {
    return classStudents.map(std => {
      if (editableReportMap[std.id]) {
        return editableReportMap[std.id];
      }
      const myRecs = attendanceRecords.filter(r => r.studentId === std.id);
      const hCount = myRecs.filter(r => r.status === 'H').length;
      const sCount = myRecs.filter(r => r.status === 'S').length;
      const iCount = myRecs.filter(r => r.status === 'I').length;
      const aCount = myRecs.filter(r => r.status === 'A').length;
      const tCount = myRecs.filter(r => r.status === 'T').length;
      const lastNoteRec = myRecs.find(r => r.note && r.note.trim().length > 0);

      return {
        studentId: std.id,
        nisn: std.nisn,
        nis: std.nis,
        studentName: std.fullName,
        className: std.className,
        hadir: hCount,
        sakit: sCount,
        izin: iCount,
        alpa: aCount,
        terlambat: tCount,
        teacherNote:
          lastNoteRec?.note ||
          (aCount > 2 ? 'Perlu pembinaan kedisiplinan' : 'Kehadiran baik & disiplin'),
        followUpAction: aCount > 2 ? 'Panggilan Wali Kelas' : 'Tidak Ada',
      };
    });
  }, [classStudents, editableReportMap, attendanceRecords]);

  // Filtered & sorted rows for table display
  const editableClassRows: EditableAttendanceRow[] = useMemo(() => {
    const filtered = allClassEditableRows.filter(
      row =>
        row.studentName.toLowerCase().includes(reportSearch.toLowerCase()) ||
        row.nisn.toLowerCase().includes(reportSearch.toLowerCase()) ||
        row.nis.toLowerCase().includes(reportSearch.toLowerCase())
    );
    return sortDataItems(filtered, sortBy, {
      getName: r => r.studentName,
      getNis: r => r.nis || r.nisn,
      getDate: r => {
        const std = classStudents.find(s => s.id === r.studentId);
        return std?.createdAt || '';
      },
    });
  }, [allClassEditableRows, reportSearch, sortBy, classStudents]);

  const handleUpdateEditableRow = (studentId: string, field: keyof EditableAttendanceRow, value: string | number) => {
    const existing = allClassEditableRows.find(r => r.studentId === studentId);
    if (!existing) return;
    const updatedRow: EditableAttendanceRow = {
      ...existing,
      [field]: value,
    };
    setEditableReportMap(prev => ({
      ...prev,
      [studentId]: updatedRow,
    }));
  };

  // Save Editable Report directly to Firestore Database & synchronize across all modules!
  const handleSaveEditableReport = () => {
    if (!currentClass) return;
    const payload = allClassEditableRows.map(r => ({
      studentId: r.studentId,
      fullName: r.studentName,
      studentName: r.studentName,
      nisn: r.nisn,
      nis: r.nis,
      h: Math.max(0, Number(r.hadir) || 0),
      s: Math.max(0, Number(r.sakit) || 0),
      i: Math.max(0, Number(r.izin) || 0),
      a: Math.max(0, Number(r.alpa) || 0),
      t: Math.max(0, Number(r.terlambat) || 0),
      teacherNote: r.teacherNote,
    }));

    syncClassAttendanceRecapToDatabase(currentClass.id, payload);

    // Clear temporary map because the database now holds the authoritative synced records
    setEditableReportMap({});
    showToast(
      `Laporan presensi kelas ${currentClass.name} berhasil disimpan & tersinkron ke semua menu!`
    );
  };

  // Reset all attendance counts (H, S, I, A, T) to 0 for the selected class and sync to DB
  const handleResetEditableReportClass = () => {
    if (!currentClass) return;
    resetClassAttendanceToZero(currentClass.id);

    const zeroMap: Record<string, EditableAttendanceRow> = {};
    classStudents.forEach(std => {
      zeroMap[std.id] = {
        studentId: std.id,
        nisn: std.nisn,
        nis: std.nis,
        studentName: std.fullName,
        className: std.className,
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpa: 0,
        terlambat: 0,
        teacherNote: 'Kehadiran telah direset',
        followUpAction: 'Tidak Ada',
      };
    });
    setEditableReportMap(zeroMap);
    showToast(`Seluruh hitungan presensi kelas ${currentClass.name} berhasil direset menjadi 0 & disinkronkan!`);
  };

  const handleExportEditableReportExcel = () => {
    const data = editableClassRows.map((r, idx) => {
      const total = r.hadir + r.sakit + r.izin + r.alpa;
      const rate = total > 0 ? Math.round(((r.hadir + r.terlambat) / total) * 100) : 100;
      return {
        No: idx + 1,
        NISN: r.nisn,
        NIS: r.nis,
        'Nama Siswa': r.studentName,
        Kelas: r.className,
        'Hadir (H)': r.hadir,
        'Sakit (S)': r.sakit,
        'Izin (I)': r.izin,
        'Alpa (A)': r.alpa,
        'Terlambat (T)': r.terlambat,
        'Total Hari': total,
        'Persentase Kehadiran': `${rate}%`,
        'Catatan Wali Kelas': r.teacherNote,
        'Tindak Lanjut': r.followUpAction,
      };
    });
    exportToExcel(data, `Laporan_Presensi_${currentClass?.name}_${activeAcademicYear.name}`, 'Rekap Presensi');
    showToast('Laporan presensi berhasil diekspor ke Excel (.xlsx).');
  };

  const handleExportEditableReportCsv = () => {
    const data = editableClassRows.map((r, idx) => {
      const total = r.hadir + r.sakit + r.izin + r.alpa;
      const rate = total > 0 ? Math.round(((r.hadir + r.terlambat) / total) * 100) : 100;
      return {
        No: idx + 1,
        NISN: r.nisn,
        'Nama Siswa': r.studentName,
        Kelas: r.className,
        Hadir: r.hadir,
        Sakit: r.sakit,
        Izin: r.izin,
        Alpa: r.alpa,
        Terlambat: r.terlambat,
        Persentase: `${rate}%`,
        Catatan: r.teacherNote,
      };
    });
    exportToCsv(data, `Laporan_Presensi_${currentClass?.name}_${activeAcademicYear.name}`);
    showToast('Laporan presensi berhasil diekspor ke CSV (.csv).');
  };

  const handleExportEditableReportPdf = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'H', 'S', 'I', 'A', 'T', 'Kehadiran', 'Catatan Wali Kelas'];
    const rows = editableClassRows.map((r, idx) => {
      const total = r.hadir + r.sakit + r.izin + r.alpa;
      const rate = total > 0 ? Math.round(((r.hadir + r.terlambat) / total) * 100) : 100;
      return [
        idx + 1,
        r.nisn,
        r.studentName,
        r.hadir,
        r.sakit,
        r.izin,
        r.alpa,
        r.terlambat,
        `${rate}%`,
        r.teacherNote,
      ];
    });

    exportToPdf(
      headers,
      rows,
      {
        title: `LAPORAN REKAPITULASI PRESENSI SISWA (${reportPeriodLabel.toUpperCase()})`,
        className: currentClass?.name,
        academicYear: `${activeAcademicYear.name} (${activeAcademicYear.activeSemester.toUpperCase()})`,
        teacherName: signerWaliName,
      },
      `Laporan_Presensi_${currentClass?.name}`,
      'portrait',
      {
        ...defaultReportConfig,
        leftSignerName: signerWaliName,
        leftSignerNip: signerWaliNip,
        rightSignerName: signerKepsekName,
        rightSignerNip: signerKepsekNip,
      }
    );
    showToast('Dokumen PDF Laporan Presensi berhasil diunduh.');
  };

  const filteredInputStudents = useMemo(() => {
    const filtered = classStudents.filter(
      std =>
        std.fullName.toLowerCase().includes(inputSearch.toLowerCase()) ||
        std.nisn.toLowerCase().includes(inputSearch.toLowerCase()) ||
        std.nis.toLowerCase().includes(inputSearch.toLowerCase())
    );
    return sortDataItems(filtered, sortBy, {
      getName: s => s.fullName,
      getNis: s => s.nis || s.nisn,
      getDate: s => s.createdAt,
    });
  }, [classStudents, inputSearch, sortBy]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl dark:bg-blue-600 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Royal Academy Banner & Navigation Tabs */}
      <AcademyHeroBanner
        moduleKey="attendance"
        kicker="MANAJEMEN KEHADIRAN & PRESENSI HARIAN"
        title="PRESENSI & ABSENSI SISWA"
        subtitle="Pencatatan kehadiran jam pelajaran, rekapitulasi laporan presensi interaktif (editable), riwayat sesi, dan verifikasi koreksi absensi tersinkron langsung ke Cloud Database."
        icon={CalendarCheck}
        rightContent={
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#C8A44B]/40 bg-[#0F1E3A]/90 p-1.5 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('input')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'input'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Input Presensi
            </button>
            <button
              onClick={() => setActiveTab('editable_report')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'editable_report'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5 text-[#EAB308]" />
              <span>Laporan Editable</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Riwayat ({attendanceSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('correction')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'correction'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Koreksi ({attendanceCorrections.length})
            </button>
          </div>
        }
      />

      {/* TAB 1: INPUT PRESENSI */}
      {activeTab === 'input' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Class selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Rombel / Kelas
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => handleClassChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.majorCode}) - Wali: {c.homeroomTeacherName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Tanggal Presensi
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Attendance Type */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Jenis Presensi
                </label>
                <select
                  value={attendanceType}
                  onChange={e => setAttendanceType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="harian">Harian (Wali Kelas / Piket)</option>
                  <option value="mapel">Per Jam Pelajaran (Guru Mapel)</option>
                </select>
              </div>

              {/* Subject if mapel */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Mata Pelajaran {attendanceType === 'harian' && '(Opsional)'}
                </label>
                <select
                  disabled={attendanceType === 'harian'}
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => markAll('H')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Tandai Semua Hadir</span>
                </button>
              </div>
            </div>

            {/* Secondary Bar: Search Student + Database Sync Status + Quick Save Button */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={inputSearch}
                  onChange={e => setInputSearch(e.target.value)}
                  placeholder="Cari nama siswa atau NISN..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <SortByControl value={sortBy} onChange={setSortBy} />

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Presensi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Summary Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blue-50/70 p-4 border border-blue-100 dark:bg-slate-800/80 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Ringkasan Hari Ini:</span>
              <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Hadir: {counts.H}
              </span>
              <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Sakit: {counts.S}
              </span>
              <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Izin: {counts.I}
              </span>
              <span className="rounded-lg bg-rose-100 px-2.5 py-1 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                Alpa: {counts.A}
              </span>
              <span className="rounded-lg bg-purple-100 px-2.5 py-1 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                Terlambat: {counts.T}
              </span>
              <span className="text-slate-500">| Total: {total} Siswa</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Persentase:</span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">{attendanceRate}%</span>
            </div>
          </div>

          {/* Student attendance table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">NISN / NIS</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4 text-center">L/P</th>
                    <th className="py-3 px-4 text-center min-w-[280px]">Status Kehadiran</th>
                    <th className="py-3 px-4 min-w-[200px]">Catatan / Alasan Khusus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInputStudents.map((std, idx) => {
                    const current = recordsMap[std.id] || { status: 'H', note: '' };

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {std.nisn} <span className="text-slate-400">/ {std.nis}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {std.fullName}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500 font-semibold">{std.gender}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {[
                              { code: 'H', label: 'Hadir', bg: 'bg-emerald-500 text-white', hover: 'hover:bg-emerald-100' },
                              { code: 'S', label: 'Sakit', bg: 'bg-amber-500 text-white', hover: 'hover:bg-amber-100' },
                              { code: 'I', label: 'Izin', bg: 'bg-blue-500 text-white', hover: 'hover:bg-blue-100' },
                              { code: 'A', label: 'Alpa', bg: 'bg-rose-500 text-white', hover: 'hover:bg-rose-100' },
                              { code: 'T', label: 'Telat', bg: 'bg-purple-500 text-white', hover: 'hover:bg-purple-100' },
                            ].map(btn => {
                              const isChecked = current.status === btn.code;

                              return (
                                <button
                                  key={btn.code}
                                  type="button"
                                  onClick={() => handleStatusChange(std.id, btn.code as AttendanceStatus)}
                                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                                    isChecked
                                      ? `${btn.bg} shadow-xs scale-105 ring-2 ring-blue-500/30`
                                      : `border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 ${btn.hover}`
                                  }`}
                                >
                                  {btn.label} ({btn.code})
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Opsional: Surat dokter / jam datang"
                            value={current.note}
                            onChange={e => handleNoteChange(std.id, e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1 px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Download className="h-4 w-4" /> Ekspor Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Printer className="h-4 w-4" /> Unduh PDF
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalConfig({
                      isOpen: true,
                      title: 'Kosongkan Presensi Sesi Ini',
                      itemName: `Presensi ${currentClass.name} (${selectedDate})`,
                      description: `Apakah Anda yakin ingin mengosongkan rekaman presensi kelas ${currentClass.name} untuk tanggal ${selectedDate}? Semua status kehadiran siswa akan direset ke status default.`,
                      confirmLabel: 'Kosongkan Sesi',
                      onConfirm: () => {
                        clearAttendanceForClassAndDate(currentClass.id, selectedDate, attendanceType, attendanceType === 'mapel' ? selectedSubjectId : undefined);
                        const resetMap: Record<string, { status: AttendanceStatus; note: string }> = {};
                        classStudents.forEach(std => {
                          resetMap[std.id] = { status: 'H', note: '' };
                        });
                        setRecordsMap(resetMap);
                        closeDeleteModal();
                        showToast(`Presensi kelas ${currentClass.name} tanggal ${selectedDate} berhasil dikosongkan.`);
                      },
                    });
                  }}
                  className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 transition-colors cursor-pointer"
                  title="Hapus atau kosongkan presensi sesi kelas ini"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Kosongkan Sesi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                >
                  Simpan Draf
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Simpan &amp; Finalisasi Presensi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT & REKAP */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Riwayat Sesi Presensi Terdata</h2>
            <p className="text-xs text-slate-500 mb-4">Daftar sesi absensi yang telah tersimpan di sistem.</p>

            <div className="space-y-3">
              {attendanceSessions.map(ses => (
                <div
                  key={ses.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{ses.className}</span>
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300 capitalize">
                        {ses.type === 'harian' ? 'Presensi Harian' : ses.subjectName}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                        ses.status === 'final' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ses.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Tanggal: <strong>{ses.date}</strong> &bull; Oleh: {ses.teacherName}
                    </p>
                    <div className="flex items-center gap-3 text-xs mt-2 font-semibold">
                      <span className="text-emerald-600">Hadir: {ses.presentCount}</span>
                      <span className="text-amber-600">Sakit: {ses.sickCount}</span>
                      <span className="text-blue-600">Izin: {ses.leaveCount}</span>
                      <span className="text-rose-600">Alpa: {ses.absentCount}</span>
                      <span className="text-purple-600">Terlambat: {ses.lateCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedClassId(ses.classId);
                        setSelectedDate(ses.date);
                        setAttendanceType(ses.type);
                        setActiveTab('input');
                      }}
                      className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      Buka Data
                    </button>
                    <button
                      onClick={() => {
                        setDeleteModalConfig({
                          isOpen: true,
                          title: 'Hapus Sesi Presensi',
                          itemName: `Presensi ${ses.className} (${ses.date})`,
                          description: 'Apakah Anda yakin ingin menghapus seluruh rekaman presensi untuk sesi ini? Seluruh data kehadiran siswa pada sesi ini akan dihapus dari sistem.',
                          onConfirm: () => {
                            deleteAttendanceSession(ses.id);
                            closeDeleteModal();
                            showToast(`Sesi presensi ${ses.className} (${ses.date}) berhasil dihapus.`);
                          },
                        });
                      }}
                      className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400"
                      title="Hapus Sesi Presensi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KOREKSI PRESENSI */}
      {activeTab === 'correction' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit form (Especially for Siswa / Guru) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Form Pengajuan Koreksi Presensi</h2>
            <p className="text-xs text-slate-500 mb-4">
              Ajukan perubahan status kehadiran jika terdapat kekeliruan pencatatan atau surat dokter susulan.
            </p>

            <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Siswa Pemohon</label>
                <select
                  value={corStudentId}
                  onChange={e => setCorStudentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.className} - NISN: {s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tanggal Absensi</label>
                <input
                  type="date"
                  value={corDate}
                  onChange={e => setCorDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Saat Ini</label>
                  <select
                    value={corCurStatus}
                    onChange={e => setCorCurStatus(e.target.value as AttendanceStatus)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="A">Alpa (A)</option>
                    <option value="S">Sakit (S)</option>
                    <option value="I">Izin (I)</option>
                    <option value="T">Terlambat (T)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Koreksi Menjadi</label>
                  <select
                    value={corReqStatus}
                    onChange={e => setCorReqStatus(e.target.value as AttendanceStatus)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="H">Hadir (H)</option>
                    <option value="I">Izin (I)</option>
                    <option value="S">Sakit (S)</option>
                    <option value="T">Terlambat (T)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Alasan Pengajuan Koreksi</label>
                <textarea
                  rows={3}
                  value={corReason}
                  onChange={e => setCorReason(e.target.value)}
                  placeholder="Contoh: Surat izin dokter baru diserahkan karena orang tua dinas..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
              >
                Kirim Permohonan Koreksi
              </button>
            </form>
          </div>

          {/* Review list for Wali Kelas / Guru / Super Admin */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Daftar Permohonan Koreksi</h2>
            <p className="text-xs text-slate-500 mb-4">Verifikasi dan persetujuan oleh Wali Kelas / Guru</p>

            <div className="space-y-3">
              {attendanceCorrections.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Belum ada pengajuan koreksi presensi.</p>
              ) : (
                attendanceCorrections.map(cor => (
                  <div
                    key={cor.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {cor.studentName} ({cor.className})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        cor.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : cor.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cor.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Tgl: <strong>{cor.date}</strong> &bull; Perubahan: <span className="line-through text-rose-500 font-bold">{cor.currentStatus}</span> &rarr; <span className="text-emerald-600 font-bold">{cor.requestedStatus}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 italic">&ldquo;{cor.reason}&rdquo;</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => {
                          setDeleteModalConfig({
                            isOpen: true,
                            title: 'Hapus Permohonan Koreksi',
                            itemName: `Koreksi ${cor.studentName} (${cor.date})`,
                            description: 'Apakah Anda yakin ingin menghapus permohonan koreksi ini?',
                            onConfirm: () => {
                              deleteAttendanceCorrection(cor.id);
                              closeDeleteModal();
                              showToast(`Permohonan koreksi presensi ${cor.studentName} berhasil dihapus.`);
                            },
                          });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                        title="Hapus Permohonan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {cor.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => reviewAttendanceCorrection(cor.id, 'rejected', 'Alasan belum memenuhi syarat verifikasi')}
                            className="rounded-lg border border-rose-300 px-3 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() => reviewAttendanceCorrection(cor.id, 'approved', 'Disetujui berdasarkan surat keterangan resmi')}
                            className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                          >
                            Setujui &amp; Ubah Presensi
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAPORAN & REKAP PRESENSI EDITABLE (SESUAI HALAMAN LAPORAN) */}
      {activeTab === 'editable_report' && (
        <div className="space-y-6">
          {/* Control & Export Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Pilih Kelas Rekapitulasi
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => handleClassChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.majorCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Periode Laporan
                </label>
                <input
                  type="text"
                  value={reportPeriodLabel}
                  onChange={e => setReportPeriodLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Rekapitulasi Semester Ganjil"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Cari Siswa / NISN
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={reportSearch}
                    onChange={e => setReportSearch(e.target.value)}
                    placeholder="Ketik nama atau NISN..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Aksi Simpan &amp; Ekspor Resmi
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSaveEditableReport}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-blue-600 py-2.5 px-2.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-xs"
                    title="Simpan Perubahan Laporan Presensi"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Simpan</span>
                  </button>
                  <button
                    onClick={handleExportEditableReportExcel}
                    className="flex items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 px-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer"
                    title="Ekspor Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={handleExportEditableReportCsv}
                    className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2.5 px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                    title="Ekspor CSV (.csv)"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={handleExportEditableReportPdf}
                    className="flex items-center justify-center gap-1 rounded-xl bg-indigo-600 py-2.5 px-2.5 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
                    title="Cetak PDF Resmi"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Signers & Reset Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Nama Wali Kelas (Penandatangan)</label>
                <input
                  type="text"
                  value={signerWaliName}
                  onChange={e => setSignerWaliName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">NIP Wali Kelas</label>
                <input
                  type="text"
                  value={signerWaliNip}
                  onChange={e => setSignerWaliNip(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={signerKepsekName}
                  onChange={e => setSignerKepsekName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={signerKepsekNip}
                  onChange={e => setSignerKepsekNip(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleResetEditableReportClass}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Hitungan Sesi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editable Attendance Report Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Tabel Editor Laporan Rekapitulasi Presensi — Kelas {currentClass?.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Klik langsung pada kolom angka (H, S, I, A, T) atau catatan wali kelas untuk menyunting laporan, lalu klik Simpan untuk menyinkronkan ke seluruh menu.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SortByControl value={sortBy} onChange={setSortBy} />
                <span className="text-xs font-bold text-blue-600">
                  {editableClassRows.length} Siswa Ditampilkan
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-bold">
                    <th className="py-2.5 px-2 text-center w-10">No</th>
                    <th className="py-2.5 px-2">NISN</th>
                    <th className="py-2.5 px-3">Nama Lengkap Siswa</th>
                    <th className="py-2.5 px-2 text-center text-emerald-700 dark:text-emerald-400 w-16">Hadir (H)</th>
                    <th className="py-2.5 px-2 text-center text-amber-700 dark:text-amber-400 w-16">Sakit (S)</th>
                    <th className="py-2.5 px-2 text-center text-blue-700 dark:text-blue-400 w-16">Izin (I)</th>
                    <th className="py-2.5 px-2 text-center text-rose-700 dark:text-rose-400 w-16">Alpa (A)</th>
                    <th className="py-2.5 px-2 text-center text-purple-700 dark:text-purple-400 w-16">Lambat (T)</th>
                    <th className="py-2.5 px-2 text-center w-20">% Hadir</th>
                    <th className="py-2.5 px-3">Catatan / Evaluasi Wali Kelas (Editable)</th>
                    <th className="py-2.5 px-2">Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {editableClassRows.map((row, idx) => {
                    const total = row.hadir + row.sakit + row.izin + row.alpa;
                    const rate = total > 0 ? Math.round((row.hadir / total) * 100) : 100;
                    return (
                      <tr key={row.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="py-2 px-2 font-mono text-[11px] text-slate-500">{row.nisn}</td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{row.studentName}</td>
                        <td className="py-2 px-1.5 text-center">
                          <input
                            type="number"
                            min={0}
                            value={row.hadir}
                            onChange={e => handleUpdateEditableRow(row.studentId, 'hadir', Math.max(0, Number(e.target.value)))}
                            className="w-14 rounded-lg border border-emerald-200 bg-emerald-50/50 py-1 px-1.5 text-center font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                          />
                        </td>
                        <td className="py-2 px-1.5 text-center">
                          <input
                            type="number"
                            min={0}
                            value={row.sakit}
                            onChange={e => handleUpdateEditableRow(row.studentId, 'sakit', Math.max(0, Number(e.target.value)))}
                            className="w-14 rounded-lg border border-amber-200 bg-amber-50/50 py-1 px-1.5 text-center font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                          />
                        </td>
                        <td className="py-2 px-1.5 text-center">
                          <input
                            type="number"
                            min={0}
                            value={row.izin}
                            onChange={e => handleUpdateEditableRow(row.studentId, 'izin', Math.max(0, Number(e.target.value)))}
                            className="w-14 rounded-lg border border-blue-200 bg-blue-50/50 py-1 px-1.5 text-center font-bold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                          />
                        </td>
                        <td className="py-2 px-1.5 text-center">
                          <input
                            type="number"
                            min={0}
                            value={row.alpa}
                            onChange={e => handleUpdateEditableRow(row.studentId, 'alpa', Math.max(0, Number(e.target.value)))}
                            className="w-14 rounded-lg border border-rose-200 bg-rose-50/50 py-1 px-1.5 text-center font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                          />
                        </td>
                        <td className="py-2 px-1.5 text-center">
                          <input
                            type="number"
                            min={0}
                            value={row.terlambat}
                            onChange={e => handleUpdateEditableRow(row.studentId, 'terlambat', Math.max(0, Number(e.target.value)))}
                            className="w-14 rounded-lg border border-purple-200 bg-purple-50/50 py-1 px-1.5 text-center font-bold text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`font-black ${
                              rate >= 90
                                ? 'text-emerald-600'
                                : rate >= 75
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {rate}%
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={row.teacherNote}
                            onChange={e => handleUpdateEditableRow(row.studentId, 'teacherNote', e.target.value)}
                            className="w-full min-w-[180px] rounded-lg border border-slate-200 bg-slate-50/70 py-1 px-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={row.followUpAction}
                            onChange={e => handleUpdateEditableRow(row.studentId, 'followUpAction', e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 py-1 px-2 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <option value="Tidak Ada">Tidak Ada</option>
                            <option value="Teguran Lisan">Teguran Lisan</option>
                            <option value="Panggilan Wali Kelas">Panggilan Wali Kelas</option>
                            <option value="Konseling BK">Konseling BK</option>
                            <option value="Panggilan Orang Tua">Panggilan Orang Tua</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Save & Reset Bar for Editable Report */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleResetEditableReportClass}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Semua Presensi ke 0</span>
              </button>

              <button
                type="button"
                onClick={handleSaveEditableReport}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Presensi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Delete Modal */}
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
