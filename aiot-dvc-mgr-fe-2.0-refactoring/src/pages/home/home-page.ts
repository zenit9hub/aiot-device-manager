import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseStore } from '../../app/providers/firebase-provider';
import { createDeviceActions } from '../../features/device-management/ui/device-actions';
import { createDeviceList } from '../../features/device-management/ui/device-list';
import { createMqttPanel } from '../../features/mqtt-monitoring/ui/mqtt-panel';
import { authService } from '../../features/auth/model/auth-service';
import { backendService } from '../../features/backend/model/backend-service';
import { createElement } from '../../shared/lib/dom';
import { firebaseConfig } from '../../shared/config/firebase-config';
import { applyCardHighlight, createCard } from '../../shared/ui/card';

/** Render the main dashboard for the AIoT Dev Mgr learning experience. */
export function createHomePage() {
  const container = createElement('section', { className: 'space-y-8' });

  const introPanel = createElement('section', {
    className: 'panel p-6 space-y-6 border border-slate-700/60 bg-gradient-to-br from-slate-900/80 to-slate-800/70 shadow-inner',
  });
  const heroTitle = createElement('h1', {
    className: 'text-3xl font-bold text-white',
    text: 'AIoT Device Manager 실습 페이지',
  });
  const heroSubtitle = createElement('p', {
    className: 'text-slate-400 text-sm font-semibold',
    text: 'Instant Preview & Serverless First 기능부터 이해하며, Phase 2 BE 연동 확장을 준비합니다.',
  });
  const heroCopy = createElement('p', {
    className: 'text-slate-300 leading-relaxed',
    text: '실시간 디바이스 보기와 파이어베이스 기반 인증을 통해 AIoT Dev Mgr의 핵심 흐름을 빠르게 확인하고, 이후 백엔드 통합으로 가치를 고도화하는 순서로 설계되어 있습니다.',
  });
  introPanel.append(heroTitle, heroSubtitle, heroCopy);

  const checklistTitle = createElement('p', {
    className: 'text-xs uppercase tracking-[0.3em] text-slate-500',
    text: '실습 필수 체크리스트',
  });
  const checklist = createElement('div', { className: 'space-y-2' });

  function createChecklistItem(label: string) {
    const row = createElement('label', { className: 'flex items-start gap-3 text-sm text-slate-300' });
    const checkbox = createElement('input', {
      className: 'mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900/60 accent-sky-400',
      attrs: { type: 'checkbox', disabled: true },
    }) as HTMLInputElement;
    const text = createElement('span', { text: label });
    row.append(checkbox, text);
    return { row, checkbox };
  }

  const envChecklist = createChecklistItem('.env 설정으로 Firebase 연동 정보가 주입되었는가');
  const domainChecklist = createChecklistItem('Firebase Auth 승인 도메인(로컬/배포)이 등록되었는가');
  const firestoreChecklist = createChecklistItem('Firestore 읽기/쓰기 권한이 정상 동작하는가');
  checklist.append(envChecklist.row, domainChecklist.row, firestoreChecklist.row);
  introPanel.append(checklistTitle, checklist);

  const tileLabel = createElement('p', {
    className: 'text-sm uppercase tracking-[0.2em] text-slate-500',
    text: 'Core Capability Tiles',
  });
  const featureGrid = createElement('div', {
    className: 'grid gap-3 md:grid-cols-3',
  });
  const instantTile = createCard('Instant Preview', 'Vite + Tailwind + Firebase 기반 SPA가 곧바로 실행되며, AIoT Dev Mgr 프론트 로직을 바로 확인할 수 있습니다.', { active: true });
  const serverlessTile = createCard('Serverless First', 'Firebase Auth/Firestore 중심 실시간 아키텍처로 사용자/디바이스 상태를 안전하게 분리합니다.', { active: true });
  const phaseTile = createCard('Phase 2 Ready', describePhase2(false), { active: false });
  featureGrid.append(instantTile, serverlessTile, phaseTile);

  introPanel.append(tileLabel, featureGrid);

  const beToggleRow = createElement('div', {
    className: 'flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-slate-700/40 pt-4',
  });
  const beStatus = createElement('span', {
    className: 'text-sm text-slate-300',
    text: 'BE 연동 상태: Off',
  });
  const beToggleButton = createElement('button', {
    className: 'px-4 py-2 text-sm font-semibold rounded-full border border-slate-600 bg-slate-800 hover:border-sky-400 transition',
    text: 'BE 연동 켜기',
  });

  let backendEnabled = false;
  let backendCheckInFlight = false;
  function updateBackendStatus(enabled: boolean) {
    backendEnabled = enabled;
    beStatus.textContent = `BE 연동 상태: ${enabled ? 'On' : 'Off'}`;
    beToggleButton.textContent = enabled ? 'BE 연동 끄기' : 'BE 연동 켜기';
    beToggleButton.classList.toggle('border-sky-400', enabled);
    beToggleButton.classList.toggle('text-sky-300', enabled);
    updatePhaseTileState(enabled);
    syncLock(authenticated);
    window.dispatchEvent(new CustomEvent('backend-toggle', { detail: { enabled } }));
  }

  async function attemptEnableBackend() {
    if (backendCheckInFlight) {
      return;
    }
    if (!authenticated) {
      beStatus.textContent = 'BE 연동 상태: 로그인 필요';
      return;
    }
    backendCheckInFlight = true;
    beToggleButton.disabled = true;
    beStatus.textContent = 'BE 연동 상태: 확인 중...';
    const token = await authService.getIdToken();
    if (!token) {
      beStatus.textContent = 'BE 연동 상태: 토큰 없음';
      beToggleButton.disabled = false;
      backendCheckInFlight = false;
      return;
    }
    try {
      const ok = await backendService.checkHealth(token);
      if (!ok) {
        throw new Error('Health check failed');
      }
      updateBackendStatus(true);
    } catch (error) {
      console.warn('[backend] health check failed', error);
      updateBackendStatus(false);
      beStatus.textContent = 'BE 연동 상태: 연결 실패';
    } finally {
      beToggleButton.disabled = false;
      backendCheckInFlight = false;
    }
  }

  beToggleButton.addEventListener('click', () => {
    if (backendEnabled) {
      updateBackendStatus(false);
      return;
    }
    void attemptEnableBackend();
  });

  beToggleRow.append(beStatus, beToggleButton);
  introPanel.append(beToggleRow);

  const deviceList = createDeviceList();
  const deviceActions = createDeviceActions();
  const mqttPanel = createMqttPanel();

  const lockableSections = [deviceList, deviceActions, mqttPanel];

  function syncLock(available: boolean) {
    lockableSections.forEach((section) => {
      section.setAttribute('data-locked', available ? 'false' : 'true');
    });
  }

  let authenticated = Boolean(authService.currentUser());
  syncLock(authenticated);

  window.addEventListener('auth-changed', (event) => {
    const detail = (event as CustomEvent<{ loggedIn: boolean }>).detail;
    authenticated = Boolean(detail?.loggedIn);
    syncLock(authenticated);
    if (!authenticated && backendEnabled) {
      updateBackendStatus(false);
    }
  });

  function setChecklist(item: ReturnType<typeof createChecklistItem>, checked: boolean) {
    item.checkbox.checked = checked;
    item.row.classList.toggle('text-emerald-200', checked);
    item.row.classList.toggle('text-slate-300', !checked);
  }

  const envReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain);
  setChecklist(envChecklist, envReady);
  setChecklist(domainChecklist, false);
  setChecklist(firestoreChecklist, false);

  let lastFirestoreCheckUser: string | null = null;
  let firestoreCheckInFlight = false;

  function buildUserPayload(user: User, isNew: boolean) {
    const primaryProvider = user.providerData[0];
    const providerId = primaryProvider?.providerId ?? user.providerId ?? 'unknown';
    const providerDetails = user.providerData.map((provider) => ({
      providerId: provider.providerId,
      uid: provider.uid,
      email: provider.email ?? null,
      displayName: provider.displayName ?? null,
      phoneNumber: provider.phoneNumber ?? null,
      photoURL: provider.photoURL ?? null,
    }));
    const payload: Record<string, unknown> = {
      userInfo: {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        provider: providerId,
      },
      email: user.email ?? null,
      provider: providerId,
      providers: providerDetails,
      lastLoginAt: serverTimestamp(),
    };
    if (isNew) {
      payload.createdAt = serverTimestamp();
    }
    return payload;
  }

  async function verifyFirestoreAccess(user: User) {
    if (firestoreCheckInFlight) {
      return;
    }
    const store = getFirebaseStore();
    if (!store) {
      setChecklist(firestoreChecklist, false);
      return;
    }
    firestoreCheckInFlight = true;
    try {
      const userDoc = doc(store, 'users', user.uid);
      const snapshot = await getDoc(userDoc);
      const payload = buildUserPayload(user, !snapshot.exists());
      await setDoc(userDoc, payload, { merge: true });
      const updated = await getDoc(userDoc);
      setChecklist(firestoreChecklist, updated.exists());
    } catch (error) {
      console.warn('[checklist] Firestore 권한 확인 실패', error);
      setChecklist(firestoreChecklist, false);
    } finally {
      firestoreCheckInFlight = false;
    }
  }

  function updateAuthChecklist() {
    const user = authService.currentUser();
    setChecklist(domainChecklist, Boolean(user));
    if (!user) {
      setChecklist(firestoreChecklist, false);
      lastFirestoreCheckUser = null;
      return;
    }
    if (lastFirestoreCheckUser === user.uid) {
      return;
    }
    lastFirestoreCheckUser = user.uid;
    verifyFirestoreAccess(user);
  }

  updateAuthChecklist();

  window.addEventListener('auth-changed', () => {
    updateAuthChecklist();
  });

  window.addEventListener('auth-error', (event) => {
    const detail = (event as CustomEvent<{ code?: string }>).detail;
    if (detail?.code === 'auth/unauthorized-domain') {
      setChecklist(domainChecklist, false);
    }
  });

  container.append(introPanel, deviceList, deviceActions, mqttPanel);

  function describePhase2(enabled: boolean) {
    return enabled
      ? 'Express + MySQL 백엔드가 켜져 Phase 2 API와 통합된 시나리오로 실습 가능합니다.'
      : 'BE 연동 Off 상태입니다. 상단 토글로 켜면 Express + MySQL 기반 확장 흐름을 바로 확인합니다.';
  }

  function updatePhaseTileState(enabled: boolean) {
    const descriptionNode = phaseTile.querySelector('p');
    if (descriptionNode) {
      descriptionNode.textContent = describePhase2(enabled);
    }
    applyCardHighlight(phaseTile, enabled);
  }

  updatePhaseTileState(false);

  return container;
}
