# Nangman Infra

> 보이지 않지만, 모든 것의 기반이 됩니다

**낭만 인프라**의 공식 홈페이지 및 포트폴리오 허브입니다.

## 프로젝트 소개

낭만 인프라는 인프라 분야로 취업을 희망하는 학생들의 활동 기록과 포트폴리오를 관리하는 웹사이트입니다. 보이지 않는 곳에서 세상의 연결을 지탱하는 엔지니어들의 이야기를 담고 있습니다.

### 컨셉

**"Invisible Architects (보이지 않는 건축가들)"**

인프라의 견고함과 학생들의 낭만을 결합하여, 차가운 서버실에서 가장 뜨거운 열정을 찾는 팀의 정체성을 표현합니다.

## 주요 기능

- **멤버 포트폴리오**: 팀원들의 프로필, 경력, 기술 스택을 한눈에 확인
- **프로젝트 소개**: 실제 운영 중인 서비스와 아키텍처 설계 사례
- **기술 블로그**: 문제 해결 과정과 기술적 인사이트 공유
- **학습 커리큘럼**: 리눅스, 네트워크, 클라우드부터 실무까지의 학습 경로
- **실시간 모니터링**: 시스템 상태를 실시간으로 확인하는 대시보드

## 기술 스택

- **Framework**: Next.js 15.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animation**: Framer Motion
- **Package Manager**: pnpm

## 구조

```
nangman-infra/
├── frontend/                    # Next.js 웹 애플리케이션
│   ├── app/                     # 페이지 + BFF API 라우트(app/api/*)
│   ├── components/              # UI 컴포넌트
│   ├── lib/                     # 프론트 레이어드 아키텍처
│   │   ├── domain/              # 도메인 타입/모델
│   │   ├── application/         # 유스케이스/계약
│   │   └── infrastructure/      # HTTP 클라이언트/외부 연동
│   ├── data/                    # 초기 정적 데이터(마이그레이션 원본/폴백)
│   └── public/                  # 정적 자산
├── backend/                     # NestJS API 서버
│   ├── src/
│   │   ├── modules/             # 도메인 모듈
│   │   │   ├── blog/
│   │   │   ├── contact/
│   │   │   ├── members/
│   │   │   └── monitoring/
│   │   ├── common/              # 공통 예외/필터/유틸
│   │   └── config/              # 환경설정
│   ├── scripts/                 # 운영 스크립트(예: members CMS 마이그레이션)
│   └── test/                    # 테스트
├── cms/                         # Directus/Postgres 영구 데이터(바인드 마운트)
│   ├── directus/uploads
│   └── postgres/data
├── docker-compose.yml           # frontend/backend/directus/postgres/watchtower
├── Jenkinsfile                  # CI/CD 파이프라인
└── INFO/                        # 프로젝트 문서
```

## CMS (Directus) 운영 가이드

현재 멤버 프로필은 Directus(CMS)에서 관리합니다.

- **CMS 서버**: `directus` 컨테이너 (`http://localhost:8055`)
- **DB**: `directus-db` (PostgreSQL)
- **데이터 저장 방식**: 프로젝트 폴더 바인드 마운트
  - `./cms/directus/uploads:/directus/uploads`
  - `./cms/postgres/data:/var/lib/postgresql/data`

### 1) 실행

```bash
docker compose up -d directus-db directus
```

### 2) 환경 변수

멤버 API/CMS 연동에 필요한 주요 변수:

- `DIRECTUS_URL`
- `DIRECTUS_TOKEN` (또는 `DIRECTUS_EMAIL` + `DIRECTUS_PASSWORD`)

개발 환경은 `backend/.env.development`, 운영 환경은 `backend/.env.production`을 사용합니다.

### 3) 초기 마이그레이션

기존 프론트 정적 데이터(`frontend/data/members.ts`)를 CMS로 이관합니다.

```bash
cd backend
pnpm migrate:members
```

스크립트: `backend/scripts/migrate-members-to-directus.ts`

### 4) 운영 원칙

- 초기 이관 후에는 **Directus UI에서 멤버 데이터를 수정/관리**합니다.
- 마이그레이션 스크립트는 삭제하지 않고, **재이관/복구용**으로 유지합니다.
- `cms/` 디렉터리는 로컬 영구 데이터이므로 Git에 포함하지 않습니다.

## 팀 소개

현업 엔지니어와 학습자가 함께 성장하며, 실무 중심의 인프라 경험을 축적하는 팀입니다.

## 라이선스

이 프로젝트는 낭만 인프라 팀의 소유입니다.

---

**We Build the Invisible.**
