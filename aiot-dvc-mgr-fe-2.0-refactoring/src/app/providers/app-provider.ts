/**
 * 앱 프로바이더
 *
 * Firebase 초기화 및 전역 상태 관리
 */

import { initializeFirebase } from '@shared/api/firebase/firebase-init';
import { renderApp } from '@pages/auth/auth-page';

export function initializeApp(): void {
  // Firebase 초기화
  initializeFirebase();

  // 초기 페이지 렌더링
  renderApp();

  console.log('[App] AIoT Device Manager initialized');
}
