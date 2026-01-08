import { createElement } from '../lib/dom';

export function createButton(label: string, options: { variant?: 'primary' | 'ghost'; onClick?: (event: MouseEvent) => void } = {}) {
  const className =
    options.variant === 'ghost'
      ? 'px-4 py-2 rounded-full border border-slate-500 text-slate-100 hover:bg-slate-800 transition'
      : 'px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold shadow-lg hover:opacity-90 transition';

  const button = createElement('button', { className, text: label });

  if (options.onClick) {
    button.addEventListener('click', options.onClick);
  }

  return button;
}
