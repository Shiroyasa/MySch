import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Student,
  Teacher,
  ClassRoom,
  Major,
  Subject,
  AcademicYear,
  AttendanceSession,
  AttendanceRecord,
  AttendanceCorrection,
  Assessment,
  AssessmentScore,
  AuditLog,
  NotificationItem,
  ChatMessage,
  AttendanceStatus,
  IndustryPartner,
  PklVisitRecord,
  PklStudentReportItem,
  VisualSettings,
  LessonSchedule,
} from '../types';
import {
  initialUsers,
  initialStudents,
  initialTeachers,
  initialClasses,
  initialMajors,
  initialSubjects,
  initialAcademicYears,
  initialAttendanceSessions,
  initialAttendanceRecords,
  initialAttendanceCorrections,
  initialAssessments,
  initialAssessmentScores,
  initialAuditLogs,
  initialNotifications,
  initialChatMessages,
} from '../data/seedData';
import {
  sampleIndustryPartners,
  samplePklVisits,
  samplePklReports,
} from '../data/pklSeedData';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  ensureFirestorePopulated,
  subscribeAllCollections,
  firestoreAddStudent,
  firestoreUpdateStudent,
  firestoreDeleteStudent,
  firestoreBatchImportStudents,
  firestoreAddTeacher,
  firestoreUpdateTeacher,
  firestoreDeleteTeacher,
  firestoreAddClass,
  firestoreUpdateClass,
  firestoreDeleteClass,
  firestoreAddSubject,
  firestoreUpdateSubject,
  firestoreDeleteSubject,
  firestoreAddMajor,
  firestoreUpdateMajor,
  firestoreDeleteMajor,
  firestoreAddAcademicYear,
  firestoreDeleteAcademicYear,
  firestoreSetActiveAcademicYear,
  firestoreSaveAttendance,
  firestoreDeleteAttendanceSessionAndRecords,
  firestoreUpdateAttendanceRecord,
  firestoreSyncClassAttendanceRecap,
  firestoreSaveAssessment,
  firestoreAddUser,
  firestoreUpdateUser,
  firestoreDeleteUser,
  firestoreSendChat,
  firestoreDeleteChat,
  firestorePushNotification,
  firestoreMarkNotificationRead,
  firestoreDeleteNotification,
  firestoreClearNotifications,
  firestoreAddAuditLog,
  firestoreSendDirectMessage,
  firestoreDeleteDirectMessage,
  firestoreSaveReportTemplate,
  firestoreSavePklPartner,
  firestoreDeletePklPartner,
  firestoreSavePklVisit,
  firestoreDeletePklVisit,
  firestoreSavePklReport,
  firestoreDeletePklReport,
  firestoreClearAllPklData,
  firestoreSaveVisualSettings,
  firestoreSaveLessonSchedule,
  firestoreDeleteLessonSchedule,
  forceReseedFirestore,
} from '../services/firestoreSync';
import { ReportCustomConfig, defaultReportConfig } from '../utils/exportUtils';

export const defaultVisualSettings: VisualSettings = {
  appLogoUrl: null,
  loginBgUrl: null,
  loginBgType: 'default',
  loginLivePreset: 'starlight_castle',
  menuBgUrl: null,
  menuBgType: 'default',
  menuLivePreset: 'starlight_castle',
  menuBgOpacity: 45,
  ambientDarkMode: true,
  globalBannerBgUrl: null,
  bannerOverlayOpacity: 72,
  moduleBannerBgs: {},
};

interface AppContextType {
  currentUser: User;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;

  // Page Routing (Login Page, Dashboard App)
  pageView: 'landing' | 'login' | 'app';
  setPageView: (view: 'landing' | 'login' | 'app') => void;
  loginWithRole: (role: UserRole) => void;
  loginWithEmail: (email: string, password?: string) => boolean;
  logout: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;

  // Master Data
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  majors: Major[];
  subjects: Subject[];
  academicYears: AcademicYear[];
  activeAcademicYear: AcademicYear;
  users: User[];

  // Master Data Actions
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  archiveStudent: (id: string) => void;
  deleteStudent: (id: string) => void;
  importStudents: (newStudents: Partial<Student>[]) => number;

