import { z } from 'zod';

export const sensorPayloadSchema = z.object({
  deviceId: z.string().min(1),
  deviceName: z.string().min(1).optional(),
  recordedAt: z.coerce.date().optional(),
  payload: z.record(z.any(), { invalid_type_error: 'payload must be an object' })
});

export type SensorPayload = z.infer<typeof sensorPayloadSchema>;
