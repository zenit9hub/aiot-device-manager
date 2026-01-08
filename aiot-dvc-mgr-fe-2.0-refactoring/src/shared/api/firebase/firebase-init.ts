/**
 * Firebase 초기화
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig, validateFirebaseConfig } from '@shared/config/firebase';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initializeFirebase(): void {
  if (!validateFirebaseConfig(firebaseConfig)) {
    throw new Error('Firebase configuration is invalid. Please check your .env file.');
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Emulator 환경 감지 및 연결
  const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' ||
                      process.env.FIRESTORE_EMULATOR_HOST !== undefined;

  if (useEmulator) {
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      console.log('[Firebase] Connected to Emulators (Auth: 9099, Firestore: 8080)');
    } catch (error) {
      console.warn('[Firebase] Emulator connection failed:', error);
    }
  } else {
    console.log('[Firebase] Initialized successfully (Production)');
  }
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
}
