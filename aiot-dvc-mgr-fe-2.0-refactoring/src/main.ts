import './styles/global.css';
import { createApp } from './app/app';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Root element not found in index.html');
}

createApp(root);
