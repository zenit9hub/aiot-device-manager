/**
 * Device 엔티티 타입 정의
 */

export type DeviceStatus = 'online' | 'offline';

export interface Device {
  id: string;
  name: string;
  type: string;
  status: DeviceStatus;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceCreateInput {
  name: string;
  type: string;
  status?: DeviceStatus;
}

export interface DeviceUpdateInput {
  name?: string;
  type?: string;
  status?: DeviceStatus;
}

export interface DeviceResult<T = Device> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DeviceListResult {
  success: boolean;
  data?: Device[];
  error?: string;
}
