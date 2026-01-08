import { createElement } from '../../shared/lib/dom';
import { createCard, applyCardHighlight } from '../../shared/ui/card';
import { createDeviceList } from '../../features/device-management/ui/device-list';
import { createDeviceActions } from '../../features/device-management/ui/device-actions';
import { createLoginForm } from '../../features/auth/ui/login-form';
import { createProcessStepper } from '../../processes/onboarding/stepper';
import { createMqttPanel } from '../../features/mqtt-monitoring/ui/mqtt-panel';

export function createHomePage() {
  const container = createElement('section', { className: 'space-y-8' });

  const hero = createElement('section', {
    className: 'panel p-6 space-y-4 border border-slate-700/60 bg-gradient-to-br from-slate-900/80 to-slate-800/70',
  });
  const heroTitle = createElement('h1', { className: 'text-3xl font-bold text-white', text: 'Phase 2 즉시 적용 가능한 리팩토링' });
  const heroCopy = createElement('p', {
    className: 'text-slate-300 leading-relaxed',
    text: 'FE 리팩토링 영역은 FSD 패턴으로 실습용 코드를 새로 구성했으며, 문서를 보면 곧바로 구조를 파악한 뒤 프로덕션급으로 고도화할 수 있도록 설계했습니다.',
  });
  const metrics = createElement('div', { className: 'grid gap-3 md:grid-cols-3' });
  metrics.appendChild(createCard('Instant Preview', 'Vite + Tailwind + Firebase로 구성된 SPA가 곧바로 실행됩니다.', { active: true }));
  metrics.appendChild(createCard('Serverless First', 'Firebase Auth/Firestore 중심의 실시간 기반 아키텍처.', { active: true }));
  const phaseCard = createCard('Phase 2 Ready', describePhase2(false), { active: false });
  metrics.appendChild(phaseCard);

  hero.append(heroTitle, heroCopy, metrics);

  container.append(
    hero,
    createLoginForm(),
    createDeviceList(),
    createDeviceActions(),
    createMqttPanel(),
    createProcessStepper(),
  );

  const phaseCardDescription = phaseCard.querySelector('p');
  function describePhase2(enabled: boolean) {
    return enabled
      ? 'Express + MySQL 백엔드를 즉시 활성화하여 Phase 2 API를 바로 실습하고 확장할 수 있습니다.'
      : 'BE 연동 Off 상태이며, 상단 토글로 켜면 Express + MySQL 확장 흐름을 바로 확인합니다.';
  }

  window.addEventListener('backend-toggle', (event) => {
    const detail = (event as CustomEvent<{ enabled: boolean }>).detail;
    const enabled = Boolean(detail.enabled);
    if (phaseCardDescription) {
      phaseCardDescription.textContent = describePhase2(enabled);
    }
    applyCardHighlight(phaseCard, enabled);
  });
  return container;
}
