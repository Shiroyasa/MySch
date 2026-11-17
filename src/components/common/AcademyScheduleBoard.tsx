import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  User,
  MapPin,
  Search,
  Filter,
  GraduationCap,
  X,
  CalendarDays,
} from 'lucide-react';
import { OrbitaOrnateFrame } from './OrbitaOrnateFrame';
import {
  GenshinElementIcon,
  GENSHIN_ELEMENTS_LIST,
} from './AcademyOrnaments';
import { LiquidNavBar } from './LiquidNavBar';
import { CarouselTablePagination, useCarouselPagination } from './CarouselTablePagination';
import { AccordionExpandAllBar, AccordionSection, useAccordionGroup } from './AccordionExpandGroup';

export interface AcademyScheduleBoardProps {
  maxHeightClass?: string;
  className?: string;
  onClose?: () => void;
}

export const AcademyScheduleBoard: React.FC<AcademyScheduleBoardProps> = ({
  maxHeightClass = 'max-h-[340px]',
  className = '',
  onClose,
}) => {
  const { lessonSchedules, classes, subjects, teachers } = useApp();

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = dayNames[new Date().getDay()];

  const [selectedDay, setSelectedDay] = useState<string>(
    ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].includes(todayName) ? todayName : 'Semua'
  );
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const accordion = useAccordionGroup(['filters', 'schedules'], true);

  const daysList = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTimeToMinutes = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  const filteredSchedules = useMemo(() => {
    return lessonSchedules
      .filter(item => {
        if (selectedDay !== 'Semua' && item.day !== selectedDay) {
          return false;
        }
        if (selectedClassId !== 'all' && item.classId !== selectedClassId) {
          return false;
        }
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

  const schedulePagination = useCarouselPagination(filteredSchedules, 6);

  return (
    <OrbitaOrnateFrame
      showTopCrest={true}
      stampText={`${filteredSchedules.length} Sesi KBM`}
      characterIndex={1}
      className={className}
      contentClassName="px-6 pt-11 pb-6 sm:px-7 sm:pt-12 sm:pb-7"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F0F1F6] dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFEBFB] text-[#6C60B8] dark:bg-indigo-950/70 dark:text-indigo-300">
            <CalendarDays className="h-5 w-5 stroke-[2]" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-[#3E385B] dark:text-white truncate">
              Jadwal Pelajaran ORBITA
            </h3>
            <p className="text-xs font-medium text-[#A2A0B4] dark:text-slate-400 truncate">
              Kegiatan Belajar Mengajar (KBM) Aktif
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="no-ornament flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F1F6] text-[#3E385B] hover:bg-[#FFE4EC] hover:text-[#F25781] dark:bg-slate-800 dark:text-slate-200 transition-all cursor-pointer"
            title="Tutup Jadwal Pelajaran"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Day Selector Tabs */}
      <LiquidNavBar
        className="mt-3.5"
        size="sm"
        pill
        ariaLabel="Filter Hari KBM"
        activeId={selectedDay}
        onSelect={setSelectedDay}
        items={daysList.map(day => ({
          id: day,
          label: day,
          badge:
            day === 'Semua'
              ? lessonSchedules.length
              : lessonSchedules.filter(s => s.day === day).length,
        }))}
      />

      <div className="mt-3 space-y-2.5">
        <AccordionExpandAllBar
          allExpanded={accordion.allExpanded}
          onExpandAll={accordion.expandAll}
          onCollapseAll={accordion.collapseAll}
          title="Filter Kelas & Daftar Jadwal KBM"
        />

        <AccordionSection
          title="Filter Kelas & Pencarian Mapel"
          icon={<Filter className="h-3.5 w-3.5" />}
          open={accordion.isOpen('filters')}
          onToggle={() => accordion.toggle('filters')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative flex items-center rounded-full bg-[#F0F1F6] dark:bg-slate-800 px-3.5">
              <Filter className="pointer-events-none w-3.5 h-3.5 text-[#6C60B8] dark:text-indigo-300 mr-2 shrink-0" />
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="no-ornament w-full py-2 text-xs font-semibold bg-transparent text-[#3E385B] dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="all" className="text-[#3E385B]">Semua Kelas ({classes.length})</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id} className="text-[#3E385B]">
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="orbita-searchbar orbita-field-underline relative flex items-center rounded-full bg-[#F0F1F6] dark:bg-slate-800 px-3.5">
              <Search className="pointer-events-none w-3.5 h-3.5 text-[#6C60B8] dark:text-indigo-300 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Cari mapel atau guru..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="no-ornament w-full py-2 text-xs font-semibold bg-transparent text-[#3E385B] dark:text-slate-100 placeholder:text-[#A2A0B4] dark:placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Daftar Sesi KBM"
          badge={filteredSchedules.length}
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          open={accordion.isOpen('schedules')}
          onToggle={() => accordion.toggle('schedules')}
        >
          <div className={`space-y-2.5 overflow-y-auto pr-1 ${maxHeightClass}`}>
            {filteredSchedules.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center px-4 rounded-[20px] border border-dashed border-[#E4E3F0] dark:border-slate-700 bg-[#FAF9FE] dark:bg-slate-800/40">
                <GraduationCap className="w-8 h-8 text-[#6C60B8] dark:text-indigo-300 mb-2" />
                <p className="text-xs font-bold text-[#3E385B] dark:text-white">Tidak ada jadwal pelajaran</p>
                <p className="text-[11px] text-[#9694A8] dark:text-slate-400 mt-0.5">
                  {selectedDay !== 'Semua'
                    ? `Tidak ada mata pelajaran di hari ${selectedDay} untuk kriteria ini.`
                    : 'Belum ada jadwal yang sesuai dengan filter.'}
                </p>
                {selectedDay !== 'Semua' && lessonSchedules.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay('Semua')}
                    className="no-ornament mt-3 rounded-full bg-[#6C60B8] px-4 py-1.5 text-[11px] font-bold text-white hover:bg-[#5B4FA8] cursor-pointer"
                  >
                    Lihat Semua Hari ({lessonSchedules.length} Jadwal)
                  </button>
                )}
              </div>
            ) : (
              <div key={schedulePagination.animKey} className={`space-y-2.5 ${schedulePagination.slideClass}`}>
                {schedulePagination.paginatedItems.map((schedule, idx) => {
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
                  const elType = GENSHIN_ELEMENTS_LIST[idx % GENSHIN_ELEMENTS_LIST.length];

                  return (
                    <div
                      key={schedule.id}
                      className={`rounded-[18px] border p-3.5 transition-all duration-150 ${
                        isOngoing
                          ? 'border-[#6C60B8]/40 bg-[#F4F2FC] dark:border-indigo-500/40 dark:bg-indigo-950/50 shadow-sm'
                          : 'border-[#F0F1F6] bg-[#FAF9FE] hover:border-[#D7D3F0] dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-indigo-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#ECEBF5] dark:border-slate-700/70">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#6C60B8] text-white">
                            <GenshinElementIcon element={elType} className="h-3.5 w-3.5" />
                          </span>
                          <span className="rounded-full bg-[#ECEBF5] dark:bg-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-[#3E385B] dark:text-slate-100">
                            {schedule.day}
                          </span>
                          <span className="rounded-full bg-[#FFE4EC] dark:bg-rose-950/70 px-2.5 py-0.5 text-[10px] font-bold text-[#F25781] dark:text-rose-300">
                            {displayClass}
                          </span>
                        </div>

                        {isOngoing ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E3FCEF] dark:bg-emerald-950/70 px-2.5 py-0.5 text-[10px] font-bold text-[#1CC865] dark:text-emerald-300">
                            <span>Berlangsung</span>
                          </span>
                        ) : isFinished ? (
                          <span className="rounded-full bg-[#F0F1F6] dark:bg-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-[#A2A0B4] dark:text-slate-300">
                            Selesai
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#6C60B8] dark:text-indigo-300 tabular-nums">
                            <Clock className="w-3 h-3" />
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        )}
                      </div>

                      <div className="pt-2">
                        <h4 className="text-xs sm:text-[13px] font-extrabold text-[#3E385B] dark:text-white">
                          {displaySubject}
                        </h4>

                        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-[#9694A8] dark:text-slate-400">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <User className="w-3 h-3 text-[#6C60B8] dark:text-indigo-300 shrink-0" />
                            <span className="truncate">{displayTeacher}</span>
                          </div>

                          <span className="flex items-center gap-1 text-[#3E385B] dark:text-slate-200 shrink-0 font-semibold">
                            <MapPin className="w-3 h-3 text-[#FF6E96]" />
                            {displayRoom}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <CarouselTablePagination
            page={schedulePagination.page}
            totalPages={schedulePagination.totalPages}
            totalItems={schedulePagination.totalItems}
            pageSize={schedulePagination.pageSize}
            startIndex={schedulePagination.startIndex}
            endIndex={schedulePagination.endIndex}
            slideDirection={schedulePagination.slideDirection}
            onPageChange={schedulePagination.setPage}
            itemLabel="jadwal KBM"
          />
        </AccordionSection>
      </div>
    </OrbitaOrnateFrame>
  );
};

