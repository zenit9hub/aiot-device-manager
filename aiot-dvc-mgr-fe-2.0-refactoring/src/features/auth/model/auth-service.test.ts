/**
 * Auth Service 테스트
 *
 * TDD: 테스트 먼저 작성
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('이메일/비밀번호 로그인', () => {
    it('유효한 이메일과 비밀번호로 로그인할 수 있어야 한다', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const result = await authService.signInWithEmail(email, password);

      if (!result.success) {
        console.log('Login failed with error:', result.error);
      }

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(email);
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
    it('Google 로그인 팝업을 열 수 있어야 한다', async () => {
      const result = await authService.signInWithGoogle();

      if (!result.success) {
        console.log('Google login failed with error:', result.error);
      }

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });
  });

  describe('로그아웃', () => {
    it('로그아웃할 수 있어야 한다', async () => {
      const result = await authService.signOut();

      expect(result.success).toBe(true);
    });
  });

  describe('인증 상태 관찰', () => {
    it('인증 상태 변경을 구독할 수 있어야 한다', () => {
      const callback = vi.fn();

      authService.onAuthStateChanged(callback);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('현재 사용자 조회', () => {
    it('현재 사용자를 조회할 수 있어야 한다', () => {
      const user = authService.getCurrentUser();

      expect(user).toBeDefined();
    });
  });
});
