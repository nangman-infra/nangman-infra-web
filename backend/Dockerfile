# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY nest-cli.json tsconfig.json ./
COPY src ./src

# Build application
RUN pnpm build

# Production stage
FROM node:22-bookworm-slim AS production

WORKDIR /app

# Install pnpm and system dependencies.
# Use Debian Chromium in production because Alpine Chromium crashes during
# headless PDF rendering inside Docker.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      chromium \
      fonts-freefont-ttf \
      iputils-ping \
      nut-client && \
    groupadd --system app && \
    useradd --system --gid app --home-dir /app --shell /usr/sbin/nologin app && \
    rm -rf /var/lib/apt/lists/* && \
    corepack enable && corepack prepare pnpm@10.24.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist

RUN chown -R app:app /app

# Expose port
EXPOSE 3333

USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/api/v1/contact/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main.js"]
