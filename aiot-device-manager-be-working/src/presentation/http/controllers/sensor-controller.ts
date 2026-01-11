import type { Request, Response } from 'express';
import type { SensorDataStore } from '../../../domain/ports/sensor-data-store';
import { recordSensorReading } from '../../../application/use-cases/record-sensor-reading';
import { logger } from '../../../shared/logger';
import type { SensorPayload } from '../validators/sensor-payload';

export function buildSensorController(store: SensorDataStore) {
  return {
    async record(req: Request, res: Response, payload: SensorPayload) {
      if (!req.authUser) {
        return res.status(401).json({ message: 'Unauthenticated' });
      }

      try {
        await recordSensorReading(store, {
          user: req.authUser,
          device: {
            deviceId: payload.deviceId,
            deviceName: payload.deviceName
          },
          reading: {
            recordedAt: payload.recordedAt ?? new Date(),
            payload: payload.payload
          }
        });

        return res.status(201).json({ message: 'Sensor reading stored' });
      } catch (error) {
        logger.error({ err: error }, 'Error while storing sensor reading');
        return res.status(500).json({ message: 'Failed to store reading' });
      }
    }
  };
}
