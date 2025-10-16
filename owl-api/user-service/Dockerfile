FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY owl-api/user-service/package.json ./
RUN pnpm install --prod

FROM base AS builder
WORKDIR /app
COPY owl-api/user-service/package.json ./
RUN pnpm install
COPY owl-api/user-service/src ./src
COPY owl-api/user-service/tsconfig*.json ./
COPY owl-api/user-service/nest-cli.json ./
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3002

CMD ["node", "dist/main"]

