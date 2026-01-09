import { createElement } from '../../../shared/lib/dom';
import { createDeviceCard } from './device-card';
import { deviceService } from '../model/device-service';
import { authService } from '../../auth/model/auth-service';

export function createDeviceList() {
  const section = createElement('section', {
    className: 'panel p-6 mb-6 space-y-4 border border-slate-700/60',
  });

  const title = createElement('h2', { className: 'text-2xl font-bold text-white', text: '디바이스 모니터링' });
  const description = createElement('p', {
    className: 'text-slate-300',
    text: '이 문서가 안내하는 Firestore 구독/업데이트 흐름과 동일하게 작동하는 카드로 실시간 상태를 확인합니다.',
  });

  const statusNote = createElement('p', { className: 'text-xs text-slate-400', text: '실시간 구독 대기 중...' });
  const gallery = createElement('div', { className: 'grid gap-3 md:grid-cols-2' });

  section.append(title, description, statusNote, gallery);

  let unsubscribe: (() => void) | null = null;

  function subscribeForUser(userId: string | null) {
    const resolvedUserId = userId ?? 'demo-user';
    statusNote.textContent = `실시간 구독: ${resolvedUserId} (Firebase 설정 시 실제 devices 컬렉션을 구독합니다)`;
    unsubscribe?.();
    unsubscribe = deviceService.subscribe(resolvedUserId, (devices) => {
      gallery.innerHTML = '';
      if (!devices.length) {
        gallery.appendChild(
          createElement('p', {
            className: 'text-sm text-slate-400',
            text: '감지된 디바이스가 없습니다. Firestore devices 컬렉션을 확인해 주세요.',
          }),
        );
        return;
      }

      devices.forEach((device) => gallery.appendChild(createDeviceCard(device)));
    });
  }

  subscribeForUser(authService.currentUser()?.uid ?? null);

  window.addEventListener('auth-changed', () => {
    subscribeForUser(authService.currentUser()?.uid ?? null);
  });

  return section;
}
