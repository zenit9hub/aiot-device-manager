import type { MqttClient as RawMqttClient } from 'mqtt';

import type { MqttClient as RawMqttClient } from 'mqtt';

export type MqttMessage = {
  topic: string;
  payload: string;
  receivedAt: string;
};

export type MqttConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'simulation' | 'error';

export interface MqttConnectionState {
  status: MqttConnectionStatus;
  lastError?: string;
}

const brokerUrl = (import.meta.env.VITE_MQTT_BROKER_URL ?? '').trim();
const defaultTopic = import.meta.env.VITE_MQTT_TOPIC ?? 'aiot/devices/#';
let mqttClient: RawMqttClient | null = null;

function createSimulationMessage() {
  const temperature = (20 + Math.random() * 12).toFixed(1);
  const humidity = (40 + Math.random() * 15).toFixed(1);
  const battery = (60 + Math.random() * 20).toFixed(0);
  return {
    topic: 'simulation/sensor',
    payload: JSON.stringify({ temperature, humidity, battery }),
    receivedAt: new Date().toISOString(),
  };
}

export async function startMqttMonitoring(
  onMessage: (message: MqttMessage) => void,
  onStatus?: (state: MqttConnectionState) => void,
): Promise<() => void> {
  if (!brokerUrl) {
    onStatus?.({ status: 'simulation' });
    onMessage(createSimulationMessage());
    const timer = setInterval(() => onMessage(createSimulationMessage()), 3500);
    return () => clearInterval(timer);
  }

  onStatus?.({ status: 'connecting' });
  const mqttModule = await import('mqtt');
  const connectFn = (
    mqttModule.connect ||
    (mqttModule.default as unknown as { connect?: typeof mqttModule.connect }).connect ||
    (mqttModule.default as unknown as typeof mqttModule.connect)
  ) as (url: string, opts?: unknown) => RawMqttClient;

  if (typeof connectFn !== 'function') {
    onStatus?.({ status: 'error', lastError: 'mqtt 연결 함수가 없습니다.' });
    return () => undefined;
  }

  mqttClient = connectFn(brokerUrl, {
    clientId: `aiot-refactor-${Date.now()}`,
    reconnectPeriod: 3000,
  });

  mqttClient.on('connect', () => onStatus?.({ status: 'connected' }));
  mqttClient.on('reconnect', () => onStatus?.({ status: 'connecting' }));
  mqttClient.on('offline', () => onStatus?.({ status: 'disconnected' }));
  mqttClient.on('error', (error: Error) => onStatus?.({ status: 'error', lastError: error.message }));

  mqttClient.subscribe(defaultTopic, (err) => {
    if (err) {
      onStatus?.({ status: 'error', lastError: err.message });
    } else {
      onStatus?.({ status: 'connected' });
    }
  });

  mqttClient.on('message', (topic, payload) => {
    onMessage({
      topic,
      payload: payload.toString(),
      receivedAt: new Date().toISOString(),
    });
  });

  return () => {
    mqttClient?.end(true);
    mqttClient = null;
  };
}
