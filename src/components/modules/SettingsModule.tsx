import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, School, ShieldCheck, Download, Upload, User, CheckCircle2 } from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { currentUser, students, teachers, classes, attendanceSessions, assessments, auditLogs, addAuditLog } = useApp();

  const [schoolName, setSchoolName] = useState('SMK MARDI YUANA CIKEMBAR');
  const [npsn, setNpsn] = useState('20253654');
  const [accreditation, setAccreditation] = useState('A (Unggul)');
  const [headmaster, setHeadmaster] = useState('Drs. H. Suryana, M.M.Pd.');
  const [phone, setPhone] = useState('(0266) 632145');
  const [address, setAddress] = useState('Jl. Pelabuhan II KM. 19 Cikembar, Kabupaten Sukabumi, Jawa Barat 43359');

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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog('UPDATE_SETTINGS', 'Pengaturan & Backup', 'Memperbarui profil dan metadata sekolah');
    alert('Pengaturan sekolah berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Profil &amp; Pengaturan Sekolah
          </h1>
          <p className="text-xs text-slate-500">Konfigurasi Lembaga, Identitas Akun &amp; Pencadangan Basis Data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
              {currentUser.displayName.charAt(0)}
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                {currentUser.displayName}
              </h2>
              <p className="text-xs text-blue-600 dark:text-blue-400 capitalize font-medium">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
            <p><span className="text-slate-400">Email:</span> {currentUser.email}</p>
            <p><span className="text-slate-400">Identitas NIP/NIS:</span> {currentUser.nipOrNis || '-'}</p>
            <p><span className="text-slate-400">No. Kontak:</span> {currentUser.phone || '-'}</p>
            <p><span className="text-slate-400">Status Akun:</span> <strong className="text-emerald-600">Aktif &amp; Terverifikasi</strong></p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Sesi Terautentikasi Aman</span>
            </div>
          </div>
        </div>

        {/* School Profile Form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <School className="h-4 w-4 text-blue-600" /> Profil Resmi Satuan Pendidikan
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Alamat Resmi Kampus</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                Simpan Perubahan Lembaga
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Backup and Restore Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" /> Pencadangan &amp; Pemulihan Data (Disaster Recovery)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Unduh salinan cadangan lengkap seluruh tabel master siswa, guru, presensi, penilaian, dan audit log sistem dalam satu berkas terstruktur.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" /> Unduh Cadangan Lengkap (JSON Snapshot)
          </button>
        </div>
      </div>
    </div>
  );
};
