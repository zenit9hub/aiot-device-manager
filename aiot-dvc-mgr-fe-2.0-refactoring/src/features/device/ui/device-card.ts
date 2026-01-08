/**
 * DeviceCard Feature Component
 *
 * 개별 디바이스 카드
 */

import { Device } from '@entities/device';

interface DeviceCardCallbacks {
  onEdit: (device: Device) => void;
  onDelete: (deviceId: string) => void;
}

export function createDeviceCard(
  device: Device,
  callbacks: DeviceCardCallbacks
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200';

  const statusColor = device.status === 'online' ? 'bg-green-500' : 'bg-gray-400';
  const statusText = device.status === 'online' ? 'Online' : 'Offline';

  const lastSeenText = device.lastSeen
    ? new Date(device.lastSeen).toLocaleString()
    : 'Never';

  card.innerHTML = `
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="p-3 bg-blue-50 rounded-lg">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800">${device.name}</h3>
          <p class="text-sm text-gray-500">${device.type}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
          <span class="${statusColor} w-2 h-2 rounded-full"></span>
          ${statusText}
        </span>
      </div>
    </div>

    <div class="space-y-2 mb-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">Last Seen</span>
        <span class="text-gray-800 font-medium">${lastSeenText}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">Device ID</span>
        <span class="text-gray-600 font-mono text-xs">${device.id.slice(0, 8)}...</span>
      </div>
    </div>

    <div class="flex gap-2 pt-4 border-t border-gray-100">
      <button
        data-action="edit"
        class="flex-1 px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
      >
        Edit
      </button>
      <button
        data-action="delete"
        class="flex-1 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
      >
        Delete
      </button>
    </div>
  `;

  // Event handlers
  const editButton = card.querySelector('[data-action="edit"]') as HTMLButtonElement;
  const deleteButton = card.querySelector('[data-action="delete"]') as HTMLButtonElement;

  editButton.addEventListener('click', () => {
    callbacks.onEdit(device);
  });

  deleteButton.addEventListener('click', () => {
    if (confirm(`Delete "${device.name}"?`)) {
      callbacks.onDelete(device.id);
    }
  });

  return card;
}
