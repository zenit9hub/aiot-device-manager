import { createElement } from '../../../shared/lib/dom';
import { createButton } from '../../../shared/ui/button';
import { authService } from '../../auth/model/auth-service';
import { Device } from '../../../entities/device/device';
import { deviceService } from '../model/device-service';

const statusOptions: Device['status'][] = ['online', 'warning', 'offline'];

function renderStatusOptions(select: HTMLSelectElement) {
  statusOptions.forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status.toUpperCase();
    select.appendChild(option);
  });
}

function createActionGroup(elements: HTMLElement[]) {
  const wrapper = createElement('div', { className: 'space-y-2' });
  elements.forEach((element) => wrapper.appendChild(element));
  return wrapper;
}

export function createDeviceActions() {
  const section = createElement('section', {
    className: 'panel p-6 mb-6 space-y-4 border border-slate-700/60',
  });

  const heading = createElement('h2', { className: 'text-2xl font-bold text-white', text: '디바이스 CRUD 워크플로우' });
  const formGrid = createElement('div', { className: 'grid gap-4 md:grid-cols-2' });

  const nameInput = createElement('input', {
    className: 'w-full px-4 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-white',
    attrs: { type: 'text', placeholder: '디바이스 이름 (예: Smart Meter #12)' },
  }) as HTMLInputElement;

  const locationInput = createElement('input', {
    className: 'w-full px-4 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-white',
    attrs: { type: 'text', placeholder: '위치 (예: 서울 마포)' },
  }) as HTMLInputElement;

  const statusSelect = createElement('select', {
    className: 'w-full px-4 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-white',
  }) as HTMLSelectElement;
  renderStatusOptions(statusSelect);

  const createMessage = createElement('p', {
    className: 'text-sm text-slate-400',
    text: 'Firestore devices 컬렉션에 새 항목을 생성합니다.',
  });

  const createButtonElement = createButton('디바이스 등록', {
    onClick: async (event) => {
      event.preventDefault();
      const userId = authService.currentUser()?.uid ?? 'demo-user';
      const name = nameInput.value.trim();
      const location = locationInput.value.trim();
      if (!name || !location) {
        createMessage.textContent = '이름과 위치를 입력해야 합니다.';
        return;
      }
      createMessage.textContent = '디바이스 등록 중...';
      await deviceService.create(userId, {
        name,
        location,
        status: statusSelect.value as Device['status'],
        lastSeen: '방금',
      });
      createMessage.textContent = '새 디바이스를 등록했습니다.';
      nameInput.value = '';
      locationInput.value = '';
    },
  });

  const updateIdInput = createElement('input', {
    className: 'w-full px-4 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-white',
    attrs: { type: 'text', placeholder: '기존 디바이스 ID (device-1 등)' },
  }) as HTMLInputElement;

  const updateStatusSelect = createElement('select', {
    className: 'w-full px-4 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-white',
  }) as HTMLSelectElement;
  renderStatusOptions(updateStatusSelect);

  const updateMessage = createElement('p', {
    className: 'text-sm text-slate-400',
    text: '상태를 변경하면 Firestore가 실시간으로 반영합니다.',
  });

  const updateButtonElement = createButton('상태 변경', {
    variant: 'ghost',
    onClick: async (event) => {
      event.preventDefault();
      const userId = authService.currentUser()?.uid ?? 'demo-user';
      const deviceId = updateIdInput.value.trim();
      if (!deviceId) {
        updateMessage.textContent = '업데이트할 디바이스 ID를 입력하세요.';
        return;
      }
      updateMessage.textContent = '상태 업데이트 중...';
      await deviceService.updateStatus(userId, deviceId, updateStatusSelect.value as Device['status']);
      updateMessage.textContent = '상태를 바꿨습니다.';
    },
  });

  formGrid.append(
    createActionGroup([nameInput, locationInput, statusSelect, createButtonElement, createMessage]),
  );
  formGrid.append(createActionGroup([updateIdInput, updateStatusSelect, updateButtonElement, updateMessage]));

  section.append(heading, formGrid);
  return section;
}
