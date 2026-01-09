import type { Device } from '../../../entities/device/device';
import { createElement } from '../../../shared/lib/dom';

const statusBadge = {
  online: 'bg-emerald-500/30 border border-emerald-400/60 text-emerald-200',
  offline: 'bg-red-500/30 border border-red-400/60 text-red-200',
  warning: 'bg-amber-500/30 border border-amber-400/60 text-amber-100',
};

export function createDeviceCard(
  device: Device,
  options: { onRemove?: (device: Device) => void; onSelect?: (device: Device) => void; selected?: boolean } = {},
) {
  const card = createElement('div', {
    className:
      'panel p-4 border border-slate-700/60 shadow-lg shadow-black/50 rounded-2xl flex flex-col gap-2 bg-slate-900/70 relative transition hover:-translate-y-1 hover:border-sky-400/70 hover:shadow-sky-900/60 cursor-pointer',
  });

  if (options.selected) {
    card.classList.add('border-sky-400/80', 'shadow-sky-900/70', 'ring-2', 'ring-sky-400/40');
  }

  const title = createElement('h3', { className: 'text-lg font-semibold text-white', text: device.name });
  const meta = createElement('p', {
    className: 'text-sm text-slate-400',
    text: `마지막 연결: ${device.lastSeen} · 위치: ${device.location}`,
  });
  const topic = createElement('p', {
    className: 'text-xs text-slate-400',
    text: `토픽: ${device.topicPath}`,
  });

  const status = createElement('span', {
    className: `px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${statusBadge[device.status]}`,
    text: device.status.toUpperCase(),
  });

  if (options.onRemove) {
    const removeButton = createElement('button', {
      className:
        'absolute top-3 right-3 h-8 w-8 rounded-full border border-white/10 text-slate-300 hover:text-white hover:border-slate-300 bg-slate-900/80 flex items-center justify-center',
      text: '×',
      attrs: { type: 'button', 'aria-label': '디바이스 제거' },
    });
    removeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      options.onRemove?.(device);
    });
    card.append(removeButton);
  }

  if (options.onSelect) {
    card.addEventListener('click', () => {
      options.onSelect?.(device);
    });
  }

  card.append(title, meta, topic, status);
  return card;
}
