import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
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
  User,
  IndustryPartner,
  PklVisitRecord,
  PklStudentReportItem,
  VisualSettings,
  LessonSchedule,
} from '../types';
import {
  initialStudents,
  initialTeachers,
  initialClasses,
  initialMajors,
  initialSubjects,
  initialAcademicYears,
  initialAttendanceSessions,
  initialAttendanceRecords,
  initialAssessments,
  initialAssessmentScores,
  initialAuditLogs,
  initialNotifications,
  initialChatMessages,
  initialUsers,
} from '../data/seedData';

export interface SyncCallbacks {
  onStudentsChange: (data: Student[]) => void;
  onTeachersChange: (data: Teacher[]) => void;
  onClassesChange: (data: ClassRoom[]) => void;
  onMajorsChange: (data: Major[]) => void;
  onSubjectsChange: (data: Subject[]) => void;
  onAcademicYearsChange: (data: AcademicYear[]) => void;
  onAttendanceSessionsChange: (data: AttendanceSession[]) => void;
  onAttendanceRecordsChange: (data: AttendanceRecord[]) => void;
  onAttendanceCorrectionsChange: (data: AttendanceCorrection[]) => void;
  onAssessmentsChange: (data: Assessment[]) => void;
  onAssessmentScoresChange: (data: AssessmentScore[]) => void;
  onAuditLogsChange: (data: AuditLog[]) => void;
  onNotificationsChange: (data: NotificationItem[]) => void;
  onChatMessagesChange: (data: ChatMessage[]) => void;
  onDirectMessagesChange?: (data: ChatMessage[]) => void;
  onUsersChange: (data: User[]) => void;
  onReportTemplateChange?: (data: any) => void;
  onPklPartnersChange?: (data: IndustryPartner[]) => void;
  onPklVisitsChange?: (data: PklVisitRecord[]) => void;
  onPklReportsChange?: (data: PklStudentReportItem[]) => void;
  onVisualSettingsChange?: (data: VisualSettings) => void;
  onLessonSchedulesChange?: (data: LessonSchedule[]) => void;
  onSyncStatusChange?: (status: { isConnected: boolean; isSyncing: boolean; lastSync: Date; error?: string }) => void;
}

let isInitialized = false;

// Auto-seed Firestore if collections are empty so all devices get real synchronized data
export async function ensureFirestorePopulated(): Promise<void> {
  try {
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (!studentsSnap.empty) {
      console.log(`Firestore already contains ${studentsSnap.size} students. Skipping initial seed.`);
      return;
    }

    console.log('Firestore is empty. Initializing cloud database with authentic SMK Mardi Yuana Cikembar records...');
    
    // Batch seed students
    const batch = writeBatch(db);

    initialStudents.forEach(item => {
      batch.set(doc(db, 'students', item.id), item);
    });

    initialTeachers.forEach(item => {
      batch.set(doc(db, 'teachers', item.id), item);
    });

    initialClasses.forEach(item => {
      batch.set(doc(db, 'classes', item.id), item);
    });

    initialMajors.forEach(item => {
      batch.set(doc(db, 'majors', item.id), item);
    });

    initialSubjects.forEach(item => {
      batch.set(doc(db, 'subjects', item.id), item);
    });

    initialAcademicYears.forEach(item => {
      batch.set(doc(db, 'academicYears', item.id), item);
    });

    initialUsers.forEach(item => {
      batch.set(doc(db, 'users', item.id), item);
    });

    initialAttendanceSessions.forEach(item => {
      batch.set(doc(db, 'attendanceSessions', item.id), item);
    });

    initialAttendanceRecords.forEach(item => {
      batch.set(doc(db, 'attendanceRecords', item.id), item);
    });

    initialAssessments.forEach(item => {
      batch.set(doc(db, 'assessments', item.id), item);
    });

    initialAssessmentScores.forEach(item => {
      batch.set(doc(db, 'assessmentScores', item.id), item);
    });

    initialNotifications.forEach(item => {
      batch.set(doc(db, 'notifications', item.id), item);
    });

    initialChatMessages.forEach(item => {
      batch.set(doc(db, 'chatMessages', item.id), item);
    });

    initialAuditLogs.forEach(item => {
      batch.set(doc(db, 'auditLogs', item.id), item);
    });

    await batch.commit();
    console.log('Cloud Firestore successfully seeded and synchronized!');
  } catch (err) {
    console.warn('Initial seeding encountered notice (may already have records):', err);
  }
}

