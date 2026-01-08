/**
 * Device Service
 *
 * Firestore를 사용한 디바이스 CRUD 및 실시간 구독
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { getFirebaseDb } from '@shared/api/firebase/firebase-init';
import {
  Device,
  DeviceCreateInput,
  DeviceUpdateInput,
  DeviceResult,
  DeviceListResult,
} from './types';

export class DeviceService {
  private db = getFirebaseDb();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * 사용자의 devices 컬렉션 참조
   */
  private get devicesCollection() {
    return collection(this.db, 'users', this.userId, 'devices');
  }

  /**
   * Firestore Document를 Device 엔티티로 변환
   */
  private documentToDevice(id: string, data: DocumentData): Device {
    return {
      id,
      name: data.name,
      type: data.type,
      status: data.status || 'offline',
      lastSeen: data.lastSeen?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  /**
   * 새 디바이스 생성
   */
  async create(input: DeviceCreateInput): Promise<DeviceResult> {
    try {
      // 입력 검증
      if (!input.name || input.name.trim().length === 0) {
        return {
          success: false,
          error: 'Device name is required',
        };
      }

      if (!input.type || input.type.trim().length === 0) {
        return {
          success: false,
          error: 'Device type is required',
        };
      }

      const now = Timestamp.now();
      const deviceData = {
        name: input.name.trim(),
        type: input.type.trim(),
        status: input.status || 'offline',
        lastSeen: now,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(this.devicesCollection, deviceData);

      const device = this.documentToDevice(docRef.id, deviceData);

      return {
        success: true,
        data: device,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create device',
      };
    }
  }

  /**
   * ID로 디바이스 조회
   */
  async getById(deviceId: string): Promise<DeviceResult> {
    try {
      const docRef = doc(this.devicesCollection, deviceId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Device not found',
        };
      }

      const device = this.documentToDevice(docSnap.id, docSnap.data());

      return {
        success: true,
        data: device,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get device',
      };
    }
  }

  /**
   * 모든 디바이스 목록 조회
   */
  async getAll(): Promise<DeviceListResult> {
    try {
      const q = query(this.devicesCollection);
      const querySnapshot = await getDocs(q);

      const devices: Device[] = [];
      querySnapshot.forEach((doc) => {
        devices.push(this.documentToDevice(doc.id, doc.data()));
      });

      return {
        success: true,
        data: devices,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get devices',
      };
    }
  }

  /**
   * 디바이스 정보 업데이트
   */
  async update(deviceId: string, input: DeviceUpdateInput): Promise<DeviceResult> {
    try {
      const docRef = doc(this.devicesCollection, deviceId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Device not found',
        };
      }

      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (input.name !== undefined) {
        updateData.name = input.name.trim();
      }
      if (input.type !== undefined) {
        updateData.type = input.type.trim();
      }
      if (input.status !== undefined) {
        updateData.status = input.status;
        if (input.status === 'online') {
          updateData.lastSeen = Timestamp.now();
        }
      }

      await updateDoc(docRef, updateData);

      // 업데이트된 데이터 조회
      const updatedDoc = await getDoc(docRef);
      const device = this.documentToDevice(updatedDoc.id, updatedDoc.data()!);

      return {
        success: true,
        data: device,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update device',
      };
    }
  }

  /**
   * 디바이스 삭제
   */
  async delete(deviceId: string): Promise<DeviceResult<void>> {
    try {
      const docRef = doc(this.devicesCollection, deviceId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Device not found',
        };
      }

      await deleteDoc(docRef);

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete device',
      };
    }
  }

  /**
   * 실시간 디바이스 목록 구독
   */
  subscribeToDevices(callback: (devices: Device[]) => void): () => void {
    const q = query(this.devicesCollection);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const devices: Device[] = [];
        querySnapshot.forEach((doc) => {
          devices.push(this.documentToDevice(doc.id, doc.data()));
        });
        callback(devices);
      },
      (error) => {
        console.error('[DeviceService] Subscription error:', error);
        callback([]);
      }
    );

    return unsubscribe;
  }
}
