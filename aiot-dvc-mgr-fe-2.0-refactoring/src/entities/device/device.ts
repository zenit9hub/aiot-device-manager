export type DeviceStatus = 'online' | 'offline' | 'warning';

export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  lastSeen: string;
  location: string;
}
