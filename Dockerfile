FROM node:20-slim AS base

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g corepack@latest && corepack enable

FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN corepack install
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm prisma generate

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL="file:/app/data/openkeep.db"

RUN corepack install
RUN pnpm prisma generate
RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9847
ENV DATABASE_URL="file:/app/data/openkeep.db"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY mcp-announce.js mcp-announce-start.js ./

RUN mkdir -p /app/data && chmod 777 /app/data
RUN chmod -R a+rw /app/prisma

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod 755 /app/entrypoint.sh

EXPOSE 9847

ENTRYPOINT ["/app/entrypoint.sh"]
