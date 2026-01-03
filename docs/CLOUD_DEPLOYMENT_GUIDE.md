# 클라우드 배포 & Firebase 설정 가이드

AWS Amplify, Vercel, Netlify 등의 정적 호스팅 환경에 프론트엔드를 배포하고, Express 백엔드와 Firebase 인증을 함께 사용하는 경우 필요한 설정을 정리했습니다. 아래 항목을 순서대로 점검하면 CORS 오류나 인증 차단 없이 서비스를 운영할 수 있습니다.

## 1. Firebase 허용 도메인 등록
Firebase Console → Authentication → Settings → **Authorized domains**에 다음을 추가합니다.

- `localhost`, `localhost:5173` (로컬 개발)
- 기본 Amplify 도메인: `<app-id>.amplifyapp.com`
- 각 브랜치 프리뷰 도메인: `<branch>.<app-id>.amplifyapp.com`
- 커스텀 도메인을 사용한다면 해당 도메인도 추가

> 등록되지 않은 도메인에서는 Firebase Auth가 동작하지 않습니다. CORS 오류처럼 보이지만 사실은 인증 차단입니다.

## 2. Google OAuth Redirect 설정
1. Firebase Console → Authentication → Sign-in method → Google 제공업체 활성화  
2. 지원 이메일 지정  
3. Google Cloud Console → OAuth 2.0 클라이언트에 위에서 등록한 도메인들을 **Authorized redirect URI**로 추가  
4. 변경 후 몇 분 동안 전파 시간이 필요할 수 있음

## 3. Firebase 서비스 계정 비공개 키 준비
- Firebase Console → 프로젝트 설정 → **서비스 계정** 탭으로 이동  
- `새 비공개 키 생성`을 클릭해 JSON 파일 다운로드  
- `.env`의 `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`에 JSON 값을 그대로 복사 (`\n` 줄바꿈 이스케이프 유지)  
- 이 키는 백엔드에서 Firebase Admin SDK로 ID 토큰을 검증할 때 필요하므로 외부에 유출되지 않도록 주의

## 4. 프론트엔드 환경 변수(AWS Amplify 기준)
Amplify Console → App settings → Environment variables에 Firebase SDK 값을 등록합니다.

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# (선택) 백엔드와 연동 시
VITE_BACKEND_BASE_URL=https://<your-backend-domain>
VITE_TOKEN_CACHE_MINUTES=5
```

값은 Firebase Console → Project settings → General → SDK snippet에서 확인할 수 있습니다.

## 5. 백엔드 CORS & 환경 변수
`aiot-device-manager-be-working/.env`의 `ALLOWED_ORIGINS`는 **백엔드 Express 서버의 CORS 허용 목록**을 의미합니다. Firebase Authorized domains와는 별개이므로, 1단계에서 Firebase 콘솔에도 동일 도메인을 등록해야 합니다.

```
ALLOWED_ORIGINS=https://<app-id>.amplifyapp.com,https://<custom-domain>
```

- 여러 도메인은 쉼표로 구분합니다.
- 로컬 테스트가 필요하면 `http://localhost:5173`도 함께 유지하세요.
- Docker Compose로 띄운 MySQL 포트는 외부로 노출하지 않는 것이 안전합니다.

## 6. 배포 후 기능 점검 체크리스트
- [ ] 이메일/비밀번호 로그인 & 로그아웃
- [ ] Google OAuth 로그인
- [ ] Firestore 연동(디바이스 등록/수정/삭제)
- [ ] MQTT 메시지 수신 및 UI 갱신
- [ ] “BE 연동하기” 버튼으로 Health 체크 → `/api/sensors/data` 호출 확인
- [ ] 백엔드 로그 및 MySQL에서 센서 데이터 적재 확인

## 7. 자주 발생하는 이슈 & 해결법

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `The requested action is invalid` | Firebase Authorized domains 미등록 | 1번 항목 재확인 후 도메인 추가 |
| Google OAuth 팝업 후 실패 | Redirect URI 누락 | Google Cloud Console에 Amplify/커스텀 도메인 추가 |
| `fetch` CORS 오류 | 백엔드 `ALLOWED_ORIGINS` 미설정 | 4번 항목에 도메인 추가 후 서버 재시작 |
| 백엔드 401 Unauthorized | Firebase ID 토큰 만료 또는 프론트 토큰 미전달 | 프론트에서 최신 토큰 요청(`getIdToken`) 확인, 토큰 캐싱 시간 줄이기 |
| 500 Internal Server Error | DB 스키마 미적용 또는 MySQL 연결 실패 | `docker compose up -d` 이후 로그 확인, `.env` DB 정보 재확인 |

## 8. 보안 체크
- `.env` 파일은 Git에 올리지 말고, 배포 환경 변수로 관리합니다.
- Firebase Security Rules를 “테스트 모드”로 두지 말고, 최소한 인증 사용자만 읽기/쓰기가 가능하도록 제한합니다.
- 백엔드 로그에 민감한 정보가 남지 않도록 주기적으로 점검합니다.

---  
이 문서는 교육 과정에서 반복적으로 발생한 이슈를 기반으로 작성되었습니다. 새로운 배포 플랫폼을 사용할 경우에도 **허용 도메인**과 **CORS 허용 목록**을 먼저 업데이트하면 대부분의 인증·통신 오류를 예방할 수 있습니다.
