import { describe, it, expect } from 'vitest';
import { authService } from '../model/auth-service';

describe('authService', () => {
  it('exposes login/logout helpers', () => {
    expect(typeof authService.loginWithGoogle).toBe('function');
    expect(typeof authService.logout).toBe('function');
  });

  it('initially reports no authenticated user', () => {
    expect(authService.currentUser()).toBeNull();
  });
});
