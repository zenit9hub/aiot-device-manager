
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
1. Firestore/MQTT 실서비스 설정(환경 변수/브로커 URL) 확인 및 `authService` 로그인 흐름 연결
2. Phase 2 BE API 커뮤니케이션을 위한 `deviceService` 테스트 확대 + `home-page` 문서화
3. 테스트 커버리지 80% 목표 달성을 위한 추가 Vitest 시나리오(디바이스 CRUD, MQTT 데이터 파싱)

## 2026-01-08 13:45 - 빌드 도중 타입 락 방지

**컨텍스트**:
`tsconfig.json`에서 `verbatimModuleSyntax`가 활성화되어 있어, build 시점에 타입만 쓰는 import를 모두 `import type`으로 표기해야 하고 `_userId`처럼 읽지 않는 파라미터도 명시적으로 무시해야 합니다.

**사용자 프롬프트**:
> "로컬 서버에서 흰화면이 뜨는 문제를 해결하려면, `npm run build`도 성공해야 합니다."

**Claude 응답**:
- `firebase-provider`, `auth-service`, 핵심 `Device`/`MQTT` 모듈의 타입들을 `import type`으로 전환하여 `verbatimModuleSyntax` 규칙을 만족시키자.
- `device-repository`에서 실제로 쓰이지 않는 `userId` 파라미터는 `_userId`로 이름을 바꿔 lint를 통과시켰고, Firestore 타입들 역시 타입 전용 import로 정리했다.
- 마지막으로 `npm run build`를 실행해 모든 모듈(정적 + MQTT 번들링 포함)이 정상적으로 출력되는지 확인했다.

**결정 사항**:
- [x] `firebase-provider.ts`/`auth-service.ts`/device 관련 UI/서비스/테스트에서 타입 수입은 `import type`으로 처리
- [x] `_userId` 패턴으로 `noUnusedParameters` 위반 방지 + `deviceService`/`deviceRepository` 인터페이스 유지
- [x] `npm run build` 성공 (생성된 번들: `dist/index...`, `dist/assets/...`, `dist/assets/mqtt.esm-CHY5Dy7j.js`)

**구현 코드**:
```typescript
import type { Device } from '../../../entities/device/device';
```
```typescript
export async function updateDeviceStatus(_userId: string, deviceId: string, status: Device['status']) { ... }
```

**다음 단계**:
1. Phase 1 UI/테스트를 안정화하면서 Firebase/MQTT 실환경 연결 확인
2. Phase 2 백엔드 API 인터페이스 문서화 및 테스트 명세 정리
3. PR 전 기준에 따라 커밋 정리 및 검토 요청

## 2026-01-08 23:22 - BE 토글 UX 및 설명 정리

**컨텍스트**:
FE 데모를 보는 학습자가 `Refactor Flow` 버튼을 통해 백엔드 연동을 켰다/껐다 확인할 수 있으면 BE 확장 부분이 더 명확합니다. 카드는 FSD 기반 실습 코드라는 점과 Phase 2 확장 의도를 설명해야 합니다.

**사용자 프롬프트**:
> "Refactor Flow 버튼을 BE 연동 On/Off 토글로 바꾸고, 세 번째 카드 설명도 백엔드 확장 문구로 조정해주세요."

**Claude 응답**:
- `header.ts`에서 상태값을 관리하는 버튼으로 교체하고, button 텍스트·백그라운드·badge를 함께 바꿔 `backend-toggle` 이벤트를 dispatch합니다.
- `<Phase 2 즉시 적용 가능한 리팩토링>` 카드 중 마지막(Phase 2 Ready)은 버튼 상태를 듣고 설명을 바꾸도록 했고, 히어로 문구도 “FSD 패턴으로 실습용 코드 → 프로덕션 확장” 흐름으로 다듬었습니다.
- 버튼 클릭 시 텍스트가 `BE 연동 On/Off`로 바뀌며 배경이 강조되고, 카드에는 Express+MySQL 토글 안내가 표시됩니다.

**결정 사항**:
- [x] 헤더 버튼을 BE 토글로 교체하고 전역 커스텀 이벤트로 상태를 전달
- [x] 페이즈 2 카드 설명을 토글 상태에 따라 변화시켜 BE 확장 의도를 명시
- [x] 데모 설명 문구를 “FSD 기반 실습 코드 → 프로덕션 확장”으로 다듬음

**다음 단계**:
1. Phase 1 완료 반영된 시각/문서 상태로 리뷰 요청
2. Phase 2 BE 연동 모듈 개발(Express, MySQL) 진행 전 API 계약 문서화
3. 학습자 피드백 반영해 토글 상태에 따른 메시지나 안내 강화

## 2026-01-09 00:32 - 카드 강조 상태 추가

**컨텍스트**:
상단 토글과 시각적 흐름을 연결하려면, 이미 완성된 두 카드와 BE 온 상태일 때 Phase 2 카드 모두 “활성화된” 테두리/그림자 스타일로 강조하면 좋습니다.

**사용자 프롬프트**:
> "Instant Preview/Serverless First 카드 테두리를 활성화된 느낌으로 바꾸고, BE On/Off에 따라 세 번째 카드도 강조/기본 테두리로 전환해 주세요."

