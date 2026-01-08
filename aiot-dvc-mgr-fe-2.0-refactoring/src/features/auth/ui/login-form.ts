/**
 * LoginForm Feature Component
 *
 * 이메일/비밀번호 로그인 폼
 */

import { authService } from '../model/auth-service';

interface LoginFormCallbacks {
  onSuccess: (userId: string) => void;
  onError: (error: string) => void;
}

export function createLoginForm(callbacks: LoginFormCallbacks): HTMLElement {
  const container = document.createElement('div');
  container.className = 'w-full max-w-md';

  // 에러 메시지 상태
  let errorMessage = '';

  const render = () => {
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            AIoT Device Manager
          </h1>
          <p class="text-gray-600">Phase 1 - Serverless MVP</p>
        </div>

        ${errorMessage ? `
          <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800">${errorMessage}</p>
          </div>
        ` : ''}

        <form id="login-form" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="your@email.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            type="submit"
            id="login-button"
            class="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Sign In
          </button>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            id="google-login-button"
            class="mt-4 w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>

        <p class="mt-6 text-center text-sm text-gray-500">
          Demo: test@example.com / password123
        </p>
      </div>
    `;

    // Form submit handler
    const form = container.querySelector('#login-form') as HTMLFormElement;
    const loginButton = container.querySelector('#login-button') as HTMLButtonElement;
    const emailInput = container.querySelector('#email') as HTMLInputElement;
    const passwordInput = container.querySelector('#password') as HTMLInputElement;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // UI 상태 업데이트
      loginButton.disabled = true;
      loginButton.textContent = 'Signing in...';
      errorMessage = '';

      try {
        const result = await authService.signInWithEmail(email, password);

        if (result.success && result.user) {
          callbacks.onSuccess(result.user.uid);
        } else {
          errorMessage = result.error || 'Login failed';
          callbacks.onError(errorMessage);
          render(); // 에러 메시지와 함께 다시 렌더링
        }
      } catch (error) {
        errorMessage = 'An unexpected error occurred';
        callbacks.onError(errorMessage);
        render();
      } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Sign In';
      }
    });

    // Google login handler
    const googleButton = container.querySelector('#google-login-button') as HTMLButtonElement;
    googleButton.addEventListener('click', async () => {
      googleButton.disabled = true;
      googleButton.textContent = 'Opening Google...';
      errorMessage = '';

      try {
        const result = await authService.signInWithGoogle();

        if (result.success && result.user) {
          callbacks.onSuccess(result.user.uid);
        } else {
          errorMessage = result.error || 'Google login failed';
          callbacks.onError(errorMessage);
          render();
        }
      } catch (error) {
        errorMessage = 'Google login is not available in this environment';
        callbacks.onError(errorMessage);
        render();
      } finally {
        googleButton.disabled = false;
        googleButton.textContent = 'Sign in with Google';
      }
    });
  };

  render();
  return container;
}
