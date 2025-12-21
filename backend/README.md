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
- `SLACK_BOT_TOKEN`: Slack Bot User OAuth Token (xoxb-로 시작)
  - Slack API > Your App > OAuth & Permissions > Bot User OAuth Token
  - 권한: `chat:write` 필요
- `SLACK_CHANNEL`: 메시지를 보낼 채널 ID 또는 이름 (예: `#general` 또는 `C1234567890`)
- `PORT`: 서버 포트 (기본값: 3333)
- `FRONTEND_URL`: 프론트엔드 URL (CORS 설정용)
- `NODE_ENV`: 환경 모드 (development/production)

**Slack App 설정 방법:**
1. [Slack API](https://api.slack.com/apps)에서 새 앱 생성
2. OAuth & Permissions에서 `chat:write` 권한 추가
3. Install to Workspace로 앱 설치
4. Bot User OAuth Token 복사하여 환경 변수에 설정

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

## Slack Bot 설정

### 1. Bot을 채널에 초대하기

Slack Bot이 메시지를 보내려면 해당 채널의 멤버여야 합니다.

1. Slack 워크스페이스에서 대상 채널(`#문의사항`)로 이동
2. 채널 정보에서 "통합" 또는 "Integrations" 클릭
3. "앱 추가" 또는 "Add apps" 클릭
4. 생성한 Slack App을 검색하여 추가
5. 또는 채널에서 `/invite @봇이름` 명령어 사용

**중요**: Bot이 채널에 초대되지 않으면 `not_in_channel` 에러가 발생합니다.

## API 엔드포인트

### Contact

- `GET /api/v1/contact/health` - Health check
- `GET /api/v1/contact/config` - 환경 변수 확인 (디버깅용)
- `POST /api/v1/contact` - 문의 메시지를 Slack으로 전송

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

