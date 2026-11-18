import {
  Student,
  Teacher,
  ClassRoom,
  Major,
  Subject,
  AcademicYear,
  User,
  AttendanceSession,
  AttendanceRecord,
  AttendanceCorrection,
  Assessment,
  AssessmentScore,
  AuditLog,
  NotificationItem,
  ChatMessage,
  IndustryPartner,
  PklVisitRecord,
  PklStudentReportItem,
  AlumniTracerRecord,
  VisualSettings,
  SchoolSettings,
  LessonSchedule,
  GalleryPhoto,
  GalleryViewSettings,
} from '../types';
import {
  initialStudents,
  initialTeachers,
  initialClasses,
  initialMajors,
  initialSubjects,
  initialAcademicYears,
  initialUsers,
  initialAttendanceSessions,
  initialAttendanceRecords,
  initialAttendanceCorrections,
  initialAssessments,
  initialAssessmentScores,
  initialAuditLogs,
  initialNotifications,
  initialChatMessages,
  initialLessonSchedules,
} from '../data/seedData';
import { initialAlumniTracers } from '../data/pklSeedData';
import { ReportCustomConfig } from '../utils/exportUtils';

export interface AllSyncCollections {
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  majors: Major[];
  subjects: Subject[];
  academicYears: AcademicYear[];
  users: User[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  attendanceCorrections: AttendanceCorrection[];
  assessments: Assessment[];
  assessmentScores: AssessmentScore[];
  customStudentReports: Record<string, any>;
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  chatMessages: ChatMessage[];
  directMessages: any[];
  reportTemplate: ReportCustomConfig;
  pklPartners: IndustryPartner[];
  pklVisits: PklVisitRecord[];
  pklReports: PklStudentReportItem[];
  pklTracers: AlumniTracerRecord[];
  visualSettings: VisualSettings;
  schoolSettings: SchoolSettings;
  lessonSchedules: LessonSchedule[];
  galleryPhotos: GalleryPhoto[];
  galleryViewSettings: GalleryViewSettings;
}

export type SyncCollectionKey = keyof AllSyncCollections;

export const ALL_SYNC_KEYS: SyncCollectionKey[] = [
  'students',
  'teachers',
  'classes',
  'majors',
  'subjects',
  'academicYears',
  'users',
  'attendanceSessions',
  'attendanceRecords',
  'attendanceCorrections',
  'assessments',
  'assessmentScores',
  'customStudentReports',
  'auditLogs',
  'notifications',
  'chatMessages',
  'directMessages',
  'reportTemplate',
  'pklPartners',
  'pklVisits',
  'pklReports',
  'pklTracers',
  'visualSettings',
  'schoolSettings',
  'lessonSchedules',
  'galleryPhotos',
  'galleryViewSettings',
];

const CLIENT_ID_STORAGE_KEY = 'orbita_device_client_id';

export function getDeviceClientId(): string {
  try {
    let existing = sessionStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (!existing) {
      existing = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(CLIENT_ID_STORAGE_KEY, existing);
    }
    return existing;
  } catch {
    return `dev-${Date.now().toString(36)}`;
  }
}

export function computeCollectionHash(val: any): string {
  try {
    const str = JSON.stringify(val);
    if (!str) return '0:0:0';
    let h1 = 2166136261;
    let h2 = 5381;
    const len = str.length;
    const limit = Math.min(len, 150000);
    for (let i = 0; i < limit; i++) {
      const c = str.charCodeAt(i);
      h1 ^= c;
      h1 = Math.imul(h1, 16777619);
      h2 = (Math.imul(h2, 33) ^ c) | 0;
    }
    for (let i = limit; i < len; i += 7) {
      const c = str.charCodeAt(i);
      h1 ^= c;
      h1 = Math.imul(h1, 16777619);
      h2 = (Math.imul(h2, 33) ^ c) | 0;
    }
    return `${len}:${(h1 >>> 0).toString(36)}:${(h2 >>> 0).toString(36)}`;
  } catch {
    return '0:0:0';
  }
}

// Compute baseline hashes of initial seed data so we can detect which collections a user has customized/inputted
const SEED_BASELINE_HASHES: Partial<Record<SyncCollectionKey, string>> = {
  students: computeCollectionHash(initialStudents),
  teachers: computeCollectionHash(initialTeachers),
  classes: computeCollectionHash(initialClasses),
  majors: computeCollectionHash(initialMajors),
  subjects: computeCollectionHash(initialSubjects),
  academicYears: computeCollectionHash(initialAcademicYears),
  users: computeCollectionHash(initialUsers),
  attendanceSessions: computeCollectionHash(initialAttendanceSessions),
  attendanceRecords: computeCollectionHash(initialAttendanceRecords),
  attendanceCorrections: computeCollectionHash(initialAttendanceCorrections),
  assessments: computeCollectionHash(initialAssessments),
  assessmentScores: computeCollectionHash(initialAssessmentScores),
  customStudentReports: computeCollectionHash({}),
  auditLogs: computeCollectionHash(initialAuditLogs),
  notifications: computeCollectionHash(initialNotifications),
  chatMessages: computeCollectionHash(initialChatMessages),
  directMessages: computeCollectionHash([]),
  pklPartners: computeCollectionHash([]),
  pklVisits: computeCollectionHash([]),
  pklReports: computeCollectionHash([]),
  pklTracers: computeCollectionHash(initialAlumniTracers),
  lessonSchedules: computeCollectionHash(initialLessonSchedules),
  galleryPhotos: computeCollectionHash([]),
};

export function isCollectionCustomized(key: SyncCollectionKey, value: any): boolean {
  if (value === undefined || value === null) return false;
  if (key === 'galleryPhotos') {
    return Array.isArray(value) && value.length > 0;
  }
  if (key === 'customStudentReports') {
    return typeof value === 'object' && Object.keys(value).length > 0;
  }
  if (key === 'pklPartners' || key === 'pklVisits' || key === 'pklReports') {
    return Array.isArray(value) && value.length > 0;
  }
  if (key === 'visualSettings') {
    const v = value as VisualSettings;
    return Boolean(
      v.appLogoUrl ||
        v.faviconUrl ||
        v.loginBgUrl ||
        v.menuBgUrl ||
        v.globalBannerBgUrl ||
        (v.loginBgType && v.loginBgType !== 'default') ||
        (v.menuBgType && v.menuBgType !== 'default') ||
        (v.moduleBannerBgs && Object.keys(v.moduleBannerBgs).length > 0) ||
        (v.boxBgs && Object.keys(v.boxBgs).length > 0)
    );
  }
  if (key === 'schoolSettings') {
    const s = value as SchoolSettings;
    return Boolean(
      s &&
        ((s.schoolName && s.schoolName !== 'SMKS Muhammadiyah 1 Cikembar') ||
          s.logoUrl ||
          (s.principalName && s.principalName !== 'Nia Kurniasari, S.Pd'))
    );
  }
  if (key === 'reportTemplate') {
    const r = value as ReportCustomConfig;
    return Boolean(r && (r.logoDataUrl || r.leftSignerSignatureUrl || r.rightSignerSignatureUrl));
  }
  if (key === 'galleryViewSettings') {
    return false;
  }
  const seedHash = SEED_BASELINE_HASHES[key];
  if (!seedHash) return false;
  return computeCollectionHash(value) !== seedHash;
}

// Candidate sync hub endpoints (supports same-origin Express server + shared Cloud Run URLs for external static hosts)
const CANDIDATE_ENDPOINTS = [
  '',
  'https://ais-pre-pjuxup3ea2jgm7f3p5ixbz-568908459739.asia-east1.run.app',
  'https://ais-dev-pjuxup3ea2jgm7f3p5ixbz-568908459739.asia-east1.run.app',
];

let resolvedBaseUrl: string | null = null;

async function resolveWorkingEndpoints(): Promise<string[]> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const uniqueEndpoints: string[] = [];

