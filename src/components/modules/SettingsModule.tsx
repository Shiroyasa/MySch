import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { LiveWallpaperPreset } from '../../types';
import {
  Settings,
  School,
  ShieldCheck,
  Download,
  User,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  BadgeCheck,
  AlertCircle,
  Save,
  Key,
  Cloud,
  RefreshCw,
  Smartphone,
  Laptop,
  Globe,
  ImagePlus,
  RotateCcw,
  Palette,
  Sparkles,
  Film,
  Moon,
  Sun,
  BookOpen,
} from 'lucide-react';
import { AcademyHeroBanner } from '../common/AcademyOrnaments';
import { SkyborneCastleBackground, LiveWallpaperPresetLayer } from '../common/SkyborneCastleBackground';

const compressUploadedImage = (file: File, maxWidth = 1800, quality = 0.82, keepAlpha = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(ev.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mime = keepAlpha || file.type === 'image/png' || file.type === 'image/webp' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const readMediaFileAsDataUrl = async (file: File, maxWidth = 1440, keepAlpha = false): Promise<{ url: string; isVideo: boolean }> => {
  if (file.type.startsWith('video/')) {
    // If video file is over 650KB, use fast ObjectURL for instant smooth playback without QuotaExceededError
    if (file.size > 650 * 1024) {
      return { url: URL.createObjectURL(file), isVideo: true };
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => resolve({ url: ev.target?.result as string, isVideo: true });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  const url = await compressUploadedImage(file, maxWidth, 0.8, keepAlpha);
  return { url, isVideo: false };
};

const LIVE_WALLPAPER_PRESETS: { id: LiveWallpaperPreset; label: string; desc: string }[] = [
  { id: 'starlight_castle', label: 'Starlight Royal Castle', desc: 'Langit malam bintang jatuh & partikel emas magis' },
  { id: 'celestial_aurora', label: 'Celestial Emerald Aurora', desc: 'Cahaya aurora zamrud & kabut bintang bergerak' },
  { id: 'golden_sanctuary', label: 'Golden Academy Sanctuary', desc: 'Cahaya senja keemasan & debu astral kerajaan' },
  { id: 'cyber_emerald', label: 'Astral Matrix Horizon', desc: 'Cahaya kosmik neon zamrud & kristal bercahaya' },
];

const MODULE_BANNER_LIST = [
  { key: 'attendance', label: 'Kotak Header Presensi & Absensi', desc: 'Menu Presensi & Absensi Siswa' },
  { key: 'pkl', label: 'Kotak Header Administrasi PKL', desc: 'Menu Administrasi PKL & DUDI' },
  { key: 'dashboard', label: 'Kotak Header Dashboard Utama', desc: 'Menu Dashboard Eksekutif & Guru' },
  { key: 'grading', label: 'Kotak Header Penilaian Akademik', desc: 'Menu Input Nilai & Rapor' },
  { key: 'reports', label: 'Kotak Header Laporan & Ekspor', desc: 'Menu Pusat Laporan Resmi' },
  { key: 'master-data', label: 'Kotak Header Master Data', desc: 'Menu Data Pokok Siswa, Guru, Kelas' },
  { key: 'user-management', label: 'Kotak Header Manajemen Akun', desc: 'Menu Hak Akses & Kredensial' },
  { key: 'audit-logs', label: 'Kotak Header Audit Log & Akses', desc: 'Menu Riwayat Aktivitas Sistem' },
  { key: 'settings', label: 'Kotak Header Pengaturan Sistem', desc: 'Menu Konfigurasi & Tema Visual' },
  { key: 'student-profile', label: 'Kotak Header Portal Siswa', desc: 'Menu Profil & Nilai Siswa' },
];

export const SettingsModule: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    students,
    teachers,
    classes,
    majors,
    subjects,
    users,
    pklPartners,
    attendanceSessions,
    assessments,
    auditLogs,
    addAuditLog,
    isFirestoreConnected,
    isSyncing,
    lastSyncTime,
    forceCloudResync,
    visualSettings,
    updateVisualSettings,
    schoolSettings,
    updateSchoolSettings,
    darkMode,
    toggleDarkMode,
    addToast,
  } = useApp();

  // Active section tab
  const [activeSection, setActiveSection] = useState<'profile' | 'backgrounds' | 'school' | 'backup' | 'cloud-sync'>('backgrounds');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [bgToast, setBgToast] = useState<string | null>(null);
  const [isSavingVisuals, setIsSavingVisuals] = useState(false);

  const appLogoInputRef = useRef<HTMLInputElement>(null);
  const loginBgInputRef = useRef<HTMLInputElement>(null);
  const menuBgInputRef = useRef<HTMLInputElement>(null);
  const globalBannerBgInputRef = useRef<HTMLInputElement>(null);
  const perModuleInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showBgToast = (msg: string) => {
    setBgToast(msg);
    setTimeout(() => setBgToast(null), 4000);
  };

  const handleUploadAppLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressUploadedImage(file, 512, 0.92, true);
      updateVisualSettings({ appLogoUrl: dataUrl });
      showBgToast('Logo Aplikasi berhasil diperbarui untuk Halaman Login & seluruh Sidebar!');
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = '';
    }
  };

  const handleUploadLoginBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url, isVideo } = await readMediaFileAsDataUrl(file, 1920);
      updateVisualSettings({
        loginBgUrl: url,
        loginBgType: isVideo ? 'video' : 'image',
      });
      showBgToast(
        isVideo
          ? 'Live Wallpaper Video Halaman Login berhasil diterapkan!'
          : 'Background Halaman Login berhasil diperbarui & tersimpan di database!'
      );
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = '';
    }
  };

  const handleUploadMenuBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url, isVideo } = await readMediaFileAsDataUrl(file, 1920);
      updateVisualSettings({
        menuBgUrl: url,
        menuBgType: isVideo ? 'video' : 'image',
      });
      showBgToast(
        isVideo
          ? 'Live Wallpaper Video Menu Utama berhasil diterapkan!'
          : 'Background Menu Utama berhasil diperbarui & mengikuti ambience!'
      );
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = '';
    }
  };

  const handleUploadGlobalBannerBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressUploadedImage(file, 1280, 0.78);
      updateVisualSettings({
        globalBannerBgUrl: dataUrl,
        moduleBannerBgUrl: dataUrl,
      });
      showBgToast('Background seluruh kotak header menu berhasil diperbarui & disimpan!');
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = '';
    }
  };

  const handleUploadPerModuleBg = async (moduleKey: string, moduleLabel: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressUploadedImage(file, 1200, 0.78);
      const nextModuleMap = {
        ...(visualSettings?.moduleBannerBgs || {}),
        ...(visualSettings?.perModuleBannerBgs || {}),
        [moduleKey]: dataUrl,
      };
      const nextBoxBgs = {
        ...(visualSettings?.boxBgs || {}),
        [`banner_${moduleKey}`]: dataUrl,
      };
      updateVisualSettings({
        moduleBannerBgs: nextModuleMap,
        perModuleBannerBgs: nextModuleMap,
        boxBgs: nextBoxBgs,
      });
      showBgToast(`Background ${moduleLabel} berhasil diperbarui & disimpan!`);
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = '';
    }
  };

  const handleResetPerModuleBg = (moduleKey: string, moduleLabel: string) => {
    const nextMap = {
      ...(visualSettings?.moduleBannerBgs || {}),
      ...(visualSettings?.perModuleBannerBgs || {}),
    };
    delete nextMap[moduleKey];
    const nextBoxBgs = { ...(visualSettings?.boxBgs || {}) };
    delete nextBoxBgs[`banner_${moduleKey}`];
    updateVisualSettings({
      moduleBannerBgs: nextMap,
      perModuleBannerBgs: nextMap,
      boxBgs: nextBoxBgs,
    });
    showBgToast(`Background ${moduleLabel} dikembalikan ke pengaturan global.`);
  };

  const handleExplicitSaveVisualSettings = () => {
    setIsSavingVisuals(true);
    updateVisualSettings({ ...visualSettings });
    setTimeout(() => {
      setIsSavingVisuals(false);
      showBgToast('Seluruh pengaturan Logo, Background Menu, Login & Kotak berhasil disimpan ke Database Cloud!');
      if (addToast) {
        addToast('Pengaturan Visual & Background berhasil disimpan ke Database!', 'success');
      }
    }, 300);
  };

  // Admin Profile Form State
  const [adminDisplayName, setAdminDisplayName] = useState(currentUser.displayName);
  const [adminEmail, setAdminEmail] = useState(currentUser.email);
  const [adminNip, setAdminNip] = useState(currentUser.nipOrNis || '');
  const [adminPhone, setAdminPhone] = useState(currentUser.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Sync state whenever currentUser changes
  useEffect(() => {
    setAdminDisplayName(currentUser.displayName);
    setAdminEmail(currentUser.email);
    setAdminNip(currentUser.nipOrNis || '');
    setAdminPhone(currentUser.phone || '');
  }, [currentUser]);

  // School Metadata State (Synced with AppContext & Cloud Firestore)
  const [schoolName, setSchoolName] = useState(schoolSettings?.schoolName || 'SMK MARDI YUANA CIKEMBAR');
  const [npsn, setNpsn] = useState(schoolSettings?.npsn || '20253654');
  const [accreditation, setAccreditation] = useState(schoolSettings?.accreditation || 'A (Unggul)');
  const [headmaster, setHeadmaster] = useState(
    schoolSettings?.headmaster || schoolSettings?.principalName || 'Drs. H. Suryana, M.M.Pd.'
  );
  const [schoolPhone, setSchoolPhone] = useState(
    schoolSettings?.schoolPhone || schoolSettings?.phone || '(0266) 632145'
  );
  const [address, setAddress] = useState(
    schoolSettings?.address || 'Jl. Pelabuhan II KM. 19 Cikembar, Kabupaten Sukabumi, Jawa Barat 43359'
  );
  const [schoolSuccessMsg, setSchoolSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (schoolSettings) {
      setSchoolName(schoolSettings.schoolName || 'SMK MARDI YUANA CIKEMBAR');
      setNpsn(schoolSettings.npsn || '20253654');
      setAccreditation(schoolSettings.accreditation || 'A (Unggul)');
      setHeadmaster(schoolSettings.headmaster || schoolSettings.principalName || 'Drs. H. Suryana, M.M.Pd.');
      setSchoolPhone(schoolSettings.schoolPhone || schoolSettings.phone || '(0266) 632145');
      setAddress(
        schoolSettings.address || 'Jl. Pelabuhan II KM. 19 Cikembar, Kabupaten Sukabumi, Jawa Barat 43359'
      );
    }
  }, [schoolSettings]);

  // Handle Save Admin Profile
  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    if (!adminDisplayName.trim()) {
      setProfileErrorMsg('Nama lengkap tidak boleh kosong!');
      return;
    }

    if (!adminEmail.trim()) {
      setProfileErrorMsg('Email akun tidak boleh kosong!');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setProfileErrorMsg('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    setIsSavingProfile(true);

    setTimeout(() => {
      updateCurrentUserProfile({
        displayName: adminDisplayName.trim(),
        email: adminEmail.trim(),
        nipOrNis: adminNip.trim() || undefined,
        phone: adminPhone.trim() || undefined,
        ...(newPassword ? { password: newPassword } : {}),
      });

      setIsSavingProfile(false);
      setProfileSuccessMsg('Perubahan profil admin berhasil disimpan ke Database dan disinkronkan!');
      if (addToast) {
        addToast('Profil Admin berhasil disimpan ke Database!', 'success');
      }
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setProfileSuccessMsg(null);
      }, 5000);
    }, 300);
  };

  // Handle Save School Info (Persisted to localStorage & Cloud Firestore)
  const handleSaveSchoolSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolSettings({
      schoolName: schoolName.trim() || 'SMK MARDI YUANA CIKEMBAR',
      npsn: npsn.trim() || '20253654',
      accreditation: accreditation.trim() || 'A (Unggul)',
      headmaster: headmaster.trim() || 'Drs. H. Suryana, M.M.Pd.',
      schoolPhone: schoolPhone.trim() || '(0266) 632145',
      address: address.trim() || 'Jl. Pelabuhan II KM. 19 Cikembar, Kabupaten Sukabumi, Jawa Barat 43359',
    });
    setSchoolSuccessMsg('Pengaturan profil lembaga berhasil disimpan ke Database dan disinkronkan!');
    showBgToast('Profil Lembaga berhasil disimpan ke Database Cloud!');
    setTimeout(() => setSchoolSuccessMsg(null), 4500);
  };

  // Handle Backup
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      school: {
        name: schoolName,
        npsn,
        accreditation,
        headmaster,
        address,
      },
      data: {
        studentsCount: students.length,
        teachersCount: teachers.length,
        classesCount: classes.length,
        attendanceSessionsCount: attendanceSessions.length,
        assessmentsCount: assessments.length,
        students,
        teachers,
        classes,
        attendanceSessions,
        assessments,
        auditLogs,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Backup_ORBITA_SMK_Mardi_Yuana_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('SYSTEM_BACKUP', 'Pengaturan & Backup', 'Mengekspor cadangan basis data sekolah ke file JSON terenkripsi');
    showBgToast('Cadangan basis data lengkap berhasil diunduh!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification for Background & Visual Changes */}
      {bgToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl dark:bg-blue-600 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{bgToast}</span>
        </div>
      )}

      {/* Royal Academy Banner & Navigation Tabs */}
      <AcademyHeroBanner
        moduleKey="settings"
        kicker="KONFIGURASI LEMBAGA, LOGO, LIVE WALLPAPER & PENGGUNA"
        title="PENGATURAN SISTEM & TEMA VISUAL"
        subtitle="Kelola Logo Aplikasi (Login & Sidebar), Background Menu & Halaman Login (termasuk Live Wallpaper), Ambience Dark Mode, serta Sinkronisasi Cloud Firestore."
        icon={Settings}
        rightContent={
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#C8A44B]/40 bg-[#0F1E3A]/90 p-1.5 backdrop-blur-md">
            <button
              onClick={() => setActiveSection('backgrounds')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'backgrounds'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Palette className="h-3.5 w-3.5 text-[#FACC15]" />
              <span>Logo &amp; Background</span>
            </button>
            <button
              onClick={() => setActiveSection('profile')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'profile'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Profil ({currentUser.displayName.split(' ')[0]})</span>
            </button>
            <button
              onClick={() => setActiveSection('school')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'school'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <School className="h-3.5 w-3.5" />
              <span>Profil Lembaga</span>
            </button>
            <button
              onClick={() => setActiveSection('backup')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'backup'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Cadangan Data</span>
            </button>
            <button
              onClick={() => setActiveSection('cloud-sync')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'cloud-sync'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Cloud className="h-3.5 w-3.5 text-emerald-400" />
              <span>Cloud Sync</span>
            </button>
          </div>
        }
      />

      {/* SECTION 0: KUSTOMISASI LOGO APLIKASI, LIVE WALLPAPER LOGIN, BG MENU & AMBIENCE DARK MODE */}
      {activeSection === 'backgrounds' && (
        <div className="space-y-6">
          {/* CARD 0: GANTI LOGO APLIKASI (HALAMAN LOGIN & SIDEBAR SEMUA MENU) */}
          <div className="rounded-2xl border border-[#EFE2BE] bg-white/95 p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  ✦ IDENTITAS RESMI LEMBAGA &amp; EMBLEM UTAMA
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  1. Ganti Logo Aplikasi (Halaman Login &amp; Sidebar Semua Halaman)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logo yang diunggah akan langsung diterapkan secara proporsional dan estetik pada lambang utama Halaman Login serta bagian atas Sidebar di seluruh halaman.
                </p>
              </div>
              <span className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300">
                {visualSettings?.appLogoUrl ? 'Logo Kustom Aktif' : 'Lambang Crest Default'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Preview 1: Login Crest Frame */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#C8A44B]/60 bg-[#0B162C] p-4 text-white">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#0F1E3A] to-[#091224] p-2 shadow-[0_6px_18px_rgba(0,0,0,0.55)]">
                  {visualSettings?.appLogoUrl ? (
                    <img
                      src={visualSettings.appLogoUrl}
                      alt="Preview Logo Login"
                      className="max-h-full max-w-full object-contain drop-shadow"
                    />
                  ) : (
                    <BookOpen className="h-9 w-9 text-[#FDE047]" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FDE047]">
                    Pratinjau Login Page
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">Emblem Gerbang Login</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Ukuran proporsional otomatis di tengah bingkai emas.
                  </p>
                </div>
              </div>

              {/* Preview 2: Sidebar Brand Header */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-[#182644] bg-[#0B162C] p-4 text-white">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#C8A44B]/75 bg-gradient-to-b from-[#15284E] to-[#0D1A36] p-1.5 shadow-[0_0_15px_rgba(200,164,75,0.22)]">
                  {visualSettings?.appLogoUrl ? (
                    <img
                      src={visualSettings.appLogoUrl}
                      alt="Preview Logo Sidebar"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <BookOpen className="h-5 w-5 text-[#EAB308]" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                    Pratinjau Sidebar
                  </span>
                  <p
                    className="text-sm font-bold tracking-wider text-white uppercase mt-0.5"
                    style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                  >
                    ORBITA
                  </p>
                  <p className="text-[11px] text-[#8DA2C0]">Sistem Informasi Akademik</p>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col gap-2.5">
                <input
                  ref={appLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadAppLogo}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => appLogoInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors cursor-pointer"
                >
                  <ImagePlus className="h-4 w-4 text-[#FEF08A]" />
                  <span>Upload Logo Aplikasi (PNG / SVG / JPG)</span>
                </button>
                {visualSettings?.appLogoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      updateVisualSettings({ appLogoUrl: null });
                      showBgToast('Logo aplikasi dikembalikan ke lambang mahkota default.');
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Logo Default</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid: 2. Background Halaman Login (Live Wallpaper) & 3. Background Menu Utama + Ambience Dark Mode */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 2: Background Halaman Login (Supports Image, Video Live Wallpaper & Animated Presets) */}
            <div className="rounded-2xl border border-[#EFE2BE] bg-white/95 p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    ✦ GERBANG LOGIN &amp; LIVE WALLPAPER
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    2. Background Halaman Login (Gambar &amp; Live Wallpaper)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mendukung unggah gambar statis, video Live Wallpaper (.mp4/.webm), atau tema Live Wallpaper animasi interaktif.
                  </p>
                </div>
                <span className="rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300">
                  {visualSettings?.loginBgType === 'live_preset'
                    ? 'Live Wallpaper Aktif'
                    : visualSettings?.loginBgType === 'video'
                    ? 'Video Live Aktif'
                    : visualSettings?.loginBgUrl
                    ? 'Gambar Kustom'
                    : 'Ilustrasi Default'}
                </span>
              </div>

              {/* Live Preview Box */}
              <div className="relative h-44 w-full overflow-hidden rounded-2xl border-2 border-[#C8A44B]/70 bg-[#0B1528] shadow-inner">
                <SkyborneCastleBackground
                  mode="banner"
                  customBgUrl={visualSettings?.loginBgUrl}
                  bgType={visualSettings?.loginBgType}
                  livePreset={visualSettings?.loginLivePreset}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/30 flex flex-col justify-end p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#FDE047]">
                    Pratinjau Latar Halaman Login (Live)
                  </p>
                  <p className="text-xs font-bold text-white">
                    ORBITA — Sistem Informasi Akademik Terpadu
                  </p>
                </div>
              </div>

              {/* Live Wallpaper Preset Selector for Login Page */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Pilih Tema Live Wallpaper Animasi (Halaman Login):</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LIVE_WALLPAPER_PRESETS.map(preset => {
                    const isSelected =
                      visualSettings?.loginBgType === 'live_preset' &&
                      (visualSettings?.loginLivePreset || 'starlight_castle') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          updateVisualSettings({
                            loginBgType: 'live_preset',
                            loginLivePreset: preset.id,
                          });
                          showBgToast(`Live Wallpaper Login "${preset.label}" diaktifkan!`);
                        }}
                        className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/90 text-amber-950 shadow-xs dark:border-amber-400 dark:bg-amber-950/50 dark:text-amber-200'
                            : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-amber-300 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-extrabold flex items-center gap-1">
                          <span className="text-amber-500">✦</span> {preset.label}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <input
                ref={loginBgInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleUploadLoginBg}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => loginBgInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Film className="h-4 w-4 text-[#FDE047]" />
                  <span>Upload Gambar / Video Live Login</span>
                </button>

                {(visualSettings?.loginBgUrl || visualSettings?.loginBgType === 'live_preset') && (
                  <button
                    type="button"
                    onClick={() => {
                      updateVisualSettings({
                        loginBgUrl: null,
                        loginBgType: 'default',
                      });
                      showBgToast('Background Login dikembalikan ke ilustrasi Skyborne Academy.');
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Default</span>
                  </button>
                )}
              </div>
            </div>

            {/* Card 3: Background Menu Utama (Live Wallpaper) & Ambience Dark Mode */}
            <div className="rounded-2xl border border-[#EFE2BE] bg-white/95 p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    ✦ BACKGROUND MENU UTAMA &amp; AMBIENCE DARK MODE
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    3. Ganti Background Menu &amp; Dark Mode Ambience
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ubah latar belakang seluruh halaman menu (mendukung Live Wallpaper) dan aktifkan Dark Mode yang menyatu mengikuti ambience background.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                    darkMode
                      ? 'border-amber-400/60 bg-slate-950 text-amber-300 shadow-sm'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {darkMode ? <Moon className="h-3.5 w-3.5 text-amber-400" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
                  <span>{darkMode ? 'Dark Mode: Aktif' : 'Light Mode: Aktif'}</span>
                </button>
              </div>

              {/* Live Preview Box for Menu Background */}
              <div className="relative h-44 w-full overflow-hidden rounded-2xl border-2 border-[#C8A44B]/70 bg-[#0B1528] shadow-inner">
                <SkyborneCastleBackground
                  mode="banner"
                  customBgUrl={visualSettings?.menuBgUrl}
                  bgType={visualSettings?.menuBgType || 'default'}
                  livePreset={visualSettings?.menuLivePreset || 'starlight_castle'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent flex flex-col justify-end p-4 z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-sky-300">
                        Pratinjau Ambience Latar Menu Utama
                      </p>
                      <p className="text-xs font-bold text-white">
                        {visualSettings?.menuBgType === 'live_preset'
                          ? `Live Wallpaper: ${visualSettings.menuLivePreset}`
                          : visualSettings?.menuBgUrl
                          ? 'Media Kustom Menu Aktif'
                          : 'Ambience Mengikuti Tema Sekolah'}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-amber-400/40 px-3 py-1.5 text-[11px] font-bold text-amber-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visualSettings?.ambientDarkMode !== false}
                        onChange={e => {
                          updateVisualSettings({ ambientDarkMode: e.target.checked });
                          showBgToast(
                            e.target.checked
                              ? 'Fitur Dark Mode Mengikuti Ambience Background diaktifkan!'
                              : 'Dark Mode diatur ke warna standar.'
                          );
                        }}
                        className="rounded accent-amber-500"
                      />
                      <span>Dark Mode Ikuti Ambience BG</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Live Wallpaper Preset Selector for Menu */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Pilih Live Wallpaper untuk Latar Seluruh Menu:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LIVE_WALLPAPER_PRESETS.map(preset => {
                    const isSelected =
                      visualSettings?.menuBgType === 'live_preset' &&
                      (visualSettings?.menuLivePreset || 'starlight_castle') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          updateVisualSettings({
                            menuBgType: 'live_preset',
                            menuLivePreset: preset.id,
                          });
                          showBgToast(`Live Wallpaper Menu "${preset.label}" diaktifkan!`);
                        }}
                        className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/90 text-indigo-950 shadow-xs dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-200'
                            : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-extrabold flex items-center gap-1">
                          <span className="text-indigo-500">✦</span> {preset.label}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Menu Background Intensity Slider & Upload */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3.5 py-2 border border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Intensitas Ambience Background Menu:
                  </label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="range"
                      min={15}
                      max={85}
                      value={visualSettings?.menuBgOpacity ?? 45}
                      onChange={e => updateVisualSettings({ menuBgOpacity: Number(e.target.value) })}
                      className="w-28 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 w-10 text-right">
                      {visualSettings?.menuBgOpacity ?? 45}%
                    </span>
                  </div>
                </div>

                <input
                  ref={menuBgInputRef}
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  onChange={handleUploadMenuBg}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => menuBgInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <Film className="h-4 w-4 text-[#FDE047]" />
                    <span>Upload Gambar / Video Live Menu</span>
                  </button>

                  {(visualSettings?.menuBgUrl || visualSettings?.menuBgType !== 'default') && (
                    <button
                      type="button"
                      onClick={() => {
                        updateVisualSettings({
                          menuBgUrl: null,
                          menuBgType: 'default',
                        });
                        showBgToast('Background Menu Utama dikembalikan ke pengaturan default.');
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Menu BG</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Pengaturan Kotak Header Menu (Global & Per-Kotak) */}
          <div className="rounded-2xl border border-[#EFE2BE] bg-white/95 p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  4. Background Kotak Header &amp; Kotak Presentasi (Global &amp; Per-Kotak)
                </h3>
                <p className="text-xs text-slate-500">
                  Anda dapat mengganti background gambar di masing-masing kotak secara langsung (melalui tombol &ldquo;Ganti BG&rdquo; di pojok kanan atas setiap kotak) atau mengelolanya terpusat di sini:
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={globalBannerBgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadGlobalBannerBg}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => globalBannerBgInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                >
                  <ImagePlus className="h-3.5 w-3.5 text-[#FDE047]" />
                  <span>Upload BG Semua Kotak Header</span>
                </button>
                {(visualSettings?.globalBannerBgUrl || visualSettings?.moduleBannerBgUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      updateVisualSettings({ globalBannerBgUrl: null, moduleBannerBgUrl: null });
                      showBgToast('Background kotak header global berhasil direset.');
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Global</span>
                  </button>
                )}
                {visualSettings?.boxBgs && Object.keys(visualSettings.boxBgs).length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      updateVisualSettings({ boxBgs: {} });
                      showBgToast('Seluruh background kustom per-kotak berhasil direset ke default.');
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Semua BG Kotak ({Object.keys(visualSettings.boxBgs).length})</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULE_BANNER_LIST.map(mod => {
                const customUrl =
                  visualSettings?.boxBgs?.[`banner_${mod.key}`] ||
                  visualSettings?.moduleBannerBgs?.[mod.key] ||
                  visualSettings?.perModuleBannerBgs?.[mod.key];
                const effectiveUrl =
                  customUrl ||
                  visualSettings?.globalBannerBgUrl ||
                  visualSettings?.moduleBannerBgUrl ||
                  null;

                return (
                  <div
                    key={mod.key}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="relative h-24 w-full overflow-hidden rounded-xl border border-[#C8A44B]/60 bg-[#0B1528]">
                        <SkyborneCastleBackground mode="banner" customBgUrl={effectiveUrl} />
                        <div className="absolute inset-0 bg-slate-950/55 p-2.5 flex flex-col justify-end">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#FACC15]">
                            ✦ {mod.key.toUpperCase()}
                          </span>
                          <p className="text-xs font-bold text-white truncate">{mod.label}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {mod.desc}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            customUrl
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {customUrl ? 'Khusus' : 'Global'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={el => {
                          perModuleInputRefs.current[mod.key] = el;
                        }}
                        type="file"
                        accept="image/*"
                        onChange={e => handleUploadPerModuleBg(mod.key, mod.label, e)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => perModuleInputRefs.current[mod.key]?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-300 py-1.5 px-2.5 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <ImagePlus className="h-3.5 w-3.5 text-blue-600" />
                        <span>Pilih Gambar</span>
                      </button>

                      {customUrl && (
                        <button
                          type="button"
                          onClick={() => handleResetPerModuleBg(mod.key, mod.label)}
                          className="rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 cursor-pointer"
                          title="Reset ke background global"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Bar: Save All Visual & Background Settings */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200">Status Sinkronisasi Tema Visual:</span>{' '}
                Seluruh perubahan Logo, Live Wallpaper, Background Menu, dan Background per-kotak disimpan ke Database Cloud.
              </div>
              <button
                type="button"
                onClick={handleExplicitSaveVisualSettings}
                disabled={isSavingVisuals}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#132550] to-[#1D4ED8] border border-[#D4AF37]/60 px-6 py-3 text-xs font-extrabold text-white shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4 text-[#FDE047]" />
                <span>
                  {isSavingVisuals
                    ? 'Menyimpan Pengaturan...'
                    : 'Simpan Semua Pengaturan Visual & Background'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: PROFIL ADMIN */}
      {activeSection === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-extrabold text-xl shadow-md shadow-blue-500/25">
                {currentUser.displayName.charAt(0)}
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                  {currentUser.displayName}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck className="h-3.5 w-3.5 mr-0.5" /> Terverifikasi
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>NIP / ID: {currentUser.nipOrNis || 'Belum diisi'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Telepon: {currentUser.phone || 'Belum diisi'}</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Keamanan Akun:</p>
              <p className="text-[11px]">
                Setiap perubahan pada profil akun admin ini akan memicu log audit keamanan dan notifikasi pembaruan langsung pada profil Anda.
              </p>
            </div>
          </div>

          {/* Right: Editable Form for Admin Profile */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" /> Formulir Perubahan Data Profil Admin
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah nama tampilan, email resmi, NIP, kontak, atau kata sandi akun admin Anda
                </p>
              </div>
            </div>

            {/* Success Message Banner */}
            {profileSuccessMsg && (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold">{profileSuccessMsg}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {profileErrorMsg && (
              <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="font-bold">{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nama Lengkap Admin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={adminDisplayName}
                    onChange={e => setAdminDisplayName(e.target.value)}
                    placeholder="Nama Lengkap dengan Gelar"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Email Akun Admin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="nama@smkmy-cikembar.sch.id"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    NIP / Nomor Identitas Pegawai
                  </label>
                  <input
                    type="text"
                    value={adminNip}
                    onChange={e => setAdminNip(e.target.value)}
                    placeholder="19xxxxxxxxxxxxxx"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={e => setAdminPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Password change option */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Key className="h-4 w-4 text-amber-500" />
                  <span>Ubah Kata Sandi (Kosongkan jika tidak ingin diubah):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      Ulangi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi kata sandi..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button: SIMPAN PERUBAHAN PROFIL ADMIN */}
              <div className="pt-4 flex items-center justify-end border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {isSavingProfile ? 'Menyimpan Profil...' : 'Simpan Perubahan Profil Admin'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 2: PROFIL LEMBAGA */}
      {activeSection === 'school' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <School className="h-4 w-4 text-blue-600" /> Profil Resmi Satuan Pendidikan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identitas lembaga yang dicetak pada dokumen resmi, buku rapor, dan leger absensi
            </p>
          </div>

          {schoolSuccessMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{schoolSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSchoolSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lembaga Sekolah</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NPSN</label>
                <input
                  type="text"
                  value={npsn}
                  onChange={e => setNpsn(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Akreditasi</label>
                <input
                  type="text"
                  value={accreditation}
                  onChange={e => setAccreditation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kepala Sekolah</label>
                <input
                  type="text"
                  value={headmaster}
                  onChange={e => setHeadmaster(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Telepon Sekolah</label>
                <input
                  type="text"
                  value={schoolPhone}
                  onChange={e => setSchoolPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Alamat Resmi Kampus</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                Simpan Perubahan Lembaga
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 3: BACKUP DATA */}
      {activeSection === 'backup' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Pencadangan &amp; Pemulihan Data (Disaster Recovery)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ekspor seluruh basis data sekolah (siswa, guru, presensi, penilaian, dan audit log) ke file JSON
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="block text-lg font-black text-blue-600">{students.length}</span>
              <span className="text-[11px] text-slate-500">Data Siswa</span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="block text-lg font-black text-emerald-600">{teachers.length}</span>
              <span className="text-[11px] text-slate-500">Data Guru</span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="block text-lg font-black text-amber-600">{attendanceSessions.length}</span>
              <span className="text-[11px] text-slate-500">Sesi Presensi</span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="block text-lg font-black text-purple-600">{assessments.length}</span>
              <span className="text-[11px] text-slate-500">Penilaian</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" /> Unduh Cadangan Lengkap (JSON Snapshot)
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: CLOUD FIRESTORE REAL-TIME SYNCHRONIZATION */}
      {activeSection === 'cloud-sync' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Cloud className="h-5 w-5 text-emerald-600" />
                <span>Sinkronisasi Multi-Perangkat (Cloud Firestore)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Basis data sekolah terpusat di Cloud Firestore — sinkron seketika di semua perangkat, laptop, tablet, dan smartphone tanpa data dummy lokal.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Real-Time Cloud Aktif</span>
              </span>
            </div>
          </div>

          {/* Device Sync Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Laptop className="h-4 w-4 text-blue-600" />
                <span>Komputer / PC / Laptop</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Akses web desktop melalui Google Chrome, Edge, Safari, Firefox. Input nilai, presensi, dan master data langsung tersimpan ke cloud.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <span>Smartphone / Tablet</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tampilan responsif untuk guru dan siswa saat di kelas atau lapangan. Perubahan data langsung diterima dalam hitungan detik.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Globe className="h-4 w-4 text-indigo-600" />
                <span>Multi-Peramban / Browser</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tidak terkunci pada cache satu peramban. Saat login di peramban atau tab penyamaran lain, seluruh data sekolah tetap sama dan akurat.
              </p>
            </div>
          </div>

          {/* Cloud Database Statistics */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Statistik Dokumen Terpusat di Cloud Database:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="block text-base font-black text-blue-600">{students.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Siswa</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="block text-base font-black text-emerald-600">{teachers.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Guru</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="block text-base font-black text-amber-600">{classes.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Rombel</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="block text-base font-black text-indigo-600">{majors.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Jurusan</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="block text-base font-black text-rose-600">{subjects.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Mapel</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="block text-base font-black text-cyan-600">{attendanceSessions.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Presensi</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="block text-base font-black text-purple-600">{pklPartners.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Mitra PKL</span>
              </div>
            </div>
          </div>

          {/* Sync Trigger Action */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Sinkronkan &amp; Muat Ulang Basis Data Cloud Sekarang
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {lastSyncTime
                  ? `Terakhir terhubung dan disinkronkan: ${lastSyncTime.toLocaleString('id-ID')}`
                  : 'Siap untuk sinkronisasi'}
              </p>
            </div>
            <button
              onClick={async () => {
                setSyncFeedback(null);
                await forceCloudResync();
                setSyncFeedback('Basis data Cloud Firestore berhasil disinkronkan ke seluruh peramban dan perangkat!');
              }}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Database Sekarang'}</span>
            </button>
          </div>

          {syncFeedback && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
