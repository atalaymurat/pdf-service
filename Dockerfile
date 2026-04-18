# syntax=docker/dockerfile:1.7

# --- Stage 1: deps ---
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# --- Stage 2: runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN apk add --no-cache tini curl

COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs

ENV NODE_ENV=production
ENV PORT=3023

EXPOSE 3023

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:3023/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "app.js"]