/**
 * Device Service 테스트
 *
 * TDD: 테스트 먼저 작성
 * Firebase Emulator 환경에서 실행
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DeviceService } from './device-service';
import { Device, DeviceCreateInput, DeviceUpdateInput } from './types';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';

describe('DeviceService', () => {
  let deviceService: DeviceService;
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    deviceService = new DeviceService(testUserId);

    // Emulator 환경: 기존 테스트 데이터 정리
    const db = getFirestore();
    const devicesRef = collection(db, 'users', testUserId, 'devices');
    const snapshot = await getDocs(devicesRef);
    await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
  });

  afterEach(async () => {
    // 테스트 후 정리
    const db = getFirestore();
    const devicesRef = collection(db, 'users', testUserId, 'devices');
    const snapshot = await getDocs(devicesRef);
    await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
  });

  describe('Device 생성', () => {
    it('새 디바이스를 생성할 수 있어야 한다', async () => {
      const input: DeviceCreateInput = {
        name: 'Temperature Sensor',
        type: 'sensor',
        status: 'online',
      };

      const result = await deviceService.create(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe(input.name);
      expect(result.data?.type).toBe(input.type);
      expect(result.data?.status).toBe(input.status);
      expect(result.data?.id).toBeDefined();
    });

    it('필수 필드 없이는 생성할 수 없어야 한다', async () => {
      const input = {
        name: '',
        type: 'sensor',
      } as DeviceCreateInput;

      const result = await deviceService.create(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Device 조회', () => {
    let createdDevice: Device;

    beforeEach(async () => {
      const input: DeviceCreateInput = {
        name: 'Test Device',
        type: 'sensor',
      };
      const result = await deviceService.create(input);
      createdDevice = result.data!;
    });

    it('ID로 디바이스를 조회할 수 있어야 한다', async () => {
      const result = await deviceService.getById(createdDevice.id);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(createdDevice.id);
      expect(result.data?.name).toBe(createdDevice.name);
    });

    it('존재하지 않는 ID로 조회하면 실패해야 한다', async () => {
      const result = await deviceService.getById('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('모든 디바이스 목록을 조회할 수 있어야 한다', async () => {
      // 추가 디바이스 생성
      await deviceService.create({
        name: 'Device 2',
        type: 'actuator',
      });

      const result = await deviceService.getAll();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Device 업데이트', () => {
    let createdDevice: Device;

    beforeEach(async () => {
      const input: DeviceCreateInput = {
        name: 'Original Name',
        type: 'sensor',
        status: 'offline',
      };
      const result = await deviceService.create(input);
      createdDevice = result.data!;
    });

    it('디바이스 정보를 업데이트할 수 있어야 한다', async () => {
      const update: DeviceUpdateInput = {
        name: 'Updated Name',
        status: 'online',
      };

      const result = await deviceService.update(createdDevice.id, update);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Name');
      expect(result.data?.status).toBe('online');
      expect(result.data?.type).toBe('sensor'); // 변경되지 않은 필드 유지
    });

    it('존재하지 않는 디바이스는 업데이트할 수 없어야 한다', async () => {
      const result = await deviceService.update('non-existent-id', { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Device 삭제', () => {
    let createdDevice: Device;

    beforeEach(async () => {
      const input: DeviceCreateInput = {
        name: 'Device to Delete',
        type: 'sensor',
      };
      const result = await deviceService.create(input);
      createdDevice = result.data!;
    });

    it('디바이스를 삭제할 수 있어야 한다', async () => {
      const deleteResult = await deviceService.delete(createdDevice.id);
      expect(deleteResult.success).toBe(true);

      // 삭제 확인
      const getResult = await deviceService.getById(createdDevice.id);
      expect(getResult.success).toBe(false);
    });

    it('존재하지 않는 디바이스는 삭제할 수 없어야 한다', async () => {
      const result = await deviceService.delete('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('실시간 구독', () => {
    it('디바이스 목록 변경을 실시간으로 감지할 수 있어야 한다', async () => {
      const callback = vi.fn();

      // 구독 시작
      const unsubscribe = deviceService.subscribeToDevices(callback);

      // 초기 콜백 (빈 목록)
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callback).toHaveBeenCalled();

      // 디바이스 추가
      await deviceService.create({
        name: 'Realtime Device',
        type: 'sensor',
      });

      // 변경 감지 대기
      await new Promise(resolve => setTimeout(resolve, 100));

      // 콜백이 다시 호출되었는지 확인
      expect(callback).toHaveBeenCalledTimes(2);
      const lastCall = callback.mock.calls[callback.mock.calls.length - 1][0];
      expect(lastCall.length).toBe(1);
      expect(lastCall[0].name).toBe('Realtime Device');

      unsubscribe();
    });

    it('구독을 취소하면 더 이상 업데이트를 받지 않아야 한다', async () => {
      const callback = vi.fn();

      const unsubscribe = deviceService.subscribeToDevices(callback);

      await new Promise(resolve => setTimeout(resolve, 100));
      const callCountAfterSubscribe = callback.mock.calls.length;

      // 구독 취소
      unsubscribe();

      // 디바이스 추가
      await deviceService.create({
        name: 'After Unsubscribe',
        type: 'sensor',
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // 콜백이 더 이상 호출되지 않았는지 확인
      expect(callback).toHaveBeenCalledTimes(callCountAfterSubscribe);
    });
  });
});
