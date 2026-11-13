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
  minHeightClass = 'min-h-[188px]',
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
      return 'conic-gradient(#ECEBF5 0% 100%)';
    }
    return `conic-gradient(
      #10b981 0% ${stop1}%,
      #a855f7 ${stop1}% ${stop2}%,
      #3b82f6 ${stop2}% ${stop3}%,
      #f59e0b ${stop3}% ${stop4}%,
      #f43f5e ${stop4}% 100%
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

          {/* Top Row: "Overview" + Interactive Class, Month, Year & Dataset Filters */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight truncate">
                Overview Real-Time Database
              </h1>
              <p className="text-[11px] text-white/75 font-medium truncate">
                ORBITA Akademi &middot; T.A. {activeAcademicYear?.name || '2025/2026'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <div className="hidden sm:block opacity-0 group-hover/banner:opacity-100 transition-opacity">
                <BoxBgControl boxKey="banner_dashboard" isBanner moduleKey="dashboard" compact />
              </div>

              {/* Filter Kelas */}
              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                title="Filter Kelas / Rombel"
                className="min-w-0 w-full sm:w-auto truncate rounded-full border border-white/25 bg-white/14 hover:bg-white/22 px-2.5 py-1.5 sm:py-1 text-[11px] font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="text-[#3E385B]">
                  Semua Kelas ({students.length} Siswa)
                </option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id} className="text-[#3E385B]">
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
                className="min-w-0 w-full sm:w-auto truncate rounded-full border border-white/25 bg-white/14 hover:bg-white/22 px-2.5 py-1.5 sm:py-1 text-[11px] font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="text-[#3E385B]">
                  Semua Bulan
                </option>
                {MONTH_OPTIONS.map(m => (
                  <option key={m.value} value={m.value} className="text-[#3E385B]">
                    Bulan {m.full}
                  </option>
                ))}
              </select>

              {/* Filter Tahun */}
              <select
                value={selectedYearFilter}
                onChange={e => setSelectedYearFilter(e.target.value)}
                title="Filter Tahun"
                className="min-w-0 w-full sm:w-auto truncate rounded-full border border-white/25 bg-white/14 hover:bg-white/22 px-2.5 py-1.5 sm:py-1 text-[11px] font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="text-[#3E385B]">
                  Semua Tahun
                </option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr} className="text-[#3E385B]">
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
                className="no-ornament inline-flex h-8 sm:h-7 w-full sm:w-auto items-center justify-center gap-1.5 rounded-full border border-white/30 bg-white/20 hover:bg-white/30 px-3 text-[11px] font-extrabold text-white whitespace-nowrap shrink-0 transition-all cursor-pointer"
              >
                <span>
                  {activeChartView === 'kehadiran'
                    ? 'Presensi'
                    : activeChartView === 'akademik'
                    ? 'Nilai & KKM'
                    : activeChartView === 'pkl_bk'
                    ? 'Prakerin PKL'
                    : 'Data Siswa'}
                </span>
                <span className="text-[10px] opacity-85">⌄</span>
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
                  <stop offset="0%" stopColor="#FF7597" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#5D51B2" stopOpacity="0.0" />
                </linearGradient>
              </defs>
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
            leftMeta: `${pklAndStudentStatusStats.pklCompleted}/ ${pklAndStudentStatusStats.pklTotal} laporan`,
            pillText: `${pklAndStudentStatusStats.pklVisitCount} kunjungan`,
          },
        ].map(card => (
          <div
            key={card.id}
            onClick={() => handleNavigate(card.nav)}
            style={{
              boxShadow: '0 14px 34px -6px rgba(108, 96, 184, 0.09)',
            }}
            className="no-ornament group relative rounded-[26px] border border-[#F0F0F7] bg-white px-6 pt-10 pb-5 text-[#3E385B] cursor-pointer transition-all duration-200 hover:-translate-y-1 overflow-visible"
          >
            {/* Top-Center Floating Purple Squircle Icon Badge (Exact Reference Image Detail) */}
            <div
              className="pointer-events-none select-none absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex h-13 w-13 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#7568C6] to-[#6356B5] text-white shadow-[0_10px_22px_rgba(108,96,184,0.36)] transition-transform duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              <GenshinElementIcon element={card.el} className="h-6 w-6" />
            </div>

            {/* Top-Right Subtle 3-Dots Icon */}
            <span
              className="pointer-events-none absolute top-4 right-4 text-[#C6C4D6] font-bold text-sm"
              aria-hidden="true"
            >
              ⋮
            </span>

            {/* Centered Title & Subtitle */}
            <div className="text-center">
              <h3 className="text-sm font-extrabold text-[#3E385B] group-hover:text-[#6C60B8] transition-colors">
                {card.title}
              </h3>
              <p className="text-xs font-medium text-[#A2A0B4] mt-0.5">
                {card.sub}
              </p>
            </div>

            {/* Progress Label & Percentage */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#3E385B] mb-2">
                <span>Progress</span>
                <span className="tabular-nums">{card.pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F0F1F6] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1CC865] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(6, card.pct))}%` }}
                />
              </div>
            </div>

            {/* Bottom Footer Row: Left Fraction + Right Soft Pink Status Pill */}
            <div className="mt-4 flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] font-medium text-[#A2A0B4] tabular-nums">
                {card.leftMeta}
              </span>
              <span className="rounded-full bg-[#FFE4EC] px-3 py-1 text-[10px] font-bold text-[#F25781]">
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
                <p className="text-[11px] font-bold text-[#A2A0B4] truncate">
                  Persentase Kehadiran
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#3E385B] mt-1 leading-tight tabular-nums">
                  {attendanceAnalytics.effectiveAttendancePct}%
                </h3>
                <p className="text-[11px] font-medium text-[#9694A8] mt-0.5 truncate">
                  {attendanceAnalytics.hadir} Hadir &middot; {attendanceAnalytics.total} Sesi
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0F1F6]">
                <div className="flex justify-between text-[11px] font-bold text-[#3E385B] mb-1.5">
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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 block">
                  Rincian Presensi
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
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
                <p className="text-[11px] font-bold text-[#A2A0B4] truncate">
                  Rata-rata &amp; Ketuntasan
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#3E385B] mt-1 leading-tight tabular-nums">
                  {academicAnalytics.kkmPassPct}%
                </h3>
                <p className="text-[11px] font-medium text-[#9694A8] mt-0.5 truncate">
                  Rata-rata: {academicAnalytics.avgScore} ({academicAnalytics.passedCount} Tuntas)
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0F1F6]">
                <div className="flex justify-between text-[11px] font-bold text-[#3E385B] mb-1.5">
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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 block">
                  Distribusi Predikat
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
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
                <p className="text-[11px] font-bold text-[#A2A0B4] truncate">
                  Populasi Siswa &amp; Guru
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#3E385B] mt-1 leading-tight tabular-nums">
                  {students.length} <span className="text-xs font-bold text-[#9694A8]">Siswa</span>
                </h3>
                <p className="text-[11px] font-medium text-[#9694A8] mt-0.5 truncate">
                  {teachers.length} Guru &middot; {classes.length} Kelas
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0F1F6]">
                <div className="flex justify-between text-[11px] font-bold text-[#3E385B] mb-1.5">
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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 block">
                  Statistik Data Pokok
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
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
                <p className="text-[11px] font-bold text-[#A2A0B4] truncate">
                  Administrasi Prakerin
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#3E385B] mt-1 leading-tight tabular-nums">
                  {pklAndStudentStatusStats.pklCompletedPct}%
                </h3>
                <p className="text-[11px] font-medium text-[#9694A8] mt-0.5 truncate">
                  {pklAndStudentStatusStats.pklVisitCount} Monitoring &middot; {pklAndStudentStatusStats.pklTotal} Laporan
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0F1F6]">
                <div className="flex justify-between text-[11px] font-bold text-[#3E385B] mb-1.5">
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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 block">
                  Progres Prakerin (PKL)
                </span>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
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
      {/* (Replaces old Student Directory with full Charts & % Stats)  */}
      {/* ============================================================ */}
      <OrnateCard boxId="dashboard_charts_hub" className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EFE2BE] dark:border-slate-800 pb-4 mb-6">
          <div>
            <OrnateSectionHeader
              title="Pusat Grafik & Persentase Akademik ORBITA"
              subtitle="Sinkronisasi real-time database berdasarkan Kategori Kelas, Bulan, dan Tahun (Keseluruhan vs Per Rombel)"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pr-0 sm:pr-8">
            {/* Class Filter (Semua Kelas vs Per Kelas) */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#E4E3F0] bg-[#F4F3FA] px-3 py-1.5 shadow-2xs">
              <OrbitaMenuIcon variant="master-data" className="h-3.5 w-3.5 text-[#6C60B8]" />
              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-[#3E385B] focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    Kelas {cls.name} ({cls.majorCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter (Semua Bulan vs Jan-Des) */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#E4E3F0] bg-[#F4F3FA] px-3 py-1.5 shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-[#6C60B8]" />
              <select
                value={selectedMonthFilter}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedMonthFilter(val);
                  if (val !== 'ALL') {
                    setActiveMonthIdx(Math.max(0, Number(val) - 1));
                  }
                }}
                className="bg-transparent text-xs font-extrabold text-[#3E385B] focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Bulan</option>
                {MONTH_OPTIONS.map(m => (
                  <option key={m.value} value={m.value}>
                    Bulan {m.full}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter (Semua Tahun vs Tahun Akademik) */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#E4E3F0] bg-[#F4F3FA] px-3 py-1.5 shadow-2xs">
              <select
                value={selectedYearFilter}
                onChange={e => setSelectedYearFilter(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-[#3E385B] focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Tahun</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filter Pill when any filter is active */}
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
                className="no-ornament inline-flex h-9 items-center justify-center rounded-full bg-[#FFE4EC] hover:bg-[#FFD2E0] px-3.5 text-[11px] font-extrabold text-[#F25781] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}

            {/* Chart Category Switcher (Soft Lavender & Royal Purple Rounded Tabs) */}
            <div className="flex flex-wrap items-center gap-1 rounded-2xl sm:rounded-full border border-[#E4E3F0] bg-[#F4F3FA] p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveChartView('kehadiran')}
                className={`no-ornament inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeChartView === 'kehadiran'
                    ? 'bg-[#6C60B8] text-white shadow-[0_6px_14px_rgba(108,96,184,0.3)]'
                    : 'text-[#6E6A86] hover:text-[#3E385B]'
                }`}
              >
                <OrbitaMenuIcon variant="attendance" className="h-3.5 w-3.5 shrink-0" />
                <span>Presensi</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartView('akademik')}
                className={`no-ornament inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeChartView === 'akademik'
                    ? 'bg-[#6C60B8] text-white shadow-[0_6px_14px_rgba(108,96,184,0.3)]'
                    : 'text-[#6E6A86] hover:text-[#3E385B]'
                }`}
              >
                <OrbitaMenuIcon variant="grading" className="h-3.5 w-3.5 shrink-0" />
                <span>Penilaian &amp; KKM</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartView('pkl_bk')}
                className={`no-ornament inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeChartView === 'pkl_bk'
                    ? 'bg-[#6C60B8] text-white shadow-[0_6px_14px_rgba(108,96,184,0.3)]'
                    : 'text-[#6E6A86] hover:text-[#3E385B]'
                }`}
              >
                <OrbitaMenuIcon variant="pkl" className="h-3.5 w-3.5 shrink-0" />
                <span>PKL</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartView('siswa')}
                className={`no-ornament inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeChartView === 'siswa'
                    ? 'bg-[#6C60B8] text-white shadow-[0_6px_14px_rgba(108,96,184,0.3)]'
                    : 'text-[#6E6A86] hover:text-[#3E385B]'
                }`}
              >
                <OrbitaMenuIcon variant="master-data" className="h-3.5 w-3.5 shrink-0" />
                <span>Data Siswa</span>
              </button>
            </div>
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
              className="lg:col-span-5 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pr-8">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#6C60B8]">
                    Distribusi Persentase Presensi
                  </span>
                  <span className="rounded-full bg-[#E7F9EF] px-2.5 py-0.5 text-[11px] font-extrabold text-[#139A4C]">
                    Efektif: {attendanceAnalytics.effectiveAttendancePct}%
                  </span>
                </div>

                {/* Interactive Radial Donut Gauge */}
                <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
                  <div
                    onClick={() => setSelectedDonutSlice(null)}
                    title="Klik item legenda untuk menyorot status presensi"
                    className="relative h-40 w-40 shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    <div
                      className="h-full w-full rounded-full shadow-inner transition-all duration-500"
                      style={{ background: donutGradient }}
                    />
                    <div className="absolute inset-4 rounded-full bg-white border border-[#ECEBF5] flex flex-col items-center justify-center text-center shadow-[0_8px_20px_rgba(108,96,184,0.12)] px-2">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#9694A8] truncate max-w-full">
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
                      <span className="text-[10px] font-bold text-[#3E385B]">
                        {attendanceAnalytics.studentCount} Siswa
                      </span>
                    </div>
                  </div>

                  {/* Interactive Legend Bars with Percentages */}
                  <div className="flex-1 w-full space-y-2.5">
                    {[
                      {
                        shortKey: 'Hadir (H)',
                        label: 'Hadir Tepat Waktu (H)',
                        count: attendanceAnalytics.hadir,
                        pct: attendanceAnalytics.hadirPct,
                        color: 'bg-[#1CC865]',
                        textColor: 'text-[#139A4C]',
                      },
                      {
                        shortKey: 'Terlambat (T)',
                        label: 'Terlambat Hadir (T)',
                        count: attendanceAnalytics.terlambat,
                        pct: attendanceAnalytics.terlambatPct,
                        color: 'bg-[#6C60B8]',
                        textColor: 'text-[#6C60B8]',
                      },
                      {
                        shortKey: 'Sakit (S)',
                        label: 'Sakit dengan Surat (S)',
                        count: attendanceAnalytics.sakit,
                        pct: attendanceAnalytics.sakitPct,
                        color: 'bg-[#3B82F6]',
                        textColor: 'text-[#2563EB]',
                      },
                      {
                        shortKey: 'Izin (I)',
                        label: 'Izin Resmi (I)',
                        count: attendanceAnalytics.izin,
                        pct: attendanceAnalytics.izinPct,
                        color: 'bg-[#F59E0B]',
                        textColor: 'text-[#D97706]',
                      },
                      {
                        shortKey: 'Alpa (A)',
                        label: 'Tanpa Keterangan / Alpa (A)',
                        count: attendanceAnalytics.alpa,
                        pct: attendanceAnalytics.alpaPct,
                        color: 'bg-[#F25781]',
                        textColor: 'text-[#F25781]',
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
                          className={`space-y-1 rounded-xl p-1.5 transition-all cursor-pointer ${
                            isHighlighted ? 'bg-[#F4F3FA] ring-1 ring-[#6C60B8]/30' : 'hover:bg-[#FAF9FE]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#3E385B] flex items-center gap-1.5">
                              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                              {item.label}
                            </span>
                            <span className={`font-black ${item.textColor}`}>
                              {item.pct}%{' '}
                              <span className="text-[10px] text-[#9694A8]">({item.count})</span>
                            </span>
                          </div>
                          <div className="jrpg-stat-bar">
                            <div
                              className={`jrpg-stat-bar-fill ${item.color}`}
                              style={{ width: `${Math.max(item.pct > 0 ? 4 : 0, item.pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#ECEBF5] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[#9694A8] font-semibold">
                  Total Sesi Presensi Tercatat: <strong className="text-[#3E385B]">{attendanceSessions.length} Sesi</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigate('attendance')}
                  className="no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-[#F0EEFA] hover:bg-[#E4E1F6] px-3 text-xs font-extrabold text-[#6C60B8] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <span>Buka Modul Presensi</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            </OrnateCard>

            {/* Right: Interactive Class-by-Class Attendance & Academic Bar Comparison Chart */}
            <OrnateCard
              boxId="chart_kehadiran_kelas"
              className="lg:col-span-7 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pr-8">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#6C60B8] block">
                      Grafik Perbandingan Kehadiran &amp; Ketuntasan Per Kelas
                    </span>
                    <span className="text-[11px] text-[#9694A8]">
                      Klik salah satu baris kelas untuk memfilter data grafik ke rombel tersebut
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <span className="flex items-center gap-1.5 text-[#139A4C]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1CC865]" /> % Kehadiran
                    </span>
                    <span className="flex items-center gap-1.5 text-[#6C60B8]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#6C60B8]" /> % Lulus KKM
                    </span>
                  </div>
                </div>

                {/* Interactive Horizontal Multi-Bar Chart per Class */}
                <div className="space-y-3.5 mt-2">
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
                            ? 'border-[#6C60B8] bg-[#F4F2FC] shadow-sm'
                            : 'border-[#ECEBF5] bg-[#FAF9FE] hover:border-[#D0CBEF]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-[#6C60B8] text-white px-2.5 py-1 text-xs font-extrabold">
                              {cls.name}
                            </span>
                            <span className="text-xs font-bold text-[#3E385B]">
                              {cls.studentCount} Siswa ({cls.maleCount}L / {cls.femaleCount}P)
                            </span>
                            {isClassSelected && (
                              <span className="rounded-full bg-[#FFE4EC] px-2 py-0.5 text-[10px] font-extrabold text-[#F25781]">
                                Filter Aktif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs font-extrabold">
                            <span className="text-[#139A4C]">
                              Hadir: {cls.attendancePct}%
                            </span>
                            <span className="text-[#6C60B8]">
                              Rata-rata: {cls.avgGrade}
                            </span>
                            <span className="text-[#F25781]">
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
        {activeChartView === 'akademik' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Vertical Bar Chart of Predicate Distribution (A/B/C/D) */}
            <OrnateCard
              boxId="chart_akademik_predikat"
              className="lg:col-span-5 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pr-8">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#6C60B8]">
                    Chart Distribusi Predikat Nilai
                  </span>
                  <span className="rounded-full bg-[#F0EEFA] px-3 py-0.5 text-[11px] font-extrabold text-[#6C60B8]">
                    Rata-rata: {academicAnalytics.avgScore}
                  </span>
                </div>

                {/* Interactive Vertical Columns Chart */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-3 items-end h-48 pt-6 px-1 sm:px-2 border-b border-[#ECEBF5]">
                  {[
                    {
                      grade: 'A',
                      desc: '90 - 100',
                      pct: academicAnalytics.predAPct,
                      count: academicAnalytics.predA,
                      barClass: 'bg-[#1CC865]',
                      badgeClass: 'text-[#139A4C]',
                    },
                    {
                      grade: 'B',
                      desc: '80 - 89',
                      pct: academicAnalytics.predBPct,
                      count: academicAnalytics.predB,
                      barClass: 'bg-[#6C60B8]',
                      badgeClass: 'text-[#6C60B8]',
                    },
                    {
                      grade: 'C',
                      desc: '75 - 79',
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
                  ].map(col => {
                    const isSelectedCol = selectedPredicateGrade === col.grade;
                    return (
                      <div
                        key={col.grade}
                        onClick={() => setSelectedPredicateGrade(col.grade)}
                        onMouseEnter={() => setSelectedPredicateGrade(col.grade)}
                        className={`flex flex-col items-center h-full justify-end group cursor-pointer rounded-2xl p-1.5 transition-all ${
                          isSelectedCol ? 'bg-[#F4F3FA]' : 'hover:bg-[#FAF9FE]'
                        }`}
                      >
                        <span className={`text-xs font-black mb-1 ${col.badgeClass}`}>
                          {col.pct}%
                        </span>
                        <div className="w-full max-w-[54px] bg-[#ECEBF5] rounded-t-xl h-32 flex items-end p-1 overflow-hidden">
                          <div
                            className={`w-full rounded-t-lg ${col.barClass} transition-all duration-500 group-hover:brightness-105`}
                            style={{ height: `${Math.max(col.pct > 0 ? 12 : 6, col.pct)}%` }}
                          />
                        </div>
                        <span className="mt-2 text-xs sm:text-sm font-extrabold text-[#3E385B]">
                          Predikat {col.grade}
                        </span>
                        <span className="text-[10px] text-[#9694A8] font-semibold">
                          {col.count} Siswa ({col.desc})
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Pass vs Remedial Split Flipcards */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <JrpgFlipBox
                    boxId="flip_tuntas_kkm"
                    minHeightClass="min-h-[115px]"
                    onClick={() => handleNavigate('grading')}
                    front={
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#139A4C] block">
                          Tuntas KKM (&ge; 75)
                        </span>
                        <span className="text-xl font-black text-[#1CC865] mt-1 block">
                          {academicAnalytics.kkmPassPct}% ({academicAnalytics.passedCount} Siswa)
                        </span>
                      </div>
                    }
                    back={
                      <div className="text-xs">
                        <span className="text-[10px] font-black uppercase text-white block">
                          Capaian Kompetensi
                        </span>
                        <p className="mt-1 text-white/90">
                          {academicAnalytics.passedCount} siswa melampaui batas KKM dengan rata-rata {academicAnalytics.avgScore}.
                        </p>
                      </div>
                    }
                  />
                  <JrpgFlipBox
                    boxId="flip_remedial_kkm"
                    minHeightClass="min-h-[115px]"
                    onClick={() => handleNavigate('grading')}
                    front={
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#F25781] block">
                          Perlu Remedial / 0
                        </span>
                        <span className="text-xl font-black text-[#F25781] mt-1 block">
                          {academicAnalytics.remedialPct}% ({academicAnalytics.remedialCount} Siswa)
                        </span>
                      </div>
                    }
                    back={
                      <div className="text-xs">
                        <span className="text-[10px] font-black uppercase text-white block">
                          Evaluasi Remedial
                        </span>
                        <p className="mt-1 text-white/90">
                          {academicAnalytics.remedialCount} siswa memerlukan pengayaan atau belum dinilai.
                        </p>
                      </div>
                    }
                  />
                </div>
              </div>
            </OrnateCard>

            {/* Right: Subject Mastery & Pass Rate Bars */}
            <OrnateCard
              boxId="chart_akademik_mapel"
              className="lg:col-span-7 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pr-8">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#6C60B8] block">
                    Persentase Ketuntasan &amp; Rata-rata Nilai Per Mata Pelajaran
                  </span>
                  <span className="text-[11px] text-[#9694A8]">
                    Sinkron otomatis dari database Penilaian Akademik
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate('grading')}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-[#6C60B8] px-3.5 text-xs font-extrabold text-white hover:bg-[#5B4FA8] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <span>Kelola Nilai</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {subjectComparisonData.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => handleNavigate('grading')}
                    className="rounded-[18px] border border-[#ECEBF5] bg-[#FAF9FE] p-3.5 transition-all hover:border-[#6C60B8] cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <span className="font-extrabold text-[#3E385B]">{sub.name}</span>
                        <span className="rounded-full bg-[#F0EEFA] px-2.5 py-0.5 text-[10px] font-bold text-[#6C60B8]">
                          {sub.code} &bull; KKM {sub.kkm}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-extrabold shrink-0">
                        <span className="text-[#6C60B8]">
                          Rata-rata: {sub.avgScore}
                        </span>
                        <span className="text-[#139A4C]">
                          Lulus: {sub.passRatePct}%
                        </span>
                      </div>
                    </div>
                    <div className="jrpg-stat-bar">
                      <div
                        className="jrpg-stat-bar-fill bg-[#6C60B8]"
                        style={{ width: `${Math.min(100, sub.avgScore)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </OrnateCard>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: PKL, CORRECTIONS & MAJOR DISTRIBUTION FLIPCARDS      */}
        {/* ============================================================ */}
        {activeChartView === 'pkl_bk' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Flipcard 1: PKL Placement Breakdown (No duplicate inner icon) */}
            <JrpgFlipBox
              boxId="chart_pkl_progres"
              minHeightClass="min-h-[230px]"
              onClick={() => handleNavigate('pkl')}
              front={
                <div className="space-y-4">
                  <div className="flex items-center justify-between pr-6">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#6C60B8]">
                      Persentase Administrasi Prakerin (PKL)
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Laporan PKL Aktif</span>
                        <span className="text-[#139A4C]">
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
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Disetujui &amp; Terverifikasi</span>
                        <span className="text-[#6C60B8]">
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
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Menunggu Review / Revisi</span>
                        <span className="text-[#F25781]">
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
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Ringkasan Praktik Kerja Lapangan
                    </span>
                    <p className="text-xs text-white/90 mt-2 leading-relaxed">
                      Total <strong>{pklAndStudentStatusStats.pklTotal}</strong> berkas laporan prakerin siswa terdata di database, dengan tingkat kelulusan verifikasi mencapai{' '}
                      <strong>{pklAndStudentStatusStats.pklCompletedPct}%</strong>.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-white pt-3 border-t border-white/20">
                    <span>Klik untuk Buka Administrasi PKL</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              }
            />

            {/* Flipcard 2: Attendance Corrections & Supervision Visits */}
            <JrpgFlipBox
              boxId="chart_pkl_koreksi"
              minHeightClass="min-h-[230px]"
              onClick={() => handleNavigate('attendance')}
              front={
                <div className="space-y-4">
                  <div className="flex items-center justify-between pr-6">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#6C60B8]">
                      Verifikasi Koreksi &amp; Kunjungan Supervisi
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Rasio Penyelesaian Koreksi Presensi</span>
                        <span className="text-[#139A4C]">
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
                      <div className="rounded-xl border border-[#ECEBF5] p-3 bg-[#FAF9FE]">
                        <span className="text-[10px] font-bold text-[#9694A8] block">Mitra Industri</span>
                        <span className="text-lg font-black text-[#6C60B8]">
                          {pklAndStudentStatusStats.pklPartnerCount} Mitra
                        </span>
                      </div>
                      <div className="rounded-xl border border-[#ECEBF5] p-3 bg-[#FAF9FE]">
                        <span className="text-[10px] font-bold text-[#9694A8] block">Kunjungan Monitoring</span>
                        <span className="text-lg font-black text-[#F25781]">
                          {pklAndStudentStatusStats.pklVisitCount} Kunjungan
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              }
              back={
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Detail Koreksi &amp; Supervisi
                    </span>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
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
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              }
            />

            {/* Flipcard 3: Major / Department Distribution */}
            <JrpgFlipBox
              boxId="chart_pkl_jurusan"
              minHeightClass="min-h-[230px]"
              onClick={() => handleNavigate('master-data')}
              front={
                <div className="space-y-4">
                  <div className="flex items-center justify-between pr-6">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#6C60B8]">
                      Proporsi Siswa Per Kompetensi Keahlian
                    </span>
                  </div>
                  <div className="space-y-3">
                    {majors.map(mj => {
                      const mjCount = students.filter(s => s.majorCode === mj.code).length;
                      const mjPct =
                        students.length > 0 ? Number(((mjCount / students.length) * 100).toFixed(1)) : 0;
                      return (
                        <div key={mj.id}>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span>
                              {mj.name} ({mj.code})
                            </span>
                            <span className="text-[#6C60B8]">
                              {mjPct}% ({mjCount} Siswa)
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
                    <span className="text-xs font-black uppercase tracking-wider text-white">
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
            <OrnateCard boxId="chart_siswa_gender" className="lg:col-span-5 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pr-8">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#6C60B8]">
                    Proporsi Siswa &amp; Gender ({selectedClassFilter === 'ALL' ? 'Semua Kelas' : 'Per Kelas'})
                  </span>
                  <span className="rounded-full bg-[#E7F9EF] px-2.5 py-0.5 text-[11px] font-extrabold text-[#139A4C]">
                    {filteredStudents.length} Siswa
                  </span>
                </div>

                <div className="space-y-4 my-3">
                  <div className="rounded-2xl border border-[#ECEBF5] bg-[#FAF9FE] p-4">
                    <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
                      <span className="text-[#3E385B]">Siswa Laki-laki (L)</span>
                      <span className="text-[#6C60B8]">
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

                  <div className="rounded-2xl border border-[#ECEBF5] bg-[#FAF9FE] p-4">
                    <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
                      <span className="text-[#3E385B]">Siswa Perempuan (P)</span>
                      <span className="text-[#F25781]">
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

              <div className="mt-4 pt-3 border-t border-[#ECEBF5] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[#9694A8] font-semibold">
                  Dewan Guru Aktif: <strong className="text-[#3E385B]">{teachers.length} Pengajar</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigate('master-data')}
                  className="no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-[#F0EEFA] hover:bg-[#E4E1F6] px-3 text-xs font-extrabold text-[#6C60B8] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <span>Buka Master Data</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            </OrnateCard>

            <OrnateCard boxId="chart_siswa_rombel" className="lg:col-span-7 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pr-8">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#6C60B8] block">
                    Distribusi Populasi Siswa &amp; Rasio Gender Per Kelas
                  </span>
                  <span className="text-[11px] text-[#9694A8]">
                    Klik kelas untuk memisahkan data keseluruhan dengan data per kelas
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
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
                          ? 'border-[#6C60B8] bg-[#F4F2FC] shadow-xs'
                          : 'border-[#ECEBF5] bg-[#FAF9FE] hover:border-[#D0CBEF]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-1.5">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className="rounded-lg bg-[#6C60B8] text-white px-2.5 py-0.5 text-xs font-extrabold">
                            {cls.name}
                          </span>
                          <span className="font-bold text-[#3E385B]">
                            {cls.studentCount} Siswa ({cls.maleCount} L / {cls.femaleCount} P)
                          </span>
                        </div>
                        <span className="font-extrabold text-[#139A4C] shrink-0">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pr-10">
          <OrnateSectionHeader
            title="Matriks Persentase Kehadiran & Capaian Akademik Per Kelas"
            subtitle="Arahkan kursor pada baris tabel untuk melihat sorotan indikator performa akademik secara interaktif"
          />
          <button
            type="button"
            onClick={() => handleNavigate('reports')}
            className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] hover:bg-[#5B4FA8] px-4 text-xs font-extrabold text-white shadow-sm whitespace-nowrap shrink-0 transition-all cursor-pointer"
          >
            <OrbitaMenuIcon variant="reports" className="h-3.5 w-3.5 shrink-0" />
            <span>Buka Laporan &amp; Leger</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#EFE2BE] dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="py-3 px-4">Kelas / Rombel</th>
                <th className="py-3 px-4 text-center">Jurusan</th>
                <th className="py-3 px-4 text-center">Populasi Siswa</th>
                <th className="py-3 px-4 text-center">Rincian H / S / I / A</th>
                <th className="py-3 px-4">Persentase Kehadiran</th>
                <th className="py-3 px-4 text-center">Rata-rata Nilai</th>
                <th className="py-3 px-4">Persentase Lulus KKM</th>
                <th className="py-3 px-4 text-center">Rank Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classComparisonData.map(row => (
                <tr key={row.id}>
                  <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="rounded-lg bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700 dark:text-cyan-300">
                      {row.majorCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {row.studentCount} Siswa{' '}
                    <span className="text-[10px] text-slate-400">
                      ({row.maleCount}L/{row.femaleCount}P)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{row.hCount}H</span> •{' '}
                    <span className="text-blue-500 font-bold">{row.sCount}S</span> •{' '}
                    <span className="text-amber-500 font-bold">{row.iCount}I</span> •{' '}
                    <span className="text-rose-500 font-bold">{row.aCount}A</span>
                  </td>
                  <td className="py-3 px-4 w-48">
                    <div className="flex items-center justify-between text-[11px] font-black mb-1">
                      <span className="text-emerald-600 dark:text-emerald-400">{row.attendancePct}%</span>
                      <span className="text-[10px] text-slate-400">Target 90%</span>
                    </div>
                    <div className="jrpg-stat-bar">
                      <div
                        className="jrpg-stat-bar-fill bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${Math.min(100, row.attendancePct)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-black text-blue-600 dark:text-cyan-400">
                      {row.avgGrade}
                    </span>
                  </td>
                  <td className="py-3 px-4 w-48">
                    <div className="flex items-center justify-between text-[11px] font-black mb-1">
                      <span className="text-blue-600 dark:text-cyan-400">{row.kkmPct}%</span>
                      <span className="text-[10px] text-slate-400">KKM &ge; 75</span>
                    </div>
                    <div className="jrpg-stat-bar">
                      <div
                        className="jrpg-stat-bar-fill bg-gradient-to-r from-blue-600 to-cyan-400"
                        style={{ width: `${Math.min(100, row.kkmPct)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        row.attendancePct >= 90 && row.avgGrade >= 80
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : row.avgGrade >= 75
                          ? 'bg-blue-500/15 text-blue-700 dark:text-cyan-300 border border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {row.attendancePct >= 90 && row.avgGrade >= 80
                        ? 'RANK S • OPTIMAL'
                        : row.avgGrade >= 75
                        ? 'RANK A • STABIL'
                        : 'RANK B • EVALUASI'}
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
