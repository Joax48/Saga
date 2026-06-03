FROM node:20-alpine AS base
WORKDIR /app

RUN npm install -g pnpm@11

COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web

RUN pnpm --filter web build

EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
