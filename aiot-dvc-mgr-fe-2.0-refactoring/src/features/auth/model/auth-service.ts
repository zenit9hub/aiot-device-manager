import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';
import { getFirebaseAuth } from '../../../app/providers/firebase-provider';

const provider = new GoogleAuthProvider();

async function ensurePersistence(auth: Auth) {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.warn('[auth] persistence 유지 실패', error);
  }
}

export const authService = {
  async loginWithGoogle(): Promise<User> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase 인증이 구성되어 있지 않습니다.');
    }
    await ensurePersistence(auth);
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },

  async logout() {
    const auth = getFirebaseAuth();
    if (!auth) {
      return Promise.resolve();
    }
    return signOut(auth);
  },

  currentUser(): User | null {
    const auth = getFirebaseAuth();
    return auth?.currentUser ?? null;
  },
  watchAuthState(callback: (user: User | null) => void) {
    const auth = getFirebaseAuth();
    if (!auth) {
      return () => {};
    }
    const unsubscribe = firebaseOnAuthStateChanged(auth, callback);
    return unsubscribe;
  },
};
