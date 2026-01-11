import type { SensorDataStore, SensorReadingInput } from '../../domain/ports/sensor-data-store';

export async function recordSensorReading(store: SensorDataStore, input: SensorReadingInput) {
  await store.storeReading(input);
}
