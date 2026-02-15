# Nangman Infra Backend

국립한밭대학교 인프라 엔지니어링 팀, 낭만 인프라 백엔드 API 서버

## 기술 스택

- **Framework:** Nest.js 11.x
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Node.js:** 22.x

## 시작하기

### 설치

```bash
pnpm install
```

### 환경 변수 설정

환경별 example 파일을 참고하여 환경 변수 파일을 생성하세요.

**개발 환경:**
```bash
cp .env.development.example .env.development
```

**운영 환경:**
```bash
cp .env.production.example .env.production
```

**필수 환경 변수:**
- `MATTERMOST_WEBHOOK_URL`: Mattermost Incoming Webhook URL
- `PORT`: 서버 포트 (기본값: 3333)
- `FRONTEND_URL`: 프론트엔드 URL (CORS 설정용)
- `NODE_ENV`: 환경 모드 (development/production)

**Mattermost Webhook 설정 방법:**
1. Mattermost 채널에서 Incoming Webhook 생성
2. 발급된 Webhook URL을 `MATTERMOST_WEBHOOK_URL`에 설정

**환경 변수 로드 순서:**
1. `.env.development` 또는 `.env.production` (NODE_ENV에 따라)
2. `.env` (fallback)

### 개발 서버 실행

```bash
pnpm start:dev
```

### 프로덕션 빌드

```bash
pnpm build
pnpm start:prod
```

## Mattermost Webhook 설정

### 1. Incoming Webhook 생성하기

문의 메시지는 Incoming Webhook을 통해 지정 채널로 전송됩니다.

1. 대상 채널의 Integrations 메뉴에서 Incoming Webhook 생성
2. 생성된 URL을 백엔드 환경 변수에 설정
3. 서버 재시작 후 `POST /api/v1/contact`로 전송 확인

## API 엔드포인트

### Contact

- `GET /api/v1/contact/health` - Health check
- `GET /api/v1/contact/config` - 환경 변수 확인 (디버깅용)
- `POST /api/v1/contact` - 문의 메시지를 Mattermost로 전송

## 프로젝트 구조

```
src/
├── modules/          # 기능 모듈
│   └── contact/      # Contact 모듈
├── common/           # 공통 모듈
│   ├── filters/      # Exception Filters
│   └── interceptors/ # Interceptors
├── config/           # 설정 파일
└── main.ts          # 애플리케이션 진입점
```