**Claude 응답**:
- `shared/ui/card.ts`에서 highlight 클래스 목록과 `applyCardHighlight` 유틸을 추가해, `createCard` 호출 시 옵션으로 활성화 상태를 부여할 수 있게 했습니다.
- `home-page.ts`에서 첫 두 카드를 `active: true`로 렌더링하고 `backend-toggle` 이벤트에서 Phase 2 카드를 강조/제거하도록 연결했습니다.
- 결과적으로 “Phase 1 실습 → Phase 2 확장” 시나리오가 시각적으로도 즉시 드러납니다.

**결정 사항**:
- [x] highlight 클래스 리스트 및 `applyCardHighlight`를 `shared/ui/card.ts`에 도입
- [x] 첫 두 카드는 기본 렌더링부터 강조, Phase 2 카드는 토글 상태에 따라 강조
- [x] 빌드/테스트(CI) 모두 통과

**다음 단계**:
1. Phase 2 BE API 연동 스펙 문서화
2. 실습자 리포트용 설명문(토글 포함) 정리 및 스크린샷 반영

## 2026-01-09 23:40 - 강조 애니메이션 보강

**컨텍스트**:
활성화된 카드 테두리가 아직 미미하여 Phase 1/Phase 2 강조 의도가 직관적으로 전달되지 않으므로, 테두리를 더 굵고 밝게 만들고 회전하는 아우터 라인을 적용했습니다.

**사용자 프롬프트**:
> "연두색 혹은 밝은 파란색 두꺼운 테두리와 빙글 도는 애니메이션을 적용해 주세요."

**Claude 응답**:
- `styles/global.css`에 `.highlighted-card`에 밝은 파란색 border/그라디언트 배경/글로우를 주고, `::after`로 약간 회전하는 애니메이션 라인을 추가해 강조 효과를 극대화했습니다.
- 회전 애니메이션은 강조 카드 주위에서 계속 반복되며, 동일한 시각 언어로 BE 토글과 카드 연동이 눈에 띄게 보일 것입니다.

**결정 사항**:
- [x] `.highlighted-card`에 두꺼운 컬러 border/배경/그림자 넣음
- [x] `::after` 애니메이션으로 회전 라인 추가
- [x] `npm run test` 통과 확인

## 2026-01-09 23:42 - highlight 클래스 동기화

**컨텍스트**:
카드 강조 상태를 CSS 애니메이션으로만 제어하던 방식으로는 DOM에서 클래스가 명확하게 드러나지 않아 스타일이 완전히 적용되는지 확인하기 어렵습니다.

**사용자 프롬프트**:
> "베이스 카드에 `highlighted-card` 클래스가 붙어서 시각적으로 활성화된 상태가 확실히 드러나야 합니다."

**Claude 응답**:
- `applyCardHighlight`에서 밝은 border/그림자 뿐 아니라 `highlighted-card` CSS 클래스를 직접 토글하도록 변경하여 DOM 상태가 명확하게 바뀌는 구조로 정리했습니다.
- 이제 첫 두 카드와 토글 활성화 상태일 때의 Phase 2 카드가 `highlighted-card` 클래스를 받아 bg/border/애니메이션 모두 동시에 켜집니다.

**결정 사항**:
- [x] `applyCardHighlight`에서 CSS 클래스를 직접 토글하도록 변경
- [x] 다시 `npm run test` 통과 확인

**다음 단계**:
1. 스타일 적용 테스트를 포함해 사용자 피드백 반영
2. Phase 2 BE 문서 링크/상태 정식화

**다음 단계**:
1. BE On/Off 효과를 토글 이모티콘이나 색 단계로 확장 검토
2. Phase 2 카드에 관련 문서 링크를 붙여 테스트 흐름 안내

## 2026-01-09 23:48 - 꾸준한 테두리 애니메이션

**컨텍스트**:
기존 회전형 애니메이션이 시각적으로 불안정하다는 피드백이 있어, 테두리를 따라 한 방향으로 빛이 이동하는 형태로 다시 설계하고 싶습니다.

**사용자 프롬프트**:
> "회전하지 않고 굵은 파란 선이 카드 테두리를 따라 한 바퀴 도는 애니메이션으로 바꿔주세요."

**Claude 응답**:
- `highlighted-card::after`에서 트랜스폼 회전을 제거하고, `conic-gradient` + 마스크 처리를 활용해 파란색 선이 테두리에만 나타나도록 한 채 background-position을 애니메이션해 한 방향으로 순환하는 라인을 구현했습니다.
- 이제 gradient 라인이 시계 방향으로 테두리를 따라 돌면서 장시간 봐도 눈이 어지럽지 않은 강조 효과를 제공합니다.

**결정 사항**:
- [x] `highlighted-card::after` 애니메이션에서 rotate 제거하고 gradient border loop 적용
- [x] `npm run test` 재실행

**다음 단계**:
1. BE On/Off 애니메이션을 세부 색상으로 확장해 보기
2. Phase 2 카드에 실제 BE 예제를 연결해 직관성 강화
