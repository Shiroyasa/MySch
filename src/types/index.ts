export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'guru' 
  | 'wali_kelas' 
  | 'kepala_sekolah' 
  | 'siswa';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  nipOrNis?: string;
  phone?: string;
  photoURL?: string;
  classId?: string;
  className?: string;
  homeroomClassId?: string;
  homeroomClassName?: string;
  subjects?: string[];
  permissions?: string[];
  password?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A' | 'T'; // Hadir, Sakit, Izin, Alpa, Terlambat

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  fullName: string;
  gender: 'L' | 'P';
  classId: string;
  className: string;
  majorId: string;
  majorCode: string;
  address: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  status: 'aktif' | 'lulus' | 'mutasi' | 'keluar';
  password?: string;
  photoURL?: string;
  name?: string;
  enrollmentDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  fullName: string;
  gender: 'L' | 'P';
  email: string;
  phone: string;
  subjects: string[];
  isHomeroom: boolean;
  homeroomClassId?: string;
  homeroomClassName?: string;
  password?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  gradeLevel: 'X' | 'XI' | 'XII';
  majorId: string;
  majorCode: string;
  academicYearId: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  studentCount: number;
  capacity: number;
  createdAt: string;
}

export interface Major {
  id: string;
  code: string;
  name: string;
  description: string;
  headOfMajor: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: 'Muatan Nasional' | 'Muatan Kewilayahan' | 'Muatan Peminatan Kejuruan';
  gradeLevel: 'Semua' | 'X' | 'XI' | 'XII';
  kkm: number;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026/2027"
  activeSemester: 'ganjil' | 'genap';
  isActive: boolean;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  academicYearId: string;
  semester: 'ganjil' | 'genap';
  schedule?: string;
}

export interface AttendanceSession {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  className: string;
  type: 'harian' | 'mapel';
  subjectId?: string;
  subjectName?: string;
  teacherId: string;
  teacherName: string;
  academicYearId: string;
  semester: 'ganjil' | 'genap';
  status: 'draft' | 'final';
  totalStudents: number;
  presentCount: number;
  sickCount: number;
  leaveCount: number;
  absentCount: number;
  lateCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  date: string;
  studentId: string;
  studentName: string;
  nisn: string;
  classId: string;
  status: AttendanceStatus;
  note?: string;
  updatedBy: string;
  createdAt: string;
}

