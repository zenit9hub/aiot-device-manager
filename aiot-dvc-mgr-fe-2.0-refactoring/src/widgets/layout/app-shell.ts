import { createHeader } from './header';

export function createAppShell(content: HTMLElement) {
  const shell = document.createElement('div');
  shell.className = 'app-shell';

  const header = createHeader();

  const main = document.createElement('main');
  main.className = 'app-content';
  main.appendChild(content);

  shell.append(header, main);
  return shell;
}
