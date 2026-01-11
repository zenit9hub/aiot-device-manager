import { Router } from 'express';
import type { SensorDataStore } from '../../../domain/ports/sensor-data-store';
import { buildSensorController } from '../controllers/sensor-controller';
import { sensorPayloadSchema } from '../validators/sensor-payload';

export function createSensorRoutes(store: SensorDataStore) {
  const sensorRouter = Router();
  const controller = buildSensorController(store);

  sensorRouter.post('/data', async (req, res) => {
    const parseResult = sensorPayloadSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        message: 'Invalid payload',
        issues: parseResult.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    return controller.record(req, res, parseResult.data);
  });

  return sensorRouter;
}
