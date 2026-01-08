import { createHomePage } from '../pages/home/home-page';
import { createAppShell } from '../widgets/layout/app-shell';

/** Entrypoint that wires the layout shell with the home page content. */
export function createApp(root: HTMLElement) {
  const content = createHomePage();
  const shell = createAppShell(content);
  root.appendChild(shell);
}
