import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Calendar,
  User,
  ChevronRight,
  Search,
} from 'lucide-react';
import { AcademyScheduleBoard } from '../common/AcademyScheduleBoard';
import { OrbitaOrnateFrame } from '../common/OrbitaOrnateFrame';
import { GenshinElementIcon, OrbitaMenuIcon, buildSmoothWavePath } from '../common/AcademyOrnaments';
import { AnimeBackground } from '../common/AnimeBackground';

export const LoginPage: React.FC = () => {
  const {
    loginWithEmail,
    visualSettings,
    schoolSettings,
    lessonSchedules = [],
    students = [],
    teachers = [],
    classes = [],
    attendanceSessions = [],
    attendanceRecords = [],
    assessmentScores = [],
    pklReports = [],
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [mobileSection, setMobileSection] = useState<'login' | 'overview' | 'schedule'>('login');
  const [activeMonthIdx, setActiveMonthIdx] = useState(3);
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  const activeLogo = visualSettings?.appLogoUrl || schoolSettings?.logoUrl || null;
  const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'];
  const activeMonth = monthsList[activeMonthIdx] || 'Apr';

  const filteredStudents = useMemo(() => {
    if (selectedClassId === 'ALL') return students;
    return students.filter(s => s.classId === selectedClassId || s.className === selectedClassId);
  }, [students, selectedClassId]);

  const filteredStudentIds = useMemo(
    () => new Set(filteredStudents.map(s => s.id)),
    [filteredStudents]
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

    const relPkl = pklReports.filter(p => filteredStudentIds.has(p.studentId));
    const pklDone = relPkl.filter(p => p.submissionStatus === 'sudah_dikumpulkan').length;
    const pklPct = relPkl.length > 0 ? Number(((pklDone / relPkl.length) * 100).toFixed(1)) : 0;

    return { attPct, kkmPct, pklPct };
  }, [attendanceRecords, assessmentScores, pklReports, filteredStudentIds]);

  const loginWavePoints = useMemo(() => {
    const rawValues = monthsList.map((m, idx) => {
      const mNum = idx + 1;
      const mSessions = attendanceSessions.filter(s => {
        if (selectedClassId !== 'ALL' && s.classId !== selectedClassId) return false;
        if (!s.date) return false;
        const d = new Date(s.date);
        return !isNaN(d.getTime()) && d.getMonth() + 1 === mNum;
      });
      const sIds = new Set(mSessions.map(s => s.id));
      const mRecs = attendanceRecords.filter(
        r => sIds.has(r.sessionId) && filteredStudentIds.has(r.studentId)
      );
      let val = realTimeMetrics.attPct;
      if (mRecs.length > 0) {
        const h = mRecs.filter(r => r.status === 'H' || r.status === 'T').length;
        val = Number(((h / mRecs.length) * 100).toFixed(1));
      } else if (classes.length > 0) {
        const cls = classes[idx % classes.length];
        const cStds = students.filter(s => s.classId === cls.id);
        const cIds = new Set(cStds.map(s => s.id));
        const cRecs = attendanceRecords.filter(r => cIds.has(r.studentId));
        if (cRecs.length > 0) {
          const h = cRecs.filter(r => r.status === 'H' || r.status === 'T').length;
          val = Number(((h / cRecs.length) * 100).toFixed(1));
        }
      }
      return {
        month: m,
        val,
      };
    });
    const minV = Math.min(...rawValues.map(r => r.val), 65);
    const maxV = Math.max(...rawValues.map(r => r.val), 100);
    const span = Math.max(8, maxV - minV);

    return rawValues.map((r, i) => {
      const x = Number(((i / (rawValues.length - 1)) * 390 + 15).toFixed(1));
      const norm = (r.val - minV) / span;
      const y = Number((74 - norm * 46).toFixed(1));
      return { x, y, month: r.month, val: r.val };
    });
  }, [
    attendanceSessions,
    attendanceRecords,
    classes,
    students,
    filteredStudentIds,
    selectedClassId,
    realTimeMetrics.attPct,
  ]);

  const activeLoginPoint = loginWavePoints[activeMonthIdx] || loginWavePoints[3];
  const loginWaveLinePath = useMemo(() => buildSmoothWavePath(loginWavePoints), [loginWavePoints]);
  const loginWaveAreaPath = useMemo(() => buildSmoothWavePath(loginWavePoints, 92), [loginWavePoints]);
  const activeLoginLeftPct = `${Number(((activeLoginPoint.x / 420) * 100).toFixed(1))}%`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
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

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-x-hidden p-0 sm:p-4 lg:p-6 font-sans text-[#3E385B] select-none">
      {/* Soft Cool Lavender-Slate Outer Backdrop */}
      <AnimeBackground />

      {/* Outer Frosted Tablet/Desktop Bezel Frame (Edge-to-Edge on Small Mobile) */}
      <div className="animate-login-reveal relative z-10 flex min-h-[100dvh] sm:min-h-[680px] w-full max-w-[1480px] overflow-hidden rounded-none sm:rounded-[34px] lg:rounded-[40px] border-0 sm:border sm:border-white/65 bg-transparent sm:bg-white/40 p-0 sm:p-2 lg:p-2.5 sm:shadow-[0_32px_80px_-12px_rgba(62,56,91,0.22)] sm:backdrop-blur-md">
        {/* Inner Crisp Snow-White Application Canvas */}
        <div className="relative flex w-full overflow-hidden rounded-none sm:rounded-[28px] lg:rounded-[32px] bg-[#F8F9FD]">
          {/* Left Floating Vertical Purple Pill Sidebar (Desktop & Landscape Tablet) */}
          <aside
            style={{
              background: 'linear-gradient(180deg, #7468C4 0%, #6558B5 100%)',
              boxShadow: '0 18px 38px -8px rgba(101, 88, 181, 0.42)',
            }}
            className="animate-stagger-1 hidden md:flex my-4 ml-4 w-[74px] shrink-0 flex-col items-center justify-between rounded-[28px] py-5 text-white"
          >
            {/* Top Brand Emblem Circle */}
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10">
              {activeLogo ? (
                <img src={activeLogo} alt="ORBITA" className="h-7 w-7 rounded-full object-contain" />
              ) : (
                <OrbitaMenuIcon variant="brand" className="h-5.5 w-5.5 text-white" />
              )}
            </div>

            {/* Center Icons: Operational View Toggles */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                title="Gerbang Login ORBITA"
                className={`no-ornament flex h-12 w-12 items-center justify-center rounded-[16px] transition-all duration-300 cursor-pointer ${
                  !showScheduleModal
                    ? 'bg-[#4B436B] text-white shadow-[0_10px_22px_rgba(45,38,76,0.38)] scale-105'
                    : 'text-white/80 hover:bg-white/15 hover:text-white hover:-translate-y-0.5'
                }`}
              >
                <OrbitaMenuIcon variant="dashboard" className="h-5.5 w-5.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                title="Jadwal Pelajaran KBM"
                className={`no-ornament flex h-12 w-12 items-center justify-center rounded-[16px] transition-all duration-300 cursor-pointer ${
                  showScheduleModal
                    ? 'bg-[#4B436B] text-white shadow-[0_10px_22px_rgba(45,38,76,0.38)] scale-105'
                    : 'text-white/80 hover:bg-white/15 hover:text-white hover:-translate-y-0.5'
                }`}
              >
                <OrbitaMenuIcon variant="attendance" className="h-5.5 w-5.5" />
              </button>
            </div>

            {/* Bottom Status Indicator */}
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] text-white/80" title="ORBITA Secure Portal">
              <Lock className="h-4.5 w-4.5 text-white/70" />
            </div>
          </aside>

          {/* Center Main Area */}
          <div className="flex flex-1 min-w-0 flex-col justify-between p-4 sm:p-7 lg:p-8 overflow-y-auto">
            {/* Top Header Row ("Primary / Portal Akademik" + Search Pill + Badge) */}
            <div className="animate-stagger-1 flex flex-wrap items-center justify-between gap-3 pb-4 sm:pb-6">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex md:hidden h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#6C60B8] text-white shadow-sm">
                  {activeLogo ? (
                    <img src={activeLogo} alt="ORBITA" className="h-6 w-6 rounded-full object-contain" />
                  ) : (
                    <OrbitaMenuIcon variant="brand" className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] sm:text-xs font-medium text-[#A2A0B4]">Primary</span>
                  <h1 className="text-lg sm:text-2xl font-extrabold text-[#3E385B] tracking-tight truncate">
                    ORBITA Akademi
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = !showScheduleModal;
                    setShowScheduleModal(next);
                    setMobileSection(next ? 'schedule' : 'login');
                  }}
                  className="no-ornament hidden sm:inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#EFEFF6] hover:bg-[#E4E2F5] px-4 text-xs font-semibold text-[#3E385B] transition-colors cursor-pointer whitespace-nowrap shrink-0 leading-none"
                >
                  <Search className="h-4 w-4 text-[#4A4368] shrink-0" />
                  <span>{showScheduleModal ? 'Kembali ke Login' : 'Cari Jadwal KBM...'}</span>
                </button>
                <div
                  title="Sistem Terverifikasi ORBITA"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6C60B8] text-white shadow-sm ring-2 ring-white"
                >
                  <Lock className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Interactive Mobile Quick-View Switcher (<768px) so phone users don't fight giant scroll stacks */}
            <div className="md:hidden grid grid-cols-3 gap-1.5 rounded-2xl bg-[#EAE9F4] p-1 mb-5">
              {[
                { id: 'login' as const, label: 'Masuk Akun' },
                { id: 'overview' as const, label: 'Statistik' },
                { id: 'schedule' as const, label: 'Jadwal KBM' },
              ].map(tabItem => {
                const isAct = mobileSection === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    type="button"
                    onClick={() => {
                      setMobileSection(tabItem.id);
                      setShowScheduleModal(tabItem.id === 'schedule');
                    }}
                    className={`no-ornament min-h-[40px] rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isAct
                        ? 'bg-[#6C60B8] text-white shadow-sm'
                        : 'text-[#6E6A86] hover:text-[#3E385B]'
                    }`}
                  >
                    {tabItem.label}
                  </button>
                );
              })}
            </div>

            {/* Main 12-Column Asymmetric Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center my-auto pb-4">
              {/* LEFT 5 COLS: CLEAN WHITE LOGIN CARD WITH FLOATING PURPLE SQUIRCLE BADGE */}
              <div
                className={`animate-stagger-2 lg:col-span-5 w-full max-w-[440px] mx-auto pt-4 ${
                  mobileSection === 'login' ? 'block' : 'hidden md:block'
                }`}
              >
                <OrbitaOrnateFrame
                  showTopCrest={true}
                  stampText="Portal Resmi"
                  characterIndex={0}
                  contentClassName="flex flex-col justify-between gap-5 px-5 pt-11 pb-6 sm:px-8 sm:pt-12 sm:pb-8"
                >
                  {/* Header inside White Card */}
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E385B] tracking-tight">
                      Masuk Akun ORBITA
                    </h2>
                    <p className="mt-1 text-xs font-medium text-[#A2A0B4] leading-relaxed">
                      Sistem Informasi Akademik, Presensi &amp; Evaluasi KKM
                    </p>
                  </div>

                  {/* Form */}
                  <div>
                    {errorMessage && (
                      <div className="mb-4 flex items-center gap-2.5 rounded-[16px] bg-[#FFE4EC] border border-[#FFCCD9] px-3.5 py-2.5 text-xs font-bold text-[#F25781] animate-fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0 text-[#F25781]" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Field 1: Email / NIP / NIS */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-xs font-bold text-[#3E385B]">
                            Email / NIP / NIS
                          </label>
                          <span className="text-[10px] font-semibold text-[#A2A0B4]">
                            ID Pengguna
                          </span>
                        </div>

                        <div className="relative flex items-center rounded-[16px] bg-[#F0F1F6] border border-transparent px-4 py-1 transition-all focus-within:border-[#6C60B8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#6C60B8]/20">
                          <User className="h-4 w-4 text-[#6C60B8] shrink-0 mr-2.5" />
                          <input
                            type="text"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Masukkan Email atau NIP/NIS..."
                            autoComplete="username"
                            className="w-full bg-transparent py-2.5 text-xs sm:text-sm font-semibold text-[#3E385B] placeholder:text-[#A2A0B4] focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Field 2: Password */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-xs font-bold text-[#3E385B]">
                            Kata Sandi
                          </label>
                          <span className="text-[10px] font-semibold text-[#A2A0B4]">
                            Terenkripsi
                          </span>
                        </div>

                        <div className="relative flex items-center rounded-[16px] bg-[#F0F1F6] border border-transparent px-4 py-1 transition-all focus-within:border-[#6C60B8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#6C60B8]/20">
                          <Lock className="h-4 w-4 text-[#6C60B8] shrink-0 mr-2.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="w-full bg-transparent pr-8 py-2.5 text-xs sm:text-sm font-semibold text-[#3E385B] placeholder:text-[#A2A0B4] focus:outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="no-ornament absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9694A8] hover:text-[#6C60B8] cursor-pointer transition-colors"
                            title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                          >
                            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me & Schedule Button */}
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
                                : 'border-[#C6C4D6] bg-[#F0F1F6] text-transparent group-hover:border-[#6C60B8]'
                            }`}
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                          </button>
                          <span className="font-semibold text-[#3E385B]">Ingat Sesi</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => setShowScheduleModal(!showScheduleModal)}
                          className="no-ornament inline-flex h-7 items-center justify-center gap-1.5 rounded-full bg-[#FFE4EC] hover:bg-[#FFD4E2] px-3 text-[11px] font-bold text-[#F25781] transition-all cursor-pointer whitespace-nowrap shrink-0 leading-none"
                        >
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{showScheduleModal ? 'Tutup Jadwal' : 'Jadwal KBM'}</span>
                        </button>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          style={{
                            background: 'linear-gradient(135deg, #7468C4 0%, #5D51B2 100%)',
                            boxShadow: '0 12px 26px -4px rgba(108, 96, 184, 0.42)',
                          }}
                          className="no-ornament group flex w-full items-center justify-between rounded-[18px] px-5 py-3.5 text-white hover:brightness-105 transition-all duration-200 disabled:opacity-60 cursor-pointer"
                        >
                          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                            ORBITA
                          </span>
                          <span className="text-sm font-extrabold tracking-wide text-white">
                            {isSubmitting ? 'Memverifikasi...' : 'Masuk Dashboard'}
                          </span>
                          <ChevronRight className="h-4.5 w-4.5 text-white transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Footer Pills */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#F0F1F6] text-[11px]">
                    <span className="font-medium text-[#A2A0B4]">
                      {schoolSettings?.curriculum || 'Kurikulum Merdeka'}
                    </span>
                    <span className="rounded-full bg-[#EFEFF9] px-3 py-0.5 text-[10px] font-bold text-[#6C60B8]">
                      Tahun Ajaran 2025/2026
                    </span>
                  </div>
                </OrbitaOrnateFrame>
              </div>

              {/* RIGHT 7 COLS: SCHEDULE BOARD OR OVERVIEW BENTO + PROGRESS CARDS */}
              <div
                className={`animate-stagger-3 lg:col-span-7 w-full ${
                  mobileSection !== 'login' ? 'block' : 'hidden md:block'
                }`}
              >
                {showScheduleModal || mobileSection === 'schedule' ? (
                  <div className="animate-fade-in pt-4">
                    <AcademyScheduleBoard
                      maxHeightClass="max-h-[360px]"
                      onClose={() => {
                        setShowScheduleModal(false);
                        setMobileSection('login');
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Top Row: Purple Overview Wave Card + Right Stacked Purple & Pink-Coral Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch">
                      {/* Purple Overview Wave Card */}
                      <div
                        style={{
                          background:
                            'linear-gradient(145deg, #7266C4 0%, #5D51B2 52%, #4B3FA0 100%)',
                          boxShadow: '0 20px 42px -8px rgba(93, 81, 178, 0.34)',
                        }}
                        className="sm:col-span-7 relative rounded-[28px] p-5 text-white flex flex-col justify-between overflow-hidden"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-base font-extrabold text-white">Overview</span>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={selectedClassId}
                              onChange={e => setSelectedClassId(e.target.value)}
                              className="rounded-full border border-white/30 bg-white/12 hover:bg-white/22 px-2.5 py-1 text-[10.5px] font-bold text-white focus:outline-none cursor-pointer"
                            >
                              <option value="ALL" className="text-[#3E385B]">
                                Semua Kelas
                              </option>
                              {classes.map(cls => (
                                <option key={cls.id} value={cls.id} className="text-[#3E385B]">
                                  Kelas {cls.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setActiveMonthIdx(prev => (prev + 1) % monthsList.length)}
                              className="no-ornament rounded-full border border-white/30 bg-white/12 hover:bg-white/22 px-2.5 py-1 text-[10.5px] font-semibold text-white transition-colors cursor-pointer"
                            >
                              {activeMonth} ⌄
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
                            style={{ left: activeLoginLeftPct }}
                            className="pointer-events-none absolute top-0 z-20 flex items-center gap-2 -translate-x-1/2 transition-all duration-300"
                          >
                            <div className="rounded-[12px] bg-[#443C68] px-2.5 py-1 text-white shadow-lg border border-white/20">
                              <span className="block text-[11px] font-extrabold leading-none tabular-nums">
                                {activeLoginPoint.val}%
                              </span>
                              <span className="block text-[9px] text-white/80">
                                Kehadiran ({activeMonth})
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
                                  key={pt.month}
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
                            {monthsList.map((m, idx) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setActiveMonthIdx(idx)}
                                className={`no-ornament px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                                  idx === activeMonthIdx
                                    ? 'bg-white text-[#4E42A1] font-extrabold'
                                    : 'text-white/70 hover:text-white'
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-1.5 pt-2 border-t border-white/12 text-center">
                          <div>
                            <span className="text-[9px] text-white/70 block">Populasi Siswa</span>
                            <span className="text-sm font-extrabold text-white block">
                              {filteredStudents.length}
                            </span>
                          </div>
                          <div className="rounded-[16px] bg-white/14 border border-white/22 px-2 py-2">
                            <span className="text-[9px] text-white/85 block">Kehadiran</span>
                            <span className="text-base font-black text-white block">
                              {activeLoginPoint.val}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-white/70 block">Rombel</span>
                            <span className="text-sm font-extrabold text-white block">
                              {classes.length} Kls
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Stacked Purple & Pink-Coral Cards */}
                      <div className="sm:col-span-5 flex flex-col justify-between gap-4">
                        <div
                          style={{
                            background: 'linear-gradient(135deg, #6E62BF 0%, #7D71CB 100%)',
                            boxShadow: '0 14px 28px -6px rgba(108, 96, 184, 0.28)',
                          }}
                          className="rounded-[24px] p-4 text-white flex items-center gap-3.5"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/20 border border-white/30">
                            <GenshinElementIcon element="anemo" className="h-5.5 w-5.5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-extrabold text-white truncate">
                              Presensi Real-Time
                            </h3>
                            <p className="text-[11px] text-white/80 truncate">
                              {teachers.length} Guru Pengajar Aktif
                            </p>
                          </div>
                        </div>

                        <div
                          onClick={() => setShowScheduleModal(true)}
                          style={{
                            background: 'linear-gradient(145deg, #FF88A8 0%, #F8658E 100%)',
                            boxShadow: '0 16px 32px -6px rgba(248, 101, 142, 0.32)',
                          }}
                          className="group relative flex-1 rounded-[26px] p-4 text-white flex flex-col justify-between overflow-hidden cursor-pointer transition-transform hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/25 border border-white/35">
                              <GenshinElementIcon
                                element="electro"
                                className="h-5.5 w-5.5 text-white"
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-extrabold text-white truncate">
                                Jadwal Pelajaran
                              </h3>
                              <p className="text-[11px] text-white/85 truncate">
                                Klik untuk lihat KBM
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-end justify-between">
                            <div>
                              <span className="text-[10px] text-white/85 block">Total Sesi KBM</span>
                              <span className="text-xl font-black text-white block leading-tight">
                                {lessonSchedules.length} Sesi
                              </span>
                            </div>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 text-white group-hover:bg-white group-hover:text-[#F8658E] transition-colors">
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: 3 White Floating Purple-Squircle Progress Cards Synced with Real Database */}
                    <div className="animate-stagger-4 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-5 pt-6">
                      {[
                        {
                          el: 'hydro' as const,
                          title: 'Presensi Harian',
                          sub: 'Rekapitulasi Kehadiran',
                          pct: Math.round(realTimeMetrics.attPct),
                          left: `${filteredStudents.length} siswa`,
                          pill: 'Real-Time',
                        },
                        {
                          el: 'electro' as const,
                          title: 'Evaluasi & KKM',
                          sub: 'Penilaian Akademik',
                          pct: Math.round(realTimeMetrics.kkmPct),
                          left: 'KKM >= 75',
                          pill: 'Tuntas',
                        },
                        {
                          el: 'anemo' as const,
                          title: 'Supervisi PKL',
                          sub: 'Monitoring Industri',
                          pct: Math.round(realTimeMetrics.pklPct),
                          left: `${classes.length} rombel`,
                          pill: 'Terverifikasi',
                        },
                      ].map((c, i) => (
                        <div
                          key={i}
                          style={{
                            boxShadow: '0 12px 28px -6px rgba(108, 96, 184, 0.08)',
                          }}
                          className="relative rounded-[24px] border border-[#F0F0F7] bg-white px-4 pt-9 pb-4 text-[#3E385B] transition-all duration-300"
                        >
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex h-11 w-11 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#7568C6] to-[#6356B5] text-white shadow-[0_8px_18px_rgba(108,96,184,0.34)]">
                            <GenshinElementIcon element={c.el} className="h-5 w-5" />
                          </div>
                          <div className="text-center">
                            <h4 className="text-xs font-extrabold text-[#3E385B]">{c.title}</h4>
                            <p className="text-[10px] text-[#A2A0B4] mt-0.5">{c.sub}</p>
                          </div>
                          <div className="mt-3.5">
                            <div className="flex justify-between text-[10px] font-bold text-[#3E385B] mb-1">
                              <span>Progress</span>
                              <span>{c.pct}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-[#F0F1F6] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#1CC865] transition-all duration-500"
                                style={{ width: `${c.pct}%` }}
                              />
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] text-[#A2A0B4]">{c.left}</span>
                            <span className="rounded-full bg-[#FFE4EC] px-2.5 py-0.5 text-[9.5px] font-bold text-[#F25781]">
                              {c.pill}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