  addTeacher: (teacher: Omit<Teacher, 'id' | 'createdAt'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  addClass: (cls: Omit<ClassRoom, 'id' | 'createdAt'>) => void;
  updateClass: (id: string, cls: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;

  addSubject: (subj: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, subj: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  addMajor: (major: Omit<Major, 'id'>) => void;
  updateMajor: (id: string, major: Partial<Major>) => void;
  deleteMajor: (id: string) => void;
  addAcademicYear: (year: Omit<AcademicYear, 'id'>) => void;
  deleteAcademicYear: (id: string) => void;
  setActiveAcademicYear: (yearId: string) => void;

  // Attendance
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  attendanceCorrections: AttendanceCorrection[];
  saveAttendanceSessionAndRecords: (
    sessionData: Omit<AttendanceSession, 'id' | 'createdAt' | 'updatedAt' | 'presentCount' | 'sickCount' | 'leaveCount' | 'absentCount' | 'lateCount' | 'totalStudents'>,
    records: { studentId: string; status: AttendanceStatus; note?: string }[],
    isFinal: boolean
  ) => string;
  deleteAttendanceSession: (sessionId: string) => void;
  clearAttendanceForClassAndDate: (classId: string, date: string, type?: 'harian' | 'mapel', subjectId?: string) => void;
  resetClassAttendanceToZero: (classId: string) => void;
  syncClassAttendanceRecapToDatabase: (
    classId: string,
    entriesOrClassName: any,
    maybeEntries?: any[]
  ) => void;
  submitAttendanceCorrection: (req: Omit<AttendanceCorrection, 'id' | 'requestedAt' | 'status'>) => void;
  reviewAttendanceCorrection: (id: string, status: 'approved' | 'rejected', reviewerNote?: string) => void;
  deleteAttendanceCorrection: (id: string) => void;

  // Assessments
  assessments: Assessment[];
  assessmentScores: AssessmentScore[];
  createAssessment: (asm: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => string;
  updateAssessment: (id: string, data: Partial<Assessment>) => void;
  deleteAssessment: (assessmentId: string) => void;
  resetAssessmentScores: (assessmentId: string) => void;
  saveAssessmentScores: (assessmentId: string, scores: { studentId: string; score: number; feedback?: string }[]) => void;
  publishAssessment: (assessmentId: string) => void;

  // Users & Profile
  updateCurrentUserProfile: (updates: Partial<User>) => void;
  addUser: (userData: Omit<User, 'id' | 'createdAt'> & { permissions?: string[] }) => void;
  deleteUser: (userId: string) => { success: boolean; message: string };

  // Logs & Notifications
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  addAuditLog: (action: string, module: string, details: string) => void;
  pushNotification: (
    title: string,
    message: string,
    type?: 'info' | 'success' | 'warning' | 'alert',
    recipientId?: string,
    targetRole?: UserRole | 'all',
    senderName?: string,
    senderRole?: UserRole,
    isBroadcast?: boolean,
    category?: 'akademik' | 'presensi' | 'pengumuman' | 'keamanan' | 'profil' | 'umum',
    urgency?: 'normal' | 'penting' | 'mendesak'
  ) => void;
  sendBroadcastNotification: (
    title: string,
    message: string,
    urgency?: 'normal' | 'penting' | 'mendesak',
    category?: 'akademik' | 'presensi' | 'pengumuman' | 'keamanan' | 'profil' | 'umum'
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Student Chat & Admin Oversight
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string, category?: 'tugas' | 'mapel' | 'diskusi' | 'pengumuman' | 'santai') => void;
  deleteChatMessage: (messageId: string, reason?: string) => void;
  sendModeratorAnnouncement: (content: string) => void;

  // Direct Messages (1-on-1 DM between profiles across all devices)
  directMessages: ChatMessage[];
  sendDirectMessage: (recipientId: string, recipientName: string, content: string) => void;
  deleteDirectMessage: (messageId: string) => void;

  // Custom Report Template / PDF Layout Designer
  reportTemplate: ReportCustomConfig;
  saveReportTemplate: (template: ReportCustomConfig) => void;

  // PKL & DUDI Administration (Cloud Synced)
  pklPartners: IndustryPartner[];
  pklVisits: PklVisitRecord[];
  pklReports: PklStudentReportItem[];
  savePklPartner: (partner: IndustryPartner, isNew?: boolean) => void;
  deletePklPartner: (partnerId: string) => void;
  savePklVisit: (visit: PklVisitRecord, isNew?: boolean) => void;
  deletePklVisit: (visitId: string) => void;
  savePklReport: (report: PklStudentReportItem, isNew?: boolean) => void;
  deletePklReport: (reportId: string) => void;
  clearAllPklData: () => void;
  loadSamplePklData: () => void;

  // Visual Theme & Custom Backgrounds (Login, Menu Wallpaper, Logo & Header Banners)
  visualSettings: VisualSettings;
  updateVisualSettings: (updates: Partial<VisualSettings>) => void;

  // Lesson Schedules (Jadwal Pelajaran di Data Pokok)
  lessonSchedules: LessonSchedule[];
  saveLessonSchedule: (schedule: LessonSchedule, isNew?: boolean) => void;
  deleteLessonSchedule: (scheduleId: string) => void;

  // Realtime Cloud Database Sync (Firestore)
  isFirestoreConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  forceCloudResync: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('myschool_theme') === 'dark';
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('myschool_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Active navigation tab
  const [activeNav, setActiveNav] = useState<string>('dashboard');

  // Logout confirmation modal state
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Page Routing State (login, app)
  const [pageView, setPageView] = useState<'landing' | 'login' | 'app'>(() => {
    const cached = localStorage.getItem('myschool_page_view');
    return cached === 'app' ? 'app' : 'login';
  });

  const handleSetPageView = (view: 'landing' | 'login' | 'app') => {
    const nextView = view === 'landing' ? 'login' : view;
    setPageView(nextView);
    localStorage.setItem('myschool_page_view', nextView);
  };

  // Users & Role state
  const [users, setUsers] = useState<User[]>(() => {
    const cached = localStorage.getItem('myschool_users');
    return cached ? JSON.parse(cached) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const cached = localStorage.getItem('myschool_current_user');
    return cached ? JSON.parse(cached) : initialUsers[0]; // Super Admin default
  });

  const currentRole = currentUser.role;

  // Sync Firebase Auth if signed in via Google
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        // User logged in with Firebase Google Auth
        const existing = users.find(u => u.email === fbUser.email);
        if (existing) {
          setCurrentUser(existing);
        } else {
          // If it matches the authorized email kkaito447@gmail.com, make super_admin
          const isOwner = fbUser.email === 'kkaito447@gmail.com';
          const newUser: User = {
            id: fbUser.uid,
            email: fbUser.email || 'user@smkmy-cikembar.sch.id',
            displayName: fbUser.displayName || 'Pengguna Terverifikasi',
            role: isOwner ? 'super_admin' : 'guru',
            photoURL: fbUser.photoURL || undefined,
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          setUsers(prev => [newUser, ...prev]);
          setCurrentUser(newUser);

          // Sync to Firestore
          try {
            setDoc(doc(db, 'users', fbUser.uid), newUser).catch(() => {});
          } catch (e) {
            // Non blocking
          }
        }
      }
    });

    return () => unsubscribe();
  }, [users]);

  // Role Switcher method (supports testing all 6 personas easily)
  const switchRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role) || initialUsers.find(u => u.role === role) || users[0];
    setCurrentUser(targetUser);
    localStorage.setItem('myschool_current_user', JSON.stringify(targetUser));
    addAuditLog('ROLE_SWITCH', 'Otentikasi & Profil', `Beralih ke peran: ${role.toUpperCase()} sebagai ${targetUser.displayName}`);
    setActiveNav(role === 'siswa' ? 'student-profile' : 'dashboard');
  };

  const loginWithRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role) || initialUsers.find(u => u.role === role) || users[0];
    setCurrentUser(targetUser);
    localStorage.setItem('myschool_current_user', JSON.stringify(targetUser));
    handleSetPageView('app');
    setActiveNav(role === 'siswa' ? 'student-profile' : 'dashboard');
    addAuditLog('USER_LOGIN', 'Otentikasi', `Login berhasil sebagai: ${role.toUpperCase()} (${targetUser.displayName})`);
    pushNotification('Selamat Datang!', `Berhasil masuk ke portal MySchool sebagai ${targetUser.displayName} (${role.toUpperCase()}).`, 'success');
  };

  const loginWithEmail = (input: string, passwordInput?: string): boolean => {
    const q = input.toLowerCase().trim();
    const found =
      users.find(
        u =>
          u.email.toLowerCase() === q ||
          (u.nipOrNis && u.nipOrNis.toLowerCase() === q) ||
          u.displayName.toLowerCase() === q
      ) ||
      initialUsers.find(
        u =>
          u.email.toLowerCase() === q ||
          (u.nipOrNis && u.nipOrNis.toLowerCase() === q)
      );

    if (!found) {
      return false;
    }

    // Verify password if account has a password configured and password input was supplied
    if (found.password && passwordInput && found.password !== passwordInput) {
      return false;
    }

    setCurrentUser(found);
    localStorage.setItem('myschool_current_user', JSON.stringify(found));
    handleSetPageView('app');
    setActiveNav(found.role === 'siswa' ? 'student-profile' : 'dashboard');
    addAuditLog('USER_LOGIN', 'Otentikasi', `Login berhasil: ${found.displayName} (${found.role.toUpperCase()})`);
    pushNotification(
      'Selamat Datang Kembali!',
      `Berhasil masuk ke portal MySchool sebagai ${found.displayName} (${found.role.toUpperCase()}).`,
      'success',
      found.id,
      found.role,
      'Sistem MySchool',
      undefined,
      false,
      'profil'
    );
    return true;
  };

  const logout = () => {
    setShowLogoutModal(false);
    try {
      auth.signOut().catch(() => {});
    } catch (e) {
      // ignore
    }
    handleSetPageView('login');
    pushNotification('Sesi Berakhir', 'Anda telah berhasil keluar dari sistem.', 'info');
  };

  // Master Data States
  const [students, setStudents] = useState<Student[]>(() => {
    const cached = localStorage.getItem('myschool_students');
    return cached ? JSON.parse(cached) : initialStudents;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const cached = localStorage.getItem('myschool_teachers');
    return cached ? JSON.parse(cached) : initialTeachers;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const cached = localStorage.getItem('myschool_classes');
    return cached ? JSON.parse(cached) : initialClasses;
  });

  const [majors, setMajors] = useState<Major[]>(() => {
    const cached = localStorage.getItem('myschool_majors');
    return cached ? JSON.parse(cached) : initialMajors;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const cached = localStorage.getItem('myschool_subjects');
    return cached ? JSON.parse(cached) : initialSubjects;
  });

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => {
    const cached = localStorage.getItem('myschool_academic_years');
    return cached ? JSON.parse(cached) : initialAcademicYears;
  });

  const activeAcademicYear = academicYears.find(y => y.isActive) || academicYears[0];

  // Attendance states
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    const cached = localStorage.getItem('myschool_attendance_sessions');
    return cached ? JSON.parse(cached) : initialAttendanceSessions;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const cached = localStorage.getItem('myschool_attendance_records');
    return cached ? JSON.parse(cached) : initialAttendanceRecords;
  });

  const [attendanceCorrections, setAttendanceCorrections] = useState<AttendanceCorrection[]>(() => {
    const cached = localStorage.getItem('myschool_attendance_corrections');
    return cached ? JSON.parse(cached) : initialAttendanceCorrections;
  });

  // Assessments states
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const cached = localStorage.getItem('myschool_assessments');
    return cached ? JSON.parse(cached) : initialAssessments;
  });

  const [assessmentScores, setAssessmentScores] = useState<AssessmentScore[]>(() => {
    const cached = localStorage.getItem('myschool_assessment_scores');
    return cached ? JSON.parse(cached) : initialAssessmentScores;
  });

  // Logs & Notifications
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const cached = localStorage.getItem('myschool_audit_logs');
    return cached ? JSON.parse(cached) : initialAuditLogs;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const cached = localStorage.getItem('myschool_notifications');
    return cached ? JSON.parse(cached) : initialNotifications;
  });

  // Direct Messages state (1-on-1 DM synced to Firestore)
  const [directMessages, setDirectMessages] = useState<ChatMessage[]>(() => {
    const cached = localStorage.getItem('myschool_direct_messages');
    return cached ? JSON.parse(cached) : [];
  });

  // Custom Report Template state (PDF Kop, Logo, TTD synced to Firestore)
  const [reportTemplate, setReportTemplate] = useState<ReportCustomConfig>(() => {
    const cached = localStorage.getItem('myschool_report_template');
    return cached ? JSON.parse(cached) : defaultReportConfig;
  });

  // PKL & DUDI States (Synced to Firestore)
  const [pklPartners, setPklPartners] = useState<IndustryPartner[]>(() => {
    try {
      const saved = localStorage.getItem('myschool_pkl_partners_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [pklVisits, setPklVisits] = useState<PklVisitRecord[]>(() => {
    try {
      const saved = localStorage.getItem('myschool_pkl_visits_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [pklReports, setPklReports] = useState<PklStudentReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('myschool_pkl_reports_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Visual Theme & Background Settings (Login & Module Header Banners)
  const [visualSettings, setVisualSettings] = useState<VisualSettings>(() => {
    try {
      const saved = localStorage.getItem('myschool_visual_settings');
      const legacyLoginBg = localStorage.getItem('myacademy_login_custom_bg');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultVisualSettings,
          ...parsed,
          loginBgUrl: parsed.loginBgUrl ?? legacyLoginBg ?? null,
        };
      }
      if (legacyLoginBg) {
        return {
          ...defaultVisualSettings,
          loginBgUrl: legacyLoginBg,
          globalBannerBgUrl: legacyLoginBg,
        };
      }
    } catch (e) {}
    return defaultVisualSettings;
  });

  // Lesson Schedules State (Jadwal Pelajaran)
  const [lessonSchedules, setLessonSchedules] = useState<LessonSchedule[]>(() => {
    try {
      const saved = localStorage.getItem('myschool_lesson_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'sch-001',
        day: 'Senin',
        startTime: '07:30',
        endTime: '09:45',
        classId: 'cls-xrpl1',
        className: 'X RPL 1',
        subjectId: 'sub-pwpb',
        subjectName: 'Pemrograman Web & Perangkat Bergerak',
        subjectCode: 'PWPB',
        teacherId: 'tch-001',
        teacherName: 'Budi Santoso, S.Kom., M.T.',
        teacherNip: '198405122010011008',
        room: 'Lab RPL 1',
        semester: 'ganjil',
        academicYear: '2026/2027',
        createdAt: '2026-07-15',
      },
      {
        id: 'sch-002',
        day: 'Senin',
        startTime: '10:00',
        endTime: '12:00',
        classId: 'cls-xrpl1',
        className: 'X RPL 1',
        subjectId: 'sub-bd',
        subjectName: 'Basis Data',
        subjectCode: 'BD',
        teacherId: 'tch-001',
        teacherName: 'Budi Santoso, S.Kom., M.T.',
        teacherNip: '198405122010011008',
        room: 'Lab RPL 2',
        semester: 'ganjil',
        academicYear: '2026/2027',
        createdAt: '2026-07-15',
      },
      {
        id: 'sch-003',
        day: 'Selasa',
        startTime: '07:30',
        endTime: '09:30',
        classId: 'cls-xrpl2',
        className: 'X RPL 2',
        subjectId: 'sub-pwpb',
        subjectName: 'Pemrograman Web & Perangkat Bergerak',
        subjectCode: 'PWPB',
        teacherId: 'tch-001',
        teacherName: 'Budi Santoso, S.Kom., M.T.',
        teacherNip: '198405122010011008',
        room: 'Lab RPL 1',
        semester: 'ganjil',
        academicYear: '2026/2027',
        createdAt: '2026-07-16',
      },
      {
        id: 'sch-004',
        day: 'Rabu',
        startTime: '08:00',
        endTime: '10:30',
        classId: 'cls-xtkj1',
        className: 'X TKJ 1',
        subjectId: 'sub-aij',
        subjectName: 'Administrasi Infrastruktur Jaringan',
        subjectCode: 'AIJ',
        teacherId: 'tch-002',
        teacherName: 'Siti Aminah, S.Pd., M.Kom.',
        teacherNip: '198709212012122003',
        room: 'Lab Jaringan Cisco',
        semester: 'ganjil',
        academicYear: '2026/2027',
        createdAt: '2026-07-17',
      },
    ];
  });

  // Realtime Cloud Sync State (Firestore)
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());

  // Mount Firestore real-time listeners for all collections
  useEffect(() => {
    // 1. Ensure Firestore is initially seeded with SMK Mardi Yuana Cikembar data
    ensureFirestorePopulated().catch(err => {
      console.warn('Firestore initial populate notice:', err);
    });

    // 2. Subscribe to real-time snapshot listeners across all collections
    const unsubscribe = subscribeAllCollections({
      onStudentsChange: data => {
        setStudents(data);
        localStorage.setItem('myschool_students', JSON.stringify(data));
      },
      onTeachersChange: data => {
        setTeachers(data);
        localStorage.setItem('myschool_teachers', JSON.stringify(data));
      },
      onClassesChange: data => {
        setClasses(data);
        localStorage.setItem('myschool_classes', JSON.stringify(data));
      },
      onMajorsChange: data => {
        setMajors(data);
        localStorage.setItem('myschool_majors', JSON.stringify(data));
      },
      onSubjectsChange: data => {
        setSubjects(data);
        localStorage.setItem('myschool_subjects', JSON.stringify(data));
      },
      onAcademicYearsChange: data => {
        setAcademicYears(data);
        localStorage.setItem('myschool_academic_years', JSON.stringify(data));
      },
      onAttendanceSessionsChange: data => {
        setAttendanceSessions(data);
        localStorage.setItem('myschool_attendance_sessions', JSON.stringify(data));
      },
      onAttendanceRecordsChange: data => {
        setAttendanceRecords(data);
        localStorage.setItem('myschool_attendance_records', JSON.stringify(data));
      },
      onAttendanceCorrectionsChange: data => {
        setAttendanceCorrections(data);
        localStorage.setItem('myschool_attendance_corrections', JSON.stringify(data));
      },
      onAssessmentsChange: data => {
        setAssessments(data);
        localStorage.setItem('myschool_assessments', JSON.stringify(data));
      },
      onAssessmentScoresChange: data => {
        setAssessmentScores(data);
        localStorage.setItem('myschool_assessment_scores', JSON.stringify(data));
      },
      onAuditLogsChange: data => {
        setAuditLogs(data);
        localStorage.setItem('myschool_audit_logs', JSON.stringify(data));
      },
      onNotificationsChange: data => {
        setNotifications(data);
        localStorage.setItem('myschool_notifications', JSON.stringify(data));
      },
      onChatMessagesChange: data => {
        setChatMessages(data);
        localStorage.setItem('myschool_chat_messages', JSON.stringify(data));
      },
      onDirectMessagesChange: data => {
        setDirectMessages(data);
        localStorage.setItem('myschool_direct_messages', JSON.stringify(data));
      },
      onReportTemplateChange: data => {
        setReportTemplate(prev => ({ ...prev, ...data }));
        localStorage.setItem('myschool_report_template', JSON.stringify(data));
      },
      onPklPartnersChange: data => {
        setPklPartners(data);
        localStorage.setItem('myschool_pkl_partners_v3', JSON.stringify(data));
      },
      onPklVisitsChange: data => {
        setPklVisits(data);
        localStorage.setItem('myschool_pkl_visits_v3', JSON.stringify(data));
      },
      onPklReportsChange: data => {
        setPklReports(data);
        localStorage.setItem('myschool_pkl_reports_v3', JSON.stringify(data));
      },
      onVisualSettingsChange: data => {
        setVisualSettings(prev => {
          const next = { ...prev, ...data };
          localStorage.setItem('myschool_visual_settings', JSON.stringify(next));
          return next;
        });
      },
      onLessonSchedulesChange: data => {
        if (data.length > 0) {
          setLessonSchedules(data);
          localStorage.setItem('myschool_lesson_schedules', JSON.stringify(data));
        }
      },
      onUsersChange: data => {
        setUsers(data);
        localStorage.setItem('myschool_users', JSON.stringify(data));
        setCurrentUser(curr => {
          const match = data.find(u => u.id === curr.id);
          if (match && (match.displayName !== curr.displayName || match.role !== curr.role || match.photoURL !== curr.photoURL || match.phone !== curr.phone)) {
            const merged = { ...curr, ...match };
            localStorage.setItem('myschool_current_user', JSON.stringify(merged));
            return merged;
          }
          return curr;
        });
      },
      onSyncStatusChange: status => {
        setIsFirestoreConnected(status.isConnected);
        setIsSyncing(status.isSyncing);
        setLastSyncTime(status.lastSync);
      },
    });

    return () => unsubscribe();
  }, []);

  // Force re-seed / cloud database sync utility
  const forceCloudResync = async () => {
    setIsSyncing(true);
    try {
      const res = await forceReseedFirestore();
      if (res.success) {
        setLastSyncTime(new Date());
        setIsFirestoreConnected(true);
        pushNotification('Sinkronisasi Berhasil', 'Seluruh data sekolah telah berhasil disinkronkan ke Cloud Firestore untuk semua perangkat dan peramban.', 'success');
      } else {
        pushNotification('Gagal Sinkronisasi', res.error || 'Terjadi kesalahan saat menyinkronkan data.', 'alert');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Local storage cache synchronization
  useEffect(() => {
    localStorage.setItem('myschool_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('myschool_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('myschool_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('myschool_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('myschool_majors', JSON.stringify(majors));
  }, [majors]);

  useEffect(() => {
    localStorage.setItem('myschool_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('myschool_academic_years', JSON.stringify(academicYears));
  }, [academicYears]);

  useEffect(() => {
    localStorage.setItem('myschool_attendance_sessions', JSON.stringify(attendanceSessions));
  }, [attendanceSessions]);

  useEffect(() => {
    localStorage.setItem('myschool_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('myschool_attendance_corrections', JSON.stringify(attendanceCorrections));
  }, [attendanceCorrections]);

  useEffect(() => {
    localStorage.setItem('myschool_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('myschool_assessment_scores', JSON.stringify(assessmentScores));
  }, [assessmentScores]);

  useEffect(() => {
    localStorage.setItem('myschool_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('myschool_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Helper for audit logs (synced to Firestore for all users/devices)
  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      userName: currentUser.displayName,
      userRole: currentUser.role,
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
    firestoreAddAuditLog(newLog).catch(() => {});
  };

  // Admin & User Profile Update (Profile Save - synced to Firestore)
  const updateCurrentUserProfile = (updates: Partial<User>) => {
    const updatedUser: User = {
      ...currentUser,
      ...updates,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('myschool_current_user', JSON.stringify(updatedUser));

    setUsers(prev => {
      const nextUsers = prev.map(u => (u.id === updatedUser.id ? updatedUser : u));
      localStorage.setItem('myschool_users', JSON.stringify(nextUsers));
      return nextUsers;
    });

    addAuditLog(
      'UPDATE_PROFILE',
      'Profil Admin / Akun',
      `Memperbarui profil data akun: ${updatedUser.displayName} (${updatedUser.email})`
    );

    // Per-profile notification: ONLY sent to this specific user profile!
    pushNotification(
      'Perubahan Profil Berhasil Disimpan',
      `Profil Anda (${updatedUser.displayName}) telah berhasil diperbarui dan disinkronkan ke basis data sekolah.`,
      'success',
      updatedUser.id,
      updatedUser.role,
      'Sistem MySchool',
      undefined,
      false,
      'profil'
    );

    // Persist to Cloud Firestore across all devices
    firestoreUpdateUser(updatedUser.id, updatedUser).catch(err => {
      console.warn('Error saving user profile to Firestore:', err);
    });

    // Sinkronisasi silang: jika akun adalah Guru, sinkronkan juga nama ke tabel Guru
    if (updatedUser.role === 'guru' || updatedUser.role === 'wali_kelas') {
      const matchTeacher = teachers.find(t => t.nip === updatedUser.nipOrNis || t.email === updatedUser.email || t.id === updatedUser.id);
      if (matchTeacher && updates.displayName) {
        setTeachers(prev => prev.map(t => t.id === matchTeacher.id ? { ...t, fullName: updates.displayName! } : t));
        firestoreUpdateTeacher(matchTeacher.id, { fullName: updates.displayName }).catch(() => {});
      }
    }

    // Sinkronisasi silang: jika akun adalah Siswa, sinkronkan juga nama ke tabel Siswa
    if (updatedUser.role === 'siswa') {
      const matchStudent = students.find(s => s.nis === updatedUser.nipOrNis || s.id === updatedUser.id);
      if (matchStudent && updates.displayName) {
        setStudents(prev => prev.map(s => s.id === matchStudent.id ? { ...s, fullName: updates.displayName! } : s));
        firestoreUpdateStudent(matchStudent.id, { fullName: updates.displayName }).catch(() => {});
      }
    }
  };

  // Helper for adding notifications (synced to Firestore)
  const pushNotification = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'alert' = 'info',
    recipientId?: string,
    targetRole?: UserRole | 'all',
    senderName?: string,
    senderRole?: UserRole,
    isBroadcast: boolean = false,
    category: 'akademik' | 'presensi' | 'pengumuman' | 'keamanan' | 'profil' | 'umum' = 'umum',
    urgency: 'normal' | 'penting' | 'mendesak' = 'normal'
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
      recipientId: recipientId || (isBroadcast ? undefined : currentUser.id),
      recipientName: recipientId ? users.find(u => u.id === recipientId)?.displayName : (!isBroadcast ? currentUser.displayName : undefined),
      targetRole: targetRole || (isBroadcast ? 'all' : undefined),
      senderName: senderName || currentUser.displayName,
      senderRole: senderRole || currentUser.role,
      isBroadcast,
      category,
      urgency,
    };
    setNotifications(prev => [newNotif, ...prev]);
    firestorePushNotification(newNotif).catch(() => {});
  };

  // Broadcast to all roles (Students only view, authorized roles can send)
  const sendBroadcastNotification = (
    title: string,
    message: string,
    urgency: 'normal' | 'penting' | 'mendesak' = 'penting',
    category: 'akademik' | 'presensi' | 'pengumuman' | 'keamanan' | 'profil' | 'umum' = 'pengumuman'
  ) => {
    pushNotification(
      title,
      message,
      urgency === 'mendesak' ? 'alert' : 'info',
      undefined, // all users
      'all',
      currentUser.displayName,
      currentUser.role,
      true, // isBroadcast
      category,
      urgency
    );
    addAuditLog('BROADCAST_NOTIFICATION', 'Pusat Pengumuman', `Mengirim pemberitahuan massal: "${title}" (${urgency.toUpperCase()}) ke semua role`);
  };

  // Student Chat Room & Admin Oversight (Synchronized to Cloud Firestore)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const cached = localStorage.getItem('myschool_chat_messages');
    return cached ? JSON.parse(cached) : initialChatMessages;
  });

  useEffect(() => {
    localStorage.setItem('myschool_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const sendChatMessage = (
    content: string,
    category: 'tugas' | 'mapel' | 'diskusi' | 'pengumuman' | 'santai' = 'diskusi'
  ) => {
    if (!content.trim()) return;
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderRole: currentUser.role,
      studentNis: currentUser.nipOrNis,
      studentClass: currentUser.className || (currentUser.role === 'siswa' ? 'X RPL 1' : undefined),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isAnnouncement: currentUser.role !== 'siswa',
      category,
    };
    setChatMessages(prev => [...prev, newMsg]);
    firestoreSendChat(newMsg).catch(() => {});
  };

  const deleteChatMessage = (messageId: string, reason?: string) => {
    setChatMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              deleted: true,
              deletedBy: `${currentUser.displayName} (${currentUser.role.toUpperCase()})`,
              content: `[Pesan dimoderasi dan dihapus oleh Administrator${reason ? `: ${reason}` : ''}]`,
            }
          : msg
      )
    );
    firestoreDeleteChat(messageId).catch(() => {});
    addAuditLog('MODERATE_CHAT', 'Pantauan Chat Siswa', `Administrator memoderasi dan menghapus pesan ID ${messageId}${reason ? ` (Alasan: ${reason})` : ''}`);
  };

  const sendModeratorAnnouncement = (content: string) => {
    if (!content.trim()) return;
    const newMsg: ChatMessage = {
      id: `chat-mod-${Date.now()}`,
      senderId: currentUser.id,
      senderName: `${currentUser.displayName} (Moderator/Admin TU)`,
      senderRole: currentUser.role,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isAnnouncement: true,
      category: 'pengumuman',
    };
    setChatMessages(prev => [...prev, newMsg]);
    firestoreSendChat(newMsg).catch(() => {});
    addAuditLog('ANNOUNCE_CHAT', 'Pantauan Chat Siswa', `Mengirim instruksi/pengumuman moderator ke ruang chat siswa`);
  };

  // Direct Message (1-on-1 DM) Methods
  const sendDirectMessage = (recipientId: string, recipientName: string, content: string) => {
    if (!content.trim()) return;
    const newMsg: ChatMessage = {
      id: `dm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderRole: currentUser.role,
      senderAvatar: currentUser.photoURL,
      studentNis: currentUser.nipOrNis,
      studentClass: currentUser.className,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isDirectMessage: true,
      recipientId,
      recipientName,
      category: 'diskusi',
    };
    setDirectMessages(prev => [...prev, newMsg]);
    firestoreSendDirectMessage(newMsg).catch(() => {});

    // Notify the recipient profile
    pushNotification(
      `Pesan Baru dari ${currentUser.displayName}`,
      content.length > 55 ? `${content.substring(0, 55)}...` : content,
      'info',
      recipientId,
      undefined,
      currentUser.displayName,
      currentUser.role,
      false,
      'umum'
    );
  };

  const deleteDirectMessage = (messageId: string) => {
    setDirectMessages(prev => prev.filter(m => m.id !== messageId));
    firestoreDeleteDirectMessage(messageId).catch(() => {});
  };

  // Custom Report Template / PDF Layout Designer
  const saveReportTemplate = (template: ReportCustomConfig) => {
    setReportTemplate(template);
    localStorage.setItem('myschool_report_template', JSON.stringify(template));
    firestoreSaveReportTemplate(template).catch(() => {});
    pushNotification(
      'Tata Letak Laporan PDF Disimpan',
      'Pengaturan kop surat, logo instansi, dan tanda tangan perorangan berhasil disinkronkan ke cloud.',
      'success'
    );
  };

  // Master Data Methods (Synced directly to Firestore & across all modules)
  const addStudent = (data: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudentId = `std-${Date.now()}`;
    const newStudent: Student = {
      ...data,
      id: newStudentId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStudents(prev => [newStudent, ...prev]);

    // Automatically create and sync User login account for the student
    const studentUser: User = {
      id: `usr-${newStudentId}`,
      email: `${newStudent.nis || newStudent.nisn}@siswa.smkmy-cikembar.sch.id`,
      displayName: newStudent.fullName,
      role: 'siswa',
      nipOrNis: newStudent.nis,
      classId: newStudent.classId,
      className: newStudent.className,
      phone: newStudent.phone || undefined,
      password: newStudent.password || 'siswa123',
      isActive: newStudent.status === 'aktif',
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => {
      const exists = prev.some(u => u.id === studentUser.id || (u.nipOrNis && u.nipOrNis === newStudent.nis));
      return exists ? prev.map(u => (u.nipOrNis === newStudent.nis ? { ...u, ...studentUser } : u)) : [studentUser, ...prev];
    });
    firestoreAddUser(studentUser).catch(() => {});

    // Update class student count
    setClasses(prev =>
      prev.map(c =>
        c.id === data.classId || c.name === data.className
          ? { ...c, studentCount: c.studentCount + 1 }
          : c
      )
    );
    addAuditLog('CREATE_STUDENT', 'Master Siswa', `Menambahkan siswa baru: ${newStudent.fullName} (${newStudent.nisn}) ke kelas ${newStudent.className}`);
    pushNotification('Siswa Baru Terdaftar', `${newStudent.fullName} (${newStudent.nisn}) berhasil ditambahkan dan akun login siswa telah disinkronkan.`, 'success');
    firestoreAddStudent(newStudent).catch(() => {});
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    const currentStudent = students.find(s => s.id === id);
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString().split('T')[0] } : s))
    );

    // 1. Sync to assessment scores if name or class changed
    if (data.fullName || data.className) {
      setAssessmentScores(prev =>
        prev.map(sc =>
          sc.studentId === id
            ? {
                ...sc,
                ...(data.fullName ? { studentName: data.fullName } : {}),
                ...(data.className ? { className: data.className } : {}),
              }
            : sc
        )
      );
    }

    // 2. Sync to attendance records & corrections if name or class changed
    if (data.fullName || data.className) {
      setAttendanceRecords(prev =>
        prev.map(r =>
          r.studentId === id
            ? {
                ...r,
                ...(data.fullName ? { studentName: data.fullName } : {}),
                ...(data.className ? { className: data.className } : {}),
              }
            : r
        )
      );
      setAttendanceCorrections(prev =>
        prev.map(c =>
          c.studentId === id
            ? {
                ...c,
                ...(data.fullName ? { studentName: data.fullName } : {}),
                ...(data.className ? { className: data.className } : {}),
              }
            : c
        )
      );
    }

    // 3. Sync to user account
    setUsers(prev =>
      prev.map(u => {
        const isMatch =
          u.id === id ||
          u.id === `usr-${id}` ||
          (currentStudent && u.nipOrNis === currentStudent.nis) ||
          (data.nis && u.nipOrNis === data.nis);
        if (isMatch) {
          const updatedUser: User = {
            ...u,
            ...(data.fullName ? { displayName: data.fullName } : {}),
            ...(data.nis ? { nipOrNis: data.nis } : {}),
            ...(data.classId ? { classId: data.classId } : {}),
            ...(data.className ? { className: data.className } : {}),
            ...(data.phone ? { phone: data.phone } : {}),
            ...(data.password ? { password: data.password } : {}),
            ...(data.status ? { isActive: data.status === 'aktif' } : {}),
          };
          firestoreUpdateUser(updatedUser.id, updatedUser).catch(() => {});
          return updatedUser;
        }
        return u;
      })
    );

    // If current logged-in user is this student, update currentUser state immediately
    setCurrentUser(curr => {
      const isMatch =
        curr.id === id ||
        curr.id === `usr-${id}` ||
        (currentStudent && curr.nipOrNis === currentStudent.nis) ||
        (data.nis && curr.nipOrNis === data.nis);
      if (isMatch) {
        const updated = {
          ...curr,
          ...(data.fullName ? { displayName: data.fullName } : {}),
          ...(data.className ? { className: data.className } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
          ...(data.password ? { password: data.password } : {}),
        };
        localStorage.setItem('myschool_current_user', JSON.stringify(updated));
        return updated;
      }
      return curr;
    });

    addAuditLog('UPDATE_STUDENT', 'Master Siswa', `Sinkronisasi update data & akun siswa ID: ${id}`);
    firestoreUpdateStudent(id, data).catch(() => {});
  };

  const archiveStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    if (!target) return;
    updateStudent(id, { status: 'mutasi' });
    addAuditLog('ARCHIVE_STUDENT', 'Master Siswa', `Mengarsipkan status siswa: ${target.fullName}`);
    pushNotification('Status Siswa Diarsipkan', `Status siswa ${target.fullName} diubah menjadi mutasi/arsip.`, 'warning');
  };

  const deleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    if (!target) return;

    // Clean cascade: remove student, records, scores, corrections
    setStudents(prev => prev.filter(s => s.id !== id));
    setAttendanceRecords(prev => prev.filter(r => r.studentId !== id));
    setAssessmentScores(prev => prev.filter(sc => sc.studentId !== id));
    setAttendanceCorrections(prev => prev.filter(c => c.studentId !== id));

    // Cascade delete student account from users & Firestore
    setUsers(prev => {
      const matched = prev.find(
        u => u.id === id || u.id === `usr-${id}` || (target.nis && u.nipOrNis === target.nis)
      );
      if (matched) {
        firestoreDeleteUser(matched.id).catch(() => {});
      }
      return prev.filter(u => u.id !== id && u.id !== `usr-${id}` && u.nipOrNis !== target.nis);
    });

    // Update class student count
    if (target.classId || target.className) {
      setClasses(prev =>
        prev.map(c =>
          (c.id === target.classId || c.name === target.className) && c.studentCount > 0
            ? { ...c, studentCount: Math.max(0, c.studentCount - 1) }
            : c
        )
      );
    }

    addAuditLog('DELETE_STUDENT', 'Master Siswa', `Menghapus data siswa & akun: ${target.fullName} (${target.nisn})`);
    pushNotification('Data Siswa Dihapus', `Data siswa ${target.fullName} (${target.nisn}) dan akun terkait telah dihapus permanen dari sistem.`, 'alert');
    firestoreDeleteStudent(id).catch(() => {});
  };

  const importStudents = (imported: Partial<Student>[]): number => {
    let count = 0;
    const now = new Date().toISOString().split('T')[0];
    const newEntries: Student[] = [];
    const newUsers: User[] = [];

    imported.forEach((item, idx) => {
      if (item.fullName && item.nisn) {
        const studentId = `std-imp-${Date.now()}-${idx}`;
        const nis = item.nis || `2425${1000 + idx}`;
        const newStd: Student = {
          id: studentId,
          nisn: item.nisn || `00${Date.now() + idx}`,
          nis,
          fullName: item.fullName,
          gender: item.gender === 'P' ? 'P' : 'L',
          classId: item.classId || classes[0].id,
          className: item.className || classes[0].name,
          majorId: item.majorId || majors[0].id,
          majorCode: item.majorCode || majors[0].code,
          address: item.address || 'Cikembar, Sukabumi',
          phone: item.phone || '',
          parentName: item.parentName || 'Orang Tua / Wali',
          parentPhone: item.parentPhone || '',
          password: 'siswa123',
          status: 'aktif',
          createdAt: now,
        };
        newEntries.push(newStd);

        newUsers.push({
          id: `usr-${studentId}`,
          email: `${nis}@siswa.smkmy-cikembar.sch.id`,
          displayName: item.fullName,
          role: 'siswa',
          nipOrNis: nis,
          classId: newStd.classId,
          className: newStd.className,
          phone: newStd.phone,
          password: 'siswa123',
          isActive: true,
          createdAt: new Date().toISOString(),
        });

        count++;
      }
    });

    if (newEntries.length > 0) {
      setStudents(prev => [...newEntries, ...prev]);
      setUsers(prev => [...newUsers, ...prev]);
      addAuditLog('IMPORT_STUDENTS', 'Master Siswa', `Mengimpor ${count} data siswa dan sinkronisasi akun dari spreadsheet/CSV.`);
      pushNotification('Impor Siswa Berhasil', `${count} data siswa dan akun login baru telah berhasil diimpor ke sistem.`, 'success');
      firestoreBatchImportStudents(newEntries).catch(() => {});
      newUsers.forEach(u => firestoreAddUser(u).catch(() => {}));
    }
    return count;
  };

  const addTeacher = (data: Omit<Teacher, 'id' | 'createdAt'>) => {
    const newTeacherId = `tch-${Date.now()}`;
    const newTeacher: Teacher = {
      ...data,
      id: newTeacherId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTeachers(prev => [newTeacher, ...prev]);

    // Automatically create and sync user account for the teacher
    const teacherUser: User = {
      id: `usr-${newTeacherId}`,
      email: newTeacher.email,
      displayName: newTeacher.fullName,
      role: newTeacher.isHomeroom ? 'wali_kelas' : 'guru',
      nipOrNis: newTeacher.nip,
      phone: newTeacher.phone || undefined,
      password: newTeacher.password || 'password123',
      homeroomClassId: newTeacher.homeroomClassId,
      homeroomClassName: newTeacher.homeroomClassName,
      subjects: newTeacher.subjects,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [teacherUser, ...prev]);
    firestoreAddUser(teacherUser).catch(() => {});

    addAuditLog('CREATE_TEACHER', 'Master Guru', `Menambahkan guru baru: ${newTeacher.fullName}`);
    pushNotification('Guru Baru Ditambahkan', `Pendidik ${newTeacher.fullName} telah terdaftar dan akun login guru berhasil disinkronkan.`, 'success');
    firestoreAddTeacher(newTeacher).catch(() => {});
  };

  const updateTeacher = (id: string, data: Partial<Teacher>) => {
    const currentTeacher = teachers.find(t => t.id === id);
    setTeachers(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)));

    // Sync to classes homeroom teacher name
    if (data.fullName) {
      setClasses(prev =>
        prev.map(c => (c.homeroomTeacherId === id ? { ...c, homeroomTeacherName: data.fullName! } : c))
      );
      setAssessments(prev =>
        prev.map(a => (a.teacherId === id ? { ...a, teacherName: data.fullName! } : a))
      );
      setAttendanceSessions(prev =>
        prev.map(s => (s.teacherId === id ? { ...s, teacherName: data.fullName! } : s))
      );
    }

    // Sync to user account
    setUsers(prev =>
      prev.map(u => {
        const isMatch =
          u.id === id ||
          u.id === `usr-${id}` ||
          (currentTeacher && (u.nipOrNis === currentTeacher.nip || u.email === currentTeacher.email)) ||
          (data.nip && u.nipOrNis === data.nip) ||
          (data.email && u.email === data.email);
        if (isMatch) {
          const updatedUser: User = {
            ...u,
            ...(data.fullName ? { displayName: data.fullName } : {}),
            ...(data.email ? { email: data.email } : {}),
            ...(data.nip ? { nipOrNis: data.nip } : {}),
            ...(data.phone ? { phone: data.phone } : {}),
            ...(data.password ? { password: data.password } : {}),
            ...(data.subjects ? { subjects: data.subjects } : {}),
            ...(data.isHomeroom !== undefined ? { role: data.isHomeroom ? 'wali_kelas' : 'guru' } : {}),
            ...(data.homeroomClassId !== undefined ? { homeroomClassId: data.homeroomClassId } : {}),
            ...(data.homeroomClassName !== undefined ? { homeroomClassName: data.homeroomClassName } : {}),
          };
          firestoreUpdateUser(updatedUser.id, updatedUser).catch(() => {});
          return updatedUser;
        }
        return u;
      })
    );

    // If current logged-in user is this teacher, update currentUser state
    setCurrentUser(curr => {
      const isMatch =
        curr.id === id ||
        curr.id === `usr-${id}` ||
        (currentTeacher && (curr.nipOrNis === currentTeacher.nip || curr.email === currentTeacher.email));
      if (isMatch) {
        const updated = {
          ...curr,
          ...(data.fullName ? { displayName: data.fullName } : {}),
          ...(data.email ? { email: data.email } : {}),
          ...(data.password ? { password: data.password } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
        };
        localStorage.setItem('myschool_current_user', JSON.stringify(updated));
        return updated;
      }
      return curr;
    });

    addAuditLog('UPDATE_TEACHER', 'Master Guru', `Sinkronisasi update data guru & akun ID: ${id}`);
    firestoreUpdateTeacher(id, data).catch(() => {});
  };

  const deleteTeacher = (id: string) => {
    const target = teachers.find(t => t.id === id);
    if (!target) return;

    setTeachers(prev => prev.filter(t => t.id !== id));

    // Clear homeroom assignment
    setClasses(prev =>
      prev.map(c =>
        c.homeroomTeacherId === id
          ? { ...c, homeroomTeacherId: '', homeroomTeacherName: 'Belum Ditentukan' }
          : c
      )
    );

    // Cascade delete teacher account
    setUsers(prev => {
      const matched = prev.find(
        u => u.id === id || u.id === `usr-${id}` || (target.nip && u.nipOrNis === target.nip) || (target.email && u.email === target.email)
      );
      if (matched) {
        firestoreDeleteUser(matched.id).catch(() => {});
      }
      return prev.filter(
        u => u.id !== id && u.id !== `usr-${id}` && u.nipOrNis !== target.nip && u.email !== target.email
      );
    });

    addAuditLog('DELETE_TEACHER', 'Master Guru', `Menghapus data & akun guru: ${target.fullName}`);
    pushNotification('Data Guru Dihapus', `Data pendidik ${target.fullName} dan akun terkait telah dihapus dari sistem.`, 'alert');
    firestoreDeleteTeacher(id).catch(() => {});
  };

  const addClass = (cls: Omit<ClassRoom, 'id' | 'createdAt'>) => {
    const newClass: ClassRoom = {
      ...cls,
      id: `cls-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClasses(prev => [newClass, ...prev]);
    addAuditLog('CREATE_CLASS', 'Master Kelas', `Membuat kelas baru: ${newClass.name}`);
    pushNotification('Kelas Baru Dibuat', `Rombel ${newClass.name} berhasil ditambahkan.`, 'success');
    firestoreAddClass(newClass).catch(() => {});
  };

  const updateClass = (id: string, cls: Partial<ClassRoom>) => {
    const prevClass = classes.find(c => c.id === id);
    setClasses(prev => prev.map(c => (c.id === id ? { ...c, ...cls } : c)));

    // Cascade update class name across all modules: students, attendance, assessments, scores, users
    if (cls.name && prevClass && cls.name !== prevClass.name) {
      const oldName = prevClass.name;
      const newName = cls.name;

      setStudents(prev =>
        prev.map(s => (s.classId === id || s.className === oldName ? { ...s, className: newName } : s))
      );
      setAttendanceSessions(prev =>
        prev.map(s => (s.classId === id || s.className === oldName ? { ...s, className: newName } : s))
      );
      setAttendanceRecords(prev =>
        prev.map(r => (r.classId === id ? { ...r } : r))
      );
      setAttendanceCorrections(prev =>
        prev.map(c => (c.classId === id || c.className === oldName ? { ...c, className: newName } : c))
      );
      setAssessments(prev =>
        prev.map(a => (a.classId === id || a.className === oldName ? { ...a, className: newName } : a))
      );
      setAssessmentScores(prev =>
        prev.map(sc => (sc.classId === id ? { ...sc } : sc))
      );
      setUsers(prev =>
        prev.map(u => (u.classId === id || u.className === oldName ? { ...u, className: newName } : u))
      );
    }

    addAuditLog('UPDATE_CLASS', 'Master Kelas', `Memperbarui data kelas ID: ${id} & sinkronisasi modul terkait`);
    firestoreUpdateClass(id, cls).catch(() => {});
  };

  const deleteClass = (id: string) => {
    const target = classes.find(c => c.id === id);
    if (!target) return;

    setClasses(prev => prev.filter(c => c.id !== id));

    // Update students belonging to this class
    setStudents(prev =>
      prev.map(s =>
        s.classId === id || s.className === target.name
          ? { ...s, className: 'Belum Ada Kelas' }
          : s
      )
    );

    // Clean attendance sessions & records for this class
    const sessionIdsToDelete = attendanceSessions.filter(s => s.classId === id).map(s => s.id);
    setAttendanceSessions(prev => prev.filter(s => s.classId !== id));
    setAttendanceRecords(prev => prev.filter(r => !sessionIdsToDelete.includes(r.sessionId) && r.classId !== id));

    // Clean assessments & scores for this class
    const assessmentIdsToDelete = assessments.filter(a => a.classId === id).map(a => a.id);
    setAssessments(prev => prev.filter(a => a.classId !== id));
    setAssessmentScores(prev => prev.filter(sc => !assessmentIdsToDelete.includes(sc.assessmentId) && sc.classId !== id));

    // Update users who were assigned to this class
    setUsers(prev =>
      prev.map(u => (u.classId === id ? { ...u, className: undefined, classId: undefined } : u))
    );

    addAuditLog('DELETE_CLASS', 'Master Kelas', `Menghapus data rombel kelas: ${target.name}`);
    pushNotification('Kelas Dihapus', `Rombel ${target.name} dan data terkait telah dihapus dari sistem.`, 'alert');
    firestoreDeleteClass(id).catch(() => {});
  };

  const addSubject = (subj: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subj,
      id: `sub-${Date.now()}`,
    };
    setSubjects(prev => [newSubject, ...prev]);
    addAuditLog('CREATE_SUBJECT', 'Master Mapel', `Menambahkan mata pelajaran: ${newSubject.name}`);
    pushNotification('Mata Pelajaran Ditambahkan', `Mapel ${newSubject.name} (${newSubject.code}) berhasil ditambahkan.`, 'success');
    firestoreAddSubject(newSubject).catch(() => {});
  };

  const updateSubject = (id: string, subj: Partial<Subject>) => {
    const prevSubj = subjects.find(s => s.id === id);
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...subj } : s)));

    // Cascade update subject name & code across assessments & scores
    if (prevSubj && (subj.name || subj.code || subj.kkm)) {
      setAssessments(prev =>
        prev.map(a =>
          a.subjectId === id
            ? {
                ...a,
                ...(subj.name ? { subjectName: subj.name } : {}),
                ...(subj.code ? { subjectCode: subj.code } : {}),
                ...(subj.kkm ? { kkm: subj.kkm } : {}),
              }
            : a
        )
      );
      setAssessmentScores(prev =>
        prev.map(sc => (sc.subjectId === id && subj.name ? { ...sc, subjectName: subj.name } : sc))
      );
    }

    addAuditLog('UPDATE_SUBJECT', 'Master Mapel', `Memperbarui mata pelajaran ID: ${id} & sinkronisasi penilaian`);
    firestoreUpdateSubject(id, subj).catch(() => {});
  };

  const deleteSubject = (id: string) => {
    const target = subjects.find(s => s.id === id);
    if (!target) return;

    setSubjects(prev => prev.filter(s => s.id !== id));

    // Cascade clean assessments and scores for this subject to prevent null subject reference crash in grading calculations!
    const affectedAssessmentIds = assessments.filter(a => a.subjectId === id).map(a => a.id);
    setAssessments(prev => prev.filter(a => a.subjectId !== id));
    setAssessmentScores(prev => prev.filter(sc => !affectedAssessmentIds.includes(sc.assessmentId) && sc.subjectId !== id));

    addAuditLog('DELETE_SUBJECT', 'Master Mapel', `Menghapus mata pelajaran: ${target.name}`);
    pushNotification('Mata Pelajaran Dihapus', `Mapel ${target.name} (${target.code}) telah dihapus dari kurikulum.`, 'alert');
    firestoreDeleteSubject(id).catch(() => {});
  };

  const addMajor = (data: Omit<Major, 'id'>) => {
    const newMajor: Major = {
      ...data,
      id: `maj-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now()}`,
    };
    setMajors(prev => [...prev, newMajor]);
    addAuditLog('CREATE_MAJOR', 'Master Jurusan', `Menambahkan kompetensi keahlian: ${newMajor.name} (${newMajor.code})`);
    pushNotification('Jurusan Baru Ditambahkan', `Kompetensi keahlian ${newMajor.name} (${newMajor.code}) berhasil ditambahkan.`, 'success');
    firestoreAddMajor(newMajor).catch(() => {});
  };

  const updateMajor = (id: string, data: Partial<Major>) => {
    setMajors(prev => prev.map(m => (m.id === id ? { ...m, ...data } : m)));
    addAuditLog('UPDATE_MAJOR', 'Master Jurusan', `Memperbarui kompetensi keahlian ID: ${id}`);
    pushNotification('Jurusan Diperbarui', 'Data program keahlian berhasil diperbarui.', 'info');
    firestoreUpdateMajor(id, data).catch(() => {});
  };

  const deleteMajor = (id: string) => {
    const target = majors.find(m => m.id === id);
    if (!target) return;

    setMajors(prev => prev.filter(m => m.id !== id));
    addAuditLog('DELETE_MAJOR', 'Master Jurusan', `Menghapus kompetensi keahlian: ${target.name} (${target.code})`);
    pushNotification('Jurusan Dihapus', `Kompetensi keahlian ${target.name} (${target.code}) telah dihapus.`, 'alert');
    firestoreDeleteMajor(id).catch(() => {});
  };

  const addAcademicYear = (year: Omit<AcademicYear, 'id'>) => {
    const newYear: AcademicYear = {
      ...year,
      id: `ay-${Date.now()}`,
    };
    setAcademicYears(prev => [...prev, newYear]);
    addAuditLog('CREATE_ACADEMIC_YEAR', 'Tahun Ajaran', `Menambahkan tahun ajaran baru: ${newYear.name} (${newYear.activeSemester})`);
    pushNotification('Tahun Ajaran Ditambahkan', `Tahun ajaran ${newYear.name} telah dibuat.`, 'success');
    firestoreAddAcademicYear(newYear).catch(() => {});
  };

  const deleteAcademicYear = (id: string) => {
    const target = academicYears.find(y => y.id === id);
    if (!target) return;

    if (target.isActive) {
      alert('Tahun ajaran yang sedang aktif tidak dapat dihapus! Silakan aktifkan tahun ajaran lain terlebih dahulu.');
      return;
    }

    setAcademicYears(prev => prev.filter(y => y.id !== id));
    addAuditLog('DELETE_ACADEMIC_YEAR', 'Tahun Ajaran', `Menghapus arsip tahun ajaran: ${target.name} (${target.activeSemester})`);
    pushNotification('Tahun Ajaran Dihapus', `Arsip tahun ajaran ${target.name} telah dihapus.`, 'alert');
    firestoreDeleteAcademicYear(id).catch(() => {});
  };

  const setActiveAcademicYear = (yearId: string) => {
    setAcademicYears(prev =>
      prev.map(y => ({
        ...y,
        isActive: y.id === yearId,
      }))
    );
    const target = academicYears.find(y => y.id === yearId);
    addAuditLog('SET_ACADEMIC_YEAR', 'Tahun Ajaran', `Mengubah tahun ajaran aktif ke: ${target?.name || yearId}`);
    pushNotification('Tahun Ajaran Diubah', `Tahun ajaran aktif sekarang: ${target?.name || yearId}.`, 'info');
    firestoreSetActiveAcademicYear(academicYears, yearId).catch(() => {});
  };

  // Attendance Operations
  const saveAttendanceSessionAndRecords = (
    sessionData: Omit<AttendanceSession, 'id' | 'createdAt' | 'updatedAt' | 'presentCount' | 'sickCount' | 'leaveCount' | 'absentCount' | 'lateCount' | 'totalStudents'>,
    records: { studentId: string; status: AttendanceStatus; note?: string }[],
    isFinal: boolean
  ): string => {
    const now = new Date().toISOString();
    const existingSession = attendanceSessions.find(
      s => s.date === sessionData.date && s.classId === sessionData.classId && s.type === sessionData.type && (sessionData.type === 'harian' || s.subjectId === sessionData.subjectId)
    );

    const sessionId = existingSession ? existingSession.id : `ses-${Date.now()}`;

    let present = 0, sick = 0, leave = 0, absent = 0, late = 0;
    records.forEach(r => {
      if (r.status === 'H') present++;
      else if (r.status === 'S') sick++;
      else if (r.status === 'I') leave++;
      else if (r.status === 'A') absent++;
      else if (r.status === 'T') late++;
    });

    const session: AttendanceSession = {
      ...sessionData,
      id: sessionId,
      status: isFinal ? 'final' : 'draft',
      totalStudents: records.length,
      presentCount: present,
      sickCount: sick,
      leaveCount: leave,
      absentCount: absent,
      lateCount: late,
      createdAt: existingSession ? existingSession.createdAt : now,
      updatedAt: now,
    };

    setAttendanceSessions(prev => [session, ...prev.filter(s => s.id !== sessionId)]);

    // Prepare line records
    const newRecords: AttendanceRecord[] = records.map(r => {
      const student = students.find(s => s.id === r.studentId);
      return {
        id: `att-${sessionId}-${r.studentId}`,
        sessionId: sessionId,
        date: sessionData.date,
        studentId: r.studentId,
        studentName: student?.fullName || 'Siswa',
        nisn: student?.nisn || '',
        classId: sessionData.classId,
        status: r.status,
        note: r.note || '',
        updatedBy: currentUser.displayName,
        createdAt: now,
      };
    });

    // Replace old records for this session
    setAttendanceRecords(prev => [
      ...newRecords,
      ...prev.filter(pr => pr.sessionId !== sessionId),
    ]);

    addAuditLog(
      isFinal ? 'FINALIZE_ATTENDANCE' : 'SAVE_DRAFT_ATTENDANCE',
      'Absensi Siswa',
      `${isFinal ? 'Finalisasi' : 'Simpan Draf'} presensi kelas ${sessionData.className} tanggal ${sessionData.date} (${present} Hadir, ${sick} Sakit, ${leave} Izin, ${absent} Alpa, ${late} Terlambat)`
    );

    pushNotification(
      isFinal ? 'Presensi Telah Difinalisasi' : 'Draf Presensi Disimpan',
      `Presensi ${sessionData.type === 'harian' ? 'Harian' : sessionData.subjectName} kelas ${sessionData.className} tgl ${sessionData.date} berhasil disimpan.`,
      'success'
    );

    // Sync to Cloud Firestore in real time for all devices
    firestoreSaveAttendance(session, newRecords).catch(err => {
      console.warn('Error syncing attendance to Firestore:', err);
    });

    return sessionId;
  };

  const deleteAttendanceSession = (sessionId: string) => {
    const target = attendanceSessions.find(s => s.id === sessionId);
    if (!target) return;

    const recordIdsToDelete = attendanceRecords.filter(r => r.sessionId === sessionId).map(r => r.id);

    setAttendanceSessions(prev => prev.filter(s => s.id !== sessionId));
    setAttendanceRecords(prev => prev.filter(r => r.sessionId !== sessionId));

    addAuditLog('DELETE_ATTENDANCE_SESSION', 'Absensi Siswa', `Menghapus sesi presensi: ${target.className} (${target.date})`);
    pushNotification('Sesi Presensi Dihapus', `Rekaman presensi kelas ${target.className} tanggal ${target.date} telah dihapus dari database.`, 'alert');

    firestoreDeleteAttendanceSessionAndRecords(sessionId, recordIdsToDelete).catch(() => {});
  };

  const clearAttendanceForClassAndDate = (classId: string, date: string, type: 'harian' | 'mapel' = 'harian', subjectId?: string) => {
    const matchingSessions = attendanceSessions.filter(
      s => s.classId === classId && s.date === date && s.type === type && (type === 'harian' || s.subjectId === subjectId)
    );
    const sessionIds = matchingSessions.map(s => s.id);
    const recordIds = attendanceRecords
      .filter(r => sessionIds.includes(r.sessionId) || (r.classId === classId && r.date === date))
      .map(r => r.id);

    setAttendanceSessions(prev => prev.filter(s => !sessionIds.includes(s.id)));
    setAttendanceRecords(prev => prev.filter(r => !sessionIds.includes(r.sessionId) && !(r.classId === classId && r.date === date)));

    addAuditLog('CLEAR_ATTENDANCE', 'Absensi Siswa', `Mengosongkan/menghapus rekaman presensi kelas ID ${classId} tanggal ${date}`);
    pushNotification('Presensi Dikosongkan', `Rekaman presensi tanggal ${date} telah dikosongkan dan dihapus dari database.`, 'info');

    sessionIds.forEach(sid => {
      firestoreDeleteAttendanceSessionAndRecords(sid, recordIds).catch(() => {});
    });
  };

  const resetClassAttendanceToZero = (classId: string) => {
    const targetClass = classes.find(c => c.id === classId) || classes[0];
    if (!targetClass) return;

    const oldClassSessionIds = attendanceSessions
      .filter(s => s.classId === classId || s.className === targetClass.name)
      .map(s => s.id);
    const oldClassRecordIds = attendanceRecords
      .filter(
        r =>
          r.classId === classId ||
          oldClassSessionIds.includes(r.sessionId) ||
          students.some(st => (st.classId === classId || st.className === targetClass.name) && st.id === r.studentId)
      )
      .map(r => r.id);

    setAttendanceSessions(prev => {
      const next = prev.filter(s => s.classId !== classId && s.className !== targetClass.name);
      localStorage.setItem('myschool_attendance_sessions', JSON.stringify(next));
      return next;
    });

    setAttendanceRecords(prev => {
      const next = prev.filter(r => !oldClassRecordIds.includes(r.id));
      localStorage.setItem('myschool_attendance_records', JSON.stringify(next));
      return next;
    });

    addAuditLog(
      'RESET_CLASS_ATTENDANCE',
      'Absensi Siswa',
      `Mereset seluruh hitungan presensi kelas ${targetClass.name} menjadi 0 di database Cloud Firestore`
    );
    pushNotification(
      'Presensi Kelas Direset',
      `Seluruh hitungan presensi kelas ${targetClass.name} telah direset menjadi 0 dan disinkronkan ke database.`,
      'info'
    );

    firestoreSyncClassAttendanceRecap([], [], oldClassSessionIds, oldClassRecordIds).catch(() => {});
  };

  const syncClassAttendanceRecapToDatabase = (
    classId: string,
    entriesOrClassName: any,
    maybeEntries?: any[]
  ) => {
    const rawEntries: any[] = Array.isArray(entriesOrClassName)
      ? entriesOrClassName
      : Array.isArray(maybeEntries)
      ? maybeEntries
      : [];

    const targetClass = classes.find(c => c.id === classId) || classes[0];
    if (!targetClass) return;
    const now = new Date().toISOString();
    const todayDate = now.split('T')[0];

    const normalizedEntries = rawEntries.map(e => ({
      studentId: e.studentId,
      nisn: e.nisn || '',
      nis: e.nis || '',
      fullName: e.fullName || e.studentName || 'Siswa',
      h: Math.max(0, Number(e.h ?? e.hadir ?? 0) || 0),
      s: Math.max(0, Number(e.s ?? e.sakit ?? 0) || 0),
      i: Math.max(0, Number(e.i ?? e.izin ?? 0) || 0),
      a: Math.max(0, Number(e.a ?? e.alpa ?? 0) || 0),
      t: Math.max(0, Number(e.t ?? e.terlambat ?? 0) || 0),
      note: e.teacherNote || e.note || 'Tersinkronisasi dari Rekapitulasi Presensi',
    }));

    // 1. Sync any newly added or edited students in entries to Master Students
    normalizedEntries.forEach(entry => {
      const existingStd = students.find(st => st.id === entry.studentId);
      if (!existingStd && entry.studentId) {
        const newStudent: Student = {
          id: entry.studentId,
          nisn: entry.nisn || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
          nis: entry.nis || `2425${Math.floor(1000 + Math.random() * 8999)}`,
          fullName: entry.fullName,
          gender: 'L',
          classId: targetClass.id,
          className: targetClass.name,
          majorId: targetClass.majorId,
          majorCode: targetClass.majorCode,
          address: 'Cikembar, Sukabumi',
          phone: '',
          parentName: 'Orang Tua / Wali',
          parentPhone: '',
          status: 'aktif',
          createdAt: todayDate,
        };
        setStudents(prev => [...prev, newStudent]);
        firestoreAddStudent(newStudent).catch(() => {});
      } else if (existingStd && (existingStd.fullName !== entry.fullName || existingStd.nisn !== entry.nisn)) {
        updateStudent(entry.studentId, { fullName: entry.fullName, nisn: entry.nisn });
      }
    });

    // 2. Build synchronized AttendanceSessions & AttendanceRecords for this class
    const classStudentIds = new Set(
      students
        .filter(st => st.classId === classId || st.className === targetClass.name)
        .map(st => st.id)
    );
    normalizedEntries.forEach(e => classStudentIds.add(e.studentId));

    const oldClassSessionIds = attendanceSessions
      .filter(s => s.classId === classId || s.className === targetClass.name)
      .map(s => s.id);
    const oldClassRecordIds = attendanceRecords
      .filter(
        r =>
          r.classId === classId ||
          oldClassSessionIds.includes(r.sessionId) ||
          classStudentIds.has(r.studentId)
      )
      .map(r => r.id);

    const maxSessionsCount = Math.max(
      0,
      ...normalizedEntries.map(e => e.h + e.s + e.i + e.a + e.t)
    );

    const newSessions: AttendanceSession[] = [];
    const newRecords: AttendanceRecord[] = [];

    // Generate per-student status arrays of length maxSessionsCount
    const studentStatusTimelines: Record<string, AttendanceStatus[]> = {};
    normalizedEntries.forEach(entry => {
      const statuses: AttendanceStatus[] = [];
      for (let k = 0; k < entry.h; k++) statuses.push('H');
      for (let k = 0; k < entry.s; k++) statuses.push('S');
      for (let k = 0; k < entry.i; k++) statuses.push('I');
      for (let k = 0; k < entry.a; k++) statuses.push('A');
      for (let k = 0; k < entry.t; k++) statuses.push('T');
      studentStatusTimelines[entry.studentId] = statuses;
    });

    for (let sIdx = 0; sIdx < maxSessionsCount; sIdx++) {
      const sessionDateObj = new Date(Date.now() - (maxSessionsCount - 1 - sIdx) * 24 * 60 * 60 * 1000);
      const sDate = sessionDateObj.toISOString().split('T')[0];
      const sessionId = `ses-sync-${classId}-${sIdx + 1}`;

      let present = 0, sick = 0, leave = 0, absent = 0, late = 0;

      normalizedEntries.forEach(entry => {
        const timeline = studentStatusTimelines[entry.studentId] || [];
        if (sIdx < timeline.length) {
          const st = timeline[sIdx];
          if (st === 'H') present++;
          else if (st === 'S') sick++;
          else if (st === 'I') leave++;
          else if (st === 'A') absent++;
          else if (st === 'T') late++;

          newRecords.push({
            id: `att-${sessionId}-${entry.studentId}`,
            sessionId,
            date: sDate,
            studentId: entry.studentId,
            studentName: entry.fullName,
            nisn: entry.nisn,
            classId,
            status: st,
            note: entry.note,
            updatedBy: currentUser.displayName,
            createdAt: now,
          });
        }
      });

      if (present + sick + leave + absent + late > 0) {
        newSessions.push({
          id: sessionId,
          date: sDate,
          classId,
          className: targetClass.name,
          type: 'harian',
          teacherId: currentUser.id,
          teacherName: currentUser.displayName,
          academicYearId: activeAcademicYear.id,
          semester: activeAcademicYear.activeSemester,
          status: 'final',
          totalStudents: normalizedEntries.length,
          presentCount: present,
          sickCount: sick,
          leaveCount: leave,
          absentCount: absent,
          lateCount: late,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    setAttendanceSessions(prev => {
      const next = [
        ...newSessions.reverse(),
        ...prev.filter(s => s.classId !== classId && s.className !== targetClass.name),
      ];
      localStorage.setItem('myschool_attendance_sessions', JSON.stringify(next));
      return next;
    });
    setAttendanceRecords(prev => {
      const next = [
        ...newRecords,
        ...prev.filter(r => !oldClassRecordIds.includes(r.id)),
      ];
      localStorage.setItem('myschool_attendance_records', JSON.stringify(next));
      return next;
    });

    addAuditLog(
      'SYNC_ATTENDANCE_RECAP',
      'Absensi Siswa',
      `Menyimpan & menyinkronkan rekap presensi kelas ${targetClass.name} (${normalizedEntries.length} siswa) langsung ke database Cloud Firestore`
    );
    pushNotification(
      'Rekap Presensi Tersinkronisasi',
      `Data rekapitulasi presensi kelas ${targetClass.name} berhasil disimpan ke database dan disinkronkan ke seluruh menu.`,
      'success'
    );

    firestoreSyncClassAttendanceRecap(newSessions, newRecords, oldClassSessionIds, oldClassRecordIds).catch(() => {});
  };

  const submitAttendanceCorrection = (req: Omit<AttendanceCorrection, 'id' | 'requestedAt' | 'status'>) => {
    const newCorrection: AttendanceCorrection = {
      ...req,
      id: `cor-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    setAttendanceCorrections(prev => [newCorrection, ...prev]);
    addAuditLog('REQUEST_CORRECTION', 'Koreksi Absensi', `Siswa ${req.studentName} mengajukan koreksi status ${req.currentStatus} -> ${req.requestedStatus} pada tgl ${req.date}`);
    pushNotification('Permohonan Koreksi Presensi', `${req.studentName} (${req.className}) mengajukan koreksi absensi tanggal ${req.date}.`, 'warning');
    setDoc(doc(db, 'attendanceCorrections', newCorrection.id), newCorrection).catch(() => {});
  };

  const reviewAttendanceCorrection = (id: string, status: 'approved' | 'rejected', reviewerNote?: string) => {
    const target = attendanceCorrections.find(c => c.id === id);
    if (!target) return;

    setAttendanceCorrections(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              status,
              reviewerNote: reviewerNote || (status === 'approved' ? 'Disetujui oleh Wali Kelas / Guru' : 'Ditolak'),
              reviewedBy: currentUser.displayName,
              reviewedAt: new Date().toISOString(),
            }
          : c
      )
    );

    // If approved, update or create the attendance record in state AND Firestore!
    if (status === 'approved') {
      const existingRec = attendanceRecords.find(r => r.studentId === target.studentId && r.date === target.date);
      if (existingRec) {
        const updatedRecord: AttendanceRecord = {
          ...existingRec,
          status: target.requestedStatus,
          note: `Koreksi disetujui: ${target.reason}`,
          updatedBy: currentUser.displayName,
        };
        setAttendanceRecords(prev => prev.map(r => (r.id === existingRec.id ? updatedRecord : r)));
        firestoreUpdateAttendanceRecord(updatedRecord).catch(() => {});
      } else {
        const newRec: AttendanceRecord = {
          id: `att-cor-${target.id}`,
          sessionId: target.sessionId || `ses-cor-${target.date}`,
          date: target.date,
          studentId: target.studentId,
          studentName: target.studentName,
          nisn: target.nisn,
          classId: target.classId,
          status: target.requestedStatus,
          note: `Koreksi disetujui: ${target.reason}`,
          updatedBy: currentUser.displayName,
          createdAt: new Date().toISOString(),
        };
        setAttendanceRecords(prev => [newRec, ...prev]);
        firestoreUpdateAttendanceRecord(newRec).catch(() => {});
      }
    }

    addAuditLog('REVIEW_CORRECTION', 'Koreksi Absensi', `${status === 'approved' ? 'Menyetujui' : 'Menolak'} permohonan koreksi absensi ${target.studentName}`);
    pushNotification(
      `Koreksi Presensi ${status === 'approved' ? 'Disetujui' : 'Ditolak'}`,
      `Permohonan koreksi presensi siswa ${target.studentName} (${target.date}) telah ${status === 'approved' ? 'disetujui' : 'ditolak'}.`,
      status === 'approved' ? 'success' : 'alert'
    );
    setDoc(
      doc(db, 'attendanceCorrections', id),
      {
        status,
        reviewerNote: reviewerNote || (status === 'approved' ? 'Disetujui oleh Wali Kelas / Guru' : 'Ditolak'),
        reviewedBy: currentUser.displayName,
        reviewedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});
  };

  const deleteAttendanceCorrection = (id: string) => {
    const target = attendanceCorrections.find(c => c.id === id);
    if (!target) return;

    setAttendanceCorrections(prev => prev.filter(c => c.id !== id));
    addAuditLog('DELETE_CORRECTION', 'Koreksi Absensi', `Menghapus permohonan koreksi absensi: ${target.studentName}`);
    pushNotification('Permohonan Koreksi Dihapus', `Permohonan koreksi absensi ${target.studentName} telah dihapus.`, 'info');
    deleteDoc(doc(db, 'attendanceCorrections', id)).catch(() => {});
  };

  // Assessment Operations
  const createAssessment = (asm: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): string => {
    const now = new Date().toISOString();
    const newAsm: Assessment = {
      ...asm,
      id: `asm-${Date.now()}`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    setAssessments(prev => [newAsm, ...prev]);
    addAuditLog('CREATE_ASSESSMENT', 'Penilaian Akademik', `Membuat komponen penilaian baru: ${newAsm.title} (${newAsm.subjectName} - ${newAsm.className})`);
    pushNotification('Komponen Penilaian Baru', `Komponen ${newAsm.title} (${newAsm.subjectName}) berhasil dibuat.`, 'success');
    firestoreSaveAssessment(newAsm, []).catch(() => {});
    return newAsm.id;
  };

  const updateAssessment = (id: string, data: Partial<Assessment>) => {
    let updated: Assessment | undefined;
    setAssessments(prev =>
      prev.map(a => {
        if (a.id === id) {
          updated = { ...a, ...data, updatedAt: new Date().toISOString() };
          return updated;
        }
        return a;
      })
    );
    addAuditLog('UPDATE_ASSESSMENT', 'Penilaian Akademik', `Memperbarui komponen penilaian ID: ${id}`);
    if (updated) {
      firestoreSaveAssessment(updated, []).catch(() => {});
    }
  };

  const deleteAssessment = (assessmentId: string) => {
    const target = assessments.find(a => a.id === assessmentId);
    if (!target) return;

    // Clean cascade: delete assessment & associated scores
    setAssessments(prev => prev.filter(a => a.id !== assessmentId));
    setAssessmentScores(prev => prev.filter(s => s.assessmentId !== assessmentId));

    addAuditLog('DELETE_ASSESSMENT', 'Penilaian Akademik', `Menghapus komponen penilaian: ${target.title} (${target.subjectName} - ${target.className})`);
    pushNotification('Komponen Penilaian Dihapus', `Penilaian ${target.title} dan seluruh nilai siswa terkait telah dihapus permanen.`, 'alert');
    deleteDoc(doc(db, 'assessments', assessmentId)).catch(() => {});
  };

  const resetAssessmentScores = (assessmentId: string) => {
    const target = assessments.find(a => a.id === assessmentId);
    if (!target) return;

    setAssessmentScores(prev => prev.filter(s => s.assessmentId !== assessmentId));
    addAuditLog('RESET_SCORES', 'Penilaian Akademik', `Mereset/mengosongkan seluruh nilai siswa pada penilaian: ${target.title}`);
    pushNotification('Nilai Dikosongkan', `Nilai siswa pada komponen ${target.title} berhasil direset ke 0.`, 'info');
  };

  const saveAssessmentScores = (assessmentId: string, scores: { studentId: string; score: number; feedback?: string }[]) => {
    const now = new Date().toISOString().split('T')[0];
    const asm = assessments.find(a => a.id === assessmentId);
    if (!asm) return;

    const newScores: AssessmentScore[] = scores.map(s => {
      const student = students.find(std => std.id === s.studentId);
      return {
        id: `sc-${assessmentId}-${s.studentId}`,
        assessmentId,
        studentId: s.studentId,
        studentName: student?.fullName || 'Siswa',
        nisn: student?.nisn || '',
        classId: asm.classId,
        subjectId: asm.subjectId,
        score: s.score,
        feedback: s.feedback || '',
        updatedBy: currentUser.displayName,
        updatedAt: now,
      };
    });

    setAssessmentScores(prev => [
      ...newScores,
      ...prev.filter(ps => ps.assessmentId !== assessmentId),
    ]);

    addAuditLog('INPUT_SCORES', 'Penilaian Akademik', `Menyimpan ${scores.length} nilai siswa untuk penilaian: ${asm.title}`);
    firestoreSaveAssessment(asm, newScores).catch(() => {});
  };

  const publishAssessment = (assessmentId: string) => {
    const target = assessments.find(a => a.id === assessmentId);
    if (!target) return;

    updateAssessment(assessmentId, { status: 'dipublikasikan' });
    addAuditLog('PUBLISH_ASSESSMENT', 'Penilaian Akademik', `Mempublikasikan nilai untuk: ${target.title} (${target.className})`);
    pushNotification('Nilai Baru Dipublikasikan', `Nilai ${target.title} (${target.subjectName}) kelas ${target.className} telah dipublikasikan.`, 'info');
  };

  // User Management
  const addUser = (userData: Omit<User, 'id' | 'createdAt'> & { permissions?: string[] }) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => {
      const nextUsers = [newUser, ...prev];
      localStorage.setItem('myschool_users', JSON.stringify(nextUsers));
      return nextUsers;
    });

    // Bidirectional sync: if creating a student account, ensure student exists in master data
    if (newUser.role === 'siswa') {
      const exists = students.some(s => s.nis === newUser.nipOrNis || s.fullName.toLowerCase() === newUser.displayName.toLowerCase());
      if (!exists) {
        const autoStudent: Student = {
          id: `std-${Date.now()}`,
          nisn: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
          nis: newUser.nipOrNis || `2425${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: newUser.displayName,
          gender: 'L',
          classId: newUser.classId || classes[0]?.id || 'cls-xrpl1',
          className: newUser.className || classes[0]?.name || 'X RPL 1',
          majorId: classes[0]?.majorId || 'maj-rpl',
          majorCode: classes[0]?.majorCode || 'RPL',
          address: 'Cikembar, Sukabumi',
          phone: newUser.phone || '',
          parentName: 'Orang Tua / Wali',
          parentPhone: '',
          password: newUser.password || 'siswa123',
          status: 'aktif',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setStudents(prev => [autoStudent, ...prev]);
        firestoreAddStudent(autoStudent).catch(() => {});
      }
    }

    // Bidirectional sync: if creating a teacher account, ensure teacher exists in master data
    if (newUser.role === 'guru' || newUser.role === 'wali_kelas') {
      const exists = teachers.some(t => t.nip === newUser.nipOrNis || t.email === newUser.email);
      if (!exists) {
        const autoTeacher: Teacher = {
          id: `tch-${Date.now()}`,
          nip: newUser.nipOrNis || `198${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          fullName: newUser.displayName,
          gender: 'L',
          email: newUser.email,
          phone: newUser.phone || '',
          password: newUser.password || 'password123',
          subjects: newUser.subjects || ['Pendidikan Umum'],
          isHomeroom: newUser.role === 'wali_kelas',
          homeroomClassId: newUser.homeroomClassId,
          homeroomClassName: newUser.homeroomClassName,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setTeachers(prev => [autoTeacher, ...prev]);
        firestoreAddTeacher(autoTeacher).catch(() => {});
      }
    }

    addAuditLog(
      'CREATE_USER',
      'Manajemen Pengguna',
      `Menambahkan pengguna baru: ${newUser.displayName} (${newUser.email}) sebagai ${newUser.role}`
    );
    pushNotification(
      'Akun Baru Diaktifkan',
      `Selamat datang ${newUser.displayName}! Akun Anda dengan peran ${newUser.role.toUpperCase()} telah berhasil diaktifkan dengan konfigurasi hak akses tersendiri.`,
      'success',
      newUser.id,
      newUser.role,
      currentUser.displayName,
      currentUser.role,
      false,
      'keamanan'
    );
    firestoreAddUser(newUser).catch(() => {});
  };

  const deleteUser = (userId: string): { success: boolean; message: string } => {
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    // Protection 1: Cannot delete self
    if (userId === currentUser.id) {
      return { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk!' };
    }

    // Protection 2: Root super admin protection
    if (target.email === 'kkaito447@gmail.com') {
      return { success: false, message: 'Akun Administrator Pengembang Utama (kkaito447@gmail.com) tidak dapat dihapus demi keamanan sistem.' };
    }

    // Protection 3: Minimum 1 super admin
    if (target.role === 'super_admin') {
      const superAdminCount = users.filter(u => u.role === 'super_admin').length;
      if (superAdminCount <= 1) {
        return { success: false, message: 'Tidak dapat menghapus satu-satunya Super Admin dalam sistem!' };
      }
    }

    setUsers(prev => {
      const next = prev.filter(u => u.id !== userId);
      localStorage.setItem('myschool_users', JSON.stringify(next));
      return next;
    });
    addAuditLog('DELETE_USER', 'Manajemen Pengguna', `Menghapus akun pengguna: ${target.displayName} (${target.email})`);
    pushNotification('Akun Pengguna Dihapus', `Akun pengguna ${target.displayName} (${target.email}) telah dihapus dari sistem.`, 'alert');
    firestoreDeleteUser(userId).catch(() => {});

    return { success: true, message: `Akun pengguna ${target.displayName} berhasil dihapus.` };
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    firestoreMarkNotificationRead(id).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    notifications.forEach(n => {
      firestoreMarkNotificationRead(n.id).catch(() => {});
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    firestoreDeleteNotification(id).catch(() => {});
  };

  const clearAllNotifications = () => {
    const toClear = [...notifications];
    setNotifications([]);
    firestoreClearNotifications(toClear).catch(() => {});
  };

  // =========================================================================
  // PKL & DUDI ADMINISTRATION METHODS (WITH BIDIRECTIONAL CLOUD SYNC)
  // =========================================================================
  const savePklPartner = (partner: IndustryPartner, isNew = false) => {
    const activeCount = (partner.placements || []).filter(pl => pl.status === 'sedang_berjalan').length;
    const normalizedPartner: IndustryPartner = {
      ...partner,
      activePlacementsCount: activeCount,
    };

    setPklPartners(prev => {
      const exists = prev.some(p => p.id === normalizedPartner.id);
      const next = exists
        ? prev.map(p => (p.id === normalizedPartner.id ? normalizedPartner : p))
        : [normalizedPartner, ...prev];
      localStorage.setItem('myschool_pkl_partners_v3', JSON.stringify(next));
      return next;
    });

    firestoreSavePklPartner(normalizedPartner).catch(() => {});

    // Synchronize placements with pklReports so all tabs stay in sync
    if (normalizedPartner.placements && normalizedPartner.placements.length > 0) {
      setPklReports(prevReports => {
        let updatedReports = [...prevReports];
        normalizedPartner.placements.forEach(plc => {
          const existingIdx = updatedReports.findIndex(r => r.studentId === plc.studentId);
          const fScore = plc.finalScore || 86;
          const grade = fScore >= 90 ? 'A' : fScore >= 80 ? 'B' : fScore >= 70 ? 'C' : 'D';
          if (existingIdx >= 0) {
            const updatedRep: PklStudentReportItem = {
              ...updatedReports[existingIdx],
              partnerId: normalizedPartner.id,
              partnerName: normalizedPartner.name,
              finalScore: fScore,
              grade,
            };
            updatedReports[existingIdx] = updatedRep;
            firestoreSavePklReport(updatedRep).catch(() => {});
          } else {
            const newRep: PklStudentReportItem = {
              id: `rep-${plc.studentId}-${Date.now()}`,
              studentId: plc.studentId,
              studentName: plc.studentName,
              nisn: plc.nisn,
              className: plc.className,
              majorCode: plc.majorCode,
              partnerId: normalizedPartner.id,
              partnerName: normalizedPartner.name,
              reportTitle: `Laporan Praktik Kerja Lapangan di ${normalizedPartner.name}`,
              submissionStatus: plc.status === 'selesai' ? 'sudah_dikumpulkan' : 'belum_dikumpulkan',
              schoolMentorScore: fScore,
              industryMentorScore: fScore,
              finalScore: fScore,
              grade,
              absorbedStatus: 'terserap_kerja',
            };
            updatedReports = [newRep, ...updatedReports];
            firestoreSavePklReport(newRep).catch(() => {});
          }
        });
        localStorage.setItem('myschool_pkl_reports_v3', JSON.stringify(updatedReports));
        return updatedReports;
      });
    }

    addAuditLog(
      isNew ? 'CREATE_PKL_PARTNER' : 'UPDATE_PKL_PARTNER',
      'Administrasi PKL & DUDI',
      `${isNew ? 'Menambahkan' : 'Memperbarui'} data mitra industri DUDI: ${normalizedPartner.name}`
    );
  };

  const deletePklPartner = (partnerId: string) => {
    const target = pklPartners.find(p => p.id === partnerId);
    setPklPartners(prev => {
      const next = prev.filter(p => p.id !== partnerId);
      localStorage.setItem('myschool_pkl_partners_v3', JSON.stringify(next));
      return next;
    });
    firestoreDeletePklPartner(partnerId).catch(() => {});

    // Cascade delete associated visits and reports
    const visitsToRemove = pklVisits.filter(v => v.partnerId === partnerId);
    if (visitsToRemove.length > 0) {
      setPklVisits(prev => {
        const next = prev.filter(v => v.partnerId !== partnerId);
        localStorage.setItem('myschool_pkl_visits_v3', JSON.stringify(next));
        return next;
      });
      visitsToRemove.forEach(v => firestoreDeletePklVisit(v.id).catch(() => {}));
    }

    const reportsToRemove = pklReports.filter(r => r.partnerId === partnerId);
    if (reportsToRemove.length > 0) {
      setPklReports(prev => {
        const next = prev.filter(r => r.partnerId !== partnerId);
        localStorage.setItem('myschool_pkl_reports_v3', JSON.stringify(next));
        return next;
      });
      reportsToRemove.forEach(r => firestoreDeletePklReport(r.id).catch(() => {}));
    }

    if (target) {
      addAuditLog('DELETE_PKL_PARTNER', 'Administrasi PKL & DUDI', `Menghapus mitra DUDI: ${target.name}`);
    }
  };

  const savePklVisit = (visit: PklVisitRecord, isNew = false) => {
    setPklVisits(prev => {
      const exists = prev.some(v => v.id === visit.id);
      const next = exists ? prev.map(v => (v.id === visit.id ? visit : v)) : [visit, ...prev];
      localStorage.setItem('myschool_pkl_visits_v3', JSON.stringify(next));
      return next;
    });
    firestoreSavePklVisit(visit).catch(() => {});
    addAuditLog(
      isNew ? 'CREATE_PKL_VISIT' : 'UPDATE_PKL_VISIT',
      'Administrasi PKL & DUDI',
      `${isNew ? 'Menambahkan' : 'Memperbarui'} supervisi kunjungan PKL ke ${visit.partnerName} (${visit.visitDate})`
    );
  };

  const deletePklVisit = (visitId: string) => {
    const target = pklVisits.find(v => v.id === visitId);
    setPklVisits(prev => {
      const next = prev.filter(v => v.id !== visitId);
      localStorage.setItem('myschool_pkl_visits_v3', JSON.stringify(next));
      return next;
    });
    firestoreDeletePklVisit(visitId).catch(() => {});
    if (target) {
      addAuditLog('DELETE_PKL_VISIT', 'Administrasi PKL & DUDI', `Menghapus jadwal supervisi PKL: ${target.partnerName}`);
    }
  };

  const savePklReport = (report: PklStudentReportItem, isNew = false) => {
    setPklReports(prev => {
      const exists = prev.some(r => r.id === report.id);
      const next = exists ? prev.map(r => (r.id === report.id ? report : r)) : [report, ...prev];
      localStorage.setItem('myschool_pkl_reports_v3', JSON.stringify(next));
      return next;
    });
    firestoreSavePklReport(report).catch(() => {});

    // Bidirectional sync: update or add student placement inside the corresponding partner
    if (report.partnerId) {
      setPklPartners(prevPartners => {
        const nextPartners = prevPartners.map(p => {
          if (p.id === report.partnerId) {
            const existingPlc = (p.placements || []).find(pl => pl.studentId === report.studentId);
            let nextPlacements = [...(p.placements || [])];
            if (existingPlc) {
              nextPlacements = nextPlacements.map(pl =>
                pl.studentId === report.studentId
                  ? { ...pl, finalScore: report.finalScore, grade: report.grade }
                  : pl
              );
            } else {
              nextPlacements = [
                {
                  id: `plc-${report.studentId}-${Date.now()}`,
                  studentId: report.studentId,
                  studentName: report.studentName,
                  nisn: report.nisn,
                  className: report.className,
                  majorCode: report.majorCode,
                  academicYear: activeAcademicYear.name,
                  period: 'Juli - Desember 2026',
                  schoolMentorName: 'Guru Pembimbing PKL',
                  industryMentorName: p.hrdName || 'Pembimbing Industri DUDI',
                  status: report.submissionStatus === 'sudah_dikumpulkan' ? 'selesai' : 'sedang_berjalan',
                  finalScore: report.finalScore,
                  grade: report.grade,
                },
                ...nextPlacements,
              ];
            }
            const updatedPartner: IndustryPartner = {
              ...p,
              placements: nextPlacements,
              activePlacementsCount: nextPlacements.filter(pl => pl.status === 'sedang_berjalan').length,
            };
            firestoreSavePklPartner(updatedPartner).catch(() => {});
            return updatedPartner;
          }
          return p;
        });
        localStorage.setItem('myschool_pkl_partners_v3', JSON.stringify(nextPartners));
        return nextPartners;
      });
    }

    addAuditLog(
      isNew ? 'CREATE_PKL_REPORT' : 'UPDATE_PKL_REPORT',
      'Administrasi PKL & DUDI',
      `${isNew ? 'Menambahkan' : 'Memperbarui'} laporan & nilai PKL siswa: ${report.studentName} (${report.finalScore})`
    );
  };

  const deletePklReport = (reportId: string) => {
    const target = pklReports.find(r => r.id === reportId);
    setPklReports(prev => {
      const next = prev.filter(r => r.id !== reportId);
      localStorage.setItem('myschool_pkl_reports_v3', JSON.stringify(next));
      return next;
    });
    firestoreDeletePklReport(reportId).catch(() => {});
    if (target) {
      addAuditLog('DELETE_PKL_REPORT', 'Administrasi PKL & DUDI', `Menghapus laporan PKL siswa: ${target.studentName}`);
    }
  };

  const clearAllPklData = () => {
    const pIds = pklPartners.map(p => p.id);
    const vIds = pklVisits.map(v => v.id);
    const rIds = pklReports.map(r => r.id);

    setPklPartners([]);
    setPklVisits([]);
    setPklReports([]);
    localStorage.setItem('myschool_pkl_partners_v3', JSON.stringify([]));
    localStorage.setItem('myschool_pkl_visits_v3', JSON.stringify([]));
    localStorage.setItem('myschool_pkl_reports_v3', JSON.stringify([]));

    firestoreClearAllPklData(pIds, vIds, rIds).catch(() => {});
    addAuditLog('CLEAR_ALL_PKL', 'Administrasi PKL & DUDI', 'Mengosongkan seluruh data mitra DUDI, supervisi, dan laporan PKL dari database.');
  };

  const loadSamplePklData = () => {
    setPklPartners(sampleIndustryPartners);
    setPklVisits(samplePklVisits);
    setPklReports(samplePklReports);
    localStorage.setItem('myschool_pkl_partners_v3', JSON.stringify(sampleIndustryPartners));
    localStorage.setItem('myschool_pkl_visits_v3', JSON.stringify(samplePklVisits));
    localStorage.setItem('myschool_pkl_reports_v3', JSON.stringify(samplePklReports));

    sampleIndustryPartners.forEach(p => firestoreSavePklPartner(p).catch(() => {}));
    samplePklVisits.forEach(v => firestoreSavePklVisit(v).catch(() => {}));
    samplePklReports.forEach(r => firestoreSavePklReport(r).catch(() => {}));
    addAuditLog('SEED_PKL_SAMPLE', 'Administrasi PKL & DUDI', 'Memuat & menyinkronkan data contoh kemitraan DUDI ke Cloud Firestore.');
  };

  // Visual Theme & Background Settings
  const updateVisualSettings = (updates: Partial<VisualSettings>) => {
    setVisualSettings(prev => {
      const next: VisualSettings = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('myschool_visual_settings', JSON.stringify(next));
      if (next.loginBgUrl) {
        localStorage.setItem('myacademy_login_custom_bg', next.loginBgUrl);
      } else {
        localStorage.removeItem('myacademy_login_custom_bg');
      }
      firestoreSaveVisualSettings(next).catch(() => {});
      return next;
    });
    addAuditLog('UPDATE_VISUAL_THEME', 'Pengaturan Sistem', 'Memperbarui tema visual, logo aplikasi, atau wallpaper sistem.');
  };

  // Lesson Schedule CRUD (Jadwal Pelajaran)
  const saveLessonSchedule = (schedule: LessonSchedule, isNew = false) => {
    setLessonSchedules(prev => {
      const exists = prev.some(item => item.id === schedule.id);
      const next = exists ? prev.map(item => (item.id === schedule.id ? schedule : item)) : [schedule, ...prev];
      localStorage.setItem('myschool_lesson_schedules', JSON.stringify(next));
      return next;
    });
    firestoreSaveLessonSchedule(schedule).catch(() => {});
    addAuditLog(
      isNew ? 'CREATE_SCHEDULE' : 'UPDATE_SCHEDULE',
      'Jadwal Pelajaran',
      `${isNew ? 'Menambahkan' : 'Memperbarui'} jadwal pelajaran: ${schedule.subjectName} (${schedule.className} - ${schedule.day})`
    );
  };

  const deleteLessonSchedule = (scheduleId: string) => {
    const target = lessonSchedules.find(s => s.id === scheduleId);
    setLessonSchedules(prev => {
      const next = prev.filter(s => s.id !== scheduleId);
      localStorage.setItem('myschool_lesson_schedules', JSON.stringify(next));
      return next;
    });
    firestoreDeleteLessonSchedule(scheduleId).catch(() => {});
    if (target) {
      addAuditLog('DELETE_SCHEDULE', 'Jadwal Pelajaran', `Menghapus jadwal pelajaran: ${target.subjectName} (${target.className})`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        darkMode,
        toggleDarkMode,
        activeNav,
        setActiveNav,
        pageView,
        setPageView: handleSetPageView,
        loginWithRole,
        loginWithEmail,
        logout,
        showLogoutModal,
        setShowLogoutModal,
        updateCurrentUserProfile,
        students,
        teachers,
        classes,
        majors,
        subjects,
        academicYears,
        activeAcademicYear,
        users,
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
        attendanceSessions,
        attendanceRecords,
        attendanceCorrections,
        saveAttendanceSessionAndRecords,
        deleteAttendanceSession,
        clearAttendanceForClassAndDate,
        resetClassAttendanceToZero,
        syncClassAttendanceRecapToDatabase,
        submitAttendanceCorrection,
        reviewAttendanceCorrection,
        deleteAttendanceCorrection,
        assessments,
        assessmentScores,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        resetAssessmentScores,
        saveAssessmentScores,
        publishAssessment,
        addUser,
        deleteUser,
        auditLogs,
        notifications,
        addAuditLog,
        pushNotification,
        sendBroadcastNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        chatMessages,
        sendChatMessage,
        deleteChatMessage,
        sendModeratorAnnouncement,
        directMessages,
        sendDirectMessage,
        deleteDirectMessage,
        reportTemplate,
        saveReportTemplate,
        pklPartners,
        pklVisits,
        pklReports,
        savePklPartner,
        deletePklPartner,
        savePklVisit,
        deletePklVisit,
        savePklReport,
        deletePklReport,
        clearAllPklData,
        loadSamplePklData,
        visualSettings,
        updateVisualSettings,
        lessonSchedules,
        saveLessonSchedule,
        deleteLessonSchedule,
        isFirestoreConnected,
        isSyncing,
        lastSyncTime,
        forceCloudResync,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
