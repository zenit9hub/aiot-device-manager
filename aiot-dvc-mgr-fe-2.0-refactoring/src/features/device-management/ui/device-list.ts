import { createElement } from '../../../shared/lib/dom';
import { createButton } from '../../../shared/ui/button';
import { createDeviceCard } from './device-card';
import type { Device } from '../../../entities/device/device';
import { deviceService } from '../model/device-service';
import { authService } from '../../auth/model/auth-service';
import { startMqttTopicStream } from '../../mqtt-monitoring/model/mqtt-service';
import { backendService } from '../../backend/model/backend-service';

export function createDeviceList() {
  const section = createElement('section', {
    className: 'panel p-6 mb-6 space-y-4 border border-slate-700/60',
  });

  const title = createElement('h2', { className: 'text-2xl font-bold text-white', text: '디바이스 모니터링' });
  const description = createElement('p', {
    className: 'text-slate-300',
    text: '이 문서가 안내하는 Firestore 구독/업데이트 흐름과 동일하게 작동하는 카드로 실시간 상태를 확인합니다.',
  });

  const statusNote = createElement('p', { className: 'text-xs text-slate-400', text: '실시간 구독 대기 중...' });
  const gallery = createElement('div', { className: 'grid gap-3 md:grid-cols-2' });

  const detailPanel = createElement('div', {
    className: 'mt-4 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-3',
  });
  const detailTitle = createElement('h3', { className: 'text-lg font-semibold text-white', text: '선택 디바이스 실시간 그래프' });
  const detailMeta = createElement('p', {
    className: 'text-sm text-slate-300',
    text: '디바이스를 선택하면 현재 상태 기반의 실시간 그래프를 표시합니다.',
  });
  const detailValue = createElement('p', {
    className: 'text-sm text-slate-200 hidden',
    text: '',
  });
  const detailHint = createElement('p', {
    className: 'text-xs text-slate-500',
    text: '샘플은 2초 간격으로 갱신됩니다.',
  });

  const chartLayout = createElement('div', { className: 'flex items-stretch gap-3' });
  const chartAxis = createElement('div', {
    className: 'flex w-16 flex-col justify-between text-xs text-slate-400',
  });
  const chartMaxLabel = createElement('span', { text: '최고: --' });
  const chartMinLabel = createElement('span', { text: '최저: --' });
  chartAxis.append(chartMaxLabel, chartMinLabel);
  chartAxis.style.height = '8rem';
  const chartWrapper = createElement('div', {
    className: 'relative h-32 flex-1 rounded-xl border border-white/10 bg-slate-950/40',
  });
  const chartSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chartSvg.setAttribute('viewBox', '0 0 100 40');
  chartSvg.setAttribute('preserveAspectRatio', 'none');
  chartSvg.classList.add('h-full', 'w-full');

  const chartLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  chartLine.setAttribute('fill', 'none');
  chartLine.setAttribute('stroke', '#38bdf8');
  chartLine.setAttribute('stroke-width', '2');
  chartLine.setAttribute('stroke-linecap', 'round');
  chartLine.setAttribute('stroke-linejoin', 'round');
  chartSvg.append(chartLine);
  chartWrapper.append(chartSvg);
  chartLayout.append(chartAxis, chartWrapper);
  detailPanel.append(detailTitle, detailMeta, detailValue, chartLayout, detailHint);
  section.append(title, description, statusNote, gallery, detailPanel);

  let unsubscribe: (() => void) | null = null;
  let currentUserId: string | null = authService.currentUser()?.uid ?? null;
  let selectedDevice: Device | null = null;
  let latestDevices: Device[] = [];
  let telemetryTimer: number | null = null;
  let telemetryValues: number[] = [];
  const maxPoints = 24;
  let mqttCleanup: (() => void) | null = null;
  let lastMessageAt: number | null = null;
  let offlineTimer: number | null = null;
  let streamToken = 0;
  let backendEnabled = false;

  window.addEventListener('backend-toggle', (event) => {
    const detail = (event as CustomEvent<{ enabled: boolean }>).detail;
    backendEnabled = Boolean(detail?.enabled);
  });

  function buildNextValue(device: Device) {
    const base =
      device.status === 'online' ? 82 :
        device.status === 'warning' ? 58 :
          28;
    const jitter = (Math.random() - 0.5) * 14;
    return Math.max(5, Math.min(100, base + jitter));
  }

  function updateScaleLabels(maxValue: number | null, minValue: number | null) {
    chartMaxLabel.textContent = `최고: ${maxValue === null ? '--' : maxValue.toFixed(1)}`;
    chartMinLabel.textContent = `최저: ${minValue === null ? '--' : minValue.toFixed(1)}`;
  }

  function renderChart(values: number[]) {
    if (!values.length) {
      chartLine.setAttribute('points', '');
      updateScaleLabels(null, null);
      return;
    }
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;
    const topMargin = 4;
    const drawingHeight = 40 - topMargin * 2;
    updateScaleLabels(maxValue, minValue);
    const points = values
      .map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * 100;
        const normalized =
          range === 0 ? 0.5 : (value - minValue) / range;
        const y = topMargin + (1 - normalized) * drawingHeight;
        return `${x},${y}`;
      })
      .join(' ');
    chartLine.setAttribute('points', points);
  }

  function stopTelemetry() {
    if (telemetryTimer !== null) {
      clearInterval(telemetryTimer);
      telemetryTimer = null;
    }
    telemetryValues = [];
    renderChart(telemetryValues);
  }

  function parseMetric(payload: string) {
    try {
      const data = JSON.parse(payload) as Record<string, unknown>;
      const candidate =
        data.temperature ??
        data.temp ??
        data.value ??
        data.humidity ??
        data.battery;
      if (typeof candidate === 'number') {
        return candidate;
      }
      if (typeof candidate === 'string') {
        const parsed = Number.parseFloat(candidate);
        return Number.isFinite(parsed) ? parsed : null;
      }
      const numeric = Object.values(data).find((value) => typeof value === 'number');
      return typeof numeric === 'number' ? numeric : null;
    } catch {
      const parsed = Number.parseFloat(payload);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }

  function pushValue(value: number, device: Device) {
    telemetryValues.push(value);
    if (telemetryValues.length > maxPoints) {
      telemetryValues.shift();
    }
    renderChart(telemetryValues);
    detailValue.textContent = `현재 지표: ${value.toFixed(1)} · 상태: ${device.status.toUpperCase()}`;
  }

  function stopDeviceStream() {
    mqttCleanup?.();
    mqttCleanup = null;
    if (offlineTimer !== null) {
      clearInterval(offlineTimer);
      offlineTimer = null;
    }
    lastMessageAt = null;
    stopTelemetry();
  }

  async function startDeviceStream(device: Device) {
    stopDeviceStream();
    const token = ++streamToken;
    telemetryValues = Array.from({ length: maxPoints }, () => buildNextValue(device));
    renderChart(telemetryValues);
    detailValue.textContent = `현재 지표: -- · 상태: ${device.status.toUpperCase()}`;
    lastMessageAt = Date.now();

    offlineTimer = window.setInterval(async () => {
      if (!selectedDevice) {
        return;
      }
      if (!lastMessageAt || Date.now() - lastMessageAt < 60_000) {
        return;
      }
      if (selectedDevice.status === 'offline') {
        return;
      }
      await deviceService.updateStatus(currentUserId, selectedDevice.id, 'offline');
      selectedDevice = { ...selectedDevice, status: 'offline' };
      detailValue.textContent = `현재 지표: -- · 상태: OFFLINE`;
    }, 5000);

    try {
      const cleanup = await startMqttTopicStream(
        device.topicPath,
        async (message) => {
          if (token !== streamToken) {
            return;
          }
          lastMessageAt = Date.now();
          const metric = parseMetric(message.payload);
          const value = metric ?? buildNextValue(device);
          if (selectedDevice?.status === 'offline') {
            await deviceService.updateStatus(currentUserId, device.id, 'online');
            selectedDevice = { ...device, status: 'online' };
          }
          pushValue(value, selectedDevice ?? device);
          if (backendEnabled) {
            const idToken = await authService.getIdToken();
            if (idToken) {
              const sensorPayload: Record<string, unknown> = { raw: message.payload };
              if (metric !== null) {
                sensorPayload.value = metric;
              }
              void backendService.sendSensorReading(idToken, {
                deviceId: device.id,
                deviceName: device.name,
                recordedAt: new Date().toISOString(),
                payload: sensorPayload,
              });
            }
          }
        },
      );
      if (token !== streamToken) {
        cleanup();
        return;
      }
      mqttCleanup = cleanup;
    } catch (error) {
      console.warn('[device-monitoring] mqtt 구독 실패', error);
    }
  }

  function updateDetailPanel(device: Device | null) {
    if (!device) {
      detailMeta.textContent = '디바이스를 선택하면 현재 상태 기반의 실시간 그래프를 표시합니다.';
      detailValue.textContent = '';
      detailValue.classList.add('hidden');
      stopDeviceStream();
      return;
    }
    detailMeta.textContent = `토픽: ${device.topicPath} · 위치: ${device.location}`;
    detailValue.classList.remove('hidden');
    detailValue.textContent = `현재 지표: -- · 상태: ${device.status.toUpperCase()}`;
    void startDeviceStream(device);
  }

  function setSelectedDevice(device: Device | null) {
    selectedDevice = device;
    updateDetailPanel(device);
    renderGallery();
  }

  function confirmDeviceRemoval() {
    return new Promise<boolean>((resolve) => {
      const overlay = createElement('div', {
        className:
          'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4',
      });
      const modal = createElement('div', {
        className: 'panel w-full max-w-sm p-5 space-y-4 border border-slate-700/60',
      });
      const message = createElement('p', {
        className: 'text-base text-slate-100',
        text: '디바이스를 제거하시겠습니까?',
      });
      const buttonRow = createElement('div', { className: 'flex justify-end gap-2' });
      const cancelButton = createButton('아니오', {
        variant: 'ghost',
        onClick: () => {
          cleanup(false);
        },
      });
      const confirmButton = createButton('예', {
        variant: 'ghost',
        onClick: () => {
          cleanup(true);
        },
      });
      cancelButton.classList.add('border-sky-400', 'text-sky-200', 'bg-slate-800/70', 'ring-2', 'ring-sky-400/40');

      function cleanup(result: boolean) {
        document.removeEventListener('keydown', handleKeydown);
        overlay.remove();
        resolve(result);
      }

      function handleKeydown(event: KeyboardEvent) {
        if (event.key !== 'Enter') {
          return;
        }
        const active = document.activeElement;
        if (active instanceof HTMLButtonElement && overlay.contains(active)) {
          active.click();
          return;
        }
        cancelButton.click();
      }

      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
          cleanup(false);
        }
      });

      buttonRow.append(cancelButton, confirmButton);
      modal.append(message, buttonRow);
      overlay.append(modal);
      document.body.appendChild(overlay);
      document.addEventListener('keydown', handleKeydown);
      cancelButton.focus();
    });
  }

  function subscribeForUser(userId: string | null) {
    const resolvedUserId = userId ?? 'demo-user';
    currentUserId = userId;
    statusNote.textContent = `실시간 구독: ${resolvedUserId} (Firebase 설정 시 실제 devices 컬렉션을 구독합니다)`;
    unsubscribe?.();
    unsubscribe = deviceService.subscribe(userId, (devices) => {
      latestDevices = devices;
      const matchingSelected = selectedDevice
        ? devices.find((device) => device.id === selectedDevice?.id) ?? null
        : null;
      if (!matchingSelected && selectedDevice) {
        setSelectedDevice(null);
        return;
      }
      if (matchingSelected && selectedDevice !== matchingSelected) {
        selectedDevice = matchingSelected;
        detailValue.textContent = `현재 지표: -- · 상태: ${matchingSelected.status.toUpperCase()}`;
        detailMeta.textContent = `토픽: ${matchingSelected.topicPath} · 위치: ${matchingSelected.location}`;
      }
      renderGallery();
    });
  }

  function renderGallery() {
    gallery.innerHTML = '';
    if (!latestDevices.length) {
      gallery.appendChild(
        createElement('p', {
          className: 'text-sm text-slate-400',
          text: '감지된 디바이스가 없습니다. Firestore devices 컬렉션을 확인해 주세요.',
        }),
      );
      return;
    }

    latestDevices.forEach((device) => {
      const card = createDeviceCard(device, {
        selected: device.id === selectedDevice?.id,
        onSelect: () => {
          setSelectedDevice(device);
        },
        onRemove: async () => {
          const confirmed = await confirmDeviceRemoval();
          if (!confirmed) {
            return;
          }
          await deviceService.remove(currentUserId, device.id);
        },
      });
      gallery.appendChild(card);
    });
  }

  subscribeForUser(authService.currentUser()?.uid ?? null);

  window.addEventListener('auth-changed', () => {
    subscribeForUser(authService.currentUser()?.uid ?? null);
  });

  return section;
}
