// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  loginWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
}));

vi.mock('../model/auth-service', () => ({
  authService: {
    loginWithEmail: authMocks.loginWithEmail,
    signUpWithEmail: authMocks.signUpWithEmail,
    loginWithGoogle: authMocks.loginWithGoogle,
  },
}));

import { createLoginForm } from '../ui/login-form';

describe('createLoginForm', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    authMocks.loginWithEmail.mockReset();
    authMocks.signUpWithEmail.mockReset();
    authMocks.loginWithGoogle.mockReset();
  });

  it('submits email login by default', async () => {
    const form = createLoginForm();
    document.body.appendChild(form);

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const emailForm = document.querySelector('form');

    emailInput.value = 'tester@example.com';
    passwordInput.value = 'password123';

    emailForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(authMocks.loginWithEmail).toHaveBeenCalledWith('tester@example.com', 'password123');
    expect(authMocks.signUpWithEmail).not.toHaveBeenCalled();
  });

  it('calls signUpWithEmail when signup button is clicked', async () => {
    const form = createLoginForm();
    document.body.appendChild(form);

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const signUpButton = Array.from(document.querySelectorAll('button')).find(
      button => button.textContent === '회원가입',
    ) as HTMLButtonElement;

    emailInput.value = 'new-user@example.com';
    passwordInput.value = 'password123';

    signUpButton.click();
    await Promise.resolve();

    expect(authMocks.signUpWithEmail).toHaveBeenCalledWith('new-user@example.com', 'password123');
    expect(authMocks.loginWithEmail).not.toHaveBeenCalled();
  });
});