export interface AttendanceCorrection {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  classId: string;
  className: string;
  sessionId?: string;
  date: string;
  currentStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason: string;
  evidenceUrl?: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type AssessmentType = 'tugas' | 'praktik' | 'proyek' | 'formatif' | 'sumatif';

export interface Assessment {
  id: string;
  title: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  academicYearId: string;
  semester: 'ganjil' | 'genap';
  type: AssessmentType;
  weight: number; // in percent e.g. 20
  maxScore: number;
  kkm: number;
  date: string;
  status: 'draft' | 'final' | 'dipublikasikan';
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentScore {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  nisn: string;
  classId: string;
  subjectId: string;
  score: number;
  feedback?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface StudentSubjectRecap {
  studentId: string;
  studentName: string;
  nisn: string;
  nis: string;
  subjectId: string;
  subjectName: string;
  kkm: number;
  scores: { [assessmentId: string]: number };
  finalScore: number;
  predicate: 'A' | 'B' | 'C' | 'D';
  passed: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  isRead: boolean;
  link?: string;
  createdAt: string;
  targetRole?: UserRole | 'all';
  recipientId?: string; // target user ID (specific profile)
  recipientName?: string;
  senderRole?: UserRole;
  senderName?: string;
  isBroadcast?: boolean;
  category?: 'akademik' | 'presensi' | 'pengumuman' | 'keamanan' | 'profil' | 'umum';
  urgency?: 'normal' | 'penting' | 'mendesak';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  studentNis?: string;
  studentClass?: string;
  content: string;
  timestamp: string;
  isAnnouncement?: boolean;
  deleted?: boolean;
  deletedBy?: string;
  category?: 'tugas' | 'mapel' | 'diskusi' | 'pengumuman' | 'santai';
  // Direct Message (DM per profile)
  isDirectMessage?: boolean;
  recipientId?: string;
  recipientName?: string;
}

// ==========================================
// ADMINISTRASI PKL (PRAKTEK KERJA LAPANGAN)
// ==========================================

export interface IndustryMou {
  id: string;
  mouNumber: string; // Nomor Surat MoU / PKS
  startDate: string; // Format YYYY-MM-DD
  endDate: string; // Format YYYY-MM-DD
  status: 'aktif' | 'hampir_habis' | 'kadaluarsa';
  scope: string; // e.g. "PKL Siswa, Guru Magang, Rekrutmen Lulusan"
  documentTitle: string;
}

export interface IndustryPlacementRecord {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  className: string;
  majorCode: string;
  academicYear: string;
  period: string; // e.g. "Juli - Desember 2026"
  schoolMentorName: string; // Guru Pembimbing
  industryMentorName: string; // Pembimbing DUDI
  status: 'sedang_berjalan' | 'selesai' | 'ditarik';
  finalScore?: number;
  grade?: 'A' | 'B' | 'C' | 'D';
}

export interface IndustryEvaluation {
  rating: number; // 1 to 5
  workCultureScore: number; // 0 - 100
  guidanceScore: number; // 0 - 100
  facilityScore: number; // 0 - 100
  curriculumRelevanceScore: number; // 0 - 100
  recommendation: 'Sangat Direkomendasikan' | 'Direkomendasikan' | 'Perlu Evaluasi' | 'Tidak Direkomendasikan';
  notes: string;
  evaluatorName: string;
  evaluatedAt: string;
}

export interface IndustryPartner {
  id: string;
  name: string;
  sector: string; // Bidang usaha (e.g. "Teknologi Informasi & Software", "Otomotif & Manufaktur", dll)
  address: string;
  city: string;
  hrdName: string;
  hrdPhone: string;
  hrdEmail: string;
  hrdPosition: string;
  quota: number; // Kuota penerimaan siswa
  activePlacementsCount: number; // Jumlah siswa aktif saat ini
  status: 'aktif' | 'nonaktif';
  mouHistory: IndustryMou[];
  placements: IndustryPlacementRecord[];
  evaluation: IndustryEvaluation;
  createdAt: string;
}

export interface PklVisitRecord {
  id: string;
  partnerId: string;
  partnerName: string;
  teacherId: string;
  teacherName: string;
  visitDate: string;
  visitType: 'Monitoring Awal' | 'Supervisi Rutin' | 'Evaluasi Tengah PKL' | 'Penarikan Siswa';
  studentCount: number;
  studentNames: string[];
  attendanceRate: number; // % kehadiran siswa saat kunjungan
  guidanceNotes: string;
  industryFeedback: string;
  status: 'terlaksana' | 'terjadwal' | 'tertunda';
}

export interface PklStudentReportItem {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  className: string;
  majorCode: string;
  partnerId: string;
  partnerName: string;
  reportTitle: string;
  submissionStatus: 'sudah_dikumpulkan' | 'belum_dikumpulkan' | 'revisi';
  submissionDate?: string;
  schoolMentorScore: number;
  industryMentorScore: number;
  finalScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  absorbedStatus: 'terserap_kerja' | 'melanjutkan_kuliah' | 'wirausaha' | 'mencari_kerja';
}

export type LiveWallpaperPreset =
  | 'starlight_castle'
  | 'celestial_aurora'
  | 'golden_sanctuary'
  | 'cyber_emerald';

export interface VisualSettings {
  appLogoUrl?: string | null;
  appLogoFit?: 'contain' | 'cover';
  faviconUrl?: string | null;
  loginBgUrl: string | null;
  loginBgType?: 'default' | 'image' | 'video' | 'live_preset';
  loginLivePreset?: LiveWallpaperPreset;
  menuBgUrl?: string | null;
  menuBgType?: 'default' | 'image' | 'video' | 'live_preset';
  menuLivePreset?: LiveWallpaperPreset;
  menuBgOpacity?: number;
  ambientDarkMode?: boolean;
  globalBannerBgUrl: string | null;
  moduleBannerBgUrl?: string | null;
  bannerOverlayOpacity: number;
  moduleBannerBgs: Record<string, string>;
  perModuleBannerBgs?: Record<string, string>;
  boxBgs?: Record<string, string>;
  updatedAt?: string;
}

export interface SchoolSettings {
  schoolName: string;
  npsn: string;
  nss?: string;
  foundationName?: string;
  accreditation: string;
  headmaster?: string;
  headmasterNip?: string;
  principalName?: string;
  principalNip?: string;
  schoolPhone?: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  curriculum?: string;
  defaultKkm?: number;
  maxAlphaWarning?: number;
  lateToleranceMinutes?: number;
  logoUrl?: string;
  city?: string;
  updatedAt?: string;
}

export interface LessonSchedule {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  startTime: string;
  endTime: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  teacherId: string;
  teacherName: string;
  teacherNip?: string;
  room: string;
  semester?: 'ganjil' | 'genap';
  academicYear?: string;
  createdAt?: string;
}

