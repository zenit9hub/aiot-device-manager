import { createElement } from '../lib/dom';

export function createCard(title: string, description: string) {
  const card = createElement('article', {
    className:
      'panel p-4 mb-4 max-w-2xl border border-slate-700/60 bg-white/5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-slate-400',
  });

  const heading = createElement('h3', { className: 'text-xl font-semibold text-white mb-2', text: title });
  const body = createElement('p', { className: 'text-slate-300 leading-relaxed', text: description });

  card.append(heading, body);
  return card;
}
