import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { firebaseConfig, isFirebaseConfigured } from '../../shared/config/firebase-config';

let firebaseApp: FirebaseApp | null = null;

function createFirebaseApp() {
  if (!isFirebaseConfigured) {
    return null;
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

export function getFirebaseApp() {
  return createFirebaseApp();
}

export function getFirebaseAuth(): Auth | null {
  const app = createFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseStore(): Firestore | null {
  const app = createFirebaseApp();
  return app ? getFirestore(app) : null;
}

let analyticsInstance: Analytics | null = null;

export function getFirebaseAnalytics(): Analytics | null {
  if (!isFirebaseConfigured || !firebaseConfig.measurementId) {
    return null;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const app = createFirebaseApp();
  if (!app) {
    return null;
  }

  if (!analyticsInstance) {
    try {
      analyticsInstance = getAnalytics(app);
    } catch (error) {
      console.warn('[firebase] analytics 초기화 실패', error);
      analyticsInstance = null;
    }
  }

  return analyticsInstance;
}
