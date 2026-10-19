import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonSchedule } from '../../types';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  MapPin,
  Search,
  Filter,
  Sparkles,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';

export interface AcademyScheduleBoardProps {
  maxHeightClass?: string;
  className?: string;
}

export const AcademyScheduleBoard: React.FC<AcademyScheduleBoardProps> = ({
  maxHeightClass = 'max-h-[350px]',
  className = '',
}) => {
  const {
    lessonSchedules,
    classes,
    subjects,
    teachers,
    saveLessonSchedule,
    deleteLessonSchedule,
    addToast,
  } = useApp();

  // Determine current day in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = dayNames[new Date().getDay()];

  // Active filter state
  const [selectedDay, setSelectedDay] = useState<string>(
    ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].includes(todayName) ? todayName : 'Semua'
  );
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal state for adding/editing schedules directly from the Schedule Board
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LessonSchedule | null>(null);
  const [formDay, setFormDay] = useState<LessonSchedule['day']>('Senin');
  const [formStartTime, setFormStartTime] = useState('07:30');
  const [formEndTime, setFormEndTime] = useState('09:00');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || 'cls-xrpl1');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || 'sub-pwpb');
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.id || 'tch-1');
  const [formRoom, setFormRoom] = useState('Lab RPL 1');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const daysList = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const validDays: LessonSchedule['day'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Current time for detecting ongoing session
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTimeToMinutes = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  const openAddModal = () => {
    setEditingItem(null);
    const defaultDay: LessonSchedule['day'] = validDays.includes(selectedDay as LessonSchedule['day'])
      ? (selectedDay as LessonSchedule['day'])
      : 'Senin';
    setFormDay(defaultDay);
    setFormStartTime('07:30');
    setFormEndTime('09:00');
    setFormClassId(
      selectedClassId !== 'all' ? selectedClassId : classes[0]?.id || 'cls-xrpl1'
    );
    setFormSubjectId(subjects[0]?.id || 'sub-pwpb');
    setFormTeacherId(teachers[0]?.id || 'tch-1');
    setFormRoom('Lab RPL 1');
    setShowModal(true);
  };

  const openEditModal = (sch: LessonSchedule) => {
    setEditingItem(sch);
    setFormDay(sch.day);
    setFormStartTime(sch.startTime);
    setFormEndTime(sch.endTime);
    setFormClassId(sch.classId || classes[0]?.id || 'cls-xrpl1');
    setFormSubjectId(sch.subjectId || subjects[0]?.id || 'sub-pwpb');
    setFormTeacherId(sch.teacherId || teachers[0]?.id || 'tch-1');
    setFormRoom(sch.room || 'Ruang Teori 1');
    setShowModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const clsObj = classes.find(c => c.id === formClassId) || classes[0];
    const subObj = subjects.find(s => s.id === formSubjectId) || subjects[0];
    const tchObj = teachers.find(t => t.id === formTeacherId) || teachers[0];

    const payload: LessonSchedule = {
      id: editingItem?.id || `sch-${Date.now()}`,
      day: formDay,
      startTime: formStartTime,
      endTime: formEndTime,
      classId: clsObj?.id || formClassId,
      className: clsObj?.name || 'X RPL 1',
      subjectId: subObj?.id || formSubjectId,
      subjectName: subObj?.name || 'Mata Pelajaran',
      teacherId: tchObj?.id || formTeacherId,
      teacherName: tchObj?.fullName || 'Guru Pengampu',
      room: formRoom.trim() || 'Ruang Kelas',
    };

    saveLessonSchedule(payload, !editingItem);
    if (selectedDay !== 'Semua' && selectedDay !== formDay) {
      setSelectedDay(formDay);
    }
    setShowModal(false);
    const msg = editingItem
      ? `Jadwal ${payload.subjectName} (${payload.className}) berhasil diperbarui permanen!`
      : `Jadwal baru ${payload.subjectName} (${payload.className}) berhasil disimpan permanen!`;
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3500);
    if (addToast) {
      addToast(msg, 'success');
    }
  };

  const handleDeleteItem = (sch: LessonSchedule) => {
    deleteLessonSchedule(sch.id);
    const msg = `Jadwal ${sch.subjectName} (${sch.className}) telah dihapus permanen.`;
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
    if (addToast) {
      addToast(msg, 'info');
    }
  };

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return lessonSchedules
      .filter(item => {
        // Day filter
        if (selectedDay !== 'Semua' && item.day !== selectedDay) {
          return false;
        }
        // Class filter
        if (selectedClassId !== 'all' && item.classId !== selectedClassId) {
          return false;
        }
        // Search query (subject, teacher, or class)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const sub = subjects.find(s => s.id === item.subjectId);
          const cls = classes.find(c => c.id === item.classId);
          const tch = teachers.find(t => t.id === item.teacherId);
          const subjectName = (item.subjectName || sub?.name || '').toLowerCase();
          const teacherName = (item.teacherName || tch?.fullName || '').toLowerCase();
          const className = (item.className || cls?.name || '').toLowerCase();
          const roomName = (item.room || '').toLowerCase();

          return (
            subjectName.includes(q) ||
            teacherName.includes(q) ||
            className.includes(q) ||
            roomName.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const dayOrder: Record<string, number> = {
          Senin: 1,
          Selasa: 2,
          Rabu: 3,
          Kamis: 4,
          Jumat: 5,
          Sabtu: 6,
          Minggu: 7,
        };
        const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
        if (dayDiff !== 0) return dayDiff;
        return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
      });
  }, [lessonSchedules, selectedDay, selectedClassId, searchQuery, subjects, classes, teachers]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-b from-[#0F1E3A]/95 via-[#0A1428]/95 to-[#080E1E]/95 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3
              className="text-xs font-black tracking-widest uppercase text-amber-300"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              Jadwal Pelajaran Akademi
            </h3>
            <p className="text-[10px] text-slate-400 font-sans">
              Tersimpan Permanen di Cloud &amp; Perangkat ({lessonSchedules.length} Total Sesi)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-bold text-cyan-300">
            {filteredSchedules.length} Sesi
          </span>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.4)] hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Permanent Save Feedback Banner */}
      {savedNotice && (
        <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-semibold text-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{savedNotice}</span>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {daysList.map(day => {
          const isToday = day === todayName;
          const isSelected = selectedDay === day;
          const dayCount =
            day === 'Semua'
              ? lessonSchedules.length
              : lessonSchedules.filter(s => s.day === day).length;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50'
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[9px] px-1 rounded ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700/70 text-slate-400'
                }`}
              >
                {dayCount}
              </span>
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filters (Class filter & Search) */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-200 focus:outline-none focus:border-amber-400/70"
          >
            <option value="all">Semua Kelas ({classes.length})</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari mapel / guru..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/70"
          />
        </div>
      </div>

      {/* Schedule Items List */}
      <div className={`mt-3 space-y-2 overflow-y-auto pr-1 ${maxHeightClass}`}>
        {filteredSchedules.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center px-4 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40">
            <GraduationCap className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-xs font-semibold text-slate-300">Tidak ada jadwal pelajaran</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {selectedDay !== 'Semua'
                ? `Tidak ada mata pelajaran di hari ${selectedDay} untuk kriteria ini.`
                : 'Belum ada jadwal yang sesuai dengan filter.'}
            </p>
            {selectedDay !== 'Semua' && lessonSchedules.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedDay('Semua')}
                className="mt-2 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                Lihat Semua Hari ({lessonSchedules.length} Jadwal)
              </button>
            )}
          </div>
        ) : (
          filteredSchedules.map(schedule => {
            const startMins = parseTimeToMinutes(schedule.startTime);
            const endMins = parseTimeToMinutes(schedule.endTime);
            const isToday = schedule.day === todayName;
            const isOngoing = isToday && currentMinutes >= startMins && currentMinutes < endMins;
            const isFinished = isToday && currentMinutes >= endMins;

            const matchedClass = classes.find(c => c.id === schedule.classId);
            const matchedSubject = subjects.find(s => s.id === schedule.subjectId);
            const matchedTeacher = teachers.find(t => t.id === schedule.teacherId);

            const displaySubject = schedule.subjectName || matchedSubject?.name || 'Mata Pelajaran';
            const displayTeacher = schedule.teacherName || matchedTeacher?.fullName || 'Guru Pengampu';
            const displayClass = schedule.className || matchedClass?.name || 'Kelas';
            const displayRoom = schedule.room || 'Ruang Kelas';

            return (
              <div
                key={schedule.id}
                className={`group relative rounded-xl p-3 border transition-all duration-200 ${
                  isOngoing
                    ? 'border-emerald-400/80 bg-gradient-to-r from-emerald-950/40 to-slate-900/80 shadow-[0_0_16px_rgba(16,185,129,0.2)]'
                    : 'border-slate-700/60 bg-slate-900/60 hover:border-amber-400/40 hover:bg-slate-850/80'
                }`}
              >
                {/* Status Badges Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/15 border border-amber-400/30 text-amber-300">
                      {schedule.day}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 border border-blue-400/30 text-blue-300">
                      {displayClass}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isOngoing ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-bold text-emerald-300 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Sedang Berlangsung
                      </span>
                    ) : isFinished ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-400">
                        Selesai
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-300">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => openEditModal(schedule)}
                      title="Edit Jadwal Pelajaran"
                      className="p-1 rounded-md bg-slate-800/90 text-amber-300 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400/40 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(schedule)}
                      title="Hapus Jadwal Pelajaran"
                      className="p-1 rounded-md bg-slate-800/90 text-rose-400 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-400/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Subject Name */}
                <h4 className="text-xs font-bold text-white tracking-wide truncate">
                  {displaySubject}
                </h4>

                {/* Teacher and Room */}
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1 truncate">
                    <User className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{displayTeacher}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 text-slate-400">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{displayRoom}</span>
                  </div>
                </div>

                {isOngoing && (
                  <div className="mt-2 pt-1.5 border-t border-emerald-500/30 flex items-center justify-between text-[10px] text-emerald-300 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Pelajaran aktif di jam sekarang
                    </span>
                    <span className="font-mono">
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border-2 border-amber-400/60 bg-[#0B1528] p-5 shadow-2xl text-xs text-slate-100">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-amber-300">
                  {editingItem ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-amber-200/90 mb-1">
                    Hari KBM
                  </label>
                  <select
                    value={formDay}
                    onChange={e => setFormDay(e.target.value as LessonSchedule['day'])}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 font-semibold text-white"
                  >
                    {validDays.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-200/90 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 font-mono font-bold text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-200/90 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 font-mono font-bold text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-amber-200/90 mb-1">
                    Kelas / Rombel
                  </label>
                  <select
                    value={formClassId}
                    onChange={e => setFormClassId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 font-semibold text-white"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-200/90 mb-1">
                    Ruangan / Lab
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={e => setFormRoom(e.target.value)}
                    placeholder="Contoh: Lab RPL 1"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 font-semibold text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-200/90 mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={formSubjectId}
                  onChange={e => setFormSubjectId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 font-semibold text-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-200/90 mb-1">
                  Guru Pengampu
                </label>
                <select
                  value={formTeacherId}
                  onChange={e => setFormTeacherId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 font-semibold text-white"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold shadow-md hover:brightness-110 cursor-pointer"
                >
                  Simpan Permanen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
