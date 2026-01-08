/**
 * DeviceFormModal Feature Component
 *
 * 디바이스 추가/수정 모달
 */

import { Device, DeviceCreateInput, DeviceUpdateInput } from '@entities/device';

interface DeviceFormModalCallbacks {
  onCreate: (input: DeviceCreateInput) => Promise<void>;
  onUpdate: (deviceId: string, input: DeviceUpdateInput) => Promise<void>;
  onClose: () => void;
}

export function createDeviceFormModal(
  callbacks: DeviceFormModalCallbacks,
  existingDevice?: Device
): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';

  const isEdit = !!existingDevice;
  const title = isEdit ? 'Edit Device' : 'Add New Device';
  const submitText = isEdit ? 'Update' : 'Create';

  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">${title}</h2>
        <button
          data-action="close"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form id="device-form" class="space-y-4">
        <div>
          <label for="device-name" class="block text-sm font-medium text-gray-700 mb-2">
            Device Name *
          </label>
          <input
            type="text"
            id="device-name"
            name="name"
            required
            value="${existingDevice?.name || ''}"
            placeholder="e.g., Temperature Sensor 1"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label for="device-type" class="block text-sm font-medium text-gray-700 mb-2">
            Device Type *
          </label>
          <select
            id="device-type"
            name="type"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Select type...</option>
            <option value="sensor" ${existingDevice?.type === 'sensor' ? 'selected' : ''}>Sensor</option>
            <option value="actuator" ${existingDevice?.type === 'actuator' ? 'selected' : ''}>Actuator</option>
            <option value="gateway" ${existingDevice?.type === 'gateway' ? 'selected' : ''}>Gateway</option>
            <option value="controller" ${existingDevice?.type === 'controller' ? 'selected' : ''}>Controller</option>
          </select>
        </div>

        <div>
          <label for="device-status" class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="device-status"
            name="status"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="offline" ${!existingDevice || existingDevice.status === 'offline' ? 'selected' : ''}>Offline</option>
            <option value="online" ${existingDevice?.status === 'online' ? 'selected' : ''}>Online</option>
          </select>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            data-action="close"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="submit-button"
            class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ${submitText}
          </button>
        </div>
      </form>
    </div>
  `;

  // Event handlers
  const form = modal.querySelector('#device-form') as HTMLFormElement;
  const submitButton = modal.querySelector('#submit-button') as HTMLButtonElement;
  const closeButtons = modal.querySelectorAll('[data-action="close"]');

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      callbacks.onClose();
    });
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      callbacks.onClose();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const status = formData.get('status') as 'online' | 'offline';

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    try {
      if (isEdit && existingDevice) {
        const input: DeviceUpdateInput = { name, type, status };
        await callbacks.onUpdate(existingDevice.id, input);
      } else {
        const input: DeviceCreateInput = { name, type, status };
        await callbacks.onCreate(input);
      }
      callbacks.onClose();
    } catch (error) {
      console.error('[DeviceFormModal] Submit error:', error);
      alert('Failed to save device');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = submitText;
    }
  });

  return modal;
}
