import { createElement } from '../../shared/lib/dom';
import { createCard } from '../../shared/ui/card';
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
    text: 'FE 리팩토링 영역을 FSD 패턴으로 새로 구성해 실습자가 문서를 보고 바로 이해하고 확장할 수 있는 레퍼런스를 제공합니다.',
  });
  const metrics = createElement('div', { className: 'grid gap-3 md:grid-cols-3' });
  metrics.appendChild(createCard('Instant Preview', 'Vite + Tailwind + Firebase로 구성된 SPA가 곧바로 실행됩니다.'));
  metrics.appendChild(createCard('Serverless First', 'Firebase Auth/Firestore 중심의 실시간 기반 아키텍처.'));
  metrics.appendChild(createCard('Phase 2 Ready', 'Express + MySQL 백엔드와 손쉽게 연동할 수 있도록 구조화.'));

  hero.append(heroTitle, heroCopy, metrics);

  container.append(
    hero,
    createLoginForm(),
    createDeviceList(),
    createDeviceActions(),
    createMqttPanel(),
    createProcessStepper(),
  );
  return container;
}
