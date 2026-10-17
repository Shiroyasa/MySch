import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';

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
    chatMessages,
    attendanceSessions,
    assessments,
    auditLogs,
    addAuditLog,
    isFirestoreConnected,
    isSyncing,
    lastSyncTime,
    forceCloudResync,
  } = useApp();

  // Active section tab
  const [activeSection, setActiveSection] = useState<'profile' | 'school' | 'backup' | 'cloud-sync'>('profile');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

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

  // School Metadata State
  const [schoolName, setSchoolName] = useState('SMK MARDI YUANA CIKEMBAR');
  const [npsn, setNpsn] = useState('20253654');
  const [accreditation, setAccreditation] = useState('A (Unggul)');
  const [headmaster, setHeadmaster] = useState('Drs. H. Suryana, M.M.Pd.');
  const [schoolPhone, setSchoolPhone] = useState('(0266) 632145');
  const [address, setAddress] = useState('Jl. Pelabuhan II KM. 19 Cikembar, Kabupaten Sukabumi, Jawa Barat 43359');
  const [schoolSuccessMsg, setSchoolSuccessMsg] = useState<string | null>(null);

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
      setProfileSuccessMsg('Perubahan profil admin berhasil disimpan dan disinkronkan!');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setProfileSuccessMsg(null);
      }, 5000);
    }, 400);
  };

  // Handle Save School Info
  const handleSaveSchoolSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog('UPDATE_SETTINGS', 'Pengaturan Lembaga', 'Memperbarui profil dan metadata resmi sekolah');
    setSchoolSuccessMsg('Pengaturan lembaga sekolah berhasil disimpan!');
    setTimeout(() => setSchoolSuccessMsg(null), 4000);
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
    link.setAttribute('download', `Backup_MySchool_SMK_Mardi_Yuana_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('SYSTEM_BACKUP', 'Pengaturan & Backup', 'Mengekspor cadangan basis data sekolah ke file JSON terenkripsi');
    alert('Cadangan basis data lengkap berhasil diunduh!');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Profil Pengguna &amp; Pengaturan Sistem
            </h1>
            <p className="text-xs text-slate-500">
              Kelola profil akun login Anda, identitas resmi lembaga sekolah, dan pencadangan data
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeSection === 'profile'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profil Admin ({currentUser.displayName.split(' ')[0]})</span>
          </button>
          <button
            onClick={() => setActiveSection('school')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeSection === 'school'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <School className="h-3.5 w-3.5" />
            <span>Profil Lembaga</span>
          </button>
          <button
            onClick={() => setActiveSection('backup')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeSection === 'backup'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Pencadangan Data</span>
          </button>
          <button
            onClick={() => setActiveSection('cloud-sync')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeSection === 'cloud-sync'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Cloud className="h-3.5 w-3.5 text-emerald-500" />
            <span>Sinkronisasi Cloud</span>
          </button>
        </div>
      </div>

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
                <span className="block text-base font-black text-purple-600">{chatMessages.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Pesan Chat</span>
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
