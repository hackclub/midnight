FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lark-ui/package.json ./lark-ui/
COPY owl-api/package.json ./owl-api/
COPY gateway/package.json ./gateway/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lark-ui/package.json ./lark-ui/
COPY owl-api/package.json ./owl-api/
COPY gateway/package.json ./gateway/
COPY lark-ui/ ./lark-ui/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter lark-ui run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5173
ENV HOST=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder --chown=sveltekit:nodejs /app/lark-ui ./lark-ui

WORKDIR /app/lark-ui

USER sveltekit

EXPOSE 5173

CMD ["node", "build"]

