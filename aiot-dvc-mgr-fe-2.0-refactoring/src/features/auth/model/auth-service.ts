import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getFirebaseAuth } from '../../../app/providers/firebase-provider';

const provider = new GoogleAuthProvider();

export const authService = {
  async loginWithGoogle(): Promise<User> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase 인증이 구성되어 있지 않습니다.');
    }
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
};
