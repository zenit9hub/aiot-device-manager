import { authService } from '../../features/auth/model/auth-service';
import { createButton } from '../../shared/ui/button';
import { createElement } from '../../shared/lib/dom';

export function createHeader() {
  const header = createElement('header', {
    className: 'flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60',
  });

  const brand = createElement('div', { className: 'flex flex-col', text: '' });
  const brandTitle = createElement('span', { className: 'text-xl font-bold text-white', text: 'AIoT Device Manager' });
  const brandSubtitle = createElement('small', { className: 'text-slate-400', text: 'Real-time IoT insights with Firebase + AWS' });
  brand.append(brandTitle, brandSubtitle);

  const controls = createElement('div', { className: 'flex items-center gap-3' });
  const loginStatus = createElement('span', {
    className: 'text-sm text-slate-300',
    text: '로그인 상태: 미로그인',
  });
  const loginButton = createButton('로그인', { variant: 'ghost' });

  loginButton.addEventListener('click', async (event) => {
    event.preventDefault();
    loginStatus.textContent = '로그인 상태: 진행 중...';
    try {
      await authService.loginWithGoogle();
      loginStatus.textContent = '로그인 상태: 완료';
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn: true } }));
    } catch (error) {
      loginStatus.textContent = '로그인 상태: 실패';
      console.warn(error);
    }
  });

  controls.append(loginStatus, loginButton);
  header.append(brand, controls);
  return header;
}
