import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  Plus,
} from 'lucide-react';
import {
  OrnateCard,
  OrnateSectionHeader,
  HighlightedChartHeader,
  AcademyCornerBadge,
  BoxBgControl,
  ElectroSwirlCrest,
  GenshinWeaponIcon,
  GenshinElementIcon,
  PrimogemIcon,
  OrbitaMenuIcon,
  buildSmoothWavePath,
  POPOUT_CHARACTERS,
  ARTBOARD_BACKGROUNDS,
} from '../common/AcademyOrnaments';

interface JrpgFlipBoxProps {
  boxId: string;
  front: React.ReactNode;
  back: React.ReactNode;
  minHeightClass?: string;
  onClick?: () => void;
}

const JrpgFlipBox: React.FC<JrpgFlipBoxProps> = ({
  boxId,
  front,
  back,
  minHeightClass = 'min-h-[164px]',
  onClick,
}) => {
  return (
    <OrnateCard
      boxId={boxId}
      onClick={onClick}
      minFlipHeight={minHeightClass}
      className="p-4"
      flipBack={back}
    >
      {front}
    </OrnateCard>
  );
};

interface DashboardRouterProps {
  onNavigate?: (menuId: string) => void;
}

const MONTH_OPTIONS = [
  { value: '1', short: 'Jan', full: 'Januari' },
  { value: '2', short: 'Feb', full: 'Februari' },
  { value: '3', short: 'Mar', full: 'Maret' },
  { value: '4', short: 'Apr', full: 'April' },
  { value: '5', short: 'Mei', full: 'Mei' },
  { value: '6', short: 'Jun', full: 'Juni' },
  { value: '7', short: 'Jul', full: 'Juli' },
  { value: '8', short: 'Agu', full: 'Agustus' },
  { value: '9', short: 'Sep', full: 'September' },
  { value: '10', short: 'Okt', full: 'Oktober' },
  { value: '11', short: 'Nov', full: 'November' },
  { value: '12', short: 'Des', full: 'Desember' },
];

