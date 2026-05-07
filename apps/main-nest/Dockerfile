FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/main-nest/package.json ./apps/main-nest/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/api-types/package.json ./packages/api-types/
RUN pnpm install --frozen-lockfile --filter @fet/main...

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/main-nest/node_modules ./apps/main-nest/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY apps/main-nest ./apps/main-nest
COPY packages/tsconfig ./packages/tsconfig
COPY packages/api-types ./packages/api-types
RUN pnpm --filter @fet/main build
RUN pnpm --filter @fet/main deploy --prod /deploy

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /deploy/dist ./dist
COPY --from=build /deploy/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main"]
