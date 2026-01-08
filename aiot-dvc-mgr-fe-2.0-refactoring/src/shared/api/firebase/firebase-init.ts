/**
 * Firebase 초기화
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
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

  console.log('[Firebase] Initialized successfully');
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
