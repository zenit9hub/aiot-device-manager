import { createButton } from '../../../shared/ui/button';
import { createElement } from '../../../shared/lib/dom';
import { authService } from '../model/auth-service';

export function createLoginForm() {
  const section = createElement('section', {
    className: 'panel p-6 mb-6 space-y-4 shadow-lg shadow-black/60',
  });

  const heading = createElement('h2', {
    className: 'text-2xl font-bold text-white',
    text: '빠른 로그인으로 실습 시작',
  });
  const message = createElement('p', {
    className: 'text-slate-300 leading-relaxed',
    text: 'Firebase Auth를 이용해 이메일 또는 Google 로그인으로 디바이스 접근을 준비합니다.',
  });

  const status = createElement('p', {
    className: 'text-sm text-slate-400',
    text: '상태: 준비 완료',
  });

  function emitAuthError(error: unknown) {
    const code = (error as { code?: string })?.code;
    window.dispatchEvent(new CustomEvent('auth-error', { detail: { code } }));
    console.warn(error);
  }

  const form = createElement('form', { className: 'space-y-3' });
  const emailInput = createElement('input', {
    className:
      'w-full rounded-xl border border-slate-700/60 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none',
    attrs: {
      type: 'email',
      placeholder: '이메일 주소',
      autocomplete: 'username',
      required: 'true',
    },
  }) as HTMLInputElement;
  const passwordInput = createElement('input', {
    className:
      'w-full rounded-xl border border-slate-700/60 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none',
    attrs: {
      type: 'password',
      placeholder: '비밀번호',
      autocomplete: 'current-password',
      required: 'true',
    },
  }) as HTMLInputElement;
  const emailButton = createButton('이메일 로그인');
  emailButton.setAttribute('type', 'submit');
  emailButton.classList.add('w-full');

  form.append(emailInput, passwordInput, emailButton);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      status.textContent = '상태: 이메일과 비밀번호를 모두 입력하세요.';
      return;
    }
    status.textContent = '상태: 로그인 시도 중...';
    try {
      await authService.loginWithEmail(email, password);
      status.textContent = '상태: 로그인 성공';
    } catch (error) {
      status.textContent = '상태: 이메일 인증 실패 또는 정보 확인 필요';
      emitAuthError(error);
    }
  });

  const divider = createElement('p', {
    className: 'text-center text-xs text-slate-500',
    text: '또는',
  });

  const googleButton = createButton('Google 로그인', {
    onClick: async (event) => {
      event.preventDefault();
      status.textContent = '상태: 로그인 시도 중...';
      try {
        const user = await authService.loginWithGoogle();
        status.textContent = user ? '상태: 로그인 성공' : '상태: 리다이렉트 진행 중...';
      } catch (error) {
        status.textContent = '상태: Firebase 설정 확인 필요';
        emitAuthError(error);
      }
    },
  });
  googleButton.setAttribute('type', 'button');
  googleButton.classList.add('w-full');

  section.append(heading, message, status, form, divider, googleButton);
  return section;
}
