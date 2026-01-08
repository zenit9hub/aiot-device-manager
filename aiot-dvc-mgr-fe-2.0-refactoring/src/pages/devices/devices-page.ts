/**
 * Devices Page
 *
 * 디바이스 관리 페이지 (로그인 후)
 */

import { Device, DeviceService } from '@entities/device';
import { authService } from '@features/auth/model/auth-service';
import { createDeviceCard } from '@features/device/ui/device-card';
import { createDeviceFormModal } from '@features/device/ui/device-form-modal';

export function renderDevicesPage(userId: string, onLogout: () => void): HTMLElement {
  const page = document.createElement('div');
  page.className = 'min-h-screen bg-gray-50';

  const deviceService = new DeviceService(userId);
  let unsubscribe: (() => void) | null = null;
  let currentModal: HTMLElement | null = null;

  const render = (devices: Device[]) => {
    const currentUser = authService.getCurrentUser();
    const userEmail = currentUser?.email || 'User';

    page.innerHTML = `
      <div class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
              </svg>
              <h1 class="text-xl font-bold text-gray-800">AIoT Device Manager</h1>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">${userEmail}</span>
              <button
                id="logout-button"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Your Devices</h2>
            <p class="text-gray-600 mt-1">${devices.length} device${devices.length !== 1 ? 's' : ''} registered</p>
          </div>
          <button
            id="add-device-button"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Device
          </button>
        </div>

        ${devices.length === 0 ? `
          <div class="text-center py-16 bg-white rounded-lg shadow">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-800 mb-2">No devices yet</h3>
            <p class="text-gray-600 mb-6">Get started by adding your first device</p>
            <button
              id="add-first-device-button"
              class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Your First Device
            </button>
          </div>
        ` : `
          <div id="devices-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${devices.map(device => '<div data-device-id="' + device.id + '"></div>').join('')}
          </div>
        `}
      </div>

      <div id="modal-container"></div>
    `;

    // Render device cards
    if (devices.length > 0) {
      devices.forEach((device) => {
        const placeholder = page.querySelector(`[data-device-id="${device.id}"]`);
        if (placeholder) {
          const card = createDeviceCard(device, {
            onEdit: (device) => showModal(device),
            onDelete: async (deviceId) => {
              await deviceService.delete(deviceId);
            },
          });
          placeholder.replaceWith(card);
        }
      });
    }

    // Event handlers
    const logoutButton = page.querySelector('#logout-button');
    logoutButton?.addEventListener('click', async () => {
      await authService.signOut();
      if (unsubscribe) {
        unsubscribe();
      }
      onLogout();
    });

    const addDeviceButton = page.querySelector('#add-device-button');
    addDeviceButton?.addEventListener('click', () => showModal());

    const addFirstDeviceButton = page.querySelector('#add-first-device-button');
    addFirstDeviceButton?.addEventListener('click', () => showModal());
  };

  const showModal = (device?: Device) => {
    const modalContainer = page.querySelector('#modal-container') as HTMLElement;

    currentModal = createDeviceFormModal(
      {
        onCreate: async (input) => {
          await deviceService.create(input);
        },
        onUpdate: async (deviceId, input) => {
          await deviceService.update(deviceId, input);
        },
        onClose: () => {
          if (currentModal) {
            currentModal.remove();
            currentModal = null;
          }
        },
      },
      device
    );

    modalContainer.appendChild(currentModal);
  };

  // Subscribe to realtime updates
  unsubscribe = deviceService.subscribeToDevices((devices) => {
    console.log('[DevicesPage] Realtime update:', devices.length, 'devices');
    render(devices);
  });

  // Initial empty render
  render([]);

  return page;
}
