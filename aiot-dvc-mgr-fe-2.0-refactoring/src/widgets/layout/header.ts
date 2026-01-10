import type { User } from 'firebase/auth';
import { authService } from '../../features/auth/model/auth-service';
import { createButton } from '../../shared/ui/button';
import { createElement } from '../../shared/lib/dom';
import { createLoginForm } from '../../features/auth/ui/login-form';

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

  let loginModal: HTMLElement | null = null;
  let authChangeListener: ((event: Event) => void) | null = null;

  function closeLoginModal() {
    if (!loginModal) {
      return;
    }
    loginModal.remove();
    loginModal = null;
    if (authChangeListener) {
      window.removeEventListener('auth-changed', authChangeListener);
      authChangeListener = null;
    }
  }

  function openLoginModal() {
    if (loginModal) {
      return;
    }
    const overlay = createElement('div', {
      className:
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm',
    });
    const dialog = createElement('div', {
      className:
        'w-full max-w-md space-y-4 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-2xl',
    });
    const loginForm = createLoginForm();
    const closeButton = createButton('창 닫기', {
      variant: 'ghost',
      onClick(event) {
        event.preventDefault();
        closeLoginModal();
      },
    });
    closeButton.classList.add('w-full');
    dialog.append(loginForm, closeButton);
    overlay.append(dialog);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeLoginModal();
      }
    });
    document.body.appendChild(overlay);
    loginModal = overlay;
    authChangeListener = () => {
      closeLoginModal();
    };
    window.addEventListener('auth-changed', authChangeListener);
  }

  let userEmail: string | null = null;
  function refreshStatus(user: User | null) {
    userEmail = user?.email ?? null;
    if (userEmail) {
      loginStatus.textContent = `${userEmail}`;
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
      loginStatus.textContent = '로그아웃 중...';
      await authService.logout();
      return;
    }
    loginStatus.textContent = '로그인 상태: 로그인 창 열기...';
    openLoginModal();
  });

  refreshStatus(authService.currentUser());
  authService.watchAuthState((user) => {
    refreshStatus(user);
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn: Boolean(user) } }));
  });
  controls.append(loginStatus, loginButton);
  header.append(brand, controls);
  return header;
}
