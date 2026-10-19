import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';

export interface AcademyScheduleBoardProps {
  maxHeightClass?: string;
  className?: string;
}

export const AcademyScheduleBoard: React.FC<AcademyScheduleBoardProps> = ({
  maxHeightClass = 'max-h-[350px]',
  className = '',
}) => {
  const { lessonSchedules, classes, subjects, teachers } = useApp();

  // Determine current day in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = dayNames[new Date().getDay()];

  // Active filter state
  const [selectedDay, setSelectedDay] = useState<string>(
    ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].includes(todayName) ? todayName : 'Senin'
  );
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const daysList = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Current time for detecting ongoing session
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTimeToMinutes = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return lessonSchedules.filter(item => {
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
    }).sort((a, b) => {
      // Sort by day order then start time
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
              Dikelola oleh Administrator &amp; Kurikulum
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-bold text-cyan-300">
            {filteredSchedules.length} Sesi Terjadwal
          </span>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {daysList.map(day => {
          const isToday = day === todayName;
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50'
              }`}
            >
              <span>{day}</span>
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
                className={`relative rounded-xl p-3 border transition-all duration-200 ${
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
    </div>
  );
};
