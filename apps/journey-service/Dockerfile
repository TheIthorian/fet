FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/journey-service/package.json ./apps/journey-service/
RUN pnpm install --frozen-lockfile --filter @fet/journey-service...

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/journey-service/node_modules ./apps/journey-service/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY apps/journey-service ./apps/journey-service
RUN pnpm --filter @fet/journey-service build
RUN pnpm --filter @fet/journey-service deploy --prod /deploy

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /deploy/dist ./dist
COPY --from=build /deploy/node_modules ./node_modules
EXPOSE 3010
CMD ["node", "dist/main"]
