import { createElement } from '../lib/dom';

const highlightClasses = [
  'border-sky-400/70',
  'bg-slate-900/90',
  'shadow-lg',
  'shadow-sky-900/50',
];

export function applyCardHighlight(card: HTMLElement, active: boolean) {
  highlightClasses.forEach((cls) => card.classList.toggle(cls, active));
}

export function createCard(title: string, description: string, options: { active?: boolean } = {}) {
  const card = createElement('article', {
    className:
      'panel p-4 mb-4 max-w-2xl border border-slate-700/60 bg-white/5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-slate-400',
  });

  const heading = createElement('h3', { className: 'text-xl font-semibold text-white mb-2', text: title });
  const body = createElement('p', { className: 'text-slate-300 leading-relaxed', text: description });

  card.append(heading, body);
  if (options.active) {
    applyCardHighlight(card, true);
  }
  return card;
}
