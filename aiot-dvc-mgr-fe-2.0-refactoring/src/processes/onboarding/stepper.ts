import { createElement } from '../../shared/lib/dom';

export function createProcessStepper() {
  const steps = [
    { title: 'Auth 세팅', description: 'Firebase Auth + 소셜 로그인을 준비합니다.' },
    { title: '실시간 DB', description: 'Firestore Security Rules로 사용자 격리를 설계합니다.' },
    { title: '실습용 Dev Tool', description: 'MQTT/WebSocket 시뮬레이터를 연결합니다.' },
  ];

  const wrapper = createElement('section', {
    className: 'panel p-6 space-y-4',
  });

  const title = createElement('h2', { className: 'text-2xl font-bold text-white', text: '리팩토링 워크플로우' });
  const list = createElement('div', { className: 'space-y-3' });

  steps.forEach((step, index) => {
    const item = createElement('div', { className: 'flex items-start gap-3' });
    const badge = createElement('span', {
      className: 'text-sm font-semibold text-slate-100',
      text: `STEP ${index + 1}`,
    });
    const body = createElement('div');
    const stepTitle = createElement('p', { className: 'text-base font-semibold text-white', text: step.title });
    const stepDescription = createElement('p', { className: 'text-slate-400 text-sm', text: step.description });
    body.append(stepTitle, stepDescription);
    item.append(badge, body);
    list.appendChild(item);
  });

  wrapper.append(title, list);
  return wrapper;
}
