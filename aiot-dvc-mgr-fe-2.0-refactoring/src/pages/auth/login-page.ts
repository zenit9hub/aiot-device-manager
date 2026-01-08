/**
 * Login Page
 *
 * 로그인 페이지 레이아웃
 */

import { createLoginForm } from '@features/auth/ui/login-form';

export function renderLoginPage(onLoginSuccess: (userId: string) => void): HTMLElement {
  const page = document.createElement('div');
  page.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4';

  const loginForm = createLoginForm({
    onSuccess: (userId) => {
      console.log('[LoginPage] Login successful:', userId);
      onLoginSuccess(userId);
    },
    onError: (error) => {
      console.error('[LoginPage] Login error:', error);
    },
  });

  page.appendChild(loginForm);

  return page;
}
