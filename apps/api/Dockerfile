FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/

RUN npm install

COPY apps/api ./apps/api

RUN npm run build -w apps/api

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