  for (const ep of CANDIDATE_ENDPOINTS) {
    const normalized = ep === origin ? '' : ep;
    if (!uniqueEndpoints.includes(normalized)) {
      uniqueEndpoints.push(normalized);
    }
  }

  if (resolvedBaseUrl !== null) {
    return [resolvedBaseUrl, ...uniqueEndpoints.filter(e => e !== resolvedBaseUrl)];
  }

  for (const base of uniqueEndpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${base}/api/sync/ping`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.ok) {
            resolvedBaseUrl = base;
            return [base, ...uniqueEndpoints.filter(e => e !== base)];
          }
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  return uniqueEndpoints;
}

export async function pingSyncHubVersion(): Promise<{ version: number; updatedAt: string } | null> {
  const endpoints = await resolveWorkingEndpoints();
  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}/api/sync/ping`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.ok && typeof data.version === 'number') {
        resolvedBaseUrl = base;
        return { version: data.version, updatedAt: data.updatedAt || '' };
      }
    } catch {
      // Try next
    }
  }
  return null;
}

export interface PullSyncResult {
  ok: boolean;
  version: number;
  updatedAt: string;
  collections: Partial<AllSyncCollections>;
  meta: Record<string, { updatedAt: string; isCustom: boolean; clientId: string; hash: string }>;
}

