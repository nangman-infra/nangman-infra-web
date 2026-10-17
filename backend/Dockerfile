ARG NODE_VERSION=24.22.0
ARG PNPM_VERSION=12.14.0

FROM node:${NODE_VERSION}-bookworm-slim AS package-manager
ARG PNPM_VERSION
WORKDIR /app
RUN npm install --global pnpm@${PNPM_VERSION} && npm cache clean --force

FROM package-manager AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN pnpm build

FROM builder AS test
COPY jest.config.js ./
RUN pnpm test:cov --runInBand

FROM scratch AS test-results
COPY --from=test /app/coverage /

FROM package-manager AS production-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM node:${NODE_VERSION}-bookworm-slim AS production
WORKDIR /app

# Debian Chromium is required for the existing profile PDF renderer.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      chromium \
      fonts-freefont-ttf \
      iputils-ping \
      nut-client && \
    groupadd --system --gid 10001 app && \
    useradd --system --uid 10001 --create-home --home-dir /home/app --gid app --shell /usr/sbin/nologin app && \
    install -d -o app -g app /home/app/.cache /home/app/.config /home/app/.local/share && \
    rm -rf /var/lib/apt/lists/*

COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

ENV NODE_ENV=production
ENV HOME=/home/app
USER app
EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3333/api/v1/contact/health',r=>{r.resume();process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

CMD ["node", "dist/main.js"]