// Subscribe all real-time collections
export function subscribeAllCollections(callbacks: SyncCallbacks): () => void {
  const unsubscribers: (() => void)[] = [];

  const handleUpdate = () => {
    callbacks.onSyncStatusChange?.({
      isConnected: true,
      isSyncing: false,
      lastSync: new Date(),
    });
  };

  // 1. Students
  try {
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      snapshot => {
        if (!snapshot.empty) {
          const list: Student[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as Student));
          callbacks.onStudentsChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'students');
      }
    );
    unsubscribers.push(unsubStudents);
  } catch (err) {
    console.error('Error attaching students listener:', err);
  }

  // 2. Teachers
  try {
    const unsubTeachers = onSnapshot(
      collection(db, 'teachers'),
      snapshot => {
        if (!snapshot.empty) {
          const list: Teacher[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as Teacher));
          callbacks.onTeachersChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'teachers');
      }
    );
    unsubscribers.push(unsubTeachers);
  } catch (err) {
    console.error('Error attaching teachers listener:', err);
  }

  // 3. Classes
  try {
    const unsubClasses = onSnapshot(
      collection(db, 'classes'),
      snapshot => {
        if (!snapshot.empty) {
          const list: ClassRoom[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as ClassRoom));
          callbacks.onClassesChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'classes');
      }
    );
    unsubscribers.push(unsubClasses);
  } catch (err) {
    console.error('Error attaching classes listener:', err);
  }

  // 4. Majors
  try {
    const unsubMajors = onSnapshot(
      collection(db, 'majors'),
      snapshot => {
        if (!snapshot.empty) {
          const list: Major[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as Major));
          callbacks.onMajorsChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'majors');
      }
    );
    unsubscribers.push(unsubMajors);
  } catch (err) {
    console.error('Error attaching majors listener:', err);
  }

  // 5. Subjects
  try {
    const unsubSubjects = onSnapshot(
      collection(db, 'subjects'),
      snapshot => {
        if (!snapshot.empty) {
          const list: Subject[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as Subject));
          callbacks.onSubjectsChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'subjects');
      }
    );
    unsubscribers.push(unsubSubjects);
  } catch (err) {
    console.error('Error attaching subjects listener:', err);
  }

  // 6. Academic Years
  try {
    const unsubAcademicYears = onSnapshot(
      collection(db, 'academicYears'),
      snapshot => {
        if (!snapshot.empty) {
          const list: AcademicYear[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as AcademicYear));
          callbacks.onAcademicYearsChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'academicYears');
      }
    );
    unsubscribers.push(unsubAcademicYears);
  } catch (err) {
    console.error('Error attaching academicYears listener:', err);
  }

  // 7. Attendance Sessions
  try {
    const unsubSessions = onSnapshot(
      collection(db, 'attendanceSessions'),
      snapshot => {
        const list: AttendanceSession[] = [];
        snapshot.forEach(docSnap => list.push(docSnap.data() as AttendanceSession));
        // Sort descending by date
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callbacks.onAttendanceSessionsChange(list);
        handleUpdate();
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'attendanceSessions');
      }
    );
    unsubscribers.push(unsubSessions);
  } catch (err) {
    console.error('Error attaching attendanceSessions listener:', err);
  }

  // 8. Attendance Records
  try {
    const unsubRecords = onSnapshot(
      collection(db, 'attendanceRecords'),
      snapshot => {
        const list: AttendanceRecord[] = [];
        snapshot.forEach(docSnap => list.push(docSnap.data() as AttendanceRecord));
        callbacks.onAttendanceRecordsChange(list);
        handleUpdate();
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'attendanceRecords');
      }
    );
    unsubscribers.push(unsubRecords);
  } catch (err) {
    console.error('Error attaching attendanceRecords listener:', err);
  }

  // 9. Attendance Corrections
  try {
    const unsubCorrections = onSnapshot(
      collection(db, 'attendanceCorrections'),
      snapshot => {
        const list: AttendanceCorrection[] = [];
        snapshot.forEach(docSnap => list.push(docSnap.data() as AttendanceCorrection));
        callbacks.onAttendanceCorrectionsChange(list);
        handleUpdate();
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'attendanceCorrections');
      }
    );
    unsubscribers.push(unsubCorrections);
  } catch (err) {
    console.error('Error attaching attendanceCorrections listener:', err);
  }

  // 10. Assessments
  try {
    const unsubAssessments = onSnapshot(
      collection(db, 'assessments'),
      snapshot => {
        if (!snapshot.empty) {
          const list: Assessment[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as Assessment));
          callbacks.onAssessmentsChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'assessments');
      }
    );
    unsubscribers.push(unsubAssessments);
  } catch (err) {
    console.error('Error attaching assessments listener:', err);
  }

  // 11. Assessment Scores
  try {
    const unsubScores = onSnapshot(
      collection(db, 'assessmentScores'),
      snapshot => {
        if (!snapshot.empty) {
          const list: AssessmentScore[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as AssessmentScore));
          callbacks.onAssessmentScoresChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'assessmentScores');
      }
    );
    unsubscribers.push(unsubScores);
  } catch (err) {
    console.error('Error attaching assessmentScores listener:', err);
  }

  // 12. Audit Logs
  try {
    const unsubLogs = onSnapshot(
      collection(db, 'auditLogs'),
      snapshot => {
        if (!snapshot.empty) {
          const list: AuditLog[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as AuditLog));
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          callbacks.onAuditLogsChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'auditLogs');
      }
    );
    unsubscribers.push(unsubLogs);
  } catch (err) {
    console.error('Error attaching auditLogs listener:', err);
  }

  // 13. Notifications
  try {
    const unsubNotifs = onSnapshot(
      collection(db, 'notifications'),
      snapshot => {
        if (!snapshot.empty) {
          const list: NotificationItem[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as NotificationItem));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callbacks.onNotificationsChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'notifications');
      }
    );
    unsubscribers.push(unsubNotifs);
  } catch (err) {
    console.error('Error attaching notifications listener:', err);
  }

  // 14. Chat Messages
  try {
    const unsubChat = onSnapshot(
      collection(db, 'chatMessages'),
      snapshot => {
        if (!snapshot.empty) {
          const list: ChatMessage[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as ChatMessage));
          list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          callbacks.onChatMessagesChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'chatMessages');
      }
    );
    unsubscribers.push(unsubChat);
  } catch (err) {
    console.error('Error attaching chatMessages listener:', err);
  }

  // 15. Users (Synchronized user accounts across all devices)
  try {
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      snapshot => {
        if (!snapshot.empty) {
          const list: User[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as User));
          callbacks.onUsersChange(list);
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    );
    unsubscribers.push(unsubUsers);
  } catch (err) {
    console.error('Error attaching users listener:', err);
  }

  // 16. Direct Messages (1-on-1 DM between profiles across all devices)
  try {
    const unsubDM = onSnapshot(
      collection(db, 'directMessages'),
      snapshot => {
        const list: ChatMessage[] = [];
        snapshot.forEach(docSnap => list.push(docSnap.data() as ChatMessage));
        list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        callbacks.onDirectMessagesChange?.(list);
        handleUpdate();
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'directMessages');
      }
    );
    unsubscribers.push(unsubDM);
  } catch (err) {
    console.error('Error attaching directMessages listener:', err);
  }

  // 17. Report Templates (PDF customizer settings)
  try {
    const unsubTemplates = onSnapshot(
      collection(db, 'reportTemplates'),
      snapshot => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          callbacks.onReportTemplateChange?.(docSnap.data());
          handleUpdate();
        }
      },
      error => {
        handleFirestoreError(error, OperationType.GET, 'reportTemplates');
      }
    );
    unsubscribers.push(unsubTemplates);
  } catch (err) {
    console.error('Error attaching reportTemplates listener:', err);
  }

  // 18. PKL Partners (DUDI)
  if (callbacks.onPklPartnersChange) {
    try {
      const unsubPklPartners = onSnapshot(
        collection(db, 'pklPartners'),
        snapshot => {
          const list: IndustryPartner[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as IndustryPartner));
          callbacks.onPklPartnersChange?.(list);
          handleUpdate();
        },
        error => {
          handleFirestoreError(error, OperationType.GET, 'pklPartners');
        }
      );
      unsubscribers.push(unsubPklPartners);
    } catch (err) {
      console.error('Error attaching pklPartners listener:', err);
    }
  }

  // 19. PKL Supervision Visits
  if (callbacks.onPklVisitsChange) {
    try {
      const unsubPklVisits = onSnapshot(
        collection(db, 'pklVisits'),
        snapshot => {
          const list: PklVisitRecord[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as PklVisitRecord));
          callbacks.onPklVisitsChange?.(list);
          handleUpdate();
        },
        error => {
          handleFirestoreError(error, OperationType.GET, 'pklVisits');
        }
      );
      unsubscribers.push(unsubPklVisits);
    } catch (err) {
      console.error('Error attaching pklVisits listener:', err);
    }
  }

  // 20. PKL Student Reports & Grades
  if (callbacks.onPklReportsChange) {
    try {
      const unsubPklReports = onSnapshot(
        collection(db, 'pklReports'),
        snapshot => {
          const list: PklStudentReportItem[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as PklStudentReportItem));
          callbacks.onPklReportsChange?.(list);
          handleUpdate();
        },
        error => {
          handleFirestoreError(error, OperationType.GET, 'pklReports');
        }
      );
      unsubscribers.push(unsubPklReports);
    } catch (err) {
      console.error('Error attaching pklReports listener:', err);
    }
  }

  // 21. Visual Theme & Background Settings
  if (callbacks.onVisualSettingsChange) {
    try {
      const unsubVisualSettings = onSnapshot(
        doc(db, 'settings', 'visual_theme'),
        docSnap => {
          if (docSnap.exists()) {
            callbacks.onVisualSettingsChange?.(docSnap.data() as VisualSettings);
            handleUpdate();
          }
        },
        error => {
          handleFirestoreError(error, OperationType.GET, 'settings/visual_theme');
        }
      );
      unsubscribers.push(unsubVisualSettings);
    } catch (err) {
      console.error('Error attaching visual_theme listener:', err);
    }
  }

  // 22. Lesson Schedules (Jadwal Pelajaran)
  if (callbacks.onLessonSchedulesChange) {
    try {
      const unsubSchedules = onSnapshot(
        collection(db, 'lessonSchedules'),
        snapshot => {
          const list: LessonSchedule[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as LessonSchedule));
          callbacks.onLessonSchedulesChange?.(list);
          handleUpdate();
        },
        error => {
          handleFirestoreError(error, OperationType.GET, 'lessonSchedules');
        }
      );
      unsubscribers.push(unsubSchedules);
    } catch (err) {
      console.error('Error attaching lessonSchedules listener:', err);
    }
  }

  return () => {
    unsubscribers.forEach(u => u());
  };
}

