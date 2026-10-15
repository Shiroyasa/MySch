import React, { useState } from 'react';
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
} from 'lucide-react';
import { exportToExcel, exportToPdf, exportToCsv } from '../../utils/exportUtils';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

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
    deleteAttendanceSession,
    clearAttendanceForClassAndDate,
    submitAttendanceCorrection,
    reviewAttendanceCorrection,
    deleteAttendanceCorrection,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'input' | 'history' | 'correction'>('input');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
  
  // Student row entries state
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.className === currentClass?.name);

  // Map student ID to their attendance status and note
  const [recordsMap, setRecordsMap] = useState<Record<string, { status: AttendanceStatus; note: string }>>(() => {
    const initial: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach(std => {
      initial[std.id] = { status: 'H', note: '' };
    });
    return initial;
  });

  // Re-sync students when class selection changes
  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    const targetClass = classes.find(c => c.id === newClassId);
    const targetStudents = students.filter(s => s.className === targetClass?.name);
    const newMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    targetStudents.forEach(std => {
      newMap[std.id] = { status: 'H', note: '' };
    });
    setRecordsMap(newMap);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecordsMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setRecordsMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    setRecordsMap(prev => {
      const next = { ...prev };
      classStudents.forEach(std => {
        next[std.id] = { ...next[std.id], status };
      });
      return next;
    });
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

    showToast(`Presensi ${currentClass.name} tanggal ${selectedDate} berhasil ${isFinal ? 'difinalisasi' : 'disimpan sebagai draf'}!`);
  };

  // Export handlers
  const handleExportExcel = () => {
    const exportData = classStudents.map((std, idx) => ({
      No: idx + 1,
      NISN: std.nisn,
      NIS: std.nis,
      'Nama Siswa': std.fullName,
      Kelas: std.className,
      Status: recordsMap[std.id]?.status === 'H' ? 'Hadir' : recordsMap[std.id]?.status === 'S' ? 'Sakit' : recordsMap[std.id]?.status === 'I' ? 'Izin' : recordsMap[std.id]?.status === 'T' ? 'Terlambat' : 'Alpa',
      Keterangan: recordsMap[std.id]?.note || '-',
    }));

    exportToExcel(exportData, `Presensi_SMK_MY_${currentClass.name}_${selectedDate}`);
  };

  const handleExportPdf = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Status', 'Keterangan'];
    const rows = classStudents.map((std, idx) => [
      idx + 1,
      std.nisn,
      std.fullName,
      recordsMap[std.id]?.status === 'H' ? 'Hadir (H)' : recordsMap[std.id]?.status === 'S' ? 'Sakit (S)' : recordsMap[std.id]?.status === 'I' ? 'Izin (I)' : recordsMap[std.id]?.status === 'T' ? 'Terlambat (T)' : 'Alpa (A)',
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
  };

  // Correction form state for students
  const [corStudentId, setCorStudentId] = useState<string>(students[0]?.id || '');
  const [corDate, setCorDate] = useState<string>(selectedDate);
  const [corCurStatus, setCorCurStatus] = useState<AttendanceStatus>('A');
  const [corReqStatus, setCorReqStatus] = useState<AttendanceStatus>('I');
  const [corReason, setCorReason] = useState<string>('');

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corReason.trim()) {
      showToast('Harap isi alasan permohonan koreksi secara jelas.');
      return;
    }

    const myStd = students.find(s => s.id === corStudentId) ||
      students.find(s => s.fullName.toLowerCase() === currentUser.displayName.toLowerCase()) ||
      students[0];

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
    showToast(`Permohonan koreksi presensi ${myStd.fullName} berhasil diajukan.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl dark:bg-blue-600 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Manajemen Presensi &amp; Absensi Siswa
            </h1>
            <p className="text-xs text-slate-500">SMK Mardi Yuana Cikembar &bull; Kurikulum Merdeka Vokasi</p>
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
            Input Presensi
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Riwayat &amp; Rekap ({attendanceSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('correction')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'correction'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Koreksi Presensi ({attendanceCorrections.length})
          </button>
        </div>
      </div>

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
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => markAll('H')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Tandai Semua Hadir</span>
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
                  {classStudents.map((std, idx) => {
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
                                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
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
