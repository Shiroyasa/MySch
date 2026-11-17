import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AlumniRespondentCategory, UserRole } from '../../types';
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  CalendarDays,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  X,
  BarChart3,
  UserPlus,
  Mail,
  Hash,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';
import { AcademyScheduleBoard } from '../common/AcademyScheduleBoard';
import { TracerStudyPortalForm, TracerPortalStage } from '../common/TracerStudyPortalForm';
import { ActivityGalleryCarousel } from '../common/ActivityGalleryCarousel';
import { OrbitaOrnateFrame } from '../common/OrbitaOrnateFrame';
import { GenshinElementIcon, OrbitaMenuIcon, buildSmoothWavePath } from '../common/AcademyOrnaments';
import { AnimeBackground } from '../common/AnimeBackground';
import { LiquidNavBar } from '../common/LiquidNavBar';
import { ThemeFlipToggle } from '../common/ThemeFlipToggle';
import { LiquidDigitalClock } from '../common/LiquidDigitalClock';
import { SqueezeLineIndicator } from '../common/CarouselTablePagination';
import { AccordionExpandAllBar, AccordionSection, useAccordionGroup } from '../common/AccordionExpandGroup';

const SHORT_MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const LoginPage: React.FC = () => {
  const {
    loginWithEmail,
    addUser,
    addToast,
    users = [],
    subjects = [],
    visualSettings,
    schoolSettings,
    activeAcademicYear,
    lessonSchedules = [],
    students = [],
    teachers = [],
    classes = [],
    attendanceSessions = [],
    attendanceRecords = [],
    assessmentScores = [],
    pklTracers = [],
    galleryPhotos = [],
    galleryViewSettings,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginSuccessBanner, setLoginSuccessBanner] = useState<string | null>(null);

  // 3D Flip-Card State (Front = Login, Back = Register)
  const [isRegisterFlipped, setIsRegisterFlipped] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('siswa');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNipOrNis, setRegNipOrNis] = useState('');
  const [regClassId, setRegClassId] = useState('');
  const [regSubjectName, setRegSubjectName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);
  const [activePortalView, setActivePortalView] = useState<'login' | 'gallery' | 'tracer'>('login');
  const [mobileSection, setMobileSection] = useState<'login' | 'overview' | 'gallery' | 'tracer'>('login');
  const [overviewSlide, setOverviewSlide] = useState<0 | 1>(0);
  const [overviewSlideDir, setOverviewSlideDir] = useState<'next' | 'prev'>('next');
  const overviewTouchStartXRef = React.useRef<number | null>(null);
  const [tracerStage, setTracerStage] = useState<TracerPortalStage>('verify');
  const [resolvedTracerCategory, setResolvedTracerCategory] =
    useState<AlumniRespondentCategory | null>(null);
  const [pendingPortalExit, setPendingPortalExit] = useState<{
    view: 'login' | 'gallery' | 'tracer';
    mobile: 'login' | 'overview' | 'gallery' | 'tracer';
  } | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  const publishedGalleryPhotos = useMemo(
    () => galleryPhotos.filter(p => p.isPublished !== false),
    [galleryPhotos]
  );

  const overviewAccordion = useAccordionGroup(['wave-card', 'bento-cards'], true);

  const switchOverviewSlide = (next: 0 | 1) => {
    setOverviewSlideDir(next >= overviewSlide ? 'next' : 'prev');
    setOverviewSlide(next);
  };

  const navigatePortal = (
    nextView: 'login' | 'gallery' | 'tracer',
    nextMobile: 'login' | 'overview' | 'gallery' | 'tracer'
  ) => {
    const inTracerPortal = activePortalView === 'tracer' || mobileSection === 'tracer';
    const isLeavingTracerPortal = nextView !== 'tracer';

    if (inTracerPortal && tracerStage !== 'verify' && isLeavingTracerPortal) {
      setPendingPortalExit({
        view: nextView,
        mobile: nextMobile,
      });
      return;
    }

    if (nextView === 'tracer' && !inTracerPortal) {
      setTracerStage('verify');
      setResolvedTracerCategory(null);
    }
    if (nextView !== 'tracer') {
      setResolvedTracerCategory(null);
    }
    setActivePortalView(nextView);
    setMobileSection(nextMobile);
  };

  const activeLogo = visualSettings?.appLogoUrl || schoolSettings?.logoUrl || null;

  const selectedClassObj = useMemo(
    () => classes.find(c => c.id === selectedClassId || c.name === selectedClassId) || null,
    [classes, selectedClassId]
  );

  const filteredStudents = useMemo(() => {
    if (selectedClassId === 'ALL') return students;
    return students.filter(
      s =>
        s.classId === selectedClassId ||
        s.className === selectedClassId ||
        (selectedClassObj && s.className === selectedClassObj.name)
    );
  }, [students, selectedClassId, selectedClassObj]);

  const filteredStudentIds = useMemo(
    () => new Set(filteredStudents.map(s => s.id)),
    [filteredStudents]
  );

  const filteredSessions = useMemo(() => {
    if (selectedClassId === 'ALL') return attendanceSessions;
    return attendanceSessions.filter(
      s =>
        s.classId === selectedClassId ||
        (selectedClassObj && s.className === selectedClassObj.name)
    );
  }, [attendanceSessions, selectedClassId, selectedClassObj]);

  const filteredSchedulesCount = useMemo(() => {
    if (selectedClassId === 'ALL') return lessonSchedules.length;
    return lessonSchedules.filter(
      s =>
        s.classId === selectedClassId ||
        (selectedClassObj && s.className === selectedClassObj.name)
    ).length;
  }, [lessonSchedules, selectedClassId, selectedClassObj]);

  const filteredTracers = useMemo(() => {
    if (selectedClassId === 'ALL') return pklTracers;
    const targetName = (selectedClassObj?.name || '').toLowerCase();
    return pklTracers.filter(t => {
      if (t.studentId && filteredStudentIds.has(t.studentId)) return true;
      if (targetName && (t.className || '').toLowerCase() === targetName) return true;
      return false;
    });
  }, [pklTracers, selectedClassId, selectedClassObj, filteredStudentIds]);

  const alumniTracerCount = useMemo(
    () => filteredTracers.filter(t => (t.respondentCategory || 'alumni') === 'alumni').length,
    [filteredTracers]
  );
  const grade12TracerCount = useMemo(
    () => filteredTracers.filter(t => t.respondentCategory === 'kelas_12').length,
    [filteredTracers]
  );

  const realTimeMetrics = useMemo(() => {
    const relRecords = attendanceRecords.filter(r => filteredStudentIds.has(r.studentId));
    const hadirCount = relRecords.filter(r => r.status === 'H' || r.status === 'T').length;
    const attPct =
      relRecords.length > 0 ? Number(((hadirCount / relRecords.length) * 100).toFixed(1)) : 0;

    const relScores = assessmentScores.filter(sc => filteredStudentIds.has(sc.studentId));
    const passedScores = relScores.filter(sc => Number(sc.score || 0) >= 75).length;
    const kkmPct =
      relScores.length > 0 ? Number(((passedScores / relScores.length) * 100).toFixed(1)) : 0;

    const activeTracerResponses = filteredTracers.filter(
      t => t.careerStatus && t.careerStatus !== 'belum_bekerja'
    ).length;
    const tracerPct =
      filteredTracers.length > 0
        ? Number(((activeTracerResponses / filteredTracers.length) * 100).toFixed(1))
        : 0;

    return {
      attPct,
      attRecordsCount: relRecords.length,
      kkmPct,
      kkmScoresCount: relScores.length,
      tracerPct,
      tracerTotalCount: filteredTracers.length,
    };
  }, [attendanceRecords, assessmentScores, filteredStudentIds, filteredTracers]);

  // Dynamic 7-month window synced to real inputted attendanceSessions
  const rollingMonthBuckets = useMemo(() => {
    const datedTimestamps = filteredSessions
      .map(s => (s.date ? new Date(s.date) : null))
      .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    const anchorDate =
      datedTimestamps.length > 0 ? datedTimestamps[datedTimestamps.length - 1] : new Date();

    const buckets: { year: number; monthNum: number; label: string }[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - offset, 1);
      buckets.push({
        year: d.getFullYear(),
        monthNum: d.getMonth() + 1,
        label: SHORT_MONTHS_ID[d.getMonth()],
      });
    }
    return buckets;
  }, [filteredSessions]);

  const loginWavePoints = useMemo(() => {
    const rawValues = rollingMonthBuckets.map(bucket => {
      const mSessions = filteredSessions.filter(s => {
        if (!s.date) return false;
        const d = new Date(s.date);
        return (
          !isNaN(d.getTime()) &&
          d.getFullYear() === bucket.year &&
          d.getMonth() + 1 === bucket.monthNum
        );
      });
      const sIds = new Set(mSessions.map(s => s.id));
      const mRecs = attendanceRecords.filter(
        r => sIds.has(r.sessionId) && filteredStudentIds.has(r.studentId)
      );
      const val =
        mRecs.length > 0
          ? Number(
              (
                (mRecs.filter(r => r.status === 'H' || r.status === 'T').length / mRecs.length) *
                100
              ).toFixed(1)
            )
          : 0;
      return {
        month: bucket.label,
        val,
        sessions: mSessions.length,
        records: mRecs.length,
      };
    });

    const minV = 0;
    const maxV = Math.max(100, ...rawValues.map(r => r.val));
    const span = Math.max(10, maxV - minV);

    return rawValues.map((r, i) => {
      const x = Number(((i / Math.max(1, rawValues.length - 1)) * 390 + 15).toFixed(1));
      const norm = (r.val - minV) / span;
      const y = Number((74 - norm * 48).toFixed(1));
      return { x, y, month: r.month, val: r.val, sessions: r.sessions, records: r.records };
    });
  }, [rollingMonthBuckets, filteredSessions, attendanceRecords, filteredStudentIds]);

  const latestActiveMonthIdx = useMemo(() => {
    for (let i = loginWavePoints.length - 1; i >= 0; i--) {
      if (loginWavePoints[i].records > 0) return i;
    }
    return loginWavePoints.length - 1;
  }, [loginWavePoints]);

  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(latestActiveMonthIdx);

  useEffect(() => {
    setActiveMonthIdx(latestActiveMonthIdx);
  }, [latestActiveMonthIdx, selectedClassId]);

  const activeLoginPoint =
    loginWavePoints[activeMonthIdx] || loginWavePoints[loginWavePoints.length - 1];
  const activeMonth = activeLoginPoint?.month || SHORT_MONTHS_ID[new Date().getMonth()];
  const loginWaveLinePath = useMemo(() => buildSmoothWavePath(loginWavePoints), [loginWavePoints]);
  const loginWaveAreaPath = useMemo(() => buildSmoothWavePath(loginWavePoints, 92), [loginWavePoints]);
  const activeLoginLeftNum = Number((((activeLoginPoint?.x ?? 210) / 420) * 100).toFixed(1));
  const activeLoginLeftPct = `${activeLoginLeftNum}%`;
  const activeLoginTooltipLeftPct = `${Math.min(86, Math.max(14, activeLoginLeftNum))}%`;

  const isInGalleryPortal = activePortalView === 'gallery' || mobileSection === 'gallery';
  const isInTracerPortal = activePortalView === 'tracer' || mobileSection === 'tracer';
  const headerKicker = isInGalleryPortal
    ? 'Dokumentasi Sekolah · Galeri Carousel'
    : isInTracerPortal
    ? tracerStage === 'verify'
      ? 'Portal Verifikasi Identitas Terdaftar ORBITA'
      : resolvedTracerCategory === 'kelas_12'
      ? 'Perencanaan Setelah Lulus • Siswa Aktif Kelas 12'
      : resolvedTracerCategory === 'alumni'
      ? 'Penelusuran Karier • Alumni Terdaftar'
      : 'Portal Tracer Study & Rencana Lulus'
    : 'Primary';

  const headerTitle = isInGalleryPortal
    ? 'Galeri Kegiatan ORBITA'
    : isInTracerPortal
    ? tracerStage === 'verify'
      ? 'Halaman Verifikasi NIS / NISN Siswa & Alumni'
      : resolvedTracerCategory === 'kelas_12'
      ? 'Halaman Perencanaan Lulus Siswa Kelas 12'
      : resolvedTracerCategory === 'alumni'
      ? 'Halaman Tracer Study Alumni'
      : 'Portal Tracer Study ORBITA'
    : 'ORBITA Akademi';

  const emailInvalid = Boolean(
    errorMessage && (!email.trim() || errorMessage.includes('sesuai'))
  );
  const passwordInvalid = Boolean(
    errorMessage && (!password.trim() || errorMessage.includes('sesuai'))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoginSuccessBanner(null);
    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email atau NIP/NIS akun ORBITA.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Harap masukkan kata sandi.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ok = loginWithEmail(email.trim(), password.trim());
      setIsSubmitting(false);
      if (!ok) {
        setErrorMessage(
          'Email/NIP/NIS atau kata sandi tidak sesuai. Silakan periksa kembali kredensial Anda.'
        );
      }
    }, 350);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanName = regFullName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanId = regNipOrNis.trim();
    const cleanPass = regPassword.trim();
    const cleanConfirm = regConfirmPassword.trim();

    if (!cleanName) {
      setRegError('Harap isi Nama Lengkap sesuai identitas akademik.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setRegError('Harap masukkan alamat Email aktif yang valid.');
      return;
    }
    if (!cleanId) {
      setRegError(
        regRole === 'siswa'
          ? 'Harap masukkan Nomor Induk Siswa (NIS / NISN).'
          : 'Harap masukkan Nomor Induk Pegawai (NIP / ID Guru).'
      );
      return;
    }
    if (cleanPass.length < 4) {
      setRegError('Kata sandi minimal terdiri dari 4 karakter.');
      return;
    }
    if (cleanPass !== cleanConfirm) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    // Check duplicate email or NIP/NIS
    const duplicateUser = users.find(
      u =>
        u.email.toLowerCase() === cleanEmail ||
        (u.nipOrNis && u.nipOrNis.toLowerCase() === cleanId.toLowerCase())
    );
    if (duplicateUser) {
      setRegError('Email atau Nomor Induk (NIS/NIP) tersebut sudah terdaftar. Silakan langsung masuk.');
      return;
    }

    setIsRegSubmitting(true);
    setTimeout(() => {
      const targetClass =
        classes.find(c => c.id === regClassId) || classes[0];
      const selectedSubj = regSubjectName || subjects[0]?.name || 'Pendidikan Umum';

      addUser({
        email: cleanEmail,
        displayName: cleanName,
        role: regRole,
        nipOrNis: cleanId,
        password: cleanPass,
        isActive: true,
        ...(regRole === 'siswa' && targetClass
          ? { classId: targetClass.id, className: targetClass.name }
          : {}),
        ...(regRole === 'wali_kelas' && targetClass
          ? { homeroomClassId: targetClass.id, homeroomClassName: targetClass.name, subjects: [selectedSubj] }
          : {}),
        ...(regRole === 'guru' ? { subjects: [selectedSubj] } : {}),
      });

      setIsRegSubmitting(false);
      // Pre-fill login credentials and flip back to Login face
      setEmail(cleanEmail);
      setPassword(cleanPass);
      setErrorMessage(null);
      setLoginSuccessBanner(
        `Akun ${cleanName} (${cleanId}) berhasil terdaftar & tersinkronisasi! Klik Masuk Dashboard.`
      );
      addToast(`Registrasi berhasil! Akun ${cleanName} siap digunakan.`, 'success');

      // Reset register fields & flip back to Login face
      setRegFullName('');
      setRegEmail('');
      setRegNipOrNis('');
      setRegPassword('');
      setRegConfirmPassword('');
      setIsRegisterFlipped(false);
    }, 380);
  };

  return (
    <div className="orbita-login-shell relative flex min-h-[100dvh] md:h-[100dvh] md:overflow-hidden w-full items-center justify-center overflow-x-hidden p-0 sm:p-3 md:p-4 lg:p-6 font-sans text-[#3E385B] dark:text-[#E6E4F2] select-none">
      {/* Soft Cool Lavender-Slate / Deep Indigo Outer Backdrop */}
      <AnimeBackground />

      {/* Outer Frosted Tablet/Desktop Bezel Frame */}
      <div className="relative z-10 flex min-h-[100dvh] md:h-full md:min-h-0 w-full max-w-[1560px] overflow-hidden rounded-none sm:rounded-[34px] lg:rounded-[40px] border-0 sm:border sm:border-white/60 dark:sm:border-[#8D81E3]/25 bg-transparent sm:bg-[#EAE7F9]/38 dark:sm:bg-[#191438]/55 p-0 sm:p-2 lg:p-2.5 sm:shadow-[0_32px_80px_-12px_rgba(79,67,156,0.28)] sm:backdrop-blur-xl">
        {/* Inner Translucent Lavender-Glass Application Canvas */}
        <div className="relative flex w-full md:h-full overflow-hidden rounded-none sm:rounded-[28px] lg:rounded-[32px] bg-[#F5F4FB]/88 dark:bg-[#14102E]/90 backdrop-blur-md">
          {/* Left Floating Vertical Frosted Violet Glass Pill Sidebar (Desktop & Landscape Tablet) */}
          <aside
            className="orbita-sidebar-glass relative z-20 hidden md:flex my-3 ml-3 w-[72px] lg:w-[76px] shrink-0 flex-col items-center justify-between rounded-[26px] border border-white/28 backdrop-blur-2xl backdrop-saturate-150 py-4 text-white"
          >
            {/* Top Brand Emblem Circle */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => navigatePortal('login', 'login')}
                title="ORBITA Akademi · Halaman Login"
                className="no-ornament flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/30 bg-white/14 hover:bg-white/22 transition-colors cursor-pointer"
              >
                {activeLogo ? (
                  <img src={activeLogo} alt="ORBITA" className="h-7 w-7 rounded-full object-contain" />
                ) : (
                  <OrbitaMenuIcon variant="brand" className="h-5.5 w-5.5 text-white" />
                )}
              </button>
              <div className="h-px w-8 bg-white/20" />
            </div>

            {/* Center Icons: Login, Gallery Carousel & Tracer Study Portal Entry */}
            <LiquidNavBar
              orientation="vertical"
              embedded
              ariaLabel="Navigasi Portal Login"
              activeId={activePortalView}
              onSelect={id => {
                const nextView = id as 'login' | 'gallery' | 'tracer';
                navigatePortal(nextView, nextView);
              }}
              items={[
                {
                  id: 'login',
                  label: 'Login',
                  title: 'Gerbang Login & Overview ORBITA',
                  icon: <OrbitaMenuIcon variant="dashboard" className="h-5 w-5" />,
                },
                {
                  id: 'gallery',
                  label: 'Gallery',
                  title: 'Galeri Dokumentasi Kegiatan Sekolah (Carousel)',
                  icon: <OrbitaMenuIcon variant="gallery" className="h-5 w-5" />,
                  dot: publishedGalleryPhotos.length > 0,
                },
                {
                  id: 'tracer',
                  label: 'Tracer',
                  title: 'Portal Verifikasi NIS/NISN · Tracer Study & Rencana Lulus',
                  icon: <OrbitaMenuIcon variant="grading" className="h-5 w-5" />,
                  dot: pklTracers.length > 0,
                },
              ]}
            />

            {/* Bottom Verified Shield (Padlock Removed) */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-px w-8 bg-white/20" />
              <div
                className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/20 bg-white/10 text-white/85"
                title="Sistem Akademik Terintegrasi ORBITA"
              >
                <ShieldCheck className="h-4.5 w-4.5 text-white/90" />
              </div>
            </div>
          </aside>

          {/* Center Main Area */}
          <div className="relative z-10 flex flex-1 min-w-0 flex-col md:h-full overflow-hidden">
            {/* Fixed Top Header Row */}
            <div className="px-3 pt-3 pb-1.5 sm:px-7 sm:pt-5 lg:px-8 lg:pt-6 shrink-0">
              <div className="flex items-center justify-between gap-2.5 sm:gap-4 rounded-[20px] sm:rounded-[22px] border border-[#7468C4]/16 dark:border-[#8D81E3]/25 bg-[#F4F3FC]/82 dark:bg-[#1E1A3E]/86 px-3.5 py-2 sm:px-5 sm:py-2.5 backdrop-blur-xl shadow-[0_8px_24px_-6px_rgba(101,88,181,0.10)]">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="orbita-squircle-badge flex md:hidden h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[13px] border border-white/30 text-white shadow-sm">
                    {activeLogo ? (
                      <img src={activeLogo} alt="ORBITA" className="h-5.5 w-5.5 rounded-full object-contain" />
                    ) : (
                      <OrbitaMenuIcon variant="brand" className="h-4.5 w-4.5 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="block text-[10.5px] sm:text-xs font-semibold text-[#8A85A8] dark:text-indigo-300/80 truncate leading-tight">
                      {headerKicker}
                    </span>
                    <h1 className="text-[15px] sm:text-lg lg:text-[22px] font-extrabold text-[#3E385B] dark:text-white tracking-tight truncate leading-snug">
                      {headerTitle}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                  {isInTracerPortal && tracerStage !== 'verify' ? (
                    <button
                      type="button"
                      onClick={() => navigatePortal('login', 'login')}
                      className="no-ornament orbita-btn-coral inline-flex h-8.5 sm:h-9 items-center justify-center gap-1.5 rounded-full px-3 sm:px-4 text-xs font-extrabold text-white shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0 leading-none"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:inline">Kembali ke Login</span>
                      <span className="sm:hidden">Login</span>
                    </button>
                  ) : null}

                  <LiquidDigitalClock size="md" />
                  <ThemeFlipToggle showLabel hideLabelOnMobile size="md" />
                </div>
              </div>
            </div>

            {/* Scrollable Body Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 pb-6 pt-2 sm:px-7 sm:pb-7 lg:px-8 lg:pb-8 flex flex-col">
              {/* Interactive Mobile Quick-View Switcher (<768px) */}
              <div className="md:hidden mb-3.5 mt-0.5 shrink-0">
                <LiquidNavBar
                  pill
                  fullWidth
                  size="sm"
                  ariaLabel="Navigasi Portal Login Mobile"
                  activeId={mobileSection}
                  onSelect={id => {
                    const nextTab = id as 'login' | 'overview' | 'gallery' | 'tracer';
                    const nextView =
                      nextTab === 'tracer'
                        ? 'tracer'
                        : nextTab === 'gallery'
                        ? 'gallery'
                        : 'login';
                    navigatePortal(nextView, nextTab);
                  }}
                  items={[
                    { id: 'login', label: 'Login' },
                    { id: 'overview', label: 'Overview' },
                    {
                      id: 'gallery',
                      label: 'Gallery',
                      dot: publishedGalleryPhotos.length > 0,
                    },
                    { id: 'tracer', label: 'Tracer' },
                  ]}
                />
              </div>

              <div className="mx-auto md:my-auto w-full max-w-[1380px]">
                {/* GALLERY CAROUSEL PORTAL */}
                {isInGalleryPortal ? (
                  <div className="mx-auto w-full max-w-6xl pb-4">
                    <ActivityGalleryCarousel
                      photos={publishedGalleryPhotos}
                      settings={galleryViewSettings}
                    />
                  </div>
                ) : /* UNIFIED TRACER PORTAL */
                isInTracerPortal ? (
                  <div className="mx-auto w-full max-w-5xl pb-4">
                    <TracerStudyPortalForm
                      key="portal-tracer-unified"
                      source="login_portal"
                      autoRouteByIdentity
                      initialStage="verify"
                      hideOuterBackButton
                      onStageChange={setTracerStage}
                      onResolvedCategory={setResolvedTracerCategory}
                      onClose={() => navigatePortal('login', 'login')}
                    />
                  </div>
                ) : (
                  /* Main 12-Column Asymmetric Grid */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 xl:gap-8 items-start lg:items-center py-1 pb-4">
                    {/* LEFT 5 COLS: 3D FLIP-CARD (FRONT = LOGIN, BACK = REGISTER) */}
                    <div
                      className={`lg:col-span-5 w-full max-w-[440px] mx-auto pt-6 sm:pt-7 [perspective:1500px] ${
                        mobileSection === 'login' ? 'block' : 'hidden md:block'
                      }`}
                    >
                      <div
                        className={`relative w-full transition-transform duration-700 ease-[cubic-bezier(0.34,1.26,0.64,1)] [transform-style:preserve-3d] ${
                          isRegisterFlipped
                            ? '[transform:rotateY(180deg)]'
                            : '[transform:rotateY(0deg)]'
                        }`}
                      >
                        {/* ========================================================= */}
                        {/* FRONT FACE: LOGIN CARD                                    */}
                        {/* ========================================================= */}
                        <div
                          aria-hidden={isRegisterFlipped}
                          className={`w-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(0deg)] ${
                            isRegisterFlipped
                              ? 'absolute inset-x-0 top-0 z-10 pointer-events-none select-none'
                              : 'relative z-20 pointer-events-auto'
                          }`}
                        >
                          <OrbitaOrnateFrame
                            showTopCrest={true}
                            stampText="Portal Resmi"
                            characterIndex={0}
                            contentClassName="flex flex-col justify-between gap-4 sm:gap-5 px-5 pt-10 pb-6 sm:px-7 sm:pt-11 sm:pb-7"
                          >
                            {/* Top-Right Flip Trigger Pill on Front Card */}
                            <button
                              type="button"
                              onClick={() => {
                                setRegError(null);
                                setIsRegisterFlipped(true);
                              }}
                              title="Putar kartu ke halaman Registrasi Akun Baru"
                              className="no-ornament absolute top-3.5 right-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-[#DDD8F6] dark:border-[#8D81E3]/35 bg-[#F6F5FC] hover:bg-[#ECE8FA] dark:bg-[#251F52] dark:hover:bg-[#302868] px-3 py-1 text-[10.5px] font-extrabold text-[#5D51B2] dark:text-[#C8C0FF] shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              <RotateCw className="h-3 w-3" />
                              <span>Daftar Akun</span>
                            </button>

                            {/* Header inside White Card */}
                            <div className="text-center">
                              <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E385B] dark:text-white tracking-tight">
                                Masuk Akun ORBITA
                              </h2>
                              <p className="mt-1 text-xs font-medium text-[#A2A0B4] dark:text-slate-400 leading-relaxed">
                                Sistem Informasi Akademik, Presensi &amp; Evaluasi KKM
                              </p>
                            </div>

                            {/* Form */}
                            <div>
                              {loginSuccessBanner && (
                                <div className="mb-4 flex items-center gap-2.5 rounded-[16px] bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800/70 px-3.5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-fade-in">
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                  <span>{loginSuccessBanner}</span>
                                </div>
                              )}

                              {errorMessage && (
                                <div className="mb-4 flex items-center gap-2.5 rounded-[16px] bg-[#FFE4EC] border border-[#FFCCD9] dark:bg-rose-950/60 dark:border-rose-800/70 px-3.5 py-2.5 text-xs font-bold text-[#F25781] dark:text-rose-300 animate-fade-in">
                                  <AlertCircle className="h-4 w-4 shrink-0 text-[#F25781] dark:text-rose-400" />
                                  <span>{errorMessage}</span>
                                </div>
                              )}

                              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                                {/* Field 1: Email / NIP / NIS */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                                      Email / NIP / NIS
                                    </label>
                                    <span className="text-[10px] font-semibold text-[#A2A0B4] dark:text-slate-400">
                                      ID Pengguna
                                    </span>
                                  </div>

                                  <div
                                    className={`orbita-field-underline orbita-white-textfield relative flex items-center rounded-[16px] bg-[#F0F1F6] dark:bg-[#171434] border border-transparent dark:border-[#8D81E3]/28 px-4 py-1 transition-all focus-within:border-[#6C60B8]/50 dark:focus-within:border-[#9E92FF] focus-within:bg-white dark:focus-within:bg-[#1F1B44] focus-within:ring-2 focus-within:ring-[#6C60B8]/20 dark:focus-within:ring-[#8D81E3]/25 ${
                                      emailInvalid ? 'orbita-field-zigzag-error' : ''
                                    }`}
                                  >
                                    <User className="h-4 w-4 text-[#6C60B8] dark:text-[#A599F8] shrink-0 mr-2.5" />
                                    <input
                                      type="text"
                                      value={email}
                                      aria-invalid={emailInvalid || undefined}
                                      onChange={e => {
                                        setEmail(e.target.value);
                                        if (errorMessage) setErrorMessage(null);
                                      }}
                                      placeholder="Masukkan Email atau NIP/NIS..."
                                      autoComplete="username"
                                      className="no-ornament select-text w-full bg-transparent py-2.5 text-xs sm:text-sm font-semibold text-[#3E385B] dark:text-[#EAE8F6] caret-[#6C60B8] dark:caret-[#A79BFF] placeholder:text-[#A2A0B4] dark:placeholder:text-[#8E89B0] focus:outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Field 2: Password */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                                      Kata Sandi
                                    </label>
                                    <span className="text-[10px] font-semibold text-[#A2A0B4] dark:text-slate-400">
                                      Kredensial Akun
                                    </span>
                                  </div>

                                  <div
                                    className={`orbita-field-underline orbita-white-textfield relative flex items-center rounded-[16px] bg-[#F0F1F6] dark:bg-[#171434] border border-transparent dark:border-[#8D81E3]/28 px-4 py-1 transition-all focus-within:border-[#6C60B8]/50 dark:focus-within:border-[#9E92FF] focus-within:bg-white dark:focus-within:bg-[#1F1B44] focus-within:ring-2 focus-within:ring-[#6C60B8]/20 dark:focus-within:ring-[#8D81E3]/25 ${
                                      passwordInvalid ? 'orbita-field-zigzag-error' : ''
                                    }`}
                                  >
                                    <KeyRound className="h-4 w-4 text-[#6C60B8] dark:text-[#A599F8] shrink-0 mr-2.5" />
                                    <input
                                      type={showPassword ? 'text' : 'password'}
                                      value={password}
                                      aria-invalid={passwordInvalid || undefined}
                                      onChange={e => {
                                        setPassword(e.target.value);
                                        if (errorMessage) setErrorMessage(null);
                                      }}
                                      placeholder="••••••••"
                                      autoComplete="current-password"
                                      className="no-ornament select-text w-full bg-transparent pr-8 py-2.5 text-xs sm:text-sm font-semibold text-[#3E385B] dark:text-[#EAE8F6] caret-[#6C60B8] dark:caret-[#A79BFF] placeholder:text-[#A2A0B4] dark:placeholder:text-[#8E89B0] focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="no-ornament absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9694A8] hover:text-[#6C60B8] dark:text-[#9893B8] dark:hover:text-[#EAE8F6] cursor-pointer transition-colors"
                                      title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                                    >
                                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                  </div>
                                </div>

                                {/* Remember Me & Proportional Jadwal KBM Jump Button */}
                                <div className="flex items-center justify-between pt-1 text-xs">
                                  <label className="flex items-center gap-2 cursor-pointer group">
                                    <button
                                      type="button"
                                      role="checkbox"
                                      aria-checked={rememberMe}
                                      onClick={() => setRememberMe(!rememberMe)}
                                      className={`no-ornament flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
                                        rememberMe
                                          ? 'border-[#6C60B8] bg-[#6C60B8] text-white'
                                          : 'border-[#C6C4D6] bg-[#F0F1F6] dark:border-slate-600 dark:bg-slate-800 text-transparent group-hover:border-[#6C60B8]'
                                      }`}
                                    >
                                      <Check className="h-3 w-3 stroke-[3]" />
                                    </button>
                                    <span className="font-semibold text-[#3E385B] dark:text-slate-200">Ingat Sesi</span>
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const isMobileViewport =
                                        typeof window !== 'undefined' && window.innerWidth < 768;
                                      if (isMobileViewport) {
                                        switchOverviewSlide(1);
                                        setMobileSection('overview');
                                        return;
                                      }
                                      const nextSlide: 0 | 1 = overviewSlide === 1 ? 0 : 1;
                                      switchOverviewSlide(nextSlide);
                                    }}
                                    className="no-ornament inline-flex h-8 items-center justify-center gap-2 rounded-full bg-[#FFE4EC] hover:bg-[#FFD4E2] dark:bg-rose-950/70 dark:hover:bg-rose-900/80 px-3.5 text-xs font-extrabold text-[#F25781] dark:text-rose-300 transition-all cursor-pointer whitespace-nowrap shrink-0 leading-none"
                                  >
                                    <CalendarDays className="h-4 w-4 shrink-0 stroke-[2]" />
                                    <span className="md:hidden">Jadwal KBM</span>
                                    <span className="hidden md:inline">
                                      {overviewSlide === 1 ? 'Lihat Overview' : 'Jadwal KBM'}
                                    </span>
                                  </button>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-1.5">
                                  <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="no-ornament orbita-btn-violet group flex w-full items-center justify-between rounded-[18px] px-5 py-3.5 text-white hover:brightness-105 transition-all duration-200 disabled:opacity-60 cursor-pointer"
                                  >
                                    <span className="text-[11px] font-bold tracking-widest uppercase text-white/80">
                                      ORBITA
                                    </span>
                                    <span className="text-sm font-extrabold tracking-wide text-white">
                                      {isSubmitting ? 'Memverifikasi...' : 'Masuk Dashboard'}
                                    </span>
                                    <ChevronRight className="h-4.5 w-4.5 text-white transition-transform group-hover:translate-x-1" />
                                  </button>
                                </div>

                                {/* Flip to Register Prompt */}
                                <div className="pt-1 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRegError(null);
                                      setIsRegisterFlipped(true);
                                    }}
                                    className="no-ornament inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#6C60B8] hover:text-[#4F439C] dark:text-[#B5ABFF] dark:hover:text-white transition-colors cursor-pointer"
                                  >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    <span>Belum punya akun? Daftar Akun Baru</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </form>
                            </div>

                            {/* Clean Typographic Academic Footer — Synced Directly with Admin Academic Year */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pt-3.5 mt-1 border-t border-[#ECEBF6] dark:border-[#8D81E3]/20 text-[11.5px] leading-snug text-center sm:text-left">
                              <span className="font-semibold text-[#6E698C] dark:text-slate-300">
                                {schoolSettings?.curriculum || 'Kurikulum Merdeka'}
                              </span>
                              <span className="font-bold text-[#5D51B2] dark:text-indigo-300 tabular-nums whitespace-nowrap">
                                Tahun Pelajaran {activeAcademicYear?.name || '2025/2026'}
                                <span aria-hidden="true" className="mx-1.5 text-[#B8B3D6] dark:text-slate-500">
                                  &middot;
                                </span>
                                Semester {activeAcademicYear?.activeSemester === 'genap' ? 'Genap' : 'Ganjil'}
                              </span>
                            </div>
                          </OrbitaOrnateFrame>
                        </div>

                        {/* ========================================================= */}
                        {/* BACK FACE: REGISTER CARD (DI BALIK CARD LOGIN)            */}
                        {/* ========================================================= */}
                        <div
                          aria-hidden={!isRegisterFlipped}
                          className={`w-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] ${
                            isRegisterFlipped
                              ? 'relative z-20 pointer-events-auto'
                              : 'absolute inset-x-0 top-0 z-10 pointer-events-none select-none'
                          }`}
                        >
                          <OrbitaOrnateFrame
                            showTopCrest={true}
                            stampText="Registrasi Akun"
                            characterIndex={2}
                            contentClassName="flex flex-col justify-between gap-3.5 px-5 pt-10 pb-5 sm:px-7 sm:pt-11 sm:pb-6"
                          >
                            {/* Top-Right Flip Back to Login Pill */}
                            <button
                              type="button"
                              onClick={() => {
                                setRegError(null);
                                setIsRegisterFlipped(false);
                              }}
                              title="Putar kembali ke halaman Login"
                              className="no-ornament absolute top-3.5 right-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-[#FFCCD9] dark:border-rose-500/35 bg-[#FFE4EC] hover:bg-[#FFD4E2] dark:bg-rose-950/70 dark:hover:bg-rose-900/80 px-3 py-1 text-[10.5px] font-extrabold text-[#F25781] dark:text-rose-300 shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              <RotateCw className="h-3 w-3 -scale-x-100" />
                              <span>Ke Login</span>
                            </button>

                            {/* Header inside Back Card */}
                            <div className="text-center">
                              <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E385B] dark:text-white tracking-tight">
                                Daftar Akun ORBITA
                              </h2>
                              <p className="mt-0.5 text-xs font-medium text-[#A2A0B4] dark:text-slate-400 leading-relaxed">
                                Registrasi akun baru terintegrasi langsung ke database sekolah
                              </p>
                            </div>

                            {regError && (
                              <div className="flex items-center gap-2 rounded-[14px] bg-[#FFE4EC] border border-[#FFCCD9] dark:bg-rose-950/60 dark:border-rose-800/70 px-3 py-2 text-[11.5px] font-bold text-[#F25781] dark:text-rose-300 animate-fade-in">
                                <AlertCircle className="h-4 w-4 shrink-0 text-[#F25781] dark:text-rose-400" />
                                <span>{regError}</span>
                              </div>
                            )}

                            <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3">
                              {/* Role Selector Chips */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between px-1">
                                  <label className="text-[11px] font-bold text-[#3E385B] dark:text-slate-200">
                                    Pilih Peran Akun
                                  </label>
                                  <span className="text-[10px] font-semibold text-[#A2A0B4] dark:text-slate-400">
                                    Otorisasi Role
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {(
                                    [
                                      { id: 'siswa', label: 'Siswa' },
                                      { id: 'guru', label: 'Guru' },
                                      { id: 'wali_kelas', label: 'Wali Kls' },
                                      { id: 'admin', label: 'Admin' },
                                    ] as { id: UserRole; label: string }[]
                                  ).map(r => {
                                    const active = regRole === r.id;
                                    return (
                                      <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => {
                                          setRegRole(r.id);
                                          setRegError(null);
                                        }}
                                        className={`no-ornament rounded-[12px] py-1.5 px-2 text-[11px] font-extrabold transition-all cursor-pointer ${
                                          active
                                            ? 'bg-[#6C60B8] text-white shadow-xs'
                                            : 'bg-[#F0F1F6] text-[#5E5882] hover:bg-[#E5E3F3] dark:bg-[#171434] dark:text-slate-300 dark:hover:bg-[#231E4A]'
                                        }`}
                                      >
                                        {r.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Nama Lengkap */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between px-1">
                                  <label className="text-[11px] font-bold text-[#3E385B] dark:text-slate-200">
                                    Nama Lengkap
                                  </label>
                                  <span className="text-[10px] font-semibold text-[#A2A0B4] dark:text-slate-400">
                                    Sesuai Identitas
                                  </span>
                                </div>
                                <div className="orbita-field-underline orbita-white-textfield relative flex items-center rounded-[14px] bg-[#F0F1F6] dark:bg-[#171434] border border-transparent dark:border-[#8D81E3]/28 px-3.5 py-0.5 transition-all focus-within:border-[#6C60B8]/50 dark:focus-within:border-[#9E92FF] focus-within:bg-white dark:focus-within:bg-[#1F1B44]">
                                  <User className="h-3.5 w-3.5 text-[#6C60B8] dark:text-[#A599F8] shrink-0 mr-2" />
                                  <input
                                    type="text"
                                    value={regFullName}
                                    onChange={e => {
                                      setRegFullName(e.target.value);
                                      if (regError) setRegError(null);
                                    }}
                                    placeholder="Masukkan Nama Lengkap..."
                                    className="no-ornament select-text w-full bg-transparent py-2 text-xs font-semibold text-[#3E385B] dark:text-[#EAE8F6] placeholder:text-[#A2A0B4] dark:placeholder:text-[#8E89B0] focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* 2-Column Row: Email & NIS/NIP */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                  <label className="block px-1 text-[11px] font-bold text-[#3E385B] dark:text-slate-200">
                                    Email Aktif
                                  </label>
                                  <div className="orbita-field-underline orbita-white-textfield relative flex items-center rounded-[14px] bg-[#F0F1F6] dark:bg-[#171434] border border-transparent dark:border-[#8D81E3]/28 px-3 py-0.5 transition-all focus-within:border-[#6C60B8]/50 dark:focus-within:border-[#9E92FF] focus-within:bg-white dark:focus-within:bg-[#1F1B44]">
                                    <Mail className="h-3.5 w-3.5 text-[#6C60B8] dark:text-[#A599F8] shrink-0 mr-2" />
                                    <input
                                      type="email"
                                      value={regEmail}
                                      onChange={e => {
                                        setRegEmail(e.target.value);
                                        if (regError) setRegError(null);
                                      }}
                                      placeholder="nama@orbita.sch.id"
                                      className="no-ornament select-text w-full bg-transparent py-2 text-xs font-semibold text-[#3E385B] dark:text-[#EAE8F6] placeholder:text-[#A2A0B4] dark:placeholder:text-[#8E89B0] focus:outline-none"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="block px-1 text-[11px] font-bold text-[#3E385B] dark:text-slate-200">
                                    {regRole === 'siswa' ? 'NIS / NISN' : 'NIP / ID Pegawai'}
                                  </label>
                                  <div className="orbita-field-underline orbita-white-textfield relative flex items-center rounded-[14px] bg-[#F0F1F6] dark:bg-[#171434] border border-transparent dark:border-[#8D81E3]/28 px-3 py-0.5 transition-all focus-within:border-[#6C60B8]/50 dark:focus-within:border-[#9E92FF] focus-within:bg-white dark:focus-within:bg-[#1F1B44]">
                                    <Hash className="h-3.5 w-3.5 text-[#6C60B8] dark:text-[#A599F8] shrink-0 mr-2" />
                                    <input
                                      type="text"
                                      value={regNipOrNis}
                                      onChange={e => {
                                        setRegNipOrNis(e.target.value);
                                        if (regError) setRegError(null);
                                      }}
                                      placeholder={regRole === 'siswa' ? 'Contoh: 24251001' : 'Contoh: 198801...'}
                                      className="no-ornament select-text w-full bg-transparent py-2 text-xs font-semibold text-[#3E385B] dark:text-[#EAE8F6] placeholder:text-[#A2A0B4] dark:placeholder:text-[#8E89B0] focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Conditional Class / Subject Selector */}
                              {(regRole === 'siswa' || regRole === 'wali_kelas') && classes.length > 0 && (
                                <div className="space-y-1">
                                  <label className="block px-1 text-[11px] font-bold text-[#3E385B] dark:text-slate-200">
                                    {regRole === 'siswa' ? 'Kelas / Rombongan Belajar' : 'Kelas Perwalian'}
                                  </label>
                                  <div className="orbita-field-underline orbita-white-textfield relative flex items-center rounded-[14px] bg-[#F0F1F6] dark:bg-[#171434] border border-transparent dark:border-[#8D81E3]/28 px-3 py-0.5">
                                    <select
                                      value={regClassId || classes[0]?.id || ''}
                                      onChange={e => setRegClassId(e.target.value)}
                                      className="no-ornament w-full bg-transparent py-2 text-xs font-semibold text-[#3E385B] dark:text-[#EAE8F6] focus:outline-none cursor-pointer"
                                    >
                                      {classes.map(cls => (
                                        <option
                                          key={cls.id}
                                          value={cls.id}
                                          className="bg-white text-[#3E385B] dark:bg-[#171434] dark:text-slate-100"
                                        >
                                          Kelas {cls.name} ({cls.majorCode})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              )}

                              {regRole === 'guru' && subjects.length > 0 && (
                                <div className="space-y-1">
                                  <label className="block px-1 text-[11px] font-bold text-[#3E385B] dark:text-slate-200">
                                    Mata Pelajaran Ampuan
                                  </label>
                                  <div className="orbita-field-underline orbita-white-textfield relative flex items-center rounded-[14px] bg-[#F0F1F6] dark:bg-[#171434] border border-transparent dark:border-[#8D81E3]/28 px-3 py-0.5">
                                    <select
                                      value={regSubjectName || subjects[0]?.name || ''}
                                      onChange={e => setRegSubjectName(e.target.value)}
                                      className="no-ornament w-full bg-transparent py-2 text-xs font-semibold text-[#3E385B] dark:text-[#EAE8F6] focus:outline-none cursor-pointer"
                                    >
                                      {subjects.map(sub => (
                                        <option
                                          key={sub.id}
                                          value={sub.name}
                                          className="bg-white text-[#3E385B] dark:bg-[#171434] dark:text-slate-100"
                                        >
                                          {sub.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              )}

                              {/* 2-Column Row: Kata Sandi & Konfirmasi */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                  <label className="block px-1 text-[11px] font-bold text-[#3E385B] dark:text-slate-200">
                                    Kata Sandi
                                  </label>
                                  <div className="orbita-field-underline orbita-white-textfield relative flex items-center rounded-[14px] bg-[#F0F1F6] dark:bg-[#171434] border border-transparent dark:border-[#8D81E3]/28 px-3 py-0.5">
                                    <KeyRound className="h-3.5 w-3.5 text-[#6C60B8] dark:text-[#A599F8] shrink-0 mr-2" />
                                    <input
                                      type={showRegPassword ? 'text' : 'password'}
                                      value={regPassword}
                                      onChange={e => {
                                        setRegPassword(e.target.value);
                                        if (regError) setRegError(null);
                                      }}
                                      placeholder="Min. 4 karakter"
                                      className="no-ornament select-text w-full bg-transparent pr-6 py-2 text-xs font-semibold text-[#3E385B] dark:text-[#EAE8F6] placeholder:text-[#A2A0B4] dark:placeholder:text-[#8E89B0] focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowRegPassword(!showRegPassword)}
                                      className="no-ornament absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#9694A8] hover:text-[#6C60B8] cursor-pointer"
                                    >
                                      {showRegPassword ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="block px-1 text-[11px] font-bold text-[#3E385B] dark:text-slate-200">
                                    Ulangi Sandi
                                  </label>
                                  <div className="orbita-field-underline orbita-white-textfield relative flex items-center rounded-[14px] bg-[#F0F1F6] dark:bg-[#171434] border border-transparent dark:border-[#8D81E3]/28 px-3 py-0.5">
                                    <KeyRound className="h-3.5 w-3.5 text-[#6C60B8] dark:text-[#A599F8] shrink-0 mr-2" />
                                    <input
                                      type={showRegPassword ? 'text' : 'password'}
                                      value={regConfirmPassword}
                                      onChange={e => {
                                        setRegConfirmPassword(e.target.value);
                                        if (regError) setRegError(null);
                                      }}
                                      placeholder="Konfirmasi sandi"
                                      className="no-ornament select-text w-full bg-transparent py-2 text-xs font-semibold text-[#3E385B] dark:text-[#EAE8F6] placeholder:text-[#A2A0B4] dark:placeholder:text-[#8E89B0] focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Submit Register Button */}
                              <div className="pt-1">
                                <button
                                  type="submit"
                                  disabled={isRegSubmitting}
                                  className="no-ornament orbita-btn-violet group flex w-full items-center justify-between rounded-[16px] px-5 py-3 text-white hover:brightness-105 transition-all duration-200 disabled:opacity-60 cursor-pointer"
                                >
                                  <span className="text-[10.5px] font-bold tracking-widest uppercase text-white/80">
                                    REGISTRASI
                                  </span>
                                  <span className="text-xs sm:text-sm font-extrabold tracking-wide text-white">
                                    {isRegSubmitting ? 'Mendaftarkan...' : 'Daftar & Aktifkan Akun'}
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
                                </button>
                              </div>

                              {/* Flip Back to Login Prompt */}
                              <div className="pt-0.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRegError(null);
                                    setIsRegisterFlipped(false);
                                  }}
                                  className="no-ornament inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#F25781] hover:text-[#D43B65] dark:text-rose-300 dark:hover:text-rose-200 transition-colors cursor-pointer"
                                >
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                  <span>Sudah punya akun? Kembali ke Login</span>
                                </button>
                              </div>
                            </form>

                            {/* Academic Footer on Back Card */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-2.5 border-t border-[#ECEBF6] dark:border-[#8D81E3]/20 text-[11px] leading-snug text-center sm:text-left">
                              <span className="font-semibold text-[#6E698C] dark:text-slate-300">
                                Sinkronisasi Multi-Device
                              </span>
                              <span className="font-bold text-[#5D51B2] dark:text-indigo-300 tabular-nums whitespace-nowrap">
                                TP {activeAcademicYear?.name || '2025/2026'} &middot;{' '}
                                {activeAcademicYear?.activeSemester === 'genap' ? 'Genap' : 'Ganjil'}
                              </span>
                            </div>
                          </OrbitaOrnateFrame>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT 7 COLS: UNIFIED OVERVIEW + JADWAL KBM CAROUSEL */}
                    <div
                      className={`lg:col-span-7 w-full space-y-4 ${
                        mobileSection !== 'login' ? 'block' : 'hidden md:block'
                      }`}
                    >
                      {/* Carousel Header Switcher & Controls — Aligned with Gallery Toolbar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 rounded-[20px] sm:rounded-[22px] border border-[#DDD8F6]/70 dark:border-[#8D81E3]/25 bg-white/82 dark:bg-[#1B173D]/86 px-3.5 py-2.5 sm:px-4 sm:py-3 backdrop-blur-xl shadow-[0_8px_24px_-8px_rgba(101,88,181,0.12)]">
                        <div
                          role="tablist"
                          aria-label="Navigasi Overview dan Jadwal KBM"
                          className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0 sm:flex-wrap flex-1 min-w-0"
                        >
                          {[
                            { id: 'overview' as const, label: 'Overview Akademik', slide: 0 as const },
                            {
                              id: 'schedule' as const,
                              label: 'Jadwal KBM',
                              count: filteredSchedulesCount,
                              slide: 1 as const,
                            },
                          ].map(tab => {
                            const isSelected = overviewSlide === tab.slide;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                onClick={() => switchOverviewSlide(tab.slide)}
                                className={`no-ornament inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap leading-none ${
                                  isSelected
                                    ? 'orbita-btn-violet text-white shadow-sm'
                                    : 'border border-[#E4E2F2] bg-[#FAF9FE] text-[#5A537A] hover:bg-[#EFEBFB] dark:border-[#8D81E3]/25 dark:bg-[#231E4F]/70 dark:text-slate-200 dark:hover:bg-[#2E2866]'
                                }`}
                              >
                                <span>{tab.label}</span>
                                {typeof tab.count === 'number' && (
                                  <span
                                    className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-extrabold tabular-nums leading-none ${
                                      isSelected
                                        ? 'bg-white/20 text-white'
                                        : 'bg-[#ECE9F9] text-[#6C60B8] dark:bg-indigo-950/70 dark:text-indigo-300'
                                    }`}
                                  >
                                    {tab.count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0 border-t border-[#ECEBF5]/80 dark:border-[#8D81E3]/15 pt-2 sm:border-t-0 sm:pt-0">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => switchOverviewSlide(0)}
                              disabled={overviewSlide === 0}
                              aria-label="Slide Overview"
                              className="no-ornament inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#DDD8F6] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#231E4F]/80 text-[#5D51B2] dark:text-indigo-300 hover:bg-[#EFEBFB] dark:hover:bg-[#2D2664] disabled:opacity-40 cursor-pointer transition-all"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="min-w-[42px] text-center text-[11px] font-extrabold text-[#3E385B] dark:text-slate-200 tabular-nums">
                              {overviewSlide + 1} / 2
                            </span>
                            <button
                              type="button"
                              onClick={() => switchOverviewSlide(1)}
                              disabled={overviewSlide === 1}
                              aria-label="Slide Jadwal KBM"
                              className="no-ornament inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#DDD8F6] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#231E4F]/80 text-[#5D51B2] dark:text-indigo-300 hover:bg-[#EFEBFB] dark:hover:bg-[#2D2664] disabled:opacity-40 cursor-pointer transition-all"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Carousel Viewport */}
                      <div
                        className="overflow-hidden rounded-[28px]"
                        onTouchStart={e => {
                          overviewTouchStartXRef.current = e.touches[0]?.clientX ?? null;
                        }}
                        onTouchEnd={e => {
                          if (overviewTouchStartXRef.current === null) return;
                          const endX = e.changedTouches[0]?.clientX ?? overviewTouchStartXRef.current;
                          const delta = endX - overviewTouchStartXRef.current;
                          overviewTouchStartXRef.current = null;
                          if (delta > 50) switchOverviewSlide(0);
                          else if (delta < -50) switchOverviewSlide(1);
                        }}
                      >
                        <div
                          style={{ transform: `translateX(-${overviewSlide * 100}%)` }}
                          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] items-start"
                        >
                          {/* SLIDE 0: OVERVIEW BENTO + PROGRESS CARDS (LIVE INPUT DATA) */}
                          <div className="w-full shrink-0 space-y-4 pb-2">
                            <AccordionExpandAllBar
                              allExpanded={overviewAccordion.allExpanded}
                              onExpandAll={overviewAccordion.expandAll}
                              onCollapseAll={overviewAccordion.collapseAll}
                              title={`Panel Overview Real-Time (${selectedClassObj ? `Kelas ${selectedClassObj.name}` : 'Semua Rombel'})`}
                            />

                            <AccordionSection
                              title="Statistik Kehadiran & Jadwal Aktif"
                              subtitle={`${filteredSessions.length} sesi presensi · ${realTimeMetrics.attRecordsCount} entri tercatat · ${filteredSchedulesCount} sesi KBM`}
                              badge={`${realTimeMetrics.attPct}%`}
                              icon={<BarChart3 className="h-4 w-4" />}
                              open={overviewAccordion.isOpen('wave-card')}
                              onToggle={() => overviewAccordion.toggle('wave-card')}
                              className="!bg-transparent !border-[#DDD8F6]/70 dark:!border-slate-800"
                            >
                              {/* Top Row: Purple Overview Wave Card + Right Stacked Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch">
                                {/* Purple Overview Wave Card */}
                                <div
                                  className="orbita-hero-violet sm:col-span-7 relative rounded-[28px] p-5 text-white flex flex-col justify-between overflow-hidden"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-base font-extrabold text-white">Overview</span>
                                    <div className="flex items-center gap-1.5">
                                      <select
                                        value={selectedClassId}
                                        onChange={e => setSelectedClassId(e.target.value)}
                                        className="no-ornament rounded-full border border-white/30 bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[10.5px] font-bold text-white focus:outline-none cursor-pointer"
                                      >
                                        <option value="ALL" className="text-[#3E385B] bg-white dark:bg-[#171434] dark:text-slate-100">
                                          Semua Kelas
                                        </option>
                                        {classes.map(cls => (
                                          <option key={cls.id} value={cls.id} className="text-[#3E385B] bg-white dark:bg-[#171434] dark:text-slate-100">
                                            Kelas {cls.name}
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveMonthIdx(prev => (prev + 1) % loginWavePoints.length)
                                        }
                                        className="no-ornament rounded-full border border-white/30 bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[10.5px] font-semibold text-white transition-colors cursor-pointer"
                                      >
                                        {activeMonth}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="relative my-3 pt-4">
                                    <div
                                      className="pointer-events-none absolute top-0 bottom-6 w-10 -translate-x-1/2 rounded-t-full transition-all duration-300"
                                      style={{
                                        left: activeLoginLeftPct,
                                        background:
                                          'linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.02) 100%)',
                                      }}
                                    />
                                    <div
                                      style={{ left: activeLoginTooltipLeftPct }}
                                      className="pointer-events-none absolute top-0 z-20 flex items-center gap-2 -translate-x-1/2 transition-all duration-300"
                                    >
                                      <div className="rounded-[12px] bg-[#443C68] px-2.5 py-1 text-white shadow-lg border border-white/20 whitespace-nowrap">
                                        <span className="block text-[11px] font-extrabold leading-none tabular-nums">
                                          {activeLoginPoint?.val ?? 0}%
                                        </span>
                                        <span className="block text-[9px] text-white/80">
                                          {activeMonth} · {activeLoginPoint?.sessions ?? 0} sesi
                                        </span>
                                      </div>
                                    </div>

                                    <svg
                                      viewBox="0 0 420 95"
                                      fill="none"
                                      className="w-full h-20 overflow-visible"
                                      preserveAspectRatio="none"
                                    >
                                      <defs>
                                        <linearGradient id="loginWaveFill" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stopColor="#FF7597" stopOpacity="0.32" />
                                          <stop offset="100%" stopColor="#5D51B2" stopOpacity="0.0" />
                                        </linearGradient>
                                      </defs>
                                      <path d={loginWaveAreaPath} fill="url(#loginWaveFill)" />
                                      <path
                                        d={loginWaveLinePath}
                                        stroke="#FF7597"
                                        strokeWidth="2.8"
                                        strokeLinecap="round"
                                      />
                                      {loginWavePoints.map((pt, idx) => {
                                        const isSel = idx === activeMonthIdx;
                                        return (
                                          <g
                                            key={`${pt.month}-${idx}`}
                                            onClick={() => setActiveMonthIdx(idx)}
                                            onMouseEnter={() => setActiveMonthIdx(idx)}
                                            className="cursor-pointer"
                                          >
                                            <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                                            <circle
                                              cx={pt.x}
                                              cy={pt.y}
                                              r={isSel ? 6 : 3.4}
                                              fill={isSel ? '#FF6E96' : '#FFFFFF'}
                                              fillOpacity={isSel ? 1 : 0.7}
                                              stroke="#FFFFFF"
                                              strokeWidth={isSel ? 2.2 : 1.2}
                                            />
                                          </g>
                                        );
                                      })}
                                    </svg>

                                    <div className="mt-1 flex items-center justify-between text-[10px] text-white/70">
                                      {loginWavePoints.map((pt, idx) => (
                                        <button
                                          key={`${pt.month}-btn-${idx}`}
                                          type="button"
                                          onClick={() => setActiveMonthIdx(idx)}
                                          className={`no-ornament px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                                            idx === activeMonthIdx
                                              ? 'bg-white text-[#4E42A1] font-extrabold'
                                              : 'text-white/70 hover:text-white'
                                          }`}
                                        >
                                          {pt.month}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 items-center gap-1.5 pt-2 border-t border-white/12 text-center">
                                    <div>
                                      <span className="text-[9px] text-white/70 block">Populasi Siswa</span>
                                      <span className="text-sm font-extrabold text-white block tabular-nums">
                                        {filteredStudents.length}
                                      </span>
                                    </div>
                                    <div className="rounded-[16px] bg-white/14 border border-white/22 px-2 py-2">
                                      <span className="text-[9px] text-white/85 block">Kehadiran {activeMonth}</span>
                                      <span className="text-base font-black text-white block tabular-nums">
                                        {activeLoginPoint?.val ?? 0}%
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-white/70 block">Rombel</span>
                                      <span className="text-sm font-extrabold text-white block tabular-nums">
                                        {classes.length} Kls
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Stacked Purple & Pink-Coral Cards */}
                                <div className="sm:col-span-5 flex flex-col justify-between gap-4">
                                  <div
                                    className="orbita-card-indigo rounded-[24px] p-4 text-white flex items-center gap-3.5"
                                  >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/20 border border-white/30">
                                      <GenshinElementIcon element="anemo" className="h-5.5 w-5.5 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                      <h3 className="text-sm font-extrabold text-white truncate">
                                        Presensi Real-Time
                                      </h3>
                                      <p className="text-[11px] text-white/85 truncate tabular-nums">
                                        {filteredSessions.length} Sesi · {teachers.length} Guru Aktif
                                      </p>
                                    </div>
                                  </div>

                                  <div
                                    onClick={() => switchOverviewSlide(1)}
                                    className="orbita-card-coral group relative flex-1 rounded-[26px] p-4 text-white flex flex-col justify-between overflow-hidden cursor-pointer transition-transform hover:-translate-y-0.5"
                                  >
                                    <div className="flex items-center gap-3.5">
                                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/25 border border-white/35">
                                        <CalendarDays className="h-6 w-6 text-white stroke-[2]" />
                                      </div>
                                      <div className="min-w-0">
                                        <h3 className="text-sm font-extrabold text-white truncate">
                                          Jadwal Pelajaran
                                        </h3>
                                        <p className="text-[11px] text-white/85 truncate">
                                          Klik lihat daftar KBM
                                        </p>
                                      </div>
                                    </div>

                                    <div className="mt-4 flex items-end justify-between">
                                      <div>
                                        <span className="text-[10px] text-white/85 block">Total Sesi KBM</span>
                                        <span className="text-xl font-black text-white block leading-tight tabular-nums">
                                          {filteredSchedulesCount} Sesi
                                        </span>
                                      </div>
                                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 text-white group-hover:bg-white group-hover:text-[#F8658E] transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </AccordionSection>

                            <AccordionSection
                              title="Ringkasan Capaian Input Database"
                              subtitle="Rekap Presensi, Ketuntasan KKM & Tracer Study Terinput"
                              badge={`${realTimeMetrics.tracerTotalCount} Tracer`}
                              icon={<ShieldCheck className="h-4 w-4" />}
                              open={overviewAccordion.isOpen('bento-cards')}
                              onToggle={() => overviewAccordion.toggle('bento-cards')}
                              className="!bg-transparent !border-[#DDD8F6]/70 dark:!border-slate-800"
                            >
                              {/* Bottom Row: 3 Floating Progress Cards Synced with Real Database */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-5 pt-5">
                                {[
                                  {
                                    el: 'hydro' as const,
                                    title: 'Presensi Harian',
                                    sub: `${realTimeMetrics.attRecordsCount} Data Masuk`,
                                    pct: Math.round(realTimeMetrics.attPct),
                                    left: `${filteredStudents.length} siswa`,
                                    pill: 'Real-Time',
                                  },
                                  {
                                    el: 'electro' as const,
                                    title: 'Evaluasi & KKM',
                                    sub: `${realTimeMetrics.kkmScoresCount} Nilai Masuk`,
                                    pct: Math.round(realTimeMetrics.kkmPct),
                                    left: 'KKM >= 75',
                                    pill: 'Tuntas',
                                  },
                                  {
                                    el: 'anemo' as const,
                                    title: 'Tracer & Rencana Lulus',
                                    sub: `${realTimeMetrics.tracerTotalCount} Responden`,
                                    pct: Math.round(realTimeMetrics.tracerPct),
                                    left: `${alumniTracerCount} Alumni · ${grade12TracerCount} Kls 12`,
                                    pill: 'BKK Terpadu',
                                  },
                                ].map((c, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      boxShadow: '0 12px 28px -6px rgba(108, 96, 184, 0.08)',
                                    }}
                                    className="relative rounded-[24px] border border-[#F0F0F7] bg-white dark:border-[#8D81E3]/25 dark:bg-[#1E1A3E] px-4 pt-9 pb-4 text-[#3E385B] dark:text-slate-100"
                                  >
                                    <div className="orbita-squircle-badge absolute -top-5 left-1/2 -translate-x-1/2 flex h-11 w-11 items-center justify-center rounded-[16px] text-white">
                                      <GenshinElementIcon element={c.el} className="h-5 w-5" />
                                    </div>
                                    <div className="text-center">
                                      <h4 className="text-xs font-extrabold text-[#3E385B] dark:text-white">
                                        {c.title}
                                      </h4>
                                      <p className="text-[10px] text-[#A2A0B4] dark:text-slate-400 mt-0.5 tabular-nums">
                                        {c.sub}
                                      </p>
                                    </div>
                                    <div className="mt-3.5">
                                      <div className="flex justify-between text-[10px] font-bold text-[#3E385B] dark:text-slate-200 mb-1 tabular-nums">
                                        <span>Capaian</span>
                                        <span>{c.pct}%</span>
                                      </div>
                                      <div className="h-1.5 w-full rounded-full bg-[#F0F1F6] dark:bg-slate-800 overflow-hidden">
                                        <div
                                          className="h-full rounded-full bg-[#1CC865] transition-all duration-500"
                                          style={{ width: `${c.pct}%` }}
                                        />
                                      </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                      <span className="text-[10px] text-[#A2A0B4] dark:text-slate-400 truncate pr-1 tabular-nums">
                                        {c.left}
                                      </span>
                                      <span className="rounded-full bg-[#FFE4EC] dark:bg-rose-950/70 px-2.5 py-0.5 text-[9.5px] font-bold text-[#F25781] dark:text-rose-300 shrink-0">
                                        {c.pill}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionSection>
                          </div>

                          {/* SLIDE 1: JADWAL PELAJARAN KBM BOARD */}
                          <div className="w-full shrink-0 pt-7 pb-2">
                            <AcademyScheduleBoard maxHeightClass="max-h-[340px]" />
                          </div>
                        </div>
                      </div>

                      {/* Squeeze Line Carousel Indicator */}
                      <SqueezeLineIndicator
                        total={2}
                        activeIndex={overviewSlide}
                        direction={overviewSlideDir}
                        onSelect={idx => switchOverviewSlide(idx as 0 | 1)}
                        className="pt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog when leaving Portal Pengisian Tracer Study */}
      {pendingPortalExit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#42368E]/42 backdrop-blur-md animate-fade-in"
          onClick={e => {
            if (e.target === e.currentTarget) setPendingPortalExit(null);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-[28px] border border-[#7468C4]/30 bg-white/95 dark:border-[#9E92FF]/25 dark:bg-[#1E1A3E]/95 p-6 text-[#3E385B] dark:text-slate-100 shadow-[0_28px_68px_rgba(64,52,142,0.34)] backdrop-blur-2xl animate-wobble-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portal-exit-confirm-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E6E8F2] dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="orbita-btn-violet flex h-11 w-11 items-center justify-center rounded-[16px] text-white shadow-sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 id="portal-exit-confirm-title" className="text-base font-extrabold text-[#3E385B] dark:text-white">
                    {resolvedTracerCategory === 'kelas_12'
                      ? 'Keluar dari Halaman Siswa Kelas 12'
                      : resolvedTracerCategory === 'alumni'
                      ? 'Keluar dari Halaman Tracer Alumni'
                      : 'Keluar dari Portal Tracer Study'}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#8C88A4] dark:text-slate-400">
                    Konfirmasi Kembali ke Gerbang Login ORBITA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingPortalExit(null)}
                className="no-ornament rounded-full border border-[#E6E8F2] dark:border-slate-700 bg-[#F5F6FA] dark:bg-slate-800 p-1.5 text-[#6A6584] dark:text-slate-300 hover:bg-[#ECEEF7] hover:text-[#3E385B] dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="py-5 space-y-3.5">
              <div className="flex items-start gap-3 rounded-[18px] border border-[#FFE0E9] dark:border-rose-900/60 bg-[#FFF5F8] dark:bg-rose-950/40 p-3.5 text-xs">
                <AlertTriangle className="h-5 w-5 text-[#FF6E96] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#3E385B] dark:text-white">
                    Apakah Anda yakin ingin kembali ke halaman Login?
                  </p>
                  <p className="mt-1 text-[#6A6584] dark:text-slate-300">
                    {tracerStage === 'form'
                      ? 'Pengisian formulir yang belum dikirim akan dibatalkan dan Anda perlu memverifikasi NIS/NISN ulang jika ingin masuk kembali.'
                      : 'Sesi verifikasi NIS/NISN Anda pada halaman ini akan diakhiri.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#E6E8F2] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPendingPortalExit(null)}
                className="no-ornament inline-flex h-9 items-center justify-center rounded-full border border-[#E6E8F2] dark:border-slate-700 bg-[#F5F6FA] dark:bg-slate-800 px-4 text-xs font-bold text-[#6A6584] dark:text-slate-200 hover:bg-[#ECEEF7] hover:text-[#3E385B] dark:hover:bg-slate-700 dark:hover:text-white whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = pendingPortalExit;
                  setPendingPortalExit(null);
                  setTracerStage('verify');
                  setResolvedTracerCategory(null);
                  setActivePortalView(target.view);
                  setMobileSection(target.mobile);
                }}
                className="no-ornament orbita-btn-coral inline-flex h-9 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold text-white shadow-md hover:brightness-105 whitespace-nowrap shrink-0 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>Ya, Kembali ke Login</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

