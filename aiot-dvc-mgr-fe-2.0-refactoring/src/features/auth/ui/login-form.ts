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
    text: 'Firebase Auth 연동 상태를 확인하고 Google 로그인으로 디바이스 접근을 준비합니다.',
  });

  const status = createElement('p', {
    className: 'text-sm text-slate-400',
    text: '상태: 준비 완료',
  });

    const button = createButton('Google 로그인', {
      onClick: async (event) => {
        event.preventDefault();
        status.textContent = '상태: 로그인 시도 중...';
        try {
          const user = await authService.loginWithGoogle();
          status.textContent = user ? '상태: 로그인 성공' : '상태: 리다이렉트 진행 중...';
        } catch (error) {
          status.textContent = '상태: Firebase 설정 확인 필요';
          console.warn(error);
        }
      },
    });

  section.append(heading, message, button, status);
  return section;
}
