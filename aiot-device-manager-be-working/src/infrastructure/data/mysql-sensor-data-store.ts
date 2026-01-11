import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { SensorDataStore, SensorReadingInput } from '../../domain/ports/sensor-data-store';
import { pool } from '../db/pool';
import { logger } from '../../shared/logger';

type DbConnection = Awaited<ReturnType<typeof pool.getConnection>>;

export class MySqlSensorDataStore implements SensorDataStore {
  async storeReading(input: SensorReadingInput): Promise<void> {
    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
      await connection.beginTransaction();
      transactionStarted = true;

      const userId = await upsertUser(connection, input.user);
      const deviceId = await upsertDevice(connection, {
        userId,
        deviceId: input.device.deviceId,
        deviceName: input.device.deviceName
      });

      await connection.execute<ResultSetHeader>(
        `
          INSERT INTO sensor_readings (device_id, recorded_at, payload)
          VALUES (?, ?, ?)
        `,
        [deviceId, input.reading.recordedAt, JSON.stringify(input.reading.payload)]
      );

      await connection.commit();
      logger.debug({ userId, deviceId }, 'Stored sensor reading');
    } catch (error) {
      if (transactionStarted) {
        await connection.rollback();
      }
      logger.error({ err: error }, 'Failed to store sensor reading');
      throw error;
    } finally {
      connection.release();
    }
  }
}

async function upsertUser(connection: DbConnection, user: SensorReadingInput['user']) {
  const [rows] = await connection.execute<RowDataPacket[]>(
    'SELECT id FROM users WHERE firebase_uid = ? LIMIT 1',
    [user.uid]
  );

  if (rows.length) {
    const userId = rows[0].id as number;
    await connection.execute(
      `
        UPDATE users SET email = ?, display_name = ?
        WHERE id = ?
      `,
      [user.email ?? null, user.displayName ?? null, userId]
    );
    return userId;
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO users (firebase_uid, email, display_name)
      VALUES (?, ?, ?)
    `,
    [user.uid, user.email ?? null, user.displayName ?? null]
  );

  return result.insertId;
}

async function upsertDevice(
  connection: DbConnection,
  input: { userId: number; deviceId: string; deviceName?: string }
) {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT id FROM devices
      WHERE user_id = ? AND device_id = ?
      LIMIT 1
    `,
    [input.userId, input.deviceId]
  );

  if (rows.length) {
    const devicePk = rows[0].id as number;
    await connection.execute(
      `
        UPDATE devices
        SET device_name = COALESCE(?, device_name), last_seen_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [input.deviceName ?? null, devicePk]
    );
    return devicePk;
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO devices (user_id, device_id, device_name)
      VALUES (?, ?, ?)
    `,
    [input.userId, input.deviceId, input.deviceName ?? null]
  );

  return result.insertId;
}
