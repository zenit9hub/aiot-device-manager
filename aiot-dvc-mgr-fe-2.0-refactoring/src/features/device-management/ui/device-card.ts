import type { Device } from '../../../entities/device/device';
import { createElement } from '../../../shared/lib/dom';

const statusBadge = {
  online: 'bg-emerald-500/30 border border-emerald-400/60 text-emerald-200',
  offline: 'bg-red-500/30 border border-red-400/60 text-red-200',
  warning: 'bg-amber-500/30 border border-amber-400/60 text-amber-100',
};

export function createDeviceCard(device: Device) {
  const card = createElement('div', {
    className:
      'panel p-4 border border-slate-700/60 shadow-lg shadow-black/50 rounded-2xl flex flex-col gap-2 bg-slate-900/70',
  });

  const title = createElement('h3', { className: 'text-lg font-semibold text-white', text: device.name });
  const meta = createElement('p', {
    className: 'text-sm text-slate-400',
    text: `마지막 연결: ${device.lastSeen} · 위치: ${device.location}`,
  });

  const status = createElement('span', {
    className: `px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${statusBadge[device.status]}`,
    text: device.status.toUpperCase(),
  });

  card.append(title, meta, status);
  return card;
}
