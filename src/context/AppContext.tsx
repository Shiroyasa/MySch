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
  AttendanceStatus,
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
} from '../data/seedData';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

interface AppContextType {
  currentUser: User;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;

  // Page Routing (Landing Page, Login Page, Dashboard App)
  pageView: 'landing' | 'login' | 'app';
  setPageView: (view: 'landing' | 'login' | 'app') => void;
  loginWithRole: (role: UserRole) => void;
  loginWithEmail: (email: string) => void;
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

  // Users
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  deleteUser: (userId: string) => { success: boolean; message: string };

  // Logs & Notifications
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  addAuditLog: (action: string, module: string, details: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
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

  // Page Routing State (landing, login, app)
  const [pageView, setPageView] = useState<'landing' | 'login' | 'app'>(() => {
    const cached = localStorage.getItem('myschool_page_view');
    // Default to landing page for first visit / presentation, but keep stored preference
    return (cached as 'landing' | 'login' | 'app') || 'landing';
  });

  const handleSetPageView = (view: 'landing' | 'login' | 'app') => {
    setPageView(view);
    localStorage.setItem('myschool_page_view', view);
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

  const loginWithEmail = (email: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || users[0];
    setCurrentUser(found);
    localStorage.setItem('myschool_current_user', JSON.stringify(found));
    handleSetPageView('app');
    setActiveNav(found.role === 'siswa' ? 'student-profile' : 'dashboard');
    addAuditLog('USER_LOGIN', 'Otentikasi', `Login email berhasil: ${found.displayName}`);
    pushNotification('Selamat Datang!', `Berhasil masuk sebagai ${found.displayName}.`, 'success');
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

  // Helper for audit logs
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

    // Firestore async sync
    if (auth.currentUser) {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(() => {});
    }
  };

  // Helper for adding notifications
  const pushNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
      targetRole: 'all',
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Master Data Methods
  const addStudent = (data: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStudents(prev => [newStudent, ...prev]);
    // update class student count
    setClasses(prev =>
      prev.map(c =>
        c.id === data.classId || c.name === data.className
          ? { ...c, studentCount: c.studentCount + 1 }
          : c
      )
    );
    addAuditLog('CREATE_STUDENT', 'Master Siswa', `Menambahkan siswa baru: ${newStudent.fullName} (${newStudent.nisn}) ke kelas ${newStudent.className}`);
    pushNotification('Siswa Baru Terdaftar', `${newStudent.fullName} (${newStudent.nisn}) berhasil ditambahkan ke kelas ${newStudent.className}.`, 'success');
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString().split('T')[0] } : s))
    );
    addAuditLog('UPDATE_STUDENT', 'Master Siswa', `Memperbarui data siswa ID: ${id}`);
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

    addAuditLog('DELETE_STUDENT', 'Master Siswa', `Menghapus data siswa: ${target.fullName} (${target.nisn})`);
    pushNotification('Data Siswa Dihapus', `Data siswa ${target.fullName} (${target.nisn}) telah dihapus permanen dari sistem.`, 'alert');

    if (auth.currentUser) {
      deleteDoc(doc(db, 'students', id)).catch(() => {});
    }
  };

  const importStudents = (imported: Partial<Student>[]): number => {
    let count = 0;
    const now = new Date().toISOString().split('T')[0];
    const newEntries: Student[] = [];

    imported.forEach((item, idx) => {
      if (item.fullName && item.nisn) {
        newEntries.push({
          id: `std-imp-${Date.now()}-${idx}`,
          nisn: item.nisn || `00${Date.now() + idx}`,
          nis: item.nis || `2425${1000 + idx}`,
          fullName: item.fullName,
          gender: item.gender === 'P' ? 'P' : 'L',
          classId: item.classId || classes[0].id,
          className: item.className || classes[0].name,
          majorId: item.majorId || majors[0].id,
          majorCode: item.majorCode || majors[0].code,
          address: item.address || 'Cikembar, Sukabumi',
          phone: item.phone || '085800000000',
          parentName: item.parentName || 'Orang Tua / Wali',
          parentPhone: item.parentPhone || '081200000000',
          status: 'aktif',
          createdAt: now,
        });
        count++;
      }
    });

    if (newEntries.length > 0) {
      setStudents(prev => [...newEntries, ...prev]);
      addAuditLog('IMPORT_STUDENTS', 'Master Siswa', `Mengimpor ${count} data siswa dari spreadsheet/CSV.`);
      pushNotification('Impor Siswa Berhasil', `${count} data siswa baru telah berhasil diimpor ke sistem.`, 'success');
    }
    return count;
  };

  const addTeacher = (data: Omit<Teacher, 'id' | 'createdAt'>) => {
    const newTeacher: Teacher = {
      ...data,
      id: `tch-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTeachers(prev => [newTeacher, ...prev]);
    addAuditLog('CREATE_TEACHER', 'Master Guru', `Menambahkan guru baru: ${newTeacher.fullName}`);
    pushNotification('Guru Baru Ditambahkan', `Pendidik ${newTeacher.fullName} telah terdaftar.`, 'success');
  };

  const updateTeacher = (id: string, data: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)));
    addAuditLog('UPDATE_TEACHER', 'Master Guru', `Memperbarui data guru ID: ${id}`);
  };

  const deleteTeacher = (id: string) => {
    const target = teachers.find(t => t.id === id);
    if (!target) return;

    setTeachers(prev => prev.filter(t => t.id !== id));

    // Clear homeroom assignment if this teacher was a homeroom teacher
    setClasses(prev =>
      prev.map(c =>
        c.homeroomTeacherId === id
          ? { ...c, homeroomTeacherId: '', homeroomTeacherName: 'Belum Ditentukan' }
          : c
      )
    );

    addAuditLog('DELETE_TEACHER', 'Master Guru', `Menghapus data guru: ${target.fullName}`);
    pushNotification('Data Guru Dihapus', `Data tenaga pendidik ${target.fullName} telah dihapus dari sistem.`, 'alert');

    if (auth.currentUser) {
      deleteDoc(doc(db, 'teachers', id)).catch(() => {});
    }
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
  };

  const updateClass = (id: string, cls: Partial<ClassRoom>) => {
    setClasses(prev => prev.map(c => (c.id === id ? { ...c, ...cls } : c)));
    addAuditLog('UPDATE_CLASS', 'Master Kelas', `Memperbarui data kelas ID: ${id}`);
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

    addAuditLog('DELETE_CLASS', 'Master Kelas', `Menghapus data rombel kelas: ${target.name}`);
    pushNotification('Kelas Dihapus', `Rombel ${target.name} dan data terkait telah dihapus dari sistem.`, 'alert');

    if (auth.currentUser) {
      deleteDoc(doc(db, 'classes', id)).catch(() => {});
    }
  };

  const addSubject = (subj: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subj,
      id: `sub-${Date.now()}`,
    };
    setSubjects(prev => [newSubject, ...prev]);
    addAuditLog('CREATE_SUBJECT', 'Master Mapel', `Menambahkan mata pelajaran: ${newSubject.name}`);
    pushNotification('Mata Pelajaran Ditambahkan', `Mapel ${newSubject.name} (${newSubject.code}) berhasil ditambahkan.`, 'success');
  };

  const updateSubject = (id: string, subj: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...subj } : s)));
    addAuditLog('UPDATE_SUBJECT', 'Master Mapel', `Memperbarui mata pelajaran ID: ${id}`);
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

    if (auth.currentUser) {
      deleteDoc(doc(db, 'subjects', id)).catch(() => {});
    }
  };

  const addMajor = (data: Omit<Major, 'id'>) => {
    const newMajor: Major = {
      ...data,
      id: `maj-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now()}`,
    };
    setMajors(prev => [...prev, newMajor]);
    addAuditLog('CREATE_MAJOR', 'Master Jurusan', `Menambahkan kompetensi keahlian: ${newMajor.name} (${newMajor.code})`);
    pushNotification('Jurusan Baru Ditambahkan', `Kompetensi keahlian ${newMajor.name} (${newMajor.code}) berhasil ditambahkan.`, 'success');

    if (auth.currentUser) {
      setDoc(doc(db, 'majors', newMajor.id), newMajor).catch(() => {});
    }
  };

  const updateMajor = (id: string, data: Partial<Major>) => {
    setMajors(prev => prev.map(m => (m.id === id ? { ...m, ...data } : m)));
    addAuditLog('UPDATE_MAJOR', 'Master Jurusan', `Memperbarui kompetensi keahlian ID: ${id}`);
    pushNotification('Jurusan Diperbarui', 'Data program keahlian berhasil diperbarui.', 'info');

    if (auth.currentUser) {
      setDoc(doc(db, 'majors', id), data, { merge: true }).catch(() => {});
    }
  };

  const deleteMajor = (id: string) => {
    const target = majors.find(m => m.id === id);
    if (!target) return;

    setMajors(prev => prev.filter(m => m.id !== id));
    addAuditLog('DELETE_MAJOR', 'Master Jurusan', `Menghapus kompetensi keahlian: ${target.name} (${target.code})`);
    pushNotification('Jurusan Dihapus', `Kompetensi keahlian ${target.name} (${target.code}) telah dihapus.`, 'alert');

    if (auth.currentUser) {
      deleteDoc(doc(db, 'majors', id)).catch(() => {});
    }
  };

  const addAcademicYear = (year: Omit<AcademicYear, 'id'>) => {
    const newYear: AcademicYear = {
      ...year,
      id: `ay-${Date.now()}`,
    };
    setAcademicYears(prev => [...prev, newYear]);
    addAuditLog('CREATE_ACADEMIC_YEAR', 'Tahun Ajaran', `Menambahkan tahun ajaran baru: ${newYear.name} (${newYear.activeSemester})`);
    pushNotification('Tahun Ajaran Ditambahkan', `Tahun ajaran ${newYear.name} telah dibuat.`, 'success');
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

    return sessionId;
  };

  const deleteAttendanceSession = (sessionId: string) => {
    const target = attendanceSessions.find(s => s.id === sessionId);
    if (!target) return;

    setAttendanceSessions(prev => prev.filter(s => s.id !== sessionId));
    setAttendanceRecords(prev => prev.filter(r => r.sessionId !== sessionId));

    addAuditLog('DELETE_ATTENDANCE_SESSION', 'Absensi Siswa', `Menghapus sesi presensi: ${target.className} (${target.date})`);
    pushNotification('Sesi Presensi Dihapus', `Rekaman presensi kelas ${target.className} tanggal ${target.date} telah dihapus.`, 'alert');

    if (auth.currentUser) {
      deleteDoc(doc(db, 'attendanceSessions', sessionId)).catch(() => {});
    }
  };

  const clearAttendanceForClassAndDate = (classId: string, date: string, type: 'harian' | 'mapel' = 'harian', subjectId?: string) => {
    const matchingSessions = attendanceSessions.filter(
      s => s.classId === classId && s.date === date && s.type === type && (type === 'harian' || s.subjectId === subjectId)
    );
    const sessionIds = matchingSessions.map(s => s.id);

    setAttendanceSessions(prev => prev.filter(s => !sessionIds.includes(s.id)));
    setAttendanceRecords(prev => prev.filter(r => !sessionIds.includes(r.sessionId)));

    addAuditLog('CLEAR_ATTENDANCE', 'Absensi Siswa', `Mengosongkan/menghapus rekaman presensi kelas ID ${classId} tanggal ${date}`);
    pushNotification('Presensi Dikosongkan', `Rekaman presensi tanggal ${date} telah dikosongkan.`, 'info');
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

    // If approved, update the attendance record as well!
    if (status === 'approved') {
      setAttendanceRecords(prev =>
        prev.map(r => {
          if (r.studentId === target.studentId && r.date === target.date) {
            return {
              ...r,
              status: target.requestedStatus,
              note: `Koreksi disetujui: ${target.reason}`,
              updatedBy: currentUser.displayName,
            };
          }
          return r;
        })
      );
    }

    addAuditLog('REVIEW_CORRECTION', 'Koreksi Absensi', `${status === 'approved' ? 'Menyetujui' : 'Menolak'} permohonan koreksi absensi ${target.studentName}`);
    pushNotification(
      `Koreksi Presensi ${status === 'approved' ? 'Disetujui' : 'Ditolak'}`,
      `Permohonan koreksi presensi siswa ${target.studentName} (${target.date}) telah ${status === 'approved' ? 'disetujui' : 'ditolak'}.`,
      status === 'approved' ? 'success' : 'alert'
    );
  };

  const deleteAttendanceCorrection = (id: string) => {
    const target = attendanceCorrections.find(c => c.id === id);
    if (!target) return;

    setAttendanceCorrections(prev => prev.filter(c => c.id !== id));
    addAuditLog('DELETE_CORRECTION', 'Koreksi Absensi', `Menghapus permohonan koreksi absensi: ${target.studentName}`);
    pushNotification('Permohonan Koreksi Dihapus', `Permohonan koreksi absensi ${target.studentName} telah dihapus.`, 'info');
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
    return newAsm.id;
  };

  const updateAssessment = (id: string, data: Partial<Assessment>) => {
    setAssessments(prev =>
      prev.map(a => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a))
    );
    addAuditLog('UPDATE_ASSESSMENT', 'Penilaian Akademik', `Memperbarui komponen penilaian ID: ${id}`);
  };

  const deleteAssessment = (assessmentId: string) => {
    const target = assessments.find(a => a.id === assessmentId);
    if (!target) return;

    // Clean cascade: delete assessment & associated scores
    setAssessments(prev => prev.filter(a => a.id !== assessmentId));
    setAssessmentScores(prev => prev.filter(s => s.assessmentId !== assessmentId));

    addAuditLog('DELETE_ASSESSMENT', 'Penilaian Akademik', `Menghapus komponen penilaian: ${target.title} (${target.subjectName} - ${target.className})`);
    pushNotification('Komponen Penilaian Dihapus', `Penilaian ${target.title} dan seluruh nilai siswa terkait telah dihapus permanen.`, 'alert');

    if (auth.currentUser) {
      deleteDoc(doc(db, 'assessments', assessmentId)).catch(() => {});
    }
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
  };

  const publishAssessment = (assessmentId: string) => {
    const target = assessments.find(a => a.id === assessmentId);
    if (!target) return;

    updateAssessment(assessmentId, { status: 'dipublikasikan' });
    addAuditLog('PUBLISH_ASSESSMENT', 'Penilaian Akademik', `Mempublikasikan nilai untuk: ${target.title} (${target.className})`);
    pushNotification('Nilai Baru Dipublikasikan', `Nilai ${target.title} (${target.subjectName}) kelas ${target.className} telah dipublikasikan.`, 'info');
  };

  // User Management
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [newUser, ...prev]);
    addAuditLog('CREATE_USER', 'Manajemen Pengguna', `Menambahkan pengguna baru: ${newUser.displayName} (${newUser.email}) sebagai ${newUser.role}`);
    pushNotification('Pengguna Baru Ditambahkan', `Akun ${newUser.displayName} (${newUser.email}) berhasil dibuat dengan peran ${newUser.role}.`, 'success');
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

    setUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog('DELETE_USER', 'Manajemen Pengguna', `Menghapus akun pengguna: ${target.displayName} (${target.email})`);
    pushNotification('Akun Pengguna Dihapus', `Akun pengguna ${target.displayName} (${target.email}) telah dihapus dari sistem.`, 'alert');

    if (auth.currentUser) {
      deleteDoc(doc(db, 'users', userId)).catch(() => {});
    }

    return { success: true, message: `Akun pengguna ${target.displayName} berhasil dihapus.` };
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
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
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
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
