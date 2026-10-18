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
} from 'lucide-react';
import { loginWithGoogle } from '../../lib/firebase';
import { SkyborneCastleBackground } from '../common/SkyborneCastleBackground';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, loginWithRole, visualSettings } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0c1c3e] font-sans select-none flex items-center justify-center p-2 sm:p-4">
      {/* ==================================================================== */}
      {/* SKYBORNE ACADEMY CASTLE COURTYARD BACKGROUND (Controlled in Settings)*/}
      {/* ==================================================================== */}
      <SkyborneCastleBackground
        customBgUrl={visualSettings?.loginBgUrl}
        bgType={visualSettings?.loginBgType}
        livePreset={visualSettings?.loginLivePreset}
      />

      {/* Royal Ornamental Outer Viewport Frame (Gold & Navy Filigree) */}
      <div
        className="pointer-events-none fixed inset-2 sm:inset-3.5 z-10 rounded-2xl border-2 border-[#D4AF37]/75 shadow-[inset_0_0_0_2px_rgba(15,23,42,0.75),0_0_25px_rgba(0,0,0,0.45)]"
        aria-hidden="true"
      >
        <div className="absolute inset-1 rounded-xl border border-[#FDE68A]/35" />

        {/* Top Center Diamond Finial */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rotate-45 bg-[#FBBF24]" />
          <span className="h-3 w-3 rotate-45 border border-[#FFFBEB] bg-[#D4AF37] shadow-sm" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#FBBF24]" />
        </div>

        {/* Bottom Center Diamond Finial */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rotate-45 bg-[#FBBF24]" />
          <span className="h-3 w-3 rotate-45 border border-[#FFFBEB] bg-[#D4AF37] shadow-sm" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#FBBF24]" />
        </div>

        {/* 4 Baroque Corner Ornaments */}
        <div className="absolute -top-1 -left-1 h-6 w-6 border-t-2 border-l-2 border-[#FDE047] rounded-tl-md" />
        <div className="absolute -top-1 -right-1 h-6 w-6 border-t-2 border-r-2 border-[#FDE047] rounded-tr-md" />
        <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-2 border-l-2 border-[#FDE047] rounded-bl-md" />
        <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-2 border-r-2 border-[#FDE047] rounded-br-md" />
      </div>

      {/* ==================================================================== */}
      {/* CENTER LOGIN PORTAL CONTENT (MATCHING UPLOADED REFERENCE)            */}
      {/* ==================================================================== */}
      <div className="relative z-20 w-full max-w-[430px] mx-auto py-4 px-2 sm:px-0 flex flex-col items-center">
        {/* 1. HERALDIC ACADEMY CREST EMBLEM (Supports Custom App Logo Proportionally) */}
        <div className="relative flex flex-col items-center text-center mb-4">
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 flex items-center justify-center">
            {/* Ambient Dark & Gold Glow Behind Crest for Contrast Over Bright Sky */}
            <div className="absolute inset-1 rounded-full bg-[#0B1938]/55 blur-xl" />
            <div className="absolute inset-3 rounded-full bg-amber-400/25 blur-lg" />

            {visualSettings?.appLogoUrl ? (
              <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#0F1E3A]/95 to-[#091224]/95 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.65),inset_0_0_12px_rgba(250,204,21,0.2)]">
                <div className="pointer-events-none absolute inset-1 rounded-xl border border-[#FDE68A]/35" />
                <span className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs text-[#FDE047] drop-shadow">
                  ✦
                </span>
                <img
                  src={visualSettings.appLogoUrl}
                  alt="Logo Aplikasi"
                  className="max-h-full max-w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                />
                <span className="pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xs text-[#FDE047] drop-shadow">
                  ✦
                </span>
              </div>
            ) : (
              /* Custom Heraldic Crest SVG: 4-Point Star + Laurel Wreath + Shield + Open Book */
              <svg viewBox="0 0 140 150" className="relative h-full w-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">
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
                  strokeWidth="0.8"
                  opacity="0.45"
                />

                {/* Left & Right Laurel Wreath Branches */}
                <path
                  d="M 70 134 C 42 132 22 108 24 76 C 25 58 35 44 48 36"
                  fill="none"
                  stroke="url(#crestGold)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 70 134 C 98 132 118 108 116 76 C 115 58 105 44 92 36"
                  fill="none"
                  stroke="url(#crestGold)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {/* Laurel Leaves Left */}
                {[
                  { x: 26, y: 98, rot: -25 },
                  { x: 23, y: 82, rot: -10 },
                  { x: 26, y: 66, rot: 10 },
                  { x: 33, y: 52, rot: 25 },
                  { x: 43, y: 40, rot: 40 },
                ].map((lf, idx) => (
                  <ellipse
                    key={idx}
                    cx={lf.x}
                    cy={lf.y}
                    rx="6"
                    ry="2.8"
                    transform={`rotate(${lf.rot} ${lf.x} ${lf.y})`}
                    fill="url(#crestGold)"
                  />
                ))}
                {/* Laurel Leaves Right */}
                {[
                  { x: 114, y: 98, rot: 25 },
                  { x: 117, y: 82, rot: 10 },
                  { x: 114, y: 66, rot: -10 },
                  { x: 107, y: 52, rot: -25 },
                  { x: 97, y: 40, rot: -40 },
                ].map((lf, idx) => (
                  <ellipse
                    key={idx}
                    cx={lf.x}
                    cy={lf.y}
                    rx="6"
                    ry="2.8"
                    transform={`rotate(${lf.rot} ${lf.x} ${lf.y})`}
                    fill="url(#crestGold)"
                  />
                ))}

                {/* Heraldic Shield Base */}
                <path
                  d="M 38 46 L 102 46 L 102 84 C 102 108 86 124 70 132 C 54 124 38 108 38 84 Z"
                  fill="url(#shieldNavy)"
                  stroke="url(#crestGold)"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
                {/* Inner Shield Trim */}
                <path
                  d="M 43 51 L 97 51 L 97 83 C 97 103 83 117 70 125 C 57 117 43 103 43 83 Z"
                  fill="none"
                  stroke="url(#crestGold)"
                  strokeWidth="1"
                  opacity="0.7"
                />

                {/* Illuminated Open Book Inside Shield */}
                <path
                  d="M 49 72 Q 59 68 70 73 Q 81 68 91 72 L 91 98 Q 81 94 70 99 Q 59 94 49 98 Z"
                  fill="none"
                  stroke="url(#crestGold)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M 52 77 Q 61 74 70 78 M 52 84 Q 61 81 70 85 M 88 77 Q 79 74 70 78 M 88 84 Q 79 81 70 85"
                  stroke="url(#crestGold)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <line x1="70" y1="62" x2="70" y2="105" stroke="url(#crestGold)" strokeWidth="2.2" />

                {/* Radiant 4-Pointed North Star at the Crest Apex */}
                <path
                  d="M 70 4 L 75 24 L 95 29 L 75 34 L 70 54 L 65 34 L 45 29 L 65 24 Z"
                  fill="url(#crestGold)"
                />
                {/* Diagonal Star Flare Rays */}
                <line x1="58" y1="17" x2="82" y2="41" stroke="#FFFBEB" strokeWidth="1.5" />
                <line x1="82" y1="17" x2="58" y2="41" stroke="#FFFBEB" strokeWidth="1.5" />
                <circle cx="70" cy="29" r="4" fill="#FFFFFF" />
              </svg>
            )}
          </div>

          {/* ORBITA Title */}
          <h1
            className="text-2xl sm:text-[30px] font-extrabold tracking-[0.14em] uppercase leading-tight drop-shadow-[0_3px_12px_rgba(9,18,44,0.85)]"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF3C7 60%, #FDE68A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ORBITA
          </h1>

          {/* Subtitle: Sistem Informasi Akademik */}
          <div className="flex items-center justify-center gap-2.5 mt-1">
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-amber-200/80" />
            <p className="text-xs sm:text-[13px] font-semibold tracking-[0.12em] text-white drop-shadow-[0_2px_6px_rgba(9,18,44,0.9)]">
              Sistem Informasi Akademik
            </p>
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-amber-200/80" />
          </div>

          {/* Section Heading: Gerbang Masuk Akademi */}
          <h2
            className="mt-3.5 text-xl sm:text-[23px] font-bold tracking-wide drop-shadow-[0_3px_10px_rgba(9,18,44,0.9)]"
            style={{
              fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
              background: 'linear-gradient(180deg, #FFFBEB 0%, #FDE047 55%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Gerbang Masuk Akademi
          </h2>
          <p className="mt-1 text-xs sm:text-[13px] font-semibold text-white drop-shadow-[0_2px_6px_rgba(9,18,44,0.9)]">
            Akses ke seluruh fitur akademik dalam satu pintu.
          </p>
        </div>

        {/* ==================================================================== */}
        {/* 2. ORNATE PARCHMENT LOGIN CARD                                       */}
        {/* ==================================================================== */}
        <div
          className="relative w-full rounded-[26px] p-1 shadow-[0_22px_55px_rgba(8,20,48,0.65),0_0_0_1px_rgba(253,230,138,0.55)]"
          style={{
            background:
              'linear-gradient(180deg, rgba(254,243,199,0.9) 0%, rgba(217,179,110,0.85) 50%, rgba(254,243,199,0.9) 100%)',
          }}
        >
          {/* Top & Bottom Ornamental Gold Crest Accents on Card Edge */}
          <div className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] shadow-xs" />
            <span className="h-3.5 w-3.5 rotate-45 rounded-[2px] border border-[#FFFBEB] bg-gradient-to-br from-[#FDE047] to-[#D97706] shadow" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] shadow-xs" />
          </div>
          <div className="pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] shadow-xs" />
            <span className="h-3.5 w-3.5 rotate-45 rounded-[2px] border border-[#FFFBEB] bg-gradient-to-br from-[#FDE047] to-[#D97706] shadow" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] shadow-xs" />
          </div>

          {/* Inner Parchment Surface */}
          <div
            className="relative rounded-[22px] px-5 py-6 sm:px-7 sm:py-7 border border-[#E5D3B3]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,253,249,0.96) 0%, rgba(250,246,238,0.96) 55%, rgba(245,239,226,0.96) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Inner Gold Filigree Corner Brackets */}
            <div className="pointer-events-none absolute top-2.5 left-2.5 h-5 w-5 border-t-2 border-l-2 border-[#D4AF37]/70 rounded-tl-md" />
            <div className="pointer-events-none absolute top-2.5 right-2.5 h-5 w-5 border-t-2 border-r-2 border-[#D4AF37]/70 rounded-tr-md" />
            <div className="pointer-events-none absolute bottom-2.5 left-2.5 h-5 w-5 border-b-2 border-l-2 border-[#D4AF37]/70 rounded-bl-md" />
            <div className="pointer-events-none absolute bottom-2.5 right-2.5 h-5 w-5 border-b-2 border-r-2 border-[#D4AF37]/70 rounded-br-md" />

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Email Akun atau NIP/NIS */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-[#1E293B] mb-1.5">
                  Email Akun atau NIP/NIS
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contoh: kaito.41@gmail.com"
                    className="w-full rounded-xl border border-[#CBD5E1] bg-[#F1F5F9]/90 py-2.5 pl-10 pr-3.5 text-xs sm:text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] shadow-inner focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Field 2: Kata Sandi */}
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-[#1E293B] mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full rounded-xl border border-[#CBD5E1] bg-[#F1F5F9]/90 py-2.5 pl-10 pr-10 text-xs sm:text-[13px] font-medium text-[#0F172A] placeholder:text-[#94A3B8] shadow-inner focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                    title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Bantuan Akun */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#334155]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] accent-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                  />
                  <span>Ingat sesi masuk saya</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
                >
                  Bantuan Akun
                </button>
              </div>

              {/* Ornate Royal Blue & Gold Primary Button: MASUK GERBANG AKADEMI */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full rounded-2xl p-[2px] shadow-[0_6px_20px_rgba(37,99,235,0.38)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  style={{
                    background:
                      'linear-gradient(90deg, #D97706 0%, #FDE047 25%, #F59E0B 50%, #FDE047 75%, #D97706 100%)',
                  }}
                >
                  <div
                    className="relative flex items-center justify-center gap-2.5 rounded-[14px] py-3 px-4 overflow-hidden"
                    style={{
                      background:
                        'linear-gradient(90deg, #1D4ED8 0%, #2563EB 30%, #4338CA 70%, #5B21B6 100%)',
                    }}
                  >
                    {/* Subtle Top Gloss Highlight */}
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-25"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)',
                      }}
                    />

                    {/* Left & Right Ornamental Gold Dots */}
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] opacity-80" />

                    {/* Golden 8-Point Starburst Compass Icon */}
                    <svg className="h-4 w-4 text-[#FDE047] shrink-0 transition-transform duration-300 group-hover:rotate-45" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L14.2 8.2L21.5 6.5L16.5 12L21.5 17.5L14.2 15.8L12 23L9.8 15.8L2.5 17.5L7.5 12L2.5 6.5L9.8 8.2L12 1Z" />
                    </svg>

                    <span className="text-xs sm:text-[13px] font-extrabold uppercase tracking-[0.09em] text-white drop-shadow-xs">
                      {isSubmitting ? 'MEMBUKA GERBANG AKADEMI...' : 'MASUK GERBANG AKADEMI'}
                    </span>

                    <span className="h-1.5 w-1.5 rotate-45 bg-[#FDE047] opacity-80" />
                  </div>
                </button>
              </div>
            </form>

            {/* Divider: ATAU */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D6C7B2] to-[#D6C7B2]" />
              <span className="px-3 text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                ATAU
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#D6C7B2] to-[#D6C7B2]" />
            </div>

            {/* Google Workspace Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              type="button"
              className="group relative w-full flex items-center justify-between rounded-2xl border border-[#DFD2BC] bg-gradient-to-b from-white to-[#F7F3E8] px-4 py-2.5 text-xs sm:text-[13px] font-bold text-[#1E293B] shadow-xs hover:border-[#C8B493] hover:from-[#FFFDF9] hover:to-[#F1E9D8] transition-all cursor-pointer"
            >
              <span className="h-1.5 w-1.5 rotate-45 bg-[#D4AF37]/60" />
              <div className="flex items-center justify-center gap-2.5">
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
              <span className="h-1.5 w-1.5 rotate-45 bg-[#D4AF37]/60" />
            </button>

            {/* Philosophical Quote Footer Inside Card */}
            <div className="mt-5 pt-3 border-t border-[#E6DEC8]/70 text-center space-y-1">
              <p className="text-xs font-medium text-[#475569] leading-relaxed">
                Ilmu adalah cahaya,
                <br />
                yang akan selalu menuntun langkahmu.
              </p>
              <div className="flex items-center justify-center gap-1.5 pt-1 text-[#D4AF37]">
                <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
                <span className="text-[10px]">✦</span>
                <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
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
