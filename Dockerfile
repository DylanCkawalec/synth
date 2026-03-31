# Synth - AI Prediction Market Desk
# Production image: synth:v5
#
# Build:  docker build -t synth:v5 .
# Run:    docker run -p 8420:8420 --env-file .env synth:v5

FROM node:22-alpine AS builder

WORKDIR /build

RUN apk add --no-cache python3 make g++

COPY app/package*.json ./
RUN npm ci && npm rebuild better-sqlite3 --build-from-source

COPY app/ .
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache curl ca-certificates

COPY --from=builder /build/dist ./app/dist
COPY app/server ./app/server
COPY app/package*.json ./app/
COPY --from=builder /build/node_modules ./app/node_modules

RUN mkdir -p /app/data

EXPOSE 8420

ENV OPSEEQ_URL=http://host.docker.internal:9090

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8420/api/health || exit 1

LABEL org.opencontainers.image.title="Synth" \
      org.opencontainers.image.description="AI-assisted prediction market desk with Opseeq agent gateway" \
      org.opencontainers.image.version="5.0.0"

WORKDIR /app/app
CMD ["npm", "run", "server"]
