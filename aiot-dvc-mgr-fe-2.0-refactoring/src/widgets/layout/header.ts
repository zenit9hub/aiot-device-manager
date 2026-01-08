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

  const controls = createElement('div', { className: 'flex items-center gap-3' });
  const statusBadge = createElement('span', {
    className: 'text-sm font-medium text-slate-200 bg-white/5 px-3 py-1 rounded-full border border-white/10',
    text: 'BE 연동: Off',
  });
  const toggleButton = createButton('BE 연동 Off', { variant: 'ghost' });
  let backendEnabled = false;

  function updateToggle() {
    toggleButton.textContent = backendEnabled ? 'BE 연동 On' : 'BE 연동 Off';
    statusBadge.textContent = `BE 연동: ${backendEnabled ? 'On' : 'Off'}`;
    toggleButton.classList.toggle('bg-sky-500/70 text-white border-transparent shadow-lg', backendEnabled);
  }

  toggleButton.addEventListener('click', () => {
    backendEnabled = !backendEnabled;
    updateToggle();
    window.dispatchEvent(
      new CustomEvent('backend-toggle', {
        detail: { enabled: backendEnabled },
      }),
    );
  });

  updateToggle();
  controls.append(statusBadge, toggleButton);

  header.append(brand, controls);
  return header;
}