export const DashboardRouter: React.FC<DashboardRouterProps> = ({ onNavigate }) => {
  const {
    currentUser,
    students = [],
    teachers = [],
    classes = [],
    subjects = [],
    majors = [],
    academicYears = [],
    activeAcademicYear,
    attendanceSessions = [],
    attendanceRecords = [],
    attendanceCorrections = [],
    assessments = [],
    assessmentScores = [],
    pklPartners = [],
    pklVisits = [],
    pklReports = [],
    visualSettings,
    setActiveNav,
  } = useApp();

  const handleNavigate = (menuId: string) => {
    if (onNavigate) {
      onNavigate(menuId);
    } else if (setActiveNav) {
      setActiveNav(menuId);
    }
  };

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('ALL');
  const [activeChartView, setActiveChartView] = useState<'kehadiran' | 'akademik' | 'pkl_bk' | 'siswa'>('kehadiran');

  // Available years derived from real database records + academic years
  const availableYears = useMemo(() => {
    const yrs = new Set<string>(['2025', '2026']);
    attendanceSessions.forEach(s => {
      if (s.date && s.date.length >= 4) yrs.add(s.date.slice(0, 4));
    });
    assessments.forEach(a => {
      if (a.date && a.date.length >= 4) yrs.add(a.date.slice(0, 4));
    });
    academicYears.forEach(ay => {
      const m = ay.name?.match(/\d{4}/g);
      if (m) m.forEach(y => yrs.add(y));
    });
    return Array.from(yrs).sort();
  }, [attendanceSessions, assessments, academicYears]);

  // Helper to check if a date string matches the active Year & Month filters
  const matchesDateFilter = (dateStr?: string) => {
    if (!dateStr) return selectedYearFilter === 'ALL' && selectedMonthFilter === 'ALL';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return selectedYearFilter === 'ALL' && selectedMonthFilter === 'ALL';
    const yr = String(d.getFullYear());
    const mo = String(d.getMonth() + 1);
    if (selectedYearFilter !== 'ALL' && yr !== selectedYearFilter) return false;
    if (selectedMonthFilter !== 'ALL' && mo !== selectedMonthFilter) return false;
    return true;
  };

  // Filtered students by Class
  const filteredStudents = useMemo(() => {
    if (selectedClassFilter === 'ALL') return students;
    const targetCls = classes.find(c => c.id === selectedClassFilter || c.name === selectedClassFilter);
    return students.filter(
      s =>
        s.classId === selectedClassFilter ||
        s.className === selectedClassFilter ||
        (targetCls && (s.classId === targetCls.id || s.className === targetCls.name))
    );
  }, [students, classes, selectedClassFilter]);

  const filteredStudentIds = useMemo(() => new Set(filteredStudents.map(s => s.id)), [filteredStudents]);

  // Filtered Attendance Sessions by Class, Month, and Year
  const filteredSessions = useMemo(() => {
    return attendanceSessions.filter(s => {
      if (selectedClassFilter !== 'ALL' && s.classId !== selectedClassFilter) return false;
      return matchesDateFilter(s.date);
    });
  }, [attendanceSessions, selectedClassFilter, selectedYearFilter, selectedMonthFilter]);

  const filteredSessionIds = useMemo(() => new Set(filteredSessions.map(s => s.id)), [filteredSessions]);

  // -------------------------------------------------------------
  // 1. REAL-TIME ATTENDANCE PERCENTAGE & BREAKDOWN ANALYTICS
  // -------------------------------------------------------------
  const attendanceAnalytics = useMemo(() => {
    const relevantRecords = attendanceRecords.filter(r => {
      if (!filteredStudentIds.has(r.studentId)) return false;
      if (selectedYearFilter !== 'ALL' || selectedMonthFilter !== 'ALL') {
        return filteredSessionIds.has(r.sessionId);
      }
      return true;
    });

    const hadir = relevantRecords.filter(r => r.status === 'H').length;
    const terlambat = relevantRecords.filter(r => r.status === 'T').length;
    const sakit = relevantRecords.filter(r => r.status === 'S').length;
    const izin = relevantRecords.filter(r => r.status === 'I').length;
    const alpa = relevantRecords.filter(r => r.status === 'A').length;
    const total = hadir + terlambat + sakit + izin + alpa;

    const pct = (val: number) => (total > 0 ? Number(((val / total) * 100).toFixed(1)) : 0);

    const hadirPct = pct(hadir);
    const terlambatPct = pct(terlambat);
    const sakitPct = pct(sakit);
    const izinPct = pct(izin);
    const alpaPct = pct(alpa);
    const effectiveAttendancePct =
      total > 0 ? Number((((hadir + terlambat) / total) * 100).toFixed(1)) : 0;

    return {
      hadir,
      terlambat,
      sakit,
      izin,
      alpa,
      total,
      hadirPct,
      terlambatPct,
      sakitPct,
      izinPct,
      alpaPct,
      effectiveAttendancePct,
      studentCount: filteredStudents.length,
    };
  }, [
    filteredStudents,
    filteredStudentIds,
    filteredSessionIds,
    attendanceRecords,
    selectedYearFilter,
    selectedMonthFilter,
  ]);

  // -------------------------------------------------------------
  // 2. REAL-TIME ACADEMIC GRADE & KKM PERCENTAGE ANALYTICS
  // -------------------------------------------------------------
  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      if (selectedClassFilter !== 'ALL' && a.classId !== selectedClassFilter) return false;
      return matchesDateFilter(a.date);
    });
  }, [assessments, selectedClassFilter, selectedYearFilter, selectedMonthFilter]);

  const filteredAssessmentIds = useMemo(
    () => new Set(filteredAssessments.map(a => a.id)),
    [filteredAssessments]
  );

  const academicAnalytics = useMemo(() => {
    let predA = 0;
    let predB = 0;
    let predC = 0;
    let predD = 0;
    let passedCount = 0;
    let totalScoreSum = 0;
    let evaluatedEntries = 0;

    filteredStudents.forEach(std => {
      const stdScores = assessmentScores.filter(sc => {
        if (sc.studentId !== std.id) return false;
        if (selectedYearFilter !== 'ALL' || selectedMonthFilter !== 'ALL' || selectedClassFilter !== 'ALL') {
          return filteredAssessmentIds.has(sc.assessmentId);
        }
        return true;
      });
      if (stdScores.length > 0) {
        const avg = Math.round(
          stdScores.reduce((acc, c) => acc + Number(c.score || 0), 0) / stdScores.length
        );
        totalScoreSum += avg;
        evaluatedEntries++;
        if (avg >= 90) predA++;
        else if (avg >= 80) predB++;
        else if (avg >= 75) predC++;
        else predD++;

        if (avg >= 75) passedCount++;
      }
    });

    const totalStd = Math.max(1, evaluatedEntries);
    const avgScore = evaluatedEntries > 0 ? Number((totalScoreSum / evaluatedEntries).toFixed(1)) : 0;
    const kkmPassPct = evaluatedEntries > 0 ? Number(((passedCount / totalStd) * 100).toFixed(1)) : 0;
    const remedialPct = evaluatedEntries > 0 ? Number((100 - kkmPassPct).toFixed(1)) : 0;

    return {
      avgScore,
      kkmPassPct,
      remedialPct,
      passedCount,
      remedialCount: Math.max(0, evaluatedEntries - passedCount),
      predA,
      predB,
      predC,
      predD,
      predAPct: evaluatedEntries > 0 ? Number(((predA / totalStd) * 100).toFixed(1)) : 0,
      predBPct: evaluatedEntries > 0 ? Number(((predB / totalStd) * 100).toFixed(1)) : 0,
      predCPct: evaluatedEntries > 0 ? Number(((predC / totalStd) * 100).toFixed(1)) : 0,
      predDPct: evaluatedEntries > 0 ? Number(((predD / totalStd) * 100).toFixed(1)) : 0,
    };
  }, [
    filteredStudents,
    assessmentScores,
    filteredAssessmentIds,
    selectedClassFilter,
    selectedYearFilter,
    selectedMonthFilter,
  ]);

  // -------------------------------------------------------------
  // 3. PER-CLASS ANALYTICS MATRIX (ATTENDANCE %, GRADE AVG, KKM %)
  // -------------------------------------------------------------
  const classComparisonData = useMemo(() => {
    return classes.map(cls => {
      const clsStudents = students.filter(s => s.classId === cls.id || s.className === cls.name);
      const clsStudentIds = new Set(clsStudents.map(s => s.id));

      // Sessions for this class matching Year/Month filter
      const clsSessions = attendanceSessions.filter(
        s => s.classId === cls.id && matchesDateFilter(s.date)
      );
      const clsSessionIds = new Set(clsSessions.map(s => s.id));

      // Attendance for class
      const clsRecords = attendanceRecords.filter(r => {
        if (!clsStudentIds.has(r.studentId)) return false;
        if (selectedYearFilter !== 'ALL' || selectedMonthFilter !== 'ALL') {
          return clsSessionIds.has(r.sessionId);
        }
        return true;
      });
      const hCount = clsRecords.filter(r => r.status === 'H' || r.status === 'T').length;
      const sCount = clsRecords.filter(r => r.status === 'S').length;
      const iCount = clsRecords.filter(r => r.status === 'I').length;
      const aCount = clsRecords.filter(r => r.status === 'A').length;
      const attendancePct =
        clsRecords.length > 0 ? Number(((hCount / clsRecords.length) * 100).toFixed(1)) : 0;

      // Assessments for this class matching Year/Month filter
      const clsAss = assessments.filter(
        a => a.classId === cls.id && matchesDateFilter(a.date)
      );
      const clsAssIds = new Set(clsAss.map(a => a.id));

      // Grades for class
      const clsScores = assessmentScores.filter(sc => {
        if (!clsStudentIds.has(sc.studentId)) return false;
        if (selectedYearFilter !== 'ALL' || selectedMonthFilter !== 'ALL') {
          return clsAssIds.has(sc.assessmentId);
        }
        return true;
      });
      const avgGrade =
        clsScores.length > 0
          ? Number(
              (
                clsScores.reduce((acc, sc) => acc + Number(sc.score || 0), 0) / clsScores.length
              ).toFixed(1)
            )
          : 0;

      // KKM pass rate per student in class
      let tuntasStd = 0;
      let evaluatedStd = 0;
      clsStudents.forEach(st => {
        const stScores = clsScores.filter(sc => sc.studentId === st.id);
        if (stScores.length > 0) {
          evaluatedStd++;
          const stAvg =
            stScores.reduce((a, b) => a + Number(b.score || 0), 0) / stScores.length;
          if (stAvg >= 75) tuntasStd++;
        }
      });
      const kkmPct =
        evaluatedStd > 0 ? Number(((tuntasStd / evaluatedStd) * 100).toFixed(1)) : 0;

      // Gender ratio
      const maleCount = clsStudents.filter(s => s.gender === 'L').length;
      const femaleCount = clsStudents.filter(s => s.gender === 'P').length;

      return {
        id: cls.id,
        name: cls.name,
        majorCode: cls.majorCode,
        gradeLevel: cls.gradeLevel,
        studentCount: clsStudents.length,
        maleCount,
        femaleCount,
        attendancePct,
        avgGrade,
        kkmPct,
        hCount,
        sCount,
        iCount,
        aCount,
      };
    });
  }, [
    classes,
    students,
    attendanceSessions,
    attendanceRecords,
    assessments,
    assessmentScores,
    selectedYearFilter,
    selectedMonthFilter,
  ]);

  // -------------------------------------------------------------
  // 4. SUBJECT PERFORMANCE & COMPLETION PERCENTAGE
  // -------------------------------------------------------------
  const subjectComparisonData = useMemo(() => {
    return subjects.map(sub => {
      const subAssessments = filteredAssessments.filter(a => a.subjectId === sub.id);
      const subAssIds = new Set(subAssessments.map(a => a.id));
      const subScores = assessmentScores.filter(
        sc => subAssIds.has(sc.assessmentId) && filteredStudentIds.has(sc.studentId)
      );

      const avgScore =
        subScores.length > 0
          ? Number(
              (subScores.reduce((acc, c) => acc + Number(c.score || 0), 0) / subScores.length).toFixed(1)
            )
          : 0;

      const passedScores = subScores.filter(sc => Number(sc.score || 0) >= sub.kkm).length;
      const passRatePct =
        subScores.length > 0 ? Number(((passedScores / subScores.length) * 100).toFixed(1)) : 0;

      return {
        id: sub.id,
        code: sub.code,
        name: sub.name,
        category: sub.category,
        kkm: sub.kkm,
        componentCount: subAssessments.length,
        avgScore,
        passRatePct,
      };
    });
  }, [subjects, filteredAssessments, assessmentScores, filteredStudentIds]);

  // -------------------------------------------------------------
  // 5. PKL, CORRECTIONS & MAJOR DISTRIBUTION PERCENTAGES
  // -------------------------------------------------------------
  const pklAndStudentStatusStats = useMemo(() => {
    const allReports = Array.isArray(pklReports) ? pklReports : [];
    const safeReports = allReports.filter(p => {
      if (selectedClassFilter !== 'ALL' && !filteredStudentIds.has(p.studentId)) return false;
      if (p.submittedAt && !matchesDateFilter(p.submittedAt)) return false;
      return true;
    });
    const safePartners = Array.isArray(pklPartners) ? pklPartners : [];
    const allVisits = Array.isArray(pklVisits) ? pklVisits : [];
    const safeVisits = allVisits.filter(v => (v.visitDate ? matchesDateFilter(v.visitDate) : true));
    const allCorrections = Array.isArray(attendanceCorrections) ? attendanceCorrections : [];
    const safeCorrections = allCorrections.filter(c => {
      if (selectedClassFilter !== 'ALL' && !filteredStudentIds.has(c.studentId)) return false;
      if (c.date && !matchesDateFilter(c.date)) return false;
      return true;
    });

    const totalPkl = Math.max(1, safeReports.length);
    const pklActive = safeReports.filter(
      p =>
        p.submissionStatus === 'sudah_dikumpulkan' ||
        p.submissionStatus === 'revisi' ||
        (p as any).status === 'Disetujui' ||
        (p as any).status === 'Menunggu Review'
    ).length;
    const pklCompleted = safeReports.filter(
      p => p.submissionStatus === 'sudah_dikumpulkan' || (p as any).status === 'Disetujui'
    ).length;
    const pklPending = Math.max(0, safeReports.length - pklCompleted);

    const pklActivePct =
      safeReports.length > 0 ? Number(((pklActive / totalPkl) * 100).toFixed(1)) : 0;
    const pklCompletedPct =
      safeReports.length > 0 ? Number(((pklCompleted / totalPkl) * 100).toFixed(1)) : 0;
    const pklPendingPct =
      safeReports.length > 0 ? Number(((pklPending / totalPkl) * 100).toFixed(1)) : 0;

    const totalCorr = Math.max(1, safeCorrections.length);
    const corrResolved = safeCorrections.filter(
      c => c.status === 'approved' || c.status === 'rejected'
    ).length;
    const corrPending = safeCorrections.filter(c => c.status === 'pending').length;
    const corrResolvedPct =
      safeCorrections.length > 0 ? Number(((corrResolved / totalCorr) * 100).toFixed(1)) : 100.0;

    const totalStudents = Math.max(1, filteredStudents.length);
    const maleStudents = filteredStudents.filter(s => s.gender === 'L').length;
    const femaleStudents = filteredStudents.filter(s => s.gender === 'P').length;
    const malePct = filteredStudents.length > 0 ? Number(((maleStudents / totalStudents) * 100).toFixed(1)) : 0;
    const femalePct = filteredStudents.length > 0 ? Number(((femaleStudents / totalStudents) * 100).toFixed(1)) : 0;

    return {
      pklTotal: safeReports.length,
      pklPartnerCount: safePartners.length,
      pklVisitCount: safeVisits.length,
      pklActive,
      pklCompleted,
      pklPending,
      pklActivePct,
      pklCompletedPct,
      pklPendingPct,
      corrTotal: safeCorrections.length,
      corrResolved,
      corrPending,
      corrResolvedPct,
      maleStudents,
      femaleStudents,
      malePct,
      femalePct,
    };
  }, [
    pklReports,
    pklPartners,
    pklVisits,
    attendanceCorrections,
    filteredStudents,
    filteredStudentIds,
    selectedClassFilter,
    selectedYearFilter,
    selectedMonthFilter,
  ]);

  // SVG Conic Gradient for Attendance Donut Chart
  const donutGradient = useMemo(() => {
    const h = attendanceAnalytics.hadirPct;
    const t = attendanceAnalytics.terlambatPct;
    const s = attendanceAnalytics.sakitPct;
    const i = attendanceAnalytics.izinPct;
    const stop1 = h;
    const stop2 = stop1 + t;
    const stop3 = stop2 + s;
    const stop4 = stop3 + i;
    if (attendanceAnalytics.total === 0) {
      return 'conic-gradient(#CFCBE8 0% 100%)';
    }
    return `conic-gradient(
      #1CC865 0% ${stop1}%,
      #6C60B8 ${stop1}% ${stop2}%,
      #3B82F6 ${stop2}% ${stop3}%,
      #F59E0B ${stop3}% ${stop4}%,
      #F25781 ${stop4}% 100%
    )`;
  }, [attendanceAnalytics]);

  const appLogoUrl = visualSettings?.appLogoUrl || null;
  const dashboardBannerBg =
    visualSettings?.boxBgs?.['banner_dashboard'] ||
    visualSettings?.moduleBannerBgs?.['dashboard'] ||
    visualSettings?.perModuleBannerBgs?.['dashboard'] ||
    visualSettings?.globalBannerBgUrl ||
    null;

  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(3); // Default 'Apr'
  const [selectedDonutSlice, setSelectedDonutSlice] = useState<string | null>(null);
  const [selectedPredicateGrade, setSelectedPredicateGrade] = useState<string>('A');
  const monthsList = MONTH_OPTIONS.map(m => m.short);
  const activeMonth =
    selectedMonthFilter !== 'ALL'
      ? MONTH_OPTIONS.find(m => m.value === selectedMonthFilter)?.short || 'Apr'
      : monthsList[activeMonthIdx] || 'Apr';

  // Interactive 12-Month Wave Series Computed 100% from Real Database Records
  const overviewWaveSeries = useMemo(() => {
    const activeClsObj =
      selectedClassFilter !== 'ALL'
        ? classes.find(c => c.id === selectedClassFilter || c.name === selectedClassFilter)
        : null;

    return MONTH_OPTIONS.map((mObj, idx) => {
      const monthNumber = idx + 1;

      // Filter sessions for this month + selected year + selected class
      const monthSessions = attendanceSessions.filter(s => {
        if (selectedClassFilter !== 'ALL' && s.classId !== selectedClassFilter) return false;
        if (!s.date) return false;
        const d = new Date(s.date);
        if (isNaN(d.getTime())) return false;
        if (selectedYearFilter !== 'ALL' && String(d.getFullYear()) !== selectedYearFilter) return false;
        return d.getMonth() + 1 === monthNumber;
      });
      const sessionIds = new Set(monthSessions.map(s => s.id));
      const mRecords = attendanceRecords.filter(
        r => sessionIds.has(r.sessionId) && filteredStudentIds.has(r.studentId)
      );

      let attPct = attendanceAnalytics.effectiveAttendancePct;
      if (mRecords.length > 0) {
        const h = mRecords.filter(r => r.status === 'H' || r.status === 'T').length;
        attPct = Number(((h / mRecords.length) * 100).toFixed(1));
      } else {
        const clsFallback = classComparisonData[idx % Math.max(1, classComparisonData.length)];
        if (clsFallback && clsFallback.attendancePct > 0) {
          attPct = clsFallback.attendancePct;
        }
      }

      // Filter assessments for this month + selected year + selected class
      const monthAssessments = assessments.filter(a => {
        if (selectedClassFilter !== 'ALL' && a.classId !== selectedClassFilter) return false;
        if (!a.date) return false;
        const d = new Date(a.date);
        if (isNaN(d.getTime())) return false;
        if (selectedYearFilter !== 'ALL' && String(d.getFullYear()) !== selectedYearFilter) return false;
        return d.getMonth() + 1 === monthNumber;
      });
      const mAssIds = new Set(monthAssessments.map(a => a.id));
      const mScores = assessmentScores.filter(
        sc => mAssIds.has(sc.assessmentId) && filteredStudentIds.has(sc.studentId)
      );

      let gradeVal = academicAnalytics.avgScore;
      if (mScores.length > 0) {
        gradeVal = Number(
          (mScores.reduce((acc, sc) => acc + Number(sc.score || 0), 0) / mScores.length).toFixed(1)
        );
      } else {
        const subFallback = subjectComparisonData[idx % Math.max(1, subjectComparisonData.length)];
        if (subFallback && subFallback.avgScore > 0) {
          gradeVal = subFallback.avgScore;
        }
      }

      // Filter PKL reports for this month
      const mPkl = pklReports.filter(p => {
        if (selectedClassFilter !== 'ALL' && !filteredStudentIds.has(p.studentId)) return false;
        if (!p.submittedAt) return false;
        const d = new Date(p.submittedAt);
        if (isNaN(d.getTime())) return false;
        if (selectedYearFilter !== 'ALL' && String(d.getFullYear()) !== selectedYearFilter) return false;
        return d.getMonth() + 1 === monthNumber;
      });
      let pklVal = pklAndStudentStatusStats.pklCompletedPct;
      if (mPkl.length > 0) {
        const done = mPkl.filter(p => p.submissionStatus === 'sudah_dikumpulkan').length;
        pklVal = Number(((done / mPkl.length) * 100).toFixed(1));
      }

      // Student population percentage for class vs school
      const clsTarget = classComparisonData[idx % Math.max(1, classComparisonData.length)];
      const siswaVal =
        selectedClassFilter !== 'ALL'
          ? Number(((filteredStudents.length / Math.max(1, students.length)) * 100).toFixed(1))
          : clsTarget
          ? Number(((clsTarget.studentCount / Math.max(1, students.length)) * 100).toFixed(1))
          : 100;

      const currentVal =
        activeChartView === 'kehadiran'
          ? attPct
          : activeChartView === 'akademik'
          ? gradeVal
          : activeChartView === 'pkl_bk'
          ? pklVal
          : siswaVal;

      return {
        month: mObj.short,
        monthFull: mObj.full,
        monthValue: mObj.value,
        value: currentVal,
        attPct,
        gradeVal,
        pklVal,
        siswaVal,
        sessionCount: monthSessions.length,
        contextLabel: activeClsObj
          ? `Kelas ${activeClsObj.name}`
          : clsTarget
          ? `Semua Kelas (${students.length} Siswa)`
          : 'Semua Rombel',
      };
    });
  }, [
    attendanceSessions,
    attendanceRecords,
    assessments,
    assessmentScores,
    pklReports,
    classes,
    students.length,
    filteredStudents.length,
    filteredStudentIds,
    classComparisonData,
    subjectComparisonData,
    attendanceAnalytics.effectiveAttendancePct,
    academicAnalytics.avgScore,
    pklAndStudentStatusStats.pklCompletedPct,
    activeChartView,
    selectedClassFilter,
    selectedYearFilter,
  ]);

  const overviewSvgPoints = useMemo(() => {
    const vals = overviewWaveSeries.map(d => d.value);
    const minV = Math.min(...vals, 60);
    const maxV = Math.max(...vals, 100);
    const span = Math.max(12, maxV - minV);
    return overviewWaveSeries.map((d, i) => {
      const x = Number(((i / (overviewWaveSeries.length - 1)) * 490 + 15).toFixed(1));
      const norm = (d.value - minV) / span;
      const y = Number((85 - norm * 56).toFixed(1));
      return { x, y, ...d };
    });
  }, [overviewWaveSeries]);

  const effectivePointIdx =
    selectedMonthFilter !== 'ALL'
      ? Math.max(0, Number(selectedMonthFilter) - 1)
      : activeMonthIdx;
  const activeWavePoint = overviewSvgPoints[effectivePointIdx] || overviewSvgPoints[3];
  const overviewLinePath = useMemo(() => buildSmoothWavePath(overviewSvgPoints), [overviewSvgPoints]);
  const overviewAreaPath = useMemo(() => buildSmoothWavePath(overviewSvgPoints, 112), [overviewSvgPoints]);
  const activeWaveLeftPct = Number(((activeWavePoint.x / 520) * 100).toFixed(1));

  return (
    <div className="space-y-7 pb-10">
      {/* ============================================================ */}
      {/* ROW 1: EXACT REFERENCE IMAGE BENTO GRID                      */}
      {/* Left 7 Cols: Interactive Purple Overview Wave Chart Card     */}
      {/* Right 5 Cols: Stacked Purple Card + Pink-Coral Wave Card     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 7 COLS: PURPLE OVERVIEW WAVE CHART CARD */}
        <div
          style={{
            background: 'linear-gradient(145deg, #7266C4 0%, #5D51B2 52%, #4B3FA0 100%)',
            boxShadow: '0 22px 44px -10px rgba(93, 81, 178, 0.36)',
          }}
          className="group/banner lg:col-span-7 relative rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 text-white flex flex-col justify-between overflow-hidden"
        >
          {dashboardBannerBg && (
            <img
              src={dashboardBannerBg}
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            />
          )}

          {/* Top Header Block: Full-Width Highlighted Title + 4-Column Single Filter Row */}
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="no-ornament min-w-0 flex-1 flex items-stretch gap-2.5 rounded-2xl bg-white/14 border border-white/25 px-3.5 py-2 backdrop-blur-xs">
                <span
                  aria-hidden="true"
                  className="w-1.5 rounded-full bg-gradient-to-b from-[#FF85A6] to-[#FFD2E0] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-lg font-black text-white tracking-tight leading-snug truncate">
                    Overview Real-Time Database
                  </h1>
                  <p className="text-[11px] text-white/85 font-semibold truncate">
                    ORBITA Akademi &middot; T.A. {activeAcademicYear?.name || '2025/2026'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 opacity-85 sm:opacity-0 sm:group-hover/banner:opacity-100 focus-within:opacity-100 transition-opacity pt-0.5">
                <BoxBgControl boxKey="banner_dashboard" isBanner moduleKey="dashboard" compact />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
              {/* Filter Kelas */}
              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                title="Filter Kelas / Rombel"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  color: '#FFFFFF',
                  WebkitTextFillColor: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.28)',
                }}
                className="no-ornament h-8.5 min-w-0 w-full truncate rounded-full border hover:bg-white/22 px-3 text-[11px] font-bold text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="ALL" className="text-[#3E385B] bg-white">
                  Semua Kelas ({students.length})
                </option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id} className="text-[#3E385B] bg-white">
                    Kelas {cls.name} ({cls.majorCode})
                  </option>
                ))}
              </select>

              {/* Filter Bulan */}
              <select
                value={selectedMonthFilter}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedMonthFilter(val);
                  if (val !== 'ALL') {
                    setActiveMonthIdx(Math.max(0, Number(val) - 1));
                  }
                }}
                title="Filter Bulan"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  color: '#FFFFFF',
                  WebkitTextFillColor: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.28)',
                }}
                className="no-ornament h-8.5 min-w-0 w-full truncate rounded-full border hover:bg-white/22 px-3 text-[11px] font-bold text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="ALL" className="text-[#3E385B] bg-white">
                  Semua Bulan
                </option>
                {MONTH_OPTIONS.map(m => (
                  <option key={m.value} value={m.value} className="text-[#3E385B] bg-white">
                    {m.full}
                  </option>
                ))}
              </select>

              {/* Filter Tahun */}
              <select
                value={selectedYearFilter}
                onChange={e => setSelectedYearFilter(e.target.value)}
                title="Filter Tahun"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  color: '#FFFFFF',
                  WebkitTextFillColor: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.28)',
                }}
                className="no-ornament h-8.5 min-w-0 w-full truncate rounded-full border hover:bg-white/22 px-3 text-[11px] font-bold text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="ALL" className="text-[#3E385B] bg-white">
                  Semua Tahun
                </option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr} className="text-[#3E385B] bg-white">
                    Tahun {yr}
                  </option>
                ))}
              </select>

              {/* Dataset Switcher */}
              <button
                type="button"
                onClick={() =>
                  setActiveChartView(
                    activeChartView === 'kehadiran'
                      ? 'akademik'
                      : activeChartView === 'akademik'
                        ? 'pkl_bk'
                        : activeChartView === 'pkl_bk'
                          ? 'siswa'
                          : 'kehadiran'
                  )
                }
                title="Klik untuk beralih dataset grafik (Kehadiran / Nilai Akademik / PKL / Siswa)"
                className="no-ornament inline-flex h-8.5 w-full items-center justify-center gap-1.5 rounded-full border border-white/30 bg-white/22 hover:bg-white/30 px-3 text-[11px] font-extrabold text-white whitespace-nowrap truncate transition-all cursor-pointer"
              >
                <span className="truncate">
                  {activeChartView === 'kehadiran'
                    ? 'Presensi'
                    : activeChartView === 'akademik'
                    ? 'Nilai & KKM'
                    : activeChartView === 'pkl_bk'
                    ? 'Prakerin PKL'
                    : 'Data Siswa'}
                </span>
                <span className="text-[10px] opacity-85 shrink-0">⌄</span>
              </button>
            </div>
          </div>

          {/* Middle Section: Interactive Coral-Pink Wave Line + Dynamic Highlight Column + Tooltip */}
          <div className="relative z-10 my-4 pt-6 pb-1">
            {/* Dynamic Vertical Translucent Highlight Column behind Active Month */}
            <div
              className="pointer-events-none absolute top-1 bottom-7 w-12 -translate-x-1/2 rounded-t-full transition-all duration-300"
              style={{
                left: `${activeWaveLeftPct}%`,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.02) 100%)',
              }}
              aria-hidden="true"
            />

            {/* Dynamic Floating Tooltip Box */}
            <div
              style={{
                left: `${Math.min(78, Math.max(15, activeWaveLeftPct))}%`,
              }}
              className="pointer-events-none absolute top-0 z-20 flex items-center gap-2.5 -translate-x-1/2 transition-all duration-300"
              aria-hidden="true"
            >
              <div className="rounded-[14px] bg-[#443C68]/95 border border-white/20 px-3.5 py-2 text-white shadow-[0_10px_22px_rgba(28,22,56,0.48)]">
                <span className="block text-xs font-extrabold leading-none tabular-nums">
                  {activeWavePoint.value}
                  {activeChartView === 'akademik' ? ' Poin' : '%'}
                </span>
                <span className="block text-[10px] text-white/85 leading-tight mt-0.5">
                  {activeWavePoint.monthFull} &bull; {activeWavePoint.contextLabel}
                </span>
              </div>
            </div>

            {/* Interactive Smooth Pink-Coral Wave SVG with Clickable/Hoverable Nodes */}
            <svg
              viewBox="0 0 520 115"
              fill="none"
              className="w-full h-26 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="overviewWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF7597" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#5D51B2" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[29, 57, 85].map(yPos => (
                <line
                  key={yPos}
                  x1="15"
                  y1={yPos}
                  x2="505"
                  y2={yPos}
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}
              <path
                d={overviewAreaPath}
                fill="url(#overviewWaveGrad)"
                className="transition-all duration-300"
              />
              <path
                d={overviewLinePath}
                stroke="#FF7597"
                strokeWidth="3.2"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {overviewSvgPoints.map((pt, idx) => {
                const isSelected = idx === effectivePointIdx;
                return (
                  <g
                    key={pt.month}
                    onClick={() => {
                      setActiveMonthIdx(idx);
                      setSelectedMonthFilter(
                        selectedMonthFilter === pt.monthValue ? 'ALL' : pt.monthValue
                      );
                    }}
                    onMouseEnter={() => setActiveMonthIdx(idx)}
                    className="cursor-pointer"
                  >
                    <circle cx={pt.x} cy={pt.y} r="15" fill="transparent" />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 7 : 3.8}
                      fill={isSelected ? '#FF6E96' : '#FFFFFF'}
                      fillOpacity={isSelected ? 1 : 0.7}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 2.5 : 1.3}
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive 12-Month Strip */}
            <div className="mt-1.5 flex items-center sm:justify-between gap-1 text-[10px] text-white/75 px-0.5 overflow-x-auto snap-x snap-mandatory scrollbar-none">
              {overviewWaveSeries.map((m, idx) => {
                const isAct = idx === effectivePointIdx;
                return (
                  <button
                    key={m.month}
                    type="button"
                    onClick={() => {
                      setActiveMonthIdx(idx);
                      setSelectedMonthFilter(
                        selectedMonthFilter === m.monthValue ? 'ALL' : m.monthValue
                      );
                    }}
                    className={`no-ornament snap-center inline-flex h-7 min-w-[36px] sm:min-w-0 items-center justify-center px-2 rounded-full text-[10px] whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isAct
                        ? 'bg-white text-[#4E42A1] font-extrabold shadow-xs'
                        : 'text-white/70 hover:text-white font-medium'
                    }`}
                  >
                    {m.month}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom 3-Column Metric Bar with Center Elevated Pedestal */}
          <div className="relative z-10 grid grid-cols-3 items-center gap-1.5 sm:gap-2 pt-3 border-t border-white/12 text-center">
            <div
              onClick={() => {
                setActiveChartView('kehadiran');
              }}
              className={`cursor-pointer rounded-xl py-1.5 px-1 transition-colors min-w-0 ${
                activeChartView === 'kehadiran' ? 'bg-white/10' : 'hover:bg-white/8'
              }`}
            >
              <span className="text-[9.5px] sm:text-[10px] text-white/75 block truncate">Presensi ({activeMonth})</span>
              <span className="text-sm sm:text-xl font-extrabold text-white tabular-nums block leading-tight mt-0.5">
                {activeWavePoint.attPct}%
              </span>
              <span className="text-[9.5px] sm:text-[10px] text-white/75 block truncate">{filteredSessions.length} Sesi</span>
            </div>

            <div
              onClick={() =>
                setActiveChartView(
                  activeChartView === 'kehadiran'
                    ? 'akademik'
                    : activeChartView === 'akademik'
                      ? 'pkl_bk'
                      : 'kehadiran'
                )
              }
              className="rounded-[18px] sm:rounded-[22px] bg-white/15 border border-white/25 px-2 sm:px-3 py-2.5 sm:py-3 shadow-inner cursor-pointer hover:bg-white/22 transition-colors min-w-0"
            >
              <span className="text-[9.5px] sm:text-[10px] text-white/85 block truncate">
                {activeChartView === 'kehadiran'
                  ? 'Kehadiran Efektif'
                  : activeChartView === 'akademik'
                  ? 'Skor Rata-rata'
                  : 'Verifikasi PKL'}
              </span>
              <span className="text-base sm:text-2xl font-black text-white tabular-nums block leading-tight mt-0.5">
                {activeWavePoint.value}
                {activeChartView === 'akademik' ? ' Poin' : '%'}
              </span>
              <span className="text-[9.5px] sm:text-[10px] text-white/85 block truncate">
                {activeMonth} &bull; {activeWavePoint.contextLabel}
              </span>
            </div>

            <div
              onClick={() => {
                setActiveChartView('akademik');
              }}
              className={`cursor-pointer rounded-xl py-1.5 px-1 transition-colors min-w-0 ${
                activeChartView === 'akademik' ? 'bg-white/10' : 'hover:bg-white/8'
              }`}
            >
              <span className="text-[9.5px] sm:text-[10px] text-white/75 block truncate">Lulus KKM ({activeMonth})</span>
              <span className="text-sm sm:text-xl font-extrabold text-white tabular-nums block leading-tight mt-0.5">
                {academicAnalytics.kkmPassPct}%
              </span>
              <span className="text-[9.5px] sm:text-[10px] text-white/75 block truncate">Avg {activeWavePoint.gradeVal}</span>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: STACKED PURPLE CARD ("Daily Jogging") + PINK-CORAL CARD ("My Jogging") */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          {/* Top Purple Card (Daily Jogging style -> Presensi Harian) */}
          <div
            onClick={() => handleNavigate('attendance')}
            style={{
              background: 'linear-gradient(135deg, #6E62BF 0%, #7D71CB 100%)',
              boxShadow: '0 16px 32px -6px rgba(108, 96, 184, 0.28)',
            }}
            className="group rounded-[26px] p-5 text-white flex items-center gap-4 cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white/20 border border-white/30 shadow-inner">
              <GenshinElementIcon element="anemo" className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold text-white truncate">
                Presensi Harian
              </h2>
              <p className="text-xs text-white/85 truncate mt-0.5">
                {attendanceAnalytics.hadir} Hadir &middot; {students.length} Siswa Aktif
              </p>
            </div>
          </div>

          {/* Bottom Pink-Coral Wave Card (My Jogging style -> Evaluasi & Nilai Akademik) */}
          <div
            onClick={() => handleNavigate('grading')}
            style={{
              background: 'linear-gradient(145deg, #FF88A8 0%, #F8658E 100%)',
              boxShadow: '0 18px 36px -6px rgba(248, 101, 142, 0.34)',
            }}
            className="group relative flex-1 rounded-[28px] p-5 text-white flex flex-col justify-between overflow-hidden min-h-[190px] cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            {/* Darker Coral Wave Overlay at Bottom */}
            <svg
              viewBox="0 0 400 130"
              fill="none"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full"
            >
              <path
                d="M0 50 C 130 95, 250 10, 400 55 L 400 130 L 0 130 Z"
                fill="rgba(229, 72, 118, 0.44)"
              />
            </svg>

            {/* Top Row inside Pink Card */}
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white/25 border border-white/35 shadow-xs">
                <GenshinElementIcon element="electro" className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-extrabold text-white truncate">
                  Evaluasi Akademik
                </h3>
                <p className="text-xs text-white/85 truncate mt-0.5">
                  Leger Nilai &amp; Ketuntasan KKM
                </p>
              </div>
            </div>

            {/* Bottom Row inside Pink Card: Total Metric + '>' Circle Button */}
            <div className="relative z-10 mt-5 flex items-end justify-between gap-3 pt-2">
              <div>
                <span className="text-[11px] text-white/85 block">Rata-rata Nilai</span>
                <span className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-tight block">
                  {academicAnalytics.avgScore} Poin
                </span>
                <span className="text-xs text-white/90 block mt-0.5">
                  {academicAnalytics.passedCount} Siswa Tuntas
                </span>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/80 text-white group-hover:bg-white group-hover:text-[#F8658E] transition-colors">
                <ChevronRight className="h-4.5 w-4.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 2: EXACT 3 WHITE FLOATING PURPLE-SQUIRCLE PROGRESS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 pt-6">
        {[
          {
            id: 'drill_attendance',
            nav: 'attendance',
            el: 'hydro' as const,
            title: 'Presensi & Disiplin',
            sub: `${attendanceAnalytics.total} rekaman / semester`,
            pct: Math.round(attendanceAnalytics.effectiveAttendancePct),
            leftMeta: `${attendanceAnalytics.hadir} / ${attendanceAnalytics.total} hadir`,
            pillText: `${attendanceAnalytics.sakit + attendanceAnalytics.izin} izin/sakit`,
          },
          {
            id: 'drill_grading',
            nav: 'grading',
            el: 'electro' as const,
            title: 'Ketuntasan KKM',
            sub: `${subjects.length} mata pelajaran aktif`,
            pct: Math.round(academicAnalytics.kkmPassPct),
            leftMeta: `${academicAnalytics.passedCount} / ${students.length} tuntas`,
            pillText: `${academicAnalytics.predA} Predikat A`,
          },
          {
            id: 'drill_pkl',
            nav: 'pkl',
            el: 'anemo' as const,
            title: 'Supervisi Prakerin',
            sub: `${pklAndStudentStatusStats.pklPartnerCount} mitra industri`,
            pct: Math.round(pklAndStudentStatusStats.pklCompletedPct),
            leftMeta: `${pklAndStudentStatusStats.pklCompleted} / ${pklAndStudentStatusStats.pklTotal} laporan`,
            pillText: `${pklAndStudentStatusStats.pklVisitCount} kunjungan`,
          },
        ].map(card => (
          <div
            key={card.id}
            onClick={() => handleNavigate(card.nav)}
            style={{
              boxShadow: '0 14px 34px -6px rgba(108, 96, 184, 0.09)',
            }}
            className="no-ornament group relative rounded-[26px] border border-[#E8E6F4] bg-white dark:bg-slate-900 dark:border-slate-800 px-5 sm:px-6 pt-10 pb-5 text-[#3E385B] dark:text-slate-100 cursor-pointer transition-all duration-200 hover:-translate-y-1 overflow-visible"
          >
            {/* Top-Center Floating Purple Squircle Icon Badge */}
            <div
              className="pointer-events-none select-none absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex h-13 w-13 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#7568C6] to-[#6356B5] text-white shadow-[0_10px_22px_rgba(108,96,184,0.36)] transition-transform duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              <GenshinElementIcon element={card.el} className="h-6 w-6" />
            </div>

            {/* Top-Right Subtle 3-Dots Icon */}
            <span
              className="pointer-events-none absolute top-4 right-4 text-[#C6C4D6] dark:text-slate-600 font-bold text-sm"
              aria-hidden="true"
            >
              ⋮
            </span>

            {/* Centered Title & Subtitle */}
            <div className="text-center">
              <h3 className="text-sm font-extrabold text-[#3E385B] dark:text-white group-hover:text-[#6C60B8] dark:group-hover:text-indigo-300 transition-colors truncate">
                {card.title}
              </h3>
              <p className="text-xs font-medium text-[#8C88A4] dark:text-slate-400 mt-0.5 truncate">
                {card.sub}
              </p>
            </div>

            {/* Progress Label & Percentage */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#3E385B] dark:text-slate-200 mb-2">
                <span>Progress</span>
                <span className="tabular-nums">{card.pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#E3E0F4] dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1CC865] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(6, card.pct))}%` }}
                />
              </div>
            </div>

            {/* Bottom Footer Row: Left Fraction + Right Soft Pink Status Pill */}
            <div className="mt-4 flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] font-semibold text-[#8E8BA3] dark:text-slate-400 tabular-nums truncate">
                {card.leftMeta}
              </span>
              <span className="rounded-full bg-[#FFE4EC] dark:bg-rose-950/70 px-2.5 py-0.5 text-[10px] font-bold text-[#F25781] dark:text-rose-300 whitespace-nowrap shrink-0">
                {card.pillText}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ROW 3: 4 INTERACTIVE 3D FLIPCARD KPI PRESENTATION BOXES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-7 sm:gap-5 items-stretch pt-4">
        {/* FLIPCARD 1: KEHADIRAN */}
        <JrpgFlipBox
          boxId="kpi_attendance"
          onClick={() => handleNavigate('attendance')}
          front={
            <div className="flex flex-col justify-between h-full">
              <div className="text-center">
                <p className="text-[11px] font-bold text-[#7A7596] dark:text-slate-400 truncate">
                  Persentase Kehadiran
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#3E385B] dark:text-white mt-1 leading-tight tabular-nums">
                  {attendanceAnalytics.effectiveAttendancePct}%
                </h3>
                <p className="text-[11px] font-medium text-[#7A7596] dark:text-slate-400 mt-0.5 truncate">
                  {attendanceAnalytics.hadir} Hadir &middot; {attendanceAnalytics.total} Sesi
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E6E4F2] dark:border-slate-700">
                <div className="flex justify-between text-[11px] font-bold text-[#3E385B] dark:text-slate-200 mb-1.5">
                  <span>Progress</span>
                  <span className="tabular-nums">{attendanceAnalytics.effectiveAttendancePct}%</span>
                </div>
                <div className="jrpg-stat-bar">
                  <div
                    className="jrpg-stat-bar-fill bg-[#1CC865]"
                    style={{ width: `${Math.min(100, attendanceAnalytics.effectiveAttendancePct)}%` }}
                  />
                </div>
              </div>
            </div>
          }
          back={
            <div className="flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 block pr-9">
                  Rincian Presensi
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] tabular-nums">
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Hadir (H)</span>
                    <span className="font-extrabold text-white text-xs block">
                      {attendanceAnalytics.hadirPct}% ({attendanceAnalytics.hadir})
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Sakit (S)</span>
                    <span className="font-extrabold text-white text-xs block">
                      {attendanceAnalytics.sakitPct}% ({attendanceAnalytics.sakit})
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Izin (I)</span>
                    <span className="font-extrabold text-white text-xs block">
                      {attendanceAnalytics.izinPct}% ({attendanceAnalytics.izin})
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Alpa (A)</span>
                    <span className="font-extrabold text-white text-xs block">
                      {attendanceAnalytics.alpaPct}% ({attendanceAnalytics.alpa})
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white">
                <span>Kelola Presensi</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </div>
            </div>
          }
        />

        {/* FLIPCARD 2: PENILAIAN & KKM */}
        <JrpgFlipBox
          boxId="kpi_grading"
          onClick={() => handleNavigate('grading')}
          front={
            <div className="flex flex-col justify-between h-full">
              <div className="text-center">
                <p className="text-[11px] font-bold text-[#7A7596] dark:text-slate-400 truncate">
                  Rata-rata &amp; Ketuntasan
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#3E385B] dark:text-white mt-1 leading-tight tabular-nums">
                  {academicAnalytics.kkmPassPct}%
                </h3>
                <p className="text-[11px] font-medium text-[#7A7596] dark:text-slate-400 mt-0.5 truncate">
                  Rata-rata: {academicAnalytics.avgScore} ({academicAnalytics.passedCount} Tuntas)
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E6E4F2] dark:border-slate-700">
                <div className="flex justify-between text-[11px] font-bold text-[#3E385B] dark:text-slate-200 mb-1.5">
                  <span>Progress</span>
                  <span className="tabular-nums">{academicAnalytics.kkmPassPct}%</span>
                </div>
                <div className="jrpg-stat-bar">
                  <div
                    className="jrpg-stat-bar-fill bg-[#1CC865]"
                    style={{ width: `${Math.min(100, academicAnalytics.kkmPassPct)}%` }}
                  />
                </div>
              </div>
            </div>
          }
          back={
            <div className="flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 block pr-9">
                  Distribusi Predikat
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] tabular-nums">
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Predikat A</span>
                    <span className="font-extrabold text-white text-xs block">
                      {academicAnalytics.predAPct}% ({academicAnalytics.predA})
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Predikat B</span>
                    <span className="font-extrabold text-white text-xs block">
                      {academicAnalytics.predBPct}% ({academicAnalytics.predB})
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Predikat C</span>
                    <span className="font-extrabold text-white text-xs block">
                      {academicAnalytics.predCPct}% ({academicAnalytics.predC})
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Remedial (D)</span>
                    <span className="font-extrabold text-white text-xs block">
                      {academicAnalytics.predDPct}% ({academicAnalytics.predD})
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white">
                <span>Kelola Penilaian</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </div>
            </div>
          }
        />

        {/* FLIPCARD 3: POPULASI SISWA & GURU */}
        <JrpgFlipBox
          boxId="kpi_population"
          onClick={() => handleNavigate('master-data')}
          front={
            <div className="flex flex-col justify-between h-full">
              <div className="text-center">
                <p className="text-[11px] font-bold text-[#7A7596] dark:text-slate-400 truncate">
                  Populasi Siswa &amp; Guru
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#3E385B] dark:text-white mt-1 leading-tight tabular-nums">
                  {students.length} <span className="text-xs font-bold text-[#7A7596] dark:text-slate-400">Siswa</span>
                </h3>
                <p className="text-[11px] font-medium text-[#7A7596] dark:text-slate-400 mt-0.5 truncate">
                  {teachers.length} Guru &middot; {classes.length} Kelas
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E6E4F2] dark:border-slate-700">
                <div className="flex justify-between text-[11px] font-bold text-[#3E385B] dark:text-slate-200 mb-1.5">
                  <span>Rasio L / P</span>
                  <span className="tabular-nums">{pklAndStudentStatusStats.malePct}%</span>
                </div>
                <div className="jrpg-stat-bar">
                  <div
                    className="jrpg-stat-bar-fill bg-[#1CC865]"
                    style={{ width: `${pklAndStudentStatusStats.malePct}%` }}
                  />
                </div>
              </div>
            </div>
          }
          back={
            <div className="flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 block pr-9">
                  Statistik Data Pokok
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] tabular-nums">
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Laki-laki (L)</span>
                    <span className="font-extrabold text-white text-xs block">
                      {pklAndStudentStatusStats.maleStudents} ({pklAndStudentStatusStats.malePct}%)
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Perempuan (P)</span>
                    <span className="font-extrabold text-white text-xs block">
                      {pklAndStudentStatusStats.femaleStudents} ({pklAndStudentStatusStats.femalePct}%)
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Total Rombel</span>
                    <span className="font-extrabold text-white text-xs block">
                      {classes.length} Kelas
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Dewan Guru</span>
                    <span className="font-extrabold text-white text-xs block">
                      {teachers.length} Pengajar
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white">
                <span>Buka Master Data</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </div>
            </div>
          }
        />

        {/* FLIPCARD 4: ADMINISTRASI PRAKERIN / PKL */}
        <JrpgFlipBox
          boxId="kpi_pkl"
          onClick={() => handleNavigate('pkl')}
          front={
            <div className="flex flex-col justify-between h-full">
              <div className="text-center">
                <p className="text-[11px] font-bold text-[#7A7596] dark:text-slate-400 truncate">
                  Administrasi Prakerin
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#3E385B] dark:text-white mt-1 leading-tight tabular-nums">
                  {pklAndStudentStatusStats.pklCompletedPct}%
                </h3>
                <p className="text-[11px] font-medium text-[#7A7596] dark:text-slate-400 mt-0.5 truncate">
                  {pklAndStudentStatusStats.pklVisitCount} Monitoring &middot; {pklAndStudentStatusStats.pklTotal} Laporan
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E6E4F2] dark:border-slate-700">
                <div className="flex justify-between text-[11px] font-bold text-[#3E385B] dark:text-slate-200 mb-1.5">
                  <span>Progress</span>
                  <span className="tabular-nums">{pklAndStudentStatusStats.pklCompletedPct}%</span>
                </div>
                <div className="jrpg-stat-bar">
                  <div
                    className="jrpg-stat-bar-fill bg-[#1CC865]"
                    style={{
                      width: `${Math.min(100, pklAndStudentStatusStats.pklCompletedPct)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          }
          back={
            <div className="flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 block pr-9">
                  Progres Prakerin (PKL)
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] tabular-nums">
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">PKL Aktif</span>
                    <span className="font-extrabold text-white text-xs block">
                      {pklAndStudentStatusStats.pklActivePct}%
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Terverifikasi</span>
                    <span className="font-extrabold text-white text-xs block">
                      {pklAndStudentStatusStats.pklCompletedPct}%
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Review</span>
                    <span className="font-extrabold text-white text-xs block">
                      {pklAndStudentStatusStats.pklPendingPct}%
                    </span>
                  </div>
                  <div className="no-ornament rounded-xl bg-white/15 px-2.5 py-1.5">
                    <span className="text-white/80 block text-[10px]">Supervisi</span>
                    <span className="font-extrabold text-white text-xs block">
                      {pklAndStudentStatusStats.pklVisitCount} Kunjungan
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white">
                <span>Kelola Administrasi PKL</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </div>
            </div>
          }
        />
      </div>

      {/* ============================================================ */}
      {/* INTERACTIVE CHARTS & PERCENTAGE TELEMETRY HUB                */}
      {/* ============================================================ */}
      <OrnateCard boxId="dashboard_charts_hub" surface="tinted" className="p-4 sm:p-6">
        <div className="space-y-4 border-b border-[#DDD8F4] dark:border-slate-800 pb-4 mb-6">
          {/* Top Row: Hub Title & Chart Switcher Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
            <OrnateSectionHeader
              title="Pusat Grafik & Persentase Akademik ORBITA"
              subtitle="Sinkronisasi real-time database berdasarkan Kategori Kelas, Bulan, dan Tahun"
            />

            {/* Chart Category Switcher (Clean Single-Line Segmented Bar) */}
            <div className="flex items-center gap-1 rounded-2xl border border-[#DDD8F3] dark:border-slate-700 bg-white dark:bg-slate-800/90 p-1.5 overflow-x-auto max-w-full scrollbar-none shrink-0 self-start lg:self-auto shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveChartView('kehadiran')}
                className={`no-ornament inline-flex h-8.5 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeChartView === 'kehadiran'
                    ? 'bg-[#6C60B8] text-white shadow-[0_6px_14px_rgba(108,96,184,0.28)]'
                    : 'text-[#6E6A86] dark:text-slate-300 hover:bg-[#F3F1FC] dark:hover:bg-slate-700 hover:text-[#3E385B] dark:hover:text-white'
                }`}
              >
                <OrbitaMenuIcon variant="attendance" className="h-3.5 w-3.5 shrink-0" />
                <span>Presensi</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartView('akademik')}
                className={`no-ornament inline-flex h-8.5 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeChartView === 'akademik'
                    ? 'bg-[#6C60B8] text-white shadow-[0_6px_14px_rgba(108,96,184,0.28)]'
                    : 'text-[#6E6A86] dark:text-slate-300 hover:bg-[#F3F1FC] dark:hover:bg-slate-700 hover:text-[#3E385B] dark:hover:text-white'
                }`}
              >
                <OrbitaMenuIcon variant="grading" className="h-3.5 w-3.5 shrink-0" />
                <span>Penilaian &amp; KKM</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartView('pkl_bk')}
                className={`no-ornament inline-flex h-8.5 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeChartView === 'pkl_bk'
                    ? 'bg-[#6C60B8] text-white shadow-[0_6px_14px_rgba(108,96,184,0.28)]'
                    : 'text-[#6E6A86] dark:text-slate-300 hover:bg-[#F3F1FC] dark:hover:bg-slate-700 hover:text-[#3E385B] dark:hover:text-white'
                }`}
              >
                <OrbitaMenuIcon variant="pkl" className="h-3.5 w-3.5 shrink-0" />
                <span>PKL</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartView('siswa')}
                className={`no-ornament inline-flex h-8.5 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeChartView === 'siswa'
                    ? 'bg-[#6C60B8] text-white shadow-[0_6px_14px_rgba(108,96,184,0.28)]'
                    : 'text-[#6E6A86] dark:text-slate-300 hover:bg-[#F3F1FC] dark:hover:bg-slate-700 hover:text-[#3E385B] dark:hover:text-white'
                }`}
              >
                <OrbitaMenuIcon variant="master-data" className="h-3.5 w-3.5 shrink-0" />
                <span>Data Siswa</span>
              </button>
            </div>
          </div>

          {/* Dedicated Clean Filter Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[#DFDCF2] bg-white/90 dark:bg-slate-800/80 dark:border-slate-700 px-3 py-2.5">
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Filter Kelas */}
              <div className="relative flex items-center">
                <OrbitaMenuIcon
                  variant="master-data"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6C60B8] z-10"
                />
                <select
                  value={selectedClassFilter}
                  onChange={e => setSelectedClassFilter(e.target.value)}
                  className="h-9 w-full sm:w-auto pl-8 pr-3 text-xs font-extrabold text-[#3E385B] dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      Kelas {cls.name} ({cls.majorCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Bulan */}
              <div className="relative flex items-center">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6C60B8] z-10" />
                <select
                  value={selectedMonthFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedMonthFilter(val);
                    if (val !== 'ALL') {
                      setActiveMonthIdx(Math.max(0, Number(val) - 1));
                    }
                  }}
                  className="h-9 w-full sm:w-auto pl-8 pr-3 text-xs font-extrabold text-[#3E385B] dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Bulan</option>
                  {MONTH_OPTIONS.map(m => (
                    <option key={m.value} value={m.value}>
                      Bulan {m.full}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Tahun */}
              <select
                value={selectedYearFilter}
                onChange={e => setSelectedYearFilter(e.target.value)}
                className="h-9 w-full sm:w-auto px-3 text-xs font-extrabold text-[#3E385B] dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Tahun</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>

            {(selectedClassFilter !== 'ALL' ||
              selectedMonthFilter !== 'ALL' ||
              selectedYearFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedClassFilter('ALL');
                  setSelectedMonthFilter('ALL');
                  setSelectedYearFilter('ALL');
                }}
                className="no-ornament inline-flex h-9 items-center justify-center rounded-xl bg-[#FFE4EC] hover:bg-[#FFD2E0] px-3.5 text-xs font-extrabold text-[#F25781] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: ATTENDANCE PERCENTAGE & CLASS COMPARISON CHARTS      */}
        {/* ============================================================ */}
        {activeChartView === 'kehadiran' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Radial Donut Chart & Detailed Breakdown */}
            <OrnateCard
              boxId="chart_kehadiran_donut"
              className="lg:col-span-5 p-5"
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <HighlightedChartHeader
                    title="Distribusi Persentase Presensi"
                    subtitle="Rincian kehadiran tepat waktu, terlambat, sakit, izin, dan alpa"
                    accent="emerald"
                    rightSlot={
                      <span className="rounded-xl bg-[#E7F9EF] border border-[#BCEAD1] px-2.5 py-1 text-[11px] font-black text-[#139A4C] tabular-nums whitespace-nowrap">
                        Efektif: {attendanceAnalytics.effectiveAttendancePct}%
                      </span>
                    }
                  />

                  {/* Interactive Radial Donut Gauge inside High-Contrast Plot Box */}
                  <div className="no-ornament rounded-2xl border border-[#DFDAF4] bg-[#F5F3FC] dark:border-slate-700 dark:bg-slate-800/75 p-4 my-3 flex flex-col sm:flex-row items-center gap-5">
                    <div
                      onClick={() => setSelectedDonutSlice(null)}
                      title="Klik item legenda untuk menyorot status presensi"
                      className="relative h-40 w-40 shrink-0 flex items-center justify-center cursor-pointer"
                    >
                      <div
                        className="h-full w-full rounded-full shadow-md ring-4 ring-white dark:ring-slate-900 transition-all duration-500"
                        style={{ background: donutGradient }}
                      />
                      <div className="absolute inset-4 rounded-full bg-white dark:bg-slate-900 border-2 border-[#DDD8F4] dark:border-slate-700 flex flex-col items-center justify-center text-center shadow-[0_8px_20px_rgba(108,96,184,0.14)] px-2">
                        <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#7A7596] dark:text-slate-400 truncate max-w-full">
                          {selectedDonutSlice || 'Total Hadir'}
                        </span>
                        <span className="text-2xl font-black text-[#1CC865] tabular-nums">
                          {selectedDonutSlice === 'Terlambat (T)'
                            ? `${attendanceAnalytics.terlambatPct}%`
                            : selectedDonutSlice === 'Sakit (S)'
                            ? `${attendanceAnalytics.sakitPct}%`
                            : selectedDonutSlice === 'Izin (I)'
                            ? `${attendanceAnalytics.izinPct}%`
                            : selectedDonutSlice === 'Alpa (A)'
                            ? `${attendanceAnalytics.alpaPct}%`
                            : `${attendanceAnalytics.hadirPct}%`}
                        </span>
                        <span className="text-[10px] font-bold text-[#3E385B] dark:text-slate-300 tabular-nums">
                          {attendanceAnalytics.studentCount} Siswa
                        </span>
                      </div>
                    </div>

                    {/* Interactive Legend Bars with Percentages */}
                    <div className="flex-1 w-full min-w-0 space-y-2">
                      {[
                        {
                          shortKey: 'Hadir (H)',
                          label: 'Hadir Tepat Waktu (H)',
                          count: attendanceAnalytics.hadir,
                          pct: attendanceAnalytics.hadirPct,
                          color: 'bg-[#1CC865]',
                          textColor: 'text-[#139A4C] dark:text-emerald-400',
                        },
                        {
                          shortKey: 'Terlambat (T)',
                          label: 'Terlambat Hadir (T)',
                          count: attendanceAnalytics.terlambat,
                          pct: attendanceAnalytics.terlambatPct,
                          color: 'bg-[#6C60B8]',
                          textColor: 'text-[#6C60B8] dark:text-indigo-400',
                        },
                        {
                          shortKey: 'Sakit (S)',
                          label: 'Sakit dengan Surat (S)',
                          count: attendanceAnalytics.sakit,
                          pct: attendanceAnalytics.sakitPct,
                          color: 'bg-[#3B82F6]',
                          textColor: 'text-[#2563EB] dark:text-blue-400',
                        },
                        {
                          shortKey: 'Izin (I)',
                          label: 'Izin Resmi (I)',
                          count: attendanceAnalytics.izin,
                          pct: attendanceAnalytics.izinPct,
                          color: 'bg-[#F59E0B]',
                          textColor: 'text-[#D97706] dark:text-amber-400',
                        },
                        {
                          shortKey: 'Alpa (A)',
                          label: 'Tanpa Keterangan / Alpa (A)',
                          count: attendanceAnalytics.alpa,
                          pct: attendanceAnalytics.alpaPct,
                          color: 'bg-[#F25781]',
                          textColor: 'text-[#F25781] dark:text-rose-400',
                        },
                      ].map(item => {
                        const isHighlighted = selectedDonutSlice === item.shortKey;
                        return (
                          <div
                            key={item.label}
                            onClick={() =>
                              setSelectedDonutSlice(prev =>
                                prev === item.shortKey ? null : item.shortKey
                              )
                            }
                            onMouseEnter={() => setSelectedDonutSlice(item.shortKey)}
                            onMouseLeave={() => setSelectedDonutSlice(null)}
                            className={`space-y-1 rounded-xl px-2.5 py-1.5 border transition-all cursor-pointer ${
                              isHighlighted
                                ? 'bg-white dark:bg-slate-900 border-[#6C60B8] shadow-xs'
                                : 'bg-white/75 dark:bg-slate-900/50 border-[#E5E2F5] dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-bold text-[#3E385B] dark:text-slate-100 flex items-center gap-1.5 min-w-0">
                                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.color}`} />
                                <span className="truncate">{item.label}</span>
                              </span>
                              <span className={`font-black tabular-nums whitespace-nowrap shrink-0 ${item.textColor}`}>
                                {item.pct}%{' '}
                                <span className="text-[10px] text-[#8E8BA3] dark:text-slate-400">({item.count})</span>
                              </span>
                            </div>
                            <div className="jrpg-stat-bar">
                              <div
                                className={`jrpg-stat-bar-fill ${item.color}`}
                                style={{ width: `${Math.max(item.pct > 0 ? 5 : 0, item.pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6E4F2] dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#7A7596] dark:text-slate-400 font-semibold tabular-nums">
                    Total Sesi Presensi Tercatat: <strong className="text-[#3E385B] dark:text-white">{attendanceSessions.length} Sesi</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigate('attendance')}
                    className="no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-[#F0EEFA] hover:bg-[#E4E1F6] dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 px-3 text-xs font-extrabold text-[#6C60B8] dark:text-indigo-300 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    <span>Buka Modul Presensi</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </OrnateCard>

            {/* Right: Interactive Class-by-Class Attendance & Academic Column + Bar Comparison Chart */}
            <OrnateCard
              boxId="chart_kehadiran_kelas"
              className="lg:col-span-7 p-5"
            >
              <div>
                <HighlightedChartHeader
                  title="Grafik Perbandingan Kehadiran & Ketuntasan Per Kelas"
                  subtitle="Klik batang grafik atau baris kelas untuk memfilter data ke rombel tersebut"
                  accent="purple"
                  rightSlot={
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
                      <span className="flex items-center gap-1.5 text-[#139A4C] dark:text-emerald-400 whitespace-nowrap">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#1CC865]" /> % Kehadiran
                      </span>
                      <span className="flex items-center gap-1.5 text-[#6C60B8] dark:text-indigo-300 whitespace-nowrap">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#6C60B8]" /> % Lulus KKM
                      </span>
                    </div>
                  }
                />

                {/* Visual Grouped Vertical Column Chart with Gridlines */}
                {classComparisonData.length > 0 && (
                  <div className="no-ornament rounded-2xl border border-[#DFDAF4] bg-[#F5F3FC] dark:border-slate-700 dark:bg-slate-800/75 p-4 mb-4">
                    <div className="relative flex gap-2 items-stretch">
                      <div className="hidden sm:flex flex-col justify-between h-32 text-[9.5px] font-bold text-[#8E8BA3] dark:text-slate-400 tabular-nums py-0.5 select-none">
                        <span>100%</span>
                        <span>50%</span>
                        <span>0%</span>
                      </div>
                      <div className="relative flex-1 overflow-x-auto scrollbar-none">
                        <div className="relative h-32 min-w-[320px] flex items-end gap-2 sm:gap-3 border-b border-[#D7D2EE] dark:border-slate-600 px-1 pb-1">
                          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-[#DFDAF4] dark:border-slate-700" />
                          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-[#DFDAF4] dark:border-slate-700" />
                          {classComparisonData.map(cls => {
                            const isSel = selectedClassFilter === cls.id;
                            return (
                              <button
                                key={`col-${cls.id}`}
                                type="button"
                                onClick={() =>
                                  setSelectedClassFilter(prev => (prev === cls.id ? 'ALL' : cls.id))
                                }
                                className={`no-ornament relative z-10 flex-1 min-w-[46px] h-full flex flex-col items-center justify-end rounded-xl px-1 pt-1 transition-all cursor-pointer ${
                                  isSel
                                    ? 'bg-white dark:bg-slate-900 ring-1 ring-[#6C60B8]/40 shadow-2xs'
                                    : 'hover:bg-white/60 dark:hover:bg-slate-900/40'
                                }`}
                                title={`${cls.name}: Hadir ${cls.attendancePct}% · Lulus KKM ${cls.kkmPct}%`}
                              >
                                <div className="w-full h-full flex items-end justify-center gap-1 px-1">
                                  <div className="w-3 sm:w-3.5 h-full rounded-t-md bg-[#E1DCF4] dark:bg-slate-700 flex items-end overflow-hidden">
                                    <div
                                      className="w-full rounded-t-md bg-gradient-to-t from-[#139A4C] to-[#1CC865] transition-all duration-500"
                                      style={{ height: `${Math.max(cls.attendancePct > 0 ? 8 : 3, cls.attendancePct)}%` }}
                                    />
                                  </div>
                                  <div className="w-3 sm:w-3.5 h-full rounded-t-md bg-[#E1DCF4] dark:bg-slate-700 flex items-end overflow-hidden">
                                    <div
                                      className="w-full rounded-t-md bg-gradient-to-t from-[#584BA8] to-[#7D71CB] transition-all duration-500"
                                      style={{ height: `${Math.max(cls.kkmPct > 0 ? 8 : 3, cls.kkmPct)}%` }}
                                    />
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="min-w-[320px] flex items-center gap-2 sm:gap-3 px-1 pt-1.5">
                          {classComparisonData.map(cls => {
                            const isSel = selectedClassFilter === cls.id;
                            return (
                              <span
                                key={`lbl-${cls.id}`}
                                className={`flex-1 min-w-[46px] text-center text-[10px] font-extrabold truncate ${
                                  isSel ? 'text-[#6C60B8] dark:text-indigo-300' : 'text-[#4B456B] dark:text-slate-300'
                                }`}
                              >
                                {cls.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Horizontal Multi-Bar List per Class */}
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {classComparisonData.map(cls => {
                    const isClassSelected = selectedClassFilter === cls.id;
                    return (
                      <div
                        key={cls.id}
                        onClick={() =>
                          setSelectedClassFilter(prev => (prev === cls.id ? 'ALL' : cls.id))
                        }
                        className={`rounded-[18px] border p-3.5 transition-all cursor-pointer ${
                          isClassSelected
                            ? 'border-[#6C60B8] bg-[#F1EEFC] dark:bg-indigo-950/50 dark:border-indigo-500 shadow-sm'
                            : 'border-[#E3E0F4] bg-[#F8F7FD] dark:bg-slate-800/60 dark:border-slate-700 hover:border-[#C5BEEB] hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-[#6C60B8] text-white px-2.5 py-1 text-xs font-extrabold whitespace-nowrap">
                              {cls.name}
                            </span>
                            <span className="text-xs font-bold text-[#3E385B] dark:text-slate-200 tabular-nums">
                              {cls.studentCount} Siswa ({cls.maleCount}L / {cls.femaleCount}P)
                            </span>
                            {isClassSelected && (
                              <span className="rounded-full bg-[#FFE4EC] px-2 py-0.5 text-[10px] font-extrabold text-[#F25781] whitespace-nowrap">
                                Filter Aktif
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold tabular-nums">
                            <span className="text-[#139A4C] dark:text-emerald-400 whitespace-nowrap">
                              Hadir: {cls.attendancePct}%
                            </span>
                            <span className="text-[#6C60B8] dark:text-indigo-300 whitespace-nowrap">
                              Rata-rata: {cls.avgGrade}
                            </span>
                            <span className="text-[#F25781] dark:text-rose-400 whitespace-nowrap">
                              KKM: {cls.kkmPct}%
                            </span>
                          </div>
                        </div>

                        {/* Dual Progress Bars */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <div className="jrpg-stat-bar">
                              <div
                                className="jrpg-stat-bar-fill bg-[#1CC865]"
                                style={{ width: `${Math.min(100, cls.attendancePct)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="jrpg-stat-bar">
                              <div
                                className="jrpg-stat-bar-fill bg-[#6C60B8]"
                                style={{ width: `${Math.min(100, cls.kkmPct)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </OrnateCard>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: ACADEMIC GRADE DISTRIBUTION & SUBJECT CHARTS         */}
        {/* ============================================================ */}
        {activeChartView === 'akademik' && (() => {
          const predicateCols = [
            {
              grade: 'A',
              desc: '90–100',
              pct: academicAnalytics.predAPct,
              count: academicAnalytics.predA,
              barClass: 'bg-[#1CC865]',
              badgeClass: 'text-[#139A4C]',
            },
            {
              grade: 'B',
              desc: '80–89',
              pct: academicAnalytics.predBPct,
              count: academicAnalytics.predB,
              barClass: 'bg-[#6C60B8]',
              badgeClass: 'text-[#6C60B8]',
            },
            {
              grade: 'C',
              desc: '75–79',
              pct: academicAnalytics.predCPct,
              count: academicAnalytics.predC,
              barClass: 'bg-[#F59E0B]',
              badgeClass: 'text-[#D97706]',
            },
            {
              grade: 'D',
              desc: '< 75',
              pct: academicAnalytics.predDPct,
              count: academicAnalytics.predD,
              barClass: 'bg-[#F25781]',
              badgeClass: 'text-[#F25781]',
            },
          ];
          const activePred =
            predicateCols.find(c => c.grade === selectedPredicateGrade) || predicateCols[0];

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left: Interactive Vertical Bar Chart of Predicate Distribution (A/B/C/D) */}
              <OrnateCard
                boxId="chart_akademik_predikat"
                className="lg:col-span-5 p-5 flex flex-col justify-between"
              >
                <div>
                  <HighlightedChartHeader
                    title="Distribusi Predikat Nilai"
                    subtitle="Sebaran capaian nilai siswa berdasarkan KKM"
                    accent="purple"
                    rightSlot={
                      <span className="rounded-xl bg-[#F0EEFA] border border-[#DDD8F6] px-3 py-1 text-xs font-black text-[#6C60B8] tabular-nums whitespace-nowrap">
                        Rata-rata: {academicAnalytics.avgScore}
                      </span>
                    }
                  />

                  {/* Interactive Vertical Columns Chart — Uniform Baseline Grid */}
                  <div className="no-ornament rounded-2xl border border-[#DDD8F4] bg-[#F2EFFC] dark:border-slate-700 dark:bg-slate-800/80 px-3 sm:px-4 pt-4 pb-3">
                    <div className="flex gap-2 items-stretch">
                      <div className="hidden sm:flex flex-col justify-between h-32 text-[9.5px] font-bold text-[#8E8BA3] dark:text-slate-400 tabular-nums py-1 select-none">
                        <span>100%</span>
                        <span>50%</span>
                        <span>0%</span>
                      </div>
                      <div className="relative flex-1 grid grid-cols-4 gap-2 sm:gap-3 items-end border-b border-[#D7D2EE] dark:border-slate-600 pb-2">
                        <div className="pointer-events-none absolute inset-x-0 top-1 border-t border-dashed border-[#DFDAF4] dark:border-slate-700" />
                        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-[#DFDAF4] dark:border-slate-700" />
                        {predicateCols.map(col => {
                          const isSelectedCol = selectedPredicateGrade === col.grade;
                          return (
                            <button
                              key={col.grade}
                              type="button"
                              onClick={() => setSelectedPredicateGrade(col.grade)}
                              onMouseEnter={() => setSelectedPredicateGrade(col.grade)}
                              className={`no-ornament relative z-10 flex flex-col items-center justify-end group cursor-pointer rounded-xl p-1.5 transition-all ${
                                isSelectedCol
                                  ? 'bg-white dark:bg-slate-900 shadow-xs ring-1 ring-[#6C60B8]/30'
                                  : 'hover:bg-white/70 dark:hover:bg-slate-900/50'
                              }`}
                            >
                              <span className={`text-[11px] sm:text-xs font-black tabular-nums mb-1.5 whitespace-nowrap ${col.badgeClass}`}>
                                {col.pct}%
                              </span>
                              <div className="w-full max-w-[46px] bg-[#E0DCF3] dark:bg-slate-700 rounded-t-xl h-28 flex items-end p-1 overflow-hidden">
                                <div
                                  className={`w-full rounded-t-lg ${col.barClass} transition-all duration-500 group-hover:brightness-105`}
                                  style={{ height: `${Math.max(col.pct > 0 ? 12 : 6, col.pct)}%` }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Uniform Aligned Axis Labels Beneath Every Column */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 pt-2.5 text-center sm:pl-8">
                      {predicateCols.map(col => {
                        const isSelectedCol = selectedPredicateGrade === col.grade;
                        return (
                          <div
                            key={`${col.grade}-label`}
                            onClick={() => setSelectedPredicateGrade(col.grade)}
                            className="cursor-pointer min-w-0"
                          >
                            <span
                              className={`block text-xs font-extrabold whitespace-nowrap ${
                                isSelectedCol ? 'text-[#6C60B8] dark:text-indigo-300' : 'text-[#3E385B] dark:text-slate-200'
                              }`}
                            >
                              Pred. {col.grade}
                            </span>
                            <span className="block text-[11px] font-bold text-[#6E6A86] dark:text-slate-400 tabular-nums whitespace-nowrap mt-0.5">
                              {col.count} siswa
                            </span>
                            <span className="block text-[10px] font-medium text-[#8E8BA3] dark:text-slate-500 tabular-nums whitespace-nowrap">
                              ({col.desc})
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Predicate Detail Line */}
                    <div className="mt-3 pt-2.5 border-t border-[#DFDAF4] dark:border-slate-700 flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold text-[#5A537A] dark:text-slate-300 truncate">
                        Sorotan Predikat {activePred.grade} ({activePred.desc})
                      </span>
                      <span className={`font-extrabold tabular-nums whitespace-nowrap shrink-0 ${activePred.badgeClass}`}>
                        {activePred.count} siswa &middot; {activePred.pct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pass vs Remedial Split Flipcards */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <JrpgFlipBox
                    boxId="flip_tuntas_kkm"
                    minHeightClass="min-h-[152px]"
                    onClick={() => handleNavigate('grading')}
                    front={
                      <div className="flex flex-col justify-between h-full text-center">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#139A4C] dark:text-emerald-400 block">
                            Tuntas KKM (&ge; 75)
                          </span>
                          <span className="text-2xl font-black text-[#1CC865] tabular-nums mt-1.5 block leading-tight">
                            {academicAnalytics.kkmPassPct}%
                          </span>
                          <span className="text-[11px] font-semibold text-[#6E6A86] dark:text-slate-400 tabular-nums block mt-0.5">
                            {academicAnalytics.passedCount} Siswa Tuntas
                          </span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-[#E6E4F2] dark:border-slate-800">
                          <div className="jrpg-stat-bar">
                            <div
                              className="jrpg-stat-bar-fill bg-[#1CC865]"
                              style={{ width: `${Math.min(100, academicAnalytics.kkmPassPct)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    }
                    back={
                      <div className="flex flex-col justify-between h-full text-xs">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-white block pr-9">
                            Capaian Kompetensi
                          </span>
                          <p className="mt-2 text-white/90 leading-relaxed">
                            {academicAnalytics.passedCount} siswa melampaui batas KKM dengan rata-rata {academicAnalytics.avgScore}.
                          </p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white">
                          <span>Buka Penilaian</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        </div>
                      </div>
                    }
                  />
                  <JrpgFlipBox
                    boxId="flip_remedial_kkm"
                    minHeightClass="min-h-[152px]"
                    onClick={() => handleNavigate('grading')}
                    front={
                      <div className="flex flex-col justify-between h-full text-center">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#F25781] block">
                            Perlu Remedial
                          </span>
                          <span className="text-2xl font-black text-[#F25781] tabular-nums mt-1.5 block leading-tight">
                            {academicAnalytics.remedialPct}%
                          </span>
                          <span className="text-[11px] font-semibold text-[#6E6A86] dark:text-slate-400 tabular-nums block mt-0.5">
                            {academicAnalytics.remedialCount} Siswa Evaluasi
                          </span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-[#E6E4F2] dark:border-slate-800">
                          <div className="jrpg-stat-bar">
                            <div
                              className="jrpg-stat-bar-fill bg-[#F25781]"
                              style={{ width: `${Math.min(100, academicAnalytics.remedialPct)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    }
                    back={
                      <div className="flex flex-col justify-between h-full text-xs">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-white block pr-9">
                            Evaluasi Remedial
                          </span>
                          <p className="mt-2 text-white/90 leading-relaxed">
                            {academicAnalytics.remedialCount} siswa memerlukan pengayaan atau belum dinilai.
                          </p>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white">
                          <span>Tindak Lanjut</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        </div>
                      </div>
                    }
                  />
                </div>
              </OrnateCard>

              {/* Right: Subject Mastery & Pass Rate Bars */}
              <OrnateCard
                boxId="chart_akademik_mapel"
                className="lg:col-span-7 p-5 flex flex-col"
              >
                <HighlightedChartHeader
                  title="Ketuntasan & Nilai Per Mata Pelajaran"
                  subtitle={`Sinkron otomatis dari database Penilaian Akademik (${subjectComparisonData.length} mapel)`}
                  accent="purple"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => handleNavigate('grading')}
                      className="no-ornament inline-flex h-8.5 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-3.5 text-xs font-extrabold text-white hover:bg-[#5B4FA8] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    >
                      <span>Kelola Nilai</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    </button>
                  }
                />

                <div className="no-ornament rounded-2xl border border-[#DFDAF4] bg-[#F5F3FC] dark:border-slate-700 dark:bg-slate-800/75 p-3 space-y-2.5 flex-1 max-h-[385px] overflow-y-auto">
                  {subjectComparisonData.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#D5CFF0] bg-white/80 dark:border-slate-700 dark:bg-slate-900/60 p-8 text-center text-xs text-[#7A7596] dark:text-slate-400">
                      Belum ada data penilaian mata pelajaran untuk filter yang dipilih.
                    </div>
                  ) : (
                    subjectComparisonData.map(sub => (
                      <div
                        key={sub.id}
                        onClick={() => handleNavigate('grading')}
                        className="rounded-[18px] border border-[#E3E0F4] bg-white dark:border-slate-700 dark:bg-slate-900 p-3.5 transition-all hover:border-[#6C60B8] shadow-2xs cursor-pointer"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-extrabold text-[#3E385B] dark:text-slate-100 truncate">
                              {sub.name}
                            </span>
                            <span className="text-[11px] font-semibold text-[#7A7596] dark:text-slate-400 whitespace-nowrap shrink-0">
                              {sub.code} &middot; KKM {sub.kkm}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-extrabold tabular-nums whitespace-nowrap shrink-0">
                            <span className="text-[#6C60B8] dark:text-indigo-300">
                              Rata-rata: {sub.avgScore}
                            </span>
                            <span className={sub.passRatePct >= 75 ? 'text-[#139A4C] dark:text-emerald-400' : 'text-[#F25781] dark:text-rose-400'}>
                              Lulus: {sub.passRatePct}%
                            </span>
                          </div>
                        </div>
                        <div className="jrpg-stat-bar">
                          <div
                            className={`jrpg-stat-bar-fill ${
                              sub.passRatePct >= 75 ? 'bg-[#1CC865]' : 'bg-[#6C60B8]'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(sub.avgScore > 0 ? 6 : 0, sub.avgScore))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </OrnateCard>
            </div>
          );
        })()}

        {/* ============================================================ */}
        {/* VIEW 3: PKL, CORRECTIONS & MAJOR DISTRIBUTION FLIPCARDS      */}
        {/* ============================================================ */}
        {activeChartView === 'pkl_bk' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Flipcard 1: PKL Placement Breakdown (No duplicate inner icon) */}
            <JrpgFlipBox
              boxId="chart_pkl_progres"
              minHeightClass="min-h-[250px]"
              onClick={() => handleNavigate('pkl')}
              front={
                <div className="space-y-4">
                  <HighlightedChartHeader
                    title="Administrasi Prakerin (PKL)"
                    subtitle="Status laporan dan verifikasi PKL"
                    accent="emerald"
                    compact
                    className="mb-2"
                  />
                  <div className="space-y-3 tabular-nums">
                    <div>
                      <div className="flex justify-between gap-2 text-xs font-bold mb-1">
                        <span className="truncate">Laporan PKL Aktif</span>
                        <span className="text-[#139A4C] whitespace-nowrap shrink-0">
                          {pklAndStudentStatusStats.pklActivePct}% ({pklAndStudentStatusStats.pklActive})
                        </span>
                      </div>
                      <div className="jrpg-stat-bar">
                        <div
                          className="jrpg-stat-bar-fill bg-[#1CC865]"
                          style={{ width: `${pklAndStudentStatusStats.pklActivePct}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between gap-2 text-xs font-bold mb-1">
                        <span className="truncate">Disetujui &amp; Terverifikasi</span>
                        <span className="text-[#6C60B8] whitespace-nowrap shrink-0">
                          {pklAndStudentStatusStats.pklCompletedPct}% ({pklAndStudentStatusStats.pklCompleted})
                        </span>
                      </div>
                      <div className="jrpg-stat-bar">
                        <div
                          className="jrpg-stat-bar-fill bg-[#6C60B8]"
                          style={{ width: `${pklAndStudentStatusStats.pklCompletedPct}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between gap-2 text-xs font-bold mb-1">
                        <span className="truncate">Menunggu Review / Revisi</span>
                        <span className="text-[#F25781] whitespace-nowrap shrink-0">
                          {pklAndStudentStatusStats.pklPendingPct}% ({pklAndStudentStatusStats.pklPending})
                        </span>
                      </div>
                      <div className="jrpg-stat-bar">
                        <div
                          className="jrpg-stat-bar-fill bg-[#FF7597]"
                          style={{ width: `${pklAndStudentStatusStats.pklPendingPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              }
              back={
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white block pr-9">
                      Ringkasan Praktik Kerja Lapangan
                    </span>
                    <p className="text-xs text-white/90 mt-2 leading-relaxed">
                      Total <strong>{pklAndStudentStatusStats.pklTotal}</strong> berkas laporan prakerin siswa terdata di database, dengan tingkat kelulusan verifikasi mencapai{' '}
                      <strong>{pklAndStudentStatusStats.pklCompletedPct}%</strong>.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-white pt-3 border-t border-white/20">
                    <span>Klik untuk Buka Administrasi PKL</span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </div>
                </div>
              }
            />

            {/* Flipcard 2: Attendance Corrections & Supervision Visits */}
            <JrpgFlipBox
              boxId="chart_pkl_koreksi"
              minHeightClass="min-h-[250px]"
              onClick={() => handleNavigate('attendance')}
              front={
                <div className="space-y-4">
                  <HighlightedChartHeader
                    title="Koreksi & Supervisi"
                    subtitle="Penyelesaian koreksi & monitoring DUDI"
                    accent="coral"
                    compact
                    className="mb-2"
                  />
                  <div className="space-y-3 tabular-nums">
                    <div>
                      <div className="flex justify-between gap-2 text-xs font-bold mb-1">
                        <span className="truncate">Penyelesaian Koreksi</span>
                        <span className="text-[#139A4C] dark:text-emerald-400 whitespace-nowrap shrink-0">
                          {pklAndStudentStatusStats.corrResolvedPct}% ({pklAndStudentStatusStats.corrResolved}/{pklAndStudentStatusStats.corrTotal})
                        </span>
                      </div>
                      <div className="jrpg-stat-bar">
                        <div
                          className="jrpg-stat-bar-fill bg-[#1CC865]"
                          style={{ width: `${pklAndStudentStatusStats.corrResolvedPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div className="no-ornament rounded-xl border border-[#DFDAF4] p-3 bg-[#F4F2FC] dark:border-slate-700 dark:bg-slate-800/75">
                        <span className="text-[10px] font-bold text-[#7A7596] dark:text-slate-400 block">Mitra Industri</span>
                        <span className="text-base sm:text-lg font-black text-[#6C60B8] dark:text-indigo-300 whitespace-nowrap">
                          {pklAndStudentStatusStats.pklPartnerCount} Mitra
                        </span>
                      </div>
                      <div className="no-ornament rounded-xl border border-[#F5D0DC] p-3 bg-[#FFF2F6] dark:border-rose-900/50 dark:bg-rose-950/30">
                        <span className="text-[10px] font-bold text-[#9C5C70] dark:text-rose-300 block">Supervisi</span>
                        <span className="text-base sm:text-lg font-black text-[#F25781] whitespace-nowrap">
                          {pklAndStudentStatusStats.pklVisitCount} Kali
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              }
              back={
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white block pr-9">
                      Detail Koreksi &amp; Supervisi
                    </span>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs tabular-nums">
                      <div className="rounded-lg bg-white/15 p-2.5">
                        <span className="text-[10px] text-white/80 block">Koreksi Selesai</span>
                        <span className="font-black text-white">{pklAndStudentStatusStats.corrResolved} Berkas</span>
                      </div>
                      <div className="rounded-lg bg-white/15 p-2.5">
                        <span className="text-[10px] text-white/80 block">Menunggu Review</span>
                        <span className="font-black text-white">{pklAndStudentStatusStats.corrPending} Berkas</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-white pt-3 border-t border-white/20">
                    <span>Klik untuk Buka Modul Presensi</span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </div>
                </div>
              }
            />

            {/* Flipcard 3: Major / Department Distribution */}
            <JrpgFlipBox
              boxId="chart_pkl_jurusan"
              minHeightClass="min-h-[250px]"
              onClick={() => handleNavigate('master-data')}
              front={
                <div className="space-y-4">
                  <HighlightedChartHeader
                    title="Proporsi Kompetensi Keahlian"
                    subtitle="Sebaran siswa aktif per jurusan"
                    accent="purple"
                    compact
                    className="mb-2"
                  />
                  <div className="space-y-3 tabular-nums">
                    {majors.map(mj => {
                      const mjCount = students.filter(s => s.majorCode === mj.code).length;
                      const mjPct =
                        students.length > 0 ? Number(((mjCount / students.length) * 100).toFixed(1)) : 0;
                      return (
                        <div key={mj.id}>
                          <div className="flex justify-between gap-2 text-xs font-bold mb-1">
                            <span className="truncate">
                              {mj.name} ({mj.code})
                            </span>
                            <span className="text-[#6C60B8] dark:text-indigo-300 whitespace-nowrap shrink-0">
                              {mjPct}% ({mjCount})
                            </span>
                          </div>
                          <div className="jrpg-stat-bar">
                            <div
                              className="jrpg-stat-bar-fill bg-[#6C60B8]"
                              style={{ width: `${Math.max(8, mjPct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              }
              back={
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white block pr-9">
                      Detail Kompetensi Keahlian
                    </span>
                    <p className="text-xs text-white/90 mt-2 leading-relaxed">
                      Terdiri dari <strong>{majors.length} Program Keahlian</strong> dan{' '}
                      <strong>{classes.length} Rombongan Belajar</strong> aktif dengan total{' '}
                      <strong>{students.length} Siswa</strong>.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-white pt-3 border-t border-white/20">
                    <span>Klik untuk Buka Data Pokok</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              }
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 4: STUDENT POPULATION, GENDER & CLASS DISTRIBUTION      */}
        {/* ============================================================ */}
        {activeChartView === 'siswa' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <OrnateCard boxId="chart_siswa_gender" className="lg:col-span-5 p-5">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <HighlightedChartHeader
                    title={`Proporsi Siswa & Gender (${selectedClassFilter === 'ALL' ? 'Semua Kelas' : 'Per Kelas'})`}
                    subtitle="Komposisi siswa laki-laki dan perempuan aktif"
                    accent="coral"
                    rightSlot={
                      <span className="rounded-xl bg-[#E7F9EF] border border-[#BCEAD1] px-2.5 py-1 text-[11px] font-black text-[#139A4C] tabular-nums whitespace-nowrap">
                        {filteredStudents.length} Siswa
                      </span>
                    }
                  />

                  <div className="no-ornament rounded-2xl border border-[#DFDAF4] bg-[#F5F3FC] dark:border-slate-700 dark:bg-slate-800/75 p-4 my-3 space-y-3.5">
                    {/* Combined Ratio Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-[#5A537A] dark:text-slate-300 mb-1.5 tabular-nums">
                        <span>Laki-laki {pklAndStudentStatusStats.malePct}%</span>
                        <span>Perempuan {pklAndStudentStatusStats.femalePct}%</span>
                      </div>
                      <div className="h-3.5 w-full rounded-full bg-[#E1DCF4] dark:bg-slate-700 overflow-hidden flex">
                        <div
                          className="h-full bg-[#6C60B8] transition-all duration-500"
                          style={{ width: `${pklAndStudentStatusStats.malePct}%` }}
                        />
                        <div
                          className="h-full bg-[#FF7597] transition-all duration-500"
                          style={{ width: `${pklAndStudentStatusStats.femalePct}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#E3E0F4] bg-white dark:border-slate-700 dark:bg-slate-900 p-3.5">
                      <div className="flex items-center justify-between gap-2 text-xs font-extrabold mb-1.5">
                        <span className="text-[#3E385B] dark:text-slate-100">Siswa Laki-laki (L)</span>
                        <span className="text-[#6C60B8] dark:text-indigo-300 tabular-nums whitespace-nowrap">
                          {pklAndStudentStatusStats.maleStudents} Siswa ({pklAndStudentStatusStats.malePct}%)
                        </span>
                      </div>
                      <div className="jrpg-stat-bar">
                        <div
                          className="jrpg-stat-bar-fill bg-[#6C60B8]"
                          style={{ width: `${pklAndStudentStatusStats.malePct}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#E3E0F4] bg-white dark:border-slate-700 dark:bg-slate-900 p-3.5">
                      <div className="flex items-center justify-between gap-2 text-xs font-extrabold mb-1.5">
                        <span className="text-[#3E385B] dark:text-slate-100">Siswa Perempuan (P)</span>
                        <span className="text-[#F25781] tabular-nums whitespace-nowrap">
                          {pklAndStudentStatusStats.femaleStudents} Siswa ({pklAndStudentStatusStats.femalePct}%)
                        </span>
                      </div>
                      <div className="jrpg-stat-bar">
                        <div
                          className="jrpg-stat-bar-fill bg-[#FF7597]"
                          style={{ width: `${pklAndStudentStatusStats.femalePct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6E4F2] dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#7A7596] dark:text-slate-400 font-semibold tabular-nums">
                    Dewan Guru Aktif: <strong className="text-[#3E385B] dark:text-white">{teachers.length} Pengajar</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigate('master-data')}
                    className="no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-[#F0EEFA] hover:bg-[#E4E1F6] dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 px-3 text-xs font-extrabold text-[#6C60B8] dark:text-indigo-300 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    <span>Buka Master Data</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </OrnateCard>

            <OrnateCard boxId="chart_siswa_rombel" className="lg:col-span-7 p-5">
              <HighlightedChartHeader
                title="Distribusi Populasi Siswa & Rasio Gender Per Kelas"
                subtitle="Klik kelas untuk memisahkan data keseluruhan dengan data per kelas"
                accent="purple"
              />

              <div className="no-ornament rounded-2xl border border-[#DFDAF4] bg-[#F5F3FC] dark:border-slate-700 dark:bg-slate-800/75 p-3 space-y-2.5 max-h-[320px] overflow-y-auto">
                {classComparisonData.map(cls => {
                  const isSel = selectedClassFilter === cls.id;
                  const sharePct =
                    students.length > 0
                      ? Number(((cls.studentCount / students.length) * 100).toFixed(1))
                      : 0;
                  return (
                    <div
                      key={cls.id}
                      onClick={() =>
                        setSelectedClassFilter(prev => (prev === cls.id ? 'ALL' : cls.id))
                      }
                      className={`rounded-[18px] border p-3.5 transition-all cursor-pointer ${
                        isSel
                          ? 'border-[#6C60B8] bg-[#EDE9FB] dark:bg-indigo-950/60 dark:border-indigo-500 shadow-xs'
                          : 'border-[#E3E0F4] bg-white dark:bg-slate-900 dark:border-slate-700 hover:border-[#6C60B8]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-1.5">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className="rounded-lg bg-[#6C60B8] text-white px-2.5 py-0.5 text-xs font-extrabold whitespace-nowrap">
                            {cls.name}
                          </span>
                          <span className="font-bold text-[#3E385B] dark:text-slate-100 tabular-nums">
                            {cls.studentCount} Siswa ({cls.maleCount} L / {cls.femaleCount} P)
                          </span>
                        </div>
                        <span className="font-extrabold text-[#139A4C] dark:text-emerald-400 tabular-nums whitespace-nowrap shrink-0">
                          {sharePct}% dari Total Sekolah
                        </span>
                      </div>
                      <div className="jrpg-stat-bar">
                        <div
                          className="jrpg-stat-bar-fill bg-[#1CC865]"
                          style={{ width: `${Math.max(8, sharePct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </OrnateCard>
          </div>
        )}
      </OrnateCard>

      {/* ============================================================ */}
      {/* JRPG TACTICAL TABLE: MATRIKS PERSENTASE & PERFORMA ROMBEL    */}
      {/* ============================================================ */}
      <OrnateCard boxId="dashboard_class_matrix" className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pr-8">
          <OrnateSectionHeader
            title="Matriks Persentase Kehadiran & Capaian Akademik Per Kelas"
            subtitle="Ringkasan performa kehadiran, rata-rata nilai, dan ketuntasan KKM tiap rombongan belajar"
          />
          <button
            type="button"
            onClick={() => handleNavigate('reports')}
            className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] hover:bg-[#5B4FA8] px-4 text-xs font-extrabold text-white shadow-sm whitespace-nowrap shrink-0 transition-all cursor-pointer self-start sm:self-auto"
          >
            <OrbitaMenuIcon variant="reports" className="h-3.5 w-3.5 shrink-0" />
            <span>Buka Laporan &amp; Leger</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#DFDCF2] dark:border-slate-700">
          <table className="w-full text-left text-xs tabular-nums">
            <thead>
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Kelas / Rombel</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Jurusan</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Populasi</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Rincian H / S / I / A</th>
                <th className="py-3 px-4 whitespace-nowrap">Kehadiran</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Rata-rata</th>
                <th className="py-3 px-4 whitespace-nowrap">Lulus KKM</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEBF5] dark:divide-slate-800">
              {classComparisonData.map(row => (
                <tr key={row.id}>
                  <td className="py-3 px-4 font-extrabold text-[#3E385B] dark:text-slate-100 whitespace-nowrap">
                    {row.name}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="rounded-lg bg-[#F0EEFA] dark:bg-indigo-950/70 px-2.5 py-0.5 text-[11px] font-extrabold text-[#6C60B8] dark:text-indigo-300">
                      {row.majorCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#3E385B] dark:text-slate-200 whitespace-nowrap">
                    {row.studentCount} Siswa{' '}
                    <span className="text-[10px] font-semibold text-[#7A7596] dark:text-slate-400">
                      ({row.maleCount}L/{row.femaleCount}P)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[11px] whitespace-nowrap">
                    <span className="text-[#139A4C] dark:text-emerald-400 font-bold">{row.hCount}H</span> &middot;{' '}
                    <span className="text-[#2563EB] dark:text-blue-400 font-bold">{row.sCount}S</span> &middot;{' '}
                    <span className="text-[#D97706] dark:text-amber-400 font-bold">{row.iCount}I</span> &middot;{' '}
                    <span className="text-[#F25781] dark:text-rose-400 font-bold">{row.aCount}A</span>
                  </td>
                  <td className="py-3 px-4 min-w-[165px]">
                    <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                      <span className="text-[#139A4C] dark:text-emerald-400">{row.attendancePct}%</span>
                      <span className="text-[10px] font-semibold text-[#7A7596] dark:text-slate-400">Target 90%</span>
                    </div>
                    <div className="jrpg-stat-bar">
                      <div
                        className="jrpg-stat-bar-fill bg-[#1CC865]"
                        style={{ width: `${Math.min(100, row.attendancePct)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="text-sm font-black text-[#6C60B8] dark:text-indigo-300">
                      {row.avgGrade}
                    </span>
                  </td>
                  <td className="py-3 px-4 min-w-[165px]">
                    <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                      <span className="text-[#6C60B8] dark:text-indigo-300">{row.kkmPct}%</span>
                      <span className="text-[10px] font-semibold text-[#7A7596] dark:text-slate-400">KKM &ge; 75</span>
                    </div>
                    <div className="jrpg-stat-bar">
                      <div
                        className="jrpg-stat-bar-fill bg-[#6C60B8]"
                        style={{ width: `${Math.min(100, row.kkmPct)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold whitespace-nowrap ${
                        row.attendancePct >= 90 && row.avgGrade >= 80
                          ? 'bg-[#E7F9EF] text-[#139A4C] border border-[#BCEAD1] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : row.avgGrade >= 75
                          ? 'bg-[#F0EEFA] text-[#6C60B8] border border-[#DFDCF2] dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                          : 'bg-[#FFE4EC] text-[#F25781] border border-[#FFCCD9] dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {row.attendancePct >= 90 && row.avgGrade >= 80
                        ? 'Optimal'
                        : row.avgGrade >= 75
                        ? 'Stabil'
                        : 'Perlu Evaluasi'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OrnateCard>
    </div>
  );
};
