import { createButton } from '../../../shared/ui/button';
import { createElement } from '../../../shared/lib/dom';
import { authService } from '../model/auth-service';

type EmailAuthMode = 'login' | 'signup';

const emailAuthErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': '이미 가입된 이메일입니다. 이메일 로그인으로 시도하세요.',
  'auth/invalid-credential': '계정이 없거나 비밀번호가 일치하지 않습니다. 신규 사용자라면 회원가입을 선택하세요.',
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
  'auth/operation-not-allowed': 'Firebase Console에서 Email/Password 로그인을 활성화해야 합니다.',
  'auth/too-many-requests': '시도가 너무 많습니다. 잠시 후 다시 시도하세요.',
  'auth/weak-password': '비밀번호 정책을 만족하지 않습니다. 보통 6자 이상이 필요합니다.',
};

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

  const helper = createElement('p', {
    className: 'text-xs text-slate-500 leading-relaxed',
    text: '기존 계정은 로그인, 처음 사용하는 이메일은 회원가입을 선택하세요.',
  });

  function emitAuthError(error: unknown) {
    const code = (error as { code?: string })?.code;
    window.dispatchEvent(new CustomEvent('auth-error', { detail: { code } }));
    console.warn(error);
  }

  function describeAuthError(error: unknown, mode: EmailAuthMode) {
    const code = (error as { code?: string })?.code;
    if (code && emailAuthErrorMessages[code]) {
      return emailAuthErrorMessages[code];
    }
    return mode === 'signup'
      ? '회원가입에 실패했습니다. Firebase 설정과 입력 정보를 확인하세요.'
      : '이메일 로그인에 실패했습니다. 입력 정보와 Firebase 설정을 확인하세요.';
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
      minlength: 6,
      required: 'true',
    },
  }) as HTMLInputElement;

  const buttonRow = createElement('div', { className: 'grid gap-3 md:grid-cols-2' });
  const loginButton = createButton('이메일 로그인');
  loginButton.setAttribute('type', 'submit');
  loginButton.classList.add('w-full');
  const signUpButton = createButton('회원가입', { variant: 'ghost' });
  signUpButton.setAttribute('type', 'button');
  signUpButton.classList.add('w-full');
  buttonRow.append(loginButton, signUpButton);

  function setEmailButtonsDisabled(disabled: boolean) {
    loginButton.disabled = disabled;
    signUpButton.disabled = disabled;
    loginButton.classList.toggle('opacity-60', disabled);
    signUpButton.classList.toggle('opacity-60', disabled);
  }

  async function handleEmailAuth(mode: EmailAuthMode) {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      status.textContent = '상태: 이메일과 비밀번호를 모두 입력하세요.';
      return;
    }
    passwordInput.setAttribute('autocomplete', mode === 'signup' ? 'new-password' : 'current-password');
    status.textContent = mode === 'signup' ? '상태: 계정 생성 중...' : '상태: 로그인 시도 중...';
    setEmailButtonsDisabled(true);
    try {
      if (mode === 'signup') {
        await authService.signUpWithEmail(email, password);
        status.textContent = '상태: 회원가입 및 로그인 성공';
      } else {
        await authService.loginWithEmail(email, password);
        status.textContent = '상태: 로그인 성공';
      }
    } catch (error) {
      status.textContent = `상태: ${describeAuthError(error, mode)}`;
      emitAuthError(error);
    } finally {
      setEmailButtonsDisabled(false);
    }
  }

  form.append(emailInput, passwordInput, buttonRow);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await handleEmailAuth('login');
  });

  signUpButton.addEventListener('click', async (event) => {
    event.preventDefault();
    await handleEmailAuth('signup');
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

  section.append(heading, message, status, helper, form, divider, googleButton);
  return section;
}
