/**
 * App Provider
 *
 * Firebase 초기화 및 라우팅 관리
 */

import { initializeFirebase } from '@shared/api/firebase/firebase-init';
import { authService } from '@features/auth/model/auth-service';
import { renderLoginPage } from '@pages/auth/login-page';
import { renderDevicesPage } from '@pages/devices/devices-page';

export function initializeApp(): void {
  // Firebase 초기화
  initializeFirebase();

  const appContainer = document.querySelector<HTMLDivElement>('#app');
  if (!appContainer) {
    throw new Error('#app element not found');
  }

  const renderCurrentPage = (userId: string | null) => {
    // Clear container
    appContainer.innerHTML = '';

    if (!userId) {
      // Show login page
      console.log('[App] Rendering login page');
      const loginPage = renderLoginPage((userId) => {
        console.log('[App] Login successful, user:', userId);
        renderCurrentPage(userId);
      });
      appContainer.appendChild(loginPage);
    } else {
      // Show devices page
      console.log('[App] Rendering devices page, user:', userId);
      const devicesPage = renderDevicesPage(userId, () => {
        console.log('[App] Logout, showing login page');
        renderCurrentPage(null);
      });
      appContainer.appendChild(devicesPage);
    }
  };

  // Subscribe to auth state changes
  authService.onAuthStateChanged((user) => {
    console.log('[App] Auth state changed:', user?.uid || 'No user');
    renderCurrentPage(user?.uid || null);
  });

  console.log('[App] AIoT Device Manager initialized');
}
