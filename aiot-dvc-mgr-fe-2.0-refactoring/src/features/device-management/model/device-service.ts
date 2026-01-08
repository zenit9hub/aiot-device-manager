import type { Device } from '../../../entities/device/device';
import {
  createDevice,
  deleteDevice,
  subscribeToDevices,
  updateDeviceStatus,
} from '../api/device-repository';

export const deviceService = {
  subscribe(userId: string | null, listener: (devices: Device[]) => void) {
    return subscribeToDevices(userId, listener);
  },

  async create(userId: string, payload: Omit<Device, 'id'>) {
    return createDevice(userId, payload);
  },

  async updateStatus(userId: string, deviceId: string, status: Device['status']) {
    return updateDeviceStatus(userId, deviceId, status);
  },

  async remove(userId: string, deviceId: string) {
    return deleteDevice(userId, deviceId);
  },
};