export async function pullStateFromSyncHub(keys?: SyncCollectionKey[]): Promise<PullSyncResult | null> {
  const endpoints = await resolveWorkingEndpoints();
  const query = keys && keys.length > 0 ? `?keys=${encodeURIComponent(keys.join(','))}` : '';

  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}/api/sync/state${query}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Orbita-Client-Id': getDeviceClientId(),
        },
        cache: 'no-store',
      });
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) continue;
      const data = await res.json();
      if (data && data.ok && data.collections) {
        resolvedBaseUrl = base;
        return data as PullSyncResult;
      }
    } catch {
      // Try next endpoint
    }
  }
  return null;
}

export async function pushStateToSyncHub(
  collections: Partial<AllSyncCollections>,
  mode: 'hydrate' | 'auto' | 'force' = 'auto'
): Promise<{ ok: boolean; changedKeys: string[]; version?: number }> {
  const customFlags: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(collections)) {
    const key = k as SyncCollectionKey;
    customFlags[key] = mode === 'force' ? true : isCollectionCustomized(key, v);
  }

  const payload = JSON.stringify({
    collections,
    customFlags,
    mode,
    clientId: getDeviceClientId(),
  });

  const endpoints = await resolveWorkingEndpoints();
  let anySuccess = false;
  let changedKeys: string[] = [];
  let version: number | undefined;

  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}/api/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Orbita-Client-Id': getDeviceClientId(),
        },
        body: payload,
      });
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) continue;
      const data = await res.json();
      if (data && data.ok) {
        anySuccess = true;
        changedKeys = data.changedKeys || [];
        version = data.version;
        resolvedBaseUrl = base;
        if (mode !== 'force') break;
      }
    } catch {
      // Continue to fallback endpoint
    }
  }

  return { ok: anySuccess, changedKeys, version };
}

export function subscribeToSyncHubStream(
  onRemoteUpdate: (changedKeys: SyncCollectionKey[], version: number) => void
): () => void {
  let eventSource: EventSource | null = null;
  let closed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  const clientId = getDeviceClientId();

  const connect = async () => {
    if (closed) return;
    const endpoints = await resolveWorkingEndpoints();
    const base = endpoints[0] ?? '';
    const streamUrl = `${base}/api/sync/stream?clientId=${encodeURIComponent(clientId)}`;

    try {
      eventSource = new EventSource(streamUrl);
      eventSource.addEventListener('sync-update', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.sourceClientId !== clientId && Array.isArray(parsed.changedKeys)) {
            onRemoteUpdate(parsed.changedKeys as SyncCollectionKey[], parsed.version || 0);
          }
        } catch {
          // Ignore malformed event
        }
      });

      eventSource.onerror = () => {
        try {
          eventSource?.close();
        } catch {}
        eventSource = null;
        if (!closed) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    } catch {
      if (!closed) {
        reconnectTimer = setTimeout(connect, 5000);
      }
    }
  };

  connect();

  return () => {
    closed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    try {
      eventSource?.close();
    } catch {}
  };
}
