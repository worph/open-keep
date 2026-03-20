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

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs --create-home nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY mcp-announce.js mcp-announce-start.js ./

RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
RUN chown -R nextjs:nodejs /app/prisma

COPY <<'ENTRY' /app/entrypoint.sh
#!/bin/sh
set -e

# Default to nextjs user (1001) if PUID/PGID not set
PUID="${PUID:-1001}"
PGID="${PGID:-1001}"

# Adjust the nextjs user/group to match requested PUID/PGID
if [ "$(id -u nextjs)" != "$PUID" ] || [ "$(id -g nextjs)" != "$PGID" ]; then
  groupmod -o -g "$PGID" nodejs
  usermod -o -u "$PUID" -g "$PGID" nextjs
fi

chown nextjs:nodejs /app/data
chown -R nextjs:nodejs /app/prisma

exec gosu nextjs sh -c "node ./node_modules/.pnpm/prisma@5.22.0/node_modules/prisma/build/index.js migrate deploy && node mcp-announce-start.js & node server.js"
ENTRY
RUN chmod 755 /app/entrypoint.sh

EXPOSE 9847

ENTRYPOINT ["/app/entrypoint.sh"]
