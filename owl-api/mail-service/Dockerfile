FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY owl-api/mail-service/package.json ./
RUN pnpm install --prod
COPY owl-api/mail-service/prisma ./prisma
RUN pnpm prisma generate

FROM base AS builder
WORKDIR /app
COPY owl-api/mail-service/package.json ./
RUN pnpm install
COPY owl-api/mail-service/prisma ./prisma
RUN pnpm prisma generate
COPY owl-api/mail-service/src ./src
COPY owl-api/mail-service/tsconfig*.json ./
COPY owl-api/mail-service/nest-cli.json ./
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY owl-api/mail-service/templates ./templates

EXPOSE 3003

CMD ["node", "dist/main"]

