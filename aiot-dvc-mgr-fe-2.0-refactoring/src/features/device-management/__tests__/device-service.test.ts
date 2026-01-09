import { describe, it, expect, vi } from 'vitest';
vi.mock('../../../app/providers/firebase-provider', () => ({
  getFirebaseStore: () => null,
}));
import { deviceService } from '../model/device-service';

describe('deviceService', () => {
  it('provides fallback devices when Firestore is absent', async () => {
    await new Promise<void>((resolve) => {
      const unsubscribe = deviceService.subscribe(null, (devices) => {
        expect(devices.length).toBeGreaterThan(0);
        unsubscribe?.();
        resolve();
      });
    });
  });

  it('creates a mock device and updates its status', async () => {
    const userId = 'demo-user';
    const device = await deviceService.create(userId, {
      name: 'Test Sensor',
      location: '테스트랩',
      status: 'online',
      topicPath: 'aiot/devices/test-sensor/status',
      lastSeen: '방금',
    });

    expect(device.name).toBe('Test Sensor');

    const updated = await deviceService.updateStatus(userId, device.id, 'warning');
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('warning');
  });
});
