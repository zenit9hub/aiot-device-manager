/**
 * Auth Service
 *
 * Firebase Authentication을 래핑한 인증 서비스
 */

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  User,
  UserCredential,
  Auth,
} from 'firebase/auth';
import { getFirebaseAuth } from '@shared/api/firebase/firebase-init';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SignOutResult {
  success: boolean;
  error?: string;
}

export class AuthService {
  private _auth?: Auth;
  private _googleProvider?: GoogleAuthProvider;

  private get auth(): Auth {
    if (!this._auth) {
      this._auth = getFirebaseAuth();
    }
    return this._auth;
  }

  private get googleProvider(): GoogleAuthProvider {
    if (!this._googleProvider) {
      this._googleProvider = new GoogleAuthProvider();
    }
    return this._googleProvider;
  }

  /**
   * 이메일/비밀번호 로그인
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // 입력 검증
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      if (!password || password.length === 0) {
        return {
          success: false,
          error: 'Password is required',
        };
      }

      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign in failed',
      };
    }
  }

  /**
   * Google OAuth 로그인
   */
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const userCredential: UserCredential = await signInWithPopup(
        this.auth,
        this.googleProvider
      );

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Google sign in failed',
      };
    }
  }

  /**
   * 로그아웃
   */
  async signOut(): Promise<SignOutResult> {
    try {
      await firebaseSignOut(this.auth);

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  }

  /**
   * 인증 상태 변경 구독
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(this.auth, callback);
  }

  /**
   * 현재 사용자 조회
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * 이메일 형식 검증
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// 싱글톤 인스턴스
export const authService = new AuthService();
