#!/bin/sh
set -e
node ./node_modules/.pnpm/prisma@*/node_modules/prisma/build/index.js migrate deploy
node mcp-announce-start.js &
exec node server.js
