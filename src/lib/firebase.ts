import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigRaw from '../../firebase-applet-config.json';

// Resolve configuration from JSON or Vercel Environment Variables
const env = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};
const rawConfig = (firebaseConfigRaw || {}) as any;

export const resolvedFirebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || rawConfig.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId || '',
  appId: env.VITE_FIREBASE_APP_ID || rawConfig.appId || '',
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || rawConfig.firestoreDatabaseId || 'ai-studio-adfbdbed-ac2d-4a06-bd2a-91d598030ae4',
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test at boot time as mandated by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline or connecting.');
    }
    return false;
  }
}

// Initiate test connection
testConnection().catch(console.error);

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
