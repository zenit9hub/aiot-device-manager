# AIoT Device Manager 학습 리포지토리

이 프로젝트는 **Phase 1(Serverless MVP)**에서 외부 서비스(Firebase, Amplify, MQTT)를 조합해 **백엔드 없이도 배포/운영 가능한 MVP1**을 완성하는 과정을 다룹니다.  
이후 **Phase 2(Backend 연동)**로 확장하여 실시간 데이터를 **SQL 기반 시계열 저장 및 분석**까지 연결하는 **실용적 성장 트랙(MVP1 → MVP2/3)**을 학습하도록 설계되어 있습니다.

## 프로젝트 구성
- `aiot-dvc-mgr-fe-2.0-refactoring/`  
  Phase 1 프론트엔드 레퍼런스. Vite + Tailwind + Firebase + MQTT로 빠른 실습이 가능하며, 배포 가능한 MVP 형태를 제공합니다.
- `docs/`  
  아키텍처/리팩토링/배포 가이드 문서 모음.

## 학습 포인트
- **MVP1 완성**: Auth/DB/Hosting을 상용 서비스로 대체해 빠르게 제품화 경험
- **확장 설계**: Phase 2에서 백엔드 연동 → SQL 저장 → 분석 파이프라인으로 확장하는 구조 이해
- **실전 중심**: 실제 배포/운영 수준의 구성으로 문서 기반 재현 가능

## 빠른 시작 (Phase 1)
```bash
cd aiot-dvc-mgr-fe-2.0-refactoring
npm install
cp .env.example .env
npm run dev
```

## 문서 안내
- `docs/(1.3) 📌 2.0 아키텍처 종합.md` : 전체 설계 개요
- `docs/📌 REFACTORING_WORKFLOW.md` : 리팩토링 흐름 및 체크리스트
- `docs/앰플리파이연동가이드.md` : Amplify 배포 가이드
