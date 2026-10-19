import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  KeyRound,
  X,
  ChevronRight,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { loginWithGoogle } from '../../lib/firebase';
import { SkyborneCastleBackground } from '../common/SkyborneCastleBackground';
import { CelestialChronometer } from '../common/CelestialChronometer';
import { AcademyScheduleBoard } from '../common/AcademyScheduleBoard';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, loginWithRole, visualSettings, schoolSettings, lessonSchedules } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Mobile / Tablet Tab Switcher: 'login' (Gerbang Masuk) or 'schedule' (Jadwal & Jam)
  const [mobileTab, setMobileTab] = useState<'login' | 'schedule'>('login');

  const activeLogo = visualSettings?.appLogoUrl || schoolSettings?.logoUrl || null;
  const logoFitClass =
    visualSettings?.appLogoFit === 'cover'
      ? 'h-full w-full object-cover rounded-xl'
      : 'max-h-full max-w-full object-contain';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email atau NIP/NIS akun sekolah.');
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
        setErrorMessage('Email/NIP/NIS atau kata sandi tidak cocok. Klik "Bantuan Akun" untuk melihat akses kredensial.');
      }
    }, 350);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal masuk dengan akun Google Workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    setShowHelpModal(false);
    loginWithRole(role);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#0c1c3e] font-sans select-none flex flex-col items-center justify-center p-3 sm:p-5 lg:p-8">
      {/* ==================================================================== */}
      {/* SKYBORNE ACADEMY CASTLE COURTYARD BACKGROUND (Controlled in Settings)*/}
      {/* ==================================================================== */}
      <SkyborneCastleBackground
        customBgUrl={visualSettings?.loginBgUrl}
        bgType={visualSettings?.loginBgType}
        livePreset={visualSettings?.loginLivePreset}
      />

      {/* ==================================================================== */}
      {/* MAGICAL AMBIENT STARDUST MOTES & CELESTIAL RUNES                     */}
      {/* ==================================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {[
          { top: '8%', left: '12%', size: 'text-amber-300', rune: '✦', anim: 'animate-rune-twinkle', delay: '0s' },
          { top: '18%', right: '15%', size: 'text-cyan-300', rune: '✧', anim: 'animate-rune-twinkle', delay: '1.2s' },
          { top: '72%', left: '8%', size: 'text-amber-400', rune: '⋆', anim: 'animate-rune-twinkle', delay: '2.4s' },
          { top: '84%', right: '12%', size: 'text-purple-300', rune: '✦', anim: 'animate-rune-twinkle', delay: '0.8s' },
          { top: '42%', left: '5%', size: 'text-yellow-200', rune: '✵', anim: 'animate-rune-twinkle', delay: '1.8s' },
          { top: '60%', right: '7%', size: 'text-blue-300', rune: '✧', anim: 'animate-rune-twinkle', delay: '2.1s' },
          { top: '28%', left: '22%', size: 'text-emerald-300', rune: '⚝', anim: 'animate-rune-twinkle', delay: '3.1s' },
          { top: '35%', right: '25%', size: 'text-amber-200', rune: '☾', anim: 'animate-rune-twinkle', delay: '1.5s' },
          { top: '88%', left: '30%', size: 'text-cyan-200', rune: '☼', anim: 'animate-rune-twinkle', delay: '2.7s' },
          { top: '15%', right: '35%', size: 'text-yellow-300', rune: '✦', anim: 'animate-rune-twinkle', delay: '0.4s' },
        ].map((mote, i) => (
          <span
            key={i}
            className={`absolute ${mote.size} drop-shadow-[0_0_10px_currentColor] ${mote.anim}`}
            style={{
              top: mote.top,
              left: (mote as any).left,
              right: (mote as any).right,
              animationDelay: mote.delay,
            }}
          >
            {mote.rune}
          </span>
        ))}
      </div>

      {/* Royal Ornamental Outer Viewport Frame (Gold & Navy Filigree with Magical Glint & Mana Sweep) */}
      <div
        className="pointer-events-none fixed inset-2 sm:inset-3.5 z-10 rounded-2xl border-2 border-[#D4AF37]/85 shadow-[inset_0_0_0_2px_rgba(15,23,42,0.85),0_0_35px_rgba(212,175,55,0.45)] transition-all duration-700 overflow-hidden"
        aria-hidden="true"
      >
        {/* Subtle Inner Concentric Glow Border */}
        <div className="absolute inset-1 rounded-xl border border-[#FDE68A]/45 animate-pulse-glow" />

        {/* Sweeping Light Gleam along the viewport frame */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="h-full w-2/5 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent animate-glint-sweep" />
        </div>

        {/* Top Center Diamond Finial with Magical Shimmer & Multi-Tiered Twinkle */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 animate-astral-float">
          <span className="h-1.5 w-1.5 rotate-45 bg-[#FBBF24] shadow-[0_0_8px_#fde047] animate-rune-twinkle" />
          <span className="h-4 w-4 rotate-45 border-2 border-[#FFFBEB] bg-gradient-to-tr from-[#D4AF37] via-[#FDE047] to-[#FFFBEB] shadow-[0_0_16px_rgba(253,224,71,0.9)] animate-comet-pulse" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#FBBF24] shadow-[0_0_8px_#fde047] animate-rune-twinkle" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Bottom Center Diamond Finial with Magical Shimmer */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 animate-astral-float" style={{ animationDelay: '2.5s' }}>
          <span className="h-1.5 w-1.5 rotate-45 bg-[#FBBF24] shadow-[0_0_8px_#fde047] animate-rune-twinkle" />
          <span className="h-4 w-4 rotate-45 border-2 border-[#FFFBEB] bg-gradient-to-tr from-[#D4AF37] via-[#FDE047] to-[#FFFBEB] shadow-[0_0_16px_rgba(253,224,71,0.9)] animate-comet-pulse" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#FBBF24] shadow-[0_0_8px_#fde047] animate-rune-twinkle" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* 4 Baroque Corner Ornaments with Radiant Corner Starbursts & Glowing Runes */}
        <div className="absolute -top-1.5 -left-1.5 h-8 w-8 border-t-2 border-l-2 border-[#FDE047] rounded-tl-md shadow-[0_0_14px_rgba(253,224,71,0.9)]">
          <span className="absolute -top-1.5 -left-1.5 text-[11px] text-[#FDE047] drop-shadow-[0_0_8px_#fde047] animate-rune-twinkle">✦</span>
          <span className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-ping" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 h-8 w-8 border-t-2 border-r-2 border-[#FDE047] rounded-tr-md shadow-[0_0_14px_rgba(253,224,71,0.9)]">
          <span className="absolute -top-1.5 -right-1.5 text-[11px] text-[#FDE047] drop-shadow-[0_0_8px_#fde047] animate-rune-twinkle" style={{ animationDelay: '0.8s' }}>✦</span>
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-ping" />
        </div>
        <div className="absolute -bottom-1.5 -left-1.5 h-8 w-8 border-b-2 border-l-2 border-[#FDE047] rounded-bl-md shadow-[0_0_14px_rgba(253,224,71,0.9)]">
          <span className="absolute -bottom-1.5 -left-1.5 text-[11px] text-[#FDE047] drop-shadow-[0_0_8px_#fde047] animate-rune-twinkle" style={{ animationDelay: '1.6s' }}>✦</span>
          <span className="absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-ping" />
        </div>
        <div className="absolute -bottom-1.5 -right-1.5 h-8 w-8 border-b-2 border-r-2 border-[#FDE047] rounded-br-md shadow-[0_0_14px_rgba(253,224,71,0.9)]">
          <span className="absolute -bottom-1.5 -right-1.5 text-[11px] text-[#FDE047] drop-shadow-[0_0_8px_#fde047] animate-rune-twinkle" style={{ animationDelay: '2.4s' }}>✦</span>
          <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-ping" />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MOBILE / TABLET FLOATING UNBOXED CHRONOMETER (Outside the Login Box) */}
      {/* ==================================================================== */}
      <div className="relative z-20 mb-2 w-full max-w-[360px] lg:hidden flex flex-col items-center">
        {/* Unboxed Full Celestial Chronometer hovering outside the card */}
        <div className="scale-[0.80] sm:scale-90 origin-center -my-4 sm:-my-2">
          <CelestialChronometer />
        </div>

        {/* Sleek Unboxed Toggle Pill for Schedule Board */}
        <button
          type="button"
          onClick={() => setMobileTab(mobileTab === 'login' ? 'schedule' : 'login')}
          className="mt-1 flex items-center gap-2 rounded-full border border-[#D4AF37]/75 bg-[#0B1528]/90 px-4 py-1.5 text-xs font-bold text-amber-300 shadow-[0_0_18px_rgba(212,175,55,0.35)] backdrop-blur-md cursor-pointer hover:bg-amber-500/20 active:scale-95 transition-all"
        >
          {mobileTab === 'login' ? (
            <>
              <Calendar className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>Lihat Jadwal Pelajaran Akademi</span>
              <span className="rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[9px] font-mono text-amber-300 font-black">
                {(lessonSchedules || []).length}
              </span>
            </>
          ) : (
            <>
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span>Kembali ke Gerbang Masuk</span>
            </>
          )}
        </button>
      </div>

      {/* ==================================================================== */}
      {/* DUAL-WING BALANCED LAYOUT (Aesthetic & Proportional)                 */}
      {/* Left Wing: Observatory (Unboxed Clock + Live Schedule Board)        */}
      {/* Right Wing: Sacred Gate (Heraldic Crest + Parchment Login Card)     */}
      {/* ==================================================================== */}
      <div className="relative z-20 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8 my-auto">
        {/* ================================================================== */}
        {/* WING 1: UNBOXED CHRONOMETER & LIVE LESSON SCHEDULE BOARD           */}
        {/* Visible on Desktop, or when Mobile Tab === 'schedule'             */}
        {/* ================================================================== */}
        <div
          className={`w-full max-w-[500px] flex-col gap-4 ${
            mobileTab === 'schedule' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* 1. Real-time Celestial Chronometer: Completely Unboxed, Outside any container */}
          <div className="hidden lg:block">
            <CelestialChronometer />
          </div>

          {/* 2. Interactive Academic Lesson Schedule Board */}
          <AcademyScheduleBoard maxHeightClass="max-h-[350px]" />
        </div>

        {/* ================================================================== */}
        {/* WING 2: SACRED GATE LOGIN PORTAL                                   */}
        {/* Visible on Desktop, or when Mobile Tab === 'login'                */}
        {/* ================================================================== */}
        <div
          className={`w-full max-w-[440px] flex flex-col items-center ${
            mobileTab === 'login' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* 1. HERALDIC ACADEMY CREST EMBLEM (With Magical Astrolabe Rings & Radiant Rays) */}
          <div className="relative flex flex-col items-center text-center mb-3 animate-astral-float">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 flex items-center justify-center">
              {/* Magical Concentric Rotating Astrolabe Rings Behind Crest */}
              <div className="pointer-events-none absolute -inset-5 flex items-center justify-center animate-celestial-spin">
                <svg viewBox="0 0 160 160" className="h-full w-full drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="#FDE047"
                    strokeWidth="1.2"
                    strokeDasharray="8 6"
                    opacity="0.75"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="0.8"
                    opacity="0.45"
                  />
                  {/* 4 Cardinal Runes on Orbit */}
                  {[0, 90, 180, 270].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;
                    return (
                      <circle
                        key={i}
                        cx={80 + 72 * Math.cos(rad)}
                        cy={80 + 72 * Math.sin(rad)}
                        r="2.5"
                        fill="#FFFBEB"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Counter-rotating Inner Magic Seal */}
              <div className="pointer-events-none absolute -inset-2 flex items-center justify-center animate-celestial-spin-reverse">
                <svg viewBox="0 0 140 140" className="h-full w-full opacity-60">
                  <polygon
                    points="70,12 85,55 128,70 85,85 70,128 55,85 12,70 55,55"
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="0.7"
                    strokeDasharray="4 4"
                  />
                  <circle cx="70" cy="70" r="50" fill="none" stroke="#D97706" strokeWidth="0.8" />
                </svg>
              </div>

              {/* Radiating Sunburst Rays Breathing */}
              <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/20 via-yellow-300/30 to-blue-400/20 blur-xl animate-golden-rays" />
              <div className="absolute inset-1 rounded-full bg-[#0B1938]/70 blur-md" />

              {activeLogo ? (
                <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#0F1E3A]/95 to-[#091224]/95 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.65),0_0_20px_rgba(250,204,21,0.35)] animate-magical-glow">
                  <div className="pointer-events-none absolute inset-1 rounded-xl border border-[#FDE68A]/35" />
                  <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs text-[#FDE047] drop-shadow animate-rune-twinkle">
                    ✦
                  </span>
                  <img
                    src={activeLogo}
                    alt="Logo Aplikasi"
                    className={`${logoFitClass} drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]`}
                  />
                  <span className="pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xs text-[#FDE047] drop-shadow animate-rune-twinkle">
                    ✦
                  </span>
                </div>
              ) : (
                /* Custom Heraldic Crest SVG: 4-Point Star + Laurel Wreath + Shield + Open Book with Magic Glow */
                <svg viewBox="0 0 140 150" className="relative h-full w-full drop-shadow-[0_6px_20px_rgba(0,0,0,0.7)] animate-magical-glow">
                  <defs>
                    <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFBEB" />
                      <stop offset="30%" stopColor="#FDE047" />
                      <stop offset="70%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#FEF08A" />
                    </linearGradient>
                    <linearGradient id="shieldNavy" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1E3A8A" />
                      <stop offset="50%" stopColor="#0F172A" />
                      <stop offset="100%" stopColor="#090D16" />
                    </linearGradient>
                  </defs>

                  {/* Outer Celestial Ring */}
                  <circle
                    cx="70"
                    cy="82"
                    r="46"
                    fill="none"
                    stroke="url(#crestGold)"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                    opacity="0.85"
                  />
                  <circle
                    cx="70"
                    cy="82"
                    r="52"
                    fill="none"
                    stroke="url(#crestGold)"
                    strokeWidth="0.6"
                    opacity="0.5"
                  />

                  {/* Top 4-Point Star of Wisdom with Radiant Pulse */}
                  <g transform="translate(70, 22)">
                    <path
                      d="M 0 -14 L 3.5 -3.5 L 14 0 L 3.5 3.5 L 0 14 L -3.5 3.5 L -14 0 L -3.5 -3.5 Z"
                      fill="url(#crestGold)"
                      className="drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]"
                    />
                    <circle cx="0" cy="0" r="2.2" fill="#FFFBEB" />
                  </g>

                  {/* Royal Heraldic Shield Body */}
                  <path
                    d="M 40 56 Q 70 52 100 56 C 100 86 86 112 70 120 C 54 112 40 86 40 56 Z"
                    fill="url(#shieldNavy)"
                    stroke="url(#crestGold)"
                    strokeWidth="2.4"
                  />

                  {/* Inner Shield Gold Filigree Rim */}
                  <path
                    d="M 45 61 Q 70 58 95 61 C 95 86 83 107 70 114 C 57 107 45 86 45 61 Z"
                    fill="none"
                    stroke="url(#crestGold)"
                    strokeWidth="1"
                    opacity="0.8"
                  />

                  {/* Open Sacred Grimoire Book inside Shield */}
                  <path
                    d="M 52 82 Q 68 76 68 92 Q 52 92 52 82 Z"
                    fill="url(#crestGold)"
                    opacity="0.95"
                  />
                  <path
                    d="M 88 82 Q 72 76 72 92 Q 88 92 88 82 Z"
                    fill="url(#crestGold)"
                    opacity="0.95"
                  />
                  <line x1="70" y1="78" x2="70" y2="93" stroke="#FFFBEB" strokeWidth="1.5" />
                </svg>
              )}
            </div>

            {/* School Name & Kicker */}
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FDE047] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-1">
              {schoolSettings?.schoolName || 'SMK MARDI YUANA CIKEMBAR'}
            </p>
            <h2
              className="text-2xl sm:text-[26px] font-black tracking-wider text-white drop-shadow-[0_2px_8px_rgba(8,18,48,0.9)] mt-0.5"
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              }}
            >
              Gerbang Masuk Akademi
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-200 drop-shadow-[0_2px_6px_rgba(9,18,44,0.9)]">
              Akses ke seluruh fitur akademik &amp; administrasi dalam satu pintu.
            </p>
          </div>

          {/* ================================================================== */}
          {/* 2. ORNATE PARCHMENT LOGIN CARD WITH MAGICAL SHIMMER                */}
          {/* ================================================================== */}
          <div
            className="relative w-full rounded-[26px] p-[2.5px] shadow-[0_22px_55px_rgba(8,20,48,0.7),0_0_35px_rgba(212,175,55,0.4)] magical-shimmer-border"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #FDE047 0%, #D97706 20%, #3B82F6 40%, #A855F7 60%, #F59E0B 80%, #FDE047 100%)',
            }}
          >
            {/* Top & Bottom Ornamental Gold Crest Accents on Card Edge with Magical Pulse */}
            <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 animate-astral-float">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] shadow-[0_0_6px_#fde047] animate-rune-twinkle" />
              <span className="h-4 w-4 rotate-45 rounded-[2px] border border-[#FFFBEB] bg-gradient-to-br from-[#FFFBEB] via-[#FDE047] to-[#D97706] shadow-[0_0_14px_rgba(250,204,21,0.9)]" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] shadow-[0_0_6px_#fde047] animate-rune-twinkle" />
            </div>
            <div className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 animate-astral-float">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] shadow-[0_0_6px_#fde047] animate-rune-twinkle" />
              <span className="h-4 w-4 rotate-45 rounded-[2px] border border-[#FFFBEB] bg-gradient-to-br from-[#FFFBEB] via-[#FDE047] to-[#D97706] shadow-[0_0_14px_rgba(250,204,21,0.9)]" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] shadow-[0_0_6px_#fde047] animate-rune-twinkle" />
            </div>

            {/* Inner Parchment Surface */}
            <div
              className="relative rounded-[23px] px-5 py-5 sm:px-6 sm:py-6 border border-[#E5D3B3]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,253,249,0.98) 0%, rgba(250,246,238,0.97) 55%, rgba(245,239,226,0.98) 100%)',
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Inner Gold Filigree Corner Brackets with Magical Glow & Corner Rune Stars */}
              <div className="pointer-events-none absolute top-2.5 left-2.5 h-5 w-5 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-md shadow-[0_0_10px_rgba(250,204,21,0.7)]">
                <span className="absolute -top-2 -left-2 text-[10px] text-[#FDE047] drop-shadow-[0_0_6px_#fde047] animate-rune-twinkle">✦</span>
              </div>
              <div className="pointer-events-none absolute top-2.5 right-2.5 h-5 w-5 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-md shadow-[0_0_10px_rgba(250,204,21,0.7)]">
                <span className="absolute -top-2 -right-2 text-[10px] text-[#FDE047] drop-shadow-[0_0_6px_#fde047] animate-rune-twinkle" style={{ animationDelay: '0.9s' }}>✦</span>
              </div>
              <div className="pointer-events-none absolute bottom-2.5 left-2.5 h-5 w-5 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-md shadow-[0_0_10px_rgba(250,204,21,0.7)]">
                <span className="absolute -bottom-2 -left-2 text-[10px] text-[#FDE047] drop-shadow-[0_0_6px_#fde047] animate-rune-twinkle" style={{ animationDelay: '1.8s' }}>✦</span>
              </div>
              <div className="pointer-events-none absolute bottom-2.5 right-2.5 h-5 w-5 border-b-2 border-r-2 border-[#D4AF37] rounded-br-md shadow-[0_0_10px_rgba(250,204,21,0.7)]">
                <span className="absolute -bottom-2 -right-2 text-[10px] text-[#FDE047] drop-shadow-[0_0_6px_#fde047] animate-rune-twinkle" style={{ animationDelay: '2.7s' }}>✦</span>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Field 1: Email Akun atau NIP/NIS */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Email Akun atau NIP/NIS
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                    <input
                      type="text"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="contoh: kkaito447@gmail.com atau NIP"
                      className="w-full rounded-xl border border-[#CBD5E1] bg-[#F1F5F9]/90 py-2.5 pl-9 pr-3 text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] shadow-inner focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field 2: Kata Sandi */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full rounded-xl border border-[#CBD5E1] bg-[#F1F5F9]/90 py-2.5 pl-9 pr-9 text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] shadow-inner focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                      title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Bantuan Akun */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#334155]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-[#CBD5E1] text-[#2563EB] accent-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                    />
                    <span>Ingat sesi saya</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <KeyRound className="h-3 w-3 text-amber-500 animate-pulse" />
                    <span>Bantuan Akun</span>
                  </button>
                </div>

                {/* Ornate Royal Blue & Gold Primary Button: MASUK GERBANG AKADEMI */}
                <div className="pt-0.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full rounded-2xl p-[2.5px] shadow-[0_6px_25px_rgba(37,99,235,0.45)] transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_8px_32px_rgba(250,204,21,0.6)] active:scale-[0.99] disabled:opacity-60 cursor-pointer magical-shimmer-border overflow-hidden"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #D97706 0%, #FDE047 25%, #3B82F6 50%, #FDE047 75%, #D97706 100%)',
                    }}
                  >
                    <div
                      className="relative flex items-center justify-center gap-2 rounded-[14px] py-2.5 px-4 overflow-hidden"
                      style={{
                        background:
                          'linear-gradient(90deg, #1D4ED8 0%, #2563EB 30%, #4338CA 70%, #5B21B6 100%)',
                      }}
                    >
                      {/* Sweeping Light Glint Highlight across button */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="h-full w-2/5 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-glint-sweep" />
                      </div>

                      {/* Subtle Top Gloss Highlight */}
                      <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-25"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)',
                        }}
                      />

                      {/* Left & Right Ornamental Gold Dots with Pulse */}
                      <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] shadow-[0_0_6px_#fde047] opacity-90 animate-rune-twinkle" />

                      {/* Golden 8-Point Starburst Compass Icon with Spin Animation */}
                      <svg
                        className="h-4 w-4 text-[#FDE047] shrink-0 transition-transform duration-700 group-hover:rotate-180 animate-celestial-spin-slow drop-shadow-[0_0_10px_rgba(253,224,71,1)]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 1L14.2 8.2L21.5 6.5L16.5 12L21.5 17.5L14.2 15.8L12 23L9.8 15.8L2.5 17.5L7.5 12L2.5 6.5L9.8 8.2L12 1Z" />
                      </svg>

                      <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-[0.09em] text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                        {isSubmitting ? 'MEMBUKA GERBANG AKADEMI...' : 'MASUK GERBANG AKADEMI'}
                      </span>

                      <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] shadow-[0_0_6px_#fde047] opacity-90 animate-rune-twinkle" style={{ animationDelay: '1.2s' }} />
                    </div>
                  </button>
                </div>
              </form>

              {/* Divider: ATAU */}
              <div className="relative my-3.5 flex items-center justify-center">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D6C7B2] to-[#D6C7B2]" />
                <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  ATAU
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#D6C7B2] to-[#D6C7B2]" />
              </div>

              {/* Google Workspace Sign-In Button with Magical Border Glow */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                type="button"
                className="group relative w-full flex items-center justify-between rounded-xl border border-[#DFD2BC] bg-gradient-to-b from-white to-[#F7F3E8] px-3.5 py-2.5 text-xs font-bold text-[#1E293B] shadow-xs hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:from-[#FFFDF9] hover:to-[#F1E9D8] transition-all cursor-pointer"
              >
                <span className="h-1.5 w-1.5 rotate-45 bg-[#D4AF37] shadow-[0_0_6px_#d4af37] animate-rune-twinkle" />
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Login dengan Google Workspace</span>
                </div>
                <span className="h-1.5 w-1.5 rotate-45 bg-[#D4AF37] shadow-[0_0_6px_#d4af37] animate-rune-twinkle" style={{ animationDelay: '1.5s' }} />
              </button>

              {/* Philosophical Quote Footer Inside Card with Golden Twinkling Rune */}
              <div className="mt-4 pt-2.5 border-t border-[#E6DEC8]/70 text-center space-y-0.5">
                <p className="text-[11px] font-medium text-[#475569] leading-relaxed">
                  Ilmu adalah cahaya, yang akan selalu menuntun langkahmu.
                </p>
                <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[#D4AF37]">
                  <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
                  <span className="text-[10px] text-[#FDE047] drop-shadow-[0_0_6px_#fde047] animate-rune-twinkle">✦</span>
                  <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL BANTUAN AKUN & AKSES CEPAT MULTI-PERAN (DEMO / CREDENTIALS)    */}
      {/* ==================================================================== */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border-2 border-[#D4AF37]/70 bg-[#FAF6EE] p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5BE] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-amber-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Bantuan Akun &amp; Pintasan Masuk Akademi
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pilih salah satu peran di bawah ini untuk langsung masuk ke portal sesuai hak akses (RBAC), atau gunakan kredensial akun terdaftar:
            </p>

            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
              {[
                {
                  role: 'super_admin' as UserRole,
                  title: 'Super Admin (Grandmaster)',
                  desc: 'Akses penuh seluruh modul, PKL, RBAC & Audit Log',
                  emailHint: 'kkaito447@gmail.com',
                },
                {
                  role: 'admin' as UserRole,
                  title: 'Admin Tata Usaha',
                  desc: 'Manajemen Master Data, Rekap Presensi & DUDI PKL',
                  emailHint: 'admin@smkmy-cikembar.sch.id',
                },
                {
                  role: 'guru' as UserRole,
                  title: 'Guru Mata Pelajaran',
                  desc: 'Input Presensi Harian/Mapel, Penilaian & Supervisi PKL',
                  emailHint: 'budi.santoso@smkmy-cikembar.sch.id',
                },
                {
                  role: 'wali_kelas' as UserRole,
                  title: 'Wali Kelas Binaan',
                  desc: 'Leger Nilai, Draf Rapor Per Kelas & Verifikasi Koreksi',
                  emailHint: 'siti.aminah@smkmy-cikembar.sch.id',
                },
                {
                  role: 'kepala_sekolah' as UserRole,
                  title: 'Kepala Sekolah',
                  desc: 'Monitoring Eksekutif, Analisis Capaian & Laporan',
                  emailHint: 'kepsek@smkmy-cikembar.sch.id',
                },
                {
                  role: 'siswa' as UserRole,
                  title: 'Portal Siswa (Cadet)',
                  desc: 'Lihat Profil, Rapor Nilai, Presensi & Administrasi PKL',
                  emailHint: 'ahmad.rizky@siswa.smkmy.sch.id',
                },
              ].map(item => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickRoleLogin(item.role)}
                  className="flex items-center justify-between rounded-xl border border-[#DFD2BC] bg-white px-3.5 py-2.5 text-left hover:border-blue-500 hover:bg-blue-50/40 transition-all group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2D5BE] text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Autentikasi Terpadu My Academy
              </span>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
