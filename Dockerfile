# Synth - AI Prediction Market Desk
# Production Dockerfile for synth:latest

FROM node:22-alpine AS builder

WORKDIR /build

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy and install all dependencies (including devDependencies for build)
COPY app/package*.json ./
RUN npm ci && npm rebuild better-sqlite3 --build-from-source

# Copy source (excluding node_modules via .dockerignore)
COPY app/ .
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS runtime

WORKDIR /app

# Install curl for healthcheck and any runtime native deps
RUN apk add --no-cache curl ca-certificates

# Copy built frontend
COPY --from=builder /build/dist ./app/dist

# Copy server source files (excluding node_modules)
COPY app/server ./app/server
COPY app/package*.json ./app/

# Copy node_modules from builder (includes tsx and all deps)
# The better-sqlite3 binary in this directory is now built for Linux Alpine
COPY --from=builder /build/node_modules ./app/node_modules

# Create data directory
RUN mkdir -p /app/data

# Expose the server port
EXPOSE 8420

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8420/api/health || exit 1

# Labels
LABEL org.opencontainers.image.title="Synth" \
      org.opencontainers.image.description="AI-assisted prediction market desk" \
      org.opencontainers.image.version="1.0.0"

# Start the Node.js server
WORKDIR /app/app
CMD ["npm", "run", "server"]
