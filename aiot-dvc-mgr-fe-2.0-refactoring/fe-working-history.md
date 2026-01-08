
## 2026-01-03 16:00 - Phase 1 FE refactor kickoff
- `npm create vite@latest aiot-dvc-mgr-fe-2.0-refactoring -- --template vanilla-ts`
- Installed core deps: `firebase` plus dev helpers (`tailwindcss@3.4.16`, `postcss`, `autoprefixer`, `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/*`).
- Initialized Tailwind/PostCSS configs that target `./index.html` + `./src/**/*`.
- Decision: follow the recommended FSD layout to make each domain explicit (app/pages/widgets/features/entities/shared/processes).

## 2026-01-03 16:20 - Architecture scaffolding
- Replaced the default counter entrypoint with a FSD-aware bootstrap (app shell, home page, and process stepper).
- Added shared utilities (`dom` helpers, button/card) and Firebase config/provider layers with graceful fallback when env vars are missing.
- Implemented lightweight features: auth login form, device list cards, onboarding flow, and mock services/entities to illustrate the structure.

## 2026-01-03 16:30 - Verification
- Added Vitest scripts and created a minimal auth-service test to keep dependencies wired up.
- Ran `npm run test` successfully (2 assertions) to verify the new structure builds and the mock auth service behaves as expected.

## 2026-01-03 16:40 - Firebase 설정값 연결
- `.env.example`과 실제 `.env` 파일에 제공된 Firebase config를 정리해 Vite가 `import.meta.env`로 읽도록 준비했습니다.
- `shared/config/firebase-config.ts`에 measurementId 필드를 추가했고, 환경변수가 부족할 경우에도 graceful fallback 하도록 했습니다.
- `app/providers/firebase-provider.ts`에 Firebase Analytics 초기화를 더해 측정 ID가 있을 때만 `getAnalytics`가 실행되도록 했습니다.

## 2026-01-04 11:00 - Firestore + MQTT 연결 정리

**컨텍스트**:
`2.0 아키텍처 종합` 문서에서 안내한 Firestore 실시간 구독, MQTT 모니터링, 그리고 Phase 1 MVP 기반 스택을 실제 UI/서비스 흐름에 연결해야 하는 시점.

**사용자 프롬프트**:
> "The Phase 1 refactor should wire Firestore/MQTT flows, device CRUD, and continue logging the workflow actions."

**Claude 응답**:
- Firestore devices 컬렉션을 구독하는 `deviceRepository`/`deviceService`로 대체하고, 기존 mock 서비스보다 실제 흐름이 보이도록 `device-list`를 구독형으로 리팩토링합니다.
- CRUD 제어를 제공하는 `device-actions` UI와 MQTT 모니터링 패널을 추가하여 시뮬레이션/실제 브로커를 전환할 수 있도록 합니다.
- `startMqttMonitoring`은 env 기반으로 실제 브로커 연결을 시도하며, 기본이 empty일 경우 즉시 시뮬레이션 메시지를 방출해 테스트를 안정화하겠습니다.

**결정 사항**:
- [x] Firestore fallback을 포함한 `device-repository`로 `deviceService`를 리팩토링하고, `device-list`를 구독 기반으로 재작성
- [x] CRUD 단축 UI(`device-actions`)와 MQTT 대시보드(`mqtt-panel`)를 FSD 경로에 추가
- [x] Vitest에 장치/ MQTT 서비스 테스트를 추가하여 시뮬레이션 흐름을 검증

**구현 코드**:
```typescript
// features/device-management/api/device-repository.ts
export function subscribeToDevices(userId: string | null, listener: DeviceListener) {
  const store = getFirebaseStore();
  if (!store || !userId) {
    return useFallback(listener);
  }

  const devicesQuery = query(
    collection(store, 'devices'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(devicesQuery, (snapshot) => {
    listener(snapshot.docs.map((doc) => mapSnapshot(doc)));
  });
}
```

**다음 단계**:
1. Firestore/MQTT 실서비스 설정(환경 변수/브로커 URL) 확인 및 `authService` 로그인 흐름 연결
2. Phase 2 BE API 커뮤니케이션을 위한 `deviceService` 테스트 확대 + `home-page` 문서화
3. 테스트 커버리지 80% 목표 달성을 위한 추가 Vitest 시나리오(디바이스 CRUD, MQTT 데이터 파싱)
