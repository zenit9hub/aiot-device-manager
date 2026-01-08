/**
 * Vitest 테스트 설정
 */

import { afterEach, beforeAll } from 'vitest';
import { initializeFirebase } from '@shared/api/firebase/firebase-init';

// Firebase 초기화 (모든 테스트 시작 전)
beforeAll(() => {
  initializeFirebase();
});

// 각 테스트 후 DOM 정리
afterEach(() => {
  document.body.innerHTML = '';
});