// Direct Firestore write mutations
export async function firestoreAddStudent(student: Student): Promise<void> {
  try {
    await setDoc(doc(db, 'students', student.id), student);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `students/${student.id}`);
  }
}

export async function firestoreUpdateStudent(id: string, updates: Partial<Student>): Promise<void> {
  try {
    await updateDoc(doc(db, 'students', id), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `students/${id}`);
  }
}

export async function firestoreDeleteStudent(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `students/${id}`);
  }
}

export async function firestoreBatchImportStudents(students: Student[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    students.forEach(std => {
      batch.set(doc(db, 'students', std.id), std);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'students');
  }
}

export async function firestoreAddTeacher(teacher: Teacher): Promise<void> {
  try {
    await setDoc(doc(db, 'teachers', teacher.id), teacher);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `teachers/${teacher.id}`);
  }
}

export async function firestoreUpdateTeacher(id: string, updates: Partial<Teacher>): Promise<void> {
  try {
    await updateDoc(doc(db, 'teachers', id), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `teachers/${id}`);
  }
}

export async function firestoreDeleteTeacher(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'teachers', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `teachers/${id}`);
  }
}

export async function firestoreAddClass(cls: ClassRoom): Promise<void> {
  try {
    await setDoc(doc(db, 'classes', cls.id), cls);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `classes/${cls.id}`);
  }
}

