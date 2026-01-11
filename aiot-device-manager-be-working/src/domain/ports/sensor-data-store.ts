import type { AuthenticatedUser } from '../entities/user';
import type { DeviceIdentity } from '../entities/device';
import type { SensorReading } from '../entities/sensor-reading';

export type SensorReadingInput = {
  user: AuthenticatedUser;
  device: DeviceIdentity;
  reading: SensorReading;
};

export interface SensorDataStore {
  storeReading(input: SensorReadingInput): Promise<void>;
}
