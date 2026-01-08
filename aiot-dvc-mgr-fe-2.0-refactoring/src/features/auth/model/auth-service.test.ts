/**
 * Auth Service 테스트
 *
 * TDD: 테스트 먼저 작성
 * Firebase Emulator 환경에서 실행
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth-service';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

describe('AuthService', () => {
  let authService: AuthService;
  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  beforeEach(async () => {
    authService = new AuthService();

    // Emulator 환경: 기존 세션 정리
    const auth = getAuth();
    if (auth.currentUser) {
      await signOut(auth);
    }

    // 테스트 사용자 생성
    try {
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      await signOut(auth); // 로그인 상태 초기화
    } catch (error: any) {
      // 이미 존재하는 사용자는 무시
      if (!error.code?.includes('email-already-in-use')) {
        throw error;
      }
    }
  });

  describe('이메일/비밀번호 로그인', () => {
    it('유효한 이메일과 비밀번호로 로그인할 수 있어야 한다', async () => {
      const result = await authService.signInWithEmail(testEmail, testPassword);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(testEmail);
    });

    it('잘못된 이메일 형식은 거부되어야 한다', async () => {
      const result = await authService.signInWithEmail('invalid-email', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('빈 비밀번호는 거부되어야 한다', async () => {
      const result = await authService.signInWithEmail('test@example.com', '');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Google OAuth 로그인', () => {
    it.skip('Google 로그인 팝업을 열 수 있어야 한다 (jsdom 환경에서는 skip)', async () => {
      // jsdom 환경에서는 팝업이 작동하지 않음
      // 실제 브라우저에서 수동 테스트 필요
      const result = await authService.signInWithGoogle();

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });
  });

  describe('로그아웃', () => {
    it('로그아웃할 수 있어야 한다', async () => {
      // 먼저 로그인
      await authService.signInWithEmail(testEmail, testPassword);

      // 로그아웃
      const result = await authService.signOut();

      expect(result.success).toBe(true);
    });
  });

  describe('인증 상태 관찰', () => {
    it('인증 상태 변경을 구독할 수 있어야 한다', async () => {
      const callback = vi.fn();

      // 구독 설정
      const unsubscribe = authService.onAuthStateChanged(callback);

      // 로그인으로 상태 변경 유발
      await authService.signInWithEmail(testEmail, testPassword);

      // 비동기 대기
      await new Promise(resolve => setTimeout(resolve, 100));

      // 콜백이 호출되었는지 확인
      expect(callback).toHaveBeenCalled();

      unsubscribe();
    });
  });

  describe('현재 사용자 조회', () => {
    it('로그인 후 현재 사용자를 조회할 수 있어야 한다', async () => {
      // 로그인
      await authService.signInWithEmail(testEmail, testPassword);

      // 현재 사용자 조회
      const user = authService.getCurrentUser();

      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
    });

    it('로그아웃 후에는 null을 반환해야 한다', async () => {
      // 로그인
      await authService.signInWithEmail(testEmail, testPassword);

      // 로그아웃
      await authService.signOut();

      // 현재 사용자 조회
      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });
});
