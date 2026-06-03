FROM node:20-alpine AS base
WORKDIR /app

RUN npm install -g pnpm@11

COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api

RUN pnpm --filter api build

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