export async function firestoreUpdateClass(id: string, updates: Partial<ClassRoom>): Promise<void> {
  try {
    await updateDoc(doc(db, 'classes', id), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `classes/${id}`);
  }
}

export async function firestoreDeleteClass(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'classes', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `classes/${id}`);
  }
}

export async function firestoreAddSubject(sub: Subject): Promise<void> {
  try {
    await setDoc(doc(db, 'subjects', sub.id), sub);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `subjects/${sub.id}`);
  }
}

export async function firestoreUpdateSubject(id: string, updates: Partial<Subject>): Promise<void> {
  try {
    await updateDoc(doc(db, 'subjects', id), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `subjects/${id}`);
  }
}

export async function firestoreDeleteSubject(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'subjects', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `subjects/${id}`);
  }
}

export async function firestoreAddMajor(maj: Major): Promise<void> {
  try {
    await setDoc(doc(db, 'majors', maj.id), maj);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `majors/${maj.id}`);
  }
}

export async function firestoreUpdateMajor(id: string, updates: Partial<Major>): Promise<void> {
  try {
    await updateDoc(doc(db, 'majors', id), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `majors/${id}`);
  }
}

export async function firestoreDeleteMajor(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'majors', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `majors/${id}`);
  }
}

export async function firestoreAddAcademicYear(year: AcademicYear): Promise<void> {
  try {
    await setDoc(doc(db, 'academicYears', year.id), year);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `academicYears/${year.id}`);
  }
}

