import { authService } from '../../features/auth/model/auth-service';
import { createButton } from '../../shared/ui/button';
import { createElement } from '../../shared/lib/dom';

export function createHeader() {
  const header = createElement('header', {
    className: 'flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60',
  });

  const brand = createElement('div', { className: 'flex flex-col', text: '' });
  const brandTitle = createElement('span', { className: 'text-xl font-bold text-white', text: 'AIoT Device Manager' });
  const brandSubtitle = createElement('small', { className: 'text-slate-400', text: 'Real-time IoT insights + Phase 2 journey' });
  brand.append(brandTitle, brandSubtitle);

  const controls = createElement('div', { className: 'flex items-center gap-3' });
  const loginStatus = createElement('span', {
    className: 'text-sm text-slate-300',
    text: '로그인 상태: 미로그인',
  });
  const loginButton = createButton('로그인', { variant: 'ghost' });

  let userEmail = authService.currentUser()?.email ?? null;
  function refreshStatus() {
    if (userEmail) {
      loginStatus.textContent = `로그인: ${userEmail}`;
      loginButton.textContent = '로그아웃';
      loginButton.classList.add('bg-red-500/20', 'border-red-400', 'text-red-100');
    } else {
      loginStatus.textContent = '로그인 상태: 미로그인';
      loginButton.textContent = '로그인';
      loginButton.classList.remove('bg-red-500/20', 'border-red-400', 'text-red-100', 'border-transparent');
    }
  }

  loginButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (userEmail) {
      await authService.logout();
      userEmail = null;
      refreshStatus();
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn: false } }));
      return;
    }
    loginStatus.textContent = '로그인 상태: 진행 중...';
    try {
      const user = await authService.loginWithGoogle();
      userEmail = user.email;
      refreshStatus();
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn: !!userEmail } }));
    } catch (error) {
      loginStatus.textContent = '로그인 상태: 실패';
      console.warn(error);
    }
  });

  refreshStatus();
  controls.append(loginStatus, loginButton);
  header.append(brand, controls);
  return header;
}
