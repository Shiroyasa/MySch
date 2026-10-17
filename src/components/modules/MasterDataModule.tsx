import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Teacher, ClassRoom, Major, Subject, AcademicYear } from '../../types';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  Calendar,
  Search,
  Plus,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Check,
  X,
  Filter,
  CheckCircle2,
  Gem,
  Crown,
  Castle,
  Swords,
  Scroll,
  Hourglass,
  Sparkles,
} from 'lucide-react';
import { exportToExcel } from '../../utils/exportUtils';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const MasterDataModule: React.FC = () => {
  const {
    students,
    teachers,
    classes,
    majors,
    subjects,
    academicYears,
    addStudent,
    updateStudent,
    archiveStudent,
    deleteStudent,
    importStudents,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addClass,
    updateClass,
    deleteClass,
    addSubject,
    updateSubject,
    deleteSubject,
    addMajor,
    updateMajor,
    deleteMajor,
    addAcademicYear,
    deleteAcademicYear,
    setActiveAcademicYear,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'classes' | 'majors' | 'subjects' | 'years'>('students');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // General Delete Modal State
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    onConfirm: () => {},
  });

  const closeDeleteModal = () => {
    setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // ==================== 1. STUDENT MODAL STATE ====================
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  const [sNisn, setSNisn] = useState('');
  const [sNis, setSNis] = useState('');
  const [sName, setSName] = useState('');
  const [sGender, setSGender] = useState<'L' | 'P'>('L');
  const [sClassId, setSClassId] = useState(classes[0]?.id || '');
  const [sAddress, setSAddress] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sParentName, setSParentName] = useState('');
  const [sParentPhone, setSParentPhone] = useState('');
  const [sPassword, setSPassword] = useState('siswa123');
  const [showSPassword, setShowSPassword] = useState(false);

  const openAddStudentModal = () => {
    setEditingStudent(null);
    setSNisn(`00${Math.floor(10000000 + Math.random() * 90000000)}`);
    setSNis(`2425${Math.floor(1000 + Math.random() * 9000)}`);
    setSName('');
    setSGender('L');
    setSClassId(classes[0]?.id || '');
    setSAddress('Cikembar, Sukabumi');
    setSPhone(''); // Tanpa hint nomor telepon
    setSParentName('');
    setSParentPhone(''); // Tanpa hint nomor telepon
    setSPassword('siswa123');
    setShowStudentModal(true);
  };

  const openEditStudentModal = (std: Student) => {
    setEditingStudent(std);
    setSNisn(std.nisn);
    setSNis(std.nis);
    setSName(std.fullName);
    setSGender(std.gender);
    setSClassId(std.classId);
    setSAddress(std.address);
    setSPhone(std.phone || '');
    setSParentName(std.parentName);
    setSParentPhone(std.parentPhone || '');
    setSPassword(std.password || 'siswa123');
    setShowStudentModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sNisn.trim()) return;
    const targetClass = classes.find(c => c.id === sClassId) || classes[0];

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        nisn: sNisn,
        nis: sNis,
        fullName: sName,
        gender: sGender,
        classId: targetClass.id,
        className: targetClass.name,
        majorId: targetClass.majorId,
        majorCode: targetClass.majorCode,
        address: sAddress,
        phone: sPhone,
        parentName: sParentName,
        parentPhone: sParentPhone,
        password: sPassword.trim() || 'siswa123',
      });
      showToast(`Data siswa ${sName} berhasil diperbarui.`);
    } else {
      addStudent({
        nisn: sNisn,
        nis: sNis,
        fullName: sName,
        gender: sGender,
        classId: targetClass.id,
        className: targetClass.name,
        majorId: targetClass.majorId,
        majorCode: targetClass.majorCode,
        address: sAddress,
        phone: sPhone,
        parentName: sParentName,
        parentPhone: sParentPhone,
        password: sPassword.trim() || 'siswa123',
        status: 'aktif',
      });
      showToast(`Siswa baru ${sName} berhasil didaftarkan.`);
    }
    setShowStudentModal(false);
  };

  // Trigger Delete Confirm for Student
  const handleDeleteStudentClick = (std: Student) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Data Siswa',
      itemName: `${std.fullName} (NISN: ${std.nisn})`,
      description: `Apakah Anda yakin ingin menghapus data siswa ini secara permanen? Seluruh riwayat presensi dan nilai akademik terkait siswa ini juga akan dibersihkan dari sistem.`,
      onConfirm: () => {
        deleteStudent(std.id);
        closeDeleteModal();
        showToast(`Data siswa ${std.fullName} berhasil dihapus.`);
      },
    });
  };

  // ==================== 2. TEACHER MODAL STATE ====================
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [tNip, setTNip] = useState('');
  const [tName, setTName] = useState('');
  const [tGender, setTGender] = useState<'L' | 'P'>('L');
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tSubjects, setTSubjects] = useState('');
  const [tIsHomeroom, setTIsHomeroom] = useState(false);
  const [tHomeroomClassId, setTHomeroomClassId] = useState(classes[0]?.id || '');
  const [tPassword, setTPassword] = useState('password123');
  const [showTPassword, setShowTPassword] = useState(false);

  const openAddTeacherModal = () => {
    setEditingTeacher(null);
    setTNip(`198${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setTName('');
    setTGender('L');
    setTEmail('');
    setTPhone('');
    setTSubjects(subjects[0]?.name || 'Kompetensi Kejuruan');
    setTIsHomeroom(false);
    setTHomeroomClassId(classes[0]?.id || '');
    setTPassword('password123');
    setShowTeacherModal(true);
  };

  const openEditTeacherModal = (tch: Teacher) => {
    setEditingTeacher(tch);
    setTNip(tch.nip);
    setTName(tch.fullName);
    setTGender(tch.gender);
    setTEmail(tch.email);
    setTPhone(tch.phone || '');
    setTSubjects(tch.subjects.join(', '));
    setTIsHomeroom(tch.isHomeroom);
    setTHomeroomClassId(tch.homeroomClassId || classes[0]?.id || '');
    setTPassword(tch.password || 'password123');
    setShowTeacherModal(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) return;

    const targetClass = classes.find(c => c.id === tHomeroomClassId);
    const subjectList = tSubjects.split(',').map(s => s.trim()).filter(Boolean);

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        nip: tNip,
        fullName: tName,
        gender: tGender,
        email: tEmail || `${tName.toLowerCase().replace(/[^a-z]/g, '')}@smkmy-cikembar.sch.id`,
        phone: tPhone,
        subjects: subjectList.length > 0 ? subjectList : ['Pendidikan Umum'],
        isHomeroom: tIsHomeroom,
        homeroomClassId: tIsHomeroom ? targetClass?.id : undefined,
        homeroomClassName: tIsHomeroom ? targetClass?.name : undefined,
        password: tPassword.trim() || 'password123',
      });
      showToast(`Data guru ${tName} berhasil diperbarui.`);
    } else {
      addTeacher({
        nip: tNip,
        fullName: tName,
        gender: tGender,
        email: tEmail || `${tName.toLowerCase().replace(/[^a-z]/g, '')}@smkmy-cikembar.sch.id`,
        phone: tPhone,
        subjects: subjectList.length > 0 ? subjectList : ['Pendidikan Umum'],
        isHomeroom: tIsHomeroom,
        homeroomClassId: tIsHomeroom ? targetClass?.id : undefined,
        homeroomClassName: tIsHomeroom ? targetClass?.name : undefined,
        password: tPassword.trim() || 'password123',
      });
      showToast(`Pendidik baru ${tName} berhasil ditambahkan.`);
    }
    setShowTeacherModal(false);
  };

  // Trigger Delete Confirm for Teacher
  const handleDeleteTeacherClick = (tch: Teacher) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Data Guru / Pendidik',
      itemName: `${tch.fullName} (NIP: ${tch.nip})`,
      description: `Apakah Anda yakin ingin menghapus guru ini dari daftar tenaga pendidik sekolah?`,
      onConfirm: () => {
        deleteTeacher(tch.id);
        closeDeleteModal();
        showToast(`Data guru ${tch.fullName} berhasil dihapus.`);
      },
    });
  };

  // ==================== 3. CLASS MODAL STATE ====================
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [cName, setCName] = useState('');
  const [cGrade, setCGrade] = useState<'X' | 'XI' | 'XII'>('X');
  const [cMajorId, setCMajorId] = useState(majors[0]?.id || '');
  const [cTeacherId, setCTeacherId] = useState(teachers[0]?.id || '');
  const [cCapacity, setCCapacity] = useState(36);

  const openAddClassModal = () => {
    setEditingClass(null);
    setCName('X RPL 2');
    setCGrade('X');
    setCMajorId(majors[0]?.id || '');
    setCTeacherId(teachers[0]?.id || '');
    setCCapacity(36);
    setShowClassModal(true);
  };

  const openEditClassModal = (cls: ClassRoom) => {
    setEditingClass(cls);
    setCName(cls.name);
    setCGrade(cls.gradeLevel);
    setCMajorId(cls.majorId);
    setCTeacherId(cls.homeroomTeacherId);
    setCCapacity(cls.capacity);
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;

    const majorObj = majors.find(m => m.id === cMajorId) || majors[0];
    const teacherObj = teachers.find(t => t.id === cTeacherId) || teachers[0];

    if (editingClass) {
      updateClass(editingClass.id, {
        name: cName.trim(),
        gradeLevel: cGrade,
        majorId: majorObj?.id || 'maj-rpl',
        majorCode: majorObj?.code || 'RPL',
        homeroomTeacherId: teacherObj?.id || '',
        homeroomTeacherName: teacherObj?.fullName || 'Belum Ditentukan',
        capacity: cCapacity,
      });
      showToast(`Rombel ${cName} berhasil diperbarui.`);
    } else {
      addClass({
        name: cName.trim(),
        gradeLevel: cGrade,
        majorId: majorObj?.id || 'maj-rpl',
        majorCode: majorObj?.code || 'RPL',
        academicYearId: 'ay-2026-ganjil',
        homeroomTeacherId: teacherObj?.id || '',
        homeroomTeacherName: teacherObj?.fullName || 'Belum Ditentukan',
        studentCount: 0,
        capacity: cCapacity,
      });
      showToast(`Rombel baru ${cName} berhasil ditambahkan.`);
    }
    setShowClassModal(false);
  };

  // Trigger Delete Confirm for Class
  const handleDeleteClassClick = (cls: ClassRoom) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Rombongan Belajar (Kelas)',
      itemName: `${cls.name} (${cls.majorCode})`,
      description: `Apakah Anda yakin ingin menghapus kelas ini? Pastikan siswa pada kelas ini sudah dipindahkan ke rombel lain.`,
      onConfirm: () => {
        deleteClass(cls.id);
        closeDeleteModal();
        showToast(`Rombel kelas ${cls.name} berhasil dihapus.`);
      },
    });
  };

  // ==================== 4. MAJOR MODAL STATE ====================
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [mCode, setMCode] = useState('');
  const [mName, setMName] = useState('');
  const [mHead, setMHead] = useState('');
  const [mDesc, setMDesc] = useState('');

  const openAddMajorModal = () => {
    setEditingMajor(null);
    setMCode('');
    setMName('');
    setMHead(teachers[0]?.fullName || '');
    setMDesc('');
    setShowMajorModal(true);
  };

  const openEditMajorModal = (m: Major) => {
    setEditingMajor(m);
    setMCode(m.code);
    setMName(m.name);
    setMHead(m.headOfMajor);
    setMDesc(m.description);
    setShowMajorModal(true);
  };

  const handleSaveMajor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mCode.trim() || !mName.trim()) return;

    if (editingMajor) {
      updateMajor(editingMajor.id, {
        code: mCode.trim().toUpperCase(),
        name: mName.trim(),
        headOfMajor: mHead.trim(),
        description: mDesc.trim(),
      });
      showToast(`Kompetensi keahlian ${mName} berhasil diperbarui.`);
    } else {
      addMajor({
        code: mCode.trim().toUpperCase(),
        name: mName.trim(),
        headOfMajor: mHead.trim() || 'Drs. Pendidik Kejuruan',
        description: mDesc.trim() || `Program Keahlian Unggulan ${mName} di SMK Mardi Yuana Cikembar.`,
      });
      showToast(`Program keahlian ${mName} berhasil ditambahkan.`);
    }
    setShowMajorModal(false);
  };

  // Trigger Delete Confirm for Major
  const handleDeleteMajorClick = (m: Major) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Jurusan / Kompetensi Keahlian',
      itemName: `${m.name} (${m.code})`,
      description: `Apakah Anda yakin ingin menghapus program keahlian vokasi ini?`,
      onConfirm: () => {
        deleteMajor(m.id);
        closeDeleteModal();
        showToast(`Kompetensi keahlian ${m.name} berhasil dihapus.`);
      },
    });
  };

  // ==================== 5. SUBJECT MODAL STATE ====================
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subCategory, setSubCategory] = useState<'Muatan Nasional' | 'Muatan Kewilayahan' | 'Muatan Peminatan Kejuruan'>('Muatan Peminatan Kejuruan');
  const [subGrade, setSubGrade] = useState<'Semua' | 'X' | 'XI' | 'XII'>('Semua');
  const [subKkm, setSubKkm] = useState(75);

  const openAddSubjectModal = () => {
    setEditingSubject(null);
    setSubCode(`C3-${Date.now().toString().slice(-4)}`);
    setSubName('');
    setSubCategory('Muatan Peminatan Kejuruan');
    setSubGrade('Semua');
    setSubKkm(75);
    setShowSubjectModal(true);
  };

  const openEditSubjectModal = (s: Subject) => {
    setEditingSubject(s);
    setSubCode(s.code);
    setSubName(s.name);
    setSubCategory(s.category);
    setSubGrade(s.gradeLevel);
    setSubKkm(s.kkm);
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCode.trim() || !subName.trim()) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        code: subCode.trim(),
        name: subName.trim(),
        category: subCategory,
        gradeLevel: subGrade,
        kkm: subKkm,
      });
      showToast(`Mata pelajaran ${subName} berhasil diperbarui.`);
    } else {
      addSubject({
        code: subCode.trim(),
        name: subName.trim(),
        category: subCategory,
        gradeLevel: subGrade,
        kkm: subKkm,
      });
      showToast(`Mata pelajaran baru ${subName} berhasil ditambahkan.`);
    }
    setShowSubjectModal(false);
  };

  // Trigger Delete Confirm for Subject
  const handleDeleteSubjectClick = (s: Subject) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Mata Pelajaran',
      itemName: `${s.name} (${s.code})`,
      description: `Apakah Anda yakin ingin menghapus mata pelajaran ini dari kurikulum? Semua komponen penilaian dan nilai yang terkait dengan mata pelajaran ini juga akan dihapus.`,
      onConfirm: () => {
        deleteSubject(s.id);
        closeDeleteModal();
        showToast(`Mata pelajaran ${s.name} berhasil dihapus.`);
      },
    });
  };

  // ==================== 6. ACADEMIC YEAR STATE ====================
  const [showYearModal, setShowYearModal] = useState(false);
  const [yearName, setYearName] = useState('2027/2028');
  const [yearSemester, setYearSemester] = useState<'ganjil' | 'genap'>('ganjil');

  const handleSaveAcademicYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearName.trim()) return;

    addAcademicYear({
      name: yearName.trim(),
      activeSemester: yearSemester,
      isActive: false,
    });
    showToast(`Tahun ajaran ${yearName} (${yearSemester.toUpperCase()}) berhasil dibuat.`);
    setShowYearModal(false);
  };

  // Trigger Delete Confirm for Academic Year
  const handleDeleteAcademicYearClick = (ay: AcademicYear) => {
    if (ay.isActive) {
      alert('Tahun ajaran yang sedang aktif tidak dapat dihapus! Silakan aktifkan tahun ajaran lain terlebih dahulu.');
      return;
    }
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Arsip Tahun Ajaran',
      itemName: `${ay.name} (Semester ${ay.activeSemester.toUpperCase()})`,
      description: `Apakah Anda yakin ingin menghapus arsip tahun ajaran ini? Data periode akademik ini akan dihapus dari sistem.`,
      onConfirm: () => {
        deleteAcademicYear(ay.id);
        closeDeleteModal();
        showToast(`Tahun ajaran ${ay.name} berhasil dihapus.`);
      },
    });
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm) ||
      s.nis.includes(searchTerm);
    const matchesClass = filterClass === 'ALL' || s.className === filterClass;
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleExportStudentsExcel = () => {
    const rows = filteredStudents.map((s, i) => ({
      No: i + 1,
      NISN: s.nisn,
      NIS: s.nis,
      'Nama Siswa': s.fullName,
      'L/P': s.gender,
      Kelas: s.className,
      Jurusan: s.majorCode,
      Alamat: s.address,
      Telepon: s.phone,
      'Nama Orang Tua': s.parentName,
      'Kontak Orang Tua': s.parentPhone,
      Status: s.status,
    }));
    exportToExcel(rows, 'Master_Data_Siswa_SMK_Mardi_Yuana');
  };

  const handleSimulateImport = () => {
    const sampleImport: Partial<Student>[] = [
      {
        fullName: 'Muhammad Fikri Pratama',
        nisn: '0072389199',
        nis: '24251099',
        gender: 'L',
        className: 'X RPL 1',
        majorCode: 'RPL',
        parentName: 'H. Sudirman',
      },
      {
        fullName: 'Nadia Putri Sabina',
        nisn: '0072389198',
        nis: '24251098',
        gender: 'P',
        className: 'X TKJ 1',
        majorCode: 'TKJ',
        parentName: 'Suryanto',
      },
    ];
    const count = importStudents(sampleImport);
    showToast(`Berhasil mengimpor ${count} data siswa baru.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl dark:bg-blue-600 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title & Tabs with JRPG Grand Codex Styling */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-2.5 text-white shadow-md shadow-indigo-500/25 ring-1 ring-amber-400/50">
            <Gem className="h-5 w-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Master Data Manajemen Sekolah
              </h1>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-600 dark:text-amber-400 border border-amber-500/20">
                GRAND CODEX
              </span>
            </div>
            <p className="text-xs text-slate-500">SMK Mardi Yuana Cikembar &bull; Kurikulum Merdeka Terakreditasi A (Unggul)</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white/70 p-1 dark:border-slate-800 dark:bg-slate-800/60 backdrop-blur-md">
          {[
            { id: 'students', label: `Siswa (${students.length})`, icon: Gem },
            { id: 'teachers', label: `Guru (${teachers.length})`, icon: Crown },
            { id: 'classes', label: `Kelas (${classes.length})`, icon: Castle },
            { id: 'majors', label: `Jurusan (${majors.length})`, icon: Swords },
            { id: 'subjects', label: `Mapel (${subjects.length})`, icon: Scroll },
            { id: 'years', label: 'Tahun Ajaran', icon: Hourglass },
          ].map(tab => {
            const Icon = tab.icon;
            const isAct = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isAct
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DATA SISWA */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NISN, atau NIS..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={filterClass}
                onChange={e => setFilterClass(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">Semua Kelas</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="mutasi">Mutasi / Diarsipkan</option>
                <option value="lulus">Lulus</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateImport}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                title="Impor format spreadsheet Excel atau CSV"
              >
                <Upload className="h-3.5 w-3.5 text-blue-600" /> Impor Excel/CSV
              </button>

              <button
                onClick={handleExportStudentsExcel}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" /> Ekspor XLSX
              </button>

              <button
                onClick={openAddStudentModal}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Tambah Siswa
              </button>
            </div>
          </div>

          {/* Students Data Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold">
                    <th className="py-3 px-4 text-center w-12">No</th>
                    <th className="py-3 px-4">NISN / NIS</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4 text-center">L/P</th>
                    <th className="py-3 px-4">Kelas / Jurusan</th>
                    <th className="py-3 px-4">Kontak Siswa / Ortu</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                        Tidak ada data siswa yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std, idx) => (
                      <tr key={std.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{std.nisn}</span>
                          <span className="text-slate-400 block text-[10px]">{std.nis}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{std.fullName}</td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-600 dark:text-slate-300">{std.gender}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{std.className}</span>
                          <span className="text-slate-400 text-[10px] block">{std.majorCode}</span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500">
                          <div>{std.phone}</div>
                          <div className="text-[10px] text-slate-400">{std.parentName} ({std.parentPhone})</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              std.status === 'aktif'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : std.status === 'lulus'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {std.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setDetailStudent(std)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Lihat Detail Siswa"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEditStudentModal(std)}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                              title="Edit Data Siswa"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudentClick(std)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                              title="Hapus Siswa Permanen"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA GURU */}
      {activeTab === 'teachers' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Daftar Tenaga Pendidik &amp; Kependidikan ({teachers.length})</h2>
              <p className="text-xs text-slate-500">Data dewan guru pengampu mata pelajaran dan wali kelas</p>
            </div>
            <button
              onClick={openAddTeacherModal}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> Tambah Guru Baru
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">NIP / Identitas</th>
                  <th className="py-3 px-4">Nama Lengkap &amp; Gelar</th>
                  <th className="py-3 px-4">Mata Pelajaran yang Diampu</th>
                  <th className="py-3 px-4">Status Wali Kelas</th>
                  <th className="py-3 px-4">Kontak Email / Telp</th>
                  <th className="py-3 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">{t.nip}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{t.fullName}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {t.subjects.join(', ')}
                    </td>
                    <td className="py-3 px-4">
                      {t.isHomeroom ? (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Wali {t.homeroomClassName}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      <div>{t.email}</div>
                      <div>{t.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditTeacherModal(t)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                          title="Edit Guru"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacherClick(t)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                          title="Hapus Guru"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DATA KELAS */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Rombongan Belajar / Kelas ({classes.length})</h2>
              <p className="text-xs text-slate-500">Manajemen struktur kelas dan penugasan wali kelas</p>
            </div>
            <button
              onClick={openAddClassModal}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Tambah Rombel Kelas
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(c => (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">{c.name}</span>
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Tingkat {c.gradeLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Konsentrasi: {c.majorCode}</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                    <p>Wali Kelas: <strong>{c.homeroomTeacherName || 'Belum Ditentukan'}</strong></p>
                    <p>Kapasitas: <strong>{c.studentCount} / {c.capacity} Siswa</strong></p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">SMK Mardi Yuana</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditClassModal(c)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                      title="Edit Kelas"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClassClick(c)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DATA JURUSAN */}
      {activeTab === 'majors' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Program &amp; Kompetensi Keahlian ({majors.length})</h2>
              <p className="text-xs text-slate-500">Program kejuruan vokasi SMK Mardi Yuana Cikembar Terakreditasi A</p>
            </div>
            <button
              onClick={openAddMajorModal}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Tambah Jurusan Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {majors.map(m => (
              <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-blue-600 px-2.5 py-1 text-xs font-black text-white">{m.code}</span>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{m.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditMajorModal(m)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                        title="Edit Jurusan"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMajorClick(m)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                        title="Hapus Jurusan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{m.description}</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-3">
                    Ketua Program Keahlian: <span className="text-blue-600 dark:text-blue-400 font-bold">{m.headOfMajor}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MATA PELAJARAN */}
      {activeTab === 'subjects' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Daftar Mata Pelajaran &amp; Standar KKM ({subjects.length})</h2>
              <p className="text-xs text-slate-500">Struktur kurikulum nasional, kewilayahan, dan peminatan kejuruan</p>
            </div>
            <button
              onClick={openAddSubjectModal}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Tambah Mapel Baru
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold">
                <th className="py-3 px-4">Kode Mapel</th>
                <th className="py-3 px-4">Nama Mata Pelajaran</th>
                <th className="py-3 px-4">Kategori Kurikulum</th>
                <th className="py-3 px-4 text-center">Tingkat</th>
                <th className="py-3 px-4 text-center">Standar KKM</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjects.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{s.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.category}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-600 dark:text-slate-300">{s.gradeLevel}</td>
                  <td className="py-3 px-4 text-center font-black text-rose-600">{s.kkm}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditSubjectModal(s)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                        title="Edit Mapel"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubjectClick(s)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                        title="Hapus Mapel"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: TAHUN AJARAN */}
      {activeTab === 'years' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Pengaturan Tahun Ajaran &amp; Semester</h2>
              <p className="text-xs text-slate-500">Tentukan periode kalender akademik aktif untuk presensi dan penginputan nilai</p>
            </div>
            <button
              onClick={() => setShowYearModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Tambah Tahun Ajaran
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {academicYears.map(ay => (
              <div
                key={ay.id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                  ay.isActive
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs dark:border-blue-700 dark:bg-blue-950/30'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">{ay.name}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        ay.isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {ay.isActive ? 'Sedang Berjalan (Aktif)' : 'Arsip'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Semester: <strong className="capitalize text-slate-700 dark:text-slate-300">{ay.activeSemester}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!ay.isActive && (
                    <button
                      onClick={() => {
                        setActiveAcademicYear(ay.id);
                        showToast(`Tahun ajaran ${ay.name} sekarang aktif.`);
                      }}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                    >
                      Jadikan Aktif
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAcademicYearClick(ay)}
                    disabled={ay.isActive}
                    className={`p-2 rounded-xl border transition-colors ${
                      ay.isActive
                        ? 'border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700 cursor-not-allowed opacity-50'
                        : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}
                    title={ay.isActive ? 'Tahun ajaran aktif tidak dapat dihapus' : 'Hapus Tahun Ajaran'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. STUDENT ADD/EDIT MODAL */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingStudent ? 'Edit Data Siswa' : 'Pendaftaran Siswa Baru'}
              </h2>
              <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-4">Lengkapi informasi kesiswaan secara valid</p>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    value={sNisn}
                    onChange={e => setSNisn(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NIS Sekolah</label>
                  <input
                    type="text"
                    value={sNis}
                    onChange={e => setSNis(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={sName}
                  onChange={e => setSName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Contoh: Muhammad Reza Pahlevi"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jenis Kelamin</label>
                  <select
                    value={sGender}
                    onChange={e => setSGender(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kelas / Rombel</label>
                  <select
                    value={sClassId}
                    onChange={e => setSClassId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.majorCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  value={sAddress}
                  onChange={e => setSAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">No. WhatsApp Siswa</label>
                  <input
                    type="text"
                    value={sPhone}
                    onChange={e => setSPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={sParentName}
                    onChange={e => setSParentName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password Akun Siswa (untuk Login)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showSPassword ? 'text' : 'password'}
                    value={sPassword}
                    onChange={e => setSPassword(e.target.value)}
                    placeholder="Masukkan password akun siswa..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSPassword(!showSPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showSPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Digunakan siswa untuk login ke portal web &amp; mobile.</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. TEACHER ADD/EDIT MODAL */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Tenaga Pendidik Baru'}
              </h2>
              <button onClick={() => setShowTeacherModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-4">Informasi dewan guru dan penugasan mengajar</p>

            <form onSubmit={handleSaveTeacher} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NIP / Kode Pendidik</label>
                  <input
                    type="text"
                    value={tNip}
                    onChange={e => setTNip(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jenis Kelamin</label>
                  <select
                    value={tGender}
                    onChange={e => setTGender(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  value={tName}
                  onChange={e => setTName(e.target.value)}
                  placeholder="Contoh: Ahmad Hidayat, S.Kom., M.T."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={tEmail}
                    onChange={e => setTEmail(e.target.value)}
                    placeholder="nama@smkmy-cikembar.sch.id"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={tPhone}
                    onChange={e => setTPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mata Pelajaran yang Diampu (pisahkan koma)</label>
                <input
                  type="text"
                  value={tSubjects}
                  onChange={e => setTSubjects(e.target.value)}
                  placeholder="Contoh: Pemrograman Web, Basis Data, PBO"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/50 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={tIsHomeroom}
                    onChange={e => setTIsHomeroom(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Bertugas Sebagai Wali Kelas</span>
                </label>

                {tIsHomeroom && (
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1 text-[11px]">Pilih Rombel / Kelas Binaan:</label>
                    <select
                      value={tHomeroomClassId}
                      onChange={e => setTHomeroomClassId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.majorCode})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password Akun Guru / Karyawan (untuk Login)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showTPassword ? 'text' : 'password'}
                    value={tPassword}
                    onChange={e => setTPassword(e.target.value)}
                    placeholder="Masukkan password akun pendidik/staf..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowTPassword(!showTPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showTPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Digunakan untuk login ke sistem dengan NIP atau email guru.</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CLASS ADD/EDIT MODAL */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingClass ? 'Edit Rombongan Belajar' : 'Tambah Rombel Kelas Baru'}
              </h2>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-4">Pengaturan identitas rombel dan penugasan wali kelas</p>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Rombel / Kelas</label>
                <input
                  type="text"
                  value={cName}
                  onChange={e => setCName(e.target.value)}
                  placeholder="Contoh: XI RPL 2"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tingkat Kelas</label>
                  <select
                    value={cGrade}
                    onChange={e => setCGrade(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kapasitas Maksimal</label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={cCapacity}
                    onChange={e => setCCapacity(parseInt(e.target.value) || 36)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Program Keahlian / Jurusan</label>
                <select
                  value={cMajorId}
                  onChange={e => setCMajorId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {majors.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Wali Kelas yang Ditugaskan</label>
                <select
                  value={cTeacherId}
                  onChange={e => setCTeacherId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Pilih Guru Wali Kelas --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MAJOR ADD/EDIT MODAL */}
      {showMajorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingMajor ? 'Edit Program Keahlian' : 'Tambah Jurusan Vokasi Baru'}
              </h2>
              <button onClick={() => setShowMajorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-4">Informasi kompetensi keahlian dan kepemimpinan program</p>

            <form onSubmit={handleSaveMajor} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kode Jurusan</label>
                  <input
                    type="text"
                    value={mCode}
                    onChange={e => setMCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: DKV"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold uppercase text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Program Keahlian</label>
                  <input
                    type="text"
                    value={mName}
                    onChange={e => setMName(e.target.value)}
                    placeholder="Contoh: Desain Komunikasi Visual"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ketua Program Keahlian (Kaprog)</label>
                <input
                  type="text"
                  value={mHead}
                  onChange={e => setMHead(e.target.value)}
                  placeholder="Contoh: Budi Prasetyo, S.Pd., M.M."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Deskripsi Kompetensi Lulusan</label>
                <textarea
                  value={mDesc}
                  onChange={e => setMDesc(e.target.value)}
                  rows={3}
                  placeholder="Deskripsi keunggulan, standar industri dan profil kelulusan..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMajorModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  Simpan Jurusan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SUBJECT ADD/EDIT MODAL */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h2>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-4">Pengaturan kurikulum mata pelajaran dan standar KKM</p>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    value={subCode}
                    onChange={e => setSubCode(e.target.value)}
                    placeholder="C3-RPL-05"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Mata Pelajaran</label>
                  <input
                    type="text"
                    value={subName}
                    onChange={e => setSubName(e.target.value)}
                    placeholder="Contoh: Cloud Computing & Devops"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kategori Kurikulum</label>
                <select
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Muatan Nasional">Muatan Nasional (A)</option>
                  <option value="Muatan Kewilayahan">Muatan Kewilayahan (B)</option>
                  <option value="Muatan Peminatan Kejuruan">Muatan Peminatan Kejuruan (C)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Sasaran Tingkat</label>
                  <select
                    value={subGrade}
                    onChange={e => setSubGrade(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Semua">Semua Tingkat</option>
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Standar KKM Minimum</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={subKkm}
                    onChange={e => setSubKkm(parseInt(e.target.value) || 75)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-black text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ACADEMIC YEAR MODAL */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Tambah Periode Tahun Ajaran</h2>
              <button onClick={() => setShowYearModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-4">Tambahkan kalender akademik sekolah baru</p>

            <form onSubmit={handleSaveAcademicYear} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Periode Tahun Ajaran</label>
                <input
                  type="text"
                  value={yearName}
                  onChange={e => setYearName(e.target.value)}
                  placeholder="Contoh: 2027/2028"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Semester Awal</label>
                <select
                  value={yearSemester}
                  onChange={e => setYearSemester(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="ganjil">Semester Ganjil</option>
                  <option value="genap">Semester Genap</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  Tambah Periode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Detail Profil Siswa</h2>
              <button onClick={() => setDetailStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-slate-700 dark:text-slate-300">
              <p><span className="text-slate-400">Nama:</span> <strong className="text-slate-900 dark:text-white text-sm">{detailStudent.fullName}</strong></p>
              <p><span className="text-slate-400">NISN / NIS:</span> {detailStudent.nisn} / {detailStudent.nis}</p>
              <p><span className="text-slate-400">Jenis Kelamin:</span> {detailStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              <p><span className="text-slate-400">Kelas / Jurusan:</span> {detailStudent.className} ({detailStudent.majorCode})</p>
              <p><span className="text-slate-400">Alamat:</span> {detailStudent.address}</p>
              <p><span className="text-slate-400">No. HP:</span> {detailStudent.phone}</p>
              <p><span className="text-slate-400">Orang Tua:</span> {detailStudent.parentName} ({detailStudent.parentPhone})</p>
              <p><span className="text-slate-400">Status Kesiswaan:</span> <span className="font-bold uppercase text-emerald-600">{detailStudent.status}</span></p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailStudent(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title={deleteModalConfig.title}
        itemName={deleteModalConfig.itemName}
        description={deleteModalConfig.description}
        onConfirm={deleteModalConfig.onConfirm}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};