export async function firestoreDeleteAcademicYear(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'academicYears', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `academicYears/${id}`);
  }
}

export async function firestoreSetActiveAcademicYear(years: AcademicYear[], targetId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    years.forEach(y => {
      batch.update(doc(db, 'academicYears', y.id), { isActive: y.id === targetId });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'academicYears');
  }
}

export async function firestoreSaveAttendance(
  session: AttendanceSession,
  records: AttendanceRecord[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'attendanceSessions', session.id), session);
    records.forEach(rec => {
      batch.set(doc(db, 'attendanceRecords', rec.id), rec);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `attendanceSessions/${session.id}`);
  }
}

export async function firestoreSaveAssessment(
  assessment: Assessment,
  scores: AssessmentScore[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'assessments', assessment.id), assessment);
    scores.forEach(sc => {
      batch.set(doc(db, 'assessmentScores', sc.id), sc);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `assessments/${assessment.id}`);
  }
}

export async function firestoreAddUser(user: User): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
}

export async function firestoreUpdateUser(userId: string, updates: Partial<User>): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function firestoreDeleteUser(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
  }
}

export async function firestoreSendChat(message: ChatMessage): Promise<void> {
  try {
    await setDoc(doc(db, 'chatMessages', message.id), message);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `chatMessages/${message.id}`);
  }
}

export async function firestoreDeleteChat(messageId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'chatMessages', messageId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `chatMessages/${messageId}`);
  }
}

