import { createElement } from '../../../shared/lib/dom';
import { createButton } from '../../../shared/ui/button';
import { startMqttMonitoring } from '../model/mqtt-service';
import type { MqttMessage, MqttConnectionState } from '../model/mqtt-service';

export function createMqttPanel() {
  const section = createElement('section', {
    className: 'panel p-6 mb-6 border border-slate-700/60',
  });

  const heading = createElement('h2', { className: 'text-2xl font-bold text-white', text: 'MQTT 모니터링' });
  const status = createElement('p', { className: 'text-sm text-slate-300', text: 'MQTT 상태: 준비' });
  const messageLog = createElement('div', { className: 'space-y-2 mt-3' });
  const errorNote = createElement('p', {
    className: 'text-xs text-rose-400 hidden',
    text: '',
  });
  const note = createElement('p', {
    className: 'text-xs text-slate-500',
    text: '환경변수 `VITE_MQTT_BROKER_URL`을 설정하면 실제 브로커와 연결됩니다. 기본적으로 시뮬레이션 데이터가 스트리밍됩니다.',
  });

  const controls = createElement('div', { className: 'flex items-center gap-3 mt-3' });
  const startButton = createButton('메시지 수신 시작', {
    onClick: async (event) => {
      event.preventDefault();
      await startStream();
    },
  });
  const stopButton = createButton('모니터링 중지', {
    variant: 'ghost',
    onClick: () => stopStream(),
  });
  controls.append(startButton, stopButton);

  section.append(heading, status, errorNote, controls, messageLog, note);

  let unsubscribe: (() => void) | null = null;

  const appendMessage = (message: MqttMessage) => {
    const row = createElement('div', {
      className: 'border border-white/10 rounded-xl p-3 bg-slate-900/60 space-y-1',
    });
    const meta = createElement('p', {
      className: 'text-xs text-slate-500',
      text: `${message.topic} · ${message.receivedAt}`,
    });
    const payload = createElement('p', {
      className: 'text-sm text-slate-100 font-mono whitespace-pre-wrap',
      text: message.payload,
    });
    row.append(meta, payload);
    messageLog.prepend(row);
    while (messageLog.childElementCount > 3) {
      messageLog.removeChild(messageLog.lastElementChild!);
    }
  };

  const updateStatus = (state: MqttConnectionState) => {
    status.textContent = `MQTT 상태: ${state.status}`;
    if (state.lastError) {
      errorNote.textContent = `오류: ${state.lastError}`;
      errorNote.classList.remove('hidden');
    } else {
      errorNote.classList.add('hidden');
    }
  };

  async function startStream() {
    if (unsubscribe) {
      status.textContent = 'MQTT 상태: 이미 실행 중';
      return;
    }
    status.textContent = 'MQTT 상태: 연결 시도 중...';
    try {
      const cleanup = await startMqttMonitoring(appendMessage, updateStatus);
      unsubscribe = cleanup;
    } catch (error) {
      status.textContent = 'MQTT 상태: 시작 실패';
      console.error(error);
    }
  }

  function stopStream() {
    unsubscribe?.();
    unsubscribe = null;
    status.textContent = 'MQTT 상태: 중지됨';
  }

  void startStream();
  return section;
}
