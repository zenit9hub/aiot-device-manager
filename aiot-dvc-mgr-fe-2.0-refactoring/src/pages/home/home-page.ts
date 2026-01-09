import { createElement } from '../../shared/lib/dom';
import { createCard, applyCardHighlight } from '../../shared/ui/card';
import { createDeviceList } from '../../features/device-management/ui/device-list';
import { createDeviceActions } from '../../features/device-management/ui/device-actions';
import { createMqttPanel } from '../../features/mqtt-monitoring/ui/mqtt-panel';
import { authService } from '../../features/auth/model/auth-service';

/** Render the main dashboard for the AIoT Dev Mgr learning experience. */
export function createHomePage() {
  const container = createElement('section', { className: 'space-y-8' });

  const introPanel = createElement('section', {
    className: 'panel p-6 space-y-6 border border-slate-700/60 bg-gradient-to-br from-slate-900/80 to-slate-800/70 shadow-inner',
  });
  const heroTitle = createElement('h1', {
    className: 'text-3xl font-bold text-white',
    text: 'AIoT Device Manager 실습 페이지',
  });
  const heroSubtitle = createElement('p', {
    className: 'text-slate-400 text-sm font-semibold',
    text: 'Instant Preview & Serverless First 기능부터 이해하며, Phase 2 BE 연동 확장을 준비합니다.',
  });
  const heroCopy = createElement('p', {
    className: 'text-slate-300 leading-relaxed',
    text: '실시간 디바이스 보기와 파이어베이스 기반 인증을 통해 AIoT Dev Mgr의 핵심 흐름을 빠르게 확인하고, 이후 백엔드 통합으로 가치를 고도화하는 순서로 설계되어 있습니다.',
  });
  introPanel.append(heroTitle, heroSubtitle, heroCopy);

  const tileLabel = createElement('p', {
    className: 'text-sm uppercase tracking-[0.2em] text-slate-500',
    text: 'Core Capability Tiles',
  });
  const featureGrid = createElement('div', {
    className: 'grid gap-3 md:grid-cols-3',
  });
  const instantTile = createCard('Instant Preview', 'Vite + Tailwind + Firebase 기반 SPA가 곧바로 실행되며, AIoT Dev Mgr 프론트 로직을 바로 확인할 수 있습니다.', { active: true });
  const serverlessTile = createCard('Serverless First', 'Firebase Auth/Firestore 중심 실시간 아키텍처로 사용자/디바이스 상태를 안전하게 분리합니다.', { active: true });
  const phaseTile = createCard('Phase 2 Ready', describePhase2(false), { active: false });
  featureGrid.append(instantTile, serverlessTile, phaseTile);

  introPanel.append(tileLabel, featureGrid);

  const beToggleRow = createElement('div', {
    className: 'flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-slate-700/40 pt-4',
  });
  const beStatus = createElement('span', {
    className: 'text-sm text-slate-300',
    text: 'BE 연동 상태: Off',
  });
  const beToggleButton = createElement('button', {
    className: 'px-4 py-2 text-sm font-semibold rounded-full border border-slate-600 bg-slate-800 hover:border-sky-400 transition',
    text: 'BE 연동 켜기',
  });

  let backendEnabled = false;
  function updateBackendStatus(enabled: boolean) {
    backendEnabled = enabled;
    beStatus.textContent = `BE 연동 상태: ${enabled ? 'On' : 'Off'}`;
    beToggleButton.textContent = enabled ? 'BE 연동 끄기' : 'BE 연동 켜기';
    beToggleButton.classList.toggle('border-sky-400', enabled);
    beToggleButton.classList.toggle('text-sky-300', enabled);
    updatePhaseTileState(enabled);
    syncLock(authenticated);
  }

  beToggleButton.addEventListener('click', () => {
    updateBackendStatus(!backendEnabled);
  });

  beToggleRow.append(beStatus, beToggleButton);
  introPanel.append(beToggleRow);

  const deviceList = createDeviceList();
  const deviceActions = createDeviceActions();
  const mqttPanel = createMqttPanel();

  const lockableSections = [deviceList, deviceActions, mqttPanel];

  function syncLock(available: boolean) {
    lockableSections.forEach((section) => {
      section.setAttribute('data-locked', available ? 'false' : 'true');
    });
  }

  let authenticated = Boolean(authService.currentUser());
  syncLock(authenticated);

  window.addEventListener('auth-changed', (event) => {
    const detail = (event as CustomEvent<{ loggedIn: boolean }>).detail;
    authenticated = Boolean(detail?.loggedIn);
    syncLock(authenticated);
  });

  container.append(introPanel, deviceList, deviceActions, mqttPanel);

  function describePhase2(enabled: boolean) {
    return enabled
      ? 'Express + MySQL 백엔드가 켜져 Phase 2 API와 통합된 시나리오로 실습 가능합니다.'
      : 'BE 연동 Off 상태입니다. 상단 토글로 켜면 Express + MySQL 기반 확장 흐름을 바로 확인합니다.';
  }

  function updatePhaseTileState(enabled: boolean) {
    const descriptionNode = phaseTile.querySelector('p');
    if (descriptionNode) {
      descriptionNode.textContent = describePhase2(enabled);
    }
    applyCardHighlight(phaseTile, enabled);
  }

  updatePhaseTileState(false);

  return container;
}