export async function firestorePushNotification(item: NotificationItem): Promise<void> {
  try {
    await setDoc(doc(db, 'notifications', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notifications/${item.id}`);
  }
}

export async function firestoreMarkNotificationRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
  }
}

export async function firestoreDeleteNotification(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'notifications', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `notifications/${id}`);
  }
}

export async function firestoreClearNotifications(items: NotificationItem[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    items.forEach(it => {
      batch.delete(doc(db, 'notifications', it.id));
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'notifications');
  }
}

export async function firestoreAddAuditLog(log: AuditLog): Promise<void> {
  try {
    await setDoc(doc(db, 'auditLogs', log.id), log);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `auditLogs/${log.id}`);
  }
}

export async function firestoreSendDirectMessage(message: ChatMessage): Promise<void> {
  try {
    await setDoc(doc(db, 'directMessages', message.id), message);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `directMessages/${message.id}`);
  }
}

export async function firestoreDeleteDirectMessage(messageId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'directMessages', messageId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `directMessages/${messageId}`);
  }
}

export async function firestoreSaveReportTemplate(template: any): Promise<void> {
  try {
    await setDoc(doc(db, 'reportTemplates', 'default_template'), {
      ...template,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'reportTemplates/default_template');
  }
}

// Reset/reseed utility that user can invoke from UI if needed
export async function forceReseedFirestore(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const batch = writeBatch(db);

    initialStudents.forEach(item => batch.set(doc(db, 'students', item.id), item));
    initialTeachers.forEach(item => batch.set(doc(db, 'teachers', item.id), item));
    initialClasses.forEach(item => batch.set(doc(db, 'classes', item.id), item));
    initialMajors.forEach(item => batch.set(doc(db, 'majors', item.id), item));
    initialSubjects.forEach(item => batch.set(doc(db, 'subjects', item.id), item));
    initialAcademicYears.forEach(item => batch.set(doc(db, 'academicYears', item.id), item));
    initialUsers.forEach(item => batch.set(doc(db, 'users', item.id), item));
    initialAttendanceSessions.forEach(item => batch.set(doc(db, 'attendanceSessions', item.id), item));
    initialAttendanceRecords.forEach(item => batch.set(doc(db, 'attendanceRecords', item.id), item));
    initialAssessments.forEach(item => batch.set(doc(db, 'assessments', item.id), item));
    initialAssessmentScores.forEach(item => batch.set(doc(db, 'assessmentScores', item.id), item));
    initialNotifications.forEach(item => batch.set(doc(db, 'notifications', item.id), item));
    initialChatMessages.forEach(item => batch.set(doc(db, 'chatMessages', item.id), item));
    initialAuditLogs.forEach(item => batch.set(doc(db, 'auditLogs', item.id), item));

    await batch.commit();
    return { success: true, count: 14 };
  } catch (e: any) {
    return { success: false, count: 0, error: e?.message || 'Gagal menyinkronkan data' };
  }
}

function sanitizeForFirestore<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Attendance Cascade Delete & Full Recap Sync
export async function firestoreDeleteAttendanceSessionAndRecords(sessionId: string, recordIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'attendanceSessions', sessionId));
    recordIds.forEach(rid => {
      batch.delete(doc(db, 'attendanceRecords', rid));
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `attendanceSessions/${sessionId}`);
  }
}

export async function firestoreUpdateAttendanceRecord(record: AttendanceRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'attendanceRecords', record.id), sanitizeForFirestore(record), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `attendanceRecords/${record.id}`);
  }
}

export async function firestoreSyncClassAttendanceRecap(
  sessionsToSave: AttendanceSession[],
  recordsToSave: AttendanceRecord[],
  sessionIdsToDelete: string[],
  recordIdsToDelete: string[]
): Promise<void> {
  try {
    const allOps: Array<{ type: 'setSession' | 'setRecord' | 'delSession' | 'delRecord'; payload: any }> = [];
    sessionIdsToDelete.forEach(id => allOps.push({ type: 'delSession', payload: id }));
    recordIdsToDelete.forEach(id => allOps.push({ type: 'delRecord', payload: id }));
    sessionsToSave.forEach(s => allOps.push({ type: 'setSession', payload: s }));
    recordsToSave.forEach(r => allOps.push({ type: 'setRecord', payload: r }));

    const chunkSize = 400;
    for (let i = 0; i < allOps.length; i += chunkSize) {
      const chunk = allOps.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(op => {
        if (op.type === 'delSession') {
          batch.delete(doc(db, 'attendanceSessions', op.payload));
        } else if (op.type === 'delRecord') {
          batch.delete(doc(db, 'attendanceRecords', op.payload));
        } else if (op.type === 'setSession') {
          batch.set(doc(db, 'attendanceSessions', op.payload.id), sanitizeForFirestore(op.payload));
        } else if (op.type === 'setRecord') {
          batch.set(doc(db, 'attendanceRecords', op.payload.id), sanitizeForFirestore(op.payload));
        }
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'attendanceSessions/RecapSync');
  }
}

// PKL & DUDI Administration Cloud Firestore Sync
export async function firestoreSavePklPartner(partner: IndustryPartner): Promise<void> {
  try {
    await setDoc(doc(db, 'pklPartners', partner.id), sanitizeForFirestore(partner));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `pklPartners/${partner.id}`);
  }
}

export async function firestoreDeletePklPartner(partnerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'pklPartners', partnerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `pklPartners/${partnerId}`);
  }
}

export async function firestoreSavePklVisit(visit: PklVisitRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'pklVisits', visit.id), sanitizeForFirestore(visit));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `pklVisits/${visit.id}`);
  }
}

export async function firestoreDeletePklVisit(visitId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'pklVisits', visitId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `pklVisits/${visitId}`);
  }
}

export async function firestoreSavePklReport(report: PklStudentReportItem): Promise<void> {
  try {
    await setDoc(doc(db, 'pklReports', report.id), sanitizeForFirestore(report));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `pklReports/${report.id}`);
  }
}

export async function firestoreDeletePklReport(reportId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'pklReports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `pklReports/${reportId}`);
  }
}

export async function firestoreClearAllPklData(
  partnerIds: string[],
  visitIds: string[],
  reportIds: string[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    partnerIds.forEach(id => batch.delete(doc(db, 'pklPartners', id)));
    visitIds.forEach(id => batch.delete(doc(db, 'pklVisits', id)));
    reportIds.forEach(id => batch.delete(doc(db, 'pklReports', id)));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'pklData/clearAll');
  }
}

export async function firestoreSaveVisualSettings(settings: VisualSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'visual_theme'), sanitizeForFirestore(settings));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/visual_theme');
  }
}

export async function firestoreSaveLessonSchedule(schedule: LessonSchedule): Promise<void> {
  try {
    await setDoc(doc(db, 'lessonSchedules', schedule.id), sanitizeForFirestore(schedule));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `lessonSchedules/${schedule.id}`);
  }
}

export async function firestoreDeleteLessonSchedule(scheduleId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'lessonSchedules', scheduleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `lessonSchedules/${scheduleId}`);
  }
}
