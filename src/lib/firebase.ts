import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setLogLevel, disableNetwork } from 'firebase/firestore';
import firebaseConfigRaw from '../../firebase-applet-config.json';

// Suppress internal @firebase/firestore SDK backoff/quota retry logs so they never trigger runtime error overlays
try {
  setLogLevel('silent');
} catch {}

// Resolve configuration from JSON or Vercel Environment Variables
const env = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};
const rawConfig = (firebaseConfigRaw || {}) as any;

export const resolvedFirebaseConfig = {
  apiKey: "AIzaSyDnPJ_I9_kkoWzJ4K1aI3zSGoGq563ZEGI",
  authDomain: "gen-lang-client-0159880459.firebaseapp.com",
  projectId: "gen-lang-client-0159880459",
  storageBucket: "gen-lang-client-0159880459.firebasestorage.app",
  messagingSenderId: "324008280807",
  appId: "1:324008280807:web:cd7145cdad91035f4e5842"
};

// Initialize Firebase safely
export const app = !getApps().length ? initializeApp(resolvedFirebaseConfig) : getApp();
export const db = resolvedFirebaseConfig.firestoreDatabaseId
  ? getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (DO NOT store in localStorage per security guidelines)
let cachedAccessToken: string | null = null;

// Circuit breaker for Firestore free-tier daily quota exhaustion
const QUOTA_FLAG_KEY = 'orbita_firestore_quota_tripped_date';
let quotaCircuitTripped = false;
let networkDisabledForQuota = false;

function getTodayUtcDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isFirestoreQuotaExhausted(): boolean {
  if (quotaCircuitTripped) return true;
  try {
    if (typeof sessionStorage !== 'undefined') {
      const flaggedDate = sessionStorage.getItem(QUOTA_FLAG_KEY);
      if (flaggedDate === getTodayUtcDateStr()) {
        quotaCircuitTripped = true;
        if (!networkDisabledForQuota) {
          networkDisabledForQuota = true;
          disableNetwork(db).catch(() => {});
        }
        return true;
      }
    }
  } catch {}
  return false;
}

export function tripFirestoreQuotaBreaker(): void {
  quotaCircuitTripped = true;
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(QUOTA_FLAG_KEY, getTodayUtcDateStr());
    }
  } catch {}
  if (!networkDisabledForQuota) {
    networkDisabledForQuota = true;
    disableNetwork(db).catch(() => {});
  }
}

export function isQuotaOrOfflineErrorMessage(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes('resource-exhausted') ||
    lower.includes('quota limit exceeded') ||
    lower.includes('quota exceeded') ||
    lower.includes('free daily write units') ||
    lower.includes('free daily read units') ||
    lower.includes('maximum backoff delay') ||
    lower.includes('client is offline') ||
    lower.includes('no document to update')
  );
}

// Operation types for strict Firestore error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const code = String((error as any)?.code || '').toLowerCase();

  if (code.includes('resource-exhausted') || isQuotaOrOfflineErrorMessage(rawMessage)) {
    if (
      code.includes('resource-exhausted') ||
      rawMessage.toLowerCase().includes('quota') ||
      rawMessage.toLowerCase().includes('free daily')
    ) {
      tripFirestoreQuotaBreaker();
    }
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: rawMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };

  console.warn('Firestore Notice:', JSON.stringify(errInfo));
}

// Connection test at boot time as mandated by skill
export async function testConnection(): Promise<boolean> {
  if (isFirestoreQuotaExhausted()) {
    return false;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const code = String((error as any)?.code || '').toLowerCase();
    if (code.includes('resource-exhausted') || isQuotaOrOfflineErrorMessage(msg)) {
      if (code.includes('resource-exhausted') || msg.toLowerCase().includes('quota')) {
        tripFirestoreQuotaBreaker();
      }
    }
    return false;
  }
}

// Initiate test connection safely without unhandled rejection
testConnection().catch(() => {});

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export function getCachedGoogleToken(): string | null {
  return cachedAccessToken;
}

export async function logoutUser() {
  cachedAccessToken = null;
  return fbSignOut(auth);
}
