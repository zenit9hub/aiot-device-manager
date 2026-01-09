import { describe, it, expect } from 'vitest';
import { startMqttMonitoring } from '../model/mqtt-service';

describe('mqttService', () => {
  it('runs simulation stream without broker', async () => {
    const messages: string[] = [];
    const cleanup = await startMqttMonitoring((message) => {
      messages.push(message.topic);
    }, undefined, { forceSimulation: true });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(messages.length).toBeGreaterThan(0);
    cleanup();
  });
});
