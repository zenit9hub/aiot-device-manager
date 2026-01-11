import { backendConfig } from '../../../shared/config/backend-config';

type SensorReadingPayload = {
  deviceId: string;
  deviceName?: string;
  recordedAt: string;
  payload: Record<string, unknown>;
};

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${backendConfig.baseUrl}${path}`, options);
  const contentType = response.headers.get('content-type') ?? '';
  const bodyText = await response.text();
  if (!response.ok) {
    const message = bodyText ? ` ${bodyText}` : '';
    throw new Error(`Backend request failed: ${response.status}.${message}`);
  }
  if (!contentType.includes('application/json')) {
    throw new Error(`Backend response was not JSON (content-type: ${contentType || 'unknown'})`);
  }
  return JSON.parse(bodyText) as T;
}

export const backendService = {
  async checkHealth(token: string) {
    const data = await request<{ status?: string }>(
      '/health/auth',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data.status === 'ok';
  },

  async sendSensorReading(token: string, payload: SensorReadingPayload) {
    console.info('[backend] sendSensorReading', {
      url: `${backendConfig.baseUrl}/api/sensors/data`,
      deviceId: payload.deviceId,
      recordedAt: payload.recordedAt,
    });
    await request<{ message?: string }>(
      '/api/sensors/data',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
  },
};
