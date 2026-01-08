import { createButton } from '../../shared/ui/button';
import { createElement } from '../../shared/lib/dom';

export function createHeader() {
  const header = createElement('header', {
    className: 'flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60',
  });

  const brand = createElement('div', { className: 'flex flex-col', text: '' });
  const brandTitle = createElement('span', { className: 'text-xl font-bold text-white', text: 'AIoT Dev Mgr' });
  const brandSubtitle = createElement('small', { className: 'text-slate-400', text: 'Phase 2 refactoring' });
  brand.append(brandTitle, brandSubtitle);

  const actions = createButton('Refactor Flow', { variant: 'ghost' });

  header.append(brand, actions);
  return header;
}
